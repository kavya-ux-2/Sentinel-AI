from fastapi import APIRouter, Depends
from typing import List
from app.database import get_db
from app.models.schemas import Partner

router = APIRouter(prefix="/partners", tags=["Partners"])

@router.get("/", response_model=List[Partner])
async def get_partners(db = Depends(get_db)):
    cursor = db.partners.find({})
    partners = []
    async for doc in cursor:
        partners.append(Partner(**doc))
    return partners
