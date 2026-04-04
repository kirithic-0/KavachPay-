"""
╔══════════════════════════════════════════════════════════════════════════╗
║   KAVACH GIG WORKER INCOME LOSS ESTIMATOR — v3.0  PRODUCTION            ║
║   LightGBM Quantile Regression | Optuna 150-trial HPO | SHAP            ║
║   + Full Checkpoint / Resume support (survives Colab disconnects)        ║
║                                                                          ║
║   HOW TO RUN:                                                            ║
║     1. Runtime → Change runtime type → T4 GPU (more RAM)                ║
║     2. Run ALL cells top to bottom (Ctrl+F9)                             ║
║     3. If disconnected: reconnect, re-run Cells 1-5, then continue       ║
║        Optuna resumes from last trial. Training resumes from checkpoint. ║
║                                                                          ║
║   OUTPUTS:                                                               ║
║     income_loss_qr.pkl    ← drop into backend                           ║
║     kavach_predict.py     ← backend inference module (auto-generated)   ║
║     eda_plots.png         ← exploratory analysis                        ║
║     quantile_predictions.png ← model evaluation plots                  ║
║     shap_summary.png      ← feature importance via SHAP                ║
╚══════════════════════════════════════════════════════════════════════════╝
"""

# ══════════════════════════════════════════════════════════════════════════
# CELL 1 — Install & Import
# ══════════════════════════════════════════════════════════════════════════

!pip install -q lightgbm --upgrade
!pip install -q scikit-learn --upgrade
!pip install -q optuna --upgrade
!pip install -q shap --upgrade

import os, warnings, sys, importlib
from datetime import datetime

import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import matplotlib.gridspec as gridspec
import joblib
import shap

import lightgbm as lgb
import optuna
from optuna.pruners import MedianPruner
from optuna.samplers import TPESampler

from sklearn.model_selection import train_test_split, KFold
from sklearn.preprocessing import RobustScaler
from sklearn.metrics import mean_absolute_error, mean_squared_error

optuna.logging.set_verbosity(optuna.logging.WARNING)
warnings.filterwarnings("ignore")
np.random.seed(42)

# ── Checkpoint paths ───────────────────────────────────────────────────────
CKPT_FEATURES  = "kavach_ckpt_features.pkl"   # after feature engineering
CKPT_SPLIT     = "kavach_ckpt_split.pkl"       # after train/test split
CKPT_MODELS    = "kavach_ckpt_models.pkl"      # after final model training
OPTUNA_DB      = "sqlite:///kavach_optuna.db"  # Optuna trial storage

print("✅ All imports OK")
print(f"   LightGBM : {lgb.__version__}")
import sklearn; print(f"   sklearn  : {sklearn.__version__}")
print(f"   optuna   : {optuna.__version__}")
print(f"   shap     : {shap.__version__}")
print("\n📁 Existing checkpoints:")
for f in [CKPT_FEATURES, CKPT_SPLIT, CKPT_MODELS, "kavach_optuna.db"]:
    status = "✅ found" if os.path.exists(f) else "—  not found"
    print(f"   {status}  →  {f}")


# ══════════════════════════════════════════════════════════════════════════
# CELL 2 — Load & Merge Datasets
# ══════════════════════════════════════════════════════════════════════════

if os.path.exists(CKPT_FEATURES):
    print("♻️  Feature checkpoint found — SKIP this cell and run Cell 3")
else:
    from google.colab import files

    print("📂 Upload workers.csv ...")
    files.upload()
    print("📂 Upload claims.csv ...")
    files.upload()

    workers = pd.read_csv("workers.csv")
    claims  = pd.read_csv("claims.csv")

    workers.columns = workers.columns.str.strip()
    claims.columns  = claims.columns.str.strip()

    print(f"\nWorkers : {workers.shape}")
    print(f"Claims  : {claims.shape}")

    WORKER_COLS = [
        "customer_id", "avg_daily_deliveries",
        "zone", "platform", "risk", "coverage",
        "avg_weekly_income", "avg_daily_distance",
        "kavachScore", "months_active", "typical_workdays",
        "past_claims", "past_correct_claims", "total_paid",
        "social_disruption_exposure", "premium", "risk_multiplier",
    ]
    WORKER_COLS = [c for c in WORKER_COLS if c in workers.columns]

    merged = claims.merge(workers[WORKER_COLS], on="customer_id", how="left")
    print(f"\nMerged shape : {merged.shape}")
    print(f"Null payouts : {merged['payout_amount'].isna().sum()}")


# ══════════════════════════════════════════════════════════════════════════
# CELL 3 — Feature Engineering  (checkpointed)
# ══════════════════════════════════════════════════════════════════════════

if os.path.exists(CKPT_FEATURES):
    print("♻️  Loading feature checkpoint ...")
    _f = joblib.load(CKPT_FEATURES)
    df              = _f["df"]
    feature_cols    = _f["feature_cols"]
    SENSOR_COLS     = _f["SENSOR_COLS"]
    DC_COLS         = _f["DC_COLS"]
    DURATION_MAP    = _f["DURATION_MAP"]
    ALL_DISRUPTION_CODES = _f["ALL_DISRUPTION_CODES"]
    global_mean_raw = _f["global_mean_raw"]
    SMOOTH_K        = _f["SMOOTH_K"]
    print(f"   ✅ Loaded: {len(df)} rows, {len(feature_cols)} features")

else:
    df = merged.copy()

    # ── 1. Remove unusable rows ───────────────────────────────────────────
    df["payout_amount"] = pd.to_numeric(df["payout_amount"], errors="coerce")
    n0 = len(df)
    if "fraud_flag"  in df.columns: df = df[df["fraud_flag"]  != 1]
    if "is_excluded" in df.columns: df = df[df["is_excluded"] != 1]
    df = df.dropna(subset=["payout_amount"])
    print(f"Rows after cleaning: {len(df)}  (removed {n0 - len(df)})")

    # ── 2. Temporal ───────────────────────────────────────────────────────
    df["created_at"]  = pd.to_datetime(df["created_at"], errors="coerce")
    df["day_of_week"] = df["created_at"].dt.dayofweek
    df["is_weekend"]  = (df["day_of_week"] >= 5).astype(int)
    df["month"]       = df["created_at"].dt.month
    df["quarter"]     = df["created_at"].dt.quarter
    df["hour"]        = df["created_at"].dt.hour.fillna(12).astype(int)
    df["is_rush_hour"]= df["hour"].isin([8,9,10,17,18,19]).astype(int)
    for col, period in [("day_of_week", 7), ("month", 12), ("hour", 24)]:
        df[f"{col}_sin"] = np.sin(2 * np.pi * df[col] / period)
        df[f"{col}_cos"] = np.cos(2 * np.pi * df[col] / period)

    # ── 3. Disruption duration ────────────────────────────────────────────
    DURATION_MAP = {
        "LRA": 4,  "MRA": 6,  "HRA": 8,
        "MAQ": 12, "SAQ": 12, "STM": 4,
        "WND": 6,  "FLD": 24, "CRF": 24,
        "LDS": 24, "FOG": 6,  "HTV": 8,
        "EQK": 2,  "PND": 0,  "WAR": 0,
    }
    ALL_DISRUPTION_CODES = list(DURATION_MAP.keys())
    df["disruption_hours"] = df["disruption_code"].map(DURATION_MAP).fillna(6)

    # ── 4. Categorical encodings ──────────────────────────────────────────
    RISK_MAP = {"high":2,"High":2,"HIGH":2,"medium":1,"Medium":1,
                "MEDIUM":1,"low":0,"Low":0,"LOW":0}
    PLAT_MAP = {"Zomato":1,"zomato":1,"ZOMATO":1,
                "Swiggy":0,"swiggy":0,"SWIGGY":0}
    SEV_MAP  = {"low":0,"Low":0,"LOW":0,"medium":1,"Medium":1,"MEDIUM":1,
                "high":2,"High":2,"HIGH":2,"critical":3,"Critical":3,"CRITICAL":3}

    df["zone_risk_enc"] = df["risk"].map(RISK_MAP).fillna(1)
    df["platform_enc"]  = df["platform"].map(PLAT_MAP).fillna(0)
    df["severity_enc"]  = (df["severity"].map(SEV_MAP).fillna(1)
                           if "severity" in df.columns else 1)

    # ── 5. Worker numerics — impute ───────────────────────────────────────
    WORKER_NUM_COLS = [
        "avg_daily_deliveries","avg_weekly_income","avg_daily_distance",
        "kavachScore","months_active","typical_workdays","past_claims",
        "past_correct_claims","total_paid","coverage","premium",
        "risk_multiplier","social_disruption_exposure",
    ]
    for col in WORKER_NUM_COLS:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors="coerce")
            df[col] = df[col].fillna(df[col].median())
    df["avg_daily_deliveries"] = df["avg_daily_deliveries"].clip(lower=1)

    # ── 6. Sensor columns — 99th-pct winsorise ────────────────────────────
    SENSOR_COLS = [c for c in
                   ["rain_mm","aqi_val","wind_kmh","vis_m","temp_c","mag","measured_value"]
                   if c in df.columns]
    for col in SENSOR_COLS:
        df[col] = pd.to_numeric(df[col], errors="coerce")
        p99 = df[col].quantile(0.99)
        df[col] = df[col].clip(upper=p99).fillna(df[col].median())
    print(f"Sensor columns: {SENSOR_COLS}")

    # ── 7. Derived features ───────────────────────────────────────────────
    df["claim_accuracy"]           = df["past_correct_claims"] / (df["past_claims"] + 1)
    df["daily_income_est"]         = df["avg_weekly_income"] / 6
    df["hourly_income_est"]        = df["daily_income_est"] / 8
    df["coverage_income_ratio"]    = df["coverage"] / (df["avg_weekly_income"] + 1)
    df["premium_income_ratio"]     = df["premium"]  / (df["avg_weekly_income"] + 1)
    df["experience_score"]         = np.log1p(df["months_active"]) * df["kavachScore"] / 100
    df["delivery_density"]         = df["avg_daily_deliveries"] / (df["avg_daily_distance"] + 1)
    df["loss_per_delivery"]        = df["total_paid"] / (df["past_claims"] + 1)
    df["disruption_severity_score"]= (
        df["disruption_hours"] * (1 + df["zone_risk_enc"] * 0.5) * (1 + df["severity_enc"] * 0.3)
    )

    # ── 8. Interaction features ───────────────────────────────────────────
    rain = df.get("rain_mm",  pd.Series(0, index=df.index))
    aqi  = df.get("aqi_val",  pd.Series(0, index=df.index))
    wind = df.get("wind_kmh", pd.Series(0, index=df.index))

    df["delivery_x_hours"]   = df["avg_daily_deliveries"] * df["disruption_hours"]
    df["delivery_x_rain"]    = df["avg_daily_deliveries"] * rain
    df["delivery_x_aqi"]     = df["avg_daily_deliveries"] * aqi
    df["risk_x_rain"]        = df["zone_risk_enc"] * rain
    df["risk_x_aqi"]         = df["zone_risk_enc"] * aqi
    df["risk_x_wind"]        = df["zone_risk_enc"] * wind
    df["hours_x_rain"]       = df["disruption_hours"] * rain
    df["severity_x_delivery"]= df["severity_enc"] * df["avg_daily_deliveries"]
    df["severity_x_hours"]   = df["severity_enc"] * df["disruption_hours"]
    df["income_x_disruption"]= df["daily_income_est"] * df["disruption_hours"]
    df["income_x_severity"]  = df["daily_income_est"] * df["severity_enc"]
    df["coverage_x_severity"]= df["coverage"] * df["severity_enc"]

    # ── 9. OOF smoothed target encoding for disruption_code ──────────────
    SMOOTH_K = 15
    global_mean_raw = df["payout_amount"].mean()
    kf_enc = KFold(n_splits=5, shuffle=True, random_state=0)
    df["dc_target_enc"] = global_mean_raw

    for tr_idx, val_idx in kf_enc.split(df):
        agg = (df.iloc[tr_idx]
                 .groupby("disruption_code")["payout_amount"]
                 .agg(["mean","count"]))
        smooth = ((agg["mean"] * agg["count"] + global_mean_raw * SMOOTH_K)
                  / (agg["count"] + SMOOTH_K))
        df.iloc[val_idx, df.columns.get_loc("dc_target_enc")] = (
            df.iloc[val_idx]["disruption_code"].map(smooth).fillna(global_mean_raw)
        )

    # ── 10. One-hot encode disruption_code ────────────────────────────────
    dummies = pd.get_dummies(df["disruption_code"], prefix="dc")
    for code in ALL_DISRUPTION_CODES:
        col = f"dc_{code}"
        if col not in dummies.columns:
            dummies[col] = 0
    DC_COLS = sorted([f"dc_{c}" for c in ALL_DISRUPTION_CODES])
    dummies = dummies.reindex(columns=DC_COLS, fill_value=0)
    df = pd.concat([df, dummies], axis=1)

    # ── 11. Feature list ──────────────────────────────────────────────────
    BASE_FEATURES = [
        "avg_daily_deliveries","platform_enc","zone_risk_enc",
        "months_active","typical_workdays","past_claims","past_correct_claims",
        "claim_accuracy","kavachScore","avg_weekly_income","avg_daily_distance",
        "daily_income_est","hourly_income_est","coverage","coverage_income_ratio",
        "premium","premium_income_ratio","risk_multiplier",
        "social_disruption_exposure","total_paid","experience_score",
        "delivery_density","loss_per_delivery",
        "disruption_hours","severity_enc","disruption_severity_score",
        "day_of_week","is_weekend","month","quarter","hour","is_rush_hour",
        "day_of_week_sin","day_of_week_cos","month_sin","month_cos",
        "hour_sin","hour_cos",
        *SENSOR_COLS,
        "delivery_x_hours","delivery_x_rain","delivery_x_aqi",
        "risk_x_rain","risk_x_aqi","risk_x_wind","hours_x_rain",
        "severity_x_delivery","severity_x_hours",
        "income_x_disruption","income_x_severity","coverage_x_severity",
        "dc_target_enc",
        *DC_COLS,
    ]
    seen = set()
    feature_cols = []
    for f in BASE_FEATURES:
        if f in df.columns and f not in seen:
            seen.add(f)
            if df[f].std() > 0:
                feature_cols.append(f)

    print(f"Total features: {len(feature_cols)}")

    # ── Save feature checkpoint ───────────────────────────────────────────
    joblib.dump({
        "df": df, "feature_cols": feature_cols,
        "SENSOR_COLS": SENSOR_COLS, "DC_COLS": DC_COLS,
        "DURATION_MAP": DURATION_MAP, "ALL_DISRUPTION_CODES": ALL_DISRUPTION_CODES,
        "global_mean_raw": global_mean_raw, "SMOOTH_K": SMOOTH_K,
    }, CKPT_FEATURES, compress=3)
    print("✅ Feature checkpoint saved →", CKPT_FEATURES)

print("✅ Feature engineering complete")


# ══════════════════════════════════════════════════════════════════════════
# CELL 4 — EDA
# ══════════════════════════════════════════════════════════════════════════

X_all = df[feature_cols].astype(float)
y_all = df["payout_amount"].astype(float)

fig, axes = plt.subplots(1, 4, figsize=(20, 4))
axes[0].hist(y_all, bins=40, color="#378ADD", edgecolor="white", lw=0.4)
axes[0].set_title("Payout distribution (raw)"); axes[0].set_xlabel("₹")
axes[1].hist(np.log1p(y_all), bins=40, color="#1D9E75", edgecolor="white", lw=0.4)
axes[1].set_title("Payout distribution (log1p)"); axes[1].set_xlabel("log1p(₹)")
axes[2].scatter(df["avg_daily_deliveries"], y_all, alpha=0.3, s=8, color="#D85A30")
axes[2].set_title("Deliveries vs Payout")
sensor_plot = "rain_mm" if "rain_mm" in df.columns else (SENSOR_COLS[0] if SENSOR_COLS else "disruption_hours")
axes[3].scatter(df[sensor_plot], y_all, alpha=0.3, s=8, color="#534AB7")
axes[3].set_title(f"{sensor_plot} vs Payout")
plt.tight_layout()
plt.savefig("eda_plots.png", dpi=150, bbox_inches="tight")
plt.show()
print(f"Target stats:\n{y_all.describe().round(2)}")
print(f"Skewness: {y_all.skew():.3f}  (log: {np.log1p(y_all).skew():.3f})")


# ══════════════════════════════════════════════════════════════════════════
# CELL 5 — Train / Test Split  (checkpointed)
# ══════════════════════════════════════════════════════════════════════════

if os.path.exists(CKPT_SPLIT):
    print("♻️  Loading split checkpoint ...")
    _s = joblib.load(CKPT_SPLIT)
    X_train         = _s["X_train"]
    X_test          = _s["X_test"]
    y_train_log     = _s["y_train_log"]
    y_test_log      = _s["y_test_log"]
    y_train_raw     = _s["y_train_raw"]
    y_test_raw      = _s["y_test_raw"]
    y_log           = _s["y_log"]
    train_means_enc = _s["train_means_enc"]
    scaler          = _s["scaler"]
    QUANTILES       = _s["QUANTILES"]
    print(f"   ✅ Train: {len(X_train):,}  Test: {len(X_test):,}")

else:
    y_log = np.log1p(y_all)
    QUANTILES = [0.10, 0.50, 0.90]

    X_train, X_test, y_train_log, y_test_log = train_test_split(
        X_all, y_log, test_size=0.15, random_state=42, shuffle=True
    )
    y_train_raw = np.expm1(y_train_log)
    y_test_raw  = np.expm1(y_test_log)

    print(f"Train: {len(X_train):,}  Test: {len(X_test):,}  Features: {X_train.shape[1]}")

    # Re-encode dc_target_enc in test using train-only means (no leakage)
    train_dc_raw = df.loc[X_train.index, "disruption_code"].values
    test_dc_raw  = df.loc[X_test.index,  "disruption_code"].values

    train_means_enc = {}
    for code in ALL_DISRUPTION_CODES:
        mask  = train_dc_raw == code
        count = mask.sum()
        if count > 0:
            mu = y_train_raw.values[mask].mean()
            train_means_enc[code] = (mu * count + global_mean_raw * SMOOTH_K) / (count + SMOOTH_K)
        else:
            train_means_enc[code] = global_mean_raw

    X_test = X_test.copy()
    X_test["dc_target_enc"] = [train_means_enc.get(c, global_mean_raw) for c in test_dc_raw]

    scaler = RobustScaler().fit(X_train)

    joblib.dump({
        "X_train": X_train, "X_test": X_test,
        "y_train_log": y_train_log, "y_test_log": y_test_log,
        "y_train_raw": y_train_raw, "y_test_raw": y_test_raw,
        "y_log": y_log, "train_means_enc": train_means_enc,
        "scaler": scaler, "QUANTILES": QUANTILES,
    }, CKPT_SPLIT, compress=3)
    print("✅ Split checkpoint saved →", CKPT_SPLIT)


# ══════════════════════════════════════════════════════════════════════════
# CELL 6 — Optuna Hyperparameter Search  (SQLite — fully resumable)
# ══════════════════════════════════════════════════════════════════════════

N_TRIALS = 150
N_SPLITS  = 5

def pinball(q, y_true, y_pred):
    e = np.asarray(y_true) - np.asarray(y_pred)
    return float(np.mean(np.where(e >= 0, q * e, (q - 1) * e)))

def make_objective(q, X_tr, y_tr_log):
    def objective(trial):
        params = dict(
            objective         = "quantile",
            alpha             = q,
            metric            = "quantile",
            verbosity         = -1,
            boosting_type     = "gbdt",
            n_estimators      = trial.suggest_int("n_estimators",      200, 3000),
            learning_rate     = trial.suggest_float("learning_rate",   0.005, 0.3,  log=True),
            num_leaves        = trial.suggest_int("num_leaves",         31,   255),
            max_depth         = trial.suggest_int("max_depth",           4,    12),
            min_child_samples = trial.suggest_int("min_child_samples",  10,   150),
            subsample         = trial.suggest_float("subsample",        0.5,  1.0),
            colsample_bytree  = trial.suggest_float("colsample_bytree", 0.4,  1.0),
            reg_alpha         = trial.suggest_float("reg_alpha",        1e-4, 10.0, log=True),
            reg_lambda        = trial.suggest_float("reg_lambda",       1e-4, 10.0, log=True),
            min_split_gain    = trial.suggest_float("min_split_gain",   0.0,  2.0),
            min_child_weight  = trial.suggest_float("min_child_weight", 1e-3, 10.0, log=True),
        )
        kf = KFold(n_splits=N_SPLITS, shuffle=True, random_state=42)
        fold_losses = []
        for tr_idx, val_idx in kf.split(X_tr):
            Xtr,  ytr  = X_tr.iloc[tr_idx], y_tr_log.iloc[tr_idx]
            Xval, yval = X_tr.iloc[val_idx], y_tr_log.iloc[val_idx]
            m = lgb.LGBMRegressor(**params)
            m.fit(Xtr, ytr,
                  eval_set=[(Xval, yval)],
                  callbacks=[lgb.early_stopping(40, verbose=False),
                              lgb.log_evaluation(-1)])
            pred_raw = np.expm1(m.predict(Xval))
            y_raw    = np.expm1(yval.values)
            fold_losses.append(pinball(q, y_raw, pred_raw))
        return float(np.mean(fold_losses))
    return objective

best_params  = {}
best_studies = {}

for q in QUANTILES:
    study_name = f"kavach_q{int(q*100)}"
    study = optuna.create_study(
        study_name     = study_name,
        direction      = "minimize",
        sampler        = TPESampler(seed=42, n_startup_trials=25),
        pruner         = MedianPruner(n_startup_trials=20, n_warmup_steps=2),
        storage        = OPTUNA_DB,
        load_if_exists = True,   # ← resumes automatically after disconnect
    )
    already_done = len([t for t in study.trials
                        if t.state == optuna.trial.TrialState.COMPLETE])
    remaining    = max(0, N_TRIALS - already_done)

    if remaining == 0:
        print(f"✅ Q={q} already complete ({already_done} trials) — skipping")
    else:
        print(f"\n🔍 Q={q}  ({already_done} done, running {remaining} more) ...")
        study.optimize(
            make_objective(q, X_train, y_train_log),
            n_trials          = remaining,
            show_progress_bar = True,
        )

    best_params[q]  = study.best_params
    best_studies[q] = study
    print(f"   ✅ Best pinball (raw ₹) = {study.best_value:.4f}")
    print(f"   Params: {study.best_params}")

print("\n✅ Hyperparameter tuning complete")


# ══════════════════════════════════════════════════════════════════════════
# CELL 7 — Train Final Models  (checkpointed)
# ══════════════════════════════════════════════════════════════════════════

if os.path.exists(CKPT_MODELS):
    print("♻️  Loading model checkpoint ...")
    _m = joblib.load(CKPT_MODELS)
    models = _m["models"]
    print("   ✅ Models loaded — skipping training")

else:
    # Inner val split from X_train ONLY — X_test is never touched here
    X_tr_final, X_val_final, y_tr_final, y_val_final = train_test_split(
        X_train, y_train_log, test_size=0.12, random_state=7
    )

    models = {}
    for q in QUANTILES:
        params = dict(
            objective="quantile", alpha=q, metric="quantile",
            verbosity=-1, boosting_type="gbdt", **best_params[q]
        )
        m = lgb.LGBMRegressor(**params)
        m.fit(
            X_tr_final, y_tr_final,
            eval_set  = [(X_val_final, y_val_final)],
            callbacks = [lgb.early_stopping(60, verbose=False),
                         lgb.log_evaluation(-1)],
        )
        models[q] = m
        print(f"✅ Q={q}  best_iteration={m.best_iteration_}")

    joblib.dump({"models": models}, CKPT_MODELS, compress=3)
    print("✅ Model checkpoint saved →", CKPT_MODELS)


# ── Predictions ───────────────────────────────────────────────────────────
def predict_quantiles(X):
    p10 = np.maximum(0, np.expm1(models[0.10].predict(X)))
    p50 = np.maximum(0, np.expm1(models[0.50].predict(X)))
    p90 = np.maximum(0, np.expm1(models[0.90].predict(X)))
    p50 = np.maximum(p10, p50)
    p90 = np.maximum(p50, p90)
    return p10, p50, p90

p10, p50, p90 = predict_quantiles(X_test)
y_raw = y_test_raw.values


# ══════════════════════════════════════════════════════════════════════════
# CELL 8 — Evaluation
# ══════════════════════════════════════════════════════════════════════════

def winkler_score(y, lower, upper, alpha):
    width       = upper - lower
    missed_low  = 2 / alpha * np.maximum(0, lower - y)
    missed_high = 2 / alpha * np.maximum(0, y - upper)
    return float(np.mean(width + missed_low + missed_high))

print("\n" + "═"*68)
print("  TEST SET EVALUATION")
print("═"*68)

eval_results = {}
for label, pred, q in [("P10", p10, 0.10), ("P50", p50, 0.50), ("P90", p90, 0.90)]:
    mae  = mean_absolute_error(y_raw, pred)
    rmse = np.sqrt(mean_squared_error(y_raw, pred))
    pb   = pinball(q, y_raw, pred)
    cov  = float(np.mean(y_raw <= pred))
    rel  = mae / y_raw.mean() * 100
    eval_results[q] = dict(MAE=mae, RMSE=rmse, Pinball=pb, Coverage=cov, RelMAE=rel)
    ok = "✅" if abs(cov - q) < 0.05 else "⚠️ "
    print(f"  {label} | MAE=₹{mae:>7.1f} ({rel:4.1f}%) | RMSE=₹{rmse:>7.1f} | "
          f"Pinball={pb:7.4f} | Coverage={cov:.1%} (target={q:.0%}) {ok}")

w80   = winkler_score(y_raw, p10, p90, alpha=0.20)
cov80 = float(np.mean((y_raw >= p10) & (y_raw <= p90)))
mono  = float(np.mean((p10 > p50) | (p50 > p90)))
print(f"\n  80% interval | Winkler=₹{w80:.1f} | Coverage={cov80:.1%} | "
      f"Mono-violations={mono:.1%}")
print("═"*68)

# ── OOF evaluation ────────────────────────────────────────────────────────
print("\n🔄 Computing 5-fold OOF predictions ...")
oof_p50 = np.zeros(len(X_all))
kf_oof  = KFold(n_splits=5, shuffle=True, random_state=42)

for fold, (tr_idx, val_idx) in enumerate(kf_oof.split(X_all)):
    Xtr, ytr = X_all.iloc[tr_idx], y_log.iloc[tr_idx]
    Xval     = X_all.iloc[val_idx]
    Xtr_s, Xval_s, ytr_s, yval_s = train_test_split(Xtr, ytr, test_size=0.12, random_state=fold)
    params_oof = dict(objective="quantile", alpha=0.50, metric="quantile",
                      verbosity=-1, boosting_type="gbdt", **best_params[0.50])
    m_oof = lgb.LGBMRegressor(**params_oof)
    m_oof.fit(Xtr_s, ytr_s,
              eval_set=[(Xval_s, yval_s)],
              callbacks=[lgb.early_stopping(60, verbose=False), lgb.log_evaluation(-1)])
    oof_p50[val_idx] = np.maximum(0, np.expm1(m_oof.predict(Xval)))
    print(f"  Fold {fold+1}/5 done")

oof_mae = mean_absolute_error(y_all, oof_p50)
oof_rel = oof_mae / y_all.mean() * 100
print(f"\n  OOF P50 MAE : ₹{oof_mae:.1f}  ({oof_rel:.1f}%)  ← honest unbiased estimate")


# ══════════════════════════════════════════════════════════════════════════
# CELL 9 — SHAP Analysis
# ══════════════════════════════════════════════════════════════════════════

imp = (pd.Series(models[0.50].feature_importances_, index=feature_cols)
         .sort_values(ascending=False))
print("─── Top 25 features (P50 split importance) ───")
print(imp.head(25).to_string())

print("\n🔬 Computing SHAP values ...")
bg_sample = X_train.sample(min(500, len(X_train)), random_state=42)
explainer  = shap.TreeExplainer(models[0.50], bg_sample)
shap_vals  = explainer.shap_values(X_test)

plt.figure(figsize=(10, 8))
shap.summary_plot(shap_vals, X_test, feature_names=feature_cols, max_display=20, show=False)
plt.tight_layout()
plt.savefig("shap_summary.png", dpi=150, bbox_inches="tight")
plt.show()
print("SHAP plot saved ✅")

cov_idx = feature_cols.index("coverage") if "coverage" in feature_cols else None
if cov_idx is not None:
    cov_corr = np.corrcoef(X_test["coverage"].values, shap_vals[:, cov_idx])[0,1]
    print(f"\nCoverage ↔ SHAP correlation: {cov_corr:.3f}")
    if abs(cov_corr) > 0.98:
        print("  ⚠️  Very high — verify coverage is a pre-claim policy field, not derived from payout.")
    else:
        print("  ✅ Non-linear — no obvious leakage.")


# ══════════════════════════════════════════════════════════════════════════
# CELL 10 — Plots
# ══════════════════════════════════════════════════════════════════════════

fig = plt.figure(figsize=(20, 10))
gs  = gridspec.GridSpec(2, 3, figure=fig, hspace=0.38, wspace=0.32)

# 1. Actual vs P50
ax = fig.add_subplot(gs[0, 0])
ax.scatter(y_raw, p50, alpha=0.4, s=10, color="#378ADD")
lim = max(y_raw.max(), p50.max()) * 1.05
ax.plot([0, lim], [0, lim], "r--", lw=1.5, label="Perfect")
ax.set_xlabel("Actual ₹"); ax.set_ylabel("Predicted P50 ₹")
ax.set_title(f"Actual vs P50  (MAE=₹{eval_results[0.50]['MAE']:.0f}, {eval_results[0.50]['RelMAE']:.1f}%)")
ax.legend(fontsize=8)

# 2. Quantile intervals
ax2 = fig.add_subplot(gs[0, 1])
n   = min(120, len(y_raw))
idx = np.argsort(y_raw)[:n]; xs = np.arange(n)
ax2.fill_between(xs, p10[idx], p90[idx], alpha=0.2, color="#378ADD", label="P10–P90")
ax2.plot(xs, p50[idx], color="#378ADD", lw=1.5, label="P50")
ax2.scatter(xs, y_raw[idx], color="red", s=9, zorder=5, label="Actual")
ax2.set_xlabel("Samples (sorted by actual)"); ax2.set_ylabel("₹")
ax2.set_title("Quantile Prediction Intervals"); ax2.legend(fontsize=7)

# 3. Feature importance
ax3 = fig.add_subplot(gs[0, 2])
top = imp.head(15)
ax3.barh(top.index[::-1], top.values[::-1], color="#1D9E75")
ax3.set_xlabel("Importance"); ax3.set_title("Top 15 Features (P50)")
ax3.tick_params(axis="y", labelsize=8)

# 4. Residuals
ax4 = fig.add_subplot(gs[1, 0])
residuals = y_raw - p50
ax4.hist(residuals, bins=40, color="#D85A30", edgecolor="white", lw=0.4)
ax4.axvline(0, color="black", lw=1.5, ls="--")
ax4.set_xlabel("Residual ₹ (actual − P50)"); ax4.set_title("Residual Distribution")

# 5. Calibration
ax5 = fig.add_subplot(gs[1, 1])
ax5.plot([0,1], [0,1], "r--", lw=1.5, label="Perfect")
ax5.scatter(
    [0.10, 0.50, 0.90],
    [eval_results[0.10]["Coverage"], eval_results[0.50]["Coverage"], eval_results[0.90]["Coverage"]],
    s=80, zorder=5, color="#378ADD", label="Model"
)
ax5.set_xlabel("Target quantile"); ax5.set_ylabel("Empirical coverage")
ax5.set_title("Calibration Plot"); ax5.legend(fontsize=8)

# 6. OOF vs Test
ax6 = fig.add_subplot(gs[1, 2])
oof_rmse  = np.sqrt(mean_squared_error(y_all, oof_p50))
test_rmse = eval_results[0.50]["RMSE"]
x = np.arange(2)
ax6.bar(x - 0.2, [oof_mae,  oof_rmse],  0.35, label="OOF (honest)", color="#534AB7", alpha=0.85)
ax6.bar(x + 0.2, [eval_results[0.50]["MAE"], test_rmse], 0.35, label="Test set", color="#1D9E75", alpha=0.85)
ax6.set_xticks(x); ax6.set_xticklabels(["MAE","RMSE"])
ax6.set_ylabel("₹"); ax6.set_title("OOF vs Test Performance"); ax6.legend(fontsize=8)

plt.savefig("quantile_predictions.png", dpi=150, bbox_inches="tight")
plt.show()
print("All plots saved ✅")


# ══════════════════════════════════════════════════════════════════════════
# CELL 11 — Save Final Model Artifact
# ══════════════════════════════════════════════════════════════════════════

artifact = {
    "models"             : models,
    "scaler"             : scaler,
    "feature_cols"       : feature_cols,
    "best_params"        : best_params,
    "duration_map"       : DURATION_MAP,
    "disruption_codes"   : ALL_DISRUPTION_CODES,
    "sensor_cols"        : SENSOR_COLS,
    "dc_train_means"     : train_means_enc,
    "global_mean_raw"    : global_mean_raw,
    "smooth_k"           : SMOOTH_K,
    "use_log_transform"  : True,
    "metadata": {
        "model_type"    : "LightGBM quantile regression v3.0",
        "tuning"        : f"Optuna TPE {N_TRIALS} trials × {N_SPLITS}-fold CV | MedianPruner | SQLite resume",
        "trained_at"    : datetime.now().isoformat(),
        "n_train"       : int(len(X_train)),
        "n_test"        : int(len(X_test)),
        "n_features"    : len(feature_cols),
        "log_transform" : True,
        "p50_mae_test"  : round(float(eval_results[0.50]["MAE"]),  2),
        "p50_mae_oof"   : round(float(oof_mae), 2),
        "p50_rel_mae"   : round(float(eval_results[0.50]["RelMAE"]), 2),
        "p50_rmse"      : round(float(eval_results[0.50]["RMSE"]), 2),
        "winkler_80pct" : round(w80, 2),
        "calibration"   : {str(q): round(float(eval_results[q]["Coverage"]), 4)
                           for q in QUANTILES},
    }
}

joblib.dump(artifact, "income_loss_qr.pkl", compress=3)
size_kb = os.path.getsize("income_loss_qr.pkl") / 1024
print(f"✅ Saved: income_loss_qr.pkl  ({size_kb:.1f} KB)")
print("\nMetadata:")
for k, v in artifact["metadata"].items():
    print(f"  {k}: {v}")


# ══════════════════════════════════════════════════════════════════════════
# CELL 12 — Write kavach_predict.py
# ══════════════════════════════════════════════════════════════════════════

PREDICT_PY = '''"""
kavach_predict.py — Kavach Income Loss Estimator | Backend Inference Module
============================================================================
Requirements: pip install lightgbm joblib numpy pandas

USAGE:
    from kavach_predict import estimate_income_loss
    result = estimate_income_loss(worker_context, disruption_code, rain_mm=80)
"""

import numpy as np
import pandas as pd
import joblib
from functools import lru_cache

@lru_cache(maxsize=1)
def _load_artifact(model_path: str):
    return joblib.load(model_path)

_DURATION_MAP = {
    "LRA":4,"MRA":6,"HRA":8,"MAQ":12,"SAQ":12,"STM":4,
    "WND":6,"FLD":24,"CRF":24,"LDS":24,"FOG":6,"HTV":8,
    "EQK":2,"PND":0,"WAR":0,
}
_KNOWN_CODES = list(_DURATION_MAP.keys())


def estimate_income_loss(
    worker_context: dict,
    disruption_code: str,
    measured_value: float = 0.0,
    model_path: str = "income_loss_qr.pkl",
    coverage_amount: float = None,
    rain_mm: float = 0.0,
    aqi_val: float = 0.0,
    wind_kmh: float = 0.0,
    vis_m: float = 10000.0,
    temp_c: float = 28.0,
    mag: float = 0.0,
) -> dict:
    """
    Returns: {"p10_loss", "p50_loss" (payout), "p90_loss" (cap),
              "interval_width", "disruption_code"}

    worker_context keys (all optional):
      avg_daily_deliveries, platform_enc (0=Swiggy/1=Zomato),
      zone_risk_enc (0=low/1=med/2=high), months_active, typical_workdays,
      past_claims, past_correct_claims, kavachScore, avg_weekly_income,
      avg_daily_distance, coverage, premium, risk_multiplier,
      social_disruption_exposure, total_paid, severity_enc (0-3),
      day_of_week (0=Mon..6=Sun), month (1-12), hour (0-23)
    """
    art = _load_artifact(model_path)
    _models    = art["models"]
    _feats     = art["feature_cols"]
    _dur       = art.get("duration_map",     _DURATION_MAP)
    _codes     = art.get("disruption_codes", _KNOWN_CODES)
    _dc_means  = art.get("dc_train_means",   {})
    _global_mu = art.get("global_mean_raw",  1000.0)
    _use_log   = art.get("use_log_transform", True)

    if disruption_code not in _codes:
        disruption_code = "MRA"

    g = worker_context.get
    avg_del  = max(1.0, float(g("avg_daily_deliveries", 10)))
    dow      = int(g("day_of_week",  2)) % 7
    month    = int(g("month",        6))
    hour     = int(g("hour",        12)) % 24
    quarter  = int(g("quarter", (month - 1) // 3 + 1))
    is_wknd  = int(dow >= 5)
    is_rush  = int(hour in {8,9,10,17,18,19})
    dis_hrs  = float(_dur.get(disruption_code, 6))
    risk     = int(g("zone_risk_enc", 1))
    plat     = int(g("platform_enc",  0))
    sev      = int(g("severity_enc",  1))
    months   = float(g("months_active",              12))
    typ_days = float(g("typical_workdays",            5))
    past_c   = float(g("past_claims",                 0))
    past_cc  = float(g("past_correct_claims",         0))
    kscore   = float(g("kavachScore",                50))
    wk_inc   = float(g("avg_weekly_income",        3500))
    daily_d  = float(g("avg_daily_distance",         40))
    coverage = float(g("coverage", coverage_amount or 10000))
    premium  = float(g("premium",                   500))
    risk_mult= float(g("risk_multiplier",            1.0))
    soc_exp  = float(g("social_disruption_exposure", 0.3))
    total_pd = float(g("total_paid",                  0))

    claim_acc  = past_cc / (past_c + 1)
    daily_inc  = wk_inc / 6
    hourly_inc = daily_inc / 8
    cov_inc_r  = coverage / (wk_inc + 1)
    prem_inc_r = premium  / (wk_inc + 1)
    exp_score  = np.log1p(months) * kscore / 100
    deliv_dens = avg_del / (daily_d + 1)
    loss_per_d = total_pd / (past_c + 1)
    disr_sev   = dis_hrs * (1 + risk * 0.5) * (1 + sev * 0.3)
    dc_te      = _dc_means.get(disruption_code, _global_mu)

    row = {
        "avg_daily_deliveries": avg_del, "platform_enc": plat,
        "zone_risk_enc": risk, "months_active": months,
        "typical_workdays": typ_days, "past_claims": past_c,
        "past_correct_claims": past_cc, "claim_accuracy": claim_acc,
        "kavachScore": kscore, "avg_weekly_income": wk_inc,
        "avg_daily_distance": daily_d, "daily_income_est": daily_inc,
        "hourly_income_est": hourly_inc, "coverage": coverage,
        "coverage_income_ratio": cov_inc_r, "premium": premium,
        "premium_income_ratio": prem_inc_r, "risk_multiplier": risk_mult,
        "social_disruption_exposure": soc_exp, "total_paid": total_pd,
        "experience_score": exp_score, "delivery_density": deliv_dens,
        "loss_per_delivery": loss_per_d, "disruption_hours": dis_hrs,
        "severity_enc": sev, "disruption_severity_score": disr_sev,
        "day_of_week": dow, "is_weekend": is_wknd, "month": month,
        "quarter": quarter, "hour": hour, "is_rush_hour": is_rush,
        "day_of_week_sin": np.sin(2*np.pi*dow/7),
        "day_of_week_cos": np.cos(2*np.pi*dow/7),
        "month_sin": np.sin(2*np.pi*month/12),
        "month_cos": np.cos(2*np.pi*month/12),
        "hour_sin": np.sin(2*np.pi*hour/24),
        "hour_cos": np.cos(2*np.pi*hour/24),
        "measured_value": measured_value, "rain_mm": rain_mm,
        "aqi_val": aqi_val, "wind_kmh": wind_kmh, "vis_m": vis_m,
        "temp_c": temp_c, "mag": mag,
        "delivery_x_hours": avg_del*dis_hrs, "delivery_x_rain": avg_del*rain_mm,
        "delivery_x_aqi": avg_del*aqi_val, "risk_x_rain": risk*rain_mm,
        "risk_x_aqi": risk*aqi_val, "risk_x_wind": risk*wind_kmh,
        "hours_x_rain": dis_hrs*rain_mm, "severity_x_delivery": sev*avg_del,
        "severity_x_hours": sev*dis_hrs, "income_x_disruption": daily_inc*dis_hrs,
        "income_x_severity": daily_inc*sev, "coverage_x_severity": coverage*sev,
        "dc_target_enc": dc_te,
    }
    for code in _codes:
        row[f"dc_{code}"] = 1 if code == disruption_code else 0

    X_row = pd.DataFrame([row]).reindex(columns=_feats, fill_value=0).astype(float)

    if _use_log:
        p10 = max(0.0, float(np.expm1(_models[0.10].predict(X_row)[0])))
        p50 = max(0.0, float(np.expm1(_models[0.50].predict(X_row)[0])))
        p90 = max(0.0, float(np.expm1(_models[0.90].predict(X_row)[0])))
    else:
        p10 = max(0.0, float(_models[0.10].predict(X_row)[0]))
        p50 = max(0.0, float(_models[0.50].predict(X_row)[0]))
        p90 = max(0.0, float(_models[0.90].predict(X_row)[0]))

    p50 = max(p10, p50); p90 = max(p50, p90)
    cap = coverage_amount or coverage
    if cap:
        p10 = min(p10, cap); p50 = min(p50, cap); p90 = min(p90, cap)

    return {
        "p10_loss"       : round(p10),
        "p50_loss"       : round(p50),
        "p90_loss"       : round(p90),
        "interval_width" : round(p90 - p10),
        "disruption_code": disruption_code,
    }


if __name__ == "__main__":
    import sys
    path = sys.argv[1] if len(sys.argv) > 1 else "income_loss_qr.pkl"
    r = estimate_income_loss(
        {"avg_daily_deliveries":18,"kavachScore":65,"avg_weekly_income":5000,
         "zone_risk_enc":1,"months_active":12,"coverage":10000},
        "HRA", rain_mm=80.0, wind_kmh=35.0, model_path=path,
    )
    print("Smoke test:", r)
'''

with open("kavach_predict.py", "w") as f:
    f.write(PREDICT_PY)
print("✅ kavach_predict.py written")


# ══════════════════════════════════════════════════════════════════════════
# CELL 13 — Production Test Cases
# ══════════════════════════════════════════════════════════════════════════

if "kavach_predict" in sys.modules:
    importlib.reload(sys.modules["kavach_predict"])
from kavach_predict import estimate_income_loss

print("=== Production Test Cases ===\n")
TESTS = [
    {"label": "High-productivity Zomato | heavy rain | Friday",
     "worker": {"avg_daily_deliveries":25,"day_of_week":4,"zone_risk_enc":2,
                "platform_enc":1,"avg_weekly_income":8000,"kavachScore":75,
                "months_active":18,"coverage":15000},
     "code":"HRA","mv":120.0,"sensors":{"rain_mm":120.0,"wind_kmh":45.0}},
    {"label": "Low-productivity Swiggy | light rain | Monday",
     "worker": {"avg_daily_deliveries":8,"day_of_week":0,"zone_risk_enc":0,
                "platform_enc":0,"avg_weekly_income":2500,"kavachScore":40,
                "months_active":4,"coverage":5000},
     "code":"LRA","mv":20.0,"sensors":{"rain_mm":20.0}},
    {"label": "Average worker | severe AQI | Wednesday",
     "worker": {"avg_daily_deliveries":15,"day_of_week":2,"zone_risk_enc":1,
                "platform_enc":1,"avg_weekly_income":5000,"kavachScore":60,
                "months_active":10,"coverage":10000},
     "code":"SAQ","mv":350.0,"sensors":{"aqi_val":350.0,"vis_m":800.0}},
    {"label": "Top worker | flood Sunday | ₹20k cap",
     "worker": {"avg_daily_deliveries":30,"day_of_week":6,"zone_risk_enc":2,
                "platform_enc":1,"avg_weekly_income":12000,"kavachScore":90,
                "months_active":24,"coverage":20000},
     "code":"FLD","mv":500.0,
     "sensors":{"rain_mm":200.0,"wind_kmh":80.0,"vis_m":200.0},"coverage":20000},
    {"label": "Rush-hour earthquake | new worker",
     "worker": {"avg_daily_deliveries":12,"day_of_week":3,"hour":9,
                "zone_risk_enc":2,"platform_enc":0,"avg_weekly_income":3000,
                "kavachScore":45,"months_active":2,"coverage":8000},
     "code":"EQK","mv":5.5,"sensors":{"mag":5.5}},
]

for tc in TESTS:
    r = estimate_income_loss(tc["worker"], tc["code"], tc["mv"],
                             coverage_amount=tc.get("coverage"),
                             **tc.get("sensors", {}))
    print(f"✅ {tc['label']}")
    print(f"   P10 = ₹{r['p10_loss']:>7,}  |  P50 = ₹{r['p50_loss']:>7,} ← payout  |  P90 = ₹{r['p90_loss']:>7,}  |  Width = ₹{r['interval_width']:>7,}\n")


# ══════════════════════════════════════════════════════════════════════════
# CELL 14 — Download All Outputs
# ══════════════════════════════════════════════════════════════════════════

from google.colab import files
for fname in ["income_loss_qr.pkl","kavach_predict.py",
              "eda_plots.png","quantile_predictions.png","shap_summary.png"]:
    if os.path.exists(fname):
        files.download(fname)
        print(f"✅ Downloaded: {fname}")
    else:
        print(f"⚠️  {fname} not found — skipped")

print("\n✅ ALL DONE — checkpoint files (safe to delete after download):")
for f in [CKPT_FEATURES, CKPT_SPLIT, CKPT_MODELS, "kavach_optuna.db"]:
    if os.path.exists(f):
        sz = os.path.getsize(f)/1024
        print(f"   {f}  ({sz:.0f} KB)")
