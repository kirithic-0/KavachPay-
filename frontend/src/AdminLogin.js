import React, { useState } from 'react';

const ADMIN_CREDENTIALS = [
    { email: 'admin@kavachpay.in', password: 'admin123', name: 'Admin', role: 'Super Admin' },
    { email: 'ops@kavachpay.in', password: 'ops123', name: 'Ops Team', role: 'Operations Manager' },
];

const SECURITY_QUESTION = 'What is your admin access code?';
const SECURITY_ANSWER = 'kavach2026';

const LangToggle = ({ lang, setLang }) => (
    <div style={{ display: 'flex', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '20px', padding: '3px', gap: '2px' }}>
        {[{ code: 'en', label: 'EN' }, { code: 'hi', label: 'हि' }, { code: 'ta', label: 'த' }].map(l => (
            <button key={l.code} onClick={() => setLang(l.code)}
                style={{ backgroundColor: lang === l.code ? 'white' : 'transparent', color: lang === l.code ? '#1A1A2E' : 'white', border: 'none', padding: '5px 12px', borderRadius: '16px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold', transition: 'all 0.2s' }}>
                {l.label}
            </button>
        ))}
    </div>
);

export default function AdminLogin({ onLogin, onBack, lang, setLang }) {
    const [screen, setScreen] = useState('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [forgotEmail, setForgotEmail] = useState('');
    const [forgotError, setForgotError] = useState('');
    const [securityAnswer, setSecurityAnswer] = useState('');
    const [securityError, setSecurityError] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [showNewPwd, setShowNewPwd] = useState(false);
    const [resetError, setResetError] = useState('');

    const handleLogin = () => {
        if (!email || !password) { setError('Please enter both email and password.'); return; }
        setLoading(true); setError('');
        setTimeout(() => {
            const admin = ADMIN_CREDENTIALS.find(a => a.email === email.toLowerCase() && a.password === password);
            if (admin) { onLogin(admin); }
            else { setError('Invalid credentials. Please check your email and password and try again.'); setLoading(false); }
        }, 1000);
    };

    const handleForgotSubmit = () => {
        if (!forgotEmail) { setForgotError('Please enter your admin email address.'); return; }
        if (!/\S+@\S+\.\S+/.test(forgotEmail)) { setForgotError('Please enter a valid email address.'); return; }
        setForgotError(''); setScreen('security');
    };

    const handleSecurityVerify = () => {
        if (!securityAnswer) { setSecurityError('Please enter your answer.'); return; }
        if (securityAnswer.toLowerCase().trim() !== SECURITY_ANSWER) { setSecurityError('Incorrect answer. Please try again.'); return; }
        setSecurityError(''); setLoading(true);
        setTimeout(() => { setLoading(false); setScreen('newpassword'); }, 800);
    };

    const handleReset = () => {
        if (!newPassword || newPassword.length < 6) { setResetError('Password must be at least 6 characters.'); return; }
        if (newPassword !== confirmNewPassword) { setResetError('Passwords do not match.'); return; }
        setResetError(''); setLoading(true);
        setTimeout(() => { setLoading(false); setScreen('success'); }, 1000);
    };

    const fillDemo = (cred) => { setEmail(cred.email); setPassword(cred.password); setError(''); };

    const darkInput = {
        width: '100%', padding: '12px 14px', borderRadius: '10px',
        border: '1.5px solid rgba(255,255,255,0.08)', fontSize: '14px',
        boxSizing: 'border-box', fontFamily: 'Arial', outline: 'none',
        backgroundColor: '#0D1B2A', color: 'white'
    };

    const labelStyle = { display: 'block', color: '#aaa', fontWeight: '600', fontSize: '13px', marginBottom: '7px', letterSpacing: '0.3px' };

    const Navbar = ({ backFn, backLabel }) => (
        <div style={{ backgroundColor: '#1A1A2E', padding: '14px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#F0A500', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                </div>
                <div>
                    <p style={{ color: 'white', fontWeight: 'bold', fontSize: '15px' }}>KavachPay</p>
                    <p style={{ color: '#F0A500', fontSize: '10px', letterSpacing: '1px' }}>ADMIN PORTAL</p>
                </div>
            </div>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <LangToggle lang={lang} setLang={setLang} />
                <button onClick={backFn} style={{ backgroundColor: 'transparent', color: '#aaa', border: '1px solid rgba(255,255,255,0.15)', padding: '6px 14px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px' }}>
                    {backLabel}
                </button>
            </div>
        </div>
    );

    // LOGIN SCREEN
    if (screen === 'login') return (
        <div style={{ backgroundColor: '#0D1B2A', minHeight: '100vh', fontFamily: 'Arial', display: 'flex', flexDirection: 'column' }}>
            <Navbar backFn={onBack} backLabel="Back to Home" />
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
                <div style={{ width: '100%', maxWidth: '400px' }}>
                    <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                        <div style={{ width: '60px', height: '60px', borderRadius: '16px', backgroundColor: '#F0A500', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', boxShadow: '0 4px 20px rgba(240,165,0,0.3)' }}>
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                        </div>
                        <h2 style={{ color: 'white', fontSize: '24px', fontWeight: 'bold', marginBottom: '6px' }}>Admin Portal</h2>
                        <p style={{ color: '#666', fontSize: '14px' }}>KavachPay Operations Dashboard</p>
                    </div>

                    <div style={{ backgroundColor: 'rgba(240,165,0,0.08)', border: '1px solid rgba(240,165,0,0.2)', borderRadius: '10px', padding: '10px 16px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#F0A500" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                        <p style={{ color: '#F0A500', fontSize: '12px' }}>Restricted access — Authorized personnel only</p>
                    </div>

                    <div style={{ backgroundColor: '#1A1A2E', borderRadius: '20px', padding: '28px', boxShadow: '0 4px 30px rgba(0,0,0,0.4)', marginBottom: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <div style={{ marginBottom: '16px' }}>
                            <label style={labelStyle}>Admin Email</label>
                            <input type="email" placeholder="admin@kavachpay.in" value={email} onChange={e => { setEmail(e.target.value); setError(''); }} onKeyDown={e => e.key === 'Enter' && handleLogin()} style={darkInput} />
                        </div>
                        <div style={{ marginBottom: '8px' }}>
                            <label style={labelStyle}>Password</label>
                            <div style={{ position: 'relative' }}>
                                <input type={showPassword ? 'text' : 'password'} placeholder="Enter admin password" value={password} onChange={e => { setPassword(e.target.value); setError(''); }} onKeyDown={e => e.key === 'Enter' && handleLogin()} style={{ ...darkInput, paddingRight: '60px' }} />
                                <button onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#666', fontSize: '13px' }}>
                                    {showPassword ? 'Hide' : 'Show'}
                                </button>
                            </div>
                        </div>
                        <div style={{ textAlign: 'right', marginBottom: '20px' }}>
                            <span onClick={() => { setScreen('forgot'); setForgotEmail(''); setForgotError(''); setSecurityAnswer(''); setSecurityError(''); }}
                                style={{ color: '#F0A500', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
                                Forgot password?
                            </span>
                        </div>
                        {error && (
                            <div style={{ backgroundColor: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.25)', borderRadius: '10px', padding: '12px 14px', marginBottom: '16px' }}>
                                <p style={{ color: '#F87171', fontSize: '13px', margin: 0 }}>{error}</p>
                            </div>
                        )}
                        <button onClick={handleLogin} disabled={loading}
                            style={{ width: '100%', backgroundColor: loading ? '#B87A00' : '#F0A500', color: 'white', padding: '14px', borderRadius: '10px', border: 'none', fontSize: '15px', fontWeight: 'bold', cursor: loading ? 'default' : 'pointer', boxShadow: '0 4px 16px rgba(240,165,0,0.25)' }}>
                            {loading ? 'Authenticating...' : 'Sign In to Admin Portal'}
                        </button>
                    </div>

                    <div style={{ backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '14px', padding: '16px', border: '1px solid rgba(255,255,255,0.06)' }}>
                        <p style={{ color: '#F0A500', fontWeight: 'bold', fontSize: '11px', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Demo Credentials</p>
                        {ADMIN_CREDENTIALS.map((c, i) => (
                            <div key={i} onClick={() => fillDemo(c)}
                                style={{ backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: '10px', padding: '10px 14px', marginBottom: i < 1 ? '8px' : '0', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: email === c.email ? '1.5px solid #F0A500' : '1.5px solid transparent' }}>
                                <div>
                                    <p style={{ color: 'white', fontWeight: 'bold', fontSize: '13px' }}>{c.name}</p>
                                    <p style={{ color: '#F0A500', fontSize: '11px', marginTop: '2px' }}>{c.role}</p>
                                </div>
                                <p style={{ color: '#666', fontSize: '11px' }}>{c.email}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );

    // FORGOT SCREEN
    if (screen === 'forgot') return (
        <div style={{ backgroundColor: '#0D1B2A', minHeight: '100vh', fontFamily: 'Arial', display: 'flex', flexDirection: 'column' }}>
            <Navbar backFn={() => { setScreen('login'); setForgotEmail(''); setForgotError(''); }} backLabel="Back to Login" />
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
                <div style={{ width: '100%', maxWidth: '400px' }}>
                    <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                        <div style={{ width: '56px', height: '56px', borderRadius: '14px', backgroundColor: 'rgba(240,165,0,0.1)', border: '2px solid rgba(240,165,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#F0A500" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                        </div>
                        <h2 style={{ color: 'white', fontSize: '22px', fontWeight: 'bold', marginBottom: '6px' }}>Admin Password Reset</h2>
                        <p style={{ color: '#666', fontSize: '14px' }}>Enter your admin email to continue</p>
                    </div>
                    <div style={{ backgroundColor: '#1A1A2E', borderRadius: '20px', padding: '28px', boxShadow: '0 4px 30px rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <div style={{ marginBottom: '20px' }}>
                            <label style={labelStyle}>Admin Email Address</label>
                            <input type="email" placeholder="admin@kavachpay.in" value={forgotEmail} onChange={e => { setForgotEmail(e.target.value); setForgotError(''); }} onKeyDown={e => e.key === 'Enter' && handleForgotSubmit()} style={{ ...darkInput, border: `1.5px solid ${forgotError ? 'rgba(220,38,38,0.5)' : 'rgba(255,255,255,0.08)'}` }} />
                            {forgotError && <p style={{ color: '#F87171', fontSize: '12px', marginTop: '6px' }}>{forgotError}</p>}
                        </div>
                        <button onClick={handleForgotSubmit} style={{ width: '100%', backgroundColor: '#F0A500', color: 'white', padding: '14px', borderRadius: '10px', border: 'none', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer' }}>
                            Continue
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    // SECURITY QUESTION
    if (screen === 'security') return (
        <div style={{ backgroundColor: '#0D1B2A', minHeight: '100vh', fontFamily: 'Arial', display: 'flex', flexDirection: 'column' }}>
            <Navbar backFn={() => { setScreen('forgot'); setSecurityAnswer(''); setSecurityError(''); }} backLabel="Back" />
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
                <div style={{ width: '100%', maxWidth: '400px' }}>
                    <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                        <div style={{ width: '56px', height: '56px', borderRadius: '14px', backgroundColor: 'rgba(240,165,0,0.1)', border: '2px solid rgba(240,165,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#F0A500" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
                        </div>
                        <h2 style={{ color: 'white', fontSize: '22px', fontWeight: 'bold', marginBottom: '6px' }}>Security Verification</h2>
                        <p style={{ color: '#666', fontSize: '14px' }}>Answer your security question to continue</p>
                    </div>
                    <div style={{ backgroundColor: '#1A1A2E', borderRadius: '20px', padding: '28px', boxShadow: '0 4px 30px rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <div style={{ backgroundColor: 'rgba(240,165,0,0.06)', borderRadius: '10px', padding: '14px 16px', marginBottom: '20px', border: '1px solid rgba(240,165,0,0.15)' }}>
                            <p style={{ color: '#9CA3AF', fontSize: '11px', marginBottom: '4px', letterSpacing: '0.3px' }}>SECURITY QUESTION</p>
                            <p style={{ color: 'white', fontSize: '14px', fontWeight: '600' }}>{SECURITY_QUESTION}</p>
                        </div>
                        <div style={{ marginBottom: '20px' }}>
                            <label style={labelStyle}>Your Answer</label>
                            <input type="text" placeholder="Enter your answer" value={securityAnswer} onChange={e => { setSecurityAnswer(e.target.value); setSecurityError(''); }} onKeyDown={e => e.key === 'Enter' && handleSecurityVerify()} style={{ ...darkInput, border: `1.5px solid ${securityError ? 'rgba(220,38,38,0.5)' : 'rgba(255,255,255,0.08)'}` }} />
                            {securityError && <p style={{ color: '#F87171', fontSize: '12px', marginTop: '6px' }}>{securityError}</p>}
                        </div>
                        <button onClick={handleSecurityVerify} disabled={loading} style={{ width: '100%', backgroundColor: loading ? '#B87A00' : '#F0A500', color: 'white', padding: '14px', borderRadius: '10px', border: 'none', fontSize: '15px', fontWeight: 'bold', cursor: loading ? 'default' : 'pointer' }}>
                            {loading ? 'Verifying...' : 'Verify Answer'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    // NEW PASSWORD
    if (screen === 'newpassword') return (
        <div style={{ backgroundColor: '#0D1B2A', minHeight: '100vh', fontFamily: 'Arial', display: 'flex', flexDirection: 'column' }}>
            <Navbar backFn={() => { setScreen('security'); setResetError(''); }} backLabel="Back" />
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
                <div style={{ width: '100%', maxWidth: '400px' }}>
                    <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                        <div style={{ width: '56px', height: '56px', borderRadius: '14px', backgroundColor: 'rgba(52,211,153,0.1)', border: '2px solid rgba(52,211,153,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#34D399" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                        </div>
                        <h2 style={{ color: 'white', fontSize: '22px', fontWeight: 'bold', marginBottom: '6px' }}>Set New Password</h2>
                        <p style={{ color: '#666', fontSize: '14px' }}>Identity verified. Choose a new admin password.</p>
                    </div>
                    <div style={{ backgroundColor: '#1A1A2E', borderRadius: '20px', padding: '28px', boxShadow: '0 4px 30px rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <div style={{ marginBottom: '16px' }}>
                            <label style={labelStyle}>New Password</label>
                            <div style={{ position: 'relative' }}>
                                <input type={showNewPwd ? 'text' : 'password'} placeholder="Minimum 6 characters" value={newPassword} onChange={e => { setNewPassword(e.target.value); setResetError(''); }} style={{ ...darkInput, paddingRight: '60px' }} />
                                <button onClick={() => setShowNewPwd(!showNewPwd)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#666', fontSize: '13px' }}>
                                    {showNewPwd ? 'Hide' : 'Show'}
                                </button>
                            </div>
                        </div>
                        <div style={{ marginBottom: '24px' }}>
                            <label style={labelStyle}>Confirm New Password</label>
                            <input type="password" placeholder="Re-enter new password" value={confirmNewPassword} onChange={e => { setConfirmNewPassword(e.target.value); setResetError(''); }} style={darkInput} />
                            {confirmNewPassword && newPassword === confirmNewPassword && <p style={{ color: '#34D399', fontSize: '12px', marginTop: '5px', fontWeight: '600' }}>Passwords match</p>}
                        </div>
                        {resetError && (
                            <div style={{ backgroundColor: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.25)', borderRadius: '10px', padding: '10px 14px', marginBottom: '16px' }}>
                                <p style={{ color: '#F87171', fontSize: '13px', margin: 0 }}>{resetError}</p>
                            </div>
                        )}
                        <button onClick={handleReset} disabled={loading} style={{ width: '100%', backgroundColor: loading ? '#B87A00' : '#F0A500', color: 'white', padding: '14px', borderRadius: '10px', border: 'none', fontSize: '15px', fontWeight: 'bold', cursor: loading ? 'default' : 'pointer' }}>
                            {loading ? 'Updating...' : 'Update Password'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    // SUCCESS
    if (screen === 'success') return (
        <div style={{ backgroundColor: '#0D1B2A', minHeight: '100vh', fontFamily: 'Arial', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ textAlign: 'center', padding: '40px 20px', maxWidth: '380px' }}>
                <div style={{ width: '72px', height: '72px', borderRadius: '50%', backgroundColor: 'rgba(52,211,153,0.1)', border: '3px solid rgba(52,211,153,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: '0 4px 20px rgba(52,211,153,0.15)' }}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#34D399" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                </div>
                <h2 style={{ color: 'white', fontSize: '24px', fontWeight: 'bold', marginBottom: '10px' }}>Password Updated</h2>
                <p style={{ color: '#666', fontSize: '14px', marginBottom: '32px', lineHeight: 1.6 }}>Your admin password has been reset successfully.</p>
                <button onClick={() => { setScreen('login'); setEmail(''); setPassword(''); setSecurityAnswer(''); setNewPassword(''); setConfirmNewPassword(''); }}
                    style={{ width: '100%', backgroundColor: '#F0A500', color: 'white', padding: '14px', borderRadius: '10px', border: 'none', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 16px rgba(240,165,0,0.25)' }}>
                    Back to Admin Login
                </button>
            </div>
        </div>
    );
}