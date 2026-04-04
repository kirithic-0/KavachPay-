# churn_predictor.py
# M5 – Churn Prediction Model for KavachPay
# Usage: from churn_predictor import predict_churn

import joblib
import numpy as np

# Load model artifacts once (global)
_artifact = joblib.load('churn_model.pkl')
_model = _artifact['model']
_scaler = _artifact['scaler']
_feature_cols = _artifact['feature_cols']

def predict_churn(worker_dict):
    """
    Predicts churn probability (0-1) for a single worker.

    Required keys in worker_dict:
        premium, kavachScore, months_active, past_claims, past_correct_claims,
        city_tier, risk, social_disruption_exposure, policyStatus,
        internal_income, age
    """
    past_claims = worker_dict.get('past_claims', 0)
    past_correct = worker_dict.get('past_correct_claims', 0)
    honesty_ratio = (past_correct / past_claims) if past_claims > 0 else 1.0

    inc = max(worker_dict.get('internal_income', 2500), 1)
    premium_to_income = worker_dict['premium'] / (inc / 4)

    ks = worker_dict['kavachScore']
    if ks >= 750:
        score_tier_enc = 0
    elif ks >= 500:
        score_tier_enc = 1
    elif ks >= 300:
        score_tier_enc = 2
    else:
        score_tier_enc = 3

    features = {
        'premium': worker_dict['premium'],
        'kavachScore': ks,
        'months_active': worker_dict['months_active'],
        'past_claims': past_claims,
        'city_tier': worker_dict['city_tier'],
        'honesty_ratio': honesty_ratio,
        'risk_enc': {'high':2, 'medium':1, 'low':0}.get(worker_dict.get('risk','medium'),1),
        'sde_enc': {'high':2, 'medium':1, 'low':0}.get(worker_dict.get('social_disruption_exposure','low'),0),
        'policy_flagged': int(worker_dict.get('policyStatus','active') == 'flagged'),
        'policy_paused': int(worker_dict.get('policyStatus','active') == 'paused'),
        'premium_to_income': premium_to_income,
        'age': worker_dict.get('age', 28),
        'score_tier_enc': score_tier_enc,
    }

    row = [[features[col] for col in _feature_cols]]
    row_scaled = _scaler.transform(row)
    prob = _model.predict_proba(row_scaled)[0, 1]
    return round(float(prob), 3)

if __name__ == '__main__':
    sample = {
        'premium': 80, 'kavachScore': 820, 'months_active': 24,
        'past_claims': 2, 'past_correct_claims': 2, 'city_tier': 1,
        'risk': 'low', 'social_disruption_exposure': 'low',
        'policyStatus': 'active', 'internal_income': 4800, 'age': 34
    }
    print(f"Churn probability: {predict_churn(sample)}")
