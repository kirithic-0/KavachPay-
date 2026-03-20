import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from './App';

const QUICK_QUESTIONS = {
    en: [
        'How does KavachPay work?',
        'When will I get paid?',
        'What is KavachScore?',
        'What disruptions are covered?',
        'How do I pause my policy?',
        'Why was my claim skipped?',
    ],
    hi: [
        'KavachPay कैसे काम करता है?',
        'मुझे पैसे कब मिलेंगे?',
        'KavachScore क्या है?',
        'कौन सी घटनाएं कवर हैं?',
        'पॉलिसी कैसे रोकें?',
        'मेरा दावा क्यों छोड़ा गया?',
    ],
    ta: [
        'KavachPay எவ்வாறு செயல்படுகிறது?',
        'எனக்கு எப்போது பணம் கிடைக்கும்?',
        'KavachScore என்றால் என்ன?',
        'என்ன இடையூறுகள் கவர் செய்யப்படுகின்றன?',
        'பாலிசியை எவ்வாறு நிறுத்துவது?',
        'என் கோரிக்கை ஏன் தவிர்க்கப்பட்டது?',
    ]
};

const RESPONSES = {
    en: {
        greeting: 'Hello! Welcome to KavachPay Support.\n\nI can help you with your policy, payouts, KavachScore, claims, disruption coverage, referral codes, and loan eligibility.\n\nWhat would you like to know?',
        howWorks: 'KavachPay protects your weekly income when disruptions stop you from delivering.\n\nHow it works:\n1. Enroll with your Aadhaar, Employee ID and delivery app\n2. Disruptions in your zone are detected automatically via IMD, CPCB and NDMA government APIs\n3. Your claim is verified through 5 behavioral layers\n4. Money reaches your UPI in under 2 minutes\n\nNo forms. No calls. No paperwork.',
        payout: 'Payouts happen automatically — you do not need to do anything.\n\nPayout amounts:\n• Minor disruption (LRA/MAQ/FOG/WND) — 30% of weekly coverage\n• Moderate disruption (MRA/HRA/SAQ/STM/HTV) — 65% of weekly coverage\n• Severe disruption (FLD/EQK/LDS/CRF or extreme values) — 100% of weekly coverage\n\nMoney reaches your UPI in under 2 minutes for Trusted Workers (score 750+).',
        score: 'KavachScore is your trust score with KavachPay — similar to CIBIL but for gig workers.\n\nScore ranges:\n• 750–900 — Trusted Worker — instant payouts, lowest premium\n• 500–749 — Standard Worker — 2 hour delay, +15% premium\n• 300–499 — Under Review — 24 hour delay, manual check\n\nScore goes UP with legitimate claims and consistent activity.\nScore goes DOWN with fraud flags or suspicious patterns.\n\nYou start at 750 — already Trusted.',
        covered: 'KavachPay covers 13 types of disruptions:\n\nRain: HRA (Heavy >100mm) / MRA (Moderate 50–99mm) / LRA (Light 25–49mm)\nAir Quality: SAQ (Severe AQI >300) / MAQ (Moderate AQI 200–299)\nWeather: STM (Storm >60kmh) / HTV (Heatwave >45°C) / FOG (Dense Fog <50m vis) / WND (High Wind >80kmh)\nNatural: FLD (Flood — NDMA) / EQK (Earthquake M>4.0) / LDS (Landslide — IMD)\nCivic: CRF (Curfew — Govt order)\n\nNot covered: vehicle damage, health issues, personal reasons, disruptions outside your zone.',
        premium: 'KavachPay starts from just ₹49 per week.\n\nPremium tiers:\n• High risk zones (Mumbai/Chennai/Kolkata) — ₹74/week — ₹1,560 coverage\n• Medium risk zones — ₹59–64/week — ₹1,200–1,300 coverage\n• Low risk zones (Bangalore/Hyderabad) — ₹49/week — ₹980 coverage\n\nYou can also increase your premium using the slider during enrollment for higher coverage up to ₹200/week.',
        pause: 'You can pause your policy anytime from the My Policy page.\n\nWhile paused:\n• No premium is charged\n• No coverage is active\n• Your KavachScore is not affected\n\nResume anytime before you head out for deliveries. This is unique to KavachPay.',
        skip: 'A claim gets skipped when one of the 5 verification layers fails.\n\nCommon reasons:\n• Layer 1 — You did not tap Start My Day before the disruption\n• Layer 2 — The disruption threshold was not met in your zone per government data\n• Layer 3 — Less than 60% of workers in your zone were inactive\n• Layer 4 — Your GPS showed movement during the disruption window\n• Layer 5 — Your KavachScore fell below 300\n\nCheck the full verification timeline in My Claims.',
        zone: 'KavachPay covers 20+ cities:\n\nMetro — Chennai, Mumbai, Bangalore, Delhi/NCR, Hyderabad, Pune, Kolkata, Ahmedabad\n\nTier 2 — Coimbatore, Mysuru, Nagpur, Surat, Vizag, Indore, Bhopal, Ludhiana, Jaipur, Kochi, Noida, Gurgaon\n\nYour premium depends on your city risk level — high, medium or low.',
        enroll: 'Enrolling takes just 2 minutes.\n\nWhat you need:\n• Full name, email and phone number\n• Aadhaar number for verification\n• Your Swiggy or Zomato Employee ID\n• Mobile number registered with your platform\n\nSteps:\n1. Personal details + OTP verification\n2. Select city and zone, connect your platform account\n3. Review premium and pay\n4. Policy activates immediately',
        verification: 'KavachPay uses 5-layer behavioral verification.\n\nLayer 1 — Work Intent: Did you tap Start My Day?\nLayer 2 — Disruption Trigger: Did government APIs confirm the event?\nLayer 3 — Zone Correlation: Were 60%+ workers in your zone inactive?\nLayer 4 — GPS Inactivity: Were you stationary during the disruption?\nLayer 5 — KavachScore: Is your trust score above 300?\n\nAll 5 must pass for payout. Honest workers always get paid.',
        renewal: 'Your policy renews automatically every week.\n\nIf you want to skip a week — pause your policy before renewal date.\n\nYou can also manually renew from the My Policy page using Razorpay — UPI, card or net banking supported.',
        employer: 'KavachPay supports employer sponsored policies.\n\nIf your employer — like Swiggy or Zomato — pays your premium, select Employer Sponsored during enrollment. Your employer is notified and pays on your behalf.\n\nYou get the full coverage and all benefits. Premium shows as FREE on your dashboard.',
        referral: 'Each worker gets a unique referral code on the dashboard.\n\nHow it works:\n• Share your code with a friend\n• They use it during enrollment\n• You get ₹10 discount on your next renewal\n• Each code can only be used once\n• A new code is generated for each referral',
        loan: 'KavachPay partners with KreditBee, MoneyTap and CashE for instant loans.\n\nEligibility based on KavachScore:\n• Score 800+ — up to ₹25,000\n• Score 750–799 — up to ₹15,000\n• Score 650–749 — up to ₹8,000\n\nNo CIBIL score required. Check the loan banner on your dashboard.',
        eshram: 'e-Shram is a government portal for unorganized workers.\n\nYou can optionally link your e-Shram UAN (12-digit ID) during enrollment. This helps with faster verification and shows an e-Shram badge on your dashboard.',
        payment: 'KavachPay uses Razorpay for secure payments.\n\nSupported methods:\n• UPI — GPay, PhonePe, Paytm\n• Debit / Credit Card — Visa, Mastercard, RuPay\n• Net Banking — all major banks\n\nAll transactions secured with 256-bit SSL encryption.',
        thanks: 'Happy to help! Stay safe on the roads. KavachPay is always watching over your income.',
        insult: 'I am here to help you with KavachPay. Please ask me something about your policy, payouts, KavachScore or claims.',
        default: 'I can only help with KavachPay related questions.\n\nTopics I cover:\n• How KavachPay works\n• Premium and payout amounts\n• All 13 disruption types\n• KavachScore explained\n• Claim verification and history\n• Policy pause and renewal\n• Employer sponsored policies\n• Referral codes\n• Instant loan eligibility\n• e-Shram and Aadhaar\n\nPlease try one of the quick questions below.',
    },
    hi: {
        greeting: 'नमस्ते! KavachPay सपोर्ट में आपका स्वागत है।\n\nमैं आपकी पॉलिसी, भुगतान, KavachScore और दावों में मदद कर सकता हूं।\n\nआप क्या जानना चाहते हैं?',
        howWorks: 'KavachPay आपकी साप्ताहिक आय की रक्षा करता है जब व्यवधान आपको डिलीवरी से रोकते हैं।\n\nकैसे काम करता है:\n1. आधार, कर्मचारी ID और डिलीवरी ऐप से नामांकन करें\n2. IMD, CPCB और NDMA API से व्यवधान स्वचालित रूप से पता चलता है\n3. 5-परत व्यवहार सत्यापन\n4. 2 मिनट में UPI में पैसे\n\nकोई फॉर्म नहीं। कोई कॉल नहीं।',
        payout: 'भुगतान स्वचालित रूप से होता है।\n\nभुगतान राशि:\n• मामूली व्यवधान — साप्ताहिक कवरेज का 30%\n• मध्यम व्यवधान — साप्ताहिक कवरेज का 65%\n• गंभीर व्यवधान — साप्ताहिक कवरेज का 100%\n\nविश्वसनीय कर्मचारियों (स्कोर 750+) के लिए 2 मिनट में UPI में पैसे।',
        score: 'KavachScore गिग कर्मचारियों के लिए CIBIL जैसा ट्रस्ट स्कोर है।\n\nस्कोर श्रेणी:\n• 750–900 — विश्वसनीय — तत्काल भुगतान\n• 500–749 — मानक — 2 घंटे की देरी\n• 300–499 — समीक्षाधीन — 24 घंटे की देरी\n\nआप 750 से शुरू करते हैं।',
        covered: 'KavachPay 13 प्रकार के व्यवधानों को कवर करता है:\n\nबारिश: HRA / MRA / LRA\nवायु गुणवत्ता: SAQ / MAQ\nमौसम: STM / HTV / FOG / WND\nप्राकृतिक: FLD / EQK / LDS\nनागरिक: CRF\n\nकवर नहीं: वाहन क्षति, स्वास्थ्य समस्याएं, व्यक्तिगत कारण।',
        premium: 'KavachPay केवल ₹49 प्रति सप्ताह से शुरू होता है।\n\n• उच्च जोखिम — ₹74/सप्ताह — ₹1,560 कवरेज\n• मध्यम जोखिम — ₹59–64/सप्ताह\n• कम जोखिम — ₹49/सप्ताह — ₹980 कवरेज',
        pause: 'आप मेरी पॉलिसी पेज से कभी भी पॉलिसी रोक सकते हैं।\n\nरुकने पर:\n• कोई प्रीमियम नहीं\n• कोई कवरेज नहीं\n• KavachScore प्रभावित नहीं',
        skip: 'दावा तब छोड़ा जाता है जब 5 सत्यापन परतों में से एक विफल हो।\n\nसामान्य कारण:\n• Start My Day नहीं दबाया\n• व्यवधान सीमा नहीं पहुंची\n• क्षेत्र के 60% से कम कर्मचारी प्रभावित\n• GPS ने गतिविधि दिखाई\n• KavachScore 300 से कम',
        zone: 'KavachPay 20+ शहरों में कवरेज देता है।\n\nमेट्रो — चेन्नई, मुंबई, बैंगलोर, दिल्ली, हैदराबाद, पुणे, कोलकाता, अहमदाबाद\n\nटियर 2 — कोयंबटूर, मैसूरु, नागपुर, सूरत, विजाग और अन्य',
        enroll: 'नामांकन केवल 2 मिनट लेता है।\n\nआवश्यकता:\n• नाम, ईमेल, फोन\n• आधार नंबर\n• Swiggy या Zomato कर्मचारी ID\n\nचरण:\n1. व्यक्तिगत विवरण + OTP\n2. शहर, क्षेत्र, प्लेटफॉर्म\n3. भुगतान और सक्रियण',
        verification: 'KavachPay 5-परत व्यवहार सत्यापन उपयोग करता है।\n\nपरत 1 — कार्य इरादा\nपरत 2 — व्यवधान ट्रिगर\nपरत 3 — क्षेत्र सहसंबंध\nपरत 4 — GPS निष्क्रियता\nपरत 5 — KavachScore\n\nसभी 5 पास होने पर भुगतान।',
        renewal: 'पॉलिसी हर सप्ताह स्वचालित रूप से नवीनीकृत होती है।\n\nसप्ताह छोड़ने के लिए नवीनीकरण तारीख से पहले पॉलिसी रोकें।',
        employer: 'KavachPay नियोक्ता प्रायोजित पॉलिसी का समर्थन करता है।\n\nनामांकन के दौरान नियोक्ता प्रायोजित चुनें। आपका नियोक्ता प्रीमियम भरता है।',
        referral: 'डैशबोर्ड पर आपको एक अनोखा रेफरल कोड मिलता है।\n\nकिसी मित्र के साथ साझा करें। जब वे नामांकन करें, आपको ₹10 छूट मिलती है।',
        loan: 'KavachPay KreditBee, MoneyTap और CashE के साथ ऋण प्रदान करता है।\n\nKavachScore के आधार पर:\n• 800+ — ₹25,000 तक\n• 750–799 — ₹15,000 तक\n• 650–749 — ₹8,000 तक',
        eshram: 'e-Shram असंगठित कर्मचारियों के लिए सरकारी पोर्टल है।\n\nनामांकन के दौरान वैकल्पिक रूप से UAN लिंक करें।',
        payment: 'KavachPay Razorpay उपयोग करता है।\n\nसमर्थित तरीके: UPI, डेबिट/क्रेडिट कार्ड, नेट बैंकिंग।',
        thanks: 'मदद करके खुशी हुई! सड़कों पर सुरक्षित रहें।',
        insult: 'मैं KavachPay में आपकी मदद के लिए हूं। कृपया अपनी पॉलिसी या दावों के बारे में पूछें।',
        default: 'मैं केवल KavachPay संबंधित प्रश्नों में मदद कर सकता हूं।\n\nकृपया नीचे दिए गए त्वरित प्रश्नों में से एक आज़माएं।',
    },
    ta: {
        greeting: 'வணக்கம்! KavachPay ஆதரவுக்கு வரவேற்கிறோம்.\n\nஉங்கள் பாலிசி, பணம், KavachScore மற்றும் கோரிக்கைகளில் உதவ முடியும்.\n\nஎன்ன தெரிந்துகொள்ள விரும்புகிறீர்கள்?',
        howWorks: 'KavachPay இடையூறுகள் உங்களை டெலிவரி செய்வதிலிருந்து தடுக்கும்போது வருமானத்தை பாதுகாக்கிறது.\n\nஎவ்வாறு செயல்படுகிறது:\n1. ஆதார், ஊழியர் ID மற்றும் டெலிவரி ஆப்பில் சேரவும்\n2. IMD, CPCB, NDMA மூலம் இடையூறுகள் தானாக கண்டறியப்படும்\n3. 5 அடுக்கு சரிபார்ப்பு\n4. 2 நிமிடங்களில் UPI பணம்\n\nபடிவங்கள் இல்லை. அழைப்புகள் இல்லை.',
        payout: 'பணம் தானாக வருகிறது.\n\nபணம் அளவுகள்:\n• சிறிய இடையூறு — கவரேஜின் 30%\n• நடுத்தர இடையூறு — 65%\n• கடுமையான இடையூறு — 100%\n\nநம்பகமான தொழிலாளர்களுக்கு 2 நிமிடங்களில் UPI பணம்.',
        score: 'KavachScore கிக் தொழிலாளர்களுக்கான நம்பகத்தன்மை ஸ்கோர்.\n\nஸ்கோர் வரம்புகள்:\n• 750–900 — நம்பகமான — உடனடி பணம்\n• 500–749 — தரப்படுத்தப்பட்ட — 2 மணி நேர தாமதம்\n• 300–499 — மதிப்பாய்வில் — 24 மணி நேர தாமதம்\n\nநீங்கள் 750 இல் தொடங்குகிறீர்கள்.',
        covered: 'KavachPay 13 வகையான இடையூறுகளை கவர் செய்கிறது:\n\nமழை: HRA / MRA / LRA\nகாற்று தரம்: SAQ / MAQ\nவானிலை: STM / HTV / FOG / WND\nஇயற்கை: FLD / EQK / LDS\nகுடிமை: CRF\n\nகவர் செய்யப்படாதவை: வாகன சேதம், உடல்நலம், தனிப்பட்ட காரணங்கள்.',
        premium: 'KavachPay வெறும் ₹49/வாரத்தில் தொடங்குகிறது.\n\n• அதிக ஆபத்து — ₹74/வாரம் — ₹1,560 கவரேஜ்\n• நடுத்தர — ₹59–64/வாரம்\n• குறைந்த — ₹49/வாரம் — ₹980 கவரேஜ்',
        pause: 'என் பாலிசி பக்கத்திலிருந்து எப்போது வேண்டுமானாலும் நிறுத்தலாம்.\n\nநிறுத்தியிருக்கும்போது:\n• பிரீமியம் இல்லை\n• கவரேஜ் இல்லை\n• KavachScore பாதிக்கப்படாது',
        skip: '5 சரிபார்ப்பு அடுக்குகளில் ஒன்று தோல்வியடையும்போது கோரிக்கை தவிர்க்கப்படுகிறது.\n\nபொதுவான காரணங்கள்:\n• Start My Day அழுத்தவில்லை\n• இடையூறு வரம்பு எட்டவில்லை\n• மண்டலத்தில் 60%க்கும் குறைவான தொழிலாளர்கள் பாதிக்கப்பட்டனர்\n• GPS செயல்பாட்டை காட்டியது\n• KavachScore 300க்கும் குறைவாக உள்ளது',
        zone: 'KavachPay 20+ நகரங்களில் கவரேஜ் வழங்குகிறது.\n\nமெட்ரோ — சென்னை, மும்பை, பெங்களூரு, டெல்லி, ஹைதராபாத், புணே, கொல்கத்தா, அகமதாபாத்\n\nதிட்ட 2 — கோயம்புத்தூர், மைசூரு, நாக்பூர் மற்றும் பல',
        enroll: 'சேர்வது வெறும் 2 நிமிடங்கள்.\n\nதேவையானவை:\n• பெயர், மின்னஞ்சல், தொலைபேசி\n• ஆதார் எண்\n• Swiggy அல்லது Zomato ஊழியர் ID\n\nபடிகள்:\n1. தனிப்பட்ட விவரங்கள் + OTP\n2. நகரம், மண்டலம், தளம்\n3. செலுத்தவும் மற்றும் செயல்படுத்தவும்',
        verification: 'KavachPay 5 அடுக்கு நடத்தை சரிபார்ப்பு பயன்படுத்துகிறது.\n\nஅடுக்கு 1 — பணி நோக்கம்\nஅடுக்கு 2 — இடையூறு தூண்டல்\nஅடுக்கு 3 — மண்டல தொடர்பு\nஅடுக்கு 4 — GPS செயலற்ற நிலை\nஅடுக்கு 5 — KavachScore\n\nஅனைத்தும் தேர்ச்சி பெற்றால் பணம் கிடைக்கும்.',
        renewal: 'பாலிசி ஒவ்வொரு வாரமும் தானாக புதுப்பிக்கப்படுகிறது.\n\nஒரு வாரம் தவிர்க்க புதுப்பிப்பு தேதிக்கு முன்பு நிறுத்தவும்.',
        employer: 'KavachPay முதலாளி வழங்கல் பாலிசிகளை ஆதரிக்கிறது.\n\nசேரும்போது முதலாளி வழங்கல் தேர்வு செய்யவும். உங்கள் முதலாளி பிரீமியம் செலுத்துகிறார்.',
        referral: 'டாஷ்போர்டில் உங்களுக்கு தனிப்பட்ட பரிந்துரை குறியீடு கிடைக்கும்.\n\nநண்பருடன் பகிரவும். அவர்கள் சேரும்போது ₹10 தள்ளுபடி கிடைக்கும்.',
        loan: 'KavachPay KreditBee, MoneyTap மற்றும் CashE உடன் கூட்டாண்மை.\n\nKavachScore அடிப்படையில்:\n• 800+ — ₹25,000 வரை\n• 750–799 — ₹15,000 வரை\n• 650–749 — ₹8,000 வரை',
        eshram: 'e-Shram அமைப்புசாரா தொழிலாளர்களுக்கான அரசு போர்டல்.\n\nசேரும்போது விருப்பத்தேர்வாக UAN ஐ இணைக்கலாம்.',
        payment: 'KavachPay Razorpay பயன்படுத்துகிறது.\n\nஆதரிக்கப்படும் முறைகள்: UPI, டெபிட்/கிரெடிட் கார்டு, நெட் பேங்கிங்.',
        thanks: 'உதவி செய்ய மகிழ்ச்சி! சாலைகளில் பாதுகாப்பாக இருங்கள்.',
        insult: 'KavachPay-ல் உங்களுக்கு உதவ இங்கே இருக்கிறேன். உங்கள் பாலிசி அல்லது கோரிக்கைகளைப் பற்றி கேளுங்கள்.',
        default: 'என்னால் KavachPay தொடர்பான கேள்விகளில் மட்டுமே உதவ முடியும்.\n\nகீழே உள்ள விரைவான கேள்விகளில் ஒன்றை முயற்சிக்கவும்.',
    }
};

const detectLang = (text) => {
    if (/[\u0B80-\u0BFF]/.test(text)) return 'ta';
    if (/[\u0900-\u097F]/.test(text)) return 'hi';
    return 'en';
};

const getResponse = (text, lang) => {
    const detectedLang = detectLang(text);
    const responseLang = detectedLang !== 'en' ? detectedLang : lang;
    const R = RESPONSES[responseLang] || RESPONSES.en;
    const q = text.toLowerCase();

    const insultWords = ['idiot', 'stupid', 'dumb', 'fool', 'useless', 'hate', 'worst',
        'मूर्ख', 'बेवकूफ', 'गधा', 'बकवास', 'முட்டாள்', 'பைத்தியம்'];
    if (insultWords.some(w => q.includes(w))) return R.insult;

    if (q.includes('hello') || q.includes('hi') || q.includes('hey') || q.includes('namaste') || q.includes('vanakkam') || q.includes('नमस्ते') || q.includes('வணக்கம்')) return R.greeting;
    if ((q.includes('how') && q.includes('work')) || q.includes('कैसे काम') || q.includes('எவ்வாறு')) return R.howWorks;
    if (q.includes('paid') || q.includes('payout') || q.includes('money') || q.includes('upi') || q.includes('भुगतान') || q.includes('பணம்')) return R.payout;
    if (q.includes('score') || q.includes('kavachscore') || q.includes('स्कोर') || q.includes('ஸ்கோர்')) return R.score;
    if (q.includes('cover') || q.includes('event') || q.includes('disruption') || q.includes('rain') || q.includes('aqi') || q.includes('flood') || q.includes('storm') || q.includes('earthquake') || q.includes('fog') || q.includes('heatwave') || q.includes('landslide') || q.includes('wind') || q.includes('curfew') || q.includes('hra') || q.includes('mra') || q.includes('lra') || q.includes('hra') || q.includes('fld') || q.includes('stm') || q.includes('crf') || q.includes('eqk') || q.includes('lds') || q.includes('htv') || q.includes('wnd') || q.includes('व्यवधान') || q.includes('இடையூறு')) return R.covered;
    if (q.includes('premium') || q.includes('cost') || q.includes('price') || q.includes('fee') || q.includes('प्रीमियम') || q.includes('பிரீமியம்')) return R.premium;
    if (q.includes('pause') || q.includes('stop') || q.includes('break') || q.includes('रोक') || q.includes('நிறுத்து')) return R.pause;
    if (q.includes('skip') || q.includes('reject') || q.includes('denied') || q.includes('failed') || q.includes('छोड़') || q.includes('தவிர்')) return R.skip;
    if (q.includes('zone') || q.includes('city') || q.includes('area') || q.includes('location') || q.includes('क्षेत्र') || q.includes('மண்டல')) return R.zone;
    if (q.includes('enroll') || q.includes('register') || q.includes('sign up') || q.includes('join') || q.includes('नामांकन') || q.includes('சேர')) return R.enroll;
    if (q.includes('verif') || q.includes('layer') || q.includes('check') || q.includes('सत्यापन') || q.includes('சரிபார்')) return R.verification;
    if (q.includes('renew') || q.includes('weekly') || q.includes('auto') || q.includes('नवीनीकरण') || q.includes('புதுப்பி')) return R.renewal;
    if (q.includes('employer') || q.includes('company') || q.includes('sponsored') || q.includes('swiggy') || q.includes('zomato') || q.includes('नियोक्ता') || q.includes('முதலாளி')) return R.employer;
    if (q.includes('referral') || q.includes('refer') || q.includes('code') || q.includes('रेफरल') || q.includes('பரிந்துரை')) return R.referral;
    if (q.includes('loan') || q.includes('borrow') || q.includes('credit') || q.includes('kreditbee') || q.includes('ऋण') || q.includes('கடன்')) return R.loan;
    if (q.includes('eshram') || q.includes('e-shram') || q.includes('uan') || q.includes('இ-ஸ்ரம்')) return R.eshram;
    if (q.includes('pay') || q.includes('razorpay') || q.includes('card') || q.includes('bank') || q.includes('கட்டணம்')) return R.payment;
    if (q.includes('thank') || q.includes('thanks') || q.includes('ok') || q.includes('great') || q.includes('धन्यवाद') || q.includes('நன்றி')) return R.thanks;

    return R.default;
};

export default function Chatbot({ onClose, lang }) {
    const activeLang = lang || 'en';
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const chatBg = isDark ? '#1E2130' : 'white';
    const chatBorder = isDark ? '#2D3348' : '#E5E7EB';
    const msgAreaBg = isDark ? '#111827' : '#F9FAFB';
    const textPrimary = isDark ? '#F1F5F9' : '#374151';
    const textMuted = isDark ? '#94A3B8' : '#9CA3AF';
    const inputBg = isDark ? '#1E2130' : 'white';

    const [messages, setMessages] = useState([
        { role: 'assistant', content: RESPONSES[activeLang]?.greeting || RESPONSES.en.greeting }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [showQuick, setShowQuick] = useState(true);
    const bottomRef = useRef(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, loading]);

    const sendMessage = (text) => {
        const userText = text || input.trim();
        if (!userText) return;
        setShowQuick(false);
        setMessages(prev => [...prev, { role: 'user', content: userText }]);
        setInput('');
        setLoading(true);
        setTimeout(() => {
            const reply = getResponse(userText, activeLang);
            setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
            setLoading(false);
        }, 600);
    };

    const formatMessage = (text) => text.split('\n').map((line, i) => (
        <p key={i} style={{ margin: '2px 0', fontSize: '13px', lineHeight: 1.65, color: 'inherit' }}>{line}</p>
    ));

    const quickQuestions = QUICK_QUESTIONS[activeLang] || QUICK_QUESTIONS.en;

    const placeholder = activeLang === 'hi'
        ? 'KavachPay के बारे में पूछें...'
        : activeLang === 'ta'
            ? 'KavachPay பற்றி கேளுங்கள்...'
            : 'Ask me anything about KavachPay...';

    const quickLabel = activeLang === 'hi'
        ? 'त्वरित प्रश्न'
        : activeLang === 'ta'
            ? 'விரைவான கேள்விகள்'
            : 'Quick questions';

    return (
        <div style={{ position: 'fixed', bottom: '100px', right: '24px', width: '340px', height: '540px', backgroundColor: chatBg, borderRadius: '20px', boxShadow: isDark ? '0 8px 40px rgba(0,0,0,0.5)' : '0 8px 40px rgba(0,0,0,0.15)', display: 'flex', flexDirection: 'column', zIndex: 1000, fontFamily: 'Inter', overflow: 'hidden', border: `1px solid ${chatBorder}`, transition: 'all 0.2s ease' }}>

            {/* Header */}
            <div style={{ backgroundColor: '#1A56A0', padding: '16px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                    </div>
                    <div>
                        <p style={{ color: 'white', fontWeight: '700', fontSize: '14px' }}>KavachPay Support</p>
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
            <div style={{ flex: 1, overflowY: 'auto', padding: '14px', backgroundColor: msgAreaBg }}>
                {messages.map((msg, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start', marginBottom: '10px' }}>
                        {msg.role === 'assistant' && (
                            <div style={{ width: '28px', height: '28px', borderRadius: '8px', backgroundColor: '#1A56A0', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '8px', flexShrink: 0, alignSelf: 'flex-end' }}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                            </div>
                        )}
                        <div style={{ maxWidth: '78%', padding: '10px 14px', borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px', backgroundColor: msg.role === 'user' ? '#1A56A0' : chatBg, color: msg.role === 'user' ? 'white' : textPrimary, boxShadow: isDark ? '0 1px 4px rgba(0,0,0,0.3)' : '0 1px 4px rgba(0,0,0,0.06)', border: msg.role === 'assistant' ? `1px solid ${chatBorder}` : 'none' }}>
                            {formatMessage(msg.content)}
                        </div>
                    </div>
                ))}

                {loading && (
                    <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '10px' }}>
                        <div style={{ width: '28px', height: '28px', borderRadius: '8px', backgroundColor: '#1A56A0', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '8px', flexShrink: 0 }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                        </div>
                        <div style={{ backgroundColor: chatBg, padding: '12px 16px', borderRadius: '16px 16px 16px 4px', boxShadow: isDark ? '0 1px 4px rgba(0,0,0,0.3)' : '0 1px 4px rgba(0,0,0,0.06)', border: `1px solid ${chatBorder}` }}>
                            <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                                {[0, 1, 2].map(j => (
                                    <div key={j} style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#1A56A0', opacity: 0.5, animation: `pulse 1.4s ease-in-out ${j * 0.2}s infinite` }} />
                                ))}
                            </div>
                        </div>
                    </div>
                )}
                <div ref={bottomRef} />
            </div>

            {/* Quick Questions */}
            {showQuick && (
                <div style={{ padding: '8px 14px', backgroundColor: isDark ? '#1A1D27' : '#F9FAFB', borderTop: `1px solid ${chatBorder}` }}>
                    <p style={{ color: textMuted, fontSize: '11px', marginBottom: '6px', letterSpacing: '0.3px', fontWeight: '500' }}>{quickLabel}</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                        {quickQuestions.map((q, i) => (
                            <button key={i} onClick={() => sendMessage(q)}
                                style={{ backgroundColor: isDark ? '#252A3A' : 'white', color: '#1A56A0', border: `1px solid ${isDark ? '#2D4070' : '#DBEAFE'}`, padding: '4px 10px', borderRadius: '12px', fontSize: '11px', cursor: 'pointer', fontWeight: '600', fontFamily: 'Inter' }}>
                                {q}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Input */}
            <div style={{ padding: '12px 14px', borderTop: `1px solid ${chatBorder}`, backgroundColor: chatBg, display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input
                    type="text"
                    placeholder={placeholder}
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && !loading && sendMessage()}
                    disabled={loading}
                    style={{ flex: 1, padding: '10px 14px', borderRadius: '20px', border: `1.5px solid ${chatBorder}`, fontSize: '13px', outline: 'none', fontFamily: 'Inter', backgroundColor: inputBg, color: textPrimary, transition: 'all 0.2s ease' }}
                />
                <button onClick={() => sendMessage()} disabled={loading || !input.trim()}
                    style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: loading || !input.trim() ? (isDark ? '#2D3348' : '#E5E7EB') : '#1A56A0', color: 'white', border: 'none', cursor: loading || !input.trim() ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'background-color 0.2s ease' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
                </button>
            </div>
        </div>
    );
}