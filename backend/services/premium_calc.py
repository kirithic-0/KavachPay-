# services/premium_calc.py
"""
Premium & Coverage calculator.
Calls M1 (Random Forest) for established workers, M1a (GLM Tweedie) for new workers,
and applies M5 (Churn Predictor) margin adjustment.

When the real models are loaded into ml_models.py, no changes are needed here.
"""
from services.ml_models import (
    m1_predict_premium,
    m1a_predict_premium_coldstart,
    m5_predict_churn,
    CITY_RISK,
)

# ---------------------------------------------------------------------------
# Legacy rule-based lookup (used as final fallback only)
# ---------------------------------------------------------------------------
_RISK_MULTIPLIER = {'low': 1.00, 'medium': 1.15, 'high': 1.30}


def calculate_premium_ml(worker: dict) -> dict:
    """
    Primary entry point — uses M1 or M1a based on tenure, then M5 for margin.

    worker dict keys expected:
        age, city, platform, avg_income, avg_daily_deliveries, avg_daily_distance,
        months_active, kavach_score, past_claims, past_correct_claims,
        eshram_id, employer_name, referral_used  (optional)

    Returns { premium, coverage, risk, model_used, churn_probability, margin }
    """
    city               = worker.get('city', 'Bangalore')
    age                = int(worker.get('age', 25))
    platform           = worker.get('platform', 'Swiggy')
    avg_income         = float(worker.get('avg_income', 3500))
    avg_deliveries     = float(worker.get('avg_deliveries', 12))
    months_active      = float(worker.get('months_active', 0))
    kavach_score       = int(worker.get('kavach_score', 750))
    past_claims        = int(worker.get('past_claims', 0))
    past_correct       = int(worker.get('past_correct_claims', 0))

    risk = CITY_RISK.get(city, 'low')

    # Choose M1 vs M1a based on tenure
    if months_active >= 4:
        base_premium = m1_predict_premium(
            risk=risk,
            age=age,
            months_active=months_active,
            past_claims=past_claims,
            past_correct_claims=past_correct,
            kavach_score=kavach_score,
            city=city,
            avg_daily_deliveries=avg_deliveries,
        )
        model_used = 'M1 (Random Forest)'
    else:
        base_premium = m1a_predict_premium_coldstart(
            age=age,
            risk=risk,
            city=city,
            platform=platform,
        )
        model_used = 'M1a (GLM Tweedie Cold-Start)'

    # M5 churn-adjusted margin: loyal workers can sustain a slightly higher premium
    churn_result = m5_predict_churn(
        premium=float(base_premium),
        kavach_score=kavach_score,
        months_active=months_active,
        past_claims=past_claims,
        city=city,
    )
    churn_prob = churn_result['churn_probability']
    margin     = churn_result['margin']

    # Apply margin uplift (never push below 39 or above 150)
    final_premium = max(39, min(150, round(base_premium * (1 + margin))))

    # Coverage = 65 % of avg weekly income
    coverage = max(500, round(avg_income * 0.65))

    return {
        'premium':           final_premium,
        'coverage':          coverage,
        'risk':              risk,
        'model_used':        model_used,
        'churn_probability': churn_prob,
        'margin':            margin,
    }


def calculate_premium_and_coverage(
    avg_weekly_income: float,
    avg_daily_distance: float,
    city: str,
) -> dict:
    """
    Legacy compat wrapper — called from auth.py and admin rotate-orders when
    only income + distance + city are available (not the full worker dict).
    Falls back to a minimal M1a call with estimated features.
    """
    risk       = CITY_RISK.get(city, 'low')
    multiplier = _RISK_MULTIPLIER[risk]

    base_premium    = avg_weekly_income * 0.03
    distance_factor = 1 + (min(avg_daily_distance, 100) / 100)
    premium         = max(39, min(150, round(base_premium * distance_factor * multiplier)))
    coverage        = max(500, round(avg_weekly_income * 0.65))

    return {'premium': premium, 'coverage': coverage, 'risk': risk}