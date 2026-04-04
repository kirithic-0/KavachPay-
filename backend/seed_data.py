import firebase_admin
from firebase_admin import credentials, firestore, auth
import requests
from datetime import datetime, timedelta, timezone
import random
import sys
import uuid

# Configuration
PLATFORM_API_URL = "http://localhost:5001"
FIREBASE_CREDENTIALS = "firebase-credentials.json"

def init_firebase():
    if not firebase_admin._apps:
        try:
            cred = credentials.Certificate(FIREBASE_CREDENTIALS)
            firebase_admin.initialize_app(cred)
            print("[✓] Firebase Admin SDK Initialized")
        except Exception as e:
            print(f"[✗] Failed to initialize Firebase: {e}")
            sys.exit(1)

def get_or_create_auth_user(email, password, name):
    try:
        user = auth.get_user_by_email(email)
        print(f"    - Auth account exists: {email}")
        return user.uid
    except auth.UserNotFoundError:
        user = auth.create_user(
            email=email,
            password=password,
            display_name=name
        )
        print(f"    - Auth account created: {email}")
        return user.uid

def seed_everything():
    init_firebase()
    db = firestore.client()

    # 1. Firebase Auth accounts & workers collection
    print("\n[1/12] Creating Worker Accounts...")
    workers_data = [
        {
            "name": "Ravi Kumar",
            "email": "ravi@kavachpay.in",
            "password": "ravi123",
            "employee_id": "BLR-1000001",
            "platform": "Swiggy",
            "city": "Bangalore",
            "zone": "Koramangala",
            "premium": 59,
            "coverage": 1200,
            "kavach_score": 780,
            "upi_id": "ravi@upi",
            "age": 26,
            "phone": "9876543210"
        },
        {
            "name": "Priya Singh",
            "email": "priya@kavachpay.in",
            "password": "priya123",
            "employee_id": "CHN-2000001",
            "platform": "Zomato",
            "city": "Chennai",
            "zone": "Adyar",
            "premium": 74,
            "coverage": 1560,
            "kavach_score": 820,
            "upi_id": "priya@upi",
            "age": 29,
            "phone": "9123456780"
        },
        {
            "name": "Mohammed Arif",
            "email": "mohammed@kavachpay.in",
            "password": "mohammed123",
            "employee_id": "MUM-1000004",
            "platform": "Zomato",
            "city": "Mumbai",
            "zone": "Dharavi",
            "premium": 96,
            "coverage": 1560,
            "kavach_score": 750,
            "upi_id": "arif@upi",
            "age": 32,
            "phone": "9988776655"
        }
    ]

    worker_uids = {}
    for w in workers_data:
        uid = get_or_create_auth_user(w['email'], w['password'], w['name'])
        worker_uids[w['employee_id']] = uid
        
        # Prepare Firestore doc
        doc_data = {
            "uid": uid,
            "name": w['name'],
            "email": w['email'],
            "phone": w['phone'],
            "aadhaar_last4": "1234",
            "employee_id": w['employee_id'],
            "platform": w['platform'],
            "city": w['city'],
            "zone": w['zone'],
            "age": w['age'],
            "upi_id": w['upi_id'],
            "premium": w['premium'],
            "coverage": w['coverage'],
            "kavach_score": w['kavach_score'],
            "policy_active": True,
            "policy_paused": False,
            "is_deleted": False,
            "referral_code": f"{w['name'].split()[0].upper()}-{w['employee_id'][-4:]}",
            "created_at": firestore.SERVER_TIMESTAMP,
            "updated_at": firestore.SERVER_TIMESTAMP
        }
        db.collection('workers').document(uid).set(doc_data)
        print(f"    - Worker doc written: {w['name']}")

    print("[✓] Firebase Auth & Workers seeded")

    # 3. Admins collection
    print("\n[3/12] Creating Admin Accounts...")
    admins_data = [
        {"email": "admin@kavachpay.in", "password": "admin123", "name": "Super Admin", "role": "Super Admin"},
        {"email": "ops@kavachpay.in", "password": "ops123", "name": "Ops Manager", "role": "Ops Manager"}
    ]
    for a in admins_data:
        uid = get_or_create_auth_user(a['email'], a['password'], a['name'])
        db.collection('admins').document(uid).set({
            "uid": uid,
            "email": a['email'],
            "role": a['role'],
            "created_at": firestore.SERVER_TIMESTAMP
        })
        print(f"    - Admin doc written: {a['name']}")
    print("[✓] Admins seeded")

    # 4. orders_week_a/b/c/d collections
    print("\n[4/12] Seeding Weekly Order Tables (A, B, C, D)...")
    weeks = ['A', 'B', 'C', 'D']
    total_orders_seeded = 0
    for w_label in weeks:
        col_name = f"orders_week_{w_label.lower()}"
        for emp_id, uid in worker_uids.items():
            try:
                resp = requests.get(f"{PLATFORM_API_URL}/platform/orders/{emp_id}?week={w_label}")
                if resp.status_code == 200:
                    orders = resp.json().get('orders', [])
                    batch = db.batch()
                    for idx, o in enumerate(orders):
                        # Add UID to order for easier lookup
                        o['uid'] = uid
                        doc_ref = db.collection(col_name).document(o['order_id'])
                        batch.set(doc_ref, o)
                        total_orders_seeded += 1
                        if (idx + 1) % 400 == 0:
                            batch.commit()
                            batch = db.batch()
                    batch.commit()
            except Exception as e:
                print(f"    - Error fetching orders for {emp_id} Week {w_label}: {e}")
    print(f"[✓] orders_week_a/b/c/d — ~{total_orders_seeded} orders written")

    # 5. Computed stats
    print("\n[5/12] Computing Worker Stats...")
    for emp_id, uid in worker_uids.items():
        try:
            resp = requests.get(f"{PLATFORM_API_URL}/platform/stats/{emp_id}")
            if resp.status_code == 200:
                stats = resp.json()
                db.collection('workers').document(uid).update({
                    "avg_income": stats['avg_weekly_income'],
                    "avg_deliveries": stats['avg_daily_deliveries'],
                    "avg_daily_distance": stats['avg_daily_distance'],
                    "typical_workdays": stats['typical_workdays']
                })
        except Exception as e:
            print(f"    - Error computing stats for {emp_id}: {e}")
    print("[✓] Computed stats updated for 3 workers")

    # 6. claims subcollection
    print("\n[6/12] Seeding Claims...")
    for emp_id, uid in worker_uids.items():
        # Seed 3 claims: 2 paid, 1 skipped
        claims = [
            {
                "id": f"CLM-{random.randint(1000, 9999)}",
                "date": (datetime.utcnow() - timedelta(days=20)).strftime("%b %d, %Y"),
                "timestamp": datetime.utcnow() - timedelta(days=20),
                "event": "Heavy Rain — 82mm",
                "code": "HRA",
                "severity": "Moderate",
                "status": "paid",
                "payout": 780,
                "txn": f"pay_{uuid.uuid4().hex[:10]}",
                "zone": "Koramangala",
                "verification_layers": 5,
                "fraud_flags": 0,
                "skip_reason": None,
                "timeline": [{"event": "Alert Triggered", "time": "2:30 PM", "done": True}, {"event": "Claim Verified", "time": "2:35 PM", "done": True}, {"event": "Payout Success", "time": "2:45 PM", "done": True}]
            },
            {
                "id": f"CLM-{random.randint(1000, 9999)}",
                "date": (datetime.utcnow() - timedelta(days=10)).strftime("%b %d, %Y"),
                "timestamp": datetime.utcnow() - timedelta(days=10),
                "event": "Heatwave — 44°C",
                "code": "HWT",
                "severity": "Severe",
                "status": "paid",
                "payout": 1200,
                "txn": f"pay_{uuid.uuid4().hex[:10]}",
                "zone": "Koramangala",
                "verification_layers": 5,
                "fraud_flags": 0,
                "skip_reason": None,
                "timeline": [{"event": "Alert Triggered", "time": "11:00 AM", "done": True}, {"event": "Claim Verified", "time": "11:10 AM", "done": True}, {"event": "Payout Success", "time": "11:30 AM", "done": True}]
            },
            {
                "id": f"CLM-{random.randint(1000, 9999)}",
                "date": (datetime.utcnow() - timedelta(days=5)).strftime("%b %d, %Y"),
                "timestamp": datetime.utcnow() - timedelta(days=5),
                "event": "Severe Air Quality — AQI 412",
                "code": "SAQ",
                "severity": "Moderate",
                "status": "skipped",
                "payout": 0,
                "txn": None,
                "zone": "Koramangala",
                "verification_layers": 3,
                "fraud_flags": 1,
                "skip_reason": "Layer 4 failed: GPS detected movement in safe zone",
                "timeline": [{"event": "Alert Triggered", "time": "9:00 AM", "done": True}, {"event": "Verification Failed", "time": "9:15 AM", "done": True}]
            }
        ]
        for c in claims:
            db.collection('workers').document(uid).collection('claims').document(c['id']).set(c)
    print("[✓] claims — 9 documents written")

    # 7. notifications subcollection
    print("\n[7/12] Seeding Notifications...")
    notif_styles = {
        'payout':   {'color': '#059669', 'bg': '#ECFDF5', 'border': '#A7F3D0'},
        'policy':   {'color': '#2563EB', 'bg': '#EFF6FF', 'border': '#BFDBFE'},
        'zone':     {'color': '#0891B2', 'bg': '#ECFEFF', 'border': '#A5F3FC'},
        'score':    {'color': '#7C3AED', 'bg': '#F5F3FF', 'border': '#DDD6FE'},
    }
    for emp_id, uid in worker_uids.items():
        notifs = [
            {"type": "payout", "title": "Payout Success", "msg": "₹780 deposited to UPI"},
            {"type": "policy", "title": "Policy Renewed", "msg": "Active until next Monday"},
            {"type": "zone", "title": "Zone Updated", "msg": "New zone: Koramangala"},
            {"type": "score", "title": "Score Increased", "msg": "KavachScore is now 780"},
        ]
        for i, n in enumerate(notifs):
            style = notif_styles[n['type']]
            notif_id = f"notif_{int(datetime.utcnow().timestamp())}_{i}"
            db.collection('workers').document(uid).collection('notifications').document(notif_id).set({
                "id": notif_id,
                "type": n['type'],
                "title": n['title'],
                "msg": n['msg'],
                "detail": "Automatic notification generated by system.",
                "read": i > 1,
                "time": "Today, 10:30 AM",
                "timestamp": firestore.SERVER_TIMESTAMP,
                "color": style['color'],
                "bg": style['bg'],
                "border": style['border']
            })
    print("[✓] notifications — 12 documents written")

    # 8. payments collection
    print("\n[8/12] Seeding Payments...")
    for emp_id, uid in worker_uids.items():
        # Premium payment
        pay_id = f"pay_{uuid.uuid4().hex[:10]}"
        db.collection('payments').document(pay_id).set({
            "payment_id": f"PAY-{emp_id[-7:]}-001",
            "uid": uid,
            "employee_id": emp_id,
            "type": "premium",
            "amount": 59,
            "method": "upi",
            "razorpay_txn_id": f"pay_{uuid.uuid4().hex[:10]}",
            "status": "success",
            "created_at": datetime.utcnow() - timedelta(days=7)
        })
        # Payout payment
        payout_id = f"pay_{uuid.uuid4().hex[:10]}"
        db.collection('payments').document(payout_id).set({
            "payment_id": f"PAY-{emp_id[-7:]}-002",
            "uid": uid,
            "employee_id": emp_id,
            "type": "payout",
            "amount": 780,
            "method": "upi",
            "razorpay_txn_id": f"pay_{uuid.uuid4().hex[:10]}",
            "claim_id": f"CLM-{random.randint(1000, 9999)}",
            "status": "success",
            "created_at": datetime.utcnow() - timedelta(days=2)
        })
    print("[✓] payments — 6 documents written")

    # 9. financial_snapshots
    print("\n[9/12] Seeding Financial Snapshots...")
    snapshots = [
        {"week": "W1 Jan", "premiums": 42000, "payouts": 18400, "profit": 23600},
        {"week": "W2 Jan", "premiums": 46800, "payouts": 22200, "profit": 24600},
        {"week": "W1 Feb", "premiums": 51200, "payouts": 19800, "profit": 31400},
        {"week": "W2 Feb", "premiums": 67400, "payouts": 28100, "profit": 39300},
        {"week": "W1 Mar", "premiums": 74800, "payouts": 31200, "profit": 43600},
        {"week": "W2 Mar", "premiums": 84600, "payouts": 24800, "profit": 59800}
    ]
    for s in snapshots:
        doc_id = s['week'].replace(" ", "_").lower()
        db.collection('financial_snapshots').document(doc_id).set(s)
    print("[✓] financial_snapshots — 6 weeks written")

    # 10. financials/current_week
    print("\n[10/12] Seeding Financials Current Week...")
    db.collection('financials').document('current_week').set({
        "zone_breakdown": [
            {"zone": "Koramangala", "premiums": 12400, "payouts": 6800},
            {"zone": "Adyar", "premiums": 9800, "payouts": 4200},
            {"zone": "Dharavi", "premiums": 14200, "payouts": 9100}
        ],
        "fraud_blocked_count": 47,
        "fraud_savings": 31200,
        "fraud_rate_pct": 8.2
    })
    print("[✓] financials/current_week — written")

    # 11. disruptions
    print("\n[11/12] Seeding Disruptions...")
    db.collection('disruptions').document('hra_blr_2026_001').set({
        "code": "HRA",
        "label": "Heavy Rain",
        "value": "82mm",
        "zone": "Koramangala",
        "city": "Bangalore",
        "severity": "Moderate",
        "time": "2:30 PM",
        "color": "#3B82F6",
        "active": True,
        "expires_at": datetime.utcnow() + timedelta(hours=2)
    })
    print("[✓] disruptions — 1 active event seeded")

    # 12. forum
    print("\n[12/12] Seeding Forum Messages...")
    forum_path = "forum/zone_Koramangala/messages"
    messages = [
        {"sender": "Ravi K.", "sender_id": worker_uids["BLR-1000001"], "text": "Waterlogging near Sony World signal.", "time": "2:14 PM", "timestamp": firestore.SERVER_TIMESTAMP, "zone": "Koramangala", "city": "Bangalore", "type": "message"},
        {"sender": "Admin", "sender_id": "system", "text": "Heavy Rain alert issued for Koramangala.", "time": "2:30 PM", "timestamp": firestore.SERVER_TIMESTAMP, "zone": "Koramangala", "city": "Bangalore", "type": "alert"},
        {"sender": "Priya S.", "sender_id": worker_uids["CHN-2000001"], "text": "Stay safe everyone!", "time": "2:45 PM", "timestamp": firestore.SERVER_TIMESTAMP, "zone": "Adyar", "city": "Chennai", "type": "message"}
    ]
    for idx, m in enumerate(messages):
        db.collection(forum_path).document(f"msg_{idx}").set(m)
    print("[✓] forum — 3 seed messages written")

    print("\n[✓] Seeding complete. Backend is ready for testing.")

if __name__ == "__main__":
    seed_everything()
