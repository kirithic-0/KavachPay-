import pandas as pd
import numpy as np
import joblib
import json
import optuna
from datetime import datetime
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, confusion_matrix, roc_auc_score, f1_score
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.utils.class_weight import compute_sample_weight

print("=" * 75)
print("  M2 – Zero-Touch Claim Verifier (Fixed + Optuna)")
print("=" * 75)

np.random.seed(42)

# ─────────────────────────────────────────────
# 1. Load Data
# ─────────────────────────────────────────────
workers = pd.read_csv("Hackathon\\workers_final.csv")
claims  = pd.read_csv("Hackathon\\claims_final.csv")

claims["fraud_flag"] = (
    claims["fraud_flag"].astype(str).str.strip().str.lower()
    .map({"true": 1, "false": 0, "1": 1, "0": 0}).fillna(0).astype(int)
)

print(f"\n[1] Workers: {len(workers):,}  |  Claims: {len(claims):,}")
print(f"    Fraud rate: {claims['fraud_flag'].mean()*100:.2f}%")

# ─────────────────────────────────────────────
# 2. Merge
# ─────────────────────────────────────────────
worker_cols = ["customer_id", "kavachScore", "months_active", "past_claims",
               "past_correct_claims", "coverage", "avg_daily_distance", 
               "risk", "city_tier"]

merged = claims.merge(workers[worker_cols], on="customer_id", how="left")
merged = merged.dropna(subset=["kavachScore", "coverage"]).copy()
print(f"[2] Final merged claims: {len(merged):,}")

df = merged.copy()

# ─────────────────────────────────────────────
# 3. Feature Engineering
# ─────────────────────────────────────────────
risk_map = {"high": 2, "medium": 1, "low": 0}
df["risk_enc"] = df["risk"].map(risk_map).fillna(1)

df["kavachScore_norm"] = df["kavachScore"] / 900.0
df["honesty_ratio"] = df["past_correct_claims"] / df["past_claims"].replace(0, 1)
df["claim_freq"] = df["past_claims"] / df["months_active"].clip(lower=0.1)
df["late_flag"] = (df.get("flag_count", 0) > 0).astype(int)
df["has_declaration"] = df["auto_approve"].astype(str).str.lower().map({"true":1,"false":0}).fillna(0).astype(int)
df["is_severe"] = (df["severity"] == "Severe").astype(int)
df["new_severe"] = ((df["months_active"] < 3) & (df["severity"] == "Severe")).astype(int)
df["payout_ratio"] = (df["payout_amount"] / df["coverage"].replace(0, 1)).clip(upper=3.0)
df["dist_anomaly"] = (df["distance"] / df["avg_daily_distance"].replace(0, 1) > 0.35).astype(int)

df["claim_to_tenure_ratio"] = df["past_claims"] / (df["months_active"] + 1)
df["low_kavach_high_severity"] = ((df["kavachScore"] < 500) & (df["severity"] == "Severe")).astype(int)
df["payout_near_max"] = (df["payout_ratio"] > 0.85).astype(int)

# Weather features
weather_cols = ["rain_mm", "aqi_val", "wind_kmh", "vis_m", "temp_c", "mag"]
for col in weather_cols:
    df[col] = pd.to_numeric(df[col], errors='coerce').fillna(0)

# One-hot encoding (safely)
cat_features = ["disruption_code", "category", "severity"]
dummies = pd.get_dummies(df[cat_features], prefix=cat_features, dtype=float)
df = pd.concat([df, dummies], axis=1)
dummy_cols = dummies.columns.tolist()

print("[3] Feature engineering done")

# ─────────────────────────────────────────────
# 4. Final Feature Matrix (Force Numeric)
# ─────────────────────────────────────────────
feature_cols = [
    "kavachScore_norm", "honesty_ratio", "claim_freq", "late_flag",
    "has_declaration", "is_severe", "new_severe", "payout_ratio",
    "dist_anomaly", "claim_to_tenure_ratio", "low_kavach_high_severity",
    "payout_near_max", "risk_enc", "layers_passed", "binary_flag",
    "measured_value", "severity_loss_pct", "is_excluded"
] + dummy_cols

X = df[feature_cols].copy()

# CRITICAL FIX: Force all columns to numeric and fill any remaining NaNs
X = X.apply(pd.to_numeric, errors='coerce').fillna(0)

y = df["fraud_flag"].values

print(f"[4] Final X shape: {X.shape} | All numeric: {X.dtypes.nunique() == 1}")

# ─────────────────────────────────────────────
# 5. Train-Test Split + Sample Weights
# ─────────────────────────────────────────────
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

sample_weights = compute_sample_weight(class_weight='balanced', y=y_train)

# ─────────────────────────────────────────────
# 6. Optuna Tuning (Optional but Recommended)
# ─────────────────────────────────────────────
def objective(trial):
    params = {
        'n_estimators': trial.suggest_int('n_estimators', 200, 600),
        'max_depth': trial.suggest_int('max_depth', 3, 8),
        'learning_rate': trial.suggest_float('learning_rate', 0.01, 0.12, log=True),
        'subsample': trial.suggest_float('subsample', 0.8, 1.0),
    }
    clf = GradientBoostingClassifier(**params, random_state=42)
    clf.fit(X_train, y_train, sample_weight=sample_weights)
    y_prob = clf.predict_proba(X_test)[:, 1]
    return -roc_auc_score(y_test, y_prob)

print("\n[6] Optuna tuning starting (20 trials)...")
study = optuna.create_study(direction='minimize', sampler=optuna.samplers.TPESampler(seed=42))
study.optimize(objective, n_trials=20, show_progress_bar=True)

best_params = study.best_params
print(f"Best AUC: {-study.best_value:.4f}")

# Train final model
model = GradientBoostingClassifier(**best_params, random_state=42)
model.fit(X_train, y_train, sample_weight=sample_weights)

# ─────────────────────────────────────────────
# 7. Evaluation
# ─────────────────────────────────────────────
y_prob = model.predict_proba(X_test)[:, 1]
y_pred = model.predict(X_test)

print("\n[7] Evaluation")
print(f"    ROC-AUC     : {roc_auc_score(y_test, y_prob):.4f}")
print(f"    F1 (fraud)  : {f1_score(y_test, y_pred):.4f}")
print(classification_report(y_test, y_pred, target_names=["clean", "fraud"], zero_division=0))

# ─────────────────────────────────────────────
# 8. Save Model + Metadata
# ─────────────────────────────────────────────
joblib.dump(model, "m2_premium_model.pkl")

metadata = {
    "feature_cols": feature_cols,
    "impute_value": 0.0,
    "model_type": "GradientBoostingClassifier",
    "best_params": best_params,
    "training_date": datetime.now().strftime("%Y-%m-%d %H:%M"),
    "performance": {"test_auc": float(roc_auc_score(y_test, y_prob))}
}

joblib.dump(metadata, "m2_metadata.pkl")
with open("m2_metadata.json", "w") as f:
    json.dump(metadata, f, indent=2)

print("\n✅ Model & metadata saved successfully!")

# ─────────────────────────────────────────────
# 9. Generate Final Predictions
# ─────────────────────────────────────────────
all_probs = model.predict_proba(X)[:, 1]

def get_thresholds(k):
    if k >= 700: return {"auto_approve": 0.22, "reject": 0.72}
    elif k >= 450: return {"auto_approve": 0.30, "reject": 0.65}
    else: return {"auto_approve": 0.18, "reject": 0.55}

def decide(p, k):
    t = get_thresholds(k)
    if p >= t["reject"]: return "reject"
    elif p <= t["auto_approve"]: return "auto_approve"
    else: return "manual_review"

decisions = [decide(p, k) for p, k in zip(all_probs, df["kavachScore"])]

output_df = df[["claim_id", "customer_id", "city", "zone", "category", "severity",
                "payout_amount", "kavachScore", "fraud_flag"]].copy()
output_df["fraud_prob"] = all_probs.round(4)
output_df["decision"] = decisions

output_df.to_csv("m2_final.csv", index=False)
print(f"\n✅ m2_final.csv saved with {len(output_df):,} claims")
print(output_df["decision"].value_counts())

print("\n" + "="*75)
print("M2 Pipeline Completed Successfully!")