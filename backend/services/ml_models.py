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
# import joblib
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
    base = 39.0

    # Risk (largest weight — mirrors RF feature importance)
    base += RISK_ENC.get(risk, 0) * 14.0

    # Age uplift: younger workers have slightly higher risk profile
    base += max(0.0, (35 - min(age, 60)) * 0.30)

    # Claims history: fraud ratio adds to premium
    fraud_ratio = 0.0
    if past_claims > 0:
        fraud_ratio = 1.0 - (past_correct_claims / past_claims)
    base += fraud_ratio * 18.0

    # KavachScore discount (high score = trusted = lower premium)
    score_discount = max(0.0, (kavach_score - 600) / 400.0 * 15.0)
    base -= score_discount

    # Delivery intensity (more deliveries = more road exposure)
    delivery_factor = 1.0 + min(avg_daily_deliveries / 50.0, 1.0) * 0.25
    base *= delivery_factor

    # Tenure loyalty discount
    tenure_discount = min(months_active / 12.0, 1.0) * 5.0
    base -= tenure_discount

    # City tier uplift
    tier = CITY_TIER.get(city, '2')
    base += {'1': 10.0, '2': 4.0, '3': 0.0}.get(tier, 4.0)

    # Social disruption exposure
    base += {'none': 0.0, 'low': 2.0, 'medium': 5.0, 'high': 10.0}.get(sde, 0.0)

    premium = max(39, min(150, round(base)))
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
    base = {'low': 39.0, 'medium': 52.0, 'high': 68.0}.get(risk, 52.0)

    # Age factor (Tweedie link=log: younger → slight multiplicative uplift)
    age_factor = 1.0 + max(0.0, (30 - min(age, 60)) * 0.008)
    base *= age_factor

    # City tier lift
    tier = CITY_TIER.get(city, '2')
    base += {'1': 6.0, '2': 2.0, '3': 0.0}.get(tier, 2.0)

    # Platform uplift (ride-hailing has higher traffic exposure)
    base += {'Ola': 4.0, 'Rapido': 4.0, 'Uber': 4.0}.get(platform, 0.0)

    premium = max(39, min(150, round(base)))
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
    fraud_prob = 0.10
    flags      = []

    # 1. KavachScore heuristic (lower score = higher risk)
    if kavach_score < 700:
        fraud_prob += 0.15
        if kavach_score < 550:
            fraud_prob += 0.20
            flags.append('low_kavach_score_risk')

    # 2. Claim history heuristic
    if past_claims > 2:
        correct_ratio = past_correct_claims / past_claims
        if correct_ratio < 0.5:
            fraud_prob += 0.25
            flags.append('high_past_fraud_ratio')

    # 3. Activity heuristic
    if orders_during_disruption > 0:
        fraud_prob += 0.40
        flags.append('activity_during_disruption_detected')

    # 4. Severe/Zone Correlation discount
    if is_severe and zone_inactivity_pct >= 0.85:
        fraud_prob -= 0.15

    # Final Decision
    threshold = 0.45
    # High score (e.g. 850+) often gets "auto_approve" if no flags
    if kavach_score >= 850 and not flags and fraud_prob < threshold:
        decision = 'auto_approve'
    elif fraud_prob >= threshold:
        decision = 'reject'
    elif fraud_prob >= (threshold - 0.15):
        decision = 'manual_review'
    else:
        decision = 'approve'

    return {
        'decision':     decision,
        'fraud_prob':   round(max(0.01, min(0.99, fraud_prob)), 3),
        'threshold':    threshold,
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
    is_weekend       = 1 if day_of_week in (5, 6) else 0
    disruption_hours = DISRUPTION_HOURS.get(disruption_code, 4.0)
    code_mult        = DISRUPTION_CODE_MULT.get(disruption_code, 0.5)
    risk_factor      = {'low': 0.80, 'medium': 1.00, 'high': 1.25}.get(zone_risk, 1.0)
    weekend_bonus    = 1.15 if is_weekend else 1.0

    # Measured-value amplification (heavier rain / worse AQI / bigger quake = more loss)
    measured_scale = 1.0
    if disruption_code in ('HRA', 'MRA', 'LRA') and measured_value > 0:
        measured_scale = 1.0 + min(measured_value / 150.0, 0.60)
    elif disruption_code == 'SAQ' and measured_value > 200:
        measured_scale = 1.0 + min((measured_value - 200) / 300.0, 0.45)
    elif disruption_code == 'EQK' and measured_value >= 4.0:
        measured_scale = 1.0 + min((measured_value - 4.0) / 4.0, 1.0)

    daily_income  = avg_income / 7.0
    loss_fraction = min(disruption_hours / 12.0, 1.0)

    p50_base = daily_income * loss_fraction * code_mult * risk_factor * weekend_bonus * measured_scale

    p10 = max(0, round(p50_base * 0.55))
    p50 = max(0, round(p50_base))
    p90 = max(0, round(p50_base * 1.55))
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
    tier_enc = {'1': 1.0, '2': 0.5, '3': 0.0}.get(CITY_TIER.get(city, '2'), 0.5)

    # Logistic regression linear combination (mock weights match training)
    z = (
        -1.20                              # intercept
        + (premium - 60.0) * 0.020        # higher premium → more likely to churn
        + (750 - kavach_score) * 0.002    # lower score → more likely to churn
        - months_active * 0.080           # longer tenure → less likely to churn
        + past_claims * 0.050             # more claims → possibly frustrated
        + tier_enc * 0.150               # tier-1 cities more competitive
    )

    churn_prob = 1.0 / (1.0 + math.exp(-z))
    churn_prob = round(max(0.02, min(0.95, churn_prob)), 3)

    # Dynamic profit margin: loyal workers → higher margin is safe
    margin = round(0.20 * (1.0 - churn_prob), 4)
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
    city_risk   = CITY_RISK.get(city, 'low')
    base_offset = {'low': 0, 'medium': 5, 'high': 10}.get(city_risk, 0)
    zone_hash   = sum(ord(c) for c in zone) % 5   # deterministic 0-4
    cluster_id  = base_offset + zone_hash

    if cluster_id < 5:
        label = 'Low Risk Cluster'
    elif cluster_id < 10:
        label = 'Medium Risk Cluster'
    else:
        label = 'High Risk Cluster'
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
