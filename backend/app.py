from flask import Flask
from flask_cors import CORS
from routes.auth import auth_bp
from routes.workers import workers_bp
from routes.admin import admin_bp
from routes.weather import weather_bp
from routes.disruptions import disruptions_bp
from routes.payments import payments_bp
import firebase_admin
from firebase_admin import credentials
import os

def create_app():
    app = Flask(__name__)
    CORS(app, origins=["http://localhost:3000"])

    # Connect Firebase (only initialize once)
    if not firebase_admin._apps:
        cred = credentials.Certificate("firebase-credentials.json")
        firebase_admin.initialize_app(cred)

    # Register all route blueprints
    app.register_blueprint(auth_bp,         url_prefix="/api/auth")
    app.register_blueprint(workers_bp,      url_prefix="/api/workers")
    app.register_blueprint(admin_bp,        url_prefix="/api/admin")
    app.register_blueprint(weather_bp,      url_prefix="/api/weather")
    app.register_blueprint(disruptions_bp,  url_prefix="/api/disruptions")
    app.register_blueprint(payments_bp,     url_prefix="/api/payments")

    @app.route("/api/health")
    def health():
        return {"status": "KavachPay backend running"}, 200

    return app

    @app.route("/api/docs")
    def api_docs():
        return jsonify({
            "product": "KavachPay",
            "version": "1.0.0",
            "description": "Parametric income insurance API for gig workers",
            "phase": "Phase 1 - Core Backend",
            "endpoints": {
                "auth":         ["/api/auth/login", "/api/auth/signup", "/api/auth/admin/login"],
                "workers":      ["/api/workers/{id}", "/api/workers/{id}/claims", "/api/workers/{id}/score", "/api/workers/{id}/notifications"],
                "weather":      ["/api/weather/zone/{zone}", "/api/weather/aqi/{city}"],
                "disruptions":  ["/api/disruptions/simulate", "/api/disruptions/history/{zone}"],
                "payments":     ["/api/payments/premium", "/api/payments/payout"],
                "admin":        ["/api/admin/overview", "/api/admin/zones", "/api/admin/workers", "/api/admin/financial-health"]
            },
            "demo_credentials": {
                "worker":  {"email": "ravi@kavachpay.in", "password": "ravi123"},
                "admin":   {"email": "admin@kavachpay.in", "password": "admin123"}
            }
        }), 200

if __name__ == "__main__":
    app = create_app()
    app.run(debug=True, port=5000)