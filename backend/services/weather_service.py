import requests
from config import OPENWEATHER_API_KEY, WAQI_API_KEY


def check_weather(city, lat=None, lng=None):
    try:
        url = "https://api.openweathermap.org/data/2.5/weather"
        # Use lat/lng if provided, otherwise use city name
        if lat and lng:
            params = {"lat": lat, "lon": lng, "appid": OPENWEATHER_API_KEY, "units": "metric"}
        else:
            params = {"q": city, "appid": OPENWEATHER_API_KEY, "units": "metric"}

        response = requests.get(url, params=params)
        data = response.json()

        if response.status_code != 200:
            return None

        rainfall = data.get("rain", {}).get("1h", 0)
        wind_speed = data.get("wind", {}).get("speed", 0) * 3.6  # Convert m/s to km/h
        description = data.get("weather", [{}])[0].get("description", "")

        # Determine severity
        if rainfall >= 100:
            return {"type": "rain", "severity": "Severe",   "pct": 1.0,  "rainfall_mm": rainfall, "wind_kmh": wind_speed, "description": description}
        elif rainfall >= 75:
            return {"type": "rain", "severity": "Moderate", "pct": 0.65, "rainfall_mm": rainfall, "wind_kmh": wind_speed, "description": description}
        elif rainfall >= 50:
            return {"type": "rain", "severity": "Minor",    "pct": 0.3,  "rainfall_mm": rainfall, "wind_kmh": wind_speed, "description": description}

        # Check for storm even without heavy rain
        if wind_speed > 60:
            return {"type": "storm", "severity": "Severe",  "pct": 1.0,  "rainfall_mm": rainfall, "wind_kmh": wind_speed, "description": description}

        return {"type": "none", "severity": None, "pct": 0, "rainfall_mm": rainfall, "wind_kmh": wind_speed, "description": description}

    except Exception as e:
        print(f"Weather API error: {e}")
        return None


def check_aqi(city):
    try:
        url = f"https://api.waqi.info/feed/{city}/"
        response = requests.get(url, params={"token": WAQI_API_KEY})
        data = response.json()

        if data.get("status") != "ok":
            return None

        aqi = data["data"]["aqi"]

        if aqi >= 400:
            return {"type": "aqi", "severity": "Severe",   "pct": 1.0,  "aqi": aqi}
        elif aqi >= 300:
            return {"type": "aqi", "severity": "Moderate", "pct": 0.65, "aqi": aqi}
        elif aqi >= 200:
            return {"type": "aqi", "severity": "Minor",    "pct": 0.3,  "aqi": aqi}

        return {"type": "none", "severity": None, "pct": 0, "aqi": aqi}

    except Exception as e:
        print(f"AQI API error: {e}")
        return None


def get_worst_disruption(weather, aqi):
    """Returns whichever disruption is more severe between weather and AQI"""
    severity_rank = {None: 0, "Minor": 1, "Moderate": 2, "Severe": 3}

    weather_rank = severity_rank.get(weather.get("severity") if weather else None, 0)
    aqi_rank = severity_rank.get(aqi.get("severity") if aqi else None, 0)

    if weather_rank == 0 and aqi_rank == 0:
        return None
    return weather if weather_rank >= aqi_rank else aqi