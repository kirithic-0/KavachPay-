import requests
import os
from dotenv import load_dotenv

load_dotenv()

OPENWEATHER_KEY = os.getenv('OPENWEATHER_KEY')
WAQI_KEY = os.getenv('WAQI_KEY')


def check_weather(city):
    """
    Calls OpenWeatherMap API and returns rainfall (mm) and wind speed.
    Returns 0 rainfall if no rain data is available (clear day).
    """
    try:
        url = f"http://api.openweathermap.org/data/2.5/weather"
        params = {
            'q': city,
            'appid': OPENWEATHER_KEY,
            'units': 'metric'
        }
        response = requests.get(url, params=params)
        data = response.json()

        if response.status_code != 200:
            print(f"Weather API error: {data.get('message', 'Unknown error')}")
            return {'rainfall_mm': 0, 'wind_speed': 0, 'description': 'unknown'}

        # Rain data is only present if it's actually raining
        rain = data.get('rain', {})
        rainfall_mm = rain.get('1h', 0)  # Rainfall in last 1 hour

        wind_speed = data.get('wind', {}).get('speed', 0)
        description = data.get('weather', [{}])[0].get('description', '')

        return {
            'rainfall_mm': rainfall_mm,
            'wind_speed': wind_speed,
            'description': description
        }

    except Exception as e:
        print(f"Error calling weather API: {e}")
        return {'rainfall_mm': 0, 'wind_speed': 0, 'description': 'error'}


def check_aqi(city):
    """
    Calls WAQI API and returns the AQI number for a city.
    Returns 0 if data is unavailable.
    """
    try:
        url = f"https://api.waqi.info/feed/{city}/"
        params = {'token': WAQI_KEY}
        response = requests.get(url, params=params)
        data = response.json()

        if data.get('status') != 'ok':
            print(f"AQI API error: {data.get('data', 'Unknown error')}")
            return {'aqi': 0}

        aqi = data['data']['aqi']
        return {'aqi': aqi}

    except Exception as e:
        print(f"Error calling AQI API: {e}")
        return {'aqi': 0}


def get_severity(rainfall_mm, aqi):
    """
    Takes rainfall (mm) and AQI number.
    Returns severity level: None, 'minor', 'moderate', or 'severe'

    Thresholds (from KavachPay guide):
      Minor    → Rain 50-75mm   OR AQI 200-300
      Moderate → Rain 75-100mm  OR AQI 300-400
      Severe   → Rain >100mm    OR AQI >400
    """

    # Check rainfall severity
    if rainfall_mm > 100:
        rain_severity = 'severe'
    elif rainfall_mm >= 75:
        rain_severity = 'moderate'
    elif rainfall_mm >= 50:
        rain_severity = 'minor'
    else:
        rain_severity = None

    # Check AQI severity
    if aqi > 400:
        aqi_severity = 'severe'
    elif aqi >= 300:
        aqi_severity = 'moderate'
    elif aqi >= 200:
        aqi_severity = 'minor'
    else:
        aqi_severity = None

    # Return the worse of the two
    severity_rank = {None: 0, 'minor': 1, 'moderate': 2, 'severe': 3}
    if severity_rank[rain_severity] >= severity_rank[aqi_severity]:
        return rain_severity
    else:
        return aqi_severity

def get_payout_percentage(severity):
    """
    Returns the payout percentage based on severity tier.
    Minor    → 30% of weekly coverage
    Moderate → 65% of weekly coverage
    Severe   → 100% of weekly coverage
    """
    payouts = {
        'minor': 0.30,
        'moderate': 0.65,
        'severe': 1.00
    }
    return payouts.get(severity, 0)