"""
KavachPay - Complete Firestore Seed Script v5
=============================================
Built by reading AdminDashboard.js field-by-field.
Every value in this file maps to a specific UI element.

Collections:
  1. workers             — powers Workers tab + Overview KPIs
  2. disruption_events   — powers Disruptions tab + Overview cards
  3. claims              — powers Claims page + fraud stats
  4. payments            — powers Financials tab P&L
  5. financial_snapshots — powers ALL 3 Analytics tab graphs
  6. financials          — admin-only P&L summary (Financials tab)
  7. audit_log           — tamper-proof action trail

NOT in Firestore:
  - zones      → ZONE_CONFIG dict in config.py
  - break-even → hardcoded in frontend (static projections)

Run: python seed_data.py
"""

import firebase_admin
from firebase_admin import credentials, firestore
from datetime import datetime, timedelta
import sys

# ─────────────────────────────────────────────────────────────
# ZONE CONFIG — in config.py, NOT Firestore
# Matches ZONE_DATA in AdminDashboard.js exactly
# ─────────────────────────────────────────────────────────────
ZONE_CONFIG = {
    "Koramangala": {
        "city": "Bangalore", "risk": "medium",
        "premium": 59, "coverage": 1200,
        "lat": 12.9352, "lng": 77.6245
    },
    "Adyar": {
        "city": "Chennai", "risk": "high",
        "premium": 74, "coverage": 1560,
        "lat": 13.0067, "lng": 80.2571
    },
    "Dharavi": {
        "city": "Mumbai", "risk": "high",
        "premium": 96, "coverage": 1560,
        "lat": 19.0390, "lng": 72.8527
    },
    "Salt Lake": {
        "city": "Kolkata", "risk": "high",
        "premium": 74, "coverage": 1560,
        "lat": 22.5726, "lng": 88.4319
    },
    "HSR Layout": {
        "city": "Bangalore", "risk": "low",
        "premium": 49, "coverage": 980,
        "lat": 12.9116, "lng": 77.6389
    },
    "Anna Nagar": {
        "city": "Chennai", "risk": "low",
        "premium": 49, "coverage": 980,
        "lat": 13.0850, "lng": 80.2101
    },
}


# ─────────────────────────────────────────────────────────────
# FIREBASE INIT
# ─────────────────────────────────────────────────────────────
def init_firebase():
    if not firebase_admin._apps:
        try:
            cred = credentials.Certificate("firebase-credentials.json")
            firebase_admin.initialize_app(cred)
            print("✅ Firebase connected\n")
        except Exception as e:
            print(f"❌ Firebase connection failed: {e}")
            print("   Make sure firebase-credentials.json is in this folder.")
            sys.exit(1)


# ─────────────────────────────────────────────────────────────
# 1. WORKERS
#    Document ID = employee_id
#
#    Fields added vs previous version:
#    - total_paid   → shown in Workers tab "Total Paid" column
#    - total_claims → shown in Workers tab "Claims" column
#    - status       → drives Workers tab filter (active/paused/flagged)
#
#    Frontend reference:
#    WORKERS array in AdminDashboard.js:
#    { name, zone, platform, score, premium, status, claims, totalPaid }
# ─────────────────────────────────────────────────────────────
def seed_workers(db):
    print("👷 Seeding workers...")

    workers = [
        {
            "id": "SWG-2847361",
            "data": {
                # Identity
                "employee_id":                "SWG-2847361",
                "name":                       "Ravi Kumar",
                "email":                      "ravi@kavachpay.in",
                "phone":                      "9876543210",
                "age":                        26,

                # Location — separate city and zone columns
                "city":                       "Bangalore",
                "zone":                       "Koramangala",
                "city_tier":                  1,

                # Platform
                "platform":                   "Swiggy",

                # Risk & Insurance
                "risk":                       "medium",
                "risk_multiplier":            1.15,
                "premium":                    59,
                "coverage":                   1200,
                "coverage_ratio":             0.65,
                "avg_weekly_income":          1800,

                # KavachScore
                "kavachScore":                780,       # matches WORKERS[0].score

                # Policy
                "policyStatus":               "active",  # matches WORKERS[0].status

                # Work Profile
                "months_active":              14,
                "avg_daily_distance":         38.5,
                "typical_workdays":           ["Mon","Tue","Wed","Thu","Fri","Sat"],
                "social_disruption_exposure": "medium",

                # Claims summary — shown directly in Workers tab
                "past_claims":                3,         # matches WORKERS[0].claims = 3
                "past_correct_claims":        3,
                "total_claims":               3,         # alias used by frontend
                "total_paid":                 2340,      # matches WORKERS[0].totalPaid

                "enrolledAt":                 firestore.SERVER_TIMESTAMP,
            }
        },
        {
            "id": "ZMT-1928374",
            "data": {
                "employee_id":                "ZMT-1928374",
                "name":                       "Priya Singh",
                "email":                      "priya@kavachpay.in",
                "phone":                      "9123456780",
                "age":                        29,

                "city":                       "Chennai",
                "zone":                       "Adyar",
                "city_tier":                  1,

                "platform":                   "Zomato",

                "risk":                       "high",
                "risk_multiplier":            1.30,
                "premium":                    74,
                "coverage":                   1560,
                "coverage_ratio":             0.65,
                "avg_weekly_income":          2200,

                "kavachScore":                820,       # matches WORKERS[1].score

                "policyStatus":               "active",

                "months_active":              22,
                "avg_daily_distance":         42.0,
                "typical_workdays":           ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"],
                "social_disruption_exposure": "high",

                "past_claims":                5,         # matches WORKERS[1].claims = 5
                "past_correct_claims":        5,
                "total_claims":               5,
                "total_paid":                 4680,      # matches WORKERS[1].totalPaid

                "enrolledAt":                 firestore.SERVER_TIMESTAMP,
            }
        },
        {
            "id": "ZPT-3746251",
            "data": {
                "employee_id":                "ZPT-3746251",
                "name":                       "Mohammed Arif",
                "email":                      "mohammed@kavachpay.in",
                "phone":                      "9988776655",
                "age":                        31,

                "city":                       "Mumbai",
                "zone":                       "Dharavi",
                "city_tier":                  1,

                "platform":                   "Zepto",   # matches WORKERS[2].platform

                "risk":                       "high",
                "risk_multiplier":            1.45,
                "premium":                    74,        # matches WORKERS[2].premium
                "coverage":                   1560,
                "coverage_ratio":             0.65,
                "avg_weekly_income":          2800,

                "kavachScore":                750,       # matches WORKERS[2].score

                "policyStatus":               "active",

                "months_active":              8,
                "avg_daily_distance":         29.0,
                "typical_workdays":           ["Mon","Wed","Thu","Fri","Sat","Sun"],
                "social_disruption_exposure": "high",

                "past_claims":                4,
                "past_correct_claims":        4,
                "total_claims":               4,
                "total_paid":                 3744,      # matches WORKERS[2].totalPaid

                "enrolledAt":                 firestore.SERVER_TIMESTAMP,
            }
        },
        {
            "id": "BLK-9182736",
            "data": {
                "employee_id":                "BLK-9182736",
                "name":                       "Sunita Devi",
                "email":                      "sunita@kavachpay.in",
                "phone":                      "9871234560",
                "age":                        34,

                "city":                       "Bangalore",
                "zone":                       "HSR Layout",
                "city_tier":                  1,

                "platform":                   "Blinkit",

                "risk":                       "low",
                "risk_multiplier":            0.95,
                "premium":                    49,        # matches WORKERS[3].premium
                "coverage":                   980,
                "coverage_ratio":             0.65,
                "avg_weekly_income":          1500,

                "kavachScore":                710,       # matches WORKERS[3].score

                "policyStatus":               "paused",  # matches WORKERS[3].status

                "months_active":              6,
                "avg_daily_distance":         31.0,
                "typical_workdays":           ["Tue","Wed","Thu","Fri","Sat"],
                "social_disruption_exposure": "low",

                "past_claims":                1,
                "past_correct_claims":        1,
                "total_claims":               1,
                "total_paid":                 294,       # matches WORKERS[3].totalPaid

                "enrolledAt":                 firestore.SERVER_TIMESTAMP,
            }
        },
        {
            "id": "SWG-5647382",
            "data": {
                "employee_id":                "SWG-5647382",
                "name":                       "Karthik R",
                "email":                      "karthik@kavachpay.in",
                "phone":                      "9845612370",
                "age":                        27,

                "city":                       "Bangalore",
                "zone":                       "Koramangala",
                "city_tier":                  1,

                "platform":                   "Swiggy",

                "risk":                       "medium",
                "risk_multiplier":            1.10,
                "premium":                    59,
                "coverage":                   1200,
                "coverage_ratio":             0.65,
                "avg_weekly_income":          1700,

                "kavachScore":                760,

                "policyStatus":               "active",

                "months_active":              11,
                "avg_daily_distance":         36.0,
                "typical_workdays":           ["Mon","Tue","Wed","Thu","Fri","Sat"],
                "social_disruption_exposure": "medium",

                "past_claims":                2,
                "past_correct_claims":        2,
                "total_claims":               2,
                "total_paid":                 1560,

                "enrolledAt":                 firestore.SERVER_TIMESTAMP,
            }
        },
        {
            "id": "ZMT-6473829",
            "data": {
                "employee_id":                "ZMT-6473829",
                "name":                       "Deepa Nair",
                "email":                      "deepa@kavachpay.in",
                "phone":                      "9933445566",
                "age":                        28,

                "city":                       "Kolkata",
                "zone":                       "Salt Lake",
                "city_tier":                  1,

                "platform":                   "Zomato",

                "risk":                       "high",
                "risk_multiplier":            1.35,
                "premium":                    74,
                "coverage":                   1560,
                "coverage_ratio":             0.65,
                "avg_weekly_income":          2100,

                "kavachScore":                800,

                "policyStatus":               "active",

                "months_active":              18,
                "avg_daily_distance":         44.0,
                "typical_workdays":           ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"],
                "social_disruption_exposure": "high",

                "past_claims":                4,
                "past_correct_claims":        4,
                "total_claims":               4,
                "total_paid":                 3744,

                "enrolledAt":                 firestore.SERVER_TIMESTAMP,
            }
        },
        {
            "id": "SWG-7364829",
            "data": {
                "employee_id":                "SWG-7364829",
                "name":                       "Suresh Patil",
                "email":                      "suresh@kavachpay.in",
                "phone":                      "9876001234",
                "age":                        35,

                "city":                       "Mumbai",
                "zone":                       "Dharavi",
                "city_tier":                  1,

                "platform":                   "Swiggy",

                "risk":                       "high",
                "risk_multiplier":            1.50,
                "premium":                    74,
                "coverage":                   1560,
                "coverage_ratio":             0.65,
                "avg_weekly_income":          2400,

                "kavachScore":                690,

                "policyStatus":               "flagged",  # matches WORKERS[6].status

                "months_active":              5,
                "avg_daily_distance":         27.0,
                "typical_workdays":           ["Mon","Tue","Thu","Fri","Sat"],
                "social_disruption_exposure": "high",

                "past_claims":                6,
                "past_correct_claims":        2,          # fraud pattern
                "total_claims":               6,
                "total_paid":                 0,          # matches WORKERS[6].totalPaid = 0 (all blocked)

                "enrolledAt":                 firestore.SERVER_TIMESTAMP,
            }
        },
        {
            "id": "ZMT-8374651",
            "data": {
                "employee_id":                "ZMT-8374651",
                "name":                       "Mithun Roy",
                "email":                      "mithun@kavachpay.in",
                "phone":                      "9812345670",
                "age":                        30,

                "city":                       "Kolkata",
                "zone":                       "Salt Lake",
                "city_tier":                  1,

                "platform":                   "Zomato",

                "risk":                       "high",
                "risk_multiplier":            1.30,
                "premium":                    74,
                "coverage":                   1560,
                "coverage_ratio":             0.65,
                "avg_weekly_income":          2300,

                "kavachScore":                810,

                "policyStatus":               "active",

                "months_active":              20,
                "avg_daily_distance":         40.0,
                "typical_workdays":           ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"],
                "social_disruption_exposure": "high",

                "past_claims":                3,
                "past_correct_claims":        3,
                "total_claims":               3,
                "total_paid":                 2808,

                "enrolledAt":                 firestore.SERVER_TIMESTAMP,
            }
        },
    ]

    for w in workers:
        db.collection("workers").document(w["id"]).set(w["data"])
        print(f"   ✅ {w['data']['name']:16s} | {w['id']} | {w['data']['city']:9s} - {w['data']['zone']:12s} | {w['data']['policyStatus']}")

    print(f"   → {len(workers)} workers seeded\n")
    return workers


# ─────────────────────────────────────────────────────────────
# 2. DISRUPTION EVENTS
#    Document ID = EVT-CAT-NNN
#
#    New fields vs previous version:
#    - event_label  → shown in Disruptions tab event column
#                     e.g. "Heavy Rain — 82mm"
#    - time_label   → shown in Disruptions tab time column
#                     e.g. "2:14 PM Today"
#    - blocked_workers = affected_workers - paid_workers
#
#    Frontend reference:
#    RECENT_DISRUPTIONS in AdminDashboard.js:
#    { time, zone, event, severity, workers, paid, amount }
# ─────────────────────────────────────────────────────────────
def seed_disruption_events(db):
    print("⚡ Seeding disruption_events...")

    now = datetime.utcnow()

    events = [
        {
            "id": "EVT-RAI-001",
            "data": {
                "event_id":          "EVT-RAI-001",
                "category":          "RAI",
                "severity":          "Moderate",

                # Location
                "city":              "Chennai",
                "zone":              "Adyar",

                # Human readable labels — shown directly in Disruptions tab
                "event_label":       "Heavy Rain — 82mm",     # matches RECENT_DISRUPTIONS[0].event
                "time_label":        "2:14 PM Today",          # matches RECENT_DISRUPTIONS[0].time

                # Raw API values stored permanently for audit
                "rainfall_mm":       82.0,
                "aqi_value":         None,
                "wind_kmh":          18.4,
                "weather_source":    "OpenWeatherMap",
                "aqi_source":        None,
                "api_timestamp":     now - timedelta(hours=2),

                # Outcome
                "affected_workers":  47,                       # matches RECENT_DISRUPTIONS[0].workers
                "paid_workers":      28,                       # matches RECENT_DISRUPTIONS[0].paid
                "blocked_workers":   19,                       # 47 - 28
                "total_paid_out":    8200,                     # matches RECENT_DISRUPTIONS[0].amount
                "payout_pct":        0.65,

                "status":            "processed",
                "triggered_at":      now - timedelta(hours=3),
                "resolved_at":       now - timedelta(hours=2, minutes=30),
            }
        },
        {
            "id": "EVT-AQI-001",
            "data": {
                "event_id":          "EVT-AQI-001",
                "category":          "AQI",
                "severity":          "Moderate",

                "city":              "Mumbai",
                "zone":              "Dharavi",

                "event_label":       "AQI Alert — 347",        # matches RECENT_DISRUPTIONS[1].event
                "time_label":        "10:32 AM Today",

                "rainfall_mm":       None,
                "aqi_value":         347,
                "wind_kmh":          None,
                "weather_source":    None,
                "aqi_source":        "WAQI",
                "api_timestamp":     now - timedelta(hours=6),

                "affected_workers":  63,
                "paid_workers":      35,
                "blocked_workers":   28,
                "total_paid_out":    11400,
                "payout_pct":        0.65,

                "status":            "processed",
                "triggered_at":      now - timedelta(hours=7),
                "resolved_at":       now - timedelta(hours=6, minutes=15),
            }
        },
        {
            "id": "EVT-FLD-001",
            "data": {
                "event_id":          "EVT-FLD-001",
                "category":          "FLD",
                "severity":          "Severe",

                "city":              "Kolkata",
                "zone":              "Salt Lake",

                "event_label":       "Flood Alert — NDMA",     # matches RECENT_DISRUPTIONS[2].event
                "time_label":        "Yesterday 4:15 PM",

                "rainfall_mm":       None,
                "aqi_value":         None,
                "wind_kmh":          None,
                "weather_source":    "NDMA",
                "aqi_source":        None,
                "api_timestamp":     now - timedelta(days=1, hours=8),

                "affected_workers":  41,
                "paid_workers":      31,
                "blocked_workers":   10,
                "total_paid_out":    6200,
                "payout_pct":        1.00,

                "status":            "processed",
                "triggered_at":      now - timedelta(days=1, hours=8),
                "resolved_at":       now - timedelta(days=1, hours=7),
            }
        },
        {
            "id": "EVT-RAI-002",
            "data": {
                "event_id":          "EVT-RAI-002",
                "category":          "RAI",
                "severity":          "Moderate",

                "city":              "Bangalore",
                "zone":              "Koramangala",

                "event_label":       "Heavy Rain — 78mm",      # matches RECENT_DISRUPTIONS[3].event
                "time_label":        "Mar 5, 2:10 PM",

                "rainfall_mm":       78.4,
                "aqi_value":         None,
                "wind_kmh":          22.1,
                "weather_source":    "OpenWeatherMap",
                "aqi_source":        None,
                "api_timestamp":     now - timedelta(days=5, hours=2),

                "affected_workers":  58,
                "paid_workers":      32,
                "blocked_workers":   26,
                "total_paid_out":    6800,
                "payout_pct":        0.65,

                "status":            "processed",
                "triggered_at":      now - timedelta(days=5),
                "resolved_at":       now - timedelta(days=5, minutes=-30),
            }
        },
    ]

    for e in events:
        db.collection("disruption_events").document(e["id"]).set(e["data"])
        print(f"   ✅ {e['id']} | {e['data']['city']:9s} - {e['data']['zone']:12s} | {e['data']['severity']:8s} | paid: {e['data']['paid_workers']}/{e['data']['affected_workers']} | ₹{e['data']['total_paid_out']:,}")

    print(f"   → {len(events)} disruption events seeded\n")
    return [e["id"] for e in events]


# ─────────────────────────────────────────────────────────────
# 3. CLAIMS
#    Document ID = claim_id (e.g. RAI-001)
#    Added: disruption_event_id to link back to parent event
#           layers_passed for audit visibility
# ─────────────────────────────────────────────────────────────
def seed_claims(db, event_ids):
    print("📋 Seeding claims...")

    now = datetime.utcnow()

    claims = [
        {
            "id": "RAI-001",
            "data": {
                "claim_id":             "RAI-001",
                "employee_id":          "SWG-2847361",
                "disruption_event_id":  "EVT-RAI-002",

                "city":                 "Bangalore",
                "zone":                 "Koramangala",

                "category":             "RAI",
                "severity":             "Moderate",
                "status":               "paid",

                "payout_amount":        780,
                "txn_id":               "PAY-SWG2847361-001",

                "layers_passed":        5,
                "distance":             0.0,

                "fraud_flag":           False,
                "fraud_reason":         "",
                "flag_count":           0,
                "auto_approve":         True,
                "fraud_decision":       "clean",

                "created_at":           now - timedelta(days=5),
            }
        },
        {
            "id": "AQI-001",
            "data": {
                "claim_id":             "AQI-001",
                "employee_id":          "ZMT-1928374",
                "disruption_event_id":  "EVT-AQI-001",

                "city":                 "Mumbai",
                "zone":                 "Dharavi",

                "category":             "AQI",
                "severity":             "Moderate",
                "status":               "paid",

                "payout_amount":        1014,
                "txn_id":               "PAY-ZMT1928374-001",

                "layers_passed":        5,
                "distance":             0.0,

                "fraud_flag":           False,
                "fraud_reason":         "",
                "flag_count":           0,
                "auto_approve":         True,
                "fraud_decision":       "clean",

                "created_at":           now - timedelta(hours=6),
            }
        },
        {
            "id": "FLD-001",
            "data": {
                "claim_id":             "FLD-001",
                "employee_id":          "ZMT-6473829",
                "disruption_event_id":  "EVT-FLD-001",

                "city":                 "Kolkata",
                "zone":                 "Salt Lake",

                "category":             "FLD",
                "severity":             "Severe",
                "status":               "paid",

                "payout_amount":        1560,
                "txn_id":               "PAY-ZMT6473829-001",

                "layers_passed":        5,
                "distance":             0.0,

                "fraud_flag":           False,
                "fraud_reason":         "",
                "flag_count":           0,
                "auto_approve":         True,
                "fraud_decision":       "clean",

                "created_at":           now - timedelta(days=1),
            }
        },
        {
            "id": "RAI-002",
            "data": {
                "claim_id":             "RAI-002",
                "employee_id":          "SWG-7364829",
                "disruption_event_id":  "EVT-RAI-001",

                "city":                 "Chennai",
                "zone":                 "Adyar",

                "category":             "RAI",
                "severity":             "Moderate",
                "status":               "rejected",          # fraud case

                "payout_amount":        0,
                "txn_id":               "",

                "layers_passed":        1,
                "distance":             12.4,                # was actively working

                "fraud_flag":           True,
                "fraud_reason":         "Active deliveries detected during disruption window",
                "flag_count":           3,
                "auto_approve":         False,
                "fraud_decision":       "flagged",

                "created_at":           now - timedelta(hours=2),
            }
        },
    ]

    for c in claims:
        db.collection("claims").document(c["id"]).set(c["data"])
        print(f"   ✅ {c['id']} | {c['data']['employee_id']} | {c['data']['city']:9s} - {c['data']['zone']:12s} | {c['data']['status']:8s} | fraud: {c['data']['fraud_flag']}")

    print(f"   → {len(claims)} claims seeded\n")
    return [c["id"] for c in claims]


# ─────────────────────────────────────────────────────────────
# 4. PAYMENTS
#    txn_id format: PAY-{employeeID_no_hyphen}-{sequence}
#    Matches claim txn_id exactly for reconciliation
# ─────────────────────────────────────────────────────────────
def seed_payments(db, claim_ids):
    print("💸 Seeding payments...")

    now = datetime.utcnow()

    payments = [
        # ── Payout payments ───────────────────────────────
        {
            "employee_id": "SWG-2847361",
            "claim_id":    "RAI-001",
            "amount":      780,
            "type":        "payout",
            "method":      "upi",
            "txn_id":      "PAY-SWG2847361-001",
            "status":      "success",
            "created_at":  now - timedelta(days=5),
        },
        {
            "employee_id": "ZMT-1928374",
            "claim_id":    "AQI-001",
            "amount":      1014,
            "type":        "payout",
            "method":      "upi",
            "txn_id":      "PAY-ZMT1928374-001",
            "status":      "success",
            "created_at":  now - timedelta(hours=6),
        },
        {
            "employee_id": "ZMT-6473829",
            "claim_id":    "FLD-001",
            "amount":      1560,
            "type":        "payout",
            "method":      "upi",
            "txn_id":      "PAY-ZMT6473829-001",
            "status":      "success",
            "created_at":  now - timedelta(days=1),
        },
        # ── Premium payments ──────────────────────────────
        {
            "employee_id": "SWG-2847361",
            "claim_id":    "",
            "amount":      59,
            "type":        "premium",
            "method":      "upi",
            "txn_id":      "PAY-SWG2847361-002",
            "status":      "success",
            "created_at":  now - timedelta(days=7),
        },
        {
            "employee_id": "ZMT-1928374",
            "claim_id":    "",
            "amount":      74,
            "type":        "premium",
            "method":      "upi",
            "txn_id":      "PAY-ZMT1928374-002",
            "status":      "success",
            "created_at":  now - timedelta(days=7),
        },
        {
            "employee_id": "ZPT-3746251",
            "claim_id":    "",
            "amount":      74,
            "type":        "premium",
            "method":      "upi",
            "txn_id":      "PAY-ZPT3746251-001",
            "status":      "success",
            "created_at":  now - timedelta(days=7),
        },
        {
            "employee_id": "SWG-5647382",
            "claim_id":    "",
            "amount":      59,
            "type":        "premium",
            "method":      "upi",
            "txn_id":      "PAY-SWG5647382-001",
            "status":      "success",
            "created_at":  now - timedelta(days=7),
        },
        {
            "employee_id": "ZMT-6473829",
            "claim_id":    "",
            "amount":      74,
            "type":        "premium",
            "method":      "upi",
            "txn_id":      "PAY-ZMT6473829-002",
            "status":      "success",
            "created_at":  now - timedelta(days=7),
        },
        {
            "employee_id": "SWG-7364829",
            "claim_id":    "",
            "amount":      74,
            "type":        "premium",
            "method":      "upi",
            "txn_id":      "PAY-SWG7364829-001",
            "status":      "success",
            "created_at":  now - timedelta(days=7),
        },
        {
            "employee_id": "ZMT-8374651",
            "claim_id":    "",
            "amount":      74,
            "type":        "premium",
            "method":      "upi",
            "txn_id":      "PAY-ZMT8374651-001",
            "status":      "success",
            "created_at":  now - timedelta(days=7),
        },
    ]

    for p in payments:
        db.collection("payments").add(p)
        print(f"   ✅ {p['employee_id']} | ₹{p['amount']:>5} | {p['type']:7s} | {p['txn_id']}")

    print(f"   → {len(payments)} payments seeded\n")


# ─────────────────────────────────────────────────────────────
# 5. FINANCIAL SNAPSHOTS
#    Document ID = week label (e.g. "W1 Jan")
#    Powers ALL 3 charts in Analytics tab:
#      - Profit Over Time (LineChart: profit)
#      - Zone Premiums vs Payouts (BarChart: premiums, payouts per zone)
#      - Weekly Premium vs Payout Trend (LineChart: premiums, payouts)
#
#    Frontend reference: WEEKLY_PROFIT_DATA in AdminDashboard.js
#    { week, premiums, payouts, profit }
# ─────────────────────────────────────────────────────────────
def seed_financial_snapshots(db):
    print("📈 Seeding financial_snapshots...")

    # Matches WEEKLY_PROFIT_DATA exactly — every value from AdminDashboard.js
    snapshots = [
        {"week": "W1 Jan", "premiums": 42000, "payouts": 18400, "profit": 23600, "enrolled_workers": 280, "active_claims": 12, "fraud_blocked": 3},
        {"week": "W2 Jan", "premiums": 46800, "payouts": 22200, "profit": 24600, "enrolled_workers": 312, "active_claims": 15, "fraud_blocked": 4},
        {"week": "W3 Jan", "premiums": 51200, "payouts": 16800, "profit": 34400, "enrolled_workers": 341, "active_claims": 11, "fraud_blocked": 5},
        {"week": "W4 Jan", "premiums": 54800, "payouts": 24600, "profit": 30200, "enrolled_workers": 365, "active_claims": 16, "fraud_blocked": 4},
        {"week": "W1 Feb", "premiums": 58600, "payouts": 19200, "profit": 39400, "enrolled_workers": 390, "active_claims": 13, "fraud_blocked": 6},
        {"week": "W2 Feb", "premiums": 62400, "payouts": 24800, "profit": 37600, "enrolled_workers": 416, "active_claims": 16, "fraud_blocked": 7},
        {"week": "W3 Feb", "premiums": 67800, "payouts": 17400, "profit": 50400, "enrolled_workers": 452, "active_claims": 11, "fraud_blocked": 5},
        {"week": "W4 Feb", "premiums": 72400, "payouts": 26200, "profit": 46200, "enrolled_workers": 482, "active_claims": 17, "fraud_blocked": 8},
        {"week": "W1 Mar", "premiums": 78000, "payouts": 21200, "profit": 56800, "enrolled_workers": 520, "active_claims": 14, "fraud_blocked": 6},
        {"week": "W2 Mar", "premiums": 84600, "payouts": 24800, "profit": 59800, "enrolled_workers": 563, "active_claims": 16, "fraud_blocked": 7},
    ]

    for s in snapshots:
        doc_id = s["week"].replace(" ", "_")
        db.collection("financial_snapshots").document(doc_id).set(s)
        loss_ratio = round((s["payouts"] / s["premiums"]) * 100)
        print(f"   ✅ {s['week']} | premiums: ₹{s['premiums']:,} | payouts: ₹{s['payouts']:,} | profit: ₹{s['profit']:,} | LR: {loss_ratio}%")

    print(f"   → {len(snapshots)} weekly snapshots seeded\n")


# ─────────────────────────────────────────────────────────────
# 6. FINANCIALS (admin-only)
#    Document ID = "current_week" + "break_even_projection"
#    Powers Financials tab P&L summary
#    ADMIN ACCESS ONLY — enforce in Firestore security rules
#
#    Frontend reference: Financials tab in AdminDashboard.js
#    Shows: totalPremiums, totalPayouts, operationalCost, netProfit
# ─────────────────────────────────────────────────────────────
def seed_financials(db):
    print("🔒 Seeding financials (admin-only)...")

    now = datetime.utcnow()

    # Current week P&L — maps to "Weekly P&L Summary" card
    db.collection("financials").document("current_week").set({
        "doc_type":          "weekly_pnl",
        "week_label":        "W2 Mar",
        "week_start":        now - timedelta(days=7),
        "week_end":          now,

        # Revenue
        "total_premiums":    84600,    # matches totalPremiums in frontend

        # Costs
        "total_payouts":     24800,    # matches totalPayouts in frontend
        "operational_cost":  4200,     # matches "Operational Cost (est.)" in Financials tab

        # Derived
        "net_profit":        55600,    # 84600 - 24800 - 4200
        "loss_ratio":        29.3,     # payouts / premiums * 100

        # Zone breakdown — powers zone-wise bar chart
        "zone_breakdown": [
            {"zone": "Koramangala", "city": "Bangalore", "workers": 58, "premiums": 12400, "payouts": 6800,  "loss_ratio": 54.8, "disruptions": 1, "status": "active"},
            {"zone": "Adyar",       "city": "Chennai",   "workers": 47, "premiums": 14800, "payouts": 8200,  "loss_ratio": 55.4, "disruptions": 2, "status": "disrupted"},
            {"zone": "Dharavi",     "city": "Mumbai",    "workers": 63, "premiums": 19600, "payouts": 11400, "loss_ratio": 58.2, "disruptions": 3, "status": "disrupted"},
            {"zone": "Salt Lake",   "city": "Kolkata",   "workers": 41, "premiums": 13200, "payouts": 6200,  "loss_ratio": 47.0, "disruptions": 1, "status": "disrupted"},
            {"zone": "HSR Layout",  "city": "Bangalore", "workers": 52, "premiums": 10400, "payouts": 0,     "loss_ratio": 0.0,  "disruptions": 0, "status": "safe"},
            {"zone": "Anna Nagar",  "city": "Chennai",   "workers": 38, "premiums":  8200, "payouts": 0,     "loss_ratio": 0.0,  "disruptions": 0, "status": "safe"},
        ],

        # Fraud savings
        "fraud_blocked_count":  47,
        "fraud_savings":        31200,
        "fraud_rate_pct":       8.2,

        "created_at":        firestore.SERVER_TIMESTAMP,
        "access":            "admin_only",   # flag for security rules
    })
    print("   ✅ current_week P&L document")

    # Break-even projection — maps to "Break-Even Projection" card
    db.collection("financials").document("break_even_projection").set({
        "doc_type":   "break_even",
        "projections": [
            {"workers": "500 (Pilot)", "annual_net": -3490000, "label": "- ₹34.9L/yr", "status": "Burning Capital"},
            {"workers": "5,000",       "annual_net":  -820000, "label": "- ₹8.2L/yr",  "status": "Improving"},
            {"workers": "15,000",      "annual_net":  1140000, "label": "+ ₹11.4L/yr", "status": "Profitable"},
            {"workers": "50,000",      "annual_net":  9400000, "label": "+ ₹94L/yr",   "status": "Scaling"},
        ],
        "break_even_workers":    12000,
        "break_even_months":     18,
        "note":                  "Achievable via platform partnerships with Swiggy, Zomato and Zepto",
        "access":                "admin_only",
        "created_at":            firestore.SERVER_TIMESTAMP,
    })
    print("   ✅ break_even_projection document")

    print("   → 2 financials documents seeded (admin-only)\n")


# ─────────────────────────────────────────────────────────────
# 7. AUDIT LOG
#    Append-only. Every significant system action logged here.
#    Set Firestore rules: allow create only, never update/delete
# ─────────────────────────────────────────────────────────────
def seed_audit_log(db):
    print("📜 Seeding audit_log...")

    now = datetime.utcnow()

    logs = [
        # Worker enrollments
        {"action": "WORKER_ENROLLED",      "actor": "worker", "entity_type": "worker", "entity_id": "SWG-2847361", "employee_id": "SWG-2847361", "detail": "Enrolled. Premium ₹59/week. Coverage ₹1200/week.", "before": None, "after": {"policyStatus": "active", "kavachScore": 750}, "timestamp": now - timedelta(days=30)},
        {"action": "WORKER_ENROLLED",      "actor": "worker", "entity_type": "worker", "entity_id": "ZMT-1928374", "employee_id": "ZMT-1928374", "detail": "Enrolled. Premium ₹74/week. Coverage ₹1560/week.", "before": None, "after": {"policyStatus": "active", "kavachScore": 750}, "timestamp": now - timedelta(days=45)},
        {"action": "WORKER_ENROLLED",      "actor": "worker", "entity_type": "worker", "entity_id": "ZPT-3746251", "employee_id": "ZPT-3746251", "detail": "Enrolled. Premium ₹74/week. Coverage ₹1560/week.", "before": None, "after": {"policyStatus": "active", "kavachScore": 750}, "timestamp": now - timedelta(days=20)},

        # Claim lifecycle — RAI-001
        {"action": "CLAIM_CREATED",        "actor": "system", "entity_type": "claim",  "entity_id": "RAI-001",     "employee_id": "SWG-2847361", "detail": "Claim created from EVT-RAI-002. Category RAI. Severity Moderate.", "before": None, "after": {"status": "pending", "payout_amount": 780},                      "timestamp": now - timedelta(days=5, minutes=2)},
        {"action": "VERIFICATION_PASSED",  "actor": "system", "entity_type": "claim",  "entity_id": "RAI-001",     "employee_id": "SWG-2847361", "detail": "All 5 verification layers passed. auto_approve: True.",            "before": {"layers_passed": 0}, "after": {"layers_passed": 5, "auto_approve": True},  "timestamp": now - timedelta(days=5, minutes=1)},
        {"action": "PAYOUT_TRIGGERED",     "actor": "system", "entity_type": "claim",  "entity_id": "RAI-001",     "employee_id": "SWG-2847361", "detail": "₹780 UPI transfer. TXN: PAY-SWG2847361-001.",                     "before": {"status": "pending"}, "after": {"status": "paid", "txn_id": "PAY-SWG2847361-001"}, "timestamp": now - timedelta(days=5)},
        {"action": "KAVACHSCORE_UPDATED",  "actor": "system", "entity_type": "worker", "entity_id": "SWG-2847361", "employee_id": "SWG-2847361", "detail": "Score updated: legitimate_claim event after RAI-001.",             "before": {"kavachScore": 770}, "after": {"kavachScore": 780},                      "timestamp": now - timedelta(days=5)},

        # Claim lifecycle — RAI-002 (fraud)
        {"action": "CLAIM_CREATED",        "actor": "system", "entity_type": "claim",  "entity_id": "RAI-002",     "employee_id": "SWG-7364829", "detail": "Claim created from EVT-RAI-001. Category RAI. Severity Moderate.",        "before": None, "after": {"status": "pending"},                          "timestamp": now - timedelta(hours=2, minutes=3)},
        {"action": "FRAUD_FLAGGED",        "actor": "system", "entity_type": "claim",  "entity_id": "RAI-002",     "employee_id": "SWG-7364829", "detail": "Layer 2 failed: active deliveries during disruption. Distance: 12.4km.", "before": {"fraud_flag": False}, "after": {"fraud_flag": True, "flag_count": 3}, "timestamp": now - timedelta(hours=2, minutes=1)},
        {"action": "CLAIM_REJECTED",       "actor": "system", "entity_type": "claim",  "entity_id": "RAI-002",     "employee_id": "SWG-7364829", "detail": "Auto-rejected. 3 fraud flags. Payout blocked.",                          "before": {"status": "pending"}, "after": {"status": "rejected"},               "timestamp": now - timedelta(hours=2)},
        {"action": "KAVACHSCORE_UPDATED",  "actor": "system", "entity_type": "worker", "entity_id": "SWG-7364829", "employee_id": "SWG-7364829", "detail": "Score updated: suspicious_pattern event. Worker flagged.",                 "before": {"kavachScore": 715}, "after": {"kavachScore": 690},                  "timestamp": now - timedelta(hours=2)},

        # Policy paused
        {"action": "POLICY_PAUSED",        "actor": "worker", "entity_type": "worker", "entity_id": "BLK-9182736", "employee_id": "BLK-9182736", "detail": "Worker paused policy manually.", "before": {"policyStatus": "active"}, "after": {"policyStatus": "paused"}, "timestamp": now - timedelta(days=3)},
    ]

    for log in logs:
        db.collection("audit_log").add(log)

    print(f"   ✅ {len(logs)} audit entries written")
    print(f"   → Actions: WORKER_ENROLLED, CLAIM_CREATED, VERIFICATION_PASSED,")
    print(f"              PAYOUT_TRIGGERED, FRAUD_FLAGGED, CLAIM_REJECTED,")
    print(f"              KAVACHSCORE_UPDATED, POLICY_PAUSED\n")


# ─────────────────────────────────────────────────────────────
# MAIN
# ─────────────────────────────────────────────────────────────
def main():
    print("=" * 65)
    print("   KavachPay — Firestore Seed Script v5 (Matches Frontend)")
    print("=" * 65)
    print()

    init_firebase()
    db = firestore.client()

    seed_workers(db)
    event_ids = seed_disruption_events(db)
    claim_ids = seed_claims(db, event_ids)
    seed_payments(db, claim_ids)
    seed_financial_snapshots(db)
    seed_financials(db)
    seed_audit_log(db)

    print("=" * 65)
    print("✅ DONE — 7 collections fully seeded.")
    print()
    print("   Collection             Docs   Powers")
    print("   ──────────────────────────────────────────────────────────")
    print("   workers                  8    Workers tab, Overview KPIs")
    print("   disruption_events        4    Disruptions tab, Overview cards")
    print("   claims                   4    Claims page, Fraud stats")
    print("   payments                10    Financials tab P&L")
    print("   financial_snapshots     10    ALL 3 Analytics tab graphs")
    print("   financials               2    Financials tab (ADMIN ONLY)")
    print("   audit_log               12    Full audit trail")
    print()
    print("   NOT in Firestore")
    print("   ──────────────────────────────────────────────────────────")
    print("   zones         → ZONE_CONFIG dict in config.py")
    print("   break-even    → hardcoded in frontend (static projections)")
    print()
    print("   ⚠️  Set Firestore security rules:")
    print("   financials    → read: admin role only")
    print("   audit_log     → create only, no update/delete ever")
    print()
    print("   Test credentials")
    print("   ──────────────────────────────────────────────────────────")
    print("   ravi@kavachpay.in      / ravi123    (SWG-2847361)")
    print("   priya@kavachpay.in     / priya123   (ZMT-1928374)")
    print("   mohammed@kavachpay.in  / mohammed123 (ZPT-3746251)")
    print("   admin@kavachpay.in     / admin123")
    print("=" * 65)


if __name__ == "__main__":
    main()