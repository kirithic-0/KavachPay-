import csv
import requests
import spacy
from datetime import datetime, timezone, timedelta
from math import radians, sin, cos, sqrt, atan2
from transformers import pipeline

# ── API Keys ───────────────────────────────────────────────────────
OWM_API_KEY = "b9997e8907587d791d22c9201c1e0d18"
WAQI_TOKEN  = "4c47fe2fcf3da423d2c38fcfd818012bca5026cd"
NEWSAPI_KEY = "2cafa6bd918c45178a76b9f9757a5bd3"

# ── URLs ───────────────────────────────────────────────────────────
USGS_URL    = "https://earthquake.usgs.gov/fdsnws/event/1/query"
OWM_URL     = "https://api.openweathermap.org/data/2.5/weather"
WAQI_URL    = "https://api.waqi.info/feed/geo:{lat};{lon}/?token={token}"
NEWSAPI_URL = "https://newsapi.org/v2/everything"

# ── Thresholds & Config ────────────────────────────────────────────
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
ARTICLES_LIMIT   = 10
RECENCY_HOURS    = 24
NLP_THRESHOLD    = 0.65
ALERT_LABELS     = ["flood", "curfew", "landslide", "pandemic", "armed conflict"]
LABEL_TO_CODE    = {
    "flood": "FLD", "curfew": "CRF", "landslide": "LDS", 
    "pandemic": "PND", "armed conflict": "WAR"
}
RELEVANT_LEMMAS  = {
    "flood", "inundation", "waterlog", "submerge", "deluge", "overflow",
    "curfew", "prohibitory", "section", "landslide", "mudslide", "mudflow",
    "outbreak", "epidemic", "pandemic", "disease", "virus", "infection",
    "conflict", "militant", "terror", "attack", "clash", "armed"
}

# ── IST = UTC+5:30 ─────────────────────────────────────────────────
IST = timezone(timedelta(hours=5, minutes=30))

# ── Data Structures ────────────────────────────────────────────────
CITY_CENTROIDS = {
    "Ahmedabad": (23.0225, 72.5714), "Bengaluru": (12.9716, 77.5946),
    "Chennai": (13.0827, 80.2707), "Coimbatore": (11.0168, 76.9558),
    "Delhi": (28.6139, 77.2090), "Hyderabad": (17.3850, 78.4867),
    "Jaipur": (26.9124, 75.7873), "Kolkata": (22.5726, 88.3639),
    "Mumbai": (19.0760, 72.8777), "Pune": (18.5204, 73.8567),
}

LOCALITIES = [
    {"name": "Bopal", "city": "Ahmedabad", "lat": 23.0333, "lon": 72.4667},
    {"name": "Chandkheda", "city": "Ahmedabad", "lat": 23.1077, "lon": 72.5801},
    {"name": "Gota", "city": "Ahmedabad", "lat": 23.0853, "lon": 72.5358},
    {"name": "Isanpur", "city": "Ahmedabad", "lat": 22.9818, "lon": 72.5935},
    {"name": "Maninagar", "city": "Ahmedabad", "lat": 22.9944, "lon": 72.6025},
    {"name": "Navrangpura", "city": "Ahmedabad", "lat": 23.0366, "lon": 72.5489},
    {"name": "Prahladnagar", "city": "Ahmedabad", "lat": 23.0120, "lon": 72.5106},
    {"name": "Satellite", "city": "Ahmedabad", "lat": 23.0276, "lon": 72.5220},
    {"name": "Thaltej", "city": "Ahmedabad", "lat": 23.0500, "lon": 72.5167},
    {"name": "Vastrapur", "city": "Ahmedabad", "lat": 23.0350, "lon": 72.5293},
    {"name": "Banashankari", "city": "Bengaluru", "lat": 12.9152, "lon": 77.5736},
    {"name": "Electronic City", "city": "Bengaluru", "lat": 12.8399, "lon": 77.6770},
    {"name": "HSR Layout", "city": "Bengaluru", "lat": 12.9121, "lon": 77.6446},
    {"name": "Indiranagar", "city": "Bengaluru", "lat": 12.9784, "lon": 77.6408},
    {"name": "Jayanagar", "city": "Bengaluru", "lat": 12.9299, "lon": 77.5826},
    {"name": "Koramangala", "city": "Bengaluru", "lat": 12.9352, "lon": 77.6245},
    {"name": "Marathahalli", "city": "Bengaluru", "lat": 12.9569, "lon": 77.7011},
    {"name": "Rajajinagar", "city": "Bengaluru", "lat": 12.9982, "lon": 77.5530},
    {"name": "Whitefield", "city": "Bengaluru", "lat": 12.9698, "lon": 77.7499},
    {"name": "Yelahanka", "city": "Bengaluru", "lat": 13.1007, "lon": 77.5963},
    {"name": "Adyar", "city": "Chennai", "lat": 13.0033, "lon": 80.2566},
    {"name": "Anna Nagar", "city": "Chennai", "lat": 13.0850, "lon": 80.2101},
    {"name": "Chromepet", "city": "Chennai", "lat": 12.9516, "lon": 80.1462},
    {"name": "Perambur", "city": "Chennai", "lat": 13.1067, "lon": 80.2396},
    {"name": "Porur", "city": "Chennai", "lat": 13.0382, "lon": 80.1565},
    {"name": "Sholinganallur", "city": "Chennai", "lat": 12.9010, "lon": 80.2279},
    {"name": "T. Nagar", "city": "Chennai", "lat": 13.0405, "lon": 80.2337},
    {"name": "Tambaram", "city": "Chennai", "lat": 12.9249, "lon": 80.1000},
    {"name": "Thirumangalam", "city": "Chennai", "lat": 13.0854, "lon": 80.1983},
    {"name": "Velachery", "city": "Chennai", "lat": 12.9806, "lon": 80.2222},
    {"name": "Ganapathy", "city": "Coimbatore", "lat": 11.0364, "lon": 76.9830},
    {"name": "Gandhipuram", "city": "Coimbatore", "lat": 11.0183, "lon": 76.9664},
    {"name": "Hopes College", "city": "Coimbatore", "lat": 11.0260, "lon": 77.0126},
    {"name": "Kovaipudur", "city": "Coimbatore", "lat": 10.9255, "lon": 76.9366},
    {"name": "Peelamedu", "city": "Coimbatore", "lat": 11.0253, "lon": 77.0011},
    {"name": "RS Puram", "city": "Coimbatore", "lat": 11.0084, "lon": 76.9490},
    {"name": "Saibaba Colony", "city": "Coimbatore", "lat": 11.0298, "lon": 76.9443},
    {"name": "Saravanampatti", "city": "Coimbatore", "lat": 11.0805, "lon": 76.9961},
    {"name": "Singanallur", "city": "Coimbatore", "lat": 10.9997, "lon": 77.0268},
    {"name": "Vadavalli", "city": "Coimbatore", "lat": 11.0175, "lon": 76.9029},
    {"name": "Connaught Place", "city": "Delhi", "lat": 28.6304, "lon": 77.2177},
    {"name": "Dwarka", "city": "Delhi", "lat": 28.5823, "lon": 77.0500},
    {"name": "Janakpuri", "city": "Delhi", "lat": 28.6219, "lon": 77.0878},
    {"name": "Karol Bagh", "city": "Delhi", "lat": 28.6515, "lon": 77.1906},
    {"name": "Lajpat Nagar", "city": "Delhi", "lat": 28.5677, "lon": 77.2433},
    {"name": "Noida Sector 18", "city": "Delhi", "lat": 28.5708, "lon": 77.3204},
    {"name": "Pitampura", "city": "Delhi", "lat": 28.6981, "lon": 77.1388},
    {"name": "Rohini", "city": "Delhi", "lat": 28.7366, "lon": 77.1130},
    {"name": "Saket", "city": "Delhi", "lat": 28.5246, "lon": 77.2066},
    {"name": "Vasant Kunj", "city": "Delhi", "lat": 28.5293, "lon": 77.1539},
    {"name": "Ameerpet", "city": "Hyderabad", "lat": 17.4375, "lon": 78.4482},
    {"name": "Banjara Hills", "city": "Hyderabad", "lat": 17.4156, "lon": 78.4347},
    {"name": "Gachibowli", "city": "Hyderabad", "lat": 17.4401, "lon": 78.3489},
    {"name": "Hitech City", "city": "Hyderabad", "lat": 17.4474, "lon": 78.3762},
    {"name": "Jubilee Hills", "city": "Hyderabad", "lat": 17.4313, "lon": 78.4071},
    {"name": "Kukatpally", "city": "Hyderabad", "lat": 17.4849, "lon": 78.3979},
    {"name": "LB Nagar", "city": "Hyderabad", "lat": 17.3457, "lon": 78.5522},
    {"name": "Madhapur", "city": "Hyderabad", "lat": 17.4483, "lon": 78.3915},
    {"name": "Miyapur", "city": "Hyderabad", "lat": 17.4968, "lon": 78.3614},
    {"name": "Secunderabad", "city": "Hyderabad", "lat": 17.4399, "lon": 78.4983},
    {"name": "C-Scheme", "city": "Jaipur", "lat": 26.9068, "lon": 75.7997},
    {"name": "Jagatpura", "city": "Jaipur", "lat": 26.8156, "lon": 75.8361},
    {"name": "Malviya Nagar", "city": "Jaipur", "lat": 26.8549, "lon": 75.8242},
    {"name": "Mansarovar", "city": "Jaipur", "lat": 26.8624, "lon": 75.7621},
    {"name": "Pratap Nagar", "city": "Jaipur", "lat": 26.8042, "lon": 75.8198},
    {"name": "Raja Park", "city": "Jaipur", "lat": 26.8974, "lon": 75.8285},
    {"name": "Shyam Nagar", "city": "Jaipur", "lat": 26.8920, "lon": 75.7580},
    {"name": "Sikar Road", "city": "Jaipur", "lat": 26.9634, "lon": 75.7725},
    {"name": "Tonk Road", "city": "Jaipur", "lat": 26.8377, "lon": 75.7951},
    {"name": "Vaishali Nagar", "city": "Jaipur", "lat": 26.9149, "lon": 75.7441},
    {"name": "Ballygunge", "city": "Kolkata", "lat": 22.5280, "lon": 88.3659},
    {"name": "Barra Bazar", "city": "Kolkata", "lat": 22.5833, "lon": 88.3582},
    {"name": "Behala", "city": "Kolkata", "lat": 22.4937, "lon": 88.3188},
    {"name": "Dum Dum", "city": "Kolkata", "lat": 22.6226, "lon": 88.4222},
    {"name": "Garia", "city": "Kolkata", "lat": 22.4642, "lon": 88.3920},
    {"name": "Howrah", "city": "Kolkata", "lat": 22.5958, "lon": 88.3264},
    {"name": "New Town", "city": "Kolkata", "lat": 22.5828, "lon": 88.4554},
    {"name": "Park Street", "city": "Kolkata", "lat": 22.5513, "lon": 88.3519},
    {"name": "Salt Lake", "city": "Kolkata", "lat": 22.5892, "lon": 88.4116},
    {"name": "Tollygunge", "city": "Kolkata", "lat": 22.4947, "lon": 88.3461},
    {"name": "Andheri", "city": "Mumbai", "lat": 19.1136, "lon": 72.8697},
    {"name": "Bandra", "city": "Mumbai", "lat": 19.0596, "lon": 72.8295},
    {"name": "Borivali", "city": "Mumbai", "lat": 19.2307, "lon": 72.8567},
    {"name": "Dadar", "city": "Mumbai", "lat": 19.0178, "lon": 72.8478},
    {"name": "Goregaon", "city": "Mumbai", "lat": 19.1663, "lon": 72.8526},
    {"name": "Kandivali", "city": "Mumbai", "lat": 19.2045, "lon": 72.8361},
    {"name": "Kurla", "city": "Mumbai", "lat": 19.0728, "lon": 72.8794},
    {"name": "Malad", "city": "Mumbai", "lat": 19.1805, "lon": 72.8427},
    {"name": "Powai", "city": "Mumbai", "lat": 19.1176, "lon": 72.9060},
    {"name": "Thane", "city": "Mumbai", "lat": 19.2183, "lon": 72.9781},
    {"name": "Aundh", "city": "Pune", "lat": 18.5606, "lon": 73.8055},
    {"name": "Baner", "city": "Pune", "lat": 18.5590, "lon": 73.7868},
    {"name": "Hadapsar", "city": "Pune", "lat": 18.5089, "lon": 73.9259},
    {"name": "Hinjewadi", "city": "Pune", "lat": 18.5913, "lon": 73.7389},
    {"name": "Koregaon Park", "city": "Pune", "lat": 18.5362, "lon": 73.8939},
    {"name": "Kothrud", "city": "Pune", "lat": 18.5074, "lon": 73.8077},
    {"name": "Pimpri", "city": "Pune", "lat": 18.6279, "lon": 73.8009},
    {"name": "Shivajinagar", "city": "Pune", "lat": 18.5314, "lon": 73.8446},
    {"name": "Viman Nagar", "city": "Pune", "lat": 18.5679, "lon": 73.9143},
    {"name": "Wakad", "city": "Pune", "lat": 18.5991, "lon": 73.7634},
]

# ── Global NLP Models ──────────────────────────────────────────────
print("   [NLP] Loading Models...")
_nlp = spacy.load("en_core_web_sm")
_classifier = pipeline("zero-shot-classification", model="facebook/bart-large-mnli", device=-1)

# ── Utils ──────────────────────────────────────────────────────────
def ms_to_kmh(ms: float) -> float: return ms * 3.6
def now_ist() -> datetime: return datetime.now(IST)

# ── API Logic ──────────────────────────────────────────────────────
def fetch_owm(loc: dict) -> dict | None:
    try:
        resp = requests.get(OWM_URL, params={"lat": loc["lat"], "lon": loc["lon"], "appid": OWM_API_KEY, "units": "metric"}, timeout=10)
        resp.raise_for_status()
        return resp.json()
    except Exception as e:
        print(f"  ⚠️ OWM [{loc['name']}]: {e}")
    return None

def parse_owm(data: dict) -> dict:
    wind_kmh = ms_to_kmh(data.get("wind", {}).get("speed", 0))
    rain_1h_mm = data.get("rain", {}).get("1h", 0)
    temp_c = data.get("main", {}).get("temp", 0)
    vis = data.get("visibility", 10000)
    
    return {
        "temp_c": round(temp_c, 1), "rain_1h_mm": round(rain_1h_mm, 1),
        "wind_kmh": round(wind_kmh, 1), "visibility_m": vis,
        "HRA": 1 if rain_1h_mm >= HRA_MM else 0,
        "MRA": 1 if rain_1h_mm >= MRA_MM else 0,
        "LRA": 1 if rain_1h_mm >= LRA_MM else 0,
        "STM": 1 if wind_kmh >= STM_WIND_KMH else 0,
        "WND": 1 if wind_kmh >= WND_WIND_KMH else 0,
        "FOG": 1 if (vis < FOG_VISIBILITY_M) else 0,
        "HTV": 1 if temp_c >= HTV_TEMP_C else 0,
    }

def fetch_waqi(loc: dict) -> dict | None:
    try:
        url = WAQI_URL.format(lat=loc["lat"], lon=loc["lon"], token=WAQI_TOKEN)
        resp = requests.get(url, timeout=10)
        data = resp.json()
        return data["data"] if data.get("status") == "ok" else None
    except Exception: return None

def parse_waqi(data: dict) -> dict:
    aqi = data.get("aqi", 0)
    return {"aqi": aqi, "dominant_pol": data.get("dominentpol", "—"), "SAQ": 1 if aqi >= SAQ_AQI else 0, "MAQ": 1 if aqi >= MAQ_AQI else 0}

def fetch_city_eqk_flags() -> dict:
    flags = {}
    for city, (lat, lon) in CITY_CENTROIDS.items():
        try:
            resp = requests.get(USGS_URL, params={"format": "geojson", "minmagnitude": EQK_THRESHOLD, "latitude": lat, "longitude": lon, "maxradiuskm": RADIUS_KM}, timeout=10)
            flags[city] = 1 if resp.json().get("features") else 0
        except Exception: flags[city] = 0
    return flags

# ── NLP Logic ──────────────────────────────────────────────────────
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
            resp = requests.get(NEWSAPI_URL, params={"q": query, "from": since, "apiKey": NEWSAPI_KEY, "language": "en"}, timeout=10)
            articles = resp.json().get("articles", [])
            for a in articles:
                text = f"{a.get('title', '')}. {a.get('description', '')}"
                if spacy_is_relevant(text):
                    res = _classifier(text, candidate_labels=ALERT_LABELS, multi_label=True)
                    for label, score in zip(res["labels"], res["scores"]):
                        if score >= NLP_THRESHOLD: flags[LABEL_TO_CODE[label]] = 1
        except Exception: pass
        results[city] = flags
    return results

# ── Main ───────────────────────────────────────────────────────────
FIELDNAMES = ["date", "time_ist", "city", "area", "latitude", "longitude", "temp_c", "rain_1h_mm", "wind_kmh", "visibility_m", "aqi", "dominant_pol", "HRA", "MRA", "LRA", "STM", "WND", "FOG", "HTV", "EQK", "SAQ", "MAQ", "FLD", "CRF", "LDS", "PND", "WAR"]

def generate_csv(output_path: str = "disaster_alerts.csv"):
    ts = now_ist()
    date_str, time_str = ts.strftime("%Y-%m-%d"), ts.strftime("%H:%M:%S IST")
    
    print(f"\n--- Generating Disaster Alerts: {date_str} {time_str} ---")
    news_results = run_news_alerts()
    eqk_flags = fetch_city_eqk_flags()
    
    rows = []
    for i, loc in enumerate(LOCALITIES, 1):
        print(f"Processing {i}/{len(LOCALITIES)}: {loc['name']}", end="\r")
        owm = parse_owm(fetch_owm(loc) or {})
        waqi = parse_waqi(fetch_waqi(loc) or {})
        city_news = news_results.get(loc["city"], {c: 0 for c in LABEL_TO_CODE.values()})
        
        row = {
            "date": date_str, "time_ist": time_str, "city": loc["city"], "area": loc["name"],
            "latitude": loc["lat"], "longitude": loc["lon"],
            **owm, **waqi, "EQK": eqk_flags.get(loc["city"], 0), **city_news
        }
        rows.append(row)

    with open(output_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=FIELDNAMES)
        writer.writeheader()
        writer.writerows(rows)
    print(f"\n✅ CSV saved to {output_path}")

if __name__ == "__main__":
    generate_csv()