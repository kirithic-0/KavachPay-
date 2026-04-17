from flask import Blueprint, request, jsonify
from firebase_admin import firestore
from utils.auth_middleware import require_auth
from services.score_engine import update_kavach_score_static, analyze_fraud_risk_ml
from datetime import datetime
import uuid

claims_bp = Blueprint('claims', __name__)

@claims_bp.route('/<worker_id>', methods=['GET'])
@require_auth
def get_claims(worker_id):
    db = firestore.client()
    claims_ref = db.collection("workers").document(worker_id).collection("claims").order_by("timestamp", direction=firestore.Query.DESCENDING).get()
    
    claims = []
    for doc in claims_ref:
        doc_dict = doc.to_dict()
        doc_dict["id"] = doc.id

        # ── 5-layer verification aliases ──
        doc_dict["verificationLayers"] = doc_dict.get("verification_layers", 0)
        doc_dict["skipReason"]         = doc_dict.get("skip_reason", "")

        # ── M2 fraud detection aliases ──
        doc_dict["fraudDecision"] = doc_dict.get("fraud_decision", "auto_approve")
        doc_dict["fraudProb"]     = doc_dict.get("fraud_prob", 0.0)
        doc_dict["fraudFlags"]    = doc_dict.get("fraud_flags", [])

        # ── M3 income loss aliases ──
        doc_dict["incomeLossP10"] = doc_dict.get("income_loss_p10", 0)
        doc_dict["incomeLossP50"] = doc_dict.get("income_loss_p50", 0)
        doc_dict["incomeLossP90"] = doc_dict.get("income_loss_p90", 0)

        # ── M7 text classification aliases ──
        doc_dict["textPredictedCode"]  = doc_dict.get("text_predicted_code", "")
        doc_dict["textConfidence"]     = doc_dict.get("text_confidence", 0.0)
        doc_dict["textManualReview"]   = doc_dict.get("text_manual_review", False)

        # Convert Firestore timestamps to ISO strings for JSON serialization
        for ts_field in ['timestamp', 'date']:
            val = doc_dict.get(ts_field)
            if val and hasattr(val, 'isoformat'):
                doc_dict[ts_field] = val.isoformat()
        # Ensure date is always a human-readable string
        if 'date' not in doc_dict or not isinstance(doc_dict.get('date'), str):
            doc_dict['date'] = datetime.utcnow().strftime('%b %d, %Y')
        # Sanitize timeline timestamps
        for tl in doc_dict.get('timeline', []):
            if 'time' in tl and hasattr(tl['time'], 'isoformat'):
                tl['time'] = tl['time'].isoformat()
        claims.append(doc_dict)
        
    return jsonify({"success": True, "claims": claims}), 200

@claims_bp.route('/create', methods=['POST'])
@require_auth
def create_claim():
    db = firestore.client()
    data = request.get_json()
    
    worker_id = data.get("worker_id")
    event = data.get("event")
    code = data.get("code")
    severity = data.get("severity")
    manual_claim = data.get("manual_claim", True)
    zone = data.get("zone")
    description = data.get("description", "")
    incident_date = data.get("incident_date", datetime.utcnow().strftime('%b %d, %Y'))
    
    if not all([worker_id, event, code, severity, zone]):
        return jsonify({"success": False, "error": "Missing required fields"}), 400
        
    doc_ref = db.collection("workers").document(worker_id).get()
    if not doc_ref.exists:
        return jsonify({"success": False, "error": "Worker not found"}), 404
        
    worker = doc_ref.to_dict()
    coverage = worker.get("coverage", 0)
    
    # 5-Layer ML validation placeholder
    risk_prob, flags = analyze_fraud_risk_ml(worker, data, {})
    
    claim_id = f"CLM-{uuid.uuid4().hex[:6].upper()}"
    payout_amt = 0
    status = "pending" if manual_claim else "skipped"
    skip_reason = "Manual report filed - awaiting verification" if manual_claim else "Fraud flags detected"
    txn_id = None
    
    if risk_prob <= 0.1: 
        status = "paid"
        skip_reason = ""
        # Mock simple logic: severe=100%, moderate=65%, minor=30%
        multiplier = 1.0 if severity == "Severe" else (0.65 if severity == "Moderate" else 0.3)
        payout_amt = round(coverage * multiplier)
        txn_id = f"PAY-{uuid.uuid4().hex[:8].upper()}"
        
        db.collection("payments").add({
            "payment_id": txn_id,
            "uid": worker_id,
            "employee_id": worker.get("employee_id"),
            "type": "payout",
            "amount": payout_amt,
            "method": "upi",
            "razorpay_txn_id": f"rzp_{uuid.uuid4().hex[:12]}",
            "claim_id": claim_id,
            "status": "success",
            "created_at": firestore.SERVER_TIMESTAMP
        })
        
        update_kavach_score_static(worker_id, "legitimate_claim")
        
        db.collection("workers").document(worker_id).collection("notifications").add({
            "type": "payout",
            "title": "Claim Approved",
            "msg": f"Your claim for {event} has been approved. ₹{payout_amt} is being transferred to your UPI ID.",
            "read": False,
            "timestamp": firestore.SERVER_TIMESTAMP
        })
    else:
        update_kavach_score_static(worker_id, "suspicious_claim")
        db.collection("workers").document(worker_id).collection("notifications").add({
            "type": "warning",
            "title": "Claim Processing",
            "msg": f"Your claim for {event} has been flagged for manual administrative review.",
            "read": False,
            "timestamp": firestore.SERVER_TIMESTAMP
        })
        
    now_str = datetime.utcnow().strftime('%b %d, %Y')
    now_time = datetime.utcnow().strftime('%I:%M %p')
    claim_doc = {
        "id": claim_id,
        "date": incident_date,
        "timestamp": firestore.SERVER_TIMESTAMP,
        "event": event,
        "code": code,
        "severity": severity,
        "status": status,
        "payout": payout_amt,
        "txn": txn_id,
        "zone": zone,
        "description": description,
        "verification_layers": 5 if status == "paid" else 2,
        "fraud_flags": len(flags),
        "skip_reason": skip_reason,
        "timeline": [
            {"time": now_time, "event": "Claim Initiated", "done": True},
            {"time": now_time, "event": "ML Verification Passed" if status == "paid" else "Under Admin Review", "done": status == "paid"}
        ]
    }
    
    db.collection("workers").document(worker_id).collection("claims").document(claim_id).set(claim_doc)
    
    return jsonify({"success": True, "claim": claim_doc}), 201