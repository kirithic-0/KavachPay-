import uuid
from firebase_admin import firestore
from services.firebase_service import get_db, update_worker
from services.kavachscore import update_kavach_score


def process_payout(worker_id, claim_id, amount, txn_id=None):
    """
    Simulates a UPI payout via Razorpay test mode.
    In Phase 2 this will call the real Razorpay API.
    """
    db = get_db()

    if not txn_id:
        txn_id = f"pay_{uuid.uuid4().hex[:12]}"

    # Record the payment
    payment = {
        'workerId':  worker_id,
        'claimId':   claim_id,
        'amount':    amount,
        'type':      'payout',
        'method':    'upi',
        'txnId':     txn_id,
        'status':    'success',
        'createdAt': firestore.SERVER_TIMESTAMP
    }
    db.collection('payments').add(payment)

    # Update claim status to paid
    db.collection('claims').document(claim_id).update({
        'status': 'paid',
        'txnId':  txn_id
    })

    # Update KavachScore for legitimate claim
    update_kavach_score(worker_id, 'legitimate_claim')

    return {
        'success': True,
        'txnId':   txn_id,
        'amount':  amount,
        'message': f'₹{amount} transferred via UPI successfully'
    }