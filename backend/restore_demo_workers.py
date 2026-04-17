"""
restore_demo_workers.py
───────────────────────────────────────────────────────────────────────────
Restores the original demo worker accounts that the seeder may have broken:

  Ravi Kumar   → ravi@kavachpay.in  / ravi123    (BLR-1000001 / Koramangala)
  Priya Singh  → priya@kavachpay.in / priya123   (CHN-2000001 / Adyar)
  Mohammed Arif→ mohammed@kavachpay.in / mohammed123 (MUM-1000004 / Dharavi)

For each worker:
  1. Ensures the Firebase Auth account exists with the correct email+password
  2. Writes/overwrites the Firestore /workers/{uid} document
  3. Seeds 2 paid + 1 skipped claim in the claims subcollection
  4. Seeds 4 notifications in the notifications subcollection
  5. Creates a premium + payout entry in /payments

Run from backend/ dir:
    python restore_demo_workers.py
"""

import sys, io, uuid, random
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

from datetime import datetime, timedelta, timezone
import firebase_admin
from firebase_admin import credentials, firestore, auth

FIREBASE_CREDENTIALS = "firebase-credentials.json"


def init_firebase():
    if not firebase_admin._apps:
        cred = credentials.Certificate(FIREBASE_CREDENTIALS)
        firebase_admin.initialize_app(cred)
    print("[OK] Firebase initialized")


def ensure_auth_user(email: str, password: str, name: str) -> str:
    """Return uid, creating or updating the Firebase Auth account as needed."""
    try:
        user = auth.get_user_by_email(email)
        # Reset password every time so demo always works
        auth.update_user(user.uid, password=password, display_name=name)
        print(f"    [AUTH] Updated existing account: {email}")
        return user.uid
    except auth.UserNotFoundError:
        user = auth.create_user(email=email, password=password, display_name=name)
        print(f"    [AUTH] Created new account: {email}")
        return user.uid


# ─── Demo worker definitions ──────────────────────────────────────────────────

DEMO_WORKERS = [
    {
        "name":        "Ravi Kumar",
        "email":       "ravi@kavachpay.in",
        "password":    "ravi123",
        "employee_id": "BLR-1000001",
        "platform":    "Swiggy",
        "city":        "Bangalore",
        "zone":        "Koramangala",
        "premium":     59,
        "coverage":    1200,
        "kavach_score": 780,
        "upi_id":      "ravi@upi",
        "age":         26,
        "phone":       "9876543210",
        "aadhaar_last4": "1234",
        "avg_income":  6200,
        "avg_daily_distance": 38.5,
        "avg_deliveries": 12.0,
        "typical_workdays": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
        "claims_seed": [
            {
                "event": "Heavy Rain — 82mm", "code": "HRA",
                "severity": "Moderate", "status": "paid", "payout": 780,
                "days_ago": 20, "zone": "Koramangala",
            },
            {
                "event": "Heatwave — 44 deg C", "code": "HTV",
                "severity": "Severe", "status": "paid", "payout": 1200,
                "days_ago": 10, "zone": "Koramangala",
            },
            {
                "event": "Severe Air Quality — AQI 412", "code": "SAQ",
                "severity": "Moderate", "status": "skipped", "payout": 0,
                "days_ago": 5, "zone": "Koramangala",
                "skip_reason": "Layer 4 failed: GPS detected movement in safe zone",
            },
        ],
    },
    {
        "name":        "Priya Singh",
        "email":       "priya@kavachpay.in",
        "password":    "priya123",
        "employee_id": "CHN-2000001",
        "platform":    "Zomato",
        "city":        "Chennai",
        "zone":        "Adyar",
        "premium":     74,
        "coverage":    1560,
        "kavach_score": 820,
        "upi_id":      "priya@upi",
        "age":         29,
        "phone":       "9123456780",
        "aadhaar_last4": "5678",
        "avg_income":  7100,
        "avg_daily_distance": 32.0,
        "avg_deliveries": 14.5,
        "typical_workdays": ["Mon", "Tue", "Wed", "Thu", "Fri"],
        "claims_seed": [
            {
                "event": "Flood — knee-deep water", "code": "FLD",
                "severity": "Severe", "status": "paid", "payout": 1400,
                "days_ago": 15, "zone": "Adyar",
            },
            {
                "event": "Dense Fog — visibility 30m", "code": "FOG",
                "severity": "Moderate", "status": "paid", "payout": 550,
                "days_ago": 8, "zone": "Adyar",
            },
            {
                "event": "Storm — lightning warning", "code": "STM",
                "severity": "Severe", "status": "skipped", "payout": 0,
                "days_ago": 3, "zone": "Adyar",
                "skip_reason": "Insufficient disruption evidence at GPS location",
            },
        ],
    },
    {
        "name":        "Mohammed Arif",
        "email":       "mohammed@kavachpay.in",
        "password":    "mohammed123",
        "employee_id": "MUM-1000004",
        "platform":    "Zomato",
        "city":        "Mumbai",
        "zone":        "Dharavi",
        "premium":     96,
        "coverage":    1560,
        "kavach_score": 750,
        "upi_id":      "arif@upi",
        "age":         32,
        "phone":       "9988776655",
        "aadhaar_last4": "9012",
        "avg_income":  8400,
        "avg_daily_distance": 45.2,
        "avg_deliveries": 10.8,
        "typical_workdays": ["Mon", "Wed", "Thu", "Fri", "Sat", "Sun"],
        "claims_seed": [
            {
                "event": "Heavy Rain — 91mm", "code": "HRA",
                "severity": "Severe", "status": "paid", "payout": 1100,
                "days_ago": 12, "zone": "Dharavi",
            },
            {
                "event": "High Wind — 72 km/h", "code": "WND",
                "severity": "Severe", "status": "skipped", "payout": 0,
                "days_ago": 4, "zone": "Dharavi",
                "skip_reason": "Claim filed outside disruption window",
            },
        ],
    },
]


def make_claim(w_name: str, tmpl: dict, now: datetime) -> dict:
    ts       = now - timedelta(days=tmpl["days_ago"])
    is_paid  = tmpl["status"] == "paid"
    payout   = tmpl["payout"]
    txn      = f"pay_{uuid.uuid4().hex[:10]}" if is_paid else None

    timeline = [
        {"event": "Alert Triggered", "time": ts.strftime("%I:%M %p"), "done": True},
        {"event": "Claim Verified",  "time": (ts + timedelta(minutes=10)).strftime("%I:%M %p"), "done": is_paid},
    ]
    if is_paid:
        timeline.append({
            "event": "Payout Success",
            "time":  (ts + timedelta(minutes=25)).strftime("%I:%M %p"),
            "done":  True,
        })

    return {
        "id":                 f"CLM-{random.randint(1000, 9999)}",
        "date":               ts.strftime("%b %d, %Y"),
        "timestamp":          ts,
        "event":              tmpl["event"],
        "code":               tmpl["code"],
        "severity":           tmpl["severity"],
        "status":             tmpl["status"],
        "payout":             payout,
        "txn":                txn,
        "zone":               tmpl["zone"],
        "verification_layers": 5 if is_paid else random.randint(2, 4),
        "fraud_flags":         0 if is_paid else random.randint(1, 2),
        "skip_reason":         tmpl.get("skip_reason"),
        "timeline":            timeline,
    }


def seed_notifications(db, uid: str, w: dict):
    notif_styles = {
        "payout": {"color": "#059669", "bg": "#ECFDF5", "border": "#A7F3D0"},
        "policy": {"color": "#2563EB", "bg": "#EFF6FF", "border": "#BFDBFE"},
        "zone":   {"color": "#0891B2", "bg": "#ECFEFF", "border": "#A5F3FC"},
        "score":  {"color": "#7C3AED", "bg": "#F5F3FF", "border": "#DDD6FE"},
    }
    notifs = [
        {"type": "payout", "title": "Payout Success",   "msg": f"Rs.{w['claims_seed'][0]['payout']} deposited to your UPI"},
        {"type": "policy", "title": "Policy Renewed",   "msg": "Active until next Monday"},
        {"type": "zone",   "title": "Zone Updated",     "msg": f"Primary zone: {w['zone']}"},
        {"type": "score",  "title": "Score Updated",    "msg": f"KavachScore is now {w['kavach_score']}"},
    ]
    now = datetime.now(timezone.utc)
    for i, n in enumerate(notifs):
        style  = notif_styles[n["type"]]
        nid    = f"notif_{int(now.timestamp())}_{i}"
        db.collection("workers").document(uid).collection("notifications").document(nid).set({
            "id":        nid,
            "type":      n["type"],
            "title":     n["title"],
            "msg":       n["msg"],
            "read":      i > 1,
            "time":      "Today, 10:30 AM",
            "timestamp": firestore.SERVER_TIMESTAMP,
            "color":     style["color"],
            "bg":        style["bg"],
            "border":    style["border"],
        })


def restore():
    init_firebase()
    db  = firestore.client()
    now = datetime.now(timezone.utc)

    for w in DEMO_WORKERS:
        print(f"\n--- Restoring: {w['name']} ({w['email']}) ---")

        # 1. Firebase Auth
        uid = ensure_auth_user(w["email"], w["password"], w["name"])

        # 2. Firestore worker document (overwrite with correct data)
        doc = {
            "uid":                uid,
            "name":               w["name"],
            "email":              w["email"],
            "phone":              w["phone"],
            "aadhaar_last4":      w["aadhaar_last4"],
            "employee_id":        w["employee_id"],
            "platform":           w["platform"],
            "city":               w["city"],
            "zone":               w["zone"],
            "age":                w["age"],
            "upi_id":             w["upi_id"],
            "referral_code":      f"{w['name'].split()[0].upper()}-{w['employee_id'][-4:]}",
            "kavach_score":       w["kavach_score"],
            "premium":            w["premium"],
            "coverage":           w["coverage"],
            "avg_income":         w["avg_income"],
            "avg_daily_distance": w["avg_daily_distance"],
            "avg_deliveries":     w["avg_deliveries"],
            "typical_workdays":   w["typical_workdays"],
            "policy_active":      True,
            "policy_paused":      False,
            "is_deleted":         False,
            "created_at":         firestore.SERVER_TIMESTAMP,
            "updated_at":         firestore.SERVER_TIMESTAMP,
        }
        db.collection("workers").document(uid).set(doc)
        print(f"    [FIRESTORE] Worker doc written (uid={uid[:10]}...)")

        # 3. Claims subcollection
        for tmpl in w["claims_seed"]:
            claim = make_claim(w["name"], tmpl, now)
            db.collection("workers").document(uid).collection("claims").document(claim["id"]).set(claim)
            print(f"    [CLAIM] {claim['status'].upper():7s} — {claim['event']}")

        # 4. Notifications subcollection
        seed_notifications(db, uid, w)
        print(f"    [NOTIF] 4 notifications written")

        # 5. Payments — premium
        pay_id = f"pay_pr_{uid[:8]}"
        db.collection("payments").document(pay_id).set({
            "uid":         uid,
            "employee_id": w["employee_id"],
            "type":        "premium",
            "amount":      w["premium"],
            "status":      "success",
            "txn_id":      f"rzp_{uuid.uuid4().hex[:10]}",
            "claim_id":    None,
            "date":        now.strftime("%Y-%m-%d"),
            "created_at":  now - timedelta(days=7),
        })
        print(f"    [PAYMENT] premium Rs.{w['premium']} written")

        # 5b. Payout payment for first paid claim
        first_paid = next((c for c in w["claims_seed"] if c["status"] == "paid"), None)
        if first_paid:
            po_id = f"pay_po_{uid[:8]}"
            ts    = now - timedelta(days=first_paid["days_ago"])
            db.collection("payments").document(po_id).set({
                "uid":         uid,
                "employee_id": w["employee_id"],
                "type":        "payout",
                "amount":      first_paid["payout"],
                "status":      "success",
                "txn_id":      f"rzp_{uuid.uuid4().hex[:10]}",
                "claim_id":    "CLM-DEMO",
                "date":        ts.strftime("%Y-%m-%d"),
                "created_at":  ts,
            })
            print(f"    [PAYMENT] payout Rs.{first_paid['payout']} written")

        print(f"    [DONE] {w['name']} fully restored — login: {w['email']} / {w['password']}")

    print("\n" + "=" * 60)
    print("RESTORE COMPLETE")
    print("  Ravi Kumar   : ravi@kavachpay.in    / ravi123")
    print("  Priya Singh  : priya@kavachpay.in   / priya123")
    print("  Mohammed Arif: mohammed@kavachpay.in / mohammed123")
    print("=" * 60)


if __name__ == "__main__":
    random.seed(7)
    restore()
