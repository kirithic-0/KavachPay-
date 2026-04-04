"""
services/score_engine.py
========================
KavachScore event-based updates + ML-backed fraud/dynamic scoring.
M2 (XGBoost) is wired in via ml_models.
"""
from firebase_admin import firestore


def update_kavach_score_static(worker_id: str, event_type: str):
    """
    Updates KavachScore based on static event offsets.
    Offsets:
        legitimate_claim        +10
        weekly_streak           +5
        6_month_tenure          +15
        no_fraud_30_days        +8
        suspicious_claim        -25
        active_during_disruption -20
        policy_lapse            -10
    """
    db      = firestore.client()
    doc_ref = db.collection('workers').document(worker_id)
    doc     = doc_ref.get()
    if not doc.exists:
        return

    worker_data   = doc.to_dict()
    current_score = worker_data.get('kavach_score', 750)

    offsets = {
        'legitimate_claim':         10,
        'weekly_streak':             5,
        '6_month_tenure':           15,
        'no_fraud_30_days':          8,
        'suspicious_claim':        -25,
        'active_during_disruption': -20,
        'policy_lapse':            -10,
    }

    offset    = offsets.get(event_type, 0)
    new_score = max(0, min(1000, current_score + offset))

    doc_ref.update({
        'kavach_score': new_score,
        'updated_at':   firestore.SERVER_TIMESTAMP,
    })

    db.collection('audit_log').add({
        'action':      'KAVACHSCORE_UPDATED',
        'actor':       'system',
        'entity_type': 'worker',
        'entity_id':   worker_id,
        'detail':      f'{event_type} applied offset {offset:+}.',
        'before':      {'kavach_score': current_score},
        'after':       {'kavach_score': new_score},
        'timestamp':   firestore.SERVER_TIMESTAMP,
    })


# ── ML MODEL (M2) wired below ─────────────────────────────────────────────
def analyze_fraud_risk_ml(worker_data: dict, claim_data: dict,
                           area_telemetry: dict) -> tuple[float, list]:
    """
    Delegates to M2 (XGBoost fraud detector) in ml_models.py.

    Inputs:
        worker_data    – worker profile + history dict
        claim_data     – current claim details (code, severity, payout, coverage)
        area_telemetry – external features (measured_value, zone_inactivity_pct)

    Returns:
        (risk_probability: float 0-1, anomalous_flags: list[str])

    To integrate real model: replace the ml_models.m2_detect_fraud body only.
    """
    from services.ml_models import m2_detect_fraud

    result = m2_detect_fraud(
        kavach_score=worker_data.get('kavach_score', 750),
        past_claims=worker_data.get('past_claims', 0),
        past_correct_claims=worker_data.get('past_correct_claims', 0),
        months_active=float(worker_data.get('months_active', 0)),
        has_declaration=bool(worker_data.get('eshram_id') or worker_data.get('employer_name')),
        is_severe=(claim_data.get('severity') == 'Severe'),
        payout_amount=float(claim_data.get('payout', 0)),
        coverage=float(worker_data.get('coverage', 1200)),
        orders_during_disruption=int(claim_data.get('orders_during_disruption', 0)),
        disruption_code=claim_data.get('code', ''),
        measured_value=float(area_telemetry.get('measured_value', 0)),
        zone_inactivity_pct=float(area_telemetry.get('zone_inactivity_pct', 0.7)),
    )

    return result['fraud_prob'], result['flags']


def recalculate_dynamic_score_ml(worker_id: str, historical_claims: list) -> int:
    """
    Predictive ML scoring module — calculates a dynamic offset to apply on top
    of the static score. Placeholder for Phase 3 RL/GNN model.

    Returns: int offset in range -15 to +15
    """
    # ── ML MODEL START: Replace with dynamic scoring model ──
    if not historical_claims:
        return 0

    paid_count    = sum(1 for c in historical_claims if c.get('status') == 'paid')
    total         = len(historical_claims)
    honesty_ratio = paid_count / total if total else 1.0

    # Simple mock: high honesty → positive offset, low → negative
    if honesty_ratio >= 0.90:
        dynamic_offset = 10
    elif honesty_ratio >= 0.70:
        dynamic_offset = 5
    elif honesty_ratio >= 0.50:
        dynamic_offset = 0
    else:
        dynamic_offset = -10
    # ── ML MODEL END ──

    return dynamic_offset
