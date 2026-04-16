import firebase_admin
from firebase_admin import credentials
import os

# 1. Initialize Firebase FIRST before importing any routes
# This is critical because routes may call firestore.client() at the module level
if not firebase_admin._apps:
    current_dir = os.path.dirname(os.path.abspath(__file__))
    cred_path = os.path.join(current_dir, "firebase-credentials.json")
    cred = credentials.Certificate(cred_path)
    firebase_admin.initialize_app(cred)

from flask import Flask
from flask_cors import CORS
from routes.auth import auth_bp
from routes.workers import workers_bp
from routes.admin import admin_bp
from routes.weather import weather_bp
from routes.disruptions import disruptions_bp
from routes.payments import payments_bp
from routes.claims import claims_bp
from routes.policy import policy_bp
from routes.ml import ml_bp
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
import atexit

def create_app():
    app = Flask(__name__)
    CORS(app, resources={r"/api/*": {"origins": [
        "https://kavach-pay5.vercel.app",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]}}, supports_credentials=True)

    # Register all route blueprints
    app.register_blueprint(auth_bp,         url_prefix="/api/auth")
    app.register_blueprint(workers_bp,      url_prefix="/api/workers")
    app.register_blueprint(admin_bp,        url_prefix="/api/admin")
    app.register_blueprint(disruptions_bp,  url_prefix="/api/disruptions")
    app.register_blueprint(payments_bp,     url_prefix="/api/payments")
    app.register_blueprint(claims_bp,       url_prefix="/api/claims")
    app.register_blueprint(policy_bp,       url_prefix="/api/policy")
    app.register_blueprint(ml_bp,           url_prefix="/api/ml")
    app.register_blueprint(weather_bp,      url_prefix="/api")

    @app.route("/")
    @app.route("/api/health")
    def health():
        return {"status": "KavachPay Phase 2 API running"}, 200

    @app.errorhandler(Exception)
    def handle_exception(e):
        import traceback
        traceback.print_exc()
        return {"error": "Internal Server Error", "detail": str(e)}, 500

    return app

scheduler = BackgroundScheduler()

def auto_rotate_orders():
    """Runs every Monday 00:00 UTC — rotates order tables and updates worker stats."""
    print('[CRON] Starting weekly order rotation...')
    try:
        from routes.admin import run_order_rotation
        result = run_order_rotation()
        print(f'[CRON] Weekly rotation complete: {result}')
    except Exception as e:
        print(f'[CRON] Order rotation failed: {e}')

def auto_renew_premiums():
    """Runs every Monday 06:00 UTC — auto-renews active worker policies."""
    print('[CRON] Starting premium auto-renewal...')
    from firebase_admin import firestore as fs
    db = fs.client()
    from datetime import datetime

    workers = db.collection('workers')\
        .where('policy_active', '==', True)\
        .where('policy_paused', '==', False)\
        .where('is_deleted', '==', False).stream()

    renewed = 0
    for w_doc in workers:
        worker = w_doc.to_dict()
        uid = worker['uid']
        premium = worker.get('premium', 59)
        employee_id = worker.get('employee_id', '')

        # Write premium payment record (mock — no real Razorpay in cron)
        ts = int(datetime.utcnow().timestamp() * 1000)
        payment_id = f'PAY-{uid[-6:].upper()}-{ts}'
        db.collection('payments').document(payment_id).set({
            'payment_id': payment_id,
            'uid': uid,
            'employee_id': employee_id,
            'type': 'premium',
            'amount': premium,
            'method': 'upi',
            'razorpay_txn_id': f'AUTO-{ts}',
            'claim_id': '',
            'status': 'success',
            'created_at': fs.SERVER_TIMESTAMP,
        })

        # Update last_renewed on worker doc
        db.collection('workers').document(uid).update({
            'last_renewed': fs.SERVER_TIMESTAMP,
            'policy_active': True,
        })

        # KavachScore — enrollment streak check
        from services.kavachscore import check_enrollment_streak
        weeks_enrolled = worker.get('weeks_enrolled', 0) + 1
        db.collection('workers').document(uid).update({'weeks_enrolled': weeks_enrolled})
        check_enrollment_streak(uid, weeks_enrolled)

        renewed += 1

    print(f'[CRON] Auto-renewed {renewed} policies.')

# Configure Scheduler Jobs
scheduler.add_job(
    auto_rotate_orders,
    CronTrigger(day_of_week='mon', hour=0, minute=0),
    id='weekly_order_rotation',
    replace_existing=True,
)

scheduler.add_job(
    auto_renew_premiums,
    CronTrigger(day_of_week='mon', hour=6, minute=0),
    id='weekly_premium_renewal',
    replace_existing=True,
)

# Start scheduler and register shutdown
if not scheduler.running:
    scheduler.start()

atexit.register(lambda: scheduler.shutdown())

if __name__ == "__main__":
    app = create_app()
    app.run(debug=True, port=5000, use_reloader=False)