# churn_predictor.py
# M5 – Churn Prediction Model for KavachPay (XGBoost)
# Usage: from churn_predictor import predict_churn

import joblib
import numpy as np

# Load model artifacts once (global)
_artifact = joblib.load('churn_model_final.pkl')
_model = _artifact['model']
_scaler = _artifact['scaler']
_feature_cols = _artifact['feature_cols']

def predict_churn(worker_dict):
    """
    Predicts churn probability (0-1) for a single worker.

    Required keys in worker_dict:
        premium, kavachScore, months_active, past_claims, past_correct_claims,
        city_tier, risk, policyStatus, internal_income, coverage, age
    """
    # Get raw values
    premium = worker_dict['premium']
    kavachScore = worker_dict['kavachScore']
    months_active = worker_dict['months_active']
    past_claims = worker_dict.get('past_claims', 0)
    past_correct = worker_dict.get('past_correct_claims', 0)
    city_tier = worker_dict['city_tier']
    risk = worker_dict.get('risk', 'medium')
    policyStatus = worker_dict.get('policyStatus', 'active')
    internal_income = worker_dict.get('internal_income', 2500)
    coverage = worker_dict.get('coverage', 1000)
    age = worker_dict.get('age', 28)
    
    # Compute derived features (must match training)
    
    # 1. honesty_ratio
    honesty_ratio = (past_correct / past_claims) if past_claims > 0 else 1.0
    
    # 2. premium_to_income (affordability)
    inc = max(internal_income, 1)
    premium_to_income = premium / (inc / 4)
    
    # 3. claim_density (claims per month)
    claim_density = past_claims / max(months_active, 0.1)
    
    # 4. coverage_ratio (value for money)
    coverage_ratio = coverage / max(premium, 1)
    
    # 5. tenure_log (log transform of tenure)
    tenure_log = np.log1p(months_active)
    
    # 6. premium_score_interaction (non-linear effect)
    premium_score_interaction = premium * kavachScore / 1000
    
    # 7. risk_enc (encode risk to numeric)
    risk_enc = {'high': 2, 'medium': 1, 'low': 0}.get(risk, 1)
    
    # 8. policy_flagged (flagged status)
    policy_flagged = 1 if policyStatus == 'flagged' else 0
    
    # Build feature dictionary in exact order as training
    features = {
        'premium': premium,
        'kavachScore': kavachScore,
        'months_active': months_active,
        'past_claims': past_claims,
        'city_tier': city_tier,
        'honesty_ratio': honesty_ratio,
        'risk_enc': risk_enc,
        'premium_to_income': premium_to_income,
        'claim_density': claim_density,
        'coverage_ratio': coverage_ratio,
        'premium_score_interaction': premium_score_interaction,
        'tenure_log': tenure_log,
        'policy_flagged': policy_flagged,
    }
    
    # Order features exactly as in training
    row = [[features[col] for col in _feature_cols]]
    row_scaled = _scaler.transform(row)
    prob = _model.predict_proba(row_scaled)[0, 1]
    return round(float(prob), 3)

if __name__ == '__main__':
    sample = {
        'premium': 80,
        'kavachScore': 820,
        'months_active': 24,
        'past_claims': 2,
        'past_correct_claims': 2,
        'city_tier': 1,
        'risk': 'low',
        'policyStatus': 'active',
        'internal_income': 4800,
        'coverage': 2000,
        'age': 34
    }
    print(f"Churn probability: {predict_churn(sample)}")
