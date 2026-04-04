import sys
sys.path.insert(0, '.')
from firebase_admin import credentials, firestore, initialize_app
import random
from datetime import datetime, timedelta

try:
    cred = credentials.Certificate("firebase-credentials.json")
    initialize_app(cred)
except ValueError:
    pass

db = firestore.client()

def seed_ravi_orders():
    # Find Ravi Kumar
    workers = list(db.collection('workers').where('name', '==', 'Ravi Kumar').stream())
    if not workers:
        print("Ravi Kumar not found!")
        return
        
    ravi_doc = workers[0]
    data = ravi_doc.to_dict()
    emp_id = data.get('employee_id')
    zone = data.get('zone', 'Koramangala, Bangalore')
    platform = data.get('platform', 'Swiggy')
    
    print(f"Modifying orders for {data['name']} (Emp ID: {emp_id})..")

    # 1. Clear all existing records for Ravi in week A, B, C, D
    tables = ['orders_week_a', 'orders_week_b', 'orders_week_c', 'orders_week_d']
    batch = db.batch()
    deleted = 0
    
    for table in tables:
        docs = db.collection(table).where('employee_id', '==', emp_id).stream()
        for doc in docs:
            batch.delete(doc.reference)
            deleted += 1
            if deleted % 400 == 0:
                batch.commit()
                batch = db.batch()

    if deleted > 0:
        batch.commit()
    print(f"Deleted {deleted} previous orders across 4 weeks.")

    # 2. Seed realistic smaller orders (Targeting < 250 orders total over 4 weeks)
    # Total weeks = 4 (28 days). If we create ~5-8 per day, we get ~140-224 orders max.
    
    now = datetime.utcnow()
    batch = db.batch()
    created = 0
    
    total_incomes = []
    total_distances = []
    total_deliveries = []

    # Iterate over 4 weeks (0 = A, 1 = B, 2 = C, 3 = D)
    for week_idx, table in enumerate(tables):
        week_income = 0
        week_distance = 0
        week_deliveries = 0
        
        # 7 days per week
        for day in range(7):
            days_ago = week_idx * 7 + day
            if days_ago == 0:
                continue # Skip today so he bypasses Layer 4 (Inactivity Check) easily
                
            order_date = (now - timedelta(days=days_ago)).strftime('%Y-%m-%d')
            
            if week_idx == 0:
                # Week A: "Earned so far" should be < 2500 total (e.g. ~1800)
                # Over 6 days (since today is skipped), we want ~300 per day
                daily_deliveries = random.randint(4, 6)
                amt_range = (40.0, 60.0)
            else:
                # Weeks B, C, D: We want high total to bring average to ~4000
                # Target ~4800 per week. Over 7 days = ~680 per day
                daily_deliveries = random.randint(10, 14)
                amt_range = (50.0, 65.0)
            
            for _ in range(daily_deliveries):
                amount = round(random.uniform(*amt_range), 0)
                distance = round(random.uniform(2.0, 6.0), 1)
                
                doc_ref = db.collection(table).document()
                batch.set(doc_ref, {
                    'order_id': f"ORD-{random.randint(100000, 999999)}",
                    'employee_id': emp_id,
                    'platform': platform,
                    'order_date': order_date,
                    'amount_paid': amount,
                    'distance': distance,
                    'pickup_zone': zone,
                    'status': 'completed',
                    'timestamp': firestore.SERVER_TIMESTAMP
                })
                
                week_income += amount
                week_distance += distance
                week_deliveries += 1
                created += 1
                
                if created % 400 == 0:
                    batch.commit()
                    batch = db.batch()
                    
        total_incomes.append(week_income)
        total_distances.append(week_distance)
        total_deliveries.append(week_deliveries)

    if created % 400 != 0:
        batch.commit()
    
    print(f"Created {created} new orders across 4 weeks.")
    avg_wk_income = sum(total_incomes) / 4
    avg_wk_distance = sum(total_distances) / 4
    avg_wk_deliveries = sum(total_deliveries) / 4

    print(f"New averages -> Income: {round(avg_wk_income)}, Distance: {round(avg_wk_distance)}, Deliveries: {round(avg_wk_deliveries)}")

    # 3. Explicitly update Ravi's worker document with these freshly aggregated averages
    db.collection('workers').document(ravi_doc.id).update({
        'avg_income': round(avg_wk_income, 2),
        'avg_deliveries': round(avg_wk_deliveries / 7, 1), # Deliveries per day
        'avg_daily_distance': round(avg_wk_distance / 7, 1), # Distance per day
        'coverage': max(500, round(avg_wk_income * 0.65)), # Recalculate Coverage purely based on this
        'past_claims': 0,
        'past_correct_claims': 0,
        'kavach_score': 850
    })
    print("Worker profile averages synced successfully!")

if __name__ == "__main__":
    seed_ravi_orders()
