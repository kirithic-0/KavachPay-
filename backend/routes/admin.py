from flask import Blueprint, request, jsonify
from firebase_admin import auth as fb_auth, firestore
from functools import wraps
from datetime import datetime, timedelta, timezone
import requests
import os
from collections import Counter
from services.notification_service import create_notification
from utils.helpers import get_week_start

admin_bp = Blueprint('admin', __name__)
db = firestore.client()

def require_admin(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get('Authorization', '')
        if not auth_header.startswith('Bearer '):
            return jsonify({'error': 'Unauthorized', 'detail': 'Missing Bearer token'}), 401
        
        token = auth_header.replace('Bearer ', '')
        try:
            decoded = fb_auth.verify_id_token(token)
            uid = decoded['uid']
            # Check admins collection
            admin_doc = db.collection('admins').document(uid).get()
            if not admin_doc.exists:
                return jsonify({'error': 'Admin access denied'}), 403
            
            request.admin_uid = uid
            request.admin_role = admin_doc.to_dict().get('role', 'Ops Manager')
        except Exception as e:
            return jsonify({'error': 'Unauthorized', 'detail': str(e)}), 401
            
        return f(*args, **kwargs)
    return decorated

@admin_bp.route('/overview', methods=['GET'])
@require_admin
def admin_overview():
    workers = list(db.collection('workers').where('is_deleted', '==', False).stream())
    total_enrolled = len(workers)
    total_premiums = sum(w.to_dict().get('premium', 0) for w in workers)
    scores = [w.to_dict().get('kavach_score', 750) for w in workers]
    avg_score = round(sum(scores) / len(scores)) if scores else 750

    # Payouts this week
    week_start = get_week_start()
    all_weekly_payouts = db.collection('payments')\
                          .where('created_at', '>=', week_start).stream()
    total_payouts = sum(p.to_dict().get('amount', 0) for p in all_weekly_payouts if p.to_dict().get('type') == 'payout')
    weekly_profit = total_premiums - total_payouts
    profit_margin = round((weekly_profit / total_premiums) * 100, 1) if total_premiums else 0

    # Active disruptions count
    active_disruptions = 0
    now = datetime.now(timezone.utc)
    # Query flat collection for all active disruptions
    docs = db.collection('disruptions').where('active', '==', True).stream()
    for d in docs:
        data = d.to_dict()
        exp = data.get('expires_at')
        if exp and not isinstance(exp, datetime):
             is_active = data.get('active', False)
        else:
             if exp and exp.tzinfo is None:
                 exp = exp.replace(tzinfo=timezone.utc)
             is_active = exp and exp > now

        if is_active:
            active_disruptions += 1

    return jsonify({
        'total_enrolled': total_enrolled,
        'total_premiums_weekly': total_premiums,
        'total_payouts_weekly': total_payouts,
        'weekly_profit': weekly_profit,
        'profit_margin': profit_margin,
        'avg_score': avg_score,
        'active_disruptions': active_disruptions,
    })

@admin_bp.route('/zones', methods=['GET'])
@require_admin
def admin_zones():
    # 1. Fetch all non-deleted workers and group by zone
    workers = db.collection('workers').where('is_deleted', '==', False).stream()
    zone_data = {}
    
    for w_doc in workers:
        w = w_doc.to_dict()
        z = w.get('zone', 'Unknown')
        city = w.get('city', 'Unknown')
        
        if z not in zone_data:
            zone_data[z] = {
                'zone': z,
                'city': city,
                'enrolled': 0,
                'total': 120,
                'premium': 0,
                'coverage': 0,
                'payout': 0,
                'status': 'active'
            }
        
        zone_data[z]['enrolled'] += 1
        zone_data[z]['premium'] += w.get('premium', 0)
        zone_data[z]['coverage'] += w.get('coverage', 0)

    # 2. Pre-fetch all active disruptions
    active_disruptions_by_city = {}
    now = datetime.now(timezone.utc)
    
    disrupts = db.collection('disruptions').where('active', '==', True).stream()
    for d in disrupts:
        dd = d.to_dict()
        city = dd.get('city')
        if city not in active_disruptions_by_city:
            active_disruptions_by_city[city] = []
            
        exp = dd.get('expires_at')
        if exp and not isinstance(exp, datetime):
            if dd.get('active', False):
                active_disruptions_by_city[city].append(dd.get('zone'))
        else:
            if exp and exp.tzinfo is None:
                exp = exp.replace(tzinfo=timezone.utc)
            if exp and exp > now:
                active_disruptions_by_city[city].append(dd.get('zone'))

    # 3. Calculate risk and status for each zone
    for z_full, data in zone_data.items():
        city = data['city']
        if city in ['Mumbai', 'Chennai', 'Kolkata', 'Delhi']:
            data['risk'] = 'high'
        elif city in ['Hyderabad', 'Pune']:
            data['risk'] = 'medium'
        else:
            data['risk'] = 'low'
            
        # Check if this zone is currently disrupted
        disrupted_zones_in_city = active_disruptions_by_city.get(city, [])
        is_disrupted = data['zone'] in disrupted_zones_in_city
        
        if is_disrupted:
            data['status'] = 'disrupted'
        elif data['enrolled'] > 0:
            data['status'] = 'active'
        else:
            data['status'] = 'safe'

    return jsonify({'zones': list(zone_data.values())})

@admin_bp.route('/workers', methods=['GET'])
@require_admin
def admin_workers():
    page = int(request.args.get('page', 1))
    search = request.args.get('search', '').lower()
    sort_field = request.args.get('sort', 'score')
    
    workers_stream = db.collection('workers').where('is_deleted', '==', False).stream()
    
    all_workers = []
    for w_doc in workers_stream:
        w = w_doc.to_dict()
        uid = w['uid']
        
        if search:
            searchable = (w.get('name', '') + w.get('employee_id', '') + w.get('zone', '')).lower()
            if search not in searchable:
                continue
        
        claims = db.collection('workers').document(uid).collection('claims').stream()
        w['claims_count'] = len(list(claims))
        
        payouts = db.collection('payments')\
                    .where('uid', '==', uid)\
                    .where('type', '==', 'payout').stream()
        p_list = [p.to_dict() for p in payouts]
        w['last_payout'] = 0
        if p_list:
            p_list.sort(key=lambda x: x.get('created_at'), reverse=True)
            w['last_payout'] = p_list[0].get('amount', 0)
        
        if w.get('policy_active'):
            w['status'] = 'active'
        elif w.get('policy_paused'):
            w['status'] = 'paused'
        else:
            w['status'] = 'review'
            
        all_workers.append({
            'id': w.get('employee_id'),
            'name': w.get('name'),
            'zone': w.get('zone'),
            'city': w.get('city'),
            'platform': w.get('platform'),
            'score': w.get('kavach_score', 750),
            'status': w['status'],
            'premium': w.get('premium', 0),
            'last_payout': w['last_payout'],
            'claims_count': w['claims_count']
        })

    if sort_field == 'score':
        all_workers.sort(key=lambda x: x['score'], reverse=True)
    elif sort_field == 'name':
        all_workers.sort(key=lambda x: x['name'])
    elif sort_field == 'claims':
        all_workers.sort(key=lambda x: x['claims_count'], reverse=True)

    total = len(all_workers)
    start = (page - 1) * 20
    end = start + 20
    paginated = all_workers[start:end]
    
    return jsonify({
        'workers': paginated,
        'total': total,
        'page': page
    })

@admin_bp.route('/disruptions', methods=['GET'])
@require_admin
def admin_disruptions():
    # 1. Fetch all non-deleted workers once and group by zone
    workers_stream = db.collection('workers').where('is_deleted', '==', False).stream()
    zone_workers_map = {}
    for w_doc in workers_stream:
        w = w_doc.to_dict()
        z = w.get('zone', 'Unknown')
        if z not in zone_workers_map:
            zone_workers_map[z] = []
        zone_workers_map[z].append(w_doc.id)

    all_disruptions = []
    now = datetime.now(timezone.utc)
    
    docs = db.collection('disruptions').stream()
    for doc in docs:
            d = doc.to_dict()
            did = doc.id
            zone = d.get('zone')
            city_name = d.get('city')
            
            affected_uids = zone_workers_map.get(zone, [])
            
            paid = 0
            skipped = 0
            payout_sum = 0
            code = d.get('code')
            
            for uid in affected_uids:
                claims = db.collection('workers').document(uid).collection('claims')\
                           .where('code', '==', code).stream()
                for c in claims:
                    cd = c.to_dict()
                    if cd.get('status') == 'paid':
                        paid += 1
                        payout_sum += cd.get('payout', 0)
                    elif cd.get('status') == 'skipped':
                        skipped += 1
            
            exp = d.get('expires_at')
            if exp and not isinstance(exp, datetime):
                 is_active = d.get('active', False)
            else:
                 if exp and exp.tzinfo is None:
                     exp = exp.replace(tzinfo=timezone.utc)
                 is_active = d.get('active') and exp and exp > now
                 
            ts = d.get('timestamp')
            
            all_disruptions.append({
                'id': did,
                'date': ts.strftime('%b %d, %Y') if ts else 'N/A',
                'time': d.get('time'),
                'type': d.get('code'),
                'zone': zone,
                'city': city_name,
                'severity': d.get('severity'),
                'value': d.get('value'),
                'affected': len(affected_uids),
                'paid': paid,
                'skipped': skipped,
                'payout': payout_sum,
                'status': 'active' if is_active else 'expired',
                'timestamp': ts or now
            })

    # Sort by raw timestamp first, then convert timestamp to ISO string for JSON
    all_disruptions.sort(key=lambda x: x['timestamp'], reverse=True)
    for d in all_disruptions:
        ts_raw = d.pop('timestamp', None)
        if ts_raw and hasattr(ts_raw, 'isoformat'):
            d['timestamp_iso'] = ts_raw.isoformat()
    return jsonify({'disruptions': all_disruptions})

@admin_bp.route('/analytics', methods=['GET'])
@require_admin
def admin_analytics():
    snapshots = list(db.collection('financial_snapshots').stream())
    weekly = []
    for s in snapshots:
        sd = s.to_dict()
        weekly.append({
            'week': sd.get('week'),
            'premiums': sd.get('premiums', 0),
            'payouts': sd.get('payouts', 0),
            'profit': sd.get('profit', 0)
        })
    def sort_key(item):
        w_part, m_part = item['week'].split(' ')
        month_idx = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].index(m_part)
        week_idx = int(w_part[1:])
        return (month_idx, week_idx)

    weekly.sort(key=sort_key)
    
    current_week = db.collection('financials').document('current_week').get()
    cw_data = current_week.to_dict() if current_week.exists else {}
    
    return jsonify({
        'weekly': weekly,
        'zones': cw_data.get('zone_breakdown', []),
        'fraud': {
            'totalFlagged': cw_data.get('fraud_blocked_count', 0),
            'fraudRate': cw_data.get('fraud_rate_pct', 0),
            'savedAmount': cw_data.get('fraud_savings', 0)
        }
    })

def detect_worker_zone(employee_id: str) -> str | None:
    orders = db.collection('orders_week_a')\
               .where('employee_id', '==', employee_id).stream()
    pickup_zones = [o.to_dict().get('pickup_zone') for o in orders if o.to_dict().get('pickup_zone')]
    if not pickup_zones:
        return None
    return Counter(pickup_zones).most_common(1)[0][0]

def run_order_rotation():
    """
    Core logic for rotating order tables. Extracted for both API and Cron use.
    """
    def batch_delete(coll_name):
        docs = db.collection(coll_name).list_documents()
        count = 0
        batch = db.batch()
        for doc in docs:
            batch.delete(doc)
            count += 1
            if count >= 499:
                batch.commit()
                batch = db.batch()
                count = 0
        batch.commit()

    def batch_copy(src_coll, dest_coll):
        src_docs = db.collection(src_coll).stream()
        count = 0
        batch = db.batch()
        for doc in src_docs:
            batch.set(db.collection(dest_coll).document(doc.id), doc.to_dict())
            count += 1
            if count >= 499:
                batch.commit()
                batch = db.batch()
                count = 0
        batch.commit()

    # Steps 1-7: Rotate tables
    batch_delete('orders_week_d')
    batch_copy('orders_week_c', 'orders_week_d')
    batch_delete('orders_week_c')
    batch_copy('orders_week_b', 'orders_week_c')
    batch_delete('orders_week_b')
    batch_copy('orders_week_a', 'orders_week_b')
    batch_delete('orders_week_a')

    # Step 8-10: Fetch new orders and recompute worker stats
    workers = list(db.collection('workers').where('is_deleted', '==', False).stream())
    PLATFORM_API_URL = os.getenv("PLATFORM_API_URL", "http://localhost:5001")
    from services.premium_calc import calculate_premium_and_coverage
    
    total_premiums_snapshot = 0
    updated_count = 0
    
    for w_doc in workers:
        w = w_doc.to_dict()
        uid, eid = w['uid'], w['employee_id']
        total_premiums_snapshot += w.get('premium', 0)
        
        # Step 8: New orders for week A
        try:
            resp = requests.get(f"{PLATFORM_API_URL}/platform/orders/{eid}?week=new", timeout=10)
            if resp.status_code == 200:
                new_orders = resp.json().get('orders', [])
                batch = db.batch()
                for o in new_orders:
                    batch.set(db.collection('orders_week_a').document(o['order_id']), o)
                batch.commit()
        except Exception as e:
            print(f"Error fetching orders for {eid}: {e}")
            
        # Step 9: Recompute averages
        total_in, total_dist, total_ord = 0, 0, 0
        for table in ['orders_week_a', 'orders_week_b', 'orders_week_c', 'orders_week_d']:
            docs = db.collection(table).where('employee_id', '==', eid).stream()
            for d in docs:
                od = d.to_dict()
                total_in += od.get('amount_paid', 0)
                total_dist += od.get('distance', 0)
                total_ord += 1
        
        avg_income = round(total_in / 4)
        avg_dist = round(total_dist / 28, 1)
        avg_deliv = round(total_ord / 28, 1)
        
        # Recalculate premium and coverage based on new averages
        calc = calculate_premium_and_coverage(avg_income, avg_dist, w.get('city', 'Bangalore'))
        
        db.collection('workers').document(uid).update({
            'avg_income': avg_income,
            'avg_daily_distance': avg_dist,
            'avg_deliveries': avg_deliv,
            'premium': calc['premium'],
            'coverage': calc['coverage']
        })
        
        # Step 10: Zone detection
        new_zone = detect_worker_zone(eid)
        if new_zone and new_zone != w.get('zone'):
            db.collection('workers').document(uid).update({
                'zone': new_zone, 
                'updated_at': firestore.SERVER_TIMESTAMP
            })
            create_notification(uid, 'zone', 'Zone Updated', f"Your primary zone is now {new_zone}.")
        
        updated_count += 1

    # Step 11: Write financial snapshot
    # Calculate payouts for the week that just passed (which was in week_a)
    now = datetime.now(timezone.utc)
    week_start = now - timedelta(days=7)
    payouts_query = db.collection('payments')\
                      .where('type', '==', 'payout')\
                      .where('created_at', '>=', week_start).stream()
    total_payouts_snapshot = sum(p.to_dict().get('amount', 0) for p in payouts_query)
    profit = total_premiums_snapshot - total_payouts_snapshot
    
    snap_label = f"W{(now.day-1)//7+1} {now.strftime('%b')}"
    snap_id = f"W{(now.day-1)//7+1}_{now.strftime('%b')}"
    
    db.collection('financial_snapshots').document(snap_id).set({
        'week': snap_label,
        'premiums': total_premiums_snapshot,
        'payouts': total_payouts_snapshot,
        'profit': profit,
        'enrolled_workers': updated_count,
        'active_claims': 0, # Placeholder
        'fraud_blocked': 0, # Placeholder
        'timestamp': firestore.SERVER_TIMESTAMP
    })

    # Step 12: Update current_week breakdown (placeholder values)
    db.collection('financials').document('current_week').set({
        'fraud_blocked_count': 0,
        'fraud_savings': 0,
        'fraud_rate_pct': 0,
        'zone_breakdown': [] # Typically populated by a separate analysis job
    }, merge=True)

    return snap_label, updated_count

@admin_bp.route('/rotate-orders', methods=['POST'])
@require_admin
def rotate_orders():
    try:
        new_week, updated = run_order_rotation()
        return jsonify({
            'success': True, 
            'workers_updated': updated, 
            'new_week': new_week
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500
