"""
Model M1a – Cold-Start Premium Engine (GLM Tweedie)
KavachPay Insurance Platform

Predicts weekly premium (₹) for brand-new workers (months_active < 1, i.e. < 4 weeks).
Uses only static features: age, risk, city_tier, platform.
GLM Tweedie implemented via scipy (log link, var_power=1.5).
Output: m1a.csv
"""

import pandas as pd
import numpy as np
from scipy.optimize import minimize
from sklearn.metrics import mean_absolute_error, r2_score

print("=" * 55)
print("  M1a – Cold-Start Premium Engine (GLM Tweedie)")
print("=" * 55)

# ─────────────────────────────────────────────
# GLM Tweedie helpers (log link, var_power=1.5)
# ─────────────────────────────────────────────
def tweedie_log_likelihood(beta, X, y, p=1.5):
    """Tweedie negative log-likelihood with log link: mu = exp(X @ beta)."""
    mu = np.exp(X @ beta)
    mu = np.clip(mu, 1e-6, None)
    # Tweedie log-likelihood: y*mu^(1-p)/(1-p) - mu^(2-p)/(2-p)
    ll = y * (mu ** (1 - p)) / (1 - p) - (mu ** (2 - p)) / (2 - p)
    return -np.sum(ll)

def tweedie_gradient(beta, X, y, p=1.5):
    mu = np.exp(X @ beta)
    mu = np.clip(mu, 1e-6, None)
    # d(ll)/d(beta) = X.T @ (y * mu^(-p) - mu^(1-p))  * mu  (chain rule for log link)
    resid = (y * mu ** (-p) - mu ** (1 - p)) * mu
    return -X.T @ resid

def fit_glm_tweedie(X, y, p=1.5):
    beta0 = np.zeros(X.shape[1])
    result = minimize(
        tweedie_log_likelihood,
        beta0,
        args=(X, y, p),
        jac=tweedie_gradient,
        method="L-BFGS-B",
        options={"maxiter": 500, "ftol": 1e-10},
    )
    return result.x

def predict_glm_tweedie(beta, X):
    return np.exp(X @ beta)

# ─────────────────────────────────────────────
# 1. Load data
# ─────────────────────────────────────────────
workers = pd.read_csv("Hackathon\\workers_final.csv")
print(f"\n[1] Loaded {len(workers):,} total workers")



# ─────────────────────────────────────────────
# 2. Filter: cold-start workers (months_active < 1)
# ─────────────────────────────────────────────
df_new = workers[workers["months_active"] < 1].copy()
print(f"\n[2] Cold-start workers (months_active < 1): {len(df_new):,}")

if len(df_new) < 50:
    df_new = workers[workers["months_active"] < 3].sample(
        n=min(200, len(workers[workers["months_active"] < 3])), random_state=42
    )
    print(f"    Too few — expanded to months_active < 3: {len(df_new):,} workers")

# ─────────────────────────────────────────────
# 3. Encode categoricals
# ─────────────────────────────────────────────
risk_map     = {"high": 2, "medium": 1, "low": 0}
platform_map = {"Zomato": 1, "Swiggy": 0}

df_new["risk_enc"]     = df_new["risk"].map(risk_map)
df_new["platform_enc"] = df_new["platform"].map(platform_map)

required = ["age", "risk_enc", "city_tier", "platform_enc", "premium"]
df_new = df_new.dropna(subset=required).copy()
print(f"    After dropping NaN rows: {len(df_new):,}")
print("\n[3] Encoding done")

# ─────────────────────────────────────────────
# 4. Build design matrix (with intercept)
# ─────────────────────────────────────────────
df_new["intercept"] = 1.0
feature_cols = ["intercept", "age", "risk_enc", "city_tier", "platform_enc"]

X = df_new[feature_cols].values.astype(float)
y = df_new["premium"].values.astype(float)

# ─────────────────────────────────────────────
# 5. Fit GLM Tweedie
# ─────────────────────────────────────────────
print("\n[4] Fitting GLM Tweedie (var_power=1.5, log link)…")
beta = fit_glm_tweedie(X, y, p=1.5)

print("    Coefficients:")
for name, coef in zip(feature_cols, beta):
    print(f"      {name:15s}  {coef:+.4f}")
print("    Fitting complete ✓")

# ─────────────────────────────────────────────
# 6. Evaluate
# ─────────────────────────────────────────────
y_pred_raw = predict_glm_tweedie(beta, X)
y_pred = np.clip(np.round(y_pred_raw), 39, 150).astype(int)

mae = mean_absolute_error(y, y_pred)
r2  = r2_score(y, y_pred)

print(f"\n[5] Evaluation")
print(f"    MAE = ₹{mae:.2f}")
print(f"    R²  = {r2:.4f}")

# ─────────────────────────────────────────────
# 7. Save output as m1a.csv
# ─────────────────────────────────────────────
output_df = df_new[["risk", "age", "months_active", "city_tier", "platform", "premium"]].copy()
output_df = output_df.rename(columns={"premium": "actual_premium"})
output_df["predicted_premium"] = y_pred
output_df["error"]             = output_df["actual_premium"] - output_df["predicted_premium"]

output_df.to_csv("m1a.csv", index=False)
print(f"\n[6] Saved: m1a.csv  ({len(output_df):,} rows)")
print(f"    Columns: {list(output_df.columns)}")

print("\n" + "=" * 55)
print("  M1a training pipeline complete ✓")
print("=" * 55)