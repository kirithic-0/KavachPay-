import sys
sys.path.insert(0, '.')
from firebase_admin import credentials, firestore, initialize_app
import os

try:
    cred = credentials.Certificate("firebase-credentials.json")
    initialize_app(cred)
except ValueError:
    pass

db = firestore.client()

def fix_ravi():
    # 1. Find Ravi
    workers = list(db.collection('workers').where('name', '==', 'Ravi Kumar').stream())
    if not workers:
        print("Ravi Kumar not found!")
        return

    ravi_doc = workers[0]
    uid = ravi_doc.id
    data = ravi_doc.to_dict()
    print(f"Found Ravi: UID={uid}, EmployeeID={data.get('employee_id')}")

    # 2. Modify Worker Data (reduce avg_income or earned amount to ensure he isn't hitting any caps, reset claims count)
    avg_income = float(data.get('avg_income', 3500))
    print(f"Current Avg Income: {avg_income}")
    
    # We will reset his past claims count and give him a clean slate for ML models
    updates = {
        'past_claims': 0,
        'past_correct_claims': 0,
        'kavach_score': 850, # High score ensures "auto_approve" from M2
        'policy_active': True,
        'is_deleted': False
    }
    db.collection('workers').document(uid).update(updates)
    print("Updated worker profile (reset past claims, boosted kavach score).")

    # 3. Delete all his existing claims to clean the slate
    claims_ref = db.collection('workers').document(uid).collection('claims').stream()
    deleted = 0
    batch = db.batch()
    for claim in claims_ref:
        batch.delete(claim.reference)
        deleted += 1
        if deleted % 400 == 0:
            batch.commit()
            batch = db.batch()
    if deleted > 0:
        batch.commit()
    print(f"Deleted {deleted} existing claims for Ravi.")

    # 4. Remove any "orders_week_a" rows for today so that Layer 4 (Inactivity) passes
    today_str = __import__('datetime').datetime.utcnow().strftime('%Y-%m-%d')
    orders_ref = db.collection('orders_week_a').where('employee_id', '==', data.get('employee_id')).stream()
    
    deleted_orders = 0
    batch = db.batch()
    for o in orders_ref:
        o_data = o.to_dict()
        if o_data.get('order_date') == today_str:
            batch.delete(o.reference)
            deleted_orders += 1
    if deleted_orders > 0:
        batch.commit()
    print(f"Deleted {deleted_orders} orders from today so Activity Verification (Layer 4) passes.")

    print("Ravi Kumar is now primed and fully eligible for simulation!")

if __name__ == "__main__":
    fix_ravi()
