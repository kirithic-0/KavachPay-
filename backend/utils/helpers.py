from datetime import datetime


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


def get_timestamp_string():
    """Returns current UTC time as a readable string"""
    return datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")