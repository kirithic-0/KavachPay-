from flask import Blueprint, request, jsonify
from firebase_admin import firestore
from services.weather_service import check_weather, check_aqi, get_worst_disruption
from services.verification import verify_worker_claim

disruptions_bp = Blueprint('disruptions', __name__)


@disruptions_bp.route('/simulate', methods=['POST'])
def simulate_disruption():
    db = firestore.client()
    data = request.get_json()

    zone = data.get('zone', 'Koramangala, Bangalore')
    # Allow manual override for demo purposes
    manual_disruption = data.get('disruption', None)

    if manual_disruption:
        disruption = manual_disruption
    else:
        # Use live data
        city = zone.split(',')[0].strip()
        weather = check_weather(city)
        aqi = check_aqi(city)
        disruption = get_worst_disruption(weather, aqi)

    if not disruption or not disruption.get('severity'):
        return jsonify({
            'message': 'No disruption detected in this zone',
            'zone': zone,
            'claims': []
        }), 200

    # Get all workers in the zone
    workers_ref = db.collection('workers').where('zone', '==', zone).stream()
    workers = [{'id': w.id, **w.to_dict()} for w in workers_ref]

    results = []
    total_payout = 0

    for worker in workers:
        verification = verify_worker_claim(worker['id'], disruption)
        payout = 0

        if verification['approved']:
            payout = round(worker.get('coverage', 1200) * disruption.get('pct', 0))
            total_payout += payout

            # Save claim to Firestore
            db.collection('claims').add({
                'workerId':     worker['id'],
                'zone':         zone,
                'eventType':    disruption.get('type', 'rain'),
                'severity':     disruption.get('severity'),
                'status':       'paid',
                'payoutAmount': payout,
                'txnId':        f"pay_{worker['id'][:8]}",
                'createdAt':    firestore.SERVER_TIMESTAMP
            })

        results.append({
            'workerId':      worker['id'],
            'name':          worker.get('name', 'Unknown'),
            'approved':      verification['approved'],
            'layersPassed':  verification['layers_passed'],
            'reason':        verification['reason'],
            'payout':        payout
        })

    # Save disruption record
    db.collection('disruptions').add({
        'zone':            zone,
        'eventType':       disruption.get('type', 'rain'),
        'severity':        disruption.get('severity'),
        'affectedWorkers': len(workers),
        'paidWorkers':     sum(1 for r in results if r['approved']),
        'totalPaidOut':    total_payout,
        'triggeredAt':     firestore.SERVER_TIMESTAMP
    })

    return jsonify({
        'zone':         zone,
        'disruption':   disruption,
        'totalWorkers': len(workers),
        'totalPayout':  total_payout,
        'results':      results
    }), 200


@disruptions_bp.route('/history/<path:zone>', methods=['GET'])
def get_disruption_history(zone):
    db = firestore.client()
    disruptions = db.collection('disruptions').where('zone', '==', zone).stream()
    history = [{'id': d.id, **d.to_dict()} for d in disruptions]
    return jsonify({'zone': zone, 'history': history}), 200