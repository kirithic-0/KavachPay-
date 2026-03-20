import React, { useState } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
    LineChart, Line, CartesianGrid, AreaChart, Area
} from 'recharts';

const DISRUPTION_TYPES = [
    { code: 'HRA', label: 'Heavy Rain', color: '#3B82F6', icon: '🌧️' },
    { code: 'MRA', label: 'Moderate Rain', color: '#60A5FA', icon: '🌦️' },
    { code: 'LRA', label: 'Light Rain', color: '#93C5FD', icon: '🌂' },
    { code: 'SAQ', label: 'Severe AQI', color: '#F97316', icon: '😷' },
    { code: 'MAQ', label: 'Moderate AQI', color: '#FB923C', icon: '🌫️' },
    { code: 'STM', label: 'Storm', color: '#8B5CF6', icon: '⛈️' },
    { code: 'FLD', label: 'Flood', color: '#06B6D4', icon: '🌊' },
    { code: 'CRF', label: 'Curfew', color: '#EF4444', icon: '🚫' },
    { code: 'EQK', label: 'Earthquake', color: '#D97706', icon: '🏚️' },
    { code: 'LDS', label: 'Landslide', color: '#92400E', icon: '⛰️' },
    { code: 'HTV', label: 'Heatwave', color: '#DC2626', icon: '🌡️' },
    { code: 'FOG', label: 'Dense Fog', color: '#6B7280', icon: '🌁' },
    { code: 'WND', label: 'High Wind', color: '#10B981', icon: '💨' },
];

const ZONES_DATA = [
    { zone: 'Koramangala, Bangalore', risk: 'medium', workers: 58, premium: 59, enrolled: 48, payouts: 1700, coverage: 1200, status: 'safe', city: 'Bangalore' },
    { zone: 'Adyar, Chennai', risk: 'high', workers: 74, premium: 74, enrolled: 62, payouts: 2750, coverage: 1560, status: 'disrupted', city: 'Chennai' },
    { zone: 'Dharavi, Mumbai', risk: 'high', workers: 91, premium: 74, enrolled: 78, payouts: 3460, coverage: 1560, status: 'active', city: 'Mumbai' },
    { zone: 'Whitefield, Bangalore', risk: 'low', workers: 43, premium: 49, enrolled: 37, payouts: 1090, coverage: 980, status: 'safe', city: 'Bangalore' },
    { zone: 'Banjara Hills, Hyderabad', risk: 'low', workers: 39, premium: 49, enrolled: 33, payouts: 970, coverage: 980, status: 'safe', city: 'Hyderabad' },
    { zone: 'Salt Lake, Kolkata', risk: 'high', workers: 67, premium: 74, enrolled: 54, payouts: 2400, coverage: 1560, status: 'active', city: 'Kolkata' },
    { zone: 'Andheri, Mumbai', risk: 'medium', workers: 52, premium: 59, enrolled: 44, payouts: 1560, coverage: 1200, status: 'safe', city: 'Mumbai' },
    { zone: 'Hinjewadi, Pune', risk: 'low', workers: 31, premium: 49, enrolled: 26, payouts: 760, coverage: 980, status: 'safe', city: 'Pune' },
    { zone: 'Velachery, Chennai', risk: 'high', workers: 68, premium: 74, enrolled: 56, payouts: 2490, coverage: 1560, status: 'disrupted', city: 'Chennai' },
    { zone: 'Connaught Place, Delhi', risk: 'medium', workers: 47, premium: 59, enrolled: 39, payouts: 1380, coverage: 1200, status: 'safe', city: 'Delhi' },
    { zone: 'Kurla, Mumbai', risk: 'high', workers: 83, premium: 74, enrolled: 69, payouts: 3060, coverage: 1560, status: 'active', city: 'Mumbai' },
    { zone: 'HSR Layout, Bangalore', risk: 'low', workers: 36, premium: 49, enrolled: 30, payouts: 880, coverage: 980, status: 'safe', city: 'Bangalore' },
];

const WORKERS_DATA = [
    { id: 'KOR-3847261', name: 'Ravi Kumar', zone: 'Koramangala, Bangalore', platform: 'Swiggy', score: 780, status: 'active', premium: 59, lastPayout: '₹780', claims: 3 },
    { id: 'ADY-1923847', name: 'Priya Singh', zone: 'Adyar, Chennai', platform: 'Zomato', score: 720, status: 'active', premium: 74, lastPayout: '₹1,014', claims: 4 },
    { id: 'DHA-3847261', name: 'Mohammed Arif', zone: 'Dharavi, Mumbai', platform: 'Swiggy', score: 695, status: 'active', premium: 74, lastPayout: '₹1,014', claims: 2 },
    { id: 'WHI-2847361', name: 'Sneha Patel', zone: 'Whitefield, Bangalore', platform: 'Zomato', score: 810, status: 'active', premium: 49, lastPayout: '₹637', claims: 5 },
    { id: 'BAN-9283741', name: 'Arjun Reddy', zone: 'Banjara Hills, Hyderabad', platform: 'Swiggy', score: 740, status: 'paused', premium: 49, lastPayout: '₹294', claims: 1 },
    { id: 'SAL-3847291', name: 'Fatima Begum', zone: 'Salt Lake, Kolkata', platform: 'Zomato', score: 655, status: 'active', premium: 74, lastPayout: '₹1,014', claims: 3 },
    { id: 'AND-2837461', name: 'Vikram Sharma', zone: 'Andheri, Mumbai', platform: 'Swiggy', score: 790, status: 'active', premium: 59, lastPayout: '₹780', claims: 4 },
    { id: 'HIN-1923456', name: 'Deepa Nair', zone: 'Hinjewadi, Pune', platform: 'Zomato', score: 725, status: 'active', premium: 49, lastPayout: '₹294', claims: 2 },
    { id: 'VEL-3847293', name: 'Karthik Raja', zone: 'Velachery, Chennai', platform: 'Swiggy', score: 480, status: 'review', premium: 74, lastPayout: '—', claims: 0 },
    { id: 'CPL-2847193', name: 'Anjali Gupta', zone: 'Connaught Place, Delhi', platform: 'Zomato', score: 765, status: 'active', premium: 59, lastPayout: '₹780', claims: 3 },
];

const RECENT_DISRUPTIONS = [
    { id: 'DSR-001', date: 'Mar 19, 2026', time: '2:14 PM', type: 'HRA', zone: 'Adyar, Chennai', severity: 'Moderate', value: '82mm', affected: 62, paid: 48, skipped: 14, totalPayout: 37440, status: 'completed' },
    { id: 'DSR-002', date: 'Mar 18, 2026', time: '11:30 AM', type: 'SAQ', zone: 'Dharavi, Mumbai', severity: 'Severe', value: 'AQI 412', affected: 78, paid: 65, skipped: 13, totalPayout: 101400, status: 'completed' },
    { id: 'DSR-003', date: 'Mar 17, 2026', time: '6:45 PM', type: 'STM', zone: 'Salt Lake, Kolkata', severity: 'Severe', value: '94 kmh', affected: 54, paid: 41, skipped: 13, totalPayout: 63960, status: 'completed' },
    { id: 'DSR-004', date: 'Mar 16, 2026', time: '3:20 PM', type: 'MRA', zone: 'Velachery, Chennai', severity: 'Minor', value: '58mm', affected: 56, paid: 38, skipped: 18, totalPayout: 17784, status: 'completed' },
    { id: 'DSR-005', date: 'Mar 15, 2026', time: '9:10 AM', type: 'FLD', zone: 'Kurla, Mumbai', severity: 'Severe', value: 'NDMA L3', affected: 69, paid: 57, skipped: 12, totalPayout: 88920, status: 'completed' },
    { id: 'DSR-006', date: 'Mar 14, 2026', time: '1:45 PM', type: 'HTV', zone: 'Connaught Place, Delhi', severity: 'Moderate', value: '46.2°C', affected: 39, paid: 28, skipped: 11, totalPayout: 21840, status: 'completed' },
    { id: 'DSR-007', date: 'Mar 13, 2026', time: '8:30 AM', type: 'FOG', zone: 'Koramangala, Bangalore', severity: 'Minor', value: 'Vis 30m', affected: 48, paid: 32, skipped: 16, totalPayout: 11520, status: 'completed' },
    { id: 'DSR-008', date: 'Mar 12, 2026', time: '4:00 PM', type: 'WND', zone: 'Andheri, Mumbai', severity: 'Moderate', value: '72 kmh', affected: 44, paid: 31, skipped: 13, totalPayout: 24180, status: 'completed' },
    { id: 'DSR-009', date: 'Mar 11, 2026', time: '2:30 PM', type: 'MAQ', zone: 'Banjara Hills, Hyderabad', severity: 'Minor', value: 'AQI 245', affected: 33, paid: 22, skipped: 11, totalPayout: 6468, status: 'completed' },
    { id: 'DSR-010', date: 'Mar 10, 2026', time: '11:00 AM', type: 'EQK', zone: 'Salt Lake, Kolkata', severity: 'Minor', value: 'M 4.2', affected: 54, paid: 35, skipped: 19, totalPayout: 12950, status: 'completed' },
    { id: 'DSR-011', date: 'Mar 9, 2026', time: '7:15 AM', type: 'LDS', zone: 'Adyar, Chennai', severity: 'Severe', value: 'IMD L3', affected: 62, paid: 50, skipped: 12, totalPayout: 78000, status: 'completed' },
    { id: 'DSR-012', date: 'Mar 8, 2026', time: '5:45 PM', type: 'CRF', zone: 'Dharavi, Mumbai', severity: 'Severe', value: 'Govt Order', affected: 78, paid: 66, skipped: 12, totalPayout: 102960, status: 'completed' },
    { id: 'DSR-013', date: 'Mar 19, 2026', time: '4:30 PM', type: 'HRA', zone: 'Velachery, Chennai', severity: 'Severe', value: '108mm', affected: 56, paid: 0, skipped: 0, totalPayout: 0, status: 'active' },
];

const WEEKLY_PROFIT_DATA = [
    { week: 'W1', premiums: 42800, payouts: 24960, profit: 17840 },
    { week: 'W2', premiums: 47200, payouts: 31200, profit: 16000 },
    { week: 'W3', premiums: 51600, payouts: 18400, profit: 33200 },
    { week: 'W4', premiums: 48900, payouts: 42800, profit: 6100 },
    { week: 'W5', premiums: 54200, payouts: 29600, profit: 24600 },
    { week: 'W6', premiums: 58400, payouts: 35200, profit: 23200 },
    { week: 'W7', premiums: 62100, payouts: 28400, profit: 33700 },
    { week: 'W8', premiums: 37500, payouts: 22500, profit: 15000 },
];

const DISRUPTION_BREAKDOWN = [
    { name: 'HRA', label: 'Heavy Rain', count: 8, payout: 87420, color: '#3B82F6' },
    { name: 'MRA', label: 'Moderate Rain', count: 5, payout: 42180, color: '#60A5FA' },
    { name: 'LRA', label: 'Light Rain', count: 3, payout: 18640, color: '#93C5FD' },
    { name: 'SAQ', label: 'Severe AQI', count: 4, payout: 61200, color: '#F97316' },
    { name: 'MAQ', label: 'Moderate AQI', count: 6, payout: 29340, color: '#FB923C' },
    { name: 'STM', label: 'Storm', count: 2, payout: 54180, color: '#8B5CF6' },
    { name: 'FLD', label: 'Flood', count: 3, payout: 78920, color: '#06B6D4' },
    { name: 'CRF', label: 'Curfew', count: 1, payout: 102960, color: '#EF4444' },
    { name: 'EQK', label: 'Earthquake', count: 2, payout: 24680, color: '#D97706' },
    { name: 'LDS', label: 'Landslide', count: 1, payout: 78000, color: '#92400E' },
    { name: 'HTV', label: 'Heatwave', count: 4, payout: 38240, color: '#DC2626' },
    { name: 'FOG', label: 'Dense Fog', count: 3, payout: 19860, color: '#6B7280' },
    { name: 'WND', label: 'High Wind', count: 5, payout: 44320, color: '#10B981' },
];

export default function AdminDashboard({ onBack }) {
    const [activeTab, setActiveTab] = useState('overview');
    const [searchWorker, setSearchWorker] = useState('');
    const [sortBy, setSortBy] = useState('score');
    const [selectedDisruption, setSelectedDisruption] = useState(null);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    const totalWorkers = ZONES_DATA.reduce((a, b) => a + b.enrolled, 0);
    const totalPremiums = ZONES_DATA.reduce((a, b) => a + b.enrolled * b.premium, 0);
    const totalPayoutsWeekly = ZONES_DATA.reduce((a, b) => a + b.payouts, 0);
    const weeklyProfit = totalPremiums - totalPayoutsWeekly;
    const profitMargin = Math.round((weeklyProfit / totalPremiums) * 100);
    const avgScore = Math.round(WORKERS_DATA.reduce((a, b) => a + b.score, 0) / WORKERS_DATA.length);
    const activeDisruptions = RECENT_DISRUPTIONS.filter(d => d.status === 'active').length;

    const totalRevenue8w = WEEKLY_PROFIT_DATA.reduce((a, b) => a + b.premiums, 0);
    const totalPayouts8w = WEEKLY_PROFIT_DATA.reduce((a, b) => a + b.payouts, 0);
    const totalProfit8w = WEEKLY_PROFIT_DATA.reduce((a, b) => a + b.profit, 0);
    const lastWeek = WEEKLY_PROFIT_DATA[WEEKLY_PROFIT_DATA.length - 1];
    const thisWeekMargin = Math.round((lastWeek.profit / lastWeek.premiums) * 100);

    const filteredWorkers = WORKERS_DATA
        .filter(w =>
            w.name.toLowerCase().includes(searchWorker.toLowerCase()) ||
            w.id.toLowerCase().includes(searchWorker.toLowerCase()) ||
            w.zone.toLowerCase().includes(searchWorker.toLowerCase())
        )
        .sort((a, b) =>
            sortBy === 'score' ? b.score - a.score :
                sortBy === 'claims' ? b.claims - a.claims :
                    a.name.localeCompare(b.name)
        );

    const getDisruption = (code) => DISRUPTION_TYPES.find(d => d.code === code);
    const getSeverityColor = (s) => s === 'Severe' ? '#EF4444' : s === 'Moderate' ? '#F97316' : '#10B981';
    const getRiskColor = (r) => r === 'high' ? '#EF4444' : r === 'medium' ? '#F97316' : '#10B981';
    const getStatusColor = (s) => s === 'active' ? '#10B981' : s === 'paused' ? '#F97316' : s === 'review' ? '#EF4444' : '#10B981';
    const getZoneStatusColor = (s) => s === 'disrupted' ? '#EF4444' : s === 'active' ? '#F97316' : '#10B981';
    const getZoneStatusLabel = (s) => s === 'disrupted' ? 'DISRUPTED' : s === 'active' ? 'MONITORING' : 'SAFE';

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div style={{ backgroundColor: '#1E2130', border: '1px solid #2D3348', borderRadius: '10px', padding: '10px 14px' }}>
                    <p style={{ color: '#94A3B8', fontSize: '12px', marginBottom: '6px' }}>{label}</p>
                    {payload.map((p, i) => (
                        <p key={i} style={{ color: p.color, fontSize: '13px', fontWeight: '700' }}>
                            {p.name}: ₹{Number(p.value).toLocaleString()}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    const NAV_ITEMS = [
        { key: 'overview', label: 'Overview', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg> },
        { key: 'zones', label: 'Zones', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg> },
        { key: 'workers', label: 'Workers', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg> },
        { key: 'disruptions', label: 'Disruptions', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg> },
        { key: 'financials', label: 'Financials', icon: <span style={{ fontSize: '16px', fontWeight: '800', lineHeight: 1 }}>₹</span> },
    ];

    return (
        <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#111827', fontFamily: 'Inter', color: 'white' }}>

            {/* Sidebar */}
            <div style={{ width: sidebarCollapsed ? '60px' : '220px', backgroundColor: '#0D1117', borderRight: '1px solid #1E2530', height: '100vh', position: 'fixed', left: 0, top: 0, zIndex: 100, display: 'flex', flexDirection: 'column', transition: 'width 0.2s ease', overflow: 'hidden' }}>

                {/* Logo */}
                <div style={{ padding: '20px 16px', borderBottom: '1px solid #1E2530', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#F0A500', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                    </div>
                    {!sidebarCollapsed && (
                        <div>
                            <p style={{ color: 'white', fontWeight: '800', fontSize: '15px' }}>KavachPay</p>
                            <p style={{ color: '#F0A500', fontSize: '9px', letterSpacing: '1.5px', fontWeight: '700' }}>ADMIN PORTAL</p>
                        </div>
                    )}
                </div>

                {/* Live Status */}
                {!sidebarCollapsed && (
                    <div style={{ padding: '12px 16px', borderBottom: '1px solid #1E2530' }}>
                        <div style={{ backgroundColor: '#0F1F0F', borderRadius: '8px', padding: '10px 12px', border: '1px solid #1A3A1A' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10B981', position: 'relative', display: 'inline-block' }} />
                                <p style={{ color: '#10B981', fontSize: '11px', fontWeight: '700', letterSpacing: '0.5px' }}>SYSTEM LIVE</p>
                            </div>
                            <p style={{ color: '#6B7280', fontSize: '10px' }}>IMD • CPCB • NDMA</p>
                            <p style={{ color: '#6B7280', fontSize: '10px', marginTop: '2px' }}>Last sync: 2 min ago</p>
                        </div>
                    </div>
                )}

                {/* Nav */}
                <div style={{ flex: 1, padding: '12px 8px' }}>
                    {NAV_ITEMS.map(item => (
                        <button key={item.key} onClick={() => setActiveTab(item.key)}
                            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', borderRadius: '8px', border: 'none', cursor: 'pointer', marginBottom: '4px', backgroundColor: activeTab === item.key ? 'rgba(59,130,246,0.15)' : 'transparent', color: activeTab === item.key ? '#3B82F6' : '#6B7280', transition: 'all 0.15s ease', fontFamily: 'Inter' }}>
                            <div style={{ flexShrink: 0, width: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{item.icon}</div>
                            {!sidebarCollapsed && <p style={{ fontSize: '13px', fontWeight: activeTab === item.key ? '700' : '500', whiteSpace: 'nowrap' }}>{item.label}</p>}
                            {!sidebarCollapsed && activeTab === item.key && <div style={{ marginLeft: 'auto', width: '4px', height: '16px', backgroundColor: '#3B82F6', borderRadius: '2px' }} />}
                        </button>
                    ))}
                </div>

                {/* Bottom */}
                <div style={{ padding: '12px 8px', borderTop: '1px solid #1E2530' }}>
                    <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                        style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', borderRadius: '8px', border: 'none', cursor: 'pointer', backgroundColor: 'transparent', color: '#6B7280', fontFamily: 'Inter' }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            {sidebarCollapsed ? <polyline points="9 18 15 12 9 6" /> : <polyline points="15 18 9 12 15 6" />}
                        </svg>
                        {!sidebarCollapsed && <p style={{ fontSize: '12px' }}>Collapse</p>}
                    </button>
                    <button onClick={onBack}
                        style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', borderRadius: '8px', border: 'none', cursor: 'pointer', backgroundColor: 'transparent', color: '#6B7280', fontFamily: 'Inter', marginTop: '4px' }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
                        {!sidebarCollapsed && <p style={{ fontSize: '12px' }}>Exit Admin</p>}
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div style={{ marginLeft: sidebarCollapsed ? '60px' : '220px', flex: 1, transition: 'margin-left 0.2s ease', minHeight: '100vh' }}>

                {/* Top Bar */}
                <div style={{ backgroundColor: '#0D1117', borderBottom: '1px solid #1E2530', padding: '14px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 50 }}>
                    <div>
                        <p style={{ color: 'white', fontWeight: '700', fontSize: '16px' }}>{NAV_ITEMS.find(n => n.key === activeTab)?.label}</p>
                        <p style={{ color: '#6B7280', fontSize: '11px', marginTop: '2px' }}>KavachPay Operations Dashboard • Mar 20, 2026</p>
                    </div>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        {activeDisruptions > 0 && (
                            <div style={{ backgroundColor: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#EF4444', animation: 'pulse 2s ease-in-out infinite' }} />
                                <p style={{ color: '#EF4444', fontSize: '12px', fontWeight: '700' }}>{activeDisruptions} Active Disruption{activeDisruptions > 1 ? 's' : ''}</p>
                            </div>
                        )}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#1E2130', borderRadius: '8px', padding: '8px 12px', border: '1px solid #2D3348' }}>
                            <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#F0A500', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <p style={{ color: 'white', fontWeight: '800', fontSize: '12px' }}>A</p>
                            </div>
                            <div>
                                <p style={{ color: 'white', fontSize: '12px', fontWeight: '600' }}>Admin</p>
                                <p style={{ color: '#6B7280', fontSize: '10px' }}>Super Admin</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div style={{ padding: '24px 28px' }}>

                    {/* ─── OVERVIEW ─── */}
                    {activeTab === 'overview' && (
                        <div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
                                {[
                                    { label: 'Total Enrolled Workers', value: totalWorkers.toLocaleString(), sub: '12 active zones', color: '#3B82F6', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /></svg> },
                                    { label: 'Weekly Premiums Collected', value: '₹' + totalPremiums.toLocaleString(), sub: 'This week', color: '#10B981', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /></svg> },
                                    { label: 'Weekly Payouts Disbursed', value: '₹' + totalPayoutsWeekly.toLocaleString(), sub: 'This week', color: '#F97316', icon: <span style={{ fontSize: '18px', color: '#F97316', fontWeight: '800' }}>₹</span> },
                                    { label: 'Weekly Net Profit', value: '₹' + weeklyProfit.toLocaleString(), sub: profitMargin + '% profit margin', color: weeklyProfit > 0 ? '#10B981' : '#EF4444', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={weeklyProfit > 0 ? '#10B981' : '#EF4444'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17" /></svg> },
                                    { label: 'Avg KavachScore', value: avgScore, sub: 'Across all workers', color: '#8B5CF6', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="7" /></svg> },
                                    { label: 'Active Disruptions', value: activeDisruptions, sub: activeDisruptions > 0 ? 'Monitoring now' : 'All zones clear', color: activeDisruptions > 0 ? '#EF4444' : '#10B981', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={activeDisruptions > 0 ? '#EF4444' : '#10B981'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /></svg> },
                                ].map((kpi, i) => (
                                    <div key={i} style={{ backgroundColor: '#1E2130', borderRadius: '12px', padding: '18px', border: '1px solid #2D3348' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                                            <p style={{ color: '#6B7280', fontSize: '12px', fontWeight: '500', lineHeight: 1.4, maxWidth: '70%' }}>{kpi.label}</p>
                                            <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: kpi.color + '15', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{kpi.icon}</div>
                                        </div>
                                        <p style={{ color: 'white', fontWeight: '800', fontSize: '24px', letterSpacing: '-0.5px' }}>{kpi.value}</p>
                                        <p style={{ color: '#6B7280', fontSize: '11px', marginTop: '4px' }}>{kpi.sub}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Profit Chart */}
                            <div style={{ backgroundColor: '#1E2130', borderRadius: '12px', padding: '20px', border: '1px solid #2D3348', marginBottom: '20px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                    <div>
                                        <p style={{ color: 'white', fontWeight: '700', fontSize: '15px' }}>Revenue vs Payouts vs Profit</p>
                                        <p style={{ color: '#6B7280', fontSize: '12px', marginTop: '2px' }}>Last 8 weeks</p>
                                    </div>
                                    <div style={{ display: 'flex', gap: '16px' }}>
                                        {[{ label: 'Premiums', color: '#3B82F6' }, { label: 'Payouts', color: '#EF4444' }, { label: 'Profit', color: '#10B981' }].map((l, i) => (
                                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <div style={{ width: '10px', height: '10px', borderRadius: '2px', backgroundColor: l.color }} />
                                                <p style={{ color: '#94A3B8', fontSize: '11px' }}>{l.label}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <ResponsiveContainer width="100%" height={220}>
                                    <BarChart data={WEEKLY_PROFIT_DATA} barGap={4}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#1E2530" />
                                        <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#6B7280' }} axisLine={false} tickLine={false} />
                                        <YAxis tick={{ fontSize: 10, fill: '#6B7280' }} axisLine={false} tickLine={false} />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Bar dataKey="premiums" fill="#3B82F6" radius={[3, 3, 0, 0]} name="Premiums" />
                                        <Bar dataKey="payouts" fill="#EF4444" radius={[3, 3, 0, 0]} name="Payouts" />
                                        <Bar dataKey="profit" fill="#10B981" radius={[3, 3, 0, 0]} name="Profit" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div style={{ backgroundColor: '#1E2130', borderRadius: '12px', padding: '20px', border: '1px solid #2D3348' }}>
                                    <p style={{ color: 'white', fontWeight: '700', fontSize: '14px', marginBottom: '14px' }}>Live Zone Monitoring</p>
                                    {ZONES_DATA.filter(z => z.status !== 'safe').map((z, i) => (
                                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', backgroundColor: '#111827', borderRadius: '8px', marginBottom: '8px', border: `1px solid ${getZoneStatusColor(z.status)}30` }}>
                                            <div>
                                                <p style={{ color: 'white', fontWeight: '600', fontSize: '12px' }}>{z.zone.split(',')[0]}</p>
                                                <p style={{ color: '#6B7280', fontSize: '11px', marginTop: '2px' }}>{z.city} • {z.enrolled} workers</p>
                                            </div>
                                            <div style={{ backgroundColor: getZoneStatusColor(z.status) + '20', border: `1px solid ${getZoneStatusColor(z.status)}40`, borderRadius: '6px', padding: '3px 8px' }}>
                                                <p style={{ color: getZoneStatusColor(z.status), fontSize: '10px', fontWeight: '700' }}>{getZoneStatusLabel(z.status)}</p>
                                            </div>
                                        </div>
                                    ))}
                                    {ZONES_DATA.filter(z => z.status !== 'safe').length === 0 && (
                                        <p style={{ color: '#6B7280', fontSize: '13px', textAlign: 'center', padding: '20px 0' }}>All zones clear</p>
                                    )}
                                </div>

                                <div style={{ backgroundColor: '#1E2130', borderRadius: '12px', padding: '20px', border: '1px solid #2D3348' }}>
                                    <p style={{ color: 'white', fontWeight: '700', fontSize: '14px', marginBottom: '14px' }}>Recent Disruption Events</p>
                                    {RECENT_DISRUPTIONS.slice(0, 5).map((d, i) => {
                                        const dtype = getDisruption(d.type);
                                        return (
                                            <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'center', padding: '8px 0', borderBottom: i < 4 ? '1px solid #1E2530' : 'none' }}>
                                                <div style={{ width: '28px', height: '28px', borderRadius: '6px', backgroundColor: (dtype?.color || '#6B7280') + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', flexShrink: 0 }}>{dtype?.icon}</div>
                                                <div style={{ flex: 1 }}>
                                                    <p style={{ color: 'white', fontSize: '12px', fontWeight: '600' }}>{dtype?.label} — {d.zone.split(',')[0]}</p>
                                                    <p style={{ color: '#6B7280', fontSize: '10px', marginTop: '2px' }}>{d.date} • {d.paid} paid / {d.skipped} skipped</p>
                                                </div>
                                                <p style={{ color: '#10B981', fontSize: '12px', fontWeight: '700', flexShrink: 0 }}>₹{d.totalPayout.toLocaleString()}</p>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ─── ZONES ─── */}
                    {activeTab === 'zones' && (
                        <div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '16px' }}>
                                {[
                                    { label: 'Total Zones', value: ZONES_DATA.length, color: '#3B82F6' },
                                    { label: 'Disrupted', value: ZONES_DATA.filter(z => z.status === 'disrupted').length, color: '#EF4444' },
                                    { label: 'Monitoring', value: ZONES_DATA.filter(z => z.status === 'active').length, color: '#F97316' },
                                ].map((s, i) => (
                                    <div key={i} style={{ backgroundColor: '#1E2130', borderRadius: '10px', padding: '16px', border: '1px solid #2D3348', textAlign: 'center' }}>
                                        <p style={{ color: s.color, fontWeight: '800', fontSize: '28px' }}>{s.value}</p>
                                        <p style={{ color: '#6B7280', fontSize: '12px', marginTop: '4px' }}>{s.label}</p>
                                    </div>
                                ))}
                            </div>
                            <div style={{ backgroundColor: '#1E2130', borderRadius: '12px', border: '1px solid #2D3348', overflow: 'hidden' }}>
                                <div style={{ padding: '16px 20px', borderBottom: '1px solid #1E2530' }}>
                                    <p style={{ color: 'white', fontWeight: '700', fontSize: '14px' }}>All Zones — Risk and Coverage</p>
                                </div>
                                <div style={{ overflowX: 'auto' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                        <thead>
                                            <tr>
                                                {['Zone', 'City', 'Risk', 'Enrolled', 'Premium', 'Coverage', 'Weekly Payout', 'Status'].map(h => (
                                                    <th key={h} style={{ backgroundColor: '#111827', color: '#6B7280', fontSize: '11px', fontWeight: '600', padding: '12px 16px', textAlign: 'left', borderBottom: '1px solid #1E2530', letterSpacing: '0.5px', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {ZONES_DATA.map((z, i) => (
                                                <tr key={i} style={{ borderBottom: '1px solid #1E2530', transition: 'background-color 0.15s ease' }}
                                                    onMouseEnter={e => e.currentTarget.style.backgroundColor = '#252A3A'}
                                                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                                                    <td style={{ padding: '12px 16px', color: 'white', fontSize: '13px', fontWeight: '600', whiteSpace: 'nowrap' }}>{z.zone.split(',')[0]}</td>
                                                    <td style={{ padding: '12px 16px', color: '#94A3B8', fontSize: '12px' }}>{z.city}</td>
                                                    <td style={{ padding: '12px 16px' }}>
                                                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', backgroundColor: getRiskColor(z.risk) + '20', border: `1px solid ${getRiskColor(z.risk)}40`, borderRadius: '6px', padding: '3px 8px' }}>
                                                            <div style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: getRiskColor(z.risk) }} />
                                                            <p style={{ color: getRiskColor(z.risk), fontSize: '11px', fontWeight: '700', textTransform: 'uppercase' }}>{z.risk}</p>
                                                        </div>
                                                    </td>
                                                    <td style={{ padding: '12px 16px', color: '#94A3B8', fontSize: '13px' }}>{z.enrolled} / {z.workers}</td>
                                                    <td style={{ padding: '12px 16px', color: '#94A3B8', fontSize: '13px' }}>₹{z.premium}/wk</td>
                                                    <td style={{ padding: '12px 16px', color: '#94A3B8', fontSize: '13px' }}>₹{z.coverage}/wk</td>
                                                    <td style={{ padding: '12px 16px', color: '#10B981', fontSize: '13px', fontWeight: '600' }}>₹{z.payouts.toLocaleString()}</td>
                                                    <td style={{ padding: '12px 16px' }}>
                                                        <div style={{ display: 'inline-flex', backgroundColor: getZoneStatusColor(z.status) + '20', border: `1px solid ${getZoneStatusColor(z.status)}40`, borderRadius: '6px', padding: '3px 8px' }}>
                                                            <p style={{ color: getZoneStatusColor(z.status), fontSize: '10px', fontWeight: '700' }}>{getZoneStatusLabel(z.status)}</p>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ─── WORKERS ─── */}
                    {activeTab === 'workers' && (
                        <div>
                            <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
                                <input type="text" placeholder="Search by name, ID or zone..." value={searchWorker} onChange={e => setSearchWorker(e.target.value)}
                                    style={{ flex: 1, minWidth: '200px', padding: '10px 14px', backgroundColor: '#1E2130', color: 'white', border: '1px solid #2D3348', borderRadius: '8px', fontSize: '13px', fontFamily: 'Inter', outline: 'none' }} />
                                <select value={sortBy} onChange={e => setSortBy(e.target.value)}
                                    style={{ padding: '10px 14px', backgroundColor: '#1E2130', color: 'white', border: '1px solid #2D3348', borderRadius: '8px', fontSize: '13px', fontFamily: 'Inter', outline: 'none', cursor: 'pointer' }}>
                                    <option value="score">Sort by Score</option>
                                    <option value="name">Sort by Name</option>
                                    <option value="claims">Sort by Claims</option>
                                </select>
                            </div>

                            <div style={{ backgroundColor: '#1E2130', borderRadius: '12px', border: '1px solid #2D3348', overflow: 'hidden' }}>
                                <div style={{ padding: '16px 20px', borderBottom: '1px solid #1E2530', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <p style={{ color: 'white', fontWeight: '700', fontSize: '14px' }}>Workers ({filteredWorkers.length})</p>
                                    <p style={{ color: '#6B7280', fontSize: '12px' }}>Showing {filteredWorkers.length} of {WORKERS_DATA.length}</p>
                                </div>
                                <div style={{ overflowX: 'auto' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                        <thead>
                                            <tr>
                                                {['Worker', 'Employee ID', 'Zone', 'Platform', 'KavachScore', 'Premium', 'Last Payout', 'Claims', 'Status'].map(h => (
                                                    <th key={h} style={{ backgroundColor: '#111827', color: '#6B7280', fontSize: '11px', fontWeight: '600', padding: '12px 16px', textAlign: 'left', borderBottom: '1px solid #1E2530', letterSpacing: '0.5px', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredWorkers.map((w, i) => (
                                                <tr key={i} style={{ borderBottom: '1px solid #1E2530', transition: 'background-color 0.15s ease' }}
                                                    onMouseEnter={e => e.currentTarget.style.backgroundColor = '#252A3A'}
                                                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                                                    <td style={{ padding: '12px 16px' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                            <div style={{ width: '30px', height: '30px', borderRadius: '50%', backgroundColor: '#3B82F620', border: '1px solid #3B82F640', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                                <p style={{ color: '#3B82F6', fontWeight: '700', fontSize: '12px' }}>{w.name[0]}</p>
                                                            </div>
                                                            <p style={{ color: 'white', fontSize: '13px', fontWeight: '600', whiteSpace: 'nowrap' }}>{w.name}</p>
                                                        </div>
                                                    </td>
                                                    <td style={{ padding: '12px 16px', color: '#6B7280', fontSize: '12px', fontFamily: 'monospace' }}>{w.id}</td>
                                                    <td style={{ padding: '12px 16px', color: '#94A3B8', fontSize: '12px', whiteSpace: 'nowrap' }}>{w.zone.split(',')[0]}</td>
                                                    <td style={{ padding: '12px 16px', color: '#94A3B8', fontSize: '12px' }}>{w.platform}</td>
                                                    <td style={{ padding: '12px 16px' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                            <div style={{ width: '40px', height: '4px', backgroundColor: '#1E2530', borderRadius: '2px', overflow: 'hidden' }}>
                                                                <div style={{ width: ((w.score - 300) / 600 * 100) + '%', height: '100%', backgroundColor: w.score >= 750 ? '#10B981' : w.score >= 500 ? '#F97316' : '#EF4444', borderRadius: '2px' }} />
                                                            </div>
                                                            <p style={{ color: w.score >= 750 ? '#10B981' : w.score >= 500 ? '#F97316' : '#EF4444', fontSize: '13px', fontWeight: '700' }}>{w.score}</p>
                                                        </div>
                                                    </td>
                                                    <td style={{ padding: '12px 16px', color: '#94A3B8', fontSize: '13px' }}>₹{w.premium}/wk</td>
                                                    <td style={{ padding: '12px 16px', color: '#10B981', fontSize: '13px', fontWeight: '600' }}>{w.lastPayout}</td>
                                                    <td style={{ padding: '12px 16px', color: '#94A3B8', fontSize: '13px' }}>{w.claims}</td>
                                                    <td style={{ padding: '12px 16px' }}>
                                                        <div style={{ display: 'inline-flex', backgroundColor: getStatusColor(w.status) + '20', border: `1px solid ${getStatusColor(w.status)}40`, borderRadius: '6px', padding: '3px 8px' }}>
                                                            <p style={{ color: getStatusColor(w.status), fontSize: '10px', fontWeight: '700', textTransform: 'uppercase' }}>{w.status}</p>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ─── DISRUPTIONS ─── */}
                    {activeTab === 'disruptions' && (
                        <div>
                            <div style={{ backgroundColor: '#1E2130', borderRadius: '12px', padding: '20px', border: '1px solid #2D3348', marginBottom: '20px' }}>
                                <p style={{ color: 'white', fontWeight: '700', fontSize: '14px', marginBottom: '16px' }}>All 13 Disruption Types</p>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px' }}>
                                    {DISRUPTION_TYPES.map((d, i) => (
                                        <div key={i} style={{ backgroundColor: '#111827', borderRadius: '10px', padding: '12px 8px', textAlign: 'center', border: `1px solid ${d.color}30` }}>
                                            <div style={{ fontSize: '22px', marginBottom: '6px' }}>{d.icon}</div>
                                            <p style={{ color: d.color, fontSize: '10px', fontWeight: '700', letterSpacing: '0.5px' }}>{d.code}</p>
                                            <p style={{ color: '#6B7280', fontSize: '10px', marginTop: '2px', lineHeight: 1.3 }}>{d.label}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div style={{ backgroundColor: '#1E2130', borderRadius: '12px', border: '1px solid #2D3348', overflow: 'hidden' }}>
                                <div style={{ padding: '16px 20px', borderBottom: '1px solid #1E2530' }}>
                                    <p style={{ color: 'white', fontWeight: '700', fontSize: '14px' }}>Recent Disruption Events — All Types</p>
                                </div>
                                {RECENT_DISRUPTIONS.map((d, i) => {
                                    const dtype = getDisruption(d.type);
                                    const isExpanded = selectedDisruption === i;
                                    return (
                                        <div key={i} style={{ borderBottom: i < RECENT_DISRUPTIONS.length - 1 ? '1px solid #1E2530' : 'none' }}>
                                            <div onClick={() => setSelectedDisruption(isExpanded ? null : i)}
                                                style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', gap: '14px', cursor: 'pointer', backgroundColor: isExpanded ? '#111827' : 'transparent', transition: 'background-color 0.15s ease' }}
                                                onMouseEnter={e => { if (!isExpanded) e.currentTarget.style.backgroundColor = '#252A3A'; }}
                                                onMouseLeave={e => { if (!isExpanded) e.currentTarget.style.backgroundColor = 'transparent'; }}>
                                                <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: (dtype?.color || '#6B7280') + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', flexShrink: 0 }}>{dtype?.icon}</div>
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                                                        <p style={{ color: 'white', fontWeight: '600', fontSize: '13px' }}>{dtype?.label}</p>
                                                        <div style={{ backgroundColor: (dtype?.color || '#6B7280') + '20', borderRadius: '4px', padding: '2px 6px' }}>
                                                            <p style={{ color: dtype?.color || '#6B7280', fontSize: '10px', fontWeight: '700' }}>{d.type}</p>
                                                        </div>
                                                        <div style={{ backgroundColor: getSeverityColor(d.severity) + '20', borderRadius: '4px', padding: '2px 6px' }}>
                                                            <p style={{ color: getSeverityColor(d.severity), fontSize: '10px', fontWeight: '700' }}>{d.severity.toUpperCase()}</p>
                                                        </div>
                                                        {d.status === 'active' && (
                                                            <div style={{ backgroundColor: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.4)', borderRadius: '4px', padding: '2px 6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                                <div style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: '#EF4444', animation: 'pulse 2s ease-in-out infinite' }} />
                                                                <p style={{ color: '#EF4444', fontSize: '10px', fontWeight: '700' }}>ACTIVE</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <p style={{ color: '#6B7280', fontSize: '11px' }}>{d.zone} • {d.date} {d.time} • {d.value}</p>
                                                </div>
                                                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                                    <p style={{ color: '#10B981', fontWeight: '700', fontSize: '14px' }}>₹{d.totalPayout.toLocaleString()}</p>
                                                    <p style={{ color: '#6B7280', fontSize: '11px', marginTop: '2px' }}>{d.paid} paid / {d.skipped} skipped</p>
                                                </div>
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }}>
                                                    <polyline points="6 9 12 15 18 9" />
                                                </svg>
                                            </div>
                                            {isExpanded && (
                                                <div style={{ padding: '16px 20px 20px 70px', backgroundColor: '#111827', borderTop: '1px solid #1E2530' }}>
                                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                                                        {[
                                                            { label: 'Affected Workers', value: d.affected },
                                                            { label: 'Paid Out', value: d.paid },
                                                            { label: 'Skipped', value: d.skipped },
                                                            { label: 'Total Payout', value: '₹' + d.totalPayout.toLocaleString() },
                                                        ].map((s, j) => (
                                                            <div key={j} style={{ backgroundColor: '#1E2130', borderRadius: '8px', padding: '12px', border: '1px solid #2D3348' }}>
                                                                <p style={{ color: '#6B7280', fontSize: '10px', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{s.label}</p>
                                                                <p style={{ color: 'white', fontWeight: '700', fontSize: '16px' }}>{s.value}</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <p style={{ color: '#6B7280', fontSize: '11px', marginTop: '12px' }}>ID: {d.id} • 5-layer behavioral verification • Source: IMD/CPCB/NDMA</p>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* ─── FINANCIALS ─── */}
                    {activeTab === 'financials' && (
                        <div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
                                {[
                                    { label: 'Total Premium Revenue', value: '₹' + totalRevenue8w.toLocaleString(), sub: 'Last 8 weeks', color: '#3B82F6' },
                                    { label: 'Total Payouts', value: '₹' + totalPayouts8w.toLocaleString(), sub: 'Last 8 weeks', color: '#EF4444' },
                                    { label: 'Net Profit', value: '₹' + totalProfit8w.toLocaleString(), sub: 'Last 8 weeks', color: '#10B981' },
                                    { label: 'Profit Margin', value: thisWeekMargin + '%', sub: 'This week', color: thisWeekMargin > 30 ? '#10B981' : thisWeekMargin > 15 ? '#F97316' : '#EF4444' },
                                ].map((kpi, i) => (
                                    <div key={i} style={{ backgroundColor: '#1E2130', borderRadius: '12px', padding: '18px', border: '1px solid #2D3348' }}>
                                        <p style={{ color: '#6B7280', fontSize: '12px', marginBottom: '10px' }}>{kpi.label}</p>
                                        <p style={{ color: kpi.color, fontWeight: '800', fontSize: '22px', letterSpacing: '-0.5px' }}>{kpi.value}</p>
                                        <p style={{ color: '#6B7280', fontSize: '11px', marginTop: '4px' }}>{kpi.sub}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Profit Trend */}
                            <div style={{ backgroundColor: '#1E2130', borderRadius: '12px', padding: '20px', border: '1px solid #2D3348', marginBottom: '20px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                    <div>
                                        <p style={{ color: 'white', fontWeight: '700', fontSize: '15px' }}>Profit Trend</p>
                                        <p style={{ color: '#6B7280', fontSize: '12px', marginTop: '2px' }}>Weekly net profit — last 8 weeks</p>
                                    </div>
                                    <div style={{ backgroundColor: thisWeekMargin >= 0 ? '#10B98120' : '#EF444420', border: `1px solid ${thisWeekMargin >= 0 ? '#10B98140' : '#EF444440'}`, borderRadius: '8px', padding: '6px 12px' }}>
                                        <p style={{ color: thisWeekMargin >= 0 ? '#10B981' : '#EF4444', fontSize: '12px', fontWeight: '700' }}>
                                            {thisWeekMargin >= 0 ? '+' : ''}{thisWeekMargin}% margin this week
                                        </p>
                                    </div>
                                </div>
                                <ResponsiveContainer width="100%" height={200}>
                                    <AreaChart data={WEEKLY_PROFIT_DATA}>
                                        <defs>
                                            <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#1E2530" />
                                        <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#6B7280' }} axisLine={false} tickLine={false} />
                                        <YAxis tick={{ fontSize: 10, fill: '#6B7280' }} axisLine={false} tickLine={false} />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Area type="monotone" dataKey="profit" stroke="#10B981" strokeWidth={3} fill="url(#profitGrad)" name="Profit" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Zone Profit Breakdown */}
                            <div style={{ backgroundColor: '#1E2130', borderRadius: '12px', padding: '20px', border: '1px solid #2D3348', marginBottom: '20px' }}>
                                <p style={{ color: 'white', fontWeight: '700', fontSize: '14px', marginBottom: '4px' }}>Premium vs Payout by Zone</p>
                                <p style={{ color: '#6B7280', fontSize: '12px', marginBottom: '16px' }}>Weekly profit margin per zone</p>
                                {ZONES_DATA.map((z, i) => {
                                    const zonePremium = z.enrolled * z.premium;
                                    const zoneProfit = zonePremium - z.payouts;
                                    const profitPct = Math.round((zoneProfit / zonePremium) * 100);
                                    const isProfit = profitPct >= 0;
                                    return (
                                        <div key={i} style={{ marginBottom: '14px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                                <p style={{ color: 'white', fontSize: '12px', fontWeight: '600' }}>{z.zone.split(',')[0]}</p>
                                                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                                                    <p style={{ color: '#3B82F6', fontSize: '12px' }}>₹{zonePremium.toLocaleString()}</p>
                                                    <p style={{ color: isProfit ? '#10B981' : '#EF4444', fontSize: '12px', fontWeight: '700' }}>{isProfit ? '+' : ''}{profitPct}%</p>
                                                </div>
                                            </div>
                                            <div style={{ backgroundColor: '#111827', borderRadius: '4px', height: '8px', overflow: 'hidden' }}>
                                                <div style={{ width: Math.min(100, Math.max(5, profitPct + 10)) + '%', height: '100%', backgroundColor: isProfit ? '#10B981' : '#EF4444', borderRadius: '4px', transition: 'width 0.6s ease' }} />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Disruption Cost Breakdown */}
                            <div style={{ backgroundColor: '#1E2130', borderRadius: '12px', padding: '20px', border: '1px solid #2D3348' }}>
                                <p style={{ color: 'white', fontWeight: '700', fontSize: '14px', marginBottom: '16px' }}>Payout Cost by Disruption Type</p>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                                    {DISRUPTION_BREAKDOWN.sort((a, b) => b.payout - a.payout).map((d, i) => (
                                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', backgroundColor: '#111827', borderRadius: '8px', border: `1px solid ${d.color}20` }}>
                                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: d.color, flexShrink: 0 }} />
                                            <div style={{ flex: 1 }}>
                                                <p style={{ color: 'white', fontSize: '12px', fontWeight: '600' }}>{d.label}</p>
                                                <p style={{ color: '#6B7280', fontSize: '11px' }}>{d.count} events</p>
                                            </div>
                                            <p style={{ color: d.color, fontSize: '12px', fontWeight: '700' }}>₹{d.payout.toLocaleString()}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}