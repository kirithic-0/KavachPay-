import React, { useState } from 'react';
import { KavachLogo } from './App';
import { auth as firebaseAuth } from './firebase';
import { signInWithEmailAndPassword } from "firebase/auth";

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const api = {
    adminLogin: async (email, password) => {
        try {
            const userCredential = await signInWithEmailAndPassword(firebaseAuth, email, password);
            const token = await userCredential.user.getIdToken();
            localStorage.setItem('adminToken', token);
            const uid = userCredential.user.uid;
            
            // Validate admin status with backend
            const res = await fetch(`${API_BASE}/api/admin/overview`, {
                headers: { 'Authorization': `Bearer ${token}` }
            }).then(r => r.json());
            
            if (res.error) {
                return { success: false, error: res.detail || res.error };
            }
            
            return { success: true, admin: { email, uid, role: res.role || 'Admin' } };
        } catch (e) {
            console.error("Admin Login Error: ", e);
            return { success: false, error: 'Invalid admin credentials or network error.' };
        }
    },
    sendAdminOtp: async (email) => {
        // TODO: BACKEND
        return { success: true };
    },
    verifyAdminOtp: async (email, otp) => {
        // TODO: BACKEND
        return { success: otp === '1234' };
    },
    resetAdminPassword: async (email, answer, newPassword) => {
        // TODO: BACKEND
        return { success: answer.toLowerCase() === 'kavach2026' };
    },
};

const C = {
    navy: '#08101F',
    navyMid: '#0D1829',
    navyLight: '#1A3A5C',
    accent: '#2563EB',
    accentLight: 'rgba(37,99,235,0.12)',
    bg: '#080C14',
    cardBg: '#0D1422',
    cardBorder: 'rgba(255,255,255,0.08)',
    text: '#FFFFFF',
    textSec: 'rgba(255,255,255,0.7)',
    textMuted: 'rgba(255,255,255,0.4)',
    green: '#10B981',
    greenLight: 'rgba(16,185,129,0.15)',
    red: '#EF4444',
    redLight: 'rgba(239,68,68,0.12)',
    redBorder: 'rgba(239,68,68,0.3)',
};

export default function AdminLogin({ onLogin, onBack }) {
    const [step, setStep] = useState('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [otp, setOtp] = useState('');
    const [securityAnswer, setSecurityAnswer] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [otpSent, setOtpSent] = useState(false);
    const [otpVerified, setOtpVerified] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const iStyle = (err) => ({
        width: '100%', padding: '11px 14px', borderRadius: 8,
        border: `1px solid ${err ? C.redBorder : C.cardBorder}`,
        fontSize: 14, boxSizing: 'border-box',
        fontFamily: 'Inter, sans-serif', outline: 'none',
        color: C.text, backgroundColor: 'rgba(255,255,255,0.05)',
        transition: 'border-color 0.15s ease',
    });

    const label = (text) => (
        <p style={{ color: C.textSec, fontWeight: 600, fontSize: 13, marginBottom: 6 }}>{text}</p>
    );

    const handleLogin = async () => {
        if (!email || !password) { setError('Please fill in all fields.'); return; }
        setLoading(true); setError('');
        const result = await api.adminLogin(email, password);
        setLoading(false);
        if (result.success) onLogin(result.admin);
        else setError(result.error);
    };

    const handleSendOtp = async () => {
        if (!email || !/\S+@\S+\.\S+/.test(email)) { setError('Enter valid admin email.'); return; }
        setLoading(true); setError('');
        await api.sendAdminOtp(email);
        setLoading(false);
        setOtpSent(true);
    };

    const handleVerifyOtp = async () => {
        setLoading(true); setError('');
        const result = await api.verifyAdminOtp(email, otp);
        setLoading(false);
        if (result.success) setOtpVerified(true);
        else setError('Incorrect OTP.');
    };

    const handleReset = async () => {
        if (!newPassword || newPassword.length < 6) { setError('Password must be at least 6 characters.'); return; }
        setLoading(true); setError('');
        const result = await api.resetAdminPassword(email, securityAnswer, newPassword);
        setLoading(false);
        if (result.success) setStep('resetDone');
        else setError('Incorrect security answer. Hint: kavach2026');
    };

    return (
        <div style={{ minHeight: '100vh', backgroundColor: C.bg, fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>

            {/* Background grid */}
            <div style={{ position: 'fixed', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)', backgroundSize: '60px 60px', pointerEvents: 'none' }} />

            {/* Navbar */}
            <div style={{ position: 'relative', zIndex: 1, padding: '16px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${C.cardBorder}` }}>
                <KavachLogo size={28} light />
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ backgroundColor: 'rgba(37,99,235,0.15)', border: '1px solid rgba(37,99,235,0.3)', borderRadius: 6, padding: '4px 12px' }}>
                        <p style={{ color: '#60A5FA', fontSize: 11, fontWeight: 700, letterSpacing: 1 }}>ADMIN PORTAL</p>
                    </div>
                    <button onClick={onBack} style={{ backgroundColor: 'transparent', color: C.textMuted, border: `1px solid ${C.cardBorder}`, padding: '6px 14px', borderRadius: 7, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>Back</button>
                </div>
            </div>

            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 16px', position: 'relative', zIndex: 1 }}>
                <div style={{ width: '100%', maxWidth: 380 }}>

                    {/* ── LOGIN ── */}
                    {step === 'login' && (
                        <div style={{ backgroundColor: C.cardBg, borderRadius: 14, padding: '32px 28px', border: `1px solid ${C.cardBorder}`, boxShadow: '0 24px 80px rgba(0,0,0,0.4)' }}>
                            <div style={{ marginBottom: 28 }}>
                                <p style={{ color: C.text, fontSize: 22, fontWeight: 800, marginBottom: 4 }}>Admin Sign In</p>
                                <p style={{ color: C.textMuted, fontSize: 14 }}>KavachPay Operations Dashboard</p>
                            </div>

                            <div style={{ marginBottom: 14 }}>
                                {label('Admin Email')}
                                <input type="email" placeholder="admin@kavachpay.in" value={email}
                                    onChange={e => { setEmail(e.target.value); setError(''); }}
                                    onKeyDown={e => e.key === 'Enter' && handleLogin()}
                                    style={iStyle(error)}
                                    onFocus={e => e.target.style.borderColor = 'rgba(37,99,235,0.5)'}
                                    onBlur={e => e.target.style.borderColor = error ? C.redBorder : C.cardBorder} />
                            </div>

                            <div style={{ marginBottom: 8 }}>
                                {label('Password')}
                                <div style={{ position: 'relative' }}>
                                    <input type={showPassword ? 'text' : 'password'} placeholder="Admin password"
                                        value={password} onChange={e => { setPassword(e.target.value); setError(''); }}
                                        onKeyDown={e => e.key === 'Enter' && handleLogin()}
                                        style={{ ...iStyle(error), paddingRight: 60 }}
                                        onFocus={e => e.target.style.borderColor = 'rgba(37,99,235,0.5)'}
                                        onBlur={e => e.target.style.borderColor = error ? C.redBorder : C.cardBorder} />
                                    <button onClick={() => setShowPassword(!showPassword)}
                                        style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: C.textMuted, fontSize: 12, fontWeight: 600 }}>
                                        {showPassword ? 'Hide' : 'Show'}
                                    </button>
                                </div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 20 }}>
                                <button onClick={() => { setStep('forgot'); setError(''); }}
                                    style={{ background: 'none', border: 'none', color: '#60A5FA', fontSize: 13, cursor: 'pointer', fontWeight: 600 }}>
                                    Forgot password?
                                </button>
                            </div>

                            {error && (
                                <div style={{ backgroundColor: C.redLight, border: `1px solid ${C.redBorder}`, borderRadius: 8, padding: '9px 12px', marginBottom: 16 }}>
                                    <p style={{ color: C.red, fontSize: 13 }}>{error}</p>
                                </div>
                            )}

                            <button onClick={handleLogin} disabled={loading}
                                style={{ width: '100%', backgroundColor: C.navyLight, color: 'white', padding: 13, borderRadius: 8, border: 'none', fontSize: 15, fontWeight: 700, cursor: loading ? 'default' : 'pointer', opacity: loading ? 0.7 : 1, marginBottom: 20, transition: 'opacity 0.2s ease' }}>
                                {loading ? 'Signing in...' : 'Sign In to Admin'}
                            </button>

                            {/* Demo credentials */}
                            <div style={{ borderTop: `1px solid ${C.cardBorder}`, paddingTop: 18 }}>
                                <p style={{ color: C.textMuted, fontSize: 11, fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 12 }}>Demo Credentials</p>
                                {[
                                    { label: 'Super Admin', email: 'admin@kavachpay.in', password: 'password123' },
                                    { label: 'Ops Manager', email: 'ops@kavachpay.in', password: 'password123' },
                                ].map((acc, i) => (
                                    <button key={i} onClick={() => { setEmail(acc.email); setPassword(acc.password); setError(''); }}
                                        style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 14px', backgroundColor: 'rgba(255,255,255,0.04)', border: `1px solid ${C.cardBorder}`, borderRadius: 8, cursor: 'pointer', marginBottom: 8, fontFamily: 'Inter, sans-serif', transition: 'all 0.15s ease' }}
                                        onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(37,99,235,0.12)'; e.currentTarget.style.borderColor = 'rgba(37,99,235,0.3)'; }}
                                        onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor = C.cardBorder; }}>
                                        <div style={{ textAlign: 'left' }}>
                                            <p style={{ color: C.text, fontWeight: 600, fontSize: 13 }}>{acc.label}</p>
                                            <p style={{ color: C.textMuted, fontSize: 11, marginTop: 1 }}>{acc.email}</p>
                                        </div>
                                        <p style={{ color: '#60A5FA', fontSize: 12, fontWeight: 600 }}>Fill →</p>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ── FORGOT ── */}
                    {step === 'forgot' && (
                        <div style={{ backgroundColor: C.cardBg, borderRadius: 14, padding: '32px 28px', border: `1px solid ${C.cardBorder}`, boxShadow: '0 24px 80px rgba(0,0,0,0.4)' }}>
                            <button onClick={() => { setStep('login'); setError(''); setOtpSent(false); setOtpVerified(false); }}
                                style={{ background: 'none', border: 'none', color: C.textMuted, fontSize: 13, cursor: 'pointer', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 6 }}>
                                ← Back
                            </button>
                            <p style={{ color: C.text, fontSize: 20, fontWeight: 800, marginBottom: 4 }}>Reset Admin Password</p>
                            <p style={{ color: C.textMuted, fontSize: 14, marginBottom: 24 }}>
                                {!otpSent ? 'Enter your admin email.' : !otpVerified ? 'Enter the OTP sent to your email.' : 'Answer the security question.'}
                            </p>

                            {!otpSent && (
                                <div>
                                    <div style={{ marginBottom: 16 }}>
                                        {label('Admin Email')}
                                        <input type="email" placeholder="admin@kavachpay.in" value={email}
                                            onChange={e => { setEmail(e.target.value); setError(''); }} style={iStyle(error)}
                                            onFocus={e => e.target.style.borderColor = 'rgba(37,99,235,0.5)'}
                                            onBlur={e => e.target.style.borderColor = error ? C.redBorder : C.cardBorder} />
                                    </div>
                                    {error && <div style={{ backgroundColor: C.redLight, border: `1px solid ${C.redBorder}`, borderRadius: 8, padding: '9px 12px', marginBottom: 14 }}><p style={{ color: C.red, fontSize: 13 }}>{error}</p></div>}
                                    <button onClick={handleSendOtp} disabled={loading}
                                        style={{ width: '100%', backgroundColor: C.navyLight, color: 'white', padding: 13, borderRadius: 8, border: 'none', fontSize: 14, fontWeight: 700, cursor: 'pointer', opacity: loading ? 0.7 : 1 }}>
                                        {loading ? 'Sending...' : 'Send OTP'}
                                    </button>
                                </div>
                            )}

                            {otpSent && !otpVerified && (
                                <div>
                                    <div style={{ marginBottom: 16 }}>
                                        {label('Enter OTP')}
                                        <input type="text" placeholder="4-digit OTP" value={otp} maxLength={4}
                                            onChange={e => { setOtp(e.target.value); setError(''); }}
                                            style={{ ...iStyle(error), letterSpacing: 6, fontWeight: 700, textAlign: 'center', fontSize: 18 }}
                                            onFocus={e => e.target.style.borderColor = 'rgba(37,99,235,0.5)'}
                                            onBlur={e => e.target.style.borderColor = error ? C.redBorder : C.cardBorder} />
                                        <p style={{ color: C.textMuted, fontSize: 11, marginTop: 5 }}>Demo OTP: 1234</p>
                                    </div>
                                    {error && <div style={{ backgroundColor: C.redLight, border: `1px solid ${C.redBorder}`, borderRadius: 8, padding: '9px 12px', marginBottom: 14 }}><p style={{ color: C.red, fontSize: 13 }}>{error}</p></div>}
                                    <button onClick={handleVerifyOtp} disabled={loading}
                                        style={{ width: '100%', backgroundColor: C.navyLight, color: 'white', padding: 13, borderRadius: 8, border: 'none', fontSize: 14, fontWeight: 700, cursor: 'pointer', opacity: loading ? 0.7 : 1 }}>
                                        {loading ? 'Verifying...' : 'Verify OTP'}
                                    </button>
                                </div>
                            )}

                            {otpVerified && (
                                <div>
                                    <div style={{ backgroundColor: C.greenLight, border: '1px solid rgba(16,185,129,0.3)', borderRadius: 8, padding: '9px 12px', marginBottom: 18 }}>
                                        <p style={{ color: C.green, fontSize: 13, fontWeight: 600 }}>OTP verified.</p>
                                    </div>
                                    <div style={{ marginBottom: 14 }}>
                                        {label('Security Question')}
                                        <div style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: `1px solid ${C.cardBorder}`, borderRadius: 8, padding: '10px 14px', marginBottom: 12 }}>
                                            <p style={{ color: C.textSec, fontSize: 13 }}>What is the name of KavachPay\'s founding product?</p>
                                        </div>
                                        {label('Your Answer')}
                                        <input type="text" placeholder="Enter your answer" value={securityAnswer}
                                            onChange={e => { setSecurityAnswer(e.target.value); setError(''); }} style={iStyle(error)}
                                            onFocus={e => e.target.style.borderColor = 'rgba(37,99,235,0.5)'}
                                            onBlur={e => e.target.style.borderColor = error ? C.redBorder : C.cardBorder} />
                                        <p style={{ color: C.textMuted, fontSize: 11, marginTop: 4 }}>Hint: kavach2026</p>
                                    </div>
                                    <div style={{ marginBottom: 16 }}>
                                        {label('New Password')}
                                        <input type="password" placeholder="Minimum 6 characters" value={newPassword}
                                            onChange={e => { setNewPassword(e.target.value); setError(''); }} style={iStyle(error)}
                                            onFocus={e => e.target.style.borderColor = 'rgba(37,99,235,0.5)'}
                                            onBlur={e => e.target.style.borderColor = error ? C.redBorder : C.cardBorder} />
                                    </div>
                                    {error && <div style={{ backgroundColor: C.redLight, border: `1px solid ${C.redBorder}`, borderRadius: 8, padding: '9px 12px', marginBottom: 14 }}><p style={{ color: C.red, fontSize: 13 }}>{error}</p></div>}
                                    <button onClick={handleReset} disabled={loading}
                                        style={{ width: '100%', backgroundColor: C.navyLight, color: 'white', padding: 13, borderRadius: 8, border: 'none', fontSize: 14, fontWeight: 700, cursor: 'pointer', opacity: loading ? 0.7 : 1 }}>
                                        {loading ? 'Resetting...' : 'Reset Password'}
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ── RESET DONE ── */}
                    {step === 'resetDone' && (
                        <div style={{ backgroundColor: C.cardBg, borderRadius: 14, padding: '40px 28px', border: `1px solid ${C.cardBorder}`, textAlign: 'center', boxShadow: '0 24px 80px rgba(0,0,0,0.4)' }}>
                            <div style={{ width: 56, height: 56, borderRadius: '50%', backgroundColor: C.greenLight, border: '2px solid rgba(16,185,129,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={C.green} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                            </div>
                            <p style={{ color: C.text, fontWeight: 800, fontSize: 18, marginBottom: 6 }}>Password Reset</p>
                            <p style={{ color: C.textMuted, fontSize: 14, marginBottom: 24 }}>Admin password updated successfully.</p>
                            <button onClick={() => { setStep('login'); setOtpSent(false); setOtpVerified(false); setOtp(''); setNewPassword(''); setSecurityAnswer(''); }}
                                style={{ width: '100%', backgroundColor: C.navyLight, color: 'white', padding: 13, borderRadius: 8, border: 'none', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
                                Back to Admin Login
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}