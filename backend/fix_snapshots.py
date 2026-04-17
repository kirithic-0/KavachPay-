"""
fix_snapshots.py - Updates financial_snapshots to use realistic revenue numbers
properly scaled to 50 workers with premiums Rs.40-200/week each.
Run from backend/ dir: python fix_snapshots.py
"""
import sys, io, random
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

import firebase_admin
from firebase_admin import credentials, firestore

FIREBASE_CREDENTIALS = "firebase-credentials.json"

def fix():
    if not firebase_admin._apps:
        cred = credentials.Certificate(FIREBASE_CREDENTIALS)
        firebase_admin.initialize_app(cred)
    db = firestore.client()
    print("[OK] Firebase initialized")

    # Read actual worker premiums to compute real base
    workers = list(db.collection("workers").where("is_deleted", "==", False).stream())
    total_premium = sum(w.to_dict().get("premium", 0) for w in workers)
    n_workers = len(workers)
    print(f"Found {n_workers} workers, total weekly premium = Rs.{total_premium:,}")

    # Build realistic 8-week financial trajectory
    # Start at 65% of current workers enrolled in earliest week, grow to 100%
    week_labels = [
        ("W1 Jan", "w1_jan", 0.65),
        ("W2 Jan", "w2_jan", 0.70),
        ("W1 Feb", "w1_feb", 0.75),
        ("W2 Feb", "w2_feb", 0.80),
        ("W1 Mar", "w1_mar", 0.85),
        ("W2 Mar", "w2_mar", 0.90),
        ("W1 Apr", "w1_apr", 0.95),
        ("W2 Apr", "w2_apr", 1.00),
    ]

    random.seed(42)
    for label, doc_id, enrollment_pct in week_labels:
        premiums = int(total_premium * enrollment_pct)
        # Payout ratio 22-35% (more disruptions = higher ratio)
        payout_r = random.uniform(0.22, 0.35)
        payouts  = int(premiums * payout_r)
        profit   = premiums - payouts
        enrolled = int(n_workers * enrollment_pct)

        db.collection("financial_snapshots").document(doc_id).set({
            "week":             label,
            "premiums":         premiums,
            "payouts":          payouts,
            "profit":           profit,
            "enrolled_workers": enrolled,
            "active_claims":    random.randint(5, 18),
            "fraud_blocked":    random.randint(2, 10),
            "timestamp":        firestore.SERVER_TIMESTAMP,
        })
        print(f"  {label}: {enrolled} workers, premiums=Rs.{premiums:,}, payouts=Rs.{payouts:,}, profit=Rs.{profit:,}")

    print("\n[OK] financial_snapshots updated with realistic data")

if __name__ == "__main__":
    fix()
