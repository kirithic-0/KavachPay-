from flask import Blueprint, request, jsonify
from firebase_admin import firestore
from services.kavachscore import get_score_tier

workers_bp = Blueprint('workers', __name__)


@workers_bp.route('/<worker_id>', methods=['GET'])
def get_worker(worker_id):
    db = firestore.client()
    doc = db.collection('workers').document(worker_id).get()
    if not doc.exists:
        return jsonify({'error': 'Worker not found'}), 404
    data = doc.to_dict()
    data['id'] = worker_id
    return jsonify(data), 200


@workers_bp.route('/<worker_id>', methods=['PUT'])
def update_worker(worker_id):
    db = firestore.client()
    data = request.get_json()
    db.collection('workers').document(worker_id).update(data)
    return jsonify({'success': True, 'message': 'Worker updated'}), 200


@workers_bp.route('/<worker_id>/pause', methods=['PUT'])
def pause_policy(worker_id):
    db = firestore.client()
    data = request.get_json()
    paused = data.get('paused', True)
    status = 'paused' if paused else 'active'
    db.collection('workers').document(worker_id).update({'policyStatus': status})
    return jsonify({'success': True, 'policyStatus': status}), 200


@workers_bp.route('/<worker_id>/claims', methods=['GET'])
def get_worker_claims(worker_id):
    db = firestore.client()
    claims_ref = db.collection('claims').where('workerId', '==', worker_id).stream()
    claims = [{'id': c.id, **c.to_dict()} for c in claims_ref]
    return jsonify({'claims': claims}), 200


@workers_bp.route('/<worker_id>/score', methods=['GET'])
def get_worker_score(worker_id):
    db = firestore.client()
    doc = db.collection('workers').document(worker_id).get()
    if not doc.exists:
        return jsonify({'error': 'Worker not found'}), 404
    worker = doc.to_dict()
    score = worker.get('kavachScore', 750)
    tier = get_score_tier(score)
    return jsonify({'score': score, 'tier': tier}), 200


@workers_bp.route('/<worker_id>/notifications', methods=['GET'])
def get_notifications(worker_id):
    # Hardcoded for Phase 1
    return jsonify({'notifications': [
        {'id': 1, 'type': 'alert',   'message': 'Heavy rain expected in your zone tomorrow', 'time': '2 hours ago'},
        {'id': 2, 'type': 'payout',  'message': 'Payout of ₹780 processed successfully',     'time': 'Yesterday'},
        {'id': 3, 'type': 'premium', 'message': 'Weekly premium of ₹59 auto-debited',        'time': '3 days ago'},
    ]}), 200