import { NextResponse } from 'next/server';
import { executePlanDB, getPlans, getShipments } from '@/lib/db';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const now = new Date();
    const planId = params.id;
    
    const plans = await getPlans();
    const plan = plans.find(p => p._id === planId);
    if (!plan) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }
    
    const planSteps = plan.steps.map(step => ({
      ...step,
      status: "Completed"
    }));
    
    const shipments = await getShipments();
    const sh = shipments.find(s => s._id === plan.shipment_id);
    
    let shipmentUpdates: any = {};
    if (sh) {
      const updatedTimeline = sh.timeline.map((item) => {
        if (item.checkpoint === "Final Destination") {
          return { ...item, status: "Pending" };
        } else if (item.checkpoint.includes("Arrival") || item.checkpoint.includes("Rotterdam") || item.checkpoint.includes("Hamburg")) {
          return {
            ...item,
            checkpoint: `Rerouted to ${plan.proposed_route.split("->")[2]?.trim() || "Trieste Port"}`,
            status: "Completed",
            timestamp: now.toISOString()
          };
        }
        return item;
      });
      
      shipmentUpdates = {
        status: "On Time",
        risk_score: 15,
        current_location: plan.proposed_route.split("->")[2]?.trim() || "Trieste Port",
        timeline: updatedTimeline
      };
    }
    
    const logs = [{
      _id: `AUD-${Math.floor(now.getTime() / 1000) % 100000}`,
      timestamp: now.toISOString(),
      user: "System Executor Agent",
      action: "Recovery Execution",
      description: `Executed recovery actions for Plan ${planId}. Shipment ${plan.shipment_id} status updated to On Time.`,
      recovery_plan_id: planId,
      affected_entity_id: planId
    }];
    
    await executePlanDB(planId, plan.shipment_id, shipmentUpdates, planSteps, logs);
    return NextResponse.json({
      ...plan,
      status: "Executed",
      steps: planSteps
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
