"""
services/ml_models.py
=====================
Central ML inference module for KavachPay Phase 2.

Each model function has clearly marked replacement zones:
    # ── ML MODEL START (MX): Replace with <Algorithm> ──
    ... mock rule-based logic that mirrors model behaviour ...
    # ── ML MODEL END (MX) ──

To integrate a real trained model:
    1. Train and export the model: joblib.dump(model, 'ml_artifacts/mX_name.pkl')
    2. Uncomment the joblib.load() call at the top of this file
    3. Replace only the code between the ML markers with model.predict(features)
    4. The function signature and return type MUST stay identical

Models:
    M1   – Dynamic Premium (Random Forest Regressor)        — workers with ≥4 weeks
    M1a  – Cold-Start Premium (GLM Tweedie)                 — new workers <4 weeks
    M2   – Fraud Detection (XGBoost Classifier)             — 10 engineered features
    M3   – Income Loss Estimator (Quantile Regression)      — P10 / P50 / P90
    M5   – Churn Predictor (Logistic Regression)            — next-week churn
    M6   – Zone Risk Clusterer (k-Means)                    — cluster_id 0-14
    M7   – Claim Text Triage (TF-IDF + Linear SVM)          — disruption category

Note: M4 (Disruption Trigger Engine) is rule-based and lives in
      routes/disruptions.py and services/verification.py (not here).
"""

import math

# ---------------------------------------------------------------------------
# Model file loading — uncomment when real .pkl files are ready
# ---------------------------------------------------------------------------

import joblib
import pandas as pd
import numpy as np

try:
    _M1_MODEL  = joblib.load('ml_artifacts/m1_premium_model.pkl')
    _M1A_MODEL = joblib.load('ml_artifacts/m1a_premium_model.pkl')
    _M2_MODEL  = joblib.load('ml_artifacts/m2_premium_model.pkl')
    _M3_ARTIFACT = joblib.load('ml_artifacts/income_loss_qr.pkl')
    _M5_MODEL  = joblib.load('ml_artifacts/churn_model.pkl')
    _M6_MAP    = pd.read_csv('ml_artifacts/zone_clusters.csv', index_col='zone')
except Exception as e:
    print(f"Error loading models: {e}")

# _M1_MODEL  = joblib.load('ml_artifacts/m1_premium_rf.pkl')
# _M1A_MODEL = joblib.load('ml_artifacts/m1a_coldstart_glm.pkl')
# _M2_MODEL  = joblib.load('ml_artifacts/m2_fraud_xgb.pkl')
# _M3_ARTIFACT = joblib.load('ml_artifacts/m3_income_loss_qr.pkl')
#   # _M3_ARTIFACT contains: { 'models': {0.10: ..., 0.50: ..., 0.90: ...}, 'scaler': ..., 'feature_cols': [...] }
# _M5_MODEL  = joblib.load('ml_artifacts/m5_churn_lr.pkl')
# _M6_MAP    = pd.read_csv('ml_artifacts/m6_zone_cluster_map.csv', index_col='zone')
# _M7_MODEL  = joblib.load('ml_artifacts/m7_text_svm.pkl')
# _M7_VECTORIZER = joblib.load('ml_artifacts/m7_tfidf.pkl')

# ---------------------------------------------------------------------------
# Shared encoders / lookup tables (identical to training preprocessing)
# ---------------------------------------------------------------------------
CITY_RISK = {
    'Mumbai': 'high', 'Chennai': 'high', 'Kolkata': 'high', 'Delhi': 'high',
    'Hyderabad': 'medium', 'Pune': 'medium',
    'Bangalore': 'low',
}

CITY_TIER = {
    'Mumbai': '1', 'Delhi': '1', 'Kolkata': '1',
    'Bangalore': '2', 'Chennai': '2', 'Hyderabad': '2', 'Pune': '2',
}

RISK_ENC = {'low': 0, 'medium': 1, 'high': 2}

PLATFORM_ENC = {
    'Swiggy': 0, 'Zomato': 1, 'Blinkit': 2, 'Zepto': 3,
    'Dunzo': 4, 'BigBasket': 5, 'Ola': 6, 'Rapido': 7, 'Uber': 8,
}

# Typical disruption duration in hours (used by M3)
DISRUPTION_HOURS = {
    'HRA': 6.0, 'MRA': 4.0, 'LRA': 2.0, 'STM': 8.0, 'WND': 6.0,
    'HTV': 8.0, 'FOG': 4.0, 'MAQ': 6.0, 'SAQ': 8.0,
    'EQK': 12.0, 'FLD': 24.0, 'CRF': 12.0, 'LND': 8.0, 'PND': 0.0, 'WAR': 0.0,
}

# Impact multiplier by code (mirrors training labels)
DISRUPTION_CODE_MULT = {
    'HRA': 1.00, 'MRA': 0.65, 'LRA': 0.25, 'STM': 0.80, 'WND': 1.00,
    'HTV': 0.65, 'FOG': 0.45, 'MAQ': 0.35, 'SAQ': 0.70,
    'EQK': 1.40, 'FLD': 1.20, 'CRF': 1.00, 'LND': 0.90, 'PND': 0.0, 'WAR': 0.0,
}


# ===========================================================================
# M1 — Dynamic Premium Engine (Random Forest Regressor mock)
# For workers with months_active >= 4
# Output: premium ₹ (capped 39 – 150)
# ===========================================================================
def m1_predict_premium(
    risk: str,                   # 'low' | 'medium' | 'high'
    age: int,                    # worker age in years
    months_active: float,        # months on any delivery platform
    past_claims: int,            # total claims filed (all time)
    past_correct_claims: int,    # legitimate (paid) claims
    kavach_score: int,           # 0 – 1000
    city: str,
    avg_daily_deliveries: float,
    sde: str = 'none',           # social disruption exposure: none / low / medium / high
) -> int:
    """
    M1: used when months_active >= 4.
    Training features (in order): risk_enc, age, months_active, past_claims,
    past_correct_claims, kavachScore, city_tier_enc, sde_enc, avg_daily_deliveries.
    Output capped ₹39 – ₹150.
    """
        # ── ML MODEL START (M1): Replace with _M1_MODEL.predict([[features]])[0] ──
    try:
        import numpy as np
        risk_map = {'low': 0, 'medium': 1, 'high': 2}
        sde_map = {'low': 0, 'medium': 1, 'high': 2, 'none': 0}
        
        risk_enc = risk_map.get(risk, 1)
        sde_enc = sde_map.get(sde, 0)
        tier_str = CITY_TIER.get(city, '2')
        city_tier_enc = int(tier_str)
        
        # Default Medians for missing values based on M1 metadata
        avg_daily_distance = 37.7
        avg_weekly_income = 2902.0
        
        claim_rate = past_claims / (months_active + 1)
        correct_claim_ratio = past_correct_claims / (past_claims + 1)
        income_per_delivery = avg_weekly_income / (avg_daily_deliveries * 7 + 1)
        risk_income_interaction = risk_enc * avg_weekly_income
        kavach_per_month = kavach_score / (months_active + 1)
        age_risk = age * risk_enc
        delivery_intensity = avg_daily_deliveries * avg_daily_distance
        log_past_claims = np.log1p(min(past_claims, 20))
        log_income = np.log1p(avg_weekly_income)
        
        features = [
            risk_enc, age, months_active, min(past_claims, 20), past_correct_claims,
            kavach_score, city_tier_enc, sde_enc, avg_daily_deliveries,
            avg_daily_distance, avg_weekly_income, claim_rate, correct_claim_ratio,
            income_per_delivery, risk_income_interaction, kavach_per_month,
            age_risk, delivery_intensity, log_past_claims, log_income
        ]
        pred = _M1_MODEL.predict([features])[0]
        premium = max(39, min(150, round(pred)))
    except Exception:
        premium = 39 # fallback
    return premium
    # ── ML MODEL END (M1) ──
    return premium


# ===========================================================================
# M1a — Cold-Start Premium (GLM Tweedie mock)
# For workers with months_active < 4
# Output: premium ₹ (capped 39 – 150)
# ===========================================================================
def m1a_predict_premium_coldstart(
    age: int,
    risk: str,       # 'low' | 'medium' | 'high'
    city: str,
    platform: str,
) -> int:
    """
    M1a: actuarially sound premium for zero-history workers.
    Training features: age, risk_enc, city_tier, platform_enc.
    Uses Tweedie distribution (matches insurance claim patterns).
    Output capped ₹39 – ₹150.
    """
        # ── ML MODEL START (M1a): Replace with _M1A_MODEL.predict([[features]])[0] ──
    try:
        import numpy as np
        risk_enc = {'low': 0, 'medium': 1, 'high': 2}.get(risk, 1)
        city_tier_enc = int(CITY_TIER.get(city, '2'))
        pf_enc_map = {'Swiggy': 0, 'Zomato': 1, 'Blinkit': 2, 'Zepto': 3, 'Dunzo': 4, 'BigBasket': 5, 'Ola': 6, 'Rapido': 7, 'Uber': 8}
        platform_enc = pf_enc_map.get(platform, 0)
        
        features = [age, risk_enc, city_tier_enc, platform_enc]
        
        # m1a training expected 4 features
        pred = _M1A_MODEL.predict([features])[0]
        premium = max(39, min(150, round(pred)))
    except Exception:
        premium = 39
    return premium
    # ── ML MODEL END (M1a) ──
    return premium


# ===========================================================================
# M2 — Fraud Detection (XGBoost Classifier mock)
# 10 engineered features + KavachScore-dependent decision threshold
# Output: { decision, fraud_prob, threshold, flags, auto_approve }
# ===========================================================================
def m2_detect_fraud(
    kavach_score: int,
    past_claims: int,
    past_correct_claims: int,
    months_active: float,
    has_declaration: bool,              # e-Shram ID or employer-sponsored
    is_severe: bool,                    # severity == 'Severe'
    payout_amount: float,
    coverage: float,
    orders_during_disruption: int,      # orders placed in disruption window
    disruption_code: str,
    measured_value: float = 0.0,
    zone_inactivity_pct: float = 0.70,  # fraction of zone workers inactive
) -> dict:
        # ── ML MODEL START (M2): Replace with XGBoost Classifier ──
    try:
        import numpy as np
        import pandas as pd
        kavachScore_norm = kavach_score / 900.0
        honesty_ratio = past_correct_claims / max(past_claims, 1)
        months_active_cl = max(months_active, 0.1)
        claim_freq = past_claims / months_active_cl
        late_flag = 0
        has_decl = int(has_declaration)
        is_sev = int(is_severe)
        new_severe = int((months_active < 3) and is_severe)
        payout_ratio = min(payout_amount / max(coverage, 1), 3.0)
        
        # dist_anomaly: distance wasn't passed, assume 0
        dist_anomaly = 0 
        claim_to_tenure_ratio = past_claims / (months_active + 1)
        low_kavach_high_severity = int((kavach_score < 500) and is_severe)
        payout_near_max = int(payout_ratio > 0.85)
        risk_enc = 1.0 # assume medium
        layers_passed = 1.0
        binary_flag = 0.0
        severity_loss_pct = 0.0
        is_excluded = 0.0
        
        f_dict = {
            "kavachScore_norm": kavachScore_norm, "honesty_ratio": honesty_ratio, 
            "claim_freq": claim_freq, "late_flag": late_flag,
            "has_declaration": has_decl, "is_severe": is_sev, "new_severe": new_severe, 
            "payout_ratio": payout_ratio, "dist_anomaly": dist_anomaly, 
            "claim_to_tenure_ratio": claim_to_tenure_ratio, 
            "low_kavach_high_severity": low_kavach_high_severity,
            "payout_near_max": payout_near_max, "risk_enc": risk_enc, 
            "layers_passed": layers_passed, "binary_flag": binary_flag,
            "measured_value": measured_value, "severity_loss_pct": severity_loss_pct, 
            "is_excluded": is_excluded
        }
        
        # Dummy cols from M2 json metadata
        all_cols = _M2_MODEL.feature_names_in_ if hasattr(_M2_MODEL, 'feature_names_in_') else []
        for col in all_cols:
            if col not in f_dict:
                if col.startswith("disruption_code_") and col.endswith(disruption_code):
                    f_dict[col] = 1.0
                elif col.startswith("severity_") and (("Severe" in col and is_severe) or ("Moderate" in col and not is_severe)):
                    f_dict[col] = 1.0
                else:
                    f_dict[col] = 0.0
        
        # Order the features
        if len(all_cols) > 0:
            features = [f_dict[c] for c in all_cols]
        else:
            features = list(f_dict.values())
        
        fraud_prob = _M2_MODEL.predict_proba([features])[0][1]
        
        flags = []
        if kavach_score < 550: flags.append('low_kavach_score_risk')
        if past_claims > 2 and honesty_ratio < 0.5: flags.append('high_past_fraud_ratio')
        if orders_during_disruption > 0: flags.append('activity_during_disruption_detected')
        
        if is_severe and zone_inactivity_pct >= 0.85:
            fraud_prob = max(0.01, fraud_prob - 0.15)
            
        def get_thresholds(k):
            if k >= 700: return {"auto_approve": 0.22, "reject": 0.72}
            elif k >= 450: return {"auto_approve": 0.30, "reject": 0.65}
            else: return {"auto_approve": 0.18, "reject": 0.55}
            
        t = get_thresholds(kavach_score)
        threshold = t["reject"]
        
        if fraud_prob >= t["reject"]: decision = "reject"
        elif fraud_prob <= t["auto_approve"] and not flags: decision = "auto_approve"
        elif fraud_prob <= t["auto_approve"] and flags: decision = "approve"
        else: decision = "manual_review"

    except Exception as e:
        print("Error M2", e)
        decision = "manual_review"
        fraud_prob = 0.5
        threshold = 0.45
        flags = []

    return {
        'decision':     decision,
        'fraud_prob':   round(float(max(0.01, min(0.99, fraud_prob))), 3),
        'threshold':    float(threshold),
        'flags':        flags,
        'auto_approve': decision == 'auto_approve',
    }
    # ── ML MODEL END (M2) ──


# ===========================================================================
# M3 — Income Loss Estimator (Quantile Regression mock)
# Three QuantileRegressor models: τ = 0.10, 0.50, 0.90
# Output: { p10, p50, p90 } — income loss in ₹
# ===========================================================================
def m3_estimate_income_loss(
    avg_daily_deliveries: float,
    day_of_week: int,        # 0 = Monday … 6 = Sunday
    disruption_code: str,
    measured_value: float,   # rain mm / AQI / Richter / etc.
    zone_risk: str,          # 'low' | 'medium' | 'high'
    platform: str,
    avg_income: float,       # worker's avg weekly income (₹)
) -> dict:
    """
    M3: quantile regression P10 / P50 / P90 income loss.

    Training features: avg_daily_deliveries, day_of_week, is_weekend,
    disruption_hours, zone_risk_enc, platform_enc, measured_value,
    one-hot disruption_code dummies.

    P50 → used as payout amount
    P90 → payout cap
    P10 → conservative lower bound

    Backend usage after real model is ready:
        X = pd.DataFrame([row])[feature_cols]
        X_scaled = scaler.transform(X)
        p10 = models[0.10].predict(X_scaled)[0]
        p50 = models[0.50].predict(X_scaled)[0]
        p90 = models[0.90].predict(X_scaled)[0]
    """
        # ── ML MODEL START (M3): Replace with _M3_ARTIFACT predict calls ──
    try:
        import numpy as np
        import pandas as pd
        is_weekend       = 1 if day_of_week in (5, 6) else 0
        disruption_hours = DISRUPTION_HOURS.get(disruption_code, 4.0)
        risk_enc      = {'low': 0, 'medium': 1, 'high': 2}.get(zone_risk, 1)
        plat_enc      = PLATFORM_ENC.get(platform, 0)
        
        past_cor = 0 
        past_cl = 0
        kavach = 750
        daily_inc = avg_income / 7.0
        hourly_inc = daily_inc / 8.0
        coverage = 2000
        premium = 60
        cov_inc_r = coverage / (avg_income + 1)
        prem_inc_r = premium / (avg_income + 1)
        exp_score = np.log1p(6) * kavach / 900
        del_dens = avg_daily_deliveries / 21.0
        loss_pdel = 0
        hon_score = kavach / 900
        sev_enc = 1
        dis_sev = disruption_hours * (1 + risk_enc*0.5) * (1 + sev_enc*0.3)
        rule_loss = (daily_inc * disruption_hours / 8) * (sev_enc * 0.35)

        row = {
            "avg_daily_deliveries": avg_daily_deliveries, "platform_enc": plat_enc,
            "risk_enc": risk_enc, "months_active": 6, "workdays_count": 5,
            "past_claims": past_cl, "past_correct_claims": past_cor, "claim_accuracy": 1.0,
            "kavachScore": kavach, "avg_weekly_income": avg_income, "avg_daily_distance": 20,
            "daily_income_est": daily_inc, "hourly_income_est": hourly_inc,
            "coverage": coverage, "coverage_income_ratio": cov_inc_r,
            "premium": premium, "premium_income_ratio": prem_inc_r,
            "risk_multiplier": 1.0, "sde_enc": 1, "total_paid": 0,
            "experience_score": exp_score, "delivery_density": del_dens,
            "loss_per_delivery": loss_pdel, "honesty_score": hon_score,
            "disruption_hours": disruption_hours, "severity_enc": sev_enc,
            "disruption_severity_score": dis_sev, "day_of_week": day_of_week,
            "is_weekend": is_weekend, "month": 4, "quarter": 2, "is_monsoon": 0,
            "day_of_week_sin": np.sin(2*np.pi*day_of_week/7), "day_of_week_cos": np.cos(2*np.pi*day_of_week/7),
            "month_sin": np.sin(2*np.pi*4/12), "month_cos": np.cos(2*np.pi*4/12),
            "rain_mm": measured_value if disruption_code in ("HRA","MRA","LRA") else 0,
            "aqi_val": measured_value if "AQ" in disruption_code else 0,
            "wind_speed": measured_value if "WND" in disruption_code else 0,
            "vis_m": 1000, "temp_c": 28, "mag": measured_value if "EQK" in disruption_code else 0,
            "measured_value": measured_value, "delivery_x_hours": avg_daily_deliveries * disruption_hours,
            "severity_x_delivery": sev_enc * avg_daily_deliveries, "severity_x_hours": sev_enc * disruption_hours,
            "income_x_disruption": daily_inc * disruption_hours, "income_x_severity": daily_inc * sev_enc,
            "coverage_x_severity": coverage * sev_enc, "risk_x_duration": risk_enc * disruption_hours,
            "rule_based_loss": rule_loss, "dc_target_enc": 2000,
        }
        
        feats = _M3_ARTIFACT["feature_cols"]
        for c in _M3_ARTIFACT.get("disruption_codes", []): row[f"dc_{c}"] = 1 if c == disruption_code else 0

        X_row = pd.DataFrame([row]).reindex(columns=feats, fill_value=0).astype(float)
        X_row_scaled = pd.DataFrame(_M3_ARTIFACT['scaler'].transform(X_row), columns=feats)
        
        p10 = max(0.0, float(np.expm1(_M3_ARTIFACT['models'][0.10].predict(X_row_scaled)[0])))
        p50 = max(0.0, float(np.expm1(_M3_ARTIFACT['models'][0.50].predict(X_row_scaled)[0])))
        p90 = max(0.0, float(np.expm1(_M3_ARTIFACT['models'][0.90].predict(X_row_scaled)[0])))
        
        p10 = max(0, round(p10))
        p50 = max(p10, round(p50))
        p90 = max(p50, round(p90))
    except Exception as e:
        print("Error M3", e)
        p50 = round(avg_income/7)
        p10, p90 = round(p50*0.5), round(p50*1.5)
    # ── ML MODEL END (M3) ──

    return {'p10': p10, 'p50': p50, 'p90': p90}


# ===========================================================================
# M5 — Churn Predictor (Logistic Regression mock)
# Output: { churn_probability, margin }
# margin = 0.20 × (1 - churn_prob) — used in premium calculation
# ===========================================================================
def m5_predict_churn(
    premium: float,
    kavach_score: int,
    months_active: float,
    past_claims: int,
    city: str,
) -> dict:
    """
    M5: predicts probability worker will NOT renew policy next week.

    Training features: premium, kavachScore, months_active, past_claims, city_tier.

    Training target: churned (simulated with realistic heuristics).

    Used in premium_calc.py to set dynamic profit margin:
        final_premium = base_premium × (1 + margin)
    """
    # ── ML MODEL START (M5): Replace with _M5_MODEL.predict_proba([[features]])[0][1] ──
    try:
        tier_enc = float({'1': 1.0, '2': 0.5, '3': 0.0}.get(CITY_TIER.get(city, '2'), 0.5))
        m5_model = _M5_MODEL['model'] if isinstance(_M5_MODEL, dict) else _M5_MODEL
        f_cols = _M5_MODEL.get('feature_cols', ['premium', 'kavachScore', 'months_active', 'past_claims', 'city_tier_enc']) if isinstance(_M5_MODEL, dict) else getattr(m5_model, 'feature_names_in_', ['premium', 'kavachScore', 'months_active', 'past_claims', 'city_tier'])
        f_dict = {'premium': premium, 'kavachScore': kavach_score, 'months_active': months_active, 'past_claims': past_claims, 'city_tier': tier_enc, 'city_tier_enc': tier_enc}
        features = [[f_dict.get(c, 0) for c in f_cols]]
        
        if isinstance(_M5_MODEL, dict) and 'scaler' in _M5_MODEL:
            import pandas as pd
            df_feat = pd.DataFrame(features, columns=f_cols)
            features = _M5_MODEL['scaler'].transform(df_feat)
            
        churn_prob = m5_model.predict_proba(features)[0][1]
        churn_prob = round(max(0.02, min(0.95, float(churn_prob))), 3)
        margin = round(0.20 * (1.0 - churn_prob), 4)
    except Exception as e:
        print("Error M5", e)
        churn_prob = 0.5
        margin = 0.10
    # ── ML MODEL END (M5) ──

    return {'churn_probability': churn_prob, 'margin': margin}


# ===========================================================================
# M6 — Zone Risk Clusterer (k-Means mock)
# Output: { cluster_id, cluster_label, city_risk }
# cluster_id ranges 0 – 14 (k=15)
# In production this is a CSV lookup from the trained k-Means mapping
# ===========================================================================
def m6_get_zone_cluster(zone: str, city: str) -> dict:
    """
    M6: returns the pre-computed risk cluster for a zone.

    Training features per zone: flood_frequency, avg_aqi,
    social_disruption_count, claim_frequency.

    In production:
        cluster_id = _M6_MAP.loc[zone, 'cluster_id']

    Or:
        X_zone = scaler.transform([zone_features])
        cluster_id = _M6_MODEL.predict(X_zone)[0]
    """
        # ── ML MODEL START (M6): Replace with CSV lookup / _M6_MODEL.predict() ──
    try:
        zone_clean = zone.split(',')[0].strip()
        if zone_clean in _M6_MAP.index:
            cluster_id = int(_M6_MAP.loc[zone_clean, 'cluster_id'])
        else:
            # fallback
            city_risk   = CITY_RISK.get(city, 'low')
            base_offset = {'low': 0, 'medium': 5, 'high': 10}.get(city_risk, 0)
            zone_hash   = sum(ord(c) for c in zone_clean) % 5
            cluster_id  = base_offset + zone_hash
            
        if cluster_id < 5:
            label = 'Low Risk Cluster'
        elif cluster_id < 10:
            label = 'Medium Risk Cluster'
        else:
            label = 'High Risk Cluster'
        city_risk = CITY_RISK.get(city, 'low')
    except Exception as e:
        print("Error M6", e)
        cluster_id = 0
        label = 'Low Risk Cluster'
        city_risk = 'low'
    # ── ML MODEL END (M6) ──

    return {'cluster_id': cluster_id, 'cluster_label': label, 'city_risk': city_risk}


# ===========================================================================
# M7 — Claim Text Triage (TF-IDF + Linear SVM mock)
# Output: { predicted_code, confidence, manual_review, reason }
# ===========================================================================
_KEYWORD_MAP = {
    'HRA': ['heavy rain', 'downpour', 'rainfall', 'torrential', 'thunderstorm', 'flooded road', 'heavy rainfall'],
    'MRA': ['moderate rain', 'rain', 'drizzle', 'wet roads', 'rainy'],
    'LRA': ['light rain', 'slight rain', 'sprinkle', 'drizzling'],
    'STM': ['storm', 'cyclone', 'gale', 'hailstorm', 'cyclonic'],
    'WND': ['high wind', 'strong wind', 'gust', 'dust storm', 'windstorm'],
    'HTV': ['heat', 'heatwave', 'scorching', 'extreme heat', 'too hot', 'hot weather'],
    'FOG': ['fog', 'dense fog', 'low visibility', 'mist', 'foggy'],
    'SAQ': ['aqi', 'air quality', 'pollution', 'smog', 'smoke', 'haze', 'breathing problem', 'poor air'],
    'EQK': ['earthquake', 'tremor', 'quake', 'ground shaking', 'richter', 'seismic'],
    'FLD': ['flood', 'waterlogged', 'inundated', 'submerged', 'overflow', 'flooded', 'waterlogging'],
    'CRF': ['curfew', 'lockdown', 'section 144', 'police barricade', 'roads closed'],
    'LND': ['landslide', 'mudslide', 'rockfall', 'hill collapse'],
    'PND': ['pandemic', 'covid', 'virus', 'epidemic', 'outbreak', 'health emergency'],
    'WAR': ['riot', 'protest', 'unrest', 'violence', 'strike', 'bandh', 'civil unrest'],
}


def m7_classify_claim_text(text: str, trigger_code: str) -> dict:
    """
    M7: TF-IDF + Linear SVM claim text triage.

    Cross-checks worker's free-text description against the trigger-detected code.
    A confident mismatch sets manual_review = True.

    In production:
        X = _M7_VECTORIZER.transform([text])
        predicted_code = _M7_MODEL.predict(X)[0]
        confidence = max(_M7_MODEL.decision_function(X)[0])
    """
    # ── ML MODEL START (M7): Replace with Linear SVM triage ──
    from collections import Counter
    text = text.lower()
    
    # 1. Very short text check (suspicious)
    if not text or len(text) < 10:
        return {
            'predicted_code': trigger_code,
            'confidence': 0.15,
            'manual_review': True,
            'reason': 'suspiciously_short_description',
        }

    # 2. Heuristic: count keyword occurrences (normalized TF-IDF mock)
    scores = {}
    for code, keywords in _KEYWORD_MAP.items():
        count = sum(1 for k in keywords if k in text)
        if count:
            scores[code] = count

    # 3. Decision
    if not scores:
        return {
            'predicted_code': 'OTHER',
            'confidence': 0.05,
            'manual_review': True,
            'reason': 'generic_text_no_keywords',
        }
    
    best_code = max(scores, key=scores.get)
    confidence = min(0.95, scores[best_code] / 3.0) # mock confidence

    # Cross-reference with the trigger (M4 trigger code)
    if best_code == trigger_code:
        return {
            'predicted_code': best_code,
            'confidence': confidence,
            'manual_review': False,
            'reason': 'text_matches_trigger',
        }
    else:
        # Confidently identifying a different type of disruption
        if confidence > 0.60:
            return {
                'predicted_code': best_code,
                'confidence': confidence,
                'manual_review': True,
                'reason': f'text_mismatch(is_{best_code}_not_{trigger_code})',
            }
        else:
            return {
                'predicted_code': trigger_code,
                'confidence': 0.40,
                'manual_review': True,
                'reason': 'text_unclear_mismatch',
            }
    # ── ML MODEL END (M7) ──
