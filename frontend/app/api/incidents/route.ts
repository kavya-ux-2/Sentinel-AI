import { NextResponse } from 'next/server';
import { getShipments, saveIncident, getIncidents } from '@/lib/db';

export async function GET() {
  const incidents = await getIncidents();
  return NextResponse.json(incidents);
}

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const shipments = await getShipments();
    const now = new Date();
    
    const incidentId = `INC-${Math.floor(now.getTime() / 1000) % 100000}`;
    const affectedShipmentIds: string[] = [];
    const locationLower = payload.location.toLowerCase();
    
    const updatedShipments = shipments.map((sh) => {
      const dest = sh.destination.toLowerCase();
      const orig = sh.origin.toLowerCase();
      const curr = sh.current_location.toLowerCase();
      
      if (
        dest.includes(locationLower) || 
        orig.includes(locationLower) || 
        curr.includes(locationLower) ||
        (locationLower.includes('rotterdam') && dest.includes('rotterdam'))
      ) {
        affectedShipmentIds.push(sh._id);
        return {
          ...sh,
          status: "Disrupted",
          risk_score: 80
        };
      }
      return sh;
    });
    
    const severity = payload.severity || 'High';
    const impactScore = severity === 'Critical' ? 85 : (severity === 'High' ? 50 : 25);
    
    const newIncident = {
      _id: incidentId,
      title: payload.title,
      type: payload.type,
      severity,
      status: "Active",
      impact_score: impactScore,
      description: payload.description,
      location: payload.location,
      affected_shipment_ids: affectedShipmentIds,
      date_detected: now.toISOString()
    };
    
    const auditLogs = [{
      _id: `AUD-${Math.floor(now.getTime() / 1000) % 100000}`,
      timestamp: now.toISOString(),
      user: "Incident Agent",
      action: "Incident Detection",
      description: `Incident ${incidentId} detected. Affected shipments: ${affectedShipmentIds.join(', ') || 'None'}.`,
      affected_entity_id: incidentId
    }];
    
    const recoveryPlans: any[] = [];
    
    affectedShipmentIds.forEach((shId) => {
      const planId = `REC-${Math.floor(now.getTime() / 1000) % 100000 + Math.floor(Math.random() * 100)}`;
      
      const customerEmail = `Subject: Urgent: Sentinel AI Shipment Update - Rerouting Notification for ${shId}\n\nDear Valued Partner,\n\nPlease be advised that due to the ongoing ${payload.title} (Incident ${incidentId}), we have proactively initiated a recovery strategy for your shipment ${shId}.\n\nTo minimize delayed delivery, we are rerouting the container via Trieste, Italy. The freight will be transferred immediately via express rail to Munich.\n\nBest regards,\nSentinel AI Logistics Team`;
      
      const supplierEmail = `Subject: Supplier Request: Alternative Clearance Coordination - Shipment ${shId}\n\nDear Support Team,\n\nIn response to the current ${payload.title}, we are rerouting shipment ${shId} via Trieste, Italy. Please provide updated export documents.\n\nThank you,\nSentinel AI Procurement Team`;
      
      const newPlan = {
        _id: planId,
        shipment_id: shId,
        incident_id: incidentId,
        original_route: "Shenzhen -> Suez Canal -> Rotterdam -> Munich",
        proposed_route: "Shenzhen -> Suez Canal -> Trieste Port (Italy) -> Rail to Munich (Germany)",
        cost_diff: 4800,
        time_diff_hours: -48,
        emission_diff: -0.6,
        status: "Draft",
        steps: [
          { step_number: 1, title: "Reroute Ship to Trieste", description: "Instruct vessel carrier (Maersk) to dump Munich-bound container in Trieste, Italy, instead of waiting for Rotterdam strike resolution.", assigned_to: "Carrier Operations (Maersk)", status: "Pending" },
          { step_number: 2, title: "Book Rail Freight", description: "Secure space on the Trieste-Munich express rail corridor.", assigned_to: "Procurement Agent", status: "Pending" },
          { step_number: 3, title: "Prepare Customs Documentation", description: "Liaise with Italian customs representatives to handle rapid transit clearance.", assigned_to: "Customs Clerk", status: "Pending" },
          { step_number: 4, title: "Pre-Alert Munich Warehouse", description: "Notify Munich assembly plant of modified delivery date.", assigned_to: "Site Logistics Manager", status: "Pending" }
        ],
        customer_email_draft: customerEmail,
        supplier_email_draft: supplierEmail,
        created_at: now.toISOString()
      };
      
      recoveryPlans.push(newPlan);
      
      auditLogs.push({
        _id: `AUD-${Math.floor(now.getTime() / 1000) % 100000 + 1}`,
        timestamp: now.toISOString(),
        user: "Recovery Agent",
        action: "Recovery Generation",
        description: `Generated Recovery Plan ${planId} for shipment ${shId} resolving ${incidentId}.`,
        recovery_plan_id: planId,
        affected_entity_id: planId
      });
    });
    
    const affectedShipmentObjs = updatedShipments.filter(s => affectedShipmentIds.includes(s._id));
    
    await saveIncident(newIncident, affectedShipmentObjs, auditLogs, recoveryPlans);
    
    return NextResponse.json({
      message: `Incident ${incidentId} registered successfully.`,
      incident: newIncident,
      affected_count: affectedShipmentIds.length
    }, { status: 201 });
    
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
