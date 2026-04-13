# kavach_predict.py
# Income loss estimator inference module

import numpy as np
import pandas as pd
import joblib
from functools import lru_cache

@lru_cache(maxsize=1)
def _load_artifact(path="income_loss_qr.pkl"):
    return joblib.load(path)

_DURATION_MAP = {
    "LRA":4,"MRA":6,"HRA":8,"MAQ":12,"SAQ":12,"STM":4,
    "WND":6,"FLD":24,"CRF":24,"LDS":24,"FOG":6,"HTV":8,
    "EQK":2,"PND":0,"WAR":0
}

def estimate_income_loss(
    worker_context: dict,
    disruption_code: str,
    model_path: str = "income_loss_qr.pkl",
    rain_mm: float = 0.0,
    aqi_val: float = 0.0,
    wind_speed: float = 0.0,
    vis_m: float = 10000.0,
    temp_c: float = 28.0,
    mag: float = 0.0,
    measured_value: float = 0.0,
    severity: str = "Moderate",
    layers_passed: int = 5,
    distance: float = 0.0,
    flag_count: int = 0,
) -> dict:
    art = _load_artifact(model_path)
    models = art["models"]
    scaler = art["scaler"]
    feats = art["feature_cols"]
    dur_map = art.get("duration_map", _DURATION_MAP)
    codes = art.get("disruption_codes", list(dur_map.keys()))
    dc_means = art.get("dc_means", {})
    gm = art.get("global_mean", 2000)

    dc = disruption_code
    if dc not in dur_map:
        dc = "HRA"

    # Extract worker features
    avg_del = max(1, worker_context.get("avg_daily_deliveries", 10))
    plat_enc = {"Zomato":1, "Swiggy":0}.get(worker_context.get("platform", "Swiggy"), 0)
    risk_enc = {"high":2, "medium":1, "low":0}.get(worker_context.get("risk", "medium"), 1)
    months = worker_context.get("months_active", 6)
    workdays = worker_context.get("typical_workdays", 5)
    if isinstance(workdays, str):
        workdays = len(workdays.split(",")) if "," in workdays else 5
    past_cl = worker_context.get("past_claims", 0)
    past_cor = worker_context.get("past_correct_claims", 0)
    kavach = worker_context.get("kavachScore", 750)
    weekly_inc = worker_context.get("avg_weekly_income", 3000)
    daily_dist = worker_context.get("avg_daily_distance", 20)
    coverage = worker_context.get("coverage", 2000)
    premium = worker_context.get("premium", 60)
    risk_mult = worker_context.get("risk_multiplier", 1.0)
    sde_enc = {"high":2, "medium":1, "low":0}.get(worker_context.get("social_disruption_exposure", "medium"), 1)
    total_paid = worker_context.get("total_paid", 0)
    age = worker_context.get("age", 28)
    city_tier = worker_context.get("city_tier", 1)

    sev_enc = {"Severe":2, "Moderate":1, "Minor":0}.get(severity, 1)
    dur_hrs = dur_map.get(dc, 6)

    # Derived features
    claim_acc = past_cor / (past_cl + 1)
    daily_inc = weekly_inc / 6
    hourly_inc = daily_inc / 8
    cov_inc_r = coverage / (weekly_inc + 1)
    prem_inc_r = premium / (weekly_inc + 1)
    exp_score = np.log1p(months) * kavach / 900
    del_dens = avg_del / (daily_dist + 1)
    loss_pdel = total_paid / (past_cl + 1)
    hon_score = claim_acc * kavach / 900
    dis_sev = dur_hrs * (1 + risk_enc*0.5) * (1 + sev_enc*0.3)
    rule_loss = (daily_inc * dur_hrs / 8) * (sev_enc * 0.35)

    import datetime
    now = datetime.datetime.now()
    dow = now.weekday()
    mon = now.month

    row = {
        "avg_daily_deliveries": avg_del,
        "platform_enc": plat_enc,
        "risk_enc": risk_enc,
        "months_active": months,
        "workdays_count": workdays,
        "past_claims": past_cl,
        "past_correct_claims": past_cor,
        "claim_accuracy": claim_acc,
        "kavachScore": kavach,
        "avg_weekly_income": weekly_inc,
        "avg_daily_distance": daily_dist,
        "daily_income_est": daily_inc,
        "hourly_income_est": hourly_inc,
        "coverage": coverage,
        "coverage_income_ratio": cov_inc_r,
        "premium": premium,
        "premium_income_ratio": prem_inc_r,
        "risk_multiplier": risk_mult,
        "sde_enc": sde_enc,
        "total_paid": total_paid,
        "experience_score": exp_score,
        "delivery_density": del_dens,
        "loss_per_delivery": loss_pdel,
        "honesty_score": hon_score,
        "disruption_hours": dur_hrs,
        "severity_enc": sev_enc,
        "disruption_severity_score": dis_sev,
        "day_of_week": dow,
        "is_weekend": int(dow >= 5),
        "month": mon,
        "quarter": (mon - 1)//3 + 1,
        "is_monsoon": int(mon in [6,7,8,9]),
        "day_of_week_sin": np.sin(2*np.pi*dow/7),
        "day_of_week_cos": np.cos(2*np.pi*dow/7),
        "month_sin": np.sin(2*np.pi*mon/12),
        "month_cos": np.cos(2*np.pi*mon/12),
        "rain_mm": rain_mm,
        "aqi_val": aqi_val,
        "wind_speed": wind_speed,
        "vis_m": vis_m,
        "temp_c": temp_c,
        "mag": mag,
        "measured_value": measured_value,
        "delivery_x_hours": avg_del * dur_hrs,
        "severity_x_delivery": sev_enc * avg_del,
        "severity_x_hours": sev_enc * dur_hrs,
        "income_x_disruption": daily_inc * dur_hrs,
        "income_x_severity": daily_inc * sev_enc,
        "coverage_x_severity": coverage * sev_enc,
        "risk_x_duration": risk_enc * dur_hrs,
        "rule_based_loss": rule_loss,
        "dc_target_enc": dc_means.get(dc, gm),
    }
    # Add interaction features if present in training
    if "delivery_x_rain" in feats:
        row["delivery_x_rain"] = avg_del * rain_mm
    if "risk_x_rain" in feats:
        row["risk_x_rain"] = risk_enc * rain_mm
    if "delivery_x_aqi" in feats:
        row["delivery_x_aqi"] = avg_del * aqi_val
    if "risk_x_aqi" in feats:
        row["risk_x_aqi"] = risk_enc * aqi_val
    if "risk_x_wind" in feats:
        row["risk_x_wind"] = risk_enc * wind_speed

    for code in codes:
        row[f"dc_{code}"] = 1 if code == dc else 0

    X_row = pd.DataFrame([row]).reindex(columns=feats, fill_value=0).astype(float)
    X_row_scaled = pd.DataFrame(scaler.transform(X_row), columns=feats)

    p10 = max(0.0, float(np.expm1(models[0.10].predict(X_row_scaled)[0])))
    p50 = max(0.0, float(np.expm1(models[0.50].predict(X_row_scaled)[0])))
    p90 = max(0.0, float(np.expm1(models[0.90].predict(X_row_scaled)[0])))
    p50 = max(p10, p50)
    p90 = max(p50, p90)

    cap = worker_context.get("coverage", coverage)
    p10 = min(p10, cap)
    p50 = min(p50, cap)
    p90 = min(p90, cap)

    return {
        "p10_loss": round(p10),
        "p50_loss": round(p50),
        "p90_loss": round(p90),
        "interval_width": round(p90 - p10),
        "disruption_code": dc,
    }
