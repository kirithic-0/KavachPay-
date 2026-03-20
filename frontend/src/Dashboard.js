import React, { useState, useEffect } from "react";

const C = {
    accent: "#2563EB", accentLight: "#EFF6FF",
    bg: "#FFFFFF", bgSubtle: "#F9FAFB", bgMuted: "#F3F4F6",
    text: "#111827", textMuted: "#6B7280", textLight: "#9CA3AF",
    border: "#E5E7EB", success: "#059669", successLight: "#ECFDF5",
    warning: "#D97706", warningLight: "#FFFBEB",
    danger: "#DC2626", dangerLight: "#FEF2F2",
    logoBlue: "#1A3A5C",
};

const EARNINGS_DATA = [
    { day: "Mon", earned: 820, protected: 820 },
    { day: "Tue", earned: 640, protected: 640 },
    { day: "Wed", earned: 0, protected: 580 },
    { day: "Thu", earned: 910, protected: 910 },
    { day: "Fri", earned: 750, protected: 750 },
    { day: "Sat", earned: 1100, protected: 1100 },
    { day: "Sun", earned: 430, protected: 430 },
];

const KAVACH_SCORE = 700;
const SCORE_MAX = 900;

const SCORE_ITEMS = [
    { label: "Policy Active", done: true },
    { label: "Platform Connected", done: true },
    { label: "KYC Verified", done: true },
    { label: "UPI Linked", done: true },
    { label: "Employee ID Verified", done: true },
    { label: "Zone Verified", done: false },
    { label: "6-Month Activity", done: false },
    { label: "Zero Missed Payments", done: true },
    { label: "Profile Complete", done: false },
];

// ─── Live Notifications ───────────────────────────────────────────────────────
const NOTIFICATIONS = [
    { id: 1, type: "payout", title: "Payout Credited", body: "₹1,500 insured for Heavy Rain (HRA) in Koramangala. Credited to your UPI.", time: "Just now", read: false },
    { id: 2, type: "alert", title: "Zone Alert — Koramangala", body: "Moderate Rain (MRA) detected in your zone. Coverage auto-activated.", time: "12 min ago", read: false },
    { id: 3, type: "payout", title: "Payout Credited", body: "₹800 insured for App Outage (Swiggy down 3.2 hrs). Credited to your UPI.", time: "2 days ago", read: true },
    { id: 4, type: "info", title: "Policy Renewed", body: "Your Individual Cover policy has been auto-renewed for Dec 2025.", time: "5 days ago", read: true },
    { id: 5, type: "alert", title: "Air Quality Alert", body: "Severe Air Quality (SAQ) warning in Bengaluru. Stay safe — coverage active.", time: "1 week ago", read: true },
];

function scoreColor(s) { return s >= 750 ? "#059669" : s >= 500 ? "#D97706" : "#DC2626"; }
function scoreLabel(s) { return s >= 750 ? "Excellent" : s >= 600 ? "Good" : s >= 400 ? "Fair" : "Needs Work"; }

const TABS = [
    { id: "home", label: "Home", icon: "▦" },
    { id: "earnings", label: "Earnings", icon: "≋" },
    { id: "score", label: "Score", icon: "◉" },
];

export default function Dashboard({ user, onLogout, onNavigate }) {
    const [tab, setTab] = useState("home");
    const [showNotifs, setShowNotifs] = useState(false);
    const [notifs, setNotifs] = useState(NOTIFICATIONS);
    const [showBanner, setShowBanner] = useState(true); // login payout notification

    const u = user || { name: "Ravi Kumar", platform: "Swiggy", workerId: "KOR-3847261", employeeId: "SWG-EMP-001", city: "Bengaluru", zone: "Koramangala" };
    const unread = notifs.filter((n) => !n.read).length;
    const maxE = Math.max(...EARNINGS_DATA.map((d) => d.protected));
    const col = scoreColor(KAVACH_SCORE);

    const markAllRead = () => setNotifs((n) => n.map((x) => ({ ...x, read: true })));

    const typeStyle = (type) => ({
        payout: { bg: C.successLight, border: "#A7F3D0", dot: C.success },
        alert: { bg: C.warningLight, border: "#FDE68A", dot: C.warning },
        info: { bg: C.accentLight, border: "#BFDBFE", dot: C.accent },
    }[type] || { bg: C.bgMuted, border: C.border, dot: C.textLight });

    return (
        <div style={{ minHeight: "100vh", background: C.bgSubtle, display: "flex", flexDirection: "column", fontFamily: "Inter, -apple-system, sans-serif" }}>

            {/* Navbar */}
            <nav style={{ background: C.bg, borderBottom: `1px solid ${C.border}`, padding: "0 20px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 56, position: "sticky", top: 0, zIndex: 50 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                    <svg width="24" height="24" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="#1A3A5C" /><text x="50" y="68" textAnchor="middle" fontSize="50" fill="white" fontWeight="bold" fontFamily="Georgia,serif">₹</text></svg>
                    <span style={{ fontWeight: 900, fontSize: 13, color: C.logoBlue, letterSpacing: 1 }}>KAVACHPAY</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    {/* Notification bell */}
                    <div style={{ position: "relative" }}>
                        <button onClick={() => setShowNotifs(!showNotifs)} style={{ background: "none", border: `1px solid ${C.border}`, borderRadius: 8, width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", position: "relative" }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.textMuted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" /></svg>
                            {unread > 0 && <div style={{ position: "absolute", top: -4, right: -4, width: 16, height: 16, borderRadius: "50%", background: C.danger, border: "2px solid #fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 800, color: "#fff" }}>{unread}</div>}
                        </button>

                        {/* Notification dropdown */}
                        {showNotifs && (
                            <div style={{ position: "absolute", top: 44, right: 0, width: 320, background: C.bg, borderRadius: 12, boxShadow: "0 8px 28px rgba(0,0,0,0.12)", border: `1px solid ${C.border}`, zIndex: 200, overflow: "hidden" }}>
                                <div style={{ padding: "12px 16px", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>Notifications</span>
                                    {unread > 0 && <button onClick={markAllRead} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 11, color: C.accent, fontWeight: 600 }}>Mark all read</button>}
                                </div>
                                <div style={{ maxHeight: 320, overflowY: "auto" }}>
                                    {notifs.map((n) => {
                                        const s = typeStyle(n.type);
                                        return (
                                            <div key={n.id} style={{ padding: "12px 16px", borderBottom: `1px solid ${C.border}`, background: n.read ? C.bg : C.bgSubtle, cursor: "default" }}>
                                                <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                                                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: s.dot, marginTop: 4, flexShrink: 0 }} />
                                                    <div style={{ flex: 1 }}>
                                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
                                                            <span style={{ fontSize: 12, fontWeight: 700, color: C.text }}>{n.title}</span>
                                                            <span style={{ fontSize: 10, color: C.textLight }}>{n.time}</span>
                                                        </div>
                                                        <div style={{ fontSize: 12, color: C.textMuted, lineHeight: 1.5 }}>{n.body}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>

                    <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{u.name}</div>
                        <div style={{ fontSize: 11, color: C.textLight }}>{u.platform} · {u.workerId}</div>
                    </div>
                    <button onClick={onLogout} style={{ background: "none", border: `1px solid ${C.border}`, borderRadius: 7, padding: "5px 12px", fontSize: 12, fontWeight: 600, color: C.textMuted, cursor: "pointer" }}>Logout</button>
                </div>
            </nav>

            <div style={{ flex: 1, maxWidth: 520, width: "100%", margin: "0 auto", padding: "20px 16px 100px" }}>

                {/* Live payout banner — shown on login */}
                {showBanner && (
                    <div style={{ background: C.successLight, border: "1px solid #A7F3D0", borderRadius: 10, padding: "12px 16px", marginBottom: 14, display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
                        <div>
                            <div style={{ fontSize: 13, fontWeight: 700, color: C.success }}>Payout Credited — ₹1,500</div>
                            <div style={{ fontSize: 12, color: C.textMuted, marginTop: 2 }}>Heavy Rain (HRA) triggered in Koramangala at 09:14 AM. Amount credited to your UPI.</div>
                        </div>
                        <button onClick={() => setShowBanner(false)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 16, color: C.textLight, flexShrink: 0, lineHeight: 1 }}>×</button>
                    </div>
                )}

                {/* HOME */}
                {tab === "home" && (<>
                    <div style={{ marginBottom: 18 }}>
                        <h2 style={{ fontSize: 18, fontWeight: 800, color: C.text, letterSpacing: -0.3 }}>Welcome back, {u.name.split(" ")[0]}</h2>
                        <p style={{ fontSize: 13, color: C.textMuted, marginTop: 2 }}>{u.zone}, {u.city} — {u.platform} · Coverage active</p>
                    </div>

                    {/* Policy card */}
                    <div style={{ background: `linear-gradient(135deg, ${C.logoBlue} 0%, #0F172A 100%)`, borderRadius: 16, padding: "20px", marginBottom: 14, color: "#fff" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                            <div>
                                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 3 }}>Active Policy</div>
                                <div style={{ fontSize: 17, fontWeight: 800, letterSpacing: -0.3 }}>Individual Cover</div>
                                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginTop: 1 }}>{u.platform} · {u.zone}</div>
                            </div>
                            <div style={{ background: "rgba(5,150,105,0.2)", border: "1px solid rgba(5,150,105,0.35)", borderRadius: 20, padding: "3px 10px", fontSize: 10, fontWeight: 700, color: "#6EE7B7", letterSpacing: 0.5 }}>ACTIVE</div>
                        </div>
                        <div style={{ display: "flex", gap: 20, paddingTop: 12, borderTop: "1px solid rgba(255,255,255,0.07)" }}>
                            {[["Premium", "₹149/mo"], ["Max Payout", "₹4,500"], ["Valid Till", "Dec 2025"]].map(([l, v]) => (
                                <div key={l}>
                                    <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: 0.5 }}>{l}</div>
                                    <div style={{ fontSize: 14, fontWeight: 800, marginTop: 2 }}>{v}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Quick actions */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
                        {[{ icon: "▤", label: "My Policy", sub: "View details & coverage", page: "policy" }, { icon: "≡", label: "My Claims", sub: "View payout history", page: "claims" }].map((item) => (
                            <button key={item.label} onClick={() => onNavigate(item.page)} style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 12, padding: "15px", textAlign: "left", cursor: "pointer", transition: "box-shadow 0.15s, transform 0.15s" }}
                                onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 4px 14px rgba(0,0,0,0.07)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
                                onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "translateY(0)"; }}
                            >
                                <div style={{ fontSize: 20, marginBottom: 8, color: C.logoBlue, fontWeight: 700 }}>{item.icon}</div>
                                <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{item.label}</div>
                                <div style={{ fontSize: 11, color: C.textMuted, marginTop: 2 }}>{item.sub}</div>
                            </button>
                        ))}
                    </div>

                    {/* Status strip */}
                    <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 10, padding: "12px 14px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <div style={{ width: 7, height: 7, borderRadius: "50%", background: C.success, boxShadow: `0 0 0 3px ${C.successLight}` }} />
                            <span style={{ fontSize: 13, fontWeight: 600, color: C.text }}>Coverage Active</span>
                        </div>
                        <span style={{ fontSize: 11, color: C.textMuted }}>Zone monitoring — live</span>
                    </div>
                </>)}

                {/* EARNINGS */}
                {tab === "earnings" && (<>
                    <div style={{ marginBottom: 18 }}>
                        <h2 style={{ fontSize: 18, fontWeight: 800, color: C.text }}>This Week's Earnings</h2>
                        <p style={{ fontSize: 13, color: C.textMuted, marginTop: 2 }}>Protected income across all delivery days</p>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
                        <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 12, padding: "14px" }}>
                            <div style={{ fontSize: 10, color: C.textMuted, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 5 }}>Actual Earned</div>
                            <div style={{ fontSize: 22, fontWeight: 800, color: C.text }}>₹{EARNINGS_DATA.reduce((s, d) => s + d.earned, 0).toLocaleString()}</div>
                        </div>
                        <div style={{ background: C.accentLight, border: "1px solid #BFDBFE", borderRadius: 12, padding: "14px" }}>
                            <div style={{ fontSize: 10, color: C.accent, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 5 }}>Protected</div>
                            <div style={{ fontSize: 22, fontWeight: 800, color: C.accent }}>₹{EARNINGS_DATA.reduce((s, d) => s + d.protected, 0).toLocaleString()}</div>
                        </div>
                    </div>
                    <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 12, padding: "18px" }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 14 }}>Daily Breakdown</div>
                        <div style={{ display: "flex", gap: 8, alignItems: "flex-end", height: 110 }}>
                            {EARNINGS_DATA.map((d) => (
                                <div key={d.day} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                                    <div style={{ fontSize: 9, color: C.textLight, fontWeight: 600 }}>{d.earned > 0 ? `₹${d.earned}` : "—"}</div>
                                    <div style={{ width: "72%", height: Math.round((d.protected / maxE) * 88), background: d.earned === 0 ? C.accentLight : C.accent, borderRadius: 4, border: d.earned === 0 ? "1px dashed #93C5FD" : "none", minHeight: 4 }} />
                                    <div style={{ fontSize: 10, color: C.textMuted }}>{d.day}</div>
                                </div>
                            ))}
                        </div>
                        <div style={{ display: "flex", gap: 14, marginTop: 10, paddingTop: 10, borderTop: `1px solid ${C.border}` }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 5 }}><div style={{ width: 10, height: 10, borderRadius: 2, background: C.accent }} /><span style={{ fontSize: 11, color: C.textMuted }}>Earned</span></div>
                            <div style={{ display: "flex", alignItems: "center", gap: 5 }}><div style={{ width: 10, height: 10, borderRadius: 2, background: C.accentLight, border: "1px dashed #93C5FD" }} /><span style={{ fontSize: 11, color: C.textMuted }}>Protected (disruption)</span></div>
                        </div>
                    </div>
                </>)}

                {/* KAVACH SCORE */}
                {tab === "score" && (<>
                    <div style={{ marginBottom: 18 }}>
                        <h2 style={{ fontSize: 18, fontWeight: 800, color: C.text }}>Your KavachScore</h2>
                        <p style={{ fontSize: 13, color: C.textMuted, marginTop: 2 }}>Scored out of 900 — like a CIBIL score for gig workers</p>
                    </div>
                    <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 16, padding: "28px 20px", textAlign: "center", marginBottom: 14 }}>
                        <div style={{ position: "relative", display: "inline-block", marginBottom: 14 }}>
                            <svg width="130" height="130" viewBox="0 0 130 130">
                                <circle cx="65" cy="65" r="54" fill="none" stroke={C.bgMuted} strokeWidth="11" />
                                <circle cx="65" cy="65" r="54" fill="none" stroke={col} strokeWidth="11"
                                    strokeDasharray={`${2 * Math.PI * 54}`}
                                    strokeDashoffset={`${2 * Math.PI * 54 * (1 - KAVACH_SCORE / SCORE_MAX)}`}
                                    strokeLinecap="round" transform="rotate(-90 65 65)"
                                />
                            </svg>
                            <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", textAlign: "center" }}>
                                <div style={{ fontSize: 28, fontWeight: 900, color: col }}>{KAVACH_SCORE}</div>
                                <div style={{ fontSize: 10, color: C.textMuted }}>/ {SCORE_MAX}</div>
                            </div>
                        </div>
                        <div style={{ fontSize: 16, fontWeight: 800, color: col }}>{scoreLabel(KAVACH_SCORE)}</div>
                        <div style={{ fontSize: 12, color: C.textMuted, marginTop: 4, maxWidth: 260, margin: "6px auto 0" }}>Top 15% of workers — eligible for priority payouts</div>
                        <div style={{ marginTop: 16, background: C.bgMuted, borderRadius: 8, height: 7, overflow: "hidden", maxWidth: 260, margin: "16px auto 0" }}>
                            <div style={{ height: "100%", width: `${(KAVACH_SCORE / SCORE_MAX) * 100}%`, background: col, borderRadius: 8 }} />
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", maxWidth: 260, margin: "4px auto 0", fontSize: 10, color: C.textLight }}>
                            <span>0</span><span>300</span><span>600</span><span>900</span>
                        </div>
                    </div>
                    <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 12, overflow: "hidden" }}>
                        <div style={{ padding: "12px 16px", borderBottom: `1px solid ${C.border}`, fontSize: 13, fontWeight: 700, color: C.text }}>Score Breakdown</div>
                        {SCORE_ITEMS.map((item, i) => (
                            <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "11px 16px", borderBottom: i < SCORE_ITEMS.length - 1 ? `1px solid ${C.border}` : "none" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                    <div style={{ width: 20, height: 20, borderRadius: "50%", background: item.done ? C.successLight : C.bgMuted, border: `1.5px solid ${item.done ? "#A7F3D0" : C.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: item.done ? C.success : C.textLight }}>{item.done ? "✓" : "○"}</div>
                                    <span style={{ fontSize: 13, color: item.done ? C.text : C.textMuted }}>{item.label}</span>
                                </div>
                                <span style={{ fontSize: 11, fontWeight: 600, color: item.done ? C.success : C.warning }}>{item.done ? "+100" : "Pending"}</span>
                            </div>
                        ))}
                    </div>
                </>)}
            </div>

            {/* Bottom nav */}
            <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: C.bg, borderTop: `1px solid ${C.border}`, display: "flex", zIndex: 50 }}>
                {TABS.map((t) => (
                    <button key={t.id} onClick={() => setTab(t.id)} style={{ flex: 1, padding: "10px 4px 12px", background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                        <span style={{ fontSize: 18, color: tab === t.id ? C.accent : C.textLight, fontWeight: 700 }}>{t.icon}</span>
                        <span style={{ fontSize: 10, fontWeight: 700, color: tab === t.id ? C.accent : C.textLight }}>{t.label}</span>
                        {tab === t.id && <div style={{ width: 18, height: 2, background: C.accent, borderRadius: 1 }} />}
                    </button>
                ))}
                <button onClick={() => onNavigate("chatbot")} style={{ flex: 1, padding: "10px 4px 12px", background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.textLight} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
                    <span style={{ fontSize: 10, fontWeight: 700, color: C.textLight }}>Chat</span>
                </button>
            </div>
        </div>
    );
}