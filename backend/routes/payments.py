from flask import Blueprint, request, jsonify
from firebase_admin import firestore
from utils.auth_middleware import require_auth

payments_bp = Blueprint('payments', __name__)

@payments_bp.route('/<uid>', methods=['GET'])
@require_auth
def get_user_payments(uid):
    # Workers can only read their own payments
    if request.user.get('uid') != uid:
        return jsonify({'error': 'Forbidden'}), 403

    db = firestore.client()
    pay_type = request.args.get('type')  # premium or payout

    query = db.collection('payments').where('uid', '==', uid)

    if pay_type:
        query = query.where('type', '==', pay_type)

    query = query.order_by('created_at', direction=firestore.Query.DESCENDING)

    results = query.stream()
    payments = []
    for doc in results:
        p = doc.to_dict()
        p['id'] = doc.id
        # Convert Firestore timestamp to ISO string for JSON serialization
        if 'created_at' in p and hasattr(p['created_at'], 'isoformat'):
            p['created_at'] = p['created_at'].isoformat()
        payments.append(p)

    return jsonify({'payments': payments})