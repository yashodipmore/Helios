import React, { useState, useEffect } from 'react';
import './AuthModal.css';

const AuthModal = ({ isOpen, onClose, onAuthSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isRegistration, setIsRegistration] = useState(false);
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8001';

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!email || !email.includes('@')) { setError('Please enter a valid email address'); return; }
    if (!password || password.length < 6) { setError('Password must be at least 6 characters'); return; }
    if (isRegistration && !name.trim()) { setError('Please enter your name'); return; }

    setIsLoading(true); setError('');
    
    try {
      const endpoint = isRegistration ? '/api/auth/register' : '/api/auth/login';
      const payload = isRegistration 
        ? { email, password, name: name.trim() }
        : { email, password };

      const res = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      
      if (res.ok) {
        localStorage.setItem('helios_token', data.token);
        localStorage.setItem('helios_user', JSON.stringify(data.user));
        setSuccess(isRegistration ? 'Account created successfully!' : 'Welcome back!');
        setTimeout(() => { 
          onAuthSuccess?.(data.user); 
          onClose(); 
          resetForm(); 
        }, 800);
      } else {
        setError(data.detail || 'Authentication failed. Please try again.');
      }
    } catch {
      setError('Cannot reach server. Please check your connection.');
    } finally { 
      setIsLoading(false); 
    }
  };

  const resetForm = () => {
    setEmail(''); setPassword(''); setName('');
    setError(''); setSuccess('');
  };

  if (!isOpen) return null;

  return (
    <div className="auth-overlay" onClick={e => { if (e.target === e.currentTarget) { resetForm(); onClose(); } }}>
      <div className="auth-card">
        
        {/* Header */}
        <div className="auth-card-top">
          <div className="auth-brand">
            <div className="auth-logo-mark">
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M12 3L16 11H8L12 3Z" fill="white"/>
                <circle cx="12" cy="17" r="4" fill="white"/>
              </svg>
            </div>
            <div className="auth-brand-name">
              <span>HELIOS</span>
              <span>AI Platform</span>
            </div>
          </div>
          <button className="auth-close-btn" onClick={() => { resetForm(); onClose(); }} aria-label="Close">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="auth-card-body">
          <div className="auth-heading">
            <h2>{isRegistration ? 'Create your account' : 'Welcome back'}</h2>
            <p>{isRegistration ? 'Get started with AI-powered solar monitoring' : 'Enter your credentials to continue'}</p>
          </div>

          {/* Alerts */}
          {error && (
            <div className="auth-alert error">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 8v4M12 16h.01"/>
              </svg>
              {error}
            </div>
          )}
          {success && (
            <div className="auth-alert success">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
              {success}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit}>
            
            {isRegistration && (
              <div className="input-group">
                <label htmlFor="name">Full Name</label>
                <div className="input-wrapper">
                  <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="John Doe"
                    disabled={isLoading}
                    autoComplete="name"
                  />
                </div>
              </div>
            )}

            <div className="input-group">
              <label htmlFor="email">Email address</label>
              <div className="input-wrapper">
                <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="4" width="20" height="16" rx="2"/>
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                </svg>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  disabled={isLoading}
                  autoFocus
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="input-group">
              <label htmlFor="password">Password</label>
              <div className="input-wrapper">
                <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  disabled={isLoading}
                  autoComplete={isRegistration ? 'new-password' : 'current-password'}
                  style={{ paddingRight: '44px' }}
                />
                <button 
                  type="button" 
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#a8a7a2',
                    padding: '4px'
                  }}
                >
                  {showPassword ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button className="btn-primary" type="submit" disabled={isLoading || !email || !password}>
              {isLoading ? (
                <span className="spinner" />
              ) : (
                isRegistration ? 'Create account' : 'Sign in'
              )}
            </button>
          </form>

          <div className="auth-footer">
            <span>{isRegistration ? 'Already have an account?' : "Don't have an account?"}</span>
            <button className="link-btn" onClick={() => { setIsRegistration(!isRegistration); setError(''); }}>
              {isRegistration ? 'Sign in' : 'Sign up'}
            </button>
          </div>

          <p className="auth-legal">
            By continuing, you agree to our <a href="#terms">Terms</a> and <a href="#privacy">Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
