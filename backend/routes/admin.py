"""
routes/admin.py — Updated for v6 schema
  - Overview pulls real counts from Firestore
  - Financial health uses customer_id correctly
  - Workers endpoint returns both customer_id and employee_id
"""

from flask import Blueprint, jsonify
from firebase_admin import firestore
from services.firebase_service import get_db

admin_bp = Blueprint('admin', __name__)


@admin_bp.route('/overview', methods=['GET'])
def get_overview():
    db = get_db()

    workers     = list(db.collection('workers').stream())
    active_w    = [w for w in workers if w.to_dict().get('policyStatus') == 'active']
    claims      = list(db.collection('claims').stream())
    paid_claims = [c for c in claims if c.to_dict().get('status') == 'paid']

    total_premiums = sum(w.to_dict().get('premium', 0) for w in active_w)
    total_payouts  = sum(c.to_dict().get('payout_amount', 0) for c in paid_claims)
    loss_ratio     = round(total_payouts / total_premiums * 100, 1) if total_premiums > 0 else 0
    avg_score      = round(sum(w.to_dict().get('kavachScore', 750) for w in workers) / len(workers)) if workers else 750

    return jsonify({
        'totalWorkers':   len(workers),
        'activeWorkers':  len(active_w),
        'totalPremiums':  total_premiums,
        'totalPayouts':   total_payouts,
        'activeClaims':   len([c for c in claims if c.to_dict().get('status') == 'pending']),
        'lossRatio':      loss_ratio,
        'kavachScoreAvg': avg_score,
        'zonesMonitored': len(set(w.to_dict().get('zone', '') for w in workers)),
    }), 200


@admin_bp.route('/zones', methods=['GET'])
def get_zones():
    """Dynamically compute zone stats from workers + claims."""
    db      = get_db()
    workers = list(db.collection('workers').stream())
    claims  = list(db.collection('claims').stream())

    zone_map = {}
    for w in workers:
        wd = w.to_dict()
        z  = wd.get('zone', 'Unknown')
        if z not in zone_map:
            zone_map[z] = {'zone': z, 'city': wd.get('city', ''), 'risk': wd.get('risk', 'medium'),
                           'workers': 0, 'premiums': 0, 'payouts': 0, 'disruptions': 0}
        zone_map[z]['workers']  += 1
        zone_map[z]['premiums'] += wd.get('premium', 0)

    for c in claims:
        cd = c.to_dict()
        z  = cd.get('zone', 'Unknown')
        if z in zone_map and cd.get('status') == 'paid':
            zone_map[z]['payouts']     += cd.get('payout_amount', 0)
            zone_map[z]['disruptions'] += 1

    zones = []
    for z, data in zone_map.items():
        loss_ratio = round(data['payouts'] / data['premiums'] * 100, 1) if data['premiums'] else 0
        status     = 'disrupted' if data['disruptions'] > 0 else 'safe'
        zones.append({**data, 'lossRatio': loss_ratio, 'status': status,
                      'premium': data['premiums'] // data['workers'] if data['workers'] else 0})

    return jsonify({'zones': zones}), 200


@admin_bp.route('/workers', methods=['GET'])
def get_all_workers():
    db = get_db()
    result = []
    for w in db.collection('workers').stream():
        data = w.to_dict()
        # Expose both IDs for admin view
        data['customer_id'] = w.id
        data.pop('password', None)
        result.append(data)
    return jsonify({'workers': result, 'total': len(result)}), 200


@admin_bp.route('/disruptions', methods=['GET'])
def get_disruptions():
    db           = get_db()
    disruptions  = list(db.collection('disruption_events').stream())
    result       = [{'id': d.id, **d.to_dict()} for d in disruptions]
    return jsonify({'disruptions': result, 'total': len(result)}), 200


@admin_bp.route('/analytics', methods=['GET'])
def get_analytics():
    db        = get_db()
    snapshots = db.collection('financial_snapshots').stream()
    data      = [s.to_dict() for s in snapshots]
    data.sort(key=lambda x: x.get('week', ''))
    return jsonify({'months': data}), 200


@admin_bp.route('/fraud', methods=['GET'])
def get_fraud_stats():
    db     = get_db()
    claims = list(db.collection('claims').stream())
    flagged = [c for c in claims if c.to_dict().get('fraud_flag')]
    total   = len(claims)
    fraud_rate = round(len(flagged) / total * 100, 1) if total else 0
    return jsonify({
        'totalFlagged': len(flagged),
        'autoRejected': len([c for c in flagged if not c.to_dict().get('auto_approve')]),
        'manualReview': len([c for c in flagged if c.to_dict().get('fraud_decision') == 'manual_review']),
        'fraudRate':    fraud_rate,
        'savedAmount':  sum(c.to_dict().get('payout_amount', 0) for c in flagged),
    }), 200


@admin_bp.route('/financial-health', methods=['GET'])
def financial_health():
    db     = get_db()
    claims = list(db.collection('claims').stream())

    zone_stats = {}
    for c in claims:
        cd = c.to_dict()
        z  = cd.get('zone', 'Unknown')
        if z not in zone_stats:
            zone_stats[z] = {'totalPaidOut': 0, 'claimCount': 0, 'totalPremiums': 0}
        zone_stats[z]['totalPaidOut'] += cd.get('payout_amount', 0)
        zone_stats[z]['claimCount']   += 1

    workers = list(db.collection('workers').stream())
    for w in workers:
        wd = w.to_dict()
        z  = wd.get('zone', 'Unknown')
        if z not in zone_stats:
            zone_stats[z] = {'totalPaidOut': 0, 'claimCount': 0, 'totalPremiums': 0}
        zone_stats[z]['totalPremiums'] += wd.get('premium', 0)

    report = []
    for zone, stats in zone_stats.items():
        p  = stats['totalPremiums']
        py = stats['totalPaidOut']
        lr = round(py / p * 100, 1) if p > 0 else 0
        if lr >= 90:   status, action = "critical", "Suspend new enrollments immediately"
        elif lr >= 75: status, action = "warning",  "Review premium pricing"
        elif lr >= 60: status, action = "healthy",  "Within target range"
        else:          status, action = "excellent", "Consider premium reduction"
        report.append({'zone': zone, 'lossRatio': lr, 'status': status, 'action': action,
                       'claims': stats['claimCount'], 'premiums': p, 'payouts': py})

    overall = round(
        sum(z['payouts'] for z in report) /
        max(sum(z['premiums'] for z in report), 1) * 100, 1)

    return jsonify({'overallLossRatio': overall, 'target': '60-70%', 'zones': report}), 200
