from flask import Blueprint, request, jsonify
from firebase_admin import firestore
from services.premium_calc import calculate_premium

auth_bp = Blueprint('auth', __name__)

# Demo credentials that match the frontend
DEMO_WORKERS = {
    "ravi@kavachpay.in":      {"password": "ravi123",     "id": "worker_ravi"},
    "priya@kavachpay.in":     {"password": "priya123",    "id": "worker_priya"},
    "mohammed@kavachpay.in":  {"password": "mohammed123", "id": "worker_mohammed"},
}
DEMO_ADMINS = {
    "admin@kavachpay.in": {"password": "admin123", "role": "Super Admin"},
    "ops@kavachpay.in":   {"password": "ops123",   "role": "Operations Manager"},
}


@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email', '')
    password = data.get('password', '')

    if email in DEMO_WORKERS and DEMO_WORKERS[email]['password'] == password:
        db = firestore.client()
        worker_id = DEMO_WORKERS[email]['id']
        doc = db.collection('workers').document(worker_id).get()

        if doc.exists:
            worker_data = doc.to_dict()
            worker_data['id'] = worker_id
            return jsonify({'success': True, 'worker': worker_data}), 200

        # Return basic demo data if not in Firestore yet
        return jsonify({
            'success': True,
            'worker': {'id': worker_id, 'email': email, 'kavachScore': 750}
        }), 200

    return jsonify({'success': False, 'error': 'Invalid credentials'}), 401


@auth_bp.route('/admin/login', methods=['POST'])
def admin_login():
    data = request.get_json()
    email = data.get('email', '')
    password = data.get('password', '')

    if email in DEMO_ADMINS and DEMO_ADMINS[email]['password'] == password:
        return jsonify({
            'success': True,
            'admin': {'email': email, 'role': DEMO_ADMINS[email]['role']}
        }), 200

    return jsonify({'success': False, 'error': 'Invalid admin credentials'}), 401


@auth_bp.route('/signup', methods=['POST'])
def signup():
    db = firestore.client()
    data = request.get_json()

    required = ['name', 'email', 'phone', 'zone', 'platform', 'age']
    for field in required:
        if field not in data:
            return jsonify({'error': f'Missing field: {field}'}), 400

    premium = calculate_premium(
        zone=data['zone'],
        age=int(data.get('age', 26)),
        platform=data['platform'],
        months_active=int(data.get('months_active', 0))
    )

    worker = {
        'name':           data['name'],
        'email':          data['email'],
        'phone':          data['phone'],
        'age':            int(data.get('age', 26)),
        'zone':           data['zone'],
        'platform':       data['platform'],
        'employeeId':     data.get('employeeId', ''),
        'premium':        premium,
        'coverage':       1200,
        'avgIncome':      int(data.get('avgIncome', 1800)),
        'kavachScore':    750,
        'policyStatus':   'active',
        'day_started':    False,
        'months_active':  int(data.get('months_active', 0)),
        'enrolledAt':     firestore.SERVER_TIMESTAMP
    }

    doc_ref = db.collection('workers').add(worker)
    worker_id = doc_ref[1].id

    return jsonify({
        'success':   True,
        'worker_id': worker_id,
        'premium':   premium,
        'coverage':  1200
    }), 201


@auth_bp.route('/forgot-password', methods=['POST'])
def forgot_password():
    # Simulated OTP flow - OTP is always 1234
    return jsonify({'success': True, 'message': 'OTP sent to your email'}), 200


@auth_bp.route('/verify-otp', methods=['POST'])
def verify_otp():
    data = request.get_json()
    otp = data.get('otp', '')
    if str(otp) == '1234':
        return jsonify({'success': True, 'message': 'OTP verified'}), 200
    return jsonify({'success': False, 'error': 'Invalid OTP'}), 400


@auth_bp.route('/reset-password', methods=['POST'])
def reset_password():
    return jsonify({'success': True, 'message': 'Password reset successfully'}), 200