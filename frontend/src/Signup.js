import React, { useState } from "react";

const C = {
    accent: "#2563EB", accentLight: "#EFF6FF",
    bg: "#FFFFFF", bgSubtle: "#F9FAFB", bgMuted: "#F3F4F6",
    text: "#111827", textMuted: "#6B7280", textLight: "#9CA3AF",
    border: "#E5E7EB", success: "#059669", successLight: "#ECFDF5",
    danger: "#DC2626", dangerLight: "#FEF2F2",
    warning: "#D97706", warningLight: "#FFFBEB",
};

const inputStyle = {
    width: "100%", padding: "10px 13px", border: `1px solid ${C.border}`, borderRadius: 8,
    fontSize: 14, color: C.text, background: C.bg, outline: "none", fontFamily: "inherit",
    transition: "border-color 0.15s, box-shadow 0.15s",
};

const CITIES = ["Bengaluru", "Chennai", "Mumbai", "Delhi", "Hyderabad", "Pune", "Kolkata", "Ahmedabad", "Jaipur", "Coimbatore"];

const ZONES = {
    Bengaluru: ["Koramangala", "Indiranagar", "Whitefield", "HSR Layout", "Jayanagar", "Marathahalli", "Electronic City", "Banashankari", "Rajajinagar", "Yelahanka"],
    Chennai: ["Adyar", "Anna Nagar", "T. Nagar", "Velachery", "Porur", "Thirumangalam", "Tambaram", "Chromepet", "Sholinganallur", "Perambur"],
    Mumbai: ["Andheri", "Bandra", "Thane", "Dadar", "Malad", "Borivali", "Kurla", "Powai", "Goregaon", "Kandivali"],
    Delhi: ["Connaught Place", "Lajpat Nagar", "Dwarka", "Rohini", "Saket", "Pitampura", "Karol Bagh", "Janakpuri", "Vasant Kunj", "Noida Sector 18"],
    Hyderabad: ["Banjara Hills", "Jubilee Hills", "Madhapur", "Kukatpally", "Secunderabad", "Hitech City", "Gachibowli", "Ameerpet", "LB Nagar", "Miyapur"],
    Pune: ["Koregaon Park", "Kothrud", "Viman Nagar", "Hadapsar", "Wakad", "Hinjewadi", "Pimpri", "Shivajinagar", "Baner", "Aundh"],
    Kolkata: ["Salt Lake", "Park Street", "Howrah", "Dum Dum", "Ballygunge", "New Town", "Behala", "Tollygunge", "Garia", "Barra Bazar"],
    Ahmedabad: ["Navrangpura", "Maninagar", "Vastrapur", "Bopal", "Satellite", "Prahladnagar", "Thaltej", "Isanpur", "Chandkheda", "Gota"],
    Jaipur: ["Malviya Nagar", "Vaishali Nagar", "Mansarovar", "C-Scheme", "Jagatpura", "Tonk Road", "Sikar Road", "Pratap Nagar", "Shyam Nagar", "Raja Park"],
    Coimbatore: ["RS Puram", "Gandhipuram", "Saibaba Colony", "Peelamedu", "Singanallur", "Vadavalli", "Ganapathy", "Saravanampatti", "Hopes College", "Kovaipudur"],
};

const PLATFORMS = ["Swiggy", "Zomato"];
const STEPS = ["Account", "Location", "Platform", "Verify", "Payment"];

// ─── Razorpay Dummy Modal ─────────────────────────────────────────────────────
function RazorpayModal({ amount, name, email, onSuccess, onClose }) {
    const [step, setStep] = useState("main"); // main | processing | done
    const [method, setMethod] = useState("upi");
    const [upiId, setUpiId] = useState("");
    const [cardNo, setCardNo] = useState("");
    const [expiry, setExpiry] = useState("");
    const [cvv, setCvv] = useState("");

    const handlePay = async () => {
        if (method === "upi" && !upiId) return;
        if (method === "card" && (!cardNo || !expiry || !cvv)) return;
        setStep("processing");
        await new Promise((r) => setTimeout(r, 1800));
        setStep("done");
        await new Promise((r) => setTimeout(r, 1000));
        onSuccess();
    };

    return (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999 }}>
            <div style={{ background: C.bg, borderRadius: 16, width: "100%", maxWidth: 380, overflow: "hidden", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
                {/* Header */}
                <div style={{ background: "#072654", padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ background: "#fff", borderRadius: 6, padding: "3px 8px", fontWeight: 900, fontSize: 14, color: "#072654", letterSpacing: 0.5 }}>razorpay</div>
                    </div>
                    <button onClick={onClose} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.6)", fontSize: 18, cursor: "pointer" }}>✕</button>
                </div>

                {/* Amount banner */}
                <div style={{ background: "#EFF6FF", padding: "12px 20px", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                        <div style={{ fontSize: 11, color: C.textMuted }}>Paying to</div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>KavachPay Technologies</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: 11, color: C.textMuted }}>Amount</div>
                        <div style={{ fontSize: 20, fontWeight: 900, color: "#072654" }}>₹{amount}</div>
                    </div>
                </div>

                {step === "processing" && (
                    <div style={{ padding: "48px 20px", textAlign: "center" }}>
                        <div style={{ fontSize: 36, marginBottom: 12 }}>⏳</div>
                        <div style={{ fontSize: 15, fontWeight: 700, color: C.text }}>Processing Payment…</div>
                        <div style={{ fontSize: 12, color: C.textMuted, marginTop: 4 }}>Please do not close this window</div>
                    </div>
                )}

                {step === "done" && (
                    <div style={{ padding: "48px 20px", textAlign: "center" }}>
                        <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
                        <div style={{ fontSize: 15, fontWeight: 700, color: C.success }}>Payment Successful!</div>
                        <div style={{ fontSize: 12, color: C.textMuted, marginTop: 4 }}>Activating your policy…</div>
                    </div>
                )}

                {step === "main" && (
                    <div style={{ padding: "16px 20px" }}>
                        {/* Payment method tabs */}
                        <div style={{ display: "flex", background: C.bgMuted, borderRadius: 8, padding: 3, gap: 2, marginBottom: 16 }}>
                            {[{ id: "upi", label: "UPI" }, { id: "card", label: "Card" }, { id: "netbanking", label: "Net Banking" }].map((m) => (
                                <button key={m.id} onClick={() => setMethod(m.id)} style={{ flex: 1, padding: "7px 0", border: "none", borderRadius: 6, background: method === m.id ? "#fff" : "transparent", fontWeight: method === m.id ? 700 : 500, fontSize: 12, color: method === m.id ? C.text : C.textMuted, cursor: "pointer", boxShadow: method === m.id ? "0 1px 3px rgba(0,0,0,0.08)" : "none" }}>{m.label}</button>
                            ))}
                        </div>

                        {/* UPI */}
                        {method === "upi" && (
                            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                                <div>
                                    <label style={{ fontSize: 12, fontWeight: 600, color: C.textMuted, display: "block", marginBottom: 5 }}>UPI ID</label>
                                    <input value={upiId} onChange={(e) => setUpiId(e.target.value)} placeholder="yourname@upi" style={inputStyle} />
                                </div>
                                <div style={{ fontSize: 11, color: C.textMuted, textAlign: "center" }}>or use</div>
                                <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
                                    {["GPay", "PhonePe", "Paytm", "BHIM"].map((app) => (
                                        <button key={app} onClick={() => setUpiId(`demo@${app.toLowerCase()}`)} style={{ padding: "6px 12px", background: C.bgMuted, border: `1px solid ${C.border}`, borderRadius: 7, fontSize: 12, fontWeight: 600, color: C.textMuted, cursor: "pointer" }}>{app}</button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Card */}
                        {method === "card" && (
                            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                                <div>
                                    <label style={{ fontSize: 12, fontWeight: 600, color: C.textMuted, display: "block", marginBottom: 5 }}>Card Number</label>
                                    <input value={cardNo} onChange={(e) => setCardNo(e.target.value)} placeholder="4111 1111 1111 1111" maxLength={19} style={inputStyle} />
                                </div>
                                <div style={{ display: "flex", gap: 10 }}>
                                    <div style={{ flex: 1 }}>
                                        <label style={{ fontSize: 12, fontWeight: 600, color: C.textMuted, display: "block", marginBottom: 5 }}>Expiry</label>
                                        <input value={expiry} onChange={(e) => setExpiry(e.target.value)} placeholder="MM/YY" maxLength={5} style={inputStyle} />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <label style={{ fontSize: 12, fontWeight: 600, color: C.textMuted, display: "block", marginBottom: 5 }}>CVV</label>
                                        <input value={cvv} onChange={(e) => setCvv(e.target.value)} placeholder="•••" maxLength={3} type="password" style={inputStyle} />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Net Banking */}
                        {method === "netbanking" && (
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                                {["SBI", "HDFC", "ICICI", "Axis", "Kotak", "PNB"].map((bank) => (
                                    <button key={bank} onClick={() => setMethod("nb_" + bank)} style={{ padding: "10px", border: `1px solid ${C.border}`, borderRadius: 8, background: C.bg, fontSize: 13, fontWeight: 600, color: C.text, cursor: "pointer" }}>{bank}</button>
                                ))}
                            </div>
                        )}

                        <button onClick={handlePay} style={{ width: "100%", marginTop: 16, padding: "12px", background: "#072654", color: "#fff", border: "none", borderRadius: 8, fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
                            Pay ₹{amount} Securely →
                        </button>
                        <div style={{ textAlign: "center", marginTop: 10, fontSize: 11, color: C.textLight }}>🔒 Secured by Razorpay · 256-bit SSL</div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function Signup({ onSuccess, onBack, onLogin }) {
    const [step, setStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [showRazorpay, setShowRazorpay] = useState(false);

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [employeeId, setEmployeeId] = useState("");

    const [city, setCity] = useState("");
    const [zone, setZone] = useState("");

    const [platform, setPlatform] = useState("");
    const [workerId, setWorkerId] = useState("");
    const [connected, setConnected] = useState(false);
    const [connecting, setConnecting] = useState(false);

    const [otp, setOtp] = useState("");
    const [otpSent, setOtpSent] = useState(false);

    const [paid, setPaid] = useState(false);

    const onFocus = (e) => { e.target.style.borderColor = C.accent; e.target.style.boxShadow = "0 0 0 3px rgba(37,99,235,0.08)"; };
    const onBlur = (e) => { e.target.style.borderColor = C.border; e.target.style.boxShadow = "none"; };

    const validate = () => {
        setError("");
        if (step === 0) {
            if (!name || !email || !phone || !password || !employeeId) { setError("Please fill all fields."); return false; }
            if (phone.length !== 10) { setError("Enter a valid 10-digit phone number."); return false; }
        }
        if (step === 1 && (!city || !zone)) { setError("Please select city and zone."); return false; }
        if (step === 2 && !connected) { setError("Please connect your platform first."); return false; }
        if (step === 3 && otp !== "1234") { setError("Invalid OTP. Use 1234 for demo."); return false; }
        return true;
    };

    const next = async () => {
        if (!validate()) return;
        if (step === 3 && !otpSent) { setError("Please send and verify OTP first."); return; }
        setLoading(true);
        await new Promise((r) => setTimeout(r, 400));
        setLoading(false);
        setStep((s) => s + 1);
    };

    const connectPlatform = async () => {
        if (!platform || !workerId) { setError("Select a platform and enter your Worker ID."); return; }
        setConnecting(true);
        await new Promise((r) => setTimeout(r, 1200));
        setConnecting(false);
        setConnected(true);
        setError("");
    };

    const sendOtp = async () => {
        setLoading(true);
        await new Promise((r) => setTimeout(r, 700));
        setLoading(false);
        setOtpSent(true);
    };

    const handlePaymentSuccess = async () => {
        setShowRazorpay(false);
        setPaid(true);
        await new Promise((r) => setTimeout(r, 1000));
        onSuccess({ name, email, phone, city, zone, platform, workerId, employeeId, role: "worker" });
    };

    const StepDot = ({ i }) => (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
            <div style={{ width: 28, height: 28, borderRadius: "50%", background: i < step ? C.success : i === step ? C.accent : C.bgMuted, border: `2px solid ${i < step ? C.success : i === step ? C.accent : C.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: i <= step ? "#fff" : C.textLight, transition: "all 0.2s" }}>{i < step ? "✓" : i + 1}</div>
            <span style={{ fontSize: 10, color: i === step ? C.accent : C.textLight, fontWeight: i === step ? 700 : 400 }}>{STEPS[i]}</span>
        </div>
    );

    return (
        <div style={{ minHeight: "100vh", background: C.bgSubtle, display: "flex", flexDirection: "column", fontFamily: "Inter, -apple-system, sans-serif" }}>
            {showRazorpay && <RazorpayModal amount={149} name={name} email={email} onSuccess={handlePaymentSuccess} onClose={() => setShowRazorpay(false)} />}

            <div style={{ padding: "14px 28px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: `1px solid ${C.border}`, background: C.bg }}>
                <button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 13, color: C.textMuted }}>← Back</button>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <svg width="24" height="24" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="#1A3A5C" /><text x="50" y="68" textAnchor="middle" fontSize="52" fill="white" fontWeight="bold" fontFamily="serif">₹</text></svg>
                    <span style={{ fontWeight: 900, fontSize: 14, color: "#1A3A5C" }}>KAVACHPAY</span>
                </div>
                <button onClick={onLogin} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 13, color: C.accent }}>Login</button>
            </div>

            {/* Step bar */}
            <div style={{ background: C.bg, borderBottom: `1px solid ${C.border}`, padding: "14px 24px" }}>
                <div style={{ maxWidth: 400, margin: "0 auto", display: "flex", justifyContent: "space-between", position: "relative" }}>
                    <div style={{ position: "absolute", top: 13, left: 24, right: 24, height: 2, background: C.border, zIndex: 0 }} />
                    {STEPS.map((_, i) => <StepDot key={i} i={i} />)}
                </div>
            </div>

            <div style={{ flex: 1, display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "28px 16px" }}>
                <div style={{ width: "100%", maxWidth: 420 }}>

                    {/* STEP 0: Account */}
                    {step === 0 && (<>
                        <h2 style={{ fontSize: 20, fontWeight: 800, color: C.text, marginBottom: 6 }}>Create your account</h2>
                        <p style={{ fontSize: 13, color: C.textMuted, marginBottom: 22 }}>Basic details to get you covered.</p>
                        <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
                            {[
                                { label: "Full Name", val: name, set: setName, type: "text", ph: "Ravi Kumar" },
                                { label: "Email", val: email, set: setEmail, type: "email", ph: "you@example.com" },
                                { label: "Phone Number", val: phone, set: setPhone, type: "tel", ph: "9876543210", max: 10 },
                                { label: "Password", val: password, set: setPassword, type: "password", ph: "••••••••" },
                                { label: "Employee ID (from your platform)", val: employeeId, set: setEmployeeId, type: "text", ph: "e.g. SWG-EMP-001" },
                            ].map(({ label, val, set, type, ph, max }) => (
                                <div key={label}>
                                    <label style={{ fontSize: 12, fontWeight: 600, color: C.textMuted, display: "block", marginBottom: 5 }}>{label}</label>
                                    <input value={val} onChange={(e) => set(e.target.value)} onFocus={onFocus} onBlur={onBlur} type={type} placeholder={ph} maxLength={max} style={inputStyle} />
                                </div>
                            ))}
                        </div>
                    </>)}

                    {/* STEP 1: Location */}
                    {step === 1 && (<>
                        <h2 style={{ fontSize: 20, fontWeight: 800, color: C.text, marginBottom: 6 }}>Your delivery zone</h2>
                        <p style={{ fontSize: 13, color: C.textMuted, marginBottom: 22 }}>We use this to detect local disruptions in your area.</p>
                        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                            <div>
                                <label style={{ fontSize: 12, fontWeight: 600, color: C.textMuted, display: "block", marginBottom: 5 }}>City</label>
                                <select value={city} onChange={(e) => { setCity(e.target.value); setZone(""); }} onFocus={onFocus} onBlur={onBlur} style={inputStyle}>
                                    <option value="">Select city…</option>
                                    {CITIES.map((c) => <option key={c}>{c}</option>)}
                                </select>
                            </div>
                            {city && (
                                <div>
                                    <label style={{ fontSize: 12, fontWeight: 600, color: C.textMuted, display: "block", marginBottom: 5 }}>Zone</label>
                                    <select value={zone} onChange={(e) => setZone(e.target.value)} onFocus={onFocus} onBlur={onBlur} style={inputStyle}>
                                        <option value="">Select zone…</option>
                                        {ZONES[city].map((z) => <option key={z}>{z}</option>)}
                                    </select>
                                </div>
                            )}
                        </div>
                    </>)}

                    {/* STEP 2: Platform */}
                    {step === 2 && (<>
                        <h2 style={{ fontSize: 20, fontWeight: 800, color: C.text, marginBottom: 6 }}>Connect your platform</h2>
                        <p style={{ fontSize: 13, color: C.textMuted, marginBottom: 22 }}>We verify your delivery account to activate coverage.</p>
                        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                            <div>
                                <label style={{ fontSize: 12, fontWeight: 600, color: C.textMuted, display: "block", marginBottom: 8 }}>Platform</label>
                                <div style={{ display: "flex", gap: 10 }}>
                                    {PLATFORMS.map((p) => (
                                        <button key={p} onClick={() => { setPlatform(p); setConnected(false); }} style={{ flex: 1, padding: "14px", border: `2px solid ${platform === p ? C.accent : C.border}`, borderRadius: 10, background: platform === p ? C.accentLight : C.bg, fontWeight: 700, fontSize: 14, color: platform === p ? C.accent : C.textMuted, cursor: "pointer", transition: "all 0.15s" }}>
                                            {p === "Swiggy" ? "🧡 Swiggy" : "❤️ Zomato"}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label style={{ fontSize: 12, fontWeight: 600, color: C.textMuted, display: "block", marginBottom: 5 }}>Worker / Partner ID</label>
                                <input value={workerId} onChange={(e) => setWorkerId(e.target.value)} onFocus={onFocus} onBlur={onBlur} placeholder="e.g. KOR-3847261" style={inputStyle} disabled={connected} />
                            </div>
                            {!connected ? (
                                <button onClick={connectPlatform} disabled={connecting} style={{ padding: "11px", background: C.accent, color: "#fff", border: "none", borderRadius: 8, fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
                                    {connecting ? "Connecting to " + (platform || "platform") + "…" : "Connect " + (platform || "Platform") + " Account"}
                                </button>
                            ) : (
                                <div style={{ background: C.successLight, border: "1px solid #A7F3D0", borderRadius: 10, padding: "14px", display: "flex", alignItems: "center", gap: 10 }}>
                                    <span style={{ fontSize: 20 }}>✅</span>
                                    <div>
                                        <div style={{ fontSize: 13, fontWeight: 700, color: C.success }}>Connected to {platform}</div>
                                        <div style={{ fontSize: 12, color: C.textMuted }}>Worker ID verified: {workerId}</div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </>)}

                    {/* STEP 3: OTP */}
                    {step === 3 && (<>
                        <h2 style={{ fontSize: 20, fontWeight: 800, color: C.text, marginBottom: 6 }}>Verify your phone</h2>
                        <p style={{ fontSize: 13, color: C.textMuted, marginBottom: 22 }}>We'll send a 4-digit OTP to <strong>+91 {phone}</strong></p>
                        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                            {!otpSent ? (
                                <button onClick={sendOtp} disabled={loading} style={{ padding: "11px", background: C.accent, color: "#fff", border: "none", borderRadius: 8, fontWeight: 700, fontSize: 14, cursor: "pointer" }}>{loading ? "Sending…" : "Send OTP"}</button>
                            ) : (<>
                                <div style={{ background: C.successLight, border: "1px solid #A7F3D0", borderRadius: 7, padding: "9px 12px", fontSize: 13, color: C.success }}>OTP sent! Use <strong>1234</strong> for demo.</div>
                                <div>
                                    <label style={{ fontSize: 12, fontWeight: 600, color: C.textMuted, display: "block", marginBottom: 5 }}>Enter OTP</label>
                                    <input value={otp} onChange={(e) => setOtp(e.target.value)} onFocus={onFocus} onBlur={onBlur} placeholder="1 2 3 4" maxLength={4} style={{ ...inputStyle, textAlign: "center", fontSize: 24, fontWeight: 700, letterSpacing: 10 }} />
                                </div>
                            </>)}
                        </div>
                    </>)}

                    {/* STEP 4: Payment */}
                    {step === 4 && (<>
                        <h2 style={{ fontSize: 20, fontWeight: 800, color: C.text, marginBottom: 6 }}>Activate your policy</h2>
                        <p style={{ fontSize: 13, color: C.textMuted, marginBottom: 22 }}>Review your plan and complete payment.</p>
                        <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 12, padding: "18px", marginBottom: 16 }}>
                            {[
                                ["Plan", `Individual Cover — ${platform}`],
                                ["Zone", `${zone}, ${city}`],
                                ["Worker ID", workerId],
                                ["Employee ID", employeeId],
                                ["Monthly Premium", "₹149 / month"],
                            ].map(([label, value]) => (
                                <div key={label} style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                                    <span style={{ fontSize: 13, color: C.textMuted }}>{label}</span>
                                    <span style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{value}</span>
                                </div>
                            ))}
                            <div style={{ height: 1, background: C.border, marginBottom: 10 }} />
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                                <span style={{ fontSize: 14, fontWeight: 700, color: C.text }}>Due Today</span>
                                <span style={{ fontSize: 18, fontWeight: 800, color: C.accent }}>₹149</span>
                            </div>
                        </div>
                        {paid ? (
                            <div style={{ background: C.successLight, border: "1px solid #A7F3D0", borderRadius: 10, padding: "20px", textAlign: "center" }}>
                                <div style={{ fontSize: 32, marginBottom: 8 }}>🎉</div>
                                <div style={{ fontSize: 15, fontWeight: 700, color: C.success }}>You're covered!</div>
                                <div style={{ fontSize: 13, color: C.textMuted, marginTop: 4 }}>Redirecting to dashboard…</div>
                            </div>
                        ) : (
                            <button onClick={() => setShowRazorpay(true)} style={{ width: "100%", padding: "13px", background: "#072654", color: "#fff", border: "none", borderRadius: 8, fontWeight: 700, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                                <span>Pay ₹149 via</span>
                                <span style={{ background: "#fff", color: "#072654", fontWeight: 900, fontSize: 12, padding: "1px 6px", borderRadius: 3 }}>razorpay</span>
                            </button>
                        )}
                    </>)}

                    {error && <div style={{ marginTop: 12, background: C.dangerLight, border: "1px solid #FECACA", borderRadius: 7, padding: "9px 12px", fontSize: 13, color: C.danger }}>{error}</div>}

                    {step < 4 && (
                        <button onClick={next} disabled={loading} style={{ width: "100%", marginTop: 18, padding: "11px", background: C.accent, color: "#fff", border: "none", borderRadius: 8, fontWeight: 700, fontSize: 14, cursor: "pointer", transition: "opacity 0.2s" }} onMouseEnter={(e) => !loading && (e.currentTarget.style.opacity = "0.87")} onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}>
                            {loading ? "Please wait…" : "Continue →"}
                        </button>
                    )}
                    {step > 0 && step < 4 && (
                        <button onClick={() => { setStep((s) => s - 1); setError(""); }} style={{ width: "100%", marginTop: 8, padding: "10px", background: "none", border: `1px solid ${C.border}`, borderRadius: 8, fontWeight: 600, fontSize: 13, color: C.textMuted, cursor: "pointer" }}>← Back</button>
                    )}
                </div>
            </div>
        </div>
    );
}