from datetime import datetime, timedelta

def get_week_start():
    """Returns midnight Monday of the current week in UTC."""
    now = datetime.utcnow()
    days_since_monday = now.weekday()
    monday = now - timedelta(days=days_since_monday)
    return datetime(monday.year, monday.month, monday.day)

def generate_claim_id(uid: str):
    import uuid
    return f"CLM-{uuid.uuid4().hex[:8].upper()}"

def get_event_label(code: str, fallback: str = ""):
    events = {
        'HRA': 'Heavy Rain', 'SAQ': 'Severe Air Quality', 'EQK': 'Earthquake',
        'FLD': 'Flood', 'LND': 'Landslide Risk', 'HWT': 'Heatwave',
        'CRF': 'Curfew', 'PND': 'Pandemic Alert', 'WAR': 'Civil Unrest'
    }
    return events.get(code, fallback or code)

def build_timeline(layers: int):
    events = [
        "Disruption Detected",
        "Work Intent Verified",
        "Worker Inactivity Corroborated",
        "Zone Pattern Match",
        "Identity & Score Validated"
    ]
    timeline = []
    for i in range(layers):
        timeline.append({
            'activity': events[i],
            'time': datetime.utcnow().strftime('%I:%M %p'),
            'status': 'completed'
        })
    return timeline

def generate_referral_code(name: str):
    import random
    import string
    prefix = name[:3].upper() if name else "KAV"
    suffix = ''.join(random.choices(string.ascii_uppercase + string.digits, k=4))
    return f"{prefix}{suffix}"

def success_response(data, status=200):
    """Standard success response wrapper"""
    return {"success": True, "data": data}, status

def error_response(message, status=400):
    """Standard error response wrapper"""
    return {"success": False, "error": message}, status

def serialize_doc(doc):
    """Converts a Firestore document to a plain dict with its ID included"""
    if not doc.exists:
        return None
    data = doc.to_dict()
    data['id'] = doc.id
    return data

def serialize_docs(docs):
    """Converts a list of Firestore documents to plain dicts"""
    return [serialize_doc(d) for d in docs]