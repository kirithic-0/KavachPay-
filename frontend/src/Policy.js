import React, { useState } from 'react';

const PaymentModal = ({ premium, name, onSuccess, onClose }) => {
    const [paymentStep, setPaymentStep] = useState('select');
    const [selectedMethod, setSelectedMethod] = useState('upi');
    const [upiId, setUpiId] = useState('');
    const [upiError, setUpiError] = useState('');

    const handlePay = () => {
        if (selectedMethod === 'upi' && !upiId) { setUpiError('Please enter your UPI ID'); return; }
        if (selectedMethod === 'upi' && !upiId.includes('@')) { setUpiError('Enter a valid UPI ID (e.g. ravi@upi)'); return; }
        setUpiError('');
        setPaymentStep('processing');
        setTimeout(() => setPaymentStep('success'), 2500);
    };

    return (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 2000, fontFamily: 'Arial' }}>
            <div style={{ backgroundColor: 'white', borderRadius: '24px 24px 0 0', width: '100%', maxWidth: '480px', padding: '24px', boxShadow: '0 -8px 40px rgba(0,0,0,0.2)' }}>

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

                <div style={{ backgroundColor: '#F9FAFB', borderRadius: '12px', padding: '16px', marginBottom: '20px', border: '1px solid #E5E7EB', textAlign: 'center' }}>
                    <p style={{ color: '#6B7280', fontSize: '12px', marginBottom: '4px', letterSpacing: '0.3px' }}>WEEKLY PREMIUM RENEWAL — KAVACHPAY</p>
                    <p style={{ color: '#072654', fontWeight: 'bold', fontSize: '28px' }}>₹{premium}</p>
                    <p style={{ color: '#9CA3AF', fontSize: '12px', marginTop: '4px' }}>Policyholder: {name}</p>
                </div>

                {paymentStep === 'select' && (
                    <div>
                        <p style={{ color: '#374151', fontWeight: 'bold', fontSize: '13px', marginBottom: '12px' }}>Select Payment Method</p>

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
                            style={{ width: '100%', backgroundColor: '#3395FF', color: 'white', padding: '15px', borderRadius: '12px', border: 'none', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 16px rgba(51,149,255,0.3)', marginBottom: '12px' }}>
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

                {paymentStep === 'success' && (
                    <div style={{ textAlign: 'center', padding: '10px 0' }}>
                        <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#F0FDF4', border: '3px solid #BBF7D0', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', boxShadow: '0 4px 16px rgba(30,125,52,0.15)' }}>
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#1E7D34" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                        </div>
                        <p style={{ color: '#1A1A2E', fontWeight: 'bold', fontSize: '18px', marginBottom: '6px' }}>Payment Successful</p>
                        <p style={{ color: '#9CA3AF', fontSize: '13px', marginBottom: '16px' }}>₹{premium} paid successfully — Policy renewed</p>
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
                            Done
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default function Policy({ worker, onBack }) {
    const name = worker?.name || 'Ravi Kumar';
    const zone = worker?.zone || 'Koramangala, Bangalore';
    const platform = worker?.platform || 'Swiggy';
    const premium = worker?.premium || 59;
    const coverage = worker?.coverage || 1200;
    const employeeId = worker?.employeeId || 'SWG-2847361';
    const age = worker?.age || 26;
    const avgIncome = worker?.avgIncome || 1800;

    const [paused, setPaused] = useState(false);
    const [showPauseConfirm, setShowPauseConfirm] = useState(false);
    const [renewed, setRenewed] = useState(false);
    const [showPayment, setShowPayment] = useState(false);

    const today = new Date();
    const startDate = today.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    const endDate = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

    const payoutTiers = [
        { tier: 'Minor', desc: 'Rain 50–74mm / AQI 200–299', pct: 30, amount: Math.round(coverage * 0.3), color: '#1E7D34', bg: '#F0FDF4', border: '#BBF7D0' },
        { tier: 'Moderate', desc: 'Rain 75–99mm / AQI 300–399', pct: 65, amount: Math.round(coverage * 0.65), color: '#D97706', bg: '#FFFBEB', border: '#FDE68A' },
        { tier: 'Severe', desc: 'Rain 100mm+ / AQI 400+ / Flood / Storm', pct: 100, amount: coverage, color: '#C0392B', bg: '#FEF2F2', border: '#FECACA' },
    ];

    const card = (children, mb = '14px') => (
        <div style={{ backgroundColor: 'white', borderRadius: '14px', padding: '20px', marginBottom: mb, boxShadow: '0 1px 4px rgba(0,0,0,0.05)', border: '1px solid #E5E7EB' }}>
            {children}
        </div>
    );

    const sectionTitle = (text) => (
        <p style={{ color: '#374151', fontWeight: 'bold', fontSize: '14px', marginBottom: '14px', letterSpacing: '0.2px' }}>{text}</p>
    );

    return (
        <div style={{ backgroundColor: '#F4F6F9', minHeight: '100vh', fontFamily: 'Arial' }}>

            {showPayment && (
                <PaymentModal
                    premium={premium}
                    name={name}
                    onSuccess={() => { setShowPayment(false); setRenewed(true); }}
                    onClose={() => setShowPayment(false)}
                />
            )}

            <div style={{ backgroundColor: '#1A56A0', padding: '14px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1 style={{ color: 'white', fontSize: '18px', fontWeight: 'bold', letterSpacing: '0.3px' }}>KavachPay</h1>
                <button onClick={onBack} style={{ backgroundColor: 'transparent', color: 'white', border: '1px solid rgba(255,255,255,0.3)', padding: '6px 14px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px' }}>Back</button>
            </div>

            <div style={{ padding: '20px 16px', maxWidth: '520px', margin: '0 auto' }}>

                <p style={{ color: '#374151', fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>My Policy</p>

                {/* Policy Card */}
                <div style={{ background: 'linear-gradient(135deg, #1A56A0, #0D3B73)', borderRadius: '18px', padding: '24px', marginBottom: '14px', color: 'white', boxShadow: '0 4px 20px rgba(26,86,160,0.25)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                        <div>
                            <p style={{ opacity: 0.65, fontSize: '11px', letterSpacing: '0.8px', textTransform: 'uppercase' }}>Policy Holder</p>
                            <p style={{ fontWeight: 'bold', fontSize: '20px', marginTop: '4px' }}>{name}</p>
                            <p style={{ opacity: 0.65, fontSize: '12px', marginTop: '3px' }}>{platform} • {zone.split(',')[0]}</p>
                        </div>
                        <div style={{ backgroundColor: paused ? 'rgba(217,119,6,0.85)' : 'rgba(30,125,52,0.85)', padding: '5px 14px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.2)' }}>
                            <p style={{ fontSize: '11px', fontWeight: 'bold', letterSpacing: '0.5px' }}>{paused ? 'PAUSED' : 'ACTIVE'}</p>
                        </div>
                    </div>
                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.12)', paddingTop: '16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        {[
                            { label: 'Weekly Premium', value: '₹' + premium },
                            { label: 'Weekly Coverage', value: '₹' + coverage },
                        ].map((item, i) => (
                            <div key={i} style={{ textAlign: 'center', backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: '10px', padding: '12px' }}>
                                <p style={{ fontWeight: 'bold', fontSize: '22px' }}>{item.value}</p>
                                <p style={{ opacity: 0.65, fontSize: '11px', marginTop: '3px' }}>{item.label}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Policy Details */}
                {card(<>
                    {sectionTitle('Policy Details')}
                    {[
                        { label: 'Policy ID', value: 'KVP-' + (worker?.phone?.slice(-6) || '847291') },
                        { label: 'Employee ID', value: employeeId },
                        { label: 'Platform', value: platform },
                        { label: 'Zone', value: zone },
                        { label: 'Age', value: age + ' years' },
                        { label: 'Avg Weekly Income', value: '₹' + avgIncome },
                        { label: 'Income Protected', value: '65% of weekly income' },
                        { label: 'Valid From', value: startDate },
                        { label: 'Valid Until', value: endDate },
                        { label: 'Renewal', value: 'Auto-renews weekly' },
                    ].map((item, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: i < 9 ? '1px solid #F3F4F6' : 'none' }}>
                            <p style={{ color: '#9CA3AF', fontSize: '13px' }}>{item.label}</p>
                            <p style={{ color: '#374151', fontWeight: '600', fontSize: '13px', textAlign: 'right', maxWidth: '55%' }}>{item.value}</p>
                        </div>
                    ))}
                </>)}

                {/* What's Covered */}
                {card(<>
                    {sectionTitle("What's Covered")}
                    {[
                        { event: 'Heavy Rain', detail: 'Rainfall above 50mm in your zone' },
                        { event: 'Poor AQI', detail: 'Air Quality Index above 200' },
                        { event: 'Flood Alert', detail: 'Official NDMA flood warning issued' },
                        { event: 'Severe Storm', detail: 'Wind speed above 60kmh' },
                        { event: 'Curfew', detail: 'Government declared curfew in zone' },
                    ].map((item, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', borderRadius: '10px', marginBottom: '6px', backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0' }}>
                            <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#1E7D34', flexShrink: 0 }} />
                            <div>
                                <p style={{ color: '#1E7D34', fontWeight: '600', fontSize: '13px' }}>{item.event}</p>
                                <p style={{ color: '#6B7280', fontSize: '12px', marginTop: '2px' }}>{item.detail}</p>
                            </div>
                        </div>
                    ))}
                </>)}

                {/* What's NOT Covered */}
                {card(<>
                    {sectionTitle("What's Not Covered")}
                    {[
                        'Vehicle damage or breakdown',
                        'Health issues or accidents',
                        'Personal reasons for not working',
                        'Income loss outside your enrolled zone',
                    ].map((item, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', borderRadius: '10px', marginBottom: '6px', backgroundColor: '#FEF2F2', border: '1px solid #FECACA' }}>
                            <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#C0392B', flexShrink: 0 }} />
                            <p style={{ color: '#C0392B', fontSize: '13px', fontWeight: '600' }}>{item}</p>
                        </div>
                    ))}
                </>)}

                {/* Payout Tiers */}
                {card(<>
                    {sectionTitle('Payout Tiers')}
                    {payoutTiers.map((tier, i) => (
                        <div key={i} style={{ backgroundColor: tier.bg, borderRadius: '12px', padding: '14px 16px', marginBottom: '10px', border: `1px solid ${tier.border}` }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                                <p style={{ color: tier.color, fontWeight: 'bold', fontSize: '13px' }}>{tier.tier} Disruption</p>
                                <p style={{ color: tier.color, fontWeight: 'bold', fontSize: '18px' }}>₹{tier.amount}</p>
                            </div>
                            <p style={{ color: '#6B7280', fontSize: '12px', marginBottom: '8px' }}>{tier.desc}</p>
                            <div style={{ backgroundColor: 'rgba(255,255,255,0.7)', borderRadius: '4px', height: '6px', overflow: 'hidden' }}>
                                <div style={{ width: tier.pct + '%', height: '100%', backgroundColor: tier.color, borderRadius: '4px' }} />
                            </div>
                            <p style={{ color: '#9CA3AF', fontSize: '11px', marginTop: '4px' }}>{tier.pct}% of weekly coverage</p>
                        </div>
                    ))}
                </>)}

                {/* Verification Layers */}
                {card(<>
                    {sectionTitle('How Claims Are Verified')}
                    <p style={{ color: '#9CA3AF', fontSize: '12px', marginBottom: '14px', marginTop: '-8px' }}>5-layer behavioral verification runs automatically on every claim.</p>
                    {[
                        { num: 1, label: 'Work Intent', desc: 'Were you working during the disruption?' },
                        { num: 2, label: 'Activity Check', desc: 'Were you actually inactive during the disruption window?' },
                        { num: 3, label: 'Zone Correlation', desc: 'Were other workers in your zone also affected?' },
                        { num: 4, label: 'Self Declaration', desc: 'Did you confirm the disruption impacted your work?' },
                        { num: 5, label: 'KavachScore', desc: 'Is your trust history clean with no fraud flags?' },
                    ].map((item, i) => (
                        <div key={i} style={{ display: 'flex', gap: '12px', marginBottom: '12px', alignItems: 'flex-start' }}>
                            <div style={{ width: '26px', height: '26px', borderRadius: '50%', backgroundColor: '#1A56A0', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '12px', flexShrink: 0 }}>
                                {item.num}
                            </div>
                            <div>
                                <p style={{ color: '#374151', fontWeight: '600', fontSize: '13px' }}>{item.label}</p>
                                <p style={{ color: '#9CA3AF', fontSize: '12px', marginTop: '2px' }}>{item.desc}</p>
                            </div>
                        </div>
                    ))}
                </>)}

                {/* Policy Pause */}
                {card(<>
                    {sectionTitle('Policy Pause')}
                    <p style={{ color: '#9CA3AF', fontSize: '12px', marginBottom: '14px', marginTop: '-8px' }}>
                        Taking a break? Pause your policy — no premium charged, no coverage active while paused.
                    </p>
                    {paused ? (
                        <div>
                            <div style={{ backgroundColor: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: '10px', padding: '12px 14px', marginBottom: '12px' }}>
                                <p style={{ color: '#92400E', fontSize: '13px', fontWeight: '600' }}>Policy is currently paused</p>
                                <p style={{ color: '#92400E', fontSize: '12px', marginTop: '4px' }}>No premium is being charged. Resume to reactivate coverage.</p>
                            </div>
                            <button onClick={() => setPaused(false)}
                                style={{ width: '100%', backgroundColor: '#1E7D34', color: 'white', padding: '13px', borderRadius: '10px', border: 'none', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer' }}>
                                Resume Policy
                            </button>
                        </div>
                    ) : (
                        <div>
                            {showPauseConfirm ? (
                                <div>
                                    <div style={{ backgroundColor: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: '10px', padding: '12px 14px', marginBottom: '12px' }}>
                                        <p style={{ color: '#92400E', fontSize: '13px', fontWeight: '600' }}>Are you sure?</p>
                                        <p style={{ color: '#92400E', fontSize: '12px', marginTop: '4px' }}>You will not be covered for disruptions while paused.</p>
                                    </div>
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <button onClick={() => { setPaused(true); setShowPauseConfirm(false); }}
                                            style={{ flex: 1, backgroundColor: '#D97706', color: 'white', padding: '12px', borderRadius: '10px', border: 'none', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer' }}>
                                            Yes, Pause
                                        </button>
                                        <button onClick={() => setShowPauseConfirm(false)}
                                            style={{ flex: 1, backgroundColor: 'white', color: '#1A56A0', padding: '12px', borderRadius: '10px', border: '1.5px solid #DBEAFE', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer' }}>
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <button onClick={() => setShowPauseConfirm(true)}
                                    style={{ width: '100%', backgroundColor: '#FFFBEB', color: '#92400E', padding: '13px', borderRadius: '10px', border: '1.5px solid #FDE68A', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer' }}>
                                    Pause My Policy
                                </button>
                            )}
                        </div>
                    )}
                </>)}

                {/* Renewal */}
                {renewed ? (
                    <div style={{ backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '14px', padding: '18px', textAlign: 'center', marginBottom: '14px' }}>
                        <p style={{ color: '#1E7D34', fontWeight: 'bold', fontSize: '15px' }}>Policy Renewed Successfully</p>
                        <p style={{ color: '#6B7280', fontSize: '13px', marginTop: '6px' }}>Valid until next week. Stay safe on the roads.</p>
                    </div>
                ) : (
                    <div style={{ backgroundColor: 'white', borderRadius: '14px', padding: '18px', marginBottom: '12px', border: '1px solid #E5E7EB', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                            <p style={{ color: '#374151', fontWeight: 'bold', fontSize: '14px' }}>Renewal Amount</p>
                            <p style={{ color: '#1A56A0', fontWeight: 'bold', fontSize: '20px' }}>₹{premium}</p>
                        </div>
                        <button onClick={() => setShowPayment(true)}
                            style={{ width: '100%', backgroundColor: '#3395FF', color: 'white', padding: '14px', borderRadius: '12px', border: 'none', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 16px rgba(51,149,255,0.3)', marginBottom: '10px' }}>
                            Renew with Razorpay — ₹{premium}
                        </button>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                            <p style={{ color: '#9CA3AF', fontSize: '11px' }}>Secured by Razorpay • 256-bit SSL encryption</p>
                        </div>
                    </div>
                )}

                <button onClick={onBack}
                    style={{ width: '100%', backgroundColor: 'white', color: '#1A56A0', padding: '13px', borderRadius: '12px', border: '1.5px solid #DBEAFE', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer' }}>
                    Back to Dashboard
                </button>

            </div>
        </div>
    );
}