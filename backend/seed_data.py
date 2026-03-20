"""
KavachPay - Complete Firestore Seed Script v6
=============================================
Reflects full schema update:
  - workers: customer_id (doc ID), employee_id (city code), referral_code
  - orders_week_a/b/c/d: 4 weekly order tables
  - Computed stats stored back on worker doc

Run: python seed_data.py
"""

import firebase_admin
from firebase_admin import credentials, firestore
from datetime import datetime, timedelta
import hashlib
import random
import sys
from math import radians, sin, cos, sqrt, atan2

# ─────────────────────────────────────────────────────────────
# HELPERS
# ─────────────────────────────────────────────────────────────
def haversine_km(lat1, lon1, lat2, lon2):
    R = 6371
    dlat = radians(lat2 - lat1)
    dlon = radians(lon2 - lon1)
    a = sin(dlat/2)**2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon/2)**2
    return round(R * 2 * atan2(sqrt(a), sqrt(1 - a)), 2)

ZONE_COORDS = {
    "Koramangala":  (12.9352, 77.6245),
    "Adyar":        (13.0067, 80.2571),
    "Dharavi":      (19.0390, 72.8527),
    "Salt Lake":    (22.5726, 88.4319),
    "HSR Layout":   (12.9116, 77.6389),
    "Anna Nagar":   (13.0850, 80.2101),
    "Bandra":       (19.0596, 72.8295),
    "Whitefield":   (12.9698, 77.7499),
    "T Nagar":      (13.0418, 80.2341),
    "Indiranagar":  (12.9784, 77.6408),
}

ZONES_BY_CITY = {
    "Bangalore": ["Koramangala", "HSR Layout", "Whitefield", "Indiranagar"],
    "Chennai":   ["Adyar", "Anna Nagar", "T Nagar"],
    "Mumbai":    ["Dharavi", "Bandra"],
    "Kolkata":   ["Salt Lake"],
}

def zone_distance(z1, z2):
    if z1 in ZONE_COORDS and z2 in ZONE_COORDS:
        c1, c2 = ZONE_COORDS[z1], ZONE_COORDS[z2]
        return haversine_km(c1[0], c1[1], c2[0], c2[1])
    return round(random.uniform(3.0, 15.0), 2)

WEEK_LABELS  = ["A", "B", "C", "D"]
WEEK_OFFSETS = [0, 7, 14, 21]
DAY_NAMES    = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

def generate_orders(customer_id, worker, week_label, week_offset_days):
    city      = worker["city"]
    zones     = ZONES_BY_CITY.get(city, ["Koramangala"])
    home_zone = worker["zone"]
    seed_base = f"{customer_id}-{week_label}"

    rng = random.Random(int(hashlib.md5(seed_base.encode()).hexdigest(), 16))
    num_workdays = 5 + rng.randint(0, 2)
    workdays = sorted(rng.sample(range(7), min(num_workdays, 7)))

    orders = []
    counter = 1
    week_start = datetime.utcnow() - timedelta(days=week_offset_days + 6)
    prefix = "SWG" if worker["platform"] == "Swiggy" else "ZMT"

    for day_offset in workdays:
        order_date = (week_start + timedelta(days=day_offset)).strftime("%Y-%m-%d")
        day_rng = random.Random(int(hashlib.md5(f"{seed_base}-{day_offset}".encode()).hexdigest(), 16))
        num_orders = 4 + day_rng.randint(0, 5)

        for i in range(num_orders):
            pickup_zone = home_zone
            drop_zone   = day_rng.choice(zones)
            dist        = zone_distance(pickup_zone, drop_zone)
            amount      = round(40 + dist * 8 + day_rng.uniform(0, 30))
            order_id    = f"{prefix}-W{week_label}-{customer_id[-7:]}-{str(counter).zfill(3)}"

            orders.append({
                "order_id":    order_id,
                "employee_id": worker["employee_id"],
                "order_date":  order_date,
                "amount_paid": amount,
                "pickup_zone": pickup_zone,
                "drop_zone":   drop_zone,
                "distance":    dist,
                "week":        week_label,
            })
            counter += 1

    return orders

def compute_stats(all_orders_by_week):
    weekly_incomes    = []
    weekly_distances  = []
    weekly_deliveries = []

    for week_orders in all_orders_by_week:
        if not week_orders:
            continue
        week_income   = sum(o["amount_paid"] for o in week_orders)
        days_worked   = len(set(o["order_date"] for o in week_orders))
        week_distance = sum(o["distance"] for o in week_orders)
        weekly_incomes.append(week_income)
        weekly_distances.append(week_distance / days_worked if days_worked else 0)
        weekly_deliveries.append(len(week_orders) / days_worked if days_worked else 0)

    return {
        "avg_weekly_income":    round(sum(weekly_incomes)    / len(weekly_incomes),    2) if weekly_incomes    else 0,
        "avg_daily_distance":   round(sum(weekly_distances)  / len(weekly_distances),  2) if weekly_distances  else 0,
        "avg_daily_deliveries": round(sum(weekly_deliveries) / len(weekly_deliveries), 2) if weekly_deliveries else 0,
    }

def derive_workdays(all_orders):
    from collections import Counter
    week_day_set = set()
    for o in all_orders:
        try:
            dt = datetime.strptime(o["order_date"], "%Y-%m-%d")
            week_day_set.add((o["week"], DAY_NAMES[dt.weekday()]))
        except Exception:
            pass
    day_counts = Counter(day for _, day in week_day_set)
    return [d for d in DAY_NAMES if day_counts.get(d, 0) >= 3]

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
            sys.exit(1)

# ─────────────────────────────────────────────────────────────
# 1. WORKERS
#    Document ID = customer_id  (platform-assigned, e.g. SWG-2847361)
#    employee_id = city_code + hyphen + 7 digits  (e.g. BLR-1000001)
#    referral_code = firstname + hyphen + numeric part of customer_id
# ─────────────────────────────────────────────────────────────
def seed_workers(db):
    print("👷 Seeding workers...")

    workers = [
        {
            "customer_id":   "SWG-2847361",
            "employee_id":   "BLR-1000001",
            "referral_code": "Ravi-2847361",
            "name":          "Ravi Kumar",
            "email":         "ravi@kavachpay.in",
            "phone":         "9876543210",
            "age":           26,
            "city":          "Bangalore",
            "zone":          "Koramangala",
            "city_tier":     1,
            "platform":      "Swiggy",
            "risk":          "medium",
            "risk_multiplier": 1.15,
            "premium":       59,
            "coverage":      1200,
            "coverage_ratio": 0.65,
            # avg_weekly_income, avg_daily_distance, avg_daily_deliveries
            # filled in after orders are generated (see compute step)
            "avg_weekly_income":    0,
            "avg_daily_distance":   0,
            "avg_daily_deliveries": 0,
            "kavachScore":    780,
            "policyStatus":  "active",
            "months_active": 14,
            "typical_workdays": [],
            "social_disruption_exposure": "medium",
            "past_claims":        3,
            "past_correct_claims":3,
            "total_claims":       3,
            "total_paid":         2340,
            "enrolledAt":    firestore.SERVER_TIMESTAMP,
        },
        {
            "customer_id":   "ZMT-1928374",
            "employee_id":   "CHN-2000001",
            "referral_code": "Priya-1928374",
            "name":          "Priya Singh",
            "email":         "priya@kavachpay.in",
            "phone":         "9123456780",
            "age":           29,
            "city":          "Chennai",
            "zone":          "Adyar",
            "city_tier":     1,
            "platform":      "Zomato",
            "risk":          "high",
            "risk_multiplier": 1.30,
            "premium":       74,
            "coverage":      1560,
            "coverage_ratio": 0.65,
            "avg_weekly_income":    0,
            "avg_daily_distance":   0,
            "avg_daily_deliveries": 0,
            "kavachScore":    820,
            "policyStatus":  "active",
            "months_active": 22,
            "typical_workdays": [],
            "social_disruption_exposure": "high",
            "past_claims":        5,
            "past_correct_claims":5,
            "total_claims":       5,
            "total_paid":         4680,
            "enrolledAt":    firestore.SERVER_TIMESTAMP,
        },
        {
            "customer_id":   "ZMT-3746251",
            "employee_id":   "MUM-1000004",
            "referral_code": "Mohammed-3746251",
            "name":          "Mohammed Arif",
            "email":         "mohammed@kavachpay.in",
            "phone":         "9988776655",
            "age":           31,
            "city":          "Mumbai",
            "zone":          "Dharavi",
            "city_tier":     1,
            "platform":      "Zomato",
            "risk":          "high",
            "risk_multiplier": 1.45,
            "premium":       96,
            "coverage":      1560,
            "coverage_ratio": 0.65,
            "avg_weekly_income":    0,
            "avg_daily_distance":   0,
            "avg_daily_deliveries": 0,
            "kavachScore":    750,
            "policyStatus":  "active",
            "months_active": 8,
            "typical_workdays": [],
            "social_disruption_exposure": "high",
            "past_claims":        4,
            "past_correct_claims":4,
            "total_claims":       4,
            "total_paid":         3744,
            "enrolledAt":    firestore.SERVER_TIMESTAMP,
        },
        {
            "customer_id":   "ZMT-9182736",
            "employee_id":   "BLR-1000005",
            "referral_code": "Sunita-9182736",
            "name":          "Sunita Devi",
            "email":         "sunita@kavachpay.in",
            "phone":         "9871234560",
            "age":           34,
            "city":          "Bangalore",
            "zone":          "HSR Layout",
            "city_tier":     1,
            "platform":      "Zomato",
            "risk":          "low",
            "risk_multiplier": 0.95,
            "premium":       49,
            "coverage":      980,
            "coverage_ratio": 0.65,
            "avg_weekly_income":    0,
            "avg_daily_distance":   0,
            "avg_daily_deliveries": 0,
            "kavachScore":    710,
            "policyStatus":  "paused",
            "months_active": 6,
            "typical_workdays": [],
            "social_disruption_exposure": "low",
            "past_claims":        1,
            "past_correct_claims":1,
            "total_claims":       1,
            "total_paid":         294,
            "enrolledAt":    firestore.SERVER_TIMESTAMP,
        },
        {
            "customer_id":   "SWG-5647382",
            "employee_id":   "BLR-1000002",
            "referral_code": "Karthik-5647382",
            "name":          "Karthik R",
            "email":         "karthik@kavachpay.in",
            "phone":         "9845612370",
            "age":           27,
            "city":          "Bangalore",
            "zone":          "Koramangala",
            "city_tier":     1,
            "platform":      "Swiggy",
            "risk":          "medium",
            "risk_multiplier": 1.10,
            "premium":       59,
            "coverage":      1200,
            "coverage_ratio": 0.65,
            "avg_weekly_income":    0,
            "avg_daily_distance":   0,
            "avg_daily_deliveries": 0,
            "kavachScore":    760,
            "policyStatus":  "active",
            "months_active": 11,
            "typical_workdays": [],
            "social_disruption_exposure": "medium",
            "past_claims":        2,
            "past_correct_claims":2,
            "total_claims":       2,
            "total_paid":         1560,
            "enrolledAt":    firestore.SERVER_TIMESTAMP,
        },
        {
            "customer_id":   "ZMT-6473829",
            "employee_id":   "KOL-3000001",
            "referral_code": "Deepa-6473829",
            "name":          "Deepa Nair",
            "email":         "deepa@kavachpay.in",
            "phone":         "9933445566",
            "age":           28,
            "city":          "Kolkata",
            "zone":          "Salt Lake",
            "city_tier":     1,
            "platform":      "Zomato",
            "risk":          "high",
            "risk_multiplier": 1.35,
            "premium":       74,
            "coverage":      1560,
            "coverage_ratio": 0.65,
            "avg_weekly_income":    0,
            "avg_daily_distance":   0,
            "avg_daily_deliveries": 0,
            "kavachScore":    800,
            "policyStatus":  "active",
            "months_active": 18,
            "typical_workdays": [],
            "social_disruption_exposure": "high",
            "past_claims":        4,
            "past_correct_claims":4,
            "total_claims":       4,
            "total_paid":         3744,
            "enrolledAt":    firestore.SERVER_TIMESTAMP,
        },
        {
            "customer_id":   "SWG-7364829",
            "employee_id":   "MUM-1000003",
            "referral_code": "Suresh-7364829",
            "name":          "Suresh Patil",
            "email":         "suresh@kavachpay.in",
            "phone":         "9876001234",
            "age":           35,
            "city":          "Mumbai",
            "zone":          "Dharavi",
            "city_tier":     1,
            "platform":      "Swiggy",
            "risk":          "high",
            "risk_multiplier": 1.50,
            "premium":       74,
            "coverage":      1560,
            "coverage_ratio": 0.65,
            "avg_weekly_income":    0,
            "avg_daily_distance":   0,
            "avg_daily_deliveries": 0,
            "kavachScore":    690,
            "policyStatus":  "flagged",
            "months_active": 5,
            "typical_workdays": [],
            "social_disruption_exposure": "high",
            "past_claims":        6,
            "past_correct_claims":2,
            "total_claims":       6,
            "total_paid":         0,
            "enrolledAt":    firestore.SERVER_TIMESTAMP,
        },
        {
            "customer_id":   "ZMT-8374651",
            "employee_id":   "KOL-3000002",
            "referral_code": "Mithun-8374651",
            "name":          "Mithun Roy",
            "email":         "mithun@kavachpay.in",
            "phone":         "9812345670",
            "age":           30,
            "city":          "Kolkata",
            "zone":          "Salt Lake",
            "city_tier":     1,
            "platform":      "Zomato",
            "risk":          "high",
            "risk_multiplier": 1.30,
            "premium":       74,
            "coverage":      1560,
            "coverage_ratio": 0.65,
            "avg_weekly_income":    0,
            "avg_daily_distance":   0,
            "avg_daily_deliveries": 0,
            "kavachScore":    810,
            "policyStatus":  "active",
            "months_active": 20,
            "typical_workdays": [],
            "social_disruption_exposure": "high",
            "past_claims":        3,
            "past_correct_claims":3,
            "total_claims":       3,
            "total_paid":         2808,
            "enrolledAt":    firestore.SERVER_TIMESTAMP,
        },
    ]

    # Write initial docs (stats will be patched after orders)
    for w in workers:
        cid = w.pop("customer_id")
        db.collection("workers").document(cid).set({"customer_id": cid, **w})
        print(f"   ✅ {w['name']:20s} | {cid} | emp: {w['employee_id']} | {w['city']}-{w['zone']}")

    # Re-add customer_id for order generation
    for w in workers:
        if "customer_id" not in w:
            pass
    # Rebuild with customer_id
    return {
        "SWG-2847361": workers[0],
        "ZMT-1928374": workers[1],
        "ZMT-3746251": workers[2],
        "ZMT-9182736": workers[3],
        "SWG-5647382": workers[4],
        "ZMT-6473829": workers[5],
        "SWG-7364829": workers[6],
        "ZMT-8374651": workers[7],
    }


# ─────────────────────────────────────────────────────────────
# 2. ORDER TABLES — orders_week_a / b / c / d
#    Each collection = one week of orders for all workers.
#    Document ID = order_id
#    Columns: order_id, employee_id, order_date, amount_paid,
#             pickup_zone, drop_zone, distance, week
# ─────────────────────────────────────────────────────────────
def seed_orders(db, workers_map):
    print("\n📦 Seeding order tables...")

    # customer_id needed for generation; add it back
    customer_ids = list(workers_map.keys())
    collection_names = {
        "A": "orders_week_a",
        "B": "orders_week_b",
        "C": "orders_week_c",
        "D": "orders_week_d",
    }

    # Store all orders per worker for stats computation
    all_orders_per_worker = {cid: {label: [] for label in WEEK_LABELS} for cid in customer_ids}

    for label, offset in zip(WEEK_LABELS, WEEK_OFFSETS):
        coll_name = collection_names[label]
        print(f"\n   Week {label} → {coll_name}")
        batch_count = 0

        for cid in customer_ids:
            worker = workers_map[cid]
            orders = generate_orders(cid, worker, label, offset)
            all_orders_per_worker[cid][label] = orders

            for order in orders:
                db.collection(coll_name).document(order["order_id"]).set(order)
                batch_count += 1

        print(f"   ✅ {batch_count} orders written to {coll_name}")

    return all_orders_per_worker


# ─────────────────────────────────────────────────────────────
# 3. COMPUTE STATS AND PATCH WORKERS
#    After orders are written, calculate avg stats and update
#    each worker document with computed values.
# ─────────────────────────────────────────────────────────────
def patch_worker_stats(db, workers_map, all_orders_per_worker):
    print("\n📊 Computing stats and patching worker documents...")

    for cid, worker in workers_map.items():
        all_weeks_orders = [all_orders_per_worker[cid][label] for label in WEEK_LABELS]
        all_flat = [o for week in all_weeks_orders for o in week]

        stats   = compute_stats(all_weeks_orders)
        typical = derive_workdays(all_flat)

        db.collection("workers").document(cid).update({
            "avg_weekly_income":    stats["avg_weekly_income"],
            "avg_daily_distance":   stats["avg_daily_distance"],
            "avg_daily_deliveries": stats["avg_daily_deliveries"],
            "typical_workdays":     typical,
        })
        print(f"   ✅ {worker['name']:20s} | income: ₹{stats['avg_weekly_income']:,.0f}/wk | dist: {stats['avg_daily_distance']:.1f}km/day | deliveries: {stats['avg_daily_deliveries']:.1f}/day | workdays: {','.join(typical)}")


# ─────────────────────────────────────────────────────────────
# 4. CLAIMS
# ─────────────────────────────────────────────────────────────
def seed_claims(db):
    print("\n📋 Seeding claims...")
    now = datetime.utcnow()

    claims = [
        {"claim_id": "RAI-001", "customer_id": "SWG-2847361", "employee_id": "BLR-1000001", "disruption_event_id": "EVT-RAI-002", "city": "Bangalore", "zone": "Koramangala", "category": "RAI", "severity": "Moderate", "status": "paid",     "payout_amount": 780,  "txn_id": "PAY-SWG2847361-001", "layers_passed": 5, "distance": 0.0, "fraud_flag": False, "fraud_reason": "",   "flag_count": 0, "auto_approve": True,  "fraud_decision": "clean",   "created_at": now - timedelta(days=5)},
        {"claim_id": "AQI-001", "customer_id": "ZMT-1928374", "employee_id": "CHN-2000001", "disruption_event_id": "EVT-AQI-001", "city": "Mumbai",     "zone": "Dharavi",     "category": "AQI", "severity": "Moderate", "status": "paid",     "payout_amount": 1014, "txn_id": "PAY-ZMT1928374-001", "layers_passed": 5, "distance": 0.0, "fraud_flag": False, "fraud_reason": "",   "flag_count": 0, "auto_approve": True,  "fraud_decision": "clean",   "created_at": now - timedelta(hours=6)},
        {"claim_id": "FLD-001", "customer_id": "ZMT-6473829", "employee_id": "KOL-3000001", "disruption_event_id": "EVT-FLD-001", "city": "Kolkata",    "zone": "Salt Lake",   "category": "FLD", "severity": "Severe",   "status": "paid",     "payout_amount": 1560, "txn_id": "PAY-ZMT6473829-001", "layers_passed": 5, "distance": 0.0, "fraud_flag": False, "fraud_reason": "",   "flag_count": 0, "auto_approve": True,  "fraud_decision": "clean",   "created_at": now - timedelta(days=1)},
        {"claim_id": "RAI-002", "customer_id": "SWG-7364829", "employee_id": "MUM-1000003", "disruption_event_id": "EVT-RAI-001", "city": "Chennai",    "zone": "Adyar",       "category": "RAI", "severity": "Moderate", "status": "rejected", "payout_amount": 0,    "txn_id": "",                   "layers_passed": 1, "distance":12.4, "fraud_flag": True,  "fraud_reason": "Active deliveries detected during disruption window", "flag_count": 3, "auto_approve": False, "fraud_decision": "flagged", "created_at": now - timedelta(hours=2)},
    ]

    for c in claims:
        db.collection("claims").document(c["claim_id"]).set(c)
        print(f"   ✅ {c['claim_id']} | {c['customer_id']} | {c['status']:8s} | fraud: {c['fraud_flag']}")

    return [c["claim_id"] for c in claims]


# ─────────────────────────────────────────────────────────────
# 5. PAYMENTS
# ─────────────────────────────────────────────────────────────
def seed_payments(db, claim_ids):
    print("\n💸 Seeding payments...")
    now = datetime.utcnow()

    payments = [
        {"customer_id": "SWG-2847361", "employee_id": "BLR-1000001", "claim_id": "RAI-001", "amount": 780,  "type": "payout",  "method": "upi", "txn_id": "PAY-SWG2847361-001", "status": "success", "created_at": now - timedelta(days=5)},
        {"customer_id": "ZMT-1928374", "employee_id": "CHN-2000001", "claim_id": "AQI-001", "amount": 1014, "type": "payout",  "method": "upi", "txn_id": "PAY-ZMT1928374-001", "status": "success", "created_at": now - timedelta(hours=6)},
        {"customer_id": "ZMT-6473829", "employee_id": "KOL-3000001", "claim_id": "FLD-001", "amount": 1560, "type": "payout",  "method": "upi", "txn_id": "PAY-ZMT6473829-001", "status": "success", "created_at": now - timedelta(days=1)},
        {"customer_id": "SWG-2847361", "employee_id": "BLR-1000001", "claim_id": "",         "amount": 59,   "type": "premium", "method": "upi", "txn_id": "PAY-SWG2847361-002", "status": "success", "created_at": now - timedelta(days=7)},
        {"customer_id": "ZMT-1928374", "employee_id": "CHN-2000001", "claim_id": "",         "amount": 74,   "type": "premium", "method": "upi", "txn_id": "PAY-ZMT1928374-002", "status": "success", "created_at": now - timedelta(days=7)},
        {"customer_id": "ZMT-3746251", "employee_id": "MUM-1000004", "claim_id": "",         "amount": 96,   "type": "premium", "method": "upi", "txn_id": "PAY-ZMT3746251-001", "status": "success", "created_at": now - timedelta(days=7)},
        {"customer_id": "SWG-5647382", "employee_id": "BLR-1000002", "claim_id": "",         "amount": 59,   "type": "premium", "method": "upi", "txn_id": "PAY-SWG5647382-001", "status": "success", "created_at": now - timedelta(days=7)},
        {"customer_id": "ZMT-6473829", "employee_id": "KOL-3000001", "claim_id": "",         "amount": 74,   "type": "premium", "method": "upi", "txn_id": "PAY-ZMT6473829-002", "status": "success", "created_at": now - timedelta(days=7)},
        {"customer_id": "SWG-7364829", "employee_id": "MUM-1000003", "claim_id": "",         "amount": 74,   "type": "premium", "method": "upi", "txn_id": "PAY-SWG7364829-001", "status": "success", "created_at": now - timedelta(days=7)},
        {"customer_id": "ZMT-8374651", "employee_id": "KOL-3000002", "claim_id": "",         "amount": 74,   "type": "premium", "method": "upi", "txn_id": "PAY-ZMT8374651-001", "status": "success", "created_at": now - timedelta(days=7)},
    ]

    for p in payments:
        db.collection("payments").add(p)
        print(f"   ✅ {p['customer_id']} | ₹{p['amount']:>5} | {p['type']:7s} | {p['txn_id']}")

    print(f"   → {len(payments)} payments seeded")


# ─────────────────────────────────────────────────────────────
# 6. DISRUPTION EVENTS
# ─────────────────────────────────────────────────────────────
def seed_disruption_events(db):
    print("\n⚡ Seeding disruption_events...")
    now = datetime.utcnow()

    events = [
        {"event_id": "EVT-RAI-001", "category": "RAI", "severity": "Moderate", "city": "Chennai",   "zone": "Adyar",       "event_label": "Heavy Rain — 82mm",   "time_label": "2:14 PM Today",        "rainfall_mm": 82.0, "aqi_value": None, "wind_kmh": 18.4, "weather_source": "OpenWeatherMap", "aqi_source": None, "api_timestamp": now - timedelta(hours=2),             "affected_workers": 47, "paid_workers": 28, "blocked_workers": 19, "total_paid_out": 8200,  "payout_pct": 0.65, "status": "processed", "triggered_at": now - timedelta(hours=3),          "resolved_at": now - timedelta(hours=2, minutes=30)},
        {"event_id": "EVT-AQI-001", "category": "AQI", "severity": "Moderate", "city": "Mumbai",    "zone": "Dharavi",     "event_label": "AQI Alert — 347",     "time_label": "10:32 AM Today",       "rainfall_mm": None, "aqi_value": 347,  "wind_kmh": None, "weather_source": None,             "aqi_source": "WAQI", "api_timestamp": now - timedelta(hours=6),            "affected_workers": 63, "paid_workers": 35, "blocked_workers": 28, "total_paid_out": 11400, "payout_pct": 0.65, "status": "processed", "triggered_at": now - timedelta(hours=7),          "resolved_at": now - timedelta(hours=6, minutes=15)},
        {"event_id": "EVT-FLD-001", "category": "FLD", "severity": "Severe",   "city": "Kolkata",   "zone": "Salt Lake",   "event_label": "Flood Alert — NDMA",  "time_label": "Yesterday 4:15 PM",    "rainfall_mm": None, "aqi_value": None, "wind_kmh": None, "weather_source": "NDMA",           "aqi_source": None, "api_timestamp": now - timedelta(days=1, hours=8),    "affected_workers": 41, "paid_workers": 31, "blocked_workers": 10, "total_paid_out": 6200,  "payout_pct": 1.00, "status": "processed", "triggered_at": now - timedelta(days=1, hours=8),  "resolved_at": now - timedelta(days=1, hours=7)},
        {"event_id": "EVT-RAI-002", "category": "RAI", "severity": "Moderate", "city": "Bangalore", "zone": "Koramangala", "event_label": "Heavy Rain — 78mm",   "time_label": "Mar 5, 2:10 PM",       "rainfall_mm": 78.4, "aqi_value": None, "wind_kmh": 22.1, "weather_source": "OpenWeatherMap", "aqi_source": None, "api_timestamp": now - timedelta(days=5, hours=2),    "affected_workers": 58, "paid_workers": 32, "blocked_workers": 26, "total_paid_out": 6800,  "payout_pct": 0.65, "status": "processed", "triggered_at": now - timedelta(days=5),           "resolved_at": now - timedelta(days=5, minutes=-30)},
    ]

    for e in events:
        db.collection("disruption_events").document(e["event_id"]).set(e)
        print(f"   ✅ {e['event_id']} | {e['city']}-{e['zone']} | {e['severity']}")


# ─────────────────────────────────────────────────────────────
# 7. FINANCIAL SNAPSHOTS
# ─────────────────────────────────────────────────────────────
def seed_financial_snapshots(db):
    print("\n📈 Seeding financial_snapshots...")
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
        db.collection("financial_snapshots").document(s["week"].replace(" ", "_")).set(s)
    print(f"   ✅ {len(snapshots)} weekly snapshots seeded")


# ─────────────────────────────────────────────────────────────
# 8. FINANCIALS (admin-only)
# ─────────────────────────────────────────────────────────────
def seed_financials(db):
    print("\n🔒 Seeding financials (admin-only)...")
    now = datetime.utcnow()
    db.collection("financials").document("current_week").set({
        "doc_type": "weekly_pnl", "week_label": "W2 Mar",
        "week_start": now - timedelta(days=7), "week_end": now,
        "total_premiums": 84600, "total_payouts": 24800,
        "operational_cost": 4200, "net_profit": 55600, "loss_ratio": 29.3,
        "zone_breakdown": [
            {"zone": "Koramangala", "city": "Bangalore", "workers": 58,  "premiums": 12400, "payouts": 6800,  "loss_ratio": 54.8, "disruptions": 1, "status": "active"},
            {"zone": "Adyar",       "city": "Chennai",   "workers": 47,  "premiums": 14800, "payouts": 8200,  "loss_ratio": 55.4, "disruptions": 2, "status": "disrupted"},
            {"zone": "Dharavi",     "city": "Mumbai",    "workers": 63,  "premiums": 19600, "payouts": 11400, "loss_ratio": 58.2, "disruptions": 3, "status": "disrupted"},
            {"zone": "Salt Lake",   "city": "Kolkata",   "workers": 41,  "premiums": 13200, "payouts": 6200,  "loss_ratio": 47.0, "disruptions": 1, "status": "disrupted"},
            {"zone": "HSR Layout",  "city": "Bangalore", "workers": 52,  "premiums": 10400, "payouts": 0,     "loss_ratio": 0.0,  "disruptions": 0, "status": "safe"},
            {"zone": "Anna Nagar",  "city": "Chennai",   "workers": 38,  "premiums": 8200,  "payouts": 0,     "loss_ratio": 0.0,  "disruptions": 0, "status": "safe"},
        ],
        "fraud_blocked_count": 47, "fraud_savings": 31200, "fraud_rate_pct": 8.2,
        "created_at": firestore.SERVER_TIMESTAMP, "access": "admin_only",
    })
    db.collection("financials").document("break_even_projection").set({
        "doc_type": "break_even",
        "projections": [
            {"workers": "500 (Pilot)", "annual_net": -3490000, "label": "- ₹34.9L/yr", "status": "Burning Capital"},
            {"workers": "5,000",       "annual_net": -820000,  "label": "- ₹8.2L/yr",  "status": "Improving"},
            {"workers": "15,000",      "annual_net": 1140000,  "label": "+ ₹11.4L/yr", "status": "Profitable"},
            {"workers": "50,000",      "annual_net": 9400000,  "label": "+ ₹94L/yr",   "status": "Scaling"},
        ],
        "break_even_workers": 12000, "break_even_months": 18,
        "note": "Achievable via platform partnerships with Swiggy and Zomato",
        "access": "admin_only", "created_at": firestore.SERVER_TIMESTAMP,
    })
    print("   ✅ current_week and break_even_projection seeded")


# ─────────────────────────────────────────────────────────────
# 9. AUDIT LOG
# ─────────────────────────────────────────────────────────────
def seed_audit_log(db):
    print("\n📜 Seeding audit_log...")
    now = datetime.utcnow()
    logs = [
        {"action": "WORKER_ENROLLED",     "actor": "worker", "entity_type": "worker", "entity_id": "SWG-2847361", "customer_id": "SWG-2847361", "employee_id": "BLR-1000001", "detail": "Enrolled. Premium ₹59/week.",  "before": None, "after": {"policyStatus": "active"}, "timestamp": now - timedelta(days=30)},
        {"action": "WORKER_ENROLLED",     "actor": "worker", "entity_type": "worker", "entity_id": "ZMT-1928374", "customer_id": "ZMT-1928374", "employee_id": "CHN-2000001", "detail": "Enrolled. Premium ₹74/week.",  "before": None, "after": {"policyStatus": "active"}, "timestamp": now - timedelta(days=45)},
        {"action": "CLAIM_CREATED",       "actor": "system", "entity_type": "claim",  "entity_id": "RAI-001",     "customer_id": "SWG-2847361", "employee_id": "BLR-1000001", "detail": "Claim RAI-001 created.",       "before": None, "after": {"status": "pending"},      "timestamp": now - timedelta(days=5, minutes=2)},
        {"action": "PAYOUT_TRIGGERED",    "actor": "system", "entity_type": "claim",  "entity_id": "RAI-001",     "customer_id": "SWG-2847361", "employee_id": "BLR-1000001", "detail": "₹780 UPI. PAY-SWG2847361-001.","before": {"status": "pending"}, "after": {"status": "paid"}, "timestamp": now - timedelta(days=5)},
        {"action": "FRAUD_FLAGGED",       "actor": "system", "entity_type": "claim",  "entity_id": "RAI-002",     "customer_id": "SWG-7364829", "employee_id": "MUM-1000003", "detail": "Layer 2 fail. Distance 12.4km.","before": {"fraud_flag": False}, "after": {"fraud_flag": True, "flag_count": 3}, "timestamp": now - timedelta(hours=2)},
        {"action": "KAVACHSCORE_UPDATED", "actor": "system", "entity_type": "worker", "entity_id": "SWG-2847361", "customer_id": "SWG-2847361", "employee_id": "BLR-1000001", "detail": "Legitimate claim +10.",        "before": {"kavachScore": 770}, "after": {"kavachScore": 780}, "timestamp": now - timedelta(days=5)},
        {"action": "STATS_REFRESHED",     "actor": "system", "entity_type": "worker", "entity_id": "SWG-2847361", "customer_id": "SWG-2847361", "employee_id": "BLR-1000001", "detail": "Weekly stats updated from platform API.", "before": None, "after": {"avg_weekly_income": "computed"}, "timestamp": now - timedelta(hours=1)},
    ]
    for log in logs:
        db.collection("audit_log").add(log)
    print(f"   ✅ {len(logs)} audit entries written")


# ─────────────────────────────────────────────────────────────
# MAIN
# ─────────────────────────────────────────────────────────────
def main():
    print("=" * 65)
    print("   KavachPay — Firestore Seed Script v6")
    print("=" * 65)
    print()

    init_firebase()
    db = firestore.client()

    workers_map = seed_workers(db)
    all_orders  = seed_orders(db, workers_map)
    patch_worker_stats(db, workers_map, all_orders)
    seed_claims(db)
    seed_payments(db, [])
    seed_disruption_events(db)
    seed_financial_snapshots(db)
    seed_financials(db)
    seed_audit_log(db)

    print("\n" + "=" * 65)
    print("✅ DONE — 10 collections seeded.")
    print()
    print("   Collection             Purpose")
    print("   ─────────────────────────────────────────────────")
    print("   workers                8 docs — keyed by customer_id")
    print("   orders_week_a          ~50 orders, most recent week")
    print("   orders_week_b          ~50 orders, last week")
    print("   orders_week_c          ~50 orders, 2 weeks ago")
    print("   orders_week_d          ~50 orders, 3 weeks ago")
    print("   claims                 4 docs — keyed by claim_id")
    print("   payments               10 docs — auto ID")
    print("   disruption_events      4 docs — keyed by event_id")
    print("   financial_snapshots    10 weekly P&L rows")
    print("   financials             2 admin-only docs")
    print("   audit_log              7 append-only entries")
    print()
    print("   Test credentials")
    print("   ─────────────────────────────────────────────────")
    print("   Login: phone=9876543210  employee_id=BLR-1000001  (Ravi)")
    print("   Login: phone=9123456780  employee_id=CHN-2000001  (Priya)")
    print("   Admin: admin@kavachpay.in / admin123")
    print("=" * 65)


if __name__ == "__main__":
    main()
