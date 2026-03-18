# Zone risk scores - used in premium calculation
zone_risk_data = {
    "Koramangala, Bangalore": {"riskScore": 6},
    "Adyar, Chennai":         {"riskScore": 8},
    "Dharavi, Mumbai":        {"riskScore": 9},
    "Bandra, Mumbai":         {"riskScore": 7},
    "Whitefield, Bangalore":  {"riskScore": 5},
    "T Nagar, Chennai":       {"riskScore": 6},
}

def calculate_premium(zone, age, platform, months_active):
    """
    Returns premium AND a full breakdown of every risk factor.
    This is what a real actuarial engine would produce.
    """
    zone_score = zone_risk_data.get(zone, {}).get("riskScore", 5)
    zone_contribution = zone_score * 0.4

    if age < 21:        age_factor, age_label = 2.0, "Under 21 - highest risk"
    elif age <= 25:     age_factor, age_label = 1.0, "21-25 - elevated risk"
    elif age <= 35:     age_factor, age_label = 0.5, "26-35 - prime working age"
    elif age <= 45:     age_factor, age_label = 0.8, "36-45 - moderate risk"
    else:               age_factor, age_label = 1.5, "45+ - higher risk"
    age_contribution = age_factor * 0.2

    platform_risk = {"Amazon": 0.3, "Zomato": 0.5}.get(platform, 0.4)
    platform_label = {"Amazon": "Low delivery density", "Zomato": "High traffic zones"}.get(platform, "Standard risk")

    if months_active < 3:    tenure_risk, tenure_label = 0.8, "New worker - unproven"
    elif months_active < 6:  tenure_risk, tenure_label = 0.5, "Early tenure"
    elif months_active < 12: tenure_risk, tenure_label = 0.3, "Established worker"
    else:                    tenure_risk, tenure_label = 0.1, "Veteran - lowest risk"

    total_risk = zone_contribution + age_contribution + platform_risk + tenure_risk

    if total_risk >= 8:   premium, tier = 96, "High Risk"
    elif total_risk >= 6: premium, tier = 74, "Medium-High Risk"
    elif total_risk >= 4: premium, tier = 59, "Medium Risk"
    else:                 premium, tier = 49, "Low Risk"

    # Coverage scales with premium tier
    coverage_map = {96: 1560, 74: 1300, 59: 1200, 49: 980}
    coverage = coverage_map[premium]

    return {
        "premium": premium,
        "coverage": coverage,
        "riskTier": tier,
        "totalRiskScore": round(total_risk, 2),
        "breakdown": {
            "zone":     {"score": round(zone_contribution, 2), "label": f"Zone risk score {zone_score}/10"},
            "age":      {"score": round(age_contribution, 2),  "label": age_label},
            "platform": {"score": platform_risk,               "label": platform_label},
            "tenure":   {"score": tenure_risk,                 "label": tenure_label}
        }
    }