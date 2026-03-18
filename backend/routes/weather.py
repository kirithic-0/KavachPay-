from flask import Blueprint, jsonify
from services.weather_service import check_weather, check_aqi, get_worst_disruption

weather_bp = Blueprint('weather', __name__)

# Zone → city mapping
ZONE_CITIES = {
    "Koramangala, Bangalore": ("Bangalore", 12.9352, 77.6245),
    "Adyar, Chennai":         ("Chennai",   13.0067, 80.2571),
    "Dharavi, Mumbai":        ("Mumbai",    19.0390, 72.8527),
    "Bandra, Mumbai":         ("Mumbai",    19.0596, 72.8295),
    "Whitefield, Bangalore":  ("Bangalore", 12.9698, 77.7499),
    "T Nagar, Chennai":       ("Chennai",   13.0418, 80.2341),
}


@weather_bp.route('/zone/<path:zone>', methods=['GET'])
def get_zone_weather(zone):
    city_data = ZONE_CITIES.get(zone, ("Mumbai", None, None))
    city, lat, lng = city_data

    weather = check_weather(city, lat, lng)
    aqi = check_aqi(city)
    disruption = get_worst_disruption(weather, aqi)

    return jsonify({
        'zone':       zone,
        'city':       city,
        'weather':    weather,
        'aqi':        aqi,
        'disruption': disruption,
        'alert':      disruption is not None and disruption.get('severity') is not None
    }), 200


@weather_bp.route('/aqi/<city>', methods=['GET'])
def get_city_aqi(city):
    aqi = check_aqi(city)
    if not aqi:
        return jsonify({'error': 'Could not fetch AQI data'}), 500
    return jsonify({'city': city, 'aqi_data': aqi}), 200