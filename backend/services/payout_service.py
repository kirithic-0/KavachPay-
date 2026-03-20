"""
services/payout_service.py — Updated for v6 schema
Stores both customer_id and employee_id on payment records.
"""

import uuid
from firebase_admin import firestore
from services.firebase_service import get_db, get_worker_by_customer_id, update_worker
from services.kavachscore import update_kavach_score


def process_payout(customer_id, claim_id, amount, txn_id=None):
    """
    Simulates a UPI payout.
    Records the payment, updates the claim, and bumps KavachScore.
    """
    db = get_db()

    if not txn_id:
        txn_id = f"pay_{uuid.uuid4().hex[:12]}"

    worker      = get_worker_by_customer_id(customer_id) or {}
    employee_id = worker.get('employee_id', '')

    # Record payment
    db.collection('payments').add({
        'customer_id': customer_id,
        'employee_id': employee_id,
        'claim_id':    claim_id,
        'amount':      amount,
        'type':        'payout',
        'method':      'upi',
        'txn_id':      txn_id,
        'status':      'success',
        'createdAt':   firestore.SERVER_TIMESTAMP,
    })

    # Update claim status
    if claim_id:
        db.collection('claims').document(claim_id).update({
            'status': 'paid',
            'txn_id': txn_id,
        })

    # Update worker total_paid
    current_total = worker.get('total_paid', 0)
    update_worker(customer_id, {'total_paid': current_total + amount})

    # KavachScore bump
    update_kavach_score(customer_id, 'legitimate_claim')

    return {
        'success': True,
        'txn_id':  txn_id,
        'amount':  amount,
        'message': f'₹{amount} transferred via UPI successfully',
    }
