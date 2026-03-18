import React, { useState } from 'react';

const DEMO_USERS = [
    { email: 'ravi@kavachpay.in', password: 'ravi123', name: 'Ravi Kumar', phone: '9876543210', age: 26, zone: 'Koramangala, Bangalore', platform: 'Swiggy', employeeId: 'SWG-2847361', premium: 59, coverage: 1200, avgIncome: 1800, avgDeliveries: 127, monthsActive: 14 },
    { email: 'priya@kavachpay.in', password: 'priya123', name: 'Priya Singh', phone: '9845612370', age: 24, zone: 'Adyar, Chennai', platform: 'Zomato', employeeId: 'ZOM-1923847', premium: 74, coverage: 1560, avgIncome: 2140, avgDeliveries: 143, monthsActive: 8 },
    { email: 'mohammed@kavachpay.in', password: 'mohammed123', name: 'Mohammed Arif', phone: '9823456710', age: 29, zone: 'Dharavi, Mumbai', platform: 'Zepto', employeeId: 'ZPT-3847261', premium: 74, coverage: 1560, avgIncome: 1920, avgDeliveries: 112, monthsActive: 22 },
];

const FORGOT_OTP = '1234';

export default function Login({ onLogin, onBack, onSignup }) {
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
        if (!email || !password) { setError('Please enter both email and password.'); return; }
        setLoading(true); setError('');
        setTimeout(() => {
            const user = DEMO_USERS.find(u => u.email === email.toLowerCase() && u.password === password);
            if (user) { onLogin(user); }
            else { setError('Invalid email or password. Please check your credentials and try again.'); setLoading(false); }
        }, 1000);
    };

    const handleForgotSubmit = () => {
        if (!forgotEmail) { setForgotError('Please enter your email address.'); return; }
        if (!/\S+@\S+\.\S+/.test(forgotEmail)) { setForgotError('Please enter a valid email address.'); return; }
        setForgotError('');
        setLoading(true);
        setTimeout(() => { setLoading(false); setScreen('otp'); }, 1200);
    };

    const handleOtpChange = (index, value) => {
        if (value.length > 1) return;
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);
        setOtpError('');
        if (value && index < 3) {
            document.getElementById(`otp-${index + 1}`)?.focus();
        }
    };

    const handleOtpVerify = () => {
        const enteredOtp = otp.join('');
        if (enteredOtp.length < 4) { setOtpError('Please enter the complete 4-digit OTP.'); return; }
        if (enteredOtp !== FORGOT_OTP) { setOtpError('Incorrect OTP. Please try again.'); return; }
        setOtpError('');
        setScreen('reset');
    };

    const handleReset = () => {
        if (!newPassword || newPassword.length < 6) { setResetError('Password must be at least 6 characters.'); return; }
        if (newPassword !== confirmNewPassword) { setResetError('Passwords do not match.'); return; }
        setResetError('');
        setLoading(true);
        setTimeout(() => { setLoading(false); setScreen('success'); }, 1000);
    };

    const fillDemo = (user) => { setEmail(user.email); setPassword(user.password); setError(''); };

    const inputStyle = {
        width: '100%', padding: '12px 14px', borderRadius: '10px',
        border: '1.5px solid #E5E7EB', fontSize: '14px',
        boxSizing: 'border-box', fontFamily: 'Arial', outline: 'none', color: '#374151'
    };

    const labelStyle = {
        display: 'block', color: '#374151', fontWeight: '600',
        fontSize: '13px', marginBottom: '7px', letterSpacing: '0.2px'
    };

    // LOGIN SCREEN
    if (screen === 'login') return (
        <div style={{ backgroundColor: '#F4F6F9', minHeight: '100vh', fontFamily: 'Arial' }}>
            <div style={{ backgroundColor: '#1A56A0', padding: '14px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1 style={{ color: 'white', fontSize: '18px', fontWeight: 'bold', letterSpacing: '0.3px' }}>KavachPay</h1>
                <button onClick={onBack} style={{ backgroundColor: 'transparent', color: 'white', border: '1px solid rgba(255,255,255,0.3)', padding: '6px 14px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px' }}>Back to Home</button>
            </div>

            <div style={{ padding: '48px 20px', maxWidth: '420px', margin: '0 auto' }}>
                <div style={{ textAlign: 'center', marginBottom: '36px' }}>
                    <div style={{ width: '56px', height: '56px', borderRadius: '14px', backgroundColor: '#1A56A0', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', boxShadow: '0 4px 16px rgba(26,86,160,0.25)' }}>
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                    </div>
                    <h2 style={{ color: '#1A1A2E', fontSize: '24px', fontWeight: 'bold', marginBottom: '6px' }}>Welcome Back</h2>
                    <p style={{ color: '#9CA3AF', fontSize: '14px' }}>Sign in to access your KavachPay policy</p>
                </div>

                <div style={{ backgroundColor: 'white', borderRadius: '20px', padding: '28px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', marginBottom: '16px', border: '1px solid #E5E7EB' }}>
                    <div style={{ marginBottom: '16px' }}>
                        <label style={labelStyle}>Email Address</label>
                        <input type="email" placeholder="your@email.com" value={email}
                            onChange={e => { setEmail(e.target.value); setError(''); }}
                            onKeyDown={e => e.key === 'Enter' && handleLogin()}
                            style={inputStyle} />
                    </div>

                    <div style={{ marginBottom: '8px' }}>
                        <label style={labelStyle}>Password</label>
                        <div style={{ position: 'relative' }}>
                            <input type={showPassword ? 'text' : 'password'} placeholder="Enter your password" value={password}
                                onChange={e => { setPassword(e.target.value); setError(''); }}
                                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                                style={{ ...inputStyle, paddingRight: '60px' }} />
                            <button onClick={() => setShowPassword(!showPassword)}
                                style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', fontSize: '13px' }}>
                                {showPassword ? 'Hide' : 'Show'}
                            </button>
                        </div>
                    </div>

                    <div style={{ textAlign: 'right', marginBottom: '20px' }}>
                        <span onClick={() => { setScreen('forgot'); setForgotEmail(''); setForgotError(''); }}
                            style={{ color: '#1A56A0', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
                            Forgot password?
                        </span>
                    </div>

                    {error && (
                        <div style={{ backgroundColor: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '10px', padding: '12px 14px', marginBottom: '16px' }}>
                            <p style={{ color: '#DC2626', fontSize: '13px', margin: 0 }}>{error}</p>
                        </div>
                    )}

                    <button onClick={handleLogin} disabled={loading}
                        style={{ width: '100%', backgroundColor: loading ? '#93B4D9' : '#1A56A0', color: 'white', padding: '14px', borderRadius: '10px', border: 'none', fontSize: '15px', fontWeight: 'bold', cursor: loading ? 'default' : 'pointer', letterSpacing: '0.3px' }}>
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>

                    <p style={{ textAlign: 'center', color: '#9CA3AF', fontSize: '13px', marginTop: '16px', marginBottom: 0 }}>
                        New to KavachPay?{' '}
                        <span onClick={onSignup} style={{ color: '#1A56A0', fontWeight: 'bold', cursor: 'pointer' }}>Enroll Now</span>
                    </p>
                </div>

                <div style={{ backgroundColor: '#EEF4FF', borderRadius: '16px', padding: '16px', border: '1px solid #C7D9F8' }}>
                    <p style={{ color: '#1A56A0', fontWeight: 'bold', fontSize: '12px', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Demo Accounts</p>
                    {DEMO_USERS.map((u, i) => (
                        <div key={i} onClick={() => fillDemo(u)}
                            style={{ backgroundColor: 'white', borderRadius: '10px', padding: '10px 14px', marginBottom: i < 2 ? '8px' : '0', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: email === u.email ? '2px solid #1A56A0' : '2px solid transparent' }}>
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

    // FORGOT PASSWORD SCREEN
    if (screen === 'forgot') return (
        <div style={{ backgroundColor: '#F4F6F9', minHeight: '100vh', fontFamily: 'Arial' }}>
            <div style={{ backgroundColor: '#1A56A0', padding: '14px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1 style={{ color: 'white', fontSize: '18px', fontWeight: 'bold' }}>KavachPay</h1>
                <button onClick={() => { setScreen('login'); setForgotEmail(''); setForgotError(''); }}
                    style={{ backgroundColor: 'transparent', color: 'white', border: '1px solid rgba(255,255,255,0.3)', padding: '6px 14px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px' }}>
                    Back to Login
                </button>
            </div>

            <div style={{ padding: '48px 20px', maxWidth: '420px', margin: '0 auto' }}>
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <div style={{ width: '56px', height: '56px', borderRadius: '14px', backgroundColor: '#EEF4FF', border: '2px solid #DBEAFE', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#1A56A0" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                    </div>
                    <h2 style={{ color: '#1A1A2E', fontSize: '22px', fontWeight: 'bold', marginBottom: '6px' }}>Forgot Password</h2>
                    <p style={{ color: '#9CA3AF', fontSize: '14px' }}>Enter your registered email and we will send you an OTP</p>
                </div>

                <div style={{ backgroundColor: 'white', borderRadius: '20px', padding: '28px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', border: '1px solid #E5E7EB' }}>
                    <div style={{ marginBottom: '20px' }}>
                        <label style={labelStyle}>Email Address</label>
                        <input type="email" placeholder="your@email.com" value={forgotEmail}
                            onChange={e => { setForgotEmail(e.target.value); setForgotError(''); }}
                            onKeyDown={e => e.key === 'Enter' && handleForgotSubmit()}
                            style={{ ...inputStyle, border: `1.5px solid ${forgotError ? '#FECACA' : '#E5E7EB'}` }} />
                        {forgotError && <p style={{ color: '#DC2626', fontSize: '12px', marginTop: '6px' }}>{forgotError}</p>}
                    </div>

                    <button onClick={handleForgotSubmit} disabled={loading}
                        style={{ width: '100%', backgroundColor: loading ? '#93B4D9' : '#1A56A0', color: 'white', padding: '14px', borderRadius: '10px', border: 'none', fontSize: '15px', fontWeight: 'bold', cursor: loading ? 'default' : 'pointer' }}>
                        {loading ? 'Sending OTP...' : 'Send OTP'}
                    </button>
                </div>
            </div>
        </div>
    );

    // OTP SCREEN
    if (screen === 'otp') return (
        <div style={{ backgroundColor: '#F4F6F9', minHeight: '100vh', fontFamily: 'Arial' }}>
            <div style={{ backgroundColor: '#1A56A0', padding: '14px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1 style={{ color: 'white', fontSize: '18px', fontWeight: 'bold' }}>KavachPay</h1>
                <button onClick={() => { setScreen('forgot'); setOtp(['', '', '', '']); setOtpError(''); }}
                    style={{ backgroundColor: 'transparent', color: 'white', border: '1px solid rgba(255,255,255,0.3)', padding: '6px 14px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px' }}>
                    Back
                </button>
            </div>

            <div style={{ padding: '48px 20px', maxWidth: '420px', margin: '0 auto' }}>
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <div style={{ width: '56px', height: '56px', borderRadius: '14px', backgroundColor: '#EEF4FF', border: '2px solid #DBEAFE', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#1A56A0" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.62 3.41 2 2 0 0 1 3.6 1.22h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.91a16 16 0 0 0 6 6l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.73 16.92z" /></svg>
                    </div>
                    <h2 style={{ color: '#1A1A2E', fontSize: '22px', fontWeight: 'bold', marginBottom: '6px' }}>Enter OTP</h2>
                    <p style={{ color: '#9CA3AF', fontSize: '14px' }}>
                        A 4-digit OTP has been sent to<br />
                        <span style={{ color: '#374151', fontWeight: '600' }}>{forgotEmail}</span>
                    </p>
                </div>

                <div style={{ backgroundColor: 'white', borderRadius: '20px', padding: '28px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', border: '1px solid #E5E7EB' }}>
                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginBottom: '24px' }}>
                        {otp.map((digit, index) => (
                            <input
                                key={index}
                                id={`otp-${index}`}
                                type="text"
                                inputMode="numeric"
                                maxLength={1}
                                value={digit}
                                onChange={e => handleOtpChange(index, e.target.value)}
                                onKeyDown={e => {
                                    if (e.key === 'Backspace' && !otp[index] && index > 0) {
                                        document.getElementById(`otp-${index - 1}`)?.focus();
                                    }
                                }}
                                style={{
                                    width: '56px', height: '56px', textAlign: 'center',
                                    fontSize: '22px', fontWeight: 'bold',
                                    borderRadius: '12px', border: `2px solid ${digit ? '#1A56A0' : '#E5E7EB'}`,
                                    outline: 'none', fontFamily: 'Arial', color: '#1A56A0',
                                    backgroundColor: digit ? '#EEF4FF' : 'white'
                                }}
                            />
                        ))}
                    </div>

                    {otpError && (
                        <div style={{ backgroundColor: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '10px', padding: '10px 14px', marginBottom: '16px' }}>
                            <p style={{ color: '#DC2626', fontSize: '13px', margin: 0 }}>{otpError}</p>
                        </div>
                    )}

                    <button onClick={handleOtpVerify}
                        style={{ width: '100%', backgroundColor: '#1A56A0', color: 'white', padding: '14px', borderRadius: '10px', border: 'none', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer', marginBottom: '16px' }}>
                        Verify OTP
                    </button>

                    <p style={{ textAlign: 'center', color: '#9CA3AF', fontSize: '13px' }}>
                        Did not receive?{' '}
                        <span onClick={() => setOtp(['', '', '', ''])}
                            style={{ color: '#1A56A0', fontWeight: '600', cursor: 'pointer' }}>
                            Resend OTP
                        </span>
                    </p>
                </div>
            </div>
        </div>
    );

    // RESET PASSWORD SCREEN
    if (screen === 'reset') return (
        <div style={{ backgroundColor: '#F4F6F9', minHeight: '100vh', fontFamily: 'Arial' }}>
            <div style={{ backgroundColor: '#1A56A0', padding: '14px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1 style={{ color: 'white', fontSize: '18px', fontWeight: 'bold' }}>KavachPay</h1>
                <button onClick={() => { setScreen('otp'); setResetError(''); }}
                    style={{ backgroundColor: 'transparent', color: 'white', border: '1px solid rgba(255,255,255,0.3)', padding: '6px 14px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px' }}>
                    Back
                </button>
            </div>

            <div style={{ padding: '48px 20px', maxWidth: '420px', margin: '0 auto' }}>
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <div style={{ width: '56px', height: '56px', borderRadius: '14px', backgroundColor: '#F0FDF4', border: '2px solid #BBF7D0', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#1E7D34" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                    </div>
                    <h2 style={{ color: '#1A1A2E', fontSize: '22px', fontWeight: 'bold', marginBottom: '6px' }}>Set New Password</h2>
                    <p style={{ color: '#9CA3AF', fontSize: '14px' }}>Choose a strong password for your account</p>
                </div>

                <div style={{ backgroundColor: 'white', borderRadius: '20px', padding: '28px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', border: '1px solid #E5E7EB' }}>
                    <div style={{ marginBottom: '16px' }}>
                        <label style={labelStyle}>New Password</label>
                        <div style={{ position: 'relative' }}>
                            <input type={showNewPwd ? 'text' : 'password'} placeholder="Minimum 6 characters"
                                value={newPassword}
                                onChange={e => { setNewPassword(e.target.value); setResetError(''); }}
                                style={{ ...inputStyle, paddingRight: '60px' }} />
                            <button onClick={() => setShowNewPwd(!showNewPwd)}
                                style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', fontSize: '13px' }}>
                                {showNewPwd ? 'Hide' : 'Show'}
                            </button>
                        </div>
                    </div>

                    <div style={{ marginBottom: '24px' }}>
                        <label style={labelStyle}>Confirm New Password</label>
                        <input type="password" placeholder="Re-enter new password"
                            value={confirmNewPassword}
                            onChange={e => { setConfirmNewPassword(e.target.value); setResetError(''); }}
                            style={inputStyle} />
                        {confirmNewPassword && newPassword === confirmNewPassword && (
                            <p style={{ color: '#1E7D34', fontSize: '12px', marginTop: '5px', fontWeight: '600' }}>Passwords match</p>
                        )}
                    </div>

                    {resetError && (
                        <div style={{ backgroundColor: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '10px', padding: '10px 14px', marginBottom: '16px' }}>
                            <p style={{ color: '#DC2626', fontSize: '13px', margin: 0 }}>{resetError}</p>
                        </div>
                    )}

                    <button onClick={handleReset} disabled={loading}
                        style={{ width: '100%', backgroundColor: loading ? '#93B4D9' : '#1A56A0', color: 'white', padding: '14px', borderRadius: '10px', border: 'none', fontSize: '15px', fontWeight: 'bold', cursor: loading ? 'default' : 'pointer' }}>
                        {loading ? 'Updating...' : 'Update Password'}
                    </button>
                </div>
            </div>
        </div>
    );

    // SUCCESS SCREEN
    if (screen === 'success') return (
        <div style={{ backgroundColor: '#F4F6F9', minHeight: '100vh', fontFamily: 'Arial', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ textAlign: 'center', padding: '40px 20px', maxWidth: '380px' }}>
                <div style={{ width: '72px', height: '72px', borderRadius: '50%', backgroundColor: '#F0FDF4', border: '3px solid #BBF7D0', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: '0 4px 20px rgba(30,125,52,0.15)' }}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#1E7D34" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                </div>
                <h2 style={{ color: '#1A1A2E', fontSize: '24px', fontWeight: 'bold', marginBottom: '10px' }}>Password Updated</h2>
                <p style={{ color: '#9CA3AF', fontSize: '14px', marginBottom: '32px', lineHeight: 1.6 }}>
                    Your password has been reset successfully. You can now sign in with your new password.
                </p>
                <button onClick={() => { setScreen('login'); setEmail(''); setPassword(''); setOtp(['', '', '', '']); setNewPassword(''); setConfirmNewPassword(''); }}
                    style={{ width: '100%', backgroundColor: '#1A56A0', color: 'white', padding: '14px', borderRadius: '10px', border: 'none', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer' }}>
                    Back to Sign In
                </button>
            </div>
        </div>
    );
}