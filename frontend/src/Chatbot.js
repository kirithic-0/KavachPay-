import React, { useState, useRef, useEffect } from 'react';
import { KavachLogo } from './App';

// ─── Firebase imports ───
// Uncomment when firebase.js is set up by Ashwin
// import { db } from './firebase';
// import { doc, getDoc, collection, getDocs, orderBy, query } from 'firebase/firestore';

// ─── Gemini API config ───
const GEMINI_KEY = process.env.REACT_APP_GEMINI_KEY;
const USE_GEMINI = !!GEMINI_KEY;

// ─── Design tokens ───
const C = {
  navy: '#1A3A5C',
  accent: '#2563EB',
  accentLight: '#EFF6FF',
  accentBorder: '#BFDBFE',
  bg: '#F9FAFB',
  cardBg: '#FFFFFF',
  cardBorder: '#E5E7EB',
  text: '#111827',
  textMuted: '#6B7280',
  green: '#059669',
  greenLight: '#ECFDF5',
  greenBorder: '#A7F3D0',
  orange: '#D97706',
  orangeLight: '#FFFBEB',
  red: '#DC2626',
};

// ═══════════════════════════════════════════════════════════════
// FIREBASE DATA FETCHER
// Loads worker profile + claims + notifications from Firestore
// Called once when chatbot opens with a logged-in worker uid
// ═══════════════════════════════════════════════════════════════
async function fetchWorkerContext(uid) {
  // ── TODO: BACKEND — uncomment when firebase.js is ready ──
  // try {
  //   // 1. Worker profile
  //   const workerSnap = await getDoc(doc(db, 'workers', uid));
  //   if (!workerSnap.exists()) return null;
  //   const workerData = workerSnap.data();
  //
  //   // 2. Claims (last 10, newest first)
  //   const claimsSnap = await getDocs(
  //     query(collection(db, 'workers', uid, 'claims'),
  //           orderBy('timestamp', 'desc'))
  //   );
  //   const claims = claimsSnap.docs.slice(0, 10).map(d => ({
  //     id: d.id, ...d.data()
  //   }));
  //
  //   // 3. Notifications (last 5, newest first)
  //   const notifsSnap = await getDocs(
  //     query(collection(db, 'workers', uid, 'notifications'),
  //           orderBy('timestamp', 'desc'))
  //   );
  //   const notifications = notifsSnap.docs.slice(0, 5).map(d => ({
  //     id: d.id, ...d.data()
  //   }));
  //
  //   return {
  //     name: workerData.name,
  //     zone: workerData.zone,
  //     city: workerData.city,
  //     platform: workerData.platform,
  //     premium: workerData.premium,
  //     coverage: workerData.coverage,
  //     avgIncome: workerData.avg_income,
  //     avgDeliveries: workerData.avg_deliveries,
  //     score: workerData.kavach_score,
  //     policyType: workerData.policy_type,
  //     referralCode: workerData.referral_code,
  //     employeeId: workerData.employee_id,
  //     eshramId: workerData.eshram_id,
  //     policyActive: workerData.policy_active,
  //     policyPaused: workerData.policy_paused,
  //     claims,
  //     notifications,
  //   };
  // } catch (err) {
  //   console.error('Error fetching worker context:', err);
  //   return null;
  // }

  // ── MOCK — remove when backend is live ──
  return null; // will use prop-based worker instead
}

// ═══════════════════════════════════════════════════════════════
// SYSTEM PROMPT BUILDER
// Injects full worker context into Gemini system prompt
// ═══════════════════════════════════════════════════════════════
function buildSystemPrompt(worker) {
  const workerBlock = worker ? `

════ CURRENT USER — USE THIS FOR PERSONAL QUESTIONS ════
Name: ${worker.name}
Zone: ${worker.zone}
City: ${worker.city}
Platform: ${worker.platform}
Weekly Premium: Rs.${worker.premium}${worker.policyType === 'employer' ? ' (Employer Sponsored — FREE to worker)' : ''}
Weekly Coverage: Rs.${worker.coverage}
Avg Weekly Income: Rs.${worker.avgIncome}
Avg Daily Deliveries: ${worker.avgDeliveries}
KavachScore: ${worker.score} — ${
  worker.score >= 750 ? 'Trusted Worker (instant payouts, max loan eligibility)' :
  worker.score >= 500 ? 'Standard Worker (2hr delay, +15% premium)' :
  'Under Review (24hr delay, manual check)'
}
Policy Type: ${worker.policyType === 'employer' ? 'Employer Sponsored' : 'Individual Policy'}
Employee ID: ${worker.employeeId}
Referral Code: ${worker.referralCode}
e-Shram: ${worker.eshramId ? 'Linked — UAN ' + worker.eshramId : 'Not linked'}
Policy Status: ${worker.policyActive ? 'Active' : worker.policyPaused ? 'Paused' : 'Inactive'}

════ CLAIM HISTORY (most recent first) ════
${worker.claims && worker.claims.length > 0
  ? worker.claims.map((c, i) =>
    `Claim ${i + 1}:
  ID: ${c.id || 'CLM-00' + (i + 1)}
  Date: ${c.date}
  Event: ${c.event} (Code: ${c.code})
  Severity: ${c.severity}
  Status: ${c.paid || c.status === 'paid' ? 'PAID' : 'SKIPPED'}
  Payout: ${c.paid || c.status === 'paid' ? 'Rs.' + c.payout : 'Rs.0 (not paid)'}
  ${c.txn ? 'Transaction ID: ' + c.txn : ''}
  Verification layers passed: ${c.verificationLayers || c.verification_layers || 0}/5
  ${c.skipReason || c.skip_reason ? 'Reason for skip: ' + (c.skipReason || c.skip_reason) : ''}
  Timeline: ${c.timeline ? c.timeline.map(t => t.event + ' — ' + (t.done ? 'PASSED' : 'FAILED')).join(' | ') : 'Not available'}`
  ).join('\n\n')
  : 'No claims yet.'
}

════ RECENT NOTIFICATIONS ════
${worker.notifications && worker.notifications.length > 0
  ? worker.notifications.map(n => `- ${n.title}: ${n.msg}`).join('\n')
  : 'No recent notifications.'
}
════ END USER CONTEXT ════
` : '';

  return `You are KavachBot — the official AI support assistant for KavachPay, India's first parametric income insurance platform for gig delivery workers on Swiggy and Zomato.
${workerBlock}
════ KAVACHPAY PRODUCT KNOWLEDGE ════

HOW IT WORKS:
KavachPay uses a parametric model. Workers never file claims. When a disruption hits their zone, the system detects it via government APIs, runs 5-layer verification, and automatically sends money to their UPI. No forms, no calls, no waiting.

DISRUPTION TRIGGERS (13 types):
- HRA: Heavy Rain >100mm/hr — IMD — Tier 2 — 65% payout
- MRA: Moderate Rain 50-99mm/hr — IMD — Tier 2 — 65% payout
- LRA: Light Rain 25-49mm/hr — IMD — Tier 3 — 30% payout
- SAQ: Severe AQI >350 — CPCB — Tier 1 — 100% payout
- MAQ: Moderate AQI 200-350 — CPCB — Tier 2 — 65% payout
- STM: Storm >60kmh — IMD — Tier 2 — 65% payout
- FLD: Flood NDMA Level 2/3 — NDMA — Tier 1 — 100% payout
- CRF: Curfew Government Order — Tier 1 — 100% payout
- EQK: Earthquake M>4.0 — NDMA/IMD — Tier 1 — 100% payout
- LDS: Landslide IMD Alert — Tier 3 — 30% payout
- HTV: Heatwave >45C — IMD — Tier 2 — 65% payout
- FOG: Dense Fog Visibility <50m — IMD — Tier 3 — 30% payout
- WND: High Wind >80kmh — IMD — Tier 3 — 30% payout

3-TIER TRIGGER MODEL:
- Tier 1 (Severe: FLD/CRF/EQK/SAQ>350): Fully automatic. No worker action. Layer 1 waived.
- Tier 2 (Moderate: HRA/MRA/STM/HTV/MAQ): Worker gets push notification. One tap "Yes I was affected" within 2 hours.
- Tier 3 (Minor: LRA/FOG/WND/LDS): Worker taps "I was affected" in app. Opt-in.

5-LAYER VERIFICATION:
1. Work Intent — Worker had completed orders before disruption started (platform data). Waived for Tier 1.
2. Disruption Trigger — IMD/CPCB/NDMA government API confirms event.
3. Zone Correlation — Order volume in zone drops 60%+ vs historical average.
4. Inactivity Proof — Worker had ZERO orders during disruption window (platform data, cannot be faked).
5. KavachScore — Score above 300.

PRICING:
- High risk zones (Mumbai/Chennai/Kolkata): Rs.74/week — Rs.1,560 coverage
- Medium risk: Rs.59/week — Rs.1,200 coverage
- Low risk (Bangalore/Hyderabad/Pune): Rs.49/week — Rs.980 coverage
- Premium slider: worker can increase up to Rs.200/week for proportional coverage

KAVACHSCORE:
- All workers start at 750 (Trusted tier) at signup
- 750-900: Trusted Worker — instant payout <2 min
- 500-749: Standard Worker — 2hr delay
- 300-499: Under Review — 24hr delay
- Goes UP: legit claim +10, streak +5, tenure +15, clean 30 days +8
- Goes DOWN: suspicious pattern -25, active during disruption -20, false dispute -15, policy lapse -10

LOANS (no CIBIL needed):
- Score 800+: up to Rs.25,000
- Score 750+: up to Rs.15,000
- Score 650+: up to Rs.8,000
- Partners: KreditBee, MoneyTap, CashE

OTHER FEATURES:
- Employer Sponsored: company pays premium — worker gets FREE coverage
- e-Shram UAN: government registry integration
- Referral codes: Rs.10 discount per successful referral
- Policy pause: no premium charged, no coverage, KavachScore unaffected
- Zone auto-update: system detects delivery patterns and suggests zone change
- Account deletion: soft delete — data retained 90 days

DISPUTES:
- If a claim is skipped incorrectly, worker can tap "Dispute" button
- 3-step flow: review skip reason → state reason → confirm
- Worker's delivery data is automatically attached
- Decision within 24 hours
- False disputes: -15 KavachScore points

════ INSTRUCTIONS FOR RESPONDING ════
1. LANGUAGE: Respond in the EXACT same language the user writes in. If they write in Hindi, respond in Hindi. If Tamil, respond in Tamil. If English, respond in English. Never mix languages.

2. PERSONAL QUESTIONS: When user asks about their specific claims, score, payout, zone, coverage, or any personal detail — use the USER CONTEXT above. Give exact numbers, exact dates, exact transaction IDs.

3. CLAIM REJECTION QUESTIONS: 
   - If user asks "why was my claim rejected/skipped" — identify which claim (ask for date/ID if ambiguous, or use the most recent skipped claim)
   - Give the exact skip reason from their claim history
   - Explain which layer failed and why in simple terms
   - Tell them they can dispute it from the My Claims section

4. DISPUTE GUIDANCE:
   - If user wants to dispute a skipped claim, guide them: "Go to the Home tab → find the skipped claim → tap the Dispute button → follow the 3 steps"
   - Never file a dispute on their behalf — just guide them to the UI

5. CONCISENESS: Keep responses under 150 words unless a complex explanation is needed.

6. DO NOT INVENT: Never make up transaction IDs, dates, amounts, or any data not in the context above.

7. RUPEE SYMBOL: Always use Rs. not $ or dollar.

8. TONE: Warm, helpful, professional. You are speaking to a delivery worker who may not be tech-savvy.`;
}

// ═══════════════════════════════════════════════════════════════
// GEMINI API CALL
// ═══════════════════════════════════════════════════════════════
async function callGemini(messages, systemPrompt) {
  try {
    // Filter to only user/bot messages (not system)
    const contents = messages
      .filter(m => m.from !== 'system')
      .map(m => ({
        role: m.from === 'user' ? 'user' : 'model',
        parts: [{ text: m.text }],
      }));

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemPrompt }] },
          contents,
          generationConfig: { maxOutputTokens: 350, temperature: 0.7 },
        }),
      }
    );

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.error('Gemini error:', res.status, err);
      throw new Error('API error ' + res.status);
    }

    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || null;
  } catch (err) {
    console.error('Gemini call failed:', err);
    return null;
  }
}

// ═══════════════════════════════════════════════════════════════
// RULE-BASED FALLBACK
// Context-aware — uses worker prop for personal questions
// ═══════════════════════════════════════════════════════════════
const FB = {
  default: {
    en: 'KavachPay protects delivery workers from income loss during disruptions. Ask me about your claims, coverage, KavachScore, or anything about your policy.',
    hi: 'KavachPay गिग कर्मचारियों को व्यवधान के दौरान आय हानि से बचाता है। अपने दावों, कवरेज, KavachScore, या पॉलिसी के बारे में पूछें।',
    ta: 'KavachPay டெலிவரி தொழிலாளர்களை வருமான இழப்பிலிருந்து பாதுகாக்கிறது. உங்கள் கோரிக்கைகள், கவரேஜ், KavachScore பற்றி கேளுங்கள்.',
  },
  how: {
    en: 'KavachPay works in 3 steps:\n1. Sign up and connect your Swiggy or Zomato account\n2. A disruption is detected in your zone via government APIs (IMD/CPCB/NDMA)\n3. 5-layer verification runs automatically → money hits your UPI in under 2 minutes\n\nNo forms. No calls. No waiting.',
    hi: 'KavachPay 3 चरणों में काम करता है:\n1. साइन अप करें और Swiggy/Zomato खाता जोड़ें\n2. सरकारी API (IMD/CPCB/NDMA) से व्यवधान का पता चलता है\n3. 5-परत सत्यापन अपने आप होता है → 2 मिनट में UPI में पैसे आते हैं\n\nकोई फॉर्म नहीं। कोई कॉल नहीं।',
    ta: '3 படிகளில் செயல்படுகிறது:\n1. Swiggy/Zomato கணக்கை இணைக்கவும்\n2. அரசு API மூலம் இடையூறு கண்டறியப்படும்\n3. 5 அடுக்கு சரிபார்ப்பு → 2 நிமிடத்தில் UPI-ல் பணம்\n\nபடிவங்கள் இல்லை. தாமதம் இல்லை.',
  },
  cost: {
    en: 'Premium by zone risk:\n• High risk (Mumbai/Chennai/Kolkata): Rs.74/week — Rs.1,560 coverage\n• Medium risk: Rs.59/week — Rs.1,200 coverage\n• Low risk (Bangalore/Hyderabad/Pune): Rs.49/week — Rs.980 coverage\n\nNo lock-in. Cancel or pause anytime.',
    hi: 'ज़ोन जोखिम के अनुसार प्रीमियम:\n• उच्च जोखिम (मुंबई/चेन्नई/कोलकाता): ₹74/सप्ताह — ₹1,560 कवरेज\n• मध्यम जोखिम: ₹59/सप्ताह — ₹1,200 कवरेज\n• कम जोखिम (बेंगलुरु/हैदराबाद): ₹49/सप्ताह — ₹980 कवरेज',
    ta: 'பிரீமியம்:\n• அதிக ஆபத்து: Rs.74/வாரம் — Rs.1,560 கவரேஜ்\n• நடுத்தர: Rs.59/வாரம் — Rs.1,200 கவரேஜ்\n• குறைந்த ஆபத்து: Rs.49/வாரம் — Rs.980 கவரேஜ்',
  },
  score: {
    en: 'KavachScore tiers:\n• 750-900: Trusted Worker — instant payout (<2 min)\n• 500-749: Standard Worker — 2hr delay\n• 300-499: Under Review — 24hr delay\n\nAll workers start at 750. Score rises with legitimate claims and consistent activity.',
    hi: 'KavachScore स्तर:\n• 750-900: Trusted Worker — तत्काल भुगतान\n• 500-749: Standard Worker — 2 घंटे की देरी\n• 300-499: समीक्षाधीन — 24 घंटे की देरी\n\nसभी कर्मचारी 750 से शुरू होते हैं।',
    ta: 'KavachScore நிலைகள்:\n• 750-900: நம்பகமான — உடனடி பணம்\n• 500-749: நிலையான — 2 மணி நேரம்\n• 300-499: மதிப்பாய்வில் — 24 மணி நேரம்',
  },
  covered: {
    en: '13 disruption types covered:\n\nRain: HRA (>100mm), MRA (50-99mm), LRA (25-49mm)\nAir Quality: SAQ (AQI>350), MAQ (AQI 200-350)\nWeather: STM (Storm), HTV (Heatwave>45C), FOG (Fog<50m), WND (Wind>80kmh)\nNatural: FLD (Flood), EQK (Earthquake M>4), LDS (Landslide)\nCivic: CRF (Curfew)\n\nAll triggered automatically via government APIs.',
    hi: '13 प्रकार के व्यवधान कवर:\n\nबारिश: HRA/MRA/LRA\nवायु गुणवत्ता: SAQ/MAQ\nमौसम: STM/HTV/FOG/WND\nप्राकृतिक: FLD/EQK/LDS\nनागरिक: CRF (कर्फ्यू)\n\nसभी सरकारी API से स्वचालित।',
    ta: '13 இடையூறு வகைகள்:\n\nமழை: HRA/MRA/LRA\nகாற்று தரம்: SAQ/MAQ\nவானிலை: STM/HTV/FOG/WND\nஇயற்கை: FLD/EQK/LDS\nகலவரம்: CRF',
  },
  payout: {
    en: 'Payouts are automatic — no claim needed.\n\nTiers:\n• Minor (LRA/FOG/WND/LDS): 30% of weekly coverage\n• Moderate (HRA/MRA/SAQ/STM/HTV/MAQ): 65% of coverage\n• Severe (FLD/EQK/CRF): 100% of coverage\n\nTrusted Workers (750+) receive payment in under 2 minutes.',
    hi: 'भुगतान स्वचालित है — कोई दावा दाखिल करने की जरूरत नहीं।\n\n• मामूली: 30% कवरेज\n• मध्यम: 65% कवरेज\n• गंभीर: 100% कवरेज\n\nTrusted Workers (750+) को 2 मिनट में भुगतान।',
    ta: 'பணம் தானாக வரும்:\n• Minor: 30% கவரேஜ்\n• Moderate: 65% கவரேஜ்\n• Severe: 100% கவரேஜ்\n\n750+ ஸ்கோர் உள்ளவர்களுக்கு 2 நிமிடத்தில்.',
  },
  loan: {
    en: 'Instant loans based on KavachScore (no CIBIL needed):\n• Score 800+: up to Rs.25,000\n• Score 750+: up to Rs.15,000\n• Score 650+: up to Rs.8,000\n\nPartners: KreditBee, MoneyTap, CashE. Apply from your Dashboard.',
    hi: 'KavachScore पर आधारित तत्काल ऋण (CIBIL की जरूरत नहीं):\n• Score 800+: Rs.25,000 तक\n• Score 750+: Rs.15,000 तक\n• Score 650+: Rs.8,000 तक',
    ta: 'KavachScore அடிப்படையில் உடனடி கடன்:\n• 800+: Rs.25,000 வரை\n• 750+: Rs.15,000 வரை\n• 650+: Rs.8,000 வரை',
  },
  dispute: {
    en: 'To dispute a skipped claim:\n1. Go to the Home tab on your Dashboard\n2. Find the skipped claim in your disruption history\n3. Tap the "Dispute" button\n4. Follow the 3 steps: review skip reason → state your reason → confirm\n\nDecision within 24 hours. Your delivery data is automatically attached — no uploads needed.',
    hi: 'दावे पर विवाद करने के लिए:\n1. डैशबोर्ड के Home tab पर जाएं\n2. छोड़े गए दावे पर "Dispute" बटन दबाएं\n3. 3 चरण पूरे करें\n\nआपका डिलीवरी डेटा स्वचालित रूप से जुड़ता है। 24 घंटे में फैसला।',
    ta: 'தவிர்க்கப்பட்ட கோரிக்கையை மறுக்க:\n1. Home tab-ல் தவிர்க்கப்பட்ட கோரிக்கையை கண்டறியவும்\n2. "Dispute" பட்டனை தட்டவும்\n3. 3 படிகளை பூர்த்தி செய்யவும்\n\n24 மணி நேரத்தில் முடிவு.',
  },
  pause: {
    en: 'You can pause your policy anytime from the My Policy page. While paused:\n• No premium charged\n• No coverage active\n• KavachScore unaffected\n\nResume anytime before heading out for deliveries.',
    hi: 'My Policy पेज से कभी भी पॉलिसी रोक सकते हैं। रुकने पर:\n• कोई प्रीमियम नहीं\n• कोई कवरेज नहीं\n• KavachScore अप्रभावित\n\nकभी भी फिर शुरू करें।',
    ta: 'My Policy பக்கத்தில் எப்போதும் பாலிசியை நிறுத்தலாம்:\n• பிரீமியம் இல்லை\n• கவரேஜ் இல்லை\n• ஸ்கோர் பாதிக்கப்படாது',
  },
  verification: {
    en: '5-layer verification runs automatically:\n1. Work Intent — had orders before disruption\n2. Disruption Trigger — government API confirmed\n3. Zone Correlation — 60%+ zone order volume drop\n4. Inactivity — zero orders during disruption window\n5. KavachScore — above 300\n\nAll 5 must pass for payout.',
    hi: '5-परत सत्यापन:\n1. कार्य इरादा — व्यवधान से पहले ऑर्डर थे\n2. व्यवधान ट्रिगर — सरकारी API पुष्टि\n3. ज़ोन सहसंबंध — 60%+ ऑर्डर में गिरावट\n4. निष्क्रियता — खिड़की के दौरान कोई ऑर्डर नहीं\n5. KavachScore — 300 से ऊपर',
    ta: '5 அடுக்கு சரிபார்ப்பு:\n1. வேலை எண்ணம்\n2. இடையூறு தூண்டல்\n3. மண்டல தொடர்பு\n4. செயலற்ற நிலை\n5. KavachScore',
  },
};

// Detect language from message
function detectLang(msg) {
  // Tamil Unicode range: U+0B80 to U+0BFF
  if (/[\u0B80-\u0BFF]/.test(msg)) return 'ta';
  // Hindi/Devanagari: U+0900 to U+097F
  if (/[\u0900-\u097F]/.test(msg)) return 'hi';
  return 'en';
}

function getFallbackReply(msg, worker, lang) {
  const m = msg.toLowerCase();
  const L = lang || detectLang(msg);

  // ── Personal questions — use worker context ──
  if (worker) {
    // Score questions
    if (m.includes('score') || m.includes('ஸ்கோர்') || m.includes('स्कोर')) {
      const tier = worker.score >= 750 ? (L==='hi'?'Trusted Worker — तत्काल भुगतान':L==='ta'?'Trusted Worker — உடனடி பணம்':'Trusted Worker — instant payouts')
                  : worker.score >= 500 ? (L==='hi'?'Standard — 2 घंटे की देरी':L==='ta'?'Standard — 2 மணி தாமதம்':'Standard Worker — 2hr delay')
                  : (L==='hi'?'समीक्षाधीन':L==='ta'?'மதிப்பாய்வில்':'Under Review');
      if (L==='hi') return `आपका KavachScore ${worker.score} है — ${tier}।`;
      if (L==='ta') return `உங்கள் KavachScore ${worker.score} — ${tier}.`;
      return `Your KavachScore is ${worker.score} — ${tier}.`;
    }

    // Coverage questions
    if (m.includes('coverage') || m.includes('cover') || m.includes('कवरेज') || m.includes('கவரேஜ்')) {
      const prem = worker.policyType==='employer' ? (L==='hi'?'निःशुल्क (नियोक्ता प्रायोजित)':L==='ta'?'இலவசம் (முதலாளி வழங்கல்)':'FREE (Employer Sponsored)') : `Rs.${worker.premium}/week`;
      if (L==='hi') return `आपकी साप्ताहिक कवरेज Rs.${worker.coverage} है। प्रीमियम: ${prem}।`;
      if (L==='ta') return `உங்கள் வாராந்திர கவரேஜ் Rs.${worker.coverage}. பிரீமியம்: ${prem}.`;
      return `Your weekly coverage is Rs.${worker.coverage}. Premium: ${prem}.`;
    }

    // Zone questions
    if (m.includes('zone') || m.includes('मेरा ज़ोन') || m.includes('மண்டலம்')) {
      if (L==='hi') return `आपका पंजीकृत ज़ोन ${worker.zone} है (${worker.platform})।`;
      if (L==='ta') return `உங்கள் பதிவு செய்யப்பட்ட மண்டலம் ${worker.zone} (${worker.platform}).`;
      return `Your registered zone is ${worker.zone} on ${worker.platform}.`;
    }

    // Referral code
    if (m.includes('referral') || m.includes('रेफरल') || m.includes('பரிந்துரை')) {
      if (L==='hi') return `आपका रेफरल कोड ${worker.referralCode} है। दोस्त के नामांकन पर आपको ₹10 छूट।`;
      if (L==='ta') return `உங்கள் பரிந்துரை குறியீடு ${worker.referralCode}. நண்பர் சேர்ந்தால் Rs.10 தள்ளுபடி.`;
      return `Your referral code is ${worker.referralCode}. Share it — when a friend enrolls you get Rs.10 off your next renewal.`;
    }

    // Claim rejection / skip reason questions
    if (m.includes('reject') || m.includes('skip') || m.includes('क्यों नहीं') || m.includes('ஏன் நிராகரிக்கப்பட்டது') ||
        m.includes('claim') || m.includes('दावा') || m.includes('கோரிக்கை')) {
      if (worker.claims && worker.claims.length > 0) {
        const skipped = worker.claims.find(c => !(c.paid || c.status === 'paid'));
        const lastClaim = worker.claims[0];
        if (skipped) {
          const reason = skipped.skipReason || skipped.skip_reason || 'Verification layer failed';
          if (L==='hi') return `आपका दावा ${skipped.date} (${skipped.event}) इस कारण छोड़ा गया:\n\n${reason}\n\nविवाद करने के लिए: Home tab → छोड़े गए दावे पर "Dispute" बटन दबाएं।`;
          if (L==='ta') return `உங்கள் ${skipped.date} கோரிக்கை (${skipped.event}) தவிர்க்கப்பட்டது:\n\n${reason}\n\nமறுக்க: Home tab-ல் "Dispute" பட்டனை தட்டவும்.`;
          return `Your claim on ${skipped.date} (${skipped.event}) was skipped because:\n\n${reason}\n\nTo dispute: go to the Home tab, find this claim, and tap the "Dispute" button.`;
        }
        if (lastClaim) {
          if (L==='hi') return `आपका सबसे हालिया दावा ${lastClaim.date} को भुगतान हुआ था — Rs.${lastClaim.payout}। कोई छोड़ा गया दावा नहीं है।`;
          if (L==='ta') return `உங்கள் கடைசி கோரிக்கை Rs.${lastClaim.payout} செலுத்தப்பட்டது (${lastClaim.date}). தவிர்க்கப்பட்ட கோரிக்கைகள் இல்லை.`;
          return `Your most recent claim on ${lastClaim.date} was paid — Rs.${lastClaim.payout}. You have no skipped claims.`;
        }
      }
      if (L==='hi') return 'आपके अभी तक कोई दावे नहीं हैं।';
      if (L==='ta') return 'உங்களுக்கு இன்னும் கோரிக்கைகள் இல்லை.';
      return 'You have no claims yet. Claims appear automatically when a disruption hits your zone and verification passes.';
    }

    // Last payout
    if (m.includes('last payout') || m.includes('पिछला भुगतान') || m.includes('கடைசி பணம்') ||
        m.includes('how much') || m.includes('कितना') || m.includes('எவ்வளவு')) {
      if (worker.claims && worker.claims.length > 0) {
        const paid = worker.claims.find(c => c.paid || c.status === 'paid');
        if (paid) {
          if (L==='hi') return `आपका आखिरी भुगतान ${paid.date} को Rs.${paid.payout} था — ${paid.event}। Transaction ID: ${paid.txn || 'N/A'}।`;
          if (L==='ta') return `கடைசி பணம் ${paid.date} அன்று Rs.${paid.payout} — ${paid.event}. Transaction ID: ${paid.txn || 'N/A'}.`;
          return `Your last payout was Rs.${paid.payout} on ${paid.date} for ${paid.event}. Transaction ID: ${paid.txn || 'N/A'}.`;
        }
      }
      if (L==='hi') return 'अभी तक कोई भुगतान नहीं मिला है।';
      if (L==='ta') return 'இன்னும் பணம் பெறவில்லை.';
      return 'No payouts received yet.';
    }

    // Policy status
    if (m.includes('policy') || m.includes('पॉलिसी') || m.includes('பாலிசி') || m.includes('active') || m.includes('paused')) {
      const status = worker.policyActive ? (L==='hi'?'सक्रिय':L==='ta'?'செயலில்':'Active')
                    : worker.policyPaused ? (L==='hi'?'रुकी हुई':L==='ta'?'நிறுத்தப்பட்டது':'Paused')
                    : (L==='hi'?'निष्क्रिय':L==='ta'?'செயலற்றது':'Inactive');
      if (L==='hi') return `आपकी पॉलिसी ${status} है। कवरेज: Rs.${worker.coverage}/सप्ताह, प्रीमियम: Rs.${worker.premium}/सप्ताह।`;
      if (L==='ta') return `உங்கள் பாலிசி ${status}. கவரேஜ்: Rs.${worker.coverage}/வாரம், பிரீமியம்: Rs.${worker.premium}/வாரம்.`;
      return `Your policy is ${status}. Coverage: Rs.${worker.coverage}/week. Premium: Rs.${worker.premium}/week.`;
    }
  }

  // ── Generic questions ──
  if ((m.includes('how') && m.includes('work')) || m.includes('process') || m.includes('काम') || m.includes('செயல்')) return FB.how[L] || FB.how.en;
  if (m.includes('cost') || m.includes('price') || m.includes('premium') || m.includes('much') || m.includes('rs.') || m.includes('₹') || m.includes('कितना') || m.includes('பிரீமியம்')) return FB.cost[L] || FB.cost.en;
  if (m.includes('cover') || m.includes('disruption') || m.includes('rain') || m.includes('flood') || m.includes('type') || m.includes('प्रकार') || m.includes('வகை')) return FB.covered[L] || FB.covered.en;
  if (m.includes('payout') || m.includes('pay') || m.includes('money') || m.includes('upi') || m.includes('भुगतान') || m.includes('பணம்')) return FB.payout[L] || FB.payout.en;
  if (m.includes('score') || m.includes('kavachscore') || m.includes('स्कोर') || m.includes('ஸ்கோர்')) return FB.score[L] || FB.score.en;
  if (m.includes('loan') || m.includes('borrow') || m.includes('ऋण') || m.includes('கடன்')) return FB.loan[L] || FB.loan.en;
  if (m.includes('dispute') || m.includes('विवाद') || m.includes('மறுப்பு')) return FB.dispute[L] || FB.dispute.en;
  if (m.includes('pause') || m.includes('stop') || m.includes('break') || m.includes('रोक') || m.includes('நிறுத்த')) return FB.pause[L] || FB.pause.en;
  if (m.includes('verif') || m.includes('layer') || m.includes('परत') || m.includes('அடுக்கு')) return FB.verification[L] || FB.verification.en;

  return FB.default[L] || FB.default.en;
}

// ═══════════════════════════════════════════════════════════════
// QUICK CHIPS
// ═══════════════════════════════════════════════════════════════
const CHIPS = {
  en: ['Why was my claim skipped?', 'My KavachScore?', 'My coverage?', 'How does it work?', 'Instant loans?'],
  hi: ['मेरा दावा क्यों छोड़ा गया?', 'मेरा KavachScore?', 'मेरी कवरेज?', 'कैसे काम करता है?', 'तत्काल ऋण?'],
  ta: ['கோரிக்கை ஏன் தவிர்க்கப்பட்டது?', 'என் KavachScore?', 'என் கவரேஜ்?', 'எவ்வாறு செயல்படுகிறது?', 'உடனடி கடன்?'],
};

const PLACEHOLDERS = {
  en: 'Ask about your claims, score, coverage...',
  hi: 'अपने दावे, स्कोर, कवरेज के बारे में पूछें...',
  ta: 'உங்கள் கோரிக்கைகள், ஸ்கோர் பற்றி கேளுங்கள்...',
};

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// Props:
//   onClose    — function to close chatbot
//   lang       — 'en' | 'hi' | 'ta' (from Dashboard)
//   worker     — worker object from Dashboard state
//                { name, zone, city, platform, premium, coverage,
//                  avgIncome, avgDeliveries, score, policyType,
//                  referralCode, employeeId, eshramId, policyActive,
//                  policyPaused, claims, notifications }
// ═══════════════════════════════════════════════════════════════
export default function Chatbot({ onClose, lang, worker }) {
  const defaultLang = lang || 'en';
  const [detectedLang, setDetectedLang] = useState(defaultLang);
  const [workerCtx, setWorkerCtx] = useState(worker || null);
  const [loadingCtx, setLoadingCtx] = useState(false);

  // Opening greeting based on context
  const openingMsg = workerCtx
    ? (defaultLang === 'hi'
        ? `नमस्ते ${workerCtx.name?.split(' ')[0]}! मैं आपके खाते की जानकारी देख सकता हूं। आपका KavachScore ${workerCtx.score} है और आपकी कवरेज Rs.${workerCtx.coverage}/सप्ताह है। कैसे मदद करूं?`
        : defaultLang === 'ta'
        ? `வணக்கம் ${workerCtx.name?.split(' ')[0]}! உங்கள் கணக்கு விவரங்களை பார்க்கிறேன். KavachScore: ${workerCtx.score}, கவரேஜ்: Rs.${workerCtx.coverage}/வாரம். எப்படி உதவலாம்?`
        : `Hi ${workerCtx.name?.split(' ')[0]}! I can see your account. Your KavachScore is ${workerCtx.score} and coverage is Rs.${workerCtx.coverage}/week. What can I help you with?`)
    : 'Welcome to KavachPay Support. Ask me about coverage, payouts, KavachScore, loans, or anything about your policy.';

  const [messages, setMessages] = useState([{ from: 'bot', text: openingMsg }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showChips, setShowChips] = useState(true);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  // Load real Firebase data if uid available and firebase is set up
  useEffect(() => {
    if (worker?.uid && !workerCtx?.claims) {
      setLoadingCtx(true);
      fetchWorkerContext(worker.uid).then(ctx => {
        if (ctx) setWorkerCtx(ctx);
        setLoadingCtx(false);
      });
    }
  }, [worker?.uid]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const sendMessage = async (text) => {
    const userText = (text || input).trim();
    if (!userText || loading) return;

    // Detect language from this message
    const msgLang = detectLang(userText);
    if (msgLang !== 'en') setDetectedLang(msgLang);
    const L = msgLang !== 'en' ? msgLang : detectedLang;

    setShowChips(false);
    setInput('');

    const updatedMsgs = [...messages, { from: 'user', text: userText }];
    setMessages(updatedMsgs);
    setLoading(true);

    let reply = null;

    if (USE_GEMINI) {
      const sysprompt = buildSystemPrompt(workerCtx);
      reply = await callGemini(updatedMsgs, sysprompt);
    }

    if (!reply) {
      await new Promise(r => setTimeout(r, 350));
      reply = getFallbackReply(userText, workerCtx, L);
    }

    setMessages(prev => [...prev, { from: 'bot', text: reply }]);
    setLoading(false);
  };

  const chips = CHIPS[detectedLang] || CHIPS.en;
  const placeholder = PLACEHOLDERS[detectedLang] || PLACEHOLDERS.en;

  return (
    <div style={{
      position: 'fixed', bottom: 90, right: 22,
      width: 340, height: 540,
      backgroundColor: C.cardBg,
      borderRadius: 16,
      boxShadow: '0 12px 48px rgba(0,0,0,0.15)',
      display: 'flex', flexDirection: 'column',
      zIndex: 1000,
      fontFamily: 'Inter, -apple-system, sans-serif',
      overflow: 'hidden',
      border: `1px solid ${C.cardBorder}`,
    }}>

      {/* ── HEADER ── */}
      <div style={{ backgroundColor: C.navy, padding: '13px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <svg width="30" height="30" viewBox="0 0 100 100" fill="none">
          <circle cx="50" cy="50" r="50" fill="rgba(255,255,255,0.12)" />
          <text x="50" y="66" textAnchor="middle" fontSize="44" fill="white" fontFamily="Georgia,serif">₹</text>
        </svg>
        <div style={{ flex: 1 }}>
          <p style={{ color: 'white', fontWeight: 700, fontSize: 13 }}>KavachBot</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 2 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: loadingCtx ? '#FBBF24' : '#34D399' }} />
            <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 11 }}>
              {loadingCtx ? 'Loading your data...' : USE_GEMINI ? 'Gemini AI · Active' : 'Support · Active'}
            </p>
          </div>
        </div>
        {workerCtx && (
          <div style={{ backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 20, padding: '3px 9px', border: '1px solid rgba(255,255,255,0.15)' }}>
            <p style={{ color: 'white', fontSize: 10, fontWeight: 700 }}>Score: {workerCtx.score}</p>
          </div>
        )}
        <button onClick={onClose}
          style={{ background: 'rgba(255,255,255,0.12)', border: 'none', color: 'white', width: 26, height: 26, borderRadius: '50%', cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: 4 }}>
          ✕
        </button>
      </div>

      {/* ── PERSONALISATION BAR ── */}
      {workerCtx && (
        <div style={{ backgroundColor: C.accentLight, borderBottom: `1px solid ${C.accentBorder}`, padding: '7px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 20, height: 20, borderRadius: '50%', backgroundColor: C.navy, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <p style={{ color: 'white', fontSize: 9, fontWeight: 800 }}>{workerCtx.name?.[0]}</p>
          </div>
          <p style={{ fontSize: 11, color: '#1e40af', fontWeight: 600 }}>
            {workerCtx.name?.split(' ')[0]} · {workerCtx.zone?.split(',')[0]} · {workerCtx.platform}
          </p>
          <div style={{ marginLeft: 'auto', backgroundColor: '#DBEAFE', borderRadius: 4, padding: '1px 6px' }}>
            <p style={{ fontSize: 9, color: '#1e40af', fontWeight: 700 }}>PERSONALISED</p>
          </div>
        </div>
      )}

      {/* ── MESSAGES ── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 14px', backgroundColor: C.bg, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: msg.from === 'user' ? 'flex-end' : 'flex-start' }}>
            {msg.from === 'bot' && (
              <div style={{ width: 24, height: 24, borderRadius: 7, backgroundColor: C.navy, display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: 7, flexShrink: 0, alignSelf: 'flex-end' }}>
                <svg width="12" height="12" viewBox="0 0 100 100" fill="none">
                  <text x="50" y="70" textAnchor="middle" fontSize="60" fill="white" fontFamily="Georgia,serif">₹</text>
                </svg>
              </div>
            )}
            <div style={{
              maxWidth: '78%',
              padding: '9px 12px',
              borderRadius: msg.from === 'user' ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
              backgroundColor: msg.from === 'user' ? C.navy : C.cardBg,
              color: msg.from === 'user' ? 'white' : C.text,
              fontSize: 13,
              lineHeight: 1.6,
              whiteSpace: 'pre-line',
              boxShadow: msg.from === 'bot' ? '0 1px 4px rgba(0,0,0,0.06)' : 'none',
              border: msg.from === 'bot' ? `1px solid ${C.cardBorder}` : 'none',
            }}>
              {msg.text}
            </div>
          </div>
        ))}

        {/* Loading dots */}
        {loading && (
          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <div style={{ width: 24, height: 24, borderRadius: 7, backgroundColor: C.navy, display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: 7, flexShrink: 0 }}>
              <svg width="12" height="12" viewBox="0 0 100 100" fill="none">
                <text x="50" y="70" textAnchor="middle" fontSize="60" fill="white" fontFamily="Georgia,serif">₹</text>
              </svg>
            </div>
            <div style={{ backgroundColor: C.cardBg, border: `1px solid ${C.cardBorder}`, borderRadius: '14px 14px 14px 4px', padding: '11px 14px' }}>
              <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                {[0, 1, 2].map(j => (
                  <div key={j} style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#9CA3AF', animation: `kbPulse 1.4s ease-in-out ${j * 0.2}s infinite` }} />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* ── QUICK CHIPS ── */}
      {showChips && (
        <div style={{ padding: '7px 10px', backgroundColor: C.cardBg, borderTop: `1px solid ${C.cardBorder}`, display: 'flex', gap: 5, overflowX: 'auto', scrollbarWidth: 'none' }}>
          {chips.map((chip, i) => (
            <button key={i} onClick={() => sendMessage(chip)}
              style={{ flexShrink: 0, padding: '5px 10px', backgroundColor: C.bg, border: `1px solid ${C.cardBorder}`, borderRadius: 12, fontSize: 11, color: C.textMuted, cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: 'Inter, sans-serif', transition: 'all 0.15s' }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = C.accentLight; e.currentTarget.style.borderColor = C.accentBorder; e.currentTarget.style.color = C.navy; }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = C.bg; e.currentTarget.style.borderColor = C.cardBorder; e.currentTarget.style.color = C.textMuted; }}>
              {chip}
            </button>
          ))}
        </div>
      )}

      {/* ── INPUT ── */}
      <div style={{ padding: '9px 10px', borderTop: `1px solid ${C.cardBorder}`, backgroundColor: C.cardBg, display: 'flex', gap: 7, alignItems: 'center' }}>
        <input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
          disabled={loading}
          style={{ flex: 1, padding: '9px 12px', borderRadius: 20, border: `1px solid ${C.cardBorder}`, fontSize: 13, outline: 'none', fontFamily: 'Inter, sans-serif', backgroundColor: loading ? C.bg : C.cardBg, color: C.text, transition: 'border-color 0.15s' }}
          onFocus={e => e.target.style.borderColor = C.accentBorder}
          onBlur={e => e.target.style.borderColor = C.cardBorder}
        />
        <button onClick={() => sendMessage()} disabled={loading || !input.trim()}
          style={{ width: 34, height: 34, borderRadius: '50%', backgroundColor: loading || !input.trim() ? C.cardBorder : C.navy, border: 'none', cursor: loading || !input.trim() ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'background-color 0.2s' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      {/* ── STATUS BAR ── */}
      <div style={{ padding: '4px 12px 7px', backgroundColor: C.cardBg, textAlign: 'center' }}>
        <p style={{ fontSize: 10, color: '#9CA3AF' }}>
          {USE_GEMINI ? 'Gemini 1.5 Flash · Free · Personalised' : 'Add REACT_APP_GEMINI_KEY to .env for AI mode'}
        </p>
      </div>

      <style>{`
        @keyframes kbPulse {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
