import React, { useState } from 'react';
import { KavachLogo } from './App';

// ─── API CONFIG ───
const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const api = {
    // TODO: BACKEND — renew policy payment
    renewPolicy: async (workerId, amount) => {
        return await fetch(`${API_BASE}/api/policy/renew`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
          body: JSON.stringify({ worker_id: workerId, amount })
        }).then(r => r.json());
    },
    pausePolicy: async (workerId) => {
        return await fetch(`${API_BASE}/api/policy/pause`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
          body: JSON.stringify({ worker_id: workerId })
        }).then(r => r.json());
    },
};

// ─── DESIGN TOKENS ───
const C = {
    navy: '#08101F',
    accent: '#1A3A5C',
    accentLight: '#F0F4F8',
    accentBorder: '#D1E0EE',
    bg: '#F9FAFB',
    cardBg: '#FFFFFF',
    cardBorder: '#E5E7EB',
    cardShadow: '0 1px 4px rgba(0,0,0,0.06)',
    text: '#111827',
    textSec: '#374151',
    textMuted: '#6B7280',
    green: '#059669',
    greenLight: '#ECFDF5',
    greenBorder: '#A7F3D0',
    orange: '#D97706',
    orangeLight: '#FFFBEB',
    orangeBorder: '#FDE68A',
    red: '#DC2626',
    redLight: '#FEF2F2',
    redBorder: '#FECACA',
};

const T = {
    en: {
        brand: 'KavachPay', back: 'Back',
        title: 'My Policy',
        policyHolder: 'POLICY HOLDER',
        active: 'ACTIVE', paused: 'PAUSED',
        weeklyPremium: 'Weekly Premium',
        weeklyCoverage: 'Weekly Coverage',
        free: 'FREE',
        employerSponsored: 'EMPLOYER SPONSORED',
        policyDetails: 'Policy Details',
        policyId: 'Policy ID', employeeId: 'Employee ID',
        platform: 'Platform', zone: 'Zone', city: 'City',
        age: 'Age', years: 'years',
        avgIncome: 'Avg Weekly Income',
        avgDeliveries: 'Avg Daily Deliveries',
        incomeProtected: 'Income Protected',
        validFrom: 'Valid From', validUntil: 'Valid Until',
        renewal: 'Renewal', autoRenew: 'Auto-renews weekly',
        policyType: 'Policy Type',
        employer: 'Employer',
        eshramId: 'e-Shram UAN', eshramLinked: '(linked)',
        individualPolicy: 'Individual Policy',
        employerPolicy: 'Employer Sponsored',
        covered: "What's Covered",
        notCovered: "What's Not Covered",
        payoutTiers: 'Payout Tiers',
        minor: 'Minor', moderate: 'Moderate', severe: 'Severe',
        minorDesc: 'Rain 25–74mm / AQI 200–299 / Fog / Light Wind',
        moderateDesc: 'Rain 75–99mm / AQI 300–399 / Storm / Heatwave',
        severeDesc: 'Rain 100mm+ / AQI 400+ / Flood / Earthquake / Landslide / Curfew',
        ofCoverage: '% of weekly coverage',
        howVerified: 'How Claims Are Verified',
        howVerifiedSub: '5-layer behavioral verification on every claim.',
        pauseTitle: 'Policy Management',
        pauseSub: 'Pause your policy when you take a break. No premium charged while paused.',
        pauseActive: 'Policy is currently paused',
        pauseActiveSub: 'No premium charged. Resume to reactivate coverage.',
        resume: 'Resume Policy',
        pauseConfirm: 'Pause your policy?',
        pauseConfirmSub: 'You will not be covered for disruptions while paused.',
        yesPause: 'Yes, Pause', cancel: 'Cancel',
        pauseBtn: 'Pause My Policy',
        renewedMsg: 'Policy Renewed Successfully',
        renewedSub: 'Valid until next week.',
        renewAmount: 'Renewal Amount',
        renewBtn: 'Renew Policy',
        secured: 'Secured by Razorpay',
        backDashboard: 'Back to Dashboard',
        downloadPolicy: 'Download Policy Document',
        employerRenewal: 'Employer Sponsored — No payment required',
        employerRenewalSub: 'Your employer automatically renews your policy.',
    },
    hi: {
        brand: 'KavachPay', back: 'वापस',
        title: 'मेरी पॉलिसी',
        policyHolder: 'पॉलिसी धारक',
        active: 'सक्रिय', paused: 'रुकी हुई',
        weeklyPremium: 'साप्ताहिक प्रीमियम',
        weeklyCoverage: 'साप्ताहिक कवरेज',
        free: 'मुफ़्त',
        employerSponsored: 'नियोक्ता प्रायोजित',
        policyDetails: 'पॉलिसी विवरण',
        policyId: 'पॉलिसी ID', employeeId: 'कर्मचारी ID',
        platform: 'प्लेटफॉर्म', zone: 'क्षेत्र', city: 'शहर',
        age: 'आयु', years: 'वर्ष',
        avgIncome: 'औसत साप्ताहिक आय',
        avgDeliveries: 'औसत दैनिक डिलीवरी',
        incomeProtected: 'आय सुरक्षित',
        validFrom: 'से मान्य', validUntil: 'तक मान्य',
        renewal: 'नवीनीकरण', autoRenew: 'साप्ताहिक स्वतः नवीनीकरण',
        policyType: 'पॉलिसी प्रकार',
        employer: 'नियोक्ता',
        eshramId: 'e-Shram UAN', eshramLinked: '(लिंक)',
        individualPolicy: 'व्यक्तिगत पॉलिसी',
        employerPolicy: 'नियोक्ता प्रायोजित',
        covered: 'क्या कवर है',
        notCovered: 'क्या कवर नहीं है',
        payoutTiers: 'भुगतान स्तर',
        minor: 'मामूली', moderate: 'मध्यम', severe: 'गंभीर',
        minorDesc: 'बारिश 25–74mm / AQI 200–299 / कोहरा / हल्की हवा',
        moderateDesc: 'बारिश 75–99mm / AQI 300–399 / तूफान / लू',
        severeDesc: 'बारिश 100mm+ / AQI 400+ / बाढ़ / भूकंप / भूस्खलन / कर्फ्यू',
        ofCoverage: '% साप्ताहिक कवरेज',
        howVerified: 'दावे कैसे सत्यापित होते हैं',
        howVerifiedSub: 'हर दावे पर 5-परत सत्यापन।',
        pauseTitle: 'पॉलिसी प्रबंधन',
        pauseSub: 'ब्रेक पर पॉलिसी रोकें। रुकने पर कोई प्रीमियम नहीं।',
        pauseActive: 'पॉलिसी वर्तमान में रुकी हुई है',
        pauseActiveSub: 'कोई प्रीमियम नहीं। कवरेज के लिए फिर शुरू करें।',
        resume: 'पॉलिसी फिर शुरू करें',
        pauseConfirm: 'पॉलिसी रोकें?',
        pauseConfirmSub: 'रुकने पर आप कवर नहीं होंगे।',
        yesPause: 'हां, रोकें', cancel: 'रद्द करें',
        pauseBtn: 'मेरी पॉलिसी रोकें',
        renewedMsg: 'पॉलिसी सफलतापूर्वक नवीनीकृत',
        renewedSub: 'अगले सप्ताह तक वैध।',
        renewAmount: 'नवीनीकरण राशि',
        renewBtn: 'पॉलिसी नवीनीकृत करें',
        secured: 'Razorpay द्वारा सुरक्षित',
        backDashboard: 'डैशबोर्ड पर वापस',
        downloadPolicy: 'पॉलिसी दस्तावेज़ डाउनलोड',
        employerRenewal: 'नियोक्ता प्रायोजित — कोई भुगतान नहीं',
        employerRenewalSub: 'आपका नियोक्ता स्वचालित रूप से नवीनीकृत करता है।',
    },
    ta: {
        brand: 'KavachPay', back: 'திரும்பு',
        title: 'என் பாலிசி',
        policyHolder: 'பாலிசி தாரர்',
        active: 'செயலில்', paused: 'இடைநிறுத்தம்',
        weeklyPremium: 'வாராந்திர பிரீமியம்',
        weeklyCoverage: 'வாராந்திர கவரேஜ்',
        free: 'இலவசம்',
        employerSponsored: 'முதலாளி வழங்கல்',
        policyDetails: 'பாலிசி விவரங்கள்',
        policyId: 'பாலிசி ID', employeeId: 'ஊழியர் ID',
        platform: 'தளம்', zone: 'மண்டலம்', city: 'நகரம்',
        age: 'வயது', years: 'ஆண்டுகள்',
        avgIncome: 'சராசரி வாராந்திர வருமானம்',
        avgDeliveries: 'சராசரி தினசரி டெலிவரி',
        incomeProtected: 'வருமானம் பாதுகாக்கப்பட்டது',
        validFrom: 'தொடக்கம்', validUntil: 'முடிவு',
        renewal: 'புதுப்பிப்பு', autoRenew: 'வாராந்திர தானியங்கி புதுப்பிப்பு',
        policyType: 'பாலிசி வகை',
        employer: 'முதலாளி',
        eshramId: 'e-Shram UAN', eshramLinked: '(இணைக்கப்பட்டது)',
        individualPolicy: 'தனிநபர் பாலிசி',
        employerPolicy: 'முதலாளி வழங்கல்',
        covered: 'என்ன கவர் செய்யப்படுகிறது',
        notCovered: 'என்ன கவர் இல்லை',
        payoutTiers: 'பணம் நிலைகள்',
        minor: 'சிறிய', moderate: 'நடுத்தர', severe: 'கடுமையான',
        minorDesc: 'மழை 25–74mm / AQI 200–299 / பனிமூட்டம் / இலகு காற்று',
        moderateDesc: 'மழை 75–99mm / AQI 300–399 / புயல் / வெப்ப அலை',
        severeDesc: 'மழை 100mm+ / AQI 400+ / வெள்ளம் / நிலநடுக்கம் / நிலச்சரிவு / ஊரடங்கு',
        ofCoverage: '% வாராந்திர கவரேஜ்',
        howVerified: 'கோரிக்கைகள் எவ்வாறு சரிபார்க்கப்படுகின்றன',
        howVerifiedSub: 'ஒவ்வொரு கோரிக்கையிலும் 5 அடுக்கு சரிபார்ப்பு.',
        pauseTitle: 'பாலிசி மேலாண்மை',
        pauseSub: 'ஓய்வின்போது பாலிசியை நிறுத்தவும். பிரீமியம் இல்லை.',
        pauseActive: 'பாலிசி தற்போது நிறுத்தப்பட்டுள்ளது',
        pauseActiveSub: 'பிரீமியம் இல்லை. கவரேஜுக்கு தொடரவும்.',
        resume: 'பாலிசி தொடரவும்',
        pauseConfirm: 'பாலிசியை நிறுத்தவா?',
        pauseConfirmSub: 'நிறுத்தியிருக்கும்போது கவர் இல்லை.',
        yesPause: 'ஆம், நிறுத்து', cancel: 'ரத்து செய்',
        pauseBtn: 'பாலிசியை நிறுத்து',
        renewedMsg: 'பாலிசி வெற்றிகரமாக புதுப்பிக்கப்பட்டது',
        renewedSub: 'அடுத்த வாரம் வரை செல்லுபடியாகும்.',
        renewAmount: 'புதுப்பிப்பு தொகை',
        renewBtn: 'பாலிசியை புதுப்பி',
        secured: 'Razorpay மூலம் பாதுகாக்கப்பட்டது',
        backDashboard: 'டாஷ்போர்டுக்கு திரும்பு',
        downloadPolicy: 'பாலிசி ஆவணத்தை பதிவிறக்கவும்',
        employerRenewal: 'முதலாளி வழங்கல் — கட்டணம் தேவையில்லை',
        employerRenewalSub: 'உங்கள் முதலாளி தானாக புதுப்பிக்கிறார்.',
    }
};

const LangToggle = ({ lang, setLang }) => (
    <div style={{ display: 'flex', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 20, padding: 3, gap: 2 }}>
        {[{ code: 'en', label: 'EN' }, { code: 'hi', label: 'हि' }, { code: 'ta', label: 'த' }].map(l => (
            <button key={l.code} onClick={() => setLang(l.code)}
                style={{ backgroundColor: lang === l.code ? 'white' : 'transparent', color: lang === l.code ? C.navy : 'white', border: 'none', padding: '5px 10px', borderRadius: 16, cursor: 'pointer', fontSize: 11, fontWeight: 700 }}>
                {l.label}
            </button>
        ))}
    </div>
);

const PaymentModal = ({ premium, name, onSuccess, onClose }) => {
    const [step, setStep] = useState('select');
    const [method, setMethod] = useState('upi');
    const [upiId, setUpiId] = useState('');
    const [upiError, setUpiError] = useState('');
    const [txnId, setTxnId] = useState('');

    const handlePay = () => {
        if (method === 'upi' && !upiId.includes('@')) { setUpiError('Enter a valid UPI ID'); return; }
        setUpiError('');
        setStep('processing');
        setTimeout(() => {
            setTxnId('pay_' + Math.random().toString(36).substr(2, 10).toUpperCase());
            setStep('success');
        }, 2500);
    };

    return (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 2000, fontFamily: 'Inter, sans-serif' }}>
            <div style={{ backgroundColor: 'white', borderRadius: '20px 20px 0 0', width: '100%', maxWidth: 480, padding: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 34, height: 34, borderRadius: 8, backgroundColor: '#072654', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <p style={{ color: '#3395FF', fontWeight: 800, fontSize: 12 }}>R</p>
                        </div>
                        <div>
                            <p style={{ color: '#072654', fontWeight: 700, fontSize: 14 }}>Razorpay</p>
                            <p style={{ color: C.textMuted, fontSize: 11 }}>Secured Payment</p>
                        </div>
                    </div>
                    {step !== 'processing' && step !== 'success' && (
                        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.textMuted, fontSize: 20 }}>✕</button>
                    )}
                </div>

                <div style={{ backgroundColor: C.bg, borderRadius: 12, padding: 16, marginBottom: 20, border: `1px solid ${C.cardBorder}`, textAlign: 'center' }}>
                    <p style={{ color: C.textMuted, fontSize: 12, marginBottom: 4 }}>WEEKLY PREMIUM RENEWAL</p>
                    <p style={{ color: C.text, fontWeight: 800, fontSize: 32, letterSpacing: -1 }}>₹{premium}</p>
                    <p style={{ color: C.textMuted, fontSize: 12, marginTop: 4 }}>Policyholder: {name}</p>
                </div>

                {step === 'select' && (
                    <div>
                        {[
                            { key: 'upi', label: 'UPI', sub: 'GPay, PhonePe, Paytm', icon: '📱' },
                            { key: 'card', label: 'Debit / Credit Card', sub: 'Visa, Mastercard, RuPay', icon: '💳' },
                            { key: 'netbanking', label: 'Net Banking', sub: 'All major banks', icon: '🏦' },
                        ].map(m => (
                            <div key={m.key} onClick={() => setMethod(m.key)}
                                style={{ border: `2px solid ${method === m.key ? C.accent : C.cardBorder}`, borderRadius: 12, padding: '13px 16px', marginBottom: 10, cursor: 'pointer', backgroundColor: method === m.key ? C.accentLight : 'white' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: method === 'upi' && m.key === 'upi' ? 12 : 0 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                        <div style={{ width: 30, height: 30, borderRadius: 8, backgroundColor: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>{m.icon}</div>
                                        <div>
                                            <p style={{ color: C.text, fontWeight: 600, fontSize: 13 }}>{m.label}</p>
                                            <p style={{ color: C.textMuted, fontSize: 11 }}>{m.sub}</p>
                                        </div>
                                    </div>
                                    <div style={{ width: 18, height: 18, borderRadius: '50%', border: `2px solid ${method === m.key ? C.accent : C.cardBorder}`, backgroundColor: method === m.key ? C.accent : 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        {method === m.key && <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: 'white' }} />}
                                    </div>
                                </div>
                                {method === 'upi' && m.key === 'upi' && (
                                    <div>
                                        <input type="text" placeholder="Enter UPI ID (e.g. name@upi)" value={upiId} onChange={e => { setUpiId(e.target.value); setUpiError(''); }}
                                            style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: `1.5px solid ${upiError ? C.redBorder : C.cardBorder}`, fontSize: 13, boxSizing: 'border-box', fontFamily: 'Inter, sans-serif', outline: 'none' }} />
                                        {upiError && <p style={{ color: C.red, fontSize: 12, marginTop: 4 }}>{upiError}</p>}
                                    </div>
                                )}
                            </div>
                        ))}
                        <button onClick={handlePay}
                            style={{ width: '100%', backgroundColor: C.navy, color: 'white', padding: 14, borderRadius: 10, border: 'none', fontSize: 15, fontWeight: 700, cursor: 'pointer', marginBottom: 12 }}>
                            Pay ₹{premium}
                        </button>
                        <p style={{ color: C.textMuted, fontSize: 11, textAlign: 'center' }}>Secured by Razorpay · 256-bit SSL</p>
                    </div>
                )}

                {step === 'processing' && (
                    <div style={{ textAlign: 'center', padding: '20px 0' }}>
                        <div style={{ width: 48, height: 48, borderRadius: '50%', border: `4px solid ${C.accentLight}`, borderTop: `4px solid ${C.accent}`, margin: '0 auto 16px', animation: 'spin 1s linear infinite' }} />
                        <p style={{ color: C.text, fontWeight: 700, fontSize: 15, marginBottom: 6 }}>Processing Payment</p>
                        <p style={{ color: C.textMuted, fontSize: 13 }}>Do not close this window...</p>
                        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                    </div>
                )}

                {step === 'success' && (
                    <div style={{ textAlign: 'center', padding: '10px 0' }}>
                        <div style={{ width: 60, height: 60, borderRadius: '50%', backgroundColor: C.greenLight, border: `3px solid ${C.greenBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={C.green} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                        </div>
                        <p style={{ color: C.text, fontWeight: 700, fontSize: 17, marginBottom: 4 }}>Payment Successful</p>
                        <p style={{ color: C.textMuted, fontSize: 13, marginBottom: 16 }}>₹{premium} paid — Policy renewed</p>
                        <div style={{ backgroundColor: C.bg, borderRadius: 10, padding: 14, marginBottom: 18, border: `1px solid ${C.cardBorder}`, textAlign: 'left' }}>
                            {[
                                { label: 'Amount', value: '₹' + premium },
                                { label: 'Method', value: method === 'upi' ? 'UPI — ' + upiId : method === 'card' ? 'Card' : 'Net Banking' },
                                { label: 'Transaction ID', value: txnId },
                                { label: 'Status', value: 'Success' },
                            ].map((item, i) => (
                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: i < 3 ? `1px solid ${C.cardBorder}` : 'none' }}>
                                    <p style={{ color: C.textMuted, fontSize: 12 }}>{item.label}</p>
                                    <p style={{ color: item.label === 'Status' ? C.green : C.text, fontWeight: 600, fontSize: 12 }}>{item.value}</p>
                                </div>
                            ))}
                        </div>
                        <button onClick={onSuccess} style={{ width: '100%', backgroundColor: C.navy, color: 'white', padding: 13, borderRadius: 10, border: 'none', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>Done</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default function Policy({ worker, onBack, lang: propLang, setLang: propSetLang }) {
    const [lang, setLang] = useState(propLang || 'en');
    const t = T[lang] || T.en;

    const name = worker?.name || 'Ravi Kumar';
    const zone = worker?.zone || 'Koramangala, Bangalore';
    const city = worker?.city || 'Bangalore';
    const platform = worker?.platform || 'Swiggy';
    const premium = worker?.premium || 59;
    const coverage = worker?.coverage || 1200;
    // Use snake_case keys matching what the backend/Firestore returns
    const employeeId = worker?.employee_id || 'KOR-3847261';
    const age = worker?.age || 26;
    const avgIncome = worker?.avg_income || 1800;
    const avgDeliveries = worker?.avg_deliveries || 18;
    const policyType = worker?.policy_type || 'individual';
    const employerName = worker?.employer_name || '';
    const eshramId = worker?.eshram_id || '';
    const phone = worker?.phone || '9876543210';

    const [paused, setPaused] = useState(false);
    const [showPauseConfirm, setShowPauseConfirm] = useState(false);
    const [renewed, setRenewed] = useState(false);
    const [showPayment, setShowPayment] = useState(false);

    const today = new Date();
    const startDate = today.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    const endDate = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

    const payoutTiers = [
        { tier: t.minor, desc: t.minorDesc, pct: 30, amount: Math.round(coverage * 0.3), color: C.green, bg: C.greenLight, border: C.greenBorder },
        { tier: t.moderate, desc: t.moderateDesc, pct: 65, amount: Math.round(coverage * 0.65), color: C.orange, bg: C.orangeLight, border: C.orangeBorder },
        { tier: t.severe, desc: t.severeDesc, pct: 100, amount: coverage, color: C.red, bg: C.redLight, border: C.redBorder },
    ];

    const coveredItems = [
        { code: 'HRA/MRA/LRA', label: 'Rainfall above 25mm per hour' },
        { code: 'SAQ/MAQ', label: 'Air Quality Index above 200' },
        { code: 'FLD', label: 'Official NDMA flood warning' },
        { code: 'STM', label: 'Wind speed above 60kmh' },
        { code: 'CRF', label: 'Government declared curfew' },
        { code: 'EQK', label: 'Earthquake magnitude above 4.0' },
        { code: 'LDS', label: 'IMD issued landslide warning' },
        { code: 'HTV', label: 'Temperature above 45 degrees C' },
        { code: 'FOG', label: 'Visibility below 50 metres' },
        { code: 'WND', label: 'Wind speed above 80kmh' },
    ];

    const card = (children, mb = '12px', extra = {}) => (
        <div style={{ backgroundColor: C.cardBg, borderRadius: 12, padding: '18px 20px', marginBottom: mb, boxShadow: C.cardShadow, border: `1px solid ${C.cardBorder}`, ...extra }}>
            {children}
        </div>
    );

    const sectionTitle = (text) => (
        <p style={{ color: C.text, fontWeight: 700, fontSize: 14, marginBottom: 14 }}>{text}</p>
    );

    const row = (label, value, last = false) => (
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: last ? 'none' : `1px solid ${C.cardBorder}` }}>
            <p style={{ color: C.textMuted, fontSize: 13 }}>{label}</p>
            <p style={{ color: C.text, fontWeight: 600, fontSize: 13, textAlign: 'right', maxWidth: '55%' }}>{value}</p>
        </div>
    );

    return (
        <div style={{ backgroundColor: C.bg, minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
            {showPayment && (
                <PaymentModal premium={premium} name={name}
                    onSuccess={() => { setShowPayment(false); setRenewed(true); }}
                    onClose={() => setShowPayment(false)} />
            )}

            {/* Navbar */}
            <div style={{ background: 'linear-gradient(135deg, #08101F 0%, #0D1829 100%)', padding: '0 24px', height: 62, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <KavachLogo size={28} light />
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <LangToggle lang={lang} setLang={setLang} />
                    <button onClick={onBack} style={{ backgroundColor: 'transparent', color: 'rgba(255,255,255,0.65)', border: '1px solid rgba(255,255,255,0.15)', padding: '6px 14px', borderRadius: 7, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>{t.back}</button>
                </div>
            </div>

            <div style={{ padding: '20px 16px', maxWidth: 520, margin: '0 auto' }}>
                <p style={{ color: C.text, fontSize: 20, fontWeight: 800, marginBottom: 16 }}>{t.title}</p>

                {/* Policy Card */}
                <div style={{ backgroundColor: C.navy, borderRadius: 16, padding: 22, marginBottom: 14, color: 'white', boxShadow: '0 4px 20px rgba(26,58,92,0.2)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 }}>
                        <div>
                            <p style={{ opacity: 0.6, fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase', color: 'white', marginBottom: 4 }}>{t.policyHolder}</p>
                            <p style={{ fontWeight: 800, fontSize: 18, color: 'white' }}>{name}</p>
                            <p style={{ opacity: 0.6, fontSize: 12, marginTop: 3, color: 'white' }}>{platform} · {zone.split(',')[0]}</p>
                            {policyType === 'employer' && (
                                <div style={{ backgroundColor: 'rgba(255,255,255,0.1)', padding: '3px 10px', borderRadius: 20, border: '1px solid rgba(255,255,255,0.15)', display: 'inline-block', marginTop: 8 }}>
                                    <p style={{ fontSize: 10, fontWeight: 700, color: 'white' }}>{t.employerSponsored}</p>
                                </div>
                            )}
                        </div>
                        <div style={{ backgroundColor: paused ? 'rgba(217,119,6,0.7)' : 'rgba(5,150,105,0.7)', padding: '4px 12px', borderRadius: 20, border: '1px solid rgba(255,255,255,0.15)' }}>
                            <p style={{ fontSize: 11, fontWeight: 700, color: 'white' }}>{paused ? t.paused : t.active}</p>
                        </div>
                    </div>
                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                        {[
                            { label: t.weeklyPremium, value: policyType === 'employer' ? t.free : '₹' + premium },
                            { label: t.weeklyCoverage, value: '₹' + coverage },
                        ].map((item, i) => (
                            <div key={i} style={{ textAlign: 'center', backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 10, padding: 12 }}>
                                <p style={{ fontWeight: 800, fontSize: 20, color: 'white' }}>{item.value}</p>
                                <p style={{ opacity: 0.6, fontSize: 11, marginTop: 3, color: 'white' }}>{item.label}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Download */}
                <button onClick={() => window.print()}
                    style={{ width: '100%', backgroundColor: C.cardBg, color: C.navy, padding: 12, borderRadius: 8, border: `1px solid ${C.cardBorder}`, fontSize: 13, fontWeight: 700, cursor: 'pointer', marginBottom: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontFamily: 'Inter, sans-serif' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.navy} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
                    {t.downloadPolicy}
                </button>

                {/* Policy Details */}
                {card(<>
                    {sectionTitle(t.policyDetails)}
                    {row(t.policyId, 'KVP-' + phone.slice(-6))}
                    {row(t.employeeId, employeeId)}
                    {row(t.policyType, policyType === 'individual' ? t.individualPolicy : t.employerPolicy)}
                    {policyType === 'employer' && employerName && row(t.employer, employerName)}
                    {row(t.platform, platform)}
                    {row(t.city, city)}
                    {row(t.zone, zone)}
                    {row(t.age, age + ' ' + t.years)}
                    {row(t.avgIncome, '₹' + avgIncome)}
                    {row(t.avgDeliveries, avgDeliveries + '/day')}
                    {row(t.incomeProtected, '65%')}
                    {eshramId && row(t.eshramId, eshramId + ' ' + t.eshramLinked)}
                    {row(t.validFrom, startDate)}
                    {row(t.validUntil, endDate)}
                    {row(t.renewal, t.autoRenew, true)}
                </>)}

                {/* What's Covered */}
                {card(<>
                    {sectionTitle(t.covered)}
                    {coveredItems.map((item, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '9px 12px', borderRadius: 8, marginBottom: 6, backgroundColor: C.greenLight, border: `1px solid ${C.greenBorder}` }}>
                            <div style={{ backgroundColor: C.navy, borderRadius: 4, padding: '2px 6px', flexShrink: 0, marginTop: 1 }}>
                                <p style={{ color: 'white', fontSize: 9, fontWeight: 800, letterSpacing: 0.5 }}>{item.code}</p>
                            </div>
                            <p style={{ color: C.textSec, fontSize: 13 }}>{item.label}</p>
                        </div>
                    ))}
                </>)}

                {/* What's NOT Covered */}
                {card(<>
                    {sectionTitle(t.notCovered)}
                    {['Vehicle damage or breakdown', 'Health issues or accidents', 'Personal reasons for not working', 'Income loss outside enrolled zone'].map((item, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '9px 12px', borderRadius: 8, marginBottom: 6, backgroundColor: C.redLight, border: `1px solid ${C.redBorder}` }}>
                            <div style={{ width: 5, height: 5, borderRadius: '50%', backgroundColor: C.red, flexShrink: 0 }} />
                            <p style={{ color: C.red, fontSize: 13, fontWeight: 500 }}>{item}</p>
                        </div>
                    ))}
                </>)}

                {/* Payout Tiers */}
                {card(<>
                    {sectionTitle(t.payoutTiers)}
                    {payoutTiers.map((tier, i) => (
                        <div key={i} style={{ backgroundColor: tier.bg, borderRadius: 10, padding: '13px 16px', marginBottom: 10, border: `1px solid ${tier.border}` }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                                <div>
                                    <p style={{ color: tier.color, fontWeight: 700, fontSize: 13 }}>{tier.tier} Disruption</p>
                                    <p style={{ color: C.textMuted, fontSize: 12, marginTop: 3 }}>{tier.desc}</p>
                                </div>
                                <p style={{ color: tier.color, fontWeight: 800, fontSize: 20 }}>₹{tier.amount}</p>
                            </div>
                            <div style={{ backgroundColor: 'rgba(255,255,255,0.6)', borderRadius: 4, height: 6, overflow: 'hidden', marginTop: 8 }}>
                                <div style={{ width: tier.pct + '%', height: '100%', backgroundColor: tier.color, borderRadius: 4 }} />
                            </div>
                            <p style={{ color: C.textMuted, fontSize: 11, marginTop: 4 }}>{tier.pct}{t.ofCoverage}</p>
                        </div>
                    ))}
                </>)}

                {/* 5-Layer Verification */}
                {card(<>
                    {sectionTitle(t.howVerified)}
                    <p style={{ color: C.textMuted, fontSize: 12, marginBottom: 14, marginTop: -8 }}>{t.howVerifiedSub}</p>
                    {[
                        { label: 'Work Intent', desc: 'Did you tap Start My Day before the disruption?' },
                        { label: 'Disruption Trigger', desc: 'Did IMD/CPCB/NDMA confirm the event in your zone?' },
                        { label: 'Zone Correlation', desc: 'Were 60%+ of workers in your zone also inactive?' },
                        { label: 'GPS Inactivity', desc: 'Were you stationary during the disruption window?' },
                        { label: 'KavachScore', desc: 'Is your behavioral trust score above 300?' },
                    ].map((item, i) => (
                        <div key={i} style={{ display: 'flex', gap: 12, marginBottom: 12, alignItems: 'flex-start' }}>
                            <div style={{ width: 24, height: 24, borderRadius: '50%', backgroundColor: C.navy, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 11, flexShrink: 0 }}>{i + 1}</div>
                            <div>
                                <p style={{ color: C.text, fontWeight: 600, fontSize: 13 }}>{item.label}</p>
                                <p style={{ color: C.textMuted, fontSize: 12, marginTop: 2 }}>{item.desc}</p>
                            </div>
                        </div>
                    ))}
                </>)}

                {/* Pause */}
                {card(<>
                    {sectionTitle(t.pauseTitle)}
                    <p style={{ color: C.textMuted, fontSize: 12, marginBottom: 14, marginTop: -8 }}>{t.pauseSub}</p>
                    {paused ? (
                        <div>
                            <div style={{ backgroundColor: C.orangeLight, border: `1px solid ${C.orangeBorder}`, borderRadius: 8, padding: '11px 14px', marginBottom: 12 }}>
                                <p style={{ color: C.orange, fontWeight: 600, fontSize: 13 }}>{t.pauseActive}</p>
                                <p style={{ color: C.orange, fontSize: 12, marginTop: 4 }}>{t.pauseActiveSub}</p>
                            </div>
                            <button onClick={async () => { await api.pausePolicy(worker?.uid); setPaused(false); }}
                                style={{ width: '100%', backgroundColor: C.green, color: 'white', padding: 12, borderRadius: 8, border: 'none', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>{t.resume}</button>
                        </div>
                    ) : showPauseConfirm ? (
                        <div>
                            <div style={{ backgroundColor: C.orangeLight, border: `1px solid ${C.orangeBorder}`, borderRadius: 8, padding: '11px 14px', marginBottom: 12 }}>
                                <p style={{ color: C.orange, fontWeight: 600, fontSize: 13 }}>{t.pauseConfirm}</p>
                                <p style={{ color: C.orange, fontSize: 12, marginTop: 4 }}>{t.pauseConfirmSub}</p>
                            </div>
                            <div style={{ display: 'flex', gap: 10 }}>
                                <button onClick={async () => { await api.pausePolicy(worker?.uid); setPaused(true); setShowPauseConfirm(false); }}
                                    style={{ flex: 1, backgroundColor: C.orange, color: 'white', padding: 12, borderRadius: 8, border: 'none', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>{t.yesPause}</button>
                                <button onClick={() => setShowPauseConfirm(false)}
                                    style={{ flex: 1, backgroundColor: C.cardBg, color: C.navy, padding: 12, borderRadius: 8, border: `1px solid ${C.cardBorder}`, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>{t.cancel}</button>
                            </div>
                        </div>
                    ) : (
                        <button onClick={() => setShowPauseConfirm(true)}
                            style={{ width: '100%', backgroundColor: C.orangeLight, color: C.orange, padding: 12, borderRadius: 8, border: `1px solid ${C.orangeBorder}`, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>{t.pauseBtn}</button>
                    )}
                </>)}

                {/* Renewal */}
                {policyType === 'employer' ? (
                    <div style={{ backgroundColor: C.greenLight, borderRadius: 12, padding: 18, textAlign: 'center', marginBottom: 14, border: `1px solid ${C.greenBorder}` }}>
                        <p style={{ color: C.green, fontWeight: 700, fontSize: 14 }}>{t.employerRenewal}</p>
                        <p style={{ color: C.textMuted, fontSize: 13, marginTop: 6 }}>{t.employerRenewalSub}</p>
                    </div>
                ) : renewed ? (
                    <div style={{ backgroundColor: C.greenLight, border: `1px solid ${C.greenBorder}`, borderRadius: 12, padding: 18, textAlign: 'center', marginBottom: 14 }}>
                        <p style={{ color: C.green, fontWeight: 700, fontSize: 14 }}>{t.renewedMsg}</p>
                        <p style={{ color: C.textMuted, fontSize: 13, marginTop: 6 }}>{t.renewedSub}</p>
                    </div>
                ) : (
                    card(<>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                            <p style={{ color: C.text, fontWeight: 700, fontSize: 14 }}>{t.renewAmount}</p>
                            <p style={{ color: C.navy, fontWeight: 800, fontSize: 20 }}>₹{premium}</p>
                        </div>
                        <button onClick={() => setShowPayment(true)}
                            style={{ width: '100%', backgroundColor: C.navy, color: 'white', padding: 13, borderRadius: 8, border: 'none', fontSize: 14, fontWeight: 700, cursor: 'pointer', marginBottom: 10 }}>
                            {t.renewBtn} — ₹{premium}
                        </button>
                        <p style={{ color: C.textMuted, fontSize: 11, textAlign: 'center' }}>{t.secured}</p>
                    </>)
                )}

                <button onClick={onBack}
                    style={{ width: '100%', backgroundColor: C.cardBg, color: C.navy, padding: 13, borderRadius: 8, border: `1px solid ${C.cardBorder}`, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
                    {t.backDashboard}
                </button>
            </div>
        </div>
    );
}