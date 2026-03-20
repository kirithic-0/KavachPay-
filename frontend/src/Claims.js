import React, { useState } from "react";

const C = {
    accent: "#2563EB",
    accentLight: "#EFF6FF",
    bg: "#FFFFFF",
    bgSubtle: "#F9FAFB",
    bgMuted: "#F3F4F6",
    text: "#111827",
    textMuted: "#6B7280",
    textLight: "#9CA3AF",
    border: "#E5E7EB",
    success: "#059669",
    successLight: "#ECFDF5",
    warning: "#D97706",
    warningLight: "#FFFBEB",
    danger: "#DC2626",
    dangerLight: "#FEF2F2",
};

const ALL_CLAIMS = [
    { id: "CLM-0041", date: "18 Dec 2026", type: "Heavy Rain", hours: 3, amount: 360, status: "paid", upi: "UPI • 9:42 AM" },
    { id: "CLM-0040", date: "15 Dec 2026", type: "App Outage", hours: 4, amount: 400, status: "paid", upi: "UPI • 2:15 PM" },
    { id: "CLM-0039", date: "11 Dec 2026", type: "Civic Unrest", hours: 8, amount: 800, status: "paid", upi: "UPI • 11:00 AM" },
    { id: "CLM-0038", date: "08 Dec 2026", type: "Heavy Rain", hours: 2, amount: 240, status: "paid", upi: "UPI • 7:30 PM" },
    { id: "CLM-0037", date: "05 Dec 2026", type: "App Outage", hours: 1, amount: 0, status: "skipped", upi: "Below threshold" },
    { id: "CLM-0036", date: "01 Dec 2026", type: "Flood Alert", hours: 5, amount: 600, status: "paid", upi: "UPI • 3:00 PM" },
    { id: "CLM-0035", date: "28 Nov 2026", type: "Heavy Rain", hours: 2, amount: 0, status: "skipped", upi: "Below threshold" },
    { id: "CLM-0034", date: "22 Nov 2026", type: "Power Outage", hours: 3, amount: 300, status: "paid", upi: "UPI • 6:10 PM" },
];

const FILTERS = ["all", "paid", "skipped"];

export default function Claims({ user, onBack }) {
    const [filter, setFilter] = useState("all");

    const filtered = filter === "all" ? ALL_CLAIMS : ALL_CLAIMS.filter((c) => c.status === filter);
    const totalPaid = ALL_CLAIMS.filter((c) => c.status === "paid").reduce((s, c) => s + c.amount, 0);

    return (
        <div style={{ minHeight: "100vh", background: C.bgSubtle, fontFamily: "Inter, -apple-system, sans-serif" }}>

            {/* Top bar */}
            <div style={{ background: C.bg, borderBottom: `1px solid ${C.border}`, padding: "0 24px", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 50 }}>
                <button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 13, color: C.textMuted }}>← Dashboard</button>
                <span style={{ fontWeight: 700, fontSize: 14, color: C.text }}>My Claims</span>
                <div style={{ width: 80 }} />
            </div>

            <div style={{ maxWidth: 520, margin: "0 auto", padding: "24px 16px 48px" }}>

                {/* Summary */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 20 }}>
                    <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 10, padding: "14px 12px", textAlign: "center" }}>
                        <div style={{ fontSize: 20, fontWeight: 800, color: C.text }}>{ALL_CLAIMS.length}</div>
                        <div style={{ fontSize: 10, color: C.textMuted, marginTop: 3, textTransform: "uppercase", letterSpacing: 0.4 }}>Total</div>
                    </div>
                    <div style={{ background: C.successLight, border: "1px solid #A7F3D0", borderRadius: 10, padding: "14px 12px", textAlign: "center" }}>
                        <div style={{ fontSize: 20, fontWeight: 800, color: C.success }}>{ALL_CLAIMS.filter((c) => c.status === "paid").length}</div>
                        <div style={{ fontSize: 10, color: C.success, marginTop: 3, textTransform: "uppercase", letterSpacing: 0.4 }}>Paid</div>
                    </div>
                    <div style={{ background: C.accentLight, border: "1px solid #BFDBFE", borderRadius: 10, padding: "14px 12px", textAlign: "center" }}>
                        <div style={{ fontSize: 20, fontWeight: 800, color: C.accent }}>₹{totalPaid.toLocaleString()}</div>
                        <div style={{ fontSize: 10, color: C.accent, marginTop: 3, textTransform: "uppercase", letterSpacing: 0.4 }}>Received</div>
                    </div>
                </div>

                {/* Filter tabs */}
                <div style={{ display: "flex", background: C.bgMuted, borderRadius: 9, padding: 3, gap: 3, marginBottom: 16, border: `1px solid ${C.border}` }}>
                    {FILTERS.map((f) => (
                        <button key={f} onClick={() => setFilter(f)} style={{ flex: 1, padding: "7px 0", border: "none", borderRadius: 7, background: filter === f ? C.bg : "transparent", fontWeight: filter === f ? 700 : 500, fontSize: 13, color: filter === f ? C.text : C.textMuted, cursor: "pointer", boxShadow: filter === f ? "0 1px 4px rgba(0,0,0,0.07)" : "none", transition: "all 0.15s", textTransform: "capitalize" }}>
                            {f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
                        </button>
                    ))}
                </div>

                {/* Claims list */}
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {filtered.length === 0 && (
                        <div style={{ textAlign: "center", padding: "40px 0", color: C.textLight, fontSize: 14 }}>No claims found</div>
                    )}
                    {filtered.map((c) => (
                        <div key={c.id} style={{ background: C.bg, border: `1px solid ${c.status === "paid" ? C.border : C.border}`, borderRadius: 12, padding: "16px", transition: "box-shadow 0.15s" }}
                            onMouseEnter={(e) => e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.06)"}
                            onMouseLeave={(e) => e.currentTarget.style.boxShadow = "none"}
                        >
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                                <div>
                                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                                        <span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{c.type}</span>
                                        <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 20, background: c.status === "paid" ? C.successLight : C.bgMuted, color: c.status === "paid" ? C.success : C.textMuted }}>
                                            {c.status === "paid" ? "Paid" : "Skipped"}
                                        </span>
                                    </div>
                                    <div style={{ fontSize: 11, color: C.textMuted }}>{c.date} · {c.id}</div>
                                </div>
                                <div style={{ textAlign: "right" }}>
                                    <div style={{ fontSize: 16, fontWeight: 800, color: c.status === "paid" ? C.success : C.textLight }}>
                                        {c.status === "paid" ? `+₹${c.amount}` : "—"}
                                    </div>
                                    <div style={{ fontSize: 11, color: C.textMuted, marginTop: 2 }}>{c.upi}</div>
                                </div>
                            </div>
                            <div style={{ display: "flex", gap: 16, paddingTop: 10, borderTop: `1px solid ${C.border}` }}>
                                <div>
                                    <span style={{ fontSize: 10, color: C.textLight, textTransform: "uppercase", letterSpacing: 0.4 }}>Duration · </span>
                                    <span style={{ fontSize: 12, fontWeight: 600, color: C.text }}>{c.hours}h</span>
                                </div>
                                {c.status === "skipped" && (
                                    <div style={{ fontSize: 11, color: C.warning }}>⚠️ Duration below payout threshold</div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}