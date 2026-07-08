import fs from 'fs';
import path from 'path';
import { MongoClient, Db } from 'mongodb';

const DB_FILE = path.join(process.cwd(), 'sentinel_db.json');
const MONGODB_URL = process.env.MONGODB_URL;

let mongoClient: MongoClient | null = null;
let mongoDb: Db | null = null;

async function getMongoClient(): Promise<Db> {
  if (mongoDb) return mongoDb;
  if (!MONGODB_URL) throw new Error("MONGODB_URL env is not defined");
  
  mongoClient = new MongoClient(MONGODB_URL);
  await mongoClient.connect();
  const dbName = MONGODB_URL.split('/')[-1]?.split('?')[0] || 'sentinel_ai';
  mongoDb = mongoClient.db(dbName);
  
  // Seed the cloud database if it is empty
  const count = await mongoDb.collection('shipments').countDocuments({});
  if (count === 0) {
    console.log("Production database is empty. Auto-seeding cloud collections...");
    const initial = getInitialDB();
    if (initial.partners.length > 0) await mongoDb.collection('partners').insertMany(initial.partners);
    if (initial.shipments.length > 0) await mongoDb.collection('shipments').insertMany(initial.shipments);
    if (initial.incidents.length > 0) await mongoDb.collection('incidents').insertMany(initial.incidents);
    if (initial.recovery_plans.length > 0) await mongoDb.collection('recovery_plans').insertMany(initial.recovery_plans);
    if (initial.audit_logs.length > 0) await mongoDb.collection('audit_logs').insertMany(initial.audit_logs);
  }
  
  return mongoDb;
}

export interface Shipment {
  _id: string;
  origin: string;
  destination: string;
  current_location: string;
  carrier: string;
  status: string;
  cargo_value: number;
  sku_details: string;
  eta: string;
  original_eta: string;
  cost: number;
  carbon_emissions: number;
  risk_score: number;
  timeline: Array<{
    checkpoint: string;
    location: string;
    timestamp: string;
    status: string;
  }>;
}

export interface Incident {
  _id: string;
  title: string;
  type: string;
  severity: string;
  status: string;
  impact_score: number;
  description: string;
  location: string;
  affected_shipment_ids: string[];
  date_detected: string;
}

export interface RecoveryPlan {
  _id: string;
  shipment_id: string;
  incident_id: string;
  original_route: string;
  proposed_route: string;
  cost_diff: number;
  time_diff_hours: number;
  emission_diff: number;
  status: string;
  steps: Array<{
    step_number: number;
    title: string;
    description: string;
    assigned_to: string;
    status: string;
  }>;
  customer_email_draft: string;
  supplier_email_draft: string;
  created_at: string;
  approved_by?: string | null;
  approved_at?: string | null;
}

export interface Partner {
  _id: string;
  name: string;
  type: string;
  contact_email: string;
  contact_phone: string;
  sla_score: number;
  risk_score: number;
  category: string;
  location: string;
}

export interface AuditLog {
  _id: string;
  timestamp: string;
  user: string;
  action: string;
  description: string;
  affected_entity_id?: string;
  recovery_plan_id?: string;
}

export interface ChatMessage {
  conversation_id: string;
  sender: string;
  message: string;
  timestamp: string;
}

export interface SentinelDB {
  shipments: Shipment[];
  incidents: Incident[];
  recovery_plans: RecoveryPlan[];
  partners: Partner[];
  audit_logs: AuditLog[];
  chat_messages: ChatMessage[];
}

function getInitialDB(): SentinelDB {
  const now = new Date();
  const eta1 = new Date(); eta1.setDate(now.getDate() + 5);
  const oeta1 = new Date(); oeta1.setDate(now.getDate() + 2);
  const eta2 = new Date(); eta2.setDate(now.getDate() + 8);
  const eta3 = new Date(); eta3.setDate(now.getDate() + 1);
  const eta4 = new Date(); eta4.setDate(now.getDate() + 9);
  const oeta4 = new Date(); oeta4.setDate(now.getDate() + 4);

  return {
    shipments: [
      {
        _id: "SH-101",
        origin: "Shenzhen, China",
        destination: "Rotterdam, Netherlands",
        current_location: "Suez Canal",
        carrier: "Maersk Line",
        status: "Disrupted",
        cargo_value: 450000,
        sku_details: "Microchips, IoT Sensors",
        eta: eta1.toISOString(),
        original_eta: oeta1.toISOString(),
        cost: 15200,
        carbon_emissions: 8.4,
        risk_score: 85,
        timeline: [
          { checkpoint: "Departed Origin Port", location: "Shenzhen", timestamp: new Date(now.getTime() - 12*24*60*60*1000).toISOString(), status: "Completed" },
          { checkpoint: "Transit through Singapore", location: "Singapore Strait", timestamp: new Date(now.getTime() - 8*24*60*60*1000).toISOString(), status: "Completed" },
          { checkpoint: "Transit Suez Canal", location: "Suez Canal", timestamp: new Date(now.getTime() - 1*24*60*60*1000).toISOString(), status: "Completed" },
          { checkpoint: "Arrival Rotterdam", location: "Rotterdam", timestamp: oeta1.toISOString(), status: "Delayed" },
          { checkpoint: "Final Destination", location: "Munich, Germany", timestamp: eta1.toISOString(), status: "Pending" }
        ]
      },
      {
        _id: "SH-102",
        origin: "Shanghai, China",
        destination: "Long Beach, USA",
        current_location: "Pacific Ocean",
        carrier: "Ocean Network Express (ONE)",
        status: "On Time",
        cargo_value: 820000,
        sku_details: "Automotive Electronic Sub-assemblies",
        eta: eta2.toISOString(),
        original_eta: eta2.toISOString(),
        cost: 21800,
        carbon_emissions: 12.2,
        risk_score: 10,
        timeline: [
          { checkpoint: "Departed Origin Port", location: "Shanghai", timestamp: new Date(now.getTime() - 5*24*60*60*1000).toISOString(), status: "Completed" },
          { checkpoint: "Ocean Transit", location: "Pacific Ocean", timestamp: now.toISOString(), status: "Completed" },
          { checkpoint: "Arrival Long Beach", location: "Long Beach", timestamp: eta2.toISOString(), status: "Pending" },
          { checkpoint: "Final Destination", location: "Detroit, USA", timestamp: new Date(eta2.getTime() + 3*24*60*60*1000).toISOString(), status: "Pending" }
        ]
      },
      {
        _id: "SH-103",
        origin: "Hsinchu, Taiwan",
        destination: "Frankfurt, Germany",
        current_location: "Bonn, Germany",
        carrier: "DHL Global Forwarding",
        status: "On Time",
        cargo_value: 1500000,
        sku_details: "High-End FPGA Processors",
        eta: eta3.toISOString(),
        original_eta: eta3.toISOString(),
        cost: 45000,
        carbon_emissions: 42.5,
        risk_score: 5,
        timeline: [
          { checkpoint: "Departed Origin Airport", location: "Taipei", timestamp: new Date(now.getTime() - 1*24*60*60*1000).toISOString(), status: "Completed" },
          { checkpoint: "Transit Airport Hub", location: "Bonn", timestamp: now.toISOString(), status: "Completed" },
          { checkpoint: "Arrival Frankfurt", location: "Frankfurt", timestamp: eta3.toISOString(), status: "Pending" }
        ]
      },
      {
        _id: "SH-104",
        origin: "Hanoi, Vietnam",
        destination: "Hamburg, Germany",
        current_location: "Gulf of Aden",
        carrier: "MSC",
        status: "Disrupted",
        cargo_value: 310000,
        sku_details: "Mechanical Parts & Connectors",
        eta: eta4.toISOString(),
        original_eta: oeta4.toISOString(),
        cost: 11500,
        carbon_emissions: 7.1,
        risk_score: 75,
        timeline: [
          { checkpoint: "Departed Origin Port", location: "Haiphong", timestamp: new Date(now.getTime() - 14*24*60*60*1000).toISOString(), status: "Completed" },
          { checkpoint: "Transit Singapore", location: "Singapore Strait", timestamp: new Date(now.getTime() - 10*24*60*60*1000).toISOString(), status: "Completed" },
          { checkpoint: "Transit Gulf of Aden", location: "Gulf of Aden", timestamp: new Date(now.getTime() - 1*24*60*60*1000).toISOString(), status: "Completed" },
          { checkpoint: "Arrival Hamburg", location: "Hamburg", timestamp: oeta4.toISOString(), status: "Delayed" },
          { checkpoint: "Final Destination", location: "Berlin, Germany", timestamp: eta4.toISOString(), status: "Pending" }
        ]
      }
    ],
    incidents: [
      {
        _id: "INC-201",
        title: "Rotterdam Port Strike",
        type: "Strike",
        severity: "Critical",
        status: "Active",
        impact_score: 85,
        description: "Union workers have initiated an indefinite strike at Rotterdam Port Terminals, stopping container unloading and handling operations. Over 80 ocean vessels are currently queued or delayed in entering the port area.",
        location: "Rotterdam, Netherlands",
        affected_shipment_ids: ["SH-101", "SH-104"],
        date_detected: new Date(now.getTime() - 24*60*60*1000).toISOString()
      },
      {
        _id: "INC-202",
        title: "Customs System Outage",
        type: "Customs",
        severity: "Medium",
        status: "Resolved",
        impact_score: 38,
        description: "Electronic customs clearance database went offline in Los Angeles Port, causing general delivery delays for incoming items. Resolved after 14 hours of IT downtime.",
        location: "Los Angeles, USA",
        affected_shipment_ids: ["SH-102"],
        date_detected: new Date(now.getTime() - 3*24*60*60*1000).toISOString()
      }
    ],
    recovery_plans: [
      {
        _id: "REC-301",
        shipment_id: "SH-101",
        incident_id: "INC-201",
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
          { step_number: 4, title: "Pre-Alert Munich Warehouse", description: "Notify Munich assembly plant of modified delivery date and new entry gate.", assigned_to: "Site Logistics Manager", status: "Pending" }
        ],
        customer_email_draft: "Subject: Urgent: Sentinel AI Shipment Update - Rerouting Notification for SH-101\n\nDear Valued Partner,\n\nPlease be advised that due to the ongoing labor strike at the Port of Rotterdam (Incident INC-201), we have proactively initiated a recovery strategy for your shipment SH-101 (Microchips, IoT Sensors).\n\nTo minimize delayed delivery, we are rerouting the container via Trieste, Italy. The freight will be transferred immediately via express rail to Munich. Your revised estimated arrival date is now 2026-07-13, preventing a projected 7-day delay. \n\nNo action is required on your part. We will keep you updated on milestones.\n\nBest regards,\nSentinel AI Logistics Team",
        supplier_email_draft: "Subject: Supplier Request: Alternative Clearance Coordination - Shipment SH-101\n\nDear Apex Electronics Support Team,\n\nIn response to the Rotterdam strike, we are rerouting shipment SH-101 via Trieste, Italy. \n\nPlease provide any updated export clearance certificates and invoices reflecting Trieste as the port of entry at your earliest convenience to expedite customs processing.\n\nThank you for your rapid assistance.\n\nSentinel AI Procurement Team",
        created_at: now.toISOString(),
        approved_by: null,
        approved_at: null
      }
    ],
    partners: [
      { _id: "SUP-001", name: "Apex Electronics", type: "supplier", contact_email: "supply@apexelectronics.com", contact_phone: "+86-755-88882222", sla_score: 96.5, risk_score: 12.0, category: "Semiconductors", location: "Shenzhen, China" },
      { _id: "SUP-002", name: "Global Plastics Corp", type: "supplier", contact_email: "logistics@globalplastics.com", contact_phone: "+84-24-37831111", sla_score: 91.0, risk_score: 35.0, category: "Raw Materials", location: "Hanoi, Vietnam" },
      { _id: "SUP-003", name: "Vertex Semiconductors", type: "supplier", contact_email: "orders@vertexsemi.tw", contact_phone: "+886-3-5771234", sla_score: 98.2, risk_score: 8.0, category: "Semiconductors", location: "Hsinchu, Taiwan" },
      { _id: "CAR-001", name: "Maersk Line", type: "carrier", contact_email: "europe.support@maersk.com", contact_phone: "+45-3363-3363", sla_score: 94.2, risk_score: 15.0, category: "Ocean Freight", location: "Copenhagen, Denmark" },
      { _id: "CAR-002", name: "Ocean Network Express (ONE)", type: "carrier", contact_email: "support@one-line.com", contact_phone: "+65-6223-2100", sla_score: 92.5, risk_score: 18.0, category: "Ocean Freight", location: "Singapore" },
      { _id: "CAR-003", name: "DHL Global Forwarding", type: "carrier", contact_email: "air.support@dhl.com", contact_phone: "+49-228-1820", sla_score: 97.8, risk_score: 5.0, category: "Air Freight", location: "Bonn, Germany" }
    ],
    audit_logs: [
      { _id: "AUD-501", timestamp: new Date(now.getTime() - 23*60*60*1000).toISOString(), user: "System Monitor Agent", action: "Incident Detection", description: "Detected Incident INC-201 (Rotterdam Port Strike) affecting routes of shipments SH-101 and SH-104.", affected_entity_id: "INC-201" },
      { _id: "AUD-502", timestamp: new Date(now.getTime() - 22*60*60*1000).toISOString(), user: "Sentinel Multi-Agent Engine", action: "Recovery Generation", description: "Generated alternate route via Trieste Port for Shipment SH-101 (Plan REC-301).", recovery_plan_id: "REC-301", affected_entity_id: "REC-301" }
    ],
    chat_messages: []
  };
}

// Read database records (supports MongoDB Cloud Atlas or local JSON backup)
export function readDB(): SentinelDB {
  if (MONGODB_URL) {
    // We handle async db inside async functions below, synchronous readDB returns local file
  }
  if (!fs.existsSync(DB_FILE)) {
    const initial = getInitialDB();
    fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2));
    return initial;
  }
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    const initial = getInitialDB();
    fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2));
    return initial;
  }
}

export function writeDB(db: SentinelDB) {
  if (MONGODB_URL) {
    // Asynchronous DB writes are handled inside routes directly via async methods below
  }
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
}

// Async Database Access Interfaces (Cloud/File selective proxy)
export async function getShipments(): Promise<Shipment[]> {
  if (MONGODB_URL) {
    const db = await getMongoClient();
    return (await db.collection('shipments').find({}).toArray()) as any[];
  }
  return readDB().shipments;
}

export async function getIncidents(): Promise<Incident[]> {
  if (MONGODB_URL) {
    const db = await getMongoClient();
    return (await db.collection('incidents').find({}).toArray()) as any[];
  }
  return readDB().incidents;
}

export async function getPlans(): Promise<RecoveryPlan[]> {
  if (MONGODB_URL) {
    const db = await getMongoClient();
    return (await db.collection('recovery_plans').find({}).toArray()) as any[];
  }
  return readDB().recovery_plans;
}

export async function getPartners(): Promise<Partner[]> {
  if (MONGODB_URL) {
    const db = await getMongoClient();
    return (await db.collection('partners').find({}).toArray()) as any[];
  }
  return readDB().partners;
}

export async function getAuditLogs(): Promise<AuditLog[]> {
  if (MONGODB_URL) {
    const db = await getMongoClient();
    return (await db.collection('audit_logs').find({}).sort({ timestamp: -1 }).toArray()) as any[];
  }
  return readDB().audit_logs;
}

export async function saveIncident(inc: Incident, shipments: Shipment[], logs: AuditLog[], plans: RecoveryPlan[]) {
  if (MONGODB_URL) {
    const db = await getMongoClient();
    await db.collection('incidents').insertOne(inc);
    
    // Update shipments
    for (const sh of shipments) {
      await db.collection('shipments').updateOne(
        { _id: sh._id },
        { $set: { status: sh.status, risk_score: sh.risk_score } }
      );
    }
    
    // Insert plans and logs
    if (plans.length > 0) await db.collection('recovery_plans').insertMany(plans);
    if (logs.length > 0) await db.collection('audit_logs').insertMany(logs);
  } else {
    const dbData = readDB();
    dbData.incidents.unshift(inc);
    shipments.forEach(sh => {
      const index = dbData.shipments.findIndex(s => s._id === sh._id);
      if (index !== -1) dbData.shipments[index] = sh;
    });
    plans.forEach(p => dbData.recovery_plans.unshift(p));
    logs.forEach(l => dbData.audit_logs.unshift(l));
    writeDB(dbData);
  }
}

export async function updatePlan(planId: string, updates: Partial<RecoveryPlan>, logs: AuditLog[]) {
  if (MONGODB_URL) {
    const db = await getMongoClient();
    await db.collection('recovery_plans').updateOne({ _id: planId }, { $set: updates });
    if (logs.length > 0) await db.collection('audit_logs').insertMany(logs);
  } else {
    const dbData = readDB();
    const index = dbData.recovery_plans.findIndex(p => p._id === planId);
    if (index !== -1) {
      dbData.recovery_plans[index] = { ...dbData.recovery_plans[index], ...updates } as any;
    }
    logs.forEach(l => dbData.audit_logs.unshift(l));
    writeDB(dbData);
  }
}

export async function executePlanDB(planId: string, shipmentId: string, shipmentUpdates: Partial<Shipment>, planSteps: any[], logs: AuditLog[]) {
  if (MONGODB_URL) {
    const db = await getMongoClient();
    await db.collection('recovery_plans').updateOne({ _id: planId }, { $set: { status: 'Executed', steps: planSteps } });
    await db.collection('shipments').updateOne({ _id: shipmentId }, { $set: shipmentUpdates });
    if (logs.length > 0) await db.collection('audit_logs').insertMany(logs);
  } else {
    const dbData = readDB();
    const pIdx = dbData.recovery_plans.findIndex(p => p._id === planId);
    if (pIdx !== -1) {
      dbData.recovery_plans[pIdx].status = 'Executed';
      dbData.recovery_plans[pIdx].steps = planSteps;
    }
    const sIdx = dbData.shipments.findIndex(s => s._id === shipmentId);
    if (sIdx !== -1) {
      dbData.shipments[sIdx] = { ...dbData.shipments[sIdx], ...shipmentUpdates };
    }
    logs.forEach(l => dbData.audit_logs.unshift(l));
    writeDB(dbData);
  }
}

export async function getChatMessages(conversationId: string): Promise<ChatMessage[]> {
  if (MONGODB_URL) {
    const db = await getMongoClient();
    return (await db.collection('chat_messages').find({ conversation_id: conversationId }).sort({ timestamp: 1 }).toArray()) as any[];
  }
  return readDB().chat_messages.filter(msg => msg.conversation_id === conversationId);
}

export async function insertChatMessage(msg: ChatMessage) {
  if (MONGODB_URL) {
    const db = await getMongoClient();
    await db.collection('chat_messages').insertOne(msg);
  } else {
    const dbData = readDB();
    dbData.chat_messages.push(msg);
    writeDB(dbData);
  }
}
