import React, { useState, useEffect, useRef } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts';
import Policy from './Policy';
import Claims from './Claims';
import Chatbot from './Chatbot';
import Forum from './Forum';
import { useTheme, KavachLogo } from './App';

// ─── API CONFIG ───
const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// ─── API CALLS (Person 2 — uncomment when backend ready) ───
const api = {
    // TODO: BACKEND — get worker profile
    getWorker: async (workerId) => {
        return await fetch(`${API_BASE}/api/workers/${workerId}`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }).then(r => r.json());
    },
    updateProfile: async (workerId, data) => {
        return await fetch(`${API_BASE}/api/workers/${workerId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
          body: JSON.stringify(data)
        }).then(r => r.json());
    },
    updateZone: async (workerId, newZone) => {
        return await fetch(`${API_BASE}/api/workers/${workerId}/zone`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
          body: JSON.stringify({ zone: newZone })
        }).then(r => r.json());
    },
    deleteAccount: async (workerId) => {
        return await fetch(`${API_BASE}/api/workers/${workerId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }).then(r => r.json());
    },
    uploadPhoto: async (workerId, file) => {
        const formData = new FormData();
        formData.append('photo', file);
        return await fetch(`${API_BASE}/api/workers/${workerId}/photo`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
          body: formData
        }).then(r => r.json());
    },
    getWorkerStats: async (workerId) => {
        return await fetch(`${API_BASE}/api/workers/${workerId}/stats`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }).then(r => r.json());
    },
    getWorkerWeeklyIncome: async (workerId) => {
        return await fetch(`${API_BASE}/api/workers/${workerId}/weekly-income`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }).then(r => r.json());
    },
    createClaim: async (data) => {
        return await fetch(`${API_BASE}/api/claims/create`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
            body: JSON.stringify(data)
        }).then(r => r.json());
    }
};

// ─── DESIGN TOKENS ───
const C = {
    accent: '#1A3A5C',
    accentLight: '#F0F4F8',
    accentBorder: '#D1E0EE',
    navy: '#08101F',
    bg: '#F9FAFB',
    cardBg: '#FFFFFF',
    cardBorder: '#D6E4FF',
    text: '#111827',
    textSec: '#374151',
    textMuted: '#6B7280',
    green: '#2E7D52',
    success: '#2E7D52',
    greenLight: '#E8F5EE',
    greenBorder: '#A8D5BC',
    orange: '#C05C1A',
    orangeLight: '#FFF0E6',
    orangeBorder: '#FFCBA4',
    red: '#B91C1C',
    redLight: '#FEF0F0',
    redBorder: '#FECACA',
    purple: '#6D28D9',
    purpleLight: '#F3EEFF',
    purpleBorder: '#DDD6FE',
};

const T = {
    en: {
        brand: 'KavachPay',
        home: 'Home', earnings: 'Earnings', score: 'Score',
        alerts: 'Alerts', forum: 'Forum',
        activePolicy: 'Active Policy', active: 'ACTIVE', paused: 'PAUSED',
        weeklyCoverage: 'Weekly Coverage', premium: 'Weekly Premium',
        avgIncome: 'Avg Weekly Income', avgDeliveries: 'Avg Daily Deliveries',
        myPolicy: 'My Policy', myClaims: 'My Claims',
        loanTitle: 'Instant Loan — Powered by KavachScore',
        loanSub: 'No CIBIL required. Based entirely on your KavachScore.',
        loanQualify: 'You qualify for up to',
        loanBtn: 'View Loan Offers',
        loanLow: 'Improve your KavachScore to unlock loan offers.',
        loanPartner: 'In partnership with KreditBee, MoneyTap & CashE',
        referralTitle: 'Your Referral Code',
        referralSub: 'Share with a friend — they enroll, you get ₹10 off next renewal',
        referralCopy: 'Copy', referralCopied: 'Copied!',
        referralUsed: 'Referrals made', referralSaved: 'Total saved',
        earningsTitle: 'Income Protection',
        earningsSub: "This week's earnings vs weekly average",
        earnedSoFar: 'Earned so far',
        kavachCovers: 'KavachPay covers',
        kavachCoversSub: 'if disruption hits today',
        disruptionHistory: 'Disruption History',
        scoreGoesUp: 'Score Goes Up', scoreGoesDown: 'Score Goes Down',
        scoreTimeline: 'Score Timeline',
        allNotifs: 'All Notifications', unread: 'unread',
        profileTitle: 'My Profile',
        profileAccount: 'Account Details',
        profilePolicy: 'Policy Info',
        profileSettings: 'Settings',
        darkMode: 'Dark Mode', lightMode: 'Light Mode',
        signOut: 'Sign Out',
        editProfile: 'Edit Profile',
        saveChanges: 'Save Changes',
        cancelEdit: 'Cancel',
        photoChange: 'Change Photo',
        resignTitle: 'Close Account',
        resignSub: 'Your data will be retained for 90 days then permanently deleted.',
        resignBtn: 'Close My Account',
        resignConfirm: 'Are you absolutely sure?',
        resignConfirmSub: 'This will deactivate your policy immediately. Type DELETE to confirm.',
        resignFinal: 'Yes, Close Account',
        zoneUpdateTitle: 'Zone Updated',
        zoneUpdateMsg: 'Based on your last 5 days of delivery activity, your zone has been automatically updated to',
        zoneUpdateAccept: 'Accept Update',
        zoneUpdateIgnore: 'Keep Current Zone',
        eshramBadge: 'e-Shram', employerBadge: 'Employer Sponsored',
        paid: 'Paid', notPaid: 'Not enrolled',
        weeklyChart: 'Weekly Earnings vs Coverage',
    },
    hi: {
        brand: 'KavachPay',
        home: 'होम', earnings: 'कमाई', score: 'स्कोर',
        alerts: 'अलर्ट', forum: 'फोरम',
        activePolicy: 'सक्रिय पॉलिसी', active: 'सक्रिय', paused: 'रुकी हुई',
        weeklyCoverage: 'साप्ताहिक कवरेज', premium: 'साप्ताहिक प्रीमियम',
        avgIncome: 'औसत साप्ताहिक आय', avgDeliveries: 'औसत दैनिक डिलीवरी',
        myPolicy: 'मेरी पॉलिसी', myClaims: 'मेरे दावे',
        loanTitle: 'तत्काल ऋण — KavachScore द्वारा',
        loanSub: 'CIBIL की जरूरत नहीं। KavachScore पर आधारित।',
        loanQualify: 'आप तक के लिए योग्य हैं',
        loanBtn: 'ऋण ऑफर देखें',
        loanLow: 'ऋण ऑफर के लिए KavachScore सुधारें।',
        loanPartner: 'KreditBee, MoneyTap & CashE के साथ',
        referralTitle: 'आपका रेफरल कोड',
        referralSub: 'मित्र के साथ साझा करें — नामांकन पर ₹10 छूट',
        referralCopy: 'कॉपी', referralCopied: 'कॉपी हो गया!',
        referralUsed: 'रेफरल', referralSaved: 'कुल बचत',
        earningsTitle: 'आय सुरक्षा',
        earningsSub: 'इस सप्ताह की कमाई बनाम साप्ताहिक औसत',
        earnedSoFar: 'अब तक कमाया',
        kavachCovers: 'KavachPay कवर करता है',
        kavachCoversSub: 'आज व्यवधान होने पर',
        disruptionHistory: 'व्यवधान इतिहास',
        scoreGoesUp: 'स्कोर कैसे बढ़ता है', scoreGoesDown: 'स्कोर कैसे घटता है',
        scoreTimeline: 'स्कोर टाइमलाइन',
        allNotifs: 'सभी सूचनाएं', unread: 'अपठित',
        profileTitle: 'मेरी प्रोफ़ाइल',
        profileAccount: 'खाता विवरण',
        profilePolicy: 'पॉलिसी जानकारी',
        profileSettings: 'सेटिंग्स',
        darkMode: 'डार्क मोड', lightMode: 'लाइट मोड',
        signOut: 'साइन आउट',
        editProfile: 'प्रोफ़ाइल संपादित करें',
        saveChanges: 'परिवर्तन सहेजें',
        cancelEdit: 'रद्द करें',
        photoChange: 'फ़ोटो बदलें',
        resignTitle: 'खाता बंद करें',
        resignSub: 'आपका डेटा 90 दिनों के लिए रखा जाएगा फिर हटा दिया जाएगा।',
        resignBtn: 'मेरा खाता बंद करें',
        resignConfirm: 'क्या आप बिल्कुल सुनिश्चित हैं?',
        resignConfirmSub: 'पुष्टि के लिए DELETE टाइप करें।',
        resignFinal: 'हां, खाता बंद करें',
        zoneUpdateTitle: 'क्षेत्र अपडेट',
        zoneUpdateMsg: 'पिछले 5 दिनों की डिलीवरी गतिविधि के आधार पर, आपका क्षेत्र स्वचालित रूप से अपडेट किया गया है',
        zoneUpdateAccept: 'अपडेट स्वीकार करें',
        zoneUpdateIgnore: 'वर्तमान क्षेत्र रखें',
        eshramBadge: 'e-Shram', employerBadge: 'नियोक्ता प्रायोजित',
        paid: 'भुगतान', notPaid: 'नामांकित नहीं',
        weeklyChart: 'साप्ताहिक कमाई बनाम कवरेज',
    },
    ta: {
        brand: 'KavachPay',
        home: 'முகப்பு', earnings: 'வருமானம்', score: 'ஸ்கோர்',
        alerts: 'எச்சரிக்கைகள்', forum: 'பேச்சரங்கம்',
        activePolicy: 'செயலில் பாலிசி', active: 'செயலில்', paused: 'இடைநிறுத்தம்',
        weeklyCoverage: 'வாராந்திர கவரேஜ்', premium: 'வாராந்திர பிரீமியம்',
        avgIncome: 'சராசரி வாராந்திர வருமானம்', avgDeliveries: 'சராசரி தினசரி டெலிவரி',
        myPolicy: 'என் பாலிசி', myClaims: 'என் கோரிக்கைகள்',
        loanTitle: 'உடனடி கடன் — KavachScore அடிப்படையில்',
        loanSub: 'CIBIL தேவையில்லை. KavachScore மட்டும்.',
        loanQualify: 'நீங்கள் தகுதி பெறுகிறீர்கள்',
        loanBtn: 'கடன் சலுகைகள் காண',
        loanLow: 'கடன் சலுகைகளை திறக்க KavachScore மேம்படுத்தவும்.',
        loanPartner: 'KreditBee, MoneyTap & CashE உடன்',
        referralTitle: 'உங்கள் பரிந்துரை குறியீடு',
        referralSub: 'நண்பருடன் பகிரவும் — சேர்ந்தால் ₹10 தள்ளுபடி',
        referralCopy: 'நகல்', referralCopied: 'நகலெடுக்கப்பட்டது!',
        referralUsed: 'பரிந்துரைகள்', referralSaved: 'மொத்த சேமிப்பு',
        earningsTitle: 'வருமான பாதுகாப்பு',
        earningsSub: 'இந்த வாரத்தின் வருமானம் vs சராசரி',
        earnedSoFar: 'இதுவரை சம்பாதித்தது',
        kavachCovers: 'KavachPay கவர் செய்கிறது',
        kavachCoversSub: 'இன்று இடையூறு ஏற்பட்டால்',
        disruptionHistory: 'இடையூறு வரலாறு',
        scoreGoesUp: 'ஸ்கோர் உயரும்', scoreGoesDown: 'ஸ்கோர் குறையும்',
        scoreTimeline: 'ஸ்கோர் காலவரிசை',
        allNotifs: 'அனைத்து அறிவிப்புகள்', unread: 'படிக்காதவை',
        profileTitle: 'என் சுயவிவரம்',
        profileAccount: 'கணக்கு விவரங்கள்',
        profilePolicy: 'பாலிசி தகவல்',
        profileSettings: 'அமைப்புகள்',
        darkMode: 'இருண்ட பயன்முறை', lightMode: 'ஒளி பயன்முறை',
        signOut: 'வெளியேறு',
        editProfile: 'சுயவிவரம் திருத்து',
        saveChanges: 'மாற்றங்களை சேமி',
        cancelEdit: 'ரத்து செய்',
        photoChange: 'புகைப்படம் மாற்று',
        resignTitle: 'கணக்கை மூடு',
        resignSub: 'உங்கள் தரவு 90 நாட்கள் வைக்கப்படும் பின்னர் நிரந்தரமாக நீக்கப்படும்.',
        resignBtn: 'என் கணக்கை மூடு',
        resignConfirm: 'நிச்சயமாக உறுதியா?',
        resignConfirmSub: 'உறுதிப்படுத்த DELETE என்று தட்டச்சு செய்யவும்.',
        resignFinal: 'ஆம், கணக்கை மூடு',
        zoneUpdateTitle: 'மண்டலம் புதுப்பிக்கப்பட்டது',
        zoneUpdateMsg: 'கடந்த 5 நாட்கள் டெலிவரி செயல்பாட்டின் அடிப்படையில், உங்கள் மண்டலம் தானாக புதுப்பிக்கப்பட்டது',
        zoneUpdateAccept: 'புதுப்பிப்பை ஏற்கவும்',
        zoneUpdateIgnore: 'தற்போதைய மண்டலத்தை வைத்திரு',
        eshramBadge: 'e-Shram', employerBadge: 'முதலாளி வழங்கல்',
        paid: 'செலுத்தப்பட்டது', notPaid: 'சேரவில்லை',
        weeklyChart: 'வாராந்திர வருமானம் vs கவரேஜ்',
    }
};

const LangToggle = ({ lang, setLang }) => (
    <div style={{ display: 'flex', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 20, padding: 3, gap: 2 }}>
        {[{ code: 'en', label: 'EN' }, { code: 'hi', label: 'हि' }, { code: 'ta', label: 'த' }].map(l => (
            <button key={l.code} onClick={() => setLang(l.code)}
                style={{ backgroundColor: lang === l.code ? 'white' : 'transparent', color: lang === l.code ? C.accent : 'white', border: 'none', padding: '5px 10px', borderRadius: 16, cursor: 'pointer', fontSize: 11, fontWeight: 700 }}>
                {l.label}
            </button>
        ))}
    </div>
);

export default function Dashboard({ worker, setWorker, onLogout, lang: propLang, setLang: propSetLang }) {
    const { theme, toggleTheme } = useTheme();
    const [page, setPage] = useState('dashboard');
    const [tab, setTab] = useState('home');
    const [lang, setLang] = useState(propLang || 'en');
    const [showChat, setShowChat] = useState(false);
    const [showLoanModal, setShowLoanModal] = useState(false);
    const [showRaiseClaimModal, setShowRaiseClaimModal] = useState(false);
    const [claimStep, setClaimStep] = useState('form');
    const [claimLoading, setClaimLoading] = useState(false);
    const [claimSuccess, setClaimSuccess] = useState(false);
    const [claimForm, setClaimForm] = useState({ event: 'Heavy Rain', severity: 'Severe', description: '', date: new Date().toISOString().split('T')[0] });
    
    const [loanStep, setLoanStep] = useState('offers');
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [verifyingRobot, setVerifyingRobot] = useState(false);
    const [robotVerified, setRobotVerified] = useState(false);
    const [referralCopied, setReferralCopied] = useState(false);
    const [animatedScore, setAnimatedScore] = useState(0);
    const [expandedNotif, setExpandedNotif] = useState(null);
    const [showZoneUpdate, setShowZoneUpdate] = useState(true);
    const [zoneUpdated, setZoneUpdated] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [editForm, setEditForm] = useState({});
    const [photoUrl, setPhotoUrl] = useState(null);
    const [photoUploading, setPhotoUploading] = useState(false);
    const [resignStep, setResignStep] = useState(0);
    const [resignInput, setResignInput] = useState('');
    const [savingProfile, setSavingProfile] = useState(false);
    const [loading, setLoading] = useState(true);

    const [earningsData, setEarningsData] = useState([]);
    const [earnedSoFar, setEarnedSoFar] = useState(0);
    const [remainingCoverage, setRemainingCoverage] = useState(0);
    const [earningsPercent, setEarningsPercent] = useState(0);
    const [disruptionHistory, setDisruptionHistory] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [scoreHistory, setScoreHistory] = useState([]);

    const photoInputRef = useRef(null);
    const t = T[lang] || T.en;

    // ─── City→alternate zone map (GPS-suggested zones per city) ───
    const CITY_ALT_ZONES = {
        'Bangalore': 'HSR Layout, Bangalore',
        'Chennai': 'Anna Nagar, Chennai',
        'Mumbai': 'Andheri, Mumbai',
        'Delhi': 'Lajpat Nagar, Delhi',
        'Hyderabad': 'Banjara Hills, Hyderabad',
        'Kolkata': 'Salt Lake, Kolkata',
        'Pune': 'Hinjewadi, Pune',
        'Noida': 'Sector 62, Noida',
        'Gurgaon': 'Cyber City, Gurgaon',
        'Ahmedabad': 'Satellite, Ahmedabad',
        'Kochi': 'Kakkanad, Kochi',
        'Jaipur': 'Vaishali Nagar, Jaipur',
        'Indore': 'Vijay Nagar, Indore',
        'Surat': 'Adajan, Surat',
        'Coimbatore': 'Peelamedu, Coimbatore',
        'Vizag': 'MVP Colony, Vizag',
    };

    // ─── Worker Data ───
    const name = worker?.name || 'Ravi Kumar';
    const phone = worker?.phone || '9876543210';
    const email = worker?.email || 'ravi@kavachpay.in';
    const workerCity = worker?.city || (worker?.zone?.includes(',') ? worker.zone.split(',')[1].trim() : 'Bangalore');

    // ─── Suggested new zone (GPS-based, always same city as worker) ───
    const suggestedZone = (() => {
        const alt = CITY_ALT_ZONES[workerCity];
        // Don't suggest the same zone the worker is already in
        if (alt && alt !== (worker?.zone || 'Koramangala, Bangalore')) return alt;
        // Fallback: first zone in city that isn't the current one
        const allZonesInCity = Object.entries(CITY_ALT_ZONES)
            .filter(([c]) => c === workerCity)
            .map(([, z]) => z);
        return allZonesInCity[0] || (worker?.zone || 'Koramangala, Bangalore');
    })();

    const zone = zoneUpdated ? suggestedZone : (worker?.zone || 'Koramangala, Bangalore');
    const city = zone.includes(',') ? zone.split(',')[1].trim() : workerCity;
    const platform = worker?.platform || 'Swiggy';
    const premium = worker?.premium || 59;
    const coverage = worker?.coverage || 1200;
    const avgIncome = worker?.avg_income || 1840;
    const avgDeliveries = worker?.avg_deliveries || 18;
    const policyType = worker?.policy_type || 'individual';
    const referralCode = worker?.referral_code || 'RAVI-K7X2';
    const eshramId = worker?.eshram_id || '';
    const employeeId = worker?.employee_id || 'KOR-3847261';
    const score = animatedScore;

    useEffect(() => {
        let start = 0;
        const targetScore = worker?.kavach_score || 750;
        const step = targetScore / (1200 / 16);
        const timer = setInterval(() => {
            start += step;
            if (start >= targetScore) { setAnimatedScore(targetScore); clearInterval(timer); }
            else setAnimatedScore(Math.round(start));
        }, 16);
        return () => clearInterval(timer);
    }, [worker?.kavach_score]);

    useEffect(() => {
        if (editMode) {
            setEditForm({ name, email, phone, city, zone, platform, upiId: worker?.upiId || 'ravi@upi' });
        }
    }, [editMode, name, email, phone, city, zone, platform, worker?.upiId]);

    useEffect(() => {
        const loadEverything = async () => {
            // If no uid yet (e.g. freshly registered worker — uid may still be null),
            // render immediately with the data already in the worker prop.
            if (!worker?.uid) {
                setLoading(false);
                return;
            }
            const token = localStorage.getItem('token');
            if (!token) {
                console.error("No auth token found in localStorage");
                setLoading(false);
                return;
            }
            try {
                console.log("Dashboard: Loading data for worker ", worker.uid);
                
                // Fetch fresh worker profile to wire everything to firebase
                const freshWorker = await api.getWorker(worker.uid);
                if (freshWorker && !freshWorker.error) {
                    setWorker(freshWorker);
                }

                const income = await api.getWorkerWeeklyIncome(worker.uid);
                if (income && income.weekly_income) {
                  setEarningsData(income.weekly_income.map(w => ({ week: w.week, earned: w.income, coverage: coverage })));
                  const lastWeek = income.weekly_income[income.weekly_income.length - 1];
                  setEarnedSoFar(lastWeek?.income || 0);
                }

                const claims = await fetch(`${API_BASE}/api/claims/${worker.uid}`, { 
                  headers: { 'Authorization': `Bearer ${token}` }
                }).then(r => r.json());
                if (claims && claims.claims) {
                  setDisruptionHistory(claims.claims.map(c => ({
                    date: c.date,
                    event: c.event,
                    severity: c.severity,
                    payout: c.payout,
                    paid: c.status === 'paid',
                    txn: c.txn
                  })));
                }

                const notifs = await fetch(`${API_BASE}/api/workers/${worker.uid}/notifications`, {
                   headers: { 'Authorization': `Bearer ${token}` }
                }).then(r => r.json());
                if (notifs && notifs.notifications) setNotifications(notifs.notifications);
                
                const stats = await api.getWorkerStats(worker.uid);
                if (stats && stats.avg_score) {
                    setAnimatedScore(stats.avg_score);
                    
                    // Populate mock score timeline history reaching the current score
                    setScoreHistory([
                        { date: "Feb 01", score: Math.max(0, stats.avg_score - 100) },
                        { date: "Feb 15", score: Math.max(0, stats.avg_score - 80) },
                        { date: "Mar 01", score: Math.max(0, stats.avg_score - 50) },
                        { date: "Mar 15", score: Math.max(0, stats.avg_score - 70) }, // A slight dip for realism
                        { date: "Apr 01", score: Math.max(0, stats.avg_score - 20) },
                        { date: "Apr 15", score: stats.avg_score }, // Current score
                    ]);
                }

                setLoading(false);
            } catch (e) {
                console.error("Dashboard Load Error: ", e);
                setLoading(false);
            }
        };
        loadEverything();
    }, [worker?.uid]);

    useEffect(() => {
        const p = Math.round((earnedSoFar / avgIncome) * 100);
        setEarningsPercent(p);
        setRemainingCoverage(Math.max(0, coverage - earnedSoFar));
    }, [earnedSoFar, avgIncome, coverage]);

    const getScoreColor = () => score >= 750 ? C.green : score >= 500 ? C.orange : C.red;
    const getScoreTier = () => score >= 750 ? 'Trusted Worker' : score >= 500 ? 'Standard Worker' : 'Under Review';
    const getLoanAmount = () => score >= 800 ? '₹25,000' : score >= 750 ? '₹15,000' : score >= 650 ? '₹8,000' : null;


    const unreadCount = notifications.filter(n => !n.read).length;

    // ─── THEME-AWARE COLORS ───
    const isDark = theme === 'dark';
    const lC = isDark ? {
        ...C,
        bg: '#0F172A',
        cardBg: '#1E293B',
        cardBorder: '#334155',
        text: '#F8FAFC',
        textSec: '#E2E8F0',
        textMuted: '#94A3B8',
        accentLight: '#1E293B',
        accentBorder: '#334155',
        bgSubtle: '#0F172A',
        green: '#10B981',
        success: '#10B981',
        greenLight: '#064E3B',
        greenBorder: '#065F46',
        redLight: '#7F1D1D',
        redBorder: '#991B1B',
        orangeLight: '#7C2D12',
        orangeBorder: '#9A3412',
    } : C;

    const card = (children, mb = '12px', extra = {}) => (
        <div style={{ backgroundColor: lC.cardBg, borderRadius: 14, padding: '18px', marginBottom: mb, border: `1px solid ${lC.cardBorder}`, boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.3)' : '0 2px 12px rgba(91,110,245,0.06)', ...extra }}>
            {children}
        </div>
    );

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload?.length) return (
            <div style={{ backgroundColor: lC.cardBg, border: `1px solid ${lC.cardBorder}`, borderRadius: 10, padding: '10px 14px', boxShadow: isDark ? 'none' : '0 4px 12px rgba(91,110,245,0.1)' }}>
                <p style={{ color: lC.textMuted, fontSize: 12, marginBottom: 4 }}>{label}</p>
                {payload.map((p, i) => <p key={i} style={{ color: p.color, fontSize: 13, fontWeight: 700 }}>{p.name}: {p.value}</p>)}
            </div>
        );
        return null;
    };

    const handleCopyReferral = () => {
        navigator.clipboard?.writeText(referralCode).catch(() => { });
        setReferralCopied(true);
        setTimeout(() => setReferralCopied(false), 2000);
    };

    const handleZoneAccept = async () => {
        await api.updateZone(worker?.uid, suggestedZone);
        setZoneUpdated(true);
        setShowZoneUpdate(false);
        if (setWorker) setWorker(w => ({ ...w, zone: suggestedZone }));
    };

    const handleSaveProfile = async () => {
        setSavingProfile(true);
        await api.updateProfile(worker?.uid, editForm);
        if (setWorker) setWorker(w => ({ ...w, ...editForm }));
        setSavingProfile(false);
        setEditMode(false);
    };

    const handlePhotoChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setPhotoUploading(true);
        const result = await api.uploadPhoto(worker?.uid, file);
        if (result.success) setPhotoUrl(result.photo_url || result.url);
        setPhotoUploading(false);
    };

    const handleResign = async () => {
        if (resignInput !== 'DELETE') return;
        await api.deleteAccount(worker?.uid);
        onLogout();
    };

    if (loading || !worker) return <div style={{ minHeight: '100vh', backgroundColor: lC.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><p>Synchronizing with Kavach backend...</p></div>;

    if (page === 'policy') return <Policy worker={{ ...worker, zone }} onBack={() => setPage('dashboard')} lang={lang} setLang={setLang} />;
    if (page === 'claims') return <Claims worker={{ ...worker, zone }} onBack={() => setPage('dashboard')} lang={lang} setLang={setLang} />;

    // ─── PROFILE PAGE ───
    if (page === 'profile') return (
        <div style={{ backgroundColor: lC.bg, minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
            <div style={{ background: 'linear-gradient(170deg, #08101F 0%, #0D1829 100%)', padding: '14px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <KavachLogo size={28} light />
                </div>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <LangToggle lang={lang} setLang={setLang} />
                    <button onClick={() => setPage('dashboard')} style={{ backgroundColor: 'transparent', color: 'white', border: '1px solid rgba(255,255,255,0.3)', padding: '6px 14px', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>← Back</button>
                </div>
            </div>

            <div style={{ padding: '24px 16px', maxWidth: 480, margin: '0 auto' }}>
                <p style={{ color: lC.text, fontSize: 20, fontWeight: 800, marginBottom: 16 }}>{t.profileTitle}</p>

                {/* Profile Header */}
                <div style={{ background: 'linear-gradient(170deg, #08101F 0%, #0D1829 100%)', borderRadius: 18, padding: 24, marginBottom: 14, color: 'white', boxShadow: '0 4px 24px rgba(91,110,245,0.3)', textAlign: 'center' }}>
                    {/* Avatar */}
                    <div style={{ position: 'relative', display: 'inline-block', marginBottom: 14 }}>
                        <div style={{ width: 80, height: 80, borderRadius: '50%', border: '3px solid rgba(255,255,255,0.3)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.15)', cursor: 'pointer' }}
                            onClick={() => photoInputRef.current?.click()}>
                            {photoUrl
                                ? <img src={photoUrl} alt="profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                : <p style={{ color: 'white', fontWeight: 800, fontSize: 28 }}>{name[0]}</p>
                            }
                            {photoUploading && (
                                <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' }}>
                                    <div style={{ width: 20, height: 20, borderRadius: '50%', border: '2px solid white', borderTop: '2px solid transparent', animation: 'spin 1s linear infinite' }} />
                                </div>
                            )}
                        </div>
                        <div style={{ position: 'absolute', bottom: 0, right: 0, width: 24, height: 24, backgroundColor: '#34D399', borderRadius: '50%', border: '2px solid white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                            onClick={() => photoInputRef.current?.click()}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" /></svg>
                        </div>
                    </div>
                    <input ref={photoInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhotoChange} />
                    <p style={{ color: 'white', fontWeight: 800, fontSize: 20, marginBottom: 4 }}>{name}</p>
                    <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 13 }}>{platform} · {zone.split(',')[0]}</p>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
                        <div style={{ background: 'rgba(255,255,255,0.15)', padding: '3px 12px', borderRadius: 20, border: '1px solid rgba(255,255,255,0.2)' }}>
                            <p style={{ fontSize: 11, fontWeight: 700, color: 'white' }}>Score: {score}</p>
                        </div>
                        {eshramId && <div style={{ background: 'rgba(240,165,0,0.3)', padding: '3px 12px', borderRadius: 20 }}><p style={{ fontSize: 11, fontWeight: 700, color: 'white' }}>{t.eshramBadge}</p></div>}
                        {policyType === 'employer' && <div style={{ background: 'rgba(46,125,82,0.4)', padding: '3px 12px', borderRadius: 20 }}><p style={{ fontSize: 11, fontWeight: 700, color: 'white' }}>{t.employerBadge}</p></div>}
                    </div>
                    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, marginTop: 8 }}>Tap photo to change</p>
                </div>

                {/* Edit / View Toggle */}
                {!editMode ? (
                    <React.Fragment>
                        {card(<React.Fragment>
                            <p style={{ color: lC.text, fontWeight: 700, fontSize: 14, marginBottom: 14 }}>{t.profileAccount}</p>
                            {[
                                { label: 'Full Name', value: name },
                                { label: 'Email', value: email },
                                { label: 'Phone', value: '+91 ' + phone },
                                { label: 'Employee ID', value: employeeId },
                                { label: 'Platform', value: platform },
                                { label: 'City', value: city },
                                { label: 'Zone', value: zone },
                                { label: 'UPI ID', value: worker?.upiId || 'ravi@upi' },
                                ...(eshramId ? [{ label: 'e-Shram UAN', value: eshramId }] : []),
                            ].map((item, i, arr) => (
                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: i < arr.length - 1 ? `1px solid ${lC.cardBorder}` : 'none' }}>
                                    <p style={{ color: lC.textMuted, fontSize: 13 }}>{item.label}</p>
                                    <p style={{ color: lC.text, fontWeight: 600, fontSize: 13, textAlign: 'right', maxWidth: '55%' }}>{item.value}</p>
                                </div>
                            ))}
                        </React.Fragment>)}

                        <button onClick={() => setEditMode(true)}
                            style={{ width: '100%', background: 'linear-gradient(135deg, #1A3A5C, #08101F)', color: 'white', padding: 14, borderRadius: 10, border: 'none', fontSize: 14, fontWeight: 700, cursor: 'pointer', marginBottom: 12, boxShadow: '0 4px 12px rgba(91,110,245,0.25)' }}>
                            {t.editProfile}
                        </button>
                    </React.Fragment>
                ) : (
                    // ─── EDIT FORM ───
                    card(<React.Fragment>
                        <p style={{ color: lC.text, fontWeight: 700, fontSize: 15, marginBottom: 16 }}>{t.editProfile}</p>
                        <p style={{ color: lC.textMuted, fontSize: 12, marginBottom: 16 }}>Aadhaar number and Employee ID cannot be changed.</p>

                        {[
                            { key: 'name', label: 'Full Name', type: 'text', placeholder: 'Your full name' },
                            { key: 'email', label: 'Email Address', type: 'email', placeholder: 'your@email.com' },
                            { key: 'phone', label: 'Phone Number', type: 'tel', placeholder: '10-digit number' },
                            { key: 'upiId', label: 'UPI ID', type: 'text', placeholder: 'yourname@upi' },
                            { key: 'platform', label: 'Platform', type: 'select', options: ['Swiggy', 'Zomato'] },
                        ].map(field => (
                            <div key={field.key} style={{ marginBottom: 14 }}>
                                <label style={{ display: 'block', color: lC.textSec, fontWeight: 600, fontSize: 13, marginBottom: 6 }}>{field.label}</label>
                                {field.type === 'select' ? (
                                    <select value={editForm[field.key] || ''} onChange={e => setEditForm(f => ({ ...f, [field.key]: e.target.value }))}
                                        style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: `1.5px solid ${lC.accentBorder}`, fontSize: 14, outline: 'none', backgroundColor: 'white', color: lC.text, fontFamily: 'Inter, sans-serif' }}>
                                        {field.options.map(o => <option key={o}>{o}</option>)}
                                    </select>
                                ) : (
                                    <input type={field.type} placeholder={field.placeholder} value={editForm[field.key] || ''}
                                        onChange={e => setEditForm(f => ({ ...f, [field.key]: e.target.value }))}
                                        style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: `1.5px solid ${lC.accentBorder}`, fontSize: 14, boxSizing: 'border-box', outline: 'none', fontFamily: 'Inter, sans-serif', color: lC.text }} />
                                )}
                            </div>
                        ))}

                        <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                            <button onClick={() => setEditMode(false)} style={{ flex: 1, backgroundColor: lC.cardBg, color: lC.accent, padding: 13, borderRadius: 10, border: `1.5px solid ${lC.accentBorder}`, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>{t.cancelEdit}</button>
                            <button onClick={handleSaveProfile} disabled={savingProfile}
                                style={{ flex: 2, background: 'linear-gradient(135deg, #1A3A5C, #08101F)', color: 'white', padding: 13, borderRadius: 10, border: 'none', fontSize: 14, fontWeight: 700, cursor: 'pointer', opacity: savingProfile ? 0.7 : 1 }}>
                                {savingProfile ? 'Saving...' : t.saveChanges}
                            </button>
                        </div>
                    </React.Fragment>)
                )}

                {/* Policy Info */}
                {card(<React.Fragment>
                    <p style={{ color: lC.text, fontWeight: 700, fontSize: 14, marginBottom: 14 }}>{t.profilePolicy}</p>
                    {[
                        { label: 'Policy ID', value: 'KVP-' + phone.slice(-6) },
                        { label: 'Policy Type', value: policyType === 'individual' ? 'Individual' : 'Employer Sponsored' },
                        { label: 'Weekly Premium', value: policyType === 'employer' ? 'FREE' : '₹' + premium },
                        { label: 'Weekly Coverage', value: '₹' + coverage },
                        { label: 'KavachScore', value: score + ' — ' + getScoreTier() },
                        { label: 'Referral Code', value: referralCode },
                    ].map((item, i, arr) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: i < arr.length - 1 ? `1px solid ${lC.cardBorder}` : 'none' }}>
                            <p style={{ color: lC.textMuted, fontSize: 13 }}>{item.label}</p>
                            <p style={{ color: lC.text, fontWeight: 600, fontSize: 13 }}>{item.value}</p>
                        </div>
                    ))}
                </React.Fragment>)}

                {/* Settings */}
                {card(<React.Fragment>
                    <p style={{ color: lC.text, fontWeight: 700, fontSize: 14, marginBottom: 14 }}>{t.profileSettings}</p>

                    {/* Dark Mode Toggle */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: `1px solid ${lC.cardBorder}` }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: lC.accentLight, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={lC.accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    {theme === 'dark'
                                        ? <React.Fragment><circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /></React.Fragment>
                                        : <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                                    }
                                </svg>
                            </div>
                            <div>
                                <p style={{ color: lC.text, fontWeight: 600, fontSize: 14 }}>{theme === 'dark' ? t.lightMode : t.darkMode}</p>
                                <p style={{ color: lC.textMuted, fontSize: 12, marginTop: 2 }}>Switch theme</p>
                            </div>
                        </div>
                        <button onClick={toggleTheme}
                            style={{ width: 46, height: 24, borderRadius: 12, backgroundColor: theme === 'dark' ? lC.accent : '#E5E7EB', border: 'none', cursor: 'pointer', position: 'relative', transition: 'background-color 0.2s ease' }}>
                            <div style={{ width: 18, height: 18, borderRadius: '50%', backgroundColor: 'white', position: 'absolute', top: 3, left: theme === 'dark' ? 25 : 3, transition: 'left 0.2s ease', boxShadow: '0 1px 4px rgba(0,0,0,0.2)' }} />
                        </button>
                    </div>

                    {/* Language */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: `1px solid ${lC.cardBorder}` }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: lC.accentLight, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={lC.accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>
                            </div>
                            <div>
                                <p style={{ color: lC.text, fontWeight: 600, fontSize: 14 }}>Language</p>
                                <p style={{ color: lC.textMuted, fontSize: 12, marginTop: 2 }}>EN / हि / த</p>
                            </div>
                        </div>
                        <LangToggle lang={lang} setLang={setLang} />
                    </div>

                    {/* Sign Out */}
                    <div style={{ paddingTop: 12, marginBottom: 4 }}>
                        <button onClick={onLogout}
                            style={{ width: '100%', backgroundColor: lC.redLight, color: lC.red, padding: 13, borderRadius: 10, border: `1px solid ${lC.redBorder}`, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
                            {t.signOut}
                        </button>
                    </div>
                </React.Fragment>)}

                {/* Resignation / Close Account */}
                {card(<React.Fragment>
                    <p style={{ color: lC.red, fontWeight: 700, fontSize: 14, marginBottom: 8 }}>{t.resignTitle}</p>
                    <p style={{ color: lC.textMuted, fontSize: 13, marginBottom: 14, lineHeight: 1.6 }}>{t.resignSub}</p>

                    {resignStep === 0 && (
                        <button onClick={() => setResignStep(1)}
                            style={{ width: '100%', backgroundColor: lC.redLight, color: lC.red, padding: 12, borderRadius: 10, border: `1px solid ${lC.redBorder}`, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
                            {t.resignBtn}
                        </button>
                    )}

                    {resignStep === 1 && (
                        <div className="fade-in">
                            <div style={{ backgroundColor: lC.redLight, borderRadius: 10, padding: '12px 14px', marginBottom: 12, border: `1px solid ${lC.redBorder}` }}>
                                <p style={{ color: lC.red, fontWeight: 700, fontSize: 13 }}>{t.resignConfirm}</p>
                                <p style={{ color: lC.red, fontSize: 12, marginTop: 4 }}>{t.resignConfirmSub}</p>
                            </div>
                            <input type="text" placeholder='Type "DELETE" to confirm' value={resignInput} onChange={e => setResignInput(e.target.value)}
                                style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: `1.5px solid ${lC.redBorder}`, fontSize: 14, boxSizing: 'border-box', outline: 'none', fontFamily: 'Inter, sans-serif', color: lC.text, marginBottom: 10 }} />
                            <div style={{ display: 'flex', gap: 10 }}>
                                <button onClick={() => { setResignStep(0); setResignInput(''); }}
                                    style={{ flex: 1, backgroundColor: lC.cardBg, color: lC.accent, padding: 12, borderRadius: 10, border: `1.5px solid ${lC.accentBorder}`, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
                                    Cancel
                                </button>
                                <button onClick={handleResign} disabled={resignInput !== 'DELETE'}
                                    style={{ flex: 2, backgroundColor: resignInput === 'DELETE' ? lC.red : lC.redLight, color: 'white', padding: 12, borderRadius: 10, border: 'none', fontSize: 14, fontWeight: 700, cursor: resignInput === 'DELETE' ? 'pointer' : 'default', opacity: resignInput === 'DELETE' ? 1 : 0.5 }}>
                                    {t.resignFinal}
                                </button>
                            </div>
                        </div>
                    )}
                </React.Fragment>, '0px', { border: `1px solid ${lC.redBorder}` })}
            </div>
        </div>
    );

    // ─── MAIN DASHBOARD ───
    return (
        <div style={{ backgroundColor: lC.bg, minHeight: '100vh', fontFamily: 'Inter, sans-serif', paddingBottom: 80 }}>

            {/* Raise Claim Modal */}
            {showRaiseClaimModal && (
                <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowRaiseClaimModal(false)}>
                    <div className="modal-content" style={{ backgroundColor: lC.cardBg, maxWidth: 440 }}>
                        <div style={{ background: 'linear-gradient(170deg, #08101F 0%, #0D1829 100%)', padding: '18px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: '20px 20px 0 0' }}>
                            <p style={{ color: 'white', fontWeight: 700, fontSize: 15 }}>Report Disruption</p>
                            <button onClick={() => setShowRaiseClaimModal(false)} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', width: 28, height: 28, borderRadius: '50%', cursor: 'pointer', fontSize: 14 }}>✕</button>
                        </div>
                        
                        <div style={{ padding: 24 }}>
                            {!claimSuccess ? (
                                <React.Fragment>
                                    <div style={{ marginBottom: 16 }}>
                                        <label style={{ display: 'block', color: lC.textSec, fontWeight: 600, fontSize: 13, marginBottom: 8 }}>Incident Type</label>
                                        <select value={claimForm.event} onChange={e => setClaimForm({...claimForm, event: e.target.value})}
                                            style={{ width: '100%', padding: '12px', borderRadius: 10, border: `1.5px solid ${lC.cardBorder}`, backgroundColor: lC.cardBg, color: lC.text, fontSize: 14, outline: 'none' }}>
                                            {['Heavy Rain', 'Heatwave', 'Pollution Alert', 'Flash Flood', 'Accident', 'Medical Emergency', 'Platform Downtime', 'Strike / Protests'].map(o => <option key={o}>{o}</option>)}
                                        </select>
                                    </div>
                                    
                                    <div style={{ marginBottom: 16 }}>
                                        <label style={{ display: 'block', color: lC.textSec, fontWeight: 600, fontSize: 13, marginBottom: 8 }}>Severity Level</label>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                                            {['Minor', 'Moderate', 'Severe'].map(s => (
                                                <button key={s} onClick={() => setClaimForm({...claimForm, severity: s})}
                                                    style={{ padding: '10px', borderRadius: 8, border: `2px solid ${claimForm.severity === s ? (s === 'Severe' ? lC.red : s === 'Moderate' ? lC.orange : lC.accent) : lC.cardBorder}`, background: claimForm.severity === s ? (s === 'Severe' ? lC.redLight : s === 'Moderate' ? lC.orangeLight : lC.accentLight) : 'transparent', color: claimForm.severity === s ? (s === 'Severe' ? lC.red : s === 'Moderate' ? lC.orange : lC.accent) : lC.textMuted, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                                                    {s}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div style={{ marginBottom: 20 }}>
                                        <label style={{ display: 'block', color: lC.textSec, fontWeight: 600, fontSize: 13, marginBottom: 8 }}>Description (Optional)</label>
                                        <textarea rows="3" placeholder="Explain what happened..." value={claimForm.description} onChange={e => setClaimForm({...claimForm, description: e.target.value})}
                                            style={{ width: '100%', padding: '12px', borderRadius: 10, border: `1.5px solid ${lC.cardBorder}`, backgroundColor: lC.cardBg, color: lC.text, fontSize: 14, resize: 'none', outline: 'none', boxSizing: 'border-box' }} />
                                    </div>

                                    <button onClick={async () => {
                                        setClaimLoading(true);
                                        const res = await fetch(`${API_BASE}/api/claims/create`, {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
                                            body: JSON.stringify({
                                                worker_id: worker.uid,
                                                event: claimForm.event,
                                                code: 'USR-RPT',
                                                severity: claimForm.severity,
                                                description: claimForm.description,
                                                zone: zone,
                                                manual_claim: true
                                            })
                                        }).then(r => r.json());
                                        setClaimLoading(false);
                                        if (res.success) setClaimSuccess(true);
                                    }} disabled={claimLoading}
                                        style={{ width: '100%', backgroundColor: lC.accent, color: 'white', padding: 14, borderRadius: 10, border: 'none', fontSize: 15, fontWeight: 700, cursor: 'pointer', transition: 'opacity 0.2s' }}>
                                        {claimLoading ? 'Submitting...' : 'Submit Claim'}
                                    </button>
                                </React.Fragment>
                            ) : (
                                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                                    <div style={{ width: 60, height: 60, borderRadius: '50%', backgroundColor: lC.greenLight, border: `2px solid ${lC.greenBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={lC.green} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                                    </div>
                                    <p style={{ color: lC.text, fontWeight: 800, fontSize: 18, marginBottom: 8 }}>Claim Submitted</p>
                                    <p style={{ color: lC.textSec, fontSize: 14, lineHeight: 1.5, marginBottom: 24 }}>Your report is now under verification by our AI models and human audit team. Status will appear in "My Claims".</p>
                                    <button onClick={() => { setShowRaiseClaimModal(false); setClaimSuccess(false); setTab('home'); }}
                                        style={{ width: '100%', backgroundColor: lC.navy, color: 'white', padding: 14, borderRadius: 10, border: 'none', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>
                                        Close
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Loan Modal */}
            {showLoanModal && (
                <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowLoanModal(false)}>
                    <div className="modal-content" style={{ backgroundColor: lC.cardBg, maxWidth: 460 }}>
                        {loanStep === 'offers' && (
                            <React.Fragment>
                                <div style={{ background: 'linear-gradient(170deg, #08101F 0%, #0D1829 100%)', padding: '18px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: '20px 20px 0 0' }}>
                                    <p style={{ color: 'white', fontWeight: 700, fontSize: 15 }}>{t.loanTitle}</p>
                                    <button onClick={() => setShowLoanModal(false)} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', width: 28, height: 28, borderRadius: '50%', cursor: 'pointer', fontSize: 14 }}>✕</button>
                                </div>
                                <div style={{ padding: 24 }}>
                                    <div style={{ textAlign: 'center', marginBottom: 20 }}>
                                        <p style={{ color: lC.green, fontWeight: 800, fontSize: 24, marginBottom: 6 }}>{getLoanAmount()}</p>
                                        <p style={{ color: lC.textSec, fontSize: 13 }}>{t.loanQualify}</p>
                                    </div>
                                    <div style={{ backgroundColor: lC.accentLight, borderRadius: 12, padding: 14, marginBottom: 20, border: `1px solid ${lC.accentBorder}` }}>
                                        <p style={{ color: lC.text, fontSize: 13, lineHeight: 1.6 }}>{t.loanSub}</p>
                                    </div>
                                    <button onClick={() => setLoanStep('terms')}
                                        style={{ width: '100%', backgroundColor: lC.accent, color: 'white', padding: 14, borderRadius: 10, border: 'none', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>
                                        {t.loanBtn}
                                    </button>
                                    <p style={{ color: lC.textMuted, fontSize: 11, textAlign: 'center', marginTop: 14 }}>{t.loanPartner}</p>
                                </div>
                            </React.Fragment>
                        )}
                        {loanStep === 'terms' && (
                            <React.Fragment>
                                <div style={{ background: 'linear-gradient(135deg, #08101F 0%, #0D1829 100%)', padding: '18px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: '20px 20px 0 0' }}>
                                    <p style={{ color: 'white', fontWeight: 700, fontSize: 15 }}>Terms & Conditions</p>
                                    <button onClick={() => setLoanStep('offers')} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', padding: '4px 12px', borderRadius: 20, cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>← Back</button>
                                </div>
                                <div style={{ padding: 24 }}>
                                    <div style={{ maxHeight: 200, overflowY: 'auto', backgroundColor: lC.bg, padding: 16, borderRadius: 8, fontSize: 12, color: lC.textSec, lineHeight: 1.6, border: `1px solid ${lC.cardBorder}`, marginBottom: 16 }}>
                                        <p style={{ fontWeight: 700, marginBottom: 8, color: lC.text }}>1. Authorization</p>
                                        <p style={{ marginBottom: 12 }}>You authorize KavachPay to share your profile details, KYC documents, and KavachScore with our partner lenders exclusively for evaluating your loan eligibility.</p>
                                        <p style={{ fontWeight: 700, marginBottom: 8, color: lC.text }}>2. Repayment Obligations</p>
                                        <p style={{ marginBottom: 12 }}>You acknowledge that taking a loan creates a legal obligation to repay the lender according to their specific terms. Failure to repay may adversely affect your KavachScore.</p>
                                        <p style={{ fontWeight: 700, marginBottom: 8, color: lC.text }}>3. Soft Credit Pull</p>
                                        <p style={{ marginBottom: 12 }}>By continuing, you consent to a soft credit pull which will not affect your CIBIL score. A hard pull will only happen if you accept a final loan offer from the partner.</p>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                                        <input type="checkbox" id="terms-accept" checked={termsAccepted} onChange={e => setTermsAccepted(e.target.checked)} style={{ width: 18, height: 18, accentColor: lC.accent, cursor: 'pointer' }} />
                                        <label htmlFor="terms-accept" style={{ fontSize: 13, color: lC.text, cursor: 'pointer', userSelect: 'none' }}>I agree to the Terms & Conditions and Privacy Policy</label>
                                    </div>
                                    <button onClick={() => setLoanStep('captcha')} disabled={!termsAccepted}
                                        style={{ width: '100%', background: termsAccepted ? `linear-gradient(135deg, ${lC.accent}, ${lC.navy})` : '#D1D5DB', color: 'white', padding: 14, borderRadius: 10, border: 'none', fontSize: 15, fontWeight: 700, cursor: termsAccepted ? 'pointer' : 'not-allowed', transition: 'all 0.2s' }}>
                                        Accept & Continue
                                    </button>
                                </div>
                            </React.Fragment>
                        )}
                        {loanStep === 'captcha' && (
                            <React.Fragment>
                                <div style={{ background: 'linear-gradient(135deg, #08101F 0%, #0D1829 100%)', padding: '18px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: '20px 20px 0 0' }}>
                                    <p style={{ color: 'white', fontWeight: 700, fontSize: 15 }}>Security Check</p>
                                    <button onClick={() => setLoanStep('terms')} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', padding: '4px 12px', borderRadius: 20, cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>← Back</button>
                                </div>
                                <div style={{ padding: '40px 24px', textAlign: 'center' }}>
                                    <p style={{ color: lC.text, fontSize: 14, marginBottom: 24, fontWeight: 500 }}>Please verify that you are not a robot before proceeding.</p>
                                    <div style={{ display: 'inline-flex', alignItems: 'center', backgroundColor: lC.bg, border: `1px solid ${lC.cardBorder}`, borderRadius: 4, padding: '16px 20px', gap: 16, boxShadow: '0 2px 4px rgba(0,0,0,0.05)', width: 280, justifyContent: 'space-between' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                            <div onClick={() => {
                                                if (verifyingRobot || robotVerified) return;
                                                setVerifyingRobot(true);
                                                setTimeout(() => { setVerifyingRobot(false); setRobotVerified(true); }, 1500);
                                            }} style={{ width: 26, height: 26, border: robotVerified ? 'none' : '2px solid #D1D5DB', borderRadius: 2, backgroundColor: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: (verifyingRobot || robotVerified) ? 'default' : 'pointer', overflow: 'hidden' }}>
                                                {verifyingRobot && <div style={{ width: 16, height: 16, border: '3px solid transparent', borderTop: '3px solid #1A3A5C', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />}
                                                {robotVerified && <svg width="26" height="26" viewBox="0 0 24 24" fill={lC.green}><polyline points="20 6 9 17 4 12" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" /></svg>}
                                            </div>
                                            <p style={{ color: lC.textSec, fontSize: 14, fontWeight: 500, userSelect: 'none' }}>I'm not a robot</p>
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                            <div style={{ width: 24, height: 24, padding: 4 }}>
                                                <svg viewBox="0 0 24 24" fill={lC.accent}><path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M12,6V10.5L15,12L16,10.2L13.5,8.8V6H12Z" /></svg>
                                            </div>
                                            <p style={{ fontSize: 9, color: lC.textMuted }}>reCAPTCHA</p>
                                        </div>
                                    </div>
                                    {robotVerified && (
                                        <div className="fade-in" style={{ marginTop: 24 }}>
                                            <button onClick={() => setLoanStep('success')}
                                                style={{ width: '100%', background: `linear-gradient(135deg, ${lC.accent}, ${lC.navy})`, color: 'white', padding: 14, borderRadius: 10, border: 'none', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>
                                                Proceed to Application
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </React.Fragment>
                        )}
                        {loanStep === 'success' && (
                            <div className="fade-in" style={{ padding: '40px 24px', textAlign: 'center' }}>
                                <div style={{ width: 72, height: 72, borderRadius: '50%', backgroundColor: lC.greenLight, border: `4px solid ${lC.greenBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                                    <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke={lC.green} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                                </div>
                                <p style={{ color: lC.text, fontWeight: 800, fontSize: 20, marginBottom: 12 }}>Application Successful</p>
                                <p style={{ color: lC.textSec, fontSize: 14, lineHeight: 1.6, marginBottom: 24 }}>
                                    Your loan application request has been successfully submitted to our partner.
                                    <br/><br/>
                                    <strong>Further communications regarding loan approval and disbursement will be proceeded by the loan company directly to your registered email and phone number.</strong>
                                </p>
                                <button onClick={() => { setShowLoanModal(false); setTimeout(() => { setLoanStep('offers'); setTermsAccepted(false); setRobotVerified(false); }, 300); }}
                                    style={{ width: '100%', backgroundColor: lC.navy, color: 'white', padding: 14, borderRadius: 10, border: 'none', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>
                                    Back to Dashboard
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Navbar */}
            <div style={{ background: 'linear-gradient(170deg, #08101F 0%, #0D1829 100%)', padding: '14px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <KavachLogo size={28} light />
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <LangToggle lang={lang} setLang={setLang} />
                    <button onClick={() => setPage('profile')}
                        style={{ width: 36, height: 36, borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.2)', border: '2px solid rgba(255,255,255,0.4)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: 14, overflow: 'hidden' }}>
                        {photoUrl ? <img src={photoUrl} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : name[0]}
                    </button>
                </div>
            </div>

            {/* Zone Auto-Update Banner */}
            {showZoneUpdate && !zoneUpdated && (
                <div className="fade-in" style={{ backgroundColor: lC.accentLight, borderBottom: `1px solid ${lC.accentBorder}`, padding: '12px 20px' }}>
                    <div style={{ maxWidth: 520, margin: '0 auto' }}>
                        <p style={{ color: lC.accent, fontWeight: 700, fontSize: 13, marginBottom: 4 }}>{t.zoneUpdateTitle}</p>
                        <p style={{ color: lC.textSec, fontSize: 12, marginBottom: 10, lineHeight: 1.5 }}>
                            {t.zoneUpdateMsg} <strong>{suggestedZone}</strong>.
                        </p>
                        <div style={{ display: 'flex', gap: 8 }}>
                            <button onClick={handleZoneAccept}
                                style={{ backgroundColor: lC.accent, color: 'white', padding: '7px 16px', borderRadius: 8, border: 'none', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                                {t.zoneUpdateAccept}
                            </button>
                            <button onClick={() => setShowZoneUpdate(false)}
                                style={{ backgroundColor: 'transparent', color: lC.textMuted, padding: '7px 16px', borderRadius: 8, border: `1px solid ${lC.accentBorder}`, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                                {t.zoneUpdateIgnore}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Zone Updated Confirmation */}
            {zoneUpdated && (
                <div className="fade-in" style={{ backgroundColor: lC.greenLight, borderBottom: `1px solid ${lC.greenBorder}`, padding: '10px 20px', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={lC.green} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                    <p style={{ color: lC.green, fontSize: 12, fontWeight: 600 }}>Your zone has been updated to <strong>{suggestedZone}</strong>. Policy coverage now applies to your new zone.</p>
                </div>
            )}

            {/* Tab Bar */}
            <div style={{ backgroundColor: lC.cardBg, display: 'flex', borderBottom: `1px solid ${lC.cardBorder}`, overflowX: 'auto' }}>
                {[
                    { key: 'home', label: t.home },
                    { key: 'earnings', label: t.earnings },
                    { key: 'score', label: t.score },
                    { key: 'notifications', label: `${t.alerts}${unreadCount > 0 ? ` (${unreadCount})` : ''}` },
                    { key: 'forum', label: t.forum },
                ].map(tb => (
                    <button key={tb.key} onClick={() => setTab(tb.key)}
                        style={{ padding: '14px 18px', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', fontWeight: tab === tb.key ? 700 : 500, color: tab === tb.key ? lC.accent : lC.textMuted, borderBottom: tab === tb.key ? `2px solid ${lC.accent}` : '2px solid transparent', fontSize: 13, whiteSpace: 'nowrap', fontFamily: 'Inter, sans-serif' }}>
                        {tb.label}
                    </button>
                ))}
            </div>

            <div style={{ padding: '16px', maxWidth: 520, margin: '0 auto' }}>

                {/* HOME TAB */}
                {tab === 'home' && (
                    <div className="fade-in">
                        {/* Policy Card */}
                        <div style={{ background: 'linear-gradient(170deg, #08101F 0%, #0D1829 100%)', borderRadius: 18, padding: 22, marginBottom: 12, color: 'white', boxShadow: '0 4px 24px rgba(91,110,245,0.25)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 }}>
                                <div>
                                    <p style={{ opacity: 0.7, fontSize: 11, letterSpacing: 0.8, textTransform: 'uppercase', color: 'white' }}>{t.activePolicy}</p>
                                    <p style={{ fontWeight: 800, fontSize: 18, marginTop: 4, color: 'white' }}>{name}</p>
                                    <p style={{ opacity: 0.65, fontSize: 12, marginTop: 3, color: 'white' }}>{platform} · {zone.split(',')[0]}</p>
                                    <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
                                        {policyType === 'employer' && <div style={{ backgroundColor: 'rgba(46,125,82,0.4)', padding: '3px 10px', borderRadius: 20, border: '1px solid rgba(255,255,255,0.2)' }}><p style={{ fontSize: 10, fontWeight: 700, color: 'white' }}>{t.employerBadge}</p></div>}
                                        {eshramId && <div style={{ backgroundColor: 'rgba(240,165,0,0.3)', padding: '3px 10px', borderRadius: 20, border: '1px solid rgba(255,255,255,0.2)' }}><p style={{ fontSize: 10, fontWeight: 700, color: 'white' }}>{t.eshramBadge}</p></div>}
                                    </div>
                                </div>
                                <div style={{ backgroundColor: 'rgba(46,125,82,0.9)', padding: '4px 12px', borderRadius: 20 }}>
                                    <p style={{ fontSize: 11, fontWeight: 700, color: 'white' }}>{t.active}</p>
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 8 }}>
                                {[
                                    { label: t.weeklyCoverage, value: '₹' + coverage },
                                    { label: t.premium, value: policyType === 'employer' ? 'FREE' : '₹' + premium },
                                    { label: t.avgIncome, value: '₹' + avgIncome },
                                    { label: t.avgDeliveries, value: avgDeliveries + '/day' },
                                ].map((s, i) => (
                                    <div key={i} style={{ backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 10, padding: '10px 8px', textAlign: 'center' }}>
                                        <p style={{ fontWeight: 800, fontSize: 14, color: 'white' }}>{s.value}</p>
                                        <p style={{ opacity: 0.65, fontSize: 9, marginTop: 3, color: 'white', lineHeight: 1.3 }}>{s.label}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Loan Banner */}
                        {getLoanAmount() ? (
                            card(<React.Fragment>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div style={{ flex: 1 }}>
                                        <p style={{ color: lC.accent, fontWeight: 700, fontSize: 14, marginBottom: 3 }}>{t.loanTitle}</p>
                                        <p style={{ color: lC.textMuted, fontSize: 12, marginBottom: 8 }}>{t.loanSub}</p>
                                        <p style={{ color: lC.textSec, fontSize: 13 }}>{t.loanQualify} <span style={{ color: lC.green, fontWeight: 800, fontSize: 16 }}>{getLoanAmount()}</span></p>
                                        <p style={{ color: lC.textMuted, fontSize: 11, marginTop: 4 }}>{t.loanPartner}</p>
                                    </div>
                                    <div style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: lC.accentLight, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginLeft: 12 }}>
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={lC.accent} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
                                    </div>
                                </div>
                                <button onClick={() => setShowLoanModal(true)}
                                    style={{ width: '100%', background: 'linear-gradient(135deg, #1A3A5C, #08101F)', color: 'white', padding: '10px', borderRadius: 8, border: 'none', fontSize: 13, fontWeight: 700, cursor: 'pointer', marginTop: 12 }}>
                                    {t.loanBtn}
                                </button>
                            </React.Fragment>, '12px', { borderLeft: `4px solid ${lC.accent}` })
                        ) : (
                            card(<p style={{ color: lC.orange, fontSize: 13 }}>{t.loanLow}</p>, '12px', { backgroundColor: lC.orangeLight, borderLeft: `4px solid ${lC.orange}` })
                        )}

                        {/* Referral */}
                        {card(<React.Fragment>
                            <p style={{ color: lC.text, fontWeight: 700, fontSize: 14, marginBottom: 3 }}>{t.referralTitle}</p>
                            <p style={{ color: lC.textMuted, fontSize: 12, marginBottom: 14 }}>{t.referralSub}</p>
                            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
                                <div style={{ flex: 1, backgroundColor: lC.bg, borderRadius: 10, padding: '12px 16px', border: `1.5px dashed ${lC.accentBorder}`, textAlign: 'center' }}>
                                    <p style={{ color: lC.accent, fontWeight: 800, fontSize: 18, letterSpacing: 2 }}>{referralCode}</p>
                                </div>
                                <button onClick={handleCopyReferral}
                                    style={{ backgroundColor: referralCopied ? lC.green : lC.accent, color: 'white', padding: '12px 16px', borderRadius: 10, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700, whiteSpace: 'nowrap' }}>
                                    {referralCopied ? t.referralCopied : t.referralCopy}
                                </button>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                                <div style={{ backgroundColor: lC.accentLight, borderRadius: 8, padding: '10px', textAlign: 'center', border: `1px solid ${lC.accentBorder}` }}>
                                    <p style={{ color: lC.accent, fontWeight: 800, fontSize: 18 }}>1</p>
                                    <p style={{ color: lC.textMuted, fontSize: 11, marginTop: 2 }}>{t.referralUsed}</p>
                                </div>
                                <div style={{ backgroundColor: lC.greenLight, borderRadius: 8, padding: '10px', textAlign: 'center', border: `1px solid ${lC.greenBorder}` }}>
                                    <p style={{ color: lC.green, fontWeight: 800, fontSize: 18 }}>₹10</p>
                                    <p style={{ color: lC.textMuted, fontSize: 11, marginTop: 2 }}>{t.referralSaved}</p>
                                </div>
                            </div>
                        </React.Fragment>)}

                        {/* Earnings Meter */}
                        {card(<React.Fragment>
                            <p style={{ color: lC.text, fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{t.earningsTitle}</p>
                            <p style={{ color: lC.textMuted, fontSize: 12, marginBottom: 14 }}>{t.earningsSub}</p>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                <p style={{ color: lC.textMuted, fontSize: 13 }}>{t.earnedSoFar}</p>
                                <p style={{ color: lC.accent, fontWeight: 700, fontSize: 13 }}>₹{earnedSoFar} / ₹{avgIncome}</p>
                            </div>
                            <div style={{ backgroundColor: lC.accentLight, borderRadius: 8, height: 10, overflow: 'hidden', marginBottom: 10 }}>
                                <div style={{ width: `${earningsPercent}%`, height: '100%', backgroundColor: earningsPercent >= 80 ? lC.green : earningsPercent >= 50 ? lC.orange : lC.red, borderRadius: 8, transition: 'width 0.8s ease' }} />
                            </div>
                            <div style={{ backgroundColor: lC.accentLight, borderRadius: 10, padding: '10px 12px', border: `1px solid ${lC.accentBorder}` }}>
                                <p style={{ color: lC.accent, fontSize: 13, fontWeight: 600 }}>{t.kavachCovers} ₹{remainingCoverage} {t.kavachCoversSub}</p>
                            </div>
                        </React.Fragment>)}

                        {/* Disruption History */}
                        {card(<React.Fragment>
                            <p style={{ color: lC.text, fontWeight: 700, fontSize: 14, marginBottom: 14 }}>{t.disruptionHistory}</p>
                            {disruptionHistory.map((d, i) => (
                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', borderRadius: 10, marginBottom: 6, backgroundColor: d.paid ? lC.greenLight : lC.bg, border: `1px solid ${d.paid ? lC.greenBorder : lC.cardBorder}` }}>
                                    <div>
                                        <p style={{ color: lC.text, fontWeight: 600, fontSize: 13 }}>{d.event}</p>
                                        <p style={{ color: lC.textMuted, fontSize: 11, marginTop: 2 }}>{d.date} · {d.severity}</p>
                                        {d.txn && <p style={{ color: lC.textMuted, fontSize: 10, marginTop: 1, opacity: 0.7 }}>{d.txn}</p>}
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <p style={{ color: d.paid ? lC.green : lC.red, fontWeight: 800, fontSize: 14 }}>{d.paid ? '+₹' + d.payout : '—'}</p>
                                        <p style={{ color: lC.textMuted, fontSize: 11 }}>{d.paid ? t.paid : t.notPaid}</p>
                                    </div>
                                </div>
                            ))}
                        </React.Fragment>)}

                        {/* Quick Actions */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
                            <button onClick={() => setShowRaiseClaimModal(true)}
                                style={{ gridColumn: 'span 2', background: 'linear-gradient(135deg, #BE123C, #881337)', color: 'white', padding: 16, borderRadius: 12, border: 'none', fontWeight: 800, cursor: 'pointer', fontSize: 14, boxShadow: '0 4px 14px rgba(190,18,60,0.3)' }}>
                                Report Incident / Raise Claim
                            </button>
                            {[
                                { label: t.myPolicy, action: () => setPage('policy') },
                                { label: t.myClaims, action: () => setPage('claims') },
                            ].map((btn, i) => (
                                <button key={i} onClick={btn.action}
                                    style={{ backgroundColor: lC.cardBg, color: lC.accent, padding: 16, borderRadius: 12, border: `1.5px solid ${lC.accentBorder}`, fontWeight: 700, cursor: 'pointer', fontSize: 14, fontFamily: 'Inter, sans-serif' }}>
                                    {btn.label}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* EARNINGS TAB */}
                {tab === 'earnings' && (
                    <div className="fade-in">
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 14 }}>
                            {[
                                { label: 'Avg Weekly', value: '₹' + avgIncome, color: lC.accent, bg: lC.accentLight, border: lC.accentBorder },
                                { label: 'Total Payouts', value: '₹' + disruptionHistory.filter(d => d.paid).reduce((a, b) => a + b.payout, 0), color: lC.success, bg: lC.greenLight, border: lC.greenBorder },
                                { label: 'This Week', value: '₹' + earnedSoFar, color: lC.orange, bg: lC.orangeLight, border: lC.orangeBorder },
                            ].map((s, i) => (
                                <div key={i} style={{ backgroundColor: s.bg, borderRadius: 12, padding: 14, textAlign: 'center', border: `1px solid ${s.border}` }}>
                                    <p style={{ color: s.color, fontWeight: 800, fontSize: 16 }}>{s.value}</p>
                                    <p style={{ color: lC.textMuted, fontSize: 11, marginTop: 4 }}>{s.label}</p>
                                </div>
                            ))}
                        </div>
                        {card(<React.Fragment>
                            <p style={{ color: lC.text, fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{t.weeklyChart}</p>
                            <p style={{ color: lC.textMuted, fontSize: 12, marginBottom: 16 }}>Last 6 weeks</p>
                            <ResponsiveContainer width="100%" height={200}>
                                <BarChart data={earningsData} barGap={4}>
                                    <XAxis dataKey="week" tick={{ fontSize: 11, fill: lC.textMuted }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fontSize: 10, fill: lC.textMuted }} axisLine={false} tickLine={false} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Bar dataKey="earned" fill={lC.accent} radius={[4, 4, 0, 0]} name="Earnings" />
                                    <Bar dataKey="coverage" fill={lC.accentBorder} radius={[4, 4, 0, 0]} name="Coverage" />
                                </BarChart>
                            </ResponsiveContainer>
                        </React.Fragment>)}
                    </div>
                )}

                {/* SCORE TAB */}
                {tab === 'score' && (
                    <div className="fade-in">
                        {card(<React.Fragment>
                            <div style={{ textAlign: 'center', padding: '10px 0' }}>
                                <div style={{ width: 120, height: 120, borderRadius: '50%', border: `8px solid ${getScoreColor()}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', boxShadow: `0 0 28px ${getScoreColor()}30` }}>
                                    <p style={{ fontSize: 32, fontWeight: 800, color: getScoreColor(), lineHeight: 1 }}>{animatedScore}</p>
                                    <p style={{ fontSize: 10, color: lC.textMuted, marginTop: 2 }}>/ 900</p>
                                </div>
                                <p style={{ color: getScoreColor(), fontWeight: 700, fontSize: 16 }}>{getScoreTier()}</p>
                                <p style={{ color: lC.textMuted, fontSize: 13, marginTop: 5 }}>
                                    {score >= 750 ? 'Instant payouts · Lowest premium' : score >= 500 ? '2hr delay · +15% premium' : '24hr delay · Manual review'}
                                </p>
                            </div>
                        </React.Fragment>)}

                        {card(<React.Fragment>
                            <p style={{ color: lC.text, fontWeight: 700, fontSize: 14, marginBottom: 14 }}>{t.scoreGoesUp}</p>
                            {[
                                { action: 'Legitimate claim — verified', points: '+10' },
                                { action: 'Weekly active streak', points: '+5' },
                                { action: '6-month tenure bonus', points: '+15' },
                                { action: 'Zero issues for 30 days', points: '+8' },
                            ].map((item, i) => (
                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', backgroundColor: lC.greenLight, border: `1px solid ${lC.greenBorder}`, borderRadius: 10, marginBottom: 8 }}>
                                    <p style={{ color: lC.success, fontWeight: 600, fontSize: 13 }}>{item.action}</p>
                                    <p style={{ color: lC.success, fontWeight: 800, fontSize: 14, marginLeft: 12 }}>+{item.points}</p>
                                </div>
                            ))}
                        </React.Fragment>)}

                        {card(<React.Fragment>
                            <p style={{ color: lC.text, fontWeight: 700, fontSize: 14, marginBottom: 14 }}>{t.scoreGoesDown}</p>
                            {[
                                { action: 'Suspicious claim pattern', points: '-25' },
                                { action: 'Active during disruption', points: '-20' },
                                { action: 'Missed self declaration', points: '-5' },
                                { action: 'Policy lapse', points: '-10' },
                            ].map((item, i) => (
                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', backgroundColor: lC.redLight, border: `1px solid ${lC.redBorder}`, borderRadius: 10, marginBottom: 8 }}>
                                    <p style={{ color: lC.red, fontWeight: 600, fontSize: 13 }}>{item.action}</p>
                                    <p style={{ color: lC.red, fontWeight: 800, fontSize: 14, marginLeft: 12 }}>{item.points}</p>
                                </div>
                            ))}
                        </React.Fragment>)}

                        {card(<React.Fragment>
                            <p style={{ color: lC.text, fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{t.scoreTimeline}</p>
                            <p style={{ color: lC.textMuted, fontSize: 12, marginBottom: 16 }}>Last 2 months</p>
                            <ResponsiveContainer width="100%" height={180}>
                                <LineChart data={scoreHistory}>
                                    <CartesianGrid strokeDasharray="3 3" stroke={lC.cardBorder} opacity={0.4} />
                                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: lC.textMuted }} axisLine={false} tickLine={false} />
                                    <YAxis domain={[700, 820]} tick={{ fontSize: 11, fill: lC.textMuted }} axisLine={false} tickLine={false} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Line type="monotone" dataKey="score" stroke={lC.accent} strokeWidth={3} dot={{ fill: lC.accent, r: 5, strokeWidth: 0 }} name="KavachScore" />
                                </LineChart>
                            </ResponsiveContainer>
                        </React.Fragment>)}
                    </div>
                )}

                {/* NOTIFICATIONS TAB */}
                {tab === 'notifications' && (
                    <div className="fade-in">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                            <p style={{ color: lC.text, fontWeight: 700, fontSize: 15 }}>{t.allNotifs}</p>
                            {unreadCount > 0 && (
                                <div style={{ backgroundColor: lC.red, borderRadius: 12, padding: '3px 10px' }}>
                                    <p style={{ color: 'white', fontSize: 11, fontWeight: 700 }}>{unreadCount} {unreadCount === 1 ? 'Alert' : 'Alerts'}</p>
                                </div>
                            )}
                        </div>
                        {notifications.map((n, i) => (
                            <div key={i} onClick={() => setExpandedNotif(expandedNotif === i ? null : i)}
                                style={{ backgroundColor: lC.cardBg, borderRadius: 14, padding: 16, marginBottom: 10, border: `1px solid ${n.read ? lC.cardBorder : n.border}`, cursor: 'pointer', borderLeft: `4px solid ${n.color}` }}>
                                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                                    <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: n.read ? 'transparent' : lC.red, flexShrink: 0, marginTop: 4 }} />
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                                            <p style={{ color: lC.text, fontWeight: 700, fontSize: 13 }}>{n.title}</p>
                                        </div>
                                        <p style={{ color: lC.textMuted, fontSize: 12, lineHeight: 1.5 }}>{n.msg}</p>
                                        <p style={{ color: lC.textMuted, fontSize: 11, marginTop: 6, opacity: 0.7 }}>{n.time}</p>
                                        {expandedNotif === i && (
                                            <div className="fade-in" style={{ backgroundColor: lC.bg, borderRadius: 8, padding: 12, marginTop: 10, border: `1px solid ${lC.cardBorder}` }}>
                                                {n.detail.split('\n').map((line, j) => (
                                                    <p key={j} style={{ color: lC.textMuted, fontSize: 12, lineHeight: 1.7 }}>{line}</p>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* FORUM TAB */}
                {tab === 'forum' && (
                    <Forum worker={{ ...worker, zone, name, city }} lang={lang} />
                )}
            </div>

            {/* Bottom Nav */}
            <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, backgroundColor: lC.cardBg, borderTop: `1px solid ${lC.cardBorder}`, padding: '10px 0', display: 'flex', justifyContent: 'space-around', zIndex: 100, borderLeft: 'none', borderRight: 'none' }}>
                {[
                    { label: t.home, key: 'home', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg> },
                    { label: t.earnings, key: 'earnings', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg> },
                    { label: t.score, key: 'score', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="7" /><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" /></svg> },
                    { label: t.alerts, key: 'notifications', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg> },
                    { label: t.forum, key: 'forum', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg> },
                ].map(tb => (
                    <button key={tb.key} onClick={() => setTab(tb.key)}
                        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, background: 'none', border: 'none', cursor: 'pointer', padding: '4px 10px', color: tab === tb.key ? lC.accent : lC.textMuted, fontFamily: 'Inter, sans-serif' }}>
                        {tb.icon}
                        <p style={{ fontSize: 10, fontWeight: tab === tb.key ? 700 : 500 }}>{tb.label}</p>
                    </button>
                ))}
            </div>

            {/* Chatbot */}
            <button onClick={() => setShowChat(prev => !prev)}
                style={{ position: 'fixed', bottom: 80, right: 20, backgroundColor: lC.accent, color: 'white', width: 48, height: 48, borderRadius: '50%', border: 'none', cursor: 'pointer', boxShadow: '0 4px 16px rgba(91,110,245,0.35)', zIndex: 99, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
            </button>
            {showChat && <Chatbot
                onClose={() => setShowChat(false)}
                lang={lang}
                worker={{
                    ...worker,
                    // Map backend field names to Chatbot expected field names
                    score:        worker?.kavach_score,
                    avgIncome:    worker?.avg_income,
                    avgDeliveries: worker?.avg_deliveries,
                    policyType:   worker?.policy_type,
                    policyActive: worker?.policy_active,
                    policyPaused: worker?.policy_paused,
                    employeeId:   worker?.employee_id,
                    eshramId:     worker?.eshram_id,
                    referralCode: worker?.referral_code,
                    claims:       disruptionHistory,
                    notifications: notifications,
                }}
            />}
        </div>
    );
}