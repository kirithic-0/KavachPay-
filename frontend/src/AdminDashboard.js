import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid, Legend } from 'recharts';
import Simulator from './Simulator';
import MapView from './MapView';

const ZONE_DATA = [
    { zone: 'Koramangala, Bangalore', city: 'Bangalore', workers: 58, risk: 'medium', disruptions: 1, paidOut: 6800, premiums: 12400, status: 'active' },
    { zone: 'Adyar, Chennai', city: 'Chennai', workers: 47, risk: 'high', disruptions: 2, paidOut: 8200, premiums: 14800, status: 'disrupted' },
    { zone: 'Dharavi, Mumbai', city: 'Mumbai', workers: 63, risk: 'high', disruptions: 3, paidOut: 11400, premiums: 19600, status: 'disrupted' },
    { zone: 'Salt Lake, Kolkata', city: 'Kolkata', workers: 41, risk: 'high', disruptions: 1, paidOut: 6200, premiums: 13200, status: 'disrupted' },
    { zone: 'HSR Layout, Bangalore', city: 'Bangalore', workers: 52, risk: 'low', disruptions: 0, paidOut: 0, premiums: 10400, status: 'safe' },
    { zone: 'Anna Nagar, Chennai', city: 'Chennai', workers: 38, risk: 'low', disruptions: 0, paidOut: 0, premiums: 8200, status: 'safe' },
];

const WORKERS = [
    { name: 'Ravi Kumar', zone: 'Koramangala, Bangalore', platform: 'Swiggy', score: 780, premium: 59, status: 'active', claims: 3, totalPaid: 2340 },
    { name: 'Priya Singh', zone: 'Adyar, Chennai', platform: 'Zomato', score: 820, premium: 74, status: 'active', claims: 5, totalPaid: 4680 },
    { name: 'Mohammed Arif', zone: 'Dharavi, Mumbai', platform: 'Zepto', score: 750, premium: 74, status: 'active', claims: 4, totalPaid: 3744 },
    { name: 'Sunita Devi', zone: 'HSR Layout, Bangalore', platform: 'Blinkit', score: 710, premium: 49, status: 'paused', claims: 1, totalPaid: 294 },
    { name: 'Karthik R', zone: 'Koramangala, Bangalore', platform: 'Swiggy', score: 760, premium: 59, status: 'active', claims: 2, totalPaid: 1560 },
    { name: 'Deepa Nair', zone: 'Salt Lake, Kolkata', platform: 'Zomato', score: 800, premium: 74, status: 'active', claims: 4, totalPaid: 3744 },
    { name: 'Suresh Patil', zone: 'Dharavi, Mumbai', platform: 'Swiggy', score: 690, premium: 74, status: 'flagged', claims: 6, totalPaid: 0 },
    { name: 'Mithun Roy', zone: 'Salt Lake, Kolkata', platform: 'Zomato', score: 810, premium: 74, status: 'active', claims: 3, totalPaid: 2808 },
];

const WEEKLY_PROFIT_DATA = [
    { week: 'W1 Jan', premiums: 42000, payouts: 18400, profit: 23600 },
    { week: 'W2 Jan', premiums: 46800, payouts: 22200, profit: 24600 },
    { week: 'W3 Jan', premiums: 51200, payouts: 16800, profit: 34400 },
    { week: 'W4 Jan', premiums: 54800, payouts: 24600, profit: 30200 },
    { week: 'W1 Feb', premiums: 58600, payouts: 19200, profit: 39400 },
    { week: 'W2 Feb', premiums: 62400, payouts: 24800, profit: 37600 },
    { week: 'W3 Feb', premiums: 67800, payouts: 17400, profit: 50400 },
    { week: 'W4 Feb', premiums: 72400, payouts: 26200, profit: 46200 },
    { week: 'W1 Mar', premiums: 78000, payouts: 21200, profit: 56800 },
    { week: 'W2 Mar', premiums: 84600, payouts: 24800, profit: 59800 },
];

const ZONE_PAYOUT_DATA = ZONE_DATA.map(z => ({
    zone: z.zone.split(',')[0],
    payouts: z.paidOut,
    premiums: z.premiums,
}));

const RECENT_DISRUPTIONS = [
    { time: '2:14 PM Today', zone: 'Adyar, Chennai', event: 'Heavy Rain — 82mm', severity: 'Moderate', workers: 47, paid: 28, amount: 8200 },
    { time: '10:32 AM Today', zone: 'Dharavi, Mumbai', event: 'AQI Alert — 347', severity: 'Moderate', workers: 63, paid: 35, amount: 11400 },
    { time: 'Yesterday 4:15 PM', zone: 'Salt Lake, Kolkata', event: 'Flood Alert — NDMA', severity: 'Severe', workers: 41, paid: 31, amount: 6200 },
    { time: 'Mar 5, 2:10 PM', zone: 'Koramangala, Bangalore', event: 'Heavy Rain — 78mm', severity: 'Moderate', workers: 58, paid: 32, amount: 6800 },
];

export default function AdminDashboard({ onBack }) {
    const [tab, setTab] = useState('overview');
    const [page, setPage] = useState('dashboard');
    const [workerFilter, setWorkerFilter] = useState('all');

    if (page === 'simulator') return <Simulator onBack={() => setPage('dashboard')} />;
    if (page === 'map') return <MapView onBack={() => setPage('dashboard')} />;

    const totalWorkers = ZONE_DATA.reduce((a, b) => a + b.workers, 0);
    const totalPremiums = ZONE_DATA.reduce((a, b) => a + b.premiums, 0);
    const totalPayouts = ZONE_DATA.reduce((a, b) => a + b.paidOut, 0);
    const totalProfit = totalPremiums - totalPayouts;
    const lossRatio = Math.round((totalPayouts / totalPremiums) * 100);

    const getRiskColor = (r) => r === 'high' ? '#C0392B' : r === 'medium' ? '#D97706' : '#1E7D34';
    const getRiskBg = (r) => r === 'high' ? '#FEF2F2' : r === 'medium' ? '#FFFBEB' : '#F0FDF4';
    const getStatusColor = (s) => s === 'disrupted' ? '#C0392B' : s === 'active' ? '#D97706' : '#1E7D34';
    const getStatusBg = (s) => s === 'disrupted' ? '#FEF2F2' : s === 'active' ? '#FFFBEB' : '#F0FDF4';
    const getStatusLabel = (s) => s === 'disrupted' ? 'Disrupted' : s === 'active' ? 'Active' : 'Safe';
    const getSeverityColor = (s) => s === 'Severe' ? '#C0392B' : s === 'Moderate' ? '#D97706' : '#1E7D34';
    const getSeverityBg = (s) => s === 'Severe' ? '#FEF2F2' : s === 'Moderate' ? '#FFFBEB' : '#F0FDF4';
    const getWorkerStatusColor = (s) => s === 'active' ? '#1E7D34' : s === 'paused' ? '#D97706' : '#C0392B';
    const getWorkerStatusBg = (s) => s === 'active' ? '#F0FDF4' : s === 'paused' ? '#FFFBEB' : '#FEF2F2';

    const filteredWorkers = workerFilter === 'all' ? WORKERS : WORKERS.filter(w => w.status === workerFilter);

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div style={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '10px 14px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                    <p style={{ color: '#555', fontSize: '12px', marginBottom: '6px', fontWeight: 'bold' }}>{label}</p>
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

    return (
        <div style={{ backgroundColor: '#F4F6F9', minHeight: '100vh', fontFamily: 'Arial' }}>

            {/* Navbar */}
            <div style={{ backgroundColor: '#1A1A2E', padding: '14px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '34px', height: '34px', borderRadius: '8px', backgroundColor: '#F0A500', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                        </svg>
                    </div>
                    <div>
                        <p style={{ color: 'white', fontWeight: 'bold', fontSize: '15px', letterSpacing: '0.3px' }}>KavachPay</p>
                        <p style={{ color: '#F0A500', fontSize: '10px', letterSpacing: '1px' }}>ADMIN PORTAL</p>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => setPage('simulator')}
                        style={{ backgroundColor: '#F0A500', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold', letterSpacing: '0.2px' }}>
                        Run Simulator
                    </button>
                    <button onClick={() => setPage('map')}
                        style={{ backgroundColor: 'rgba(255,255,255,0.08)', color: 'white', border: '1px solid rgba(255,255,255,0.15)', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px' }}>
                        Risk Map
                    </button>
                    <button onClick={onBack}
                        style={{ backgroundColor: 'transparent', color: '#888', border: '1px solid rgba(255,255,255,0.1)', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px' }}>
                        Logout
                    </button>
                </div>
            </div>

            {/* Tab Bar */}
            <div style={{ backgroundColor: 'white', padding: '0 28px', display: 'flex', gap: '2px', borderBottom: '1px solid #E5E7EB', overflowX: 'auto' }}>
                {[
                    { key: 'overview', label: 'Overview' },
                    { key: 'analytics', label: 'Analytics' },
                    { key: 'zones', label: 'Zones' },
                    { key: 'workers', label: 'Workers' },
                    { key: 'disruptions', label: 'Disruptions' },
                    { key: 'financials', label: 'Financials' },
                ].map(t => (
                    <button key={t.key} onClick={() => setTab(t.key)}
                        style={{ padding: '14px 18px', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', fontWeight: tab === t.key ? '700' : '400', color: tab === t.key ? '#1A56A0' : '#6B7280', borderBottom: tab === t.key ? '2px solid #1A56A0' : '2px solid transparent', fontSize: '13px', whiteSpace: 'nowrap', letterSpacing: '0.2px' }}>
                        {t.label}
                    </button>
                ))}
            </div>

            <div style={{ padding: '24px 28px', maxWidth: '900px', margin: '0 auto' }}>

                {/* OVERVIEW TAB */}
                {tab === 'overview' && (
                    <div>
                        {/* KPI Cards */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '14px', marginBottom: '22px' }}>
                            {[
                                { label: 'Enrolled Workers', value: totalWorkers, sub: 'Across 6 zones', color: '#1A56A0', bg: 'white', border: '#DBEAFE' },
                                { label: 'Weekly Premiums', value: '₹' + totalPremiums.toLocaleString(), sub: 'Collected this week', color: '#1E7D34', bg: 'white', border: '#DCFCE7' },
                                { label: 'Weekly Payouts', value: '₹' + totalPayouts.toLocaleString(), sub: 'Disbursed this week', color: '#C0392B', bg: 'white', border: '#FEE2E2' },
                                { label: 'Net Profit', value: '₹' + totalProfit.toLocaleString(), sub: 'This week', color: '#1E7D34', bg: 'white', border: '#DCFCE7' },
                            ].map((k, i) => (
                                <div key={i} style={{ backgroundColor: k.bg, borderRadius: '14px', padding: '18px', border: `1px solid ${k.border}`, boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
                                    <p style={{ color: '#6B7280', fontSize: '12px', marginBottom: '8px', letterSpacing: '0.3px' }}>{k.label}</p>
                                    <p style={{ color: k.color, fontWeight: 'bold', fontSize: '20px', marginBottom: '4px' }}>{k.value}</p>
                                    <p style={{ color: '#9CA3AF', fontSize: '11px' }}>{k.sub}</p>
                                </div>
                            ))}
                        </div>

                        {/* Loss Ratio + Zone Status */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '22px' }}>
                            <div style={{ backgroundColor: 'white', borderRadius: '14px', padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', border: '1px solid #E5E7EB' }}>
                                <p style={{ color: '#374151', fontWeight: 'bold', fontSize: '14px', marginBottom: '4px' }}>Loss Ratio</p>
                                <p style={{ color: '#6B7280', fontSize: '12px', marginBottom: '16px' }}>Payouts as % of premiums collected</p>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px' }}>
                                    <p style={{ color: '#1E7D34', fontWeight: 'bold', fontSize: '40px', lineHeight: 1 }}>{lossRatio}%</p>
                                    <div style={{ backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0', padding: '4px 10px', borderRadius: '20px' }}>
                                        <p style={{ color: '#1E7D34', fontSize: '12px', fontWeight: 'bold' }}>On Target</p>
                                    </div>
                                </div>
                                <div style={{ backgroundColor: '#F3F4F6', borderRadius: '6px', height: '8px', overflow: 'hidden', marginBottom: '6px' }}>
                                    <div style={{ width: `${Math.min(lossRatio, 100)}%`, height: '100%', backgroundColor: '#1E7D34', borderRadius: '6px' }} />
                                </div>
                                <p style={{ color: '#9CA3AF', fontSize: '11px' }}>Industry benchmark: 60–70%</p>
                            </div>

                            <div style={{ backgroundColor: 'white', borderRadius: '14px', padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', border: '1px solid #E5E7EB' }}>
                                <p style={{ color: '#374151', fontWeight: 'bold', fontSize: '14px', marginBottom: '16px' }}>Zone Status</p>
                                {[
                                    { label: 'Disrupted Zones', value: ZONE_DATA.filter(z => z.status === 'disrupted').length, color: '#C0392B', bg: '#FEF2F2', border: '#FECACA' },
                                    { label: 'Active Zones', value: ZONE_DATA.filter(z => z.status === 'active').length, color: '#D97706', bg: '#FFFBEB', border: '#FDE68A' },
                                    { label: 'Safe Zones', value: ZONE_DATA.filter(z => z.status === 'safe').length, color: '#1E7D34', bg: '#F0FDF4', border: '#BBF7D0' },
                                ].map((s, i) => (
                                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', backgroundColor: s.bg, border: `1px solid ${s.border}`, borderRadius: '8px', marginBottom: '8px' }}>
                                        <p style={{ color: s.color, fontSize: '13px', fontWeight: '600' }}>{s.label}</p>
                                        <p style={{ color: s.color, fontWeight: 'bold', fontSize: '20px' }}>{s.value}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Fraud Prevention */}
                        <div style={{ backgroundColor: '#1A1A2E', borderRadius: '14px', padding: '20px', marginBottom: '22px', border: '1px solid rgba(255,255,255,0.06)' }}>
                            <p style={{ color: 'white', fontWeight: 'bold', fontSize: '14px', marginBottom: '4px', letterSpacing: '0.3px' }}>Fraud Prevention</p>
                            <p style={{ color: '#6B7280', fontSize: '12px', marginBottom: '16px' }}>Behavioral verification results this week</p>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                                {[
                                    { label: 'Claims Blocked', value: '47', color: '#F87171', bg: 'rgba(248,113,113,0.1)', border: 'rgba(248,113,113,0.2)' },
                                    { label: 'Fraud Savings', value: '₹31,200', color: '#34D399', bg: 'rgba(52,211,153,0.1)', border: 'rgba(52,211,153,0.2)' },
                                    { label: 'Fraud Rate', value: '8.2%', color: '#FBBF24', bg: 'rgba(251,191,36,0.1)', border: 'rgba(251,191,36,0.2)' },
                                ].map((s, i) => (
                                    <div key={i} style={{ backgroundColor: s.bg, border: `1px solid ${s.border}`, borderRadius: '10px', padding: '14px', textAlign: 'center' }}>
                                        <p style={{ color: s.color, fontWeight: 'bold', fontSize: '20px' }}>{s.value}</p>
                                        <p style={{ color: '#9CA3AF', fontSize: '11px', marginTop: '4px' }}>{s.label}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Recent Disruptions */}
                        <div style={{ backgroundColor: 'white', borderRadius: '14px', padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', border: '1px solid #E5E7EB' }}>
                            <p style={{ color: '#374151', fontWeight: 'bold', fontSize: '14px', marginBottom: '16px' }}>Recent Disruptions</p>
                            {RECENT_DISRUPTIONS.map((d, i) => (
                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: i < RECENT_DISRUPTIONS.length - 1 ? '1px solid #F3F4F6' : 'none' }}>
                                    <div>
                                        <p style={{ color: '#374151', fontWeight: '600', fontSize: '13px' }}>{d.event}</p>
                                        <p style={{ color: '#9CA3AF', fontSize: '11px', marginTop: '3px' }}>{d.zone} • {d.time}</p>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <p style={{ color: '#1E7D34', fontWeight: 'bold', fontSize: '14px' }}>₹{d.amount.toLocaleString()}</p>
                                        <div style={{ backgroundColor: getSeverityBg(d.severity), padding: '2px 8px', borderRadius: '10px', marginTop: '4px', display: 'inline-block' }}>
                                            <p style={{ color: getSeverityColor(d.severity), fontSize: '10px', fontWeight: 'bold' }}>{d.severity}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ANALYTICS TAB */}
                {tab === 'analytics' && (
                    <div>
                        {/* Profit Over Time */}
                        <div style={{ backgroundColor: 'white', borderRadius: '14px', padding: '24px', marginBottom: '18px', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', border: '1px solid #E5E7EB' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                                <div>
                                    <p style={{ color: '#374151', fontWeight: 'bold', fontSize: '15px', marginBottom: '4px' }}>Profit Over Time</p>
                                    <p style={{ color: '#9CA3AF', fontSize: '12px' }}>Weekly net profit — consistently growing as worker base scales</p>
                                </div>
                                <div style={{ backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0', padding: '4px 12px', borderRadius: '20px' }}>
                                    <p style={{ color: '#1E7D34', fontSize: '12px', fontWeight: 'bold' }}>+153% over 10 weeks</p>
                                </div>
                            </div>
                            <ResponsiveContainer width="100%" height={220}>
                                <LineChart data={WEEKLY_PROFIT_DATA}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                                    <XAxis dataKey="week" tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Line type="monotone" dataKey="profit" stroke="#1E7D34" strokeWidth={3} dot={{ fill: '#1E7D34', r: 4, strokeWidth: 0 }} name="Net Profit" />
                                </LineChart>
                            </ResponsiveContainer>
                            <div style={{ backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '10px', padding: '12px 14px', marginTop: '12px' }}>
                                <p style={{ color: '#1E7D34', fontSize: '12px', fontWeight: '600' }}>
                                    Average weekly profit: ₹{Math.round(WEEKLY_PROFIT_DATA.reduce((a, b) => a + b.profit, 0) / WEEKLY_PROFIT_DATA.length).toLocaleString()} — Trending upward as enrollment scales
                                </p>
                            </div>
                        </div>

                        {/* Zone-wise Payouts vs Premiums */}
                        <div style={{ backgroundColor: 'white', borderRadius: '14px', padding: '24px', marginBottom: '18px', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', border: '1px solid #E5E7EB' }}>
                            <p style={{ color: '#374151', fontWeight: 'bold', fontSize: '15px', marginBottom: '4px' }}>Zone-wise Premiums vs Payouts</p>
                            <p style={{ color: '#9CA3AF', fontSize: '12px', marginBottom: '20px' }}>Premiums collected vs payouts disbursed per zone — all zones profitable</p>
                            <ResponsiveContainer width="100%" height={220}>
                                <BarChart data={ZONE_PAYOUT_DATA} barGap={4}>
                                    <XAxis dataKey="zone" tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '12px' }} />
                                    <Bar dataKey="premiums" fill="#1A56A0" radius={[4, 4, 0, 0]} name="Premiums" />
                                    <Bar dataKey="payouts" fill="#93C5FD" radius={[4, 4, 0, 0]} name="Payouts" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Weekly Premium vs Payout Line Chart */}
                        <div style={{ backgroundColor: 'white', borderRadius: '14px', padding: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', border: '1px solid #E5E7EB' }}>
                            <p style={{ color: '#374151', fontWeight: 'bold', fontSize: '15px', marginBottom: '4px' }}>Weekly Premium vs Payout Trend</p>
                            <p style={{ color: '#9CA3AF', fontSize: '12px', marginBottom: '20px' }}>Premium growth outpacing payouts — widening profit margin week on week</p>
                            <ResponsiveContainer width="100%" height={220}>
                                <LineChart data={WEEKLY_PROFIT_DATA}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                                    <XAxis dataKey="week" tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '12px' }} />
                                    <Line type="monotone" dataKey="premiums" stroke="#1A56A0" strokeWidth={2.5} dot={false} name="Premiums" />
                                    <Line type="monotone" dataKey="payouts" stroke="#93C5FD" strokeWidth={2.5} dot={false} name="Payouts" />
                                </LineChart>
                            </ResponsiveContainer>
                            <div style={{ backgroundColor: '#EEF4FF', border: '1px solid #C7D9F8', borderRadius: '10px', padding: '12px 14px', marginTop: '12px' }}>
                                <p style={{ color: '#1A56A0', fontSize: '12px', fontWeight: '600' }}>
                                    Premium growth rate: +101% over 10 weeks — Payouts growing at only +35% as fraud prevention scales
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* ZONES TAB */}
                {tab === 'zones' && (
                    <div>
                        <p style={{ color: '#6B7280', fontSize: '13px', marginBottom: '16px' }}>Live status of all enrolled zones</p>
                        {ZONE_DATA.map((z, i) => (
                            <div key={i} style={{ backgroundColor: 'white', borderRadius: '14px', padding: '18px', marginBottom: '12px', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', border: '1px solid #E5E7EB', borderLeft: `4px solid ${getStatusColor(z.status)}` }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                                    <div>
                                        <p style={{ color: '#374151', fontWeight: 'bold', fontSize: '15px' }}>{z.zone.split(',')[0]}</p>
                                        <p style={{ color: '#9CA3AF', fontSize: '12px', marginTop: '2px' }}>{z.city}</p>
                                    </div>
                                    <div style={{ display: 'flex', gap: '6px' }}>
                                        <div style={{ backgroundColor: getRiskBg(z.risk), padding: '4px 10px', borderRadius: '20px', border: `1px solid ${getRiskColor(z.risk)}20` }}>
                                            <p style={{ color: getRiskColor(z.risk), fontSize: '11px', fontWeight: 'bold', letterSpacing: '0.3px' }}>{z.risk.toUpperCase()} RISK</p>
                                        </div>
                                        <div style={{ backgroundColor: getStatusBg(z.status), padding: '4px 10px', borderRadius: '20px', border: `1px solid ${getStatusColor(z.status)}20` }}>
                                            <p style={{ color: getStatusColor(z.status), fontSize: '11px', fontWeight: 'bold' }}>{getStatusLabel(z.status)}</p>
                                        </div>
                                    </div>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '8px' }}>
                                    {[
                                        { label: 'Workers', value: z.workers },
                                        { label: 'Disruptions', value: z.disruptions },
                                        { label: 'Premiums', value: '₹' + z.premiums.toLocaleString() },
                                        { label: 'Paid Out', value: z.paidOut > 0 ? '₹' + z.paidOut.toLocaleString() : '₹0' },
                                    ].map((s, j) => (
                                        <div key={j} style={{ backgroundColor: '#F9FAFB', borderRadius: '8px', padding: '10px', textAlign: 'center', border: '1px solid #F3F4F6' }}>
                                            <p style={{ color: '#374151', fontWeight: 'bold', fontSize: '14px' }}>{s.value}</p>
                                            <p style={{ color: '#9CA3AF', fontSize: '10px', marginTop: '3px' }}>{s.label}</p>
                                        </div>
                                    ))}
                                </div>
                                {z.paidOut > 0 && (
                                    <div style={{ marginTop: '12px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                            <p style={{ color: '#6B7280', fontSize: '11px' }}>Zone Loss Ratio</p>
                                            <p style={{ color: '#374151', fontSize: '11px', fontWeight: 'bold' }}>{Math.round((z.paidOut / z.premiums) * 100)}%</p>
                                        </div>
                                        <div style={{ backgroundColor: '#F3F4F6', borderRadius: '4px', height: '6px', overflow: 'hidden' }}>
                                            <div style={{ width: `${Math.min((z.paidOut / z.premiums) * 100, 100)}%`, height: '100%', backgroundColor: '#1E7D34', borderRadius: '4px' }} />
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* WORKERS TAB */}
                {tab === 'workers' && (
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <p style={{ color: '#6B7280', fontSize: '13px' }}>{filteredWorkers.length} workers</p>
                            <div style={{ display: 'flex', gap: '6px' }}>
                                {['all', 'active', 'paused', 'flagged'].map(f => (
                                    <button key={f} onClick={() => setWorkerFilter(f)}
                                        style={{ padding: '6px 14px', borderRadius: '20px', border: '1px solid #E5E7EB', cursor: 'pointer', fontSize: '12px', fontWeight: workerFilter === f ? 'bold' : 'normal', backgroundColor: workerFilter === f ? '#1A56A0' : 'white', color: workerFilter === f ? 'white' : '#6B7280' }}>
                                        {f.charAt(0).toUpperCase() + f.slice(1)}
                                    </button>
                                ))}
                            </div>
                        </div>
                        {filteredWorkers.map((w, i) => (
                            <div key={i} style={{ backgroundColor: 'white', borderRadius: '14px', padding: '16px', marginBottom: '10px', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', border: '1px solid #E5E7EB', borderLeft: `4px solid ${getWorkerStatusColor(w.status)}` }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                                    <div>
                                        <p style={{ color: '#374151', fontWeight: 'bold', fontSize: '14px' }}>{w.name}</p>
                                        <p style={{ color: '#9CA3AF', fontSize: '12px', marginTop: '2px' }}>{w.zone.split(',')[0]} • {w.platform}</p>
                                    </div>
                                    <div style={{ backgroundColor: getWorkerStatusBg(w.status), padding: '4px 10px', borderRadius: '20px', border: `1px solid ${getWorkerStatusColor(w.status)}20` }}>
                                        <p style={{ color: getWorkerStatusColor(w.status), fontSize: '11px', fontWeight: 'bold', letterSpacing: '0.3px' }}>{w.status.toUpperCase()}</p>
                                    </div>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '8px' }}>
                                    {[
                                        { label: 'KavachScore', value: w.score, color: w.score >= 750 ? '#1E7D34' : w.score >= 500 ? '#D97706' : '#C0392B' },
                                        { label: 'Premium', value: '₹' + w.premium + '/wk', color: '#1A56A0' },
                                        { label: 'Claims', value: w.claims, color: '#374151' },
                                        { label: 'Total Paid', value: '₹' + w.totalPaid.toLocaleString(), color: '#1E7D34' },
                                    ].map((s, j) => (
                                        <div key={j} style={{ backgroundColor: '#F9FAFB', borderRadius: '8px', padding: '8px', textAlign: 'center', border: '1px solid #F3F4F6' }}>
                                            <p style={{ color: s.color, fontWeight: 'bold', fontSize: '13px' }}>{s.value}</p>
                                            <p style={{ color: '#9CA3AF', fontSize: '10px', marginTop: '2px' }}>{s.label}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* DISRUPTIONS TAB */}
                {tab === 'disruptions' && (
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <p style={{ color: '#6B7280', fontSize: '13px' }}>Recent disruption events and payout activity</p>
                            <button onClick={() => setPage('simulator')}
                                style={{ backgroundColor: '#1A56A0', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>
                                Simulate New
                            </button>
                        </div>
                        {RECENT_DISRUPTIONS.map((d, i) => (
                            <div key={i} style={{ backgroundColor: 'white', borderRadius: '14px', padding: '18px', marginBottom: '12px', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', border: '1px solid #E5E7EB' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                                    <div>
                                        <p style={{ color: '#374151', fontWeight: 'bold', fontSize: '14px' }}>{d.event}</p>
                                        <p style={{ color: '#9CA3AF', fontSize: '12px', marginTop: '2px' }}>{d.zone}</p>
                                        <p style={{ color: '#9CA3AF', fontSize: '11px', marginTop: '2px' }}>{d.time}</p>
                                    </div>
                                    <div style={{ backgroundColor: getSeverityBg(d.severity), padding: '4px 10px', borderRadius: '20px', border: `1px solid ${getSeverityColor(d.severity)}20` }}>
                                        <p style={{ color: getSeverityColor(d.severity), fontSize: '11px', fontWeight: 'bold' }}>{d.severity}</p>
                                    </div>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '8px' }}>
                                    {[
                                        { label: 'Zone Workers', value: d.workers, color: '#374151' },
                                        { label: 'Paid Out', value: d.paid, color: '#1E7D34' },
                                        { label: 'Total Amount', value: '₹' + d.amount.toLocaleString(), color: '#1A56A0' },
                                        { label: 'Blocked', value: d.workers - d.paid, color: '#C0392B' },
                                    ].map((s, j) => (
                                        <div key={j} style={{ backgroundColor: '#F9FAFB', borderRadius: '8px', padding: '10px', textAlign: 'center', border: '1px solid #F3F4F6' }}>
                                            <p style={{ color: s.color, fontWeight: 'bold', fontSize: '14px' }}>{s.value}</p>
                                            <p style={{ color: '#9CA3AF', fontSize: '10px', marginTop: '2px' }}>{s.label}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* FINANCIALS TAB */}
                {tab === 'financials' && (
                    <div>
                        <div style={{ backgroundColor: 'white', borderRadius: '14px', padding: '24px', marginBottom: '16px', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', border: '1px solid #E5E7EB' }}>
                            <p style={{ color: '#374151', fontWeight: 'bold', fontSize: '15px', marginBottom: '18px' }}>Weekly P&L Summary</p>
                            {[
                                { label: 'Total Premiums Collected', value: '+ ₹' + totalPremiums.toLocaleString(), color: '#1E7D34' },
                                { label: 'Total Payouts Disbursed', value: '- ₹' + totalPayouts.toLocaleString(), color: '#C0392B' },
                                { label: 'Operational Cost (est.)', value: '- ₹4,200', color: '#C0392B' },
                                { label: 'Net This Week', value: (totalPremiums - totalPayouts - 4200) >= 0 ? '+ ₹' + (totalPremiums - totalPayouts - 4200).toLocaleString() : '- ₹' + Math.abs(totalPremiums - totalPayouts - 4200).toLocaleString(), color: '#1E7D34' },
                            ].map((item, i) => (
                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 0', borderBottom: i < 3 ? '1px solid #F3F4F6' : 'none', borderTop: i === 3 ? '2px solid #E5E7EB' : 'none', marginTop: i === 3 ? '4px' : '0' }}>
                                    <p style={{ color: '#6B7280', fontSize: '14px', fontWeight: i === 3 ? 'bold' : 'normal' }}>{item.label}</p>
                                    <p style={{ color: item.color, fontWeight: 'bold', fontSize: '15px' }}>{item.value}</p>
                                </div>
                            ))}
                        </div>

                        <div style={{ backgroundColor: 'white', borderRadius: '14px', padding: '24px', marginBottom: '16px', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', border: '1px solid #E5E7EB' }}>
                            <p style={{ color: '#374151', fontWeight: 'bold', fontSize: '15px', marginBottom: '18px' }}>Break-Even Projection</p>
                            {[
                                { workers: '500 (Pilot)', net: '- ₹34.9L/yr', status: 'Burning Capital', color: '#C0392B', bg: '#FEF2F2', border: '#FECACA' },
                                { workers: '5,000', net: '- ₹8.2L/yr', status: 'Improving', color: '#D97706', bg: '#FFFBEB', border: '#FDE68A' },
                                { workers: '15,000', net: '+ ₹11.4L/yr', status: 'Profitable', color: '#1E7D34', bg: '#F0FDF4', border: '#BBF7D0' },
                                { workers: '50,000', net: '+ ₹94L/yr', status: 'Scaling', color: '#1E7D34', bg: '#F0FDF4', border: '#BBF7D0' },
                            ].map((row, i) => (
                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderRadius: '10px', marginBottom: '8px', backgroundColor: row.bg, border: `1px solid ${row.border}` }}>
                                    <div>
                                        <p style={{ color: '#374151', fontWeight: 'bold', fontSize: '14px' }}>{row.workers} workers</p>
                                        <p style={{ color: row.color, fontSize: '12px', marginTop: '2px', fontWeight: '600' }}>{row.status}</p>
                                    </div>
                                    <p style={{ color: row.color, fontWeight: 'bold', fontSize: '16px' }}>{row.net}</p>
                                </div>
                            ))}
                            <div style={{ backgroundColor: '#EEF4FF', border: '1px solid #C7D9F8', borderRadius: '10px', padding: '12px 14px', marginTop: '8px' }}>
                                <p style={{ color: '#1A56A0', fontSize: '13px', fontWeight: '600' }}>
                                    Break-even at 12,000–15,000 workers — achievable in 18 months via platform partnerships with Swiggy, Zomato and Zepto
                                </p>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}