import razorpay
from flask import Blueprint, request, jsonify, current_app
import uuid

payment_bp = Blueprint('payment', __name__)

@payment_bp.route('/create-order', methods=['POST'])
def create_order():
    data = request.get_json()
    amount = data.get('amount')
    currency = data.get('currency', 'INR')

    if not amount:
        return jsonify({"success": False, "error": "Amount is required"}), 400

    key_id = current_app.config.get('RAZORPAY_KEY_ID')
    key_secret = current_app.config.get('RAZORPAY_KEY_SECRET')

    if not key_id or not key_secret:
        # Mock mode if keys are not provided
        return jsonify({
            "success": True, 
            "order_id": f"order_mock_{uuid.uuid4().hex[:12]}", 
            "amount": amount,
            "currency": currency
        }), 200

    try:
        client = razorpay.Client(auth=(key_id, key_secret))
        order_data = {'amount': int(amount * 100), 'currency': currency, 'payment_capture': '1'}
        order = client.order.create(data=order_data)
        return jsonify({
            'success': True,
            'order_id': order['id'],
            'amount': amount,
            'currency': currency
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@payment_bp.route('/verify', methods=['POST'])
def verify_payment():
    data = request.get_json()
    razorpay_order_id = data.get('razorpay_order_id')
    razorpay_payment_id = data.get('razorpay_payment_id')
    razorpay_signature = data.get('razorpay_signature')

    key_id = current_app.config.get('RAZORPAY_KEY_ID')
    key_secret = current_app.config.get('RAZORPAY_KEY_SECRET')

    if not key_id or not key_secret or str(razorpay_order_id).startswith('order_mock_'):
        # Mock success
        return jsonify({"success": True}), 200

    try:
        client = razorpay.Client(auth=(key_id, key_secret))
        client.utility.verify_payment_signature({
            'razorpay_order_id': razorpay_order_id,
            'razorpay_payment_id': razorpay_payment_id,
            'razorpay_signature': razorpay_signature
        })
        return jsonify({'success': True}), 200
    except razorpay.errors.SignatureVerificationError:
        return jsonify({'success': False, 'error': 'Signature verification failed'}), 400
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500
