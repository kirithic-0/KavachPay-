import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts';
import Policy from './Policy';
import Claims from './Claims';
import Chatbot from './Chatbot';

export default function Dashboard({ worker, onLogout }) {
    const [page, setPage] = useState('dashboard');
    const [tab, setTab] = useState('home');
    const [showChat, setShowChat] = useState(false);

    const name = worker?.name || 'Ravi Kumar';
    const zone = worker?.zone || 'Koramangala, Bangalore';
    const premium = worker?.premium || 59;
    const coverage = worker?.coverage || 1200;
    const avgIncome = worker?.avgIncome || 1800;
    const platform = worker?.platform || 'Swiggy';
    const employeeId = worker?.employeeId || 'SWG-2847361';

    const earnedSoFar = Math.round(avgIncome * 0.65);
    const remainingCoverage = Math.max(0, avgIncome - earnedSoFar);
    const earningsPercent = Math.round((earnedSoFar / avgIncome) * 100);

    const [score, setScore] = useState(780);
    const getScoreColor = () => score >= 750 ? '#1E7D34' : score >= 500 ? '#D97706' : '#C0392B';
    const getScoreTier = () => score >= 750 ? 'Trusted Worker' : score >= 500 ? 'Standard Worker' : 'Under Review';
    const getScoreDesc = () => score >= 750 ? 'Instant payouts enabled • Lowest premium tier' : score >= 500 ? '2hr payout delay • +15% premium applied' : '24hr delay • Manual review required';

    const earningsData = [
        { week: 'W1', earned: Math.round(avgIncome * 0.72), coverage: coverage },
        { week: 'W2', earned: Math.round(avgIncome * 0.88), coverage: coverage },
        { week: 'W3', earned: Math.round(avgIncome * 0.45), coverage: coverage },
        { week: 'W4', earned: Math.round(avgIncome * 0.91), coverage: coverage },
        { week: 'W5', earned: Math.round(avgIncome * 0.60), coverage: coverage },
        { week: 'W6', earned: earnedSoFar, coverage: coverage },
    ];

    const scoreHistory = [
        { date: 'Jan 8', score: 750, event: 'Starting score' },
        { date: 'Jan 22', score: 760, event: 'Legitimate claim verified' },
        { date: 'Feb 5', score: 770, event: 'Consistent activity bonus' },
        { date: 'Feb 14', score: 755, event: 'Missed declaration' },
        { date: 'Feb 28', score: 770, event: 'Legitimate claim verified' },
        { date: 'Mar 5', score: 780, event: 'Longest active streak' },
    ];

    const disruptionHistory = [
        { date: 'Mar 5, 2026', event: 'Heavy Rain — 82mm', severity: 'Moderate', wouldPay: Math.round(coverage * 0.65), paid: true, txn: 'pay_a3f9b2c1' },
        { date: 'Feb 28, 2026', event: 'AQI Alert — 347', severity: 'Moderate', wouldPay: Math.round(coverage * 0.65), paid: true, txn: 'pay_b4e8d3f2' },
        { date: 'Feb 14, 2026', event: 'Severe Storm — 94kmh', severity: 'Severe', wouldPay: coverage, paid: false, txn: null },
        { date: 'Jan 30, 2026', event: 'Heavy Rain — 61mm', severity: 'Minor', wouldPay: Math.round(coverage * 0.3), paid: false, txn: null },
        { date: 'Jan 18, 2026', event: 'Flood Alert — NDMA', severity: 'Severe', wouldPay: coverage, paid: false, txn: null },
    ];

    const totalReceived = disruptionHistory.filter(d => d.paid).reduce((a, b) => a + b.wouldPay, 0);
    const totalMissed = disruptionHistory.filter(d => !d.paid).reduce((a, b) => a + b.wouldPay, 0);

    const notifications = [
        { icon: '💸', title: 'Payout Received', msg: '₹' + Math.round(coverage * 0.65) + ' credited for Heavy Rain on Mar 5', time: '2 hours ago', read: false, color: '#1E7D34', border: '#BBF7D0', bg: '#F0FDF4' },
        { icon: '🌧️', title: 'Disruption Alert', msg: 'Rain forecast in ' + zone.split(',')[0] + ' tomorrow. Your coverage is active.', time: '5 hours ago', read: false, color: '#1A56A0', border: '#DBEAFE', bg: '#EEF4FF' },
        { icon: '🏆', title: 'KavachScore Updated', msg: 'Your score increased to 780 — longest active streak bonus applied', time: 'Yesterday', read: true, color: '#D97706', border: '#FDE68A', bg: '#FFFBEB' },
        { icon: '🔄', title: 'Policy Renewed', msg: 'Weekly policy renewed automatically — ₹' + premium + ' charged', time: '3 days ago', read: true, color: '#6B7280', border: '#E5E7EB', bg: '#F9FAFB' },
        { icon: '💸', title: 'Payout Received', msg: '₹' + Math.round(coverage * 0.65) + ' credited for AQI Alert on Feb 28', time: '1 week ago', read: true, color: '#1E7D34', border: '#BBF7D0', bg: '#F0FDF4' },
    ];

    const unreadCount = notifications.filter(n => !n.read).length;

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div style={{ backgroundColor: 'white', border: '1px solid #E5E7EB', borderRadius: '10px', padding: '10px 14px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
                    <p style={{ color: '#6B7280', fontSize: '12px', marginBottom: '6px', fontWeight: 'bold' }}>{label}</p>
                    {payload.map((p, i) => (
                        <p key={i} style={{ color: p.color, fontSize: '13px', fontWeight: 'bold' }}>
                            {p.name}: ₹{p.value.toLocaleString()}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    if (page === 'policy') return <Policy worker={worker} onBack={() => setPage('dashboard')} />;
    if (page === 'claims') return <Claims worker={worker} onBack={() => setPage('dashboard')} />;

    return (
        <div style={{ backgroundColor: '#F4F6F9', minHeight: '100vh', fontFamily: 'Arial', paddingBottom: '80px' }}>

            {/* Navbar */}
            <div style={{ backgroundColor: '#1A56A0', padding: '14px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1 style={{ color: 'white', fontSize: '18px', fontWeight: 'bold', letterSpacing: '0.3px' }}>KavachPay</h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '13px' }}>Hello, {name.split(' ')[0]}</p>
                    <button onClick={onLogout}
                        style={{ backgroundColor: 'transparent', color: 'white', border: '1px solid rgba(255,255,255,0.3)', padding: '6px 14px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px' }}>
                        Logout
                    </button>
                </div>
            </div>

            {/* Alert Banner */}
            <div style={{ backgroundColor: '#FFFBEB', borderLeft: '4px solid #D97706', padding: '11px 24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#D97706', flexShrink: 0 }} />
                <p style={{ color: '#92400E', fontSize: '13px', fontWeight: '600' }}>
                    Rain alert in your zone — Coverage is active and monitoring automatically.
                </p>
            </div>

            {/* Tab Bar */}
            <div style={{ backgroundColor: 'white', display: 'flex', borderBottom: '1px solid #E5E7EB', overflowX: 'auto' }}>
                {[
                    { key: 'home', label: 'Home' },
                    { key: 'earnings', label: 'Earnings' },
                    { key: 'score', label: 'KavachScore' },
                    { key: 'notifications', label: `Alerts${unreadCount > 0 ? ' (' + unreadCount + ')' : ''}` },
                ].map(t => (
                    <button key={t.key} onClick={() => setTab(t.key)}
                        style={{ padding: '14px 20px', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', fontWeight: tab === t.key ? '700' : '400', color: tab === t.key ? '#1A56A0' : '#6B7280', borderBottom: tab === t.key ? '2px solid #1A56A0' : '2px solid transparent', fontSize: '13px', whiteSpace: 'nowrap', letterSpacing: '0.2px' }}>
                        {t.label}
                    </button>
                ))}
            </div>

            <div style={{ padding: '18px 16px', maxWidth: '520px', margin: '0 auto' }}>

                {/* HOME TAB */}
                {tab === 'home' && (
                    <div>
                        {/* Policy Card */}
                        <div style={{ background: 'linear-gradient(135deg, #1A56A0, #0D3B73)', borderRadius: '18px', padding: '22px', marginBottom: '14px', color: 'white', boxShadow: '0 4px 20px rgba(26,86,160,0.25)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '18px' }}>
                                <div>
                                    <p style={{ opacity: 0.7, fontSize: '11px', letterSpacing: '0.8px', textTransform: 'uppercase' }}>Active Policy</p>
                                    <p style={{ fontWeight: 'bold', fontSize: '18px', marginTop: '4px' }}>{name}</p>
                                    <p style={{ opacity: 0.65, fontSize: '12px', marginTop: '3px' }}>{platform} • {zone.split(',')[0]}</p>
                                </div>
                                <div style={{ backgroundColor: 'rgba(30,125,52,0.9)', padding: '4px 12px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.2)' }}>
                                    <p style={{ fontSize: '11px', fontWeight: 'bold', letterSpacing: '0.5px' }}>ACTIVE</p>
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                                {[
                                    { label: 'Weekly Coverage', value: '₹' + coverage },
                                    { label: 'Premium', value: '₹' + premium + '/wk' },
                                    { label: 'Last Payout', value: '₹' + Math.round(coverage * 0.65) },
                                ].map((s, i) => (
                                    <div key={i} style={{ backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '10px', padding: '10px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.08)' }}>
                                        <p style={{ fontWeight: 'bold', fontSize: '15px' }}>{s.value}</p>
                                        <p style={{ opacity: 0.65, fontSize: '10px', marginTop: '3px', letterSpacing: '0.2px' }}>{s.label}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Earnings Protection Meter */}
                        <div style={{ backgroundColor: 'white', borderRadius: '14px', padding: '18px', marginBottom: '12px', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', border: '1px solid #E5E7EB' }}>
                            <p style={{ color: '#374151', fontWeight: 'bold', fontSize: '14px', marginBottom: '3px' }}>Earnings Protection</p>
                            <p style={{ color: '#9CA3AF', fontSize: '12px', marginBottom: '14px' }}>This week's income vs your weekly average</p>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <p style={{ color: '#6B7280', fontSize: '13px' }}>Earned so far</p>
                                <p style={{ color: '#1A56A0', fontWeight: 'bold', fontSize: '13px' }}>₹{earnedSoFar} / ₹{avgIncome}</p>
                            </div>
                            <div style={{ backgroundColor: '#F3F4F6', borderRadius: '8px', height: '10px', overflow: 'hidden', marginBottom: '10px' }}>
                                <div style={{ width: `${earningsPercent}%`, height: '100%', backgroundColor: earningsPercent >= 80 ? '#1E7D34' : earningsPercent >= 50 ? '#D97706' : '#C0392B', borderRadius: '8px', transition: 'width 0.5s' }} />
                            </div>
                            <div style={{ backgroundColor: '#EEF4FF', borderRadius: '10px', padding: '10px 12px', border: '1px solid #DBEAFE' }}>
                                <p style={{ color: '#1A56A0', fontSize: '13px', fontWeight: '600' }}>
                                    KavachPay covers ₹{remainingCoverage} if disruption hits today
                                </p>
                            </div>
                        </div>

                        {/* Disruption History */}
                        <div style={{ backgroundColor: 'white', borderRadius: '14px', padding: '18px', marginBottom: '12px', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', border: '1px solid #E5E7EB' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                                <p style={{ color: '#374151', fontWeight: 'bold', fontSize: '14px' }}>Disruption History</p>
                                <p style={{ color: '#C0392B', fontSize: '12px', fontWeight: '600' }}>Missed: ₹{totalMissed}</p>
                            </div>
                            {disruptionHistory.map((d, i) => (
                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', borderRadius: '10px', marginBottom: '6px', backgroundColor: d.paid ? '#F0FDF4' : '#F9FAFB', border: `1px solid ${d.paid ? '#BBF7D0' : '#F3F4F6'}` }}>
                                    <div>
                                        <p style={{ color: '#374151', fontWeight: '600', fontSize: '13px' }}>{d.event}</p>
                                        <p style={{ color: '#9CA3AF', fontSize: '11px', marginTop: '2px' }}>{d.date} • {d.severity}</p>
                                        {d.txn && <p style={{ color: '#D1D5DB', fontSize: '10px', marginTop: '2px' }}>Txn: {d.txn}</p>}
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <p style={{ color: d.paid ? '#1E7D34' : '#C0392B', fontWeight: 'bold', fontSize: '14px' }}>
                                            {d.paid ? '+₹' + d.wouldPay : '-₹' + d.wouldPay}
                                        </p>
                                        <p style={{ color: '#9CA3AF', fontSize: '11px', marginTop: '2px' }}>
                                            {d.paid ? 'Paid' : 'Not enrolled'}
                                        </p>
                                    </div>
                                </div>
                            ))}
                            <div style={{ backgroundColor: '#FFFBEB', borderRadius: '10px', padding: '10px 12px', marginTop: '8px', border: '1px solid #FDE68A' }}>
                                <p style={{ color: '#92400E', fontSize: '12px', fontWeight: '600' }}>
                                    You received ₹{totalReceived} in payouts. Stay enrolled every week to never miss a payout.
                                </p>
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                            <button onClick={() => setPage('policy')}
                                style={{ backgroundColor: 'white', color: '#1A56A0', padding: '16px', borderRadius: '12px', border: '1.5px solid #DBEAFE', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px', letterSpacing: '0.2px' }}>
                                My Policy
                            </button>
                            <button onClick={() => setPage('claims')}
                                style={{ backgroundColor: 'white', color: '#1A56A0', padding: '16px', borderRadius: '12px', border: '1.5px solid #DBEAFE', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px', letterSpacing: '0.2px' }}>
                                My Claims
                            </button>
                        </div>
                    </div>
                )}

                {/* EARNINGS TAB */}
                {tab === 'earnings' && (
                    <div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '16px' }}>
                            {[
                                { label: 'Avg Weekly', value: '₹' + avgIncome, color: '#1A56A0', bg: '#EEF4FF', border: '#DBEAFE' },
                                { label: 'Total Payouts', value: '₹' + totalReceived, color: '#1E7D34', bg: '#F0FDF4', border: '#BBF7D0' },
                                { label: 'This Week', value: '₹' + earnedSoFar, color: '#D97706', bg: '#FFFBEB', border: '#FDE68A' },
                            ].map((s, i) => (
                                <div key={i} style={{ backgroundColor: s.bg, borderRadius: '12px', padding: '14px', textAlign: 'center', border: `1px solid ${s.border}` }}>
                                    <p style={{ color: s.color, fontWeight: 'bold', fontSize: '16px' }}>{s.value}</p>
                                    <p style={{ color: '#6B7280', fontSize: '11px', marginTop: '4px' }}>{s.label}</p>
                                </div>
                            ))}
                        </div>

                        <div style={{ backgroundColor: 'white', borderRadius: '14px', padding: '20px', marginBottom: '14px', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', border: '1px solid #E5E7EB' }}>
                            <p style={{ color: '#374151', fontWeight: 'bold', fontSize: '14px', marginBottom: '4px' }}>Weekly Earnings vs Coverage</p>
                            <p style={{ color: '#9CA3AF', fontSize: '12px', marginBottom: '16px' }}>Last 6 weeks — Blue = earned, Light = coverage limit</p>
                            <ResponsiveContainer width="100%" height={200}>
                                <BarChart data={earningsData} barGap={4}>
                                    <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Bar dataKey="earned" fill="#1A56A0" radius={[4, 4, 0, 0]} name="Earned" />
                                    <Bar dataKey="coverage" fill="#BFDBFE" radius={[4, 4, 0, 0]} name="Coverage" />
                                </BarChart>
                            </ResponsiveContainer>
                            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginTop: '10px' }}>
                                {[
                                    { color: '#1A56A0', label: 'Weekly Earnings' },
                                    { color: '#BFDBFE', label: 'Coverage Limit' },
                                ].map((l, i) => (
                                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <div style={{ width: '10px', height: '10px', borderRadius: '2px', backgroundColor: l.color }} />
                                        <p style={{ color: '#6B7280', fontSize: '12px' }}>{l.label}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div style={{ backgroundColor: 'white', borderRadius: '14px', padding: '18px', marginBottom: '14px', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', border: '1px solid #E5E7EB' }}>
                            <p style={{ color: '#374151', fontWeight: 'bold', fontSize: '14px', marginBottom: '14px' }}>This Week's Protection</p>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                <p style={{ color: '#6B7280', fontSize: '13px' }}>Earned: ₹{earnedSoFar}</p>
                                <p style={{ color: '#1A56A0', fontWeight: 'bold', fontSize: '13px' }}>Target: ₹{avgIncome}</p>
                            </div>
                            <div style={{ backgroundColor: '#F3F4F6', borderRadius: '8px', height: '12px', overflow: 'hidden', marginBottom: '8px' }}>
                                <div style={{ width: `${earningsPercent}%`, height: '100%', backgroundColor: earningsPercent >= 80 ? '#1E7D34' : earningsPercent >= 50 ? '#D97706' : '#C0392B', borderRadius: '8px' }} />
                            </div>
                            <p style={{ color: '#9CA3AF', fontSize: '12px', textAlign: 'center' }}>{earningsPercent}% of weekly income target reached</p>
                        </div>

                        <div style={{ backgroundColor: 'white', borderRadius: '14px', padding: '18px', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', border: '1px solid #E5E7EB' }}>
                            <p style={{ color: '#374151', fontWeight: 'bold', fontSize: '14px', marginBottom: '14px' }}>Weekly Breakdown</p>
                            {earningsData.map((d, i) => (
                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: i < earningsData.length - 1 ? '1px solid #F3F4F6' : 'none' }}>
                                    <p style={{ color: '#6B7280', fontSize: '13px' }}>Week {i + 1}</p>
                                    <div style={{ flex: 1, margin: '0 14px', backgroundColor: '#F3F4F6', borderRadius: '4px', height: '8px', overflow: 'hidden' }}>
                                        <div style={{ width: `${Math.round((d.earned / d.coverage) * 100)}%`, height: '100%', backgroundColor: d.earned >= d.coverage * 0.8 ? '#1E7D34' : '#D97706', borderRadius: '4px' }} />
                                    </div>
                                    <p style={{ color: '#374151', fontWeight: 'bold', fontSize: '13px' }}>₹{d.earned}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* KAVACHSCORE TAB */}
                {tab === 'score' && (
                    <div>
                        <div style={{ backgroundColor: 'white', borderRadius: '14px', padding: '24px', textAlign: 'center', marginBottom: '14px', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', border: '1px solid #E5E7EB' }}>
                            <div style={{ width: '120px', height: '120px', borderRadius: '50%', border: `8px solid ${getScoreColor()}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', boxShadow: `0 0 28px ${getScoreColor()}30` }}>
                                <p style={{ fontSize: '32px', fontWeight: 'bold', color: getScoreColor(), lineHeight: 1 }}>{score}</p>
                                <p style={{ fontSize: '10px', color: '#9CA3AF', marginTop: '2px' }}>/ 900</p>
                            </div>
                            <p style={{ color: getScoreColor(), fontWeight: 'bold', fontSize: '16px', letterSpacing: '0.3px' }}>{getScoreTier()}</p>
                            <p style={{ color: '#6B7280', fontSize: '13px', marginTop: '5px' }}>{getScoreDesc()}</p>
                        </div>

                        <div style={{ backgroundColor: 'white', borderRadius: '14px', padding: '20px', marginBottom: '14px', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', border: '1px solid #E5E7EB' }}>
                            <p style={{ color: '#374151', fontWeight: 'bold', fontSize: '14px', marginBottom: '14px' }}>How Your Score Goes Up</p>
                            {[
                                { action: 'Legitimate claim verified', points: '+10 pts', desc: 'Claim passes all 5 verification layers' },
                                { action: 'Weekly active streak', points: '+5 pts', desc: 'Stay enrolled and active every week' },
                                { action: 'Long tenure bonus', points: '+15 pts', desc: 'Every 6 months enrolled continuously' },
                                { action: 'Zero fraud flags', points: '+8 pts', desc: 'Clean record for 30 consecutive days' },
                                { action: 'Profile completion', points: '+12 pts', desc: 'Aadhaar + platform linked + age verified' },
                            ].map((item, i) => (
                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '10px', marginBottom: '8px' }}>
                                    <div>
                                        <p style={{ color: '#1E7D34', fontWeight: '600', fontSize: '13px' }}>{item.action}</p>
                                        <p style={{ color: '#6B7280', fontSize: '11px', marginTop: '2px' }}>{item.desc}</p>
                                    </div>
                                    <p style={{ color: '#1E7D34', fontWeight: 'bold', fontSize: '14px', marginLeft: '12px' }}>{item.points}</p>
                                </div>
                            ))}
                        </div>

                        <div style={{ backgroundColor: 'white', borderRadius: '14px', padding: '20px', marginBottom: '14px', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', border: '1px solid #E5E7EB' }}>
                            <p style={{ color: '#374151', fontWeight: 'bold', fontSize: '14px', marginBottom: '14px' }}>How Your Score Goes Down</p>
                            {[
                                { action: 'Suspicious claim pattern', points: '-25 pts', desc: 'Multiple claims in a short time window' },
                                { action: 'Active during disruption', points: '-20 pts', desc: 'Deliveries detected during payout window' },
                                { action: 'Missed self declaration', points: '-5 pts', desc: 'Did not confirm disruption when prompted' },
                                { action: 'Policy lapse', points: '-10 pts', desc: 'Enrollment gap of more than 2 weeks' },
                            ].map((item, i) => (
                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', backgroundColor: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '10px', marginBottom: '8px' }}>
                                    <div>
                                        <p style={{ color: '#C0392B', fontWeight: '600', fontSize: '13px' }}>{item.action}</p>
                                        <p style={{ color: '#6B7280', fontSize: '11px', marginTop: '2px' }}>{item.desc}</p>
                                    </div>
                                    <p style={{ color: '#C0392B', fontWeight: 'bold', fontSize: '14px', marginLeft: '12px' }}>{item.points}</p>
                                </div>
                            ))}
                        </div>

                        <div style={{ backgroundColor: 'white', borderRadius: '14px', padding: '20px', marginBottom: '14px', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', border: '1px solid #E5E7EB' }}>
                            <p style={{ color: '#374151', fontWeight: 'bold', fontSize: '14px', marginBottom: '4px' }}>Score History</p>
                            <p style={{ color: '#9CA3AF', fontSize: '12px', marginBottom: '16px' }}>Your KavachScore over the last 2 months</p>
                            <ResponsiveContainer width="100%" height={180}>
                                <LineChart data={scoreHistory}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                                    <YAxis domain={[700, 820]} tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Line type="monotone" dataKey="score" stroke="#1A56A0" strokeWidth={3} dot={{ fill: '#1A56A0', r: 5, strokeWidth: 0 }} name="KavachScore" />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>

                        <div style={{ backgroundColor: 'white', borderRadius: '14px', padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', border: '1px solid #E5E7EB' }}>
                            <p style={{ color: '#374151', fontWeight: 'bold', fontSize: '14px', marginBottom: '14px' }}>Score Timeline</p>
                            {scoreHistory.map((s, i) => (
                                <div key={i} style={{ display: 'flex', gap: '12px', marginBottom: '12px', alignItems: 'center' }}>
                                    <div style={{ backgroundColor: '#EEF4FF', border: '1px solid #DBEAFE', borderRadius: '8px', padding: '6px 10px', minWidth: '52px', textAlign: 'center' }}>
                                        <p style={{ color: '#1A56A0', fontWeight: 'bold', fontSize: '14px' }}>{s.score}</p>
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <p style={{ color: '#374151', fontSize: '13px' }}>{s.event}</p>
                                        <p style={{ color: '#9CA3AF', fontSize: '11px', marginTop: '2px' }}>{s.date}</p>
                                    </div>
                                    {i > 0 && (
                                        <p style={{ color: scoreHistory[i].score >= scoreHistory[i - 1].score ? '#1E7D34' : '#C0392B', fontWeight: 'bold', fontSize: '13px' }}>
                                            {scoreHistory[i].score >= scoreHistory[i - 1].score ? '+' : ''}{scoreHistory[i].score - scoreHistory[i - 1].score}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* NOTIFICATIONS TAB */}
                {tab === 'notifications' && (
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                            <p style={{ color: '#374151', fontWeight: 'bold', fontSize: '15px' }}>Notifications</p>
                            {unreadCount > 0 && (
                                <div style={{ backgroundColor: '#C0392B', borderRadius: '12px', padding: '3px 10px' }}>
                                    <p style={{ color: 'white', fontSize: '11px', fontWeight: 'bold' }}>{unreadCount} unread</p>
                                </div>
                            )}
                        </div>
                        {notifications.map((n, i) => (
                            <div key={i} style={{ backgroundColor: 'white', borderRadius: '14px', padding: '16px', marginBottom: '10px', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', border: `1px solid ${n.read ? '#E5E7EB' : n.border}`, opacity: n.read ? 0.85 : 1 }}>
                                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                                    <div style={{ width: '38px', height: '38px', borderRadius: '10px', backgroundColor: n.bg, border: `1px solid ${n.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '17px', flexShrink: 0 }}>
                                        {n.icon}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                            <p style={{ color: '#374151', fontWeight: 'bold', fontSize: '13px' }}>{n.title}</p>
                                            {!n.read && <div style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#C0392B', flexShrink: 0 }} />}
                                        </div>
                                        <p style={{ color: '#6B7280', fontSize: '12px', lineHeight: 1.5 }}>{n.msg}</p>
                                        <p style={{ color: '#9CA3AF', fontSize: '11px', marginTop: '6px' }}>{n.time}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

            </div>

            {/* Bottom Nav */}
            <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, backgroundColor: 'white', borderTop: '1px solid #E5E7EB', padding: '10px 20px', display: 'flex', justifyContent: 'space-around', zIndex: 100 }}>
                {[
                    { label: 'Home', key: 'home', icon: '⊞' },
                    { label: 'Earnings', key: 'earnings', icon: '↗' },
                    { label: 'Score', key: 'score', icon: '◎' },
                    { label: 'Alerts', key: 'notifications', icon: '◉' },
                ].map(t => (
                    <button key={t.key} onClick={() => setTab(t.key)}
                        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 16px' }}>
                        <span style={{ fontSize: '18px', color: tab === t.key ? '#1A56A0' : '#9CA3AF' }}>{t.icon}</span>
                        <p style={{ fontSize: '10px', color: tab === t.key ? '#1A56A0' : '#9CA3AF', fontWeight: tab === t.key ? 'bold' : 'normal', letterSpacing: '0.2px' }}>{t.label}</p>
                    </button>
                ))}
            </div>

            {/* Chatbot */}
            <button onClick={() => setShowChat(true)}
                style={{ position: 'fixed', bottom: '80px', right: '20px', backgroundColor: '#1A56A0', color: 'white', width: '50px', height: '50px', borderRadius: '50%', border: 'none', fontSize: '20px', cursor: 'pointer', boxShadow: '0 4px 16px rgba(26,86,160,0.35)', zIndex: 99 }}>
                💬
            </button>
            {showChat && <Chatbot onClose={() => setShowChat(false)} />}

        </div>
    );
}