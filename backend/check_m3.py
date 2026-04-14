import joblib
m3 = joblib.load('ml_artifacts/income_loss_qr.pkl')
print(m3.get('feature_cols', getattr(m3, 'feature_cols', None)))
