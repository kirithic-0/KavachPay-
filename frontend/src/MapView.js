import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix leaflet default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const ZONE_RISK_DATA = [
    // Chennai
    { name: 'Adyar, Chennai', lat: 13.0012, lng: 80.2565, risk: 'high', premium: 74, coverage: 1560, workers: 47, reason: 'Coastal flooding, heavy monsoon rain' },
    { name: 'Velachery, Chennai', lat: 12.9815, lng: 80.2180, risk: 'high', premium: 74, coverage: 1560, workers: 38, reason: 'Flood-prone lowland, poor drainage' },
    { name: 'Tambaram, Chennai', lat: 12.9249, lng: 80.1000, risk: 'medium', premium: 64, coverage: 1300, workers: 31, reason: 'Moderate rain risk, inland zone' },
    { name: 'Anna Nagar, Chennai', lat: 13.0850, lng: 80.2101, risk: 'low', premium: 49, coverage: 980, workers: 44, reason: 'Elevated area, good drainage' },
    { name: 'T Nagar, Chennai', lat: 13.0418, lng: 80.2341, risk: 'medium', premium: 59, coverage: 1200, workers: 52, reason: 'Dense traffic, moderate flood risk' },
    // Mumbai
    { name: 'Dharavi, Mumbai', lat: 19.0422, lng: 72.8538, risk: 'high', premium: 74, coverage: 1560, workers: 63, reason: 'Extreme flood history, low elevation' },
    { name: 'Kurla, Mumbai', lat: 19.0726, lng: 72.8845, risk: 'high', premium: 74, coverage: 1560, workers: 55, reason: 'Flood-prone, heavy monsoon impact' },
    { name: 'Andheri, Mumbai', lat: 19.1136, lng: 72.8697, risk: 'medium', premium: 59, coverage: 1200, workers: 71, reason: 'Moderate risk, better drainage' },
    { name: 'Powai, Mumbai', lat: 19.1176, lng: 72.9060, risk: 'low', premium: 49, coverage: 980, workers: 48, reason: 'Elevated area, low flood risk' },
    // Bangalore
    { name: 'Koramangala, Bangalore', lat: 12.9352, lng: 77.6245, risk: 'medium', premium: 59, coverage: 1200, workers: 58, reason: 'Moderate rain, good infrastructure' },
    { name: 'Whitefield, Bangalore', lat: 12.9698, lng: 77.7500, risk: 'low', premium: 49, coverage: 980, workers: 42, reason: 'Low rainfall zone, good roads' },
    { name: 'HSR Layout, Bangalore', lat: 12.9116, lng: 77.6389, risk: 'low', premium: 49, coverage: 980, workers: 39, reason: 'Planned layout, low flood risk' },
    { name: 'Hebbal, Bangalore', lat: 13.0358, lng: 77.5970, risk: 'medium', premium: 59, coverage: 1200, workers: 33, reason: 'Lake proximity, moderate risk' },
    // Delhi
    { name: 'Dwarka, Delhi', lat: 28.5921, lng: 77.0460, risk: 'medium', premium: 64, coverage: 1300, workers: 61, reason: 'Waterlogging in monsoon' },
    { name: 'Connaught Place, Delhi', lat: 28.6315, lng: 77.2167, risk: 'medium', premium: 59, coverage: 1200, workers: 44, reason: 'Moderate risk, central zone' },
    { name: 'Noida Sector 18', lat: 28.5705, lng: 77.3219, risk: 'low', premium: 49, coverage: 980, workers: 37, reason: 'Planned infrastructure, low risk' },
    // Hyderabad
    { name: 'Banjara Hills, Hyderabad', lat: 17.4156, lng: 78.4347, risk: 'low', premium: 49, coverage: 980, workers: 41, reason: 'Elevated area, low flood risk' },
    { name: 'LB Nagar, Hyderabad', lat: 17.3483, lng: 78.5512, risk: 'medium', premium: 64, coverage: 1300, workers: 35, reason: 'Flood history, low-lying area' },
    { name: 'Secunderabad', lat: 17.4399, lng: 78.4983, risk: 'medium', premium: 59, coverage: 1200, workers: 48, reason: 'Moderate monsoon impact' },
    // Kolkata
    { name: 'Salt Lake, Kolkata', lat: 22.5804, lng: 88.4200, risk: 'high', premium: 74, coverage: 1560, workers: 41, reason: 'Reclaimed land, extreme flood risk' },
    { name: 'Howrah', lat: 22.5958, lng: 88.2636, risk: 'high', premium: 74, coverage: 1560, workers: 54, reason: 'River proximity, severe flooding' },
    { name: 'Newtown, Kolkata', lat: 22.5825, lng: 88.4699, risk: 'medium', premium: 59, coverage: 1200, workers: 29, reason: 'New planned area, moderate risk' },
    // Tier 2
    { name: 'Coimbatore', lat: 11.0168, lng: 76.9558, risk: 'medium', premium: 59, coverage: 1200, workers: 22, reason: 'Standard Tier 2 risk profile' },
    { name: 'Kochi', lat: 9.9312, lng: 76.2673, risk: 'medium', premium: 64, coverage: 1300, workers: 18, reason: 'Coastal city, moderate flood risk' },
    { name: 'Nagpur', lat: 21.1458, lng: 79.0882, risk: 'medium', premium: 59, coverage: 1200, workers: 15, reason: 'Central India, standard risk' },
    { name: 'Jaipur', lat: 26.9124, lng: 75.7873, risk: 'medium', premium: 64, coverage: 1300, workers: 19, reason: 'Flash flood risk in monsoon' },
    { name: 'Surat', lat: 21.1702, lng: 72.8311, risk: 'medium', premium: 64, coverage: 1300, workers: 17, reason: 'River proximity, flood history' },
];

function getNearestZone(lat, lng) {
    let nearest = null;
    let minDist = Infinity;
    ZONE_RISK_DATA.forEach(zone => {
        const dist = Math.sqrt(Math.pow(lat - zone.lat, 2) + Math.pow(lng - zone.lng, 2));
        if (dist < minDist) {
            minDist = dist;
            nearest = zone;
        }
    });
    // If too far from any known zone (>2 degrees), return generic
    if (minDist > 2) return null;
    return nearest;
}

function getRiskColor(risk) {
    return risk === 'high' ? '#C0392B' : risk === 'medium' ? '#F0A500' : '#1E7D34';
}
function getRiskBg(risk) {
    return risk === 'high' ? '#FDECEA' : risk === 'medium' ? '#FEF3DC' : '#D4EDDA';
}
function getRiskLabel(risk) {
    return risk === 'high' ? '🔴 High Risk' : risk === 'medium' ? '🟡 Medium Risk' : '🟢 Low Risk';
}

// Custom colored marker
function createColoredIcon(risk) {
    const color = getRiskColor(risk);
    return L.divIcon({
        className: '',
        html: `<div style="
      width: 24px; height: 24px; border-radius: 50% 50% 50% 0;
      background-color: ${color}; transform: rotate(-45deg);
      border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    "></div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 24],
        popupAnchor: [0, -28],
    });
}

function PinDropHandler({ onPin }) {
    useMapEvents({
        click(e) {
            onPin(e.latlng.lat, e.latlng.lng);
        },
    });
    return null;
}

export default function MapView({ worker, onBack }) {
    const [pinnedLocation, setPinnedLocation] = useState(null);
    const [pinnedZone, setPinnedZone] = useState(null);
    const [showAllZones, setShowAllZones] = useState(true);
    const [filterRisk, setFilterRisk] = useState('all');

    const handlePin = (lat, lng) => {
        setPinnedLocation({ lat, lng });
        const zone = getNearestZone(lat, lng);
        setPinnedZone(zone);
    };

    const filteredZones = filterRisk === 'all'
        ? ZONE_RISK_DATA
        : ZONE_RISK_DATA.filter(z => z.risk === filterRisk);

    // India center
    const mapCenter = [20.5937, 78.9629];

    return (
        <div style={{ backgroundColor: '#f5f7fa', minHeight: '100vh', fontFamily: 'Arial' }}>

            {/* Navbar */}
            <div style={{ backgroundColor: '#1A3A5C', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1 style={{ color: 'white', fontSize: '20px', fontWeight: 'bold' }}>🛡️ KavachPay</h1>
                <button onClick={onBack}
                    style={{ backgroundColor: 'transparent', color: 'white', border: '1px solid white', padding: '6px 14px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' }}>
                    ← Dashboard
                </button>
            </div>

            <div style={{ padding: '16px', maxWidth: '700px', margin: '0 auto' }}>

                <h2 style={{ color: '#1A3A5C', fontSize: '22px', fontWeight: 'bold', marginBottom: '4px' }}>🗺️ Zone Risk Map</h2>
                <p style={{ color: '#888', fontSize: '13px', marginBottom: '16px' }}>
                    Tap anywhere on the map to identify the risk zone and your estimated premium.
                </p>

                {/* Legend + Filters */}
                <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '14px', marginBottom: '14px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                            {[
                                { risk: 'high', label: 'High Risk — ₹74/wk' },
                                { risk: 'medium', label: 'Medium — ₹59–64/wk' },
                                { risk: 'low', label: 'Low Risk — ₹49/wk' },
                            ].map((item, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: getRiskColor(item.risk) }} />
                                    <p style={{ color: '#555', fontSize: '12px' }}>{item.label}</p>
                                </div>
                            ))}
                        </div>
                        <div style={{ display: 'flex', gap: '6px' }}>
                            {['all', 'high', 'medium', 'low'].map(f => (
                                <button key={f} onClick={() => setFilterRisk(f)}
                                    style={{ padding: '4px 10px', borderRadius: '12px', border: 'none', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold', backgroundColor: filterRisk === f ? '#1A3A5C' : '#f0f0f0', color: filterRisk === f ? 'white' : '#555' }}>
                                    {f.charAt(0).toUpperCase() + f.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Map */}
                <div style={{ borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.12)', marginBottom: '14px' }}>
                    <MapContainer
                        center={mapCenter}
                        zoom={5}
                        style={{ height: '420px', width: '100%' }}
                        scrollWheelZoom={true}
                    >
                        <TileLayer
                            attribution='&copy; OpenStreetMap contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />

                        <PinDropHandler onPin={handlePin} />

                        {/* Zone Markers */}
                        {showAllZones && filteredZones.map((zone, i) => (
                            <Marker
                                key={i}
                                position={[zone.lat, zone.lng]}
                                icon={createColoredIcon(zone.risk)}
                            >
                                <Popup>
                                    <div style={{ fontFamily: 'Arial', minWidth: '180px' }}>
                                        <p style={{ fontWeight: 'bold', fontSize: '14px', color: '#333', marginBottom: '6px' }}>{zone.name}</p>
                                        <div style={{ backgroundColor: getRiskBg(zone.risk), padding: '4px 8px', borderRadius: '8px', marginBottom: '8px', display: 'inline-block' }}>
                                            <p style={{ color: getRiskColor(zone.risk), fontWeight: 'bold', fontSize: '12px' }}>{getRiskLabel(zone.risk)}</p>
                                        </div>
                                        <div style={{ fontSize: '12px', color: '#555' }}>
                                            <p>💳 Premium: <strong>₹{zone.premium}/week</strong></p>
                                            <p style={{ marginTop: '3px' }}>🛡️ Coverage: <strong>₹{zone.coverage}/week</strong></p>
                                            <p style={{ marginTop: '3px' }}>👥 Workers: <strong>{zone.workers} enrolled</strong></p>
                                            <p style={{ marginTop: '6px', color: '#888', fontSize: '11px' }}>{zone.reason}</p>
                                        </div>
                                    </div>
                                </Popup>
                            </Marker>
                        ))}

                        {/* Pinned Location Marker */}
                        {pinnedLocation && (
                            <Marker
                                position={[pinnedLocation.lat, pinnedLocation.lng]}
                                icon={L.divIcon({
                                    className: '',
                                    html: `<div style="
                    width: 28px; height: 28px; border-radius: 50%;
                    background-color: #1A3A5C; border: 3px solid white;
                    box-shadow: 0 2px 12px rgba(26,86,160,0.5);
                    display: flex; align-items: center; justify-content: center;
                    font-size: 14px;
                  ">📍</div>`,
                                    iconSize: [28, 28],
                                    iconAnchor: [14, 14],
                                })}
                            >
                                <Popup>
                                    <p style={{ fontFamily: 'Arial', fontSize: '13px', fontWeight: 'bold' }}>
                                        📍 Your dropped pin
                                    </p>
                                    {pinnedZone ? (
                                        <p style={{ fontFamily: 'Arial', fontSize: '12px', color: '#555', marginTop: '4px' }}>
                                            Nearest zone: {pinnedZone.name}
                                        </p>
                                    ) : (
                                        <p style={{ fontFamily: 'Arial', fontSize: '12px', color: '#888', marginTop: '4px' }}>
                                            Outside covered zones
                                        </p>
                                    )}
                                </Popup>
                            </Marker>
                        )}
                    </MapContainer>
                </div>

                {/* Pin Drop Result Card */}
                {pinnedLocation && (
                    <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '20px', marginBottom: '14px', boxShadow: '0 2px 12px rgba(0,0,0,0.08)', borderLeft: `4px solid ${pinnedZone ? getRiskColor(pinnedZone.risk) : '#888'}` }}>
                        <p style={{ color: '#333', fontWeight: 'bold', fontSize: '15px', marginBottom: '12px' }}>
                            📍 Pin Drop Analysis
                        </p>

                        {pinnedZone ? (
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                    <div>
                                        <p style={{ color: '#333', fontWeight: 'bold', fontSize: '16px' }}>{pinnedZone.name}</p>
                                        <p style={{ color: '#888', fontSize: '12px', marginTop: '2px' }}>{pinnedZone.reason}</p>
                                    </div>
                                    <div style={{ backgroundColor: getRiskBg(pinnedZone.risk), padding: '6px 14px', borderRadius: '20px' }}>
                                        <p style={{ color: getRiskColor(pinnedZone.risk), fontWeight: 'bold', fontSize: '13px' }}>
                                            {getRiskLabel(pinnedZone.risk)}
                                        </p>
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '12px' }}>
                                    {[
                                        { label: 'Weekly Premium', value: '₹' + pinnedZone.premium, color: '#1A3A5C' },
                                        { label: 'Weekly Coverage', value: '₹' + pinnedZone.coverage, color: '#1E7D34' },
                                        { label: 'Workers Here', value: pinnedZone.workers, color: '#555' },
                                    ].map((s, i) => (
                                        <div key={i} style={{ backgroundColor: '#f8f9fa', borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
                                            <p style={{ color: s.color, fontWeight: 'bold', fontSize: '16px' }}>{s.value}</p>
                                            <p style={{ color: '#aaa', fontSize: '11px', marginTop: '3px' }}>{s.label}</p>
                                        </div>
                                    ))}
                                </div>

                                <div style={{ backgroundColor: '#D6E4F7', borderRadius: '10px', padding: '12px' }}>
                                    <p style={{ color: '#1A3A5C', fontSize: '13px', fontWeight: 'bold' }}>
                                        🛡️ If you work in this zone, KavachPay covers ₹{pinnedZone.coverage} per week for just ₹{pinnedZone.premium}/week
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div style={{ backgroundColor: '#f8f9fa', borderRadius: '10px', padding: '16px', textAlign: 'center' }}>
                                <p style={{ color: '#888', fontSize: '14px' }}>📍 This location is outside our current coverage zones.</p>
                                <p style={{ color: '#aaa', fontSize: '13px', marginTop: '6px' }}>
                                    We're expanding to new cities every month. Try dropping a pin in Chennai, Mumbai, Bangalore, Delhi, Hyderabad, Pune, Kolkata, or Ahmedabad.
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* Stats Bar */}
                <div style={{ backgroundColor: 'white', borderRadius: '14px', padding: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                    <p style={{ color: '#333', fontWeight: 'bold', fontSize: '14px', marginBottom: '12px' }}>📊 Coverage Network</p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '8px' }}>
                        {[
                            { label: 'Zones', value: ZONE_RISK_DATA.length + '+', color: '#1A3A5C' },
                            { label: 'Cities', value: '8 + T2', color: '#1A3A5C' },
                            { label: 'Workers', value: ZONE_RISK_DATA.reduce((a, b) => a + b.workers, 0) + '+', color: '#1E7D34' },
                            { label: 'High Risk', value: ZONE_RISK_DATA.filter(z => z.risk === 'high').length, color: '#C0392B' },
                        ].map((s, i) => (
                            <div key={i} style={{ textAlign: 'center', backgroundColor: '#f8f9fa', borderRadius: '8px', padding: '10px' }}>
                                <p style={{ color: s.color, fontWeight: 'bold', fontSize: '16px' }}>{s.value}</p>
                                <p style={{ color: '#aaa', fontSize: '11px', marginTop: '2px' }}>{s.label}</p>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
}