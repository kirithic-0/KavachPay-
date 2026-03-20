"""
routes/auth.py — Updated for v6 schema
  - Login now uses phone + employee_id (verified against mock platform API)
  - Signup fetches worker profile from platform API before saving
  - customer_id is now the Firestore document ID
  - referral_code generated on signup
"""

from flask import Blueprint, request, jsonify
from firebase_admin import firestore
from services.premium_calc import calculate_premium_with_explanation
import requests
import os

auth_bp = Blueprint('auth', __name__)

PLATFORM_API_URL = os.getenv("PLATFORM_API_URL", "http://localhost:5001")

DEMO_ADMINS = {
    "admin@kavachpay.in": {"password": "admin123", "role": "Super Admin"},
    "ops@kavachpay.in":   {"password": "ops123",   "role": "Operations Manager"},
}


# ── Helper: call mock platform API ───────────────────────────
def verify_with_platform(phone, employee_id):
    """Calls mock platform API to verify phone + employee_id."""
    try:
        resp = requests.post(
            f"{PLATFORM_API_URL}/platform/verify",
            json={"phone": phone, "employee_id": employee_id},
            timeout=5
        )
        return resp.json()
    except Exception as e:
        return {"verified": False, "error": str(e)}


def fetch_platform_stats(employee_id):
    """Fetches computed stats from mock platform API."""
    try:
        resp = requests.get(
            f"{PLATFORM_API_URL}/platform/stats/{employee_id}",
            timeout=5
        )
        if resp.status_code == 200:
            return resp.json()
    except Exception:
        pass
    return {}


# ── POST /api/auth/login ──────────────────────────────────────
@auth_bp.route('/login', methods=['POST'])
def login():
    """
    Worker login using phone number + employee_id.
    1. Verify credentials against mock platform API.
    2. Look up Firestore by employee_id field (not doc ID).
    3. Return worker profile.
    """
    data        = request.get_json()
    phone       = data.get("phone", "").strip()
    employee_id = data.get("employee_id", "").strip()

    # Also support legacy email login for demo frontend
    email    = data.get("email", "").strip()
    password = data.get("password", "").strip()

    if email and password:
        return _legacy_email_login(email, password)

    if not phone or not employee_id:
        return jsonify({"success": False, "error": "phone and employee_id are required"}), 400

    # Verify with platform
    platform_result = verify_with_platform(phone, employee_id)
    if not platform_result.get("verified"):
        return jsonify({"success": False, "error": platform_result.get("error", "Verification failed")}), 401

    customer_id = platform_result["customer_id"]

    # Fetch from Firestore
    db  = firestore.client()
    doc = db.collection("workers").document(customer_id).get()

    if doc.exists:
        worker_data = doc.to_dict()
        worker_data["customer_id"] = customer_id
        return jsonify({"success": True, "worker": worker_data}), 200

    # Worker verified on platform but not yet enrolled on KavachPay
    return jsonify({
        "success":     False,
        "error":       "Worker verified but not enrolled on KavachPay. Please sign up.",
        "customer_id": customer_id,
        "platform_data": platform_result,
    }), 404


def _legacy_email_login(email, password):
    """Fallback email login matching frontend demo credentials."""
    DEMO_WORKERS = {
        "ravi@kavachpay.in":      {"password": "ravi123",      "customer_id": "SWG-2847361"},
        "priya@kavachpay.in":     {"password": "priya123",     "customer_id": "ZMT-1928374"},
        "mohammed@kavachpay.in":  {"password": "mohammed123",  "customer_id": "ZMT-3746251"},
    }
    if email not in DEMO_WORKERS or DEMO_WORKERS[email]["password"] != password:
        return jsonify({"success": False, "error": "Invalid credentials"}), 401

    db          = firestore.client()
    customer_id = DEMO_WORKERS[email]["customer_id"]
    doc         = db.collection("workers").document(customer_id).get()

    if doc.exists:
        worker_data = doc.to_dict()
        worker_data["customer_id"] = customer_id
        return jsonify({"success": True, "worker": worker_data}), 200

    return jsonify({"success": True, "worker": {"customer_id": customer_id, "email": email}}), 200


# ── POST /api/auth/admin/login ────────────────────────────────
@auth_bp.route('/admin/login', methods=['POST'])
def admin_login():
    data     = request.get_json()
    email    = data.get("email", "")
    password = data.get("password", "")

    if email in DEMO_ADMINS and DEMO_ADMINS[email]["password"] == password:
        return jsonify({"success": True, "admin": {"email": email, "role": DEMO_ADMINS[email]["role"]}}), 200

    return jsonify({"success": False, "error": "Invalid admin credentials"}), 401


# ── POST /api/auth/signup ─────────────────────────────────────
@auth_bp.route('/signup', methods=['POST'])
def signup():
    """
    Worker enrolment flow:
    1. Verify phone + employee_id with platform API.
    2. Fetch full profile and stats from platform.
    3. Calculate premium.
    4. Save to Firestore with customer_id as document ID.
    """
    db   = firestore.client()
    data = request.get_json()

    phone       = data.get("phone", "").strip()
    employee_id = data.get("employee_id", "").strip()

    if not phone or not employee_id:
        return jsonify({"error": "phone and employee_id are required"}), 400

    # Step 1: Verify with platform
    platform_result = verify_with_platform(phone, employee_id)
    if not platform_result.get("verified"):
        return jsonify({"error": platform_result.get("error", "Platform verification failed")}), 401

    customer_id = platform_result["customer_id"]

    # Step 2: Check not already enrolled
    existing = db.collection("workers").document(customer_id).get()
    if existing.exists:
        return jsonify({"error": "Worker already enrolled on KavachPay", "customer_id": customer_id}), 409

    # Step 3: Fetch stats from platform
    stats = fetch_platform_stats(employee_id)

    # Step 4: Build worker document
    age            = int(data.get("age", 26))
    platform       = platform_result["platform"]
    zone           = platform_result["zone"]
    months_active  = int(data.get("months_active", 0))

    premium_result = calculate_premium_with_explanation(
        zone=zone, age=age, platform=platform, months_active=months_active
    )

    worker = {
        # IDs
        "customer_id":           customer_id,
        "employee_id":           employee_id,
        "referral_code":         platform_result.get("referral_code", ""),

        # Identity
        "name":                  platform_result["name"],
        "email":                 data.get("email", platform_result.get("email", "")),
        "phone":                 phone,
        "age":                   age,

        # Location
        "city":                  platform_result["city"],
        "zone":                  zone,
        "city_tier":             1,

        # Platform
        "platform":              platform,

        # Risk & Insurance
        "risk":                  premium_result.get("riskTier", "medium").split()[0].lower(),
        "risk_multiplier":       premium_result.get("totalRiskScore", 1.0),
        "premium":               premium_result["premium"],
        "coverage":              premium_result["coverage"],
        "coverage_ratio":        0.65,

        # Stats from platform API
        "avg_weekly_income":     stats.get("avg_weekly_income", 0),
        "avg_daily_distance":    stats.get("avg_daily_distance", 0),
        "avg_daily_deliveries":  stats.get("avg_daily_deliveries", 0),

        # KavachPay
        "kavachScore":           750,
        "policyStatus":          "active",
        "months_active":         months_active,
        "typical_workdays":      stats.get("typical_workdays", []),
        "social_disruption_exposure": "medium",

        # Claims
        "past_claims":           0,
        "past_correct_claims":   0,
        "total_claims":          0,
        "total_paid":            0,

        "enrolledAt":            firestore.SERVER_TIMESTAMP,
    }

    db.collection("workers").document(customer_id).set(worker)

    return jsonify({
        "success":     True,
        "customer_id": customer_id,
        "employee_id": employee_id,
        "premium":     premium_result["premium"],
        "coverage":    premium_result["coverage"],
        "breakdown":   premium_result.get("breakdown", {}),
    }), 201


# ── OTP flows (simulated) ─────────────────────────────────────
@auth_bp.route('/forgot-password', methods=['POST'])
def forgot_password():
    return jsonify({"success": True, "message": "OTP sent"}), 200

@auth_bp.route('/verify-otp', methods=['POST'])
def verify_otp():
    otp = str(request.get_json().get("otp", ""))
    if otp == "1234":
        return jsonify({"success": True}), 200
    return jsonify({"success": False, "error": "Invalid OTP"}), 400

@auth_bp.route('/reset-password', methods=['POST'])
def reset_password():
    return jsonify({"success": True, "message": "Password reset successfully"}), 200
