from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, Any

router = APIRouter(prefix="/simulate", tags=["Simulation"])

class SimulationRequest(BaseModel):
    query: str

class SimulationResponse(BaseModel):
    arrival_time: str
    freight_cost: str
    carbon_emission: str
    inventory_impact: str
    risk_score: str
    recommended_action: str

@router.post("/", response_model=SimulationResponse)
async def run_simulation(payload: SimulationRequest):
    query = payload.query.lower()
    
    # Analyze the natural language simulation query
    if "singapore" in query:
        return SimulationResponse(
            arrival_time="July 15, 2026 (ETA +1 day, recovering 4 days delay)",
            freight_cost="+$3,500 USD (Moderate freight surcharge)",
            carbon_emission="-0.4 tons CO2 (optimized vessel route)",
            inventory_impact="Safety stock buffer stabilized at 82% capacity",
            risk_score="15% (Low risk of secondary custom congestion)",
            recommended_action="Highly Recommended if Munich production can absorb a 24-hour delay. Standard ocean transfer is available."
        )
    elif "air" in query or "flight" in query:
        return SimulationResponse(
            arrival_time="July 11, 2026 (ETA -3 days, rapid recovery)",
            freight_cost="+$28,400 USD (High air freight premium)",
            carbon_emission="+22.8 tons CO2 (Significant environmental footprint)",
            inventory_impact="Safety stock buffer restored instantly to 100%",
            risk_score="5% (Negligible risk of customs/transit hold-up)",
            recommended_action="Conditionally Recommended ONLY if production penalties exceed $25,000/day. High emission index."
        )
    elif "suez" in query or "rail" in query:
        return SimulationResponse(
            arrival_time="July 13, 2026 (ETA -1 day, 48 hours recovery)",
            freight_cost="+$4,800 USD (Rail freight surcharge)",
            carbon_emission="-0.6 tons CO2 (Optimized rail transit efficiency)",
            inventory_impact="Safety stock buffer stabilized at 90%",
            risk_score="12% (Low risk, customs transit clearance pre-alerted)",
            recommended_action="Recommended. This matches our generated Recovery Plan REC-301, offering the optimal balance of speed and cost."
        )
    else:
        # Default fallback simulation response
        return SimulationResponse(
            arrival_time="July 18, 2026 (No recovery, full 7 days delay)",
            freight_cost="+$0 USD (No surcharge)",
            carbon_emission="+0.0 tons CO2 (no change)",
            inventory_impact="Critical line stoppage at assembly plant (0% buffer)",
            risk_score="95% (Extreme SLA breach penalty risk)",
            recommended_action="Not Recommended. Doing nothing leads to critical production shutdown and high customer penalties."
        )
