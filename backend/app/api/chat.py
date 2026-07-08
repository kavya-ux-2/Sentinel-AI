from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any
from datetime import datetime
from app.database import get_db
from app.agents.coordinator import SentinelMultiAgentCoordinator

router = APIRouter(prefix="/chat", tags=["AI Chat"])
coordinator = SentinelMultiAgentCoordinator()

class ChatRequest(BaseModel):
    conversation_id: str
    query: str

class ChatResponse(BaseModel):
    answer: str
    timestamp: datetime

class MessageItem(BaseModel):
    sender: str
    message: str
    timestamp: datetime

@router.get("/history/{conversation_id}", response_model=List[MessageItem])
async def get_chat_history(conversation_id: str, db = Depends(get_db)):
    cursor = db.chat_messages.find({"conversation_id": conversation_id}).sort("timestamp", 1)
    history = []
    async for doc in cursor:
        history.append(MessageItem(
            sender=doc["sender"],
            message=doc["message"],
            timestamp=doc["timestamp"]
        ))
    return history

@router.post("/", response_model=ChatResponse)
async def post_chat_message(payload: ChatRequest, db = Depends(get_db)):
    conversation_id = payload.conversation_id
    query = payload.query
    
    # 1. Fetch current database state to build chatbot context
    shipments_cursor = db.shipments.find({})
    shipments = []
    async for s in shipments_cursor:
        # Convert _id to string for JSON serialization
        s["_id"] = str(s["_id"])
        shipments.append(s)
        
    incidents_cursor = db.incidents.find({})
    incidents = []
    async for i in incidents_cursor:
        i["_id"] = str(i["_id"])
        incidents.append(i)
        
    plans_cursor = db.recovery_plans.find({})
    plans = []
    async for p in plans_cursor:
        p["_id"] = str(p["_id"])
        plans.append(p)
        
    context = {
        "shipments": shipments,
        "incidents": incidents,
        "recovery_plans": plans
    }
    
    # 2. Save User Message to History
    await db.chat_messages.insert_one({
        "conversation_id": conversation_id,
        "sender": "user",
        "message": query,
        "timestamp": datetime.utcnow()
    })
    
    # 3. Ask Chat Assistant
    answer = await coordinator.run_chat_assistant(query, context)
    
    # 4. Save AI Response to History
    await db.chat_messages.insert_one({
        "conversation_id": conversation_id,
        "sender": "ai",
        "message": answer,
        "timestamp": datetime.utcnow()
    })
    
    return ChatResponse(
        answer=answer,
        timestamp=datetime.utcnow()
    )
