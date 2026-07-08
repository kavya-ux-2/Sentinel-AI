from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from app.database import get_db
from app.models.schemas import Shipment

router = APIRouter(prefix="/shipments", tags=["Shipments"])

@router.get("/", response_model=List[Shipment])
async def get_shipments(db = Depends(get_db)):
    cursor = db.shipments.find({})
    shipments = []
    async for doc in cursor:
        # Pydantic alias handling for _id
        shipments.append(Shipment(**doc))
    return shipments

@router.get("/{shipment_id}", response_model=Shipment)
async def get_shipment(shipment_id: str, db = Depends(get_db)):
    doc = await db.shipments.find_one({"_id": shipment_id})
    if not doc:
        raise HTTPException(status_code=404, detail="Shipment not found")
    return Shipment(**doc)
