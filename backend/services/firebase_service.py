from firebase_admin import firestore


def get_db():
    return firestore.client()


def get_worker(worker_id):
    db = get_db()
    doc = db.collection('workers').document(worker_id).get()
    if not doc.exists:
        return None
    data = doc.to_dict()
    data['id'] = worker_id
    return data


def update_worker(worker_id, updates):
    db = get_db()
    db.collection('workers').document(worker_id).update(updates)


def get_zone_workers(zone):
    db = get_db()
    workers_ref = db.collection('workers').where('zone', '==', zone).stream()
    return [{'id': w.id, **w.to_dict()} for w in workers_ref]


def save_claim(claim_data):
    db = get_db()
    claim_data['createdAt'] = firestore.SERVER_TIMESTAMP
    ref = db.collection('claims').add(claim_data)
    return ref[1].id


def save_disruption(disruption_data):
    db = get_db()
    disruption_data['triggeredAt'] = firestore.SERVER_TIMESTAMP
    ref = db.collection('disruptions').add(disruption_data)
    return ref[1].id