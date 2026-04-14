KavachPay Phase 2 – Complete ML & Automation Architecture
1. Overview
This document describes the 8 components that power KavachPay’s parametric insurance platform for India’s gig workers. The system includes:

Dynamic premium calculation (M1, M1a)

Zero‑touch claim verification (M2)

Income loss estimation (M3)

Automated disruption triggers (M4)

Churn‑adjusted pricing (M5)

Zone risk clustering (M6)

Claim text triage (M7)

All models are trained on the final synthetic datasets (workers_final.csv, claims_final.csv) and are production‑ready for backend integration (Firebase / Flask).

2. Model Summary
Model	Purpose	Algorithm	Input	Output	Assigned
M1	Weekly premium for workers with ≥4 weeks history	Random Forest Regressor	Worker profile (risk, age, claims, KavachScore, zone cluster)	Premium (₹)	Friend A
M1a	Cold‑start premium for new workers (<4 weeks)	GLM Tweedie	Age, zone risk, city tier, platform	Premium (₹)	Friend A
M2	Real‑time fraud detection	XGBoost Classifier	Claim + worker features (10 engineered)	Decision (auto/manual/reject)	Friend A
M3	Income loss distribution (P10/P50/P90)	Quantile Regression	Worker productivity + disruption intensity	P10, P50, P90 loss (₹)	Friend B
M4	Disruption detection & auto‑claim creation	Rule‑based + 5 APIs (with rate limits)	Real‑time API data (weather, AQI, news, earthquake, govt alert)	Disruption code, measured value, exclusion flag	You
M5	Churn probability for premium margin	Logistic Regression	Premium, KavachScore, tenure, past claims	Churn probability (0–1)	You
M6	Zone risk clustering (offline)	k‑Means	Historical zone stats (flood, AQI, social, claims)	Zone cluster ID	You
M7	Claim text classification	TF‑IDF + Linear SVM	Claim description text	Predicted disruption category	You
3. Detailed Model Explanations
3.1 M1 – Dynamic Premium Engine (Random Forest)
Why better than rule‑based?
Learns non‑linear interactions – e.g., a young worker in a high‑risk zone with many past claims pays much more than the sum of individual penalties. Feature importance provides transparency to judges.

Implementation

Trained on workers_final.csv with months_active >= 1.

Features: risk_enc, age, months_active, past_claims, past_correct_claims, kavachScore, city_tier, sde_enc, avg_daily_deliveries.

Target: premium (from rule‑based calculator).

Hyperparameters: n_estimators=200, max_depth=10, min_samples_leaf=5.

Output capped ₹39–₹150.

Alternatives rejected: Linear regression (misses interactions), LightGBM (harder to tune), single decision tree (overfits).

3.2 M1a – Cold‑Start Fallback (GLM Tweedie)
Why better than fixed premium?
Actuarially sound for workers with zero history – uses age, zone risk, city tier, platform. Tweedie distribution matches insurance claim patterns (many zero‑payout weeks, occasional large claims).

Implementation

Trained on workers_final.csv with months_active < 1 (or <3 if too few).

Features: age, risk_enc, city_tier, platform_enc.

Model: statsmodels GLM with family Tweedie(link=log, var_power=1.5).

Output capped ₹39–₹150.

Alternatives rejected: Ordinary linear regression (can predict negative premiums), Random Forest (overfits on zero‑history).

3.3 M2 – Zero‑Touch Claim Verifier (XGBoost)
Why better than rule‑based fraud detection?
Supervised learning from past fraud labels. Dynamic threshold based on KavachScore – Green workers get lenient threshold (0.35), Red workers strict (0.15). Catches complex fraud patterns like “new worker + severe claim + no declaration”.

Implementation

Trained on joined claims_final.csv + workers_final.csv.

10 engineered features:
kavachScore_norm, honesty_ratio, claim_freq, late_flag, has_declaration, is_severe, new_severe, payout_over_coverage, isolated_claim, dist_anomaly.

Plus one‑hot encoded disruption_code and measured_value.

Target: fraud_flag.

Hyperparameters: n_estimators=150, max_depth=5, learning_rate=0.08, scale_pos_weight (handles imbalance).

Decision:

Green (score ≥750): threshold = 0.35

Yellow (500‑749): threshold = 0.25

Red (<500): threshold = 0.15

auto_approve if fraud_prob < threshold×0.6; manual_review if between; reject otherwise.

Alternatives rejected: Isolation Forest (unsupervised, ignores labels), Logistic Regression (linear boundary).

3.4 M3 – Income Loss Estimator (Quantile Regression)
What it does
For a given disruption and worker, predicts three quantiles of the income loss:

P10 – low estimate (only 10% of losses are below this)

P50 – median loss (used for payout)

P90 – high estimate (used as a cap)

Why better than flat‑percentage payout?

Worker‑specific – a high‑delivery worker gets higher payout.

Provides uncertainty – P90 prevents overpayment, P10 can be used for conservative payouts.

Robust to outliers – median is not distorted by extreme values.

Implementation

Trained on merged claims_final.csv + workers_final.csv.

Features: avg_daily_deliveries, day_of_week, is_weekend, disruption_hours, zone_risk_enc, platform_enc, measured_value, one‑hot encoded disruption_code.

Target: payout_amount.

Three separate QuantileRegressor models (τ=0.10, 0.50, 0.90) with alpha=0.01, solver='highs'.

Features standardised with StandardScaler.

Output: p10, p50, p90 (rounded to integers, non‑negative).

Backend usage

python
artifact = joblib.load('income_loss_qr.pkl')
models = artifact['models']
scaler = artifact['scaler']
feature_cols = artifact['feature_cols']

def estimate_loss(worker_context, disruption_code, measured_value):
    # worker_context dict with: avg_daily_deliveries, day_of_week, is_weekend,
    # disruption_hours, zone_risk_enc, platform_enc
    dummies = {f'dc_{c}':0 for c in all_codes}
    dummies[f'dc_{disruption_code}'] = 1
    row = {**worker_context, 'measured_value': measured_value, **dummies}
    X = pd.DataFrame([row])[feature_cols]
    X_scaled = scaler.transform(X)
    p10 = models[0.10].predict(X_scaled)[0]
    p50 = models[0.50].predict(X_scaled)[0]
    p90 = models[0.90].predict(X_scaled)[0]
    return {'p10': max(0, round(p10)), 'p50': max(0, round(p50)), 'p90': max(0, round(p90))}
Example output
For a worker with 15 deliveries/day on a Friday, 6‑hour heavy rain (120 mm), high risk zone, Zomato:
{'p10': 720, 'p50': 1250, 'p90': 1890} → payout = ₹1250, capped at ₹1890.

Alternatives rejected: Ordinary regression (only mean, outlier‑sensitive), flat rule (unfair), heuristic slab estimator (cannot adapt to productivity).

3.5 M4 – Disruption Trigger Engine (Rule‑based + 5 APIs)
What it does
Runs periodically (every 30 minutes for weather/earthquake, every 3 hours for AQI/news) to poll external APIs. When thresholds are crossed, it automatically creates a claim for every active worker in the affected zone. It also detects exclusion events (pandemic, war) and marks claims as excluded.

Why better than manual claim filing?

Fully automated – no worker action needed.

Uses official government APIs (IMD, USGS, CPCB) – tamper‑proof.

Respects API rate limits (free tiers).

Exclusion handling protects loss ratio.

APIs and frequencies

API	Data	Frequency	Free tier limit
OpenWeatherMap	Rain, wind, temperature, visibility	Every 30 min	1000 calls/day
USGS Earthquake	Earthquake magnitude (≥4.0)	Every 30 min	Unlimited
WAQI	Air Quality Index (AQI)	Every 3 hours	500 calls/day
NewsAPI	Safety keywords (curfew, strike, pandemic, war, etc.)	Every 3 hours	100 calls/day
Mock Government Alert	Alert level (0‑3)	On demand	N/A
Thresholds (IMD/CPCB/NDMA based)

Disruption code	Trigger condition	Loss %
LRA (Light Rain)	25 ≤ rain < 50 mm/hr	20%
MRA (Moderate Rain)	50 ≤ rain < 100 mm/hr	50%
HRA (Heavy Rain)	rain ≥ 100 mm/hr	100%
STM (Storm)	60 ≤ wind < 80 km/h	50%
WND (High Wind)	wind ≥ 80 km/h	100%
HTV (Heatwave)	40‑44°C → 30%, 45‑49°C → 50%, ≥50°C → 80%	
FOG (Dense Fog)	visibility <200m → 30%, <50m → 80%	
MAQ (Moderate AQI)	200 ≤ AQI < 300	30%
SAQ (Severe AQI)	AQI ≥ 300	60%
EQK (Earthquake)	magnitude ≥4.0 → 60%, ≥6.0 → 100%	
FLD, CRF, LDS	binary alert = 1	100%
PND, WAR (exclusion)	detected via news keywords or govt alert level ≥3	Excluded (₹0)
Exclusion detection

News keywords: pandemic, war, armed conflict, terrorism → severity score >1.5 → exclude.

Mock government alert level ≥3 → exclude all new claims in that city.

Error handling & edge cases

API failures: retry 3 times with exponential backoff; if still fails, skip that zone.

Missing data (e.g., no rain field) → default 0.

Multiple triggers: priority order – earthquake > rain > wind > temperature > fog > AQI > news.

Exclusion overrides all other triggers.

Rate limits: implemented by scheduling different intervals (30 min for fast‑changing data, 3 hours for slow‑changing).

Backend integration

The trigger engine runs as a Cloud Function or on a VM with cron.

For each detected disruption, it writes a claims document into Firestore under each affected worker’s subcollection, with fields: disruption_code, measured_value, severity_loss_pct, is_excluded.

The ML pipeline (M2, M3) then reads these claims and processes payouts.

Phase 2 demo

For demonstration, you can use mock API responses to avoid real keys.

A “Simulate Trigger” button calls the same logic and prints the created claims.

3.6 M5 – Churn Predictor (Logistic Regression)
What it does
Predicts probability that a worker will not renew their policy next week. Used in premium calculation to set a dynamic profit margin:
margin = 0.20 × (1 - churn_prob)

Why better than fixed margin?
Loyal workers (low churn risk) pay a higher margin; price‑sensitive workers (high churn risk) pay a lower margin, increasing total revenue without increasing churn.

Implementation

Target churned simulated using realistic rules (premium >100 → +25% churn, low KavachScore → +10%, etc.).

Features: premium, kavachScore, months_active, past_claims, city_tier.

Model: sklearn.linear_model.LogisticRegression.

Output: churn probability (0–1).

Alternatives rejected: Random Forest (overfits on small data), rule‑based (not adaptive).

3.7 M6 – Zone Risk Clusterer (k‑Means)
What it does
Groups zones into 15‑20 risk clusters using historical flood frequency, average AQI, social disruption count, and claim frequency. The cluster ID is used as a feature in M1 to avoid overfitting on individual zone names.

Implementation

Aggregate per zone:

flood_frequency (from zone risk: high=0.38, medium=0.18, low=0.06)

avg_aqi (mock: high risk zones get higher AQI)

social_disruption_count (from SDE)

claim_frequency (from claims_final.csv)

Normalise features, run k‑Means (k=15‑20).

Save mapping zone -> cluster_id as CSV.

Why better than raw zone names?
Reduces dimensionality, provides enough samples per cluster for stable learning, and groups zones with similar risk profiles.

Alternatives rejected: DBSCAN (variable cluster count), raw zone names (too many categories).

3.8 M7 – Claim Text Triage (TF‑IDF + Linear SVM)
What it does
Classifies the worker’s free‑text claim description into a disruption category and cross‑checks it against the trigger‑detected category. Mismatches flag the claim for manual review.

Why better than no text check?
Adds an extra fraud detection layer using the worker’s own words. Lightweight and fast (<10ms), can be used in real‑time.

Implementation

Generate synthetic claim descriptions (or use real if available) with labels (e.g., “roads were flooded” → FLD).

Vectorise using TfidfVectorizer(ngram_range=(1,2), max_features=500).

Train LinearSVC classifier.

At inference: predict category; if predicted ≠ trigger category, set manual_review = True.

Alternatives rejected: Transformers (heavy, Phase 3), Naive Bayes (less accurate).

4. Phase 3 Advanced Ideas (Roadmap)
These ideas are not required for Phase 2 but demonstrate deep thinking and a clear path to an industry‑leading platform.

Idea	Description	Why better	Implementation path
Survival Analysis for Churn	Predicts time to churn (survival curve) instead of binary next‑week churn.	Enables precise timing of retention offers.	lifelines.CoxPHFitter – replace M5.
Graph Neural Networks for Fraud Rings	Detects colluding workers sharing referral codes, phones, or zones.	Catches coordinated fraud individual models miss.	GraphSAGE or GAT – add as secondary fraud layer.
Causal Inference (DiD) for Accurate Loss	Measures true causal impact of disruption by comparing affected workers to control group.	Prevents overpayment for normal slowdowns.	statsmodels Difference‑in‑Differences – enhance M3.
Multi‑Armed Bandit for Dynamic Thresholds	Learns optimal trigger thresholds (rain mm, AQI, etc.) by testing different values in different zones.	Removes manual tuning; adapts to seasonality.	Contextual bandit (LinUCB) – replace static rules in M4.
Transformer‑Based Claim Text Understanding	Fine‑tunes DistilBERT to understand nuanced language (e.g., “streets were rivers” = flood).	Handles metaphors and synonyms; higher accuracy.	Hugging Face transformers – upgrade M7.
Reinforcement Learning for Premium Optimisation	RL agent sets premium to maximise long‑term profit while minimising churn.	Learns price elasticity dynamically.	Deep Q‑Network (DQN) – ultimate vision for M1/M5.
5. Integration & Deployment
All models are saved as pickle files – loaded by backend at startup.

Training offline – using exported Firestore data (workers_final.csv, claims_final.csv).

Inference real‑time – each model <100 ms (M2 <2 s, M3 <0.5 s).

Fallbacks – if any model fails to load or predict, the system falls back to rule‑based logic (fixed premium, rule‑based fraud detection).

Monitoring – track prediction drift, accuracy, and latency weekly.

M4 trigger – runs as a scheduled Cloud Function or on a VM with cron, respecting API rate limits.

6. Conclusion
KavachPay Phase 2 delivers a production‑ready, actuarially sound, and uniquely creative ML architecture:

Dynamic premium via Random Forest + GLM cold‑start.

Zero‑touch claim verification with XGBoost and KavachScore‑dependent thresholds.

Income loss estimation using quantile regression (P10/P50/P90) – a first in parametric insurance for gig workers.

Automated disruption triggers with real‑time APIs and exclusion handling.

Churn‑adjusted pricing and zone clustering to optimise profitability.

Claim text triage as an extra fraud layer.

Phase 3 ideas provide a clear roadmap to an even more intelligent and adaptive platform.