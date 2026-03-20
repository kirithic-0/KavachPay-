import React, { useState } from "react";

const C = {
    accent: "#2563EB", accentLight: "#EFF6FF",
    bg: "#FFFFFF", bgSubtle: "#F9FAFB", bgMuted: "#F3F4F6",
    text: "#111827", textMuted: "#6B7280", textLight: "#9CA3AF",
    border: "#E5E7EB", success: "#059669", successLight: "#ECFDF5",
    danger: "#DC2626", dangerLight: "#FEF2F2",
};

const USERS = [
    { email: "ravi@kavachpay.in", password: "ravi123", name: "Ravi Kumar", platform: "Swiggy", workerId: "KOR-3847261", employeeId: "SWG-EMP-001", role: "worker" },
    { email: "priya@kavachpay.in", password: "priya123", name: "Priya Sharma", platform: "Zomato", workerId: "ADY-1923847", employeeId: "ZMT-EMP-042", role: "worker" },
    { email: "arjun@kavachpay.in", password: "arjun123", name: "Arjun Das", platform: "Swiggy", workerId: "ANH-5531290", employeeId: "SWG-EMP-087", role: "worker" },
];

const INSTANT_CARDS = [
    { name: "Ravi Kumar", platform: "Swiggy", email: "ravi@kavachpay.in", password: "ravi123", emoji: "", bg: "#FFF7ED", border: "#FED7AA", tag: "Swiggy" },
    { name: "Priya Sharma", platform: "Zomato", email: "priya@kavachpay.in", password: "priya123", emoji: "", bg: "#FFF1F2", border: "#FECDD3", tag: "Zomato" },
    { name: "Arjun Das", platform: "Swiggy", email: "arjun@kavachpay.in", password: "arjun123", emoji: "", bg: "#FFF7ED", border: "#FED7AA", tag: "Swiggy" },
];

const inputStyle = {
    width: "100%", padding: "10px 13px", border: `1px solid ${C.border}`, borderRadius: 8,
    fontSize: 14, color: C.text, background: C.bg, outline: "none", fontFamily: "inherit",
    transition: "border-color 0.15s, box-shadow 0.15s",
};

export default function Login({ onLogin, onSignup, onBack }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [mode, setMode] = useState("login");
    const [resetEmail, setResetEmail] = useState("");
    const [otpSent, setOtpSent] = useState(false);
    const [otp, setOtp] = useState("");
    const [newPass, setNewPass] = useState("");
    const [confirmPass, setConfirmPass] = useState("");
    const [resetMsg, setResetMsg] = useState("");
    const [filled, setFilled] = useState(null); // which card was clicked

    const onFocus = (e) => { e.target.style.borderColor = C.accent; e.target.style.boxShadow = "0 0 0 3px rgba(37,99,235,0.08)"; };
    const onBlur = (e) => { e.target.style.borderColor = C.border; e.target.style.boxShadow = "none"; };

    const fillCard = (card) => {
        setEmail(card.email);
        setPassword(card.password);
        setFilled(card.email);
        setError("");
    };

    const handleLogin = async () => {
        setError("");
        if (!email || !password) { setError("Please fill all fields."); return; }
        const user = USERS.find((u) => u.email === email && u.password === password);
        if (!user) { setError("Invalid email or password."); return; }
        setLoading(true);
        await new Promise((r) => setTimeout(r, 600));
        setLoading(false);
        onLogin(user);
    };

    const handleSendOtp = async () => {
        if (!resetEmail) return;
        setLoading(true);
        await new Promise((r) => setTimeout(r, 600));
        setLoading(false);
        setOtpSent(true);
    };

    const handleReset = async () => {
        if (otp !== "1234") { setResetMsg("Invalid OTP. Use 1234 for demo."); return; }
        if (newPass !== confirmPass) { setResetMsg("Passwords do not match."); return; }
        setLoading(true);
        await new Promise((r) => setTimeout(r, 700));
        setLoading(false);
        setResetMsg("Password reset! You can now login.");
        setTimeout(() => { setMode("login"); setResetMsg(""); setOtpSent(false); setOtp(""); setNewPass(""); setConfirmPass(""); }, 1800);
    };

    return (
        <div style={{ minHeight: "100vh", background: C.bgSubtle, display: "flex", flexDirection: "column", fontFamily: "Inter, -apple-system, sans-serif" }}>
            {/* Top bar */}
            <div style={{ padding: "14px 28px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: `1px solid ${C.border}`, background: C.bg }}>
                <button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 13, color: C.textMuted }}>← Back</button>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <svg width="26" height="26" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="#1A3A5C" /><text x="50" y="68" textAnchor="middle" fontSize="52" fill="white" fontWeight="bold" fontFamily="serif">₹</text></svg>
                    <span style={{ fontWeight: 900, fontSize: 15, color: "#1A3A5C", letterSpacing: 0.5 }}>KAVACHPAY</span>
                </div>
                <div style={{ fontSize: 12, color: C.textLight }}>Worker Login</div>
            </div>

            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "32px 16px" }}>
                <div style={{ width: "100%", maxWidth: 400 }}>

                    {/* LOGIN */}
                    {mode === "login" && (<>
                        <div style={{ marginBottom: 24 }}>
                            <h1 style={{ fontSize: 22, fontWeight: 800, color: C.text, letterSpacing: -0.4 }}>Worker Login</h1>
                            <p style={{ fontSize: 13, color: C.textMuted, marginTop: 4 }}>Click a demo account to instantly fill credentials</p>
                        </div>

                        {/* Instant login cards */}
                        <div style={{ marginBottom: 20 }}>
                            <p style={{ fontSize: 11, fontWeight: 700, color: C.textLight, letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>Demo Accounts — Click to Fill</p>
                            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                {INSTANT_CARDS.map((card) => (
                                    <button key={card.email} onClick={() => fillCard(card)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 14px", background: filled === card.email ? C.accentLight : card.bg, border: `1.5px solid ${filled === card.email ? C.accent : card.border}`, borderRadius: 10, cursor: "pointer", textAlign: "left", transition: "all 0.15s" }}>
                                        <span style={{ fontSize: 22 }}>{card.emoji}</span>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{card.name}</div>
                                            <div style={{ fontSize: 11, color: C.textMuted }}>{card.email}</div>
                                        </div>
                                        <div style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 5, background: card.platform === "Swiggy" ? "#FFF7ED" : "#FFF1F2", color: card.platform === "Swiggy" ? "#EA580C" : "#BE123C" }}>{card.tag}</div>
                                        {filled === card.email && <span style={{ fontSize: 14, color: C.accent }}>✓</span>}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                            <div style={{ flex: 1, height: 1, background: C.border }} />
                            <span style={{ fontSize: 11, color: C.textLight }}>or enter manually</span>
                            <div style={{ flex: 1, height: 1, background: C.border }} />
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                            <div>
                                <label style={{ fontSize: 12, fontWeight: 600, color: C.textMuted, display: "block", marginBottom: 5 }}>Email</label>
                                <input value={email} onChange={(e) => setEmail(e.target.value)} onFocus={onFocus} onBlur={onBlur} type="email" placeholder="you@example.com" style={inputStyle} onKeyDown={(e) => e.key === "Enter" && handleLogin()} />
                            </div>
                            <div>
                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                                    <label style={{ fontSize: 12, fontWeight: 600, color: C.textMuted }}>Password</label>
                                    <button onClick={() => setMode("forgot")} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, color: C.accent }}>Forgot password?</button>
                                </div>
                                <input value={password} onChange={(e) => setPassword(e.target.value)} onFocus={onFocus} onBlur={onBlur} type="password" placeholder="••••••••" style={inputStyle} onKeyDown={(e) => e.key === "Enter" && handleLogin()} />
                            </div>
                            {error && <div style={{ background: C.dangerLight, border: "1px solid #FECACA", borderRadius: 7, padding: "9px 12px", fontSize: 13, color: C.danger }}>{error}</div>}
                            <button onClick={handleLogin} disabled={loading} style={{ width: "100%", padding: "11px", background: C.accent, color: "#fff", border: "none", borderRadius: 8, fontWeight: 700, fontSize: 14, cursor: "pointer", marginTop: 4, transition: "opacity 0.2s" }} onMouseEnter={(e) => !loading && (e.currentTarget.style.opacity = "0.87")} onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}>
                                {loading ? "Signing in…" : "Sign In"}
                            </button>
                        </div>
                        <div style={{ marginTop: 16, textAlign: "center", fontSize: 13, color: C.textMuted }}>
                            Don't have an account?{" "}<button onClick={onSignup} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 13, color: C.accent, fontWeight: 600 }}>Create one</button>
                        </div>
                    </>)}

                    {/* FORGOT PASSWORD */}
                    {mode === "forgot" && (<>
                        <button onClick={() => setMode("login")} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 13, color: C.textMuted, marginBottom: 20, display: "flex", alignItems: "center", gap: 4 }}>← Back to login</button>
                        <h1 style={{ fontSize: 22, fontWeight: 800, color: C.text, marginBottom: 6, letterSpacing: -0.4 }}>Reset Password</h1>
                        <p style={{ fontSize: 13, color: C.textMuted, marginBottom: 24 }}>Enter your registered email to receive an OTP.</p>
                        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                            <div>
                                <label style={{ fontSize: 12, fontWeight: 600, color: C.textMuted, display: "block", marginBottom: 5 }}>Registered Email</label>
                                <input value={resetEmail} onChange={(e) => setResetEmail(e.target.value)} onFocus={onFocus} onBlur={onBlur} type="email" placeholder="you@example.com" style={inputStyle} disabled={otpSent} />
                            </div>
                            {!otpSent ? (
                                <button onClick={handleSendOtp} disabled={loading || !resetEmail} style={{ padding: "11px", background: C.accent, color: "#fff", border: "none", borderRadius: 8, fontWeight: 700, fontSize: 14, cursor: "pointer" }}>{loading ? "Sending…" : "Send OTP"}</button>
                            ) : (<>
                                <div style={{ background: C.successLight, border: "1px solid #A7F3D0", borderRadius: 7, padding: "9px 12px", fontSize: 13, color: C.success }}>OTP sent! Use <strong>1234</strong> for demo.</div>
                                <div>
                                    <label style={{ fontSize: 12, fontWeight: 600, color: C.textMuted, display: "block", marginBottom: 5 }}>OTP</label>
                                    <input value={otp} onChange={(e) => setOtp(e.target.value)} onFocus={onFocus} onBlur={onBlur} placeholder="1234" style={{ ...inputStyle, textAlign: "center", fontSize: 20, fontWeight: 700, letterSpacing: 8 }} maxLength={4} />
                                </div>
                                <div>
                                    <label style={{ fontSize: 12, fontWeight: 600, color: C.textMuted, display: "block", marginBottom: 5 }}>New Password</label>
                                    <input value={newPass} onChange={(e) => setNewPass(e.target.value)} onFocus={onFocus} onBlur={onBlur} type="password" placeholder="••••••••" style={inputStyle} />
                                </div>
                                <div>
                                    <label style={{ fontSize: 12, fontWeight: 600, color: C.textMuted, display: "block", marginBottom: 5 }}>Confirm Password</label>
                                    <input value={confirmPass} onChange={(e) => setConfirmPass(e.target.value)} onFocus={onFocus} onBlur={onBlur} type="password" placeholder="••••••••" style={inputStyle} />
                                </div>
                                {resetMsg && <div style={{ background: resetMsg.includes("reset!") ? C.successLight : C.dangerLight, border: `1px solid ${resetMsg.includes("reset!") ? "#A7F3D0" : "#FECACA"}`, borderRadius: 7, padding: "9px 12px", fontSize: 13, color: resetMsg.includes("reset!") ? C.success : C.danger }}>{resetMsg}</div>}
                                <button onClick={handleReset} disabled={loading} style={{ padding: "11px", background: C.accent, color: "#fff", border: "none", borderRadius: 8, fontWeight: 700, fontSize: 14, cursor: "pointer" }}>{loading ? "Resetting…" : "Reset Password"}</button>
                            </>)}
                        </div>
                    </>)}
                </div>
            </div>
        </div>
    );
}