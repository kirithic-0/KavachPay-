"""
Model M1 – Dynamic Premium Engine (Random Forest Regressor)
KavachPay Insurance Platform

Predicts weekly premium (₹) for workers with >= 4 weeks (months_active >= 1) of history.
Output: m1.csv  — input features + actual_premium + predicted_premium + error
"""

import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, r2_score

# ─────────────────────────────────────────────
# 1. Load & Filter
# ─────────────────────────────────────────────
print("=" * 55)
print("  M1 – Dynamic Premium Engine (Random Forest)")
print("=" * 55)

workers = pd.read_csv("Hackathon\\workers_final.csv")
print(f"\n[1] Loaded {len(workers):,} total workers")

df = workers[workers["months_active"] >= 1].copy()
print(f"    After filter (months_active >= 1): {len(df):,} workers")

# ─────────────────────────────────────────────
# 2. Encode Categoricals
# ─────────────────────────────────────────────
risk_map = {"high": 2, "medium": 1, "low": 0}
sde_map  = {"high": 2, "medium": 1, "low": 0}

df["risk_enc"] = df["risk"].map(risk_map)
df["sde_enc"]  = df["social_disruption_exposure"].map(sde_map)

# Cap extreme values
df["past_claims"] = df["past_claims"].clip(upper=20)

# Median imputation for any NaN
feature_cols = [
    "risk_enc", "age", "months_active", "past_claims",
    "past_correct_claims", "kavachScore", "city_tier",
    "sde_enc", "avg_daily_deliveries",
]
for col in feature_cols:
    if df[col].isna().any():
        median_val = df[col].median()
        df[col] = df[col].fillna(median_val)
        print(f"    [impute] {col} → median={median_val:.2f}")

print("\n[2] Categorical encoding done")

# ─────────────────────────────────────────────
# 3. Features & Target
# ─────────────────────────────────────────────
X = df[feature_cols]
y = df["premium"]
print(f"\n[3] Features: {feature_cols}")
print(f"    Target range: ₹{y.min()} – ₹{y.max()}  |  mean ₹{y.mean():.1f}")

# ─────────────────────────────────────────────
# 4. Train-Test Split
# ─────────────────────────────────────────────
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)
print(f"\n[4] Train: {len(X_train):,}  |  Test: {len(X_test):,}")

# ─────────────────────────────────────────────
# 5. Train Random Forest
# ─────────────────────────────────────────────
print("\n[5] Training Random Forest (200 trees, max_depth=10)…")
rf = RandomForestRegressor(
    n_estimators=200,
    max_depth=10,
    min_samples_leaf=5,
    random_state=42,
    n_jobs=-1,
)
rf.fit(X_train, y_train)
print("    Training complete ✓")

# ─────────────────────────────────────────────
# 6. Evaluate
# ─────────────────────────────────────────────
y_pred = rf.predict(X_test)
mae = mean_absolute_error(y_test, y_pred)
r2  = r2_score(y_test, y_pred)

print(f"\n[6] Evaluation")
print(f"    MAE = ₹{mae:.2f}  (target < ₹3)")
print(f"    R²  = {r2:.4f}   (target > 0.85)")

if mae < 3 and r2 > 0.85:
    print("    ✅  Both targets met!")
else:
    print("    ⚠️  Check model / data quality")

# ─────────────────────────────────────────────
# 7. Feature Importance
# ─────────────────────────────────────────────
importance_df = pd.DataFrame({
    "feature": feature_cols,
    "importance": rf.feature_importances_,
}).sort_values("importance", ascending=False)

print("\n[7] Feature Importance:")
for _, row in importance_df.iterrows():
    bar = "█" * int(row["importance"] * 50)
    print(f"    {row['feature']:30s} {row['importance']:.4f}  {bar}")

# ─────────────────────────────────────────────
# 8. Save Output as m1.csv
# ─────────────────────────────────────────────
# Predict on all eligible workers
all_preds = rf.predict(X)
all_preds_clipped = [max(39, min(150, int(round(p)))) for p in all_preds]

output_df = df[["risk", "age", "months_active", "past_claims",
                "past_correct_claims", "kavachScore", "city_tier",
                "social_disruption_exposure", "avg_daily_deliveries"]].copy()
output_df["actual_premium"]    = y.values
output_df["predicted_premium"] = all_preds_clipped
output_df["error"]             = output_df["actual_premium"] - output_df["predicted_premium"]

output_df.to_csv("m1.csv", index=False)
print(f"\n[8] Saved: m1.csv  ({len(output_df):,} rows)")
print(f"    Columns: {list(output_df.columns)}")

print("\n" + "=" * 55)
print("  M1 training pipeline complete ✓")
print("=" * 55)