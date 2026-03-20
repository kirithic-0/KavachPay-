import React, { useState } from "react";

const C = {
    accent: "#2563EB",
    bg: "#FFFFFF",
    bgSubtle: "#F9FAFB",
    bgMuted: "#F3F4F6",
    text: "#111827",
    textMuted: "#6B7280",
    textLight: "#9CA3AF",
    border: "#E5E7EB",
    danger: "#DC2626",
    dangerLight: "#FEF2F2",
};

const inputStyle = {
    width: "100%", padding: "10px 13px",
    border: `1px solid ${C.border}`, borderRadius: 8,
    fontSize: 14, color: C.text, background: C.bg,
    outline: "none", fontFamily: "inherit",
    transition: "border-color 0.15s, box-shadow 0.15s",
};

export default function AdminLogin({ onLogin, onBack }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const onFocus = (e) => { e.target.style.borderColor = C.accent; e.target.style.boxShadow = "0 0 0 3px rgba(37,99,235,0.08)"; };
    const onBlur = (e) => { e.target.style.borderColor = C.border; e.target.style.boxShadow = "none"; };

    const handleLogin = async () => {
        setError("");
        if (!email || !password) { setError("Please fill all fields."); return; }
        if (email !== "admin@kavachpay.in" || password !== "admin123") {
            setError("Invalid admin credentials."); return;
        }
        setLoading(true);
        await new Promise((r) => setTimeout(r, 700));
        setLoading(false);
        onLogin({ email, name: "Admin", role: "admin" });
    };

    return (
        <div style={{ minHeight: "100vh", background: C.bgSubtle, display: "flex", flexDirection: "column", fontFamily: "Inter, -apple-system, sans-serif" }}>

            {/* Top bar */}
            <div style={{ padding: "14px 28px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: `1px solid ${C.border}`, background: C.bg }}>
                <button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 13, color: C.textMuted }}>← Back</button>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span>🛡️</span>
                    <span style={{ fontWeight: 800, fontSize: 15, color: C.text }}>Kavach<span style={{ color: C.accent }}>Pay</span></span>
                </div>
                <div style={{ width: 60 }} />
            </div>

            {/* Main */}
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 16px" }}>
                <div style={{ width: "100%", maxWidth: 380 }}>

                    {/* Header */}
                    <div style={{ marginBottom: 28 }}>
                        <div style={{ width: 44, height: 44, borderRadius: 10, background: C.bgMuted, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, marginBottom: 14 }}>⚙️</div>
                        <h1 style={{ fontSize: 22, fontWeight: 800, color: C.text, letterSpacing: -0.4 }}>Admin Portal</h1>
                        <p style={{ fontSize: 13, color: C.textMuted, marginTop: 4 }}>Restricted access — authorised personnel only</p>
                    </div>

                    {/* Demo hint */}
                    <div style={{ background: C.bgMuted, border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 14px", marginBottom: 20, fontSize: 12, color: C.textMuted }}>
                        Demo: <span style={{ fontWeight: 600, color: C.text }}>admin@kavachpay.in</span> / <span style={{ fontWeight: 600, color: C.text }}>admin123</span>
                        <button onClick={() => { setEmail("admin@kavachpay.in"); setPassword("admin123"); }} style={{ marginLeft: 10, background: "none", border: "none", cursor: "pointer", fontSize: 12, color: C.accent, fontWeight: 600 }}>Fill →</button>
                    </div>

                    {/* Form */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                        <div>
                            <label style={{ fontSize: 12, fontWeight: 600, color: C.textMuted, display: "block", marginBottom: 5 }}>Email address</label>
                            <input value={email} onChange={(e) => setEmail(e.target.value)} onFocus={onFocus} onBlur={onBlur} type="email" placeholder="admin@kavachpay.in" style={inputStyle} onKeyDown={(e) => e.key === "Enter" && handleLogin()} />
                        </div>
                        <div>
                            <label style={{ fontSize: 12, fontWeight: 600, color: C.textMuted, display: "block", marginBottom: 5 }}>Password</label>
                            <input value={password} onChange={(e) => setPassword(e.target.value)} onFocus={onFocus} onBlur={onBlur} type="password" placeholder="••••••••" style={inputStyle} onKeyDown={(e) => e.key === "Enter" && handleLogin()} />
                        </div>

                        {error && (
                            <div style={{ background: C.dangerLight, border: "1px solid #FECACA", borderRadius: 7, padding: "9px 12px", fontSize: 13, color: C.danger }}>{error}</div>
                        )}

                        <button onClick={handleLogin} disabled={loading} style={{ width: "100%", padding: "11px", background: C.accent, color: "#fff", border: "none", borderRadius: 8, fontWeight: 700, fontSize: 14, cursor: "pointer", marginTop: 4, transition: "opacity 0.2s" }}
                            onMouseEnter={(e) => !loading && (e.currentTarget.style.opacity = "0.87")}
                            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                        >{loading ? "Signing in…" : "Sign in to Admin"}</button>
                    </div>
                </div>
            </div>
        </div>
    );
}