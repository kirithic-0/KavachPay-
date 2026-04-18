"""
update_demo_workers.py
──────────────────────────────────────────────────────────────────
Updates demo worker data for clean simulation results:

  Priya Singh  → kavach_score = 380
                 This drops her below the Layer 5 floor (500).
                 When a disruption is simulated in her area (Adyar, Chennai),
                 the 5-layer check will FAIL at Layer 5 → claim is REJECTED.

  Ravi Kumar   → kavach_score = 820
                 past_claims = 2, past_correct_claims = 2 (100% accuracy)
                 months_active = 18 (established worker)
                 has_declaration = True (eshram_id set)
                 No orders with today's date in orders_week_a → Layer 4 passes.
                 All 5 layers pass + M2 fraud score low → claim is AUTO-APPROVED.

Run from backend/ dir:
    python update_demo_workers.py
"""

import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

import firebase_admin
from firebase_admin import credentials, firestore, auth

FIREBASE_CREDENTIALS = "firebase-credentials.json"


def init_firebase():
    if not firebase_admin._apps:
        cred = credentials.Certificate(FIREBASE_CREDENTIALS)
        firebase_admin.initialize_app(cred)
    print("[OK] Firebase initialized")


def get_uid_by_email(email: str) -> str:
    try:
        user = auth.get_user_by_email(email)
        return user.uid
    except Exception as e:
        print(f"  [ERROR] Could not find auth user for {email}: {e}")
        return None


def update_priya(db, uid: str):
    """
    Set Priya's KavachScore to 380 so Layer 5 (score floor = 500) fails.
    Her claims will be auto-rejected during any disruption simulation.
    """
    db.collection("workers").document(uid).update({
        "kavach_score": 380,
        "past_claims": 5,
        "past_correct_claims": 1,   # high fraud suspicion ratio for M2 too
        "months_active": 3,
        "updated_at": firestore.SERVER_TIMESTAMP,
    })
    print(f"  [PRIYA] kavach_score → 380  |  past_claims=5, past_correct=1")
    print(f"  [PRIYA] Layer 5 will FAIL (score 380 < 500) → claim REJECTED ✗")


def update_ravi(db, uid: str):
    """
    Set Ravi's profile so ALL 5 verification layers pass:
      Layer 1: orders exist in orders_week_a  (seeded by restore_demo_workers)
      Layer 2: disruption exists for his city  (seeded by the simulation)
      Layer 3: zone inactivity ≥ 60%           (mocked to 100%)
      Layer 4: no orders with TODAY's date      (restore_demo seeded old dates)
      Layer 5: kavach_score ≥ 500              → 820 ✓

    M2 fraud detector: score=820, 2/2 correct claims, 18 months, eshram → LOW fraud prob
    """
    db.collection("workers").document(uid).update({
        "kavach_score": 820,
        "past_claims": 2,
        "past_correct_claims": 2,   # perfect accuracy → M2 approves
        "months_active": 18,         # long-tenure → M2 approves
        "eshram_id": "UAN-BLR-123456",  # has_declaration=True for M2
        "updated_at": firestore.SERVER_TIMESTAMP,
    })
    print(f"  [RAVI]  kavach_score → 820  |  past_claims=2, past_correct=2, months_active=18")
    print(f"  [RAVI]  All 5 layers will PASS → claim AUTO-APPROVED ✓")


def main():
    init_firebase()
    db = firestore.client()

    print("\n── Updating Priya Singh (priya@kavachpay.in) ──")
    priya_uid = get_uid_by_email("priya@kavachpay.in")
    if priya_uid:
        update_priya(db, priya_uid)
    else:
        print("  [SKIP] Priya not found in Firebase Auth")

    print("\n── Updating Ravi Kumar (ravi@kavachpay.in) ──")
    ravi_uid = get_uid_by_email("ravi@kavachpay.in")
    if ravi_uid:
        update_ravi(db, ravi_uid)
    else:
        print("  [SKIP] Ravi not found in Firebase Auth")

    print("\n" + "=" * 60)
    print("UPDATE COMPLETE")
    print("  Priya Singh  → score=380  → disruption claim will be REJECTED")
    print("  Ravi Kumar   → score=820  → disruption claim will be APPROVED")
    print("=" * 60)


if __name__ == "__main__":
    main()
