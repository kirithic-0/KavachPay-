"""
KavachPay — Mock Platform API
==============================
Simulates Swiggy and Zomato partner APIs.
Run separately on port 5001:  python mock_platform_api.py

Provides:
  POST /platform/verify           → login verification
  GET  /platform/orders/<emp_id>  → all orders for a worker
  GET  /platform/workdays/<emp_id>→ typical workdays derived from order history
  GET  /platform/worker/<emp_id>  → full worker profile from platform
"""

from flask import Flask, jsonify, request
from flask_cors import CORS
from datetime import datetime, timedelta
import random
import hashlib

app = Flask(__name__)
CORS(app)

# ─────────────────────────────────────────────────────────────
# CITY CODES — 3-letter prefix for employeeID
# ─────────────────────────────────────────────────────────────
CITY_CODES = {
    "Bangalore":  "BLR",
    "Chennai":    "CHN",
    "Mumbai":     "MUM",
    "Kolkata":    "KOL",
    "Hyderabad":  "HYD",
    "Delhi":      "DEL",
    "Pune":       "PUN",
    "Ahmedabad":  "AMD",
    "Jaipur":     "JAI",
    "Surat":      "SRT",
}

# ─────────────────────────────────────────────────────────────
# MOCK WORKER DATABASE
# These are the workers registered on the platform (Swiggy/Zomato).
# customer_id  = platform-assigned, used as Firestore doc ID
# employee_id  = city_code (3 letters) + hyphen + 7-digit number
# referral_code= firstname + numeric part of customer_id
# ─────────────────────────────────────────────────────────────
MOCK_WORKERS = {
    # Swiggy workers
    "SWG-2847361": {
        "customer_id":   "SWG-2847361",
        "employee_id":   "BLR-1000001",
        "name":          "Ravi Kumar",
        "phone":         "9876543210",
        "email":         "ravi@kavachpay.in",
        "platform":      "Swiggy",
        "city":          "Bangalore",
        "zone":          "Koramangala",
        "referral_code": "Ravi-2847361",
        "joined_date":   "2024-01-15",
        "active":        True,
    },
    "SWG-5647382": {
        "customer_id":   "SWG-5647382",
        "employee_id":   "BLR-1000002",
        "name":          "Karthik R",
        "phone":         "9845612370",
        "email":         "karthik@kavachpay.in",
        "platform":      "Swiggy",
        "city":          "Bangalore",
        "zone":          "Koramangala",
        "referral_code": "Karthik-5647382",
        "joined_date":   "2024-03-10",
        "active":        True,
    },
    "SWG-7364829": {
        "customer_id":   "SWG-7364829",
        "employee_id":   "MUM-1000003",
        "name":          "Suresh Patil",
        "phone":         "9876001234",
        "email":         "suresh@kavachpay.in",
        "platform":      "Swiggy",
        "city":          "Mumbai",
        "zone":          "Dharavi",
        "referral_code": "Suresh-7364829",
        "joined_date":   "2024-07-22",
        "active":        True,
    },
    # Zomato workers
    "ZMT-1928374": {
        "customer_id":   "ZMT-1928374",
        "employee_id":   "CHN-2000001",
        "name":          "Priya Singh",
        "phone":         "9123456780",
        "email":         "priya@kavachpay.in",
        "platform":      "Zomato",
        "city":          "Chennai",
        "zone":          "Adyar",
        "referral_code": "Priya-1928374",
        "joined_date":   "2023-11-05",
        "active":        True,
    },
    "ZMT-6473829": {
        "customer_id":   "ZMT-6473829",
        "employee_id":   "KOL-3000001",
        "name":          "Deepa Nair",
        "phone":         "9933445566",
        "email":         "deepa@kavachpay.in",
        "platform":      "Zomato",
        "city":          "Kolkata",
        "zone":          "Salt Lake",
        "referral_code": "Deepa-6473829",
        "joined_date":   "2023-09-18",
        "active":        True,
    },
    "ZMT-8374651": {
        "customer_id":   "ZMT-8374651",
        "employee_id":   "KOL-3000002",
        "name":          "Mithun Roy",
        "phone":         "9812345670",
        "email":         "mithun@kavachpay.in",
        "platform":      "Zomato",
        "city":          "Kolkata",
        "zone":          "Salt Lake",
        "referral_code": "Mithun-8374651",
        "joined_date":   "2023-12-01",
        "active":        True,
    },
    "ZMT-3746251": {
        "customer_id":   "ZMT-3746251",
        "employee_id":   "MUM-1000004",
        "name":          "Mohammed Arif",
        "phone":         "9988776655",
        "email":         "mohammed@kavachpay.in",
        "platform":      "Zomato",
        "city":          "Mumbai",
        "zone":          "Dharavi",
        "referral_code": "Mohammed-3746251",
        "joined_date":   "2024-05-30",
        "active":        True,
    },
    "ZMT-9182736": {
        "customer_id":   "ZMT-9182736",
        "employee_id":   "BLR-1000005",
        "name":          "Sunita Devi",
        "phone":         "9871234560",
        "email":         "sunita@kavachpay.in",
        "platform":      "Zomato",
        "city":          "Bangalore",
        "zone":          "HSR Layout",
        "referral_code": "Sunita-9182736",
        "joined_date":   "2024-02-14",
        "active":        True,
    },
}

# Build reverse lookup: employee_id → customer_id
EMPLOYEE_TO_CUSTOMER = {v["employee_id"]: k for k, v in MOCK_WORKERS.items()}

# ─────────────────────────────────────────────────────────────
# ZONE COORDINATES — for distance calculation
# ─────────────────────────────────────────────────────────────
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
    "Powai":        (19.1176, 72.9060),
    "Andheri":      (19.1136, 72.8697),
    "Nungambakkam": (13.0569, 80.2425),
    "Velachery":    (12.9815, 80.2180),
    "Garia":        (22.4627, 88.3950),
    "Dum Dum":      (22.6500, 88.4200),
}

ZONES_BY_CITY = {
    "Bangalore": ["Koramangala", "HSR Layout", "Whitefield", "Indiranagar"],
    "Chennai":   ["Adyar", "Anna Nagar", "T Nagar", "Nungambakkam", "Velachery"],
    "Mumbai":    ["Dharavi", "Bandra", "Powai", "Andheri"],
    "Kolkata":   ["Salt Lake", "Garia", "Dum Dum"],
}


def haversine_km(lat1, lon1, lat2, lon2):
    """Distance between two lat/lon points in km."""
    from math import radians, sin, cos, sqrt, atan2
    R = 6371
    dlat = radians(lat2 - lat1)
    dlon = radians(lon2 - lon1)
    a = sin(dlat/2)**2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon/2)**2
    return round(R * 2 * atan2(sqrt(a), sqrt(1-a)), 2)


def zone_distance(z1, z2):
    """Return km distance between two zones. Fallback to random if unknown."""
    if z1 in ZONE_COORDS and z2 in ZONE_COORDS:
        c1, c2 = ZONE_COORDS[z1], ZONE_COORDS[z2]
        return haversine_km(c1[0], c1[1], c2[0], c2[1])
    return round(random.uniform(3.0, 18.0), 2)


def seeded_random(seed_str, lo, hi, decimal=2):
    """Deterministic random from a string seed — same input always gives same output."""
    h = int(hashlib.md5(seed_str.encode()).hexdigest(), 16)
    val = lo + (h % 10000) / 10000 * (hi - lo)
    return round(val, decimal)


# ─────────────────────────────────────────────────────────────
# ORDER GENERATION
# Generates realistic weekly orders for a worker.
# Week A = most recent, B = last week, C = 2 weeks ago, D = 3 weeks ago
# Orders are deterministic per worker so the same call always
# returns the same data (important for frontend consistency).
# ─────────────────────────────────────────────────────────────
WEEK_LABELS  = ["A", "B", "C", "D"]
WEEK_OFFSETS = [0, 7, 14, 21]   # days ago from today

DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]


def generate_orders_for_worker(customer_id, week_label, week_offset_days):
    """
    Generate deterministic orders for one worker for one week.
    Returns list of order dicts.
    """
    worker = MOCK_WORKERS[customer_id]
    city   = worker["city"]
    zones  = ZONES_BY_CITY.get(city, ["Koramangala"])
    home_zone = worker["zone"]

    # Seed based on worker + week so output is always consistent
    seed_base = f"{customer_id}-{week_label}"

    # Decide which days this worker worked this week (5–7 days)
    num_workdays = 5 + (int(hashlib.md5(seed_base.encode()).hexdigest(), 16) % 3)
    all_days = list(range(7))
    random.seed(int(hashlib.md5(seed_base.encode()).hexdigest(), 16))
    workdays = sorted(random.sample(all_days, min(num_workdays, 7)))

    orders = []
    order_counter = 1

    week_start = datetime.utcnow() - timedelta(days=week_offset_days + 6)

    for day_offset in workdays:
        order_date = (week_start + timedelta(days=day_offset)).strftime("%Y-%m-%d")

        # 4–9 orders per working day
        day_seed = f"{seed_base}-{day_offset}"
        num_orders = 4 + (int(hashlib.md5(day_seed.encode()).hexdigest(), 16) % 6)

        for i in range(num_orders):
            order_seed = f"{day_seed}-{i}"

            # Pickup usually near home zone, drop anywhere in same city
            pickup_zone = home_zone
            drop_zone   = zones[int(hashlib.md5((order_seed+"d").encode()).hexdigest(), 16) % len(zones)]

            dist = zone_distance(pickup_zone, drop_zone)
            # Amount: base ₹40 + ₹8/km + small random bonus
            amount = round(40 + dist * 8 + seeded_random(order_seed+"a", 0, 30, 0))

            # order_id: platform prefix + week + day + sequence
            platform_prefix = "SWG" if worker["platform"] == "Swiggy" else "ZMT"
            order_id = f"{platform_prefix}-W{week_label}-{customer_id[-7:]}-{str(order_counter).zfill(3)}"

            orders.append({
                "order_id":    order_id,
                "employee_id": worker["employee_id"],
                "customer_id": customer_id,
                "order_date":  order_date,
                "amount_paid": amount,
                "pickup_zone": pickup_zone,
                "drop_zone":   drop_zone,
                "distance":    dist,
                "platform":    worker["platform"],
                "week":        week_label,
            })
            order_counter += 1

    return orders


def derive_typical_workdays(all_orders):
    """
    From order history across all 4 weeks, compute which days
    the worker typically works (days they worked ≥ 3 out of 4 weeks).
    """
    from collections import Counter
    day_counter = Counter()

    for order in all_orders:
        try:
            dt = datetime.strptime(order["order_date"], "%Y-%m-%d")
            day_name = DAY_NAMES[dt.weekday()]
            day_counter[day_name] += 1
        except Exception:
            pass

    # A day is "typical" if worked ≥ 3 out of 4 weeks
    # We see multiple orders per day so group by (week, day) first
    week_day_set = set()
    for order in all_orders:
        try:
            dt = datetime.strptime(order["order_date"], "%Y-%m-%d")
            day_name = DAY_NAMES[dt.weekday()]
            week_day_set.add((order["week"], day_name))
        except Exception:
            pass

    day_week_counts = Counter(day for _, day in week_day_set)
    typical = [day for day in DAY_NAMES if day_week_counts.get(day, 0) >= 3]
    return typical


# ─────────────────────────────────────────────────────────────
# ROUTES
# ─────────────────────────────────────────────────────────────

@app.route("/api/health")
def health():
    return jsonify({"status": "Mock Platform API running", "port": 5001}), 200


# ── 1. Login verification ─────────────────────────────────────
@app.route("/platform/verify", methods=["POST"])
def verify_worker():
    """
    Verifies a worker's login credentials against platform records.
    Body: { "phone": "9876543210", "employee_id": "BLR-1000001" }
    Returns worker profile if verified, 401 if not found.
    """
    data = request.get_json()
    phone       = data.get("phone", "").strip()
    employee_id = data.get("employee_id", "").strip()

    if not phone or not employee_id:
        return jsonify({"verified": False, "error": "phone and employee_id are required"}), 400

    # Look up by employee_id
    customer_id = EMPLOYEE_TO_CUSTOMER.get(employee_id)
    if not customer_id:
        return jsonify({"verified": False, "error": "employee_id not found in platform records"}), 404

    worker = MOCK_WORKERS[customer_id]

    # Verify phone matches
    if worker["phone"] != phone:
        return jsonify({"verified": False, "error": "phone number does not match platform records"}), 401

    if not worker["active"]:
        return jsonify({"verified": False, "error": "worker account is inactive on platform"}), 403

    return jsonify({
        "verified":      True,
        "customer_id":   worker["customer_id"],
        "employee_id":   worker["employee_id"],
        "name":          worker["name"],
        "phone":         worker["phone"],
        "email":         worker["email"],
        "platform":      worker["platform"],
        "city":          worker["city"],
        "zone":          worker["zone"],
        "referral_code": worker["referral_code"],
        "joined_date":   worker["joined_date"],
    }), 200


# ── 2. Fetch all orders for a worker ─────────────────────────
@app.route("/platform/orders/<employee_id>", methods=["GET"])
def get_orders(employee_id):
    """
    Returns all orders for a worker across all 4 weeks (A, B, C, D).
    Optionally filter by week: ?week=A
    """
    customer_id = EMPLOYEE_TO_CUSTOMER.get(employee_id)
    if not customer_id:
        return jsonify({"error": "employee_id not found"}), 404

    week_filter = request.args.get("week", None)

    all_orders = []
    for label, offset in zip(WEEK_LABELS, WEEK_OFFSETS):
        if week_filter and label != week_filter.upper():
            continue
        orders = generate_orders_for_worker(customer_id, label, offset)
        all_orders.extend(orders)

    return jsonify({
        "employee_id": employee_id,
        "customer_id": customer_id,
        "total_orders": len(all_orders),
        "orders": all_orders,
    }), 200


# ── 3. Fetch typical workdays ─────────────────────────────────
@app.route("/platform/workdays/<employee_id>", methods=["GET"])
def get_workdays(employee_id):
    """
    Returns typical workdays derived from last 4 weeks of order data.
    A day is 'typical' if the worker had orders on it in ≥ 3 of 4 weeks.
    """
    customer_id = EMPLOYEE_TO_CUSTOMER.get(employee_id)
    if not customer_id:
        return jsonify({"error": "employee_id not found"}), 404

    all_orders = []
    for label, offset in zip(WEEK_LABELS, WEEK_OFFSETS):
        all_orders.extend(generate_orders_for_worker(customer_id, label, offset))

    typical = derive_typical_workdays(all_orders)

    return jsonify({
        "employee_id":    employee_id,
        "typical_workdays": typical,
        "analysis_weeks": 4,
    }), 200


# ── 4. Full worker profile from platform ─────────────────────
@app.route("/platform/worker/<employee_id>", methods=["GET"])
def get_platform_worker(employee_id):
    """
    Returns full worker profile as stored on the platform.
    Used during KavachPay signup to pre-fill worker details.
    """
    customer_id = EMPLOYEE_TO_CUSTOMER.get(employee_id)
    if not customer_id:
        return jsonify({"error": "employee_id not found"}), 404

    worker = MOCK_WORKERS[customer_id]
    return jsonify(worker), 200


# ── 5. Compute weekly stats for a worker ─────────────────────
@app.route("/platform/stats/<employee_id>", methods=["GET"])
def get_worker_stats(employee_id):
    """
    Computes aggregated stats from order data:
    - avg_weekly_income
    - avg_daily_deliveries
    - avg_daily_distance
    These are stored back into the workers Firestore document.
    """
    customer_id = EMPLOYEE_TO_CUSTOMER.get(employee_id)
    if not customer_id:
        return jsonify({"error": "employee_id not found"}), 404

    weekly_incomes   = []
    weekly_distances = []
    weekly_deliveries = []

    for label, offset in zip(WEEK_LABELS, WEEK_OFFSETS):
        orders = generate_orders_for_worker(customer_id, label, offset)
        if not orders:
            continue

        week_income   = sum(o["amount_paid"] for o in orders)
        week_distance = sum(o["distance"]    for o in orders)
        week_days     = len(set(o["order_date"] for o in orders))
        week_orders   = len(orders)

        weekly_incomes.append(week_income)
        weekly_distances.append(week_distance / week_days if week_days else 0)
        weekly_deliveries.append(week_orders  / week_days if week_days else 0)

    avg_weekly_income     = round(sum(weekly_incomes)    / len(weekly_incomes),    2) if weekly_incomes   else 0
    avg_daily_distance    = round(sum(weekly_distances)  / len(weekly_distances),  2) if weekly_distances else 0
    avg_daily_deliveries  = round(sum(weekly_deliveries) / len(weekly_deliveries), 2) if weekly_deliveries else 0

    # Also get typical workdays
    all_orders = []
    for label, offset in zip(WEEK_LABELS, WEEK_OFFSETS):
        all_orders.extend(generate_orders_for_worker(customer_id, label, offset))
    typical_workdays = derive_typical_workdays(all_orders)

    return jsonify({
        "employee_id":         employee_id,
        "avg_weekly_income":   avg_weekly_income,
        "avg_daily_distance":  avg_daily_distance,
        "avg_daily_deliveries":avg_daily_deliveries,
        "typical_workdays":    typical_workdays,
        "weeks_analysed":      len(weekly_incomes),
    }), 200


if __name__ == "__main__":
    print("=" * 50)
    print("  KavachPay Mock Platform API")
    print("  Running on http://localhost:5001")
    print("=" * 50)
    app.run(debug=True, port=5001)
