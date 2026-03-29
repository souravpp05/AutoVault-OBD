import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useVehicles } from '../context/VehicleContext'

import { API_URL as BASE_URL } from '../config'

const API_URL = `${BASE_URL}/api`

export default function Login() {
  const [mode, setMode] = useState('login') // 'login', 'register', or 'forgot'
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [pin, setPin] = useState('')
  const [confirmPin, setConfirmPin] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [forgotResult, setForgotResult] = useState(null)
  const navigate = useNavigate()
  const { loginUser } = useVehicles()

  const handleForgotPin = async (e) => {
    e.preventDefault()
    setError('')
    setForgotResult(null)

    if (!username.trim()) {
      setError('Please enter your username')
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`${API_URL}/auth/forgot-pin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim() })
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Could not find account')
        setLoading(false)
        return
      }

      setForgotResult(data)
      setLoading(false)
    } catch {
      setError('Connection error')
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!username.trim()) {
      setError('Please enter your username')
      return
    }
    if (username.trim().length < 2) {
      setError('Username must be at least 2 characters')
      return
    }
    if (!pin.trim()) {
      setError('Please enter your PIN')
      return
    }
    if (pin.length < 4) {
      setError('PIN must be at least 4 digits')
      return
    }

    setLoading(true)

    if (mode === 'register') {
      // Register mode
      if (pin !== confirmPin) {
        setError('PINs do not match')
        setLoading(false)
        return
      }
      if (!email.trim()) {
        setError('Please enter your email')
        setLoading(false)
        return
      }

      try {
        const res = await fetch(`${API_URL}/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: username.trim(), password: pin, email: email.trim() })
        })
        const data = await res.json()

        if (!res.ok) {
          setError(data.error || 'Registration failed')
          setLoading(false)
          return
        }

        // Store user and fetch their vehicles
        loginUser(data)
        navigate('/vehicles')
      } catch {
        setError('Connection error')
        setLoading(false)
      }
    } else {
      // Login mode
      try {
        const res = await fetch(`${API_URL}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: username.trim(), password: pin })
        })
        const data = await res.json()

        if (!res.ok) {
          setError(data.error || 'Login failed')
          setLoading(false)
          return
        }

        // Store user and fetch their vehicles
        loginUser(data)
        navigate('/vehicles')
      } catch {
        setError('Connection error')
        setLoading(false)
      }
    }
  }

  return (
    <div className="login-page">
      <div className="login-aurora">
        <div className="login-orb login-orb-1" />
        <div className="login-orb login-orb-2" />
        <div className="login-orb login-orb-3" />
      </div>
      <div className="login-grid-overlay" />

      <div className="login-card glass">
        <div className="logo">
          <div className="logo-icon">
            <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M32 14L22 26h6v14h8V26h6L32 14z" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              <circle cx="32" cy="46" r="5" stroke="currentColor" strokeWidth="2" fill="none" />
            </svg>
          </div>
          <h1>Auto Vault</h1>
          <p>Vehicle & Maintenance Management</p>
        </div>

        {/* Mode Toggle */}
        <div className="mode-toggle">
          <button
            type="button"
            className={mode === 'login' ? 'active' : ''}
            onClick={() => { setMode('login'); setError(''); setForgotResult(null) }}
          >
            Login
          </button>
          <button
            type="button"
            className={mode === 'register' ? 'active' : ''}
            onClick={() => { setMode('register'); setError(''); setForgotResult(null) }}
          >
            Register
          </button>
        </div>

        {/* === FORGOT PIN MODE === */}
        {mode === 'forgot' && (
          <form onSubmit={handleForgotPin} className="pin-form">
            <div className="forgot-header">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="forgot-icon">
                <rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" strokeWidth="2" />
                <path d="M7 11V7a5 5 0 0110 0v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <circle cx="12" cy="16" r="1.5" fill="currentColor" />
              </svg>
              <h2>Forgot PIN?</h2>
              <p>Enter your username and we'll direct you to your registered email for recovery.</p>
            </div>

            <label htmlFor="forgot-username">Username</label>
            <input
              id="forgot-username"
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="off"
              autoFocus
              className="text-input"
            />

            {error && <span className="error">{error}</span>}

            {forgotResult && (
              <div className="forgot-result">
                <div className="forgot-result-icon">
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 8l9 6 9-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <rect x="2" y="5" width="20" height="14" rx="3" stroke="currentColor" strokeWidth="2" />
                  </svg>
                </div>
                <p className="forgot-result-text">
                  Recovery details will be sent to<br />
                  <strong>{forgotResult.maskedEmail}</strong>
                </p>
                <a
                  href={`mailto:${forgotResult.email}?subject=Auto%20Vault%20PIN%20Recovery&body=Hello%2C%0A%0AYou%20requested%20a%20PIN%20recovery%20for%20your%20Auto%20Vault%20account%20(username%3A%20${encodeURIComponent(username)}).%0A%0APlease%20check%20your%20account%20or%20contact%20the%20admin%20to%20reset%20your%20PIN.`}
                  className="mailto-btn"
                >
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="18" height="18">
                    <path d="M3 8l9 6 9-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <rect x="2" y="5" width="20" height="14" rx="3" stroke="currentColor" strokeWidth="2" />
                  </svg>
                  Open Email App
                </a>
              </div>
            )}

            {!forgotResult && (
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Looking up...' : 'Find My Account'}
              </button>
            )}

            <button
              type="button"
              className="btn-back"
              onClick={() => { setMode('login'); setError(''); setForgotResult(null) }}
              title="Back to Login"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            </button>
          </form>
        )}

        {/* === LOGIN / REGISTER MODE === */}
        {mode !== 'forgot' && (
          <form onSubmit={handleSubmit} className="pin-form">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              placeholder="Enter your name"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  document.getElementById('pin')?.focus();
                }
              }}
              autoComplete="new-password"
              autoFocus
              className="text-input"
            />

            {mode === 'register' && (
              <>
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="off"
                  className="text-input"
                />
              </>
            )}

            <label htmlFor="pin">{mode === 'register' ? 'Create 4-digit PIN' : 'Enter PIN'}</label>
            <input
              id="pin"
              type="password"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={8}
              placeholder="••••"
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
              autoComplete="new-password"
            />

            {mode === 'register' && (
              <>
                <label htmlFor="confirmPin">Confirm PIN</label>
                <input
                  id="confirmPin"
                  type="password"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={8}
                  placeholder="••••"
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                  autoComplete="off"
                />
              </>
            )}

            {error && <span className="error">{error}</span>}
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Please wait...' : mode === 'register' ? 'Create Account' : 'Login'}
            </button>

            {mode === 'login' && (
              <button
                type="button"
                className="forgot-link"
                onClick={() => { setMode('forgot'); setError(''); setForgotResult(null) }}
              >
                Forgot PIN?
              </button>
            )}
          </form>
        )}
      </div>

      <style>{`
        .login-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1.5rem;
          position: relative;
          overflow: hidden;
          background: radial-gradient(ellipse 100% 80% at 50% 0%, rgba(12,20,45,1) 0%, #04070f 70%);
        }

        /* Aurora orbs */
        .login-aurora { position: absolute; inset: 0; pointer-events: none; z-index: 0; }
        .login-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(100px);
          mix-blend-mode: screen;
          animation: float-orb 15s ease-in-out infinite alternate;
        }
        .login-orb-1 {
          width: 60vw; height: 60vw;
          top: -30%; left: -20%;
          background: radial-gradient(circle, rgba(76,201,240,0.14) 0%, transparent 70%);
          animation-duration: 13s;
        }
        .login-orb-2 {
          width: 50vw; height: 50vw;
          bottom: -25%; right: -15%;
          background: radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%);
          animation-duration: 17s;
          animation-direction: alternate-reverse;
        }
        .login-orb-3 {
          width: 35vw; height: 35vw;
          top: 20%; right: 10%;
          background: radial-gradient(circle, rgba(252,163,17,0.07) 0%, transparent 70%);
          animation-duration: 20s;
        }
        @keyframes float-orb {
          0%   { transform: translate(0, 0) scale(1); }
          50%  { transform: translate(4%, -6%) scale(1.07); }
          100% { transform: translate(-3%, 5%) scale(0.96); }
        }

        .login-grid-overlay {
          position: absolute; inset: 0; z-index: 1; pointer-events: none;
          background-image:
            linear-gradient(rgba(255,255,255,0.012) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.012) 1px, transparent 1px);
          background-size: 60px 60px;
          mask-image: radial-gradient(ellipse 70% 70% at 50% 50%, black 0%, transparent 100%);
        }

        .login-card {
          width: 100%;
          max-width: 420px;
          padding: 3rem 2.5rem;
          position: relative;
          z-index: 10;
          border-radius: 28px;
          background: rgba(6, 10, 22, 0.75);
          backdrop-filter: blur(24px) saturate(160%);
          border: 1px solid rgba(255,255,255,0.09);
          box-shadow: 0 24px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.07);
        }
        
        .logo { text-align: center; margin-bottom: 2.5rem; }
        .logo-icon {
          width: 64px; height: 64px; margin: 0 auto 1.5rem;
          color: var(--accent-amber);
          filter: drop-shadow(0 0 18px rgba(252,163,17,0.5));
          animation: logo-glow 3s ease-in-out infinite alternate;
        }
        @keyframes logo-glow {
          from { filter: drop-shadow(0 0 10px rgba(252,163,17,0.3)); }
          to   { filter: drop-shadow(0 0 22px rgba(252,163,17,0.6)); }
        }
        .logo h1 {
          font-family: var(--font-display);
          font-size: 2rem;
          font-weight: 900;
          letter-spacing: -1px;
          margin-bottom: 0.25rem;
          background: linear-gradient(135deg, #fff 0%, #fca311 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .logo p { font-size: 0.85rem; color: var(--text-muted); }

        .mode-toggle {
          display: flex;
          background: rgba(255,255,255,0.03);
          padding: 4px;
          border-radius: 14px;
          margin-bottom: 2rem;
          border: 1px solid rgba(255,255,255,0.07);
        }
        .mode-toggle button {
          flex: 1; padding: 0.75rem;
          border-radius: 10px; font-weight: 600; font-size: 0.9rem;
          color: var(--text-muted); background: transparent;
          transition: all 0.25s;
        }
        .mode-toggle button.active {
          background: linear-gradient(135deg, #fca311, #f59e0b);
          color: #000;
          box-shadow: 0 4px 16px rgba(252,163,17,0.3);
        }

        .pin-form { display: flex; flex-direction: column; gap: 1.25rem; }
        .pin-form label {
          font-size: 0.75rem; font-weight: 700;
          text-transform: uppercase; letter-spacing: 1.2px;
          color: var(--text-dim); margin-bottom: -0.5rem;
        }
        .pin-form input {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 12px; padding: 1rem;
          color: #fff; font-size: 1rem;
          transition: all var(--transition-fast);
        }
        .pin-form input[type="password"] {
          font-size: 1.5rem; letter-spacing: 0.5em; text-align: center;
        }
        .pin-form input:focus {
          background: rgba(255,255,255,0.055);
          border-color: var(--accent-amber);
          box-shadow: 0 0 0 4px rgba(252,163,17,0.14);
          outline: none;
        }
        .pin-form button[type="submit"] {
          background: linear-gradient(135deg, #fca311, #f59e0b);
          color: #000; padding: 1rem; border-radius: 12px;
          font-weight: 700; font-size: 1rem; margin-top: 0.5rem;
          box-shadow: 0 8px 24px rgba(252,163,17,0.35);
          transition: all 0.3s;
        }
        .pin-form button[type="submit"]:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 32px rgba(252,163,17,0.5);
        }
        .pin-form .error {
          color: var(--accent-red); font-size: 0.85rem; text-align: center;
          padding: 0.5rem; background: rgba(244,63,94,0.1); border-radius: 8px;
        }
        .forgot-link, .back-to-login {
          text-align: center; background: none;
          color: var(--text-muted); font-size: 0.85rem; font-weight: 500; margin-top: 0.5rem;
        }
        .forgot-link:hover, .back-to-login:hover { color: var(--accent-amber); }
      `}</style>
    </div>
  )
}
