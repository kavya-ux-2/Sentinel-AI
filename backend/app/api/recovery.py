from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import List
from datetime import datetime, timedelta
from app.database import get_db
from app.models.schemas import RecoveryPlan
from app.agents.coordinator import SentinelMultiAgentCoordinator

router = APIRouter(prefix="/recovery-plans", tags=["Recovery Plans"])
coordinator = SentinelMultiAgentCoordinator()

class ApprovePayload(BaseModel):
    manager_name: str

@router.get("/", response_model=List[RecoveryPlan])
async def get_plans(db = Depends(get_db)):
    cursor = db.recovery_plans.find({})
    plans = []
    async for doc in cursor:
        plans.append(RecoveryPlan(**doc))
    return plans

@router.get("/{plan_id}", response_model=RecoveryPlan)
async def get_plan(plan_id: str, db = Depends(get_db)):
    doc = await db.recovery_plans.find_one({"_id": plan_id})
    if not doc:
        raise HTTPException(status_code=404, detail="Recovery Plan not found")
    return RecoveryPlan(**doc)

@router.post("/{plan_id}/approve", response_model=RecoveryPlan)
async def approve_plan(plan_id: str, payload: ApprovePayload, db = Depends(get_db)):
    plan = await db.recovery_plans.find_one({"_id": plan_id})
    if not plan:
        raise HTTPException(status_code=404, detail="Recovery Plan not found")
        
    # Run Approval Agent
    approval_res = await coordinator.run_approval_orchestration(plan_id, payload.manager_name)
    
    # Update Plan in DB
    await db.recovery_plans.update_one(
        {"_id": plan_id},
        {"$set": {
            "status": "Approved",
            "approved_by": approval_res["approved_by"],
            "approved_at": approval_res["approved_at"]
        }}
    )
    
    # Audit log
    await db.audit_logs.insert_one({
        "timestamp": datetime.utcnow(),
        "user": payload.manager_name,
        "action": "Recovery Approval",
        "description": f"Approved Recovery Plan {plan_id} (Reroute: {plan.get('proposed_route')}).",
        "recovery_plan_id": plan_id,
        "affected_entity_id": plan_id
    })
    
    updated_doc = await db.recovery_plans.find_one({"_id": plan_id})
    return RecoveryPlan(**updated_doc)

@router.post("/{plan_id}/execute", response_model=RecoveryPlan)
async def execute_plan(plan_id: str, db = Depends(get_db)):
    plan = await db.recovery_plans.find_one({"_id": plan_id})
    if not plan:
        raise HTTPException(status_code=404, detail="Recovery Plan not found")
        
    if plan.get("status") != "Approved":
        raise HTTPException(status_code=400, detail="Plan must be Approved by a manager before execution.")
        
    # Update Shipment in DB to reflect the new route, reduced risk score, and updated ETA
    shipment_id = plan["shipment_id"]
    shipment = await db.shipments.find_one({"_id": shipment_id})
    
    if shipment:
        # Reduce risk score, update current_location to new path, status to Delayed/Recovering
        new_eta = shipment["eta"] + timedelta(hours=plan["time_diff_hours"]) if "time_diff_hours" in plan else shipment["eta"]
        
        # Mark all shipment timeline checkpoints as Completed up to new diversion
        timeline = shipment.get("timeline", [])
        for step in timeline:
            if step["checkpoint"] == "Final Destination":
                step["status"] = "Pending"
            elif "Arrival" in step["checkpoint"]:
                step["checkpoint"] = f"Rerouted to {plan['proposed_route'].split('->')[2].strip()}"
                step["status"] = "Completed"
                step["timestamp"] = datetime.utcnow()
                
        await db.shipments.update_one(
            {"_id": shipment_id},
            {"$set": {
                "status": "On Time",  # Recovered successfully
                "risk_score": 15.0,   # Risk mitigated
                "current_location": plan["proposed_route"].split("->")[2].strip(), # Set to new transit hub
                "timeline": timeline
            }}
        )
        
    # Update Plan to Executed, steps to Completed
    steps = plan.get("steps", [])
    for step in steps:
        step["status"] = "Completed"
        
    await db.recovery_plans.update_one(
        {"_id": plan_id},
        {"$set": {
            "status": "Executed",
            "steps": steps
        }}
    )
    
    # Run Learning Agent
    await coordinator.run_learning_loop(plan_id, success=True)
    
    # Audit log
    await db.audit_logs.insert_one({
        "timestamp": datetime.utcnow(),
        "user": "System Executor Agent",
        "action": "Recovery Execution",
        "description": f"Executed recovery actions for Plan {plan_id}. Shipment {shipment_id} status updated to On Time.",
        "recovery_plan_id": plan_id,
        "affected_entity_id": plan_id
    })
    
    updated_doc = await db.recovery_plans.find_one({"_id": plan_id})
    return RecoveryPlan(**updated_doc)
