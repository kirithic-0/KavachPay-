import React, { useState } from 'react';
import Login from './Login';
import AdminLogin from './AdminLogin';
import Signup from './Signup';
import Dashboard from './Dashboard';
import AdminDashboard from './AdminDashboard';
import Chatbot from './Chatbot';

function App() {
  const [page, setPage] = useState('home');
  const [worker, setWorker] = useState(null);
  const [showChat, setShowChat] = useState(false);

  if (page === 'login') return <Login
    onLogin={(data) => { setWorker(data); setPage('dashboard'); }}
    onBack={() => setPage('home')}
    onSignup={() => setPage('signup')}
  />;
  if (page === 'signup') return <Signup
    onComplete={(data) => { setWorker(data); setPage('dashboard'); }}
    onBack={() => setPage('login')}
  />;
  if (page === 'dashboard') return <Dashboard
    worker={worker}
    onLogout={() => { setWorker(null); setPage('home'); }}
  />;
  if (page === 'adminlogin') return <AdminLogin
    onLogin={() => setPage('admin')}
    onBack={() => setPage('home')}
  />;
  if (page === 'admin') return <AdminDashboard
    onBack={() => setPage('home')}
  />;

  return (
    <div style={{ backgroundColor: '#1A56A0', minHeight: '100vh', color: 'white', fontFamily: 'Arial', position: 'relative' }}>

      {/* Navbar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '20px 40px', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>🛡️ KavachPay</h1>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={() => setPage('adminlogin')}
            style={{ backgroundColor: 'transparent', color: 'white', padding: '10px 20px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.5)', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px' }}>
            Admin Login
          </button>
          <button onClick={() => setPage('login')}
            style={{ backgroundColor: 'transparent', color: 'white', padding: '10px 20px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.5)', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px' }}>
            Login
          </button>
          <button onClick={() => setPage('signup')}
            style={{ backgroundColor: 'white', color: '#1A56A0', padding: '10px 20px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px' }}>
            Enroll Now
          </button>
        </div>
      </div>

      {/* Hero */}
      <div style={{ textAlign: 'center', padding: '80px 20px 40px' }}>
        <div style={{ display: 'inline-block', backgroundColor: 'rgba(255,255,255,0.15)', padding: '8px 20px', borderRadius: '20px', fontSize: '13px', marginBottom: '24px' }}>
          🏆 Guidewire DEVTrails 2026 — Unicorn Chase
        </div>
        <h2 style={{ fontSize: '52px', fontWeight: 'bold', marginBottom: '20px', lineHeight: 1.2 }}>
          Income Protection for<br />India's Delivery Workers
        </h2>
        <p style={{ fontSize: '20px', opacity: 0.85, marginBottom: '12px' }}>
          When rain stops Ravi from delivering,<br />KavachPay pays him before he gets home.
        </p>
        <p style={{ fontSize: '15px', opacity: 0.65, marginBottom: '40px' }}>
          Trigger. Verify. Pay. — Parametric insurance for 50 million gig workers.
        </p>
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => setPage('signup')}
            style={{ backgroundColor: '#F0A500', color: 'white', padding: '16px 44px', borderRadius: '10px', border: 'none', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer' }}>
            Enroll Now — From ₹49/week
          </button>
          <button onClick={() => setPage('adminlogin')}
            style={{ backgroundColor: 'transparent', color: 'white', padding: '16px 44px', borderRadius: '10px', border: '2px solid white', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer' }}>
            See Live Demo →
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '60px', padding: '32px 20px', borderTop: '1px solid rgba(255,255,255,0.1)', borderBottom: '1px solid rgba(255,255,255,0.1)', flexWrap: 'wrap' }}>
        {[
          { num: '50M+', label: 'Gig workers in India' },
          { num: '₹49', label: 'Starting weekly premium' },
          { num: '65%', label: 'Income protected' },
          { num: '<2 min', label: 'Payout time' },
        ].map((s, i) => (
          <div key={i} style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#F0A500' }}>{s.num}</p>
            <p style={{ fontSize: '13px', opacity: 0.7, marginTop: '4px' }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* How it works */}
      <div style={{ padding: '60px 20px', textAlign: 'center' }}>
        <h3 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '40px' }}>How KavachPay Works</h3>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', flexWrap: 'wrap' }}>
          {[
            { icon: '📝', step: '1. Enroll', desc: 'Verify Aadhaar + Employee ID. Connect your delivery app. Done in 2 minutes.' },
            { icon: '🌧️', step: '2. Trigger', desc: 'Rain, AQI, flood or curfew detected in your zone automatically via live APIs.' },
            { icon: '🔍', step: '3. Verify', desc: '5-layer behavioral check confirms you actually lost income — not just bad weather.' },
            { icon: '💸', step: '4. Pay', desc: 'UPI payout in under 2 minutes. No forms. No calls. No paperwork.' },
          ].map((item, i) => (
            <div key={i} style={{ backgroundColor: 'rgba(255,255,255,0.12)', padding: '28px 20px', borderRadius: '14px', width: '200px', textAlign: 'center' }}>
              <div style={{ fontSize: '36px' }}>{item.icon}</div>
              <h4 style={{ fontSize: '16px', fontWeight: 'bold', marginTop: '12px' }}>{item.step}</h4>
              <p style={{ opacity: 0.75, marginTop: '8px', fontSize: '13px', lineHeight: 1.5 }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Coverage Types */}
      <div style={{ padding: '0 20px 60px', textAlign: 'center' }}>
        <h3 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '16px' }}>What Disruptions Are Covered</h3>
        <p style={{ opacity: 0.7, marginBottom: '32px', fontSize: '15px' }}>KavachPay covers income loss from external events — automatically, with zero paperwork.</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
          {[
            { icon: '🌧️', label: 'Heavy Rain', sub: '>50mm in zone' },
            { icon: '😷', label: 'Poor AQI', sub: 'Index >200' },
            { icon: '🌊', label: 'Flood Alert', sub: 'NDMA warning' },
            { icon: '⛈️', label: 'Severe Storm', sub: 'Wind >60kmh' },
            { icon: '🚫', label: 'Curfew', sub: 'Govt declared' },
          ].map((item, i) => (
            <div key={i} style={{ backgroundColor: 'rgba(255,255,255,0.1)', padding: '20px', borderRadius: '12px', width: '120px' }}>
              <div style={{ fontSize: '30px' }}>{item.icon}</div>
              <p style={{ fontSize: '13px', fontWeight: 'bold', marginTop: '8px' }}>{item.label}</p>
              <p style={{ fontSize: '11px', opacity: 0.7, marginTop: '4px' }}>{item.sub}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Floating Chatbot Button */}
      <button onClick={() => setShowChat(true)}
        style={{ position: 'fixed', bottom: '30px', right: '30px', backgroundColor: '#F0A500', color: 'white', width: '60px', height: '60px', borderRadius: '50%', border: 'none', fontSize: '26px', cursor: 'pointer', boxShadow: '0 4px 20px rgba(0,0,0,0.3)', zIndex: 1000 }}>
        💬
      </button>

      {showChat && <Chatbot onClose={() => setShowChat(false)} />}
    </div>
  );
}

export default App;