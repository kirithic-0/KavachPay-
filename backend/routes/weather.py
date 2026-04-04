# backend/routes/weather.py
from flask import Blueprint, request, jsonify
from services.firebase_service import require_auth
from services.weather_service import get_weather, get_aqi

weather_bp = Blueprint('weather', __name__)

@weather_bp.route('/weather', methods=['GET'])
@require_auth
def weather():
    city = request.args.get('city', 'Bangalore')
    return jsonify(get_weather(city))

@weather_bp.route('/aqi', methods=['GET'])
@require_auth
def aqi():
    city = request.args.get('city', 'Bangalore')
    return jsonify(get_aqi(city))