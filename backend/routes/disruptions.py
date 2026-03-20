"""
routes/disruptions.py — Updated for v6 schema
  - Claims now store both customer_id and employee_id
  - Zone workers looked up by zone field
"""

from flask import Blueprint, request, jsonify
from firebase_admin import firestore
from services.firebase_service import get_db, get_zone_workers, save_claim, save_disruption
from services.weather_service import check_weather, check_aqi, get_worst_disruption
from services.verification import verify_worker_claim
from services.payout_service import process_payout
import uuid

disruptions_bp = Blueprint('disruptions', __name__)


@disruptions_bp.route('/simulate', methods=['POST'])
def simulate_disruption():
    db   = get_db()
    data = request.get_json()

    zone               = data.get('zone', 'Koramangala')
    manual_disruption  = data.get('disruption', None)

    if manual_disruption:
        disruption = manual_disruption
    else:
        city    = zone.split(',')[0].strip()
        weather = check_weather(city)
        aqi     = check_aqi(city)
        disruption = get_worst_disruption(weather, aqi)

    if not disruption or not disruption.get('severity'):
        return jsonify({'message': 'No disruption detected', 'zone': zone, 'claims': []}), 200

    workers  = get_zone_workers(zone)
    results  = []
    total_payout = 0

    for worker in workers:
        customer_id  = worker.get('customer_id', '')
        employee_id  = worker.get('employee_id', '')
        verification = verify_worker_claim(customer_id, disruption)
        payout       = 0

        if verification['approved']:
            payout       = round(worker.get('coverage', 1200) * disruption.get('pct', 0))
            total_payout += payout
            txn_id       = f"pay_{uuid.uuid4().hex[:12]}"

            claim_id = save_claim({
                'customer_id':          customer_id,
                'employee_id':          employee_id,
                'disruption_event_id':  data.get('disruption_event_id', ''),
                'zone':                 zone,
                'city':                 worker.get('city', ''),
                'category':             disruption.get('type', 'RAI').upper()[:3],
                'severity':             disruption.get('severity', 'Minor'),
                'status':               'paid',
                'payout_amount':        payout,
                'txn_id':               txn_id,
                'layers_passed':        verification['layers_passed'],
                'distance':             0.0,
                'fraud_flag':           False,
                'fraud_reason':         '',
                'flag_count':           0,
                'auto_approve':         True,
                'fraud_decision':       'clean',
            })

        results.append({
            'customer_id':   customer_id,
            'employee_id':   employee_id,
            'name':          worker.get('name', 'Unknown'),
            'approved':      verification['approved'],
            'layers_passed': verification['layers_passed'],
            'reason':        verification['reason'],
            'payout':        payout,
        })

    save_disruption({
        'zone':             zone,
        'category':         disruption.get('type', 'RAI').upper()[:3],
        'severity':         disruption.get('severity'),
        'event_label':      f"{disruption.get('type','').upper()} — {disruption.get('severity','')}",
        'time_label':       'Just now',
        'affected_workers': len(workers),
        'paid_workers':     sum(1 for r in results if r['approved']),
        'blocked_workers':  sum(1 for r in results if not r['approved']),
        'total_paid_out':   total_payout,
        'payout_pct':       disruption.get('pct', 0),
        'status':           'processed',
    })

    return jsonify({
        'zone':         zone,
        'disruption':   disruption,
        'totalWorkers': len(workers),
        'totalPayout':  total_payout,
        'results':      results,
    }), 200


@disruptions_bp.route('/history/<path:zone>', methods=['GET'])
def get_disruption_history(zone):
    db     = get_db()
    events = db.collection('disruption_events').where('zone', '==', zone).stream()
    result = [{'id': d.id, **d.to_dict()} for d in events]
    return jsonify({'zone': zone, 'history': result}), 200


@disruptions_bp.route('/trigger', methods=['POST'])
def manual_trigger():
    """Admin-triggered disruption."""
    return simulate_disruption()
