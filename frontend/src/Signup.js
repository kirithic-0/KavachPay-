import React, { useState } from 'react';
import { KavachLogo } from './App';

// ─── API CONFIG (Person 2 — set REACT_APP_API_URL in .env) ───
const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// ─── API CALLS (Person 2 — uncomment each when backend is ready) ───
const api = {
    checkUnique: async (field, value) => {
        try {
            return await fetch(`${API_BASE}/api/auth/check-unique`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ field, value })
            }).then(r => r.json());
        } catch (e) { return { available: true }; }
    },
    verifyOtp: async (phone, otp) => {
        try {
            return await fetch(`${API_BASE}/api/auth/verify-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone, otp })
            }).then(r => r.json());
        } catch (e) { return { success: otp === '1234' }; }
    },
    sendOtp: async (phone) => {
        try {
            return await fetch(`${API_BASE}/api/auth/send-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone })
            }).then(r => r.json());
        } catch (e) { return { success: true }; }
    },
    connectPlatform: async (employeeId, phone, platform) => {
        const MOCK_API = process.env.REACT_APP_MOCK_API_URL || 'http://localhost:5001';
        try {
            return await fetch(`${MOCK_API}/mock/platform/connect`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ employee_id: employeeId, phone, platform })
            }).then(r => r.json());
        } catch (e) { return { success: false, error: 'Network error connecting to platform.' }; }
    },
    register: async (workerData) => {
        try {
            return await fetch(`${API_BASE}/api/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(workerData)
            }).then(r => r.json());
        } catch (e) { return { success: false, error: 'Network error registering.' }; }
    },
};

const CITY_ZONES = {
    'Chennai': ['Adyar', 'Velachery', 'Tambaram', 'Anna Nagar', 'T Nagar', 'Porur', 'Sholinganallur', 'Perambur', 'Chromepet', 'Ambattur'],
    'Mumbai': ['Dharavi', 'Kurla', 'Andheri', 'Bandra West', 'Powai', 'Borivali', 'Thane', 'Navi Mumbai', 'Malad', 'Goregaon'],
    'Bangalore': ['Koramangala', 'Whitefield', 'HSR Layout', 'Indiranagar', 'Marathahalli', 'Hebbal', 'Electronic City', 'JP Nagar', 'Rajajinagar', 'Yelahanka'],
    'Delhi': ['Connaught Place', 'Lajpat Nagar', 'Dwarka', 'Rohini', 'Saket', 'Pitampura', 'Janakpuri', 'Karol Bagh', 'Nehru Place', 'Vasant Kunj'],
    'Noida': ['Sector 18', 'Sector 62', 'Sector 137', 'Sector 50', 'Greater Noida West'],
    'Gurgaon': ['Cyber City', 'Sohna Road', 'Golf Course Road', 'MG Road', 'Palam Vihar'],
    'Hyderabad': ['Banjara Hills', 'Jubilee Hills', 'Secunderabad', 'Madhapur', 'Kukatpally', 'LB Nagar', 'Dilsukhnagar', 'Ameerpet'],
    'Pune': ['Kothrud', 'Hinjewadi', 'Wakad', 'Viman Nagar', 'Hadapsar', 'Pimpri', 'Chinchwad', 'Aundh'],
    'Kolkata': ['Salt Lake', 'Park Street', 'Howrah', 'Dum Dum', 'Newtown', 'Behala', 'Jadavpur'],
    'Ahmedabad': ['Navrangpura', 'Satellite', 'Bopal', 'Maninagar', 'Prahlad Nagar', 'Vastrapur'],
    'Coimbatore': ['RS Puram', 'Gandhipuram', 'Peelamedu', 'Saibaba Colony'],
    'Mysuru': ['Vijayanagar', 'Kuvempunagar', 'Hebbal', 'Nazarbad'],
    'Nagpur': ['Dharampeth', 'Sitabuldi', 'Manish Nagar', 'Hingna'],
    'Surat': ['Adajan', 'Vesu', 'Citylight', 'Katargam'],
    'Jaipur': ['Vaishali Nagar', 'Malviya Nagar', 'C-Scheme', 'Mansarovar'],
    'Kochi': ['Kakkanad', 'Edapally', 'Aluva', 'Vyttila'],
    'Indore': ['Vijay Nagar', 'Palasia', 'Scheme 54', 'AB Road'],
    'Bhopal': ['MP Nagar', 'Arera Colony', 'Kolar Road', 'Habibganj'],
    'Ludhiana': ['Model Town', 'Sarabha Nagar', 'BRS Nagar', 'Dugri'],
    'Vizag': ['Gajuwaka', 'Madhurawada', 'MVP Colony', 'Rushikonda'],
};

const HIGH_RISK = ['Mumbai', 'Kolkata', 'Chennai'];
const LOW_RISK = ['Bangalore', 'Hyderabad', 'Pune', 'Mysuru'];
const getCityRisk = (city) => HIGH_RISK.includes(city) ? 'high' : LOW_RISK.includes(city) ? 'low' : 'medium';
const ZONE_PREMIUM = { high: { premium: 74, coverage: 1560 }, medium: { premium: 59, coverage: 1200 }, low: { premium: 49, coverage: 980 } };

const generateReferralCode = (name) => {
    const prefix = name.split(' ')[0].toUpperCase().slice(0, 4);
    const suffix = Math.random().toString(36).substr(2, 4).toUpperCase();
    return `${prefix}-${suffix}`;
};

const T = {
    en: {
        brand: 'KavachPay', back: 'Back',
        step1: 'Personal Details', step2: 'Zone & Platform', step3: 'Review & Pay',
        policyType: 'Policy Type',
        individual: 'Individual', individualDesc: 'You pay your own premium',
        employer: 'Employer Sponsored', employerDesc: 'Your employer pays',
        employerName: 'Employer Name', employerEmail: 'Employer Email',
        fullName: 'Full Name', namePh: 'e.g. Ravi Kumar',
        email: 'Email Address', emailPh: 'your@email.com',
        phone: 'Phone Number', phonePh: '10-digit mobile number',
        sendOtp: 'Send OTP', verifyOtp: 'Verify', resendOtp: 'Resend',
        otpSent: 'OTP sent to', otpPh: 'Enter 4-digit OTP',
        phoneVerified: 'Phone verified successfully',
        age: 'Age', agePh: 'e.g. 26',
        aadhaar: 'Aadhaar Number', aadhaarPh: '12-digit Aadhaar',
        verify: 'Verify', verified: 'Verified',
        employeeId: 'Employee ID', employeeIdPh: 'e.g. KOR-3847261',
        employeeIdSub: '3-letter zone code + hyphen + 7 digits',
        eshram: 'e-Shram ID (Optional)', eshramPh: '12-digit UAN',
        referral: 'Referral Code (Optional)', referralPh: 'e.g. RAVI-K7X2',
        referralApplied: '₹10 discount applied on first payment',
        password: 'Create Password', passwordPh: 'Minimum 6 characters',
        confirmPwd: 'Confirm Password', confirmPh: 'Re-enter password',
        show: 'Show', hide: 'Hide',
        continue: 'Continue →',
        city: 'City', cityPh: 'Select your city',
        zone: 'Delivery Zone', zonePh: 'Select your zone',
        platform: 'Delivery Platform', platformPh: 'Select platform',
        connectBtn: 'Connect Account',
        sandboxMode: 'Sandbox Mode',
        connecting: 'Connecting...',
        connected: 'Account Verified',
        connectError: 'Employee ID and phone number do not match our records.',
        avgIncome: 'Avg Weekly Income',
        avgDeliveries: 'Avg Daily Deliveries',
        missedTitle: 'You missed out last week',
        missedMsg: 'Workers in your zone received',
        missedMsg2: 'in payouts. Enroll now.',
        customPremium: 'Customize Your Coverage',
        customSub: 'Increase premium for more coverage. Base: ₹',
        totalPremium: 'Weekly Premium',
        weeklyCoverage: 'Weekly Coverage',
        review: 'Review & Pay →',
        editDetails: '← Edit Details',
        payRazorpay: 'Pay with Razorpay',
        employerActivate: 'Activate Policy',
        secured: 'Secured by Razorpay · 256-bit SSL',
        disclaimer: 'Income loss coverage only. Vehicle and health not covered.',
        highRisk: 'High Risk Zone', medRisk: 'Medium Risk Zone', lowRisk: 'Low Risk Zone',
        riskSub: 'Base coverage',
        checkingUnique: 'Checking availability...',
        alreadyExists: 'already registered. Use a different one or log in.',
    },
    hi: {
        brand: 'KavachPay', back: 'वापस',
        step1: 'व्यक्तिगत विवरण', step2: 'क्षेत्र और प्लेटफॉर्म', step3: 'समीक्षा और भुगतान',
        policyType: 'पॉलिसी प्रकार',
        individual: 'व्यक्तिगत', individualDesc: 'आप प्रीमियम भरते हैं',
        employer: 'नियोक्ता प्रायोजित', employerDesc: 'नियोक्ता प्रीमियम भरता है',
        employerName: 'नियोक्ता नाम', employerEmail: 'नियोक्ता ईमेल',
        fullName: 'पूरा नाम', namePh: 'जैसे रवि कुमार',
        email: 'ईमेल', emailPh: 'आपका@ईमेल.com',
        phone: 'फोन नंबर', phonePh: '10 अंकों का मोबाइल',
        sendOtp: 'OTP भेजें', verifyOtp: 'सत्यापित', resendOtp: 'पुनः भेजें',
        otpSent: 'OTP भेजा गया', otpPh: '4 अंकों का OTP',
        phoneVerified: 'फोन सत्यापित',
        age: 'आयु', agePh: '26',
        aadhaar: 'आधार नंबर', aadhaarPh: '12 अंकों का आधार',
        verify: 'सत्यापित', verified: 'सत्यापित',
        employeeId: 'कर्मचारी ID', employeeIdPh: 'जैसे KOR-3847261',
        employeeIdSub: '3 अक्षर + हाइफन + 7 अंक',
        eshram: 'e-Shram ID (वैकल्पिक)', eshramPh: '12 अंकों का UAN',
        referral: 'रेफरल कोड (वैकल्पिक)', referralPh: 'जैसे RAVI-K7X2',
        referralApplied: 'पहले भुगतान पर ₹10 छूट',
        password: 'पासवर्ड बनाएं', passwordPh: 'न्यूनतम 6 अक्षर',
        confirmPwd: 'पासवर्ड पुष्टि', confirmPh: 'पुनः दर्ज करें',
        show: 'दिखाएं', hide: 'छुपाएं',
        continue: 'आगे बढ़ें →',
        city: 'शहर', cityPh: 'शहर चुनें',
        zone: 'डिलीवरी क्षेत्र', zonePh: 'क्षेत्र चुनें',
        platform: 'प्लेटफॉर्म', platformPh: 'प्लेटफॉर्म चुनें',
        connectBtn: 'खाता जोड़ें',
        sandboxMode: 'सैंडबॉक्स',
        connecting: 'जोड़ा जा रहा है...',
        connected: 'खाता सत्यापित',
        connectError: 'कर्मचारी ID और फोन मेल नहीं खाते।',
        avgIncome: 'औसत साप्ताहिक आय',
        avgDeliveries: 'औसत दैनिक डिलीवरी',
        missedTitle: 'पिछले सप्ताह चूक गए',
        missedMsg: 'आपके क्षेत्र के कर्मचारियों को मिला',
        missedMsg2: 'भुगतान में। अभी नामांकन करें।',
        customPremium: 'कवरेज अनुकूलित करें',
        customSub: 'अधिक कवरेज के लिए बढ़ाएं। आधार: ₹',
        totalPremium: 'साप्ताहिक प्रीमियम',
        weeklyCoverage: 'साप्ताहिक कवरेज',
        review: 'समीक्षा करें →',
        editDetails: '← विवरण संपादित करें',
        payRazorpay: 'Razorpay से भुगतान',
        employerActivate: 'पॉलिसी सक्रिय करें',
        secured: 'Razorpay द्वारा सुरक्षित',
        disclaimer: 'केवल आय हानि कवरेज।',
        highRisk: 'उच्च जोखिम', medRisk: 'मध्यम जोखिम', lowRisk: 'कम जोखिम',
        riskSub: 'आधार कवरेज',
        checkingUnique: 'जांच हो रही है...',
        alreadyExists: 'पहले से पंजीकृत है।',
    },
    ta: {
        brand: 'KavachPay', back: 'திரும்பு',
        step1: 'தனிப்பட்ட விவரங்கள்', step2: 'மண்டலம் & தளம்', step3: 'மதிப்பாய்வு & கட்டணம்',
        policyType: 'பாலிசி வகை',
        individual: 'தனிநபர்', individualDesc: 'நீங்களே பிரீமியம் செலுத்துகிறீர்கள்',
        employer: 'முதலாளி வழங்கல்', employerDesc: 'முதலாளி செலுத்துகிறார்',
        employerName: 'முதலாளி பெயர்', employerEmail: 'முதலாளி மின்னஞ்சல்',
        fullName: 'முழு பெயர்', namePh: 'எ.கா. ரவி குமார்',
        email: 'மின்னஞ்சல்', emailPh: 'உங்கள்@மின்னஞ்சல்.com',
        phone: 'தொலைபேசி', phonePh: '10 இலக்க மொபைல்',
        sendOtp: 'OTP அனுப்பு', verifyOtp: 'சரிபார்', resendOtp: 'மீண்டும்',
        otpSent: 'OTP அனுப்பப்பட்டது', otpPh: '4 இலக்க OTP',
        phoneVerified: 'தொலைபேசி சரிபார்க்கப்பட்டது',
        age: 'வயது', agePh: '26',
        aadhaar: 'ஆதார் எண்', aadhaarPh: '12 இலக்க ஆதார்',
        verify: 'சரிபார்', verified: 'சரிபார்க்கப்பட்டது',
        employeeId: 'ஊழியர் ID', employeeIdPh: 'எ.கா. KOR-3847261',
        employeeIdSub: '3 எழுத்து + இடைக்கோடு + 7 இலக்கம்',
        eshram: 'e-Shram ID (விருப்பம்)', eshramPh: '12 இலக்க UAN',
        referral: 'பரிந்துரை குறியீடு (விருப்பம்)', referralPh: 'எ.கா. RAVI-K7X2',
        referralApplied: 'முதல் கட்டணத்தில் ₹10 தள்ளுபடி',
        password: 'கடவுச்சொல்', passwordPh: 'குறைந்தது 6 எழுத்துக்கள்',
        confirmPwd: 'கடவுச்சொல் உறுதி', confirmPh: 'மீண்டும் உள்ளிடவும்',
        show: 'காட்டு', hide: 'மறை',
        continue: 'தொடரவும் →',
        city: 'நகரம்', cityPh: 'நகரத்தை தேர்வு செய்யவும்',
        zone: 'டெலிவரி மண்டலம்', zonePh: 'மண்டலத்தை தேர்வு செய்யவும்',
        platform: 'தளம்', platformPh: 'தளத்தை தேர்வு செய்யவும்',
        connectBtn: 'கணக்கை இணை',
        sandboxMode: 'சாண்ட்பாக்ஸ்',
        connecting: 'இணைக்கிறது...',
        connected: 'கணக்கு சரிபார்க்கப்பட்டது',
        connectError: 'ஊழியர் ID மற்றும் தொலைபேசி பொருந்தவில்லை.',
        avgIncome: 'சராசரி வாராந்திர வருமானம்',
        avgDeliveries: 'சராசரி தினசரி டெலிவரி',
        missedTitle: 'கடந்த வாரம் தவறவிட்டீர்கள்',
        missedMsg: 'உங்கள் மண்டல தொழிலாளர்களுக்கு கிடைத்தது',
        missedMsg2: 'பணம். இப்போது சேரவும்.',
        customPremium: 'கவரேஜை தனிப்பயனாக்கவும்',
        customSub: 'அதிக கவரேஜுக்கு அதிகமாக. அடிப்படை: ₹',
        totalPremium: 'வாராந்திர பிரீமியம்',
        weeklyCoverage: 'வாராந்திர கவரேஜ்',
        review: 'மதிப்பாய்வு →',
        editDetails: '← திருத்து',
        payRazorpay: 'Razorpay மூலம் செலுத்து',
        employerActivate: 'பாலிசி செயல்படுத்து',
        secured: 'Razorpay மூலம் பாதுகாக்கப்பட்டது',
        disclaimer: 'வருமான இழப்பு கவரேஜ் மட்டுமே.',
        highRisk: 'அதிக ஆபத்து', medRisk: 'நடுத்தர ஆபத்து', lowRisk: 'குறைந்த ஆபத்து',
        riskSub: 'அடிப்படை கவரேஜ்',
        checkingUnique: 'சரிபார்க்கிறது...',
        alreadyExists: 'ஏற்கனவே பதிவு செய்யப்பட்டது.',
    }
};

const LangToggle = ({ lang, setLang }) => (
    <div style={{ display: 'flex', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: '20px', padding: '3px', gap: '2px' }}>
        {[{ code: 'en', label: 'EN' }, { code: 'hi', label: 'हि' }, { code: 'ta', label: 'த' }].map(l => (
            <button key={l.code} onClick={() => setLang(l.code)}
                style={{ backgroundColor: lang === l.code ? 'white' : 'transparent', color: lang === l.code ? '#1A3A5C' : 'white', border: 'none', padding: '5px 10px', borderRadius: '16px', cursor: 'pointer', fontSize: '11px', fontWeight: '700' }}>
                {l.label}
            </button>
        ))}
    </div>
);

const PaymentModal = ({ premium, name, discountApplied, onSuccess, onClose }) => {
    const finalAmount = discountApplied ? Math.max(0, premium - 10) : premium;
    const [paymentStep, setPaymentStep] = useState('select');
    const [selectedMethod, setSelectedMethod] = useState('upi');
    const [upiId, setUpiId] = useState('');
    const [upiError, setUpiError] = useState('');

    const handlePay = () => {
        if (selectedMethod === 'upi' && !upiId.includes('@')) { setUpiError('Enter a valid UPI ID (e.g. ravi@upi)'); return; }
        setUpiError('');
        setPaymentStep('processing');
        setTimeout(() => setPaymentStep('success'), 2500);
    };

    return (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 2000, fontFamily: 'Inter' }}>
            <div style={{ backgroundColor: 'white', borderRadius: '24px 24px 0 0', width: '100%', maxWidth: '480px', padding: '24px', boxShadow: '0 -8px 40px rgba(0,0,0,0.2)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#072654', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <p style={{ color: '#3395FF', fontWeight: '800', fontSize: '12px' }}>R</p>
                        </div>
                        <div>
                            <p style={{ color: '#072654', fontWeight: '700', fontSize: '14px' }}>Razorpay</p>
                            <p style={{ color: '#9CA3AF', fontSize: '11px' }}>Secured Payment</p>
                        </div>
                    </div>
                    {paymentStep !== 'processing' && paymentStep !== 'success' && (
                        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', fontSize: '20px' }}>✕</button>
                    )}
                </div>

                <div style={{ backgroundColor: '#F8F9FF', borderRadius: '12px', padding: '16px', marginBottom: '20px', border: '1px solid #E8EAFE', textAlign: 'center' }}>
                    <p style={{ color: '#6B7280', fontSize: '12px', marginBottom: '6px', letterSpacing: '0.3px' }}>WEEKLY PREMIUM — KAVACHPAY</p>
                    {discountApplied && (
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                            <p style={{ color: '#9CA3AF', fontSize: '16px', textDecoration: 'line-through' }}>₹{premium}</p>
                            <div style={{ backgroundColor: '#E8F5EE', border: '1px solid #A8D5BC', borderRadius: '8px', padding: '2px 8px' }}>
                                <p style={{ color: '#2E7D52', fontSize: '11px', fontWeight: '700' }}>REFERRAL -₹10</p>
                            </div>
                        </div>
                    )}
                    <p style={{ color: '#111827', fontWeight: '800', fontSize: '32px', letterSpacing: '-1px' }}>₹{finalAmount}</p>
                    <p style={{ color: '#9CA3AF', fontSize: '12px', marginTop: '4px' }}>Policyholder: {name}</p>
                </div>

                {paymentStep === 'select' && (
                    <div>
                        {[
                            { key: 'upi', label: 'UPI', sub: 'GPay, PhonePe, Paytm', icon: '📱' },
                            { key: 'card', label: 'Debit / Credit Card', sub: 'Visa, Mastercard, RuPay', icon: '💳' },
                            { key: 'netbanking', label: 'Net Banking', sub: 'All major banks', icon: '🏦' },
                        ].map(method => (
                            <div key={method.key} onClick={() => setSelectedMethod(method.key)}
                                style={{ border: `2px solid ${selectedMethod === method.key ? '#1A3A5C' : '#E8EAFE'}`, borderRadius: '12px', padding: '14px 16px', marginBottom: '10px', cursor: 'pointer', backgroundColor: selectedMethod === method.key ? '#EFF6FF' : 'white' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: selectedMethod === 'upi' && method.key === 'upi' ? '12px' : '0' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>{method.icon}</div>
                                        <div>
                                            <p style={{ color: '#111827', fontWeight: '600', fontSize: '13px' }}>{method.label}</p>
                                            <p style={{ color: '#9CA3AF', fontSize: '11px' }}>{method.sub}</p>
                                        </div>
                                    </div>
                                    <div style={{ width: '18px', height: '18px', borderRadius: '50%', border: `2px solid ${selectedMethod === method.key ? '#1A3A5C' : '#D1D5DB'}`, backgroundColor: selectedMethod === method.key ? '#1A3A5C' : 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        {selectedMethod === method.key && <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'white' }} />}
                                    </div>
                                </div>
                                {selectedMethod === 'upi' && method.key === 'upi' && (
                                    <div>
                                        <input type="text" placeholder="Enter UPI ID (e.g. ravi@upi)" value={upiId} onChange={e => { setUpiId(e.target.value); setUpiError(''); }}
                                            style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: `1.5px solid ${upiError ? '#FECACA' : '#E8EAFE'}`, fontSize: '13px', boxSizing: 'border-box', fontFamily: 'Inter', outline: 'none' }} />
                                        {upiError && <p style={{ color: '#B91C1C', fontSize: '12px', marginTop: '4px' }}>{upiError}</p>}
                                    </div>
                                )}
                            </div>
                        ))}
                        <button onClick={handlePay}
                            style={{ width: '100%', background: 'linear-gradient(135deg, #1A3A5C, #08101F)', color: 'white', padding: '15px', borderRadius: '12px', border: 'none', fontSize: '15px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 16px rgba(91,110,245,0.3)', marginBottom: '12px' }}>
                            Pay ₹{finalAmount}
                        </button>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                            <p style={{ color: '#9CA3AF', fontSize: '11px' }}>Secured by Razorpay · 256-bit SSL</p>
                        </div>
                    </div>
                )}

                {paymentStep === 'processing' && (
                    <div style={{ textAlign: 'center', padding: '20px 0' }}>
                        <div style={{ width: '52px', height: '52px', borderRadius: '50%', border: '4px solid #EFF6FF', borderTop: '4px solid #1A3A5C', margin: '0 auto 20px', animation: 'spin 1s linear infinite' }} />
                        <p style={{ color: '#111827', fontWeight: '700', fontSize: '16px', marginBottom: '6px' }}>Processing Payment</p>
                        <p style={{ color: '#9CA3AF', fontSize: '13px' }}>Please do not close this window...</p>
                        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                    </div>
                )}

                {paymentStep === 'success' && (
                    <div style={{ textAlign: 'center', padding: '10px 0' }}>
                        <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#E8F5EE', border: '3px solid #A8D5BC', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2E7D52" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                        </div>
                        <p style={{ color: '#111827', fontWeight: '700', fontSize: '18px', marginBottom: '6px' }}>Payment Successful</p>
                        <p style={{ color: '#9CA3AF', fontSize: '13px', marginBottom: '16px' }}>₹{finalAmount} paid — Policy activated</p>
                        <div style={{ backgroundColor: '#F8F9FF', borderRadius: '12px', padding: '14px', marginBottom: '20px', border: '1px solid #E8EAFE', textAlign: 'left' }}>
                            {[
                                { label: 'Amount', value: '₹' + finalAmount },
                                { label: 'Method', value: selectedMethod === 'upi' ? 'UPI — ' + upiId : selectedMethod === 'card' ? 'Card' : 'Net Banking' },
                                { label: 'Transaction ID', value: 'pay_' + Math.random().toString(36).substr(2, 10).toUpperCase() },
                                { label: 'Status', value: 'Success' },
                            ].map((item, i) => (
                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: i < 3 ? '1px solid #EFF6FF' : 'none' }}>
                                    <p style={{ color: '#9CA3AF', fontSize: '12px' }}>{item.label}</p>
                                    <p style={{ color: item.label === 'Status' ? '#2E7D52' : '#111827', fontWeight: '600', fontSize: '12px' }}>{item.value}</p>
                                </div>
                            ))}
                        </div>
                        <button onClick={onSuccess} style={{ width: '100%', background: 'linear-gradient(135deg, #1A3A5C, #08101F)', color: 'white', padding: '14px', borderRadius: '12px', border: 'none', fontSize: '15px', fontWeight: '700', cursor: 'pointer' }}>
                            Go to Dashboard →
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default function Signup({ onComplete, onBack, lang: propLang, setLang: propSetLang }) {
    const [localLang, setLocalLang] = useState(propLang || 'en');
    const lang = propLang !== undefined ? propLang : localLang;
    const setLang = propSetLang || setLocalLang;
    const t = T[lang] || T.en;

    const bg = '#F9FAFB';
    const cardBg = '#FFFFFF';
    const cardBorder = '#E5E7EB';
    const textPrimary = '#111827';
    const textSecondary = '#374151';
    const textMuted = '#6B7280';
    const inputBg = '#FFFFFF';
    const inputBorder = '#D1D5DB';

    const [step, setStep] = useState(1);
    const [policyType, setPolicyType] = useState('individual');
    const [form, setForm] = useState({
        name: '', email: '', phone: '', age: '', aadhaar: '',
        employeeId: '', password: '', confirmPassword: '',
        city: '', zone: '', platform: '',
        employerName: '', employerEmail: '',
        eshramId: '', referralCode: '',
    });
    const [phoneOtpSent, setPhoneOtpSent] = useState(false);
    const [phoneOtp, setPhoneOtp] = useState('');
    const [phoneVerified, setPhoneVerified] = useState(false);
    const [phoneOtpError, setPhoneOtpError] = useState('');
    const [aadhaarVerifying, setAadhaarVerifying] = useState(false);
    const [aadhaarVerified, setAadhaarVerified] = useState(false);
    const [connecting, setConnecting] = useState(false);
    const [connected, setConnected] = useState(false);
    const [connectError, setConnectError] = useState('');
    const [linkedData, setLinkedData] = useState(null);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [errors, setErrors] = useState({});
    const [showPayment, setShowPayment] = useState(false);
    const [customPremium, setCustomPremium] = useState(null);
    const [referralValid, setReferralValid] = useState(false);
    const [uniqueChecking, setUniqueChecking] = useState({});
    const [uniqueErrors, setUniqueErrors] = useState({});

    const cityRisk = getCityRisk(form.city);
    const zoneData = ZONE_PREMIUM[cityRisk];
    const basePremium = zoneData?.premium || 59;
    const baseCoverage = zoneData?.coverage || 1200;
    const activePremium = customPremium || basePremium;
    const coverageMultiplier = activePremium / basePremium;
    const coverage = Math.round(baseCoverage * coverageMultiplier);
    const missedPayout = Math.round(baseCoverage * 0.65);

    const getRiskLabel = () => cityRisk === 'high' ? t.highRisk : cityRisk === 'medium' ? t.medRisk : t.lowRisk;
    const getRiskColor = () => cityRisk === 'high' ? '#B91C1C' : cityRisk === 'medium' ? '#C05C1A' : '#2E7D52';
    const getRiskBg = () => cityRisk === 'high' ? '#FEF0F0' : cityRisk === 'medium' ? '#FFF0E6' : '#E8F5EE';

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(f => ({ ...f, [name]: value }));
        setErrors(er => ({ ...er, [name]: '' }));
        if (name === 'referralCode') setReferralValid(value.length >= 6 && value.includes('-'));
        if (name === 'city') { setForm(f => ({ ...f, city: value, zone: '' })); setConnected(false); setLinkedData(null); }
        if (name === 'platform') { setConnected(false); setLinkedData(null); setConnectError(''); }
    };

    const checkUnique = async (field, value, label) => {
        if (!value) return;
        setUniqueChecking(u => ({ ...u, [field]: true }));
        const result = await api.checkUnique(field, value);
        setUniqueChecking(u => ({ ...u, [field]: false }));
        if (!result.available) {
            setUniqueErrors(u => ({ ...u, [field]: `This ${label} is ${t.alreadyExists}` }));
        } else {
            setUniqueErrors(u => ({ ...u, [field]: '' }));
        }
    };

    const handleSendOtp = async () => {
        if (!form.phone || !/^[0-9]{10}$/.test(form.phone)) {
            setErrors(e => ({ ...e, phone: 'Enter a valid 10-digit phone number' })); return;
        }
        await api.sendOtp(form.phone);
        setPhoneOtpSent(true);
        setPhoneOtpError('');
    };

    const handleVerifyOtp = async () => {
        const result = await api.verifyOtp(form.phone, phoneOtp);
        if (result.success) { setPhoneVerified(true); setPhoneOtpError(''); }
        else setPhoneOtpError('Incorrect OTP. Please try again.');
    };

    const verifyAadhaar = () => {
        if (!/^[0-9]{12}$/.test(form.aadhaar)) {
            setErrors(e => ({ ...e, aadhaar: 'Enter a valid 12-digit Aadhaar number' })); return;
        }
        setAadhaarVerifying(true);
        // TODO: BACKEND — verify Aadhaar via DigiLocker
        setTimeout(() => { setAadhaarVerifying(false); setAadhaarVerified(true); }, 2000);
    };

    const connectPlatform = async () => {
        if (!form.platform || !form.city || !form.zone) return;
        setConnecting(true);
        setConnectError('');
        const result = await api.connectPlatform(form.employeeId, form.phone, form.platform);
        if (result.success) {
            setLinkedData({ avgIncome: result.avg_weekly_income, avgDeliveries: result.avg_daily_deliveries });
            setConnected(true);
            if (!customPremium) setCustomPremium(basePremium);
        } else {
            setConnectError(result.error || t.connectError);
        }
        setConnecting(false);
    };

    const validateStep1 = () => {
        const e = {};
        if (!form.name || !/^[a-zA-Z\s]+$/.test(form.name)) e.name = 'Enter a valid full name';
        if (!form.email || !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email address';
        if (!phoneVerified) e.phone = 'Verify your phone number — click Send OTP, enter 1234';
        if (!form.age || form.age < 18 || form.age > 60) e.age = 'Age must be between 18 and 60';
        if (!aadhaarVerified) e.aadhaar = 'Verify your Aadhaar — click the Verify button';
        if (!form.employeeId || !/^[A-Z]{3}-[0-9]{7}$/.test(form.employeeId)) e.employeeId = 'Format: 3 capital letters + hyphen + 7 digits (e.g. KOR-3847261)';
        if (!form.password || form.password.length < 6) e.password = 'Password must be at least 6 characters';
        if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
        if (policyType === 'employer') {
            if (!form.employerName) e.employerName = 'Enter employer name';
            if (!form.employerEmail || !/\S+@\S+\.\S+/.test(form.employerEmail)) e.employerEmail = 'Enter valid employer email';
        }
        if (Object.keys(uniqueErrors).some(k => uniqueErrors[k])) e.unique = 'Fix duplicate field errors above';
        setErrors(e);
        // Scroll to first error field
        if (Object.keys(e).length > 0) {
            const firstKey = Object.keys(e)[0];
            const el = document.querySelector(`[name="${firstKey}"]`) || document.querySelector(`[data-error="${firstKey}"]`);
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            else window.scrollTo({ top: 0, behavior: 'smooth' });
        }
        return Object.keys(e).length === 0;
    };

    const validateStep2 = () => {
        const e = {};
        if (!form.city) e.city = 'Please select your city';
        if (!form.zone) e.zone = 'Please select your zone';
        if (!form.platform) e.platform = 'Please select your platform';
        if (!connected) e.connect = 'Please connect and verify your platform account';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handlePaymentSuccess = () => {
        setShowPayment(false);
        const referralCode = generateReferralCode(form.name);
        onComplete({
            name: form.name, phone: form.phone, age: form.age,
            email: form.email, city: form.city,
            zone: form.zone + ', ' + form.city,
            platform: form.platform, employeeId: form.employeeId,
            aadhaar: form.aadhaar, password: form.password,
            premium: activePremium, coverage,
            avgIncome: linkedData?.avgIncome || basePremium * 30,
            avgDeliveries: linkedData?.avgDeliveries || 18,
            policyType, employerName: form.employerName,
            employerEmail: form.employerEmail,
            eshramId: form.eshramId, referralCode,
            usedReferral: referralValid ? form.referralCode : null,
            referralDiscount: referralValid,
        });
    };

    const iStyle = (field) => ({
        width: '100%', padding: '12px 14px', borderRadius: '10px',
        border: `1.5px solid ${errors[field] || uniqueErrors[field] ? '#FECACA' : inputBorder}`,
        fontSize: '14px', boxSizing: 'border-box', fontFamily: 'Inter',
        outline: 'none', backgroundColor: inputBg, color: textPrimary,
        transition: 'border-color 0.2s ease',
    });
    const lStyle = { display: 'block', color: textSecondary, fontWeight: '600', marginBottom: '6px', fontSize: '13px' };
    const errTxt = (field) => (errors[field] || uniqueErrors[field]) && (
        <p style={{ color: '#B91C1C', fontSize: '12px', marginTop: '4px' }}>{errors[field] || uniqueErrors[field]}</p>
    );

    return (
        <div style={{ backgroundColor: bg, minHeight: '100vh', fontFamily: 'Inter' }}>
            {showPayment && (
                <PaymentModal premium={activePremium} name={form.name} discountApplied={referralValid}
                    onSuccess={handlePaymentSuccess} onClose={() => setShowPayment(false)} />
            )}

            {/* Navbar */}
            <div style={{ background: 'linear-gradient(135deg, #08101F 0%, #0D1829 100%)', padding: '0 24px', height: 62, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <KavachLogo size={30} light />
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <LangToggle lang={lang} setLang={setLang} />
                    <button onClick={onBack} style={{ backgroundColor: 'transparent', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.15)', padding: '7px 16px', borderRadius: '7px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', transition: 'all 0.15s ease' }}
                        onMouseEnter={e => { e.currentTarget.style.color = 'white'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.35)'; }}
                        onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; }}>{t.back}</button>
                </div>
            </div>

            {/* Step Indicator */}
            <div style={{ backgroundColor: cardBg, padding: '14px 24px', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: `1px solid ${cardBorder}` }}>
                {[1, 2, 3].map(s => (
                    <React.Fragment key={s}>
                        <div style={{ width: '30px', height: '30px', borderRadius: '50%', backgroundColor: step >= s ? '#1A3A5C' : '#F3F4F6', color: step >= s ? 'white' : textMuted, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '13px', border: step >= s ? 'none' : `1px solid ${cardBorder}`, flexShrink: 0 }}>
                            {step > s ? '✓' : s}
                        </div>
                        {s < 3 && <div style={{ flex: 1, height: '2px', backgroundColor: step > s ? '#1A3A5C' : '#E5E7EB', borderRadius: '2px', transition: 'background-color 0.3s ease' }} />}
                    </React.Fragment>
                ))}
                <p style={{ marginLeft: '12px', fontSize: '13px', color: textMuted, fontWeight: '500', whiteSpace: 'nowrap' }}>
                    {step === 1 ? t.step1 : step === 2 ? t.step2 : t.step3}
                </p>
            </div>

            <div style={{ padding: '24px 16px', maxWidth: '480px', margin: '0 auto' }}>

                {/* STEP 1 */}
                {step === 1 && (
                    <div className="fade-in" style={{ backgroundColor: cardBg, borderRadius: '16px', padding: '28px', boxShadow: '0 2px 16px rgba(91,110,245,0.08)', border: `1px solid ${cardBorder}` }}>
                        <p style={{ color: textPrimary, fontSize: '18px', fontWeight: '800', marginBottom: '4px' }}>{t.step1}</p>
                        <p style={{ color: textMuted, fontSize: '13px', marginBottom: '24px' }}>All information is encrypted and secure.</p>

                        {/* Policy Type */}
                        <div style={{ marginBottom: '20px' }}>
                            <label style={lStyle}>{t.policyType}</label>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                {[
                                    { key: 'individual', label: t.individual, desc: t.individualDesc },
                                    { key: 'employer', label: t.employer, desc: t.employerDesc },
                                ].map(pt => (
                                    <div key={pt.key} onClick={() => setPolicyType(pt.key)}
                                        style={{ border: `2px solid ${policyType === pt.key ? '#1A3A5C' : cardBorder}`, borderRadius: '12px', padding: '14px', cursor: 'pointer', backgroundColor: policyType === pt.key ? '#EFF6FF' : cardBg, textAlign: 'center', transition: 'all 0.15s ease' }}>
                                        <p style={{ color: policyType === pt.key ? '#1A3A5C' : textPrimary, fontWeight: '700', fontSize: '13px' }}>{pt.label}</p>
                                        <p style={{ color: textMuted, fontSize: '11px', marginTop: '3px' }}>{pt.desc}</p>
                                        {policyType === pt.key && (
                                            <div style={{ backgroundColor: '#1A3A5C', borderRadius: '10px', padding: '2px 8px', display: 'inline-block', marginTop: '6px' }}>
                                                <p style={{ color: 'white', fontSize: '10px', fontWeight: '700' }}>Selected</p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Employer Fields */}
                        {policyType === 'employer' && (
                            <div style={{ backgroundColor: '#EFF6FF', borderRadius: '12px', padding: '16px', marginBottom: '20px', border: '1px solid #BFDBFE' }}>
                                <p style={{ color: '#1A3A5C', fontWeight: '700', fontSize: '13px', marginBottom: '12px' }}>Employer Details</p>
                                <div style={{ marginBottom: '12px' }}>
                                    <label style={lStyle}>{t.employerName}</label>
                                    <input type="text" name="employerName" placeholder="e.g. Swiggy, Zomato" value={form.employerName} onChange={handleChange} style={iStyle('employerName')} />
                                    {errTxt('employerName')}
                                </div>
                                <div>
                                    <label style={lStyle}>{t.employerEmail}</label>
                                    <input type="email" name="employerEmail" placeholder="employer@company.com" value={form.employerEmail} onChange={handleChange} style={iStyle('employerEmail')} />
                                    {errTxt('employerEmail')}
                                </div>
                            </div>
                        )}

                        {/* Name */}
                        <div style={{ marginBottom: '14px' }}>
                            <label style={lStyle}>{t.fullName}</label>
                            <input type="text" name="name" placeholder={t.namePh} value={form.name} onChange={handleChange} style={iStyle('name')} />
                            {errTxt('name')}
                        </div>

                        {/* Email */}
                        <div style={{ marginBottom: '14px' }}>
                            <label style={lStyle}>{t.email}</label>
                            <input type="email" name="email" placeholder={t.emailPh} value={form.email} onChange={handleChange}
                                onBlur={() => checkUnique('email', form.email, 'email')} style={iStyle('email')} />
                            {uniqueChecking.email && <p style={{ color: '#1A3A5C', fontSize: '12px', marginTop: '4px' }}>{t.checkingUnique}</p>}
                            {errTxt('email')}
                        </div>

                        {/* Phone + OTP */}
                        <div style={{ marginBottom: '14px' }}>
                            <label style={lStyle}>{t.phone}</label>
                            <div style={{ display: 'flex', gap: '8px', marginBottom: phoneOtpSent && !phoneVerified ? '10px' : '0' }}>
                                <input type="tel" name="phone" placeholder={t.phonePh} value={form.phone} onChange={handleChange} maxLength={10}
                                    style={{ ...iStyle('phone'), flex: 1 }} disabled={phoneVerified}
                                    onBlur={() => form.phone.length === 10 && checkUnique('phone', form.phone, 'phone number')} />
                                {!phoneVerified && (
                                    <button onClick={handleSendOtp}
                                        style={{ padding: '12px 14px', backgroundColor: phoneOtpSent ? '#EFF6FF' : '#1A3A5C', color: phoneOtpSent ? '#1A3A5C' : 'white', border: phoneOtpSent ? '1px solid #BFDBFE' : 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', fontSize: '12px', whiteSpace: 'nowrap' }}>
                                        {phoneOtpSent ? t.resendOtp : t.sendOtp}
                                    </button>
                                )}
                                {phoneVerified && (
                                    <div style={{ padding: '12px 14px', backgroundColor: '#E8F5EE', border: '1px solid #A8D5BC', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2E7D52" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                                        <p style={{ color: '#2E7D52', fontSize: '12px', fontWeight: '700' }}>Verified</p>
                                    </div>
                                )}
                            </div>
                            {uniqueChecking.phone && <p style={{ color: '#1A3A5C', fontSize: '12px', marginTop: '4px' }}>{t.checkingUnique}</p>}
                            {phoneOtpSent && !phoneVerified && (
                                <div className="fade-in">
                                    <p style={{ color: textMuted, fontSize: '12px', marginBottom: '8px' }}>{t.otpSent} +91 {form.phone}</p>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <input type="text" placeholder={t.otpPh} value={phoneOtp} onChange={e => { setPhoneOtp(e.target.value); setPhoneOtpError(''); }} maxLength={4}
                                            style={{ ...iStyle('phoneOtp'), flex: 1, letterSpacing: '4px', fontWeight: '700', textAlign: 'center', fontSize: '16px' }} />
                                        <button onClick={handleVerifyOtp}
                                            style={{ padding: '12px 18px', background: 'linear-gradient(135deg, #1A3A5C, #08101F)', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', fontSize: '13px' }}>
                                            {t.verifyOtp}
                                        </button>
                                    </div>
                                    {phoneOtpError && <p style={{ color: '#B91C1C', fontSize: '12px', marginTop: '5px' }}>{phoneOtpError}</p>}
                                </div>
                            )}
                            {phoneVerified && <p style={{ color: '#2E7D52', fontSize: '12px', marginTop: '6px', fontWeight: '600' }}>{t.phoneVerified}</p>}
                            {errTxt('phone')}
                        </div>

                        {/* Age */}
                        <div style={{ marginBottom: '14px' }}>
                            <label style={lStyle}>{t.age}</label>
                            <input type="number" name="age" placeholder={t.agePh} value={form.age} onChange={handleChange} min={18} max={60} style={iStyle('age')} />
                            {errTxt('age')}
                        </div>

                        {/* Aadhaar */}
                        <div style={{ marginBottom: '14px' }}>
                            <label style={lStyle}>{t.aadhaar}</label>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <input type="text" name="aadhaar" placeholder={t.aadhaarPh} value={form.aadhaar} onChange={handleChange} maxLength={12}
                                    style={{ ...iStyle('aadhaar'), flex: 1 }} disabled={aadhaarVerified}
                                    onBlur={() => form.aadhaar.length === 12 && checkUnique('aadhaar', form.aadhaar, 'Aadhaar number')} />
                                <button onClick={verifyAadhaar} disabled={aadhaarVerified || aadhaarVerifying}
                                    style={{ padding: '12px 16px', backgroundColor: aadhaarVerified ? '#2E7D52' : '#1A3A5C', color: 'white', border: 'none', borderRadius: '10px', cursor: aadhaarVerified ? 'default' : 'pointer', fontWeight: '700', fontSize: '13px', whiteSpace: 'nowrap', opacity: aadhaarVerifying ? 0.7 : 1 }}>
                                    {aadhaarVerifying ? '...' : aadhaarVerified ? t.verified : t.verify}
                                </button>
                            </div>
                            {aadhaarVerifying && <p style={{ color: '#1A3A5C', fontSize: '12px', marginTop: '6px' }}>Connecting to DigiLocker...</p>}
                            {aadhaarVerified && <p style={{ color: '#2E7D52', fontSize: '12px', marginTop: '6px', fontWeight: '600' }}>Aadhaar verified</p>}
                            {errTxt('aadhaar')}
                        </div>

                        {/* Employee ID */}
                        <div style={{ marginBottom: '14px' }}>
                            <label style={lStyle}>{t.employeeId}</label>
                            <input type="text" name="employeeId" placeholder={t.employeeIdPh}
                                value={form.employeeId}
                                onChange={e => { handleChange(e); setForm(f => ({ ...f, employeeId: e.target.value.toUpperCase() })); }}
                                onBlur={() => form.employeeId && checkUnique('employee_id', form.employeeId, 'Employee ID')}
                                style={iStyle('employeeId')} />
                            {uniqueChecking.employee_id && <p style={{ color: '#1A3A5C', fontSize: '12px', marginTop: '4px' }}>{t.checkingUnique}</p>}
                            <p style={{ color: textMuted, fontSize: '11px', marginTop: '4px' }}>{t.employeeIdSub}</p>
                            {errTxt('employeeId')}
                        </div>

                        {/* e-Shram */}
                        <div style={{ marginBottom: '14px' }}>
                            <label style={lStyle}>{t.eshram}</label>
                            <input type="text" name="eshramId" placeholder={t.eshramPh} value={form.eshramId} onChange={handleChange} maxLength={12} style={iStyle('eshramId')} />
                            {form.eshramId && form.eshramId.length === 12 && (
                                <p style={{ color: '#2E7D52', fontSize: '12px', marginTop: '4px', fontWeight: '600' }}>e-Shram ID linked</p>
                            )}
                        </div>

                        {/* Referral — hidden for employer */}
                        {policyType !== 'employer' && (
                            <div style={{ marginBottom: '14px' }}>
                                <label style={lStyle}>{t.referral}</label>
                                <input type="text" name="referralCode" placeholder={t.referralPh} value={form.referralCode} onChange={handleChange}
                                    style={{ ...iStyle('referralCode'), border: `1.5px solid ${referralValid ? '#A8D5BC' : inputBorder}` }} />
                                {referralValid && (
                                    <div style={{ backgroundColor: '#E8F5EE', borderRadius: '8px', padding: '8px 12px', marginTop: '6px', border: '1px solid #A8D5BC' }}>
                                        <p style={{ color: '#2E7D52', fontSize: '12px', fontWeight: '600' }}>Valid code — {t.referralApplied}</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Password */}
                        <div style={{ marginBottom: '14px' }}>
                            <label style={lStyle}>{t.password}</label>
                            <div style={{ position: 'relative' }}>
                                <input type={showPassword ? 'text' : 'password'} name="password" placeholder={t.passwordPh} value={form.password} onChange={handleChange}
                                    style={{ ...iStyle('password'), paddingRight: '60px' }} />
                                <button onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: textMuted, fontSize: '13px', fontWeight: '600' }}>
                                    {showPassword ? t.hide : t.show}
                                </button>
                            </div>
                            {errTxt('password')}
                        </div>

                        <div style={{ marginBottom: '28px' }}>
                            <label style={lStyle}>{t.confirmPwd}</label>
                            <div style={{ position: 'relative' }}>
                                <input type={showConfirm ? 'text' : 'password'} name="confirmPassword" placeholder={t.confirmPh} value={form.confirmPassword} onChange={handleChange}
                                    style={{ ...iStyle('confirmPassword'), paddingRight: '60px' }} />
                                <button onClick={() => setShowConfirm(!showConfirm)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: textMuted, fontSize: '13px', fontWeight: '600' }}>
                                    {showConfirm ? t.hide : t.show}
                                </button>
                            </div>
                            {form.confirmPassword && form.password === form.confirmPassword && (
                                <p style={{ color: '#2E7D52', fontSize: '12px', marginTop: '5px', fontWeight: '600' }}>Passwords match ✓</p>
                            )}
                            {errTxt('confirmPassword')}
                        </div>

                        <button onClick={() => { if (validateStep1()) setStep(2); }}
                            style={{ width: '100%', background: 'linear-gradient(135deg, #1A3A5C, #08101F)', color: 'white', padding: '14px', borderRadius: '10px', border: 'none', fontSize: '15px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 16px rgba(8,16,31,0.3)', letterSpacing: 0.3 }}>
                            {t.continue}
                        </button>
                    </div>
                )}

                {/* STEP 2 */}
                {step === 2 && (
                    <div className="fade-in" style={{ backgroundColor: cardBg, borderRadius: '16px', padding: '28px', boxShadow: '0 2px 16px rgba(91,110,245,0.08)', border: `1px solid ${cardBorder}` }}>
                        <p style={{ color: textPrimary, fontSize: '18px', fontWeight: '800', marginBottom: '4px' }}>{t.step2}</p>
                        <p style={{ color: textMuted, fontSize: '13px', marginBottom: '24px' }}>Your zone determines your coverage tier and premium.</p>

                        {/* City */}
                        <div style={{ marginBottom: '14px' }}>
                            <label style={lStyle}>{t.city}</label>
                            <select name="city" value={form.city} onChange={handleChange}
                                style={{ ...iStyle('city'), backgroundColor: inputBg, appearance: 'none' }}>
                                <option value="">{t.cityPh}</option>
                                {Object.keys(CITY_ZONES).map(city => <option key={city}>{city}</option>)}
                            </select>
                            {errTxt('city')}
                        </div>

                        {/* Zone */}
                        {form.city && (
                            <div className="fade-in" style={{ marginBottom: '14px' }}>
                                <label style={lStyle}>{t.zone}</label>
                                <select name="zone" value={form.zone} onChange={handleChange}
                                    style={{ ...iStyle('zone'), backgroundColor: inputBg, appearance: 'none' }}>
                                    <option value="">{t.zonePh}</option>
                                    {CITY_ZONES[form.city]?.map(zone => <option key={zone}>{zone}</option>)}
                                </select>
                                {errTxt('zone')}
                            </div>
                        )}

                        {/* Risk Badge */}
                        {form.city && form.zone && (
                            <div className="fade-in" style={{ backgroundColor: getRiskBg(), borderRadius: '10px', padding: '14px 16px', marginBottom: '16px', border: `1px solid ${cityRisk === 'high' ? '#FECACA' : cityRisk === 'medium' ? '#FFCBA4' : '#A8D5BC'}`, borderLeft: `4px solid ${getRiskColor()}` }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <p style={{ color: getRiskColor(), fontWeight: '700', fontSize: '13px' }}>{getRiskLabel()}</p>
                                        <p style={{ color: textMuted, fontSize: '12px', marginTop: '3px' }}>{t.riskSub}: ₹{baseCoverage}/week</p>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <p style={{ color: textPrimary, fontWeight: '800', fontSize: '24px' }}>₹{basePremium}</p>
                                        <p style={{ color: textMuted, fontSize: '11px' }}>base/week</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Platform */}
                        <div style={{ marginBottom: '16px' }}>
                            <label style={lStyle}>{t.platform}</label>
                            <select name="platform" value={form.platform} onChange={handleChange}
                                style={{ ...iStyle('platform'), backgroundColor: inputBg, appearance: 'none' }} disabled={connected}>
                                <option value="">{t.platformPh}</option>
                                <option value="Swiggy">Swiggy</option>
                                <option value="Zomato">Zomato</option>
                            </select>
                            {errTxt('platform')}
                        </div>

                        {/* Connect */}
                        {form.platform && !connected && (
                            <div className="fade-in" style={{ backgroundColor: '#EFF6FF', borderRadius: '12px', padding: '16px', marginBottom: '16px', border: '1px solid #BFDBFE' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                    <p style={{ color: '#1A3A5C', fontWeight: '700', fontSize: '13px' }}>Connect {form.platform} Account</p>
                                    <div style={{ backgroundColor: '#DBEAFE', borderRadius: '6px', padding: '3px 8px' }}>
                                        <p style={{ color: '#1A3A5C', fontSize: '10px', fontWeight: '700' }}>{t.sandboxMode}</p>
                                    </div>
                                </div>
                                <p style={{ color: textMuted, fontSize: '12px', marginBottom: '12px' }}>Verified using your Employee ID and registered phone number.</p>
                                <button onClick={connectPlatform} disabled={connecting || !form.city || !form.zone}
                                    style={{ width: '100%', background: connecting ? '#BFDBFE' : 'linear-gradient(135deg, #1A3A5C, #08101F)', color: 'white', padding: '12px', borderRadius: '8px', border: 'none', fontWeight: '700', cursor: connecting ? 'default' : 'pointer', fontSize: '14px' }}>
                                    {connecting ? t.connecting : `${t.connectBtn} — ${form.platform}`}
                                </button>
                                {connectError && (
                                    <div className="fade-in" style={{ backgroundColor: '#FEF0F0', borderRadius: '8px', padding: '10px 12px', marginTop: '10px', border: '1px solid #FECACA' }}>
                                        <p style={{ color: '#B91C1C', fontSize: '12px' }}>{connectError}</p>
                                    </div>
                                )}
                                {errTxt('connect')}
                            </div>
                        )}

                        {/* Connected */}
                        {connected && linkedData && (
                            <div className="fade-in" style={{ backgroundColor: '#E8F5EE', borderRadius: '12px', padding: '16px', marginBottom: '16px', border: '1px solid #A8D5BC' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2E7D52" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                                    <p style={{ color: '#2E7D52', fontWeight: '700', fontSize: '13px' }}>{form.platform} {t.connected}</p>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                    <div style={{ backgroundColor: cardBg, borderRadius: '10px', padding: '12px', textAlign: 'center', border: '1px solid #A8D5BC' }}>
                                        <p style={{ color: '#2E7D52', fontWeight: '800', fontSize: '20px' }}>₹{linkedData.avgIncome}</p>
                                        <p style={{ color: textMuted, fontSize: '11px', marginTop: '3px' }}>{t.avgIncome}</p>
                                    </div>
                                    <div style={{ backgroundColor: cardBg, borderRadius: '10px', padding: '12px', textAlign: 'center', border: '1px solid #BFDBFE' }}>
                                        <p style={{ color: '#1A3A5C', fontWeight: '800', fontSize: '20px' }}>{linkedData.avgDeliveries}/day</p>
                                        <p style={{ color: textMuted, fontSize: '11px', marginTop: '3px' }}>{t.avgDeliveries}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Missed Earnings */}
                        {connected && linkedData && (
                            <div className="fade-in" style={{ backgroundColor: '#FFF0E6', borderRadius: '12px', padding: '16px', marginBottom: '16px', border: '1px solid #FFCBA4', borderLeft: '4px solid #C05C1A' }}>
                                <p style={{ color: '#C05C1A', fontWeight: '700', fontSize: '13px', marginBottom: '6px' }}>⚠ {t.missedTitle}</p>
                                <p style={{ color: '#92400E', fontSize: '13px', lineHeight: 1.6 }}>
                                    {t.missedMsg} <span style={{ fontWeight: '800', fontSize: '15px' }}>₹{missedPayout}</span> {t.missedMsg2}
                                </p>
                            </div>
                        )}

                        {/* Custom Premium Slider */}
                        {connected && form.city && policyType === 'individual' && (
                            <div className="fade-in" style={{ backgroundColor: '#F8F9FF', borderRadius: '14px', padding: '18px', marginBottom: '16px', border: `1px solid ${cardBorder}` }}>
                                <p style={{ color: textPrimary, fontWeight: '700', fontSize: '14px', marginBottom: '4px' }}>{t.customPremium}</p>
                                <p style={{ color: textMuted, fontSize: '12px', marginBottom: '14px' }}>{t.customSub}{basePremium}/week.</p>
                                <input type="range" min={basePremium} max={200} step={5} value={customPremium || basePremium}
                                    onChange={e => setCustomPremium(parseInt(e.target.value))}
                                    style={{ width: '100%', marginBottom: '12px', accentColor: '#1A3A5C' }} />
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                    <div style={{ backgroundColor: cardBg, borderRadius: '10px', padding: '12px', textAlign: 'center', border: '1px solid #BFDBFE' }}>
                                        <p style={{ color: '#1A3A5C', fontWeight: '800', fontSize: '20px' }}>₹{activePremium}</p>
                                        <p style={{ color: textMuted, fontSize: '11px', marginTop: '2px' }}>{t.totalPremium}/week</p>
                                    </div>
                                    <div style={{ backgroundColor: cardBg, borderRadius: '10px', padding: '12px', textAlign: 'center', border: '1px solid #A8D5BC' }}>
                                        <p style={{ color: '#2E7D52', fontWeight: '800', fontSize: '20px' }}>₹{coverage}</p>
                                        <p style={{ color: textMuted, fontSize: '11px', marginTop: '2px' }}>{t.weeklyCoverage}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {policyType === 'employer' && (
                            <div style={{ backgroundColor: '#E8F5EE', borderRadius: '12px', padding: '14px', marginBottom: '16px', border: '1px solid #A8D5BC' }}>
                                <p style={{ color: '#2E7D52', fontSize: '13px', fontWeight: '600' }}>Employer Sponsored — Premium paid by your employer</p>
                            </div>
                        )}

                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button onClick={() => setStep(1)} style={{ flex: 1, backgroundColor: cardBg, color: '#1A3A5C', padding: '13px', borderRadius: '10px', border: `1.5px solid #D1D5DB`, fontSize: '14px', fontWeight: '700', cursor: 'pointer' }}>{t.back}</button>
                            <button onClick={() => { if (validateStep2()) setStep(3); }} style={{ flex: 2, background: 'linear-gradient(135deg, #1A3A5C, #08101F)', color: 'white', padding: '13px', borderRadius: '10px', border: 'none', fontSize: '14px', fontWeight: '700', cursor: 'pointer', letterSpacing: 0.3 }}>{t.review}</button>
                        </div>
                    </div>
                )}

                {/* STEP 3 */}
                {step === 3 && (
                    <div className="fade-in">
                        {/* Policy Preview Card */}
                        <div style={{ background: 'linear-gradient(170deg, #08101F 0%, #0D1829 100%)', borderRadius: '18px', padding: '24px', marginBottom: '14px', color: 'white', boxShadow: '0 4px 24px rgba(8,16,31,0.35)', position: 'relative', overflow: 'hidden' }}>
                            <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)', backgroundSize: '60px 60px', pointerEvents: 'none' }} />
                            <p style={{ opacity: 0.7, fontSize: '11px', letterSpacing: '0.8px', textTransform: 'uppercase', color: 'white' }}>Policy Preview</p>
                            <p style={{ fontSize: '20px', fontWeight: '800', marginTop: '6px', color: 'white' }}>{form.name}</p>
                            <p style={{ opacity: 0.65, fontSize: '12px', marginTop: '3px', color: 'white' }}>{form.zone}, {form.city} · {form.platform}</p>
                            {policyType === 'employer' && (
                                <div style={{ backgroundColor: 'rgba(46,125,82,0.3)', padding: '3px 10px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.2)', display: 'inline-block', marginTop: '8px' }}>
                                    <p style={{ fontSize: '10px', fontWeight: '700', color: 'white' }}>EMPLOYER SPONSORED</p>
                                </div>
                            )}
                            <div style={{ borderTop: '1px solid rgba(255,255,255,0.15)', marginTop: '16px', paddingTop: '16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <div style={{ textAlign: 'center', backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: '10px', padding: '12px' }}>
                                    <p style={{ fontWeight: '800', fontSize: '22px', color: 'white' }}>
                                        {policyType === 'employer' ? 'FREE' : `₹${referralValid ? activePremium - 10 : activePremium}/wk`}
                                    </p>
                                    <p style={{ opacity: 0.65, fontSize: '11px', marginTop: '3px', color: 'white' }}>Weekly Premium</p>
                                </div>
                                <div style={{ textAlign: 'center', backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: '10px', padding: '12px' }}>
                                    <p style={{ fontWeight: '800', fontSize: '22px', color: 'white' }}>₹{coverage}/wk</p>
                                    <p style={{ opacity: 0.65, fontSize: '11px', marginTop: '3px', color: 'white' }}>Weekly Coverage</p>
                                </div>
                            </div>
                        </div>

                        {/* Details */}
                        <div style={{ backgroundColor: cardBg, borderRadius: '16px', padding: '20px', marginBottom: '14px', border: `1px solid ${cardBorder}` }}>
                            {[
                                { label: 'Full Name', value: form.name },
                                { label: 'Email', value: form.email },
                                { label: 'Phone', value: form.phone + ' (verified)' },
                                { label: 'Age', value: form.age + ' years' },
                                { label: 'Aadhaar', value: 'XXXX-XXXX-' + form.aadhaar.slice(-4) + ' (verified)' },
                                { label: 'Employee ID', value: form.employeeId },
                                { label: 'Policy Type', value: policyType === 'individual' ? 'Individual' : 'Employer Sponsored' },
                                ...(policyType === 'employer' ? [{ label: 'Employer', value: form.employerName }] : []),
                                ...(form.eshramId?.length === 12 ? [{ label: 'e-Shram ID', value: form.eshramId }] : []),
                                { label: 'Platform', value: form.platform },
                                { label: 'City', value: form.city },
                                { label: 'Zone', value: form.zone },
                                { label: 'Avg Weekly Income', value: '₹' + (linkedData?.avgIncome || '-') },
                                { label: 'Avg Daily Deliveries', value: (linkedData?.avgDeliveries || '-') + ' deliveries' },
                                ...(referralValid ? [{ label: 'Referral Discount', value: '₹10 applied — ' + form.referralCode }] : []),
                            ].map((item, i, arr) => (
                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: i < arr.length - 1 ? `1px solid ${cardBorder}` : 'none' }}>
                                    <p style={{ color: textMuted, fontSize: '13px' }}>{item.label}</p>
                                    <p style={{ color: textPrimary, fontWeight: '600', fontSize: '13px', textAlign: 'right', maxWidth: '55%' }}>{item.value}</p>
                                </div>
                            ))}
                        </div>

                        <div style={{ backgroundColor: '#E8F5EE', borderRadius: '12px', padding: '13px 16px', marginBottom: '20px', border: '1px solid #A8D5BC' }}>
                            <p style={{ color: '#2E7D52', fontSize: '13px', fontWeight: '600' }}>{t.disclaimer}</p>
                        </div>

                        {policyType === 'individual' ? (
                            <div style={{ backgroundColor: cardBg, borderRadius: '14px', padding: '18px', marginBottom: '12px', border: `1px solid ${cardBorder}` }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                                    <p style={{ color: textPrimary, fontWeight: '700', fontSize: '14px' }}>Amount Due</p>
                                    <div style={{ textAlign: 'right' }}>
                                        {referralValid && <p style={{ color: textMuted, fontSize: '13px', textDecoration: 'line-through' }}>₹{activePremium}</p>}
                                        <p style={{ color: '#1A3A5C', fontWeight: '800', fontSize: '22px' }}>₹{referralValid ? activePremium - 10 : activePremium}</p>
                                        {referralValid && <p style={{ color: '#2E7D52', fontSize: '11px', fontWeight: '600' }}>Referral discount applied</p>}
                                    </div>
                                </div>
                                <button onClick={() => setShowPayment(true)}
                                    style={{ width: '100%', background: 'linear-gradient(135deg, #1A3A5C, #08101F)', color: 'white', padding: '15px', borderRadius: '12px', border: 'none', fontSize: '15px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 16px rgba(8,16,31,0.3)', marginBottom: '10px', letterSpacing: 0.3 }}>
                                    {t.payRazorpay} — ₹{referralValid ? activePremium - 10 : activePremium}
                                </button>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                                    <p style={{ color: textMuted, fontSize: '11px' }}>{t.secured}</p>
                                </div>
                            </div>
                        ) : (
                            <button onClick={handlePaymentSuccess}
                                style={{ width: '100%', backgroundColor: '#2E7D52', color: 'white', padding: '15px', borderRadius: '12px', border: 'none', fontSize: '15px', fontWeight: '700', cursor: 'pointer', marginBottom: '12px' }}>
                                {t.employerActivate}
                            </button>
                        )}

                        <button onClick={() => setStep(2)} style={{ width: '100%', backgroundColor: cardBg, color: '#1A3A5C', padding: '13px', borderRadius: '12px', border: `1.5px solid #D1D5DB`, fontSize: '14px', fontWeight: '700', cursor: 'pointer' }}>
                            {t.editDetails}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}