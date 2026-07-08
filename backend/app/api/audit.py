from fastapi import APIRouter, Depends
from typing import List
from app.database import get_db
from app.models.schemas import AuditLog

router = APIRouter(prefix="/audit-logs", tags=["Audit Logs"])

@router.get("/", response_model=List[AuditLog])
async def get_audit_logs(db = Depends(get_db)):
    # Sort audit logs by timestamp descending
    cursor = db.audit_logs.find({}).sort("timestamp", -1)
    logs = []
    async for doc in cursor:
        logs.append(AuditLog(**doc))
    return logs
