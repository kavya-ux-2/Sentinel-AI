import { NextResponse } from 'next/server';
import { updatePlan, getPlans } from '@/lib/db';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const payload = await request.json();
    const now = new Date();
    const planId = params.id;
    
    const plans = await getPlans();
    const plan = plans.find(p => p._id === planId);
    if (!plan) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }
    
    const updates = {
      status: "Approved",
      approved_by: payload.manager_name,
      approved_at: now.toISOString()
    };
    
    const logs = [{
      _id: `AUD-${Math.floor(now.getTime() / 1000) % 100000}`,
      timestamp: now.toISOString(),
      user: payload.manager_name,
      action: "Recovery Approval",
      description: `Approved Recovery Plan ${planId} (Reroute: ${plan.proposed_route}).`,
      recovery_plan_id: planId,
      affected_entity_id: planId
    }];
    
    await updatePlan(planId, updates, logs);
    return NextResponse.json({ ...plan, ...updates });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
