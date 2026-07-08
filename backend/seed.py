import os
import pymongo
from datetime import datetime, timedelta

def seed_db():
    mongodb_url = os.getenv("MONGODB_URL", "mongodb://localhost:27017/sentinel_ai")
    print(f"Connecting to database to seed: {mongodb_url}")
    client = pymongo.MongoClient(mongodb_url)
    db_name = mongodb_url.split("/")[-1].split("?")[0] or "sentinel_ai"
    db = client[db_name]
    
    # Drop collections to start fresh
    db.shipments.drop()
    db.incidents.drop()
    db.recovery_plans.drop()
    db.partners.drop()
    db.audit_logs.drop()
    db.chat_messages.drop()

    print("Cleared existing collections.")

    # Seed Partners (Suppliers and Carriers)
    partners = [
        # Suppliers
        {
            "_id": "SUP-001",
            "name": "Apex Electronics",
            "type": "supplier",
            "contact_email": "supply@apexelectronics.com",
            "contact_phone": "+86-755-88882222",
            "sla_score": 96.5,
            "risk_score": 12.0,
            "category": "Semiconductors",
            "location": "Shenzhen, China"
        },
        {
            "_id": "SUP-002",
            "name": "Global Plastics Corp",
            "type": "supplier",
            "contact_email": "logistics@globalplastics.com",
            "contact_phone": "+84-24-37831111",
            "sla_score": 91.0,
            "risk_score": 35.0,
            "category": "Raw Materials",
            "location": "Hanoi, Vietnam"
        },
        {
            "_id": "SUP-003",
            "name": "Vertex Semiconductors",
            "type": "supplier",
            "contact_email": "orders@vertexsemi.tw",
            "contact_phone": "+886-3-5771234",
            "sla_score": 98.2,
            "risk_score": 8.0,
            "category": "Semiconductors",
            "location": "Hsinchu, Taiwan"
        },
        # Carriers
        {
            "_id": "CAR-001",
            "name": "Maersk Line",
            "type": "carrier",
            "contact_email": "europe.support@maersk.com",
            "contact_phone": "+45-3363-3363",
            "sla_score": 94.2,
            "risk_score": 15.0,
            "category": "Ocean Freight",
            "location": "Copenhagen, Denmark"
        },
        {
            "_id": "CAR-002",
            "name": "Ocean Network Express (ONE)",
            "type": "carrier",
            "contact_email": "support@one-line.com",
            "contact_phone": "+65-6223-2100",
            "sla_score": 92.5,
            "risk_score": 18.0,
            "category": "Ocean Freight",
            "location": "Singapore"
        },
        {
            "_id": "CAR-003",
            "name": "DHL Global Forwarding",
            "type": "carrier",
            "contact_email": "air.support@dhl.com",
            "contact_phone": "+49-228-1820",
            "sla_score": 97.8,
            "risk_score": 5.0,
            "category": "Air Freight",
            "location": "Bonn, Germany"
        }
    ]
    db.partners.insert_many(partners)
    print(f"Seeded {len(partners)} partners.")

    # Seed Shipments
    now = datetime.utcnow()
    shipments = [
        {
            "_id": "SH-101",
            "origin": "Shenzhen, China",
            "destination": "Rotterdam, Netherlands",
            "current_location": "Suez Canal",
            "carrier": "Maersk Line",
            "status": "Disrupted",
            "cargo_value": 450000.0,
            "sku_details": "Microchips, IoT Sensors",
            "eta": now + timedelta(days=5),
            "original_eta": now + timedelta(days=2),
            "cost": 15200.0,
            "carbon_emissions": 8.4,
            "risk_score": 85.0,
            "timeline": [
                {"checkpoint": "Departed Origin Port", "location": "Shenzhen", "timestamp": now - timedelta(days=12), "status": "Completed"},
                {"checkpoint": "Transit through Singapore", "location": "Singapore Strait", "timestamp": now - timedelta(days=8), "status": "Completed"},
                {"checkpoint": "Transit Suez Canal", "location": "Suez Canal", "timestamp": now - timedelta(days=1), "status": "Completed"},
                {"checkpoint": "Arrival Rotterdam", "location": "Rotterdam", "timestamp": now + timedelta(days=2), "status": "Delayed"},
                {"checkpoint": "Final Destination", "location": "Munich, Germany", "timestamp": now + timedelta(days=5), "status": "Pending"}
            ]
        },
        {
            "_id": "SH-102",
            "origin": "Shanghai, China",
            "destination": "Long Beach, USA",
            "current_location": "Pacific Ocean",
            "carrier": "Ocean Network Express (ONE)",
            "status": "On Time",
            "cargo_value": 820000.0,
            "sku_details": "Automotive Electronic Sub-assemblies",
            "eta": now + timedelta(days=8),
            "original_eta": now + timedelta(days=8),
            "cost": 21800.0,
            "carbon_emissions": 12.2,
            "risk_score": 10.0,
            "timeline": [
                {"checkpoint": "Departed Origin Port", "location": "Shanghai", "timestamp": now - timedelta(days=5), "status": "Completed"},
                {"checkpoint": "Ocean Transit", "location": "Pacific Ocean", "timestamp": now, "status": "Completed"},
                {"checkpoint": "Arrival Long Beach", "location": "Long Beach", "timestamp": now + timedelta(days=8), "status": "Pending"},
                {"checkpoint": "Final Destination", "location": "Detroit, USA", "timestamp": now + timedelta(days=11), "status": "Pending"}
            ]
        },
        {
            "_id": "SH-103",
            "origin": "Hsinchu, Taiwan",
            "destination": "Frankfurt, Germany",
            "current_location": "Bonn, Germany",
            "carrier": "DHL Global Forwarding",
            "status": "On Time",
            "cargo_value": 1500000.0,
            "sku_details": "High-End FPGA Processors",
            "eta": now + timedelta(days=1),
            "original_eta": now + timedelta(days=1),
            "cost": 45000.0,
            "carbon_emissions": 42.5,  # Air freight has high emissions
            "risk_score": 5.0,
            "timeline": [
                {"checkpoint": "Departed Origin Airport", "location": "Taipei", "timestamp": now - timedelta(days=1), "status": "Completed"},
                {"checkpoint": "Transit Airport Hub", "location": "Bonn", "timestamp": now, "status": "Completed"},
                {"checkpoint": "Arrival Frankfurt", "location": "Frankfurt", "timestamp": now + timedelta(days=1), "status": "Pending"}
            ]
        },
        {
            "_id": "SH-104",
            "origin": "Hanoi, Vietnam",
            "destination": "Hamburg, Germany",
            "current_location": "Gulf of Aden",
            "carrier": "MSC",
            "status": "Disrupted",
            "cargo_value": 310000.0,
            "sku_details": "Mechanical Parts & Connectors",
            "eta": now + timedelta(days=9),
            "original_eta": now + timedelta(days=4),
            "cost": 11500.0,
            "carbon_emissions": 7.1,
            "risk_score": 75.0,
            "timeline": [
                {"checkpoint": "Departed Origin Port", "location": "Haiphong", "timestamp": now - timedelta(days=14), "status": "Completed"},
                {"checkpoint": "Transit Singapore", "location": "Singapore Strait", "timestamp": now - timedelta(days=10), "status": "Completed"},
                {"checkpoint": "Transit Gulf of Aden", "location": "Gulf of Aden", "timestamp": now - timedelta(days=1), "status": "Completed"},
                {"checkpoint": "Arrival Hamburg", "location": "Hamburg", "timestamp": now + timedelta(days=4), "status": "Delayed"},
                {"checkpoint": "Final Destination", "location": "Berlin, Germany", "timestamp": now + timedelta(days=9), "status": "Pending"}
            ]
        }
    ]
    db.shipments.insert_many(shipments)
    print(f"Seeded {len(shipments)} shipments.")

    # Seed Incidents
    incidents = [
        {
            "_id": "INC-201",
            "title": "Rotterdam Port Strike",
            "type": "Strike",
            "severity": "Critical",
            "status": "Active",
            "impact_score": 85.0,
            "description": "Union workers have initiated an indefinite strike at Rotterdam Port Terminals, stopping container unloading and handling operations. Over 80 ocean vessels are currently queued or delayed in entering the port area.",
            "location": "Rotterdam, Netherlands",
            "affected_shipment_ids": ["SH-101", "SH-104"],
            "date_detected": now - timedelta(days=1)
        },
        {
            "_id": "INC-202",
            "title": "Customs System Outage",
            "type": "Customs",
            "severity": "Medium",
            "status": "Resolved",
            "impact_score": 38.0,
            "description": "Electronic customs clearance database went offline in Los Angeles Port, causing general delivery delays for incoming items. Resolved after 14 hours of IT downtime.",
            "location": "Los Angeles, USA",
            "affected_shipment_ids": ["SH-102"],
            "date_detected": now - timedelta(days=3)
        }
    ]
    db.incidents.insert_many(incidents)
    print(f"Seeded {len(incidents)} incidents.")

    # Seed default Recovery Plan for Strike (INC-201, Shipment SH-101)
    recovery_plans = [
        {
            "_id": "REC-301",
            "shipment_id": "SH-101",
            "incident_id": "INC-201",
            "original_route": "Shenzhen -> Suez Canal -> Rotterdam -> Munich",
            "proposed_route": "Shenzhen -> Suez Canal -> Trieste Port (Italy) -> Rail to Munich (Germany)",
            "cost_diff": 4800.0,  # +$4,800
            "time_diff_hours": -48.0,  # 2 days faster than sitting out the Rotterdam strike
            "emission_diff": -0.6,
            "status": "Draft",
            "steps": [
                {"step_number": 1, "title": "Reroute Ship to Trieste", "description": "Instruct vessel carrier (Maersk) to dump Munich-bound container in Trieste, Italy, instead of waiting for Rotterdam strike resolution.", "assigned_to": "Carrier Operations (Maersk)", "status": "Pending"},
                {"step_number": 2, "title": "Book Rail Freight", "description": "Secure space on the Trieste-Munich express rail corridor.", "assigned_to": "Procurement Agent", "status": "Pending"},
                {"step_number": 3, "title": "Prepare Customs Documentation", "description": "Liaise with Italian customs representatives to handle rapid transit clearance.", "assigned_to": "Customs Clerk", "status": "Pending"},
                {"step_number": 4, "title": "Pre-Alert Munich Warehouse", "description": "Notify Munich assembly plant of modified delivery date and new entry gate.", "assigned_to": "Site Logistics Manager", "status": "Pending"}
            ],
            "customer_email_draft": "Subject: Urgent: Sentinel AI Shipment Update - Rerouting Notification for SH-101\n\nDear Value Partner,\n\nPlease be advised that due to the ongoing labor strike at the Port of Rotterdam (Incident INC-201), we have proactively initiated a recovery strategy for your shipment SH-101 (Microchips, IoT Sensors).\n\nTo minimize delayed delivery, we are rerouting the container via Trieste, Italy. The freight will be transferred immediately via express rail to Munich. Your revised estimated arrival date is now 2026-07-13, preventing a projected 7-day delay. \n\nNo action is required on your part. We will keep you updated on milestones.\n\nBest regards,\nSentinel AI Logistics Team",
            "supplier_email_draft": "Subject: Supplier Request: Alternative Clearance Coordination - Shipment SH-101\n\nDear Apex Electronics Support Team,\n\nIn response to the Rotterdam strike, we are rerouting shipment SH-101 via Trieste, Italy. \n\nPlease provide any updated export clearance certificates and invoices reflecting Trieste as the port of entry at your earliest convenience to expedite customs processing.\n\nThank you for your rapid assistance.\n\nSentinel AI Procurement Team",
            "created_at": now,
            "approved_by": None,
            "approved_at": None
        }
    ]
    db.recovery_plans.insert_many(recovery_plans)
    print(f"Seeded {len(recovery_plans)} recovery plans.")

    # Seed a couple of Audit Logs
    audit_logs = [
        {
            "_id": "AUD-501",
            "timestamp": now - timedelta(hours=23),
            "user": "System Monitor Agent",
            "action": "Incident Detection",
            "description": "Detected Incident INC-201 (Rotterdam Port Strike) affecting routes of shipments SH-101 and SH-104.",
            "affected_entity_id": "INC-201"
        },
        {
            "_id": "AUD-502",
            "timestamp": now - timedelta(hours=22),
            "user": "Sentinel Multi-Agent Engine",
            "action": "Recovery Generation",
            "description": "Generated alternate route via Trieste Port for Shipment SH-101 (Plan REC-301).",
            "recovery_plan_id": "REC-301",
            "affected_entity_id": "REC-301"
        }
    ]
    db.audit_logs.insert_many(audit_logs)
    print(f"Seeded {len(audit_logs)} audit logs.")
    
    print("Database seeding completed successfully.")

if __name__ == "__main__":
    seed_db()
