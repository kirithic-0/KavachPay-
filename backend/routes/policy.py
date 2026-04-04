from flask import Blueprint, request, jsonify
from firebase_admin import firestore
from utils.auth_middleware import require_auth
import uuid

policy_bp = Blueprint('policy', __name__)

@policy_bp.route('/renew', methods=['POST'])
@require_auth
def renew_policy():
    db = firestore.client()
    data = request.get_json()
    uid = data.get("uid")
    
    if not uid:
        return jsonify({"success": False, "error": "Missing uid"}), 400
        
    doc_ref = db.collection("workers").document(uid)
    doc = doc_ref.get()
    
    if not doc.exists:
        return jsonify({"success": False, "error": "Worker not found"}), 404
        
    worker = doc.to_dict()
    premium_amount = worker.get("premium", 0)
    
    payment_id = f"PAY-{uuid.uuid4().hex[:8].upper()}"
    payment_record = {
        "payment_id": payment_id,
        "uid": uid,
        "employee_id": worker.get("employee_id"),
        "type": "premium",
        "amount": premium_amount,
        "method": "upi",
        "razorpay_txn_id": f"rzp_{uuid.uuid4().hex[:12]}",
        "claim_id": None,
        "status": "success",
        "created_at": firestore.SERVER_TIMESTAMP
    }
    db.collection("payments").add(payment_record)
    
    doc_ref.update({
        "policy_active": True,
        "policy_paused": False,
        "last_renewed": firestore.SERVER_TIMESTAMP,
        "updated_at": firestore.SERVER_TIMESTAMP
    })
    
    db.collection("workers").document(uid).collection("notifications").add({
        "type": "policy",
        "title": "Policy Renewed",
        "msg": f"Your KavachPay policy was successfully renewed for ₹{premium_amount}.",
        "read": False,
        "timestamp": firestore.SERVER_TIMESTAMP
    })
    
    return jsonify({"success": True, "message": "Policy renewed successfully"}), 200

@policy_bp.route('/pause', methods=['POST'])
@require_auth
def pause_policy():
    db = firestore.client()
    data = request.get_json()
    uid = data.get("uid")
    
    if not uid:
        return jsonify({"success": False, "error": "Missing uid"}), 400
        
    doc_ref = db.collection("workers").document(uid)
    doc_ref.update({
        "policy_active": False,
        "policy_paused": True,
        "updated_at": firestore.SERVER_TIMESTAMP
    })
    
    db.collection("workers").document(uid).collection("notifications").add({
        "type": "policy",
        "title": "Policy Paused",
        "msg": "Your KavachPay policy has been paused. You are no longer covered for disruptions.",
        "read": False,
        "timestamp": firestore.SERVER_TIMESTAMP
    })
    
    return jsonify({"success": True, "message": "Policy paused"}), 200
