from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, timedelta
from app.database import get_db
from app.models.schemas import Incident, RecoveryPlan, RecoveryStep
from app.agents.coordinator import SentinelMultiAgentCoordinator

router = APIRouter(prefix="/incidents", tags=["Incidents"])
coordinator = SentinelMultiAgentCoordinator()

class IncidentCreate(BaseModel):
    title: str
    type: str
    severity: str
    description: str
    location: str

@router.get("/", response_model=List[Incident])
async def get_incidents(db = Depends(get_db)):
    cursor = db.incidents.find({})
    incidents = []
    async for doc in cursor:
        incidents.append(Incident(**doc))
    return incidents

@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_incident(payload: IncidentCreate, db = Depends(get_db)):
    incident_id = f"INC-{int(datetime.utcnow().timestamp()) % 100000}"
    
    # 1. Fetch all shipments to scan
    cursor = db.shipments.find({})
    all_shipments = []
    async for doc in cursor:
        all_shipments.append(doc)
        
    # 2. Run Incident Agent: Detect affected shipments
    detection_res = await coordinator.run_incident_detection(
        payload.title, payload.location, payload.description, all_shipments
    )
    affected_ids = detection_res["affected_shipment_ids"]
    
    new_incident = {
        "_id": incident_id,
        "title": payload.title,
        "type": payload.type,
        "severity": payload.severity,
        "status": "Active",
        "impact_score": 75.0 if payload.severity == "Critical" else (50.0 if payload.severity == "High" else 25.0),
        "description": payload.description,
        "location": payload.location,
        "affected_shipment_ids": affected_ids,
        "date_detected": datetime.utcnow()
    }
    
    # Save incident
    await db.incidents.insert_one(new_incident)
    
    # Log incident detection audit log
    await db.audit_logs.insert_one({
        "timestamp": datetime.utcnow(),
        "user": "Incident Agent",
        "action": "Incident Detection",
        "description": f"Incident {incident_id} detected. Affected shipments: {', '.join(affected_ids) or 'None'}.",
        "affected_entity_id": incident_id
    })
    
    # 3. For each affected shipment, orchestrate recovery workflow
    for sh_id in affected_ids:
        shipment = await db.shipments.find_one({"_id": sh_id})
        if not shipment:
            continue
            
        # Update shipment status to Disrupted
        await db.shipments.update_one({"_id": sh_id}, {"$set": {"status": "Disrupted", "risk_score": 80.0}})
        
        # Run Impact Agent: Estimate delay
        impact_res = await coordinator.run_impact_analysis(new_incident, shipment)
        
        # Run Finance Agent: Financial loss
        finance_res = await coordinator.run_finance_analysis(shipment, impact_res["delay_days"])
        
        # Run Procurement Agent: Inventory buffer & suppliers
        procurement_res = await coordinator.run_procurement_analysis(shipment)
        
        # Run Recovery Agent: Alternative route recommendation
        recovery_res = await coordinator.run_recovery_routing(shipment, new_incident)
        
        # Run Communication Agent: Generate emails
        comm_res = await coordinator.run_communication_drafts(shipment, new_incident, recovery_res)
        
        # Generate Recovery Plan Document
        plan_id = f"REC-{int(datetime.utcnow().timestamp()) % 100000}"
        
        # Map recovery steps
        steps = [
            RecoveryStep(step_number=1, title="Initiate Rerouting", description=f"Execute alternate path: {recovery_res['proposed_route']}", assigned_to="Recovery Agent", status="Pending"),
            RecoveryStep(step_number=2, title="Procurement Inventory Check", description=f"Audit alternate suppliers: {', '.join(procurement_res['alternate_suppliers'])}", assigned_to="Procurement Agent", status="Pending"),
            RecoveryStep(step_number=3, title="Customer Notification Dispatch", description="Send generated communication warning of logistics path updates.", assigned_to="Communication Agent", status="Pending"),
            RecoveryStep(step_number=4, title="Workflow Verification", description="Monitor shipment ETA and verify port clearance.", assigned_to="System Coordinator", status="Pending")
        ]
        
        new_plan = {
            "_id": plan_id,
            "shipment_id": sh_id,
            "incident_id": incident_id,
            "original_route": f"{shipment['origin']} -> {shipment['destination']}",
            "proposed_route": recovery_res["proposed_route"],
            "cost_diff": recovery_res["cost_diff"],
            "time_diff_hours": -float(impact_res["delay_days"] * 24) + recovery_res["time_saved_hours"], # Net time savings compared to doing nothing
            "emission_diff": recovery_res["emission_diff"],
            "status": "Draft",
            "steps": [s.model_dump() for s in steps],
            "customer_email_draft": comm_res["customer_email"],
            "supplier_email_draft": comm_res["supplier_email"],
            "created_at": datetime.utcnow()
        }
        
        await db.recovery_plans.insert_one(new_plan)
        
        # Audit plan generation
        await db.audit_logs.insert_one({
            "timestamp": datetime.utcnow(),
            "user": "Recovery Agent",
            "action": "Recovery Generation",
            "description": f"Generated Recovery Plan {plan_id} for shipment {sh_id} resolving {incident_id}.",
            "recovery_plan_id": plan_id,
            "affected_entity_id": plan_id
        })
        
    return {
        "message": f"Incident {incident_id} registered successfully.",
        "incident": Incident(**new_incident),
        "affected_count": len(affected_ids)
    }
