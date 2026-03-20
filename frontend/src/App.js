import React, { useState, createContext, useContext } from 'react';
import Login from './Login';
import AdminLogin from './AdminLogin';
import Signup from './Signup';
import Dashboard from './Dashboard';
import AdminDashboard from './AdminDashboard';
import Chatbot from './Chatbot';

export const ThemeContext = createContext();
export const useTheme = () => useContext(ThemeContext);

const TRANSLATIONS = {
  en: {
    brand: 'KavachPay',
    tagline: "Income Protection for India's Delivery Workers",
    subtitle: 'When rain stops Ravi from delivering, KavachPay pays him before he gets home.',
    pitch: 'Trigger. Verify. Pay. — Parametric insurance for 50 million gig workers.',
    enrollBtn: 'Enroll Now — From ₹49/week',
    demoBtn: 'Admin Demo →',
    adminLogin: 'Admin Login',
    login: 'Login',
    enrollNow: 'Enroll Now',
    stat1: 'Gig workers in India',
    stat2: 'Starting weekly premium',
    stat3: 'Income protected',
    stat4: 'Payout time',
    howTitle: 'How KavachPay Works',
    step1: '1. Enroll', step1desc: 'Verify Aadhaar + Employee ID. Connect your delivery app. Done in 2 minutes.',
    step2: '2. Trigger', step2desc: 'Disruptions detected in your zone automatically via live government APIs.',
    step3: '3. Verify', step3desc: '5-layer behavioral check confirms you actually lost income.',
    step4: '4. Pay', step4desc: 'UPI payout in under 2 minutes. No forms. No calls. No paperwork.',
    coverTitle: 'Disruptions We Cover',
    coverSubtitle: 'KavachPay covers income loss from 13 types of external disruptions — automatically.',
    about: 'About', terms: 'Terms & Conditions', privacy: 'Privacy Policy',
    copyright: '© 2026 KavachPay. All rights reserved.',
    footer: "Built for India's 50 million gig workers.",
  },
  hi: {
    brand: 'KavachPay',
    tagline: 'भारत के डिलीवरी कर्मचारियों के लिए आय सुरक्षा',
    subtitle: 'जब बारिश रवि को डिलीवरी से रोकती है, KavachPay उसे घर पहुंचने से पहले भुगतान करता है।',
    pitch: 'ट्रिगर। सत्यापित करें। भुगतान करें। — 5 करोड़ गिग कर्मचारियों के लिए पैरामेट्रिक बीमा।',
    enrollBtn: 'अभी नामांकन करें — ₹49/सप्ताह से',
    demoBtn: 'एडमिन डेमो →',
    adminLogin: 'एडमिन लॉगिन',
    login: 'लॉगिन',
    enrollNow: 'अभी नामांकन करें',
    stat1: 'भारत में गिग कर्मचारी',
    stat2: 'शुरुआती साप्ताहिक प्रीमियम',
    stat3: 'आय सुरक्षित',
    stat4: 'भुगतान समय',
    howTitle: 'KavachPay कैसे काम करता है',
    step1: '1. नामांकन', step1desc: 'आधार + कर्मचारी ID सत्यापित करें। डिलीवरी ऐप कनेक्ट करें।',
    step2: '2. ट्रिगर', step2desc: 'लाइव सरकारी API से आपके क्षेत्र में व्यवधान का पता चलता है।',
    step3: '3. सत्यापन', step3desc: '5-परत व्यवहार जांच आय हानि की पुष्टि करती है।',
    step4: '4. भुगतान', step4desc: '2 मिनट में UPI भुगतान। कोई फॉर्म नहीं।',
    coverTitle: 'हम किन व्यवधानों को कवर करते हैं',
    coverSubtitle: 'KavachPay 13 प्रकार के बाहरी व्यवधानों से आय हानि को स्वचालित रूप से कवर करता है।',
    about: 'हमारे बारे में', terms: 'नियम और शर्तें', privacy: 'गोपनीयता नीति',
    copyright: '© 2026 KavachPay. सर्वाधिकार सुरक्षित।',
    footer: 'भारत के 5 करोड़ गिग कर्मचारियों के लिए बनाया गया।',
  },
  ta: {
    brand: 'KavachPay',
    tagline: 'இந்தியாவின் டெலிவரி தொழிலாளர்களுக்கான வருமான பாதுகாப்பு',
    subtitle: 'மழை ரவியை டெலிவரி செய்வதிலிருந்து தடுக்கும்போது, KavachPay அவருக்கு வீடு திரும்புவதற்கு முன்பே பணம் செலுத்துகிறது.',
    pitch: 'தூண்டு. சரிபார். செலுத்து. — 5 கோடி கிக் தொழிலாளர்களுக்கான பாரமெட்ரிக் காப்பீடு.',
    enrollBtn: 'இப்போது சேரவும் — ₹49/வாரத்திலிருந்து',
    demoBtn: 'நிர்வாக டெமோ →',
    adminLogin: 'நிர்வாக உள்நுழைவு',
    login: 'உள்நுழைவு',
    enrollNow: 'இப்போது சேரவும்',
    stat1: 'இந்தியாவில் கிக் தொழிலாளர்கள்',
    stat2: 'தொடக்க வாராந்திர பிரீமியம்',
    stat3: 'வருமானம் பாதுகாக்கப்பட்டது',
    stat4: 'பணம் செலுத்தும் நேரம்',
    howTitle: 'KavachPay எவ்வாறு செயல்படுகிறது',
    step1: '1. சேரவும்', step1desc: 'ஆதார் + ஊழியர் ID சரிபார்க்கவும். டெலிவரி ஆப்பை இணைக்கவும்.',
    step2: '2. தூண்டல்', step2desc: 'நேரடி அரசு APIகள் மூலம் உங்கள் மண்டலத்தில் இடையூறுகள் கண்டறியப்படும்.',
    step3: '3. சரிபார்ப்பு', step3desc: '5 அடுக்கு நடத்தை சரிபார்ப்பு வருமான இழப்பை உறுதிப்படுத்துகிறது.',
    step4: '4. செலுத்துகை', step4desc: '2 நிமிடங்களில் UPI பணம். படிவங்கள் இல்லை.',
    coverTitle: 'நாங்கள் கவர் செய்யும் இடையூறுகள்',
    coverSubtitle: 'KavachPay 13 வகையான வெளிப்புற இடையூறுகளிலிருந்து வருமான இழப்பை தானாக கவர் செய்கிறது.',
    about: 'எங்களைப் பற்றி', terms: 'விதிமுறைகள்', privacy: 'தனியுரிமை கொள்கை',
    copyright: '© 2026 KavachPay. அனைத்து உரிமைகளும் பாதுகாக்கப்பட்டவை.',
    footer: 'இந்தியாவின் 5 கோடி கிக் தொழிலாளர்களுக்காக கட்டமைக்கப்பட்டது.',
  }
};

const ALL_DISRUPTIONS = [
  { code: 'HRA', label: 'Heavy Rain', labelHi: 'भारी बारिश', labelTa: 'கனமழை', sub: '>100mm/hr', icon: '🌧️' },
  { code: 'MRA', label: 'Moderate Rain', labelHi: 'मध्यम बारिश', labelTa: 'மிதமான மழை', sub: '50–99mm/hr', icon: '🌦️' },
  { code: 'LRA', label: 'Light Rain', labelHi: 'हल्की बारिश', labelTa: 'இலகு மழை', sub: '25–49mm/hr', icon: '🌂' },
  { code: 'SAQ', label: 'Severe AQI', labelHi: 'गंभीर AQI', labelTa: 'கடுமையான AQI', sub: 'AQI >300', icon: '😷' },
  { code: 'MAQ', label: 'Moderate AQI', labelHi: 'मध्यम AQI', labelTa: 'நடுத்தர AQI', sub: 'AQI 200–299', icon: '🌫️' },
  { code: 'STM', label: 'Storm', labelHi: 'तूफान', labelTa: 'புயல்', sub: 'Wind >60kmh', icon: '⛈️' },
  { code: 'FLD', label: 'Flood', labelHi: 'बाढ़', labelTa: 'வெள்ளம்', sub: 'NDMA Alert', icon: '🌊' },
  { code: 'CRF', label: 'Curfew', labelHi: 'कर्फ्यू', labelTa: 'ஊரடங்கு', sub: 'Govt Order', icon: '🚫' },
  { code: 'EQK', label: 'Earthquake', labelHi: 'भूकंप', labelTa: 'நிலநடுக்கம்', sub: 'M>4.0', icon: '🏚️' },
  { code: 'LDS', label: 'Landslide', labelHi: 'भूस्खलन', labelTa: 'நிலச்சரிவு', sub: 'IMD Alert', icon: '⛰️' },
  { code: 'HTV', label: 'Heatwave', labelHi: 'लू', labelTa: 'வெப்ப அலை', sub: '>45°C', icon: '🌡️' },
  { code: 'FOG', label: 'Dense Fog', labelHi: 'घना कोहरा', labelTa: 'அடர்த்தியான பனிமூட்டம்', sub: 'Vis <50m', icon: '🌁' },
  { code: 'WND', label: 'High Wind', labelHi: 'तेज हवा', labelTa: 'கடும் காற்று', sub: 'Wind >80kmh', icon: '💨' },
];

const Modal = ({ title, onClose, children }) => (
  <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
    <div className="modal-content">
      <div style={{ backgroundColor: '#1A56A0', padding: '18px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <p style={{ color: 'white', fontWeight: '700', fontSize: '16px', fontFamily: 'Inter' }}>{title}</p>
        <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', width: '28px', height: '28px', borderRadius: '50%', cursor: 'pointer', fontSize: '14px' }}>✕</button>
      </div>
      <div style={{ overflowY: 'auto', padding: '24px' }}>{children}</div>
    </div>
  </div>
);

const AboutContent = () => (
  <div style={{ fontFamily: 'Inter' }}>
    <div style={{ backgroundColor: '#EEF4FF', borderRadius: '12px', padding: '20px', marginBottom: '20px', border: '1px solid #DBEAFE' }}>
      <p style={{ color: '#1A56A0', fontWeight: '700', fontSize: '16px', marginBottom: '8px' }}>Our Mission</p>
      <p style={{ color: '#374151', fontSize: '14px', lineHeight: 1.7 }}>
        KavachPay exists to solve a problem that affects millions of people in India every monsoon season — gig delivery workers who lose their income when weather disrupts their ability to work, with no safety net to fall back on. We believe that parametric insurance, powered by real-time government data and behavioral verification, can change that.
      </p>
    </div>
    <div style={{ marginBottom: '20px' }}>
      <p style={{ color: '#374151', fontWeight: '700', fontSize: '15px', marginBottom: '10px' }}>How KavachPay Started</p>
      <p style={{ color: '#555', fontSize: '14px', lineHeight: 1.7, marginBottom: '10px' }}>
        KavachPay started as a question: why do delivery workers — the people who bring us food in a storm — have no protection when that same storm stops them from earning?
      </p>
      <p style={{ color: '#555', fontSize: '14px', lineHeight: 1.7, marginBottom: '10px' }}>
        Four students at Shiv Nadar University Chennai — Ankith, Ashwin, Madhav, and Kirithic — decided to build a real answer to that question. Coming from computer science and engineering backgrounds, they combined their knowledge of real-time data systems, behavioral verification, and financial products to design KavachPay from scratch.
      </p>
      <p style={{ color: '#555', fontSize: '14px', lineHeight: 1.7 }}>
        The core insight was simple: instead of making workers file claims and wait weeks, why not use live government weather data to trigger payments automatically — and use behavioral patterns to verify that the worker actually lost income? That is what KavachPay does. Trigger. Verify. Pay.
      </p>
    </div>
    <div style={{ backgroundColor: '#F9FAFB', borderRadius: '12px', padding: '20px', marginBottom: '20px', border: '1px solid #E5E7EB' }}>
      <p style={{ color: '#374151', fontWeight: '700', fontSize: '15px', marginBottom: '14px' }}>The Founding Team</p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        {[
          { name: 'Ankith', role: 'Frontend & Product' },
          { name: 'Ashwin', role: 'Backend & Infrastructure' },
          { name: 'Madhav', role: 'Data & Risk Modelling' },
          { name: 'Kirithic', role: 'Documentation & Strategy' },
        ].map((f, i) => (
          <div key={i} style={{ backgroundColor: 'white', borderRadius: '10px', padding: '14px', border: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '50%', backgroundColor: '#1A56A0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <p style={{ color: 'white', fontWeight: '700', fontSize: '14px' }}>{f.name[0]}</p>
            </div>
            <div>
              <p style={{ color: '#374151', fontWeight: '700', fontSize: '13px' }}>{f.name}</p>
              <p style={{ color: '#9CA3AF', fontSize: '11px', marginTop: '2px' }}>{f.role}</p>
            </div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: '12px', backgroundColor: '#EEF4FF', borderRadius: '8px', padding: '10px 14px', border: '1px solid #DBEAFE' }}>
        <p style={{ color: '#1A56A0', fontSize: '12px', fontWeight: '600' }}>B.Tech 2nd Year Students — Shiv Nadar University Chennai</p>
      </div>
    </div>
    <div style={{ backgroundColor: '#F0FDF4', borderRadius: '12px', padding: '16px', border: '1px solid #BBF7D0' }}>
      <p style={{ color: '#1E7D34', fontSize: '13px', lineHeight: 1.6 }}>
        KavachPay is currently a working prototype. We are actively developing the full product and looking to partner with platforms like Swiggy and Zomato to bring this to the 50 million gig workers who need it.
      </p>
    </div>
  </div>
);

const TermsContent = () => (
  <div style={{ fontFamily: 'Inter' }}>
    {[
      { title: '1. Coverage Scope', text: 'KavachPay provides parametric income protection insurance to registered gig delivery workers. Coverage applies to income loss resulting from 13 covered disruption events occurring within the worker\'s registered delivery zone during an active policy period. Covered events include heavy rain, moderate rain, light rain, severe AQI, moderate AQI, storm, flood, curfew, earthquake, landslide, heatwave, dense fog, and high wind.' },
      { title: '2. Exclusions', text: 'KavachPay does not cover income loss from vehicle breakdown, personal health issues, voluntary absence, disruptions outside the registered zone, or any event not listed as a covered trigger. Claims are not payable if the worker was actively completing deliveries during the disruption window as verified by the behavioral verification system.' },
      { title: '3. Premium and Renewal', text: 'Premiums are charged weekly based on zone risk, age, platform, and tenure. Premiums are non-refundable once a policy week commences. Policies auto-renew weekly unless paused before the renewal date.' },
      { title: '4. Claim Verification', text: 'All payouts are subject to 5-layer behavioral verification — work intent, activity check, zone correlation, self declaration, and KavachScore assessment. KavachPay reserves the right to deny payouts where verification fails or fraud indicators are present.' },
      { title: '5. Payout', text: 'Approved payouts are transferred to the registered UPI ID within 2 minutes for Trusted Workers (score 750+), within 2 hours for Standard Workers (500-749), and within 24 hours for workers under review (below 500).' },
      { title: '6. KavachScore', text: 'KavachScore is an internal trust metric used for claim assessment and payout speed. It is not a financial credit score and has no legal standing outside KavachPay.' },
      { title: '7. Referral Program', text: 'Each referral code is single-use. Successful referrals result in a ₹10 premium discount on the referring worker\'s next renewal. KavachPay may modify or discontinue this program at any time.' },
      { title: '8. Amendments', text: 'KavachPay reserves the right to modify these terms at any time. Continued use constitutes acceptance of updated terms.' },
    ].map((s, i) => (
      <div key={i} style={{ marginBottom: '16px' }}>
        <p style={{ color: '#1A56A0', fontWeight: '700', fontSize: '13px', marginBottom: '6px' }}>{s.title}</p>
        <p style={{ color: '#555', fontSize: '13px', lineHeight: 1.7 }}>{s.text}</p>
        {i < 7 && <div style={{ borderBottom: '1px solid #F3F4F6', marginTop: '14px' }} />}
      </div>
    ))}
  </div>
);

const PrivacyContent = () => (
  <div style={{ fontFamily: 'Inter' }}>
    {[
      { title: '1. Information We Collect', text: 'KavachPay collects full name, mobile number, email address, age, Aadhaar number (last 4 digits stored only), employee ID, e-Shram UAN (optional), delivery zone, platform, and UPI ID. We also collect GPS location data during disruption windows only, with explicit user consent.' },
      { title: '2. How We Use Your Information', text: 'Your information is used exclusively to provide the KavachPay service — verifying identity, calculating premium, processing policy, verifying claims, and transferring payouts. We do not use your information for third-party marketing without explicit consent.' },
      { title: '3. Aadhaar Data', text: 'We use Aadhaar strictly for identity verification. We store only the last 4 digits. Full Aadhaar numbers are used for verification only and are not retained.' },
      { title: '4. Location Data', text: 'GPS location data is collected only during declared disruption windows to verify worker inactivity. It is not collected continuously. Location data is deleted after claim resolution.' },
      { title: '5. Data Sharing', text: 'We do not sell personal data. Anonymized aggregate data may be shared with research partners. Individual worker data is never shared in identifiable form.' },
      { title: '6. Data Security', text: 'All data is encrypted using industry-standard practices. Access is restricted to authorized KavachPay personnel only.' },
      { title: '7. Your Rights', text: 'You may request access, correction, or deletion of your data at any time. Deletion will result in policy termination.' },
    ].map((s, i) => (
      <div key={i} style={{ marginBottom: '16px' }}>
        <p style={{ color: '#1A56A0', fontWeight: '700', fontSize: '13px', marginBottom: '6px' }}>{s.title}</p>
        <p style={{ color: '#555', fontSize: '13px', lineHeight: 1.7 }}>{s.text}</p>
        {i < 6 && <div style={{ borderBottom: '1px solid #F3F4F6', marginTop: '14px' }} />}
      </div>
    ))}
  </div>
);

export default function App() {
  const [page, setPage] = useState('home');
  const [worker, setWorker] = useState(null);
  const [showChat, setShowChat] = useState(false);
  const [lang, setLang] = useState('en');
  const [modal, setModal] = useState(null);
  const [theme, setTheme] = useState('light');

  const t = TRANSLATIONS[lang];

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const langOptions = [
    { code: 'en', label: 'EN' },
    { code: 'hi', label: 'हि' },
    { code: 'ta', label: 'த' },
  ];

  const getDisruptionLabel = (d) => {
    if (lang === 'hi') return d.labelHi;
    if (lang === 'ta') return d.labelTa;
    return d.label;
  };

  if (page === 'login') return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <Login
        onLogin={(data) => { setWorker(data); setPage('dashboard'); }}
        onBack={() => setPage('home')}
        onSignup={() => setPage('signup')}
        lang={lang} setLang={setLang}
      />
    </ThemeContext.Provider>
  );

  if (page === 'signup') return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <Signup
        onComplete={(data) => { setWorker(data); setPage('dashboard'); }}
        onBack={() => setPage('login')}
        lang={lang} setLang={setLang}
      />
    </ThemeContext.Provider>
  );

  if (page === 'dashboard') return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <Dashboard
        worker={worker}
        onLogout={() => { setWorker(null); setPage('home'); }}
        lang={lang} setLang={setLang}
      />
    </ThemeContext.Provider>
  );

  if (page === 'adminlogin') return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <AdminLogin
        onLogin={() => setPage('admin')}
        onBack={() => setPage('home')}
        lang={lang} setLang={setLang}
      />
    </ThemeContext.Provider>
  );

  if (page === 'admin') return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <AdminDashboard onBack={() => setPage('home')} />
    </ThemeContext.Provider>
  );

  // LANDING PAGE — always KavachPay blue, never dark mode
  return (
    <div style={{ backgroundColor: '#1A56A0', minHeight: '100vh', color: 'white', fontFamily: 'Inter', position: 'relative' }}>

      {modal === 'about' && <Modal title="About KavachPay" onClose={() => setModal(null)}><AboutContent /></Modal>}
      {modal === 'terms' && <Modal title="Terms & Conditions" onClose={() => setModal(null)}><TermsContent /></Modal>}
      {modal === 'privacy' && <Modal title="Privacy Policy" onClose={() => setModal(null)}><PrivacyContent /></Modal>}

      {/* Navbar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '18px 40px', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
          </div>
          <h1 style={{ fontSize: '20px', fontWeight: '800', letterSpacing: '-0.3px', color: 'white' }}>{t.brand}</h1>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <div style={{ display: 'flex', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '20px', padding: '3px', gap: '2px' }}>
            {langOptions.map(l => (
              <button key={l.code} onClick={() => setLang(l.code)}
                style={{ backgroundColor: lang === l.code ? 'white' : 'transparent', color: lang === l.code ? '#1A56A0' : 'white', border: 'none', padding: '5px 12px', borderRadius: '16px', cursor: 'pointer', fontSize: '12px', fontWeight: '700' }}>
                {l.label}
              </button>
            ))}
          </div>
          <button onClick={() => setPage('adminlogin')}
            style={{ backgroundColor: 'transparent', color: 'white', padding: '8px 16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.4)', fontWeight: '600', cursor: 'pointer', fontSize: '13px' }}>
            {t.adminLogin}
          </button>
          <button onClick={() => setPage('login')}
            style={{ backgroundColor: 'transparent', color: 'white', padding: '8px 16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.4)', fontWeight: '600', cursor: 'pointer', fontSize: '13px' }}>
            {t.login}
          </button>
          <button onClick={() => setPage('signup')}
            style={{ backgroundColor: 'white', color: '#1A56A0', padding: '8px 18px', borderRadius: '8px', border: 'none', fontWeight: '700', cursor: 'pointer', fontSize: '13px' }}>
            {t.enrollNow}
          </button>
        </div>
      </div>

      {/* Hero */}
      <div style={{ textAlign: 'center', padding: '80px 20px 40px' }} className="fade-in">
        <div style={{ display: 'inline-block', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '20px', padding: '6px 16px', marginBottom: '20px', border: '1px solid rgba(255,255,255,0.2)' }}>
          <p style={{ fontSize: '12px', fontWeight: '600', letterSpacing: '1px', opacity: 0.9 }}>PARAMETRIC INCOME INSURANCE • INDIA</p>
        </div>
        <h2 style={{ fontSize: '52px', fontWeight: '800', marginBottom: '20px', lineHeight: 1.15, letterSpacing: '-1px', color: 'white' }}>
          {t.tagline}
        </h2>
        <p style={{ fontSize: '20px', opacity: 0.85, marginBottom: '12px', fontWeight: '400' }}>{t.subtitle}</p>
        <p style={{ fontSize: '14px', opacity: 0.6, marginBottom: '40px', letterSpacing: '0.3px' }}>{t.pitch}</p>
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => setPage('signup')}
            style={{ backgroundColor: '#F0A500', color: 'white', padding: '16px 44px', borderRadius: '10px', border: 'none', fontSize: '17px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 20px rgba(240,165,0,0.4)' }}>
            {t.enrollBtn}
          </button>
          <button onClick={() => setPage('adminlogin')}
            style={{ backgroundColor: 'transparent', color: 'white', padding: '16px 44px', borderRadius: '10px', border: '2px solid rgba(255,255,255,0.6)', fontSize: '17px', fontWeight: '700', cursor: 'pointer' }}>
            {t.demoBtn}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '60px', padding: '32px 20px', borderTop: '1px solid rgba(255,255,255,0.1)', borderBottom: '1px solid rgba(255,255,255,0.1)', flexWrap: 'wrap' }}>
        {[
          { num: '50M+', label: t.stat1 },
          { num: '₹49', label: t.stat2 },
          { num: '65%', label: t.stat3 },
          { num: '<2 min', label: t.stat4 },
        ].map((s, i) => (
          <div key={i} style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '30px', fontWeight: '800', color: '#F0A500', letterSpacing: '-0.5px' }}>{s.num}</p>
            <p style={{ fontSize: '13px', opacity: 0.65, marginTop: '4px' }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* How it works */}
      <div style={{ padding: '60px 20px', textAlign: 'center' }}>
        <h3 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '8px', color: 'white' }}>{t.howTitle}</h3>
        <p style={{ opacity: 0.6, fontSize: '14px', marginBottom: '40px' }}>Simple. Automatic. Fast.</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap' }}>
          {[
            { step: t.step1, desc: t.step1desc, icon: '📋', num: '01' },
            { step: t.step2, desc: t.step2desc, icon: '⚡', num: '02' },
            { step: t.step3, desc: t.step3desc, icon: '🔍', num: '03' },
            { step: t.step4, desc: t.step4desc, icon: '💸', num: '04' },
          ].map((item, i) => (
            <div key={i} style={{ backgroundColor: 'rgba(255,255,255,0.08)', padding: '28px 20px', borderRadius: '16px', width: '200px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)' }}>
              <p style={{ fontSize: '11px', fontWeight: '700', opacity: 0.4, letterSpacing: '1px', marginBottom: '12px' }}>{item.num}</p>
              <div style={{ fontSize: '32px', marginBottom: '12px' }}>{item.icon}</div>
              <h4 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '8px', color: 'white' }}>{item.step}</h4>
              <p style={{ opacity: 0.7, fontSize: '13px', lineHeight: 1.6 }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* All 13 Disruptions */}
      <div style={{ padding: '0 20px 60px', textAlign: 'center' }}>
        <h3 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '8px', color: 'white' }}>{t.coverTitle}</h3>
        <p style={{ opacity: 0.6, marginBottom: '32px', fontSize: '14px' }}>{t.coverSubtitle}</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap', maxWidth: '800px', margin: '0 auto' }}>
          {ALL_DISRUPTIONS.map((d, i) => (
            <div key={i} style={{ backgroundColor: 'rgba(255,255,255,0.08)', padding: '16px 14px', borderRadius: '14px', width: '110px', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)' }}>
              <div style={{ fontSize: '26px', marginBottom: '8px' }}>{d.icon}</div>
              <p style={{ fontSize: '11px', fontWeight: '700', marginBottom: '4px', color: 'white' }}>{getDisruptionLabel(d)}</p>
              <p style={{ fontSize: '10px', opacity: 0.55 }}>{d.sub}</p>
              <div style={{ backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '4px', padding: '2px 6px', marginTop: '6px', display: 'inline-block' }}>
                <p style={{ fontSize: '9px', fontWeight: '700', opacity: 0.8, letterSpacing: '0.5px' }}>{d.code}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', padding: '28px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <p style={{ fontWeight: '800', fontSize: '16px', marginBottom: '4px', color: 'white' }}>{t.brand}</p>
          <p style={{ opacity: 0.5, fontSize: '12px' }}>{t.footer}</p>
        </div>
        <div style={{ display: 'flex', gap: '24px', alignItems: 'center', flexWrap: 'wrap' }}>
          {[
            { label: t.about, key: 'about' },
            { label: t.terms, key: 'terms' },
            { label: t.privacy, key: 'privacy' },
          ].map(item => (
            <span key={item.key} onClick={() => setModal(item.key)}
              style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', cursor: 'pointer', textDecoration: 'underline' }}>
              {item.label}
            </span>
          ))}
        </div>
        <p style={{ opacity: 0.4, fontSize: '12px' }}>{t.copyright}</p>
      </div>

      {/* Chatbot */}
      <button onClick={() => setShowChat(prev => !prev)}
        style={{ position: 'fixed', bottom: '30px', right: '30px', backgroundColor: '#F0A500', color: 'white', width: '56px', height: '56px', borderRadius: '50%', border: 'none', cursor: 'pointer', boxShadow: '0 4px 20px rgba(240,165,0,0.4)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
      </button>
      {showChat && <Chatbot onClose={() => setShowChat(false)} lang={lang} />}
    </div>
  );
}