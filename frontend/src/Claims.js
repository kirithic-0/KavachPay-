import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useTheme } from './App';

const T = {
    en: {
        brand: 'KavachPay', back: 'Back',
        title: 'My Claims',
        totalClaims: 'Total Claims', paidOut: 'Paid Out', totalReceived: 'Total Received',
        payoutHistory: 'Payout History', payoutHistorySub: 'Amount received per approved claim',
        skippedNotice: 'claim skipped', skippedNoticePlural: 'claims skipped',
        skippedMsg: 'Claims are skipped when verification detects active deliveries or zone-wide inactivity threshold not met.',
        all: 'All', paid: 'Paid', skipped: 'Skipped',
        severity: 'Severity', verification: 'Verification', payout: 'Payout',
        layers: '/5 layers',
        viewTimeline: 'View Verification Timeline',
        hideTimeline: 'Hide Timeline',
        paidLabel: 'PAID', skippedLabel: 'SKIPPED',
        noClaims: 'No claims yet',
        noClaimsSub: 'Your claims will appear here after a disruption is verified in your zone.',
        noClaimsFiltered: 'No claims match this filter.',
    },
    hi: {
        brand: 'KavachPay', back: 'वापस',
        title: 'मेरे दावे',
        totalClaims: 'कुल दावे', paidOut: 'भुगतान किए', totalReceived: 'कुल प्राप्त',
        payoutHistory: 'भुगतान इतिहास', payoutHistorySub: 'प्रत्येक स्वीकृत दावे के लिए राशि',
        skippedNotice: 'दावा छोड़ा', skippedNoticePlural: 'दावे छोड़े',
        skippedMsg: 'दावे तब छोड़े जाते हैं जब सत्यापन व्यवधान के दौरान सक्रिय डिलीवरी का पता लगाता है।',
        all: 'सभी', paid: 'भुगतान', skipped: 'छोड़े',
        severity: 'गंभीरता', verification: 'सत्यापन', payout: 'भुगतान',
        layers: '/5 परतें',
        viewTimeline: 'सत्यापन टाइमलाइन देखें',
        hideTimeline: 'टाइमलाइन छुपाएं',
        paidLabel: 'भुगतान', skippedLabel: 'छोड़ा',
        noClaims: 'अभी तक कोई दावा नहीं',
        noClaimsSub: 'आपके क्षेत्र में व्यवधान सत्यापित होने के बाद आपके दावे यहां दिखाई देंगे।',
        noClaimsFiltered: 'इस फ़िल्टर से कोई दावा मेल नहीं खाता।',
    },
    ta: {
        brand: 'KavachPay', back: 'திரும்பு',
        title: 'என் கோரிக்கைகள்',
        totalClaims: 'மொத்த கோரிக்கைகள்', paidOut: 'செலுத்தப்பட்டவை', totalReceived: 'மொத்தம் பெற்றது',
        payoutHistory: 'பணம் வரலாறு', payoutHistorySub: 'ஒவ்வொரு அங்கீகரிக்கப்பட்ட கோரிக்கைக்கும் தொகை',
        skippedNotice: 'கோரிக்கை தவிர்க்கப்பட்டது', skippedNoticePlural: 'கோரிக்கைகள் தவிர்க்கப்பட்டன',
        skippedMsg: 'இடையூறின் போது செயலில் உள்ள டெலிவரிகள் கண்டறியப்படும்போது கோரிக்கைகள் தவிர்க்கப்படுகின்றன.',
        all: 'அனைத்தும்', paid: 'செலுத்தப்பட்டது', skipped: 'தவிர்க்கப்பட்டது',
        severity: 'தீவிரம்', verification: 'சரிபார்ப்பு', payout: 'பணம்',
        layers: '/5 அடுக்குகள்',
        viewTimeline: 'சரிபார்ப்பு காலவரிசை காண',
        hideTimeline: 'காலவரிசை மறை',
        paidLabel: 'செலுத்தப்பட்டது', skippedLabel: 'தவிர்க்கப்பட்டது',
        noClaims: 'இன்னும் கோரிக்கைகள் இல்லை',
        noClaimsSub: 'உங்கள் மண்டலத்தில் இடையூறு சரிபார்க்கப்பட்ட பிறகு கோரிக்கைகள் இங்கே தோன்றும்.',
        noClaimsFiltered: 'இந்த வடிகட்டியுடன் எந்த கோரிக்கையும் பொருந்தவில்லை.',
    }
};

const LangToggle = ({ lang, setLang }) => (
    <div style={{ display: 'flex', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: '20px', padding: '3px', gap: '2px' }}>
        {[{ code: 'en', label: 'EN' }, { code: 'hi', label: 'हि' }, { code: 'ta', label: 'த' }].map(l => (
            <button key={l.code} onClick={() => setLang(l.code)}
                style={{ backgroundColor: lang === l.code ? 'white' : 'transparent', color: lang === l.code ? '#1A56A0' : 'white', border: 'none', padding: '5px 10px', borderRadius: '16px', cursor: 'pointer', fontSize: '11px', fontWeight: '700' }}>
                {l.label}
            </button>
        ))}
    </div>
);

export default function Claims({ worker, onBack, lang, setLang }) {
    const t = T[lang] || T.en;
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const bg = isDark ? '#0F1117' : '#F4F6F9';
    const cardBg = isDark ? '#1E2130' : 'white';
    const cardBorder = isDark ? '#2D3348' : '#E5E7EB';
    const textPrimary = isDark ? '#F1F5F9' : '#1A1A2E';
    const textMuted = isDark ? '#94A3B8' : '#6B7280';
    const navBg = isDark ? '#141720' : '#1A56A0';

    const coverage = worker?.coverage || 1200;
    const zone = worker?.zone || 'Koramangala, Bangalore';

    const [filter, setFilter] = useState('all');
    const [expandedClaim, setExpandedClaim] = useState(null);

    const claims = [
        {
            id: 'CLM-001', date: 'Mar 5, 2026', event: 'Heavy Rain (HRA) — 82mm',
            severity: 'Moderate', status: 'paid', payout: Math.round(coverage * 0.65),
            txn: 'pay_A3F9B2C1', zone, verificationLayers: 5, fraudFlags: 0,
            timeline: [
                { time: '2:14 PM', event: 'HRA trigger — 82mm rainfall detected by IMD in ' + zone.split(',')[0], done: true },
                { time: '2:14 PM', event: 'Layer 1 — Work Intent verified. Worker tapped Start My Day at 9:42 AM', done: true },
                { time: '2:15 PM', event: 'Layer 2 — Disruption confirmed by IMD API. Threshold: 50mm. Actual: 82mm', done: true },
                { time: '2:15 PM', event: 'Layer 3 — Zone correlation: 8 of 11 workers inactive (72%). Threshold: 60%', done: true },
                { time: '2:15 PM', event: 'Layer 4 — GPS inactivity confirmed. Worker stationary for 47 minutes', done: true },
                { time: '2:16 PM', event: 'Layer 5 — KavachScore 780. Trusted Worker tier. No fraud flags', done: true },
                { time: '2:16 PM', event: 'Payout approved — Moderate tier (65%) — ₹' + Math.round(coverage * 0.65), done: true },
                { time: '2:17 PM', event: 'UPI transfer complete — pay_A3F9B2C1 — ravi@upi', done: true },
            ]
        },
        {
            id: 'CLM-002', date: 'Feb 28, 2026', event: 'Severe AQI (SAQ) — Index 347',
            severity: 'Moderate', status: 'paid', payout: Math.round(coverage * 0.65),
            txn: 'pay_B4E8D3F2', zone, verificationLayers: 5, fraudFlags: 0,
            timeline: [
                { time: '10:32 AM', event: 'SAQ trigger — AQI 347 detected by CPCB in ' + zone.split(',')[0], done: true },
                { time: '10:32 AM', event: 'Layer 1 — Work Intent verified. Worker tapped Start My Day at 8:55 AM', done: true },
                { time: '10:33 AM', event: 'Layer 2 — Disruption confirmed by CPCB API. Threshold: 200. Actual: 347', done: true },
                { time: '10:33 AM', event: 'Layer 3 — Zone correlation: 7 of 11 workers inactive (64%). Threshold: 60%', done: true },
                { time: '10:34 AM', event: 'Layer 4 — GPS inactivity confirmed. Worker stationary for 62 minutes', done: true },
                { time: '10:34 AM', event: 'Layer 5 — KavachScore 775. Trusted Worker tier. No fraud flags', done: true },
                { time: '10:34 AM', event: 'Payout approved — Moderate tier (65%) — ₹' + Math.round(coverage * 0.65), done: true },
                { time: '10:35 AM', event: 'UPI transfer complete — pay_B4E8D3F2 — ravi@upi', done: true },
            ]
        },
        {
            id: 'CLM-003', date: 'Feb 10, 2026', event: 'Heavy Rain (HRA) — 91mm',
            severity: 'Moderate', status: 'skipped', payout: 0,
            txn: null, zone, verificationLayers: 2, fraudFlags: 1,
            skipReason: 'Layer 2 failed — Worker was active. 4 deliveries detected during disruption window (2:30 PM–4:00 PM)',
            timeline: [
                { time: '2:31 PM', event: 'HRA trigger — 91mm rainfall detected by IMD in ' + zone.split(',')[0], done: true },
                { time: '2:31 PM', event: 'Layer 1 — Work Intent verified. Worker tapped Start My Day at 10:12 AM', done: true },
                { time: '2:32 PM', event: 'Layer 2 FAILED — Worker active. 4 deliveries detected during disruption window', done: false },
                { time: '2:32 PM', event: 'Claim skipped. KavachScore reduced by 5 points. Fraud flag raised.', done: false },
            ]
        },
        {
            id: 'CLM-004', date: 'Jan 22, 2026', event: 'Flood Alert (FLD) — NDMA L3',
            severity: 'Severe', status: 'paid', payout: coverage,
            txn: 'pay_C5F1A4G3', zone, verificationLayers: 5, fraudFlags: 0,
            timeline: [
                { time: '9:10 AM', event: 'FLD trigger — NDMA Level 3 flood warning issued for ' + zone.split(',')[0], done: true },
                { time: '9:10 AM', event: 'Layer 1 — Work Intent verified. Worker tapped Start My Day at 8:30 AM', done: true },
                { time: '9:11 AM', event: 'Layer 2 — Flood confirmed by NDMA API. Level 3 alert active', done: true },
                { time: '9:11 AM', event: 'Layer 3 — Zone correlation: 10 of 12 workers inactive (83%). Threshold: 60%', done: true },
                { time: '9:12 AM', event: 'Layer 4 — GPS inactivity confirmed. Worker stationary for 2 hours 14 minutes', done: true },
                { time: '9:12 AM', event: 'Layer 5 — KavachScore 770. Trusted Worker tier. No fraud flags', done: true },
                { time: '9:12 AM', event: 'Payout approved — Severe tier (100%) — ₹' + coverage, done: true },
                { time: '9:13 AM', event: 'UPI transfer complete — pay_C5F1A4G3 — ravi@upi', done: true },
            ]
        },
        {
            id: 'CLM-005', date: 'Jan 8, 2026', event: 'Light Rain (LRA) — 58mm',
            severity: 'Minor', status: 'paid', payout: Math.round(coverage * 0.3),
            txn: 'pay_D6G2B5H4', zone, verificationLayers: 5, fraudFlags: 0,
            timeline: [
                { time: '1:20 PM', event: 'LRA trigger — 58mm rainfall detected by IMD in ' + zone.split(',')[0], done: true },
                { time: '1:21 PM', event: 'Layer 1 — Work Intent verified. Worker tapped Start My Day at 9:05 AM', done: true },
                { time: '1:21 PM', event: 'Layer 2 — Disruption confirmed by IMD API. Threshold: 25mm. Actual: 58mm', done: true },
                { time: '1:22 PM', event: 'Layer 3 — Zone correlation: 6 of 10 workers inactive (60%). At threshold', done: true },
                { time: '1:22 PM', event: 'Layer 4 — GPS inactivity confirmed. Worker stationary for 38 minutes', done: true },
                { time: '1:23 PM', event: 'Layer 5 — KavachScore 752. Trusted Worker tier. No fraud flags', done: true },
                { time: '1:23 PM', event: 'Payout approved — Minor tier (30%) — ₹' + Math.round(coverage * 0.3), done: true },
                { time: '1:24 PM', event: 'UPI transfer complete — pay_D6G2B5H4 — ravi@upi', done: true },
            ]
        },
        {
            id: 'CLM-006', date: 'Dec 18, 2025', event: 'Dense Fog (FOG) — Vis 30m',
            severity: 'Minor', status: 'paid', payout: Math.round(coverage * 0.3),
            txn: 'pay_E7H3C6I5', zone, verificationLayers: 5, fraudFlags: 0,
            timeline: [
                { time: '7:45 AM', event: 'FOG trigger — Visibility 30m detected in ' + zone.split(',')[0], done: true },
                { time: '7:45 AM', event: 'Layer 1 — Work Intent verified. Worker tapped Start My Day at 7:30 AM', done: true },
                { time: '7:46 AM', event: 'Layer 2 — Dense fog confirmed by IMD visibility data. Threshold: <50m', done: true },
                { time: '7:46 AM', event: 'Layer 3 — Zone correlation: 7 of 10 workers inactive (70%)', done: true },
                { time: '7:47 AM', event: 'Layer 4 — GPS inactivity confirmed. Worker stationary for 52 minutes', done: true },
                { time: '7:47 AM', event: 'Layer 5 — KavachScore 758. Trusted Worker tier. No fraud flags', done: true },
                { time: '7:48 AM', event: 'Payout approved — Minor tier (30%) — ₹' + Math.round(coverage * 0.3), done: true },
                { time: '7:49 AM', event: 'UPI transfer complete — pay_E7H3C6I5 — ravi@upi', done: true },
            ]
        },
    ];

    const filtered = filter === 'all' ? claims : claims.filter(c => c.status === filter);
    const totalPaid = claims.filter(c => c.status === 'paid').reduce((a, b) => a + b.payout, 0);
    const paidCount = claims.filter(c => c.status === 'paid').length;
    const skippedCount = claims.filter(c => c.status === 'skipped').length;

    const chartData = claims
        .filter(c => c.status === 'paid')
        .map(c => ({ name: c.id.replace('CLM-', '#'), amount: c.payout }));

    const getStatusColor = (s) => s === 'paid' ? '#1E7D34' : '#D97706';
    const getStatusBg = (s) => s === 'paid' ? (isDark ? '#0D2318' : '#F0FDF4') : (isDark ? '#2D2008' : '#FFFBEB');
    const getStatusBorder = (s) => s === 'paid' ? (isDark ? '#166534' : '#BBF7D0') : (isDark ? '#78350F' : '#FDE68A');
    const getStatusLabel = (s) => s === 'paid' ? t.paidLabel : t.skippedLabel;
    const getSeverityColor = (s) => s === 'Severe' ? '#C0392B' : s === 'Moderate' ? '#D97706' : '#1E7D34';
    const getSeverityBg = (s) => s === 'Severe' ? (isDark ? '#2D0F0F' : '#FEF2F2') : s === 'Moderate' ? (isDark ? '#2D2008' : '#FFFBEB') : (isDark ? '#0D2318' : '#F0FDF4');
    const getSeverityBorder = (s) => s === 'Severe' ? (isDark ? '#7F1D1D' : '#FECACA') : s === 'Moderate' ? (isDark ? '#78350F' : '#FDE68A') : (isDark ? '#166534' : '#BBF7D0');

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div style={{ backgroundColor: cardBg, border: `1px solid ${cardBorder}`, borderRadius: '10px', padding: '10px 14px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
                    <p style={{ color: textMuted, fontSize: '12px', marginBottom: '4px' }}>{label}</p>
                    <p style={{ color: '#1A56A0', fontSize: '13px', fontWeight: '700' }}>₹{payload[0].value}</p>
                </div>
            );
        }
        return null;
    };

    return (
        <div style={{ backgroundColor: bg, minHeight: '100vh', fontFamily: 'Inter', transition: 'background-color 0.2s ease' }}>

            {/* Navbar */}
            <div style={{ backgroundColor: navBg, padding: '14px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'background-color 0.2s ease' }}>
                <h1 style={{ color: 'white', fontSize: '18px', fontWeight: '800' }}>{t.brand}</h1>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <LangToggle lang={lang} setLang={setLang} />
                    <button onClick={onBack} style={{ backgroundColor: 'transparent', color: 'white', border: '1px solid rgba(255,255,255,0.3)', padding: '6px 14px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>{t.back}</button>
                </div>
            </div>

            <div style={{ padding: '20px 16px', maxWidth: '520px', margin: '0 auto' }}>
                <p style={{ color: textPrimary, fontSize: '20px', fontWeight: '800', marginBottom: '16px' }}>{t.title}</p>

                {/* Summary Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '16px' }}>
                    {[
                        { label: t.totalClaims, value: claims.length, color: '#1A56A0', bg: isDark ? '#1E2D4A' : '#EEF4FF', border: isDark ? '#2D4070' : '#DBEAFE' },
                        { label: t.paidOut, value: paidCount, color: '#1E7D34', bg: isDark ? '#0D2318' : '#F0FDF4', border: isDark ? '#166534' : '#BBF7D0' },
                        { label: t.totalReceived, value: '₹' + totalPaid, color: '#1A56A0', bg: isDark ? '#1E2D4A' : '#EEF4FF', border: isDark ? '#2D4070' : '#DBEAFE' },
                    ].map((s, i) => (
                        <div key={i} style={{ backgroundColor: s.bg, borderRadius: '12px', padding: '14px', textAlign: 'center', border: `1px solid ${s.border}` }}>
                            <p style={{ color: s.color, fontWeight: '800', fontSize: '18px' }}>{s.value}</p>
                            <p style={{ color: textMuted, fontSize: '11px', marginTop: '4px' }}>{s.label}</p>
                        </div>
                    ))}
                </div>

                {/* Chart */}
                {chartData.length > 0 ? (
                    <div style={{ backgroundColor: cardBg, borderRadius: '14px', padding: '20px', marginBottom: '14px', boxShadow: isDark ? '0 1px 4px rgba(0,0,0,0.3)' : '0 1px 4px rgba(0,0,0,0.05)', border: `1px solid ${cardBorder}` }}>
                        <p style={{ color: textPrimary, fontWeight: '700', fontSize: '14px', marginBottom: '4px' }}>{t.payoutHistory}</p>
                        <p style={{ color: textMuted, fontSize: '12px', marginBottom: '16px' }}>{t.payoutHistorySub}</p>
                        <ResponsiveContainer width="100%" height={150}>
                            <BarChart data={chartData}>
                                <XAxis dataKey="name" tick={{ fontSize: 11, fill: textMuted }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 10, fill: textMuted }} axisLine={false} tickLine={false} />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar dataKey="amount" fill="#1A56A0" radius={[4, 4, 0, 0]} name="Payout" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                ) : (
                    <div style={{ backgroundColor: cardBg, borderRadius: '14px', padding: '40px 20px', marginBottom: '14px', textAlign: 'center', border: `1px solid ${cardBorder}` }}>
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={textMuted} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto 16px', display: 'block' }}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
                        <p style={{ color: textPrimary, fontWeight: '700', fontSize: '15px', marginBottom: '6px' }}>{t.noClaims}</p>
                        <p style={{ color: textMuted, fontSize: '13px' }}>{t.noClaimsSub}</p>
                    </div>
                )}

                {/* Skipped Notice */}
                {skippedCount > 0 && (
                    <div style={{ backgroundColor: isDark ? '#2D2008' : '#FFFBEB', borderRadius: '12px', padding: '13px 16px', marginBottom: '14px', border: `1px solid ${isDark ? '#78350F' : '#FDE68A'}`, borderLeft: '4px solid #D97706' }}>
                        <p style={{ color: isDark ? '#FCD34D' : '#92400E', fontWeight: '600', fontSize: '13px' }}>
                            {skippedCount} {skippedCount === 1 ? t.skippedNotice : t.skippedNoticePlural}
                        </p>
                        <p style={{ color: isDark ? '#FCD34D' : '#92400E', fontSize: '12px', marginTop: '4px' }}>{t.skippedMsg}</p>
                    </div>
                )}

                {/* Filter Tabs */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                    {[
                        { key: 'all', label: t.all },
                        { key: 'paid', label: t.paid },
                        { key: 'skipped', label: t.skipped },
                    ].map(f => (
                        <button key={f.key} onClick={() => setFilter(f.key)}
                            style={{ padding: '7px 16px', borderRadius: '20px', border: `1px solid ${cardBorder}`, cursor: 'pointer', fontWeight: filter === f.key ? '700' : '500', fontSize: '13px', backgroundColor: filter === f.key ? '#1A56A0' : cardBg, color: filter === f.key ? 'white' : textMuted, fontFamily: 'Inter', transition: 'all 0.2s ease' }}>
                            {f.label}
                        </button>
                    ))}
                </div>

                {/* Empty filtered state */}
                {filtered.length === 0 && (
                    <div style={{ backgroundColor: cardBg, borderRadius: '14px', padding: '32px 20px', textAlign: 'center', border: `1px solid ${cardBorder}`, marginBottom: '12px' }}>
                        <p style={{ color: textMuted, fontSize: '14px' }}>{t.noClaimsFiltered}</p>
                    </div>
                )}

                {/* Claims List */}
                {filtered.map((claim, i) => (
                    <div key={i} style={{ backgroundColor: cardBg, borderRadius: '14px', padding: '16px', marginBottom: '12px', boxShadow: isDark ? '0 1px 4px rgba(0,0,0,0.3)' : '0 1px 4px rgba(0,0,0,0.05)', border: `1px solid ${cardBorder}`, borderLeft: `4px solid ${getStatusColor(claim.status)}` }}>

                        {/* Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                            <div>
                                <p style={{ color: textPrimary, fontWeight: '700', fontSize: '14px' }}>{claim.event}</p>
                                <p style={{ color: textMuted, fontSize: '12px', marginTop: '2px' }}>{claim.date} • {claim.id}</p>
                            </div>
                            <div style={{ backgroundColor: getStatusBg(claim.status), padding: '4px 10px', borderRadius: '20px', border: `1px solid ${getStatusBorder(claim.status)}` }}>
                                <p style={{ color: getStatusColor(claim.status), fontWeight: '700', fontSize: '11px', letterSpacing: '0.3px' }}>
                                    {getStatusLabel(claim.status)}
                                </p>
                            </div>
                        </div>

                        {/* Stats Row */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                            <div>
                                <p style={{ color: textMuted, fontSize: '11px', marginBottom: '4px' }}>{t.severity}</p>
                                <div style={{ backgroundColor: getSeverityBg(claim.severity), padding: '3px 10px', borderRadius: '8px', border: `1px solid ${getSeverityBorder(claim.severity)}`, display: 'inline-block' }}>
                                    <p style={{ color: getSeverityColor(claim.severity), fontWeight: '700', fontSize: '12px' }}>{claim.severity}</p>
                                </div>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <p style={{ color: textMuted, fontSize: '11px', marginBottom: '4px' }}>{t.verification}</p>
                                <p style={{ color: '#1A56A0', fontWeight: '700', fontSize: '14px' }}>{claim.verificationLayers}{t.layers}</p>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <p style={{ color: textMuted, fontSize: '11px', marginBottom: '4px' }}>{t.payout}</p>
                                <p style={{ color: claim.status === 'paid' ? '#1E7D34' : textMuted, fontWeight: '800', fontSize: '18px' }}>
                                    {claim.status === 'paid' ? '₹' + claim.payout : '₹0'}
                                </p>
                            </div>
                        </div>

                        {/* Transaction ID */}
                        {claim.txn && (
                            <p style={{ color: textMuted, fontSize: '11px', marginBottom: '10px', opacity: 0.7 }}>
                                Txn: {claim.txn}
                            </p>
                        )}

                        {/* Skip Reason */}
                        {claim.skipReason && (
                            <div style={{ backgroundColor: isDark ? '#2D2008' : '#FFFBEB', borderRadius: '8px', padding: '9px 12px', marginBottom: '10px', border: `1px solid ${isDark ? '#78350F' : '#FDE68A'}` }}>
                                <p style={{ color: isDark ? '#FCD34D' : '#92400E', fontSize: '12px' }}>{claim.skipReason}</p>
                            </div>
                        )}

                        {/* Timeline Toggle */}
                        <button onClick={() => setExpandedClaim(expandedClaim === i ? null : i)}
                            style={{ width: '100%', backgroundColor: isDark ? '#252A3A' : '#F9FAFB', color: '#1A56A0', padding: '9px', borderRadius: '8px', border: `1px solid ${cardBorder}`, cursor: 'pointer', fontSize: '13px', fontWeight: '600', fontFamily: 'Inter' }}>
                            {expandedClaim === i ? t.hideTimeline : t.viewTimeline}
                        </button>

                        {/* Timeline */}
                        {expandedClaim === i && (
                            <div style={{ marginTop: '14px' }}>
                                {claim.timeline.map((tl, j) => (
                                    <div key={j} style={{ display: 'flex', gap: '12px', marginBottom: '10px', alignItems: 'flex-start' }}>
                                        <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                            <div style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: tl.done ? '#1A56A0' : (isDark ? '#2D0F0F' : '#FEF2F2'), border: `2px solid ${tl.done ? '#1A56A0' : (isDark ? '#7F1D1D' : '#FECACA')}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                {tl.done
                                                    ? <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                                                    : <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={isDark ? '#F87171' : '#C0392B'} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                                                }
                                            </div>
                                            {j < claim.timeline.length - 1 && (
                                                <div style={{ width: '2px', height: '16px', backgroundColor: tl.done ? '#1A56A0' : cardBorder, marginTop: '2px', opacity: 0.4 }} />
                                            )}
                                        </div>
                                        <div style={{ flex: 1, paddingBottom: '4px' }}>
                                            <p style={{ color: textMuted, fontSize: '10px', marginBottom: '2px', fontWeight: '600' }}>{tl.time}</p>
                                            <p style={{ color: tl.done ? textPrimary : (isDark ? '#F87171' : '#C0392B'), fontSize: '12px', lineHeight: 1.5 }}>{tl.event}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}