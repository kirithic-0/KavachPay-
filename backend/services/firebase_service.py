"""
services/firebase_service.py — Updated for v6 schema
All helpers use customer_id as the Firestore document ID.
"""

from firebase_admin import firestore


def get_db():
    return firestore.client()


def get_worker_by_customer_id(customer_id):
    """Fetch worker by customer_id (Firestore doc ID)."""
    db  = get_db()
    doc = db.collection('workers').document(customer_id).get()
    if not doc.exists:
        return None
    data = doc.to_dict()
    data['customer_id'] = customer_id
    return data


def get_worker_by_employee_id(employee_id):
    """Fetch worker by employee_id field (not doc ID)."""
    db   = get_db()
    docs = db.collection('workers').where('employee_id', '==', employee_id).limit(1).stream()
    for doc in docs:
        data = doc.to_dict()
        data['customer_id'] = doc.id
        return data
    return None


def update_worker(customer_id, updates):
    db = get_db()
    db.collection('workers').document(customer_id).update(updates)


def get_zone_workers(zone):
    """Return all workers in a zone."""
    db   = get_db()
    docs = db.collection('workers').where('zone', '==', zone).stream()
    result = []
    for doc in docs:
        data = doc.to_dict()
        data['customer_id'] = doc.id
        result.append(data)
    return result


def save_claim(claim_data):
    db  = get_db()
    claim_data['createdAt'] = firestore.SERVER_TIMESTAMP
    ref = db.collection('claims').add(claim_data)
    return ref[1].id


def save_disruption(disruption_data):
    db  = get_db()
    disruption_data['triggeredAt'] = firestore.SERVER_TIMESTAMP
    ref = db.collection('disruption_events').add(disruption_data)
    return ref[1].id


def get_orders_for_worker(employee_id, week=None):
    """
    Fetch orders for a worker from the 4 order tables.
    Optional: week = 'A' | 'B' | 'C' | 'D'
    """
    db         = get_db()
    week_map   = {"A": "orders_week_a", "B": "orders_week_b",
                  "C": "orders_week_c", "D": "orders_week_d"}
    all_orders = []

    weeks_to_fetch = [week.upper()] if week else list(week_map.keys())

    for label in weeks_to_fetch:
        coll = week_map.get(label)
        if not coll:
            continue
        docs = db.collection(coll).where('employee_id', '==', employee_id).stream()
        for doc in docs:
            od = doc.to_dict()
            od['doc_id'] = doc.id
            od['week']   = label
            all_orders.append(od)

    return all_orders


def compute_weekly_stats_from_firestore(employee_id):
    """
    Compute avg_weekly_income, avg_daily_distance, avg_daily_deliveries
    directly from the 4 order tables stored in Firestore.
    Used as fallback when platform API is unavailable.
    """
    week_map        = {"A": "orders_week_a", "B": "orders_week_b",
                       "C": "orders_week_c", "D": "orders_week_d"}
    db              = get_db()
    weekly_incomes  = []
    weekly_dists    = []
    weekly_delivs   = []

    for label, coll_name in week_map.items():
        orders = [o.to_dict() for o in
                  db.collection(coll_name).where('employee_id', '==', employee_id).stream()]
        if not orders:
            continue
        days_worked = len(set(o.get('order_date', '') for o in orders))
        income      = sum(o.get('amount_paid', 0) for o in orders)
        dist        = sum(o.get('distance', 0)    for o in orders)
        weekly_incomes.append(income)
        weekly_dists.append(dist / days_worked   if days_worked else 0)
        weekly_delivs.append(len(orders) / days_worked if days_worked else 0)

    return {
        "avg_weekly_income":    round(sum(weekly_incomes) / len(weekly_incomes), 2)   if weekly_incomes else 0,
        "avg_daily_distance":   round(sum(weekly_dists)   / len(weekly_dists),   2)   if weekly_dists   else 0,
        "avg_daily_deliveries": round(sum(weekly_delivs)  / len(weekly_delivs),  2)   if weekly_delivs  else 0,
    }
