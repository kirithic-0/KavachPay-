"""
seed_claims.py
──────────────────────────────────────────────────────────────────
Seeds realistic claims history for demo workers:

  Ravi Kumar  → 4 paid, 1 skipped
  Priya Singh → 1 paid, 4 skipped

Run from backend/:
    python seed_claims.py
"""

import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

import firebase_admin
from firebase_admin import credentials, firestore, auth
from datetime import datetime, timedelta, timezone
import uuid

FIREBASE_CREDENTIALS = "firebase-credentials.json"

def init_firebase():
    if not firebase_admin._apps:
        cred = credentials.Certificate(FIREBASE_CREDENTIALS)
        firebase_admin.initialize_app(cred)
    print("[OK] Firebase initialized")

def get_uid_by_email(email):
    try:
        return auth.get_user_by_email(email).uid
    except Exception as e:
        print(f"  [ERROR] {email}: {e}")
        return None

def make_claim(status, event, code, severity, payout, zone, city, days_ago, skip_reason="", layers=5):
    now = datetime.now(timezone.utc) - timedelta(days=days_ago)
    claim_id = f"CLM-{uuid.uuid4().hex[:6].upper()}"
    txn = f"PAY-{uuid.uuid4().hex[:8].upper()}" if status == "paid" else None
    date_str = now.strftime("%b %d, %Y")
    time_str = now.strftime("%I:%M %p")

    paid_timeline = [
        {"time": time_str, "event": "Disruption detected via IMD API", "done": True},
        {"time": time_str, "event": "Layer 1 – Work intent verified (recent orders found)", "done": True},
        {"time": time_str, "event": "Layer 2 – Disruption trigger confirmed in city", "done": True},
        {"time": time_str, "event": "Layer 3 – Zone inactivity ≥60% confirmed", "done": True},
        {"time": time_str, "event": "Layer 4 – GPS / order inactivity verified", "done": True},
        {"time": time_str, "event": "Layer 5 – KavachScore above minimum threshold", "done": True},
        {"time": time_str, "event": f"Payout ₹{payout} credited via UPI", "done": True},
    ]
    skipped_timeline = [
        {"time": time_str, "event": "Disruption detected via IMD API", "done": True},
        {"time": time_str, "event": "Layer 1 – Work intent verified (recent orders found)", "done": True},
        {"time": time_str, "event": "Layer 2 – Disruption trigger confirmed in city", "done": True},
        {"time": time_str, "event": "Layer 3 – Zone inactivity ≥60% confirmed", "done": layers >= 4},
        {"time": time_str, "event": "Layer 4 – GPS / order inactivity check", "done": layers >= 5},
        {"time": time_str, "event": f"Claim skipped: {skip_reason}", "done": False},
    ]

    return {
        "id": claim_id,
        "date": date_str,
        "timestamp": now,
        "event": event,
        "code": code,
        "severity": severity,
        "status": status,
        "payout": payout if status == "paid" else 0,
        "txn": txn,
        "zone": zone,
        "city": city,
        "description": f"{event} disruption in {zone}.",
        "verification_layers": layers,
        "fraud_decision": "auto_approve" if status == "paid" else "auto_approve",
        "fraud_prob": 0.04 if status == "paid" else 0.12,
        "fraud_flags": [],
        "skip_reason": skip_reason,
        "income_loss_p10": round(payout * 0.7) if status == "paid" else 0,
        "income_loss_p50": payout if status == "paid" else 0,
        "income_loss_p90": round(payout * 1.3) if status == "paid" else 0,
        "text_predicted_code": code,
        "text_confidence": 0.91,
        "text_manual_review": False,
        "timeline": paid_timeline if status == "paid" else skipped_timeline,
    }

RAVI_CLAIMS = [
    make_claim("paid",    "Heavy Rain",   "HRA", "Severe",   1200, "Koramangala", "Bangalore", 42),
    make_claim("paid",    "Moderate Rain","MRA", "Moderate",  780, "Koramangala", "Bangalore", 30),
    make_claim("skipped", "Dense Fog",    "FOG", "Moderate",    0, "Koramangala", "Bangalore", 22,
               skip_reason="Layer 4 failed: worker was active during disruption window", layers=4),
    make_claim("paid",    "Severe AQI",   "SAQ", "Severe",   1560, "Koramangala", "Bangalore", 14),
    make_claim("paid",    "Storm",        "STM", "Severe",   1200, "Koramangala", "Bangalore",  5),
]

PRIYA_CLAIMS = [
    make_claim("skipped", "Heavy Rain",   "HRA", "Severe",     0, "Adyar", "Chennai", 40,
               skip_reason="Layer 5 failed: KavachScore 380 below minimum 500", layers=4),
    make_claim("paid",    "Moderate Rain","MRA", "Moderate", 780, "Adyar", "Chennai", 31),
    make_claim("skipped", "Storm",        "STM", "Severe",     0, "Adyar", "Chennai", 22,
               skip_reason="Layer 5 failed: KavachScore 380 below minimum 500", layers=4),
    make_claim("skipped", "Flood",        "FLD", "Severe",     0, "Adyar", "Chennai", 13,
               skip_reason="Layer 5 failed: KavachScore 380 below minimum 500", layers=4),
    make_claim("skipped", "Severe AQI",   "SAQ", "Moderate",   0, "Adyar", "Chennai",  4,
               skip_reason="Layer 5 failed: KavachScore 380 below minimum 500", layers=4),
]

def seed_claims(db, uid, name, claims_list):
    claims_ref = db.collection("workers").document(uid).collection("claims")
    # Delete existing claims
    existing = claims_ref.stream()
    batch = db.batch()
    count = 0
    for c in existing:
        batch.delete(c.reference)
        count += 1
    if count > 0:
        batch.commit()
        print(f"  Deleted {count} existing claims for {name}")

    # Seed new claims
    for claim in claims_list:
        doc_id = claim["id"]
        claims_ref.document(doc_id).set(claim)
        print(f"  [{claim['status'].upper():8s}] {claim['event']:20s}  ₹{claim['payout']:6d}  {claim['date']}")

def main():
    init_firebase()
    db = firestore.client()

    print("\n── Seeding Ravi Kumar (ravi@kavachpay.in) ──")
    ravi_uid = get_uid_by_email("ravi@kavachpay.in")
    if ravi_uid:
        seed_claims(db, ravi_uid, "Ravi Kumar", RAVI_CLAIMS)
        print(f"  [DONE] 4 paid, 1 skipped")
    else:
        print("  [SKIP]")

    print("\n── Seeding Priya Singh (priya@kavachpay.in) ──")
    priya_uid = get_uid_by_email("priya@kavachpay.in")
    if priya_uid:
        seed_claims(db, priya_uid, "Priya Singh", PRIYA_CLAIMS)
        print(f"  [DONE] 1 paid, 4 skipped")
    else:
        print("  [SKIP]")

    print("\nDone.")

if __name__ == "__main__":
    main()
