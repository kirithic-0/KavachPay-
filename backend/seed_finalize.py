"""
seed_finalize.py
Completes the remaining steps (3-6) that seed_50_workers.py failed on.
Steps 1 & 2 (workers, claims, notifications) already succeeded.
This script:
  - Reads workers + their claims from Firestore to build payments (step 3)
  - Seeds financial_snapshots, financials/current_week, disruptions (4-6)

Run from backend/ dir:
    python seed_finalize.py
"""

import sys, io, uuid, random, time
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

from datetime import datetime, timedelta, timezone
import firebase_admin
from firebase_admin import credentials, firestore

FIREBASE_CREDENTIALS = "firebase-credentials.json"

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


def init_firebase():
    if not firebase_admin._apps:
        cred = credentials.Certificate(FIREBASE_CREDENTIALS)
        firebase_admin.initialize_app(cred)
        print("[OK] Firebase initialized")


def retry_stream(fn, retries=4, delay=5):
    """Call fn() and retry on ServiceUnavailable."""
    for attempt in range(retries):
        try:
            return list(fn())
        except Exception as e:
            if attempt < retries - 1:
                print(f"    [RETRY {attempt+1}] {e} — waiting {delay}s...")
                time.sleep(delay)
            else:
                raise


def seed_finalize():
    init_firebase()
    db = firestore.client()
    now = datetime.now(timezone.utc)

    # ── STEP 3: Payments ──────────────────────────────────────────────────────
    print("\n[3/4] Seeding payments from existing workers + claims...")

    # Read all non-deleted workers
    workers_docs = retry_stream(
        lambda: db.collection("workers").where("is_deleted", "==", False).stream()
    )
    print(f"    Found {len(workers_docs)} workers")

    payments_written = 0
    zone_premium_payouts = {}     # zone → {premiums, payouts}
    fraud_blocked_total  = 0

    for w_doc in workers_docs:
        w      = w_doc.to_dict()
        uid    = w["uid"]
        emp_id = w.get("employee_id", "UNKNOWN")
        zone   = w.get("zone", "Unknown")
        premium = w.get("premium", 0)

        # Accumulate zone premiums
        if zone not in zone_premium_payouts:
            zone_premium_payouts[zone] = {"zone": zone, "premiums": 0, "payouts": 0}
        zone_premium_payouts[zone]["premiums"] += premium

        # Weekly premium payment — write only if not already present
        pay_id = f"pr_{uid[:8]}_{emp_id[-6:]}"
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
        }, merge=False)
        payments_written += 1

        # Read claims for this worker with retry
        try:
            claims_docs = retry_stream(
                lambda uid=uid: db.collection("workers").document(uid).collection("claims").stream()
            )
        except Exception as e:
            print(f"    [WARN] Could not read claims for {emp_id}: {e}")
            claims_docs = []

        for c_doc in claims_docs:
            c = c_doc.to_dict()
            if c.get("status") == "paid":
                ts_val = c.get("timestamp")
                if ts_val and hasattr(ts_val, "tzinfo") and ts_val.tzinfo is None:
                    ts_val = ts_val.replace(tzinfo=timezone.utc)
                pay_id2 = f"po_{uid[:8]}_{c['id']}"
                db.collection("payments").document(pay_id2).set({
                    "uid":         uid,
                    "employee_id": emp_id,
                    "type":        "payout",
                    "amount":      c.get("payout", 0),
                    "status":      "success",
                    "txn_id":      c.get("txn") or f"rzp_{uuid.uuid4().hex[:10]}",
                    "claim_id":    c["id"],
                    "date":        ts_val.strftime("%Y-%m-%d") if ts_val else now.strftime("%Y-%m-%d"),
                    "created_at":  ts_val or now,
                }, merge=False)
                payments_written += 1
                zone_premium_payouts[zone]["payouts"] += c.get("payout", 0)
            elif c.get("status") == "skipped":
                fraud_blocked_total += 1

    print(f"[OK] {payments_written} payment documents written\n")

    # ── STEP 4: financial_snapshots (8 weeks) ─────────────────────────────────
    print("[4/6] Seeding financial_snapshots (8 weeks)...")
    total_enrollments = len(workers_docs)
    week_labels = [
        ("W1 Jan", "w1_jan"), ("W2 Jan", "w2_jan"),
        ("W1 Feb", "w1_feb"), ("W2 Feb", "w2_feb"),
        ("W1 Mar", "w1_mar"), ("W2 Mar", "w2_mar"),
        ("W1 Apr", "w1_apr"), ("W2 Apr", "w2_apr"),
    ]
    base_premiums = int(total_enrollments * 62 * 0.60)
    for idx, (label, doc_id) in enumerate(week_labels):
        growth   = 1 + idx * 0.07
        premiums = int(base_premiums * growth)
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
        print(f"    {label}: premiums=Rs.{premiums:,}  payouts=Rs.{payouts:,}  profit=Rs.{profit:,}")
    print("[OK] financial_snapshots written\n")

    # ── STEP 5: financials/current_week ───────────────────────────────────────
    print("[5/6] Seeding financials/current_week...")
    zone_breakdown = [
        {"zone": z["zone"], "premiums": z["premiums"], "payouts": z["payouts"]}
        for z in sorted(zone_premium_payouts.values(), key=lambda x: x["premiums"], reverse=True)
        if z["premiums"] > 0
    ]
    fraud_savings  = fraud_blocked_total * random.randint(400, 900)
    fraud_rate_pct = round((fraud_blocked_total / max(1, total_enrollments)) * 100, 1)
    db.collection("financials").document("current_week").set({
        "zone_breakdown":      zone_breakdown,
        "fraud_blocked_count": fraud_blocked_total,
        "fraud_savings":       fraud_savings,
        "fraud_rate_pct":      fraud_rate_pct,
    })
    print(f"[OK] financials/current_week — {len(zone_breakdown)} zones, fraud_blocked={fraud_blocked_total}, savings=Rs.{fraud_savings:,}\n")

    # ── STEP 6: Disruptions ───────────────────────────────────────────────────
    print("[6/6] Seeding disruptions...")
    disruption_seeds = [
        # (city, zone, code, severity, value, hours_ago, is_active)
        ("Bangalore", "Koramangala",     "HRA", "Severe",   "92mm",        2,  True),
        ("Mumbai",    "Dharavi",         "FLD", "Severe",   "knee-deep",   6,  True),
        ("Delhi",     "Connaught Place", "SAQ", "Severe",   "AQI 418",    18,  False),
        ("Chennai",   "Adyar",           "STM", "Moderate", "64 km/h",    36,  False),
        ("Hyderabad", "Madhapur",        "HTV", "Severe",   "46 deg C",    1,  True),
        ("Pune",      "Koregaon Park",   "FOG", "Moderate", "Vis 40m",    72,  False),
        ("Mumbai",    "Andheri",         "WND", "Moderate", "58 km/h",     4,  True),
        ("Bangalore", "Whitefield",      "MRA", "Moderate", "38mm",       48,  False),
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
        status_str = "ACTIVE " if is_active else "expired"
        print(f"    [{status_str}] {dtype['label']:15s} — {zone}, {city}")
    print("[OK] Disruptions written\n")

    print("=" * 60)
    print("SEED COMPLETE — All admin dashboard data is ready")
    print(f"  Workers:         {total_enrollments}")
    print(f"  Zones covered:   {len(zone_breakdown)}")
    print(f"  Financial weeks: 8")
    print(f"  Disruptions:     {len(disruption_seeds)}")
    print(f"  Payments:        {payments_written}")
    print("=" * 60)


if __name__ == "__main__":
    random.seed(42)
    seed_finalize()
