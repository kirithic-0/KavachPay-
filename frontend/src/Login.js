import React, { useState } from 'react';
import { KavachLogo } from './App';
import { auth as firebaseAuth } from './firebase';
import { signInWithEmailAndPassword } from "firebase/auth";

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const api = {
    login: async (email, password) => {
        try {
            const userCredential = await signInWithEmailAndPassword(firebaseAuth, email, password);
            const token = await userCredential.user.getIdToken();
            localStorage.setItem('token', token);
            const uid = userCredential.user.uid;
            const res = await fetch(`${API_BASE}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ uid })
            }).then(r => r.json());
            
            if (res.success) return { success: true, worker: res.worker };
            else return { success: false, error: res.error };
        } catch (e) {
            console.error("Login Error: ", e);
            return { success: false, error: 'Invalid email or password.' };
        }
    },
    sendOtp: async (email) => {
        return { success: true };
    },
    verifyOtp: async (email, otp) => {
        return { success: otp === '1234' };
    },
    resetPassword: async (email, newPassword) => {
        return { success: true };
    },
};

const C = {
    navy: '#08101F',
    accent: '#1A3A5C',
    accentLight: '#F0F4F8',
    accentBorder: '#D1E0EE',
    bg: '#F9FAFB',
    cardBg: '#FFFFFF',
    cardBorder: '#E5E7EB',
    text: '#111827',
    textSec: '#374151',
    textMuted: '#6B7280',
    green: '#059669',
    greenLight: '#ECFDF5',
    greenBorder: '#A7F3D0',
    red: '#DC2626',
    redLight: '#FEF2F2',
    redBorder: '#FECACA',
};

export default function Login({ onLogin, onBack, onSignup }) {
    const [step, setStep] = useState('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [otpSent, setOtpSent] = useState(false);
    const [otpVerified, setOtpVerified] = useState(false);

    const iStyle = (err) => ({
        width: '100%', padding: '11px 14px', borderRadius: 8,
        border: `1px solid ${err ? C.redBorder : C.cardBorder}`,
        fontSize: 14, boxSizing: 'border-box',
        fontFamily: 'Inter, sans-serif', outline: 'none',
        color: C.text, backgroundColor: 'white',
        transition: 'border-color 0.15s ease',
    });

    const label = (text) => (
        <p style={{ color: C.textSec, fontWeight: 600, fontSize: 13, marginBottom: 6 }}>{text}</p>
    );

    const handleLogin = async () => {
        if (!email || !password) { setError('Please fill in all fields.'); return; }
        setLoading(true); setError('');
        const result = await api.login(email, password);
        setLoading(false);
        if (result.success) onLogin(result.worker);
        else setError(result.error);
    };

    const handleSendOtp = async () => {
        if (!email || !/\S+@\S+\.\S+/.test(email)) { setError('Enter a valid email address.'); return; }
        setLoading(true); setError('');
        await api.sendOtp(email);
        setLoading(false);
        setOtpSent(true);
    };

    const handleVerifyOtp = async () => {
        if (!otp) { setError('Enter the OTP.'); return; }
        setLoading(true); setError('');
        const result = await api.verifyOtp(email, otp);
        setLoading(false);
        if (result.success) setOtpVerified(true);
        else setError('Incorrect OTP. Please try again.');
    };

    const handleResetPassword = async () => {
        if (!newPassword || newPassword.length < 6) { setError('Password must be at least 6 characters.'); return; }
        if (newPassword !== confirmPassword) { setError('Passwords do not match.'); return; }
        setLoading(true); setError('');
        await api.resetPassword(email, newPassword);
        setLoading(false);
        setStep('resetDone');
    };

    const DEMO_ACCOUNTS = [
        { name: 'Ravi Kumar', email: 'ravi@kavachpay.in', password: 'password123', zone: 'Koramangala' },
        { name: 'Priya Singh', email: 'priya@kavachpay.in', password: 'password123', zone: 'Adyar' }
        ];

    return (
        <div style={{ minHeight: '100vh', backgroundColor: C.bg, fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column' }}>

            {/* Navbar */}
            <div style={{ backgroundColor: C.navy, padding: '14px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <KavachLogo size={28} light />
                <button onClick={onBack} style={{ backgroundColor: 'transparent', color: 'white', border: '1px solid rgba(255,255,255,0.25)', padding: '6px 14px', borderRadius: 7, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>Back</button>
            </div>

            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 16px' }}>
                <div style={{ width: '100%', maxWidth: 400 }}>

                    {/* ── LOGIN ── */}
                    {step === 'login' && (
                        <div style={{ backgroundColor: C.cardBg, borderRadius: 14, padding: '32px 28px', boxShadow: '0 2px 16px rgba(0,0,0,0.08)', border: `1px solid ${C.cardBorder}` }}>
                            <div style={{ marginBottom: 28 }}>
                                <p style={{ color: C.text, fontSize: 22, fontWeight: 800, marginBottom: 4 }}>Welcome back</p>
                                <p style={{ color: C.textMuted, fontSize: 14 }}>Sign in to your KavachPay account</p>
                            </div>

                            <div style={{ marginBottom: 16 }}>
                                {label('Email Address')}
                                <input type="email" placeholder="your@email.com" value={email}
                                    onChange={e => { setEmail(e.target.value); setError(''); }}
                                    onKeyDown={e => e.key === 'Enter' && handleLogin()}
                                    style={iStyle(error)}
                                    onFocus={e => e.target.style.borderColor = C.accentBorder}
                                    onBlur={e => e.target.style.borderColor = error ? C.redBorder : C.cardBorder} />
                            </div>

                            <div style={{ marginBottom: 8 }}>
                                {label('Password')}
                                <div style={{ position: 'relative' }}>
                                    <input type={showPassword ? 'text' : 'password'} placeholder="Your password"
                                        value={password} onChange={e => { setPassword(e.target.value); setError(''); }}
                                        onKeyDown={e => e.key === 'Enter' && handleLogin()}
                                        style={{ ...iStyle(error), paddingRight: 60 }}
                                        onFocus={e => e.target.style.borderColor = C.accentBorder}
                                        onBlur={e => e.target.style.borderColor = error ? C.redBorder : C.cardBorder} />
                                    <button onClick={() => setShowPassword(!showPassword)}
                                        style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: C.textMuted, fontSize: 12, fontWeight: 600 }}>
                                        {showPassword ? 'Hide' : 'Show'}
                                    </button>
                                </div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 20 }}>
                                <button onClick={() => { setStep('forgot'); setError(''); }}
                                    style={{ background: 'none', border: 'none', color: C.accent, fontSize: 13, cursor: 'pointer', fontWeight: 600 }}>
                                    Forgot password?
                                </button>
                            </div>

                            {error && (
                                <div style={{ backgroundColor: C.redLight, border: `1px solid ${C.redBorder}`, borderRadius: 8, padding: '9px 12px', marginBottom: 16 }}>
                                    <p style={{ color: C.red, fontSize: 13 }}>{error}</p>
                                </div>
                            )}

                            <button onClick={handleLogin} disabled={loading}
                                style={{ width: '100%', backgroundColor: C.navy, color: 'white', padding: 13, borderRadius: 8, border: 'none', fontSize: 15, fontWeight: 700, cursor: loading ? 'default' : 'pointer', opacity: loading ? 0.7 : 1, marginBottom: 16 }}>
                                {loading ? 'Signing in...' : 'Sign In'}
                            </button>

                            <p style={{ textAlign: 'center', color: C.textMuted, fontSize: 13 }}>
                                Don't have an account?{' '}
                                <button onClick={onSignup} style={{ background: 'none', border: 'none', color: C.accent, fontSize: 13, cursor: 'pointer', fontWeight: 600 }}>Get covered now</button>
                            </p>

                            {/* Demo Accounts */}
                            <div style={{ marginTop: 24, borderTop: `1px solid ${C.cardBorder}`, paddingTop: 20 }}>
                                <p style={{ color: C.textMuted, fontSize: 11, fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 12 }}>Demo Accounts</p>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                    {DEMO_ACCOUNTS.map((acc, i) => (
                                        <button key={i} onClick={() => { setEmail(acc.email); setPassword(acc.password); setError(''); }}
                                            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', backgroundColor: C.bg, border: `1px solid ${C.cardBorder}`, borderRadius: 8, cursor: 'pointer', transition: 'all 0.15s ease', fontFamily: 'Inter, sans-serif' }}
                                            onMouseEnter={e => { e.currentTarget.style.backgroundColor = C.accentLight; e.currentTarget.style.borderColor = C.accentBorder; }}
                                            onMouseLeave={e => { e.currentTarget.style.backgroundColor = C.bg; e.currentTarget.style.borderColor = C.cardBorder; }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                <div style={{ width: 30, height: 30, borderRadius: '50%', backgroundColor: C.navy, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <p style={{ color: 'white', fontWeight: 700, fontSize: 12 }}>{acc.name[0]}</p>
                                                </div>
                                                <div style={{ textAlign: 'left' }}>
                                                    <p style={{ color: C.text, fontWeight: 600, fontSize: 13 }}>{acc.name}</p>
                                                    <p style={{ color: C.textMuted, fontSize: 11 }}>{acc.zone}</p>
                                                </div>
                                            </div>
                                            <p style={{ color: C.accent, fontSize: 12, fontWeight: 600 }}>Fill →</p>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── FORGOT PASSWORD ── */}
                    {step === 'forgot' && (
                        <div style={{ backgroundColor: C.cardBg, borderRadius: 14, padding: '32px 28px', boxShadow: '0 2px 16px rgba(0,0,0,0.08)', border: `1px solid ${C.cardBorder}` }}>
                            <button onClick={() => { setStep('login'); setError(''); setOtpSent(false); setOtpVerified(false); setOtp(''); }}
                                style={{ background: 'none', border: 'none', color: C.textMuted, fontSize: 13, cursor: 'pointer', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 6 }}>
                                ← Back to login
                            </button>
                            <p style={{ color: C.text, fontSize: 20, fontWeight: 800, marginBottom: 4 }}>Reset Password</p>
                            <p style={{ color: C.textMuted, fontSize: 14, marginBottom: 24 }}>
                                {!otpSent ? 'Enter your registered email address.' : !otpVerified ? `OTP sent to ${email}. Enter below.` : 'Create your new password.'}
                            </p>

                            {!otpSent && (
                                <div>
                                    <div style={{ marginBottom: 16 }}>
                                        {label('Email Address')}
                                        <input type="email" placeholder="your@email.com" value={email}
                                            onChange={e => { setEmail(e.target.value); setError(''); }}
                                            style={iStyle(error)}
                                            onFocus={e => e.target.style.borderColor = C.accentBorder}
                                            onBlur={e => e.target.style.borderColor = error ? C.redBorder : C.cardBorder} />
                                    </div>
                                    {error && <div style={{ backgroundColor: C.redLight, border: `1px solid ${C.redBorder}`, borderRadius: 8, padding: '9px 12px', marginBottom: 14 }}><p style={{ color: C.red, fontSize: 13 }}>{error}</p></div>}
                                    <button onClick={handleSendOtp} disabled={loading}
                                        style={{ width: '100%', backgroundColor: C.navy, color: 'white', padding: 13, borderRadius: 8, border: 'none', fontSize: 14, fontWeight: 700, cursor: 'pointer', opacity: loading ? 0.7 : 1 }}>
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
                                            onFocus={e => e.target.style.borderColor = C.accentBorder}
                                            onBlur={e => e.target.style.borderColor = error ? C.redBorder : C.cardBorder} />
                                        <p style={{ color: C.textMuted, fontSize: 11, marginTop: 5 }}>Demo OTP: 1234</p>
                                    </div>
                                    {error && <div style={{ backgroundColor: C.redLight, border: `1px solid ${C.redBorder}`, borderRadius: 8, padding: '9px 12px', marginBottom: 14 }}><p style={{ color: C.red, fontSize: 13 }}>{error}</p></div>}
                                    <button onClick={handleVerifyOtp} disabled={loading}
                                        style={{ width: '100%', backgroundColor: C.navy, color: 'white', padding: 13, borderRadius: 8, border: 'none', fontSize: 14, fontWeight: 700, cursor: 'pointer', marginBottom: 10, opacity: loading ? 0.7 : 1 }}>
                                        {loading ? 'Verifying...' : 'Verify OTP'}
                                    </button>
                                    <button onClick={handleSendOtp} style={{ width: '100%', background: 'none', border: `1px solid ${C.cardBorder}`, borderRadius: 8, padding: 11, fontSize: 13, color: C.textMuted, cursor: 'pointer' }}>
                                        Resend OTP
                                    </button>
                                </div>
                            )}

                            {otpVerified && (
                                <div>
                                    <div style={{ backgroundColor: C.greenLight, border: `1px solid ${C.greenBorder}`, borderRadius: 8, padding: '9px 12px', marginBottom: 18 }}>
                                        <p style={{ color: C.green, fontSize: 13, fontWeight: 600 }}>OTP verified successfully.</p>
                                    </div>
                                    <div style={{ marginBottom: 14 }}>
                                        {label('New Password')}
                                        <input type="password" placeholder="Minimum 6 characters" value={newPassword}
                                            onChange={e => { setNewPassword(e.target.value); setError(''); }}
                                            style={iStyle(error)}
                                            onFocus={e => e.target.style.borderColor = C.accentBorder}
                                            onBlur={e => e.target.style.borderColor = error ? C.redBorder : C.cardBorder} />
                                    </div>
                                    <div style={{ marginBottom: 16 }}>
                                        {label('Confirm Password')}
                                        <input type="password" placeholder="Re-enter password" value={confirmPassword}
                                            onChange={e => { setConfirmPassword(e.target.value); setError(''); }}
                                            style={iStyle(error)}
                                            onFocus={e => e.target.style.borderColor = C.accentBorder}
                                            onBlur={e => e.target.style.borderColor = error ? C.redBorder : C.cardBorder} />
                                    </div>
                                    {error && <div style={{ backgroundColor: C.redLight, border: `1px solid ${C.redBorder}`, borderRadius: 8, padding: '9px 12px', marginBottom: 14 }}><p style={{ color: C.red, fontSize: 13 }}>{error}</p></div>}
                                    <button onClick={handleResetPassword} disabled={loading}
                                        style={{ width: '100%', backgroundColor: C.navy, color: 'white', padding: 13, borderRadius: 8, border: 'none', fontSize: 14, fontWeight: 700, cursor: 'pointer', opacity: loading ? 0.7 : 1 }}>
                                        {loading ? 'Resetting...' : 'Reset Password'}
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ── RESET DONE ── */}
                    {step === 'resetDone' && (
                        <div style={{ backgroundColor: C.cardBg, borderRadius: 14, padding: '40px 28px', boxShadow: '0 2px 16px rgba(0,0,0,0.08)', border: `1px solid ${C.cardBorder}`, textAlign: 'center' }}>
                            <div style={{ width: 60, height: 60, borderRadius: '50%', backgroundColor: C.greenLight, border: `3px solid ${C.greenBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={C.green} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                            </div>
                            <p style={{ color: C.text, fontWeight: 800, fontSize: 18, marginBottom: 6 }}>Password Reset</p>
                            <p style={{ color: C.textMuted, fontSize: 14, marginBottom: 24 }}>Your password has been updated successfully.</p>
                            <button onClick={() => { setStep('login'); setOtpSent(false); setOtpVerified(false); setOtp(''); setNewPassword(''); setConfirmPassword(''); }}
                                style={{ width: '100%', backgroundColor: C.navy, color: 'white', padding: 13, borderRadius: 8, border: 'none', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
                                Back to Sign In
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}