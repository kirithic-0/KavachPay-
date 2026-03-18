import React, { useState, useRef, useEffect } from 'react';

const QUICK_QUESTIONS = [
    'How does KavachPay work?',
    'When will I get paid?',
    'What is KavachScore?',
    'What events are covered?',
    'How do I pause my policy?',
    'Why was my claim skipped?',
];

const getResponse = (text) => {
    const q = text.toLowerCase();

    if (q.includes('hello') || q.includes('hi') || q.includes('hey') || q.includes('namaste'))
        return 'Hello! Welcome to KavachPay Support. I can help you with your policy, payouts, KavachScore, and claims. What would you like to know?';

    if (q.includes('how') && (q.includes('work') || q.includes('kavachpay')))
        return 'KavachPay protects your weekly income when disruptions stop you from delivering.\n\nHere is how it works:\n1. You enroll with your Aadhaar and delivery app account\n2. If heavy rain, bad AQI, flood or storm hits your zone — we detect it automatically\n3. We verify you were actually affected using 5 layers of checks\n4. Money reaches your UPI in under 2 minutes\n\nNo forms. No calls. No paperwork. Anything else I can help with?';

    if (q.includes('paid') || q.includes('payout') || q.includes('money') || q.includes('transfer') || q.includes('upi'))
        return 'Payouts happen automatically — you do not need to do anything.\n\nPayout amounts:\n• Minor disruption → 30% of your weekly coverage\n• Moderate disruption → 65% of your weekly coverage\n• Severe disruption → 100% of your weekly coverage\n\nMoney reaches your UPI in under 2 minutes once verification is complete. Anything else?';

    if (q.includes('kavachscore') || q.includes('score') || q.includes('trust'))
        return 'KavachScore is your trust score with KavachPay — similar to CIBIL but for gig workers.\n\nScore ranges:\n• 750–900 — Trusted Worker — instant payouts, lowest premium\n• 500–749 — Standard Worker — 2 hour delay, +15% premium\n• 300–499 — Under Review — 24 hour delay, manual check\n\nYour score goes UP when you make legitimate claims, stay active consistently, and maintain a long tenure.\n\nYour score goes DOWN when suspicious patterns are detected or fraud flags are raised.\n\nYou start at 750 — already in the Trusted tier. Anything else?';

    if (q.includes('cover') || q.includes('event') || q.includes('trigger') || q.includes('rain') || q.includes('aqi') || q.includes('flood') || q.includes('storm') || q.includes('curfew'))
        return 'KavachPay covers these disruption events:\n\n• Heavy Rain — above 50mm in your zone\n• Poor AQI — air quality index above 200\n• Flood Alert — official NDMA warning issued\n• Severe Storm — winds above 60kmh\n• Curfew — government declared\n\nNot covered:\n• Vehicle damage or breakdown\n• Health issues or accidents\n• Personal reasons for not working\n• Income loss outside your enrolled zone\n\nAll triggers are verified automatically. Anything else?';

    if (q.includes('premium') || q.includes('cost') || q.includes('price') || q.includes('fee') || q.includes('charge'))
        return 'KavachPay starts from just Rs.49 per week.\n\nPremium depends on your zone risk, age, platform, and delivery tenure.\n\nPremium tiers:\n• High risk zones — Rs.74/week — Rs.1,560 coverage\n• Medium risk zones — Rs.59–64/week — Rs.1,200–1,300 coverage\n• Low risk zones — Rs.49/week — Rs.980 coverage\n\nYour exact premium is shown during enrollment. Anything else?';

    if (q.includes('pause') || q.includes('vacation') || q.includes('break') || q.includes('holiday') || q.includes('stop') || q.includes('suspend'))
        return 'Yes, you can pause your policy anytime from the My Policy page.\n\nHow Policy Pause works:\n• While paused — no premium is charged that week\n• While paused — no coverage is active\n• Resume anytime before you head out\n\nThis is unique to KavachPay — most insurance products charge you even when you are not working. Anything else?';

    if (q.includes('skip') || q.includes('reject') || q.includes('denied') || q.includes('not paid') || q.includes('why') || q.includes('claim'))
        return 'A claim gets skipped when our verification system detects you were not actually affected.\n\nCommon reasons:\n• Our system detected active deliveries during the disruption window\n• Your zone did not cross the official weather threshold\n• Less than 50% of workers in your zone were affected\n\nYou can check the full verification timeline in My Claims — every step is shown clearly. Anything else?';

    if (q.includes('zone') || q.includes('city') || q.includes('area') || q.includes('location') || q.includes('where'))
        return 'KavachPay currently covers zones across these cities:\n\nMetro cities:\n• Chennai, Mumbai, Bangalore\n• Delhi/NCR, Hyderabad, Pune\n• Kolkata, Ahmedabad\n\nTier 2 cities:\n• Coimbatore, Mysuru, Nagpur, Surat\n• Vizag, Indore, Bhopal, Ludhiana\n• Jaipur, Kochi\n\nYour premium is based on your specific zone historical risk data. Anything else?';

    if (q.includes('enroll') || q.includes('register') || q.includes('sign up') || q.includes('join') || q.includes('start') || q.includes('aadhaar'))
        return 'Enrolling in KavachPay takes just 2 minutes.\n\nWhat you need:\n• Your Aadhaar number for identity verification\n• Your delivery platform account to link\n• Your mobile number\n• Your age\n\nSteps:\n1. Enter personal details and verify Aadhaar\n2. Select your zone and connect your delivery app\n3. Review your premium and coverage\n4. Pay and activate — policy is live immediately\n\nTap Enroll Now on the home screen to get started. Anything else?';

    if (q.includes('verification') || q.includes('verify') || q.includes('layer') || q.includes('check') || q.includes('fraud'))
        return 'KavachPay uses 5-layer behavioral verification on every claim.\n\nThe 5 layers:\n1. Work Intent — were you working when disruption hit?\n2. Activity Check — were you actually inactive during the window?\n3. Zone Correlation — were most workers in your zone also affected?\n4. Self Declaration — did you confirm the disruption affected you?\n5. KavachScore — is your trust history clean?\n\nHonest workers always get paid. The system is designed to protect you, not deny you. Anything else?';

    if (q.includes('renew') || q.includes('renewal') || q.includes('weekly') || q.includes('auto'))
        return 'Your KavachPay policy renews automatically every week.\n\nYour weekly premium is charged on the same day each week. You can also manually renew early from the My Policy page using Razorpay — UPI, card or net banking are all supported.\n\nIf you want to skip a week, pause your policy before the renewal date. Anything else?';

    if (q.includes('razorpay') || q.includes('payment') || q.includes('pay') || q.includes('card') || q.includes('net banking'))
        return 'KavachPay uses Razorpay for secure premium payments.\n\nSupported payment methods:\n• UPI — GPay, PhonePe, Paytm and others\n• Debit or Credit Card — Visa, Mastercard, RuPay\n• Net Banking — all major banks supported\n\nAll transactions are secured with 256-bit SSL encryption. Anything else?';

    if (q.includes('contact') || q.includes('support') || q.includes('help') || q.includes('problem') || q.includes('issue'))
        return 'I am here to help with any KavachPay questions.\n\nFor urgent issues:\n• Phone: 1800-XXX-XXXX (toll free)\n• Email: support@kavachpay.in\n• WhatsApp: +91-XXXXXXXXXX\n\nOr just ask me your question directly — I can help with policy, payouts, KavachScore, claims, zones, and enrollment. What do you need help with?';

    if (q.includes('thank') || q.includes('thanks') || q.includes('ok') || q.includes('okay') || q.includes('great') || q.includes('good'))
        return 'Happy to help! Stay safe on the roads. Remember KavachPay is always watching over your income. Is there anything else I can help you with?';

    if (q.includes('policy') || q.includes('coverage') || q.includes('insur'))
        return 'Your KavachPay policy covers your weekly income when covered disruptions hit your zone.\n\nKey details:\n• Coverage is active for 7 days from your enrollment or last renewal\n• 65% of your average weekly income is protected\n• No forms or calls needed — everything is automatic\n• You can view full policy details in the My Policy section\n\nAnything else I can help with?';

    // Default — for anything unrecognised including insults or random text
    return 'I am here to help with KavachPay related questions only.\n\nI can assist you with:\n• How your policy and coverage works\n• Premium and payout amounts\n• KavachScore explained\n• What events are covered\n• Claim history and status\n• Enrolling in KavachPay\n• Policy pause and renewal\n• Payment methods\n\nPlease try one of the quick questions below or ask me something about KavachPay.';
};

export default function Chatbot({ onClose }) {
    const [messages, setMessages] = useState([
        {
            role: 'assistant',
            content: 'Hello! I am the KavachPay Support Assistant.\n\nI can help you with:\n• How your policy works\n• Your premium and coverage\n• How payouts are triggered\n• Your KavachScore\n• Claim history and status\n\nWhat would you like to know?'
        }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const bottomRef = useRef(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, loading]);

    const sendMessage = (text) => {
        const userText = text || input.trim();
        if (!userText) return;

        const newMessages = [...messages, { role: 'user', content: userText }];
        setMessages(newMessages);
        setInput('');
        setLoading(true);

        setTimeout(() => {
            const reply = getResponse(userText);
            setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
            setLoading(false);
        }, 700);
    };

    const formatMessage = (text) => {
        return text.split('\n').map((line, i) => (
            <p key={i} style={{ margin: '2px 0', fontSize: '13px', lineHeight: 1.6 }}>{line}</p>
        ));
    };

    return (
        <div style={{
            position: 'fixed', bottom: '100px', right: '24px',
            width: '340px', height: '520px',
            backgroundColor: 'white', borderRadius: '20px',
            boxShadow: '0 8px 40px rgba(0,0,0,0.15)',
            display: 'flex', flexDirection: 'column',
            zIndex: 1000, fontFamily: 'Arial', overflow: 'hidden',
            border: '1px solid #E5E7EB'
        }}>

            {/* Header */}
            <div style={{ backgroundColor: '#1A56A0', padding: '16px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                        </svg>
                    </div>
                    <div>
                        <p style={{ color: 'white', fontWeight: 'bold', fontSize: '14px' }}>KavachPay Support</p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                            <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#7DFFB3' }} />
                            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '11px' }}>Support Assistant • Online</p>
                        </div>
                    </div>
                </div>
                <button onClick={onClose}
                    style={{ backgroundColor: 'rgba(255,255,255,0.15)', border: 'none', color: 'white', width: '28px', height: '28px', borderRadius: '50%', cursor: 'pointer', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    ✕
                </button>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '14px', backgroundColor: '#F9FAFB' }}>
                {messages.map((msg, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start', marginBottom: '10px' }}>
                        {msg.role === 'assistant' && (
                            <div style={{ width: '28px', height: '28px', borderRadius: '8px', backgroundColor: '#1A56A0', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '8px', flexShrink: 0, alignSelf: 'flex-end' }}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                                </svg>
                            </div>
                        )}
                        <div style={{
                            maxWidth: '75%', padding: '10px 14px',
                            borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                            backgroundColor: msg.role === 'user' ? '#1A56A0' : 'white',
                            color: msg.role === 'user' ? 'white' : '#374151',
                            boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                            border: msg.role === 'assistant' ? '1px solid #E5E7EB' : 'none'
                        }}>
                            {formatMessage(msg.content)}
                        </div>
                    </div>
                ))}

                {loading && (
                    <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '10px' }}>
                        <div style={{ width: '28px', height: '28px', borderRadius: '8px', backgroundColor: '#1A56A0', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '8px', flexShrink: 0 }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                            </svg>
                        </div>
                        <div style={{ backgroundColor: 'white', padding: '12px 16px', borderRadius: '16px 16px 16px 4px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #E5E7EB' }}>
                            <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                                {[0, 1, 2].map(j => (
                                    <div key={j} style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#1A56A0', opacity: 0.5 }} />
                                ))}
                            </div>
                        </div>
                    </div>
                )}
                <div ref={bottomRef} />
            </div>

            {/* Quick Questions */}
            {messages.length <= 2 && (
                <div style={{ padding: '8px 14px', backgroundColor: '#F9FAFB', borderTop: '1px solid #F3F4F6' }}>
                    <p style={{ color: '#9CA3AF', fontSize: '11px', marginBottom: '6px', letterSpacing: '0.3px' }}>Quick questions</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                        {QUICK_QUESTIONS.map((q, i) => (
                            <button key={i} onClick={() => sendMessage(q)}
                                style={{ backgroundColor: 'white', color: '#1A56A0', border: '1px solid #DBEAFE', padding: '4px 10px', borderRadius: '12px', fontSize: '11px', cursor: 'pointer', fontWeight: '600' }}>
                                {q}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Input */}
            <div style={{ padding: '12px 14px', borderTop: '1px solid #E5E7EB', backgroundColor: 'white', display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input
                    type="text"
                    placeholder="Ask me anything about KavachPay..."
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && !loading && sendMessage()}
                    disabled={loading}
                    style={{ flex: 1, padding: '10px 14px', borderRadius: '20px', border: '1.5px solid #E5E7EB', fontSize: '13px', outline: 'none', fontFamily: 'Arial', backgroundColor: loading ? '#F9FAFB' : 'white', color: '#374151' }}
                />
                <button onClick={() => sendMessage()} disabled={loading || !input.trim()}
                    style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: loading || !input.trim() ? '#E5E7EB' : '#1A56A0', color: 'white', border: 'none', cursor: loading || !input.trim() ? 'default' : 'pointer', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    ➤
                </button>
            </div>
        </div>
    );
}