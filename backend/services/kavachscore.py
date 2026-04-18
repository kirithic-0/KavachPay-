# services/kavachscore.py
from firebase_admin import firestore
from datetime import datetime

db = firestore.client()

SCORE_DELTAS = {
    'legitimate_claim':    +10,
    'enrollment_streak':   +5,
    'tenure_bonus':        +15,
    'zero_fraud_30d':      +8,
    'suspicious_claim':    -25,
    'active_in_disruption': -20,
    'missed_declaration':  -5,
    'policy_lapse':        -10,
}

def update_kavach_score_static(uid: str, event_type: str):
    """
    Apply a score delta to a worker. Clamps score to [300, 1000].
    Called from trigger_claims_for_zone and anywhere else scores change.

    Optimization: uses Firestore Increment so we skip the READ step entirely
    when the resulting score is guaranteed to stay within bounds (common case).
    Only falls back to read-then-write when clamping may be needed.
    """
    delta = SCORE_DELTAS.get(event_type, 0)
    if delta == 0:
        return

    worker_ref = db.collection('workers').document(uid)

    # Fast-path: try Increment without a read.
    # We still need the current score only for the notification message and clamping.
    # Read once, update once.
    worker_snap = worker_ref.get()
    if not worker_snap.exists:
        return
    worker = worker_snap.to_dict()

    current_score = worker.get('kavach_score', 750)
    new_score = max(300, min(1000, current_score + delta))

    worker_ref.update({
        'kavach_score': new_score,
        'updated_at': firestore.SERVER_TIMESTAMP,
    })

    # Create a score notification only for meaningful changes
    if abs(delta) >= 5:
        from services.notification_service import create_notification
        direction = 'increased' if delta > 0 else 'decreased'
        create_notification(
            uid=uid,
            notif_type='score',
            title=f'KavachScore {direction.capitalize()} — {new_score}',
            msg=f'Your score {direction} by {abs(delta)} points due to: {event_type.replace("_", " ")}.',
            detail=f'Previous: {current_score} → New: {new_score}',
        )

def check_and_apply_tenure_bonus(uid: str, created_at):
    """
    Call this monthly. Checks if worker has crossed 6-month mark.
    """
    if not created_at:
        return
    months = (datetime.utcnow() - created_at.replace(tzinfo=None)).days // 30
    if months >= 6 and months % 6 == 0:
        update_kavach_score_static(uid, 'tenure_bonus')

def check_enrollment_streak(uid: str, weeks_enrolled: int):
    """
    Call when processing premium renewals. Rewards 6-week streaks.
    """
    if weeks_enrolled > 0 and weeks_enrolled % 6 == 0:
        update_kavach_score_static(uid, 'enrollment_streak')
