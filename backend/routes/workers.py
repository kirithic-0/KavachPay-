"""
routes/workers.py — Updated for v6 schema
  - All routes now use customer_id as path param (Firestore doc ID)
  - Added /weekly-income endpoint for worker dashboard chart
  - Added /refresh-stats endpoint to sync from platform API
"""

from flask import Blueprint, request, jsonify
from firebase_admin import firestore
from services.firebase_service import get_db, get_worker_by_customer_id
from services.kavachscore import get_score_tier
import requests
import os

workers_bp      = Blueprint('workers', __name__)
PLATFORM_API_URL = os.getenv("PLATFORM_API_URL", "http://localhost:5001")


# ── GET /api/workers/<customer_id> ───────────────────────────
@workers_bp.route('/<customer_id>', methods=['GET'])
def get_worker(customer_id):
    db  = get_db()
    doc = db.collection('workers').document(customer_id).get()
    if not doc.exists:
        return jsonify({'error': 'Worker not found'}), 404
    data = doc.to_dict()
    data['customer_id'] = customer_id
    return jsonify(data), 200


# ── PUT /api/workers/<customer_id> ───────────────────────────
@workers_bp.route('/<customer_id>', methods=['PUT'])
def update_worker(customer_id):
    db   = get_db()
    data = request.get_json()
    # Never allow overwriting these protected fields via PUT
    for protected in ['customer_id', 'employee_id', 'referral_code', 'enrolledAt']:
        data.pop(protected, None)
    db.collection('workers').document(customer_id).update(data)
    return jsonify({'success': True}), 200


# ── PUT /api/workers/<customer_id>/pause ─────────────────────
@workers_bp.route('/<customer_id>/pause', methods=['PUT'])
def pause_policy(customer_id):
    db     = get_db()
    data   = request.get_json()
    paused = data.get('paused', True)
    status = 'paused' if paused else 'active'
    db.collection('workers').document(customer_id).update({'policyStatus': status})
    return jsonify({'success': True, 'policyStatus': status}), 200


# ── GET /api/workers/<customer_id>/claims ────────────────────
@workers_bp.route('/<customer_id>/claims', methods=['GET'])
def get_worker_claims(customer_id):
    db     = get_db()
    claims = db.collection('claims').where('customer_id', '==', customer_id).stream()
    result = [{'id': c.id, **c.to_dict()} for c in claims]
    return jsonify({'claims': result}), 200


# ── GET /api/workers/<customer_id>/score ─────────────────────
@workers_bp.route('/<customer_id>/score', methods=['GET'])
def get_worker_score(customer_id):
    db  = get_db()
    doc = db.collection('workers').document(customer_id).get()
    if not doc.exists:
        return jsonify({'error': 'Worker not found'}), 404
    worker = doc.to_dict()
    score  = worker.get('kavachScore', 750)
    tier   = get_score_tier(score)
    return jsonify({'score': score, 'tier': tier}), 200


# ── GET /api/workers/<customer_id>/notifications ─────────────
@workers_bp.route('/<customer_id>/notifications', methods=['GET'])
def get_notifications(customer_id):
    db     = get_db()
    doc    = db.collection('workers').document(customer_id).get()
    if not doc.exists:
        return jsonify({'error': 'Worker not found'}), 404

    worker        = doc.to_dict()
    notifications = []

    # Real: recent claims
    claims = db.collection('claims').where('customer_id', '==', customer_id).stream()
    for c in claims:
        cd = c.to_dict()
        if cd.get('status') == 'paid':
            notifications.append({
                'id':      c.id,
                'type':    'payout',
                'urgent':  False,
                'message': f"₹{cd.get('payout_amount', 0)} payout processed — {cd.get('category', '')} claim approved",
                'time':    'Recent',
            })

    # KavachScore alert
    score = worker.get('kavachScore', 750)
    if score < 500:
        notifications.append({'id': 'score_low', 'type': 'warning', 'urgent': False,
            'message': f'KavachScore is {score} — complete your profile to improve it', 'time': 'Today'})
    elif score >= 800:
        notifications.append({'id': 'score_high', 'type': 'success', 'urgent': False,
            'message': f'KavachScore {score} — instant payouts active', 'time': 'Today'})

    if not notifications:
        notifications.append({'id': 'all_clear', 'type': 'info', 'urgent': False,
            'message': 'No disruptions in your zone. Coverage active.', 'time': 'Now'})

    return jsonify({'notifications': notifications}), 200


# ── GET /api/workers/<customer_id>/weekly-income ─────────────
@workers_bp.route('/<customer_id>/weekly-income', methods=['GET'])
def get_weekly_income(customer_id):
    """
    Returns weekly income data across the 4 order tables.
    Powers the earnings chart on the worker dashboard.
    Response: { weeks: [{week, income, orders, avg_distance}] }
    """
    db = get_db()

    # Fetch worker to get employee_id
    doc = db.collection('workers').document(customer_id).get()
    if not doc.exists:
        return jsonify({'error': 'Worker not found'}), 404
    worker      = doc.to_dict()
    employee_id = worker.get('employee_id', '')

    weeks_data = []

    for week_label, coll_name in [("A", "orders_week_a"), ("B", "orders_week_b"),
                                   ("C", "orders_week_c"), ("D", "orders_week_d")]:
        orders = db.collection(coll_name)\
                   .where('employee_id', '==', employee_id)\
                   .stream()

        order_list   = [o.to_dict() for o in orders]
        total_income  = sum(o.get('amount_paid', 0) for o in order_list)
        total_dist    = sum(o.get('distance', 0)    for o in order_list)
        num_orders    = len(order_list)

        weeks_data.append({
            'week':         f'Week {week_label}',
            'income':       round(total_income, 2),
            'orders':       num_orders,
            'avg_distance': round(total_dist / num_orders, 2) if num_orders else 0,
        })

    # Most recent week first → reverse so chart shows oldest→newest
    weeks_data.reverse()

    return jsonify({
        'customer_id':      customer_id,
        'employee_id':      employee_id,
        'weekly_income':    weeks_data,
        'avg_weekly_income':worker.get('avg_weekly_income', 0),
    }), 200


# ── POST /api/workers/<customer_id>/refresh-stats ────────────
@workers_bp.route('/<customer_id>/refresh-stats', methods=['POST'])
def refresh_stats(customer_id):
    """
    Re-fetches stats from mock platform API and updates worker doc.
    Call this every week after new orders are loaded.
    """
    db  = get_db()
    doc = db.collection('workers').document(customer_id).get()
    if not doc.exists:
        return jsonify({'error': 'Worker not found'}), 404

    worker      = doc.to_dict()
    employee_id = worker.get('employee_id', '')

    try:
        resp = requests.get(f"{PLATFORM_API_URL}/platform/stats/{employee_id}", timeout=5)
        if resp.status_code != 200:
            return jsonify({'error': 'Platform API unavailable'}), 502
        stats = resp.json()
    except Exception as e:
        return jsonify({'error': str(e)}), 502

    db.collection('workers').document(customer_id).update({
        'avg_weekly_income':    stats.get('avg_weekly_income', 0),
        'avg_daily_distance':   stats.get('avg_daily_distance', 0),
        'avg_daily_deliveries': stats.get('avg_daily_deliveries', 0),
        'typical_workdays':     stats.get('typical_workdays', []),
    })

    return jsonify({'success': True, 'stats': stats}), 200


# ── GET /api/workers/<customer_id>/orders ────────────────────
@workers_bp.route('/<customer_id>/orders', methods=['GET'])
def get_worker_orders(customer_id):
    """
    Returns all orders for a worker from all 4 week tables.
    Optional query param: ?week=A (filter to one week)
    """
    db  = get_db()
    doc = db.collection('workers').document(customer_id).get()
    if not doc.exists:
        return jsonify({'error': 'Worker not found'}), 404

    worker      = doc.to_dict()
    employee_id = worker.get('employee_id', '')
    week_filter = request.args.get('week', '').upper()

    all_orders = []
    for label, coll_name in [("A", "orders_week_a"), ("B", "orders_week_b"),
                              ("C", "orders_week_c"), ("D", "orders_week_d")]:
        if week_filter and label != week_filter:
            continue
        orders = db.collection(coll_name)\
                   .where('employee_id', '==', employee_id)\
                   .stream()
        for o in orders:
            od = o.to_dict()
            od['order_doc_id'] = o.id
            all_orders.append(od)

    return jsonify({
        'customer_id':  customer_id,
        'employee_id':  employee_id,
        'total_orders': len(all_orders),
        'orders':       all_orders,
    }), 200
