import React, { useState, useEffect, useRef } from 'react';
import { db } from './firebase';
import {
  collection, query, orderBy,
  onSnapshot, addDoc, serverTimestamp
} from 'firebase/firestore';

// ─── API CONFIG ───
const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// ─── API CALLS (Person 2 — uncomment when backend ready) ───
const api = {
    // TODO: BACKEND — get messages for a zone or city
    // Firebase Firestore real-time listener recommended here
    getMessages: async (scope, name) => {
        // return await fetch(`${API_BASE}/api/forum/${scope}/${encodeURIComponent(name)}`)
        //   .then(r => r.json());
        return MOCK_MESSAGES[name] || []; // mock
    },
    // TODO: BACKEND — post a new message
    postMessage: async (scope, locationName, message) => {
        // return await fetch(`${API_BASE}/api/forum/${scope}/${encodeURIComponent(locationName)}`, {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json',
        //     'Authorization': `Bearer ${localStorage.getItem('token')}` },
        //   body: JSON.stringify(message)
        // }).then(r => r.json());
        return { success: true, id: 'msg_' + Date.now() }; // mock
    },
    // TODO: BACKEND — get disruption alerts for a city
    getDisruptionAlerts: async (city) => {
        return await fetch(`${API_BASE}/api/disruptions/active?city=${city}`)
          .then(r => r.json())
          .then(data => data.alerts || []);
    },
};

// ─── DESIGN TOKENS ───
const C = {
    accent: '#1A3A5C',
    accentLight: '#F0F4F8',
    accentBorder: '#D1E0EE',
    navy: '#08101F',
    bg: '#F9FAFB',
    cardBg: '#FFFFFF',
    cardBorder: '#D6E4FF',
    text: '#111827',
    textSec: '#374151',
    textMuted: '#6B7280',
    green: '#2E7D52',
    greenLight: '#E8F5EE',
    greenBorder: '#A8D5BC',
    orange: '#C05C1A',
    orangeLight: '#FFF0E6',
    orangeBorder: '#FFCBA4',
    red: '#B91C1C',
    redLight: '#FEF0F0',
    redBorder: '#FECACA',
};

// ─── MOCK DATA ───
const MOCK_MESSAGES = {
    'Koramangala, Bangalore': [
        { id: 1, sender: 'Ravi K.', senderId: 'u1', text: 'Heavy rain expected tonight around 8PM. Anyone planning to work?', time: '2:14 PM', zone: 'Koramangala', city: 'Bangalore', type: 'message' },
        { id: 2, sender: 'Priya S.', senderId: 'u2', text: 'I am stopping at 7PM to be safe. IMD confirmed 70mm.', time: '2:18 PM', zone: 'Koramangala', city: 'Bangalore', type: 'message' },
        { id: 3, sender: 'Mohammed A.', senderId: 'u3', text: 'KavachPay already sent me an alert. Coverage is active. Should be fine.', time: '2:22 PM', zone: 'Koramangala', city: 'Bangalore', type: 'message' },
        { id: 4, sender: 'Deepa N.', senderId: 'u4', text: 'Roads near forum mall are already waterlogged. Stay careful everyone.', time: '2:45 PM', zone: 'Koramangala', city: 'Bangalore', type: 'message' },
        { id: 5, sender: 'System', senderId: 'system', text: 'HRA Alert — Heavy Rain 82mm detected in Koramangala. Coverage monitoring active. Payouts will trigger automatically if threshold met.', time: '3:01 PM', zone: 'Koramangala', city: 'Bangalore', type: 'alert' },
        { id: 6, sender: 'Vikram S.', senderId: 'u5', text: 'Already got paid ₹780 from last week rain. System works fast!', time: '3:12 PM', zone: 'Koramangala', city: 'Bangalore', type: 'message' },
    ],
    'Adyar, Chennai': [
        { id: 1, sender: 'Karthik R.', senderId: 'u6', text: 'Cyclone alert issued for Chennai coast. All workers please be careful.', time: '9:10 AM', zone: 'Adyar', city: 'Chennai', type: 'message' },
        { id: 2, sender: 'System', senderId: 'system', text: 'FLD Alert — NDMA Level 3 Flood Warning issued for Adyar. Coverage fully active. Payout will trigger automatically.', time: '9:45 AM', zone: 'Adyar', city: 'Chennai', type: 'alert' },
        { id: 3, sender: 'Anjali G.', senderId: 'u7', text: 'Received ₹1,560 last month for the flooding. Stay home today everyone.', time: '10:02 AM', zone: 'Adyar', city: 'Chennai', type: 'message' },
    ],
    'Dharavi, Mumbai': [
        { id: 1, sender: 'Fatima B.', senderId: 'u8', text: 'AQI is 380 today. Very bad for riding. Anyone else stopping work?', time: '11:30 AM', zone: 'Dharavi', city: 'Mumbai', type: 'message' },
        { id: 2, sender: 'System', senderId: 'system', text: 'SAQ Alert — Severe AQI 412 detected in Dharavi. Coverage active. Payout will trigger if 60% zone inactivity confirmed.', time: '11:45 AM', zone: 'Dharavi', city: 'Mumbai', type: 'alert' },
        { id: 3, sender: 'Arjun R.', senderId: 'u9', text: 'Use a proper mask if going out. Stay safe. Coverage should activate soon.', time: '12:10 PM', zone: 'Dharavi', city: 'Mumbai', type: 'message' },
    ],
    'Andheri, Mumbai': [
        { id: 1, sender: 'Vikram S.', senderId: 'u5', text: 'Roads from Andheri east to west are completely jammed due to waterlogging.', time: '4:15 PM', zone: 'Andheri', city: 'Mumbai', type: 'message' },
        { id: 2, sender: 'Sneha P.', senderId: 'u10', text: 'Got ₹780 payout in just 2 minutes last week. Amazing speed.', time: '4:30 PM', zone: 'Andheri', city: 'Mumbai', type: 'message' },
    ],
    'Bangalore': [
        { id: 1, sender: 'All Bangalore Workers', senderId: 'system', text: 'Welcome to the Bangalore city forum. Share updates, discuss conditions, and stay safe together.', time: 'Pinned', zone: 'City', city: 'Bangalore', type: 'alert' },
        { id: 2, sender: 'Ravi K.', senderId: 'u1', text: 'Anyone from Whitefield facing issues? My zone was fine today.', time: '1:00 PM', zone: 'Koramangala', city: 'Bangalore', type: 'message' },
        { id: 3, sender: 'Deepa N.', senderId: 'u4', text: 'Whitefield is clear. Issues mainly in south Bangalore zones today.', time: '1:15 PM', zone: 'Whitefield', city: 'Bangalore', type: 'message' },
    ],
    'Chennai': [
        { id: 1, sender: 'System', senderId: 'system', text: 'Chennai city forum — All workers across zones can view but can only post in their own zone.', time: 'Pinned', zone: 'City', city: 'Chennai', type: 'alert' },
        { id: 2, sender: 'Karthik R.', senderId: 'u6', text: 'Adyar and Velachery badly affected. Anna Nagar seems okay so far.', time: '10:30 AM', zone: 'Adyar', city: 'Chennai', type: 'message' },
    ],
    'Mumbai': [
        { id: 1, sender: 'System', senderId: 'system', text: 'Mumbai city forum — View all zones, post only in your zone.', time: 'Pinned', zone: 'City', city: 'Mumbai', type: 'alert' },
        { id: 2, sender: 'Fatima B.', senderId: 'u8', text: 'Dharavi and Kurla worst hit today. Andheri manageable.', time: '12:00 PM', zone: 'Dharavi', city: 'Mumbai', type: 'message' },
        { id: 3, sender: 'Arjun R.', senderId: 'u9', text: 'Payouts came through fast for Dharavi workers. System is reliable.', time: '12:30 PM', zone: 'Kurla', city: 'Mumbai', type: 'message' },
    ],
};


const CITY_ZONES = {
    'Bangalore': ['Koramangala, Bangalore', 'Whitefield, Bangalore', 'HSR Layout, Bangalore', 'Indiranagar, Bangalore', 'JP Nagar, Bangalore', 'Electronic City, Bangalore'],
    'Chennai': ['Adyar, Chennai', 'Velachery, Chennai', 'Anna Nagar, Chennai', 'T Nagar, Chennai', 'Tambaram, Chennai'],
    'Mumbai': ['Dharavi, Mumbai', 'Andheri, Mumbai', 'Kurla, Mumbai', 'Bandra West, Mumbai', 'Borivali, Mumbai'],
    'Delhi': ['Connaught Place, Delhi', 'Lajpat Nagar, Delhi', 'Dwarka, Delhi', 'Rohini, Delhi'],
    'Hyderabad': ['Banjara Hills, Hyderabad', 'Madhapur, Hyderabad', 'Kukatpally, Hyderabad'],
    'Pune': ['Kothrud, Pune', 'Hinjewadi, Pune', 'Viman Nagar, Pune'],
    'Kolkata': ['Salt Lake, Kolkata', 'Park Street, Kolkata', 'Newtown, Kolkata'],
};

const ALL_CITIES = Object.keys(CITY_ZONES);

export default function Forum({ worker, lang }) {
    const workerZone = worker?.zone || 'Koramangala, Bangalore';
    const workerCity = worker?.city || 'Bangalore';

    const [scope, setScope] = useState('zone'); // 'zone' or 'city'
    const [selectedCity, setSelectedCity] = useState(workerCity);
    const [selectedZone, setSelectedZone] = useState(workerZone);
    const [messages, setMessages] = useState([]);
    const [alerts, setAlerts] = useState([]);
    const [input, setInput] = useState('');
    const [sending, setSending] = useState(false);
    const [loading, setLoading] = useState(true);
    const [charCount, setCharCount] = useState(0);
    const MAX_CHARS = 280;

    const bottomRef = useRef(null);

    // Check if worker can post in selected location
    const canPost = scope === 'zone'
        ? selectedZone === workerZone
        : selectedCity === workerCity;

    const currentLocation = scope === 'zone' ? selectedZone : selectedCity;

    useEffect(() => {
        const unsubscribe = loadMessages();
        loadAlerts();
        return () => {
            if (typeof unsubscribe === 'function') unsubscribe();
        };
    }, [scope, selectedZone, selectedCity, loadMessages, loadAlerts]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const loadMessages = React.useCallback(() => {
        setLoading(true);
        const colPath = `forum/${scope}_${currentLocation}/messages`;
        const q = query(collection(db, colPath), orderBy("timestamp", "asc"));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setMessages(msgs);
            setLoading(false);
        }, (err) => {
            console.error("Firestore Subscribe Error:", err);
            setLoading(false);
        });

        return unsubscribe;
    }, [scope, currentLocation]);

    const loadAlerts = React.useCallback(async () => {
        const alertData = await api.getDisruptionAlerts(selectedCity);
        setAlerts(alertData);
    }, [selectedCity]);

    const handleSend = async () => {
        if (!input.trim() || !canPost || sending) return;
        setSending(true);
        try {
            const colPath = `forum/${scope}_${currentLocation}/messages`;
            
            if (!worker || !worker.uid) {
                console.error("Worker UID missing. Cannot send message.");
                alert("Auth error: Please login again.");
                return;
            }

            const nameParts = (worker.name || 'Anonymous User').split(' ');
            const displayName = nameParts[0] + ' ' + (nameParts.length > 1 ? nameParts[nameParts.length - 1][0] : '') + '.';

            await addDoc(collection(db, colPath), {
                sender: displayName,
                sender_id: worker.uid,
                text: input.trim(),
                time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
                timestamp: serverTimestamp(),
                zone: worker.zone || 'Unknown',
                city: worker.city || 'Unknown',
                type: 'message',
            });
            setInput('');
            setCharCount(0);
        } catch (err) {
            console.error("Error sending message:", err);
            alert("Failed to send message.");
        } finally {
            setSending(false);
        }
    };

    const getSeverityColor = (s) => s === 'Severe' ? C.red : s === 'Moderate' ? C.orange : C.green;

    return (
        <div style={{ fontFamily: 'Inter, sans-serif' }}>

            {/* Forum Header */}
            <div style={{ backgroundColor: C.cardBg, borderRadius: 14, padding: '16px', marginBottom: 12, border: `1px solid ${C.cardBorder}` }}>
                <p style={{ color: C.text, fontWeight: 800, fontSize: 16, marginBottom: 4 }}>Worker Forum</p>
                <p style={{ color: C.textMuted, fontSize: 12, marginBottom: 14, lineHeight: 1.5 }}>
                    Connect with workers in your area. View any city or zone. Post only in your own city and zone.
                </p>

                {/* Scope Toggle */}
                <div style={{ display: 'flex', backgroundColor: C.bg, borderRadius: 10, padding: 3, gap: 3, marginBottom: 14, border: `1px solid ${C.cardBorder}` }}>
                    {[
                        { key: 'zone', label: 'My Zone' },
                        { key: 'city', label: 'My City' },
                    ].map(s => (
                        <button key={s.key} onClick={() => setScope(s.key)}
                            style={{ flex: 1, backgroundColor: scope === s.key ? C.accent : 'transparent', color: scope === s.key ? 'white' : C.textMuted, border: 'none', padding: '9px 12px', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: scope === s.key ? 700 : 500, fontFamily: 'Inter, sans-serif', transition: 'all 0.15s ease' }}>
                            {s.label}
                        </button>
                    ))}
                </div>

                {/* Location Selectors */}
                <div style={{ display: 'flex', gap: 8 }}>
                    {/* City Selector */}
                    <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', color: C.textSec, fontSize: 11, fontWeight: 600, marginBottom: 5, letterSpacing: 0.3 }}>CITY</label>
                        <select value={selectedCity} onChange={e => { setSelectedCity(e.target.value); setSelectedZone(CITY_ZONES[e.target.value]?.[0] || ''); }}
                            style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: `1.5px solid ${C.accentBorder}`, fontSize: 13, outline: 'none', backgroundColor: 'white', color: C.text, fontFamily: 'Inter, sans-serif', appearance: 'none', cursor: 'pointer' }}>
                            {ALL_CITIES.map(city => <option key={city}>{city}</option>)}
                        </select>
                    </div>

                    {/* Zone Selector — only in zone scope */}
                    {scope === 'zone' && (
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', color: C.textSec, fontSize: 11, fontWeight: 600, marginBottom: 5, letterSpacing: 0.3 }}>ZONE</label>
                            <select value={selectedZone} onChange={e => setSelectedZone(e.target.value)}
                                style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: `1.5px solid ${C.accentBorder}`, fontSize: 13, outline: 'none', backgroundColor: 'white', color: C.text, fontFamily: 'Inter, sans-serif', appearance: 'none', cursor: 'pointer' }}>
                                {CITY_ZONES[selectedCity]?.map(zone => <option key={zone} value={zone}>{zone.split(',')[0]}</option>)}
                            </select>
                        </div>
                    )}
                </div>

                {/* Viewing indicator */}
                <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: canPost ? C.green : C.orange }} />
                        <p style={{ fontSize: 11, color: canPost ? C.green : C.orange, fontWeight: 600 }}>
                            {canPost ? 'You can post here' : `Viewing only — post in your own ${scope}`}
                        </p>
                    </div>
                    <p style={{ fontSize: 11, color: C.textMuted }}>
                        {messages.length} message{messages.length !== 1 ? 's' : ''}
                    </p>
                </div>
            </div>

            {/* Active Disruption Alerts for selected city */}
            {alerts.length > 0 && (
                <div style={{ backgroundColor: C.cardBg, borderRadius: 14, padding: '14px 16px', marginBottom: 12, border: `1px solid ${C.cardBorder}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                        <div style={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: C.red, animation: 'pulse 2s infinite' }} />
                        <p style={{ color: C.text, fontWeight: 700, fontSize: 13 }}>Active Disruptions — {selectedCity}</p>
                    </div>
                    {alerts.map((alert, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', backgroundColor: C.orangeLight, borderRadius: 8, marginBottom: 6, border: `1px solid ${C.orangeBorder}`, borderLeft: `3px solid ${alert.color}` }}>
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <span style={{ fontSize: 11, fontWeight: 800, color: alert.color, letterSpacing: 0.5 }}>{alert.code}</span>
                                    <span style={{ fontSize: 12, color: C.text, fontWeight: 600 }}>{alert.label} — {alert.zone}</span>
                                </div>
                                <p style={{ fontSize: 11, color: C.textMuted, marginTop: 2 }}>{alert.value} · {alert.time}</p>
                            </div>
                            <div style={{ backgroundColor: getSeverityColor(alert.severity) + '20', padding: '3px 8px', borderRadius: 6, border: `1px solid ${getSeverityColor(alert.severity)}30` }}>
                                <p style={{ color: getSeverityColor(alert.severity), fontSize: 10, fontWeight: 700 }}>{alert.severity.toUpperCase()}</p>
                            </div>
                        </div>
                    ))}
                    <p style={{ fontSize: 11, color: C.textMuted, marginTop: 6 }}>Viewing alerts for {selectedCity}. Your coverage is active for your enrolled zone.</p>
                </div>
            )}

            {/* Messages Area */}
            <div style={{ backgroundColor: C.cardBg, borderRadius: 14, border: `1px solid ${C.cardBorder}`, marginBottom: 12, overflow: 'hidden' }}>
                <div style={{ padding: '12px 16px', borderBottom: `1px solid ${C.cardBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <p style={{ color: C.text, fontWeight: 700, fontSize: 13 }}>
                        {scope === 'zone' ? selectedZone.split(',')[0] : selectedCity} · {scope === 'zone' ? 'Zone Chat' : 'City Chat'}
                    </p>
                    {!canPost && (
                        <div style={{ backgroundColor: C.orangeLight, padding: '3px 10px', borderRadius: 8, border: `1px solid ${C.orangeBorder}` }}>
                            <p style={{ color: C.orange, fontSize: 10, fontWeight: 700 }}>VIEW ONLY</p>
                        </div>
                    )}
                </div>

                {/* Messages */}
                <div style={{ height: 340, overflowY: 'auto', padding: '12px 14px' }}>
                    {loading ? (
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ width: 32, height: 32, borderRadius: '50%', border: `3px solid ${C.accentBorder}`, borderTop: `3px solid ${C.accent}`, margin: '0 auto 10px', animation: 'spin 1s linear infinite' }} />
                                <p style={{ color: C.textMuted, fontSize: 13 }}>Loading messages...</p>
                            </div>
                        </div>
                    ) : messages.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={C.accentBorder} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto 12px', display: 'block' }}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
                            <p style={{ color: C.text, fontWeight: 600, fontSize: 14, marginBottom: 4 }}>No messages yet</p>
                            <p style={{ color: C.textMuted, fontSize: 12 }}>Be the first to start a conversation in this {scope}.</p>
                        </div>
                    ) : (
                        messages.map((msg, i) => {
                            const isMe = msg.sender_id === worker.uid;
                            const isSystem = msg.type === 'alert' || msg.sender_id === 'system';

                            if (isSystem) {
                                return (
                                    <div key={i} style={{ marginBottom: 12 }}>
                                        <div style={{ backgroundColor: C.accentLight, borderRadius: 10, padding: '10px 14px', border: `1px solid ${C.accentBorder}`, borderLeft: `3px solid ${C.accent}` }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
                                                <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: C.red, animation: 'pulse 2s infinite' }} />
                                                <p style={{ fontSize: 10, fontWeight: 800, color: C.accent, letterSpacing: 1, textTransform: 'uppercase' }}>System Alert</p>
                                            </div>
                                            <p style={{ fontSize: 12, color: C.textSec, lineHeight: 1.6 }}>{msg.text}</p>
                                            <p style={{ fontSize: 10, color: C.textMuted, marginTop: 5 }}>{msg.time}</p>
                                        </div>
                                    </div>
                                );
                            }

                            return (
                                <div key={i} style={{ marginBottom: 10, display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start' }}>
                                    {!isMe && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                                            <div style={{ width: 22, height: 22, borderRadius: '50%', backgroundColor: C.accentLight, border: `1px solid ${C.accentBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <p style={{ fontSize: 10, fontWeight: 700, color: C.accent }}>{msg.sender[0]}</p>
                                            </div>
                                            <p style={{ fontSize: 11, fontWeight: 600, color: C.textSec }}>{msg.sender}</p>
                                            {msg.zone && (
                                                <div style={{ backgroundColor: C.bg, padding: '1px 6px', borderRadius: 4, border: `1px solid ${C.cardBorder}` }}>
                                                    <p style={{ fontSize: 9, color: C.textMuted, fontWeight: 600 }}>{msg.zone}</p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    <div style={{ maxWidth: '78%', backgroundColor: isMe ? C.accent : C.cardBg, color: isMe ? 'white' : C.text, borderRadius: isMe ? '14px 14px 4px 14px' : '14px 14px 14px 4px', padding: '9px 13px', border: isMe ? 'none' : `1px solid ${C.cardBorder}`, boxShadow: isMe ? '0 2px 8px rgba(91,110,245,0.25)' : '0 1px 4px rgba(91,110,245,0.06)' }}>
                                        <p style={{ fontSize: 13, lineHeight: 1.55 }}>{msg.text}</p>
                                    </div>
                                    <p style={{ fontSize: 10, color: C.textMuted, marginTop: 3 }}>{msg.time}</p>
                                </div>
                            );
                        })
                    )}
                    <div ref={bottomRef} />
                </div>

                {/* Input Area */}
                {canPost ? (
                    <div style={{ padding: '12px 14px', borderTop: `1px solid ${C.cardBorder}`, backgroundColor: C.bg }}>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
                            <div style={{ flex: 1 }}>
                                <textarea
                                    placeholder={`Message ${scope === 'zone' ? selectedZone.split(',')[0] : selectedCity} workers...`}
                                    value={input}
                                    onChange={e => { if (e.target.value.length <= MAX_CHARS) { setInput(e.target.value); setCharCount(e.target.value.length); } }}
                                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                                    rows={2}
                                    style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: `1.5px solid ${C.accentBorder}`, fontSize: 13, outline: 'none', fontFamily: 'Inter, sans-serif', color: C.text, resize: 'none', boxSizing: 'border-box', backgroundColor: 'white' }}
                                />
                                <p style={{ fontSize: 10, color: charCount > MAX_CHARS * 0.8 ? C.orange : C.textMuted, textAlign: 'right', marginTop: 3 }}>{charCount}/{MAX_CHARS}</p>
                            </div>
                            <button onClick={handleSend} disabled={!input.trim() || sending}
                                style={{ width: 40, height: 40, borderRadius: '50%', backgroundColor: input.trim() && !sending ? C.accent : C.accentBorder, color: 'white', border: 'none', cursor: input.trim() && !sending ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'background-color 0.2s ease', marginBottom: 22 }}>
                                {sending
                                    ? <div style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid white', borderTop: '2px solid transparent', animation: 'spin 1s linear infinite' }} />
                                    : <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                }
                            </button>
                        </div>
                    </div>
                ) : (
                    <div style={{ padding: '14px 16px', borderTop: `1px solid ${C.cardBorder}`, backgroundColor: C.orangeLight, display: 'flex', alignItems: 'center', gap: 10 }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.orange} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                        <p style={{ fontSize: 12, color: C.orange, fontWeight: 600 }}>
                            You can only post in {workerZone.split(',')[0]} ({workerCity}). Switch to your own {scope} to post.
                        </p>
                    </div>
                )}
            </div>

            {/* Forum Rules */}
            <div style={{ backgroundColor: C.cardBg, borderRadius: 14, padding: '14px 16px', border: `1px solid ${C.cardBorder}` }}>
                <p style={{ color: C.text, fontWeight: 700, fontSize: 13, marginBottom: 10 }}>Forum Guidelines</p>
                {[
                    'Share real-time road and weather conditions to help fellow workers.',
                    'Do not share personal contact information or financial details.',
                    'Be respectful — this is a community for mutual support.',
                    'System alerts are official KavachPay notifications — not worker posts.',
                    'You can view any city or zone. Posting is limited to your own area.',
                ].map((rule, i) => (
                    <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 7 }}>
                        <div style={{ width: 5, height: 5, borderRadius: '50%', backgroundColor: C.accent, flexShrink: 0, marginTop: 5 }} />
                        <p style={{ fontSize: 12, color: C.textMuted, lineHeight: 1.6 }}>{rule}</p>
                    </div>
                ))}
            </div>

            <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
      `}</style>
        </div>
    );
}