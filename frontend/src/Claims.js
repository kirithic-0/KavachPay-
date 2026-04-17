import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { KavachLogo, useTheme } from './App';

// ─── API CONFIG ───
const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const api = {
    // TODO: BACKEND — get claims for worker
    getClaims: async (workerId) => {
        try {
            return await fetch(`${API_BASE}/api/claims/${workerId}`, {
              headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            }).then(r => r.json());
        } catch (e) {
            console.error('Failed to load claims:', e);
            return { claims: [] };
        }
    },
};

// ─── DESIGN TOKENS ───
const C = {
    navy: '#08101F',
    accent: '#1A3A5C',
    accentLight: '#F0F4F8',
    accentBorder: '#D1E0EE',
    bg: '#F9FAFB',
    cardBg: '#FFFFFF',
    cardBorder: '#E5E7EB',
    cardShadow: '0 1px 4px rgba(0,0,0,0.06)',
    text: '#111827',
    textSec: '#374151',
    textMuted: '#6B7280',
    green: '#059669',
    greenLight: '#ECFDF5',
    greenBorder: '#A7F3D0',
    orange: '#D97706',
    orangeLight: '#FFFBEB',
    orangeBorder: '#FDE68A',
    red: '#DC2626',
    redLight: '#FEF2F2',
    redBorder: '#FECACA',
};

const T = {
    en: {
        brand: 'KavachPay', back: 'Back',
        title: 'My Claims',
        totalClaims: 'Total Claims',
        paidOut: 'Paid Out',
        totalReceived: 'Total Received',
        payoutHistory: 'Payout History',
        payoutHistorySub: 'Amount received per approved claim',
        skippedNotice: 'claim skipped',
        skippedNoticePlural: 'claims skipped',
        skippedMsg: 'Claims are skipped when verification layers fail — active deliveries detected or zone threshold not met.',
        all: 'All', paid: 'Paid', skipped: 'Skipped', pending: 'Pending Review',
        severity: 'Severity',
        verification: 'Verification',
        payout: 'Payout',
        layers: '/5 layers',
        viewTimeline: 'Details',
        hideTimeline: 'Hide Details',
        paidLabel: 'PAID',
        skippedLabel: 'SKIPPED',
        pendingLabel: 'PENDING',
        noClaims: 'No claims yet',
        noClaimsSub: 'Claims appear here after a disruption is verified in your zone.',
        noClaimsFiltered: 'No claims match this filter.',
    },
    hi: {
        brand: 'KavachPay', back: 'वापस',
        title: 'मेरे दावे',
        totalClaims: 'कुल दावे',
        paidOut: 'भुगतान किए',
        totalReceived: 'कुल प्राप्त',
        payoutHistory: 'भुगतान इतिहास',
        payoutHistorySub: 'प्रत्येक दावे के लिए राशि',
        skippedNotice: 'दावा छोड़ा',
        skippedNoticePlural: 'दावे छोड़े',
        skippedMsg: 'दावे तब छोड़े जाते हैं जब सत्यापन परतें विफल होती हैं।',
        all: 'सभी', paid: 'भुगतान', skipped: 'छोड़े',
        severity: 'गंभीरता',
        verification: 'सत्यापन',
        payout: 'भुगतान',
        layers: '/5 परतें',
        viewTimeline: 'सत्यापन टाइमलाइन देखें',
        hideTimeline: 'टाइमलाइन छुपाएं',
        paidLabel: 'भुगतान',
        skippedLabel: 'छोड़ा',
        noClaims: 'अभी तक कोई दावा नहीं',
        noClaimsSub: 'आपके क्षेत्र में व्यवधान सत्यापित होने के बाद दावे यहां दिखाई देंगे।',
        noClaimsFiltered: 'इस फ़िल्टर से कोई दावा मेल नहीं खाता।',
    },
    ta: {
        brand: 'KavachPay', back: 'திரும்பு',
        title: 'என் கோரிக்கைகள்',
        totalClaims: 'மொத்த கோரிக்கைகள்',
        paidOut: 'செலுத்தப்பட்டவை',
        totalReceived: 'மொத்தம் பெற்றது',
        payoutHistory: 'பணம் வரலாறு',
        payoutHistorySub: 'ஒவ்வொரு கோரிக்கைக்கும் தொகை',
        skippedNotice: 'கோரிக்கை தவிர்க்கப்பட்டது',
        skippedNoticePlural: 'கோரிக்கைகள் தவிர்க்கப்பட்டன',
        skippedMsg: 'சரிபார்ப்பு அடுக்குகள் தோல்வியடையும்போது கோரிக்கைகள் தவிர்க்கப்படுகின்றன.',
        all: 'அனைத்தும்', paid: 'செலுத்தப்பட்டது', skipped: 'தவிர்க்கப்பட்டது',
        severity: 'தீவிரம்',
        verification: 'சரிபார்ப்பு',
        payout: 'பணம்',
        layers: '/5 அடுக்குகள்',
        viewTimeline: 'சரிபார்ப்பு காலவரிசை காண',
        hideTimeline: 'காலவரிசை மறை',
        paidLabel: 'செலுத்தப்பட்டது',
        skippedLabel: 'தவிர்க்கப்பட்டது',
        noClaims: 'இன்னும் கோரிக்கைகள் இல்லை',
        noClaimsSub: 'உங்கள் மண்டலத்தில் இடையூறு சரிபார்க்கப்பட்ட பிறகு கோரிக்கைகள் இங்கே தோன்றும்.',
        noClaimsFiltered: 'இந்த வடிகட்டியுடன் எந்த கோரிக்கையும் பொருந்தவில்லை.',
    }
};

const LangToggle = ({ lang, setLang }) => (
    <div style={{ display: 'flex', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 20, padding: 3, gap: 2 }}>
        {[{ code: 'en', label: 'EN' }, { code: 'hi', label: 'हि' }, { code: 'ta', label: 'த' }].map(l => (
            <button key={l.code} onClick={() => setLang(l.code)}
                style={{ backgroundColor: lang === l.code ? 'white' : 'transparent', color: lang === l.code ? C.navy : 'white', border: 'none', padding: '5px 10px', borderRadius: 16, cursor: 'pointer', fontSize: 11, fontWeight: 700 }}>
                {l.label}
            </button>
        ))}
    </div>
);

export default function Claims({ worker, onBack, lang: propLang, setLang: propSetLang }) {
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const lC = isDark ? {
        ...C,
        bg: '#0F172A',
        cardBg: '#1E293B',
        cardBorder: '#334155',
        text: '#F8FAFC',
        textSec: '#E2E8F0',
        textMuted: '#94A3B8',
        accent: '#38BDF8',
        accentLight: '#1E293B',
        accentBorder: '#334155',
        green: '#34D399',
        greenLight: '#064E3B',
        greenBorder: '#065F46',
        success: '#34D399',
        red: '#F87171',
        redLight: '#450A0A',
        redBorder: '#7F1D1D',
        orange: '#F59E0B',
        orangeLight: '#451A03',
        orangeBorder: '#78350F',
        navy: '#38BDF8',
        blue: '#60A5FA',
        blueLight: '#1E3A8A',
        blueBorder: '#1E40AF',
        cardShadow: 'none'
    } : {
        ...C,
        success: C.green,
        blue: '#2563EB',
        blueLight: '#EFF6FF',
        blueBorder: '#DBEAFE',
    };

    const [lang, setLang] = useState(propLang || 'en');
    const t = T[lang] || T.en;
    const [claims, setClaims] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            const data = await api.getClaims(worker.uid);
            if (data && data.claims) setClaims(data.claims);
            setLoading(false);
        };
        if (worker?.uid) load();
    }, [worker?.uid]);

    const [filter, setFilter] = useState('all');
    const [expandedClaim, setExpandedClaim] = useState(null);

    if (loading) return <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', backgroundColor: lC.bg }}><p style={{ color: lC.text }}>Loading claims...</p></div>;

    const filtered = filter === 'all' ? claims : claims.filter(c => c.status === filter);
    const totalPaid = claims.filter(c => c.status === 'paid').reduce((a, b) => a + b.payout, 0);
    const paidCount = claims.filter(c => c.status === 'paid').length;
    const skippedCount = claims.filter(c => c.status === 'skipped').length;

    const chartData = claims
        .filter(c => c.status === 'paid')
        .map(c => ({ name: c.id.replace('CLM-', '#'), amount: c.payout }));

    const getSeverityColors = (s) => ({
        color: s === 'Severe' ? lC.red : s === 'Moderate' ? lC.orange : lC.green,
        bg: s === 'Severe' ? lC.redLight : s === 'Moderate' ? lC.orangeLight : lC.greenLight,
        border: s === 'Severe' ? lC.redBorder : s === 'Moderate' ? lC.orangeBorder : lC.greenBorder,
    });

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload?.length) return (
            <div style={{ backgroundColor: lC.cardBg, border: `1px solid ${lC.cardBorder}`, borderRadius: 10, padding: '10px 14px', boxShadow: lC.cardShadow }}>
                <p style={{ color: lC.textMuted, fontSize: 12, marginBottom: 4 }}>{label}</p>
                <p style={{ color: lC.navy, fontSize: 13, fontWeight: 700 }}>₹{payload[0].value}</p>
            </div>
        );
        return null;
    };

    return (
        <div style={{ backgroundColor: lC.bg, minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>

            {/* Navbar */}
            <div style={{ background: 'linear-gradient(135deg, #08101F 0%, #0D1829 100%)', padding: '0 24px', height: 62, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <KavachLogo size={28} light />
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <LangToggle lang={lang} setLang={setLang} />
                    <button onClick={onBack} style={{ backgroundColor: 'transparent', color: 'rgba(255,255,255,0.65)', border: '1px solid rgba(255,255,255,0.15)', padding: '6px 14px', borderRadius: 7, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>{t.back}</button>
                </div>
            </div>

            <div style={{ padding: '20px 16px', maxWidth: 520, margin: '0 auto' }}>
                <p style={{ color: lC.text, fontSize: 20, fontWeight: 800, marginBottom: 16 }}>{t.title}</p>

                {/* Summary Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 16 }}>
                    {[
                        { label: t.totalClaims, value: claims.length, color: lC.accent, bg: lC.accentLight, border: lC.accentBorder },
                        { label: t.paidOut, value: paidCount, color: lC.success, bg: lC.greenLight, border: lC.greenBorder },
                        { label: t.totalReceived, value: '₹' + totalPaid, color: lC.blue, bg: lC.blueLight, border: lC.blueBorder },
                    ].map((s, i) => (
                        <div key={i} style={{ backgroundColor: s.bg, borderRadius: 10, padding: 14, textAlign: 'center', border: `1px solid ${s.border}` }}>
                            <p style={{ color: s.color, fontWeight: 800, fontSize: 18 }}>{s.value}</p>
                            <p style={{ color: lC.textMuted, fontSize: 11, marginTop: 4, lineHeight: 1.3 }}>{s.label}</p>
                        </div>
                    ))}
                </div>

                {/* Chart */}
                {chartData.length > 0 ? (
                    <div style={{ backgroundColor: lC.cardBg, borderRadius: 12, padding: '18px 20px', marginBottom: 14, boxShadow: isDark ? 'none' : C.cardShadow, border: `1px solid ${lC.cardBorder}` }}>
                        <p style={{ color: lC.text, fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{t.payoutHistory}</p>
                        <p style={{ color: lC.textMuted, fontSize: 12, marginBottom: 16 }}>{t.payoutHistorySub}</p>
                        <ResponsiveContainer width="100%" height={140}>
                            <BarChart data={chartData}>
                                <XAxis dataKey="name" tick={{ fontSize: 11, fill: lC.textMuted }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 10, fill: lC.textMuted }} axisLine={false} tickLine={false} />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar dataKey="amount" fill={lC.accent} radius={[4, 4, 0, 0]} name="Payout" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                ) : (
                    <div style={{ backgroundColor: lC.cardBg, borderRadius: 12, padding: '40px 20px', marginBottom: 14, textAlign: 'center', border: `1px solid ${lC.cardBorder}` }}>
                        <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke={lC.cardBorder} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto 14px', display: 'block' }}>
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                            <polyline points="14 2 14 8 20 8" />
                        </svg>
                        <p style={{ color: lC.text, fontWeight: 700, fontSize: 14, marginBottom: 6 }}>{t.noClaims}</p>
                        <p style={{ color: lC.textMuted, fontSize: 13 }}>{t.noClaimsSub}</p>
                    </div>
                )}

                {/* Skipped Notice */}
                {skippedCount > 0 && (
                    <div style={{ backgroundColor: lC.orangeLight, borderRadius: 10, padding: '12px 16px', marginBottom: 14, border: `1px solid ${lC.orangeBorder}`, borderLeft: `4px solid ${lC.orange}` }}>
                        <p style={{ color: lC.orange, fontWeight: 600, fontSize: 13 }}>
                            {skippedCount} {skippedCount === 1 ? t.skippedNotice : t.skippedNoticePlural}
                        </p>
                        <p style={{ color: lC.orange, fontSize: 12, marginTop: 4, lineHeight: 1.5 }}>{t.skippedMsg}</p>
                    </div>
                )}

                {/* Filter Tabs */}
                <div style={{ display: 'flex', gap: 8, marginBottom: 16, overflowX: 'auto', paddingBottom: 4 }}>
                    {[
                        { key: 'all', label: t.all },
                        { key: 'paid', label: t.paid },
                        { key: 'pending', label: t.pending },
                        { key: 'skipped', label: t.skipped },
                    ].map(f => (
                        <button key={f.key} onClick={() => setFilter(f.key)}
                            style={{ padding: '7px 16px', borderRadius: 20, whiteSpace: 'nowrap', border: `1px solid ${filter === f.key ? lC.navy : lC.cardBorder}`, cursor: 'pointer', fontWeight: filter === f.key ? 700 : 500, fontSize: 13, backgroundColor: filter === f.key ? lC.navy : lC.cardBg, color: filter === f.key ? 'white' : lC.textMuted, fontFamily: 'Inter, sans-serif', transition: 'all 0.15s ease' }}>
                            {f.label}
                        </button>
                    ))}
                </div>

                {/* Empty filter state */}
                {filtered.length === 0 && (
                    <div style={{ backgroundColor: lC.cardBg, borderRadius: 12, padding: '28px 20px', textAlign: 'center', border: `1px solid ${lC.cardBorder}`, marginBottom: 12 }}>
                        <p style={{ color: lC.textMuted, fontSize: 14 }}>{t.noClaimsFiltered}</p>
                    </div>
                )}

                {/* Claims List */}
                {filtered.map((claim, i) => {
                    const sev = {
                        color: claim.severity === 'Severe' ? lC.red : claim.severity === 'Moderate' ? lC.orange : lC.success,
                        bg: claim.severity === 'Severe' ? lC.redLight : claim.severity === 'Moderate' ? lC.orangeLight : lC.greenLight,
                        border: claim.severity === 'Severe' ? lC.redBorder : claim.severity === 'Moderate' ? lC.orangeBorder : lC.greenBorder,
                    };
                    const isPaid = claim.status === 'paid';
                    const isExpanded = expandedClaim === i;

                    return (
                        <div key={i} style={{ backgroundColor: lC.cardBg, borderRadius: 12, padding: '16px 18px', marginBottom: 12, boxShadow: lC.cardShadow, border: `1px solid ${lC.cardBorder}`, borderLeft: `4px solid ${isPaid ? lC.green : (claim.status === 'pending' ? lC.blue : lC.orange)}` }}>
                            {/* Header */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', cursor: 'pointer' }} onClick={() => setExpandedClaim(isExpanded ? null : i)}>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                        <p style={{ color: lC.text, fontWeight: 700, fontSize: 14 }}>{claim.event}</p>
                                    </div>
                                    <p style={{ color: lC.textMuted, fontSize: 12 }}>{claim.date} · {claim.id}</p>
                                </div>
                                <div style={{ backgroundColor: isPaid ? lC.greenLight : (claim.status === 'pending' ? lC.blueLight : lC.orangeLight), padding: '4px 10px', borderRadius: 20, border: `1px solid ${isPaid ? lC.greenBorder : (claim.status === 'pending' ? lC.blueBorder : lC.orangeBorder)}` }}>
                                    <p style={{ color: isPaid ? lC.green : (claim.status === 'pending' ? lC.blue : lC.orange), fontWeight: 700, fontSize: 11 }}>
                                        {isPaid ? t.paidLabel : (claim.status === 'pending' ? t.pendingLabel : t.skippedLabel)}
                                    </p>
                                </div>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                        <div style={{ backgroundColor: lC.navy, borderRadius: 4, padding: '2px 7px' }}>
                                            <p style={{ color: 'white', fontSize: 9, fontWeight: 800, letterSpacing: 0.5 }}>{claim.code}</p>
                                        </div>
                                        <p style={{ color: lC.text, fontWeight: 700, fontSize: 14 }}>{claim.event}</p>
                                    </div>
                                    <p style={{ color: lC.textMuted, fontSize: 12 }}>{claim.date} · {claim.id}</p>
                                </div>
                            </div>

                                {/* Stats Row */}
                            <div style={{ display: 'flex', gap: 12, marginBottom: 12, flexWrap: 'wrap' }}>
                                <div style={{ flex: 1 }}>
                                    <p style={{ color: lC.textMuted, fontSize: 11, marginBottom: 4 }}>{t.severity}</p>
                                    <div style={{ backgroundColor: sev.bg, padding: '3px 10px', borderRadius: 6, border: `1px solid ${sev.border}`, display: 'inline-block' }}>
                                        <p style={{ color: sev.color, fontWeight: 700, fontSize: 12 }}>{claim.severity}</p>
                                    </div>
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                    <p style={{ color: lC.textMuted, fontSize: 11, marginBottom: 4 }}>{t.verification}</p>
                                    <p style={{ color: lC.navy, fontWeight: 700, fontSize: 14 }}>{claim.verificationLayers}{t.layers}</p>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <p style={{ color: lC.textMuted, fontSize: 11, marginBottom: 4 }}>{t.payout}</p>
                                    <p style={{ color: isPaid ? lC.green : lC.textMuted, fontWeight: 800, fontSize: 18 }}>
                                        {isPaid ? '₹' + claim.payout : '₹0'}
                                    </p>
                                </div>
                            </div>

                            {/* M2 Fraud Decision Badge */}
                            {claim.fraudDecision && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, padding: '7px 12px', borderRadius: 8, backgroundColor:
                                    claim.fraudDecision === 'auto_approve' ? lC.greenLight :
                                    claim.fraudDecision === 'manual_review' ? lC.orangeLight : lC.redLight,
                                    border: `1px solid ${
                                        claim.fraudDecision === 'auto_approve' ? lC.greenBorder :
                                        claim.fraudDecision === 'manual_review' ? lC.orangeBorder : lC.redBorder
                                    }`
                                }}>
                                    <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: 0.5,
                                        color: claim.fraudDecision === 'auto_approve' ? lC.green :
                                               claim.fraudDecision === 'manual_review' ? lC.orange : lC.red
                                    }}>V1 FRAUD</span>
                                    <p style={{ fontSize: 12, color: lC.textSec, flex: 1 }}>
                                        {claim.fraudDecision === 'auto_approve' ? 'Auto-verified' :
                                         claim.fraudDecision === 'manual_review' ? 'Pending check' : 'Flagged'}
                                        {' · '}<span style={{ fontWeight: 700 }}>{Math.round((claim.fraudProb || 0) * 100)}% risk</span>
                                    </p>
                                </div>
                            )}

                            {/* Transaction ID */}
                            {claim.txn && (
                                <p style={{ color: lC.textMuted, fontSize: 11, marginBottom: 10 }}>Txn: {claim.txn}</p>
                            )}

                            {/* Skip Reason */}
                            {claim.skipReason && (
                                <div style={{ backgroundColor: lC.orangeLight, borderRadius: 8, padding: '9px 12px', marginBottom: 10, border: `1px solid ${lC.orangeBorder}` }}>
                                    <p style={{ color: lC.orange, fontSize: 12 }}>{claim.skipReason}</p>
                                </div>
                            )}

                            {/* Timeline Toggle */}
                            <button onClick={() => setExpandedClaim(isExpanded ? null : i)}
                                style={{ width: '100%', backgroundColor: lC.bg, color: lC.navy, padding: '9px', borderRadius: 8, border: `1px solid ${lC.cardBorder}`, cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: 'Inter, sans-serif', transition: 'background-color 0.15s ease' }}
                                onMouseEnter={e => e.currentTarget.style.backgroundColor = '#E8F0FE'}
                                onMouseLeave={e => e.currentTarget.style.backgroundColor = lC.bg}>
                                {isExpanded ? t.hideTimeline : t.viewTimeline}
                            </button>

                            {/* Verification Timeline */}
                            {isExpanded && (
                                <div style={{ marginTop: 14 }}>
                                    {(claim.timeline || []).map((tl, j) => (
                                        <div key={j} style={{ display: 'flex', gap: 12, marginBottom: 10, alignItems: 'flex-start' }}>
                                            <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                                <div style={{ width: 22, height: 22, borderRadius: '50%', backgroundColor: tl.done ? lC.navy : lC.redLight, border: `2px solid ${tl.done ? lC.navy : lC.redBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                    {tl.done
                                                        ? <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                                                        : <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={lC.red} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                                                    }
                                                </div>
                                                {j < (claim.timeline || []).length - 1 && (
                                                    <div style={{ width: 2, height: 14, backgroundColor: tl.done ? lC.navy : lC.cardBorder, marginTop: 2, opacity: 0.3 }} />
                                                )}
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <p style={{ color: lC.textMuted, fontSize: 10, marginBottom: 2, fontWeight: 600 }}>{tl.time}</p>
                                                <p style={{ color: tl.done ? lC.text : lC.red, fontSize: 12, lineHeight: 1.5 }}>{tl.event}</p>
                                            </div>
                                        </div>
                                    ))}

                                    {/* M3 Income Loss Range */}
                                    {claim.incomeLossP50 > 0 && (
                                        <div style={{ marginTop: 12, padding: '10px 12px', backgroundColor: lC.blueLight, borderRadius: 8, border: `1px solid ${lC.blueBorder}` }}>
                                            <p style={{ color: lC.textMuted, fontSize: 10, fontWeight: 700, marginBottom: 6, letterSpacing: 0.5 }}>V2 INCOME LOSS ESTIMATE</p>
                                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                {[['P10', claim.incomeLossP10], ['Current Payout', claim.incomeLossP50], ['P90', claim.incomeLossP90]].map(([label, val]) => (
                                                    <div key={label} style={{ textAlign: 'center' }}>
                                                        <p style={{ color: lC.textMuted, fontSize: 10 }}>{label}</p>
                                                        <p style={{ color: lC.blue, fontWeight: 700, fontSize: 13 }}>₹{val}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* M7 Text Classification */}
                                    {claim.textPredictedCode && (
                                        <div style={{ marginTop: 8, padding: '9px 12px', borderRadius: 8, border: `1px solid ${claim.textManualReview ? lC.orangeBorder : lC.greenBorder}`, backgroundColor: claim.textManualReview ? lC.orangeLight : lC.greenLight }}>
                                            <p style={{ fontSize: 11, color: lC.textSec, lineHeight: 1.4 }}>
                                                <span style={{ fontWeight: 800, color: lC.text, fontSize: 10 }}>V3 AI VERIFY: </span>
                                                Trigger {claim.textPredictedCode} identified
                                                {' · '}<span style={{ color: claim.textManualReview ? lC.orange : lC.green, fontWeight: 700 }}>
                                                    {claim.textManualReview ? '⚠ Mismatch flagged' : '✓ Matches trigger'}
                                                </span>
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}