import React, { useState, useRef, useEffect } from 'react';
import { KavachLogo } from './App';

// ─── API CONFIG ───
const GEMINI_KEY = process.env.REACT_APP_GEMINI_KEY;
const USE_API = !!GEMINI_KEY;

// ─── DYNAMIC SYSTEM PROMPT with worker context ───
function buildSystemPrompt(worker) {
    const workerContext = worker ? `

CURRENT USER CONTEXT — use this to answer specific questions about this worker:
Name: ${worker.name}
Zone: ${worker.zone}
City: ${worker.city}
Platform: ${worker.platform}
Weekly Premium: Rs.${worker.premium}
Weekly Coverage: Rs.${worker.coverage}
Avg Weekly Income: Rs.${worker.avgIncome}
Avg Daily Deliveries: ${worker.avgDeliveries}
KavachScore: ${worker.score} — ${worker.score >= 750 ? 'Trusted Worker — instant payouts' : worker.score >= 500 ? 'Standard Worker — 2 hour delay' : 'Under Review — 24 hour delay'}
Policy Type: ${worker.policyType === 'employer' ? 'Employer Sponsored — premium paid by employer' : 'Individual Policy'}
Employee ID: ${worker.employeeId}
Referral Code: ${worker.referralCode}
e-Shram: ${worker.eshramId ? 'Linked — UAN ' + worker.eshramId : 'Not linked'}

RECENT CLAIM HISTORY:
${worker.claims?.length > 0
            ? worker.claims.map((c, i) =>
                `${i + 1}. ${c.date} — ${c.event} (${c.severity})
   Status: ${c.paid ? 'PAID — Rs.' + c.payout + (c.txn ? ' — Transaction: ' + c.txn : '') : 'SKIPPED'}
   Verification: ${c.verificationLayers || 0}/5 layers passed
   ${c.skipReason ? 'Reason for skip: ' + c.skipReason : ''}
   ${c.paid ? 'Payout time: under 2 minutes' : ''}`
            ).join('\n\n')
            : 'No claims yet.'
        }

RECENT NOTIFICATIONS:
${worker.notifications?.slice(0, 4).map(n => `- ${n.title}: ${n.msg}`).join('\n') || 'None.'}

` : '';

    return `You are KavachBot, the official AI support assistant for KavachPay — India's first parametric income insurance for gig delivery workers on Swiggy and Zomato.
${workerContext}
PRODUCT KNOWLEDGE:

How it works: Trigger → Verify → Pay. When a disruption hits the worker's zone, KavachPay detects it via government APIs, runs 5-layer behavioral verification, and pays automatically to UPI. No forms. No calls.

13 Disruption Types covered:
- HRA: Heavy Rain >100mm/hr — IMD API
- MRA: Moderate Rain 50-99mm/hr — IMD API
- LRA: Light Rain 25-49mm/hr — IMD API
- SAQ: Severe AQI >300 — CPCB API
- MAQ: Moderate AQI 200-299 — CPCB API
- STM: Storm >60kmh — IMD API
- FLD: Flood NDMA Level 2/3 — NDMA API
- CRF: Curfew Govt Order — Govt notification
- EQK: Earthquake M>4.0 — NDMA/IMD
- LDS: Landslide — IMD API
- HTV: Heatwave >45 degrees C — IMD API
- FOG: Dense Fog visibility <50m — IMD API
- WND: High Wind >80kmh — IMD API

Payout tiers:
- Minor disruption (LRA/MAQ/FOG/WND): 30% of weekly coverage
- Moderate disruption (MRA/HRA/SAQ/STM/HTV): 65% of weekly coverage
- Severe disruption (FLD/EQK/LDS/CRF or extreme values): 100% of weekly coverage

Premium pricing:
- High risk zones Mumbai/Chennai/Kolkata: Rs.74/week — Rs.1,560 coverage
- Medium risk zones: Rs.59/week — Rs.1,200 coverage
- Low risk zones Bangalore/Hyderabad/Pune: Rs.49/week — Rs.980 coverage
- Custom slider: worker can increase premium up to Rs.200/week for proportional extra coverage

5-Layer Verification (all must pass):
1. Work Intent — worker must tap Start My Day before disruption
2. Disruption Trigger — IMD/CPCB/NDMA must confirm the event in worker's zone
3. Zone Correlation — 60%+ of workers in the same zone must be inactive
4. GPS Inactivity — worker must be stationary during disruption window
5. KavachScore — must be above 300

KavachScore system:
- Starts at 750 for all new workers
- 750-900: Trusted Worker — instant payout under 2 minutes
- 500-749: Standard Worker — 2 hour delay, +15% premium
- 300-499: Under Review — 24 hour delay, manual check
- Goes UP: legitimate claims +10, weekly streak +5, tenure bonus +15, clean record +8
- Goes DOWN: suspicious patterns -25, active during disruption -20, missed declaration -5, policy lapse -10

Instant Loans via KavachScore (no CIBIL needed):
- Score 800+: up to Rs.25,000
- Score 750-799: up to Rs.15,000
- Score 650-749: up to Rs.8,000
- Partners: KreditBee, MoneyTap, CashE

Other features:
- Employer Sponsored: company pays premium, worker gets FREE coverage
- e-Shram UAN: government registry integration for faster verification
- Referral codes: unique per worker, Rs.10 discount per successful referral
- Policy pause: no premium charged while paused, KavachScore unaffected
- Zone auto-update: system detects delivery patterns and suggests zone change
- Account deletion: soft delete, data retained 90 days
- Edit profile: all fields except Aadhaar and Employee ID can be changed
- Discussion Forum: workers can chat in their zone and city channels

INSTRUCTIONS:
- Be warm, helpful and concise
- If the user asks about THEIR specific claim, score, payout, zone, coverage or any personal detail — use the CURRENT USER CONTEXT above to answer accurately with exact numbers
- If asked why a claim was skipped — explain the exact reason from their claim history
- If asked about a transaction — provide the exact transaction ID from their history
- If asked their score — give exact number and tier
- Always respond in the SAME LANGUAGE the user writes in — Hindi if they write Hindi, Tamil if Tamil, English otherwise
- Keep responses under 150 words unless a complex explanation is needed
- Use Rs. for rupee amounts
- Never make up information not in this prompt
- If a question is outside KavachPay scope, politely redirect`;
}

// ─── GEMINI API CALL ───
async function getGeminiReply(messages, systemPrompt) {
    try {
        const contents = messages
            .filter(m => m.from !== 'system')
            .map(m => ({
                role: m.from === 'user' ? 'user' : 'model',
                parts: [{ text: m.text }],
            }));

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    system_instruction: {
                        parts: [{ text: systemPrompt }],
                    },
                    contents,
                    generationConfig: {
                        maxOutputTokens: 300,
                        temperature: 0.7,
                    },
                }),
            }
        );
        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            console.error('Gemini error:', response.status, errData);
            throw new Error('API error ' + response.status);
        }
        const data = await response.json();
        return data.candidates?.[0]?.content?.parts?.[0]?.text || null;
    } catch (err) {
        console.error('Gemini API error:', err);
        return null;
    }
}

// ─── RULE-BASED FALLBACK ───
const FALLBACK = {
    default: 'KavachPay protects delivery workers from income loss during disruptions. Ask me about your claims, coverage, KavachScore, or any other question.',
    how: '3 steps:\n1. Sign up and connect Swiggy or Zomato\n2. Disruption detected in your zone via government APIs\n3. 5-layer verification runs automatically\n4. Money reaches your UPI in under 2 minutes',
    cost: 'Pricing by zone risk:\n- High risk (Mumbai/Chennai/Kolkata): Rs.74/week — Rs.1,560 coverage\n- Medium risk: Rs.59/week — Rs.1,200 coverage\n- Low risk (Bangalore/Hyderabad): Rs.49/week — Rs.980 coverage',
    covered: '13 types covered:\nRain: HRA/MRA/LRA\nAir Quality: SAQ/MAQ\nWeather: STM/HTV/FOG/WND\nNatural: FLD/EQK/LDS\nCivic: CRF\n\nAll triggered automatically via IMD, CPCB and NDMA.',
    payout: 'Payouts are automatic — no claim needed.\n\nTiers:\n- Minor: 30% of coverage\n- Moderate: 65% of coverage\n- Severe: 100% of coverage\n\nTrusted Workers (750+) receive payment in under 2 minutes.',
    score: 'KavachScore tiers:\n- 750-900: Trusted — instant payout\n- 500-749: Standard — 2hr delay\n- 300-499: Under Review — 24hr delay\n\nYou start at 750.',
    loan: 'Instant loans (no CIBIL):\n- Score 800+: up to Rs.25,000\n- Score 750+: up to Rs.15,000\n- Score 650+: up to Rs.8,000\n\nPartners: KreditBee, MoneyTap, CashE',
    pause: 'Pause your policy anytime from My Policy page.\nNo premium charged while paused.\nResume anytime.',
    thanks: 'Happy to help. Stay safe on the roads.',
    verification: '5-layer verification:\n1. Work Intent — tapped Start My Day?\n2. Disruption Trigger — IMD/CPCB/NDMA confirmed?\n3. Zone Correlation — 60%+ workers inactive?\n4. GPS Inactivity — were you stationary?\n5. KavachScore — above 300?\n\nAll 5 must pass.',
};

function getFallbackReply(msg, worker) {
    const m = msg.toLowerCase();

    // Context-aware fallbacks when no API key
    if (worker) {
        if (m.includes('score') || m.includes('my score')) return `Your KavachScore is ${worker.score} — ${worker.score >= 750 ? 'Trusted Worker. You get instant payouts.' : worker.score >= 500 ? 'Standard Worker. 2 hour payout delay.' : 'Under Review. 24 hour delay.'}`;
        if (m.includes('coverage') || m.includes('my coverage')) return `Your weekly coverage is Rs.${worker.coverage}. You pay Rs.${worker.premium}/week premium.`;
        if (m.includes('zone') || m.includes('my zone')) return `Your registered zone is ${worker.zone}. You are on ${worker.platform}.`;
        if (m.includes('claim') || m.includes('rejected') || m.includes('skipped')) {
            const skipped = worker.claims?.find(c => !c.paid);
            if (skipped) return `Your claim on ${skipped.date} (${skipped.event}) was skipped. Reason: ${skipped.skipReason || 'A verification layer failed. Check My Claims for the full timeline.'}`;
            return 'All your recent claims were paid successfully. Check My Claims page for full details.';
        }
        if (m.includes('referral') || m.includes('my code')) return `Your referral code is ${worker.referralCode}. Share it with a friend — when they enroll you get Rs.10 off your next renewal.`;
    }

    if ((m.includes('how') && m.includes('work')) || m.includes('steps') || m.includes('process')) return FALLBACK.how;
    if (m.includes('cost') || m.includes('price') || m.includes('premium') || m.includes('much') || m.includes('rs.') || m.includes('₹')) return FALLBACK.cost;
    if (m.includes('cover') || m.includes('disruption') || m.includes('rain') || m.includes('flood') || m.includes('type')) return FALLBACK.covered;
    if (m.includes('payout') || m.includes('pay') || m.includes('money') || m.includes('upi') || m.includes('receive')) return FALLBACK.payout;
    if (m.includes('score') || m.includes('kavachscore')) return FALLBACK.score;
    if (m.includes('loan') || m.includes('borrow') || m.includes('kreditbee')) return FALLBACK.loan;
    if (m.includes('pause') || m.includes('stop') || m.includes('break')) return FALLBACK.pause;
    if (m.includes('verif') || m.includes('layer') || m.includes('gps')) return FALLBACK.verification;
    if (m.includes('thank') || m.includes('ok') || m.includes('great')) return FALLBACK.thanks;
    return FALLBACK.default;
}

const QUICK_CHIPS = {
    en: ['Why was my claim skipped?', 'My KavachScore?', 'My coverage?', 'How does it work?', 'Instant loans?'],
    hi: ['मेरा दावा क्यों छोड़ा?', 'मेरा KavachScore?', 'मेरी कवरेज?', 'कैसे काम करता है?', 'तत्काल ऋण?'],
    ta: ['கோரிக்கை ஏன் தவிர்க்கப்பட்டது?', 'என் KavachScore?', 'என் கவரேஜ்?', 'எவ்வாறு செயல்படுகிறது?', 'உடனடி கடன்?'],
};

export default function Chatbot({ onClose, lang, worker }) {
    const activeLang = lang || 'en';

    const [messages, setMessages] = useState([{
        from: 'bot',
        text: worker
            ? `Hi ${worker.name.split(' ')[0]}! I can see your account details.\n\nI can help you with your claims, KavachScore (${worker.score}), coverage (Rs.${worker.coverage}/week), zone updates, and anything else about KavachPay.\n\nWhat would you like to know?`
            : 'Welcome to KavachPay Support.\n\nI can help you with coverage, payouts, KavachScore, loans, and more.\n\nWhat would you like to know?'
    }]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [showQuick, setShowQuick] = useState(true);
    const bottomRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, loading]);

    const sendMessage = async (text) => {
        const userText = text || input.trim();
        if (!userText || loading) return;
        setShowQuick(false);
        setInput('');

        const updatedMessages = [...messages, { from: 'user', text: userText }];
        setMessages(updatedMessages);
        setLoading(true);

        let reply = null;

        if (USE_API) {
            const systemPrompt = buildSystemPrompt(worker);
            reply = await getGeminiReply(updatedMessages, systemPrompt);
        }

        if (!reply) {
            await new Promise(r => setTimeout(r, 400));
            reply = getFallbackReply(userText, worker);
        }

        setMessages(prev => [...prev, { from: 'bot', text: reply }]);
        setLoading(false);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const chips = QUICK_CHIPS[activeLang] || QUICK_CHIPS.en;

    const placeholder = activeLang === 'hi'
        ? 'KavachPay के बारे में पूछें...'
        : activeLang === 'ta'
            ? 'KavachPay பற்றி கேளுங்கள்...'
            : 'Ask about your claims, score, coverage...';

    return (
        <div style={{
            position: 'fixed', bottom: 90, right: 24,
            width: 340, height: 530,
            backgroundColor: 'white',
            borderRadius: 16,
            boxShadow: '0 12px 48px rgba(0,0,0,0.14)',
            display: 'flex', flexDirection: 'column',
            zIndex: 1000,
            fontFamily: 'Inter, -apple-system, sans-serif',
            overflow: 'hidden',
            border: '1px solid #E5E7EB',
        }}>

            {/* Header */}
            <div style={{ backgroundColor: '#1A3A5C', padding: '13px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
                <svg width="30" height="30" viewBox="0 0 100 100" fill="none">
                    <circle cx="50" cy="50" r="50" fill="rgba(255,255,255,0.12)" />
                    <text x="50" y="66" textAnchor="middle" fontSize="44" fill="white" fontFamily="Georgia,serif">₹</text>
                </svg>
                <div style={{ flex: 1 }}>
                    <p style={{ color: 'white', fontWeight: 700, fontSize: 13 }}>KavachBot</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 2 }}>
                        <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#34D399' }} />
                        <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 11 }}>
                            {USE_API ? 'Gemini AI · Personalised' : worker ? 'Support · Personalised' : 'Support · Online'}
                        </p>
                    </div>
                </div>
                {worker && (
                    <div style={{ backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 20, padding: '3px 10px', border: '1px solid rgba(255,255,255,0.15)' }}>
                        <p style={{ color: 'white', fontSize: 10, fontWeight: 700 }}>Score: {worker.score}</p>
                    </div>
                )}
                <button onClick={onClose}
                    style={{ background: 'rgba(255,255,255,0.12)', border: 'none', color: 'white', width: 26, height: 26, borderRadius: '50%', cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: 4 }}>
                    ✕
                </button>
            </div>

            {/* Worker context pill */}
            {worker && (
                <div style={{ backgroundColor: '#EFF6FF', borderBottom: '1px solid #BFDBFE', padding: '7px 14px', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 20, height: 20, borderRadius: '50%', backgroundColor: '#1A3A5C', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <p style={{ color: 'white', fontSize: 9, fontWeight: 800 }}>{worker.name[0]}</p>
                    </div>
                    <p style={{ fontSize: 11, color: '#1e40af', fontWeight: 600 }}>
                        {worker.name.split(' ')[0]} · {worker.zone?.split(',')[0]} · {worker.platform}
                    </p>
                    <div style={{ marginLeft: 'auto', backgroundColor: '#DBEAFE', borderRadius: 4, padding: '1px 6px' }}>
                        <p style={{ fontSize: 9, color: '#1e40af', fontWeight: 700 }}>PERSONALISED</p>
                    </div>
                </div>
            )}

            {/* Messages */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '12px 14px', backgroundColor: '#F9FAFB', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {messages.map((msg, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: msg.from === 'user' ? 'flex-end' : 'flex-start' }}>
                        {msg.from === 'bot' && (
                            <div style={{ width: 24, height: 24, borderRadius: 7, backgroundColor: '#1A3A5C', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: 8, flexShrink: 0, alignSelf: 'flex-end' }}>
                                <svg width="12" height="12" viewBox="0 0 100 100" fill="none">
                                    <text x="50" y="70" textAnchor="middle" fontSize="60" fill="white" fontFamily="Georgia,serif">₹</text>
                                </svg>
                            </div>
                        )}
                        <div style={{
                            maxWidth: '78%',
                            padding: '9px 13px',
                            borderRadius: msg.from === 'user' ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                            backgroundColor: msg.from === 'user' ? '#1A3A5C' : 'white',
                            color: msg.from === 'user' ? 'white' : '#111827',
                            fontSize: 13,
                            lineHeight: 1.6,
                            whiteSpace: 'pre-line',
                            boxShadow: msg.from === 'bot' ? '0 1px 4px rgba(0,0,0,0.06)' : 'none',
                            border: msg.from === 'bot' ? '1px solid #E5E7EB' : 'none',
                        }}>
                            {msg.text}
                        </div>
                    </div>
                ))}

                {/* Loading dots */}
                {loading && (
                    <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                        <div style={{ width: 24, height: 24, borderRadius: 7, backgroundColor: '#1A3A5C', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: 8, flexShrink: 0 }}>
                            <svg width="12" height="12" viewBox="0 0 100 100" fill="none">
                                <text x="50" y="70" textAnchor="middle" fontSize="60" fill="white" fontFamily="Georgia,serif">₹</text>
                            </svg>
                        </div>
                        <div style={{ backgroundColor: 'white', border: '1px solid #E5E7EB', borderRadius: '14px 14px 14px 4px', padding: '12px 16px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                            <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                                {[0, 1, 2].map(j => (
                                    <div key={j} style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#9CA3AF', animation: `chatPulse 1.4s ease-in-out ${j * 0.2}s infinite` }} />
                                ))}
                            </div>
                        </div>
                    </div>
                )}
                <div ref={bottomRef} />
            </div>

            {/* Quick Chips */}
            {showQuick && (
                <div style={{ padding: '8px 12px', backgroundColor: 'white', borderTop: '1px solid #E5E7EB', display: 'flex', gap: 5, overflowX: 'auto', scrollbarWidth: 'none' }}>
                    {chips.map((chip, i) => (
                        <button key={i} onClick={() => sendMessage(chip)}
                            style={{ flexShrink: 0, padding: '5px 11px', backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 12, fontSize: 11, color: '#6B7280', cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: 'Inter, sans-serif', transition: 'all 0.15s ease' }}
                            onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#EFF6FF'; e.currentTarget.style.borderColor = '#BFDBFE'; e.currentTarget.style.color = '#1A3A5C'; }}
                            onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#F9FAFB'; e.currentTarget.style.borderColor = '#E5E7EB'; e.currentTarget.style.color = '#6B7280'; }}>
                            {chip}
                        </button>
                    ))}
                </div>
            )}

            {/* Input */}
            <div style={{ padding: '10px 12px', borderTop: '1px solid #E5E7EB', backgroundColor: 'white', display: 'flex', gap: 8, alignItems: 'center' }}>
                <input
                    ref={inputRef}
                    type="text"
                    placeholder={placeholder}
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={loading}
                    style={{ flex: 1, padding: '9px 13px', borderRadius: 20, border: '1px solid #E5E7EB', fontSize: 13, outline: 'none', fontFamily: 'Inter, sans-serif', backgroundColor: loading ? '#F9FAFB' : 'white', color: '#111827', transition: 'border-color 0.15s ease' }}
                    onFocus={e => e.target.style.borderColor = '#BFDBFE'}
                    onBlur={e => e.target.style.borderColor = '#E5E7EB'}
                />
                <button onClick={() => sendMessage()} disabled={loading || !input.trim()}
                    style={{ width: 34, height: 34, borderRadius: '50%', backgroundColor: loading || !input.trim() ? '#E5E7EB' : '#1A3A5C', color: 'white', border: 'none', cursor: loading || !input.trim() ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'background-color 0.2s ease' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                        <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </button>
            </div>

            {/* Status bar */}
            <div style={{ padding: '4px 12px 7px', backgroundColor: 'white', textAlign: 'center' }}>
                <p style={{ fontSize: 10, color: '#9CA3AF' }}>
                    {USE_API
                        ? 'Gemini 1.5 Flash · Free API · Personalised to your account'
                        : 'Add REACT_APP_GEMINI_KEY to .env for AI mode'}
                </p>
            </div>

            <style>{`
        @keyframes chatPulse {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1); }
        }
      `}</style>
        </div>
    );
} 