import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function Claims({ worker, onBack }) {
    const coverage = worker?.coverage || 1200;
    const zone = worker?.zone || 'Koramangala, Bangalore';
    const [filter, setFilter] = useState('all');
    const [expandedClaim, setExpandedClaim] = useState(null);

    const claims = [
        {
            id: 'CLM-001', date: 'Mar 5, 2026', event: 'Heavy Rain — 82mm',
            severity: 'Moderate', status: 'paid', payout: Math.round(coverage * 0.65),
            txn: 'pay_a3f9b2c1', zone, verificationLayers: 5, fraudFlags: 0,
            timeline: [
                { time: '2:14 PM', event: 'Rain threshold crossed — 82mm detected' },
                { time: '2:14 PM', event: 'Work intent verified — worker was active' },
                { time: '2:15 PM', event: 'Activity check — worker inactive confirmed' },
                { time: '2:15 PM', event: 'Zone correlation — 8 of 12 workers inactive' },
                { time: '2:16 PM', event: 'Fraud check passed — 0 flags raised' },
                { time: '2:16 PM', event: 'Payout approved — ₹' + Math.round(coverage * 0.65) },
                { time: '2:17 PM', event: 'UPI transfer complete — pay_a3f9b2c1' },
            ]
        },
        {
            id: 'CLM-002', date: 'Feb 28, 2026', event: 'AQI Alert — 347',
            severity: 'Moderate', status: 'paid', payout: Math.round(coverage * 0.65),
            txn: 'pay_b4e8d3f2', zone, verificationLayers: 5, fraudFlags: 0,
            timeline: [
                { time: '10:32 AM', event: 'AQI threshold crossed — 347 detected' },
                { time: '10:32 AM', event: 'Work intent verified — worker was active' },
                { time: '10:33 AM', event: 'Activity check — worker inactive confirmed' },
                { time: '10:33 AM', event: 'Zone correlation — 7 of 11 workers inactive' },
                { time: '10:34 AM', event: 'Fraud check passed — 0 flags raised' },
                { time: '10:34 AM', event: 'Payout approved — ₹' + Math.round(coverage * 0.65) },
                { time: '10:35 AM', event: 'UPI transfer complete — pay_b4e8d3f2' },
            ]
        },
        {
            id: 'CLM-003', date: 'Feb 10, 2026', event: 'Heavy Rain — 91mm',
            severity: 'Moderate', status: 'skipped', payout: 0,
            txn: null, zone, verificationLayers: 2, fraudFlags: 1,
            skipReason: 'Worker was active — 4 deliveries detected during disruption window',
            timeline: [
                { time: '4:45 PM', event: 'Rain threshold crossed — 91mm detected' },
                { time: '4:45 PM', event: 'Work intent verified — worker was active' },
                { time: '4:46 PM', event: 'Activity check — worker ACTIVE, 4 deliveries detected' },
                { time: '4:46 PM', event: 'Claim skipped — worker was earning during disruption' },
            ]
        },
        {
            id: 'CLM-004', date: 'Jan 22, 2026', event: 'Flood Alert — NDMA Warning',
            severity: 'Severe', status: 'paid', payout: coverage,
            txn: 'pay_c5f1a4g3', zone, verificationLayers: 5, fraudFlags: 0,
            timeline: [
                { time: '9:10 AM', event: 'NDMA flood warning issued for zone' },
                { time: '9:10 AM', event: 'Work intent verified — worker was active' },
                { time: '9:11 AM', event: 'Activity check — worker inactive confirmed' },
                { time: '9:11 AM', event: 'Zone correlation — 10 of 12 workers inactive' },
                { time: '9:12 AM', event: 'Fraud check passed — 0 flags raised' },
                { time: '9:12 AM', event: 'Severe payout approved — ₹' + coverage },
                { time: '9:13 AM', event: 'UPI transfer complete — pay_c5f1a4g3' },
            ]
        },
        {
            id: 'CLM-005', date: 'Jan 8, 2026', event: 'Heavy Rain — 58mm',
            severity: 'Minor', status: 'paid', payout: Math.round(coverage * 0.3),
            txn: 'pay_d6g2b5h4', zone, verificationLayers: 5, fraudFlags: 0,
            timeline: [
                { time: '1:20 PM', event: 'Rain threshold crossed — 58mm detected' },
                { time: '1:21 PM', event: 'Work intent verified — worker was active' },
                { time: '1:21 PM', event: 'Activity check — worker inactive confirmed' },
                { time: '1:22 PM', event: 'Zone correlation — 6 of 10 workers inactive' },
                { time: '1:22 PM', event: 'Fraud check passed — 0 flags raised' },
                { time: '1:23 PM', event: 'Minor payout approved — ₹' + Math.round(coverage * 0.3) },
                { time: '1:24 PM', event: 'UPI transfer complete — pay_d6g2b5h4' },
            ]
        },
    ];

    const filtered = filter === 'all' ? claims : claims.filter(c => c.status === filter);
    const totalPaid = claims.filter(c => c.status === 'paid').reduce((a, b) => a + b.payout, 0);
    const paidCount = claims.filter(c => c.status === 'paid').length;
    const skippedCount = claims.filter(c => c.status === 'skipped').length;

    const chartData = claims.filter(c => c.status === 'paid').map(c => ({
        name: c.id,
        amount: c.payout,
    }));

    const getStatusColor = (s) => s === 'paid' ? '#1E7D34' : '#D97706';
    const getStatusBg = (s) => s === 'paid' ? '#F0FDF4' : '#FFFBEB';
    const getStatusBorder = (s) => s === 'paid' ? '#BBF7D0' : '#FDE68A';
    const getStatusLabel = (s) => s === 'paid' ? 'Paid' : 'Skipped';
    const getSeverityColor = (s) => s === 'Severe' ? '#C0392B' : s === 'Moderate' ? '#D97706' : '#1E7D34';
    const getSeverityBg = (s) => s === 'Severe' ? '#FEF2F2' : s === 'Moderate' ? '#FFFBEB' : '#F0FDF4';
    const getSeverityBorder = (s) => s === 'Severe' ? '#FECACA' : s === 'Moderate' ? '#FDE68A' : '#BBF7D0';

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div style={{ backgroundColor: 'white', border: '1px solid #E5E7EB', borderRadius: '10px', padding: '10px 14px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
                    <p style={{ color: '#6B7280', fontSize: '12px', marginBottom: '4px' }}>{label}</p>
                    <p style={{ color: '#1A56A0', fontSize: '13px', fontWeight: 'bold' }}>₹{payload[0].value}</p>
                </div>
            );
        }
        return null;
    };

    return (
        <div style={{ backgroundColor: '#F4F6F9', minHeight: '100vh', fontFamily: 'Arial' }}>

            {/* Navbar */}
            <div style={{ backgroundColor: '#1A56A0', padding: '14px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1 style={{ color: 'white', fontSize: '18px', fontWeight: 'bold', letterSpacing: '0.3px' }}>KavachPay</h1>
                <button onClick={onBack}
                    style={{ backgroundColor: 'transparent', color: 'white', border: '1px solid rgba(255,255,255,0.3)', padding: '6px 14px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px' }}>
                    Back
                </button>
            </div>

            <div style={{ padding: '20px 16px', maxWidth: '520px', margin: '0 auto' }}>

                <p style={{ color: '#374151', fontSize: '20px', fontWeight: 'bold', marginBottom: '16px', letterSpacing: '0.2px' }}>My Claims</p>

                {/* Summary Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '16px' }}>
                    {[
                        { label: 'Total Claims', value: claims.length, color: '#1A56A0', bg: '#EEF4FF', border: '#DBEAFE' },
                        { label: 'Paid Out', value: paidCount, color: '#1E7D34', bg: '#F0FDF4', border: '#BBF7D0' },
                        { label: 'Total Received', value: '₹' + totalPaid, color: '#1A56A0', bg: '#EEF4FF', border: '#DBEAFE' },
                    ].map((s, i) => (
                        <div key={i} style={{ backgroundColor: s.bg, borderRadius: '12px', padding: '14px', textAlign: 'center', border: `1px solid ${s.border}` }}>
                            <p style={{ color: s.color, fontWeight: 'bold', fontSize: '18px' }}>{s.value}</p>
                            <p style={{ color: '#6B7280', fontSize: '11px', marginTop: '4px' }}>{s.label}</p>
                        </div>
                    ))}
                </div>

                {/* Payout Chart */}
                <div style={{ backgroundColor: 'white', borderRadius: '14px', padding: '20px', marginBottom: '14px', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', border: '1px solid #E5E7EB' }}>
                    <p style={{ color: '#374151', fontWeight: 'bold', fontSize: '14px', marginBottom: '4px' }}>Payout History</p>
                    <p style={{ color: '#9CA3AF', fontSize: '12px', marginBottom: '16px' }}>Amount received per approved claim</p>
                    <ResponsiveContainer width="100%" height={150}>
                        <BarChart data={chartData}>
                            <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar dataKey="amount" fill="#1A56A0" radius={[4, 4, 0, 0]} name="Payout" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Skipped notice */}
                {skippedCount > 0 && (
                    <div style={{ backgroundColor: '#FFFBEB', borderRadius: '12px', padding: '13px 16px', marginBottom: '14px', border: '1px solid #FDE68A', borderLeft: '4px solid #D97706' }}>
                        <p style={{ color: '#92400E', fontWeight: '600', fontSize: '13px' }}>{skippedCount} claim{skippedCount > 1 ? 's' : ''} skipped</p>
                        <p style={{ color: '#92400E', fontSize: '12px', marginTop: '4px' }}>
                            Claims are skipped when verification detects active deliveries during a disruption window.
                        </p>
                    </div>
                )}

                {/* Filter Tabs */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                    {['all', 'paid', 'skipped'].map(f => (
                        <button key={f} onClick={() => setFilter(f)}
                            style={{ padding: '7px 16px', borderRadius: '20px', border: '1px solid #E5E7EB', cursor: 'pointer', fontWeight: filter === f ? 'bold' : 'normal', fontSize: '13px', backgroundColor: filter === f ? '#1A56A0' : 'white', color: filter === f ? 'white' : '#6B7280', transition: 'all 0.2s' }}>
                            {f.charAt(0).toUpperCase() + f.slice(1)}
                        </button>
                    ))}
                </div>

                {/* Claims List */}
                {filtered.map((claim, i) => (
                    <div key={i} style={{ backgroundColor: 'white', borderRadius: '14px', padding: '16px', marginBottom: '12px', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', border: '1px solid #E5E7EB', borderLeft: `4px solid ${getStatusColor(claim.status)}` }}>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                            <div>
                                <p style={{ color: '#374151', fontWeight: 'bold', fontSize: '14px' }}>{claim.event}</p>
                                <p style={{ color: '#9CA3AF', fontSize: '12px', marginTop: '2px' }}>{claim.date} • {claim.id}</p>
                            </div>
                            <div style={{ backgroundColor: getStatusBg(claim.status), padding: '4px 10px', borderRadius: '20px', border: `1px solid ${getStatusBorder(claim.status)}` }}>
                                <p style={{ color: getStatusColor(claim.status), fontWeight: 'bold', fontSize: '11px', letterSpacing: '0.3px' }}>
                                    {getStatusLabel(claim.status).toUpperCase()}
                                </p>
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                            <div>
                                <p style={{ color: '#9CA3AF', fontSize: '11px', marginBottom: '4px' }}>Severity</p>
                                <div style={{ backgroundColor: getSeverityBg(claim.severity), padding: '3px 10px', borderRadius: '8px', border: `1px solid ${getSeverityBorder(claim.severity)}`, display: 'inline-block' }}>
                                    <p style={{ color: getSeverityColor(claim.severity), fontWeight: 'bold', fontSize: '12px' }}>{claim.severity}</p>
                                </div>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <p style={{ color: '#9CA3AF', fontSize: '11px', marginBottom: '4px' }}>Verification</p>
                                <p style={{ color: '#1A56A0', fontWeight: 'bold', fontSize: '14px' }}>{claim.verificationLayers}/5 layers</p>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <p style={{ color: '#9CA3AF', fontSize: '11px', marginBottom: '4px' }}>Payout</p>
                                <p style={{ color: claim.status === 'paid' ? '#1E7D34' : '#9CA3AF', fontWeight: 'bold', fontSize: '18px' }}>
                                    {claim.status === 'paid' ? '₹' + claim.payout : '₹0'}
                                </p>
                            </div>
                        </div>

                        {claim.txn && (
                            <p style={{ color: '#D1D5DB', fontSize: '11px', marginBottom: '10px' }}>Transaction ID: {claim.txn}</p>
                        )}

                        {claim.skipReason && (
                            <div style={{ backgroundColor: '#FFFBEB', borderRadius: '8px', padding: '9px 12px', marginBottom: '10px', border: '1px solid #FDE68A' }}>
                                <p style={{ color: '#92400E', fontSize: '12px' }}>{claim.skipReason}</p>
                            </div>
                        )}

                        <button onClick={() => setExpandedClaim(expandedClaim === i ? null : i)}
                            style={{ width: '100%', backgroundColor: '#F9FAFB', color: '#1A56A0', padding: '9px', borderRadius: '8px', border: '1px solid #E5E7EB', cursor: 'pointer', fontSize: '13px', fontWeight: '600', letterSpacing: '0.2px' }}>
                            {expandedClaim === i ? 'Hide Timeline' : 'View Verification Timeline'}
                        </button>

                        {expandedClaim === i && (
                            <div style={{ marginTop: '14px' }}>
                                {claim.timeline.map((t, j) => (
                                    <div key={j} style={{ display: 'flex', gap: '12px', marginBottom: '10px', alignItems: 'flex-start' }}>
                                        <p style={{ color: '#9CA3AF', fontSize: '11px', minWidth: '65px', paddingTop: '1px' }}>{t.time}</p>
                                        <div style={{ flex: 1, paddingLeft: '12px', borderLeft: '2px solid #DBEAFE' }}>
                                            <p style={{ color: '#374151', fontSize: '12px' }}>{t.event}</p>
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