from firebase_admin import firestore

def update_kavach_score(worker_id, event_type):
    db = firestore.client()
    worker_ref = db.collection('workers').document(worker_id)
    worker = worker_ref.get().to_dict()

    if not worker:
        return None

    score = worker.get('kavachScore', 750)

    score_changes = {
        'legitimate_claim':    +10,
        'weekly_active':       +5,
        'tenure_6months':      +15,
        'zero_fraud_30days':   +8,
        'profile_complete':    +12,
        'suspicious_pattern':  -25,
        'active_during_claim': -20,
        'missed_declaration':  -5,
        'policy_lapse':        -10,
    }

    score += score_changes.get(event_type, 0)
    score = max(300, min(900, score))  # Keep within 300-900

    worker_ref.update({'kavachScore': score})
    return score


def get_score_tier(score):
    if score >= 750:
        return {
            'tier': 'green',
            'label': 'Excellent',
            'payout_speed': 'Instant',
            'premium_modifier': 1.0
        }
    elif score >= 500:
        return {
            'tier': 'yellow',
            'label': 'Good',
            'payout_speed': '2-hour delay',
            'premium_modifier': 1.1
        }
    else:
        return {
            'tier': 'red',
            'label': 'Review Needed',
            'payout_speed': '24-hour delay + manual review',
            'premium_modifier': 1.25
        }