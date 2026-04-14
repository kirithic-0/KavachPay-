import csv
import requests
import spacy
import joblib
import json
from datetime import datetime, timezone, timedelta
from transformers import pipeline

print("=" * 85)
print("  M4 – Disaster & Social Disruption Alert Engine")
print("=" * 85)

# ── API Keys ───────────────────────────────────────────────────────
OWM_API_KEY = "b9997e8907587d791d22c9201c1e0d18"
WAQI_TOKEN  = "4c47fe2fcf3da423d2c38fcfd818012bca5026cd"
NEWSAPI_KEY = "2cafa6bd918c45178a76b9f9757a5bd3"

# ── URLs ───────────────────────────────────────────────────────────
USGS_URL    = "https://earthquake.usgs.gov/fdsnws/event/1/query"
OWM_URL     = "https://api.openweathermap.org/data/2.5/weather"
WAQI_URL    = "https://api.waqi.info/feed/geo:{lat};{lon}/?token={token}"
NEWSAPI_URL = "https://newsapi.org/v2/everything"

# ── Thresholds ─────────────────────────────────────────────────────
EQK_THRESHOLD    = 4.0
FOG_VISIBILITY_M = 500
HRA_MM           = 100
MRA_MM           = 50
LRA_MM           = 25
STM_WIND_KMH     = 60
WND_WIND_KMH     = 80
HTV_TEMP_C       = 45
SAQ_AQI          = 300
MAQ_AQI          = 200
RADIUS_KM        = 200

# NLP Config
RECENCY_HOURS    = 24
NLP_THRESHOLD    = 0.65
ALERT_LABELS     = ["flood", "curfew", "landslide", "pandemic", "armed conflict"]
LABEL_TO_CODE    = {
    "flood": "FLD", "curfew": "CRF", "landslide": "LDS", 
    "pandemic": "PND", "armed conflict": "WAR"
}

RELEVANT_LEMMAS = {
    "flood", "inundation", "waterlog", "submerge", "deluge", "overflow",
    "curfew", "prohibitory", "section", "landslide", "mudslide", "mudflow",
    "outbreak", "epidemic", "pandemic", "disease", "virus", "infection",
    "conflict", "militant", "terror", "attack", "clash", "armed"
}

# ── Timezone ───────────────────────────────────────────────────────
IST = timezone(timedelta(hours=5, minutes=30))

# ── Data Structures ────────────────────────────────────────────────
CITY_CENTROIDS = {
    "Ahmedabad": (23.0225, 72.5714), "Bengaluru": (12.9716, 77.5946),
    "Chennai": (13.0827, 80.2707), "Coimbatore": (11.0168, 76.9558),
    "Delhi": (28.6139, 77.2090), "Hyderabad": (17.3850, 78.4867),
    "Jaipur": (26.9124, 75.7873), "Kolkata": (22.5726, 88.3639),
    "Mumbai": (19.0760, 72.8777), "Pune": (18.5204, 73.8567),
}

# ←←← PUT YOUR FULL LOCALITIES LIST HERE (do NOT use ...) ←←←
LOCALITIES = [
    {"name": "Bopal", "city": "Ahmedabad", "lat": 23.0333, "lon": 72.4667},
    {"name": "Chandkheda", "city": "Ahmedabad", "lat": 23.1077, "lon": 72.5801},
    # ... ADD ALL YOUR LOCALITIES HERE (the full list you had before)
    # Make sure every item has "name", "city", "lat", "lon"
]

# ── Load NLP Models ────────────────────────────────────────────────
print("   [NLP] Loading Models...")
_nlp = spacy.load("en_core_web_sm")
_classifier = pipeline("zero-shot-classification", model="facebook/bart-large-mnli", device=-1)

# ── Helper Functions ───────────────────────────────────────────────
def ms_to_kmh(ms: float) -> float: 
    return ms * 3.6

def now_ist() -> datetime: 
    return datetime.now(IST)

# ── API Fetch Functions ────────────────────────────────────────────
def fetch_owm(loc: dict):
    try:
        resp = requests.get(OWM_URL, params={
            "lat": loc["lat"], 
            "lon": loc["lon"], 
            "appid": OWM_API_KEY, 
            "units": "metric"
        }, timeout=12)
        resp.raise_for_status()
        return resp.json()
    except Exception as e:
        print(f"  ⚠️ OWM [{loc.get('name', 'Unknown')}]: {e}")
        return None

def parse_owm(data: dict | None) -> dict:
    if not data:
        return {}
    wind_kmh = ms_to_kmh(data.get("wind", {}).get("speed", 0))
    rain_1h_mm = data.get("rain", {}).get("1h", 0)
    temp_c = data.get("main", {}).get("temp", 0)
    vis = data.get("visibility", 10000)
    
    return {
        "temp_c": round(temp_c, 1),
        "rain_1h_mm": round(rain_1h_mm, 1),
        "wind_kmh": round(wind_kmh, 1),
        "visibility_m": vis,
        "HRA": 1 if rain_1h_mm >= HRA_MM else 0,
        "MRA": 1 if rain_1h_mm >= MRA_MM else 0,
        "LRA": 1 if rain_1h_mm >= LRA_MM else 0,
        "STM": 1 if wind_kmh >= STM_WIND_KMH else 0,
        "WND": 1 if wind_kmh >= WND_WIND_KMH else 0,
        "FOG": 1 if vis < FOG_VISIBILITY_M else 0,
        "HTV": 1 if temp_c >= HTV_TEMP_C else 0,
    }

def fetch_waqi(loc: dict):
    try:
        url = WAQI_URL.format(lat=loc["lat"], lon=loc["lon"], token=WAQI_TOKEN)
        resp = requests.get(url, timeout=10)
        data = resp.json()
        return data.get("data") if isinstance(data, dict) and data.get("status") == "ok" else None
    except Exception:
        return None

def parse_waqi(data: dict | None) -> dict:
    if not data:
        return {"aqi": 0, "dominant_pol": "—", "SAQ": 0, "MAQ": 0}
    aqi = data.get("aqi", 0)
    return {
        "aqi": aqi,
        "dominant_pol": data.get("dominentpol", "—"),
        "SAQ": 1 if aqi >= SAQ_AQI else 0,
        "MAQ": 1 if aqi >= MAQ_AQI else 0
    }

def fetch_city_eqk_flags() -> dict:
    flags = {}
    for city, (lat, lon) in CITY_CENTROIDS.items():
        try:
            resp = requests.get(USGS_URL, params={
                "format": "geojson",
                "minmagnitude": EQK_THRESHOLD,
                "latitude": lat,
                "longitude": lon,
                "maxradiuskm": RADIUS_KM
            }, timeout=10)
            flags[city] = 1 if resp.json().get("features") else 0
        except Exception:
            flags[city] = 0
    return flags

# ── NLP Functions ──────────────────────────────────────────────────
def spacy_is_relevant(text: str) -> bool:
    doc = _nlp(text.lower())
    lemmas = {token.lemma_ for token in doc}
    return bool(lemmas & RELEVANT_LEMMAS)

def run_news_alerts() -> dict:
    results = {}
    since = (datetime.now(timezone.utc) - timedelta(hours=RECENCY_HOURS)).strftime("%Y-%m-%dT%H:%M:%SZ")
    
    for city in CITY_CENTROIDS.keys():
        flags = {code: 0 for code in LABEL_TO_CODE.values()}
        query = f'"{city}" AND (flood OR curfew OR landslide OR pandemic OR "section 144")'
        try:
            resp = requests.get(NEWSAPI_URL, params={
                "q": query,
                "from": since,
                "apiKey": NEWSAPI_KEY,
                "language": "en"
            }, timeout=15)
            articles = resp.json().get("articles", [])[:10]
            for a in articles:
                text = f"{a.get('title', '')}. {a.get('description', '')}"
                if spacy_is_relevant(text):
                    res = _classifier(text, candidate_labels=ALERT_LABELS, multi_label=True)
                    for label, score in zip(res["labels"], res["scores"]):
                        if score >= NLP_THRESHOLD:
                            flags[LABEL_TO_CODE[label]] = 1
        except Exception:
            pass
        results[city] = flags
    return results

# ── Main Function ──────────────────────────────────────────────────
FIELDNAMES = ["date", "time_ist", "city", "area", "latitude", "longitude",
              "temp_c", "rain_1h_mm", "wind_kmh", "visibility_m", "aqi", "dominant_pol",
              "HRA", "MRA", "LRA", "STM", "WND", "FOG", "HTV", "EQK", "SAQ", "MAQ",
              "FLD", "CRF", "LDS", "PND", "WAR"]

def generate_disruption_alerts(output_path: str = "disruption_alerts.csv"):
    ts = now_ist()
    date_str = ts.strftime("%Y-%m-%d")
    time_str = ts.strftime("%H:%M:%S IST")

    print(f"\n[1] Starting M4 Alert Generation → {date_str} {time_str}")
    
    news_results = run_news_alerts()
    eqk_flags = fetch_city_eqk_flags()
    
    print(f"[2] Processing {len(LOCALITIES)} localities...")

    rows = []
    for i, loc in enumerate(LOCALITIES, 1):
        owm = parse_owm(fetch_owm(loc))
        waqi = parse_waqi(fetch_waqi(loc))
        city_news = news_results.get(loc["city"], {c: 0 for c in LABEL_TO_CODE.values()})
        
        row = {
            "date": date_str,
            "time_ist": time_str,
            "city": loc["city"],
            "area": loc["name"],
            "latitude": loc["lat"],
            "longitude": loc["lon"],
            **owm,
            **waqi,
            "EQK": eqk_flags.get(loc["city"], 0),
            **city_news
        }
        rows.append(row)

    # Save CSV
    with open(output_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=FIELDNAMES)
        writer.writeheader()
        writer.writerows(rows)

    print(f"[3] CSV saved → {output_path} ({len(rows):,} rows)")

    # ─────────────────────────────────────────────
    # 4. Save as Model + Metadata (Consistent with M1/M2)
    # ─────────────────────────────────────────────
    print("\n[4] Saving M4 Model & Metadata...")

    metadata = {
        "model_type": "DisruptionAlertEngine",
        "version": "M4-v1",
        "last_run": ts.strftime("%Y-%m-%d %H:%M:%S IST"),
        "cities_covered": list(CITY_CENTROIDS.keys()),
        "localities_count": len(LOCALITIES),
        "thresholds": {
            "EQK_THRESHOLD": EQK_THRESHOLD,
            "HRA_MM": HRA_MM,
            "MRA_MM": MRA_MM,
            "LRA_MM": LRA_MM,
            "STM_WIND_KMH": STM_WIND_KMH,
            "WND_WIND_KMH": WND_WIND_KMH,
            "HTV_TEMP_C": HTV_TEMP_C,
            "SAQ_AQI": SAQ_AQI,
            "MAQ_AQI": MAQ_AQI,
            "NLP_THRESHOLD": NLP_THRESHOLD,
            "RECENCY_HOURS": RECENCY_HOURS
        },
        "output_file": output_path,
        "fieldnames": FIELDNAMES
    }

    joblib.dump(metadata, "disruption_alerts_model.pkl")
    joblib.dump(metadata, "disruption_alerts_metadata.pkl")

    with open("disruption_alerts_metadata.json", "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2)

    print("✅ Model saved → disruption_alerts_model.pkl")
    print("✅ Metadata saved → disruption_alerts_metadata.pkl + .json")

    print("\n" + "=" * 85)
    print("  M4 – Disruption Alert Engine Complete ✓")
    print("=" * 85)


if __name__ == "__main__":
    generate_disruption_alerts()