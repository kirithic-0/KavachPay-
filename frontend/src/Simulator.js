import React, { useState } from 'react';

const ZONE_WORKERS = {
    'Koramangala, Bangalore': [
        { name: 'Ravi Kumar', id: 'BLR-1000001', active: false, started: true, deliveries: 0, score: 820 },
        { name: 'Mohammed Arif', id: 'ZPT-3847261', active: false, started: true, deliveries: 0, score: 750 },
        { name: 'Sunita Devi', id: 'BLK-2938471', active: false, started: false, deliveries: 0, score: 710 },
        { name: 'Karthik R', id: 'SWG-1847392', active: false, started: true, deliveries: 0, score: 760 },
        { name: 'Deepa Nair', id: 'ZOM-3847192', active: true, started: true, deliveries: 2, score: 800 },
    ],
    'Adyar, Chennai': [
        { name: 'Priya Singh', id: 'CHN-2000001', active: true, started: true, deliveries: 4, score: 380 },
        { name: 'Murugan S', id: 'ZOM-1938472', active: false, started: true, deliveries: 0, score: 790 },
        { name: 'Kavitha R', id: 'SWG-3847201', active: true, started: true, deliveries: 3, score: 815 },
        { name: 'Senthil K', id: 'ZPT-2847193', active: false, started: true, deliveries: 0, score: 745 },
        { name: 'Prabhakaran M', id: 'BLK-1847293', active: false, started: true, deliveries: 0, score: 765 },
    ],
    'Dharavi, Mumbai': [
        { name: 'Suresh Patil', id: 'SWG-4827361', active: false, started: true, deliveries: 0, score: 770 },
        { name: 'Aarti Sharma', id: 'ZOM-2937481', active: true, started: true, deliveries: 6, score: 830 },
        { name: 'Imran Khan', id: 'ZPT-1847293', active: false, started: true, deliveries: 0, score: 740 },
        { name: 'Rekha Devi', id: 'BLK-3847102', active: false, started: false, deliveries: 0, score: 690 },
        { name: 'Vijay More', id: 'SWG-2847193', active: false, started: true, deliveries: 0, score: 755 },
    ],
    'Salt Lake, Kolkata': [
        { name: 'Rajesh Das', id: 'SWG-3847192', active: false, started: true, deliveries: 0, score: 760 },
        { name: 'Mithun Roy', id: 'ZOM-2847391', active: true, started: true, deliveries: 5, score: 810 },
        { name: 'Sanjay Ghosh', id: 'ZPT-1938472', active: false, started: true, deliveries: 0, score: 730 },
        { name: 'Puja Sarkar', id: 'BLK-3847201', active: false, started: true, deliveries: 0, score: 750 },
    ],
};

const DISRUPTIONS = [
    { label: 'Heavy Rain — 78mm', type: 'rain', severity: 'Moderate', value: '78mm rainfall', pct: 0.65, icon: '🌧️', color: '#1A3A5C' },
    { label: 'Heavy Rain — 112mm', type: 'rain', severity: 'Severe', value: '112mm rainfall', pct: 1.0, icon: '⛈️', color: '#C0392B' },
    { label: 'Heavy Rain — 58mm', type: 'rain', severity: 'Minor', value: '58mm rainfall', pct: 0.3, icon: '🌦️', color: '#1E7D34' },
    { label: 'AQI Alert — 347', type: 'aqi', severity: 'Moderate', value: 'AQI 347', pct: 0.65, icon: '😷', color: '#F0A500' },
    { label: 'AQI Alert — 425', type: 'aqi', severity: 'Severe', value: 'AQI 425', pct: 1.0, icon: '☣️', color: '#C0392B' },
    { label: 'Flood Alert — NDMA', type: 'flood', severity: 'Severe', value: 'NDMA warning issued', pct: 1.0, icon: '🌊', color: '#C0392B' },
    { label: 'Severe Storm — 94kmh', type: 'storm', severity: 'Severe', value: 'Wind 94kmh', pct: 1.0, icon: '💨', color: '#C0392B' },
];

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

function Simulator({ worker, onBack }) {
    const [selectedZone, setSelectedZone] = useState(
        worker?.zone && ZONE_WORKERS[worker.zone] ? worker.zone : 'Koramangala, Bangalore'
    );
    const [selectedDisruption, setSelectedDisruption] = useState(0);
    const [phase, setPhase] = useState('setup'); // setup | running | done
    const [currentStep, setCurrentStep] = useState(0);
    const [workerCards, setWorkerCards] = useState([]);
    const [summary, setSummary] = useState(null);
    const [alertVisible, setAlertVisible] = useState(false);

    const coverage = worker?.coverage || 1200;
    const disruption = DISRUPTIONS[selectedDisruption];
    const workers = ZONE_WORKERS[selectedZone];
    const payout = Math.round(coverage * disruption.pct);

    const getSeverityColor = (s) => s === 'Severe' ? '#C0392B' : s === 'Moderate' ? '#F0A500' : '#1E7D34';
    const getSeverityBg = (s) => s === 'Severe' ? '#FDECEA' : s === 'Moderate' ? '#FEF3DC' : '#D4EDDA';
    const getScoreColor = (s) => s >= 750 ? '#1E7D34' : s >= 500 ? '#F0A500' : '#C0392B';

    const runSimulation = async () => {
        setPhase('running');
        setWorkerCards([]);
        setSummary(null);
        setAlertVisible(false);
        setCurrentStep(1);

        // Step 1 — alert
        await sleep(800);
        setAlertVisible(true);
        setCurrentStep(2);
        await sleep(1200);

        // Step 2 — show worker cards one by one
        setCurrentStep(3);
        const results = [];

        for (let i = 0; i < workers.length; i++) {
            const w = workers[i];
            await sleep(700);

            // Determine result
            let result, reason, approved;
            if (!w.started) {
                result = 'skipped';
                reason = 'Did not tap Start My Day';
                approved = false;
            } else if (w.score < 500) {
                result = 'skipped';
                reason = `KavachScore ${w.score} below minimum 500 — Layer 5 failed`;
                approved = false;
            } else if (w.active) {
                result = 'skipped';
                reason = `Active — ${w.deliveries} deliveries during disruption`;
                approved = false;
            } else {
                result = 'approved';
                reason = 'All 5 verification layers passed';
                approved = true;
            }

            const txnId = approved ? 'pay_' + Math.random().toString(36).substr(2, 10) : null;
            const workerResult = { ...w, result, reason, approved, txnId, workerPayout: approved ? payout : 0 };
            results.push(workerResult);
            setWorkerCards(prev => [...prev, workerResult]);
        }

        // Step 3 — summary
        setCurrentStep(4);
        await sleep(800);
        const totalPaid = results.filter(r => r.approved).reduce((a, b) => a + b.workerPayout, 0);
        setSummary({
            total: results.length,
            approved: results.filter(r => r.approved).length,
            skipped: results.filter(r => !r.approved).length,
            totalPaid,
        });

        setCurrentStep(5);
        setPhase('done');
    };

    const steps = [
        { label: 'Configure', icon: '⚙️' },
        { label: 'Detect', icon: '📡' },
        { label: 'Alert', icon: '🚨' },
        { label: 'Verify', icon: '🔍' },
        { label: 'Payout', icon: '💸' },
        { label: 'Done', icon: '✅' },
    ];

    return (
        <div style={{ backgroundColor: '#f5f7fa', minHeight: '100vh', fontFamily: 'Arial' }}>

            {/* Navbar */}
            <div style={{ backgroundColor: '#1A3A5C', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1 style={{ color: 'white', fontSize: '20px', fontWeight: 'bold' }}>🛡️ KavachPay</h1>
                <button onClick={onBack}
                    style={{ backgroundColor: 'transparent', color: 'white', border: '1px solid white', padding: '6px 14px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' }}>
                    ← Dashboard
                </button>
            </div>

            <div style={{ padding: '20px', maxWidth: '580px', margin: '0 auto' }}>

                <h2 style={{ color: '#1A3A5C', fontSize: '22px', fontWeight: 'bold', marginBottom: '4px' }}>⚡ Live Disruption Simulator</h2>
                <p style={{ color: '#888', fontSize: '13px', marginBottom: '20px' }}>
                    Trigger a disruption event and watch KavachPay verify and pay workers in real time.
                </p>

                {/* Step Progress Bar */}
                <div style={{ backgroundColor: 'white', borderRadius: '14px', padding: '16px', marginBottom: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        {steps.map((s, i) => (
                            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                                <div style={{
                                    width: '36px', height: '36px', borderRadius: '50%',
                                    backgroundColor: currentStep > i ? '#1A3A5C' : currentStep === i ? '#F0A500' : '#f0f0f0',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '14px', fontWeight: 'bold', color: currentStep >= i ? 'white' : '#aaa',
                                    transition: 'all 0.4s'
                                }}>
                                    {currentStep > i ? '✓' : s.icon}
                                </div>
                                <p style={{ fontSize: '10px', color: currentStep >= i ? '#1A3A5C' : '#aaa', marginTop: '4px', textAlign: 'center' }}>{s.label}</p>
                                {i < steps.length - 1 && (
                                    <div style={{ position: 'absolute' }} />
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* SETUP PANEL */}
                {phase === 'setup' && (
                    <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 2px 12px rgba(0,0,0,0.08)', marginBottom: '16px' }}>
                        <p style={{ color: '#333', fontWeight: 'bold', fontSize: '16px', marginBottom: '20px' }}>Configure Your Simulation</p>

                        {/* Zone selector */}
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', color: '#555', fontSize: '13px', fontWeight: 'bold', marginBottom: '8px' }}>
                                📍 Select Zone
                            </label>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                {Object.keys(ZONE_WORKERS).map(z => (
                                    <div key={z} onClick={() => setSelectedZone(z)}
                                        style={{ padding: '12px', borderRadius: '10px', border: `2px solid ${selectedZone === z ? '#1A3A5C' : '#ddd'}`, backgroundColor: selectedZone === z ? '#D6E4F7' : 'white', cursor: 'pointer', textAlign: 'center' }}>
                                        <p style={{ color: selectedZone === z ? '#1A3A5C' : '#555', fontWeight: 'bold', fontSize: '12px' }}>{z.split(',')[0]}</p>
                                        <p style={{ color: '#888', fontSize: '11px', marginTop: '2px' }}>{z.split(',')[1]?.trim()}</p>
                                        <p style={{ color: '#1A3A5C', fontSize: '11px', marginTop: '4px' }}>{ZONE_WORKERS[z].length} workers</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Disruption selector */}
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', color: '#555', fontSize: '13px', fontWeight: 'bold', marginBottom: '8px' }}>
                                ⚡ Select Disruption Event
                            </label>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {DISRUPTIONS.map((d, i) => (
                                    <div key={i} onClick={() => setSelectedDisruption(i)}
                                        style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '10px', border: `2px solid ${selectedDisruption === i ? d.color : '#ddd'}`, backgroundColor: selectedDisruption === i ? getSeverityBg(d.severity) : 'white', cursor: 'pointer' }}>
                                        <span style={{ fontSize: '22px' }}>{d.icon}</span>
                                        <div style={{ flex: 1 }}>
                                            <p style={{ color: '#333', fontWeight: 'bold', fontSize: '13px' }}>{d.label}</p>
                                            <p style={{ color: '#888', fontSize: '11px', marginTop: '2px' }}>{d.severity} disruption — triggers {Math.round(d.pct * 100)}% payout</p>
                                        </div>
                                        <div style={{ backgroundColor: getSeverityBg(d.severity), padding: '4px 10px', borderRadius: '20px' }}>
                                            <p style={{ color: getSeverityColor(d.severity), fontSize: '11px', fontWeight: 'bold' }}>{d.severity}</p>
                                        </div>
                                        {selectedDisruption === i && <span style={{ color: d.color, fontWeight: 'bold', fontSize: '16px' }}>✓</span>}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Preview */}
                        <div style={{ backgroundColor: '#D6E4F7', borderRadius: '12px', padding: '16px', marginBottom: '20px' }}>
                            <p style={{ color: '#1A3A5C', fontWeight: 'bold', fontSize: '14px', marginBottom: '8px' }}>📊 Simulation Preview</p>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                                {[
                                    { label: 'Workers', value: workers.length },
                                    { label: 'Payout Each', value: '₹' + payout },
                                    { label: 'Max Total', value: '₹' + (payout * workers.length) },
                                ].map((item, i) => (
                                    <div key={i} style={{ backgroundColor: 'white', borderRadius: '8px', padding: '10px', textAlign: 'center' }}>
                                        <p style={{ color: '#1A3A5C', fontWeight: 'bold', fontSize: '16px' }}>{item.value}</p>
                                        <p style={{ color: '#888', fontSize: '11px', marginTop: '2px' }}>{item.label}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <button onClick={runSimulation}
                            style={{ width: '100%', backgroundColor: '#1A3A5C', color: 'white', padding: '16px', borderRadius: '12px', border: 'none', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}>
                            ▶ Run Simulation
                        </button>
                    </div>
                )}

                {/* RUNNING / DONE — Alert Banner */}
                {(phase === 'running' || phase === 'done') && alertVisible && (
                    <div style={{ backgroundColor: '#FDECEA', borderRadius: '16px', padding: '20px', marginBottom: '16px', borderLeft: '5px solid #C0392B', boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                            <span style={{ fontSize: '28px' }}>{disruption.icon}</span>
                            <div>
                                <p style={{ color: '#C0392B', fontWeight: 'bold', fontSize: '16px' }}>Disruption Detected!</p>
                                <p style={{ color: '#555', fontSize: '13px', marginTop: '2px' }}>{disruption.label}</p>
                            </div>
                            <div style={{ marginLeft: 'auto', backgroundColor: getSeverityBg(disruption.severity), padding: '6px 14px', borderRadius: '20px' }}>
                                <p style={{ color: getSeverityColor(disruption.severity), fontWeight: 'bold', fontSize: '13px' }}>{disruption.severity}</p>
                            </div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                            <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '10px' }}>
                                <p style={{ color: '#888', fontSize: '11px' }}>Zone Affected</p>
                                <p style={{ color: '#333', fontWeight: 'bold', fontSize: '13px', marginTop: '2px' }}>{selectedZone}</p>
                            </div>
                            <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '10px' }}>
                                <p style={{ color: '#888', fontSize: '11px' }}>Payout Per Worker</p>
                                <p style={{ color: '#C0392B', fontWeight: 'bold', fontSize: '13px', marginTop: '2px' }}>₹{payout}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Worker Cards */}
                {(phase === 'running' || phase === 'done') && workerCards.length > 0 && (
                    <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '20px', marginBottom: '16px', boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
                        <p style={{ color: '#333', fontWeight: 'bold', fontSize: '15px', marginBottom: '14px' }}>
                            🔍 Verification Results — {workerCards.length} of {workers.length} checked
                        </p>
                        {workerCards.map((w, i) => (
                            <div key={i} style={{ borderRadius: '12px', padding: '14px', marginBottom: '10px', backgroundColor: w.approved ? '#D4EDDA' : '#FEF3DC', border: `1px solid ${w.approved ? '#1E7D34' : '#F0A500'}` }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                            <p style={{ color: '#333', fontWeight: 'bold', fontSize: '14px' }}>{w.name}</p>
                                            <div style={{ backgroundColor: getScoreColor(w.score) + '20', padding: '2px 8px', borderRadius: '10px' }}>
                                                <p style={{ color: getScoreColor(w.score), fontSize: '11px', fontWeight: 'bold' }}>Score: {w.score}</p>
                                            </div>
                                        </div>
                                        <p style={{ color: '#888', fontSize: '11px' }}>{w.id}</p>
                                        <p style={{ color: w.approved ? '#1E7D34' : '#8B5E00', fontSize: '12px', marginTop: '6px' }}>
                                            {w.approved ? '✅ ' : '⏭️ '}{w.reason}
                                        </p>
                                        {w.txnId && (
                                            <p style={{ color: '#aaa', fontSize: '11px', marginTop: '4px' }}>Txn: {w.txnId}</p>
                                        )}
                                    </div>
                                    <div style={{ textAlign: 'right', marginLeft: '12px' }}>
                                        <p style={{ color: w.approved ? '#1E7D34' : '#888', fontWeight: 'bold', fontSize: '18px' }}>
                                            {w.approved ? '₹' + w.workerPayout : '₹0'}
                                        </p>
                                        <div style={{ backgroundColor: w.approved ? '#1E7D34' : '#F0A500', padding: '3px 8px', borderRadius: '10px', marginTop: '4px' }}>
                                            <p style={{ color: 'white', fontSize: '11px', fontWeight: 'bold' }}>
                                                {w.approved ? 'PAID ✅' : 'SKIPPED ⏭️'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Verification layers mini display */}
                                <div style={{ display: 'flex', gap: '4px', marginTop: '10px' }}>
                                    {['Work Intent', 'Activity', 'Zone', 'Declaration', 'Score'].map((layer, li) => {
                                        const passed = w.approved ? true : li === 0 ? w.started : li === 1 ? !w.active : false;
                                        return (
                                            <div key={li} style={{ flex: 1, backgroundColor: passed ? '#1E7D34' : '#C0392B', borderRadius: '4px', padding: '3px', textAlign: 'center' }}>
                                                <p style={{ color: 'white', fontSize: '9px' }}>{passed ? '✓' : '✗'}</p>
                                                <p style={{ color: 'white', fontSize: '8px', marginTop: '1px', opacity: 0.9 }}>{layer}</p>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}

                        {phase === 'running' && workerCards.length < workers.length && (
                            <div style={{ textAlign: 'center', padding: '16px' }}>
                                <p style={{ color: '#1A3A5C', fontSize: '13px' }}>🔄 Verifying remaining workers...</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Summary Card */}
                {summary && (
                    <div style={{ backgroundColor: '#1A3A5C', borderRadius: '16px', padding: '24px', marginBottom: '16px', color: 'white', boxShadow: '0 4px 20px rgba(26,86,160,0.3)' }}>
                        <p style={{ fontWeight: 'bold', fontSize: '16px', marginBottom: '16px' }}>📊 Simulation Complete</p>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '10px', marginBottom: '16px' }}>
                            {[
                                { label: 'Checked', value: summary.total, color: 'white' },
                                { label: 'Approved', value: summary.approved, color: '#7DFFB3' },
                                { label: 'Skipped', value: summary.skipped, color: '#FFD580' },
                                { label: 'Total Paid', value: '₹' + summary.totalPaid, color: '#7DFFB3' },
                            ].map((s, i) => (
                                <div key={i} style={{ backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
                                    <p style={{ color: s.color, fontWeight: 'bold', fontSize: '18px' }}>{s.value}</p>
                                    <p style={{ opacity: 0.8, fontSize: '11px', marginTop: '4px' }}>{s.label}</p>
                                </div>
                            ))}
                        </div>
                        <div style={{ backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '10px', padding: '12px' }}>
                            <p style={{ fontSize: '13px', opacity: 0.9 }}>
                                🛡️ Behavioral verification blocked {summary.skipped} illegitimate claim{summary.skipped !== 1 ? 's' : ''} — saving ₹{summary.skipped * payout} in fraudulent payouts
                            </p>
                        </div>
                    </div>
                )}

                {/* Action Buttons */}
                {phase === 'done' && (
                    <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
                        <button
                            onClick={() => { setPhase('setup'); setWorkerCards([]); setSummary(null); setAlertVisible(false); setCurrentStep(0); }}
                            style={{ flex: 1, backgroundColor: '#1A3A5C', color: 'white', padding: '14px', borderRadius: '10px', border: 'none', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer' }}>
                            🔄 Run Again
                        </button>
                        <button onClick={onBack}
                            style={{ flex: 1, backgroundColor: 'white', color: '#1A3A5C', padding: '14px', borderRadius: '10px', border: '2px solid #1A3A5C', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer' }}>
                            ← Dashboard
                        </button>
                    </div>
                )}

            </div>
        </div>
    );
}

export default Simulator;