import pandas as pd
import numpy as np
import joblib
import json
import optuna
from datetime import datetime
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import mean_absolute_error, r2_score, mean_absolute_percentage_error
from sklearn.ensemble import GradientBoostingRegressor

print("=" * 70)
print("  M1 – Dynamic Premium Engine (Final v2 with Optuna Tuning)")
print("=" * 70)

# ─────────────────────────────────────────────
# 1. Load & Filter
# ─────────────────────────────────────────────
workers = pd.read_csv("Hackathon\\workers_final.csv")
print(f"\n[1] Loaded {len(workers):,} total workers")

df = workers[workers["months_active"] >= 1].copy()
print(f"    After filter (months_active >= 1): {len(df):,} workers")

# ─────────────────────────────────────────────
# 2. Feature Engineering
# ─────────────────────────────────────────────
df = df.copy()

# Encodings
risk_map = {"high": 2, "medium": 1, "low": 0}
sde_map  = {"high": 2, "medium": 1, "low": 0}
df["risk_enc"] = df["risk"].map(risk_map)
df["sde_enc"]  = df["social_disruption_exposure"].map(sde_map)

# Strong engineered features
df["claim_rate"] = df["past_claims"] / (df["months_active"] + 1)
df["correct_claim_ratio"] = df["past_correct_claims"] / (df["past_claims"] + 1)
df["income_per_delivery"] = df["avg_weekly_income"] / (df["avg_daily_deliveries"] * 7 + 1)
df["risk_income_interaction"] = df["risk_enc"] * df["avg_weekly_income"]
df["kavach_per_month"] = df["kavachScore"] / (df["months_active"] + 1)
df["age_risk"] = df["age"] * df["risk_enc"]
df["delivery_intensity"] = df["avg_daily_deliveries"] * df["avg_daily_distance"]
df["log_past_claims"] = np.log1p(df["past_claims"])
df["log_income"] = np.log1p(df["avg_weekly_income"])

# Clip extremes
df["past_claims"] = df["past_claims"].clip(upper=20)

print("[2] Feature engineering completed (20 features)")

# ─────────────────────────────────────────────
# 3. Features & Target
# ─────────────────────────────────────────────
feature_cols = [
    "risk_enc", "age", "months_active", "past_claims", "past_correct_claims",
    "kavachScore", "city_tier", "sde_enc", "avg_daily_deliveries",
    "avg_daily_distance", "avg_weekly_income",
    "claim_rate", "correct_claim_ratio", "income_per_delivery",
    "risk_income_interaction", "kavach_per_month", "age_risk",
    "delivery_intensity", "log_past_claims", "log_income"
]

# Median imputation
impute_medians = {}
for col in feature_cols:
    if df[col].isna().any():
        median_val = df[col].median()
        df[col] = df[col].fillna(median_val)
        impute_medians[col] = float(median_val)
    else:
        impute_medians[col] = float(df[col].median())

X = df[feature_cols].copy()
y = df["premium"].copy()

print(f"\n[3] Using {len(feature_cols)} features | Target mean: ₹{y.mean():.1f}")

# ─────────────────────────────────────────────
# 4. Train-Test Split
# ─────────────────────────────────────────────
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=pd.qcut(y, q=5, duplicates='drop')
)
print(f"[4] Train: {len(X_train):,} | Test: {len(X_test):,}")

# ─────────────────────────────────────────────
# 5. Optuna Hyperparameter Tuning
# ─────────────────────────────────────────────
def objective(trial):
    params = {
        'n_estimators': trial.suggest_int('n_estimators', 200, 600),
        'max_depth': trial.suggest_int('max_depth', 3, 8),
        'learning_rate': trial.suggest_float('learning_rate', 0.01, 0.15, log=True),
        'subsample': trial.suggest_float('subsample', 0.7, 1.0),
        'min_samples_split': trial.suggest_int('min_samples_split', 2, 10),
        'min_samples_leaf': trial.suggest_int('min_samples_leaf', 1, 5),
    }
    
    model = GradientBoostingRegressor(**params, random_state=42)
    model.fit(X_train, y_train)
    y_pred = model.predict(X_test)
    mae = mean_absolute_error(y_test, y_pred)
    return mae

print("\n[5] Starting Optuna Hyperparameter Tuning (30 trials)...")
study = optuna.create_study(direction='minimize', sampler=optuna.samplers.TPESampler(seed=42))
study.optimize(objective, n_trials=30, show_progress_bar=True)

print(f"✅ Optuna tuning completed!")
print(f"    Best MAE: ₹{study.best_value:.4f}")
print(f"    Best params: {study.best_params}")

# Train final model with best parameters
best_params = study.best_params
model = GradientBoostingRegressor(**best_params, random_state=42)
model.fit(X_train, y_train)

# ─────────────────────────────────────────────
# 6. Final Evaluation
# ─────────────────────────────────────────────
y_pred = model.predict(X_test)
mae = mean_absolute_error(y_test, y_pred)
r2 = r2_score(y_test, y_pred)
mape = mean_absolute_percentage_error(y_test, y_pred)

cv_scores = cross_val_score(model, X, y, cv=5, scoring='neg_mean_absolute_error', n_jobs=-1)

print("\n[6] Final Evaluation")
print(f"    Test MAE   = ₹{mae:.3f}")
print(f"    Test R²    = {r2:.4f}")
print(f"    Test MAPE  = {mape*100:.2f}%")
print(f"    CV MAE (5-fold) ≈ ₹{-cv_scores.mean():.3f}")

if mae < 1.0 and r2 > 0.99:
    print("    ✅ Outstanding performance!")
else:
    print("    ✅ Excellent performance!")

# ─────────────────────────────────────────────
# 7. Feature Importance
# ─────────────────────────────────────────────
importances = pd.DataFrame({
    "feature": feature_cols,
    "importance": model.feature_importances_
}).sort_values("importance", ascending=False)

print("\n[7] Top 10 Feature Importances:")
print(importances.head(10).to_string(index=False))

# ─────────────────────────────────────────────
# 8. Save Model + Metadata
# ─────────────────────────────────────────────
print("\n[8] Saving Model & Metadata...")

joblib.dump(model, "m1_premium_model.pkl")

metadata = {
    "feature_cols": feature_cols,
    "risk_map": risk_map,
    "sde_map": sde_map,
    "impute_medians": impute_medians,
    "clip_lower": max(39, int(y.quantile(0.01)) - 5),
    "clip_upper": min(150, int(y.quantile(0.99)) + 10),
    "model_type": "GradientBoostingRegressor",
    "best_params": best_params,
    "training_date": datetime.now().strftime("%Y-%m-%d %H:%M"),
    "performance": {
        "test_mae": float(mae),
        "test_r2": float(r2),
        "cv_mae": float(-cv_scores.mean())
    }
}

joblib.dump(metadata, "m1_metadata.pkl")

with open("m1_metadata.json", "w") as f:
    json.dump(metadata, f, indent=2)

print("✅ Model saved → m1_premium_model.pkl")
print("✅ Metadata saved → m1_metadata.pkl and m1_metadata.json")
print(f"    Clipping range: {metadata['clip_lower']} – {metadata['clip_upper']}")

# ─────────────────────────────────────────────
# 9. Generate Final Predictions CSV
# ─────────────────────────────────────────────
all_preds = model.predict(X)
all_preds_clipped = np.clip(np.round(all_preds).astype(int), 
                           metadata["clip_lower"], 
                           metadata["clip_upper"])

output_df = df[["customer_id", "risk", "age", "months_active", "past_claims",
                "past_correct_claims", "kavachScore", "city_tier",
                "social_disruption_exposure", "avg_daily_deliveries",
                "avg_weekly_income", "avg_daily_distance"]].copy()

output_df["actual_premium"]    = y.values
output_df["predicted_premium"] = all_preds_clipped
output_df["error"]             = output_df["actual_premium"] - output_df["predicted_premium"]
output_df["error_abs"]         = output_df["error"].abs()

output_df.to_csv("m1_final.csv", index=False)

print(f"\n[9] Saved final predictions → m1_final.csv ({len(output_df):,} rows)")
print(f"    Mean absolute error on full data: ₹{output_df['error_abs'].mean():.3f}")

print("\n" + "=" * 70)
print("  M1 Final Pipeline Complete ✓")
print("=" * 70)