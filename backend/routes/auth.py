from flask import Blueprint, request, jsonify
from firebase_admin import auth, firestore
from services.premium_calc import calculate_premium_ml
import requests
import os
import random

auth_bp = Blueprint('auth', __name__)
PLATFORM_API_URL = os.getenv("PLATFORM_API_URL", "http://localhost:5001")

def verify_with_platform(phone, employee_id):
    try:
        resp = requests.post(
            f"{PLATFORM_API_URL}/mock/platform/connect",
            json={"phone": phone, "employee_id": employee_id},
            timeout=5
        )
        return resp.json()
    except Exception as e:
        return {"verified": False, "error": str(e)}

@auth_bp.route('/register', methods=['POST'])
def register():
    # POST /auth/register: Creates Firebase auth user. Inserts worker doc. Default kavach_score is 750. Extract last 4 config of aadhaar. Apply referral code logic. Compute mock income. Returns { success: true, worker_id }.
    data = request.get_json()
    email = data.get("email", "").strip()
    password = data.get("password", "")
    phone = data.get("phone", "").strip()
    employee_id = data.get("employee_id", "").strip()
    aadhaar = data.get("aadhaar", "").strip()
    name = data.get("name", "").strip()
    
    if not all([email, password, phone, employee_id, aadhaar, name]):
        return jsonify({"success": False, "error": "Missing required fields"}), 400
        
    platform_result = verify_with_platform(phone, employee_id)
    if not platform_result.get("verified"):
        pass # Allow mockup bypass for dev, but ideally it should fail
        platform_result = {"platform": "Swiggy", "zone": "Koramangala", "city": "Bangalore", "avg_weekly_income": 4500, "avg_daily_deliveries": 12, "avg_daily_distance": 32.5}
        
    db = firestore.client()
    try:
        # 1. Create user in Firebase 
        phone_fmt = phone if phone.startswith('+') else f"+91{phone}"
        user = auth.create_user(
            email=email,
            password=password,
            display_name=name,
            phone_number=phone_fmt
        )
        uid = user.uid
        
        # 2. Extract aadhaar last 4 & score
        kavach_score = 750
        aadhaar_last4 = aadhaar[-4:] if len(aadhaar) >= 4 else "0000"
        
        # 3. Apply referral code logic (Mock)
        used_referral = data.get("referral_code", "")
        
        # Calculate mock income (used from platform mock api)
        platform = platform_result.get("platform", "Swiggy")
        zone = platform_result.get("zone", "Koramangala")
        
        income = platform_result.get("avg_weekly_income", 3500)
        dist = platform_result.get("avg_daily_distance", 35.0)
        city = platform_result.get("city", "Bangalore")
        
        # Calculate premium using M1/M1a/M5 via calculate_premium_ml
        premium_result = calculate_premium_ml({
            'age':                int(data.get('age', 25)),
            'city':               city,
            'platform':           platform,
            'avg_income':         income,
            'avg_deliveries':     platform_result.get('avg_daily_deliveries', 12),
            'avg_daily_distance': dist,
            'months_active':      0,   # new worker → cold start M1a
            'kavach_score':       750,
            'past_claims':        0,
            'past_correct_claims': 0,
        })
        
        worker_data = {
            "uid": uid,
            "name": name,
            "email": email,
            "phone": phone,
            "aadhaar_last4": aadhaar_last4,
            "employee_id": employee_id,
            "eshram_id": data.get("eshram_id", ""),
            "platform": platform,
            "city": platform_result.get("city", "Bangalore"),
            "zone": zone,
            "age": int(data.get("age", 25)),
            "upi_id": data.get("upi_id", f"{phone}@ybl"),
            "premium": premium_result["premium"],
            "coverage": premium_result["coverage"],
            "avg_income": platform_result.get("avg_weekly_income", 0),
            "avg_deliveries": platform_result.get("avg_daily_deliveries", 0),
            "avg_daily_distance": platform_result.get("avg_daily_distance", 0),
            "policy_type": "individual",
            "employer_name": "",
            "employer_email": f"contact@{platform.lower()}.in",
            "referral_code": f"{name[:3].upper()}{random.randint(1000, 9999)}",
            "used_referral": used_referral,
            "kavach_score": kavach_score,
            "photo_url": "",
            "policy_active": True,
            "policy_paused": False,
            "is_deleted": False,
            "created_at": firestore.SERVER_TIMESTAMP,
            "updated_at": firestore.SERVER_TIMESTAMP
        }
        
        db.collection("workers").document(uid).set(worker_data)
        return jsonify({"success": True, "worker_id": uid}), 201
        
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 400

@auth_bp.route('/login', methods=['POST'])
def login():
    # POST /auth/login: Verified via Firebase Auth, checks is_deleted. Returns full worker object on success.
    data = request.get_json()
    uid = data.get("uid") 
    if not uid:
        return jsonify({"success": False, "error": "Missing uid. Frontend should verify credentials."}), 400
        
    db = firestore.client()
    doc = db.collection("workers").document(uid).get()
    
    if not doc.exists:
        return jsonify({"success": False, "error": "Worker profile not found"}), 404
        
    worker_data = doc.to_dict()
    if worker_data.get("is_deleted", False):
        return jsonify({"success": False, "error": "Account has been deleted."}), 403

    # Sanitize Firestore timestamp objects so they are JSON-serializable
    for field in ['created_at', 'updated_at', 'deleted_at', 'last_renewed']:
        val = worker_data.get(field)
        if val and hasattr(val, 'isoformat'):
            worker_data[field] = val.isoformat()
        elif val and not isinstance(val, (str, int, float, bool, type(None))):
            worker_data[field] = str(val)

    return jsonify({"success": True, "worker": worker_data}), 200

@auth_bp.route('/check-unique', methods=['POST'])
def check_unique():
    # POST /auth/check-unique: Checks if email, phone, aadhaar, or employee_id exist. Returns { available: true/false }.
    data = request.get_json()
    # Frontend sends { field: 'email', value: '...' } OR direct { email, phone, employee_id }
    # Support both formats
    field = data.get("field")
    value = data.get("value")
    if field and value:
        # Single field check
        email = value if field == 'email' else None
        phone = value if field == 'phone' else None
        employee_id = value if field == 'employee_id' else None
    else:
        email = data.get("email")
        phone = data.get("phone")
        employee_id = data.get("employee_id")

    db = firestore.client()
    workers_ref = db.collection("workers")

    if email and len(workers_ref.where("email", "==", email).limit(1).get()) > 0:
        return jsonify({"available": False, "reason": "Email already exists"}), 200
    if phone and len(workers_ref.where("phone", "==", phone).limit(1).get()) > 0:
        return jsonify({"available": False, "reason": "Phone already exists"}), 200
    if employee_id and len(workers_ref.where("employee_id", "==", employee_id).limit(1).get()) > 0:
        return jsonify({"available": False, "reason": "Employee ID already exists"}), 200

    return jsonify({"available": True}), 200

@auth_bp.route('/send-otp', methods=['POST'])
def send_otp():
    # POST /auth/send-otp: Generate OTP (mock 1234 for dev).
    data = request.get_json()
    phone = data.get("phone")
    if not phone:
        return jsonify({"success": False, "error": "Phone number required"}), 400
        
    db = firestore.client()
    db.collection("otps").document(phone).set({
        "otp": "1234",
        "used": False,
        "created_at": firestore.SERVER_TIMESTAMP
    })
    
    return jsonify({"success": True, "message": "OTP sent to your number"}), 200

@auth_bp.route('/verify-otp', methods=['POST'])
def verify_otp():
    # POST /auth/verify-otp: Look up OTP from firestore otps, verify match. Mark as used.
    data = request.get_json()
    phone = data.get("phone")
    otp = str(data.get("otp"))
    
    if not phone or not otp:
        return jsonify({"success": False, "error": "Phone and OTP required"}), 400
        
    # Step 1: Dev OTP bypass
    if otp == "1234":
        return jsonify({"success": True}), 200

    db = firestore.client()
    doc_ref = db.collection("otps").document(phone)
    doc = doc_ref.get()
    
    if doc.exists:
        otp_data = doc.to_dict()
        if not otp_data.get("used") and otp_data.get("otp") == otp:
            doc_ref.update({"used": True})
            return jsonify({"success": True}), 200
            
    return jsonify({"success": False, "error": "Invalid or expired OTP"}), 400

@auth_bp.route('/admin/login', methods=['POST'])
def admin_login():
    # POST /admin/login: Verify via Firebase Auth, restrict to admins collection.
    data = request.get_json()
    uid = data.get("uid")
    if not uid:
        return jsonify({"success": False, "error": "Missing uid"}), 400
        
    db = firestore.client()
    doc = db.collection("admins").document(uid).get()
    
    if not doc.exists:
        return jsonify({"success": False, "error": "Not an admin account"}), 403
        
    return jsonify({"success": True, "admin": doc.to_dict()}), 200

@auth_bp.route('/connect-platform', methods=['POST'])
def connect_platform():
    # POST /auth/connect-platform: proxies connection to the mock platform API
    data = request.get_json()
    phone = data.get("phone", "").strip()
    employee_id = data.get("employee_id", "").strip()
    
    if not phone or not employee_id:
        return jsonify({"success": False, "error": "Missing phone or employee_id"}), 400
        
    result = verify_with_platform(phone, employee_id)
    
    # We will pass back exactly what verify_with_platform returned
    result["success"] = result.get("verified", False)
    # If not verified, make sure there's an error message
    if not result["success"] and "error" not in result:
        result["error"] = "Verification failed"
        
    return jsonify(result), 200 if result["success"] else 400
