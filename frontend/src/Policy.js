import React from "react";

const C = {
    accent: "#2563EB", accentLight: "#EFF6FF",
    bg: "#FFFFFF", bgSubtle: "#F9FAFB", bgMuted: "#F3F4F6",
    text: "#111827", textMuted: "#6B7280", textLight: "#9CA3AF",
    border: "#E5E7EB", success: "#059669", successLight: "#ECFDF5",
    warning: "#D97706", warningLight: "#FFFBEB",
};

const DISRUPTIONS = [
    { code: "HRA", icon: "🌧️", label: "Heavy Rain", desc: "Rainfall > 8 mm/hr in your zone", trigger: "IMD API" },
    { code: "MRA", icon: "🌦️", label: "Moderate Rain", desc: "Rainfall 4–8 mm/hr sustained for 2+ hrs", trigger: "IMD API" },
    { code: "LRA", icon: "🌂", label: "Low Rain", desc: "Rainfall 1–4 mm/hr but visibility affected", trigger: "IMD API" },
    { code: "STM", icon: "⛈️", label: "Storm", desc: "Thunder/lightning storm or cyclone warning", trigger: "IMD / NDMA" },
    { code: "FLD", icon: "🌊", label: "Flood", desc: "Civic waterlogging alert in your zone", trigger: "Civic API" },
    { code: "CRF", icon: "🚔", label: "Curfew", desc: "Section 144 or curfew declared in area", trigger: "Govt. Alerts" },
    { code: "SAQ", icon: "😷", label: "Severe Air Quality", desc: "AQI > 400 — hazardous to be outdoors", trigger: "CPCB API" },
    { code: "MAQ", icon: "🌫️", label: "Moderate Air Quality", desc: "AQI 200–400 sustained over 3 hrs", trigger: "CPCB API" },
    { code: "FOG", icon: "🌁", label: "Dense Fog", desc: "Visibility < 50m for 2+ continuous hours", trigger: "IMD API" },
    { code: "WND", icon: "💨", label: "High Wind", desc: "Wind speed > 60 km/hr in your zone", trigger: "IMD API" },
    { code: "EQK", icon: "🌍", label: "Earthquake", desc: "Magnitude ≥ 5.0 within 50km of your zone", trigger: "NCS API" },
    { code: "LDS", icon: "⛰️", label: "Landslide", desc: "NDMA landslide alert for your region", trigger: "NDMA API" },
    { code: "HTV", icon: "🥵", label: "Heatwave", desc: "Temperature > 45°C with IMD red alert", trigger: "IMD API" },
];

const PAYOUT_TIERS = [
    { code: "HRA", event: "Heavy Rain", rate: "Per hour", payout: "₹120", max: "₹600/day" },
    { code: "MRA", event: "Moderate Rain", rate: "Per hour", payout: "₹80", max: "₹400/day" },
    { code: "LRA", event: "Low Rain", rate: "Per hour", payout: "₹50", max: "₹250/day" },
    { code: "STM", event: "Storm", rate: "Per incident", payout: "₹500", max: "₹1,500" },
    { code: "FLD", event: "Flood", rate: "Per day", payout: "₹600", max: "₹1,800" },
    { code: "CRF", event: "Curfew", rate: "Per day", payout: "₹800", max: "₹2,400" },
    { code: "SAQ", event: "Severe Air Quality", rate: "Per day", payout: "₹400", max: "₹1,200" },
    { code: "MAQ", event: "Moderate Air Quality", rate: "Per day", payout: "₹200", max: "₹600" },
    { code: "FOG", event: "Dense Fog", rate: "Per hour", payout: "₹80", max: "₹400/day" },
    { code: "WND", event: "High Wind", rate: "Per hour", payout: "₹100", max: "₹500/day" },
    { code: "EQK", event: "Earthquake", rate: "Per incident", payout: "₹1,000", max: "₹1,000" },
    { code: "LDS", event: "Landslide", rate: "Per incident", payout: "₹800", max: "₹800" },
    { code: "HTV", event: "Heatwave", rate: "Per day", payout: "₹350", max: "₹1,050" },
];

export default function Policy({ user, onBack }) {
    const u = user || { name: "Ravi Kumar", platform: "Swiggy", workerId: "KOR-3847261", employeeId: "SWG-EMP-001", zone: "Koramangala", city: "Bengaluru" };

    return (
        <div style={{ minHeight: "100vh", background: C.bgSubtle, fontFamily: "Inter, -apple-system, sans-serif" }}>
            <div style={{ background: C.bg, borderBottom: `1px solid ${C.border}`, padding: "0 24px", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 50 }}>
                <button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 13, color: C.textMuted }}>← Dashboard</button>
                <span style={{ fontWeight: 700, fontSize: 14, color: C.text }}>My Policy</span>
                <div style={{ width: 80 }} />
            </div>

            <div style={{ maxWidth: 520, margin: "0 auto", padding: "24px 16px 48px" }}>

                {/* Policy header card */}
                <div style={{ background: "linear-gradient(135deg, #0F172A, #1E293B)", borderRadius: 16, padding: "20px", marginBottom: 14, color: "#fff" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                        <div>
                            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", letterSpacing: 1, textTransform: "uppercase", marginBottom: 3 }}>Policy No.</div>
                            <div style={{ fontSize: 14, fontWeight: 800 }}>KVP-2025-{u.workerId}</div>
                        </div>
                        <div style={{ background: "rgba(5,150,105,0.2)", border: "1px solid rgba(5,150,105,0.35)", borderRadius: 20, padding: "3px 9px", fontSize: 11, fontWeight: 700, color: "#6EE7B7" }}>● ACTIVE</div>
                    </div>
                    <div style={{ fontSize: 18, fontWeight: 900, marginBottom: 3 }}>Individual Cover</div>
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginBottom: 14 }}>{u.platform} · {u.zone}, {u.city}</div>
                    <div style={{ display: "flex", gap: 20, paddingTop: 12, borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                        {[["Premium", "₹149/mo"], ["Max Payout", "₹4,500"], ["Valid Till", "Dec 2025"], ["Emp ID", u.employeeId || "N/A"]].map(([l, v]) => (
                            <div key={l}>
                                <div style={{ fontSize: 9, color: "rgba(255,255,255,0.38)", textTransform: "uppercase", letterSpacing: 0.4 }}>{l}</div>
                                <div style={{ fontSize: 13, fontWeight: 700, marginTop: 2 }}>{v}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Covered Disruptions */}
                <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 12, overflow: "hidden", marginBottom: 14 }}>
                    <div style={{ padding: "13px 16px", borderBottom: `1px solid ${C.border}` }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>Covered Disruptions</div>
                        <div style={{ fontSize: 12, color: C.textMuted, marginTop: 2 }}>13 event types — all auto-triggered, no action needed</div>
                    </div>
                    {DISRUPTIONS.map((d, i) => (
                        <div key={d.code} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 16px", borderBottom: i < DISRUPTIONS.length - 1 ? `1px solid ${C.border}` : "none" }}>
                            <div style={{ fontSize: 18, width: 34, height: 34, borderRadius: 8, background: C.bgMuted, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{d.icon}</div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{d.label}</div>
                                <div style={{ fontSize: 11, color: C.textMuted, marginTop: 1 }}>{d.desc}</div>
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 3, flexShrink: 0 }}>
                                <span style={{ fontSize: 10, fontWeight: 700, color: "#1A3A5C", background: "#EEF2FF", padding: "2px 7px", borderRadius: 4 }}>{d.code}</span>
                                <span style={{ fontSize: 10, color: C.textLight }}>{d.trigger}</span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Payout Tiers */}
                <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 12, overflow: "hidden", marginBottom: 14 }}>
                    <div style={{ padding: "13px 16px", borderBottom: `1px solid ${C.border}` }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>Payout Tiers</div>
                        <div style={{ fontSize: 12, color: C.textMuted, marginTop: 2 }}>Credited directly to your UPI</div>
                    </div>
                    <div style={{ overflowX: "auto" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 420 }}>
                            <thead>
                                <tr style={{ background: C.bgSubtle }}>
                                    {["Code", "Event", "Rate", "Payout", "Max"].map((h) => (
                                        <th key={h} style={{ padding: "9px 12px", textAlign: "left", fontSize: 10, fontWeight: 700, color: C.textMuted, textTransform: "uppercase", letterSpacing: 0.5 }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {PAYOUT_TIERS.map((t, i) => (
                                    <tr key={t.code} style={{ borderTop: `1px solid ${C.border}`, background: i % 2 === 0 ? C.bg : C.bgSubtle }}>
                                        <td style={{ padding: "10px 12px" }}><span style={{ fontSize: 10, fontWeight: 700, color: "#1A3A5C", background: "#EEF2FF", padding: "2px 6px", borderRadius: 4 }}>{t.code}</span></td>
                                        <td style={{ padding: "10px 12px", fontSize: 12, color: C.text }}>{t.event}</td>
                                        <td style={{ padding: "10px 12px", fontSize: 11, color: C.textMuted }}>{t.rate}</td>
                                        <td style={{ padding: "10px 12px", fontSize: 13, fontWeight: 800, color: C.accent }}>{t.payout}</td>
                                        <td style={{ padding: "10px 12px", fontSize: 11, color: C.textMuted }}>{t.max}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Renewal */}
                <div style={{ background: C.warningLight, border: "1px solid #FDE68A", borderRadius: 12, padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: C.warning }}>🔔 Renewal Due</div>
                        <div style={{ fontSize: 12, color: C.textMuted, marginTop: 2 }}>Policy renews <strong>1 Jan 2026</strong> — ₹149 auto-debit</div>
                    </div>
                    <button style={{ padding: "7px 14px", background: C.warning, color: "#fff", border: "none", borderRadius: 7, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Renew</button>
                </div>
            </div>
        </div>
    );
}