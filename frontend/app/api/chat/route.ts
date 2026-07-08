import { NextResponse } from 'next/server';
import { getShipments, getIncidents, getPlans, insertChatMessage } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const now = new Date();
    const query = payload.query;
    const conversationId = payload.conversation_id;
    
    // Save User message
    const userMsg = {
      conversation_id: conversationId,
      sender: "user",
      message: query,
      timestamp: now.toISOString()
    };
    await insertChatMessage(userMsg);
    
    const shipments = await getShipments();
    const incidents = await getIncidents();
    const plans = await getPlans();
    
    // Heuristics chat responses
    let answer = "I am Sentinel AI assistant. I can help monitor your supply chain. Ask me about critical shipments, customer risks, or rerouting savings.";
    const queryLower = query.toLowerCase();
    
    if (queryLower.includes("critical") || queryLower.includes("today")) {
      const disrupted = shipments.filter(s => s.status === 'Disrupted').map(s => s._id);
      answer = `Sentinel AI Scan: Today there are ${disrupted.length} critical shipments flagged with 'Disrupted' status: ${disrupted.join(', ') || 'None'}. Active disruption is primarily INC-201 (Rotterdam Port Strike).`;
    } else if (queryLower.includes("risk") || queryLower.includes("customer")) {
      const sorted = [...shipments].sort((a, b) => b.risk_score - a.risk_score);
      if (sorted.length > 0) {
        answer = `Customer waiting for shipment ${sorted[0]._id} (${sorted[0].sku_details}) destined for ${sorted[0].destination} is currently at the highest risk, with a shipment Risk Score of ${sorted[0].risk_score}%.`;
      } else {
        answer = "No high-risk customer records resolved.";
      }
    } else if (queryLower.includes("summarize") || queryLower.includes("incident")) {
      answer = "Summary of active disruptions:\n";
      incidents.forEach((inc) => {
        answer += `- **${inc._id} (${inc.title})**: Severity ${inc.severity}, Location: ${inc.location}, Status: ${inc.status}.\n`;
      });
    } else if (queryLower.includes("save") || queryLower.includes("reroute") || queryLower.includes("money")) {
      answer = "By rerouting SH-101 via Trieste Port and Rail, we avoid a 7-day delay. While the redirection costs +$4,800 in extra freight fee, we save approximately $9,000 in daily storage/holding costs and prevent a $9,000 (2% of cargo value) SLA penalty. Net savings: **$13,200**.";
    } else if (queryLower.includes("email") || queryLower.includes("draft")) {
      answer = "Draft Email for Delayed Shipment SH-101:\n\nSubject: Logistics Notification: Delay Recovery in Progress for SH-101\n\nDear Customer,\n\nWe are actively managing a disruption affecting your shipment SH-101. Our autonomous recovery engine is preparing a rail diversion plan through Trieste to recover the ETA. No action is required. We will send updates as they occur.";
    }
    
    // Save AI message
    const aiMsg = {
      conversation_id: conversationId,
      sender: "ai",
      message: answer,
      timestamp: now.toISOString()
    };
    await insertChatMessage(aiMsg);
    
    return NextResponse.json({
      answer,
      timestamp: now.toISOString()
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
