import sys
sys.path.insert(0, '.')
from services.ml_models import (
    m1_predict_premium, m1a_predict_premium_coldstart,
    m2_detect_fraud, m3_estimate_income_loss,
    m5_predict_churn, m6_get_zone_cluster, m7_classify_claim_text
)

# M1
p = m1_predict_premium('high', 27, 8.0, 3, 2, 720, 'Mumbai', 15.0)
print(f'M1  premium: Rs.{p}')

# M1a
p2 = m1a_predict_premium_coldstart(24, 'medium', 'Bangalore', 'Swiggy')
print(f'M1a cold-start premium: Rs.{p2}')

# M2
fraud = m2_detect_fraud(720, 3, 2, 8.0, True, False, 800.0, 1200.0, 0, 'HRA', 82.0, 0.75)
print(f'M2  fraud: {fraud["decision"]} (prob={fraud["fraud_prob"]})')

# M3
loss = m3_estimate_income_loss(15.0, 4, 'HRA', 82.0, 'medium', 'Swiggy', 3500.0)
print(f'M3  loss: P10=Rs.{loss["p10"]} P50=Rs.{loss["p50"]} P90=Rs.{loss["p90"]}')

# M5
churn = m5_predict_churn(59.0, 720, 8.0, 3, 'Bangalore')
print(f'M5  churn: {churn["churn_probability"]} margin={churn["margin"]}')

# M6
cluster = m6_get_zone_cluster('Koramangala, Bangalore', 'Bangalore')
print(f'M6  cluster: {cluster}')

# M7
text = m7_classify_claim_text('roads were completely flooded and waterlogged, could not deliver', 'FLD')
print(f'M7  text: predicted={text["predicted_code"]} conf={text["confidence"]} review={text["manual_review"]}')

print('All ML models OK')
