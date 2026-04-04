import requests
from config import OPENWEATHER_KEY, WAQI_KEY

# City → lat/lon for OpenWeatherMap (prevents ambiguous city names)
CITY_COORDS = {
    'Bangalore':  {'lat': 12.9716, 'lon': 77.5946},
    'Chennai':    {'lat': 13.0827, 'lon': 80.2707},
    'Mumbai':     {'lat': 19.0760, 'lon': 72.8777},
    'Hyderabad':  {'lat': 17.3850, 'lon': 78.4867},
    'Kolkata':    {'lat': 22.5726, 'lon': 88.3639},
    'Pune':       {'lat': 18.5204, 'lon': 73.8567},
    'Delhi':      {'lat': 28.6139, 'lon': 77.2090},
}

def get_weather(city: str) -> dict:
    """
    Fetch current weather for a city.
    Returns { temp, description, humidity, wind_speed, rain_1h, icon }
    Falls back to mock data if API key is missing.
    """
    if not OPENWEATHER_KEY:
        return _mock_weather(city)

    coords = CITY_COORDS.get(city, {})
    lat = coords.get('lat', 12.9716)
    lon = coords.get('lon', 77.5946)

    url = (
        f'https://api.openweathermap.org/data/2.5/weather'
        f'?lat={lat}&lon={lon}&appid={OPENWEATHER_KEY}&units=metric'
    )
    try:
        r = requests.get(url, timeout=5)
        d = r.json()
        return {
            'temp': round(d['main']['temp']),
            'description': d['weather'][0]['description'].title(),
            'humidity': d['main']['humidity'],
            'wind_speed': round(d['wind']['speed'] * 3.6, 1),  # m/s → km/h
            'rain_1h': d.get('rain', {}).get('1h', 0),
            'icon': d['weather'][0]['icon'],
        }
    except Exception:
        return _mock_weather(city)

def get_aqi(city: str) -> dict:
    """
    Fetch AQI data for a city from WAQI.
    Returns { aqi, category, pm25, pm10 }
    """
    if not WAQI_KEY:
        return _mock_aqi(city)

    url = f'https://api.waqi.info/feed/{city}/?token={WAQI_KEY}'
    try:
        r = requests.get(url, timeout=5)
        d = r.json()
        if d.get('status') != 'ok':
            return _mock_aqi(city)
        aqi = d['data']['aqi']
        return {
            'aqi': aqi,
            'category': _aqi_category(aqi),
            'pm25': d['data'].get('iaqi', {}).get('pm25', {}).get('v', 0),
            'pm10': d['data'].get('iaqi', {}).get('pm10', {}).get('v', 0),
        }
    except Exception:
        return _mock_aqi(city)

def _aqi_category(aqi: int) -> str:
    if aqi <= 50:    return 'Good'
    if aqi <= 100:   return 'Moderate'
    if aqi <= 150:   return 'Unhealthy for Sensitive'
    if aqi <= 200:   return 'Unhealthy'
    if aqi <= 300:   return 'Very Unhealthy'
    return 'Hazardous'

def _mock_weather(city: str) -> dict:
    return {'temp': 28, 'description': 'Partly Cloudy', 'humidity': 72,
            'wind_speed': 14.4, 'rain_1h': 0, 'icon': '02d'}

def _mock_aqi(city: str) -> dict:
    return {'aqi': 85, 'category': 'Moderate', 'pm25': 42, 'pm10': 58}