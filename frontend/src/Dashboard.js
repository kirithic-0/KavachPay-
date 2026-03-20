import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts';
import Policy from './Policy';
import Claims from './Claims';
import Chatbot from './Chatbot';
import { useTheme } from './App';

const T = {
    en: {
        brand: 'KavachPay', logout: 'Logout', hello: 'Hello',
        home: 'Home', earnings: 'Earnings', score: 'KavachScore', alerts: 'Alerts',
        activePolicy: 'Active Policy', active: 'ACTIVE', paused: 'PAUSED',
        weeklyCoverage: 'Weekly Coverage', premium: 'Premium', lastPayout: 'Last Payout',
        avgIncome: 'Avg Weekly Income', avgDeliveries: 'Avg Daily Deliveries',
        earningsProtection: 'Earnings Protection',
        earningsSub: "This week's income vs your weekly average",
        earnedSoFar: 'Earned so far',
        kavachCovers: 'KavachPay covers ₹',
        kavachCoversSub: ' if disruption hits today',
        disruptionHistory: 'Disruption History',
        myPolicy: 'My Policy', myClaims: 'My Claims',
        loanTitle: 'Instant Loan — Powered by KavachScore',
        loanSub: 'Get a personal loan based on your KavachScore — no CIBIL required.',
        loanQualify: 'You qualify for up to',
        loanBtn: 'Check Loan Offers',
        loanLow: 'Improve your KavachScore to unlock loan offers.',
        loanPartner: 'In partnership with KreditBee, MoneyTap & CashE',
        referralTitle: 'Your Referral Code',
        referralSub: 'Share with a friend — they enroll, you get ₹10 off next week',
        referralCopied: 'Copied!', referralCopy: 'Copy',
        referralUsed: 'Referrals made', referralSaved: 'Total saved',
        eshramBadge: 'e-Shram Registered', employerBadge: 'Employer Sponsored',
        scoreTab: 'KavachScore', notificationsTab: 'Notifications',
        allNotifs: 'All Notifications', unread: 'unread',
        weeklyChart: 'Weekly Earnings vs Coverage', weeklyChartSub: 'Last 6 weeks',
        weeklyEarnings: 'Weekly Earnings', coverageLimit: 'Coverage Limit',
        avgWeekly: 'Avg Weekly', totalPayouts: 'Total Payouts', thisWeek: 'This Week',
        scoreGoesUp: 'How Your Score Goes Up', scoreGoesDown: 'How Your Score Goes Down',
        scoreTimeline: 'Score Timeline',
        profileTitle: 'My Profile',
        profileAccount: 'Account Details',
        profilePolicy: 'Policy Info',
        profileSettings: 'Settings',
        darkMode: 'Dark Mode',
        lightMode: 'Light Mode',
        profileLogout: 'Sign Out',
        employerPolicy: 'Employer Sponsored', individualPolicy: 'Individual Policy',
        rainAlert: 'Rain alert in your zone — Coverage active and monitoring.',
        paid: 'Paid', notPaid: 'Not enrolled at time',
        stayEnrolled: 'You received ₹', stayEnrolledSub: ' in payouts. Stay enrolled every week.',
    },
    hi: {
        brand: 'KavachPay', logout: 'लॉगआउट', hello: 'नमस्ते',
        home: 'होम', earnings: 'कमाई', score: 'KavachScore', alerts: 'अलर्ट',
        activePolicy: 'सक्रिय पॉलिसी', active: 'सक्रिय', paused: 'रुकी हुई',
        weeklyCoverage: 'साप्ताहिक कवरेज', premium: 'प्रीमियम', lastPayout: 'अंतिम भुगतान',
        avgIncome: 'औसत साप्ताहिक आय', avgDeliveries: 'औसत दैनिक डिलीवरी',
        earningsProtection: 'कमाई सुरक्षा',
        earningsSub: 'इस सप्ताह की आय बनाम साप्ताहिक औसत',
        earnedSoFar: 'अब तक कमाया',
        kavachCovers: 'KavachPay ₹',
        kavachCoversSub: ' कवर करता है आज व्यवधान होने पर',
        disruptionHistory: 'व्यवधान इतिहास',
        myPolicy: 'मेरी पॉलिसी', myClaims: 'मेरे दावे',
        loanTitle: 'तत्काल ऋण — KavachScore द्वारा',
        loanSub: 'KavachScore के आधार पर ऋण पाएं — CIBIL की जरूरत नहीं।',
        loanQualify: 'आप तक के लिए योग्य हैं',
        loanBtn: 'ऋण ऑफर देखें',
        loanLow: 'ऋण ऑफर के लिए KavachScore सुधारें।',
        loanPartner: 'KreditBee, MoneyTap & CashE के साथ',
        referralTitle: 'आपका रेफरल कोड',
        referralSub: 'मित्र के साथ साझा करें — उन्हें नामांकन, आपको ₹10 छूट',
        referralCopied: 'कॉपी हो गया!', referralCopy: 'कॉपी करें',
        referralUsed: 'किए गए रेफरल', referralSaved: 'कुल बचत',
        eshramBadge: 'e-Shram पंजीकृत', employerBadge: 'नियोक्ता प्रायोजित',
        scoreTab: 'KavachScore', notificationsTab: 'सूचनाएं',
        allNotifs: 'सभी सूचनाएं', unread: 'अपठित',
        weeklyChart: 'साप्ताहिक कमाई बनाम कवरेज', weeklyChartSub: 'पिछले 6 सप्ताह',
        weeklyEarnings: 'साप्ताहिक कमाई', coverageLimit: 'कवरेज सीमा',
        avgWeekly: 'औसत साप्ताहिक', totalPayouts: 'कुल भुगतान', thisWeek: 'इस सप्ताह',
        scoreGoesUp: 'स्कोर कैसे बढ़ता है', scoreGoesDown: 'स्कोर कैसे घटता है',
        scoreTimeline: 'स्कोर टाइमलाइन',
        profileTitle: 'मेरी प्रोफ़ाइल',
        profileAccount: 'खाता विवरण',
        profilePolicy: 'पॉलिसी जानकारी',
        profileSettings: 'सेटिंग्स',
        darkMode: 'डार्क मोड',
        lightMode: 'लाइट मोड',
        profileLogout: 'साइन आउट',
        employerPolicy: 'नियोक्ता प्रायोजित', individualPolicy: 'व्यक्तिगत पॉलिसी',
        rainAlert: 'आपके क्षेत्र में बारिश अलर्ट — कवरेज सक्रिय है।',
        paid: 'भुगतान', notPaid: 'उस समय नामांकित नहीं',
        stayEnrolled: 'आपको ₹', stayEnrolledSub: ' भुगतान मिला। हर सप्ताह नामांकित रहें।',
    },
    ta: {
        brand: 'KavachPay', logout: 'வெளியேறு', hello: 'வணக்கம்',
        home: 'முகப்பு', earnings: 'வருமானம்', score: 'KavachScore', alerts: 'எச்சரிக்கைகள்',
        activePolicy: 'செயலில் பாலிசி', active: 'செயலில்', paused: 'இடைநிறுத்தம்',
        weeklyCoverage: 'வாராந்திர கவரேஜ்', premium: 'பிரீமியம்', lastPayout: 'கடைசி பணம்',
        avgIncome: 'சராசரி வாராந்திர வருமானம்', avgDeliveries: 'சராசரி தினசரி டெலிவரி',
        earningsProtection: 'வருமான பாதுகாப்பு',
        earningsSub: 'இந்த வாரத்தின் வருமானம் vs சராசரி',
        earnedSoFar: 'இதுவரை சம்பாதித்தது',
        kavachCovers: 'KavachPay ₹',
        kavachCoversSub: ' கவர் செய்கிறது இன்று இடையூறு ஏற்பட்டால்',
        disruptionHistory: 'இடையூறு வரலாறு',
        myPolicy: 'என் பாலிசி', myClaims: 'என் கோரிக்கைகள்',
        loanTitle: 'உடனடி கடன் — KavachScore அடிப்படையில்',
        loanSub: 'KavachScore அடிப்படையில் கடன் — CIBIL தேவையில்லை.',
        loanQualify: 'நீங்கள் தகுதி பெறுகிறீர்கள்',
        loanBtn: 'கடன் சலுகைகள் காண',
        loanLow: 'கடன் சலுகைகளை திறக்க KavachScore மேம்படுத்தவும்.',
        loanPartner: 'KreditBee, MoneyTap & CashE உடன்',
        referralTitle: 'உங்கள் பரிந்துரை குறியீடு',
        referralSub: 'நண்பருடன் பகிரவும் — அவர்கள் சேர்கிறார்கள், நீங்கள் ₹10 சேமிக்கிறீர்கள்',
        referralCopied: 'நகலெடுக்கப்பட்டது!', referralCopy: 'நகல்',
        referralUsed: 'செய்த பரிந்துரைகள்', referralSaved: 'மொத்த சேமிப்பு',
        eshramBadge: 'e-Shram பதிவு', employerBadge: 'முதலாளி வழங்கல்',
        scoreTab: 'KavachScore', notificationsTab: 'அறிவிப்புகள்',
        allNotifs: 'அனைத்து அறிவிப்புகள்', unread: 'படிக்காதவை',
        weeklyChart: 'வாராந்திர வருமானம் vs கவரேஜ்', weeklyChartSub: 'கடந்த 6 வாரங்கள்',
        weeklyEarnings: 'வாராந்திர வருமானம்', coverageLimit: 'கவரேஜ் வரம்பு',
        avgWeekly: 'சராசரி வாராந்திரம்', totalPayouts: 'மொத்த பணம்', thisWeek: 'இந்த வாரம்',
        scoreGoesUp: 'ஸ்கோர் எப்படி உயரும்', scoreGoesDown: 'ஸ்கோர் எப்படி குறையும்',
        scoreTimeline: 'ஸ்கோர் காலவரிசை',
        profileTitle: 'என் சுயவிவரம்',
        profileAccount: 'கணக்கு விவரங்கள்',
        profilePolicy: 'பாலிசி தகவல்',
        profileSettings: 'அமைப்புகள்',
        darkMode: 'இருண்ட பயன்முறை',
        lightMode: 'ஒளி பயன்முறை',
        profileLogout: 'வெளியேறு',
        employerPolicy: 'முதலாளி வழங்கல்', individualPolicy: 'தனிநபர் பாலிசி',
        rainAlert: 'உங்கள் மண்டலத்தில் மழை எச்சரிக்கை — கவரேஜ் செயலில்.',
        paid: 'செலுத்தப்பட்டது', notPaid: 'அப்போது சேரவில்லை',
        stayEnrolled: '₹', stayEnrolledSub: ' பணம் பெற்றீர்கள். ஒவ்வொரு வாரமும் சேர்ந்திருங்கள்.',
    }
};

const LangToggle = ({ lang, setLang }) => (
    <div style={{ display: 'flex', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: '20px', padding: '3px', gap: '2px' }}>
        {[{ code: 'en', label: 'EN' }, { code: 'hi', label: 'हि' }, { code: 'ta', label: 'த' }].map(l => (
            <button key={l.code} onClick={() => setLang(l.code)}
                style={{ backgroundColor: lang === l.code ? 'white' : 'transparent', color: lang === l.code ? '#1A56A0' : 'white', border: 'none', padding: '5px 10px', borderRadius: '16px', cursor: 'pointer', fontSize: '11px', fontWeight: '700' }}>
                {l.label}
            </button>
        ))}
    </div>
);

export default function Dashboard({ worker, onLogout, lang, setLang }) {
    const t = T[lang] || T.en;
    const { theme, toggleTheme } = useTheme();
    const isDark = theme === 'dark';

    const bg = isDark ? '#0F1117' : '#F4F6F9';
    const cardBg = isDark ? '#1E2130' : 'white';
    const cardBorder = isDark ? '#2D3348' : '#E5E7EB';
    const textPrimary = isDark ? '#F1F5F9' : '#1A1A2E';
    const textSecondary = isDark ? '#CBD5E1' : '#374151';
    const textMuted = isDark ? '#94A3B8' : '#6B7280';
    const navBg = isDark ? '#141720' : '#1A56A0';

    const [page, setPage] = useState('dashboard');
    const [tab, setTab] = useState('home');
    const [showChat, setShowChat] = useState(false);
    const [showLoanModal, setShowLoanModal] = useState(false);
    const [referralCopied, setReferralCopied] = useState(false);
    const [animatedScore, setAnimatedScore] = useState(0);
    const [expandedNotif, setExpandedNotif] = useState(null);

    const name = worker?.name || 'Ravi Kumar';
    const zone = worker?.zone || 'Koramangala, Bangalore';
    const premium = worker?.premium || 59;
    const coverage = worker?.coverage || 1200;
    const avgIncome = worker?.avgIncome || 1800;
    const avgDeliveries = worker?.avgDeliveries || 18;
    const platform = worker?.platform || 'Swiggy';
    const policyType = worker?.policyType || 'individual';
    const referralCode = worker?.referralCode || 'RAVI-K7X2';
    const eshramId = worker?.eshramId || '';
    const referralDiscount = worker?.referralDiscount || false;
    const email = worker?.email || 'ravi@kavachpay.in';
    const phone = worker?.phone || '9876543210';
    const employeeId = worker?.employeeId || 'KOR-3847261';
    const city = worker?.city || 'Bangalore';

    const earnedSoFar = Math.round(avgIncome * 0.65);
    const remainingCoverage = Math.max(0, avgIncome - earnedSoFar);
    const earningsPercent = Math.round((earnedSoFar / avgIncome) * 100);
    const score = 780;

    useEffect(() => {
        let start = 0;
        const end = score;
        const duration = 1200;
        const step = end / (duration / 16);
        const timer = setInterval(() => {
            start += step;
            if (start >= end) { setAnimatedScore(end); clearInterval(timer); }
            else setAnimatedScore(Math.round(start));
        }, 16);
        return () => clearInterval(timer);
    }, []);

    const getScoreColor = () => score >= 750 ? '#1E7D34' : score >= 500 ? '#D97706' : '#C0392B';
    const getScoreTier = () => score >= 750 ? 'Trusted Worker' : score >= 500 ? 'Standard Worker' : 'Under Review';
    const getScoreDesc = () => score >= 750 ? 'Instant payouts • Lowest premium tier' : score >= 500 ? '2hr delay • +15% premium' : '24hr delay • Manual review';

    const getLoanAmount = () => {
        if (score >= 800) return '₹25,000';
        if (score >= 750) return '₹15,000';
        if (score >= 650) return '₹8,000';
        return null;
    };

    const earningsData = [
        { week: 'W1', earned: Math.round(avgIncome * 0.72), coverage },
        { week: 'W2', earned: Math.round(avgIncome * 0.88), coverage },
        { week: 'W3', earned: Math.round(avgIncome * 0.45), coverage },
        { week: 'W4', earned: Math.round(avgIncome * 0.91), coverage },
        { week: 'W5', earned: Math.round(avgIncome * 0.60), coverage },
        { week: 'W6', earned: earnedSoFar, coverage },
    ];

    const scoreHistory = [
        { date: 'Jan 8', score: 750 }, { date: 'Jan 22', score: 760 },
        { date: 'Feb 5', score: 770 }, { date: 'Feb 14', score: 755 },
        { date: 'Feb 28', score: 770 }, { date: 'Mar 5', score: 780 },
    ];

    const disruptionHistory = [
        { date: 'Mar 5, 2026', event: 'Heavy Rain — 82mm', severity: 'Moderate', wouldPay: Math.round(coverage * 0.65), paid: true, txn: 'pay_A3F9B2C1' },
        { date: 'Feb 28, 2026', event: 'AQI Alert — 347', severity: 'Moderate', wouldPay: Math.round(coverage * 0.65), paid: true, txn: 'pay_B4E8D3F2' },
        { date: 'Feb 14, 2026', event: 'Severe Storm — 94kmh', severity: 'Severe', wouldPay: coverage, paid: false, txn: null },
        { date: 'Jan 30, 2026', event: 'Heavy Rain — 61mm', severity: 'Minor', wouldPay: Math.round(coverage * 0.3), paid: false, txn: null },
    ];

    const totalReceived = disruptionHistory.filter(d => d.paid).reduce((a, b) => a + b.wouldPay, 0);

    const notifications = [
        {
            id: 1, type: 'payout', read: false,
            icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1E7D34" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>,
            iconBg: isDark ? '#0D2318' : '#F0FDF4', iconBorder: isDark ? '#166534' : '#BBF7D0',
            title: 'Payout Received — ₹' + Math.round(coverage * 0.65),
            msg: '₹' + Math.round(coverage * 0.65) + ' credited to your UPI ravi@upi for Heavy Rain disruption on Mar 5, 2026.',
            detail: 'Transaction ID: pay_A3F9B2C1\nEvent: Heavy Rain — 82mm in ' + zone.split(',')[0] + '\nVerification: 5/5 layers passed\nPayout tier: Moderate (65% of coverage)\nTime to payout: 1 min 42 sec',
            time: 'Today, 2:17 PM',
        },
        {
            id: 2, type: 'alert', read: false,
            icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>,
            iconBg: isDark ? '#2D2008' : '#FFFBEB', iconBorder: isDark ? '#78350F' : '#FDE68A',
            title: 'Heavy Rain Alert — ' + zone.split(',')[0],
            msg: 'IMD has forecast 68mm rainfall in your zone tonight between 8PM and 11PM. Coverage is active and monitoring automatically.',
            detail: 'Source: India Meteorological Department (IMD)\nZone: ' + zone + '\nForecast: 68mm between 8PM–11PM\nThreshold for Minor payout: 50mm\nThreshold for Moderate payout: 75mm\nAction required: None — automatic',
            time: 'Today, 11:30 AM',
        },
        {
            id: 3, type: 'payout', read: false,
            icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1E7D34" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>,
            iconBg: isDark ? '#0D2318' : '#F0FDF4', iconBorder: isDark ? '#166534' : '#BBF7D0',
            title: 'Payout Received — ₹' + Math.round(coverage * 0.65),
            msg: '₹' + Math.round(coverage * 0.65) + ' credited to ravi@upi for AQI Alert (347) on Feb 28, 2026.',
            detail: 'Transaction ID: pay_B4E8D3F2\nEvent: Severe AQI — 347 in ' + zone.split(',')[0] + '\nVerification: 5/5 layers passed\nPayout tier: Moderate (65% of coverage)\nTime to payout: 1 min 58 sec',
            time: 'Feb 28, 10:35 AM',
        },
        {
            id: 4, type: 'score', read: true,
            icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1A56A0" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="7" /><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" /></svg>,
            iconBg: isDark ? '#1E2D4A' : '#EEF4FF', iconBorder: isDark ? '#2D4070' : '#DBEAFE',
            title: 'KavachScore Updated — 780',
            msg: 'Your score increased from 770 to 780. Reason: Longest active enrollment streak bonus applied.',
            detail: 'Previous score: 770\nNew score: 780\nChange: +10 points\nReason: Consecutive 6-week enrollment streak\nCurrent tier: Trusted Worker (750+)\nBenefit: Instant payouts remain active',
            time: 'Mar 5, 2:16 PM',
        },
        {
            id: 5, type: 'policy', read: true,
            icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>,
            iconBg: isDark ? '#252A3A' : '#F9FAFB', iconBorder: isDark ? '#2D3348' : '#E5E7EB',
            title: 'Policy Renewed — ₹' + premium,
            msg: 'Your weekly policy has been renewed. ₹' + premium + ' charged to your registered payment method.',
            detail: 'Policy ID: KVP-' + phone.slice(-6) + '\nRenewal amount: ₹' + premium + '\nCoverage: ₹' + coverage + '/week\nValid: Mar 12 – Mar 19, 2026\nNext renewal: Mar 19, 2026',
            time: 'Mar 12, 12:00 AM',
        },
        {
            id: 6, type: 'referral', read: true,
            icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>,
            iconBg: isDark ? '#2D2008' : '#FFFBEB', iconBorder: isDark ? '#78350F' : '#FDE68A',
            title: 'Referral Code Used',
            msg: 'Your referral code ' + referralCode + ' was used by a new worker. ₹10 discount applied to your next renewal.',
            detail: 'Referral code: ' + referralCode + '\nUsed by: New worker in ' + zone.split(',')[0] + '\nYour discount: ₹10 off next renewal\nDiscount applied on: Next billing cycle\nTotal referrals made: 1',
            time: 'Mar 10, 3:45 PM',
        },
        {
            id: 7, type: 'loan', read: true,
            icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg>,
            iconBg: isDark ? '#1E1A2D' : '#F5F3FF', iconBorder: isDark ? '#4C1D95' : '#DDD6FE',
            title: 'New Loan Offer Unlocked',
            msg: 'Your KavachScore of 780 qualifies you for an instant loan of up to ₹15,000 from KreditBee with no CIBIL check.',
            detail: 'Eligible amount: Up to ₹15,000\nPartner: KreditBee\nInterest rate: From 1.02% per month\nKavachScore used: 780 (Trusted Worker)\nNo CIBIL score required\nApply directly on KreditBee app',
            time: 'Mar 8, 10:00 AM',
        },
        {
            id: 8, type: 'summary', read: true,
            icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1A56A0" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><line x1="3" y1="9" x2="21" y2="9" /><line x1="9" y1="21" x2="9" y2="9" /></svg>,
            iconBg: isDark ? '#1E2D4A' : '#EEF4FF', iconBorder: isDark ? '#2D4070' : '#DBEAFE',
            title: 'Weekly Summary — Mar 5–12',
            msg: 'You earned ₹' + earnedSoFar + ' this week across ' + Math.round(avgDeliveries * 7) + ' deliveries in ' + zone.split(',')[0] + '. No disruptions this week.',
            detail: 'Week: Mar 5–12, 2026\nZone: ' + zone + '\nTotal earned: ₹' + earnedSoFar + '\nDeliveries: ' + Math.round(avgDeliveries * 7) + '\nDisruptions: None\nCoverage utilised: 0%\nPolicy status: Active',
            time: 'Mar 12, 11:59 PM',
        },
    ];

    const unreadCount = notifications.filter(n => !n.read).length;

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div style={{ backgroundColor: cardBg, border: `1px solid ${cardBorder}`, borderRadius: '10px', padding: '10px 14px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
                    <p style={{ color: textMuted, fontSize: '12px', marginBottom: '6px', fontWeight: '600' }}>{label}</p>
                    {payload.map((p, i) => (
                        <p key={i} style={{ color: p.color, fontSize: '13px', fontWeight: '700' }}>{p.name}: ₹{p.value}</p>
                    ))}
                </div>
            );
        }
        return null;
    };

    const handleCopyReferral = () => {
        navigator.clipboard?.writeText(referralCode).catch(() => { });
        setReferralCopied(true);
        setTimeout(() => setReferralCopied(false), 2000);
    };

    const card = (children, mb = '14px', extra = {}) => (
        <div style={{ backgroundColor: cardBg, borderRadius: '14px', padding: '18px', marginBottom: mb, boxShadow: isDark ? '0 1px 4px rgba(0,0,0,0.3)' : '0 1px 4px rgba(0,0,0,0.05)', border: `1px solid ${cardBorder}`, transition: 'all 0.2s ease', ...extra }}>
            {children}
        </div>
    );

    const sectionTitle = (text) => (
        <p style={{ color: textPrimary, fontWeight: '700', fontSize: '14px', marginBottom: '14px', letterSpacing: '0.2px' }}>{text}</p>
    );

    if (page === 'policy') return <Policy worker={worker} onBack={() => setPage('dashboard')} lang={lang} setLang={setLang} />;
    if (page === 'claims') return <Claims worker={worker} onBack={() => setPage('dashboard')} lang={lang} setLang={setLang} />;

    // PROFILE PAGE
    if (page === 'profile') return (
        <div style={{ backgroundColor: bg, minHeight: '100vh', fontFamily: 'Inter', transition: 'background-color 0.2s ease' }}>
            <div style={{ backgroundColor: navBg, padding: '14px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1 style={{ color: 'white', fontSize: '18px', fontWeight: '800' }}>{t.brand}</h1>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <LangToggle lang={lang} setLang={setLang} />
                    <button onClick={() => setPage('dashboard')} style={{ backgroundColor: 'transparent', color: 'white', border: '1px solid rgba(255,255,255,0.3)', padding: '6px 14px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>← Back</button>
                </div>
            </div>

            <div style={{ padding: '24px 16px', maxWidth: '480px', margin: '0 auto' }}>

                {/* Profile Header */}
                <div style={{ background: 'linear-gradient(135deg, #1A56A0, #0D3B73)', borderRadius: '18px', padding: '28px', marginBottom: '16px', color: 'white', textAlign: 'center', boxShadow: '0 4px 20px rgba(26,86,160,0.3)' }}>
                    <div style={{ width: '72px', height: '72px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', border: '3px solid rgba(255,255,255,0.3)' }}>
                        <p style={{ color: 'white', fontWeight: '800', fontSize: '28px' }}>{name[0]}</p>
                    </div>
                    <p style={{ fontWeight: '800', fontSize: '20px', color: 'white', marginBottom: '4px' }}>{name}</p>
                    <p style={{ opacity: 0.7, fontSize: '13px', color: 'white', marginBottom: '12px' }}>{platform} • {zone.split(',')[0]}</p>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap' }}>
                        <div style={{ backgroundColor: 'rgba(255,255,255,0.15)', padding: '4px 12px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.2)' }}>
                            <p style={{ fontSize: '11px', fontWeight: '700', color: 'white' }}>KavachScore: {score}</p>
                        </div>
                        {eshramId && (
                            <div style={{ backgroundColor: 'rgba(240,165,0,0.3)', padding: '4px 12px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.2)' }}>
                                <p style={{ fontSize: '11px', fontWeight: '700', color: 'white' }}>{t.eshramBadge}</p>
                            </div>
                        )}
                        {policyType === 'employer' && (
                            <div style={{ backgroundColor: 'rgba(30,125,52,0.4)', padding: '4px 12px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.2)' }}>
                                <p style={{ fontSize: '11px', fontWeight: '700', color: 'white' }}>{t.employerBadge}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Account Details */}
                {card(<>
                    {sectionTitle(t.profileAccount)}
                    {[
                        { label: 'Full Name', value: name },
                        { label: 'Email', value: email },
                        { label: 'Phone', value: '+91 ' + phone },
                        { label: 'Employee ID', value: employeeId },
                        { label: 'Platform', value: platform },
                        { label: 'City', value: city },
                        { label: 'Zone', value: zone },
                        ...(eshramId ? [{ label: 'e-Shram UAN', value: eshramId }] : []),
                    ].map((item, i, arr) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: i < arr.length - 1 ? `1px solid ${cardBorder}` : 'none' }}>
                            <p style={{ color: textMuted, fontSize: '13px' }}>{item.label}</p>
                            <p style={{ color: textPrimary, fontWeight: '600', fontSize: '13px', textAlign: 'right', maxWidth: '60%' }}>{item.value}</p>
                        </div>
                    ))}
                </>)}

                {/* Policy Info */}
                {card(<>
                    {sectionTitle(t.profilePolicy)}
                    {[
                        { label: 'Policy ID', value: 'KVP-' + phone.slice(-6) },
                        { label: 'Policy Type', value: policyType === 'individual' ? t.individualPolicy : t.employerPolicy },
                        { label: 'Weekly Premium', value: policyType === 'employer' ? 'FREE' : '₹' + premium },
                        { label: 'Weekly Coverage', value: '₹' + coverage },
                        { label: 'KavachScore', value: score + ' — ' + getScoreTier() },
                        { label: 'Referral Code', value: referralCode },
                    ].map((item, i, arr) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: i < arr.length - 1 ? `1px solid ${cardBorder}` : 'none' }}>
                            <p style={{ color: textMuted, fontSize: '13px' }}>{item.label}</p>
                            <p style={{ color: textPrimary, fontWeight: '600', fontSize: '13px' }}>{item.value}</p>
                        </div>
                    ))}
                </>)}

                {/* Settings */}
                {card(<>
                    {sectionTitle(t.profileSettings)}

                    {/* Dark Mode Toggle */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: `1px solid ${cardBorder}` }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: isDark ? (isDark ? '#252A3A' : '#F3F4F6') : '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {isDark
                                    ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={textMuted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" /></svg>
                                    : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={textMuted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>
                                }
                            </div>
                            <div>
                                <p style={{ color: textPrimary, fontWeight: '600', fontSize: '14px' }}>{isDark ? t.lightMode : t.darkMode}</p>
                                <p style={{ color: textMuted, fontSize: '12px', marginTop: '2px' }}>{isDark ? 'Switch to light theme' : 'Switch to dark theme'}</p>
                            </div>
                        </div>
                        <button onClick={toggleTheme}
                            style={{ width: '48px', height: '26px', borderRadius: '13px', backgroundColor: isDark ? '#1A56A0' : '#E5E7EB', border: 'none', cursor: 'pointer', position: 'relative', transition: 'background-color 0.2s ease' }}>
                            <div style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: 'white', position: 'absolute', top: '3px', left: isDark ? '25px' : '3px', transition: 'left 0.2s ease', boxShadow: '0 1px 4px rgba(0,0,0,0.2)' }} />
                        </button>
                    </div>

                    {/* Language */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: `1px solid ${cardBorder}` }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: isDark ? '#252A3A' : '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={textMuted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>
                            </div>
                            <div>
                                <p style={{ color: textPrimary, fontWeight: '600', fontSize: '14px' }}>Language</p>
                                <p style={{ color: textMuted, fontSize: '12px', marginTop: '2px' }}>EN / हि / த</p>
                            </div>
                        </div>
                        <LangToggle lang={lang} setLang={setLang} />
                    </div>

                    {/* Sign Out */}
                    <div style={{ paddingTop: '12px' }}>
                        <button onClick={onLogout}
                            style={{ width: '100%', backgroundColor: isDark ? '#2D0F0F' : '#FEF2F2', color: '#F87171', padding: '13px', borderRadius: '10px', border: `1px solid ${isDark ? '#7F1D1D' : '#FECACA'}`, fontSize: '14px', fontWeight: '700', cursor: 'pointer' }}>
                            {t.profileLogout}
                        </button>
                    </div>
                </>)}
            </div>
        </div>
    );

    // MAIN DASHBOARD
    return (
        <div style={{ backgroundColor: bg, minHeight: '100vh', fontFamily: 'Inter', paddingBottom: '80px', transition: 'background-color 0.2s ease' }}>

            {/* Loan Modal */}
            {showLoanModal && (
                <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowLoanModal(false)}>
                    <div className="modal-content" style={{ backgroundColor: cardBg }}>
                        <div style={{ backgroundColor: '#1A56A0', padding: '18px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <p style={{ color: 'white', fontWeight: '700', fontSize: '15px' }}>Loan Eligibility — KavachScore</p>
                            <button onClick={() => setShowLoanModal(false)} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', width: '28px', height: '28px', borderRadius: '50%', cursor: 'pointer', fontSize: '14px' }}>✕</button>
                        </div>
                        <div style={{ padding: '20px', overflowY: 'auto', maxHeight: '60vh' }}>
                            <div style={{ backgroundColor: isDark ? '#1E2D4A' : '#EEF4FF', borderRadius: '12px', padding: '16px', marginBottom: '16px', textAlign: 'center', border: `1px solid ${isDark ? '#2D4070' : '#DBEAFE'}` }}>
                                <p style={{ color: textMuted, fontSize: '12px', marginBottom: '4px' }}>YOUR KAVACHSCORE</p>
                                <p style={{ color: '#1A56A0', fontWeight: '800', fontSize: '40px', letterSpacing: '-1px' }}>{score}</p>
                                <p style={{ color: '#1E7D34', fontSize: '13px', fontWeight: '600', marginTop: '4px' }}>Trusted Worker — Premium loan eligible</p>
                            </div>
                            {[
                                { name: 'KreditBee', amount: '₹10,000 – ₹2,00,000', rate: '1.02% per month', color: '#1A56A0', bg: isDark ? '#1E2D4A' : '#EEF4FF', border: isDark ? '#2D4070' : '#DBEAFE' },
                                { name: 'MoneyTap', amount: '₹3,000 – ₹5,00,000', rate: '1.08% per month', color: '#1E7D34', bg: isDark ? '#0D2318' : '#F0FDF4', border: isDark ? '#166534' : '#BBF7D0' },
                                { name: 'CashE', amount: '₹5,000 – ₹4,00,000', rate: '2.50% per month', color: '#D97706', bg: isDark ? '#2D2008' : '#FFFBEB', border: isDark ? '#78350F' : '#FDE68A' },
                            ].map((partner, i) => (
                                <div key={i} style={{ backgroundColor: partner.bg, borderRadius: '12px', padding: '14px 16px', marginBottom: '10px', border: `1px solid ${partner.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
                                    <div>
                                        <p style={{ color: partner.color, fontWeight: '700', fontSize: '14px' }}>{partner.name}</p>
                                        <p style={{ color: textMuted, fontSize: '12px', marginTop: '2px' }}>{partner.amount}</p>
                                        <p style={{ color: textMuted, fontSize: '11px', marginTop: '2px' }}>{partner.rate}</p>
                                    </div>
                                    <div style={{ backgroundColor: partner.color, color: 'white', padding: '7px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: '700' }}>Apply →</div>
                                </div>
                            ))}
                            <div style={{ backgroundColor: isDark ? '#252A3A' : '#F9FAFB', borderRadius: '10px', padding: '12px', marginTop: '8px', border: `1px solid ${cardBorder}` }}>
                                <p style={{ color: textMuted, fontSize: '11px', lineHeight: 1.6 }}>KavachPay is not a lender. We share your KavachScore with partner platforms who make independent lending decisions. Loans subject to each partner's terms.</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Navbar */}
            <div style={{ backgroundColor: navBg, padding: '14px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'background-color 0.2s ease' }}>
                <h1 style={{ color: 'white', fontSize: '18px', fontWeight: '800' }}>{t.brand}</h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <LangToggle lang={lang} setLang={setLang} />
                    {/* Avatar — opens profile */}
                    <button onClick={() => setPage('profile')}
                        style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.2)', border: '2px solid rgba(255,255,255,0.4)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '800', fontSize: '14px' }}>
                        {name[0]}
                    </button>
                </div>
            </div>

            {/* Alert Banner */}
            <div style={{ backgroundColor: isDark ? '#2D2008' : '#FFFBEB', borderLeft: '4px solid #D97706', padding: '11px 24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#D97706', flexShrink: 0 }} />
                <p style={{ color: isDark ? '#FCD34D' : '#92400E', fontSize: '13px', fontWeight: '600' }}>{t.rainAlert}</p>
            </div>

            {/* Tab Bar */}
            <div style={{ backgroundColor: cardBg, display: 'flex', borderBottom: `1px solid ${cardBorder}`, overflowX: 'auto', transition: 'background-color 0.2s ease' }}>
                {[
                    { key: 'home', label: t.home },
                    { key: 'earnings', label: t.earnings },
                    { key: 'score', label: t.scoreTab },
                    { key: 'notifications', label: `${t.notificationsTab}${unreadCount > 0 ? ' (' + unreadCount + ')' : ''}` },
                ].map(tb => (
                    <button key={tb.key} onClick={() => setTab(tb.key)}
                        style={{ padding: '14px 20px', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', fontWeight: tab === tb.key ? '700' : '500', color: tab === tb.key ? '#1A56A0' : textMuted, borderBottom: tab === tb.key ? '2px solid #1A56A0' : '2px solid transparent', fontSize: '13px', whiteSpace: 'nowrap', fontFamily: 'Inter' }}>
                        {tb.label}
                    </button>
                ))}
            </div>

            <div style={{ padding: '18px 16px', maxWidth: '520px', margin: '0 auto' }}>

                {/* HOME TAB */}
                {tab === 'home' && (
                    <div className="fade-in">

                        {/* Policy Card */}
                        <div style={{ background: 'linear-gradient(135deg, #1A56A0, #0D3B73)', borderRadius: '18px', padding: '22px', marginBottom: '14px', color: 'white', boxShadow: '0 4px 20px rgba(26,86,160,0.3)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '18px' }}>
                                <div>
                                    <p style={{ opacity: 0.7, fontSize: '11px', letterSpacing: '0.8px', textTransform: 'uppercase', color: 'white' }}>{t.activePolicy}</p>
                                    <p style={{ fontWeight: '800', fontSize: '18px', marginTop: '4px', color: 'white' }}>{name}</p>
                                    <p style={{ opacity: 0.65, fontSize: '12px', marginTop: '3px', color: 'white' }}>{platform} • {zone.split(',')[0]}</p>
                                    <div style={{ display: 'flex', gap: '6px', marginTop: '8px', flexWrap: 'wrap' }}>
                                        {policyType === 'employer' && (
                                            <div style={{ backgroundColor: 'rgba(30,125,52,0.4)', padding: '3px 10px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.2)' }}>
                                                <p style={{ fontSize: '10px', fontWeight: '700', color: 'white' }}>{t.employerBadge}</p>
                                            </div>
                                        )}
                                        {eshramId && (
                                            <div style={{ backgroundColor: 'rgba(240,165,0,0.3)', padding: '3px 10px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.2)' }}>
                                                <p style={{ fontSize: '10px', fontWeight: '700', color: 'white' }}>{t.eshramBadge}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div style={{ backgroundColor: 'rgba(30,125,52,0.9)', padding: '4px 12px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.2)' }}>
                                    <p style={{ fontSize: '11px', fontWeight: '700', letterSpacing: '0.5px', color: 'white' }}>{t.active}</p>
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '8px' }}>
                                {[
                                    { label: t.weeklyCoverage, value: '₹' + coverage },
                                    { label: t.premium, value: policyType === 'employer' ? 'FREE' : '₹' + premium },
                                    { label: t.avgIncome, value: '₹' + avgIncome },
                                    { label: t.avgDeliveries, value: avgDeliveries + '/day' },
                                ].map((s, i) => (
                                    <div key={i} style={{ backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '10px', padding: '10px 8px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.08)' }}>
                                        <p style={{ fontWeight: '800', fontSize: '14px', color: 'white' }}>{s.value}</p>
                                        <p style={{ opacity: 0.65, fontSize: '9px', marginTop: '3px', color: 'white', lineHeight: 1.3 }}>{s.label}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Loan Banner */}
                        {getLoanAmount() ? (
                            card(<>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div style={{ flex: 1 }}>
                                        <p style={{ color: '#1A56A0', fontWeight: '700', fontSize: '14px', marginBottom: '3px' }}>{t.loanTitle}</p>
                                        <p style={{ color: textMuted, fontSize: '12px', marginBottom: '8px' }}>{t.loanSub}</p>
                                        <p style={{ color: textSecondary, fontSize: '13px' }}>
                                            {t.loanQualify} <span style={{ color: '#1E7D34', fontWeight: '800', fontSize: '16px' }}>{getLoanAmount()}</span>
                                        </p>
                                        <p style={{ color: textMuted, fontSize: '11px', marginTop: '4px' }}>{t.loanPartner}</p>
                                    </div>
                                    <div style={{ width: '44px', height: '44px', borderRadius: '12px', backgroundColor: isDark ? '#1E2D4A' : '#EEF4FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginLeft: '12px' }}>
                                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1A56A0" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
                                    </div>
                                </div>
                                <button onClick={() => setShowLoanModal(true)}
                                    style={{ width: '100%', backgroundColor: '#1A56A0', color: 'white', padding: '10px', borderRadius: '8px', border: 'none', fontSize: '13px', fontWeight: '700', cursor: 'pointer', marginTop: '12px' }}>
                                    {t.loanBtn}
                                </button>
                            </>, '14px', { borderLeft: '4px solid #1A56A0' })
                        ) : (
                            card(<p style={{ color: isDark ? '#FBBF24' : '#92400E', fontSize: '13px' }}>{t.loanLow}</p>, '14px', { backgroundColor: isDark ? '#2D2008' : '#FFFBEB', borderLeft: '4px solid #D97706' })
                        )}

                        {/* Referral Code */}
                        {card(<>
                            <p style={{ color: textPrimary, fontWeight: '700', fontSize: '14px', marginBottom: '3px' }}>{t.referralTitle}</p>
                            <p style={{ color: textMuted, fontSize: '12px', marginBottom: '14px' }}>{t.referralSub}</p>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '12px' }}>
                                <div style={{ flex: 1, backgroundColor: isDark ? '#252A3A' : '#F9FAFB', borderRadius: '10px', padding: '12px 16px', border: `1.5px dashed ${isDark ? '#2D4070' : '#DBEAFE'}`, textAlign: 'center' }}>
                                    <p style={{ color: '#1A56A0', fontWeight: '800', fontSize: '18px', letterSpacing: '2px' }}>{referralCode}</p>
                                </div>
                                <button onClick={handleCopyReferral}
                                    style={{ backgroundColor: referralCopied ? '#1E7D34' : '#1A56A0', color: 'white', padding: '12px 16px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '700', whiteSpace: 'nowrap' }}>
                                    {referralCopied ? t.referralCopied : t.referralCopy}
                                </button>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                <div style={{ backgroundColor: isDark ? '#1E2D4A' : '#EEF4FF', borderRadius: '8px', padding: '10px', textAlign: 'center', border: `1px solid ${isDark ? '#2D4070' : '#DBEAFE'}` }}>
                                    <p style={{ color: '#1A56A0', fontWeight: '800', fontSize: '18px' }}>0</p>
                                    <p style={{ color: textMuted, fontSize: '11px', marginTop: '2px' }}>{t.referralUsed}</p>
                                </div>
                                <div style={{ backgroundColor: isDark ? '#0D2318' : '#F0FDF4', borderRadius: '8px', padding: '10px', textAlign: 'center', border: `1px solid ${isDark ? '#166534' : '#BBF7D0'}` }}>
                                    <p style={{ color: '#1E7D34', fontWeight: '800', fontSize: '18px' }}>₹{referralDiscount ? 10 : 0}</p>
                                    <p style={{ color: textMuted, fontSize: '11px', marginTop: '2px' }}>{t.referralSaved}</p>
                                </div>
                            </div>
                        </>)}

                        {/* Earnings Meter */}
                        {card(<>
                            <p style={{ color: textPrimary, fontWeight: '700', fontSize: '14px', marginBottom: '4px' }}>{t.earningsProtection}</p>
                            <p style={{ color: textMuted, fontSize: '12px', marginBottom: '14px' }}>{t.earningsSub}</p>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <p style={{ color: textMuted, fontSize: '13px' }}>{t.earnedSoFar}</p>
                                <p style={{ color: '#1A56A0', fontWeight: '700', fontSize: '13px' }}>₹{earnedSoFar} / ₹{avgIncome}</p>
                            </div>
                            <div style={{ backgroundColor: isDark ? '#252A3A' : '#F3F4F6', borderRadius: '8px', height: '10px', overflow: 'hidden', marginBottom: '10px' }}>
                                <div style={{ width: `${earningsPercent}%`, height: '100%', backgroundColor: earningsPercent >= 80 ? '#1E7D34' : earningsPercent >= 50 ? '#D97706' : '#C0392B', borderRadius: '8px', transition: 'width 0.8s ease' }} />
                            </div>
                            <div style={{ backgroundColor: isDark ? '#1E2D4A' : '#EEF4FF', borderRadius: '10px', padding: '10px 12px', border: `1px solid ${isDark ? '#2D4070' : '#DBEAFE'}` }}>
                                <p style={{ color: '#1A56A0', fontSize: '13px', fontWeight: '600' }}>
                                    {t.kavachCovers}{remainingCoverage}{t.kavachCoversSub}
                                </p>
                            </div>
                        </>)}

                        {/* Disruption History */}
                        {card(<>
                            <p style={{ color: textPrimary, fontWeight: '700', fontSize: '14px', marginBottom: '14px' }}>{t.disruptionHistory}</p>
                            {disruptionHistory.map((d, i) => (
                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', borderRadius: '10px', marginBottom: '6px', backgroundColor: d.paid ? (isDark ? '#0D2318' : '#F0FDF4') : (isDark ? '#252A3A' : '#F9FAFB'), border: `1px solid ${d.paid ? (isDark ? '#166534' : '#BBF7D0') : cardBorder}` }}>
                                    <div>
                                        <p style={{ color: textPrimary, fontWeight: '600', fontSize: '13px' }}>{d.event}</p>
                                        <p style={{ color: textMuted, fontSize: '11px', marginTop: '2px' }}>{d.date} • {d.severity}</p>
                                        {d.txn && <p style={{ color: textMuted, fontSize: '10px', marginTop: '2px', opacity: 0.6 }}>Txn: {d.txn}</p>}
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <p style={{ color: d.paid ? '#1E7D34' : '#C0392B', fontWeight: '800', fontSize: '14px' }}>
                                            {d.paid ? '+₹' + d.wouldPay : '—'}
                                        </p>
                                        <p style={{ color: textMuted, fontSize: '11px', marginTop: '2px' }}>{d.paid ? t.paid : t.notPaid}</p>
                                    </div>
                                </div>
                            ))}
                            <div style={{ backgroundColor: isDark ? '#2D2008' : '#FFFBEB', borderRadius: '10px', padding: '10px 12px', marginTop: '8px', border: `1px solid ${isDark ? '#78350F' : '#FDE68A'}` }}>
                                <p style={{ color: isDark ? '#FCD34D' : '#92400E', fontSize: '12px', fontWeight: '600' }}>
                                    {t.stayEnrolled}{totalReceived}{t.stayEnrolledSub}
                                </p>
                            </div>
                        </>)}

                        {/* Quick Actions */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                            <button onClick={() => setPage('policy')}
                                style={{ backgroundColor: cardBg, color: '#1A56A0', padding: '16px', borderRadius: '12px', border: `1.5px solid ${isDark ? '#2D4070' : '#DBEAFE'}`, fontWeight: '700', cursor: 'pointer', fontSize: '14px', fontFamily: 'Inter' }}>
                                {t.myPolicy}
                            </button>
                            <button onClick={() => setPage('claims')}
                                style={{ backgroundColor: cardBg, color: '#1A56A0', padding: '16px', borderRadius: '12px', border: `1.5px solid ${isDark ? '#2D4070' : '#DBEAFE'}`, fontWeight: '700', cursor: 'pointer', fontSize: '14px', fontFamily: 'Inter' }}>
                                {t.myClaims}
                            </button>
                        </div>
                    </div>
                )}

                {/* EARNINGS TAB */}
                {tab === 'earnings' && (
                    <div className="fade-in">
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '16px' }}>
                            {[
                                { label: t.avgWeekly, value: '₹' + avgIncome, color: '#1A56A0', bg: isDark ? '#1E2D4A' : '#EEF4FF', border: isDark ? '#2D4070' : '#DBEAFE' },
                                { label: t.totalPayouts, value: '₹' + totalReceived, color: '#1E7D34', bg: isDark ? '#0D2318' : '#F0FDF4', border: isDark ? '#166534' : '#BBF7D0' },
                                { label: t.thisWeek, value: '₹' + earnedSoFar, color: '#D97706', bg: isDark ? '#2D2008' : '#FFFBEB', border: isDark ? '#78350F' : '#FDE68A' },
                            ].map((s, i) => (
                                <div key={i} style={{ backgroundColor: s.bg, borderRadius: '12px', padding: '14px', textAlign: 'center', border: `1px solid ${s.border}` }}>
                                    <p style={{ color: s.color, fontWeight: '800', fontSize: '16px' }}>{s.value}</p>
                                    <p style={{ color: textMuted, fontSize: '11px', marginTop: '4px' }}>{s.label}</p>
                                </div>
                            ))}
                        </div>

                        {card(<>
                            <p style={{ color: textPrimary, fontWeight: '700', fontSize: '14px', marginBottom: '4px' }}>{t.weeklyChart}</p>
                            <p style={{ color: textMuted, fontSize: '12px', marginBottom: '16px' }}>{t.weeklyChartSub}</p>
                            <ResponsiveContainer width="100%" height={200}>
                                <BarChart data={earningsData} barGap={4}>
                                    <XAxis dataKey="week" tick={{ fontSize: 11, fill: textMuted }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fontSize: 10, fill: textMuted }} axisLine={false} tickLine={false} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Bar dataKey="earned" fill="#1A56A0" radius={[4, 4, 0, 0]} name={t.weeklyEarnings} />
                                    <Bar dataKey="coverage" fill={isDark ? '#2D4070' : '#BFDBFE'} radius={[4, 4, 0, 0]} name={t.coverageLimit} />
                                </BarChart>
                            </ResponsiveContainer>
                        </>)}
                    </div>
                )}

                {/* KAVACHSCORE TAB */}
                {tab === 'score' && (
                    <div className="fade-in">
                        {card(<>
                            <div style={{ textAlign: 'center', padding: '10px 0' }}>
                                <div style={{ width: '120px', height: '120px', borderRadius: '50%', border: `8px solid ${getScoreColor()}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', boxShadow: `0 0 28px ${getScoreColor()}30` }}>
                                    <p style={{ fontSize: '32px', fontWeight: '800', color: getScoreColor(), lineHeight: 1 }}>{animatedScore}</p>
                                    <p style={{ fontSize: '10px', color: textMuted, marginTop: '2px' }}>/ 900</p>
                                </div>
                                <p style={{ color: getScoreColor(), fontWeight: '700', fontSize: '16px' }}>{getScoreTier()}</p>
                                <p style={{ color: textMuted, fontSize: '13px', marginTop: '5px' }}>{getScoreDesc()}</p>
                            </div>
                        </>)}

                        {card(<>
                            <p style={{ color: textPrimary, fontWeight: '700', fontSize: '14px', marginBottom: '14px' }}>{t.scoreGoesUp}</p>
                            {[
                                { action: 'Legitimate claim verified', points: '+10 pts', desc: 'All 5 verification layers passed' },
                                { action: 'Weekly active streak', points: '+5 pts', desc: 'Stay enrolled and active each week' },
                                { action: 'Long tenure bonus', points: '+15 pts', desc: 'Every 6 months enrolled continuously' },
                                { action: 'Zero fraud flags', points: '+8 pts', desc: 'Clean record for 30 consecutive days' },
                            ].map((item, i) => (
                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', backgroundColor: isDark ? '#0D2318' : '#F0FDF4', border: `1px solid ${isDark ? '#166534' : '#BBF7D0'}`, borderRadius: '10px', marginBottom: '8px' }}>
                                    <div>
                                        <p style={{ color: '#1E7D34', fontWeight: '600', fontSize: '13px' }}>{item.action}</p>
                                        <p style={{ color: textMuted, fontSize: '11px', marginTop: '2px' }}>{item.desc}</p>
                                    </div>
                                    <p style={{ color: '#1E7D34', fontWeight: '800', fontSize: '14px', marginLeft: '12px' }}>{item.points}</p>
                                </div>
                            ))}
                        </>)}

                        {card(<>
                            <p style={{ color: textPrimary, fontWeight: '700', fontSize: '14px', marginBottom: '14px' }}>{t.scoreGoesDown}</p>
                            {[
                                { action: 'Suspicious claim pattern', points: '-25 pts', desc: 'Multiple claims in short time window' },
                                { action: 'Active during disruption', points: '-20 pts', desc: 'Deliveries detected during payout window' },
                                { action: 'Missed self declaration', points: '-5 pts', desc: 'Did not confirm disruption when prompted' },
                                { action: 'Policy lapse', points: '-10 pts', desc: 'Enrollment gap of more than 2 weeks' },
                            ].map((item, i) => (
                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', backgroundColor: isDark ? '#2D0F0F' : '#FEF2F2', border: `1px solid ${isDark ? '#7F1D1D' : '#FECACA'}`, borderRadius: '10px', marginBottom: '8px' }}>
                                    <div>
                                        <p style={{ color: isDark ? '#F87171' : '#C0392B', fontWeight: '600', fontSize: '13px' }}>{item.action}</p>
                                        <p style={{ color: textMuted, fontSize: '11px', marginTop: '2px' }}>{item.desc}</p>
                                    </div>
                                    <p style={{ color: isDark ? '#F87171' : '#C0392B', fontWeight: '800', fontSize: '14px', marginLeft: '12px' }}>{item.points}</p>
                                </div>
                            ))}
                        </>)}

                        {card(<>
                            <p style={{ color: textPrimary, fontWeight: '700', fontSize: '14px', marginBottom: '4px' }}>{t.scoreTimeline}</p>
                            <p style={{ color: textMuted, fontSize: '12px', marginBottom: '16px' }}>Last 2 months</p>
                            <ResponsiveContainer width="100%" height={180}>
                                <LineChart data={scoreHistory}>
                                    <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#2D3348' : '#F3F4F6'} />
                                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: textMuted }} axisLine={false} tickLine={false} />
                                    <YAxis domain={[700, 820]} tick={{ fontSize: 11, fill: textMuted }} axisLine={false} tickLine={false} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Line type="monotone" dataKey="score" stroke="#1A56A0" strokeWidth={3} dot={{ fill: '#1A56A0', r: 5, strokeWidth: 0 }} name="KavachScore" />
                                </LineChart>
                            </ResponsiveContainer>
                        </>)}
                    </div>
                )}

                {/* NOTIFICATIONS TAB */}
                {tab === 'notifications' && (
                    <div className="fade-in">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                            <p style={{ color: textPrimary, fontWeight: '700', fontSize: '15px' }}>{t.allNotifs}</p>
                            {unreadCount > 0 && (
                                <div style={{ backgroundColor: '#C0392B', borderRadius: '12px', padding: '3px 10px' }}>
                                    <p style={{ color: 'white', fontSize: '11px', fontWeight: '700' }}>{unreadCount} {t.unread}</p>
                                </div>
                            )}
                        </div>
                        {notifications.map((n, i) => (
                            <div key={i} onClick={() => setExpandedNotif(expandedNotif === i ? null : i)}
                                style={{ backgroundColor: cardBg, borderRadius: '14px', padding: '16px', marginBottom: '10px', boxShadow: isDark ? '0 1px 4px rgba(0,0,0,0.3)' : '0 1px 4px rgba(0,0,0,0.05)', border: `1px solid ${n.read ? cardBorder : (isDark ? '#2D4070' : '#DBEAFE')}`, cursor: 'pointer', opacity: n.read ? 0.9 : 1, transition: 'all 0.2s ease' }}>
                                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                                    <div style={{ width: '38px', height: '38px', borderRadius: '10px', backgroundColor: n.iconBg, border: `1px solid ${n.iconBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        {n.icon}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                            <p style={{ color: textPrimary, fontWeight: '700', fontSize: '13px' }}>{n.title}</p>
                                            {!n.read && <div style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#C0392B', flexShrink: 0 }} />}
                                        </div>
                                        <p style={{ color: textMuted, fontSize: '12px', lineHeight: 1.5 }}>{n.msg}</p>
                                        <p style={{ color: textMuted, fontSize: '11px', marginTop: '6px', opacity: 0.7 }}>{n.time}</p>
                                        {expandedNotif === i && (
                                            <div className="fade-in" style={{ backgroundColor: isDark ? '#252A3A' : '#F9FAFB', borderRadius: '8px', padding: '12px', marginTop: '10px', border: `1px solid ${cardBorder}` }}>
                                                {n.detail.split('\n').map((line, j) => (
                                                    <p key={j} style={{ color: textMuted, fontSize: '12px', lineHeight: 1.7 }}>{line}</p>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Bottom Nav */}
            <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, backgroundColor: cardBg, borderTop: `1px solid ${cardBorder}`, padding: '10px 20px', display: 'flex', justifyContent: 'space-around', zIndex: 100, transition: 'background-color 0.2s ease' }}>
                {[
                    { label: t.home, key: 'home', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg> },
                    { label: t.earnings, key: 'earnings', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg> },
                    { label: t.scoreTab, key: 'score', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="7" /><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" /></svg> },
                    { label: t.notificationsTab, key: 'notifications', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg> },
                ].map(tb => (
                    <button key={tb.key} onClick={() => setTab(tb.key)}
                        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 12px', color: tab === tb.key ? '#1A56A0' : textMuted, fontFamily: 'Inter' }}>
                        {tb.icon}
                        <p style={{ fontSize: '10px', fontWeight: tab === tb.key ? '700' : '500' }}>{tb.label}</p>
                    </button>
                ))}
            </div>

            {/* Chatbot */}
            <button onClick={() => setShowChat(prev => !prev)}
                style={{ position: 'fixed', bottom: '80px', right: '20px', backgroundColor: '#1A56A0', color: 'white', width: '50px', height: '50px', borderRadius: '50%', border: 'none', cursor: 'pointer', boxShadow: '0 4px 16px rgba(26,86,160,0.35)', zIndex: 99, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
            </button>
            {showChat && <Chatbot onClose={() => setShowChat(false)} lang={lang} />}
        </div>
    );
}