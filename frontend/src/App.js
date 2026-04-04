import React, { useState, useRef, useEffect } from 'react';
import Login from './Login';
import AdminLogin from './AdminLogin';
import Signup from './Signup';
import Dashboard from './Dashboard';
import AdminDashboard from './AdminDashboard';
import Chatbot from './Chatbot';

export const ThemeContext = React.createContext();
export const useTheme = () => React.useContext(ThemeContext);

// ─── API CONFIG ───
const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// ─── DESIGN TOKENS ───
const C = {
  navy: '#08101F',
  navyMid: '#0D1829',
  navyLight: '#1A3A5C',
  accent: '#2563EB',
  accentLight: '#EFF6FF',
  white: '#FFFFFF',
  bg: '#FFFFFF',
  bgSubtle: '#F9FAFB',
  bgMuted: '#F3F4F6',
  text: '#111827',
  textMuted: '#6B7280',
  textLight: '#9CA3AF',
  border: '#E5E7EB',
  borderMid: '#D1D5DB',
  success: '#059669',
  successLight: '#ECFDF5',
};

// ─── TRANSLATIONS ───
const T = {
  en: {
    nav: { why: 'Why Choose Us', how: 'How It Works', about: 'About', login: 'Login', admin: 'Admin', getStarted: 'Get Started' },
    badge: "India's First Parametric Income Insurance for Gig Workers",
    heroLine1: 'When the city stops,',
    heroLine2: 'your income',
    heroLine3: "doesn't.",
    heroSub: "Rain, riots, app outages — KavachPay detects disruptions in your zone and credits your UPI automatically. No forms. No calls. No waiting.",
    getCovered: 'Get Covered Now',
    seeHow: 'See How It Works',
    stats: [
      { val: '50M+', label: 'Gig Workers in India' },
      { val: '< 2 min', label: 'Avg. Payout Time' },
      { val: '15', label: 'Event Types Covered' },
      { val: '20+', label: 'Cities Active' },
    ],
    whyLabel: 'Why Choose Us',
    whyTitle: 'The only protection platform built for how delivery workers actually work.',
    whySub: 'Traditional insurance fails gig workers — long forms, manual verification, weeks of waiting. KavachPay was built from scratch to fix every single one of those failures.',
    howLabel: 'Process',
    howTitle: 'From disruption to payout — fully automatic.',
    howSub: 'No human intervention. No delays. Just trigger, verify, and pay.',
    coverLabel: 'Coverage',
    coverTitle: '15 disruption types. All automatic.',
    coverSub: 'Every trigger uses official government APIs — IMD, CPCB, and NDMA. Tamper-proof.',
    ctaTitle: 'Your income deserves protection.',
    ctaSub: 'Join thousands of delivery workers who never worry about losing income during disruptions.',
    ctaBtn: 'Create Your Account',
    ctaLogin: 'Already have an account? Login',
    aboutLabel: 'About Us',
    aboutTitle: 'Built by students, for India\'s real workforce.',
    aboutSub: 'KavachPay was conceived and built by four second-year B.Tech students at Shiv Nadar University, Chennai — driven by the belief that India\'s 50 million gig workers deserve financial protection as reliable as the services they power.',
    footerTagline: "Protecting the backbone of India's gig economy.",
    footerCopy: '© 2026 KavachPay Technologies',
    tickerLabel: 'Live Payouts',
    platformsLabel: 'Works with your platform',
    getProtected: 'Get Protected Now',
    alreadyAccount: 'Already have an account? Login →',
  },
  hi: {
    nav: { why: 'हमें क्यों चुनें', how: 'कैसे काम करता है', about: 'हमारे बारे में', login: 'लॉगिन', admin: 'एडमिन', getStarted: 'शुरू करें' },
    badge: 'गिग कर्मचारियों के लिए भारत का पहला पैरामेट्रिक आय बीमा',
    heroLine1: 'जब शहर रुक जाए,',
    heroLine2: 'आपकी कमाई',
    heroLine3: 'नहीं।',
    heroSub: 'बारिश, दंगे, ऐप आउटेज — KavachPay आपके क्षेत्र में व्यवधान का पता लगाता है और UPI में पैसे भेजता है। कोई फॉर्म नहीं। कोई कॉल नहीं।',
    getCovered: 'अभी कवर पाएं',
    seeHow: 'देखें कैसे काम करता है',
    stats: [
      { val: '50M+', label: 'भारत में गिग कर्मचारी' },
      { val: '< 2 मिनट', label: 'औसत भुगतान समय' },
      { val: '15', label: 'कवर इवेंट प्रकार' },
      { val: '20+', label: 'सक्रिय शहर' },
    ],
    whyLabel: 'हमें क्यों चुनें',
    whyTitle: 'गिग वर्कर्स के लिए बना, हर तरह से।',
    whySub: 'पारंपरिक बीमा गिग वर्कर्स के लिए काम नहीं करता। KavachPay ने इन सभी खामियों को ठीक किया।',
    howLabel: 'प्रक्रिया',
    howTitle: 'डिसरप्शन से भुगतान तक — पूरी तरह ऑटोमैटिक।',
    howSub: 'कोई मानवीय हस्तक्षेप नहीं। कोई देरी नहीं।',
    coverLabel: 'कवरेज',
    coverTitle: '15 व्यवधान प्रकार। सभी स्वचालित।',
    coverSub: 'हर ट्रिगर आधिकारिक सरकारी API — IMD, CPCB, NDMA का उपयोग करता है।',
    ctaTitle: 'आपकी कमाई सुरक्षा की हकदार है।',
    ctaSub: 'हजारों डिलीवरी वर्कर्स पहले से KavachPay पर भरोसा करते हैं।',
    ctaBtn: 'अकाउंट बनाएं',
    ctaLogin: 'पहले से अकाउंट है? लॉगिन करें →',
    aboutLabel: 'हमारे बारे में',
    aboutTitle: 'छात्रों द्वारा बनाया, भारत के असली कर्मचारियों के लिए।',
    aboutSub: 'KavachPay को शिव नादर विश्वविद्यालय चेन्नई के चार बी.टेक छात्रों ने बनाया है।',
    footerTagline: 'भारत की गिग इकोनॉमी की रीढ़ को सुरक्षा।',
    footerCopy: '© 2026 KavachPay Technologies',
    tickerLabel: 'लाइव भुगतान',
    platformsLabel: 'आपके प्लेटफॉर्म के साथ काम करता है',
    getProtected: 'अभी सुरक्षित हों',
    alreadyAccount: 'पहले से अकाउंट है? लॉगिन करें →',
  },
  ta: {
    nav: { why: 'ஏன் தேர்வு செய்யணும்', how: 'எவ்வாறு செயல்படுகிறது', about: 'எங்களைப் பற்றி', login: 'உள்நுழைவு', admin: 'நிர்வாகி', getStarted: 'தொடங்கவும்' },
    badge: 'கிக் தொழிலாளர்களுக்கான இந்தியாவின் முதல் பாரமெட்ரிக் வருமான காப்பீடு',
    heroLine1: 'நகரம் நிறுத்தும்போது,',
    heroLine2: 'உங்கள் வருமானம்',
    heroLine3: 'நிறுத்தாது.',
    heroSub: 'மழை, கலவரம், ஆப் இடைநிறுத்தம் — KavachPay தானாக கண்டறிந்து UPI-ல் பணம் அனுப்புகிறது.',
    getCovered: 'இப்போது பாதுகாப்பு பெறுங்கள்',
    seeHow: 'எவ்வாறு செயல்படுகிறது',
    stats: [
      { val: '50M+', label: 'இந்தியாவில் கிக் தொழிலாளர்கள்' },
      { val: '< 2 நிமிடம்', label: 'சராசரி பணம் நேரம்' },
      { val: '15', label: 'நிகழ்வு வகைகள்' },
      { val: '20+', label: 'செயலில் நகரங்கள்' },
    ],
    whyLabel: 'ஏன் தேர்வு செய்யணும்',
    whyTitle: 'டெலிவரி தொழிலாளர்களுக்காக கட்டமைக்கப்பட்ட ஒரே பாதுகாப்பு தளம்.',
    whySub: 'பாரம்பரிய காப்பீடு கிக் தொழிலாளர்களுக்கு வேலை செய்யவில்லை. KavachPay ஒவ்வொரு தோல்வியையும் சரிசெய்ய கட்டமைக்கப்பட்டது.',
    howLabel: 'செயல்முறை',
    howTitle: 'இடையூறிலிருந்து பணம் வரை — முழுவதும் தானியங்கி.',
    howSub: 'மனித தலையீடு இல்லை. தாமதம் இல்லை.',
    coverLabel: 'கவரேஜ்',
    coverTitle: '15 இடையூறு வகைகள். அனைத்தும் தானியங்கி.',
    coverSub: 'ஒவ்வொரு தூண்டலும் அரசு API — IMD, CPCB, NDMA பயன்படுத்துகிறது.',
    ctaTitle: 'உங்கள் வருமானம் பாதுகாப்பை பெறுகிறது.',
    ctaSub: 'ஆயிரக்கணக்கான டெலிவரி தொழிலாளர்கள் KavachPay-ஐ நம்புகிறார்கள்.',
    ctaBtn: 'உங்கள் கணக்கை உருவாக்கவும்',
    ctaLogin: 'ஏற்கனவே கணக்கு இருக்கா? உள்நுழைவு →',
    aboutLabel: 'எங்களைப் பற்றி',
    aboutTitle: 'மாணவர்களால் கட்டமைக்கப்பட்டது, இந்தியாவின் உண்மையான தொழிலாளர்களுக்காக.',
    aboutSub: 'KavachPay சென்னையில் உள்ள சிவ் நாடார் பல்கலைக்கழகத்தின் நான்கு B.Tech மாணவர்களால் கட்டமைக்கப்பட்டது.',
    footerTagline: "இந்தியாவின் கிக் பொருளாதாரத்தின் முதுகெலும்பை பாதுகாக்கிறது.",
    footerCopy: '© 2026 KavachPay Technologies',
    tickerLabel: 'நேரடி பணம்',
    platformsLabel: 'உங்கள் தளத்துடன் செயல்படுகிறது',
    getProtected: 'இப்போது பாதுகாக்கப்படுங்கள்',
    alreadyAccount: 'ஏற்கனவே கணக்கு இருக்கா? உள்நுழைவு →',
  }
};

const WHY_ITEMS = [
  { number: '01', title: 'Zero-Touch Payouts', desc: 'No claim forms. No calls. No waiting. Our parametric engine detects disruptions via government APIs and triggers payouts the moment a qualifying event occurs in your zone.' },
  { number: '02', title: 'Built on Real Government Data', desc: 'We integrate with IMD, NDMA, CPCB, and municipal APIs — not manual reports. Your payout is driven by verified, real-time data, not subjective assessments.' },
  { number: '03', title: 'UPI in Under 2 Minutes', desc: 'Once a trigger fires, our settlement engine initiates a direct UPI transfer. Average time from event detection to credit: under 2 minutes for Trusted Workers.' },
  { number: '04', title: 'Hyper-Local Precision', desc: 'Coverage is zone-specific — not city-level. A disruption in Koramangala does not affect a worker in Whitefield. You are covered exactly where you work.' },
  { number: '05', title: '15 Covered Event Types', desc: 'Rain (HRA/MRA/LRA), Storm, Flood, Curfew, Air Quality (SAQ/MAQ), Fog, Wind, Earthquake, Landslide, Heatwave, Pandemic (PND), and War (WAR) — all automatically detected and paid.' },
  { number: '06', title: 'Designed for Bharat', desc: 'UPI-first. Works on any phone. Built specifically for the realities of India\'s 50 million gig delivery workers across 20 cities.' },
];

const ALL_DISRUPTIONS = [
  { code: 'HRA', label: 'Heavy Rain', sub: '>100mm/hr' },
  { code: 'MRA', label: 'Moderate Rain', sub: '50–99mm/hr' },
  { code: 'LRA', label: 'Light Rain', sub: '25–49mm/hr' },
  { code: 'SAQ', label: 'Severe AQI', sub: 'AQI >300' },
  { code: 'MAQ', label: 'Moderate AQI', sub: 'AQI 200–299' },
  { code: 'STM', label: 'Storm', sub: 'Wind >60kmh' },
  { code: 'FLD', label: 'Flood', sub: 'NDMA Alert' },
  { code: 'CRF', label: 'Curfew', sub: 'Govt Order' },
  { code: 'EQK', label: 'Earthquake', sub: 'M >4.0' },
  { code: 'LDS', label: 'Landslide', sub: 'IMD Alert' },
  { code: 'HTV', label: 'Heatwave', sub: '>45°C' },
  { code: 'FOG', label: 'Dense Fog', sub: 'Vis <50m' },
  { code: 'WND', label: 'High Wind', sub: '>80kmh' },
  { code: 'PND', label: 'Pandemic', sub: 'Govt Order' },
  { code: 'WAR', label: 'War', sub: 'Govt Order' },
];

const TICKER_ITEMS = [
  '₹1,200 credited — Heavy Rain, Koramangala',
  '₹780 credited — AQI Alert, Adyar',
  '₹1,560 credited — Curfew, Andheri',
  '₹780 credited — Storm, Banjara Hills',
  '₹370 credited — Dense Fog, Connaught Place',
  '₹1,560 credited — Flood, Salt Lake',
  '₹294 credited — High Wind, Viman Nagar',
  '₹1,014 credited — Severe AQI, Dharavi',
];

// ─── EXPORTED LOGO (used across files) ───
export const KavachLogo = ({ size = 32, light = false }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <circle cx="50" cy="50" r="50" fill={light ? 'rgba(255,255,255,0.12)' : C.navyLight} />
      <text x="50" y="68" textAnchor="middle" fontSize="50" fill="white" fontWeight="bold" fontFamily="Georgia, serif">₹</text>
    </svg>
    <div>
      <div style={{ fontWeight: 900, fontSize: size * 0.45, color: light ? '#fff' : C.navyLight, letterSpacing: 1.5, lineHeight: 1 }}>KAVACHPAY</div>
      {size >= 28 && (
        <div style={{ fontSize: size * 0.2, color: light ? 'rgba(255,255,255,0.4)' : C.textLight, letterSpacing: 1.8, marginTop: 2 }}>TRIGGER · VERIFY · PAY</div>
      )}
    </div>
  </div>
);

// ─── LIVE TICKER ───
function LiveTicker({ label }) {
  return (
    <div style={{ background: 'rgba(37,99,235,0.05)', borderTop: `1px solid rgba(37,99,235,0.1)`, borderBottom: `1px solid rgba(37,99,235,0.1)`, padding: '9px 0', overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <div style={{ flexShrink: 0, padding: '0 20px', fontSize: 10, fontWeight: 800, color: C.accent, letterSpacing: 2, textTransform: 'uppercase', borderRight: `1px solid rgba(37,99,235,0.15)`, marginRight: 0, whiteSpace: 'nowrap' }}>
          {label}
        </div>
        <div style={{ overflow: 'hidden', flex: 1 }}>
          <div style={{ display: 'flex', gap: 56, animation: 'ticker 30s linear infinite', whiteSpace: 'nowrap' }}>
            {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
              <span key={i} style={{ fontSize: 12, color: C.textMuted, flexShrink: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: C.success, display: 'inline-block', flexShrink: 0 }} />
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
      <style>{`@keyframes ticker { from { transform: translateX(0); } to { transform: translateX(-50%); } }`}</style>
    </div>
  );
}

// ─── STEP ROW ───
function StepRow({ n, text, last }) {
  return (
    <div style={{ display: 'flex', gap: 16 }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ width: 30, height: 30, borderRadius: '50%', background: C.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13, color: '#fff', flexShrink: 0 }}>{n}</div>
        {!last && <div style={{ width: 1, flex: 1, background: C.border, marginTop: 4, minHeight: 24 }} />}
      </div>
      <div style={{ paddingTop: 5, paddingBottom: last ? 0 : 28, fontSize: 14, color: C.text, lineHeight: 1.75 }}>{text}</div>
    </div>
  );
}

// ─── TEAM CARD ───
function TeamCard({ name, initial, role }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ width: 68, height: 68, borderRadius: '50%', background: C.navyLight, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px', fontSize: 24, fontWeight: 800, color: '#fff' }}>{initial}</div>
      <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{name}</div>
      <div style={{ fontSize: 12, color: C.textMuted, marginTop: 2 }}>{role}</div>
    </div>
  );
}

// ─── MODAL ───
function Modal({ title, onClose, children }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
      <div style={{ background: C.white, borderRadius: 16, width: '100%', maxWidth: 480, maxHeight: '85vh', overflow: 'hidden', boxShadow: '0 24px 80px rgba(0,0,0,0.2)', border: `1px solid ${C.border}` }}>
        <div style={{ background: C.navyLight, padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p style={{ color: 'white', fontWeight: 700, fontSize: 15 }}>{title}</p>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: 'white', width: 28, height: 28, borderRadius: '50%', cursor: 'pointer', fontSize: 14 }}>✕</button>
        </div>
        <div style={{ overflowY: 'auto', padding: 24, maxHeight: '65vh' }}>{children}</div>
      </div>
    </div>
  );
}

// ─── LANDING CHATBOT (rule-based, fast) ───
const BOT_ANSWERS = {
  default: 'KavachPay protects delivery workers from income loss during disruptions. Ask me about pricing, covered events, how payouts work, or which platforms we support.',
  about: 'KavachPay is India\'s first parametric income insurance for gig delivery workers. When disruptions occur in your zone, we detect it automatically via government APIs and pay you — no paperwork required.',
  how: '1. Sign up and link your Swiggy or Zomato account.\n2. A qualifying disruption is detected in your zone.\n3. KavachPay verifies it via IMD, CPCB, or NDMA APIs.\n4. Money is credited to your UPI — under 2 minutes.',
  cost: 'Coverage starts at ₹49 per week. Maximum weekly payout ranges from ₹980 to ₹1,560 depending on your zone risk level. No lock-in. Cancel anytime.',
  platforms: 'We currently support Swiggy and Zomato. More platforms coming in Phase 2.',
  payout: 'Payouts are triggered automatically via government APIs. For Trusted Workers (KavachScore 750+), funds reach your UPI within 2 minutes of trigger confirmation.',
  covered: 'We cover 15 event types: Heavy Rain (HRA), Moderate Rain (MRA), Light Rain (LRA), Storm (STM), Flood (FLD), Curfew (CRF), Severe AQI (SAQ), Moderate AQI (MAQ), Dense Fog (FOG), High Wind (WND), Earthquake (EQK), Landslide (LDS), Heatwave (HTV), Pandemic (PND), and War (WAR).',
  score: 'KavachScore is your behavioral trust score. Workers start at 750 (Trusted tier). Higher scores mean faster payouts and lower premiums. It improves with legitimate claims and consistent activity.',
};

function getReply(msg) {
  const m = msg.toLowerCase();
  if (m.includes('what is') || m.includes('about') || m.includes('kavachpay')) return BOT_ANSWERS.about;
  if ((m.includes('how') && m.includes('work')) || m.includes('process') || m.includes('steps')) return BOT_ANSWERS.how;
  if (m.includes('cost') || m.includes('price') || m.includes('premium') || m.includes('much') || m.includes('₹')) return BOT_ANSWERS.cost;
  if (m.includes('platform') || m.includes('swiggy') || m.includes('zomato')) return BOT_ANSWERS.platforms;
  if (m.includes('payout') || m.includes('pay') || m.includes('money') || m.includes('upi') || m.includes('credit')) return BOT_ANSWERS.payout;
  if (m.includes('cover') || m.includes('rain') || m.includes('flood') || m.includes('event') || m.includes('type') || m.includes('disruption')) return BOT_ANSWERS.covered;
  if (m.includes('score') || m.includes('kavachscore') || m.includes('trust')) return BOT_ANSWERS.score;
  return BOT_ANSWERS.default;
}

function LandingChatbot({ onSignup, lang }) {
  const t = T[lang] || T.en;
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState([{ from: 'bot', text: 'Welcome to KavachPay. How can I help you today?' }]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [msgs, typing]);

  const send = async (text) => {
    const msg = text || input.trim();
    if (!msg) return;
    setInput('');
    setMsgs(m => [...m, { from: 'user', text: msg }]);
    setTyping(true);
    await new Promise(r => setTimeout(r, 700));
    setTyping(false);
    setMsgs(m => [...m, { from: 'bot', text: getReply(msg) }]);
  };

  const CHIPS = ['What is KavachPay?', 'How does it work?', 'What\'s covered?', 'Pricing?'];

  return (
    <>
      <button onClick={() => setOpen(o => !o)}
        style={{ position: 'fixed', bottom: 28, right: 28, width: 52, height: 52, borderRadius: '50%', background: C.navyLight, border: 'none', cursor: 'pointer', boxShadow: '0 4px 20px rgba(26,58,92,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, transition: 'transform 0.2s' }}
        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.06)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
        {open
          ? <span style={{ fontSize: 18, color: '#fff', lineHeight: 1 }}>✕</span>
          : <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
        }
      </button>

      {open && (
        <div style={{ position: 'fixed', bottom: 92, right: 28, width: 320, background: C.white, borderRadius: 14, boxShadow: '0 12px 40px rgba(0,0,0,0.14)', border: `1px solid ${C.border}`, zIndex: 999, display: 'flex', flexDirection: 'column', overflow: 'hidden', fontFamily: 'Inter, -apple-system, sans-serif' }}>
          {/* Header */}
          <div style={{ background: C.navyLight, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <svg width="26" height="26" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="rgba(255,255,255,0.12)" /><text x="50" y="66" textAnchor="middle" fontSize="44" fill="white" fontFamily="Georgia,serif">₹</text></svg>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>KavachBot</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>Online — ask me anything</div>
            </div>
          </div>

          {/* Messages */}
          <div style={{ height: 210, overflowY: 'auto', padding: '12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {msgs.map((m, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: m.from === 'user' ? 'flex-end' : 'flex-start' }}>
                <div style={{ maxWidth: '82%', background: m.from === 'user' ? C.accent : C.bgMuted, color: m.from === 'user' ? '#fff' : C.text, borderRadius: m.from === 'user' ? '12px 12px 2px 12px' : '12px 12px 12px 2px', padding: '9px 12px', fontSize: 12, lineHeight: 1.6, whiteSpace: 'pre-line' }}>{m.text}</div>
              </div>
            ))}
            {typing && (
              <div style={{ display: 'flex', gap: 4, padding: '9px 12px', background: C.bgMuted, borderRadius: '12px 12px 12px 2px', width: 'fit-content' }}>
                {[0, 1, 2].map(i => <div key={i} style={{ width: 5, height: 5, borderRadius: '50%', background: C.textLight, animation: 'pulse 1.2s infinite', animationDelay: `${i * 0.2}s` }} />)}
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Chips */}
          <div style={{ padding: '6px 10px', display: 'flex', gap: 5, overflowX: 'auto', borderTop: `1px solid ${C.border}` }}>
            {CHIPS.map(s => (
              <button key={s} onClick={() => send(s)} style={{ flexShrink: 0, padding: '4px 10px', background: C.bgMuted, border: `1px solid ${C.border}`, borderRadius: 12, fontSize: 11, color: C.textMuted, cursor: 'pointer', whiteSpace: 'nowrap' }}>{s}</button>
            ))}
          </div>

          {/* Input */}
          <div style={{ padding: '8px 10px', borderTop: `1px solid ${C.border}`, display: 'flex', gap: 6 }}>
            <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()} placeholder="Ask a question..." style={{ flex: 1, padding: '8px 12px', border: `1px solid ${C.border}`, borderRadius: 20, fontSize: 12, outline: 'none', fontFamily: 'inherit' }} />
            <button onClick={() => send()} style={{ width: 32, height: 32, borderRadius: '50%', background: C.navyLight, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
          </div>

          {/* CTA */}
          <div style={{ padding: '6px 12px 10px', textAlign: 'center', borderTop: `1px solid ${C.border}` }}>
            <button onClick={onSignup} style={{ fontSize: 12, color: C.accent, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Get covered today →</button>
          </div>
        </div>
      )}
    </>
  );
}

// ─── TERMS, PRIVACY, ABOUT MODALS ───
function TermsContent() {
  return (
    <div style={{ fontFamily: 'Inter, sans-serif' }}>
      {[
        { title: '1. Coverage Scope', text: 'KavachPay provides parametric income protection to registered gig delivery workers for 15 covered disruption events in the worker\'s registered zone during an active policy period.' },
        { title: '2. Exclusions', text: 'Vehicle breakdown, health issues, voluntary absence, disruptions outside the registered zone, and any event not in the covered trigger list are excluded.' },
        { title: '3. Premium and Renewal', text: 'Premiums are charged weekly. Auto-renewal unless paused before renewal date. Non-refundable once week commences.' },
        { title: '4. Claim Verification', text: '5-layer behavioral verification runs on every claim. KavachPay may deny payouts where verification fails or fraud indicators are present.' },
        { title: '5. Payout Speed', text: 'Trusted Workers (750+) receive payouts under 2 minutes. Standard Workers within 2 hours. Under Review workers within 24 hours.' },
        { title: '6. Account Deletion', text: 'Deleted accounts are soft-deleted and retained for 90 days before permanent removal. Policy terminates immediately.' },
        { title: '7. Unique Registration', text: 'One account per Aadhaar, phone number, and Employee ID. Duplicates will be rejected.' },
      ].map((s, i) => (
        <div key={i} style={{ marginBottom: 14 }}>
          <p style={{ color: C.navyLight, fontWeight: 700, fontSize: 13, marginBottom: 5 }}>{s.title}</p>
          <p style={{ color: C.textMuted, fontSize: 13, lineHeight: 1.7 }}>{s.text}</p>
          {i < 6 && <div style={{ borderBottom: `1px solid ${C.border}`, marginTop: 12 }} />}
        </div>
      ))}
    </div>
  );
}

function PrivacyContent() {
  return (
    <div style={{ fontFamily: 'Inter, sans-serif' }}>
      {[
        { title: '1. Information We Collect', text: 'Full name, mobile number, email, age, Aadhaar (last 4 digits stored), employee ID, e-Shram UAN, zone, platform, UPI ID, and GPS location during disruption windows only.' },
        { title: '2. How We Use It', text: 'Exclusively to provide the KavachPay service. No third-party marketing without explicit consent.' },
        { title: '3. Location Data', text: 'GPS collected only during declared disruption windows. Deleted after claim resolution.' },
        { title: '4. Data Retention', text: 'Active accounts: indefinite. Deleted accounts: 90 days before permanent removal.' },
        { title: '5. Your Rights', text: 'Request access, correction, or deletion at any time. Deletion terminates the policy.' },
        { title: '6. Security', text: 'All data encrypted. Access restricted to authorized KavachPay personnel only.' },
      ].map((s, i) => (
        <div key={i} style={{ marginBottom: 14 }}>
          <p style={{ color: C.navyLight, fontWeight: 700, fontSize: 13, marginBottom: 5 }}>{s.title}</p>
          <p style={{ color: C.textMuted, fontSize: 13, lineHeight: 1.7 }}>{s.text}</p>
          {i < 5 && <div style={{ borderBottom: `1px solid ${C.border}`, marginTop: 12 }} />}
        </div>
      ))}
    </div>
  );
}

// ─── MAIN LANDING PAGE ───
function LandingPage({ onNavigate }) {
  const [lang, setLang] = useState('en');
  const [modal, setModal] = useState(null);
  const t = T[lang] || T.en;
  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  return (
    <div style={{ fontFamily: "'Inter', -apple-system, sans-serif", background: C.bg, color: C.text }}>

      {/* Modals */}
      {modal === 'terms' && <Modal title="Terms & Conditions" onClose={() => setModal(null)}><TermsContent /></Modal>}
      {modal === 'privacy' && <Modal title="Privacy Policy" onClose={() => setModal(null)}><PrivacyContent /></Modal>}

      {/* ── NAVBAR ── */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(255,255,255,0.97)', backdropFilter: 'blur(14px)', borderBottom: `1px solid ${C.border}`, padding: '0 48px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 62 }}>
        <KavachLogo size={30} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          {[['why', t.nav.why], ['how', t.nav.how], ['about', t.nav.about]].map(([id, label]) => (
            <button key={id} onClick={() => scrollTo(id)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: C.textMuted, fontWeight: 500, letterSpacing: 0.2, transition: 'color 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.color = C.text}
              onMouseLeave={e => e.currentTarget.style.color = C.textMuted}>
              {label}
            </button>
          ))}

          {/* Lang Toggle */}
          <div style={{ display: 'flex', background: C.bgMuted, borderRadius: 7, padding: 2, border: `1px solid ${C.border}` }}>
            {['en', 'hi', 'ta'].map(l => (
              <button key={l} onClick={() => setLang(l)}
                style={{ border: 'none', borderRadius: 5, padding: '3px 9px', cursor: 'pointer', fontWeight: 600, fontSize: 11, background: lang === l ? '#fff' : 'transparent', color: lang === l ? C.text : C.textLight, boxShadow: lang === l ? '0 1px 3px rgba(0,0,0,0.07)' : 'none', transition: 'all 0.15s' }}>
                {l === 'en' ? 'EN' : l === 'hi' ? 'हि' : 'த'}
              </button>
            ))}
          </div>

          <button onClick={() => onNavigate('login')}
            style={{ background: 'none', border: `1px solid ${C.border}`, borderRadius: 7, padding: '7px 16px', fontSize: 13, fontWeight: 600, color: C.text, cursor: 'pointer', transition: 'border-color 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.borderColor = C.borderMid}
            onMouseLeave={e => e.currentTarget.style.borderColor = C.border}>
            {t.nav.login}
          </button>
          <button onClick={() => onNavigate('adminlogin')}
            style={{ background: 'none', border: `1px solid ${C.border}`, borderRadius: 7, padding: '7px 16px', fontSize: 13, fontWeight: 500, color: C.textMuted, cursor: 'pointer' }}>
            {t.nav.admin}
          </button>
          <button onClick={() => onNavigate('signup')}
            style={{ background: C.navyLight, color: '#fff', border: 'none', borderRadius: 7, padding: '8px 20px', fontWeight: 700, fontSize: 13, cursor: 'pointer', transition: 'opacity 0.2s, transform 0.15s', letterSpacing: 0.2 }}
            onMouseEnter={e => { e.currentTarget.style.opacity = '0.88'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
            onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'translateY(0)'; }}>
            {t.nav.getStarted}
          </button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{ background: `linear-gradient(170deg, ${C.navy} 0%, ${C.navyMid} 100%)`, padding: '120px 48px 100px', position: 'relative', overflow: 'hidden' }}>
        {/* Grid overlay */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)', backgroundSize: '60px 60px', pointerEvents: 'none' }} />
        {/* Glow */}
        <div style={{ position: 'absolute', top: '35%', left: '50%', transform: 'translateX(-50%)', width: 700, height: 350, background: 'radial-gradient(ellipse, rgba(37,99,235,0.07) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', maxWidth: 1100, margin: '0 auto' }}>
          {/* Logo in hero */}
          <div style={{ marginBottom: 48 }}>
            <KavachLogo size={44} light />
          </div>

          {/* Badge */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, border: '1px solid rgba(255,255,255,0.08)', borderRadius: 5, padding: '5px 14px', marginBottom: 28 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: C.success }} />
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', fontWeight: 600, letterSpacing: 1.5, textTransform: 'uppercase' }}>{t.badge}</span>
          </div>

          {/* Headline */}
          <h1 style={{ fontSize: 'clamp(44px, 6vw, 80px)', fontWeight: 900, color: '#fff', lineHeight: 1.02, letterSpacing: -2, marginBottom: 28, maxWidth: 820 }}>
            {t.heroLine1}<br />
            <span style={{ color: 'rgba(255,255,255,0.3)' }}>{t.heroLine2}</span> {t.heroLine3}
          </h1>

          {/* Sub */}
          <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.48)', lineHeight: 1.85, maxWidth: 560, marginBottom: 44, fontWeight: 400 }}>{t.heroSub}</p>

          {/* CTAs */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 72, flexWrap: 'wrap' }}>
            <button onClick={() => onNavigate('signup')}
              style={{ background: '#fff', color: C.navyLight, border: 'none', borderRadius: 8, padding: '14px 32px', fontWeight: 800, fontSize: 15, cursor: 'pointer', transition: 'opacity 0.2s, transform 0.15s', letterSpacing: 0.2 }}
              onMouseEnter={e => { e.currentTarget.style.opacity = '0.92'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'translateY(0)'; }}>
              {t.getCovered}
            </button>
            <button onClick={() => scrollTo('how')}
              style={{ background: 'transparent', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, padding: '14px 24px', fontWeight: 500, fontSize: 15, cursor: 'pointer', transition: 'all 0.15s' }}
              onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; }}>
              {t.seeHow}
            </button>
          </div>

          {/* Stats */}
          <div style={{ display: 'flex', gap: 0, borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 36, width: '100%', flexWrap: 'wrap' }}>
            {t.stats.map((s, i) => (
              <div key={i} style={{ flex: '1 0 140px', padding: '0 32px 0 0', marginBottom: 8 }}>
                <div style={{ fontSize: 28, fontWeight: 900, color: '#fff', letterSpacing: -1 }}>{s.val}</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.38)', marginTop: 4, letterSpacing: 0.6, textTransform: 'uppercase' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── LIVE TICKER ── */}
      <LiveTicker label={t.tickerLabel} />

      {/* ── WHY CHOOSE US ── */}
      <section id="why" style={{ padding: '96px 48px', background: C.bg }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ maxWidth: 600, marginBottom: 64 }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: C.accent, textTransform: 'uppercase', marginBottom: 12 }}>{t.whyLabel}</p>
            <h2 style={{ fontSize: 36, fontWeight: 900, color: C.text, letterSpacing: -0.8, lineHeight: 1.1, marginBottom: 16 }}>{t.whyTitle}</h2>
            <p style={{ fontSize: 15, color: C.textMuted, lineHeight: 1.85 }}>{t.whySub}</p>
          </div>

          {/* 3x2 Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 0, border: `1px solid ${C.border}`, borderRadius: 16, overflow: 'hidden' }}>
            {WHY_ITEMS.map((item, i) => (
              <div key={i} style={{ padding: '36px 32px', background: C.bg, borderRight: (i + 1) % 3 !== 0 ? `1px solid ${C.border}` : 'none', borderBottom: i < 3 ? `1px solid ${C.border}` : 'none', transition: 'background 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.background = C.bgSubtle}
                onMouseLeave={e => e.currentTarget.style.background = C.bg}>
                <div style={{ fontSize: 11, fontWeight: 800, color: C.accent, letterSpacing: 2, marginBottom: 16 }}>{item.number}</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: C.text, marginBottom: 10, letterSpacing: -0.3, lineHeight: 1.3 }}>{item.title}</div>
                <div style={{ fontSize: 13, color: C.textMuted, lineHeight: 1.8 }}>{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div style={{ height: 1, background: C.border }} />

      {/* ── HOW IT WORKS ── */}
      <section id="how" style={{ padding: '96px 48px', background: C.bgSubtle }}>
        <div style={{ maxWidth: 540, margin: '0 auto' }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: C.accent, textTransform: 'uppercase', marginBottom: 12 }}>{t.howLabel}</p>
          <h2 style={{ fontSize: 32, fontWeight: 900, color: C.text, marginBottom: 12, letterSpacing: -0.6, lineHeight: 1.15 }}>{t.howTitle}</h2>
          <p style={{ fontSize: 14, color: C.textMuted, marginBottom: 40, lineHeight: 1.7 }}>{t.howSub}</p>
          <StepRow n="1" text="Sign up and connect your Swiggy or Zomato account. Aadhaar + Employee ID verification takes 2 minutes." />
          <StepRow n="2" text="A qualifying disruption is detected in your delivery zone via live IMD, CPCB, or NDMA government APIs." />
          <StepRow n="3" text="KavachPay runs 5-layer behavioral verification — disruption trigger, zone correlation, GPS inactivity, KavachScore." />
          <StepRow n="4" text="Your payout is credited directly to your UPI. Under 2 minutes for Trusted Workers. No forms. No calls." last />
          <button onClick={() => onNavigate('signup')}
            style={{ marginTop: 36, background: C.navyLight, color: '#fff', border: 'none', borderRadius: 8, padding: '13px 28px', fontWeight: 700, fontSize: 14, cursor: 'pointer', transition: 'opacity 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.87'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
            {t.getProtected}
          </button>
        </div>
      </section>

      <div style={{ height: 1, background: C.border }} />

      {/* ── DISRUPTION COVERAGE ── */}
      <section id="coverage" style={{ padding: '80px 48px', background: C.bg }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ marginBottom: 48 }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: C.accent, textTransform: 'uppercase', marginBottom: 12 }}>{t.coverLabel}</p>
            <h2 style={{ fontSize: 32, fontWeight: 900, color: C.text, letterSpacing: -0.6, marginBottom: 10 }}>{t.coverTitle}</h2>
            <p style={{ fontSize: 14, color: C.textMuted, lineHeight: 1.7 }}>{t.coverSub}</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 0, border: `1px solid ${C.border}`, borderRadius: 12, overflow: 'hidden' }}>
            {ALL_DISRUPTIONS.map((d, i) => (
              <div key={i} style={{ padding: '20px 12px', textAlign: 'center', borderRight: (i + 1) % 5 !== 0 ? `1px solid ${C.border}` : 'none', borderBottom: i < 10 ? `1px solid ${C.border}` : 'none', background: C.bg, transition: 'background 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.background = C.bgSubtle}
                onMouseLeave={e => e.currentTarget.style.background = C.bg}>
                <div style={{ fontSize: 11, fontWeight: 800, color: C.accent, letterSpacing: 1, marginBottom: 6 }}>{d.code}</div>
                <div style={{ fontSize: 11, fontWeight: 600, color: C.text, marginBottom: 4, lineHeight: 1.3 }}>{d.label}</div>
                <div style={{ fontSize: 10, color: C.textLight }}>{d.sub}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 16, display: 'flex', gap: 10 }}>
            <div style={{ padding: '6px 14px', background: C.successLight, border: `1px solid #A7F3D0`, borderRadius: 6, fontSize: 11, fontWeight: 600, color: C.success }}>All verified via IMD</div>
            <div style={{ padding: '6px 14px', background: C.accentLight, border: `1px solid #BFDBFE`, borderRadius: 6, fontSize: 11, fontWeight: 600, color: C.accent }}>CPCB for Air Quality</div>
            <div style={{ padding: '6px 14px', background: '#FFF7ED', border: '1px solid #FED7AA', borderRadius: 6, fontSize: 11, fontWeight: 600, color: '#C2410C' }}>NDMA for Disasters</div>
          </div>
        </div>
      </section>

      <div style={{ height: 1, background: C.border }} />

      {/* ── PLATFORMS ── */}
      <section style={{ padding: '48px 48px', textAlign: 'center', background: C.bgSubtle }}>
        <p style={{ color: C.textLight, fontSize: 10, fontWeight: 700, letterSpacing: 2.5, marginBottom: 20, textTransform: 'uppercase' }}>{t.platformsLabel}</p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
          {[
            { name: 'Swiggy', color: '#EA580C', bg: '#FFF7ED', border: '#FED7AA' },
            { name: 'Zomato', color: '#BE123C', bg: '#FFF1F2', border: '#FECDD3' },
          ].map(p => (
            <div key={p.name} style={{ background: p.bg, border: `1px solid ${p.border}`, borderRadius: 8, padding: '10px 28px', fontWeight: 700, fontSize: 14, color: p.color, letterSpacing: 0.3 }}>{p.name}</div>
          ))}
        </div>
      </section>

      <div style={{ height: 1, background: C.border }} />

      {/* ── CTA STRIP ── */}
      <section style={{ background: `linear-gradient(160deg, ${C.navy}, ${C.navyMid})`, padding: '100px 48px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)', backgroundSize: '60px 60px', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', maxWidth: 640, margin: '0 auto', textAlign: 'center' }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: 'rgba(37,99,235,0.7)', textTransform: 'uppercase', marginBottom: 16 }}>Start Today</p>
          <h2 style={{ fontSize: 38, fontWeight: 900, color: '#fff', marginBottom: 14, letterSpacing: -1, lineHeight: 1.1 }}>{t.ctaTitle}</h2>
          <p style={{ color: 'rgba(255,255,255,0.42)', fontSize: 15, marginBottom: 36, lineHeight: 1.7, maxWidth: 480, margin: '0 auto 36px' }}>{t.ctaSub}</p>
          <button onClick={() => onNavigate('signup')}
            style={{ background: '#fff', color: C.navyLight, border: 'none', borderRadius: 8, padding: '14px 36px', fontWeight: 800, fontSize: 15, cursor: 'pointer', transition: 'opacity 0.2s, transform 0.15s', letterSpacing: 0.2 }}
            onMouseEnter={e => { e.currentTarget.style.opacity = '0.92'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
            onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'translateY(0)'; }}>
            {t.ctaBtn}
          </button>
          <div style={{ marginTop: 16 }}>
            <button onClick={() => onNavigate('login')}
              style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.28)', fontSize: 13, cursor: 'pointer', textDecoration: 'underline' }}>
              {t.alreadyAccount}
            </button>
          </div>
        </div>
      </section>

      {/* ── ABOUT ── */}
      <section id="about" style={{ padding: '96px 48px', background: C.bg, borderTop: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: 760, margin: '0 auto', textAlign: 'center' }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: C.accent, textTransform: 'uppercase', marginBottom: 12 }}>{t.aboutLabel}</p>
          <h2 style={{ fontSize: 32, fontWeight: 900, color: C.text, letterSpacing: -0.6, marginBottom: 16, lineHeight: 1.2 }}>{t.aboutTitle}</h2>
          <p style={{ fontSize: 15, color: C.textMuted, lineHeight: 1.9, maxWidth: 600, margin: '0 auto 52px' }}>{t.aboutSub}</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 56, flexWrap: 'wrap', marginBottom: 44 }}>
            <TeamCard name="Ankith" initial="A" role="Frontend Developer" />
            <TeamCard name="Ashwin" initial="A" role="Backend Developer" />
            <TeamCard name="Madhav" initial="M" role="AI / ML Engineer" />
            <TeamCard name="Kirithic" initial="K" role="Team Leader" />
          </div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: C.bgMuted, border: `1px solid ${C.border}`, borderRadius: 8, padding: '10px 20px', fontSize: 12, color: C.textMuted }}>
            2nd Year · B.Tech · Shiv Nadar University, Chennai
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: C.navy, padding: '36px 48px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14, borderTop: `1px solid rgba(255,255,255,0.06)` }}>
        <KavachLogo size={24} light />
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)' }}>{t.footerTagline}</div>
        <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
          {[['terms', 'Terms'], ['privacy', 'Privacy']].map(([key, label]) => (
            <span key={key} onClick={() => setModal(key)}
              style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', cursor: 'pointer', transition: 'color 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.3)'}>
              {label}
            </span>
          ))}
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)' }}>{t.footerCopy}</span>
        </div>
      </footer>

      <LandingChatbot onSignup={() => onNavigate('signup')} lang={lang} />
    </div>
  );
}

// ─── APP ROUTER ───
export default function App() {
  const [page, setPage] = useState('home');
  const [worker, setWorker] = useState(null);
  const [theme, setTheme] = useState('light');

  const toggleTheme = () => {
    const n = theme === 'light' ? 'dark' : 'light';
    setTheme(n);
    document.documentElement.setAttribute('data-theme', n);
  };

  const navigate = (target, userData = null) => {
    if (userData) setWorker(userData);
    setPage(target);
    window.scrollTo(0, 0);
  };

  const logout = () => { setWorker(null); setPage('home'); };

  if (page === 'home') return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <LandingPage onNavigate={navigate} />
    </ThemeContext.Provider>
  );
  if (page === 'login') return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <Login onLogin={(u) => navigate('dashboard', u)} onSignup={() => navigate('signup')} onBack={() => navigate('home')} />
    </ThemeContext.Provider>
  );
  if (page === 'signup') return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <Signup onComplete={(u) => navigate('dashboard', u)} onBack={() => navigate('login')} />
    </ThemeContext.Provider>
  );
  if (page === 'dashboard') return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <Dashboard worker={worker} setWorker={setWorker} onLogout={logout} />
    </ThemeContext.Provider>
  );
  if (page === 'adminlogin') return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <AdminLogin onLogin={() => navigate('admin')} onBack={() => navigate('home')} />
    </ThemeContext.Provider>
  );
  if (page === 'admin') return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <AdminDashboard onBack={() => navigate('home')} />
    </ThemeContext.Provider>
  );

  return <LandingPage onNavigate={navigate} />;
}