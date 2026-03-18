from flask import Blueprint, jsonify
from firebase_admin import firestore
from services.firebase_service import get_db

admin_bp = Blueprint('admin', __name__)


@admin_bp.route('/overview', methods=['GET'])
def get_overview():
    db = get_db()

    # Pull real counts from Firestore
    workers = list(db.collection('workers').stream())
    active_workers = [w for w in workers if w.to_dict().get('policyStatus') == 'active']
    claims = list(db.collection('claims').stream())
    paid_claims = [c for c in claims if c.to_dict().get('status') == 'paid']

    total_premiums = sum(w.to_dict().get('premium', 0) for w in active_workers)
    total_payouts = sum(c.to_dict().get('payoutAmount', 0) for c in paid_claims)
    loss_ratio = round((total_payouts / total_premiums * 100), 1) if total_premiums > 0 else 0
    avg_score = round(sum(w.to_dict().get('kavachScore', 750) for w in workers) / len(workers)) if workers else 750

    return jsonify({
        'totalWorkers':    len(workers),
        'activeWorkers':   len(active_workers),
        'totalPremiums':   total_premiums,
        'totalPayouts':    total_payouts,
        'activeClaims':    len([c for c in claims if c.to_dict().get('status') == 'pending']),
        'lossRatio':       loss_ratio,
        'kavachScoreAvg':  avg_score,
        'zonesMonitored':  6
    }), 200


@admin_bp.route('/zones', methods=['GET'])
def get_zones():
    return jsonify({'zones': [
        {'zone': 'Koramangala, Bangalore', 'city': 'Bangalore', 'risk': 'medium', 'premium': 59,  'coverage': 1200, 'enrolledWorkers': 214, 'lossRatio': 61.2, 'status': 'safe'},
        {'zone': 'Adyar, Chennai',         'city': 'Chennai',   'risk': 'high',   'premium': 74,  'coverage': 1560, 'enrolledWorkers': 189, 'lossRatio': 68.4, 'status': 'safe'},
        {'zone': 'Dharavi, Mumbai',        'city': 'Mumbai',    'risk': 'high',   'premium': 96,  'coverage': 1560, 'enrolledWorkers': 312, 'lossRatio': 71.3, 'status': 'safe'},
        {'zone': 'Bandra, Mumbai',         'city': 'Mumbai',    'risk': 'medium', 'premium': 64,  'coverage': 1200, 'enrolledWorkers': 278, 'lossRatio': 58.9, 'status': 'safe'},
        {'zone': 'Whitefield, Bangalore',  'city': 'Bangalore', 'risk': 'low',    'premium': 49,  'coverage': 980,  'enrolledWorkers': 156, 'lossRatio': 44.1, 'status': 'safe'},
        {'zone': 'T Nagar, Chennai',       'city': 'Chennai',   'risk': 'medium', 'premium': 59,  'coverage': 1200, 'enrolledWorkers': 135, 'lossRatio': 62.7, 'status': 'safe'},
    ]}), 200


@admin_bp.route('/workers', methods=['GET'])
def get_all_workers():
    db = get_db()
    workers_ref = db.collection('workers').stream()
    workers = []
    for w in workers_ref:
        data = w.to_dict()
        data['id'] = w.id
        # Don't expose sensitive fields to admin API
        data.pop('password', None)
        workers.append(data)
    return jsonify({'workers': workers, 'total': len(workers)}), 200


@admin_bp.route('/disruptions', methods=['GET'])
def get_disruptions():
    db = get_db()
    disruptions_ref = db.collection('disruptions').stream()
    disruptions = [{'id': d.id, **d.to_dict()} for d in disruptions_ref]
    return jsonify({'disruptions': disruptions, 'total': len(disruptions)}), 200


@admin_bp.route('/analytics', methods=['GET'])
def get_analytics():
    return jsonify({'months': [
        {'month': 'Oct', 'premiums': 58000, 'payouts': 32000, 'profit': 26000},
        {'month': 'Nov', 'premiums': 63000, 'payouts': 41000, 'profit': 22000},
        {'month': 'Dec', 'premiums': 71000, 'payouts': 38000, 'profit': 33000},
        {'month': 'Jan', 'premiums': 75000, 'payouts': 52000, 'profit': 23000},
        {'month': 'Feb', 'premiums': 79000, 'payouts': 44000, 'profit': 35000},
        {'month': 'Mar', 'premiums': 75756, 'payouts': 48320, 'profit': 27436},
    ]}), 200


@admin_bp.route('/fraud', methods=['GET'])
def get_fraud_stats():
    return jsonify({
        'totalFlagged': 47, 'autoRejected': 31,
        'manualReview': 16, 'fraudRate': 3.7, 'savedAmount': 28400
    }), 200

@admin_bp.route('/financial-health', methods=['GET'])
def financial_health():
    """
    Computes real-time loss ratio per zone and flags zones
    approaching unprofitability. Target loss ratio: 60-70%.
    Above 75% = warning. Above 90% = critical.
    """
    db = get_db()

    zone_stats = {}
    claims = list(db.collection('claims').stream())

    for claim in claims:
        c = claim.to_dict()
        zone = c.get('zone', 'Unknown')
        if zone not in zone_stats:
            zone_stats[zone] = {'totalPaidOut': 0, 'claimCount': 0}
        zone_stats[zone]['totalPaidOut'] += c.get('payoutAmount', 0)
        zone_stats[zone]['claimCount'] += 1

    workers = list(db.collection('workers').stream())
    for worker in workers:
        w = worker.to_dict()
        zone = w.get('zone', 'Unknown')
        if zone not in zone_stats:
            zone_stats[zone] = {'totalPaidOut': 0, 'claimCount': 0}
        zone_stats[zone].setdefault('totalPremiums', 0)
        zone_stats[zone]['totalPremiums'] = zone_stats[zone].get('totalPremiums', 0) + w.get('premium', 0)

    health_report = []
    for zone, stats in zone_stats.items():
        premiums = stats.get('totalPremiums', 1)
        payouts = stats.get('totalPaidOut', 0)
        loss_ratio = round((payouts / premiums * 100), 1) if premiums > 0 else 0

        if loss_ratio >= 90:   status, action = "critical", "Suspend new enrollments immediately"
        elif loss_ratio >= 75: status, action = "warning",  "Review premium pricing for zone"
        elif loss_ratio >= 60: status, action = "healthy",  "Within target range"
        else:                  status, action = "excellent", "Low claims - consider premium reduction"

        health_report.append({
            'zone':       zone,
            'lossRatio':  loss_ratio,
            'status':     status,
            'action':     action,
            'claims':     stats.get('claimCount', 0),
            'premiums':   premiums,
            'payouts':    payouts
        })

    overall_loss_ratio = round(
        sum(z['payouts'] for z in health_report) /
        max(sum(z['premiums'] for z in health_report), 1) * 100, 1
    )

    return jsonify({
        'overallLossRatio': overall_loss_ratio,
        'target':           '60-70%',
        'zones':            health_report
    }), 200