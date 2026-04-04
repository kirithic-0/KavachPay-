import sys
sys.path.insert(0, '.')
from firebase_admin import credentials, firestore, initialize_app
import random
try:
    cred = credentials.Certificate("firebase-credentials.json")
    initialize_app(cred)
except ValueError:
    pass

db = firestore.client()

def tweak_ravi_income():
    workers = list(db.collection('workers').where('name', '==', 'Ravi Kumar').stream())
    if not workers:
        print("Ravi Kumar not found!")
        return

    ravi_doc = workers[0]
    data = ravi_doc.to_dict()
    emp_id = data.get('employee_id')
    avg_income = float(data.get('avg_income', 3500))
    
    # Let's set his current weekly earnings to ~40% of his average income
    target_earnings = avg_income * 0.40
    
    # Query all orders in orders_week_a
    orders = list(db.collection('orders_week_a').where('employee_id', '==', emp_id).stream())
    
    if not orders:
        print("No orders found for this week, earnings are 0.")
        return
        
    # Shrink each order's payout proportionally so the sum equals target_earnings
    current_sum = sum(float(o.to_dict().get('amount_paid', 0)) for o in orders)
    
    if current_sum == 0:
        print("Current earnings sum is 0.")
        return
        
    ratio = target_earnings / current_sum
    
    batch = db.batch()
    updated = 0
    for o in orders:
        o_data = o.to_dict()
        old_amt = float(o_data.get('amount_paid', 0))
        new_amt = round(old_amt * ratio, 2)
        batch.update(o.reference, {'amount_paid': new_amt})
        updated += 1
        if updated % 400 == 0:
            batch.commit()
            batch = db.batch()
            
    if updated > 0:
        batch.commit()
        
    print(f"Updated {updated} orders. Shrunk total earnings from {current_sum} to {target_earnings}.")
    print("Ravi is ready.")

if __name__ == "__main__":
    tweak_ravi_income()
