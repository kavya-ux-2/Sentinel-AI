from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

class TimelineEvent(BaseModel):
    checkpoint: str
    location: str
    timestamp: datetime
    status: str  # Completed, Pending, Delayed

class Shipment(BaseModel):
    id: str = Field(alias="_id")
    origin: str
    destination: str
    current_location: str
    carrier: str
    status: str  # On Time, Delayed, Disrupted
    cargo_value: float
    sku_details: str
    eta: datetime
    original_eta: datetime
    cost: float
    carbon_emissions: float
    timeline: List[TimelineEvent] = []
    risk_score: float = 0.0

    class Config:
        populate_by_name = True
        json_encoders = {datetime: lambda v: v.isoformat()}

class Incident(BaseModel):
    id: str = Field(alias="_id")
    title: str
    type: str  # Weather, Port Congestion, Strike, Customs, Geopolitical
    severity: str  # Low, Medium, High, Critical
    status: str  # Active, Resolved
    impact_score: float  # 0 to 100
    description: str
    location: str
    affected_shipment_ids: List[str] = []
    date_detected: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        json_encoders = {datetime: lambda v: v.isoformat()}

class RecoveryStep(BaseModel):
    step_number: int
    title: str
    description: str
    assigned_to: str
    status: str  # Pending, Approved, Completed, In Progress

class RecoveryPlan(BaseModel):
    id: str = Field(alias="_id")
    shipment_id: str
    incident_id: str
    original_route: str
    proposed_route: str
    cost_diff: float
    time_diff_hours: float
    emission_diff: float
    status: str  # Draft, Approved, Executed, Rejected
    steps: List[RecoveryStep] = []
    customer_email_draft: Optional[str] = None
    supplier_email_draft: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    approved_by: Optional[str] = None
    approved_at: Optional[datetime] = None

    class Config:
        populate_by_name = True
        json_encoders = {datetime: lambda v: v.isoformat()}

class Partner(BaseModel):
    id: str = Field(alias="_id")
    name: str
    type: str  # supplier, carrier
    contact_email: str
    contact_phone: str
    sla_score: float
    risk_score: float
    category: Optional[str] = None
    location: str

    class Config:
        populate_by_name = True

class AuditLog(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    user: str
    action: str
    description: str
    affected_entity_id: Optional[str] = None
    recovery_plan_id: Optional[str] = None

    class Config:
        populate_by_name = True
        json_encoders = {datetime: lambda v: v.isoformat()}

class ChatMessage(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    conversation_id: str
    sender: str  # user, ai
    message: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        json_encoders = {datetime: lambda v: v.isoformat()}
