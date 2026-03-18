from flask import Blueprint, request, jsonify
from firebase_admin import firestore
import uuid

payments_bp = Blueprint('payments', __name__)


@payments_bp.route('/premium', methods=['POST'])
def process_premium():
    db = firestore.client()
    data = request.get_json()

    worker_id = data.get('workerId')
    amount = data.get('amount', 59)
    txn_id = f"pay_{uuid.uuid4().hex[:12]}"

    payment = {
        'workerId':  worker_id,
        'amount':    amount,
        'type':      'premium',
        'method':    data.get('method', 'upi'),
        'txnId':     txn_id,
        'status':    'success',
        'createdAt': firestore.SERVER_TIMESTAMP
    }

    db.collection('payments').add(payment)

    return jsonify({
        'success': True,
        'txnId':   txn_id,
        'amount':  amount,
        'message': 'Premium payment successful'
    }), 200


@payments_bp.route('/payout', methods=['POST'])
def trigger_payout():
    data = request.get_json()
    txn_id = f"pay_{uuid.uuid4().hex[:12]}"

    return jsonify({
        'success': True,
        'txnId':   txn_id,
        'amount':  data.get('amount', 0),
        'message': 'Payout triggered successfully'
    }), 200


@payments_bp.route('/<worker_id>', methods=['GET'])
def get_payment_history(worker_id):
    db = firestore.client()
    payments_ref = db.collection('payments').where('workerId', '==', worker_id).stream()
    payments = [{'id': p.id, **p.to_dict()} for p in payments_ref]
    return jsonify({'payments': payments}), 200