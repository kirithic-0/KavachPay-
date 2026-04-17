"""
seed_50_workers.py
─────────────────────────────────────────────────────────────────────────────
Seeds 50 workers + all supporting collections that the Admin Dashboard reads:
  - workers (50 docs)          → /workers/{uid}
  - claims  (subcollection)    → /workers/{uid}/claims/{claimId}
  - notifications (subcoll.)   → /workers/{uid}/notifications/{notifId}
  - payments                   → /payments/{payId}
  - financial_snapshots        → /financial_snapshots/{weekId}   (8 weeks)
  - financials/current_week    → /financials/current_week
  - disruptions                → /disruptions/{disruptionId}

Schema strictly follows backend/firestore-schema.json.
Routes read by AdminDashboard.js:
  GET /api/admin/overview
  GET /api/admin/zones
  GET /api/admin/workers
  GET /api/admin/disruptions
  GET /api/admin/analytics
─────────────────────────────────────────────────────────────────────────────
Run from backend/ dir:
    python seed_50_workers.py
"""

import sys, uuid, random
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
from datetime import datetime, timedelta, timezone
import firebase_admin
from firebase_admin import credentials, firestore, auth

# ─── CONFIG ──────────────────────────────────────────────────────────────────
FIREBASE_CREDENTIALS = "firebase-credentials.json"
DEFAULT_PASSWORD     = "Kavach@2026"     # all seeded users share this password

# ─── MASTER DATA ─────────────────────────────────────────────────────────────

CITY_ZONES = {
    "Bangalore": ["Koramangala", "Indiranagar", "Whitefield", "HSR Layout", "Marathahalli"],
    "Mumbai":    ["Andheri", "Bandra", "Dharavi", "Dadar", "Kurla"],
    "Chennai":   ["Adyar", "Anna Nagar", "T Nagar", "Velachery", "Sholinganallur"],
    "Delhi":     ["Connaught Place", "Lajpat Nagar", "Dwarka", "Rohini", "Saket"],
    "Hyderabad": ["Banjara Hills", "Jubilee Hills", "Madhapur", "Gachibowli", "Kukatpally"],
    "Pune":      ["Koregaon Park", "Kothrud", "Viman Nagar", "Hadapsar", "Wakad"],
}

PLATFORMS   = ["Swiggy", "Zomato"]

DISRUPTION_TYPES = [
    {"code": "HRA", "label": "Heavy Rain",    "color": "#3B82F6"},
    {"code": "MRA", "label": "Moderate Rain", "color": "#60A5FA"},
    {"code": "SAQ", "label": "Severe AQI",    "color": "#F97316"},
    {"code": "STM", "label": "Storm",         "color": "#8B5CF6"},
    {"code": "FLD", "label": "Flood",         "color": "#06B6D4"},
    {"code": "HTV", "label": "Heatwave",      "color": "#DC2626"},
    {"code": "FOG", "label": "Dense Fog",     "color": "#6B7280"},
    {"code": "WND", "label": "High Wind",     "color": "#10B981"},
]

# 50 worker definitions  (name, employee_id, city, zone, platform)
WORKER_DEFINITIONS = [
    # ── Bangalore / Swiggy ──────────────────────────────────────────────────
    ("Ravi Kumar",       "BLR-1000001", "Bangalore", "Koramangala",   "Swiggy"),
    ("Ankit Sharma",     "BLR-1000002", "Bangalore", "Indiranagar",   "Swiggy"),
    ("Suresh Rao",       "BLR-1000003", "Bangalore", "Whitefield",    "Swiggy"),
    ("Deepak Nair",      "BLR-1000004", "Bangalore", "HSR Layout",    "Swiggy"),
    ("Rahul Verma",      "BLR-1000005", "Bangalore", "Marathahalli",  "Swiggy"),
    ("Vijay Reddy",      "BLR-1000006", "Bangalore", "Koramangala",   "Swiggy"),
    ("Kiran Bhat",       "BLR-1000007", "Bangalore", "Indiranagar",   "Swiggy"),
    ("Manoj Pillai",     "BLR-1000008", "Bangalore", "Whitefield",    "Swiggy"),
    # ── Bangalore / Zomato ──────────────────────────────────────────────────
    ("Divya Menon",      "BLR-2000001", "Bangalore", "HSR Layout",    "Zomato"),
    ("Sneha Gupta",      "BLR-2000002", "Bangalore", "Marathahalli",  "Zomato"),
    # ── Mumbai / Swiggy ─────────────────────────────────────────────────────
    ("Mohammed Arif",    "MUM-1000001", "Mumbai",    "Dharavi",       "Swiggy"),
    ("Sachin Patil",     "MUM-1000002", "Mumbai",    "Andheri",       "Swiggy"),
    ("Rohit Desai",      "MUM-1000003", "Mumbai",    "Bandra",        "Swiggy"),
    ("Akash Jadhav",     "MUM-1000004", "Mumbai",    "Dadar",         "Swiggy"),
    ("Vishal Kale",      "MUM-1000005", "Mumbai",    "Kurla",         "Swiggy"),
    # ── Mumbai / Zomato ─────────────────────────────────────────────────────
    ("Swati Shah",       "MUM-2000001", "Mumbai",    "Andheri",       "Zomato"),
    ("Neha Joshi",       "MUM-2000002", "Mumbai",    "Bandra",        "Zomato"),
    ("Priya Mehta",      "MUM-2000003", "Mumbai",    "Dadar",         "Zomato"),
    ("Kavita More",      "MUM-2000004", "Mumbai",    "Dharavi",       "Zomato"),
    ("Aarti Pawar",      "MUM-2000005", "Mumbai",    "Kurla",         "Zomato"),
    # ── Chennai / Swiggy ────────────────────────────────────────────────────
    ("Priya Singh",      "CHN-1000001", "Chennai",   "Adyar",         "Swiggy"),
    ("Arun Kumar",       "CHN-1000002", "Chennai",   "Anna Nagar",    "Swiggy"),
    ("Krishnan Iyer",    "CHN-1000003", "Chennai",   "T Nagar",       "Swiggy"),
    ("Sathish Babu",     "CHN-1000004", "Chennai",   "Velachery",     "Swiggy"),
    ("Vignesh Raj",      "CHN-1000005", "Chennai",   "Sholinganallur","Swiggy"),
    # ── Chennai / Zomato ────────────────────────────────────────────────────
    ("Meena Devi",       "CHN-2000001", "Chennai",   "Adyar",         "Zomato"),
    ("Lakshmi Raman",    "CHN-2000002", "Chennai",   "Anna Nagar",    "Zomato"),
    ("Parvathi Nair",    "CHN-2000003", "Chennai",   "T Nagar",       "Zomato"),
    # ── Delhi / Swiggy ──────────────────────────────────────────────────────
    ("Rajesh Gupta",     "DEL-1000001", "Delhi",     "Connaught Place","Swiggy"),
    ("Pankaj Yadav",     "DEL-1000002", "Delhi",     "Lajpat Nagar",  "Swiggy"),
    ("Amit Tiwari",      "DEL-1000003", "Delhi",     "Dwarka",        "Swiggy"),
    ("Sanjay Mishra",    "DEL-1000004", "Delhi",     "Rohini",        "Swiggy"),
    ("Kapil Sharma",     "DEL-1000005", "Delhi",     "Saket",         "Swiggy"),
    # ── Delhi / Zomato ──────────────────────────────────────────────────────
    ("Pooja Chauhan",    "DEL-2000001", "Delhi",     "Connaught Place","Zomato"),
    ("Sunita Bhatia",    "DEL-2000002", "Delhi",     "Lajpat Nagar",  "Zomato"),
    ("Reena Singh",      "DEL-2000003", "Delhi",     "Dwarka",        "Zomato"),
    ("Ankita Saxena",    "DEL-2000004", "Delhi",     "Rohini",        "Zomato"),
    ("Madhuri Pandey",   "DEL-2000005", "Delhi",     "Saket",         "Zomato"),
    # ── Hyderabad / Swiggy ──────────────────────────────────────────────────
    ("Ramu Naidu",       "HYD-1000001", "Hyderabad", "Banjara Hills", "Swiggy"),
    ("Prasad Rao",       "HYD-1000002", "Hyderabad", "Jubilee Hills", "Swiggy"),
    ("Sunil Reddy",      "HYD-1000003", "Hyderabad", "Madhapur",      "Swiggy"),
    ("Karthik Goud",     "HYD-1000004", "Hyderabad", "Gachibowli",    "Swiggy"),
    # ── Hyderabad / Zomato ──────────────────────────────────────────────────
    ("Pallavi Sharma",   "HYD-2000001", "Hyderabad", "Banjara Hills", "Zomato"),
    ("Swathi Reddy",     "HYD-2000002", "Hyderabad", "Kukatpally",    "Zomato"),
    ("Nandini Rao",      "HYD-2000003", "Hyderabad", "Madhapur",      "Zomato"),
    # ── Pune / Swiggy ───────────────────────────────────────────────────────
    ("Shivam Deshmukh",  "PNE-1000001", "Pune",      "Koregaon Park", "Swiggy"),
    ("Ganesh More",      "PNE-1000002", "Pune",      "Kothrud",       "Swiggy"),
    ("Nitin Kulkarni",   "PNE-1000003", "Pune",      "Viman Nagar",   "Swiggy"),
    # ── Pune / Zomato ───────────────────────────────────────────────────────
    ("Rutuja Jadhav",    "PNE-2000001", "Pune",      "Hadapsar",      "Zomato"),
    ("Tejal Patil",      "PNE-2000002", "Pune",      "Wakad",         "Zomato"),
]

# ─── HELPERS ─────────────────────────────────────────────────────────────────

def init_firebase():
    if not firebase_admin._apps:
        cred = credentials.Certificate(FIREBASE_CREDENTIALS)
        firebase_admin.initialize_app(cred)
        print("[✓] Firebase initialized")


def get_or_create_auth_user(email: str, name: str) -> str:
    try:
        user = auth.get_user_by_email(email)
        return user.uid
    except auth.UserNotFoundError:
        user = auth.create_user(
            email=email,
            password=DEFAULT_PASSWORD,
            display_name=name
        )
        return user.uid


def rand_score() -> int:
    """KavachScore: 300-900, normally distributed around 720."""
    return max(300, min(900, int(random.gauss(720, 90))))


def calc_premium(avg_income: int, avg_dist: float, city: str) -> tuple[int, int]:
    """
    Simple rule-based premium/coverage matching the existing premium_calc service.
    Returns (weekly_premium_rs, coverage_rs)
    """
    base = round(avg_income * 0.045)           # 4.5 % of weekly income
    city_mult = {"Mumbai": 1.25, "Delhi": 1.20, "Chennai": 1.10}.get(city, 1.0)
    dist_mult  = 1.0 + (avg_dist / 100)        # more distance → higher premium
    premium    = max(40, min(200, round(base * city_mult * dist_mult)))
    coverage   = premium * 18                  # fixed multiplier
    return premium, coverage


def rand_worker_stats(city: str):
    avg_income    = random.randint(3000, 9000)
    avg_dist      = round(random.uniform(20, 80), 1)
    avg_deliveries= round(random.uniform(6, 18), 1)
    days          = random.sample(["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], k=random.randint(4, 6))
    premium, coverage = calc_premium(avg_income, avg_dist, city)
    return avg_income, avg_dist, avg_deliveries, sorted(days), premium, coverage


def rand_age() -> int:
    return random.randint(20, 42)


def rand_phone() -> str:
    return f"9{random.randint(100000000, 999999999)}"


def rand_aadhaar() -> str:
    return str(random.randint(1000, 9999))


def make_email(name: str, emp_id: str) -> str:
    first = name.split()[0].lower()
    return f"{first}.{emp_id.lower()}@kavachpay.in"


def make_referral(name: str, emp_id: str) -> str:
    return f"{name.split()[0].upper()}-{emp_id[-4:]}"


def rand_upi(name: str) -> str:
    return f"{name.split()[0].lower()}{random.randint(10,99)}@upi"


def rand_claims(zone: str, score: int) -> list[dict]:
    """
    Generate 1–3 realistic claims for a worker.
    High-score workers have mostly paid claims.
    """
    now = datetime.now(timezone.utc)
    claim_templates = [
        {"event": "Heavy Rain — 88mm",         "code": "HRA", "severity": "Severe",   "base_payout": 1100},
        {"event": "Moderate Rain — 42mm",       "code": "MRA", "severity": "Moderate", "base_payout":  650},
        {"event": "Heatwave — 45°C",            "code": "HTV", "severity": "Severe",   "base_payout": 1200},
        {"event": "Severe AQI — 410",           "code": "SAQ", "severity": "Moderate", "base_payout":  780},
        {"event": "Dense Fog — visibility 30m", "code": "FOG", "severity": "Moderate", "base_payout":  550},
        {"event": "High Wind — 72 km/h",        "code": "WND", "severity": "Severe",   "base_payout":  820},
        {"event": "Flood — knee-deep water",    "code": "FLD", "severity": "Severe",   "base_payout": 1400},
        {"event": "Storm — lightning warning",  "code": "STM", "severity": "Severe",   "base_payout": 1050},
    ]
    n_claims = random.choices([0, 1, 2, 3], weights=[15, 40, 30, 15])[0]
    claims = []
    for i in range(n_claims):
        tmpl  = random.choice(claim_templates)
        days_ago = random.randint(2, 45)
        ts    = now - timedelta(days=days_ago)
        # High-score → more likely paid
        is_paid = random.random() < (0.3 + score / 1500)
        payout  = tmpl["base_payout"] + random.randint(-100, 200) if is_paid else 0
        txn     = f"pay_{uuid.uuid4().hex[:10]}" if is_paid else None
        status  = "paid" if is_paid else "skipped"
        skip_r  = None if is_paid else random.choice([
            "Layer 4 failed: GPS detected movement in safe zone",
            "Insufficient disruption evidence",
            "Claim filed outside disruption window",
        ])
        timeline = [
            {"event": "Alert Triggered",  "time": ts.strftime("%I:%M %p"), "done": True},
            {"event": "Claim Verified",   "time": (ts + timedelta(minutes=10)).strftime("%I:%M %p"), "done": is_paid},
        ]
        if is_paid:
            timeline.append({"event": "Payout Success", "time": (ts + timedelta(minutes=25)).strftime("%I:%M %p"), "done": True})
        claims.append({
            "id":                   f"CLM-{random.randint(1000,9999)}",
            "date":                 ts.strftime("%b %d, %Y"),
            "timestamp":            ts,
            "event":                tmpl["event"],
            "code":                 tmpl["code"],
            "severity":             tmpl["severity"],
            "status":               status,
            "payout":               payout,
            "txn":                  txn,
            "zone":                 zone,
            "verification_layers":  5 if is_paid else random.randint(2, 4),
            "fraud_flags":          0 if is_paid else random.randint(1, 2),
            "skip_reason":          skip_r,
            "timeline":             timeline,
        })
    return claims


def rand_notifications(uid: str) -> list[dict]:
    styles = {
        "payout":  {"color": "#059669", "bg": "#ECFDF5", "border": "#A7F3D0"},
        "policy":  {"color": "#2563EB", "bg": "#EFF6FF", "border": "#BFDBFE"},
        "zone":    {"color": "#0891B2", "bg": "#ECFEFF", "border": "#A5F3FC"},
        "score":   {"color": "#7C3AED", "bg": "#F5F3FF", "border": "#DDD6FE"},
        "alert":   {"color": "#D97706", "bg": "#FFFBEB", "border": "#FDE68A"},
    }
    templates = [
        {"type": "payout",  "title": "Payout Credited",     "msg": f"₹{random.randint(500,1400)} deposited to your UPI"},
        {"type": "policy",  "title": "Policy Active",        "msg": "Your KavachPay policy is renewed for this week"},
        {"type": "zone",    "title": "Zone Alert",           "msg": "Disruption detected in your primary zone"},
        {"type": "score",   "title": "KavachScore Updated",  "msg": f"Your score is now {random.randint(600,900)}"},
        {"type": "alert",   "title": "Weather Warning",      "msg": "Heavy rain expected — stay safe!"},
    ]
    now  = datetime.now(timezone.utc)
    n    = random.randint(2, 4)
    notifs = []
    for i, tmpl in enumerate(random.sample(templates, k=n)):
        s = styles[tmpl["type"]]
        nid = f"notif_{int(now.timestamp())}_{uid[-4:]}_{i}"
        notifs.append({
            "id":        nid,
            "type":      tmpl["type"],
            "title":     tmpl["title"],
            "msg":       tmpl["msg"],
            "read":      i > 1,
            "time":      f"Today, {random.randint(8,11)}:{random.choice(['00','15','30','45'])} {'AM' if random.random()>0.4 else 'PM'}",
            "timestamp": firestore.SERVER_TIMESTAMP,
            "color":     s["color"],
            "bg":        s["bg"],
            "border":    s["border"],
        })
    return notifs


# ─── MAIN SEED FUNCTION ───────────────────────────────────────────────────────

def seed():
    init_firebase()
    db = firestore.client()

    # ── STEP 1: Seed 50 workers ────────────────────────────────────────────────
    print("\n[1/6] Seeding 50 workers…")
    worker_map = {}   # emp_id  →  {uid, zone, city, score, premium, claims…}
    zone_premium_payouts = {}  # zone → {premiums, payouts}

    for name, emp_id, city, zone, platform in WORKER_DEFINITIONS:
        email     = make_email(name, emp_id)
        uid       = get_or_create_auth_user(email, name)
        score     = rand_score()
        age       = rand_age()
        phone     = rand_phone()
        aadhaar   = rand_aadhaar()
        upi_id    = rand_upi(name)
        referral  = make_referral(name, emp_id)

        avg_inc, avg_dist, avg_del, workdays, premium, coverage = rand_worker_stats(city)

        # policy state
        policy_active = random.random() > 0.08     # 92 % active
        policy_paused = (not policy_active) and random.random() > 0.5

        doc = {
            "uid":               uid,
            "name":              name,
            "email":             email,
            "phone":             phone,
            "aadhaar_last4":     aadhaar,
            "employee_id":       emp_id,
            "platform":          platform,
            "city":              city,
            "zone":              zone,
            "age":               age,
            "upi_id":            upi_id,
            "referral_code":     referral,
            "kavach_score":      score,
            "premium":           premium,
            "coverage":          coverage,
            "avg_income":        avg_inc,
            "avg_daily_distance":avg_dist,
            "avg_deliveries":    avg_del,
            "typical_workdays":  workdays,
            "policy_active":     policy_active,
            "policy_paused":     policy_paused,
            "is_deleted":        False,
            "created_at":        firestore.SERVER_TIMESTAMP,
            "updated_at":        firestore.SERVER_TIMESTAMP,
        }
        db.collection("workers").document(uid).set(doc)

        # accumulate zone stats for financials
        if zone not in zone_premium_payouts:
            zone_premium_payouts[zone] = {"zone": zone, "premiums": 0, "payouts": 0}
        zone_premium_payouts[zone]["premiums"] += premium

        worker_map[emp_id] = {
            "uid":      uid,
            "zone":     zone,
            "city":     city,
            "score":    score,
            "premium":  premium,
            "platform": platform,
        }
        print(f"    [+] {name} ({emp_id}) uid={uid[:8]}…")

    print(f"[✓] 50 workers written\n")

    # ── STEP 2: Claims + Notifications for each worker ─────────────────────────
    print("[2/6] Seeding claims & notifications…")
    total_payout_amount = 0
    fraud_blocked_total = 0

    for emp_id, info in worker_map.items():
        uid   = info["uid"]
        zone  = info["zone"]
        score = info["score"]

        claims = rand_claims(zone, score)
        for c in claims:
            db.collection("workers").document(uid).collection("claims").document(c["id"]).set(c)
            if c["status"] == "paid":
                total_payout_amount += c["payout"]
                zone_premium_payouts[zone]["payouts"] += c["payout"]
            elif c["status"] == "skipped":
                fraud_blocked_total += 1

        for notif in rand_notifications(uid):
            db.collection("workers").document(uid).collection("notifications").document(notif["id"]).set(notif)

    print(f"[✓] Claims & notifications written\n")

    # ── STEP 3: Payments collection ────────────────────────────────────────────
    print("[3/6] Seeding payments…")
    now = datetime.now(timezone.utc)
    payments_written = 0

    for emp_id, info in worker_map.items():
        uid     = info["uid"]
        premium = info["premium"]

        # Weekly premium payment
        pay_id = f"pay_{uuid.uuid4().hex[:12]}"
        db.collection("payments").document(pay_id).set({
            "uid":         uid,
            "employee_id": emp_id,
            "type":        "premium",
            "amount":      premium,
            "status":      "success",
            "txn_id":      f"rzp_{uuid.uuid4().hex[:10]}",
            "claim_id":    None,
            "date":        (now - timedelta(days=random.randint(0, 6))).strftime("%Y-%m-%d"),
            "created_at":  now - timedelta(days=random.randint(0, 6)),
        })
        payments_written += 1

    # Payout payments for paid claims
    for emp_id, info in worker_map.items():
        uid  = info["uid"]
        zone = info["zone"]
        claims_stream = db.collection("workers").document(uid).collection("claims").stream()
        for c_doc in claims_stream:
            c = c_doc.to_dict()
            if c.get("status") == "paid":
                pay_id = f"pay_{uuid.uuid4().hex[:12]}"
                ts_days_ago = (now - c["timestamp"]).days if c.get("timestamp") else 5
                db.collection("payments").document(pay_id).set({
                    "uid":         uid,
                    "employee_id": emp_id,
                    "type":        "payout",
                    "amount":      c["payout"],
                    "status":      "success",
                    "txn_id":      c.get("txn") or f"rzp_{uuid.uuid4().hex[:10]}",
                    "claim_id":    c["id"],
                    "date":        (now - timedelta(days=max(0, ts_days_ago))).strftime("%Y-%m-%d"),
                    "created_at":  c["timestamp"],
                })
                payments_written += 1

    print(f"[✓] {payments_written} payment documents written\n")

    # ── STEP 4: financial_snapshots (8 weeks) ─────────────────────────────────
    print("[4/6] Seeding financial_snapshots (8 weeks)…")

    total_enrollments = len(worker_map)
    # Build 8 weeks of growing premium revenue
    week_labels = [
        ("W1 Jan", "w1_jan"), ("W2 Jan", "w2_jan"),
        ("W1 Feb", "w1_feb"), ("W2 Feb", "w2_feb"),
        ("W1 Mar", "w1_mar"), ("W2 Mar", "w2_mar"),
        ("W1 Apr", "w1_apr"), ("W2 Apr", "w2_apr"),
    ]

    base_premiums = int(total_enrollments * 62 * 0.60)  # start at 60% enrollment
    for idx, (label, doc_id) in enumerate(week_labels):
        growth   = 1 + idx * 0.07                        # 7% growth per week
        premiums = int(base_premiums * growth)
        # Payout ratio 28–37% — lower when no disruptions
        payout_r = random.uniform(0.28, 0.37)
        payouts  = int(premiums * payout_r)
        profit   = premiums - payouts

        db.collection("financial_snapshots").document(doc_id).set({
            "week":             label,
            "premiums":         premiums,
            "payouts":          payouts,
            "profit":           profit,
            "enrolled_workers": int(total_enrollments * (0.60 + idx * 0.05)),
            "active_claims":    random.randint(5, 25),
            "fraud_blocked":    random.randint(2, 12),
            "timestamp":        firestore.SERVER_TIMESTAMP,
        })
        print(f"    {label}: premiums=₹{premiums:,}  payouts=₹{payouts:,}  profit=₹{profit:,}")

    print("[✓] financial_snapshots written\n")

    # ── STEP 5: financials/current_week ───────────────────────────────────────
    print("[5/6] Seeding financials/current_week…")

    zone_breakdown = []
    for zone, data in zone_premium_payouts.items():
        if data["premiums"] > 0:
            zone_breakdown.append({
                "zone":     zone,
                "premiums": data["premiums"],
                "payouts":  data["payouts"],
            })
    zone_breakdown.sort(key=lambda z: z["premiums"], reverse=True)

    fraud_savings  = fraud_blocked_total * random.randint(400, 900)
    fraud_rate_pct = round((fraud_blocked_total / max(1, len(worker_map))) * 100, 1)

    db.collection("financials").document("current_week").set({
        "zone_breakdown":    zone_breakdown,
        "fraud_blocked_count": fraud_blocked_total,
        "fraud_savings":     fraud_savings,
        "fraud_rate_pct":    fraud_rate_pct,
    })
    print(f"[✓] financials/current_week written  (fraud_blocked={fraud_blocked_total}, savings=₹{fraud_savings:,})\n")

    # ── STEP 6: Disruptions (varied, across cities) ───────────────────────────
    print("[6/6] Seeding disruptions…")
    now = datetime.now(timezone.utc)

    disruption_seeds = [
        # (city, zone, code, severity, value, hours_ago, is_active)
        ("Bangalore", "Koramangala",    "HRA", "Severe",   "92mm",       2,  True),
        ("Mumbai",    "Dharavi",        "FLD", "Severe",   "knee-deep",  6,  True),
        ("Delhi",     "Connaught Place","SAQ", "Severe",   "AQI 418",   18,  False),
        ("Chennai",   "Adyar",          "STM", "Moderate", "64 km/h",   36,  False),
        ("Hyderabad", "Madhapur",       "HTV", "Severe",   "46°C",       1,  True),
        ("Pune",      "Koregaon Park",  "FOG", "Moderate", "Vis 40m",   72,  False),
        ("Mumbai",    "Andheri",        "WND", "Moderate", "58 km/h",    4,  True),
        ("Bangalore", "Whitefield",     "MRA", "Moderate", "38mm",      48,  False),
    ]

    for city, zone, code, severity, value, h_ago, is_active in disruption_seeds:
        dtype   = next(d for d in DISRUPTION_TYPES if d["code"] == code)
        ts      = now - timedelta(hours=h_ago)
        expires = ts + timedelta(hours=8)
        doc_id  = f"{code.lower()}_{city[:3].lower()}_{int(ts.timestamp())}"

        db.collection("disruptions").document(doc_id).set({
            "code":       code,
            "label":      dtype["label"],
            "value":      value,
            "zone":       zone,
            "city":       city,
            "severity":   severity,
            "time":       ts.strftime("%I:%M %p"),
            "color":      dtype["color"],
            "active":     is_active,
            "expires_at": expires,
            "timestamp":  ts,
        })
        status_str = "ACTIVE" if is_active else "expired"
        print(f"    [{status_str}] {dtype['label']} — {zone}, {city}")

    print("[✓] Disruptions written\n")
    print("=" * 60)
    print("✅  Seed complete — 50 workers + admin dashboard data ready")
    print(f"    Workers:          50")
    print(f"    Zones covered:    {len(zone_premium_payouts)}")
    print(f"    Financial weeks:  8")
    print(f"    Disruptions:      {len(disruption_seeds)}")
    print("=" * 60)


if __name__ == "__main__":
    random.seed(42)   # reproducible
    seed()
