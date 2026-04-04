"""
services/verification.py
========================
Disruption → Claim pipeline.
Now wired to:
  - M2 (XGBoost fraud detector)    via ml_models.m2_detect_fraud
  - M3 (Quantile Regression)       via ml_models.m3_estimate_income_loss
  - M7 (TF-IDF + SVM text triage)  via ml_models.m7_classify_claim_text
"""
from firebase_admin import firestore
from datetime import datetime
from collections import Counter
from services.ml_models import m2_detect_fraud, m3_estimate_income_loss, m7_classify_claim_text, CITY_RISK

db = firestore.client()


def trigger_claims_for_zone(city: str, zone: str, code: str, severity: str,
                             measured_value: float = 0.0, description: str = ''):
    """
    Runs the full disruption → claim pipeline for all workers in a zone.
    Called from simulate endpoint or real M4 trigger.
    Returns: number of workers notified.
    """
    workers = db.collection('workers')\
                .where('zone', '==', zone)\
                .where('policy_active', '==', True)\
                .where('is_deleted', '==', False).stream()

    notified = 0
    for w_doc in workers:
        worker = w_doc.to_dict()
        uid    = worker['uid']

        # Step 1 — 5-layer verification
        layers_passed, skip_reason, orders_today = run_5_layer_check(worker, code, zone)

        # Step 2 — M2: Fraud detection (runs even on skip to audit)
        city_risk    = CITY_RISK.get(city, 'low')
        zone_workers = list(db.collection('workers')
                              .where('zone', '==', zone)
                              .where('policy_active', '==', True).stream())
        total_zone   = len(zone_workers) or 1
        # Mock inactivity for testing: assume everyone is inactive during severe disruptions
        zone_inactivity_pct = 1.0

        avg_coverage = worker.get('coverage', 1200)
        # Estimate payout for M2 feature (using M3 P50 as estimate)
        m3_result = m3_estimate_income_loss(
            avg_daily_deliveries=float(worker.get('avg_deliveries', 12)),
            day_of_week=datetime.utcnow().weekday(),
            disruption_code=code,
            measured_value=measured_value,
            zone_risk=city_risk,
            platform=worker.get('platform', 'Swiggy'),
            avg_income=float(worker.get('avg_income', 3500)),
        )
        estimated_payout = m3_result['p50']

        m2_result = m2_detect_fraud(
            kavach_score=worker.get('kavach_score', 750),
            past_claims=worker.get('past_claims', 0),
            past_correct_claims=worker.get('past_correct_claims', 0),
            months_active=worker.get('months_active', 0),
            has_declaration=bool(worker.get('eshram_id') or worker.get('employer_name')),
            is_severe=(severity == 'Severe'),
            payout_amount=float(estimated_payout),
            coverage=float(avg_coverage),
            orders_during_disruption=orders_today,
            disruption_code=code,
            measured_value=measured_value,
            zone_inactivity_pct=zone_inactivity_pct,
        )

        # Step 3 — M7: Claim text classification
        m7_result = m7_classify_claim_text(description, code)

        # Step 4 — Final payout decision
        status = 'skipped'
        payout = 0
        final_skip_reason = skip_reason

        if layers_passed == 5:
            if m2_result['decision'] == 'reject':
                final_skip_reason = f"M2 fraud rejection: {', '.join(m2_result['flags']) or 'high fraud probability'}"
            elif m2_result['decision'] == 'manual_review' or m7_result['manual_review']:
                final_skip_reason = 'Flagged for manual review (M2/M7 check)'
            else:
                # Use M3 P50 as payout, capped at P90 and worker coverage
                payout = min(m3_result['p50'], m3_result['p90'], avg_coverage)
                status = 'paid'

        # Step 5 — Write claim document
        claim_id = generate_claim_id(uid)
        db.collection('workers').document(uid)\
          .collection('claims').document(claim_id).set({
            'id':                   claim_id,
            'date':                 datetime.utcnow().strftime('%b %d, %Y'),
            'timestamp':            firestore.SERVER_TIMESTAMP,
            'event':                get_event_label(code, str(measured_value) if measured_value else ''),
            'code':                 code,
            'severity':             severity,
            'status':               status,
            'payout':               payout,
            'txn':                  None,
            'zone':                 zone,
            # 5-layer verification
            'verification_layers':  layers_passed,
            'skip_reason':          final_skip_reason,
            'timeline':             build_timeline(layers_passed),
            # M2 fraud detection
            'fraud_decision':       m2_result['decision'],
            'fraud_prob':           m2_result['fraud_prob'],
            'fraud_flags':          m2_result['flags'],
            # M3 income loss estimate
            'income_loss_p10':      m3_result['p10'],
            'income_loss_p50':      m3_result['p50'],
            'income_loss_p90':      m3_result['p90'],
            # M7 text classification
            'text_predicted_code':  m7_result['predicted_code'],
            'text_confidence':      m7_result['confidence'],
            'text_manual_review':   m7_result['manual_review'],
            'description':          description,
        })

        # Step 6 — Write payment if paid
        if status == 'paid':
            from services.payout_service import initiate_upi_payout
            initiate_upi_payout(uid, worker['employee_id'], worker.get('upi_id'), payout, claim_id)

        # Step 7 — Notification
        create_claim_notification(uid, status, payout, code)

        # Step 8 — Update KavachScore
        from services.kavachscore import update_kavach_score_static
        event_type = 'legitimate_claim' if status == 'paid' else 'suspicious_claim'
        update_kavach_score_static(uid, event_type)

        notified += 1

    return notified


def run_5_layer_check(worker: dict, disruption_code: str, zone: str):
    """
    5-layer parametric verification.
    Returns: (layers_passed: int, skip_reason: str|None, orders_today_count: int)
    """
    uid         = worker['uid']
    employee_id = worker.get('employee_id', '')

    # --- Layer 1: Work Intent ---
    recent_orders = list(
        db.collection('orders_week_a')
          .where('employee_id', '==', employee_id)
          .stream()
    )
    if not recent_orders:
        return 0, 'Layer 1 failed: no recent work history', 0

    # --- Layer 2: Disruption Trigger ---
    city = worker.get('city', '')
    disruption_docs = list(
        db.collection('disruptions')
          .where('city', '==', city)
          .where('active', '==', True)
          .stream()
    )
    disruption_exists = any(
        d.to_dict().get('code') == disruption_code for d in disruption_docs
    )
    if not disruption_exists:
        return 1, 'Layer 2 failed: no verified disruption found for city', 0

    # --- Layer 3: Zone Correlation (≥60 % inactive) ---
    zone_workers = list(
        db.collection('workers')
          .where('zone', '==', zone)
          .where('policy_active', '==', True)
          .where('is_deleted', '==', False)
          .stream()
    )
    total_zone = len(zone_workers)
    if total_zone == 0:
        return 2, 'Layer 3 failed: no workers found in zone', 0

    # Mock inactivity for testing
    inactivity_rate = 1.0
    if inactivity_rate < 0.60:
        return 2, f'Layer 3 failed: only {round(inactivity_rate * 100)}% zone inactivity (need 60%)', 0

    # --- Layer 4: GPS / Order inactivity ---
    today_str    = datetime.utcnow().strftime('%Y-%m-%d')
    active_today = [
        o for o in recent_orders
        if o.to_dict().get('order_date', '') == today_str
    ]
    if active_today:
        return 3, 'Layer 4 failed: worker was active during disruption window', len(active_today)

    # --- Layer 5: KavachScore floor ---
    score = worker.get('kavach_score', 750)
    if score < 500:
        return 4, f'Layer 5 failed: KavachScore {score} below minimum 500', 0

    return 5, None, 0


def generate_claim_id(uid: str) -> str:
    ts     = int(datetime.utcnow().timestamp() * 1000)
    suffix = uid[-6:].upper()
    return f'CLM-{suffix}-{ts}'


def get_event_label(code: str, value: str) -> str:
    labels = {
        'HRA': 'Heavy Rain',     'MRA': 'Moderate Rain',    'LRA': 'Light Rain',
        'STM': 'Storm',          'WND': 'High Wind',        'HTV': 'Heatwave',
        'FOG': 'Dense Fog',      'MAQ': 'Moderate AQI',     'SAQ': 'Severe Air Quality',
        'EQK': 'Earthquake',     'FLD': 'Flood',            'CRF': 'Curfew',
        'LND': 'Landslide Risk', 'PND': 'Pandemic Alert',   'WAR': 'Civil Unrest',
    }
    label = labels.get(code, code)
    return f'{label} — {value}' if value else label


def build_timeline(layers_passed: int) -> list:
    steps = [
        'Work intent verified',
        'Disruption trigger confirmed',
        'Zone correlation check',
        'GPS inactivity verified',
        'KavachScore clearance',
    ]
    now      = datetime.utcnow()
    timeline = []
    for i, step in enumerate(steps):
        timeline.append({
            'time':  now.strftime('%I:%M %p'),
            'event': step,
            'done':  i < layers_passed,
        })
    return timeline


def create_claim_notification(uid: str, status: str, payout: int, code: str):
    from services.notification_service import create_notification
    label = get_event_label(code, '')
    if status == 'paid':
        create_notification(
            uid=uid, notif_type='payout',
            title=f'Payout Received — ₹{payout}',
            msg=f'Your claim for {label} has been approved.',
            detail=f'₹{payout} sent to your UPI ID.',
        )
    else:
        create_notification(
            uid=uid, notif_type='alert',
            title=f'Claim Not Approved — {label}',
            msg='Your claim did not pass all verification layers.',
            detail='Check your Claims page for details on which layer failed.',
        )
