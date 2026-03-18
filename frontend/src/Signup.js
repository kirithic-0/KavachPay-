import React, { useState } from 'react';

const ZONE_PREMIUM = {
    'Adyar, Chennai': { premium: 74, risk: 'high' },
    'Velachery, Chennai': { premium: 74, risk: 'high' },
    'Tambaram, Chennai': { premium: 64, risk: 'medium' },
    'Anna Nagar, Chennai': { premium: 49, risk: 'low' },
    'T Nagar, Chennai': { premium: 59, risk: 'medium' },
    'Porur, Chennai': { premium: 59, risk: 'medium' },
    'Sholinganallur, Chennai': { premium: 64, risk: 'medium' },
    'Perambur, Chennai': { premium: 59, risk: 'medium' },
    'Dharavi, Mumbai': { premium: 74, risk: 'high' },
    'Kurla, Mumbai': { premium: 74, risk: 'high' },
    'Andheri, Mumbai': { premium: 59, risk: 'medium' },
    'Bandra West, Mumbai': { premium: 59, risk: 'medium' },
    'Powai, Mumbai': { premium: 49, risk: 'low' },
    'Borivali, Mumbai': { premium: 59, risk: 'medium' },
    'Thane, Mumbai': { premium: 64, risk: 'medium' },
    'Navi Mumbai': { premium: 59, risk: 'medium' },
    'Koramangala, Bangalore': { premium: 59, risk: 'medium' },
    'Whitefield, Bangalore': { premium: 49, risk: 'low' },
    'HSR Layout, Bangalore': { premium: 49, risk: 'low' },
    'Indiranagar, Bangalore': { premium: 49, risk: 'low' },
    'Marathahalli, Bangalore': { premium: 59, risk: 'medium' },
    'Hebbal, Bangalore': { premium: 59, risk: 'medium' },
    'Electronic City, Bangalore': { premium: 49, risk: 'low' },
    'JP Nagar, Bangalore': { premium: 49, risk: 'low' },
    'Connaught Place, Delhi': { premium: 59, risk: 'medium' },
    'Lajpat Nagar, Delhi': { premium: 59, risk: 'medium' },
    'Dwarka, Delhi': { premium: 64, risk: 'medium' },
    'Rohini, Delhi': { premium: 64, risk: 'medium' },
    'Noida Sector 18': { premium: 49, risk: 'low' },
    'Noida Sector 62': { premium: 49, risk: 'low' },
    'Gurgaon Cyber City': { premium: 49, risk: 'low' },
    'Gurgaon Sohna Road': { premium: 59, risk: 'medium' },
    'Faridabad': { premium: 64, risk: 'medium' },
    'Banjara Hills, Hyderabad': { premium: 49, risk: 'low' },
    'Jubilee Hills, Hyderabad': { premium: 49, risk: 'low' },
    'Secunderabad': { premium: 59, risk: 'medium' },
    'Madhapur, Hyderabad': { premium: 49, risk: 'low' },
    'Kukatpally, Hyderabad': { premium: 59, risk: 'medium' },
    'LB Nagar, Hyderabad': { premium: 64, risk: 'medium' },
    'Kothrud, Pune': { premium: 49, risk: 'low' },
    'Hinjewadi, Pune': { premium: 49, risk: 'low' },
    'Wakad, Pune': { premium: 49, risk: 'low' },
    'Viman Nagar, Pune': { premium: 49, risk: 'low' },
    'Hadapsar, Pune': { premium: 59, risk: 'medium' },
    'Pimpri Chinchwad': { premium: 59, risk: 'medium' },
    'Salt Lake, Kolkata': { premium: 74, risk: 'high' },
    'Park Street, Kolkata': { premium: 74, risk: 'high' },
    'Howrah': { premium: 74, risk: 'high' },
    'Dum Dum, Kolkata': { premium: 64, risk: 'medium' },
    'Newtown, Kolkata': { premium: 59, risk: 'medium' },
    'Navrangpura, Ahmedabad': { premium: 59, risk: 'medium' },
    'Satellite, Ahmedabad': { premium: 49, risk: 'low' },
    'Bopal, Ahmedabad': { premium: 49, risk: 'low' },
    'Maninagar, Ahmedabad': { premium: 64, risk: 'medium' },
    'Coimbatore': { premium: 59, risk: 'medium' },
    'Mysuru': { premium: 49, risk: 'low' },
    'Nagpur': { premium: 59, risk: 'medium' },
    'Surat': { premium: 64, risk: 'medium' },
    'Vizag': { premium: 59, risk: 'medium' },
    'Indore': { premium: 59, risk: 'medium' },
    'Bhopal': { premium: 59, risk: 'medium' },
    'Ludhiana': { premium: 59, risk: 'medium' },
    'Jaipur': { premium: 64, risk: 'medium' },
    'Kochi': { premium: 64, risk: 'medium' },
    'Other': { premium: 59, risk: 'medium' },
};

const PLATFORM_DATA = {
    Zomato: { prefix: 'ZOM', color: '#E23744', deliveries: [95, 127, 143, 112, 138], income: [1680, 2140, 2380, 1920, 2260] },
    Swiggy: { prefix: 'SWG', color: '#FC8019', deliveries: [88, 119, 134, 108, 125], income: [1540, 2020, 2260, 1840, 2100] },
};

const PaymentModal = ({ premium, name, onSuccess, onClose }) => {
    const [paymentStep, setPaymentStep] = useState('select'); // select | processing | success
    const [selectedMethod, setSelectedMethod] = useState('upi');
    const [upiId, setUpiId] = useState('');
    const [upiError, setUpiError] = useState('');

    const handlePay = () => {
        if (selectedMethod === 'upi' && !upiId) {
            setUpiError('Please enter your UPI ID'); return;
        }
        if (selectedMethod === 'upi' && !upiId.includes('@')) {
            setUpiError('Enter a valid UPI ID (e.g. ravi@upi)'); return;
        }
        setUpiError('');
        setPaymentStep('processing');
        setTimeout(() => setPaymentStep('success'), 2500);
    };

    return (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 2000, fontFamily: 'Arial' }}>
            <div style={{ backgroundColor: 'white', borderRadius: '24px 24px 0 0', width: '100%', maxWidth: '480px', padding: '24px', boxShadow: '0 -8px 40px rgba(0,0,0,0.2)' }}>

                {/* Payment Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#072654', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <p style={{ color: '#3395FF', fontWeight: 'bold', fontSize: '12px' }}>R</p>
                        </div>
                        <div>
                            <p style={{ color: '#072654', fontWeight: 'bold', fontSize: '14px' }}>Razorpay</p>
                            <p style={{ color: '#9CA3AF', fontSize: '11px' }}>Secured Payment</p>
                        </div>
                    </div>
                    {paymentStep !== 'processing' && paymentStep !== 'success' && (
                        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', fontSize: '20px' }}>✕</button>
                    )}
                </div>

                {/* Amount */}
                <div style={{ backgroundColor: '#F9FAFB', borderRadius: '12px', padding: '16px', marginBottom: '20px', border: '1px solid #E5E7EB', textAlign: 'center' }}>
                    <p style={{ color: '#6B7280', fontSize: '12px', marginBottom: '4px', letterSpacing: '0.3px' }}>WEEKLY PREMIUM — KAVACHPAY</p>
                    <p style={{ color: '#072654', fontWeight: 'bold', fontSize: '28px' }}>₹{premium}</p>
                    <p style={{ color: '#9CA3AF', fontSize: '12px', marginTop: '4px' }}>Policyholder: {name}</p>
                </div>

                {/* SELECT PAYMENT METHOD */}
                {paymentStep === 'select' && (
                    <div>
                        <p style={{ color: '#374151', fontWeight: 'bold', fontSize: '13px', marginBottom: '12px', letterSpacing: '0.2px' }}>Select Payment Method</p>

                        {/* UPI */}
                        <div onClick={() => setSelectedMethod('upi')}
                            style={{ border: `2px solid ${selectedMethod === 'upi' ? '#3395FF' : '#E5E7EB'}`, borderRadius: '12px', padding: '14px 16px', marginBottom: '10px', cursor: 'pointer', backgroundColor: selectedMethod === 'upi' ? '#EEF4FF' : 'white' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: selectedMethod === 'upi' ? '12px' : '0' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <p style={{ fontSize: '14px' }}>📱</p>
                                    </div>
                                    <div>
                                        <p style={{ color: '#374151', fontWeight: '600', fontSize: '13px' }}>UPI</p>
                                        <p style={{ color: '#9CA3AF', fontSize: '11px' }}>GPay, PhonePe, Paytm</p>
                                    </div>
                                </div>
                                <div style={{ width: '18px', height: '18px', borderRadius: '50%', border: `2px solid ${selectedMethod === 'upi' ? '#3395FF' : '#D1D5DB'}`, backgroundColor: selectedMethod === 'upi' ? '#3395FF' : 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    {selectedMethod === 'upi' && <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'white' }} />}
                                </div>
                            </div>
                            {selectedMethod === 'upi' && (
                                <div>
                                    <input type="text" placeholder="Enter UPI ID (e.g. ravi@upi)" value={upiId} onChange={e => { setUpiId(e.target.value); setUpiError(''); }}
                                        style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: `1.5px solid ${upiError ? '#FECACA' : '#E5E7EB'}`, fontSize: '13px', boxSizing: 'border-box', fontFamily: 'Arial', outline: 'none' }} />
                                    {upiError && <p style={{ color: '#DC2626', fontSize: '12px', marginTop: '4px' }}>{upiError}</p>}
                                </div>
                            )}
                        </div>

                        {/* Card */}
                        <div onClick={() => setSelectedMethod('card')}
                            style={{ border: `2px solid ${selectedMethod === 'card' ? '#3395FF' : '#E5E7EB'}`, borderRadius: '12px', padding: '14px 16px', marginBottom: '10px', cursor: 'pointer', backgroundColor: selectedMethod === 'card' ? '#EEF4FF' : 'white' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#EEF4FF', border: '1px solid #DBEAFE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <p style={{ fontSize: '14px' }}>💳</p>
                                    </div>
                                    <div>
                                        <p style={{ color: '#374151', fontWeight: '600', fontSize: '13px' }}>Debit / Credit Card</p>
                                        <p style={{ color: '#9CA3AF', fontSize: '11px' }}>Visa, Mastercard, RuPay</p>
                                    </div>
                                </div>
                                <div style={{ width: '18px', height: '18px', borderRadius: '50%', border: `2px solid ${selectedMethod === 'card' ? '#3395FF' : '#D1D5DB'}`, backgroundColor: selectedMethod === 'card' ? '#3395FF' : 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    {selectedMethod === 'card' && <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'white' }} />}
                                </div>
                            </div>
                        </div>

                        {/* Net Banking */}
                        <div onClick={() => setSelectedMethod('netbanking')}
                            style={{ border: `2px solid ${selectedMethod === 'netbanking' ? '#3395FF' : '#E5E7EB'}`, borderRadius: '12px', padding: '14px 16px', marginBottom: '20px', cursor: 'pointer', backgroundColor: selectedMethod === 'netbanking' ? '#EEF4FF' : 'white' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#FFFBEB', border: '1px solid #FDE68A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <p style={{ fontSize: '14px' }}>🏦</p>
                                    </div>
                                    <div>
                                        <p style={{ color: '#374151', fontWeight: '600', fontSize: '13px' }}>Net Banking</p>
                                        <p style={{ color: '#9CA3AF', fontSize: '11px' }}>All major banks supported</p>
                                    </div>
                                </div>
                                <div style={{ width: '18px', height: '18px', borderRadius: '50%', border: `2px solid ${selectedMethod === 'netbanking' ? '#3395FF' : '#D1D5DB'}`, backgroundColor: selectedMethod === 'netbanking' ? '#3395FF' : 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    {selectedMethod === 'netbanking' && <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'white' }} />}
                                </div>
                            </div>
                        </div>

                        <button onClick={handlePay}
                            style={{ width: '100%', backgroundColor: '#3395FF', color: 'white', padding: '15px', borderRadius: '12px', border: 'none', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer', letterSpacing: '0.2px', boxShadow: '0 4px 16px rgba(51,149,255,0.3)' }}>
                            Pay ₹{premium}
                        </button>

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginTop: '12px' }}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                            <p style={{ color: '#9CA3AF', fontSize: '11px' }}>Secured by Razorpay • 256-bit SSL encryption</p>
                        </div>
                    </div>
                )}

                {/* PROCESSING */}
                {paymentStep === 'processing' && (
                    <div style={{ textAlign: 'center', padding: '20px 0' }}>
                        <div style={{ width: '60px', height: '60px', borderRadius: '50%', border: '4px solid #EEF4FF', borderTop: '4px solid #3395FF', margin: '0 auto 20px', animation: 'spin 1s linear infinite' }} />
                        <p style={{ color: '#374151', fontWeight: 'bold', fontSize: '16px', marginBottom: '6px' }}>Processing Payment</p>
                        <p style={{ color: '#9CA3AF', fontSize: '13px', marginBottom: '20px' }}>Please do not close this window...</p>
                        <div style={{ backgroundColor: '#F9FAFB', borderRadius: '10px', padding: '12px', border: '1px solid #E5E7EB' }}>
                            {[
                                { text: 'Connecting to payment gateway', done: true },
                                { text: 'Verifying payment details', done: true },
                                { text: 'Processing transaction', done: false },
                            ].map((s, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '6px 0' }}>
                                    <div style={{ width: '18px', height: '18px', borderRadius: '50%', backgroundColor: s.done ? '#1E7D34' : '#E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        {s.done && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>}
                                    </div>
                                    <p style={{ color: s.done ? '#374151' : '#9CA3AF', fontSize: '12px' }}>{s.text}</p>
                                </div>
                            ))}
                        </div>
                        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                    </div>
                )}

                {/* SUCCESS */}
                {paymentStep === 'success' && (
                    <div style={{ textAlign: 'center', padding: '10px 0' }}>
                        <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#F0FDF4', border: '3px solid #BBF7D0', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', boxShadow: '0 4px 16px rgba(30,125,52,0.15)' }}>
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#1E7D34" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                        </div>
                        <p style={{ color: '#1A1A2E', fontWeight: 'bold', fontSize: '18px', marginBottom: '6px' }}>Payment Successful</p>
                        <p style={{ color: '#9CA3AF', fontSize: '13px', marginBottom: '16px' }}>₹{premium} paid successfully</p>

                        <div style={{ backgroundColor: '#F9FAFB', borderRadius: '12px', padding: '14px', marginBottom: '20px', border: '1px solid #E5E7EB', textAlign: 'left' }}>
                            {[
                                { label: 'Amount Paid', value: '₹' + premium },
                                { label: 'Payment Method', value: selectedMethod === 'upi' ? 'UPI — ' + upiId : selectedMethod === 'card' ? 'Debit/Credit Card' : 'Net Banking' },
                                { label: 'Transaction ID', value: 'pay_' + Math.random().toString(36).substr(2, 10).toUpperCase() },
                                { label: 'Status', value: 'Success' },
                            ].map((item, i) => (
                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: i < 3 ? '1px solid #F3F4F6' : 'none' }}>
                                    <p style={{ color: '#9CA3AF', fontSize: '12px' }}>{item.label}</p>
                                    <p style={{ color: item.label === 'Status' ? '#1E7D34' : '#374151', fontWeight: '600', fontSize: '12px' }}>{item.value}</p>
                                </div>
                            ))}
                        </div>

                        <button onClick={onSuccess}
                            style={{ width: '100%', backgroundColor: '#1A56A0', color: 'white', padding: '14px', borderRadius: '12px', border: 'none', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer' }}>
                            Activate My Policy
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default function Signup({ onComplete, onBack }) {
    const [step, setStep] = useState(1);
    const [form, setForm] = useState({
        name: '', phone: '', age: '', aadhaar: '',
        password: '', confirmPassword: '',
        zone: '', platform: '', employeeId: '', monthsActive: 12
    });
    const [verifying, setVerifying] = useState(false);
    const [verified, setVerified] = useState(false);
    const [linking, setLinking] = useState(false);
    const [linked, setLinked] = useState(false);
    const [linkedData, setLinkedData] = useState(null);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [errors, setErrors] = useState({});
    const [showPayment, setShowPayment] = useState(false);

    const zoneData = ZONE_PREMIUM[form.zone];
    const premium = zoneData?.premium;
    const coverage = premium === 74 ? 1560 : premium === 64 ? 1300 : premium === 59 ? 1200 : 980;

    const getRiskColor = () => zoneData?.risk === 'high' ? '#C0392B' : zoneData?.risk === 'medium' ? '#D97706' : '#1E7D34';
    const getRiskBg = () => zoneData?.risk === 'high' ? '#FEF2F2' : zoneData?.risk === 'medium' ? '#FFFBEB' : '#F0FDF4';
    const getRiskBorder = () => zoneData?.risk === 'high' ? '#FECACA' : zoneData?.risk === 'medium' ? '#FDE68A' : '#BBF7D0';
    const getRiskLabel = () => zoneData?.risk === 'high' ? 'High Risk Zone' : zoneData?.risk === 'medium' ? 'Medium Risk Zone' : 'Low Risk Zone';

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        setErrors({ ...errors, [e.target.name]: '' });
    };

    const verifyAadhaar = () => {
        if (!/^[0-9]{12}$/.test(form.aadhaar)) { setErrors({ ...errors, aadhaar: 'Enter a valid 12-digit Aadhaar number' }); return; }
        setVerifying(true);
        setTimeout(() => { setVerifying(false); setVerified(true); }, 2000);
    };

    const linkPlatform = () => {
        if (!form.platform) return;
        setLinking(true);
        const pData = PLATFORM_DATA[form.platform];
        setTimeout(() => {
            const avgDeliveries = Math.round(pData.deliveries.reduce((a, b) => a + b) / pData.deliveries.length);
            const avgIncome = Math.round(pData.income.reduce((a, b) => a + b) / pData.income.length);
            const empId = `${pData.prefix}-${Math.floor(1000000 + Math.random() * 9000000)}`;
            setForm(f => ({ ...f, employeeId: empId }));
            setLinkedData({ avgDeliveries, avgIncome, empId });
            setLinking(false);
            setLinked(true);
        }, 2500);
    };

    const validateStep1 = () => {
        const e = {};
        if (!form.name || !/^[a-zA-Z\s]+$/.test(form.name)) e.name = 'Enter a valid name (letters only)';
        if (!form.phone || !/^[0-9]{10}$/.test(form.phone)) e.phone = 'Enter a valid 10-digit phone number';
        if (!form.age || form.age < 18 || form.age > 60) e.age = 'Age must be between 18 and 60';
        if (!verified) e.aadhaar = 'Please verify your Aadhaar first';
        if (!form.password || form.password.length < 6) e.password = 'Password must be at least 6 characters';
        if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const validateStep2 = () => {
        const e = {};
        if (!form.zone) e.zone = 'Please select your delivery zone';
        if (!linked) e.platform = 'Please link your delivery app to continue';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handlePaymentSuccess = () => {
        setShowPayment(false);
        const email = form.name.split(' ')[0].toLowerCase() + '@kavachpay.in';
        onComplete({
            name: form.name, phone: form.phone, age: form.age,
            zone: form.zone, platform: form.platform,
            employeeId: form.employeeId, aadhaar: form.aadhaar,
            email, password: form.password,
            premium, coverage,
            avgIncome: linkedData?.avgIncome,
            avgDeliveries: linkedData?.avgDeliveries,
            monthsActive: form.monthsActive,
        });
    };

    const inputStyle = (field) => ({
        width: '100%', padding: '12px 14px', borderRadius: '10px',
        border: `1.5px solid ${errors[field] ? '#FECACA' : '#E5E7EB'}`,
        fontSize: '14px', boxSizing: 'border-box', fontFamily: 'Arial',
        outline: 'none', backgroundColor: 'white', color: '#374151',
    });

    const labelStyle = { display: 'block', color: '#374151', fontWeight: '600', marginBottom: '7px', fontSize: '13px', letterSpacing: '0.2px' };
    const errorText = (field) => errors[field] && <p style={{ color: '#DC2626', fontSize: '12px', marginTop: '5px' }}>{errors[field]}</p>;

    return (
        <div style={{ backgroundColor: '#F4F6F9', minHeight: '100vh', fontFamily: 'Arial' }}>

            {showPayment && (
                <PaymentModal
                    premium={premium}
                    name={form.name}
                    onSuccess={handlePaymentSuccess}
                    onClose={() => setShowPayment(false)}
                />
            )}

            <div style={{ backgroundColor: '#1A56A0', padding: '14px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1 style={{ color: 'white', fontSize: '18px', fontWeight: 'bold', letterSpacing: '0.3px' }}>KavachPay</h1>
                <button onClick={onBack} style={{ backgroundColor: 'transparent', color: 'white', border: '1px solid rgba(255,255,255,0.3)', padding: '6px 14px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px' }}>Back</button>
            </div>

            {/* Step Indicator */}
            <div style={{ backgroundColor: 'white', padding: '16px 24px', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid #E5E7EB' }}>
                {[1, 2, 3].map(s => (
                    <React.Fragment key={s}>
                        <div style={{ width: '30px', height: '30px', borderRadius: '50%', backgroundColor: step >= s ? '#1A56A0' : '#F3F4F6', color: step >= s ? 'white' : '#9CA3AF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '13px', border: step >= s ? 'none' : '1px solid #E5E7EB' }}>
                            {step > s ? '✓' : s}
                        </div>
                        {s < 3 && <div style={{ flex: 1, height: '2px', backgroundColor: step > s ? '#1A56A0' : '#E5E7EB', borderRadius: '2px' }} />}
                    </React.Fragment>
                ))}
                <p style={{ marginLeft: '12px', fontSize: '13px', color: '#6B7280' }}>
                    {step === 1 ? 'Personal Details' : step === 2 ? 'Zone & Platform' : 'Review & Pay'}
                </p>
            </div>

            <div style={{ padding: '24px 16px', maxWidth: '480px', margin: '0 auto' }}>

                {/* STEP 1 */}
                {step === 1 && (
                    <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '28px', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', border: '1px solid #E5E7EB' }}>
                        <p style={{ color: '#374151', fontSize: '18px', fontWeight: 'bold', marginBottom: '4px' }}>Personal Details</p>
                        <p style={{ color: '#9CA3AF', fontSize: '13px', marginBottom: '24px' }}>All information is encrypted and secure.</p>

                        <div style={{ marginBottom: '16px' }}>
                            <label style={labelStyle}>Full Name</label>
                            <input type="text" name="name" placeholder="e.g. Ravi Kumar" value={form.name} onChange={handleChange} style={inputStyle('name')} />
                            {errorText('name')}
                        </div>

                        <div style={{ marginBottom: '16px' }}>
                            <label style={labelStyle}>Phone Number</label>
                            <input type="tel" name="phone" placeholder="10-digit mobile number" value={form.phone} onChange={handleChange} maxLength={10} style={inputStyle('phone')} />
                            {errorText('phone')}
                        </div>

                        <div style={{ marginBottom: '16px' }}>
                            <label style={labelStyle}>Age</label>
                            <input type="number" name="age" placeholder="e.g. 26" value={form.age} onChange={handleChange} min={18} max={60} style={inputStyle('age')} />
                            {errorText('age')}
                        </div>

                        <div style={{ marginBottom: '16px' }}>
                            <label style={labelStyle}>Aadhaar Number</label>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <input type="text" name="aadhaar" placeholder="12-digit Aadhaar" value={form.aadhaar} onChange={handleChange} maxLength={12} style={{ ...inputStyle('aadhaar'), flex: 1 }} disabled={verified} />
                                <button onClick={verifyAadhaar} disabled={verified || verifying}
                                    style={{ padding: '12px 16px', backgroundColor: verified ? '#1E7D34' : '#1A56A0', color: 'white', border: 'none', borderRadius: '10px', cursor: verified ? 'default' : 'pointer', fontWeight: 'bold', fontSize: '13px', whiteSpace: 'nowrap' }}>
                                    {verifying ? '...' : verified ? 'Verified' : 'Verify'}
                                </button>
                            </div>
                            {verifying && <p style={{ color: '#1A56A0', fontSize: '12px', marginTop: '6px' }}>Connecting to DigiLocker...</p>}
                            {verified && <p style={{ color: '#1E7D34', fontSize: '12px', marginTop: '6px', fontWeight: '600' }}>Aadhaar verified successfully</p>}
                            {errorText('aadhaar')}
                        </div>

                        <div style={{ marginBottom: '16px' }}>
                            <label style={labelStyle}>Create Password</label>
                            <div style={{ position: 'relative' }}>
                                <input type={showPassword ? 'text' : 'password'} name="password" placeholder="Minimum 6 characters" value={form.password} onChange={handleChange} style={{ ...inputStyle('password'), paddingRight: '60px' }} />
                                <button onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', fontSize: '13px' }}>
                                    {showPassword ? 'Hide' : 'Show'}
                                </button>
                            </div>
                            {errorText('password')}
                        </div>

                        <div style={{ marginBottom: '28px' }}>
                            <label style={labelStyle}>Confirm Password</label>
                            <div style={{ position: 'relative' }}>
                                <input type={showConfirm ? 'text' : 'password'} name="confirmPassword" placeholder="Re-enter your password" value={form.confirmPassword} onChange={handleChange} style={{ ...inputStyle('confirmPassword'), paddingRight: '60px' }} />
                                <button onClick={() => setShowConfirm(!showConfirm)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', fontSize: '13px' }}>
                                    {showConfirm ? 'Hide' : 'Show'}
                                </button>
                            </div>
                            {form.confirmPassword && form.password === form.confirmPassword && <p style={{ color: '#1E7D34', fontSize: '12px', marginTop: '5px', fontWeight: '600' }}>Passwords match</p>}
                            {errorText('confirmPassword')}
                        </div>

                        <button onClick={() => { if (validateStep1()) setStep(2); }}
                            style={{ width: '100%', backgroundColor: '#1A56A0', color: 'white', padding: '14px', borderRadius: '10px', border: 'none', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer', letterSpacing: '0.2px' }}>
                            Continue
                        </button>
                    </div>
                )}

                {/* STEP 2 */}
                {step === 2 && (
                    <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '28px', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', border: '1px solid #E5E7EB' }}>
                        <p style={{ color: '#374151', fontSize: '18px', fontWeight: 'bold', marginBottom: '4px' }}>Zone & Platform</p>
                        <p style={{ color: '#9CA3AF', fontSize: '13px', marginBottom: '24px' }}>Your zone determines your coverage tier and premium.</p>

                        <div style={{ marginBottom: '16px' }}>
                            <label style={labelStyle}>Delivery Zone</label>
                            <select name="zone" value={form.zone} onChange={handleChange} style={{ ...inputStyle('zone'), backgroundColor: 'white' }}>
                                <option value="">Select your zone</option>
                                <optgroup label="Chennai">{['Adyar, Chennai', 'Velachery, Chennai', 'Tambaram, Chennai', 'Anna Nagar, Chennai', 'T Nagar, Chennai', 'Porur, Chennai', 'Sholinganallur, Chennai', 'Perambur, Chennai'].map(z => <option key={z}>{z}</option>)}</optgroup>
                                <optgroup label="Mumbai">{['Dharavi, Mumbai', 'Kurla, Mumbai', 'Andheri, Mumbai', 'Bandra West, Mumbai', 'Powai, Mumbai', 'Borivali, Mumbai', 'Thane, Mumbai', 'Navi Mumbai'].map(z => <option key={z}>{z}</option>)}</optgroup>
                                <optgroup label="Bangalore">{['Koramangala, Bangalore', 'Whitefield, Bangalore', 'HSR Layout, Bangalore', 'Indiranagar, Bangalore', 'Marathahalli, Bangalore', 'Hebbal, Bangalore', 'Electronic City, Bangalore', 'JP Nagar, Bangalore'].map(z => <option key={z}>{z}</option>)}</optgroup>
                                <optgroup label="Delhi / NCR">{['Connaught Place, Delhi', 'Lajpat Nagar, Delhi', 'Dwarka, Delhi', 'Rohini, Delhi', 'Noida Sector 18', 'Noida Sector 62', 'Gurgaon Cyber City', 'Gurgaon Sohna Road', 'Faridabad'].map(z => <option key={z}>{z}</option>)}</optgroup>
                                <optgroup label="Hyderabad">{['Banjara Hills, Hyderabad', 'Jubilee Hills, Hyderabad', 'Secunderabad', 'Madhapur, Hyderabad', 'Kukatpally, Hyderabad', 'LB Nagar, Hyderabad'].map(z => <option key={z}>{z}</option>)}</optgroup>
                                <optgroup label="Pune">{['Kothrud, Pune', 'Hinjewadi, Pune', 'Wakad, Pune', 'Viman Nagar, Pune', 'Hadapsar, Pune', 'Pimpri Chinchwad'].map(z => <option key={z}>{z}</option>)}</optgroup>
                                <optgroup label="Kolkata">{['Salt Lake, Kolkata', 'Park Street, Kolkata', 'Howrah', 'Dum Dum, Kolkata', 'Newtown, Kolkata'].map(z => <option key={z}>{z}</option>)}</optgroup>
                                <optgroup label="Ahmedabad">{['Navrangpura, Ahmedabad', 'Satellite, Ahmedabad', 'Bopal, Ahmedabad', 'Maninagar, Ahmedabad'].map(z => <option key={z}>{z}</option>)}</optgroup>
                                <optgroup label="Tier 2 Cities">{['Coimbatore', 'Mysuru', 'Nagpur', 'Surat', 'Vizag', 'Indore', 'Bhopal', 'Ludhiana', 'Jaipur', 'Kochi'].map(z => <option key={z}>{z}</option>)}</optgroup>
                                <option value="Other">Other</option>
                            </select>
                            {errorText('zone')}
                        </div>

                        {form.zone && zoneData && (
                            <div style={{ backgroundColor: getRiskBg(), borderRadius: '10px', padding: '14px 16px', marginBottom: '16px', border: `1px solid ${getRiskBorder()}`, borderLeft: `4px solid ${getRiskColor()}` }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <p style={{ color: getRiskColor(), fontWeight: 'bold', fontSize: '13px' }}>{getRiskLabel()}</p>
                                        <p style={{ color: '#6B7280', fontSize: '12px', marginTop: '3px' }}>Coverage: ₹{coverage}/week</p>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <p style={{ color: '#374151', fontWeight: 'bold', fontSize: '22px' }}>₹{premium}</p>
                                        <p style={{ color: '#9CA3AF', fontSize: '11px' }}>per week</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div style={{ marginBottom: '16px' }}>
                            <label style={labelStyle}>Delivery Platform</label>
                            <select name="platform" value={form.platform} onChange={handleChange} style={{ ...inputStyle('platform'), backgroundColor: 'white' }} disabled={linked}>
                                <option value="">Select your platform</option>
                                {Object.keys(PLATFORM_DATA).map(p => <option key={p}>{p}</option>)}
                            </select>
                        </div>

                        {form.platform && !linked && (
                            <div style={{ backgroundColor: '#EEF4FF', borderRadius: '12px', padding: '16px', marginBottom: '16px', border: '1px solid #DBEAFE' }}>
                                <p style={{ color: '#1A56A0', fontWeight: 'bold', fontSize: '13px', marginBottom: '6px' }}>Link your {form.platform} account</p>
                                <p style={{ color: '#6B7280', fontSize: '12px', marginBottom: '12px' }}>Auto-fills your delivery history for accurate coverage.</p>
                                <button onClick={linkPlatform} disabled={linking}
                                    style={{ width: '100%', backgroundColor: '#1A56A0', color: 'white', padding: '11px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}>
                                    {linking ? 'Connecting to ' + form.platform + '...' : 'Connect ' + form.platform + ' Account'}
                                </button>
                            </div>
                        )}

                        {linked && linkedData && (
                            <div style={{ backgroundColor: '#F0FDF4', borderRadius: '12px', padding: '16px', marginBottom: '16px', border: '1px solid #BBF7D0' }}>
                                <p style={{ color: '#1E7D34', fontWeight: 'bold', fontSize: '13px', marginBottom: '12px' }}>{form.platform} account linked successfully</p>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '10px' }}>
                                    <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '10px', textAlign: 'center', border: '1px solid #BBF7D0' }}>
                                        <p style={{ color: '#1E7D34', fontWeight: 'bold', fontSize: '18px' }}>{linkedData.avgDeliveries}</p>
                                        <p style={{ color: '#6B7280', fontSize: '11px', marginTop: '2px' }}>Avg deliveries/month</p>
                                    </div>
                                    <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '10px', textAlign: 'center', border: '1px solid #DBEAFE' }}>
                                        <p style={{ color: '#1A56A0', fontWeight: 'bold', fontSize: '18px' }}>₹{linkedData.avgIncome}</p>
                                        <p style={{ color: '#6B7280', fontSize: '11px', marginTop: '2px' }}>Avg weekly income</p>
                                    </div>
                                </div>
                                <p style={{ color: '#6B7280', fontSize: '12px' }}>Employee ID: <span style={{ fontWeight: 'bold', color: '#374151' }}>{linkedData.empId}</span></p>
                            </div>
                        )}

                        {errorText('platform')}

                        <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                            <button onClick={() => setStep(1)} style={{ flex: 1, backgroundColor: 'white', color: '#1A56A0', padding: '13px', borderRadius: '10px', border: '1.5px solid #DBEAFE', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer' }}>Back</button>
                            <button onClick={() => { if (validateStep2()) setStep(3); }} style={{ flex: 2, backgroundColor: '#1A56A0', color: 'white', padding: '13px', borderRadius: '10px', border: 'none', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer' }}>Review</button>
                        </div>
                    </div>
                )}

                {/* STEP 3 — Review & Pay */}
                {step === 3 && (
                    <div>
                        <div style={{ background: 'linear-gradient(135deg, #1A56A0, #0D3B73)', borderRadius: '18px', padding: '24px', marginBottom: '14px', color: 'white', boxShadow: '0 4px 20px rgba(26,86,160,0.25)' }}>
                            <p style={{ opacity: 0.65, fontSize: '11px', letterSpacing: '0.8px', textTransform: 'uppercase' }}>Policy Summary</p>
                            <p style={{ fontSize: '20px', fontWeight: 'bold', marginTop: '6px' }}>{form.name}</p>
                            <p style={{ opacity: 0.65, fontSize: '12px', marginTop: '3px' }}>{form.zone} • {form.platform}</p>
                            <div style={{ borderTop: '1px solid rgba(255,255,255,0.12)', marginTop: '16px', paddingTop: '16px', display: 'flex', justifyContent: 'space-between' }}>
                                <div style={{ textAlign: 'center' }}>
                                    <p style={{ opacity: 0.65, fontSize: '11px', letterSpacing: '0.5px' }}>PREMIUM</p>
                                    <p style={{ fontWeight: 'bold', fontSize: '22px', marginTop: '4px' }}>₹{premium}/wk</p>
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                    <p style={{ opacity: 0.65, fontSize: '11px', letterSpacing: '0.5px' }}>COVERAGE</p>
                                    <p style={{ fontWeight: 'bold', fontSize: '22px', marginTop: '4px' }}>₹{coverage}/wk</p>
                                </div>
                            </div>
                        </div>

                        <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '20px', marginBottom: '14px', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', border: '1px solid #E5E7EB' }}>
                            {[
                                { label: 'Full Name', value: form.name },
                                { label: 'Phone', value: form.phone },
                                { label: 'Age', value: form.age + ' years' },
                                { label: 'Aadhaar', value: 'XXXX-XXXX-' + form.aadhaar.slice(-4) + ' (verified)' },
                                { label: 'Employee ID', value: form.employeeId },
                                { label: 'Platform', value: form.platform },
                                { label: 'Zone', value: form.zone },
                                { label: 'Avg Weekly Income', value: '₹' + linkedData?.avgIncome },
                                { label: 'Starting KavachScore', value: '750 — Trusted Worker' },
                            ].map((item, i) => (
                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: i < 8 ? '1px solid #F3F4F6' : 'none' }}>
                                    <p style={{ color: '#9CA3AF', fontSize: '13px' }}>{item.label}</p>
                                    <p style={{ color: '#374151', fontWeight: '600', fontSize: '13px', textAlign: 'right', maxWidth: '55%' }}>{item.value}</p>
                                </div>
                            ))}
                        </div>

                        <div style={{ backgroundColor: '#F0FDF4', borderRadius: '12px', padding: '13px 16px', marginBottom: '20px', border: '1px solid #BBF7D0' }}>
                            <p style={{ color: '#1E7D34', fontSize: '13px', fontWeight: '600' }}>
                                By enrolling you confirm income loss coverage only. Vehicle, health and accident claims are not covered.
                            </p>
                        </div>

                        {/* Pay Button */}
                        <div style={{ backgroundColor: 'white', borderRadius: '14px', padding: '18px', marginBottom: '12px', border: '1px solid #E5E7EB', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                                <p style={{ color: '#374151', fontWeight: 'bold', fontSize: '14px' }}>Amount Due</p>
                                <p style={{ color: '#1A56A0', fontWeight: 'bold', fontSize: '20px' }}>₹{premium}</p>
                            </div>
                            <button onClick={() => setShowPayment(true)}
                                style={{ width: '100%', backgroundColor: '#3395FF', color: 'white', padding: '15px', borderRadius: '12px', border: 'none', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer', letterSpacing: '0.2px', boxShadow: '0 4px 16px rgba(51,149,255,0.3)', marginBottom: '10px' }}>
                                Pay with Razorpay — ₹{premium}
                            </button>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                                <p style={{ color: '#9CA3AF', fontSize: '11px' }}>Secured by Razorpay • 256-bit SSL encryption</p>
                            </div>
                        </div>

                        <button onClick={() => setStep(2)} style={{ width: '100%', backgroundColor: 'white', color: '#1A56A0', padding: '13px', borderRadius: '12px', border: '1.5px solid #DBEAFE', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer' }}>
                            Edit Details
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}