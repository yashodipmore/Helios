import React, { useState, useRef, useEffect } from 'react';
import './AuthModal.css';

const AuthModal = ({ isOpen, onClose, onAuthSuccess }) => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [step, setStep] = useState('email');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isRegistration, setIsRegistration] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [demoOtp, setDemoOtp] = useState('');
  const [success, setSuccess] = useState('');

  const otpInputRefs = useRef([]);
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8001';

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  useEffect(() => {
    if (step === 'otp') otpInputRefs.current[0]?.focus();
  }, [step]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const handleSendOtp = async () => {
    if (!email || !email.includes('@')) { setError('Please enter a valid email address'); return; }
    setIsLoading(true); setError('');
    try {
      const res = await fetch(`${API_URL}/api/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, is_registration: isRegistration })
      });
      const data = await res.json();
      if (res.ok) {
        setStep('otp'); setCountdown(300);
        if (data.demo_otp) setDemoOtp(data.demo_otp);
      } else {
        setError(data.detail || 'Failed to send code. Please try again.');
      }
    } catch {
      setError('Cannot reach server. Please check your connection.');
    } finally { setIsLoading(false); }
  };

  const handleOtpChange = (index, value) => {
    if (value.length > 1) value = value[0];
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) otpInputRefs.current[index + 1]?.focus();
    if (newOtp.every(d => d !== '')) handleVerifyOtp(newOtp.join(''));
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0)
      otpInputRefs.current[index - 1]?.focus();
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(''));
      otpInputRefs.current[5]?.focus();
      handleVerifyOtp(pasted);
    }
  };

  const handleVerifyOtp = async (code = null) => {
    const otpCode = code || otp.join('');
    if (otpCode.length !== 6) { setError('Please enter the complete 6-digit code'); return; }
    setIsLoading(true); setError('');
    try {
      const res = await fetch(`${API_URL}/api/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: otpCode })
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('helios_token', data.token);
        localStorage.setItem('helios_user', JSON.stringify(data.user));
        setSuccess('Authenticated successfully');
        setTimeout(() => { onAuthSuccess?.(data.user); onClose(); resetForm(); }, 800);
      } else {
        setError(data.detail || 'Invalid code. Please try again.');
        setOtp(['', '', '', '', '', '']);
        otpInputRefs.current[0]?.focus();
      }
    } catch { setError('Cannot reach server.'); }
    finally { setIsLoading(false); }
  };

  const resetForm = () => {
    setEmail(''); setOtp(['', '', '', '', '', '']);
    setStep('email'); setError(''); setDemoOtp('');
    setCountdown(0); setSuccess('');
  };

  if (!isOpen) return null;

  return (
    <div className="ha-overlay" onClick={e => { if (e.target === e.currentTarget) { resetForm(); onClose(); } }}>
      <div className="ha-card">

        {/* Close */}
        <button className="ha-close" onClick={() => { resetForm(); onClose(); }} aria-label="Close">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </button>

        {/* Logo */}
        <div className="ha-logo">
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
            <rect width="40" height="40" rx="10" fill="#0A0A0A"/>
            <path d="M20 9L24 17H16L20 9Z" fill="#FFF"/>
            <circle cx="20" cy="25" r="4" fill="#FFF"/>
          </svg>
        </div>

        {/* Heading */}
        <h1 className="ha-title">
          {step === 'email'
            ? (isRegistration ? 'Create your account' : 'Sign in to Helios AI')
            : 'Enter verification code'}
        </h1>
        <p className="ha-subtitle">
          {step === 'email'
            ? (isRegistration
                ? 'Get started with AI-powered solar monitoring'
                : 'Welcome back. Enter your email to continue.')
            : <>We sent a 6-digit code to <strong>{email}</strong></>}
        </p>

        {/* Alerts */}
        {error && <div className="ha-msg ha-msg-err">{error}</div>}
        {success && <div className="ha-msg ha-msg-ok">{success}</div>}

        {/* ─── EMAIL STEP ─── */}
        {step === 'email' ? (
          <div className="ha-form">
            <label className="ha-label" htmlFor="ha-email">Email address</label>
            <input
              id="ha-email"
              className="ha-input"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@company.com"
              disabled={isLoading}
              onKeyDown={e => e.key === 'Enter' && handleSendOtp()}
              autoFocus
              autoComplete="email"
            />

            <button className="ha-btn" onClick={handleSendOtp} disabled={isLoading || !email}>
              {isLoading ? <span className="ha-spin" /> : (isRegistration ? 'Create account' : 'Continue')}
            </button>

            <p className="ha-switch">
              {isRegistration ? 'Already have an account? ' : "Don't have an account? "}
              <button onClick={() => { setIsRegistration(!isRegistration); setError(''); }}>
                {isRegistration ? 'Sign in' : 'Sign up'}
              </button>
            </p>
          </div>
        ) : (
          /* ─── OTP STEP ─── */
          <div className="ha-form">

            {demoOtp && <div className="ha-demo">Demo OTP: <strong>{demoOtp}</strong></div>}

            <div className="ha-otp-row" onPaste={handleOtpPaste}>
              {otp.map((digit, idx) => (
                <React.Fragment key={idx}>
                  <input
                    ref={el => otpInputRefs.current[idx] = el}
                    className={`ha-otp-box${digit ? ' filled' : ''}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={e => handleOtpChange(idx, e.target.value)}
                    onKeyDown={e => handleOtpKeyDown(idx, e)}
                    disabled={isLoading}
                    autoComplete="one-time-code"
                  />
                  {idx === 2 && <span className="ha-otp-dash">—</span>}
                </React.Fragment>
              ))}
            </div>

            <button className="ha-btn" onClick={() => handleVerifyOtp()} disabled={isLoading || otp.some(d => !d)}>
              {isLoading ? <span className="ha-spin" /> : 'Verify'}
            </button>

            <div className="ha-otp-footer">
              {countdown > 0
                ? <span className="ha-timer">Resend code in {Math.floor(countdown / 60)}:{String(countdown % 60).padStart(2, '0')}</span>
                : <button className="ha-link" onClick={() => { setOtp(['', '', '', '', '', '']); handleSendOtp(); }}>Resend code</button>
              }
              <span className="ha-dot">·</span>
              <button className="ha-link" onClick={() => { setStep('email'); setOtp(['', '', '', '', '', '']); setDemoOtp(''); setError(''); }}>
                Change email
              </button>
            </div>
          </div>
        )}

        <p className="ha-legal">
          By continuing, you agree to our <a href="#terms">Terms</a> and <a href="#privacy">Privacy Policy</a>.
        </p>
      </div>
    </div>
  );
};

export default AuthModal;
