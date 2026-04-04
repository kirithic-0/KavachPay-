"""
Model M2 – Zero-Touch Claim Verifier (Gradient Boosted Classifier)
KavachPay Insurance Platform

Classifies each claim as: auto_approve | manual_review | reject
Uses KavachScore-based dynamic thresholds.
Merges claims_final.csv + workers_final.csv on customer_id.
Output: m2.csv
"""

import pandas as pd
import numpy as np
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, confusion_matrix, roc_auc_score

print("=" * 60)
print("  M2 – Zero-Touch Claim Verifier (GBM Classifier)")
print("=" * 60)

np.random.seed(42)

# ─────────────────────────────────────────────
# 1. Load CSVs
# ─────────────────────────────────────────────
workers = pd.read_csv("Hackathon\\workers_final.csv")
claims  = pd.read_csv("Hackathon\\claims_final.csv")

# Normalise fraud_flag: "True"/"False" strings → int
claims["fraud_flag"] = (
    claims["fraud_flag"].astype(str).str.strip().str.lower()
    .map({"true": 1, "false": 0, "1": 1, "0": 0})
)

print(f"\n[1] Workers: {len(workers):,}  |  Claims: {len(claims):,}")
print(f"    Fraud rate in claims: {claims['fraud_flag'].mean()*100:.1f}%")

# ─────────────────────────────────────────────
# 2. Merge on customer_id
# ─────────────────────────────────────────────
worker_cols = [
    "customer_id", "kavachScore", "months_active",
    "past_claims", "past_correct_claims", "coverage",
    "avg_daily_distance", "typical_workdays",
]
merged = claims.merge(workers[worker_cols], on="customer_id", how="left")
print(f"\n[2] Merged shape: {merged.shape}")
print(f"    Unmatched claims (no worker record): {merged['kavachScore'].isna().sum()}")

merged = merged.dropna(subset=["kavachScore", "coverage"]).copy()
print(f"    After dropping unmatched: {len(merged):,} claims")

# ─────────────────────────────────────────────
# 3. Engineer Features
# ─────────────────────────────────────────────

# Core 10 from spec
merged["kavachScore_norm"]     = merged["kavachScore"] / 900

merged["honesty_ratio"]        = (
    merged["past_correct_claims"] / merged["past_claims"].replace(0, 1)
)

merged["claim_freq"]           = (
    merged["past_claims"] / merged["months_active"].clip(lower=0.1)
)

# late_flag: use flag_count > 0 as proxy for delayed/suspicious filing
merged["late_flag"]            = (merged["flag_count"] > 0).astype(int)

# has_declaration: maps directly from auto_approve column
merged["has_declaration"]      = (
    merged["auto_approve"].astype(str).str.lower()
    .map({"true": 1, "false": 0})
    .fillna(0).astype(int)
)

merged["is_severe"]            = (merged["severity"] == "Severe").astype(int)

merged["new_severe"]           = (
    (merged["months_active"] < 2) & (merged["severity"] == "Severe")
).astype(int)

merged["payout_over_coverage"] = (
    merged["payout_amount"] / merged["coverage"].replace(0, 1)
).clip(upper=3)

# isolated_claim: fewer than 3 claims in same zone on same date
zone_date_counts = merged.groupby(["zone", "created_at"])["claim_id"].transform("count")
merged["isolated_claim"]       = (zone_date_counts < 3).astype(int)

merged["dist_anomaly"]         = (
    (merged["distance"] / merged["avg_daily_distance"].replace(0, 1)) > 0.40
).astype(int)

# Extra features from real claims schema
merged["is_excluded"]          = (
    merged["is_excluded"].astype(str).str.lower()
    .map({"true": 1, "false": 0})
    .fillna(0).astype(int)
)
merged["layers_passed_norm"]   = merged["layers_passed"] / 5.0
merged["severity_loss_pct"]    = merged["severity_loss_pct"].fillna(0) / 100.0
merged["binary_flag"]          = merged["binary_flag"].fillna(0).astype(int)

# Weather / environmental signals (fill missing with 0 = no event)
for col in ["rain_mm", "aqi_val", "wind_kmh", "vis_m", "temp_c", "mag"]:
    merged[col] = merged[col].fillna(0)

# One-hot encode disruption_code and category
dc_dummies  = pd.get_dummies(merged["disruption_code"], prefix="dc")
cat_dummies = pd.get_dummies(merged["category"], prefix="cat")
merged = pd.concat([merged, dc_dummies, cat_dummies], axis=1)
dc_cols  = list(dc_dummies.columns)
cat_cols = list(cat_dummies.columns)

print("\n[3] Feature engineering done")
print(f"    disruption_code dummies: {dc_cols}")
print(f"    category dummies:        {cat_cols}")

# ─────────────────────────────────────────────
# 4. Feature matrix & target
# ─────────────────────────────────────────────
base_features = [
    # Core 10
    "kavachScore_norm", "honesty_ratio", "claim_freq",
    "late_flag", "has_declaration", "is_severe", "new_severe",
    "payout_over_coverage", "isolated_claim", "dist_anomaly",
    # Extra from real claims
    "measured_value", "is_excluded", "layers_passed_norm",
    "severity_loss_pct", "rain_mm", "aqi_val", "wind_kmh",
    "vis_m", "temp_c", "mag", "binary_flag",
]
feature_cols = base_features + dc_cols + cat_cols

X = merged[feature_cols].fillna(0)
y = merged["fraud_flag"]

print(f"\n[4] Feature matrix: {X.shape[0]:,} rows × {X.shape[1]} cols")
print(f"    Class balance — clean: {(y==0).sum():,}  fraud: {(y==1).sum():,}")

# ─────────────────────────────────────────────
# 5. Train-test split (stratified)
# ─────────────────────────────────────────────
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)
print(f"\n[5] Train: {len(X_train):,}  |  Test: {len(X_test):,}")

# ─────────────────────────────────────────────
# 6. Train GBM Classifier
# ─────────────────────────────────────────────
print("\n[6] Training Gradient Boosted Classifier…")
gbm = GradientBoostingClassifier(
    n_estimators=200,
    max_depth=4,
    learning_rate=0.05,
    min_samples_leaf=max(1, len(X_train) // 200),
    random_state=42,
)
gbm.fit(X_train, y_train)
print("    Training complete ✓")

# ─────────────────────────────────────────────
# 7. Evaluate
# ─────────────────────────────────────────────
y_prob = gbm.predict_proba(X_test)[:, 1]
y_pred = gbm.predict(X_test)

print(f"\n[7] Evaluation")
if len(y_test.unique()) > 1:
    auc = roc_auc_score(y_test, y_prob)
    print(f"    ROC-AUC = {auc:.4f}  (target > 0.85)")
else:
    print("    ROC-AUC = N/A (only one class in test set)")

print(f"\n    Classification Report:")
print(classification_report(y_test, y_pred,
                             target_names=["clean", "fraud"],
                             zero_division=0))
print(f"    Confusion Matrix:\n{confusion_matrix(y_test, y_pred)}")

# ─────────────────────────────────────────────
# 8. Feature importance
# ─────────────────────────────────────────────
imp_df = pd.DataFrame({
    "feature":    feature_cols,
    "importance": gbm.feature_importances_,
}).sort_values("importance", ascending=False)

print("\n[8] Feature Importance (top 10):")
for _, row in imp_df.head(10).iterrows():
    bar = "█" * int(row["importance"] * 80)
    print(f"    {row['feature']:30s} {row['importance']:.4f}  {bar}")

# ─────────────────────────────────────────────
# 9. KavachScore-based dynamic threshold + 3-way decision
# ─────────────────────────────────────────────
def get_thresholds(kavach_score):
    """
    Green (>= 700): lenient  — lower approve bar, higher reject bar
    Amber (400-699): balanced
    Red   (<  400): strict   — harder to auto-approve
    """
    if kavach_score >= 700:
        return {"approve": 0.25, "reject": 0.70}
    elif kavach_score >= 400:
        return {"approve": 0.35, "reject": 0.60}
    else:
        return {"approve": 0.20, "reject": 0.50}

def decide(fraud_prob, kavach_score):
    t = get_thresholds(kavach_score)
    if fraud_prob >= t["reject"]:
        return "reject"
    elif fraud_prob <= t["approve"]:
        return "auto_approve"
    else:
        return "manual_review"

# ─────────────────────────────────────────────
# 10. Build m2.csv
# ─────────────────────────────────────────────
all_probs = gbm.predict_proba(X)[:, 1]
decisions = [
    decide(prob, score)
    for prob, score in zip(all_probs, merged["kavachScore"])
]

output_df = merged[[
    # Identifiers
    "claim_id", "customer_id",
    # Claim fields
    "city", "zone", "category", "severity", "disruption_code",
    "status", "payout_amount", "distance", "measured_value",
    "layers_passed", "flag_count", "auto_approve",
    "severity_loss_pct", "is_excluded",
    # Weather
    "rain_mm", "aqi_val", "wind_kmh", "vis_m", "temp_c", "mag",
    # Worker fields
    "kavachScore", "months_active", "past_claims",
    "past_correct_claims", "coverage",
    # Engineered features
    "kavachScore_norm", "honesty_ratio", "claim_freq",
    "late_flag", "has_declaration", "is_severe", "new_severe",
    "payout_over_coverage", "isolated_claim", "dist_anomaly",
    "binary_flag",
    # Ground truth
    "fraud_flag",
]].copy()

output_df["fraud_prob"] = all_probs.round(4)
output_df["decision"]   = decisions
output_df["correct"]    = (
    ((output_df["fraud_flag"] == 1) & (output_df["decision"] == "reject")) |
    ((output_df["fraud_flag"] == 0) & (output_df["decision"].isin(["auto_approve", "manual_review"])))
).astype(int)

output_df.to_csv("m2.csv", index=False)

dec_counts = output_df["decision"].value_counts()
print(f"\n[9] Decision breakdown ({len(output_df):,} claims):")
for dec, cnt in dec_counts.items():
    pct = cnt / len(output_df) * 100
    print(f"    {dec:15s}  {cnt:5,}  ({pct:.1f}%)")

print(f"\n    Saved: m2.csv  ({len(output_df):,} rows)")
print(f"    Columns: {list(output_df.columns)}")

print("\n" + "=" * 60)
print("  M2 training pipeline complete ✓")
print("=" * 60)
