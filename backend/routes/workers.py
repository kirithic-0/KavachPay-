from flask import Blueprint, request, jsonify
from firebase_admin import firestore, storage
from utils.auth_middleware import require_auth

workers_bp = Blueprint('workers', __name__)

@workers_bp.route('/<id>', methods=['GET'])
@require_auth
def get_worker(id):
    # Ensure current user is the worker being requested
    if request.user.get('uid') != id:
        return jsonify({"error": "Unauthorized access to another worker's profile"}), 403

    db = firestore.client()
    doc = db.collection("workers").document(id).get()
    if not doc.exists:
        return jsonify({"success": False, "error": "Worker not found"}), 404
    data = doc.to_dict()
    # Sanitize Firestore timestamp fields so they are JSON-serializable
    for field in ['created_at', 'updated_at', 'deleted_at']:
        if field in data and hasattr(data[field], 'isoformat'):
            data[field] = data[field].isoformat()
    return jsonify(data), 200

@workers_bp.route('/<id>', methods=['PATCH'])
@require_auth
def update_worker(id):
    # Ensure current user is the worker being requested
    if request.user.get('uid') != id:
        return jsonify({"error": "Unauthorized access"}), 403

    db = firestore.client()
    data = request.get_json()
    
    # Disallow protected fields
    protected_fields = ['aadhaar_last4', 'employee_id', 'uid', 'created_at']
    for field in protected_fields:
        data.pop(field, None)
        
    data['updated_at'] = firestore.SERVER_TIMESTAMP
    db.collection("workers").document(id).update(data)
    
    return jsonify({"success": True, "message": "Profile updated"}), 200

@workers_bp.route('/<id>/weekly-income', methods=['GET'])
@require_auth
def get_weekly_income(id):
    # Ensure current user is the worker being requested
    if request.user.get('uid') != id:
        return jsonify({"error": "Unauthorized access"}), 403

    db = firestore.client()
    doc = db.collection("workers").document(id).get()
    if not doc.exists:
        return jsonify({"success": False, "error": "Worker not found"}), 404
        
    worker = doc.to_dict()
    employee_id = worker.get("employee_id")
    
    if not employee_id:
        return jsonify({"error": "No employee ID associated"}), 400
        
    weeks = [("Week D", "orders_week_d"), ("Week C", "orders_week_c"), ("Week B", "orders_week_b"), ("Week A", "orders_week_a")]
    income_data = []
    total_incomes = []
    

    
    for label, coll in weeks:
        orders = db.collection(coll).where("employee_id", "==", employee_id).stream()
        
        income = 0
        dist = 0
        count = 0
        
        for o in orders:
            od = o.to_dict()
            income += od.get('amount_paid', 0)
            dist += od.get('distance', 0)
            count += 1
            

            
        income_data.append({
            "week": label,
            "income": round(income),
            "orders": count,
            "avg_distance": round(dist/count, 1) if count else 0
        })
        total_incomes.append(income)
        
    avg_weekly_income = sum(total_incomes) / len(total_incomes) if total_incomes else 0
    
    return jsonify({
        "employee_id": employee_id,
        "avg_weekly_income": round(avg_weekly_income),
        "weekly_income": income_data
    }), 200

@workers_bp.route('/<id>/stats', methods=['GET'])
@require_auth
def get_worker_stats(id):
    # Ensure current user is the worker being requested
    if request.user.get('uid') != id:
        return jsonify({"error": "Unauthorized access"}), 403

    db = firestore.client()
    worker_doc = db.collection('workers').document(id).get()
    if not worker_doc.exists:
        return jsonify({"error": "Worker not found"}), 404

    worker = worker_doc.to_dict()

    # Use aggregate count() instead of streaming all claim docs — saves N document reads
    try:
        count_result = db.collection('workers').document(id)\
                         .collection('claims').count().get()
        claims_count = count_result[0][0].value
    except Exception:
        # Fallback for older SDK versions that don't support count()
        claims_count = len(list(db.collection('workers').document(id).collection('claims').stream()))

    return jsonify({
        "claims_count": claims_count,
        "policy_status": "active" if worker.get('policy_active') else "paused",
        "avg_score": worker.get('kavach_score', 750)
    }), 200

@workers_bp.route('/<id>/zone', methods=['PATCH'])
@require_auth
def update_zone(id):
    # Ensure current user is the worker being requested
    if request.user.get('uid') != id:
        return jsonify({"error": "Unauthorized access"}), 403

    db = firestore.client()
    data = request.get_json()
    new_zone = data.get("zone")
    
    if not new_zone:
        return jsonify({"success": False, "error": "Zone required"}), 400
        
    db.collection("workers").document(id).update({
        "zone": new_zone,
        "updated_at": firestore.SERVER_TIMESTAMP
    })
    
    # Create notification using service helper
    from services.notification_service import create_notification
    create_notification(id, 'zone', 'Zone Updated', f"Your primary delivery zone is now '{new_zone}'.")
    
    return jsonify({"success": True}), 200

@workers_bp.route('/<id>', methods=['DELETE'])
@require_auth
def delete_worker(id):
    # Ensure current user is the worker being requested
    if request.user.get('uid') != id:
        return jsonify({"error": "Unauthorized access"}), 403

    db = firestore.client()
    db.collection("workers").document(id).update({
        "is_deleted": True,
        "policy_active": False,
        "deleted_at": firestore.SERVER_TIMESTAMP,
        "updated_at": firestore.SERVER_TIMESTAMP
    })
    return jsonify({"success": True, "message": "Account deleted successfully"}), 200

@workers_bp.route('/<id>/photo', methods=['POST'])
@require_auth
def upload_photo(id):
    # Ensure current user is the worker being requested
    if request.user.get('uid') != id:
        return jsonify({"error": "Unauthorized access"}), 403

    if 'photo' not in request.files:
        return jsonify({"success": False, "error": "No photo uploaded"}), 400
        
    file = request.files['photo']
    if file.filename == '':
        return jsonify({"success": False, "error": "No file selected"}), 400
        
    try:
        bucket = storage.bucket()
        blob = bucket.blob(f"profile-photos/{id}/avatar.jpg")
        blob.upload_from_string(file.read(), content_type=file.content_type)
        blob.make_public()
        
        photo_url = blob.public_url
        
        db = firestore.client()
        db.collection("workers").document(id).update({
            "photo_url": photo_url,
            "updated_at": firestore.SERVER_TIMESTAMP
        })
        
        return jsonify({"success": True, "photo_url": photo_url}), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 400

@workers_bp.route('/<id>/notifications', methods=['GET'])
@require_auth
def get_notifications(id):
    # Ensure current user is the worker being requested
    if request.user.get('uid') != id:
        return jsonify({"error": "Unauthorized access"}), 403

    db = firestore.client()
    notifs = db.collection('workers').document(id).collection('notifications')\
               .order_by('timestamp', direction=firestore.Query.DESCENDING).limit(20).stream()
    
    results = []
    for n in notifs:
        d = n.to_dict()
        if d.get('timestamp'):
            d['timestamp'] = d['timestamp'].isoformat()
        results.append(d)
        
    return jsonify({"notifications": results}), 200

@workers_bp.route('/<uid>/chatbot-context', methods=['GET'])
@require_auth
def chatbot_context(uid):
    # Ensure current user is the worker being requested
    if request.user.get('uid') != uid:
        return jsonify({'error': 'Unauthorized'}), 403

    db = firestore.client()
    worker_doc = db.collection('workers').document(uid).get()
    if not worker_doc.exists:
        return jsonify({'error': 'Worker not found'}), 404

    worker = worker_doc.to_dict()

    # Claims — last 5
    claims_docs = db.collection('workers').document(uid)\
        .collection('claims')\
        .order_by('timestamp', direction=firestore.Query.DESCENDING)\
        .limit(5).stream()
    claims = []
    for c in claims_docs:
        cd = c.to_dict()
        if cd.get('timestamp'):
            cd['timestamp'] = cd['timestamp'].isoformat()
        claims.append(cd)

    # Notifications — last 5
    notif_docs = db.collection('workers').document(uid)\
        .collection('notifications')\
        .order_by('timestamp', direction=firestore.Query.DESCENDING)\
        .limit(5).stream()
    notifications = []
    for n in notif_docs:
        nd = n.to_dict()
        if nd.get('timestamp'):
            nd['timestamp'] = nd['timestamp'].isoformat()
        notifications.append(nd)

    # Weather + AQI
    from services.weather_service import get_weather, get_aqi
    city = worker.get('city', 'Bangalore')
    weather_data = get_weather(city)
    aqi_data = get_aqi(city)

    return jsonify({
        'name': worker.get('name'),
        'zone': worker.get('zone'),
        'city': city,
        'platform': worker.get('platform'),
        'premium': worker.get('premium'),
        'coverage': worker.get('coverage'),
        'avg_income': worker.get('avg_income'),
        'avg_deliveries': worker.get('avg_deliveries'),
        'avg_daily_distance': worker.get('avg_daily_distance'),
        'kavach_score': worker.get('kavach_score'),
        'policy_type': worker.get('policy_type'),
        'policy_active': worker.get('policy_active'),
        'employee_id': worker.get('employee_id'),
        'eshram_id': worker.get('eshram_id'),
        'referral_code': worker.get('referral_code'),
        'claims': claims,
        'notifications': notifications,
        'weather': weather_data,
        'aqi': aqi_data,
    })
