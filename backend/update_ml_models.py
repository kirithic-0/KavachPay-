import re

filepath = 'services/ml_models.py'
with open(filepath, 'r', encoding='utf-8') as f:
    code = f.read()

# 0. Uncomment models at the top
top_imports = """
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
"""
code = code.replace(
    "# import joblib\n# _M1_MODEL  = joblib.load('ml_artifacts/m1_premium_rf.pkl')",
    top_imports + "\n# _M1_MODEL  = joblib.load('ml_artifacts/m1_premium_rf.pkl')"
)

# 1. M1 Replacement
sub_m1 = """    # ── ML MODEL START (M1): Replace with _M1_MODEL.predict([[features]])[0] ──
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
    # ── ML MODEL END (M1) ──"""
code = re.sub(r'# ── ML MODEL START \(M1\).*?# ── ML MODEL END \(M1\) ──', sub_m1, code, flags=re.DOTALL)

# 2. M1a Replacement
sub_m1a = """    # ── ML MODEL START (M1a): Replace with _M1A_MODEL.predict([[features]])[0] ──
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
    # ── ML MODEL END (M1a) ──"""
code = re.sub(r'# ── ML MODEL START \(M1a\).*?# ── ML MODEL END \(M1a\) ──', sub_m1a, code, flags=re.DOTALL)

# 3. M2 Replacement
sub_m2 = """    # ── ML MODEL START (M2): Replace with XGBoost Classifier ──
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
    # ── ML MODEL END (M2) ──"""
code = re.sub(r'# ── ML MODEL START \(M2\).*?# ── ML MODEL END \(M2\) ──', sub_m2, code, flags=re.DOTALL)

# 4. M3 Replacement
sub_m3 = """    # ── ML MODEL START (M3): Replace with _M3_ARTIFACT predict calls ──
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
    # ── ML MODEL END (M3) ──"""
code = re.sub(r'# ── ML MODEL START \(M3\).*?# ── ML MODEL END \(M3\) ──', sub_m3, code, flags=re.DOTALL)

# 5. M5 Replacement
sub_m5 = """    # ── ML MODEL START (M5): Replace with _M5_MODEL.predict_proba([[features]])[0][1] ──
    try:
        tier_enc = float({'1': 1.0, '2': 0.5, '3': 0.0}.get(CITY_TIER.get(city, '2'), 0.5))
        f_cols = getattr(_M5_MODEL, 'feature_names_in_', ['premium', 'kavachScore', 'months_active', 'past_claims', 'city_tier'])
        f_dict = {'premium': premium, 'kavachScore': kavach_score, 'months_active': months_active, 'past_claims': past_claims, 'city_tier': tier_enc, 'city_tier_enc': tier_enc}
        features = [f_dict.get(c, 0) for c in f_cols]
        churn_prob = _M5_MODEL.predict_proba([features])[0][1]
        churn_prob = round(max(0.02, min(0.95, float(churn_prob))), 3)
        margin = round(0.20 * (1.0 - churn_prob), 4)
    except Exception as e:
        print("Error M5", e)
        churn_prob = 0.5
        margin = 0.10
    # ── ML MODEL END (M5) ──"""
code = re.sub(r'# ── ML MODEL START \(M5\).*?# ── ML MODEL END \(M5\) ──', sub_m5, code, flags=re.DOTALL)

# 6. M6 Replacement
sub_m6 = """    # ── ML MODEL START (M6): Replace with CSV lookup / _M6_MODEL.predict() ──
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
    # ── ML MODEL END (M6) ──"""
code = re.sub(r'# ── ML MODEL START \(M6\).*?# ── ML MODEL END \(M6\) ──', sub_m6, code, flags=re.DOTALL)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(code)
    
print("Updated ml_models.py successfully!")
