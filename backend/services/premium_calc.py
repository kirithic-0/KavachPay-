"""
services/premium_calc.py
Provides both calculate_premium (basic) and
calculate_premium_with_explanation (full breakdown).
"""

# Zone risk scores
zone_risk_data = {
    "Koramangala":  {"riskScore": 6},
    "Adyar":        {"riskScore": 8},
    "Dharavi":      {"riskScore": 9},
    "Salt Lake":    {"riskScore": 8},
    "HSR Layout":   {"riskScore": 3},
    "Anna Nagar":   {"riskScore": 4},
    "Bandra":       {"riskScore": 7},
    "Whitefield":   {"riskScore": 4},
    "T Nagar":      {"riskScore": 6},
    "Indiranagar":  {"riskScore": 5},
}

# Coverage tiers matching premium tiers
coverage_map = {96: 1560, 74: 1300, 59: 1200, 49: 980}


def calculate_premium(zone, age, platform, months_active):
    """Basic premium calculation — returns integer rupee amount."""
    result = calculate_premium_with_explanation(zone, age, platform, months_active)
    return result["premium"]


def calculate_premium_with_explanation(zone, age, platform, months_active):
    """
    Full premium calculation with breakdown of every risk factor.
    Returns dict with premium, coverage, riskTier, totalRiskScore, breakdown.
    """
    # Zone contribution (40% weight)
    zone_score        = zone_risk_data.get(zone, {}).get("riskScore", 5)
    zone_contribution = zone_score * 0.4

    # Age factor (20% weight)
    if age < 21:        age_factor, age_label = 2.0, "Under 21 — highest risk"
    elif age <= 25:     age_factor, age_label = 1.0, "21–25 — elevated risk"
    elif age <= 35:     age_factor, age_label = 0.5, "26–35 — prime working age"
    elif age <= 45:     age_factor, age_label = 0.8, "36–45 — moderate risk"
    else:               age_factor, age_label = 1.5, "45+ — higher risk"
    age_contribution = age_factor * 0.2

    # Platform risk
    platform_risk  = {"Amazon": 0.3, "Zomato": 0.5}.get(platform, 0.4)
    platform_label = {"Amazon": "Low delivery density", "Zomato": "High traffic zones"}.get(
        platform, "Standard risk"
    )

    # Tenure risk
    if months_active < 3:    tenure_risk, tenure_label = 0.8, "New worker — unproven"
    elif months_active < 6:  tenure_risk, tenure_label = 0.5, "Early tenure"
    elif months_active < 12: tenure_risk, tenure_label = 0.3, "Established worker"
    else:                    tenure_risk, tenure_label = 0.1, "Veteran — lowest risk"

    total_risk = zone_contribution + age_contribution + platform_risk + tenure_risk

    # Premium tier
    if total_risk >= 8:   premium, tier = 96, "High Risk"
    elif total_risk >= 6: premium, tier = 74, "Medium-High Risk"
    elif total_risk >= 4: premium, tier = 59, "Medium Risk"
    else:                 premium, tier = 49, "Low Risk"

    coverage = coverage_map[premium]

    return {
        "premium":        premium,
        "coverage":       coverage,
        "riskTier":       tier,
        "totalRiskScore": round(total_risk, 2),
        "breakdown": {
            "zone":     {"score": round(zone_contribution, 2), "label": f"Zone risk score {zone_score}/10"},
            "age":      {"score": round(age_contribution, 2),  "label": age_label},
            "platform": {"score": platform_risk,               "label": platform_label},
            "tenure":   {"score": tenure_risk,                 "label": tenure_label},
        }
    }