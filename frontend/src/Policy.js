import React, { useState } from 'react';
import { useTheme } from './App';

const T = {
    en: {
        brand: 'KavachPay', back: 'Back',
        title: 'My Policy',
        policyHolder: 'POLICY HOLDER', active: 'ACTIVE', paused: 'PAUSED',
        weeklyPremium: 'Weekly Premium', weeklyCoverage: 'Weekly Coverage',
        free: 'FREE', employerSponsored: 'EMPLOYER SPONSORED',
        policyDetails: 'Policy Details',
        policyId: 'Policy ID', employeeId: 'Employee ID', platform: 'Platform',
        zone: 'Zone', city: 'City', age: 'Age', years: 'years',
        avgIncome: 'Avg Weekly Income', avgDeliveries: 'Avg Daily Deliveries',
        incomeProtected: 'Income Protected',
        validFrom: 'Valid From', validUntil: 'Valid Until',
        renewal: 'Renewal', autoRenew: 'Auto-renews weekly',
        policyType: 'Policy Type', employer: 'Employer',
        eshramId: 'e-Shram ID', eshramLinked: '(linked)',
        individualPolicy: 'Individual Policy', employerPolicy: 'Employer Sponsored',
        covered: "What's Covered", notCovered: "What's Not Covered",
        payoutTiers: 'Payout Tiers',
        minor: 'Minor Disruption', moderate: 'Moderate Disruption', severe: 'Severe Disruption',
        minorDesc: 'Rain 25–74mm / AQI 200–299 / Fog / Light Wind',
        moderateDesc: 'Rain 75–99mm / AQI 300–399 / Storm / Heatwave',
        severeDesc: 'Rain 100mm+ / AQI 400+ / Flood / Earthquake / Landslide / Curfew',
        ofCoverage: '% of weekly coverage',
        howVerified: 'How Claims Are Verified',
        howVerifiedSub: '5-layer behavioral verification runs automatically on every claim.',
        layer1: 'Work Intent', layer1desc: 'Did you tap Start My Day before the disruption?',
        layer2: 'Disruption Trigger', layer2desc: 'Did IMD/CPCB/NDMA confirm the event in your zone?',
        layer3: 'Zone Correlation', layer3desc: 'Were 60%+ of workers in your zone also inactive?',
        layer4: 'Inactivity Check', layer4desc: 'Did your GPS confirm you were stationary during disruption?',
        layer5: 'KavachScore', layer5desc: 'Is your behavioral trust score above 300?',
        pauseTitle: 'Policy Pause',
        pauseSub: 'Taking a break? Pause your policy — no premium charged while paused.',
        pauseActive: 'Policy is currently paused',
        pauseActiveSub: 'No premium charged. Resume to reactivate coverage.',
        resume: 'Resume Policy',
        pauseConfirm: 'Are you sure?',
        pauseConfirmSub: 'You will not be covered for disruptions while paused.',
        yesPause: 'Yes, Pause', cancel: 'Cancel',
        pauseBtn: 'Pause My Policy',
        renewedMsg: 'Policy Renewed Successfully',
        renewedSub: 'Valid until next week. Stay safe on the roads.',
        renewAmount: 'Renewal Amount',
        renewBtn: 'Renew with Razorpay',
        secured: 'Secured by Razorpay • 256-bit SSL encryption',
        backDashboard: 'Back to Dashboard',
        downloadPolicy: 'Download Policy Document',
        rain: 'Heavy / Moderate / Light Rain', rainDesc: 'Rainfall above 25mm per hour in your zone',
        aqi: 'Poor / Severe AQI', aqiDesc: 'Air Quality Index above 200',
        flood: 'Flood Alert', floodDesc: 'Official NDMA flood warning issued',
        storm: 'Storm', stormDesc: 'Wind speed above 60kmh',
        curfew: 'Curfew', curfewDesc: 'Government declared curfew in zone',
        earthquake: 'Earthquake', earthquakeDesc: 'Magnitude above 4.0',
        landslide: 'Landslide', landslideDesc: 'IMD issued landslide warning',
        heatwave: 'Heatwave', heatwaveDesc: 'Temperature above 45°C',
        fog: 'Dense Fog', fogDesc: 'Visibility below 50 metres',
        wind: 'High Wind', windDesc: 'Wind speed above 80kmh',
        noVehicle: 'Vehicle damage or breakdown',
        noHealth: 'Health issues or accidents',
        noPersonal: 'Personal reasons for not working',
        noOutside: 'Income loss outside your enrolled zone',
        employerRenewal: 'Employer Sponsored — No renewal payment required',
        employerRenewalSub: 'Your employer automatically renews your policy each week.',
    },
    hi: {
        brand: 'KavachPay', back: 'वापस',
        title: 'मेरी पॉलिसी',
        policyHolder: 'पॉलिसी धारक', active: 'सक्रिय', paused: 'रुकी हुई',
        weeklyPremium: 'साप्ताहिक प्रीमियम', weeklyCoverage: 'साप्ताहिक कवरेज',
        free: 'मुफ़्त', employerSponsored: 'नियोक्ता प्रायोजित',
        policyDetails: 'पॉलिसी विवरण',
        policyId: 'पॉलिसी ID', employeeId: 'कर्मचारी ID', platform: 'प्लेटफॉर्म',
        zone: 'क्षेत्र', city: 'शहर', age: 'आयु', years: 'वर्ष',
        avgIncome: 'औसत साप्ताहिक आय', avgDeliveries: 'औसत दैनिक डिलीवरी',
        incomeProtected: 'आय सुरक्षित',
        validFrom: 'से मान्य', validUntil: 'तक मान्य',
        renewal: 'नवीनीकरण', autoRenew: 'साप्ताहिक स्वतः नवीनीकरण',
        policyType: 'पॉलिसी प्रकार', employer: 'नियोक्ता',
        eshramId: 'e-Shram ID', eshramLinked: '(लिंक)',
        individualPolicy: 'व्यक्तिगत पॉलिसी', employerPolicy: 'नियोक्ता प्रायोजित',
        covered: 'क्या कवर है', notCovered: 'क्या कवर नहीं है',
        payoutTiers: 'भुगतान स्तर',
        minor: 'मामूली व्यवधान', moderate: 'मध्यम व्यवधान', severe: 'गंभीर व्यवधान',
        minorDesc: 'बारिश 25–74mm / AQI 200–299 / कोहरा / हल्की हवा',
        moderateDesc: 'बारिश 75–99mm / AQI 300–399 / तूफान / लू',
        severeDesc: 'बारिश 100mm+ / AQI 400+ / बाढ़ / भूकंप / भूस्खलन / कर्फ्यू',
        ofCoverage: '% साप्ताहिक कवरेज',
        howVerified: 'दावे कैसे सत्यापित होते हैं',
        howVerifiedSub: '5-परत व्यवहार सत्यापन हर दावे पर स्वचालित रूप से चलता है।',
        layer1: 'कार्य इरादा', layer1desc: 'क्या आपने व्यवधान से पहले Start My Day दबाया?',
        layer2: 'व्यवधान ट्रिगर', layer2desc: 'क्या IMD/CPCB/NDMA ने घटना की पुष्टि की?',
        layer3: 'क्षेत्र सहसंबंध', layer3desc: 'क्या आपके क्षेत्र के 60%+ कर्मचारी भी निष्क्रिय थे?',
        layer4: 'निष्क्रियता जांच', layer4desc: 'क्या आपका GPS पुष्टि करता है कि आप स्थिर थे?',
        layer5: 'KavachScore', layer5desc: 'क्या आपका ट्रस्ट स्कोर 300 से ऊपर है?',
        pauseTitle: 'पॉलिसी विराम',
        pauseSub: 'ब्रेक ले रहे हैं? पॉलिसी रोकें — रुकने पर कोई प्रीमियम नहीं।',
        pauseActive: 'पॉलिसी वर्तमान में रुकी हुई है',
        pauseActiveSub: 'कोई प्रीमियम नहीं। कवरेज पुनः सक्रिय करने के लिए फिर शुरू करें।',
        resume: 'पॉलिसी फिर शुरू करें',
        pauseConfirm: 'क्या आप निश्चित हैं?',
        pauseConfirmSub: 'रुकने पर आप व्यवधानों के लिए कवर नहीं होंगे।',
        yesPause: 'हां, रोकें', cancel: 'रद्द करें',
        pauseBtn: 'मेरी पॉलिसी रोकें',
        renewedMsg: 'पॉलिसी सफलतापूर्वक नवीनीकृत',
        renewedSub: 'अगले सप्ताह तक वैध। सुरक्षित रहें।',
        renewAmount: 'नवीनीकरण राशि',
        renewBtn: 'Razorpay से नवीनीकृत करें',
        secured: 'Razorpay द्वारा सुरक्षित',
        backDashboard: 'डैशबोर्ड पर वापस',
        downloadPolicy: 'पॉलिसी दस्तावेज़ डाउनलोड करें',
        rain: 'भारी / मध्यम / हल्की बारिश', rainDesc: 'आपके क्षेत्र में 25mm प्रति घंटे से अधिक वर्षा',
        aqi: 'खराब / गंभीर AQI', aqiDesc: 'वायु गुणवत्ता सूचकांक 200 से अधिक',
        flood: 'बाढ़ अलर्ट', floodDesc: 'NDMA की आधिकारिक बाढ़ चेतावनी',
        storm: 'तूफान', stormDesc: 'हवा की गति 60kmh से अधिक',
        curfew: 'कर्फ्यू', curfewDesc: 'सरकार द्वारा घोषित कर्फ्यू',
        earthquake: 'भूकंप', earthquakeDesc: 'तीव्रता 4.0 से अधिक',
        landslide: 'भूस्खलन', landslideDesc: 'IMD भूस्खलन चेतावनी',
        heatwave: 'लू', heatwaveDesc: 'तापमान 45°C से अधिक',
        fog: 'घना कोहरा', fogDesc: 'दृश्यता 50 मीटर से कम',
        wind: 'तेज हवा', windDesc: 'हवा की गति 80kmh से अधिक',
        noVehicle: 'वाहन क्षति या खराबी',
        noHealth: 'स्वास्थ्य समस्याएं या दुर्घटनाएं',
        noPersonal: 'काम न करने के व्यक्तिगत कारण',
        noOutside: 'पंजीकृत क्षेत्र के बाहर आय हानि',
        employerRenewal: 'नियोक्ता प्रायोजित — कोई नवीनीकरण भुगतान आवश्यक नहीं',
        employerRenewalSub: 'आपका नियोक्ता हर सप्ताह आपकी पॉलिसी स्वचालित रूप से नवीनीकृत करता है।',
    },
    ta: {
        brand: 'KavachPay', back: 'திரும்பு',
        title: 'என் பாலிசி',
        policyHolder: 'பாலிசி தாரர்', active: 'செயலில்', paused: 'இடைநிறுத்தம்',
        weeklyPremium: 'வாராந்திர பிரீமியம்', weeklyCoverage: 'வாராந்திர கவரேஜ்',
        free: 'இலவசம்', employerSponsored: 'முதலாளி வழங்கல்',
        policyDetails: 'பாலிசி விவரங்கள்',
        policyId: 'பாலிசி ID', employeeId: 'ஊழியர் ID', platform: 'தளம்',
        zone: 'மண்டலம்', city: 'நகரம்', age: 'வயது', years: 'ஆண்டுகள்',
        avgIncome: 'சராசரி வாராந்திர வருமானம்', avgDeliveries: 'சராசரி தினசரி டெலிவரி',
        incomeProtected: 'வருமானம் பாதுகாக்கப்பட்டது',
        validFrom: 'தொடக்கம்', validUntil: 'முடிவு',
        renewal: 'புதுப்பிப்பு', autoRenew: 'வாராந்திர தானியங்கி புதுப்பிப்பு',
        policyType: 'பாலிசி வகை', employer: 'முதலாளி',
        eshramId: 'e-Shram ID', eshramLinked: '(இணைக்கப்பட்டது)',
        individualPolicy: 'தனிநபர் பாலிசி', employerPolicy: 'முதலாளி வழங்கல்',
        covered: 'என்ன கவர் செய்யப்படுகிறது', notCovered: 'என்ன கவர் செய்யப்படவில்லை',
        payoutTiers: 'பணம் செலுத்தும் நிலைகள்',
        minor: 'சிறிய இடையூறு', moderate: 'நடுத்தர இடையூறு', severe: 'கடுமையான இடையூறு',
        minorDesc: 'மழை 25–74mm / AQI 200–299 / பனிமூட்டம் / இலகு காற்று',
        moderateDesc: 'மழை 75–99mm / AQI 300–399 / புயல் / வெப்ப அலை',
        severeDesc: 'மழை 100mm+ / AQI 400+ / வெள்ளம் / நிலநடுக்கம் / நிலச்சரிவு / ஊரடங்கு',
        ofCoverage: '% வாராந்திர கவரேஜ்',
        howVerified: 'கோரிக்கைகள் எவ்வாறு சரிபார்க்கப்படுகின்றன',
        howVerifiedSub: '5 அடுக்கு நடத்தை சரிபார்ப்பு ஒவ்வொரு கோரிக்கையிலும் தானாக இயங்குகிறது.',
        layer1: 'பணி நோக்கம்', layer1desc: 'இடையூறுக்கு முன் Start My Day அழுத்தினீர்களா?',
        layer2: 'இடையூறு தூண்டல்', layer2desc: 'IMD/CPCB/NDMA நிகழ்வை உறுதிப்படுத்தியதா?',
        layer3: 'மண்டல தொடர்பு', layer3desc: 'உங்கள் மண்டலத்தில் 60%+ தொழிலாளர்கள் செயலற்று இருந்தனரா?',
        layer4: 'செயலற்ற நிலை சரிபார்ப்பு', layer4desc: 'உங்கள் GPS நீங்கள் நிலையாக இருந்தீர்கள் என்று உறுதிப்படுத்துகிறதா?',
        layer5: 'KavachScore', layer5desc: 'உங்கள் நம்பகத்தன்மை ஸ்கோர் 300க்கு மேலா?',
        pauseTitle: 'பாலிசி இடைநிறுத்தம்',
        pauseSub: 'ஓய்வு எடுக்கிறீர்களா? பாலிசியை நிறுத்தவும் — நிறுத்தியிருக்கும்போது பிரீமியம் இல்லை.',
        pauseActive: 'பாலிசி தற்போது நிறுத்தப்பட்டுள்ளது',
        pauseActiveSub: 'பிரீமியம் வசூலிக்கப்படவில்லை. கவரேஜை மீண்டும் செயல்படுத்த தொடரவும்.',
        resume: 'பாலிசி தொடரவும்',
        pauseConfirm: 'நிச்சயமா?',
        pauseConfirmSub: 'நிறுத்தியிருக்கும்போது நீங்கள் கவர் செய்யப்பட மாட்டீர்கள்.',
        yesPause: 'ஆம், நிறுத்து', cancel: 'ரத்து செய்',
        pauseBtn: 'என் பாலிசியை நிறுத்து',
        renewedMsg: 'பாலிசி வெற்றிகரமாக புதுப்பிக்கப்பட்டது',
        renewedSub: 'அடுத்த வாரம் வரை செல்லுபடியாகும். பாதுகாப்பாக இருங்கள்.',
        renewAmount: 'புதுப்பிப்பு தொகை',
        renewBtn: 'Razorpay மூலம் புதுப்பிக்கவும்',
        secured: 'Razorpay மூலம் பாதுகாக்கப்பட்டது',
        backDashboard: 'டாஷ்போர்டுக்கு திரும்பு',
        downloadPolicy: 'பாலிசி ஆவணத்தை பதிவிறக்கவும்',
        rain: 'கனமழை / மிதமான மழை / இலகு மழை', rainDesc: 'உங்கள் மண்டலத்தில் 25mm மேல் மழை',
        aqi: 'மோசமான / கடுமையான AQI', aqiDesc: 'காற்று தர குறியீடு 200 மேல்',
        flood: 'வெள்ள எச்சரிக்கை', floodDesc: 'NDMA அதிகாரப்பூர்வ வெள்ள எச்சரிக்கை',
        storm: 'புயல்', stormDesc: 'காற்று வேகம் 60kmh மேல்',
        curfew: 'ஊரடங்கு', curfewDesc: 'அரசு அறிவித்த ஊரடங்கு',
        earthquake: 'நிலநடுக்கம்', earthquakeDesc: 'அளவு 4.0 மேல்',
        landslide: 'நிலச்சரிவு', landslideDesc: 'IMD நிலச்சரிவு எச்சரிக்கை',
        heatwave: 'வெப்ப அலை', heatwaveDesc: 'வெப்பநிலை 45°C மேல்',
        fog: 'அடர்த்தியான பனிமூட்டம்', fogDesc: 'தெரிவுத்திறன் 50 மீட்டருக்கும் குறைவு',
        wind: 'கடும் காற்று', windDesc: 'காற்று வேகம் 80kmh மேல்',
        noVehicle: 'வாகன சேதம் அல்லது கோளாறு',
        noHealth: 'உடல்நல பிரச்சினைகள் அல்லது விபத்துகள்',
        noPersonal: 'வேலை செய்யாததற்கான தனிப்பட்ட காரணங்கள்',
        noOutside: 'பதிவு செய்த மண்டலத்திற்கு வெளியே வருமான இழப்பு',
        employerRenewal: 'முதலாளி வழங்கல் — புதுப்பிப்பு கட்டணம் தேவையில்லை',
        employerRenewalSub: 'உங்கள் முதலாளி ஒவ்வொரு வாரமும் உங்கள் பாலிசியை தானாக புதுப்பிக்கிறார்.',
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

const PaymentModal = ({ premium, name, onSuccess, onClose }) => {
    const [paymentStep, setPaymentStep] = useState('select');
    const [selectedMethod, setSelectedMethod] = useState('upi');
    const [upiId, setUpiId] = useState('');
    const [upiError, setUpiError] = useState('');

    const handlePay = () => {
        if (selectedMethod === 'upi' && !upiId) { setUpiError('Please enter your UPI ID'); return; }
        if (selectedMethod === 'upi' && !upiId.includes('@')) { setUpiError('Enter a valid UPI ID (e.g. ravi@upi)'); return; }
        setUpiError(''); setPaymentStep('processing');
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

                <div style={{ backgroundColor: '#F9FAFB', borderRadius: '12px', padding: '16px', marginBottom: '20px', border: '1px solid #E5E7EB', textAlign: 'center' }}>
                    <p style={{ color: '#6B7280', fontSize: '12px', marginBottom: '4px', letterSpacing: '0.3px' }}>WEEKLY PREMIUM RENEWAL — KAVACHPAY</p>
                    <p style={{ color: '#072654', fontWeight: '800', fontSize: '32px', letterSpacing: '-1px' }}>₹{premium}</p>
                    <p style={{ color: '#9CA3AF', fontSize: '12px', marginTop: '4px' }}>Policyholder: {name}</p>
                </div>

                {paymentStep === 'select' && (
                    <div>
                        {[
                            { key: 'upi', label: 'UPI', sub: 'GPay, PhonePe, Paytm', icon: '📱', bg: '#F0FDF4', border: '#BBF7D0' },
                            { key: 'card', label: 'Debit / Credit Card', sub: 'Visa, Mastercard, RuPay', icon: '💳', bg: '#EEF4FF', border: '#DBEAFE' },
                            { key: 'netbanking', label: 'Net Banking', sub: 'All major banks', icon: '🏦', bg: '#FFFBEB', border: '#FDE68A' },
                        ].map(method => (
                            <div key={method.key} onClick={() => setSelectedMethod(method.key)}
                                style={{ border: `2px solid ${selectedMethod === method.key ? '#3395FF' : '#E5E7EB'}`, borderRadius: '12px', padding: '14px 16px', marginBottom: '10px', cursor: 'pointer', backgroundColor: selectedMethod === method.key ? '#EEF4FF' : 'white' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: selectedMethod === 'upi' && method.key === 'upi' ? '12px' : '0' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: method.bg, border: `1px solid ${method.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>{method.icon}</div>
                                        <div>
                                            <p style={{ color: '#374151', fontWeight: '600', fontSize: '13px' }}>{method.label}</p>
                                            <p style={{ color: '#9CA3AF', fontSize: '11px' }}>{method.sub}</p>
                                        </div>
                                    </div>
                                    <div style={{ width: '18px', height: '18px', borderRadius: '50%', border: `2px solid ${selectedMethod === method.key ? '#3395FF' : '#D1D5DB'}`, backgroundColor: selectedMethod === method.key ? '#3395FF' : 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        {selectedMethod === method.key && <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'white' }} />}
                                    </div>
                                </div>
                                {selectedMethod === 'upi' && method.key === 'upi' && (
                                    <div>
                                        <input type="text" placeholder="Enter UPI ID (e.g. ravi@upi)" value={upiId} onChange={e => { setUpiId(e.target.value); setUpiError(''); }}
                                            style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: `1.5px solid ${upiError ? '#FECACA' : '#E5E7EB'}`, fontSize: '13px', boxSizing: 'border-box', fontFamily: 'Inter', outline: 'none' }} />
                                        {upiError && <p style={{ color: '#DC2626', fontSize: '12px', marginTop: '4px' }}>{upiError}</p>}
                                    </div>
                                )}
                            </div>
                        ))}
                        <button onClick={handlePay}
                            style={{ width: '100%', backgroundColor: '#3395FF', color: 'white', padding: '15px', borderRadius: '12px', border: 'none', fontSize: '15px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 16px rgba(51,149,255,0.3)', marginBottom: '12px' }}>
                            Pay ₹{premium}
                        </button>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                            <p style={{ color: '#9CA3AF', fontSize: '11px' }}>Secured by Razorpay • 256-bit SSL encryption</p>
                        </div>
                    </div>
                )}

                {paymentStep === 'processing' && (
                    <div style={{ textAlign: 'center', padding: '20px 0' }}>
                        <div style={{ width: '56px', height: '56px', borderRadius: '50%', border: '4px solid #EEF4FF', borderTop: '4px solid #3395FF', margin: '0 auto 20px', animation: 'spin 1s linear infinite' }} />
                        <p style={{ color: '#374151', fontWeight: '700', fontSize: '16px', marginBottom: '6px' }}>Processing Payment</p>
                        <p style={{ color: '#9CA3AF', fontSize: '13px' }}>Please do not close this window...</p>
                        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                    </div>
                )}

                {paymentStep === 'success' && (
                    <div style={{ textAlign: 'center', padding: '10px 0' }}>
                        <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#F0FDF4', border: '3px solid #BBF7D0', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#1E7D34" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                        </div>
                        <p style={{ color: '#1A1A2E', fontWeight: '700', fontSize: '18px', marginBottom: '6px' }}>Payment Successful</p>
                        <p style={{ color: '#9CA3AF', fontSize: '13px', marginBottom: '16px' }}>₹{premium} paid — Policy renewed</p>
                        <div style={{ backgroundColor: '#F9FAFB', borderRadius: '12px', padding: '14px', marginBottom: '20px', border: '1px solid #E5E7EB', textAlign: 'left' }}>
                            {[
                                { label: 'Amount', value: '₹' + premium },
                                { label: 'Method', value: selectedMethod === 'upi' ? 'UPI — ' + upiId : selectedMethod === 'card' ? 'Card' : 'Net Banking' },
                                { label: 'Transaction ID', value: 'pay_' + Math.random().toString(36).substr(2, 10).toUpperCase() },
                                { label: 'Status', value: 'Success' },
                            ].map((item, i) => (
                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: i < 3 ? '1px solid #F3F4F6' : 'none' }}>
                                    <p style={{ color: '#9CA3AF', fontSize: '12px' }}>{item.label}</p>
                                    <p style={{ color: item.label === 'Status' ? '#1E7D34' : '#374151', fontWeight: '600', fontSize: '12px' }}>{item.value}</p>
                                </div>
                            ))}
                        </div>
                        <button onClick={onSuccess} style={{ width: '100%', backgroundColor: '#1A56A0', color: 'white', padding: '14px', borderRadius: '12px', border: 'none', fontSize: '15px', fontWeight: '700', cursor: 'pointer' }}>Done</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default function Policy({ worker, onBack, lang, setLang }) {
    const t = T[lang] || T.en;
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const bg = isDark ? '#0F1117' : '#F4F6F9';
    const cardBg = isDark ? '#1E2130' : 'white';
    const cardBorder = isDark ? '#2D3348' : '#E5E7EB';
    const textPrimary = isDark ? '#F1F5F9' : '#1A1A2E';
    const textSecondary = isDark ? '#CBD5E1' : '#374151';
    const textMuted = isDark ? '#94A3B8' : '#6B7280';
    const navBg = isDark ? '#141720' : '#1A56A0';

    const name = worker?.name || 'Ravi Kumar';
    const zone = worker?.zone || 'Koramangala, Bangalore';
    const city = worker?.city || 'Bangalore';
    const platform = worker?.platform || 'Swiggy';
    const premium = worker?.premium || 59;
    const coverage = worker?.coverage || 1200;
    const employeeId = worker?.employeeId || 'KOR-3847261';
    const age = worker?.age || 26;
    const avgIncome = worker?.avgIncome || 1800;
    const avgDeliveries = worker?.avgDeliveries || 18;
    const policyType = worker?.policyType || 'individual';
    const employerName = worker?.employerName || '';
    const eshramId = worker?.eshramId || '';
    const phone = worker?.phone || '9876543210';

    const [paused, setPaused] = useState(false);
    const [showPauseConfirm, setShowPauseConfirm] = useState(false);
    const [renewed, setRenewed] = useState(false);
    const [showPayment, setShowPayment] = useState(false);

    const today = new Date();
    const startDate = today.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    const endDate = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

    const payoutTiers = [
        { tier: t.minor, desc: t.minorDesc, pct: 30, amount: Math.round(coverage * 0.3), color: '#1E7D34', bg: isDark ? '#0D2318' : '#F0FDF4', border: isDark ? '#166534' : '#BBF7D0' },
        { tier: t.moderate, desc: t.moderateDesc, pct: 65, amount: Math.round(coverage * 0.65), color: '#D97706', bg: isDark ? '#2D2008' : '#FFFBEB', border: isDark ? '#78350F' : '#FDE68A' },
        { tier: t.severe, desc: t.severeDesc, pct: 100, amount: coverage, color: '#C0392B', bg: isDark ? '#2D0F0F' : '#FEF2F2', border: isDark ? '#7F1D1D' : '#FECACA' },
    ];

    const coveredItems = [
        { label: t.rain, desc: t.rainDesc },
        { label: t.aqi, desc: t.aqiDesc },
        { label: t.flood, desc: t.floodDesc },
        { label: t.storm, desc: t.stormDesc },
        { label: t.curfew, desc: t.curfewDesc },
        { label: t.earthquake, desc: t.earthquakeDesc },
        { label: t.landslide, desc: t.landslideDesc },
        { label: t.heatwave, desc: t.heatwaveDesc },
        { label: t.fog, desc: t.fogDesc },
        { label: t.wind, desc: t.windDesc },
    ];

    const card = (children, mb = '14px') => (
        <div style={{ backgroundColor: cardBg, borderRadius: '14px', padding: '20px', marginBottom: mb, boxShadow: isDark ? '0 1px 4px rgba(0,0,0,0.3)' : '0 1px 4px rgba(0,0,0,0.05)', border: `1px solid ${cardBorder}`, transition: 'all 0.2s ease' }}>
            {children}
        </div>
    );

    const sectionTitle = (text) => (
        <p style={{ color: textPrimary, fontWeight: '700', fontSize: '14px', marginBottom: '14px' }}>{text}</p>
    );

    const handlePrint = () => {
        window.print();
    };

    return (
        <div style={{ backgroundColor: bg, minHeight: '100vh', fontFamily: 'Inter', transition: 'background-color 0.2s ease' }}>

            {showPayment && (
                <PaymentModal
                    premium={premium} name={name}
                    onSuccess={() => { setShowPayment(false); setRenewed(true); }}
                    onClose={() => setShowPayment(false)}
                />
            )}

            {/* Navbar */}
            <div style={{ backgroundColor: navBg, padding: '14px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'background-color 0.2s ease' }}>
                <h1 style={{ color: 'white', fontSize: '18px', fontWeight: '800' }}>{t.brand}</h1>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <LangToggle lang={lang} setLang={setLang} />
                    <button onClick={onBack} style={{ backgroundColor: 'transparent', color: 'white', border: '1px solid rgba(255,255,255,0.3)', padding: '6px 14px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>{t.back}</button>
                </div>
            </div>

            <div style={{ padding: '20px 16px', maxWidth: '520px', margin: '0 auto' }}>
                <p style={{ color: textPrimary, fontSize: '20px', fontWeight: '800', marginBottom: '16px' }}>{t.title}</p>

                {/* Policy Card */}
                <div style={{ background: 'linear-gradient(135deg, #1A56A0, #0D3B73)', borderRadius: '18px', padding: '24px', marginBottom: '14px', color: 'white', boxShadow: '0 4px 20px rgba(26,86,160,0.25)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                        <div>
                            <p style={{ opacity: 0.65, fontSize: '11px', letterSpacing: '0.8px', textTransform: 'uppercase', color: 'white' }}>{t.policyHolder}</p>
                            <p style={{ fontWeight: '800', fontSize: '20px', marginTop: '4px', color: 'white' }}>{name}</p>
                            <p style={{ opacity: 0.65, fontSize: '12px', marginTop: '3px', color: 'white' }}>{platform} • {zone.split(',')[0]}</p>
                            {policyType === 'employer' && (
                                <div style={{ backgroundColor: 'rgba(30,125,52,0.4)', padding: '3px 10px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.2)', display: 'inline-block', marginTop: '6px' }}>
                                    <p style={{ fontSize: '10px', fontWeight: '700', color: 'white' }}>{t.employerSponsored}</p>
                                </div>
                            )}
                        </div>
                        <div style={{ backgroundColor: paused ? 'rgba(217,119,6,0.85)' : 'rgba(30,125,52,0.85)', padding: '5px 14px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.2)' }}>
                            <p style={{ fontSize: '11px', fontWeight: '700', letterSpacing: '0.5px', color: 'white' }}>{paused ? t.paused : t.active}</p>
                        </div>
                    </div>
                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.12)', paddingTop: '16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        {[
                            { label: t.weeklyPremium, value: policyType === 'employer' ? t.free : '₹' + premium },
                            { label: t.weeklyCoverage, value: '₹' + coverage },
                        ].map((item, i) => (
                            <div key={i} style={{ textAlign: 'center', backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: '10px', padding: '12px' }}>
                                <p style={{ fontWeight: '800', fontSize: '22px', color: 'white' }}>{item.value}</p>
                                <p style={{ opacity: 0.65, fontSize: '11px', marginTop: '3px', color: 'white' }}>{item.label}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Download Button */}
                <button onClick={handlePrint}
                    style={{ width: '100%', backgroundColor: cardBg, color: '#1A56A0', padding: '12px', borderRadius: '10px', border: `1.5px solid ${isDark ? '#2D4070' : '#DBEAFE'}`, fontSize: '13px', fontWeight: '700', cursor: 'pointer', marginBottom: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontFamily: 'Inter' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1A56A0" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
                    {t.downloadPolicy}
                </button>

                {/* Policy Details */}
                {card(<>
                    {sectionTitle(t.policyDetails)}
                    {[
                        { label: t.policyId, value: 'KVP-' + phone.slice(-6) },
                        { label: t.employeeId, value: employeeId },
                        { label: t.policyType, value: policyType === 'individual' ? t.individualPolicy : t.employerPolicy },
                        ...(policyType === 'employer' && employerName ? [{ label: t.employer, value: employerName }] : []),
                        { label: t.platform, value: platform },
                        { label: t.city, value: city },
                        { label: t.zone, value: zone },
                        { label: t.age, value: age + ' ' + t.years },
                        { label: t.avgIncome, value: '₹' + avgIncome },
                        { label: t.avgDeliveries, value: avgDeliveries + '/day' },
                        { label: t.incomeProtected, value: '65%' },
                        ...(eshramId ? [{ label: t.eshramId, value: eshramId + ' ' + t.eshramLinked }] : []),
                        { label: t.validFrom, value: startDate },
                        { label: t.validUntil, value: endDate },
                        { label: t.renewal, value: t.autoRenew },
                    ].map((item, i, arr) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: i < arr.length - 1 ? `1px solid ${cardBorder}` : 'none' }}>
                            <p style={{ color: textMuted, fontSize: '13px' }}>{item.label}</p>
                            <p style={{ color: textPrimary, fontWeight: '600', fontSize: '13px', textAlign: 'right', maxWidth: '55%' }}>{item.value}</p>
                        </div>
                    ))}
                </>)}

                {/* What's Covered — all 10 disruptions */}
                {card(<>
                    {sectionTitle(t.covered)}
                    {coveredItems.map((item, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', borderRadius: '10px', marginBottom: '6px', backgroundColor: isDark ? '#0D2318' : '#F0FDF4', border: `1px solid ${isDark ? '#166534' : '#BBF7D0'}` }}>
                            <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#1E7D34', flexShrink: 0 }} />
                            <div>
                                <p style={{ color: '#1E7D34', fontWeight: '600', fontSize: '13px' }}>{item.label}</p>
                                <p style={{ color: textMuted, fontSize: '12px', marginTop: '2px' }}>{item.desc}</p>
                            </div>
                        </div>
                    ))}
                </>)}

                {/* What's NOT Covered */}
                {card(<>
                    {sectionTitle(t.notCovered)}
                    {[t.noVehicle, t.noHealth, t.noPersonal, t.noOutside].map((item, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', borderRadius: '10px', marginBottom: '6px', backgroundColor: isDark ? '#2D0F0F' : '#FEF2F2', border: `1px solid ${isDark ? '#7F1D1D' : '#FECACA'}` }}>
                            <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#C0392B', flexShrink: 0 }} />
                            <p style={{ color: isDark ? '#F87171' : '#C0392B', fontSize: '13px', fontWeight: '600' }}>{item}</p>
                        </div>
                    ))}
                </>)}

                {/* Payout Tiers */}
                {card(<>
                    {sectionTitle(t.payoutTiers)}
                    {payoutTiers.map((tier, i) => (
                        <div key={i} style={{ backgroundColor: tier.bg, borderRadius: '12px', padding: '14px 16px', marginBottom: '10px', border: `1px solid ${tier.border}` }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                                <p style={{ color: tier.color, fontWeight: '700', fontSize: '13px' }}>{tier.tier}</p>
                                <p style={{ color: tier.color, fontWeight: '800', fontSize: '18px' }}>₹{tier.amount}</p>
                            </div>
                            <p style={{ color: textMuted, fontSize: '12px', marginBottom: '8px' }}>{tier.desc}</p>
                            <div style={{ backgroundColor: isDark ? '#1E2130' : 'rgba(255,255,255,0.7)', borderRadius: '4px', height: '6px', overflow: 'hidden' }}>
                                <div style={{ width: tier.pct + '%', height: '100%', backgroundColor: tier.color, borderRadius: '4px' }} />
                            </div>
                            <p style={{ color: textMuted, fontSize: '11px', marginTop: '4px' }}>{tier.pct}{t.ofCoverage}</p>
                        </div>
                    ))}
                </>)}

                {/* Verification Layers */}
                {card(<>
                    {sectionTitle(t.howVerified)}
                    <p style={{ color: textMuted, fontSize: '12px', marginBottom: '14px', marginTop: '-8px' }}>{t.howVerifiedSub}</p>
                    {[
                        { label: t.layer1, desc: t.layer1desc },
                        { label: t.layer2, desc: t.layer2desc },
                        { label: t.layer3, desc: t.layer3desc },
                        { label: t.layer4, desc: t.layer4desc },
                        { label: t.layer5, desc: t.layer5desc },
                    ].map((item, i) => (
                        <div key={i} style={{ display: 'flex', gap: '12px', marginBottom: '12px', alignItems: 'flex-start' }}>
                            <div style={{ width: '26px', height: '26px', borderRadius: '50%', backgroundColor: '#1A56A0', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '12px', flexShrink: 0 }}>{i + 1}</div>
                            <div>
                                <p style={{ color: textPrimary, fontWeight: '600', fontSize: '13px' }}>{item.label}</p>
                                <p style={{ color: textMuted, fontSize: '12px', marginTop: '2px' }}>{item.desc}</p>
                            </div>
                        </div>
                    ))}
                </>)}

                {/* Policy Pause */}
                {card(<>
                    {sectionTitle(t.pauseTitle)}
                    <p style={{ color: textMuted, fontSize: '12px', marginBottom: '14px', marginTop: '-8px' }}>{t.pauseSub}</p>
                    {paused ? (
                        <div>
                            <div style={{ backgroundColor: isDark ? '#2D2008' : '#FFFBEB', border: `1px solid ${isDark ? '#78350F' : '#FDE68A'}`, borderRadius: '10px', padding: '12px 14px', marginBottom: '12px' }}>
                                <p style={{ color: isDark ? '#FCD34D' : '#92400E', fontSize: '13px', fontWeight: '600' }}>{t.pauseActive}</p>
                                <p style={{ color: isDark ? '#FCD34D' : '#92400E', fontSize: '12px', marginTop: '4px' }}>{t.pauseActiveSub}</p>
                            </div>
                            <button onClick={() => setPaused(false)} style={{ width: '100%', backgroundColor: '#1E7D34', color: 'white', padding: '13px', borderRadius: '10px', border: 'none', fontSize: '14px', fontWeight: '700', cursor: 'pointer' }}>{t.resume}</button>
                        </div>
                    ) : (
                        <div>
                            {showPauseConfirm ? (
                                <div>
                                    <div style={{ backgroundColor: isDark ? '#2D2008' : '#FFFBEB', border: `1px solid ${isDark ? '#78350F' : '#FDE68A'}`, borderRadius: '10px', padding: '12px 14px', marginBottom: '12px' }}>
                                        <p style={{ color: isDark ? '#FCD34D' : '#92400E', fontSize: '13px', fontWeight: '600' }}>{t.pauseConfirm}</p>
                                        <p style={{ color: isDark ? '#FCD34D' : '#92400E', fontSize: '12px', marginTop: '4px' }}>{t.pauseConfirmSub}</p>
                                    </div>
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <button onClick={() => { setPaused(true); setShowPauseConfirm(false); }} style={{ flex: 1, backgroundColor: '#D97706', color: 'white', padding: '12px', borderRadius: '10px', border: 'none', fontSize: '14px', fontWeight: '700', cursor: 'pointer' }}>{t.yesPause}</button>
                                        <button onClick={() => setShowPauseConfirm(false)} style={{ flex: 1, backgroundColor: cardBg, color: '#1A56A0', padding: '12px', borderRadius: '10px', border: `1.5px solid ${isDark ? '#2D4070' : '#DBEAFE'}`, fontSize: '14px', fontWeight: '700', cursor: 'pointer' }}>{t.cancel}</button>
                                    </div>
                                </div>
                            ) : (
                                <button onClick={() => setShowPauseConfirm(true)} style={{ width: '100%', backgroundColor: isDark ? '#2D2008' : '#FFFBEB', color: isDark ? '#FCD34D' : '#92400E', padding: '13px', borderRadius: '10px', border: `1.5px solid ${isDark ? '#78350F' : '#FDE68A'}`, fontSize: '14px', fontWeight: '700', cursor: 'pointer' }}>{t.pauseBtn}</button>
                            )}
                        </div>
                    )}
                </>)}

                {/* Renewal */}
                {policyType === 'employer' ? (
                    <div style={{ backgroundColor: isDark ? '#0D2318' : '#F0FDF4', borderRadius: '14px', padding: '18px', textAlign: 'center', marginBottom: '14px', border: `1px solid ${isDark ? '#166534' : '#BBF7D0'}` }}>
                        <p style={{ color: '#1E7D34', fontWeight: '700', fontSize: '15px' }}>{t.employerRenewal}</p>
                        <p style={{ color: textMuted, fontSize: '13px', marginTop: '6px' }}>{t.employerRenewalSub}</p>
                    </div>
                ) : renewed ? (
                    <div style={{ backgroundColor: isDark ? '#0D2318' : '#F0FDF4', border: `1px solid ${isDark ? '#166534' : '#BBF7D0'}`, borderRadius: '14px', padding: '18px', textAlign: 'center', marginBottom: '14px' }}>
                        <p style={{ color: '#1E7D34', fontWeight: '700', fontSize: '15px' }}>{t.renewedMsg}</p>
                        <p style={{ color: textMuted, fontSize: '13px', marginTop: '6px' }}>{t.renewedSub}</p>
                    </div>
                ) : (
                    <div style={{ backgroundColor: cardBg, borderRadius: '14px', padding: '18px', marginBottom: '12px', border: `1px solid ${cardBorder}`, boxShadow: isDark ? '0 1px 4px rgba(0,0,0,0.3)' : '0 1px 4px rgba(0,0,0,0.05)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                            <p style={{ color: textPrimary, fontWeight: '700', fontSize: '14px' }}>{t.renewAmount}</p>
                            <p style={{ color: '#1A56A0', fontWeight: '800', fontSize: '20px' }}>₹{premium}</p>
                        </div>
                        <button onClick={() => setShowPayment(true)}
                            style={{ width: '100%', backgroundColor: '#3395FF', color: 'white', padding: '14px', borderRadius: '12px', border: 'none', fontSize: '15px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 16px rgba(51,149,255,0.3)', marginBottom: '10px' }}>
                            {t.renewBtn} — ₹{premium}
                        </button>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                            <p style={{ color: textMuted, fontSize: '11px' }}>{t.secured}</p>
                        </div>
                    </div>
                )}

                <button onClick={onBack} style={{ width: '100%', backgroundColor: cardBg, color: '#1A56A0', padding: '13px', borderRadius: '12px', border: `1.5px solid ${isDark ? '#2D4070' : '#DBEAFE'}`, fontSize: '14px', fontWeight: '700', cursor: 'pointer', fontFamily: 'Inter' }}>
                    {t.backDashboard}
                </button>
            </div>
        </div>
    );
}