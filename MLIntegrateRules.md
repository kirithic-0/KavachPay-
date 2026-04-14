# KavachPay: ML Integration Guide

This guide provides instructions on how to swap out the placeholder logic in the KavachPay backend with your real, trained Machine Learning models. All placeholders and integration points are heavily encapsulated, making this a focused, drop-in process.

## 1. Where the ML Infrastructure Lives

*   **Primary Location**: The entire mock implementation runs out of one centralized file:
    👉 `backend/services/ml_models.py`
*   **Artifacts Folder**: Place your serialized models (e.g., `.pkl` files, `.h5` files) or lookup CSVs inside `backend/ml_artifacts/`.

## 2. Drop-in Replacement Workflow

For every model (M1, M1a, M2, etc.), you will follow these exact three steps:

### Step 1: Export your model
After training your model in a Jupyter Notebook or a training script, save it to a format the backend can load (typically `joblib` for scikit-learn/XGBoost).

```python
import joblib
# Example: export M2 XGBoost model
joblib.dump(xgb_model, 'backend/ml_artifacts/m2_fraud_xgb.pkl')
```

### Step 2: Load the artifacts
Open `backend/services/ml_models.py` and uncomment the loading code near the top of the file:

```python
import joblib 
# Uncomment these once the files are present in the directory :
_M2_MODEL = joblib.load('ml_artifacts/m2_fraud_xgb.pkl')
```

### Step 3: Replace the Mock Block
Inside each function in `ml_models.py`, you will find specific tags targeting the mock logic:

```python
# ── ML MODEL START (M2): Replace with your code ──
# <mock logic lives here>
# ── ML MODEL END (M2) ──
```

Delete the mock logic code inside those tags. Do not change the function signature, arguments, or the expected `return` dictionary. Just transform the incoming function arguments into the array/DataFrame shape your model expects, run `.predict()` or `.predict_proba()`, map the output to the existing variable names, and return.

---

## 3. Specific Model Instructions

### M1: Dynamic Premium Engine (Random Forest)
*   **Function**: `m1_predict_premium(...)`
*   **Input Features Needs**: You will need to encode categorical parameters like `risk` and `city` to match your model's encoders, using mappings identical to those defined in `RISK_ENC` and `CITY_TIER`.
*   **Output**: Ensure your model returns a float or int. Apply `max(39, min(150, premium))` before returning to enforce business limits.

### M1a: Cold-Start Premium (GLM Tweedie)
*   **Function**: `m1a_predict_premium_coldstart(...)`
*   **Notes**: Similar to M1. Ensure platform and city strings are mapped to identical categorical integers/one-hot values as used during training.

### M2: Fraud Detection Classifier (XGBoost)
*   **Function**: `m2_detect_fraud(...)`
*   **Notes**: 
    1. The mock uses specific thresholding dependent upon KavachScore (`>=750` vs `<500`). Maintain this dynamic threshold logic!
    2. Extract probability using `prob = model.predict_proba([features])[0][1]`.
    3. Ensure you map the output into the dictionary structure: `{'decision': str, 'fraud_prob': float, 'threshold': float, 'flags': list, 'auto_approve': bool}`.

### M3: Income Loss Quantile Regression
*   **Function**: `m3_estimate_income_loss(...)`
*   **Notes**: This model requires predicting three quantiles. If you saved your models as a dictionary inside the pickle file: `p10 = _M3_ARTIFACT['models'][0.10].predict(X)`. Return all three as `{'p10': val, 'p50': val, 'p90': val}`.

### M5: Churn Predictor (Logistic Regression)
*   **Function**: `m5_predict_churn(...)`
*   **Notes**: Ensure you extract the correct class probability `model.predict_proba()[0][1]` representing the likelihood. You must calculate a `margin` based off this likelihood (e.g. `0.20 * (1 - churn_prob)`) and return both.

### M6: Zone Risk Clusterer (K-Means)
*   **Function**: `m6_get_zone_cluster(...)`
*   **Notes**: M6 doesn't necessarily have to run real-time inference if the clusters are static. A production best-practice is to export the final K-means `zone -> cluster_id` assignments as a CSV map and just perform a fast dictionary lookup here!

### M7: Claim Text NLP Triage (TF-IDF + Linear SVM)
*   **Function**: `m7_classify_claim_text(...)`
*   **Notes**: You will have to load **two** artifacts: the trained `vectorizer` (TF-IDF) and the trained `classifier`.
    1. Transform text: `X = vectorizer.transform([text])`
    2. Predict: `pred = model.predict(X)[0]`
    3. Get Confidence: Use `model.decision_function(X)` or `predict_proba`.
    4. Calculate flags: Determine if the `pred` mismatches the `trigger_code` passed globally and flag `manual_review: True` if confidence is high.

---

## 4. End-to-End Testing Post-Integration
After swapping the placeholders with live predictions, always confirm system stability:
1. Reload your backend (`python app.py`).
2. Run `python test_ml.py` from the `backend/` directory to quickly spot matrix shape or encode errors.
3. Test end-to-end routing by firing a simulated disruption through POST `/api/disruptions/simulate` to trigger a realistic worker verification journey.
