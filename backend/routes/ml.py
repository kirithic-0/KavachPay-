"""
routes/ml.py
============
ML insights API layer — exposes all model predictions to the frontend.

Endpoints:
    GET  /api/ml/insights/:uid    – full ML profile for a worker
    POST /api/ml/classify-text    – M7 claim text classification

All routes require worker auth (Bearer token).
"""
from flask import Blueprint, request, jsonify
from firebase_admin import firestore
from datetime import datetime
from utils.auth_middleware import require_auth
from services.ml_models import (
    m1_predict_premium, m1a_predict_premium_coldstart,
    m2_detect_fraud, m3_estimate_income_loss,
    m5_predict_churn, m6_get_zone_cluster, m7_classify_claim_text,
    CITY_RISK,
)

ml_bp = Blueprint('ml', __name__)


@ml_bp.route('/insights/<uid>', methods=['GET'])
@require_auth
def get_ml_insights(uid):
    """
    Returns ML model outputs for a given worker — used by Dashboard ML panel.

    Response shape:
    {
      "premium_model": { model_used, base_premium, final_premium, churn_probability, margin },
      "fraud_profile": { fraud_prob, decision, threshold, flags },
      "income_loss":   { p10, p50, p90 },   ← for worker's zone + 'HRA' as default scenario
      "churn":         { churn_probability, margin },
      "zone_cluster":  { cluster_id, cluster_label, city_risk },
    }
    """
    if request.user.get('uid') != uid:
        return jsonify({'error': 'Forbidden'}), 403

    db  = firestore.client()
    doc = db.collection('workers').document(uid).get()
    if not doc.exists:
        return jsonify({'error': 'Worker not found'}), 404

    w = doc.to_dict()

    city           = w.get('city', 'Bangalore')
    zone           = w.get('zone', '')
    platform       = w.get('platform', 'Swiggy')
    age            = int(w.get('age', 25))
    kavach_score   = int(w.get('kavach_score', 750))
    months_active  = float(w.get('months_active', 0))
    past_claims    = int(w.get('past_claims', 0))
    past_correct   = int(w.get('past_correct_claims', 0))
    avg_income     = float(w.get('avg_income', 3500))
    avg_deliveries = float(w.get('avg_deliveries', 12))
    coverage       = float(w.get('coverage', 1200))
    premium        = float(w.get('premium', 59))
    risk           = CITY_RISK.get(city, 'low')

    # M1 / M1a
    if months_active >= 4:
        base_premium = m1_predict_premium(
            risk=risk, age=age, months_active=months_active,
            past_claims=past_claims, past_correct_claims=past_correct,
            kavach_score=kavach_score, city=city,
            avg_daily_deliveries=avg_deliveries,
        )
        model_used = 'M1 (Random Forest)'
    else:
        base_premium = m1a_predict_premium_coldstart(
            age=age, risk=risk, city=city, platform=platform,
        )
        model_used = 'M1a (GLM Tweedie Cold-Start)'

    # M5
    churn_result = m5_predict_churn(
        premium=premium, kavach_score=kavach_score,
        months_active=months_active, past_claims=past_claims, city=city,
    )
    final_premium = max(39, min(150, round(base_premium * (1 + churn_result['margin']))))

    # M2 — fraud profile based on worker's history (no specific claim context)
    fraud_result = m2_detect_fraud(
        kavach_score=kavach_score,
        past_claims=past_claims,
        past_correct_claims=past_correct,
        months_active=months_active,
        has_declaration=bool(w.get('eshram_id') or w.get('employer_name')),
        is_severe=False,
        payout_amount=0.0,
        coverage=coverage,
        orders_during_disruption=0,
        disruption_code='HRA',
        measured_value=0.0,
        zone_inactivity_pct=0.7,
    )

    # M3 — representative scenario for worker's zone (Heavy Rain)
    loss_result = m3_estimate_income_loss(
        avg_daily_deliveries=avg_deliveries,
        day_of_week=datetime.utcnow().weekday(),
        disruption_code='HRA',
        measured_value=82.0,
        zone_risk=risk,
        platform=platform,
        avg_income=avg_income,
    )

    # M6 — zone cluster
    cluster_result = m6_get_zone_cluster(zone, city)

    return jsonify({
        'premium_model': {
            'model_used':        model_used,
            'base_premium':      base_premium,
            'final_premium':     final_premium,
            'churn_probability': churn_result['churn_probability'],
            'margin':            churn_result['margin'],
        },
        'fraud_profile': {
            'fraud_prob': fraud_result['fraud_prob'],
            'decision':   fraud_result['decision'],
            'threshold':  fraud_result['threshold'],
            'flags':      fraud_result['flags'],
        },
        'income_loss': {
            'scenario':   'Heavy Rain 82mm',
            'p10':        loss_result['p10'],
            'p50':        loss_result['p50'],
            'p90':        loss_result['p90'],
        },
        'churn': churn_result,
        'zone_cluster': cluster_result,
    })


@ml_bp.route('/classify-text', methods=['POST'])
@require_auth
def classify_claim_text():
    """
    POST /api/ml/classify-text
    Body: { "text": "...", "trigger_code": "HRA" }
    Returns M7 prediction for frontend display before submit.
    """
    data         = request.get_json()
    text         = data.get('text', '')
    trigger_code = data.get('trigger_code', '')

    result = m7_classify_claim_text(text, trigger_code)
    return jsonify(result)
