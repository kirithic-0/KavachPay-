from flask import Blueprint, request, jsonify
from firebase_admin import firestore
from datetime import datetime, timedelta
from services.weather import check_weather, check_aqi, get_severity, get_payout_percentage

claims_bp = Blueprint('claims', __name__)


# Existing Route: Create a weekly policy
@claims_bp.route('/api/policy/create', methods=['POST'])
def create_policy():
    db = firestore.client()
    data = request.get_json()

    if 'worker_id' not in data:
        return jsonify({'error': 'Missing worker_id'}), 400

    worker_doc = db.collection('workers').document(data['worker_id']).get()
    if not worker_doc.exists:
        return jsonify({'error': 'Worker not found'}), 404

    worker = worker_doc.to_dict()

    start_date = datetime.utcnow()
    end_date = start_date + timedelta(days=7)

    policy = {
        'worker_id': data['worker_id'],
        'worker_name': worker['name'],
        'zone': worker['zone'],
        'premium': worker['premium'],
        'coverage': worker['coverage'],
        'status': 'active',
        'start_date': start_date.isoformat(),
        'end_date': end_date.isoformat(),
        'created_at': firestore.SERVER_TIMESTAMP
    }

    doc_ref = db.collection('policies').add(policy)
    policy_id = doc_ref[1].id

    return jsonify({
        'message': 'Policy created successfully!',
        'policy_id': policy_id,
        'start_date': start_date.isoformat(),
        'end_date': end_date.isoformat(),
        'coverage': worker['coverage']
    }), 201


# New Route: Trigger checker - the heart of KavachPay
@claims_bp.route('/api/trigger/check', methods=['POST'])
def trigger_check():
    db = firestore.client()
    data = request.get_json()

    if 'city' not in data:
        return jsonify({'error': 'Missing city'}), 400

    city = data['city']
    zone = data.get('zone', city)  # zone defaults to city if not provided

    # Step 1: Check current weather and AQI
    weather = check_weather(city)
    aqi_data = check_aqi(city)
    severity = get_severity(weather['rainfall_mm'], aqi_data['aqi'])

    # Step 2: If no disruption, stop here
    if not severity:
        return jsonify({
            'message': 'No disruption detected. No claims created.',
            'city': city,
            'rainfall_mm': weather['rainfall_mm'],
            'aqi': aqi_data['aqi']
        }), 200

    # Step 3: Find all workers in the affected zone
    workers_ref = db.collection('workers').where('zone', '==', zone).stream()
    workers = [{'id': w.id, **w.to_dict()} for w in workers_ref]

    if not workers:
        return jsonify({
            'message': f'Disruption detected ({severity}) but no workers found in zone: {zone}',
            'severity': severity
        }), 200

    # Step 4: For each worker, check if they started their day
    claims_created = []
    workers_skipped = []

    for worker in workers:
        worker_id = worker['id']

        # Only create claim if worker started their day (was planning to work)
        if not worker.get('started_day', False):
            workers_skipped.append({
                'worker_id': worker_id,
                'name': worker['name'],
                'reason': 'Did not start day - not eligible'
            })
            continue

        # Step 5: Calculate payout amount
        payout_percent = get_payout_percentage(severity)
        payout_amount = round(worker.get('coverage', 0) * payout_percent)

        # Step 6: Create the claim in Firestore
        claim = {
            'worker_id': worker_id,
            'worker_name': worker['name'],
            'zone': zone,
            'city': city,
            'severity': severity,
            'rainfall_mm': weather['rainfall_mm'],
            'aqi': aqi_data['aqi'],
            'payout_amount': payout_amount,
            'coverage': worker.get('coverage', 0),
            'status': 'pending',
            'timestamp': firestore.SERVER_TIMESTAMP
        }

        claim_ref = db.collection('claims').add(claim)
        claim_id = claim_ref[1].id

        claims_created.append({
            'claim_id': claim_id,
            'worker_id': worker_id,
            'name': worker['name'],
            'payout_amount': payout_amount,
            'severity': severity
        })

    # Step 7: Return summary of what happened
    return jsonify({
        'message': f'Trigger check complete. {len(claims_created)} claim(s) created.',
        'city': city,
        'zone': zone,
        'severity': severity,
        'rainfall_mm': weather['rainfall_mm'],
        'aqi': aqi_data['aqi'],
        'claims_created': claims_created,
        'workers_skipped': workers_skipped
    }), 201