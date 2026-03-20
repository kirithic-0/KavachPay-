import React, { useState } from "react";

const C = {
    accent: "#2563EB", accentLight: "#EFF6FF",
    bg: "#FFFFFF", bgSubtle: "#F9FAFB", bgMuted: "#F3F4F6",
    text: "#111827", textMuted: "#6B7280", textLight: "#9CA3AF",
    border: "#E5E7EB", success: "#059669", successLight: "#ECFDF5",
    warning: "#D97706", warningLight: "#FFFBEB",
    danger: "#DC2626", dangerLight: "#FEF2F2",
    logoBlue: "#1A3A5C",
};

const NAV_ITEMS = [
    { id: "overview", label: "Overview", icon: "▦" },
    { id: "zones", label: "Zones", icon: "◎" },
];

const OVERVIEW_STATS = [
    { label: "Active Workers", value: "12,483", change: "+214 this week", up: true },
    { label: "Active Policies", value: "11,902", change: "+189 this week", up: true },
    { label: "Claims This Month", value: "348", change: "+42 vs last month", up: true },
    { label: "Payouts Disbursed", value: "₹8.4L", change: "Avg ₹2,414/claim", up: null },
];

const RECENT_CLAIMS = [
    { id: "CLM-9841", worker: "Ravi Kumar", zone: "Koramangala", type: "Heavy Rain (HRA)", amount: "₹1,200", status: "paid" },
    { id: "CLM-9840", worker: "Priya Sharma", zone: "Adyar", type: "App Outage", amount: "₹800", status: "paid" },
    { id: "CLM-9839", worker: "Arjun Das", zone: "Andheri", type: "Curfew (CRF)", amount: "₹2,400", status: "pending" },
    { id: "CLM-9838", worker: "Meena Pillai", zone: "Banjara Hills", type: "Heavy Rain (HRA)", amount: "₹1,200", status: "paid" },
    { id: "CLM-9837", worker: "Suresh Rao", zone: "Kothrud", type: "App Outage", amount: "₹800", status: "skipped" },
];

const ZONES_DATA = [
    { city: "Bengaluru", zone: "Koramangala", workers: 842, status: "normal", lastEvent: "HRA — 3 days ago" },
    { city: "Bengaluru", zone: "Indiranagar", workers: 614, status: "alert", lastEvent: "MRA — Active now" },
    { city: "Chennai", zone: "Adyar", workers: 523, status: "normal", lastEvent: "App outage — 5d" },
    { city: "Chennai", zone: "Anna Nagar", workers: 398, status: "normal", lastEvent: "None recent" },
    { city: "Mumbai", zone: "Andheri", workers: 1102, status: "alert", lastEvent: "CRF — Active now" },
    { city: "Mumbai", zone: "Bandra", workers: 876, status: "normal", lastEvent: "HRA — 1 day ago" },
    { city: "Delhi", zone: "Connaught Pl", workers: 734, status: "normal", lastEvent: "None recent" },
    { city: "Hyderabad", zone: "Banjara Hills", workers: 491, status: "normal", lastEvent: "HRA — 2 days ago" },
];

// ─── Weekly payouts data for line chart ──────────────────────────────────────
const WEEKLY_PAYOUTS = [
    { week: "W1 Nov", amount: 52000 },
    { week: "W2 Nov", amount: 68000 },
    { week: "W3 Nov", amount: 43000 },
    { week: "W4 Nov", amount: 91000 },
    { week: "W1 Dec", amount: 74000 },
    { week: "W2 Dec", amount: 110000 },
    { week: "W3 Dec", amount: 88000 },
];

function LineChart({ data }) {
    const W = 480, H = 160, PL = 50, PR = 16, PT = 16, PB = 32;
    const chartW = W - PL - PR;
    const chartH = H - PT - PB;
    const maxVal = Math.max(...data.map((d) => d.amount));
    const minVal = 0;
    const range = maxVal - minVal;

    const pts = data.map((d, i) => ({
        x: PL + (i / (data.length - 1)) * chartW,
        y: PT + chartH - ((d.amount - minVal) / range) * chartH,
        val: d.amount,
        label: d.week,
    }));

    const pathD = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
    const areaD = `${pathD} L ${pts[pts.length - 1].x} ${PT + chartH} L ${pts[0].x} ${PT + chartH} Z`;

    const gridLines = [0, 0.25, 0.5, 0.75, 1].map((f) => ({
        y: PT + chartH - f * chartH,
        label: `₹${Math.round((minVal + f * range) / 1000)}k`,
    }));

    const [hover, setHover] = useState(null);

    return (
        <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ overflow: "visible" }}>
            {/* Grid lines */}
            {gridLines.map((g, i) => (
                <g key={i}>
                    <line x1={PL} y1={g.y} x2={W - PR} y2={g.y} stroke={C.border} strokeWidth="1" strokeDasharray={i === 0 ? "none" : "4 3"} />
                    <text x={PL - 6} y={g.y + 4} textAnchor="end" fontSize="9" fill={C.textLight}>{g.label}</text>
                </g>
            ))}

            {/* Area fill */}
            <path d={areaD} fill={C.accentLight} opacity="0.6" />

            {/* Line */}
            <path d={pathD} fill="none" stroke={C.accent} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />

            {/* Points */}
            {pts.map((p, i) => (
                <g key={i}>
                    <circle cx={p.x} cy={p.y} r={hover === i ? 6 : 4} fill={C.accent} stroke="#fff" strokeWidth="2"
                        style={{ cursor: "pointer" }}
                        onMouseEnter={() => setHover(i)}
                        onMouseLeave={() => setHover(null)}
                    />
                    {hover === i && (
                        <g>
                            <rect x={p.x - 32} y={p.y - 28} width={64} height={20} rx="4" fill={C.logoBlue} />
                            <text x={p.x} y={p.y - 14} textAnchor="middle" fontSize="10" fill="#fff" fontWeight="700">₹{(p.val / 1000).toFixed(0)}k</text>
                        </g>
                    )}
                    <text x={p.x} y={H - 4} textAnchor="middle" fontSize="9" fill={C.textLight}>{p.label}</text>
                </g>
            ))}
        </svg>
    );
}

const statusColor = (s) => s === "alert" ? C.danger : C.success;
const statusBg = (s) => s === "alert" ? C.dangerLight : C.successLight;

export default function AdminDashboard({ user, onLogout }) {
    const [tab, setTab] = useState("overview");

    return (
        <div style={{ minHeight: "100vh", background: C.bgSubtle, display: "flex", fontFamily: "Inter, -apple-system, sans-serif" }}>

            {/* Sidebar */}
            <aside style={{ width: 216, background: C.bg, borderRight: `1px solid ${C.border}`, display: "flex", flexDirection: "column", position: "sticky", top: 0, height: "100vh", flexShrink: 0 }}>
                <div style={{ padding: "16px 18px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 8 }}>
                    <svg width="26" height="26" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="#1A3A5C" /><text x="50" y="68" textAnchor="middle" fontSize="50" fill="white" fontWeight="bold" fontFamily="Georgia,serif">₹</text></svg>
                    <div>
                        <div style={{ fontWeight: 900, fontSize: 12, color: C.logoBlue, letterSpacing: 1 }}>KAVACHPAY</div>
                        <div style={{ fontSize: 9, color: C.textLight, letterSpacing: 0.8 }}>ADMIN CONSOLE</div>
                    </div>
                </div>
                <nav style={{ flex: 1, padding: "12px 8px" }}>
                    {NAV_ITEMS.map((item) => (
                        <button key={item.id} onClick={() => setTab(item.id)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: 8, border: "none", background: tab === item.id ? C.accentLight : "transparent", color: tab === item.id ? C.accent : C.textMuted, fontWeight: tab === item.id ? 700 : 500, fontSize: 13, cursor: "pointer", marginBottom: 2, textAlign: "left", transition: "all 0.15s" }}>
                            <span style={{ fontSize: 16 }}>{item.icon}</span> {item.label}
                        </button>
                    ))}
                </nav>
                <div style={{ padding: "14px 16px", borderTop: `1px solid ${C.border}` }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: C.text }}>{user?.name || "Admin"}</div>
                    <div style={{ fontSize: 11, color: C.textLight, marginBottom: 10 }}>{user?.email || "admin@kavachpay.in"}</div>
                    <button onClick={onLogout} style={{ width: "100%", padding: "7px", background: "none", border: `1px solid ${C.border}`, borderRadius: 7, fontSize: 12, fontWeight: 600, color: C.textMuted, cursor: "pointer" }}>Logout</button>
                </div>
            </aside>

            {/* Main content */}
            <main style={{ flex: 1, padding: "28px 32px", overflowY: "auto" }}>

                {/* OVERVIEW */}
                {tab === "overview" && (<>
                    <div style={{ marginBottom: 24 }}>
                        <h1 style={{ fontSize: 20, fontWeight: 800, color: C.text, letterSpacing: -0.4 }}>Platform Overview</h1>
                        <p style={{ fontSize: 13, color: C.textMuted, marginTop: 3 }}>Live summary — updated in real time</p>
                    </div>

                    {/* Stats */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 12, marginBottom: 24 }}>
                        {OVERVIEW_STATS.map((s) => (
                            <div key={s.label} style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 12, padding: "16px" }}>
                                <div style={{ fontSize: 10, color: C.textMuted, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>{s.label}</div>
                                <div style={{ fontSize: 24, fontWeight: 800, color: C.text, letterSpacing: -0.5, marginBottom: 4 }}>{s.value}</div>
                                <div style={{ fontSize: 11, color: s.up === true ? C.success : s.up === false ? C.danger : C.textMuted }}>{s.change}</div>
                            </div>
                        ))}
                    </div>

                    {/* Payout trend line chart */}
                    <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 12, padding: "20px", marginBottom: 20 }}>
                        <div style={{ marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div>
                                <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>Weekly Payout Trend</div>
                                <div style={{ fontSize: 12, color: C.textMuted, marginTop: 2 }}>Total disbursements per week (INR)</div>
                            </div>
                            <div style={{ background: C.accentLight, border: "1px solid #BFDBFE", borderRadius: 6, padding: "4px 10px", fontSize: 11, fontWeight: 700, color: C.accent }}>Last 7 Weeks</div>
                        </div>
                        <LineChart data={WEEKLY_PAYOUTS} />
                    </div>

                    {/* Recent claims table */}
                    <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 12, overflow: "hidden" }}>
                        <div style={{ padding: "14px 18px", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span style={{ fontSize: 14, fontWeight: 700, color: C.text }}>Recent Claims</span>
                            <span style={{ fontSize: 12, color: C.textMuted }}>{RECENT_CLAIMS.length} entries</span>
                        </div>
                        <table style={{ width: "100%", borderCollapse: "collapse" }}>
                            <thead>
                                <tr style={{ background: C.bgSubtle }}>
                                    {["Claim ID", "Worker", "Zone", "Event Type", "Amount", "Status"].map((h) => (
                                        <th key={h} style={{ padding: "9px 16px", textAlign: "left", fontSize: 10, fontWeight: 700, color: C.textMuted, textTransform: "uppercase", letterSpacing: 0.5 }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {RECENT_CLAIMS.map((c, i) => (
                                    <tr key={c.id} style={{ borderTop: `1px solid ${C.border}`, background: i % 2 === 0 ? C.bg : C.bgSubtle }}>
                                        <td style={{ padding: "11px 16px", fontSize: 12, fontWeight: 700, color: C.accent }}>{c.id}</td>
                                        <td style={{ padding: "11px 16px", fontSize: 13, color: C.text }}>{c.worker}</td>
                                        <td style={{ padding: "11px 16px", fontSize: 12, color: C.textMuted }}>{c.zone}</td>
                                        <td style={{ padding: "11px 16px", fontSize: 12, color: C.text }}>{c.type}</td>
                                        <td style={{ padding: "11px 16px", fontSize: 13, fontWeight: 700, color: C.text }}>{c.amount}</td>
                                        <td style={{ padding: "11px 16px" }}>
                                            <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 9px", borderRadius: 20, background: c.status === "paid" ? C.successLight : c.status === "pending" ? C.warningLight : C.bgMuted, color: c.status === "paid" ? C.success : c.status === "pending" ? C.warning : C.textMuted }}>
                                                {c.status.charAt(0).toUpperCase() + c.status.slice(1)}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>)}

                {/* ZONES */}
                {tab === "zones" && (<>
                    <div style={{ marginBottom: 24 }}>
                        <h1 style={{ fontSize: 20, fontWeight: 800, color: C.text, letterSpacing: -0.4 }}>Zone Monitor</h1>
                        <p style={{ fontSize: 13, color: C.textMuted, marginTop: 3 }}>Real-time disruption status across all active delivery zones</p>
                    </div>
                    {ZONES_DATA.some((z) => z.status === "alert") && (
                        <div style={{ background: C.dangerLight, border: "1px solid #FECACA", borderRadius: 10, padding: "12px 16px", marginBottom: 20, display: "flex", alignItems: "center", gap: 10 }}>
                            <div style={{ width: 8, height: 8, borderRadius: "50%", background: C.danger, flexShrink: 0 }} />
                            <div>
                                <div style={{ fontSize: 13, fontWeight: 700, color: C.danger }}>Active Disruptions Detected</div>
                                <div style={{ fontSize: 12, color: C.textMuted }}>{ZONES_DATA.filter((z) => z.status === "alert").length} zones currently under alert — auto-payouts triggered</div>
                            </div>
                        </div>
                    )}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(270px, 1fr))", gap: 12 }}>
                        {ZONES_DATA.map((z, i) => (
                            <div key={i} style={{ background: C.bg, border: `1px solid ${z.status === "alert" ? "#FECACA" : C.border}`, borderRadius: 12, padding: "16px" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                                    <div>
                                        <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{z.zone}</div>
                                        <div style={{ fontSize: 12, color: C.textMuted, marginTop: 1 }}>{z.city}</div>
                                    </div>
                                    <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 20, background: statusBg(z.status), color: statusColor(z.status) }}>
                                        {z.status === "alert" ? "Alert" : "Normal"}
                                    </span>
                                </div>
                                <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 10, borderTop: `1px solid ${C.border}` }}>
                                    <div>
                                        <div style={{ fontSize: 9, color: C.textLight, textTransform: "uppercase", letterSpacing: 0.5 }}>Active Workers</div>
                                        <div style={{ fontSize: 15, fontWeight: 800, color: C.text }}>{z.workers.toLocaleString()}</div>
                                    </div>
                                    <div style={{ textAlign: "right" }}>
                                        <div style={{ fontSize: 9, color: C.textLight, textTransform: "uppercase", letterSpacing: 0.5 }}>Last Event</div>
                                        <div style={{ fontSize: 11, fontWeight: 600, color: z.status === "alert" ? C.danger : C.textMuted }}>{z.lastEvent}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </>)}
            </main>
        </div>
    );
}