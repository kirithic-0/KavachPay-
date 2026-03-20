import React, { useState, useRef, useEffect } from "react";
import Login from "./Login";
import AdminLogin from "./AdminLogin";
import Signup from "./Signup";
import Dashboard from "./Dashboard";
import AdminDashboard from "./AdminDashboard";
import Policy from "./Policy";
import Claims from "./Claims";
import Chatbot from "./Chatbot";

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
  borderMid: "#D1D5DB",
  success: "#059669",
  successLight: "#ECFDF5",
  heroTop: "#08101F",
  heroMid: "#0D1829",
  logoBlue: "#1A3A5C",
};

const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

// ─── Logo ─────────────────────────────────────────────────────────────────────
function KavachLogo({ size = 32, light = false }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
        <circle cx="50" cy="50" r="50" fill={C.logoBlue} />
        <text x="50" y="68" textAnchor="middle" fontSize="50" fill="white" fontWeight="bold" fontFamily="Georgia, serif">₹</text>
      </svg>
      <div>
        <div style={{ fontWeight: 900, fontSize: size * 0.48, color: light ? "#fff" : C.logoBlue, letterSpacing: 1.5, lineHeight: 1 }}>KAVACHPAY</div>
        {size >= 28 && <div style={{ fontSize: size * 0.2, color: light ? "rgba(255,255,255,0.4)" : C.textLight, letterSpacing: 1.8, marginTop: 2 }}>TRIGGER · VERIFY · PAY</div>}
      </div>
    </div>
  );
}

// ─── Live ticker ──────────────────────────────────────────────────────────────
const TICKER_ITEMS = [
  "₹1,200 credited — Heavy Rain, Koramangala",
  "₹800 credited — App Outage, Adyar",
  "₹2,400 credited — Curfew, Andheri",
  "₹580 credited — Storm, Banjara Hills",
  "₹400 credited — Dense Fog, Connaught Place",
  "₹1,500 credited — Flood, Salt Lake",
  "₹300 credited — High Wind, Viman Nagar",
];

function LiveTicker() {
  return (
    <div style={{ background: "rgba(37,99,235,0.08)", borderTop: "1px solid rgba(37,99,235,0.12)", borderBottom: "1px solid rgba(37,99,235,0.12)", padding: "9px 0", overflow: "hidden", position: "relative" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
        <div style={{ flexShrink: 0, padding: "0 16px", fontSize: 10, fontWeight: 800, color: C.accent, letterSpacing: 1.5, textTransform: "uppercase", borderRight: "1px solid rgba(37,99,235,0.2)", marginRight: 0, whiteSpace: "nowrap" }}>
          Live Payouts
        </div>
        <div style={{ overflow: "hidden", flex: 1 }}>
          <div style={{ display: "flex", gap: 48, animation: "ticker 28s linear infinite", whiteSpace: "nowrap" }}>
            {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
              <span key={i} style={{ fontSize: 12, color: C.textMuted, flexShrink: 0, display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: C.success, display: "inline-block", flexShrink: 0 }} />
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
      <style>{`
        @keyframes ticker { from { transform: translateX(0); } to { transform: translateX(-50%); } }
      `}</style>
    </div>
  );
}

// ─── Landing Chatbot ──────────────────────────────────────────────────────────
const BOT_ANSWERS = {
  kavachpay: "KavachPay is India's first parametric income insurance for gig delivery workers. When disruptions occur in your zone, we pay you automatically — no paperwork required.",
  works: "1. Sign up and link your Swiggy or Zomato account\n2. A disruption is detected in your zone\n3. KavachPay verifies it via satellite and civic APIs\n4. Money is credited to your UPI — usually within 4 minutes.",
  cost: "Coverage starts at ₹149/month. Maximum payout is ₹4,500. Coverage activates from day one.",
  platforms: "We currently support Swiggy and Zomato. More platforms coming soon.",
  payout: "Payouts are triggered automatically via IMD, NDMA, and civic APIs. Funds reach your UPI within 4 minutes of trigger confirmation.",
  covered: "We cover 13 event types: Heavy Rain, Moderate Rain, Low Rain, Storm, Flood, Curfew, Severe Air Quality, Moderate Air Quality, Dense Fog, High Wind, Earthquake, Landslide, and Heatwave.",
};

function getReply(msg) {
  const m = msg.toLowerCase();
  if (m.includes("kavachpay") || m.includes("what is") || m.includes("about")) return BOT_ANSWERS.kavachpay;
  if (m.includes("how") && m.includes("work")) return BOT_ANSWERS.works;
  if (m.includes("cost") || m.includes("price") || m.includes("₹") || m.includes("much") || m.includes("149")) return BOT_ANSWERS.cost;
  if (m.includes("swiggy") || m.includes("zomato") || m.includes("platform")) return BOT_ANSWERS.platforms;
  if (m.includes("payout") || m.includes("pay") || m.includes("money") || m.includes("upi")) return BOT_ANSWERS.payout;
  if (m.includes("cover") || m.includes("rain") || m.includes("flood") || m.includes("event") || m.includes("type")) return BOT_ANSWERS.covered;
  return "KavachPay protects delivery workers from income loss during disruptions. You can ask me about pricing, covered events, how payouts work, or which platforms we support.";
}

function LandingChatbot({ onSignup }) {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState([{ from: "bot", text: "Welcome to KavachPay. How can I help you today?" }]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs, typing]);

  const send = async (text) => {
    const msg = text || input.trim();
    if (!msg) return;
    setInput("");
    setMsgs((m) => [...m, { from: "user", text: msg }]);
    setTyping(true);
    await new Promise((r) => setTimeout(r, 750));
    setTyping(false);
    setMsgs((m) => [...m, { from: "bot", text: getReply(msg) }]);
  };

  const CHIPS = ["What is KavachPay?", "How does it work?", "What's covered?", "Pricing?"];

  return (
    <>
      <button onClick={() => setOpen(!open)}
        style={{ position: "fixed", bottom: 28, right: 28, width: 54, height: 54, borderRadius: "50%", background: C.logoBlue, border: "none", cursor: "pointer", boxShadow: "0 4px 20px rgba(26,58,92,0.35)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, transition: "transform 0.2s, box-shadow 0.2s" }}
        onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.07)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
      >
        {open
          ? <span style={{ fontSize: 18, color: "#fff", fontWeight: 300, lineHeight: 1 }}>✕</span>
          : <svg width="22" height="22" fill="none" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
        }
      </button>

      {open && (
        <div style={{ position: "fixed", bottom: 94, right: 28, width: 330, background: C.bg, borderRadius: 16, boxShadow: "0 12px 40px rgba(0,0,0,0.14)", border: `1px solid ${C.border}`, zIndex: 999, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div style={{ background: C.logoBlue, padding: "14px 16px", display: "flex", alignItems: "center", gap: 10 }}>
            <svg width="28" height="28" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="rgba(255,255,255,0.15)" /><text x="50" y="66" textAnchor="middle" fontSize="44" fill="white" fontFamily="Georgia,serif">₹</text></svg>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>KavachBot</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.55)" }}>Online — ask me anything</div>
            </div>
          </div>
          <div style={{ height: 210, overflowY: "auto", padding: "12px", display: "flex", flexDirection: "column", gap: 8 }}>
            {msgs.map((m, i) => (
              <div key={i} style={{ display: "flex", justifyContent: m.from === "user" ? "flex-end" : "flex-start" }}>
                <div style={{ maxWidth: "82%", background: m.from === "user" ? C.accent : C.bgMuted, color: m.from === "user" ? "#fff" : C.text, borderRadius: m.from === "user" ? "12px 12px 2px 12px" : "12px 12px 12px 2px", padding: "9px 12px", fontSize: 12, lineHeight: 1.55, whiteSpace: "pre-line" }}>{m.text}</div>
              </div>
            ))}
            {typing && (
              <div style={{ display: "flex", gap: 4, padding: "9px 12px", background: C.bgMuted, borderRadius: "12px 12px 12px 2px", width: "fit-content" }}>
                {[0, 1, 2].map(i => <div key={i} style={{ width: 5, height: 5, borderRadius: "50%", background: C.textLight, animation: "pulse 1.2s infinite", animationDelay: `${i * 0.2}s` }} />)}
              </div>
            )}
            <div ref={bottomRef} />
          </div>
          <div style={{ padding: "6px 10px", display: "flex", gap: 5, overflowX: "auto", borderTop: `1px solid ${C.border}` }}>
            {CHIPS.map((s) => (
              <button key={s} onClick={() => send(s)} style={{ flexShrink: 0, padding: "4px 10px", background: C.bgMuted, border: `1px solid ${C.border}`, borderRadius: 12, fontSize: 11, color: C.textMuted, cursor: "pointer", whiteSpace: "nowrap" }}>{s}</button>
            ))}
          </div>
          <div style={{ padding: "8px 10px", borderTop: `1px solid ${C.border}`, display: "flex", gap: 6 }}>
            <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} placeholder="Ask a question…" style={{ flex: 1, padding: "8px 12px", border: `1px solid ${C.border}`, borderRadius: 20, fontSize: 12, outline: "none", fontFamily: "inherit" }} />
            <button onClick={() => send()} style={{ width: 32, height: 32, borderRadius: "50%", background: C.logoBlue, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
          </div>
          <div style={{ padding: "6px 12px 10px", textAlign: "center", borderTop: `1px solid ${C.border}` }}>
            <button onClick={onSignup} style={{ fontSize: 12, color: C.accent, background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>Get covered today →</button>
          </div>
        </div>
      )}
    </>
  );
}

// ─── Why Choose Us items ──────────────────────────────────────────────────────
const WHY_ITEMS = [
  { number: "01", title: "Zero-Touch Payouts", desc: "No claim forms. No calls. No waiting. Our parametric engine detects disruptions via satellite and civic APIs and triggers payouts the moment a qualifying event occurs in your zone." },
  { number: "02", title: "Built on Real Data", desc: "We integrate with IMD, NDMA, CPCB, and municipal APIs — not manual reports. Your payout is driven by verified, real-time data, not subjective assessments." },
  { number: "03", title: "UPI in Under 4 Minutes", desc: "Once a trigger fires, our settlement engine initiates a direct UPI transfer to your account. Average time from event detection to credit: under 4 minutes." },
  { number: "04", title: "Hyper-Local Precision", desc: "Coverage is zone-specific — not city-level. A disruption in Koramangala does not affect a worker in Whitefield. You're covered exactly where you work." },
  { number: "05", title: "13 Covered Event Types", desc: "Rain (HRA/MRA/LRA), Storm, Flood, Curfew, Air Quality, Fog, Wind, Earthquake, Landslide, and Heatwave — all automatically detected and paid." },
  { number: "06", title: "Designed for Bharat", desc: "UPI-first. Hindi and English. Works on low-end devices. Built specifically for the realities of India's 15 million+ gig delivery workers." },
];

function StepRow({ n, text, last }) {
  return (
    <div style={{ display: "flex", gap: 16 }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{ width: 30, height: 30, borderRadius: "50%", background: C.accent, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 13, color: "#fff", flexShrink: 0 }}>{n}</div>
        {!last && <div style={{ width: 1, flex: 1, background: C.border, marginTop: 4, minHeight: 24 }} />}
      </div>
      <div style={{ paddingTop: 5, paddingBottom: last ? 0 : 24, fontSize: 14, color: C.text, lineHeight: 1.7 }}>{text}</div>
    </div>
  );
}

function TeamCard({ name, initial, role }) {
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ width: 68, height: 68, borderRadius: "50%", background: C.logoBlue, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 10px", fontSize: 24, fontWeight: 800, color: "#fff" }}>{initial}</div>
      <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{name}</div>
      <div style={{ fontSize: 12, color: C.textMuted, marginTop: 2 }}>{role}</div>
    </div>
  );
}

// ─── Landing Page ─────────────────────────────────────────────────────────────
function LandingPage({ onNavigate }) {
  const [lang, setLang] = useState("en");
  const isHi = lang === "hi";

  return (
    <div style={{ fontFamily: "'Inter', -apple-system, sans-serif", background: C.bg, color: C.text }}>

      {/* ── Navbar ── */}
      <nav style={{ position: "sticky", top: 0, zIndex: 100, background: "rgba(255,255,255,0.97)", backdropFilter: "blur(14px)", borderBottom: `1px solid ${C.border}`, padding: "0 48px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 62 }}>
        <KavachLogo size={30} />
        <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
          {[["why", isHi ? "हमें क्यों चुनें" : "Why Choose Us"], ["how", isHi ? "कैसे काम करता है" : "How It Works"], ["about", "About"]].map(([id, label]) => (
            <button key={id} onClick={() => scrollTo(id)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 13, color: C.textMuted, fontWeight: 500, letterSpacing: 0.2 }}>{label}</button>
          ))}
          <div style={{ display: "flex", background: C.bgMuted, borderRadius: 7, padding: 2, border: `1px solid ${C.border}` }}>
            {["en", "hi"].map((l) => (
              <button key={l} onClick={() => setLang(l)} style={{ border: "none", borderRadius: 5, padding: "3px 10px", cursor: "pointer", fontWeight: 600, fontSize: 11, background: lang === l ? "#fff" : "transparent", color: lang === l ? C.text : C.textLight, boxShadow: lang === l ? "0 1px 3px rgba(0,0,0,0.07)" : "none", transition: "all 0.15s" }}>{l.toUpperCase()}</button>
            ))}
          </div>
          <button onClick={() => onNavigate("login")} style={{ background: "none", border: `1px solid ${C.border}`, borderRadius: 7, padding: "7px 16px", fontSize: 13, fontWeight: 600, color: C.text, cursor: "pointer", transition: "border-color 0.15s" }} onMouseEnter={(e) => e.currentTarget.style.borderColor = C.borderMid} onMouseLeave={(e) => e.currentTarget.style.borderColor = C.border}>{isHi ? "लॉगिन" : "Login"}</button>
          <button onClick={() => onNavigate("adminLogin")} style={{ background: "none", border: `1px solid ${C.border}`, borderRadius: 7, padding: "7px 16px", fontSize: 13, fontWeight: 500, color: C.textMuted, cursor: "pointer" }}>{isHi ? "एडमिन" : "Admin"}</button>
          <button onClick={() => onNavigate("signup")} style={{ background: C.logoBlue, color: "#fff", border: "none", borderRadius: 7, padding: "8px 20px", fontWeight: 700, fontSize: 13, cursor: "pointer", transition: "opacity 0.2s, transform 0.15s", letterSpacing: 0.2 }} onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.88"; e.currentTarget.style.transform = "translateY(-1px)"; }} onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.transform = "translateY(0)"; }}>{isHi ? "शुरू करें" : "Get Started"}</button>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section style={{ background: `linear-gradient(170deg, ${C.heroTop} 0%, ${C.heroMid} 100%)`, padding: "120px 48px 100px", position: "relative", overflow: "hidden" }}>
        {/* Subtle grid overlay */}
        <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)", backgroundSize: "60px 60px", pointerEvents: "none" }} />
        {/* Glow */}
        <div style={{ position: "absolute", top: "30%", left: "50%", transform: "translateX(-50%)", width: 800, height: 400, background: "radial-gradient(ellipse, rgba(37,99,235,0.07) 0%, transparent 70%)", pointerEvents: "none" }} />

        <div style={{ position: "relative", maxWidth: 1100, margin: "0 auto", display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 0 }}>

          {/* Logo */}
          <div style={{ marginBottom: 48 }}>
            <KavachLogo size={44} light />
          </div>

          {/* Label */}
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, border: "1px solid rgba(255,255,255,0.08)", borderRadius: 5, padding: "5px 14px", marginBottom: 28 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: C.success }} />
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontWeight: 600, letterSpacing: 1.5, textTransform: "uppercase" }}>
              {isHi ? "भारत का पहला पैरामेट्रिक इनकम इंश्योरेंस" : "India's First Parametric Income Insurance for Gig Workers"}
            </span>
          </div>

          {/* Headline */}
          <h1 style={{ fontSize: "clamp(42px, 6vw, 76px)", fontWeight: 900, color: "#fff", lineHeight: 1.02, letterSpacing: -2, marginBottom: 28, maxWidth: 820 }}>
            {isHi
              ? <span>जब शहर रुक जाए,<br /><span style={{ color: "rgba(255,255,255,0.35)" }}>आपकी कमाई</span> नहीं।</span>
              : <span>When the city stops,<br /><span style={{ color: "rgba(255,255,255,0.35)" }}>your income</span> doesn't.</span>
            }
          </h1>

          {/* Sub */}
          <p style={{ fontSize: 17, color: "rgba(255,255,255,0.48)", lineHeight: 1.85, maxWidth: 560, marginBottom: 44, fontWeight: 400 }}>
            {isHi
              ? "बारिश, दंगे, या ऐप आउटेज — KavachPay ऑटोमैटिक डिटेक्ट करता है और सीधे आपके UPI पर भुगतान करता है। कोई फॉर्म नहीं। कोई इंतज़ार नहीं।"
              : "Rain, riots, app outages — KavachPay detects disruptions in your zone and credits your UPI automatically. No forms. No calls. No waiting."
            }
          </p>

          {/* CTAs */}
          <div style={{ display: "flex", gap: 12, marginBottom: 72, flexWrap: "wrap" }}>
            <button onClick={() => onNavigate("signup")} style={{ background: "#fff", color: C.logoBlue, border: "none", borderRadius: 8, padding: "14px 32px", fontWeight: 800, fontSize: 15, cursor: "pointer", transition: "opacity 0.2s, transform 0.15s", letterSpacing: 0.2 }} onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.92"; e.currentTarget.style.transform = "translateY(-1px)"; }} onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.transform = "translateY(0)"; }}>
              {isHi ? "अभी कवर पाएं" : "Get Covered Now"}
            </button>
            <button onClick={() => scrollTo("how")} style={{ background: "transparent", color: "rgba(255,255,255,0.6)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, padding: "14px 24px", fontWeight: 500, fontSize: 15, cursor: "pointer", transition: "all 0.15s" }} onMouseEnter={(e) => { e.currentTarget.style.color = "#fff"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.28)"; }} onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.6)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"; }}>
              {isHi ? "देखें कैसे काम करता है" : "See How It Works"}
            </button>
          </div>

          {/* Stats row */}
          <div style={{ display: "flex", gap: 0, borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 36, width: "100%", flexWrap: "wrap" }}>
            {[
              { val: "12,000+", label: isHi ? "कवर वर्कर्स" : "Workers Covered" },
              { val: "< 4 min", label: isHi ? "औसत भुगतान समय" : "Avg. Payout Time" },
              { val: "99.7%", label: isHi ? "प्लेटफॉर्म अपटाइम" : "Platform Uptime" },
              { val: "13", label: isHi ? "कवर इवेंट टाइप" : "Event Types Covered" },
              { val: "10", label: isHi ? "सक्रिय शहर" : "Cities Active" },
            ].map((s, i) => (
              <div key={i} style={{ flex: "1 0 140px", padding: "0 32px 0 0", marginBottom: 8 }}>
                <div style={{ fontSize: 28, fontWeight: 900, color: "#fff", letterSpacing: -1 }}>{s.val}</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.38)", marginTop: 4, letterSpacing: 0.6, textTransform: "uppercase" }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Live Payout Ticker ── */}
      <LiveTicker />

      {/* ── Why Choose Us ── */}
      <section id="why" style={{ padding: "96px 48px", background: C.bg }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ maxWidth: 600, marginBottom: 64 }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: C.accent, textTransform: "uppercase", marginBottom: 12 }}>Why Choose Us</p>
            <h2 style={{ fontSize: 36, fontWeight: 900, color: C.text, letterSpacing: -0.8, lineHeight: 1.1, marginBottom: 16 }}>
              {isHi ? "गिग वर्कर्स के लिए बना, हर तरह से।" : "The only protection platform built for how delivery workers actually work."}
            </h2>
            <p style={{ fontSize: 15, color: C.textMuted, lineHeight: 1.85 }}>
              {isHi ? "पारंपरिक बीमा गिग वर्कर्स के लिए काम नहीं करता। लंबे फॉर्म, मैनुअल वेरिफिकेशन, और हफ्तों की प्रतीक्षा। KavachPay ने इन सभी खामियों को ठीक किया।"
                : "Traditional insurance fails gig workers — long forms, manual verification, weeks of waiting. KavachPay was built from scratch to fix every single one of those failures."}
            </p>
          </div>

          {/* Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 0, border: `1px solid ${C.border}`, borderRadius: 16, overflow: "hidden" }}>
            {WHY_ITEMS.map((item, i) => (
              <div key={i} style={{ padding: "36px 32px", background: C.bg, borderRight: (i + 1) % 3 !== 0 ? `1px solid ${C.border}` : "none", borderBottom: i < 3 ? `1px solid ${C.border}` : "none", transition: "background 0.2s" }}
                onMouseEnter={(e) => e.currentTarget.style.background = C.bgSubtle}
                onMouseLeave={(e) => e.currentTarget.style.background = C.bg}
              >
                <div style={{ fontSize: 11, fontWeight: 800, color: C.accent, letterSpacing: 2, marginBottom: 16 }}>{item.number}</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: C.text, marginBottom: 10, letterSpacing: -0.3, lineHeight: 1.3 }}>{item.title}</div>
                <div style={{ fontSize: 13, color: C.textMuted, lineHeight: 1.8 }}>{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div style={{ height: 1, background: C.border }} />

      {/* ── How It Works ── */}
      <section id="how" style={{ padding: "96px 48px", background: C.bgSubtle }}>
        <div style={{ maxWidth: 540, margin: "0 auto" }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: C.accent, textTransform: "uppercase", marginBottom: 12 }}>Process</p>
          <h2 style={{ fontSize: 32, fontWeight: 900, color: C.text, marginBottom: 12, letterSpacing: -0.6, lineHeight: 1.15 }}>
            {isHi ? "डिसरप्शन से भुगतान तक — पूरी तरह ऑटोमैटिक।" : "From disruption to payout — fully automatic."}
          </h2>
          <p style={{ fontSize: 14, color: C.textMuted, marginBottom: 40, lineHeight: 1.7 }}>
            {isHi ? "कोई मानवीय हस्तक्षेप नहीं। कोई देरी नहीं। बस ट्रिगर, वेरीफाई और पेमेंट।" : "No human intervention. No delays. Just trigger, verify, and pay."}
          </p>
          <StepRow n="1" text={isHi ? "साइन अप करें और अपना Swiggy या Zomato अकाउंट कनेक्ट करें।" : "Sign up and connect your Swiggy or Zomato account."} />
          <StepRow n="2" text={isHi ? "आपके डिलीवरी ज़ोन में एक योग्य डिसरप्शन डिटेक्ट होती है।" : "A qualifying disruption is detected in your delivery zone."} />
          <StepRow n="3" text={isHi ? "KavachPay सैटेलाइट और सिविक APIs के ज़रिए इवेंट वेरीफाई करता है।" : "KavachPay verifies the event using satellite and civic APIs."} />
          <StepRow n="4" text={isHi ? "आपका भुगतान सीधे आपके UPI पर — आमतौर पर 4 मिनट के अंदर।" : "Your payout is credited directly to your UPI — typically under 4 minutes."} last />
          <button onClick={() => onNavigate("signup")} style={{ marginTop: 36, background: C.logoBlue, color: "#fff", border: "none", borderRadius: 8, padding: "13px 28px", fontWeight: 700, fontSize: 14, cursor: "pointer", transition: "opacity 0.2s" }} onMouseEnter={(e) => e.currentTarget.style.opacity = "0.87"} onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}>
            {isHi ? "अभी सुरक्षित हों" : "Get Protected Now"}
          </button>
        </div>
      </section>

      <div style={{ height: 1, background: C.border }} />

      {/* ── Platforms ── */}
      <section style={{ padding: "60px 48px", textAlign: "center", background: C.bg }}>
        <p style={{ color: C.textLight, fontSize: 10, fontWeight: 700, letterSpacing: 2.5, marginBottom: 20, textTransform: "uppercase" }}>Works with your platform</p>
        <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
          {[{ name: "Swiggy", color: "#EA580C", bg: "#FFF7ED", border: "#FED7AA" }, { name: "Zomato", color: "#BE123C", bg: "#FFF1F2", border: "#FECDD3" }].map((p) => (
            <div key={p.name} style={{ background: p.bg, border: `1px solid ${p.border}`, borderRadius: 8, padding: "10px 28px", fontWeight: 700, fontSize: 14, color: p.color, letterSpacing: 0.3 }}>{p.name}</div>
          ))}
        </div>
      </section>

      <div style={{ height: 1, background: C.border }} />

      {/* ── CTA Strip ── */}
      <section style={{ background: `linear-gradient(160deg, ${C.heroTop}, ${C.heroMid})`, padding: "100px 48px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)", backgroundSize: "60px 60px", pointerEvents: "none" }} />
        <div style={{ position: "relative", maxWidth: 640, margin: "0 auto", textAlign: "center" }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: "rgba(37,99,235,0.7)", textTransform: "uppercase", marginBottom: 16 }}>Start Today</p>
          <h2 style={{ fontSize: 38, fontWeight: 900, color: "#fff", marginBottom: 14, letterSpacing: -1, lineHeight: 1.1 }}>
            {isHi ? "आपकी कमाई सुरक्षा की हकदार है।" : "Your income deserves protection."}
          </h2>
          <p style={{ color: "rgba(255,255,255,0.42)", fontSize: 15, marginBottom: 36, lineHeight: 1.7, maxWidth: 480, margin: "0 auto 36px" }}>
            {isHi ? "12,000+ डिलीवरी वर्कर्स पहले से KavachPay पर भरोसा करते हैं। आज ही जुड़ें।"
              : "12,000+ delivery workers across India already trust KavachPay to protect their earnings every single day. Join them."}
          </p>
          <button onClick={() => onNavigate("signup")} style={{ background: "#fff", color: C.logoBlue, border: "none", borderRadius: 8, padding: "14px 36px", fontWeight: 800, fontSize: 15, cursor: "pointer", transition: "opacity 0.2s, transform 0.15s", letterSpacing: 0.2 }} onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.92"; e.currentTarget.style.transform = "translateY(-1px)"; }} onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.transform = "translateY(0)"; }}>
            {isHi ? "मुफ्त अकाउंट बनाएं" : "Create Your Account"}
          </button>
          <div style={{ marginTop: 16 }}>
            <button onClick={() => onNavigate("login")} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.28)", fontSize: 13, cursor: "pointer", textDecoration: "underline" }}>
              {isHi ? "पहले से अकाउंट है? लॉगिन करें" : "Already have an account? Login"}
            </button>
          </div>
        </div>
      </section>

      {/* ── About Us ── */}
      <section id="about" style={{ padding: "96px 48px", background: C.bg, borderTop: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: 760, margin: "0 auto", textAlign: "center" }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: C.accent, textTransform: "uppercase", marginBottom: 12 }}>About Us</p>
          <h2 style={{ fontSize: 32, fontWeight: 900, color: C.text, letterSpacing: -0.6, marginBottom: 16, lineHeight: 1.2 }}>Built by students,<br />for India's real workforce.</h2>
          <p style={{ fontSize: 15, color: C.textMuted, lineHeight: 1.9, maxWidth: 600, margin: "0 auto 52px" }}>
            KavachPay was conceived and built by four second-year B.Tech AI & Data Science students at <strong style={{ color: C.text, fontWeight: 700 }}>Shiv Nadar University, Chennai</strong> — driven by the belief that India's 15 million gig workers deserve financial protection as reliable as the services they power.
          </p>
          <div style={{ display: "flex", justifyContent: "center", gap: 56, flexWrap: "wrap", marginBottom: 44 }}>
            <TeamCard name="Ankith" initial="A" role="Frontend Developer" />
            <TeamCard name="Ashwin" initial="A" role="Backend Developer" />
            <TeamCard name="Madhav" initial="M" role="AI/ML Engineer" />
            <TeamCard name="Kirithic" initial="K" role="Team Leader" />
          </div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 10, background: C.bgMuted, border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 20px", fontSize: 12, color: C.textMuted }}>
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke={C.textLight} strokeWidth="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c3 3 9 3 12 0v-5" /></svg>
            2nd Year · B.Tech Artificial Intelligence & Data Science · Shiv Nadar University, Chennai
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ background: C.heroTop, padding: "36px 48px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 14 }}>
        <KavachLogo size={24} light />
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.25)" }}>Protecting the backbone of India's gig economy.</div>
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.25)" }}>© 2025 KavachPay Technologies Pvt. Ltd.</div>
      </footer>

      <LandingChatbot onSignup={() => onNavigate("signup")} />
    </div>
  );
}

// ─── App Router ───────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState("landing");
  const [user, setUser] = useState(null);

  const navigate = (target, userData = null) => {
    if (userData) setUser(userData);
    setPage(target);
    window.scrollTo(0, 0);
  };
  const logout = () => { setUser(null); setPage("landing"); };

  switch (page) {
    case "landing": return <LandingPage onNavigate={navigate} />;
    case "login": return <Login onLogin={(u) => navigate("dashboard", u)} onSignup={() => navigate("signup")} onBack={() => navigate("landing")} />;
    case "adminLogin": return <AdminLogin onLogin={(u) => navigate("adminDashboard", u)} onBack={() => navigate("landing")} />;
    case "signup": return <Signup onSuccess={(u) => navigate("dashboard", u)} onBack={() => navigate("landing")} onLogin={() => navigate("login")} />;
    case "dashboard": return <Dashboard user={user} onLogout={logout} onNavigate={navigate} />;
    case "adminDashboard": return <AdminDashboard user={user} onLogout={logout} />;
    case "policy": return <Policy user={user} onBack={() => navigate("dashboard")} />;
    case "claims": return <Claims user={user} onBack={() => navigate("dashboard")} />;
    case "chatbot": return <Chatbot user={user} onBack={() => navigate("dashboard")} />;
    default: return <LandingPage onNavigate={navigate} />;
  }
}