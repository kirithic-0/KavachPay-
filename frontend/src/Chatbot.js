import React, { useState, useRef, useEffect } from "react";

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
};

const BOT_RESPONSES = {
    claim: "Your last claim CLM-0041 was paid ₹360 on 18 Dec 2026 for heavy rainfall in Koramangala. It was credited to your UPI within 4 minutes of the trigger. 💸",
    payout: "Payouts are automatically triggered when a disruption is detected in your zone. The money hits your UPI in under 4 minutes — no forms, no calls needed. ⚡",
    rain: "Rain payouts kick in when rainfall exceeds 8 mm/hr in your zone. You earn ₹120 for every qualifying hour, up to ₹600 per day. 🌧️",
    policy: "You're on the Individual Cover plan at ₹149/month. Your policy covers heavy rain, app outages, civic unrest, floods, and power cuts. Max payout is ₹4,500. 🛡️",
    premium: "Your monthly premium is ₹149, auto-debited via UPI on the 1st of each month. Your first 30 days are completely free. 🎉",
    outage: "If your delivery app (Swiggy/Zomato etc.) goes down for more than 2 continuous hours, you're eligible for ₹100 per hour — up to ₹500/day. 📱",
    zone: "Your current zone is Koramangala, Bengaluru. Zone monitoring is active 24/7. Any disruption in your zone triggers an automatic payout. 📍",
    score: "Your KavachScore is 80/100. Complete zone verification to reach 100 and unlock priority payout status! ⭐",
    help: "I can help you with:\n• Claim status and history\n• Payout rules and amounts\n• Policy details\n• Rain and disruption triggers\n• Premium and renewal\n\nJust ask me anything! 😊",
    hi: "Hey there! 👋 I'm KavachBot, your KavachPay assistant. Ask me about your claims, payouts, policy, or anything else!",
    hello: "Hey there! 👋 I'm KavachBot, your KavachPay assistant. Ask me about your claims, payouts, policy, or anything else!",
    renewal: "Your policy renews on 1 Jan 2026. Amount: ₹149, auto-debited from your UPI. You'll get a reminder 7 days before renewal. 🔔",
    upi: "Payouts are sent directly to your registered UPI ID. Make sure your UPI is active and linked in your profile to receive instant credits. 💳",
};

const SUGGESTIONS = [
    "What's my last claim?",
    "How do rain payouts work?",
    "What is my policy?",
    "What's my KavachScore?",
];

function getBotReply(msg) {
    const m = msg.toLowerCase();
    if (m.includes("claim") || m.includes("clm")) return BOT_RESPONSES.claim;
    if (m.includes("payout") || m.includes("money")) return BOT_RESPONSES.payout;
    if (m.includes("rain") || m.includes("rainfall")) return BOT_RESPONSES.rain;
    if (m.includes("policy") || m.includes("cover")) return BOT_RESPONSES.policy;
    if (m.includes("premium") || m.includes("₹149") || m.includes("149")) return BOT_RESPONSES.premium;
    if (m.includes("outage") || m.includes("app down")) return BOT_RESPONSES.outage;
    if (m.includes("zone") || m.includes("area")) return BOT_RESPONSES.zone;
    if (m.includes("score") || m.includes("kavachscore")) return BOT_RESPONSES.score;
    if (m.includes("renew") || m.includes("renewal")) return BOT_RESPONSES.renewal;
    if (m.includes("upi") || m.includes("bank")) return BOT_RESPONSES.upi;
    if (m.includes("hi") || m.includes("hey") || m.includes("hello")) return BOT_RESPONSES.hi;
    if (m.includes("help") || m.includes("what can")) return BOT_RESPONSES.help;
    return "I'm not sure about that yet! 🤔 Try asking about your claims, payout rules, policy details, or KavachScore. Type 'help' for all topics.";
}

export default function Chatbot({ user, onBack }) {
    const u = user || { name: "Ravi" };
    const [messages, setMessages] = useState([
        { from: "bot", text: `Hey ${u.name?.split(" ")[0] || "there"}! 👋 I'm KavachBot. Ask me anything about your policy, payouts, or claims.`, time: new Date() },
    ]);
    const [input, setInput] = useState("");
    const [typing, setTyping] = useState(false);
    const bottomRef = useRef(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, typing]);

    const send = async (text) => {
        const msg = text || input.trim();
        if (!msg) return;
        setInput("");

        const userMsg = { from: "user", text: msg, time: new Date() };
        setMessages((m) => [...m, userMsg]);
        setTyping(true);

        await new Promise((r) => setTimeout(r, 800 + Math.random() * 400));
        setTyping(false);

        const reply = getBotReply(msg);
        setMessages((m) => [...m, { from: "bot", text: reply, time: new Date() }]);
    };

    const fmt = (d) => d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    return (
        <div style={{ minHeight: "100vh", background: C.bgSubtle, display: "flex", flexDirection: "column", fontFamily: "Inter, -apple-system, sans-serif" }}>

            {/* Top bar */}
            <div style={{ background: C.bg, borderBottom: `1px solid ${C.border}`, padding: "0 20px", height: 56, display: "flex", alignItems: "center", gap: 12, position: "sticky", top: 0, zIndex: 50 }}>
                <button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 13, color: C.textMuted }}>←</button>
                <div style={{ width: 34, height: 34, borderRadius: "50%", background: C.accent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>🤖</div>
                <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>KavachBot</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <div style={{ width: 6, height: 6, borderRadius: "50%", background: C.success }} />
                        <span style={{ fontSize: 11, color: C.success }}>Online</span>
                    </div>
                </div>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: 10, paddingBottom: 160 }}>
                {messages.map((m, i) => (
                    <div key={i} style={{ display: "flex", flexDirection: m.from === "user" ? "row-reverse" : "row", alignItems: "flex-end", gap: 8 }}>
                        {m.from === "bot" && (
                            <div style={{ width: 28, height: 28, borderRadius: "50%", background: C.accent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, flexShrink: 0 }}>🤖</div>
                        )}
                        <div style={{ maxWidth: "75%" }}>
                            <div style={{
                                background: m.from === "user" ? C.accent : C.bg,
                                color: m.from === "user" ? "#fff" : C.text,
                                border: m.from === "user" ? "none" : `1px solid ${C.border}`,
                                borderRadius: m.from === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                                padding: "10px 14px",
                                fontSize: 13,
                                lineHeight: 1.6,
                                whiteSpace: "pre-line",
                                boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
                            }}>{m.text}</div>
                            <div style={{ fontSize: 10, color: C.textLight, marginTop: 3, textAlign: m.from === "user" ? "right" : "left" }}>{fmt(m.time)}</div>
                        </div>
                    </div>
                ))}

                {/* Typing indicator */}
                {typing && (
                    <div style={{ display: "flex", alignItems: "flex-end", gap: 8 }}>
                        <div style={{ width: 28, height: 28, borderRadius: "50%", background: C.accent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}>🤖</div>
                        <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: "16px 16px 16px 4px", padding: "12px 16px", display: "flex", gap: 4, alignItems: "center" }}>
                            {[0, 1, 2].map((i) => (
                                <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: C.textLight, animation: "pulse 1.2s ease-in-out infinite", animationDelay: `${i * 0.2}s` }} />
                            ))}
                        </div>
                    </div>
                )}
                <div ref={bottomRef} />
            </div>

            {/* Suggestions + Input — fixed bottom */}
            <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: C.bg, borderTop: `1px solid ${C.border}`, padding: "10px 14px 16px" }}>
                {/* Quick suggestions */}
                <div style={{ display: "flex", gap: 6, overflowX: "auto", marginBottom: 10, paddingBottom: 2 }}>
                    {SUGGESTIONS.map((s) => (
                        <button key={s} onClick={() => send(s)} style={{ flexShrink: 0, padding: "5px 12px", background: C.bgMuted, border: `1px solid ${C.border}`, borderRadius: 20, fontSize: 12, fontWeight: 500, color: C.textMuted, cursor: "pointer", whiteSpace: "nowrap", transition: "all 0.15s" }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = C.accentLight; e.currentTarget.style.color = C.accent; e.currentTarget.style.borderColor = "#BFDBFE"; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = C.bgMuted; e.currentTarget.style.color = C.textMuted; e.currentTarget.style.borderColor = C.border; }}
                        >{s}</button>
                    ))}
                </div>

                {/* Input row */}
                <div style={{ display: "flex", gap: 8 }}>
                    <input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && send()}
                        placeholder="Ask anything…"
                        style={{ flex: 1, padding: "10px 14px", border: `1px solid ${C.border}`, borderRadius: 24, fontSize: 14, outline: "none", fontFamily: "inherit", color: C.text, background: C.bgSubtle, transition: "border-color 0.15s" }}
                        onFocus={(e) => { e.target.style.borderColor = C.accent; e.target.style.boxShadow = "0 0 0 3px rgba(37,99,235,0.08)"; }}
                        onBlur={(e) => { e.target.style.borderColor = C.border; e.target.style.boxShadow = "none"; }}
                    />
                    <button onClick={() => send()} disabled={!input.trim() || typing} style={{ width: 42, height: 42, borderRadius: "50%", background: input.trim() ? C.accent : C.bgMuted, border: "none", cursor: input.trim() ? "pointer" : "default", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s", flexShrink: 0 }}>
                        ➤
                    </button>
                </div>
            </div>
        </div>
    );
}