import React, { useState } from 'react';

const DEMO_USERS = [
    { email: 'ravi@kavachpay.in', password: 'ravi123', name: 'Ravi Kumar', phone: '9876543210', age: 26, zone: 'Koramangala, Bangalore', platform: 'Swiggy', employeeId: 'SWG-2847361', premium: 59, coverage: 1200, avgIncome: 1800, avgDeliveries: 127, monthsActive: 14 },
    { email: 'priya@kavachpay.in', password: 'priya123', name: 'Priya Singh', phone: '9845612370', age: 24, zone: 'Adyar, Chennai', platform: 'Zomato', employeeId: 'ZOM-1923847', premium: 74, coverage: 1560, avgIncome: 2140, avgDeliveries: 143, monthsActive: 8 },
    { email: 'mohammed@kavachpay.in', password: 'mohammed123', name: 'Mohammed Arif', phone: '9823456710', age: 29, zone: 'Dharavi, Mumbai', platform: 'Zepto', employeeId: 'ZPT-3847261', premium: 74, coverage: 1560, avgIncome: 1920, avgDeliveries: 112, monthsActive: 22 },
];

const FORGOT_OTP = '1234';

const T = {
    en: {
        brand: 'KavachPay',
        welcome: 'Welcome Back',
        subtitle: 'Sign in to access your KavachPay policy',
        email: 'Email Address',
        password: 'Password',
        show: 'Show', hide: 'Hide',
        forgot: 'Forgot password?',
        signin: 'Sign In',
        signingIn: 'Signing in...',
        newUser: 'New to KavachPay?',
        enroll: 'Enroll Now',
        demo: 'Demo Accounts',
        backHome: 'Back to Home',
        errorEmpty: 'Please enter both email and password.',
        errorInvalid: 'Invalid email or password. Please check your credentials and try again.',
        forgotTitle: 'Forgot Password',
        forgotSubtitle: 'Enter your registered email and we will send you an OTP',
        sendOtp: 'Send OTP',
        sendingOtp: 'Sending OTP...',
        emailPlaceholder: 'your@email.com',
        backLogin: 'Back to Login',
        otpTitle: 'Enter OTP',
        otpSubtitle: 'A 4-digit OTP has been sent to',
        verifyOtp: 'Verify OTP',
        resend: 'Resend OTP',
        didntReceive: 'Did not receive?',
        resetTitle: 'Set New Password',
        resetSubtitle: 'Choose a strong password for your account',
        newPassword: 'New Password',
        confirmPassword: 'Confirm New Password',
        minPassword: 'Minimum 6 characters',
        reenter: 'Re-enter new password',
        updating: 'Updating...',
        updatePassword: 'Update Password',
        passwordMatch: 'Passwords match',
        successTitle: 'Password Updated',
        successMsg: 'Your password has been reset successfully. You can now sign in with your new password.',
        backSignIn: 'Back to Sign In',
    },
    hi: {
        brand: 'KavachPay',
        welcome: 'वापस स्वागत है',
        subtitle: 'अपनी KavachPay पॉलिसी तक पहुंचने के लिए साइन इन करें',
        email: 'ईमेल पता',
        password: 'पासवर्ड',
        show: 'दिखाएं', hide: 'छुपाएं',
        forgot: 'पासवर्ड भूल गए?',
        signin: 'साइन इन करें',
        signingIn: 'साइन इन हो रहा है...',
        newUser: 'KavachPay में नए हैं?',
        enroll: 'अभी नामांकन करें',
        demo: 'डेमो खाते',
        backHome: 'होम पर वापस',
        errorEmpty: 'कृपया ईमेल और पासवर्ड दोनों दर्ज करें।',
        errorInvalid: 'अमान्य ईमेल या पासवर्ड। कृपया पुनः प्रयास करें।',
        forgotTitle: 'पासवर्ड भूल गए',
        forgotSubtitle: 'अपना पंजीकृत ईमेल दर्ज करें और हम आपको OTP भेजेंगे',
        sendOtp: 'OTP भेजें',
        sendingOtp: 'OTP भेजा जा रहा है...',
        emailPlaceholder: 'आपका@ईमेल.com',
        backLogin: 'लॉगिन पर वापस',
        otpTitle: 'OTP दर्ज करें',
        otpSubtitle: '4 अंकों का OTP भेजा गया है',
        verifyOtp: 'OTP सत्यापित करें',
        resend: 'OTP पुनः भेजें',
        didntReceive: 'प्राप्त नहीं हुआ?',
        resetTitle: 'नया पासवर्ड सेट करें',
        resetSubtitle: 'अपने खाते के लिए एक मजबूत पासवर्ड चुनें',
        newPassword: 'नया पासवर्ड',
        confirmPassword: 'नया पासवर्ड पुष्टि करें',
        minPassword: 'न्यूनतम 6 अक्षर',
        reenter: 'नया पासवर्ड पुनः दर्ज करें',
        updating: 'अपडेट हो रहा है...',
        updatePassword: 'पासवर्ड अपडेट करें',
        passwordMatch: 'पासवर्ड मेल खाते हैं',
        successTitle: 'पासवर्ड अपडेट हो गया',
        successMsg: 'आपका पासवर्ड सफलतापूर्वक रीसेट हो गया है। अब आप नए पासवर्ड से साइन इन कर सकते हैं।',
        backSignIn: 'साइन इन पर वापस',
    },
    ta: {
        brand: 'KavachPay',
        welcome: 'மீண்டும் வரவேற்கிறோம்',
        subtitle: 'உங்கள் KavachPay பாலிசியை அணுக உள்நுழையவும்',
        email: 'மின்னஞ்சல் முகவரி',
        password: 'கடவுச்சொல்',
        show: 'காட்டு', hide: 'மறை',
        forgot: 'கடவுச்சொல் மறந்துவிட்டதா?',
        signin: 'உள்நுழைக',
        signingIn: 'உள்நுழைகிறது...',
        newUser: 'KavachPay-ல் புதியவரா?',
        enroll: 'இப்போது சேரவும்',
        demo: 'டெமோ கணக்குகள்',
        backHome: 'முகப்புக்கு திரும்பு',
        errorEmpty: 'மின்னஞ்சல் மற்றும் கடவுச்சொல் இரண்டையும் உள்ளிடவும்.',
        errorInvalid: 'தவறான மின்னஞ்சல் அல்லது கடவுச்சொல். மீண்டும் முயற்சிக்கவும்.',
        forgotTitle: 'கடவுச்சொல் மறந்துவிட்டது',
        forgotSubtitle: 'உங்கள் பதிவு செய்த மின்னஞ்சலை உள்ளிடவும், நாங்கள் OTP அனுப்புவோம்',
        sendOtp: 'OTP அனுப்பு',
        sendingOtp: 'OTP அனுப்புகிறது...',
        emailPlaceholder: 'உங்கள்@மின்னஞ்சல்.com',
        backLogin: 'உள்நுழைவுக்கு திரும்பு',
        otpTitle: 'OTP உள்ளிடவும்',
        otpSubtitle: '4 இலக்க OTP அனுப்பப்பட்டது',
        verifyOtp: 'OTP சரிபார்க்கவும்',
        resend: 'OTP மீண்டும் அனுப்பு',
        didntReceive: 'பெறவில்லையா?',
        resetTitle: 'புதிய கடவுச்சொல் அமைக்கவும்',
        resetSubtitle: 'உங்கள் கணக்கிற்கு வலுவான கடவுச்சொல் தேர்வு செய்யவும்',
        newPassword: 'புதிய கடவுச்சொல்',
        confirmPassword: 'புதிய கடவுச்சொல் உறுதிப்படுத்தவும்',
        minPassword: 'குறைந்தது 6 எழுத்துக்கள்',
        reenter: 'புதிய கடவுச்சொல் மீண்டும் உள்ளிடவும்',
        updating: 'புதுப்பிக்கிறது...',
        updatePassword: 'கடவுச்சொல் புதுப்பிக்கவும்',
        passwordMatch: 'கடவுச்சொற்கள் பொருந்துகின்றன',
        successTitle: 'கடவுச்சொல் புதுப்பிக்கப்பட்டது',
        successMsg: 'உங்கள் கடவுச்சொல் வெற்றிகரமாக மீட்டமைக்கப்பட்டது. இப்போது புதிய கடவுச்சொல்லுடன் உள்நுழையலாம்.',
        backSignIn: 'உள்நுழைவுக்கு திரும்பு',
    }
};

const LangToggle = ({ lang, setLang }) => (
    <div style={{ display: 'flex', backgroundColor: '#F3F4F6', borderRadius: '20px', padding: '3px', gap: '2px' }}>
        {[{ code: 'en', label: 'EN' }, { code: 'hi', label: 'हि' }, { code: 'ta', label: 'த' }].map(l => (
            <button key={l.code} onClick={() => setLang(l.code)}
                style={{ backgroundColor: lang === l.code ? '#1A56A0' : 'transparent', color: lang === l.code ? 'white' : '#6B7280', border: 'none', padding: '5px 12px', borderRadius: '16px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold', transition: 'all 0.2s' }}>
                {l.label}
            </button>
        ))}
    </div>
);

export default function Login({ onLogin, onBack, onSignup, lang, setLang }) {
    const t = T[lang] || T.en;
    const [screen, setScreen] = useState('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [forgotEmail, setForgotEmail] = useState('');
    const [forgotError, setForgotError] = useState('');
    const [otp, setOtp] = useState(['', '', '', '']);
    const [otpError, setOtpError] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [showNewPwd, setShowNewPwd] = useState(false);
    const [resetError, setResetError] = useState('');

    const handleLogin = () => {
        if (!email || !password) { setError(t.errorEmpty); return; }
        setLoading(true); setError('');
        setTimeout(() => {
            const user = DEMO_USERS.find(u => u.email === email.toLowerCase() && u.password === password);
            if (user) { onLogin(user); }
            else { setError(t.errorInvalid); setLoading(false); }
        }, 1000);
    };

    const handleForgotSubmit = () => {
        if (!forgotEmail) { setForgotError('Please enter your email address.'); return; }
        if (!/\S+@\S+\.\S+/.test(forgotEmail)) { setForgotError('Please enter a valid email address.'); return; }
        setForgotError(''); setLoading(true);
        setTimeout(() => { setLoading(false); setScreen('otp'); }, 1200);
    };

    const handleOtpChange = (index, value) => {
        if (value.length > 1) return;
        const newOtp = [...otp]; newOtp[index] = value; setOtp(newOtp); setOtpError('');
        if (value && index < 3) document.getElementById(`otp-${index + 1}`)?.focus();
    };

    const handleOtpVerify = () => {
        const entered = otp.join('');
        if (entered.length < 4) { setOtpError('Please enter the complete 4-digit OTP.'); return; }
        if (entered !== FORGOT_OTP) { setOtpError('Incorrect OTP. Please try again.'); return; }
        setOtpError(''); setScreen('reset');
    };

    const handleReset = () => {
        if (!newPassword || newPassword.length < 6) { setResetError('Password must be at least 6 characters.'); return; }
        if (newPassword !== confirmNewPassword) { setResetError('Passwords do not match.'); return; }
        setResetError(''); setLoading(true);
        setTimeout(() => { setLoading(false); setScreen('success'); }, 1000);
    };

    const fillDemo = (user) => { setEmail(user.email); setPassword(user.password); setError(''); };

    const inputStyle = { width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1.5px solid #E5E7EB', fontSize: '14px', boxSizing: 'border-box', fontFamily: 'Arial', outline: 'none', color: '#374151' };
    const labelStyle = { display: 'block', color: '#374151', fontWeight: '600', fontSize: '13px', marginBottom: '7px' };

    const Navbar = ({ backFn, backLabel }) => (
        <div style={{ backgroundColor: '#1A56A0', padding: '14px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h1 style={{ color: 'white', fontSize: '18px', fontWeight: 'bold' }}>{t.brand}</h1>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <LangToggle lang={lang} setLang={setLang} />
                <button onClick={backFn} style={{ backgroundColor: 'transparent', color: 'white', border: '1px solid rgba(255,255,255,0.3)', padding: '6px 14px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px' }}>
                    {backLabel}
                </button>
            </div>
        </div>
    );

    if (screen === 'login') return (
        <div style={{ backgroundColor: '#F4F6F9', minHeight: '100vh', fontFamily: 'Arial' }}>
            <Navbar backFn={onBack} backLabel={t.backHome} />
            <div style={{ padding: '48px 20px', maxWidth: '420px', margin: '0 auto' }}>
                <div style={{ textAlign: 'center', marginBottom: '36px' }}>
                    <div style={{ width: '56px', height: '56px', borderRadius: '14px', backgroundColor: '#1A56A0', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', boxShadow: '0 4px 16px rgba(26,86,160,0.25)' }}>
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                    </div>
                    <h2 style={{ color: '#1A1A2E', fontSize: '24px', fontWeight: 'bold', marginBottom: '6px' }}>{t.welcome}</h2>
                    <p style={{ color: '#9CA3AF', fontSize: '14px' }}>{t.subtitle}</p>
                </div>

                <div style={{ backgroundColor: 'white', borderRadius: '20px', padding: '28px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', marginBottom: '16px', border: '1px solid #E5E7EB' }}>
                    <div style={{ marginBottom: '16px' }}>
                        <label style={labelStyle}>{t.email}</label>
                        <input type="email" placeholder="your@email.com" value={email} onChange={e => { setEmail(e.target.value); setError(''); }} onKeyDown={e => e.key === 'Enter' && handleLogin()} style={inputStyle} />
                    </div>
                    <div style={{ marginBottom: '8px' }}>
                        <label style={labelStyle}>{t.password}</label>
                        <div style={{ position: 'relative' }}>
                            <input type={showPassword ? 'text' : 'password'} placeholder="Enter your password" value={password} onChange={e => { setPassword(e.target.value); setError(''); }} onKeyDown={e => e.key === 'Enter' && handleLogin()} style={{ ...inputStyle, paddingRight: '60px' }} />
                            <button onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', fontSize: '13px' }}>
                                {showPassword ? t.hide : t.show}
                            </button>
                        </div>
                    </div>
                    <div style={{ textAlign: 'right', marginBottom: '20px' }}>
                        <span onClick={() => { setScreen('forgot'); setForgotEmail(''); setForgotError(''); }} style={{ color: '#1A56A0', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>{t.forgot}</span>
                    </div>
                    {error && (
                        <div style={{ backgroundColor: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '10px', padding: '12px 14px', marginBottom: '16px' }}>
                            <p style={{ color: '#DC2626', fontSize: '13px', margin: 0 }}>{error}</p>
                        </div>
                    )}
                    <button onClick={handleLogin} disabled={loading} style={{ width: '100%', backgroundColor: loading ? '#93B4D9' : '#1A56A0', color: 'white', padding: '14px', borderRadius: '10px', border: 'none', fontSize: '15px', fontWeight: 'bold', cursor: loading ? 'default' : 'pointer' }}>
                        {loading ? t.signingIn : t.signin}
                    </button>
                    <p style={{ textAlign: 'center', color: '#9CA3AF', fontSize: '13px', marginTop: '16px', marginBottom: 0 }}>
                        {t.newUser}{' '}<span onClick={onSignup} style={{ color: '#1A56A0', fontWeight: 'bold', cursor: 'pointer' }}>{t.enroll}</span>
                    </p>
                </div>

                <div style={{ backgroundColor: '#EEF4FF', borderRadius: '16px', padding: '16px', border: '1px solid #C7D9F8' }}>
                    <p style={{ color: '#1A56A0', fontWeight: 'bold', fontSize: '12px', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{t.demo}</p>
                    {DEMO_USERS.map((u, i) => (
                        <div key={i} onClick={() => fillDemo(u)} style={{ backgroundColor: 'white', borderRadius: '10px', padding: '10px 14px', marginBottom: i < 2 ? '8px' : '0', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: email === u.email ? '2px solid #1A56A0' : '2px solid transparent' }}>
                            <div>
                                <p style={{ color: '#374151', fontWeight: 'bold', fontSize: '13px' }}>{u.name}</p>
                                <p style={{ color: '#9CA3AF', fontSize: '11px', marginTop: '2px' }}>{u.zone.split(',')[0]} • {u.platform}</p>
                            </div>
                            <p style={{ color: '#1A56A0', fontSize: '11px', fontWeight: '600' }}>{u.email}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    if (screen === 'forgot') return (
        <div style={{ backgroundColor: '#F4F6F9', minHeight: '100vh', fontFamily: 'Arial' }}>
            <Navbar backFn={() => { setScreen('login'); setForgotEmail(''); setForgotError(''); }} backLabel={t.backLogin} />
            <div style={{ padding: '48px 20px', maxWidth: '420px', margin: '0 auto' }}>
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <div style={{ width: '56px', height: '56px', borderRadius: '14px', backgroundColor: '#EEF4FF', border: '2px solid #DBEAFE', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#1A56A0" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                    </div>
                    <h2 style={{ color: '#1A1A2E', fontSize: '22px', fontWeight: 'bold', marginBottom: '6px' }}>{t.forgotTitle}</h2>
                    <p style={{ color: '#9CA3AF', fontSize: '14px' }}>{t.forgotSubtitle}</p>
                </div>
                <div style={{ backgroundColor: 'white', borderRadius: '20px', padding: '28px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', border: '1px solid #E5E7EB' }}>
                    <div style={{ marginBottom: '20px' }}>
                        <label style={labelStyle}>{t.email}</label>
                        <input type="email" placeholder={t.emailPlaceholder} value={forgotEmail} onChange={e => { setForgotEmail(e.target.value); setForgotError(''); }} onKeyDown={e => e.key === 'Enter' && handleForgotSubmit()} style={{ ...inputStyle, border: `1.5px solid ${forgotError ? '#FECACA' : '#E5E7EB'}` }} />
                        {forgotError && <p style={{ color: '#DC2626', fontSize: '12px', marginTop: '6px' }}>{forgotError}</p>}
                    </div>
                    <button onClick={handleForgotSubmit} disabled={loading} style={{ width: '100%', backgroundColor: loading ? '#93B4D9' : '#1A56A0', color: 'white', padding: '14px', borderRadius: '10px', border: 'none', fontSize: '15px', fontWeight: 'bold', cursor: loading ? 'default' : 'pointer' }}>
                        {loading ? t.sendingOtp : t.sendOtp}
                    </button>
                </div>
            </div>
        </div>
    );

    if (screen === 'otp') return (
        <div style={{ backgroundColor: '#F4F6F9', minHeight: '100vh', fontFamily: 'Arial' }}>
            <Navbar backFn={() => { setScreen('forgot'); setOtp(['', '', '', '']); setOtpError(''); }} backLabel="Back" />
            <div style={{ padding: '48px 20px', maxWidth: '420px', margin: '0 auto' }}>
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <div style={{ width: '56px', height: '56px', borderRadius: '14px', backgroundColor: '#EEF4FF', border: '2px solid #DBEAFE', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#1A56A0" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.62 3.41 2 2 0 0 1 3.6 1.22h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.91a16 16 0 0 0 6 6l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.73 16.92z" /></svg>
                    </div>
                    <h2 style={{ color: '#1A1A2E', fontSize: '22px', fontWeight: 'bold', marginBottom: '6px' }}>{t.otpTitle}</h2>
                    <p style={{ color: '#9CA3AF', fontSize: '14px' }}>{t.otpSubtitle}<br /><span style={{ color: '#374151', fontWeight: '600' }}>{forgotEmail}</span></p>
                </div>
                <div style={{ backgroundColor: 'white', borderRadius: '20px', padding: '28px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', border: '1px solid #E5E7EB' }}>
                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginBottom: '24px' }}>
                        {otp.map((digit, index) => (
                            <input key={index} id={`otp-${index}`} type="text" inputMode="numeric" maxLength={1} value={digit}
                                onChange={e => handleOtpChange(index, e.target.value)}
                                onKeyDown={e => { if (e.key === 'Backspace' && !otp[index] && index > 0) document.getElementById(`otp-${index - 1}`)?.focus(); }}
                                style={{ width: '56px', height: '56px', textAlign: 'center', fontSize: '22px', fontWeight: 'bold', borderRadius: '12px', border: `2px solid ${digit ? '#1A56A0' : '#E5E7EB'}`, outline: 'none', fontFamily: 'Arial', color: '#1A56A0', backgroundColor: digit ? '#EEF4FF' : 'white' }} />
                        ))}
                    </div>
                    {otpError && (
                        <div style={{ backgroundColor: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '10px', padding: '10px 14px', marginBottom: '16px' }}>
                            <p style={{ color: '#DC2626', fontSize: '13px', margin: 0 }}>{otpError}</p>
                        </div>
                    )}
                    <button onClick={handleOtpVerify} style={{ width: '100%', backgroundColor: '#1A56A0', color: 'white', padding: '14px', borderRadius: '10px', border: 'none', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer', marginBottom: '16px' }}>{t.verifyOtp}</button>
                    <p style={{ textAlign: 'center', color: '#9CA3AF', fontSize: '13px' }}>
                        {t.didntReceive}{' '}<span onClick={() => setOtp(['', '', '', ''])} style={{ color: '#1A56A0', fontWeight: '600', cursor: 'pointer' }}>{t.resend}</span>
                    </p>
                </div>
            </div>
        </div>
    );

    if (screen === 'reset') return (
        <div style={{ backgroundColor: '#F4F6F9', minHeight: '100vh', fontFamily: 'Arial' }}>
            <Navbar backFn={() => { setScreen('otp'); setResetError(''); }} backLabel="Back" />
            <div style={{ padding: '48px 20px', maxWidth: '420px', margin: '0 auto' }}>
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <div style={{ width: '56px', height: '56px', borderRadius: '14px', backgroundColor: '#F0FDF4', border: '2px solid #BBF7D0', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#1E7D34" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                    </div>
                    <h2 style={{ color: '#1A1A2E', fontSize: '22px', fontWeight: 'bold', marginBottom: '6px' }}>{t.resetTitle}</h2>
                    <p style={{ color: '#9CA3AF', fontSize: '14px' }}>{t.resetSubtitle}</p>
                </div>
                <div style={{ backgroundColor: 'white', borderRadius: '20px', padding: '28px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', border: '1px solid #E5E7EB' }}>
                    <div style={{ marginBottom: '16px' }}>
                        <label style={labelStyle}>{t.newPassword}</label>
                        <div style={{ position: 'relative' }}>
                            <input type={showNewPwd ? 'text' : 'password'} placeholder={t.minPassword} value={newPassword} onChange={e => { setNewPassword(e.target.value); setResetError(''); }} style={{ ...inputStyle, paddingRight: '60px' }} />
                            <button onClick={() => setShowNewPwd(!showNewPwd)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', fontSize: '13px' }}>
                                {showNewPwd ? t.hide : t.show}
                            </button>
                        </div>
                    </div>
                    <div style={{ marginBottom: '24px' }}>
                        <label style={labelStyle}>{t.confirmPassword}</label>
                        <input type="password" placeholder={t.reenter} value={confirmNewPassword} onChange={e => { setConfirmNewPassword(e.target.value); setResetError(''); }} style={inputStyle} />
                        {confirmNewPassword && newPassword === confirmNewPassword && <p style={{ color: '#1E7D34', fontSize: '12px', marginTop: '5px', fontWeight: '600' }}>{t.passwordMatch}</p>}
                    </div>
                    {resetError && (
                        <div style={{ backgroundColor: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '10px', padding: '10px 14px', marginBottom: '16px' }}>
                            <p style={{ color: '#DC2626', fontSize: '13px', margin: 0 }}>{resetError}</p>
                        </div>
                    )}
                    <button onClick={handleReset} disabled={loading} style={{ width: '100%', backgroundColor: loading ? '#93B4D9' : '#1A56A0', color: 'white', padding: '14px', borderRadius: '10px', border: 'none', fontSize: '15px', fontWeight: 'bold', cursor: loading ? 'default' : 'pointer' }}>
                        {loading ? t.updating : t.updatePassword}
                    </button>
                </div>
            </div>
        </div>
    );

    if (screen === 'success') return (
        <div style={{ backgroundColor: '#F4F6F9', minHeight: '100vh', fontFamily: 'Arial', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ textAlign: 'center', padding: '40px 20px', maxWidth: '380px' }}>
                <div style={{ width: '72px', height: '72px', borderRadius: '50%', backgroundColor: '#F0FDF4', border: '3px solid #BBF7D0', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: '0 4px 20px rgba(30,125,52,0.15)' }}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#1E7D34" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                </div>
                <h2 style={{ color: '#1A1A2E', fontSize: '24px', fontWeight: 'bold', marginBottom: '10px' }}>{t.successTitle}</h2>
                <p style={{ color: '#9CA3AF', fontSize: '14px', marginBottom: '32px', lineHeight: 1.6 }}>{t.successMsg}</p>
                <button onClick={() => { setScreen('login'); setEmail(''); setPassword(''); setOtp(['', '', '', '']); setNewPassword(''); setConfirmNewPassword(''); }}
                    style={{ width: '100%', backgroundColor: '#1A56A0', color: 'white', padding: '14px', borderRadius: '10px', border: 'none', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer' }}>
                    {t.backSignIn}
                </button>
            </div>
        </div>
    );
}