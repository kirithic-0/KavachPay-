import React, { useState, useEffect } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
    CartesianGrid, AreaChart, Area
} from 'recharts';

// ─── API CONFIG ───
const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// ─── API CALLS ───
const api = {
    getOverview: async () => {
        const token = localStorage.getItem('adminToken');

        if (!token) {
            console.error("No token found");
            return;
        }

        const res = await fetch(`${API_BASE}/api/admin/overview`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        return await res.json();
    },
    getZones: async () => {
        return await fetch(`${API_BASE}/api/admin/zones`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` }
        }).then(r => r.json());
    },
    getWorkers: async (page = 1, search = '', sort = 'score') => {
        return await fetch(`${API_BASE}/api/admin/workers?page=${page}&search=${search}&sort=${sort}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` }
        }).then(r => r.json());
    },
    getDisruptions: async () => {
        return await fetch(`${API_BASE}/api/admin/disruptions`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` }
        }).then(r => r.json());
    },
    getAnalytics: async () => {
        return await fetch(`${API_BASE}/api/admin/analytics`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` }
        }).then(r => r.json());
    },
    simulateDisruption: async (data) => {
        return await fetch(`${API_BASE}/api/disruptions/simulate`, {
            method: 'POST',
            headers: { 
                'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
                'Content-Type': 'application/json' 
            },
            body: JSON.stringify(data)
        }).then(r => r.json());
    }
};

// ─── STATIC DATA ───
const DISRUPTION_TYPES = [
    { code: 'HRA', label: 'Heavy Rain', color: '#3B82F6' },
    { code: 'MRA', label: 'Moderate Rain', color: '#60A5FA' },
    { code: 'LRA', label: 'Light Rain', color: '#93C5FD' },
    { code: 'SAQ', label: 'Severe AQI', color: '#F97316' },
    { code: 'MAQ', label: 'Moderate AQI', color: '#FB923C' },
    { code: 'STM', label: 'Storm', color: '#8B5CF6' },
    { code: 'FLD', label: 'Flood', color: '#06B6D4' },
    { code: 'CRF', label: 'Curfew', color: '#EF4444' },
    { code: 'EQK', label: 'Earthquake', color: '#D97706' },
    { code: 'LDS', label: 'Landslide', color: '#92400E' },
    { code: 'HTV', label: 'Heatwave', color: '#DC2626' },
    { code: 'FOG', label: 'Dense Fog', color: '#6B7280' },
    { code: 'WND', label: 'High Wind', color: '#10B981' },
    { code: 'PND', label: 'Pandemic', color: '#8B5CF6' },
    { code: 'WAR', label: 'War', color: '#EF4444' },
];

export default function AdminDashboard({ onBack }) {
    const [activeTab, setActiveTab] = useState('overview');
    const [searchWorker, setSearchWorker] = useState('');
    const [sortBy, setSortBy] = useState('score');
    const [selectedDisruption, setSelectedDisruption] = useState(null);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [hoveredRow, setHoveredRow] = useState(null);
    const [loading, setLoading] = useState(true);

    // Simulate Modal State
    const [isSimulateModalOpen, setIsSimulateModalOpen] = useState(false);
    const [simLoading, setSimLoading] = useState(false);
    const [simData, setSimData] = useState({
        city: 'Bangalore', zone: 'Koramangala', code: 'HRA',
        severity: 'Severe', measured_value: 105, description: 'Roads fully flooded, impossible to proceed.'
    });

    // Dynamic Data State
    const [overview, setOverview] = useState({ 
        total_enrolled: 0, 
        total_premiums_weekly: 0, 
        total_payouts_weekly: 0, 
        weekly_profit: 0, 
        profit_margin: 0, 
        avg_score: 750, 
        active_disruptions: 0 
    });
    const [zones, setZones] = useState([]);
    const [workers, setWorkers] = useState([]);
    const [disruptions, setDisruptions] = useState([]);
    const [analytics, setAnalytics] = useState({ 
        weekly: [], 
        zones: [], 
        fraud: { totalFlagged: 0, fraudRate: 0, savedAmount: 0 } 
    });

    useEffect(() => {
        const loadAllData = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem('adminToken');
                if (!token) throw new Error("No admin token found. Please log in again.");

                const [ov, zn, wk, ds, an] = await Promise.all([
                    api.getOverview(),
                    api.getZones(),
                    api.getWorkers(1, searchWorker, sortBy),
                    api.getDisruptions(),
                    api.getAnalytics()
                ]);

                const firstError = [ov, zn, wk, ds, an].find(r => r.error);
                if (firstError) {
                    throw new Error(firstError.detail || firstError.error);
                }

                setOverview(ov);
                setZones(zn.zones || []);
                setWorkers(wk.workers || []);
                setDisruptions(ds.disruptions || []);
                setAnalytics(an);
                setLoading(false);
            } catch (e) {
                console.error("Dashboard Load Error:", e);
                setLoading(false);
                if (e.message && (e.message.toLowerCase().includes('unauthorized') || e.message.toLowerCase().includes('denied') || e.message.toLowerCase().includes('token'))) {
                    localStorage.removeItem('adminToken');
                    onBack(); // Kick to login
                }
            }
        };
        loadAllData();
    }, [onBack, searchWorker, sortBy]);

    // Refresh workers on search/sort
    useEffect(() => {
        // Skip on initial mount since loadAllData already fetches workers
        if (loading || (searchWorker === '' && sortBy === 'score')) return;
        
        const refreshWorkers = async () => {
            const wk = await api.getWorkers(1, searchWorker, sortBy);
            if (wk.workers) setWorkers(wk.workers);
        };
        refreshWorkers();
    }, [searchWorker, sortBy, loading]);

    const getDisruptionType = (code) => DISRUPTION_TYPES.find(d => d.code === code);
    const getSeverityColor = (s) => s === 'Severe' ? '#EF4444' : s === 'Moderate' ? '#F97316' : '#10B981';
    const getRiskColor = (r) => r === 'high' ? '#EF4444' : r === 'medium' ? '#F97316' : '#10B981';
    const getStatusColor = (s) => s === 'active' ? '#10B981' : s === 'paused' ? '#F97316' : s === 'review' ? '#EF4444' : '#10B981';
    const getZoneStatusColor = (s) => s === 'disrupted' ? '#EF4444' : s === 'active' ? '#F97316' : '#10B981';
    const getZoneStatusLabel = (s) => s === 'disrupted' ? 'DISRUPTED' : s === 'active' ? 'MONITORING' : 'SAFE';

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload?.length) return (
            <div style={{ backgroundColor: '#1E2130', border: '1px solid #2D3348', borderRadius: 10, padding: '10px 14px' }}>
                <p style={{ color: '#94A3B8', fontSize: 12, marginBottom: 6 }}>{label}</p>
                {payload.map((p, i) => (
                    <p key={i} style={{ color: p.color, fontSize: 13, fontWeight: 700 }}>
                        {p.name}: ₹{Number(p.value).toLocaleString()}
                    </p>
                ))}
            </div>
        );
        return null;
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#111827', alignItems: 'center', justifyContent: 'center' }}>
                <p style={{ color: '#3B82F6', fontWeight: 700 }}>Loading Dashboard Data...</p>
            </div>
        );
    }

    const NAV_ITEMS = [
        { key: 'overview', label: 'Overview', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg> },
        { key: 'zones', label: 'Zones', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg> },
        { key: 'workers', label: 'Workers', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg> },
        { key: 'disruptions', label: 'Disruptions', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg> },
        { key: 'financials', label: 'Financials', icon: <span style={{ fontSize: 15, fontWeight: 800, lineHeight: 1 }}>₹</span> },
    ];

    const thStyle = {
        backgroundColor: '#0D1117',
        color: '#6B7280',
        fontSize: 11,
        fontWeight: 600,
        padding: '12px 16px',
        textAlign: 'left',
        borderBottom: '1px solid #1E2530',
        letterSpacing: '0.5px',
        textTransform: 'uppercase',
        whiteSpace: 'nowrap',
    };

    const getTdStyle = (rowIdx) => ({
        padding: '13px 16px',
        borderBottom: '1px solid #1E2530',
        fontSize: 13,
        color: hoveredRow === rowIdx ? '#FFFFFF' : '#CBD5E1',
        transition: 'color 0.15s ease',
    });

    const getRowStyle = (rowIdx) => ({
        backgroundColor: hoveredRow === rowIdx ? '#252A3A' : 'transparent',
        transition: 'background-color 0.15s ease',
        cursor: 'default',
    });

    return (
        <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#111827', fontFamily: 'Inter, sans-serif', color: 'white' }}>

            {/* ─── SIDEBAR ─── */}
            <div style={{ width: sidebarCollapsed ? 60 : 220, backgroundColor: '#0D1117', borderRight: '1px solid #1E2530', height: '100vh', position: 'fixed', left: 0, top: 0, zIndex: 100, display: 'flex', flexDirection: 'column', transition: 'width 0.2s ease', overflow: 'hidden' }}>

                {/* Logo */}
                <div style={{ padding: '18px 16px', borderBottom: '1px solid #1E2530', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <svg width="32" height="32" viewBox="0 0 100 100" fill="none">
                        <circle cx="50" cy="50" r="50" fill="#1A3A5C" />
                        <text x="50" y="68" textAnchor="middle" fontSize="50" fill="white" fontWeight="bold" fontFamily="Georgia, serif">₹</text>
                    </svg>
                    {!sidebarCollapsed && (
                        <div>
                            <p style={{ color: 'white', fontWeight: 900, fontSize: 14, letterSpacing: 1.5 }}>KAVACHPAY</p>
                            <p style={{ color: '#F0A500', fontSize: 9, letterSpacing: 1.5, fontWeight: 700, marginTop: 1 }}>ADMIN PORTAL</p>
                        </div>
                    )}
                </div>

                {/* Live Status */}
                {!sidebarCollapsed && (
                    <div style={{ padding: '12px 16px', borderBottom: '1px solid #1E2530' }}>
                        <div style={{ backgroundColor: '#0F1F0F', borderRadius: 8, padding: '10px 12px', border: '1px solid #1A3A1A' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
                                <div style={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: '#10B981', animation: 'pulse 2s infinite' }} />
                                <p style={{ color: '#10B981', fontSize: 11, fontWeight: 700, letterSpacing: 0.5 }}>SYSTEM LIVE</p>
                            </div>
                            <p style={{ color: '#6B7280', fontSize: 10 }}>IMD · CPCB · NDMA</p>
                            <p style={{ color: '#6B7280', fontSize: 10, marginTop: 2 }}>Last sync: 2 min ago</p>
                        </div>
                    </div>
                )}

                {/* Nav Items */}
                <div style={{ flex: 1, padding: '12px 8px' }}>
                    {NAV_ITEMS.map(item => (
                        <button key={item.key} onClick={() => setActiveTab(item.key)}
                            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 8, border: 'none', cursor: 'pointer', marginBottom: 4, backgroundColor: activeTab === item.key ? 'rgba(59,130,246,0.15)' : 'transparent', color: activeTab === item.key ? '#3B82F6' : '#6B7280', transition: 'all 0.15s ease', fontFamily: 'Inter, sans-serif' }}>
                            <div style={{ flexShrink: 0, width: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{item.icon}</div>
                            {!sidebarCollapsed && (
                                <>
                                    <p style={{ fontSize: 13, fontWeight: activeTab === item.key ? 700 : 500, whiteSpace: 'nowrap' }}>{item.label}</p>
                                    {activeTab === item.key && <div style={{ marginLeft: 'auto', width: 4, height: 16, backgroundColor: '#3B82F6', borderRadius: 2 }} />}
                                </>
                            )}
                        </button>
                    ))}
                </div>

                {/* Bottom */}
                <div style={{ padding: '12px 8px', borderTop: '1px solid #1E2530' }}>
                    <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                        style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 8, border: 'none', cursor: 'pointer', backgroundColor: 'transparent', color: '#6B7280', fontFamily: 'Inter, sans-serif' }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            {sidebarCollapsed ? <polyline points="9 18 15 12 9 6" /> : <polyline points="15 18 9 12 15 6" />}
                        </svg>
                        {!sidebarCollapsed && <p style={{ fontSize: 12 }}>Collapse</p>}
                    </button>
                    <button onClick={onBack}
                        style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 8, border: 'none', cursor: 'pointer', backgroundColor: 'transparent', color: '#6B7280', fontFamily: 'Inter, sans-serif', marginTop: 4 }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
                        {!sidebarCollapsed && <p style={{ fontSize: 12 }}>Exit Admin</p>}
                    </button>
                </div>
            </div>

            {/* ─── MAIN CONTENT ─── */}
            <div style={{ marginLeft: sidebarCollapsed ? 60 : 220, flex: 1, transition: 'margin-left 0.2s ease', minHeight: '100vh' }}>

                {/* Top Bar */}
                <div style={{ backgroundColor: '#0D1117', borderBottom: '1px solid #1E2530', padding: '14px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 50 }}>
                    <div>
                        <p style={{ color: 'white', fontWeight: 700, fontSize: 16 }}>{NAV_ITEMS.find(n => n.key === activeTab)?.label}</p>
                        <p style={{ color: '#6B7280', fontSize: 11, marginTop: 2 }}>KavachPay Operations · Mar 27, 2026</p>
                    </div>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                        {overview.active_disruptions > 0 && (
                            <div style={{ backgroundColor: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, padding: '6px 12px', display: 'flex', alignItems: 'center', gap: 6 }}>
                                <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#EF4444', animation: 'pulse 2s infinite' }} />
                                <p style={{ color: '#EF4444', fontSize: 12, fontWeight: 700 }}>{overview.active_disruptions} Active Disruption{overview.active_disruptions > 1 ? 's' : ''}</p>
                            </div>
                        )}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, backgroundColor: '#1E2130', borderRadius: 8, padding: '8px 12px', border: '1px solid #2D3348' }}>
                            <div style={{ width: 28, height: 28, borderRadius: '50%', backgroundColor: '#1A3A5C', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <p style={{ color: 'white', fontWeight: 800, fontSize: 12 }}>A</p>
                            </div>
                            <div>
                                <p style={{ color: 'white', fontSize: 12, fontWeight: 600 }}>Admin</p>
                                <p style={{ color: '#6B7280', fontSize: 10 }}>Super Admin</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div style={{ padding: '24px 28px' }}>

                    {/* ─── OVERVIEW ─── */}
                    {activeTab === 'overview' && (
                        <div>
                            {/* KPI Cards */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
                                {[
                                    { label: 'Total Enrolled Workers', value: overview.total_enrolled.toLocaleString(), sub: 'Across active zones', color: '#3B82F6' },
                                    { label: 'Weekly Premiums Collected', value: '₹' + overview.total_premiums_weekly.toLocaleString(), sub: 'This week', color: '#10B981' },
                                    { label: 'Weekly Payouts Disbursed', value: '₹' + overview.total_payouts_weekly.toLocaleString(), sub: 'This week', color: '#F97316' },
                                    { label: 'Weekly Net Profit', value: '₹' + overview.weekly_profit.toLocaleString(), sub: overview.profit_margin + '% margin', color: overview.weekly_profit > 0 ? '#10B981' : '#EF4444' },
                                    { label: 'Avg KavachScore', value: overview.avg_score, sub: 'Across all workers', color: '#8B5CF6' },
                                    { label: 'Active Disruptions', value: overview.active_disruptions, sub: overview.active_disruptions > 0 ? 'Monitoring now' : 'All zones clear', color: overview.active_disruptions > 0 ? '#EF4444' : '#10B981' },
                                ].map((kpi, i) => (
                                    <div key={i} style={{ backgroundColor: '#1E2130', borderRadius: 12, padding: 18, border: '1px solid #2D3348' }}>
                                        <p style={{ color: '#94A3B8', fontSize: 12, marginBottom: 12, lineHeight: 1.4 }}>{kpi.label}</p>
                                        <p style={{ color: kpi.color, fontWeight: 800, fontSize: 26, letterSpacing: -0.5 }}>{kpi.value}</p>
                                        <p style={{ color: '#6B7280', fontSize: 11, marginTop: 4 }}>{kpi.sub}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Chart */}
                            <div style={{ backgroundColor: '#1E2130', borderRadius: 12, padding: 20, border: '1px solid #2D3348', marginBottom: 20 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                                    <div>
                                        <p style={{ color: 'white', fontWeight: 700, fontSize: 15 }}>Revenue vs Payouts vs Profit</p>
                                        <p style={{ color: '#6B7280', fontSize: 12, marginTop: 2 }}>Last 8 weeks</p>
                                    </div>
                                    <div style={{ display: 'flex', gap: 16 }}>
                                        {[{ label: 'Premiums', color: '#3B82F6' }, { label: 'Payouts', color: '#EF4444' }, { label: 'Profit', color: '#10B981' }].map((l, i) => (
                                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                <div style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: l.color }} />
                                                <p style={{ color: '#94A3B8', fontSize: 11 }}>{l.label}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <ResponsiveContainer width="100%" height={220}>
                                    <BarChart data={analytics.weekly} barGap={4}>
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

                            {/* Live Monitoring + Recent Events */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                <div style={{ backgroundColor: '#1E2130', borderRadius: 12, padding: 20, border: '1px solid #2D3348' }}>
                                    <p style={{ color: 'white', fontWeight: 700, fontSize: 14, marginBottom: 14 }}>Live Zone Monitoring</p>
                                    {zones.filter(z => z.status !== 'safe').slice(0, 6).map((z, i) => (
                                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', backgroundColor: '#111827', borderRadius: 8, marginBottom: 8, border: `1px solid ${getZoneStatusColor(z.status)}30` }}>
                                            <div>
                                                <p style={{ color: 'white', fontWeight: 600, fontSize: 12 }}>{z.zone}</p>
                                                <p style={{ color: '#6B7280', fontSize: 11, marginTop: 2 }}>{z.city} · {z.enrolled} workers</p>
                                            </div>
                                            <div style={{ backgroundColor: getZoneStatusColor(z.status) + '20', border: `1px solid ${getZoneStatusColor(z.status)}40`, borderRadius: 6, padding: '3px 8px' }}>
                                                <p style={{ color: getZoneStatusColor(z.status), fontSize: 10, fontWeight: 700 }}>{getZoneStatusLabel(z.status)}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div style={{ backgroundColor: '#1E2130', borderRadius: 12, padding: 20, border: '1px solid #2D3348' }}>
                                    <p style={{ color: 'white', fontWeight: 700, fontSize: 14, marginBottom: 14 }}>Recent Events</p>
                                    {disruptions.slice(0, 5).map((d, i) => {
                                        const dtype = getDisruptionType(d.type);
                                        return (
                                            <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '8px 0', borderBottom: i < 4 ? '1px solid #1E2530' : 'none' }}>
                                                <div style={{ width: 28, height: 28, borderRadius: 6, backgroundColor: (dtype?.color || '#6B7280') + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                    <p style={{ fontSize: 10, fontWeight: 800, color: dtype?.color || '#6B7280' }}>{d.type}</p>
                                                </div>
                                                <div style={{ flex: 1 }}>
                                                    <p style={{ color: 'white', fontSize: 12, fontWeight: 600 }}>{dtype?.label} — {d.zone}</p>
                                                    <p style={{ color: '#6B7280', fontSize: 10, marginTop: 2 }}>{d.date} · {d.paid} paid</p>
                                                </div>
                                                <p style={{ color: '#10B981', fontSize: 12, fontWeight: 700 }}>₹{d.payout.toLocaleString()}</p>
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
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 16 }}>
                                {[
                                    { label: 'Total Zones', value: zones.length, color: '#3B82F6' },
                                    { label: 'Disrupted', value: zones.filter(z => z.status === 'disrupted').length, color: '#EF4444' },
                                    { label: 'Monitoring', value: zones.filter(z => z.status === 'active').length, color: '#F97316' },
                                ].map((s, i) => (
                                    <div key={i} style={{ backgroundColor: '#1E2130', borderRadius: 10, padding: 16, border: '1px solid #2D3348', textAlign: 'center' }}>
                                        <p style={{ color: s.color, fontWeight: 800, fontSize: 28 }}>{s.value}</p>
                                        <p style={{ color: '#6B7280', fontSize: 12, marginTop: 4 }}>{s.label}</p>
                                    </div>
                                ))}
                            </div>
                            <div style={{ backgroundColor: '#1E2130', borderRadius: 12, border: '1px solid #2D3348', overflow: 'hidden' }}>
                                <div style={{ padding: '16px 20px', borderBottom: '1px solid #1E2530' }}>
                                    <p style={{ color: 'white', fontWeight: 700, fontSize: 14 }}>All Zones — Risk and Coverage</p>
                                </div>
                                <div style={{ overflowX: 'auto' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                        <thead>
                                            <tr>
                                                {['Zone', 'City', 'Risk', 'Enrolled', 'Premium', 'Coverage', 'Weekly Payout', 'Status'].map(h => (
                                                    <th key={h} style={thStyle}>{h}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {zones.map((z, i) => (
                                                <tr key={i} style={getRowStyle(i)}
                                                    onMouseEnter={() => setHoveredRow(i)}
                                                    onMouseLeave={() => setHoveredRow(null)}>
                                                    <td style={{ ...getTdStyle(i), color: hoveredRow === i ? '#FFFFFF' : 'white', fontWeight: 600 }}>{z.zone}</td>
                                                    <td style={getTdStyle(i)}>{z.city}</td>
                                                    <td style={{ ...getTdStyle(i), padding: '13px 16px' }}>
                                                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, backgroundColor: getRiskColor(z.risk) + '20', border: `1px solid ${getRiskColor(z.risk)}40`, borderRadius: 6, padding: '3px 8px' }}>
                                                            <div style={{ width: 5, height: 5, borderRadius: '50%', backgroundColor: getRiskColor(z.risk) }} />
                                                            <p style={{ color: getRiskColor(z.risk), fontSize: 11, fontWeight: 700, textTransform: 'uppercase' }}>{z.risk}</p>
                                                        </div>
                                                    </td>
                                                    <td style={getTdStyle(i)}>{z.enrolled} / {z.total}</td>
                                                    <td style={getTdStyle(i)}>₹{z.premium}/wk</td>
                                                    <td style={getTdStyle(i)}>₹{z.coverage}/wk</td>
                                                    <td style={{ ...getTdStyle(i), color: '#10B981', fontWeight: 600 }}>₹{z.payout.toLocaleString()}</td>
                                                    <td style={{ ...getTdStyle(i), padding: '13px 16px' }}>
                                                        <div style={{ display: 'inline-flex', backgroundColor: getZoneStatusColor(z.status) + '20', border: `1px solid ${getZoneStatusColor(z.status)}40`, borderRadius: 6, padding: '3px 8px' }}>
                                                            <p style={{ color: getZoneStatusColor(z.status), fontSize: 10, fontWeight: 700 }}>{getZoneStatusLabel(z.status)}</p>
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
                            <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
                                <input type="text" placeholder="Search by name, ID or zone..." value={searchWorker} onChange={e => setSearchWorker(e.target.value)}
                                    style={{ flex: 1, minWidth: 200, padding: '10px 14px', backgroundColor: '#1E2130', color: 'white', border: '1px solid #2D3348', borderRadius: 8, fontSize: 13, fontFamily: 'Inter, sans-serif', outline: 'none' }} />
                                <select value={sortBy} onChange={e => setSortBy(e.target.value)}
                                    style={{ padding: '10px 14px', backgroundColor: '#1E2130', color: 'white', border: '1px solid #2D3348', borderRadius: 8, fontSize: 13, fontFamily: 'Inter, sans-serif', outline: 'none', cursor: 'pointer' }}>
                                    <option value="score">Sort by Score</option>
                                    <option value="name">Sort by Name</option>
                                    <option value="claims">Sort by Claims</option>
                                </select>
                            </div>

                            <div style={{ backgroundColor: '#1E2130', borderRadius: 12, border: '1px solid #2D3348', overflow: 'hidden' }}>
                                <div style={{ padding: '16px 20px', borderBottom: '1px solid #1E2530', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <p style={{ color: 'white', fontWeight: 700, fontSize: 14 }}>Workers ({workers.length})</p>
                                    <p style={{ color: '#6B7280', fontSize: 12 }}>Showing active systems</p>
                                </div>
                                <div style={{ overflowX: 'auto' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                        <thead>
                                            <tr>
                                                {['Worker', 'Employee ID', 'Zone', 'Platform', 'KavachScore', 'Premium', 'Last Payout', 'Claims', 'Status'].map(h => (
                                                    <th key={h} style={thStyle}>{h}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {workers.map((w, i) => (
                                                <tr key={i}
                                                    style={getRowStyle(`w${i}`)}
                                                    onMouseEnter={() => setHoveredRow(`w${i}`)}
                                                    onMouseLeave={() => setHoveredRow(null)}>
                                                    <td style={{ padding: '12px 16px', borderBottom: '1px solid #1E2530' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                            <div style={{ width: 30, height: 30, borderRadius: '50%', backgroundColor: '#3B82F620', border: '1px solid #3B82F640', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                                <p style={{ color: '#3B82F6', fontWeight: 700, fontSize: 12 }}>{w.name[0]}</p>
                                                            </div>
                                                            <p style={{ color: hoveredRow === `w${i}` ? '#FFFFFF' : 'white', fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap' }}>{w.name}</p>
                                                        </div>
                                                    </td>
                                                    <td style={{ ...getTdStyle(`w${i}`), fontFamily: 'monospace', fontSize: 12 }}>{w.id}</td>
                                                    <td style={{ ...getTdStyle(`w${i}`), whiteSpace: 'nowrap' }}>{w.zone}</td>
                                                    <td style={getTdStyle(`w${i}`)}>{w.platform}</td>
                                                    <td style={{ padding: '12px 16px', borderBottom: '1px solid #1E2530' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                            <div style={{ width: 40, height: 4, backgroundColor: '#1E2530', borderRadius: 2, overflow: 'hidden' }}>
                                                                <div style={{ width: ((w.score - 300) / 600 * 100) + '%', height: '100%', backgroundColor: w.score >= 750 ? '#10B981' : w.score >= 500 ? '#F97316' : '#EF4444', borderRadius: 2 }} />
                                                            </div>
                                                            <p style={{ color: w.score >= 750 ? '#10B981' : w.score >= 500 ? '#F97316' : '#EF4444', fontSize: 13, fontWeight: 700 }}>{w.score}</p>
                                                        </div>
                                                    </td>
                                                    <td style={getTdStyle(`w${i}`)}>₹{w.premium}/wk</td>
                                                    <td style={{ ...getTdStyle(`w${i}`), color: '#10B981', fontWeight: 600 }}>₹{w.last_payout?.toLocaleString() || 0}</td>
                                                    <td style={getTdStyle(`w${i}`)}>{w.claims_count}</td>
                                                    <td style={{ padding: '12px 16px', borderBottom: '1px solid #1E2530' }}>
                                                        <div style={{ display: 'inline-flex', backgroundColor: getStatusColor(w.status) + '20', border: `1px solid ${getStatusColor(w.status)}40`, borderRadius: 6, padding: '3px 8px' }}>
                                                            <p style={{ color: getStatusColor(w.status), fontSize: 10, fontWeight: 700, textTransform: 'uppercase' }}>{w.status}</p>
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
                            {/* All 15 Types Legend */}
                            <div style={{ backgroundColor: '#1E2130', borderRadius: 12, padding: 20, border: '1px solid #2D3348', marginBottom: 20 }}>
                                <p style={{ color: 'white', fontWeight: 700, fontSize: 14, marginBottom: 16 }}>All 15 Disruption Types</p>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>
                                    {DISRUPTION_TYPES.map((d, i) => (
                                        <div key={i} style={{ backgroundColor: '#111827', borderRadius: 10, padding: '12px 8px', textAlign: 'center', border: `1px solid ${d.color}30`, transition: 'border-color 0.2s ease', cursor: 'default' }}
                                            onMouseEnter={e => e.currentTarget.style.borderColor = d.color + '80'}
                                            onMouseLeave={e => e.currentTarget.style.borderColor = d.color + '30'}>
                                            <p style={{ fontSize: 11, fontWeight: 800, color: d.color, letterSpacing: 0.5, marginBottom: 5 }}>{d.code}</p>
                                            <p style={{ fontSize: 10, color: '#94A3B8', lineHeight: 1.3 }}>{d.label}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Simulate Test Button */}
                            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 20 }}>
                                <button onClick={() => setIsSimulateModalOpen(true)}
                                    style={{ display: 'flex', gap: 8, alignItems: 'center', backgroundColor: '#3B82F6', color: 'white', border: 'none', borderRadius: 8, padding: '10px 16px', fontWeight: 600, fontSize: 13, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3" /></svg>
                                    Simulate Disruption Event
                                </button>
                            </div>

                            {/* Disruption Events */}
                            <div style={{ backgroundColor: '#1E2130', borderRadius: 12, border: '1px solid #2D3348', overflow: 'hidden' }}>
                                <div style={{ padding: '16px 20px', borderBottom: '1px solid #1E2530' }}>
                                    <p style={{ color: 'white', fontWeight: 700, fontSize: 14 }}>Recent Disruption Events</p>
                                </div>
                                {disruptions.map((d, i) => {
                                    const dtype = getDisruptionType(d.type);
                                    const isExpanded = selectedDisruption === i;
                                    return (
                                        <div key={i} style={{ borderBottom: i < disruptions.length - 1 ? '1px solid #1E2530' : 'none' }}>
                                            <div onClick={() => setSelectedDisruption(isExpanded ? null : i)}
                                                style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer', backgroundColor: isExpanded ? '#111827' : 'transparent', transition: 'background-color 0.15s ease' }}
                                                onMouseEnter={e => { if (!isExpanded) e.currentTarget.style.backgroundColor = '#1A1F2E'; }}
                                                onMouseLeave={e => { if (!isExpanded) e.currentTarget.style.backgroundColor = 'transparent'; }}>
                                                <div style={{ width: 36, height: 36, borderRadius: 8, backgroundColor: (dtype?.color || '#6B7280') + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                    <p style={{ fontSize: 11, fontWeight: 800, color: dtype?.color || '#6B7280' }}>{d.type}</p>
                                                </div>
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                                                        <p style={{ color: 'white', fontWeight: 600, fontSize: 13 }}>{dtype?.label}</p>
                                                        <div style={{ backgroundColor: (dtype?.color || '#6B7280') + '20', borderRadius: 4, padding: '2px 6px' }}>
                                                            <p style={{ color: dtype?.color || '#6B7280', fontSize: 10, fontWeight: 700 }}>{d.type}</p>
                                                        </div>
                                                        <div style={{ backgroundColor: getSeverityColor(d.severity) + '20', borderRadius: 4, padding: '2px 6px' }}>
                                                            <p style={{ color: getSeverityColor(d.severity), fontSize: 10, fontWeight: 700 }}>{d.severity.toUpperCase()}</p>
                                                        </div>
                                                        {d.status === 'active' && (
                                                            <div style={{ backgroundColor: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.4)', borderRadius: 4, padding: '2px 6px', display: 'flex', alignItems: 'center', gap: 4 }}>
                                                                <div style={{ width: 5, height: 5, borderRadius: '50%', backgroundColor: '#EF4444', animation: 'pulse 2s infinite' }} />
                                                                <p style={{ color: '#EF4444', fontSize: 10, fontWeight: 700 }}>ACTIVE</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <p style={{ color: '#6B7280', fontSize: 11 }}>{d.zone}, {d.city} · {d.date} {d.time} · {d.value}</p>
                                                </div>
                                                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                                    <p style={{ color: '#10B981', fontWeight: 700, fontSize: 14 }}>₹{d.payout.toLocaleString()}</p>
                                                    <p style={{ color: '#6B7280', fontSize: 11, marginTop: 2 }}>{d.paid} paid / {d.skipped} skipped</p>
                                                </div>
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }}>
                                                    <polyline points="6 9 12 15 18 9" />
                                                </svg>
                                            </div>
                                            {isExpanded && (
                                                <div style={{ padding: '16px 20px 20px 70px', backgroundColor: '#111827', borderTop: '1px solid #1E2530' }}>
                                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
                                                        {[
                                                            { label: 'Affected', value: d.affected },
                                                            { label: 'Paid Out', value: d.paid },
                                                            { label: 'Skipped', value: d.skipped },
                                                            { label: 'Total Payout', value: '₹' + d.payout.toLocaleString() },
                                                        ].map((s, j) => (
                                                            <div key={j} style={{ backgroundColor: '#1E2130', borderRadius: 8, padding: 12, border: '1px solid #2D3348' }}>
                                                                <p style={{ color: '#6B7280', fontSize: 10, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>{s.label}</p>
                                                                <p style={{ color: 'white', fontWeight: 700, fontSize: 16 }}>{s.value}</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <p style={{ color: '#6B7280', fontSize: 11, marginTop: 12 }}>ID: {d.id} · 5-layer behavioral verification · Source: IMD/CPCB/NDMA</p>
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
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
                                {[
                                    { label: 'Total Premium Revenue', value: '₹' + analytics.weekly.reduce((a, b) => a + b.premiums, 0).toLocaleString(), sub: 'Cumulative', color: '#3B82F6' },
                                    { label: 'Total Payouts', value: '₹' + analytics.weekly.reduce((a, b) => a + b.payouts, 0).toLocaleString(), sub: 'Cumulative', color: '#EF4444' },
                                    { label: 'Net Profit', value: '₹' + analytics.weekly.reduce((a, b) => a + b.profit, 0).toLocaleString(), sub: 'Cumulative', color: '#10B981' },
                                    { label: 'Fraud Savings', value: '₹' + analytics.fraud.savedAmount.toLocaleString(), sub: analytics.fraud.fraudRate + '% rate', color: '#8B5CF6' },
                                ].map((kpi, i) => (
                                    <div key={i} style={{ backgroundColor: '#1E2130', borderRadius: 12, padding: 18, border: '1px solid #2D3348' }}>
                                        <p style={{ color: '#94A3B8', fontSize: 12, marginBottom: 10 }}>{kpi.label}</p>
                                        <p style={{ color: kpi.color, fontWeight: 800, fontSize: 22, letterSpacing: -0.5 }}>{kpi.value}</p>
                                        <p style={{ color: '#6B7280', fontSize: 11, marginTop: 4 }}>{kpi.sub}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Profit Trend */}
                            <div style={{ backgroundColor: '#1E2130', borderRadius: 12, padding: 20, border: '1px solid #2D3348', marginBottom: 20 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                                    <div>
                                        <p style={{ color: 'white', fontWeight: 700, fontSize: 15 }}>Profit Trend</p>
                                        <p style={{ color: '#6B7280', fontSize: 12, marginTop: 2 }}>Weekly net profit — last 8 weeks</p>
                                    </div>
                                    <div style={{ backgroundColor: '#10B98120', border: '1px solid #10B98140', borderRadius: 8, padding: '6px 12px' }}>
                                        <p style={{ color: '#10B981', fontSize: 12, fontWeight: 700 }}>
                                            Live Trend
                                        </p>
                                    </div>
                                </div>
                                <ResponsiveContainer width="100%" height={200}>
                                    <AreaChart data={analytics.weekly}>
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

                             {/* Zone Breakdown */}
                             <div style={{ backgroundColor: '#1E2130', borderRadius: 12, padding: 20, border: '1px solid #2D3348', marginBottom: 20 }}>
                                <p style={{ color: 'white', fontWeight: 700, fontSize: 14, marginBottom: 4 }}>Premium vs Payout by Zone</p>
                                <p style={{ color: '#6B7280', fontSize: 12, marginBottom: 16 }}>Weekly profit margin per zone</p>
                                {analytics.zones.map((z, i) => {
                                    const zoneProfit = z.premiums - z.payouts;
                                    const pct = Math.round((zoneProfit / (z.premiums || 1)) * 100);
                                    const isProfit = pct >= 0;
                                    return (
                                        <div key={i} style={{ marginBottom: 14 }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                                <p style={{ color: 'white', fontSize: 12, fontWeight: 600 }}>{z.zone}</p>
                                                <div style={{ display: 'flex', gap: 16 }}>
                                                    <p style={{ color: '#3B82F6', fontSize: 12 }}>₹{z.premiums.toLocaleString()}</p>
                                                    <p style={{ color: isProfit ? '#10B981' : '#EF4444', fontSize: 12, fontWeight: 700 }}>{isProfit ? '+' : ''}{pct}%</p>
                                                </div>
                                            </div>
                                            <div style={{ backgroundColor: '#111827', borderRadius: 4, height: 8, overflow: 'hidden' }}>
                                                <div style={{ width: Math.min(100, Math.max(5, (isProfit ? pct : 5))) + '%', height: '100%', backgroundColor: isProfit ? '#10B981' : '#EF4444', borderRadius: 4, transition: 'width 0.6s ease' }} />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ─── SIMULATE MODAL ─── */}
            {isSimulateModalOpen && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div style={{ backgroundColor: '#1E2130', borderRadius: 16, width: 480, border: '1px solid #2D3348', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
                        <div style={{ padding: '20px 24px', borderBottom: '1px solid #1E2530', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <p style={{ color: 'white', fontWeight: 700, fontSize: 16 }}>Simulate Disruption Event</p>
                                <p style={{ color: '#6B7280', fontSize: 12, marginTop: 4 }}>Injects fake telemetry to trigger claims pipeline.</p>
                            </div>
                            <button onClick={() => setIsSimulateModalOpen(false)} style={{ background: 'none', border: 'none', color: '#6B7280', cursor: 'pointer' }}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                            </button>
                        </div>
                        <div style={{ padding: 24 }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                                <div>
                                    <label style={{ display: 'block', color: '#94A3B8', fontSize: 11, fontWeight: 600, marginBottom: 6 }}>CITY</label>
                                    <input value={simData.city} onChange={e => setSimData({ ...simData, city: e.target.value })} style={{ width: '100%', padding: '10px', backgroundColor: '#111827', border: '1px solid #2D3348', color: 'white', borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', color: '#94A3B8', fontSize: 11, fontWeight: 600, marginBottom: 6 }}>ZONE</label>
                                    <input value={simData.zone} onChange={e => setSimData({ ...simData, zone: e.target.value })} style={{ width: '100%', padding: '10px', backgroundColor: '#111827', border: '1px solid #2D3348', color: 'white', borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                                <div>
                                    <label style={{ display: 'block', color: '#94A3B8', fontSize: 11, fontWeight: 600, marginBottom: 6 }}>DISRUPTION CODE</label>
                                    <select value={simData.code} onChange={e => setSimData({ ...simData, code: e.target.value })} style={{ width: '100%', padding: '10px', backgroundColor: '#111827', border: '1px solid #2D3348', color: 'white', borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box' }}>
                                        {DISRUPTION_TYPES.map(d => <option key={d.code} value={d.code}>{d.code} - {d.label}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', color: '#94A3B8', fontSize: 11, fontWeight: 600, marginBottom: 6 }}>SEVERITY</label>
                                    <select value={simData.severity} onChange={e => setSimData({ ...simData, severity: e.target.value })} style={{ width: '100%', padding: '10px', backgroundColor: '#111827', border: '1px solid #2D3348', color: 'white', borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box' }}>
                                        <option value="Severe">Severe</option>
                                        <option value="Moderate">Moderate</option>
                                        <option value="Minor">Minor</option>
                                    </select>
                                </div>
                            </div>
                            <div style={{ marginBottom: 16 }}>
                                <label style={{ display: 'block', color: '#94A3B8', fontSize: 11, fontWeight: 600, marginBottom: 6 }}>MEASURED VALUE (M3 INPUT)</label>
                                <input type="number" value={simData.measured_value} onChange={e => setSimData({ ...simData, measured_value: Number(e.target.value) })} style={{ width: '100%', padding: '10px', backgroundColor: '#111827', border: '1px solid #2D3348', color: 'white', borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
                            </div>
                            <div style={{ marginBottom: 24 }}>
                                <label style={{ display: 'block', color: '#94A3B8', fontSize: 11, fontWeight: 600, marginBottom: 6 }}>WORKER CLAIM TEXT (M7 INPUT)</label>
                                <textarea value={simData.description} onChange={e => setSimData({ ...simData, description: e.target.value })} style={{ width: '100%', padding: '10px', backgroundColor: '#111827', border: '1px solid #2D3348', color: 'white', borderRadius: 8, fontSize: 13, outline: 'none', minHeight: 60, resize: 'vertical', boxSizing: 'border-box', fontFamily: 'Inter, sans-serif' }} />
                            </div>
                            <button 
                                onClick={async () => {
                                    setSimLoading(true);
                                    try {
                                        const typeObj = DISRUPTION_TYPES.find(d => d.code === simData.code);
                                        const payload = { ...simData, label: typeObj.label };
                                        const res = await api.simulateDisruption(payload);
                                        if (res.error) throw new Error(res.error);
                                        alert(`Success! Disruption ID: ${res.disruption_id}\nNotified Workers: ${res.workers_notified}`);
                                        setIsSimulateModalOpen(false);
                                        // Refresh data
                                        const ds = await api.getDisruptions();
                                        if (ds.disruptions) setDisruptions(ds.disruptions);
                                    } catch (e) {
                                        alert('Error: ' + e.message);
                                    } finally {
                                        setSimLoading(false);
                                    }
                                }}
                                disabled={simLoading}
                                style={{ width: '100%', backgroundColor: simLoading ? '#1D4ED8' : '#3B82F6', color: 'white', border: 'none', padding: '14px', borderRadius: 8, fontWeight: 600, fontSize: 14, cursor: simLoading ? 'wait' : 'pointer', transition: 'background-color 0.2s', fontFamily: 'Inter, sans-serif' }}>
                                {simLoading ? 'Running ML Pipeline...' : 'Inject Event'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}