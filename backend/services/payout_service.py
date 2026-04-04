# services/payout_service.py
import razorpay
from firebase_admin import firestore
from config import RAZORPAY_KEY_ID, RAZORPAY_SECRET
from datetime import datetime

db = firestore.client()

# Initialize Razorpay client
# Note: This will fail if keys are missing and we attempt a real call,
# but the code below handles the mock case first.
try:
    rz_client = razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_SECRET))
except Exception:
    rz_client = None

def initiate_upi_payout(uid: str, employee_id: str, upi_id: str,
                         amount: int, claim_id: str) -> dict:
    """
    Initiates a UPI payout via Razorpay Payout API.
    Amount is in Rs. (integer). Razorpay requires paise (amount * 100).

    Returns { success: bool, txn_id: str|None, error: str|None }
    """
    try:
        # In test/dev mode, skip real Razorpay call and mock success
        # Check if RAZORPAY_KEY_ID is missing or contains 'test'
        if not RAZORPAY_KEY_ID or 'test' in (RAZORPAY_KEY_ID or '').lower():
            mock_txn = f'pay_MOCK_{uid[-6:].upper()}_{int(datetime.utcnow().timestamp())}'
            _write_payment_record(uid, employee_id, amount, claim_id, mock_txn, 'success')
            return {'success': True, 'txn_id': mock_txn, 'error': None}

        if not rz_client:
             return {'success': False, 'txn_id': None, 'error': 'Razorpay client not initialized'}

        # Real Razorpay Payout API call
        payload = {
            'account_number': '2323230089067',   # your Razorpay X account
            'fund_account': {
                'account_type': 'vpa',
                'vpa': {'address': upi_id},
                'contact': {
                    'name': employee_id,
                    'type': 'employee',
                },
            },
            'amount': amount * 100,   # paise
            'currency': 'INR',
            'mode': 'UPI',
            'purpose': 'payout',
            'queue_if_low_balance': True,
            'reference_id': claim_id,
            'narration': f'KavachPay claim payout — {claim_id}',
        }
        response = rz_client.payout.create(payload)
        txn_id = response.get('id')
        _write_payment_record(uid, employee_id, amount, claim_id, txn_id, 'success')
        return {'success': True, 'txn_id': txn_id, 'error': None}

    except Exception as e:
        # Still write a failed payment record for audit trail
        _write_payment_record(uid, employee_id, amount, claim_id, None, 'failed')
        return {'success': False, 'txn_id': None, 'error': str(e)}


def _write_payment_record(uid, employee_id, amount, claim_id, txn_id, status):
    """Internal helper — writes payout payment to top-level payments collection."""
    ts = int(datetime.utcnow().timestamp() * 1000)
    payment_id = f'PAY-{uid[-6:].upper()}-{ts}'
    db.collection('payments').document(payment_id).set({
        'payment_id': payment_id,
        'uid': uid,
        'employee_id': employee_id,
        'type': 'payout',
        'amount': amount,
        'method': 'upi',
        'razorpay_txn_id': txn_id,
        'claim_id': claim_id,
        'status': status,
        'created_at': firestore.SERVER_TIMESTAMP,
    })
    return payment_id
