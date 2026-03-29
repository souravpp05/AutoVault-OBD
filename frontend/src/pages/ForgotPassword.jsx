import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { API_URL as BASE_URL } from '../config'

const API_URL = `${BASE_URL}/api`

export default function ForgotPassword() {
    const [username, setUsername] = useState('')
    const [otp, setOtp] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [successData, setSuccessData] = useState(null)
    const [resetSuccess, setResetSuccess] = useState(false)

    const handleRequestOtp = async (e) => {
        e.preventDefault()
        setError('')

        if (!username.trim()) {
            setError('Please enter your username')
            return
        }

        setLoading(true)
        try {
            const res = await fetch(`${API_URL}/auth/forgot-password-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: username.trim() })
            })
            const data = await res.json()

            if (!res.ok) {
                setError(data.error || 'Request failed')
                setLoading(false)
                return
            }

            setSuccessData(data)
            setLoading(false)
        } catch {
            setError('Connection error')
            setLoading(false)
        }
    }

    const handleResetPassword = async (e) => {
        e.preventDefault()
        setError('')

        if (!otp.trim()) {
            setError('Please enter the OTP')
            return
        }
        if (newPassword.length < 4) {
            setError('New PIN must be at least 4 digits')
            return
        }
        if (newPassword !== confirmPassword) {
            setError('PINs do not match')
            return
        }

        setLoading(true)
        try {
            const res = await fetch(`${API_URL}/auth/reset-password-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: username.trim(),
                    otp: otp.trim(),
                    newPassword
                })
            })
            const data = await res.json()

            if (!res.ok) {
                setError(data.error || 'Reset failed')
                setLoading(false)
                return
            }

            setResetSuccess(true)
            setLoading(false)
        } catch {
            setError('Connection error')
            setLoading(false)
        }
    }

    if (resetSuccess) {
        return (
            <div className="login-page">
                <div className="login-card">
                    <div className="logo">
                        <div className="logo-icon">
                            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M5 13l4 4L19 7" stroke="var(--accent-green)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                        <h1>Success!</h1>
                        <p>Your PIN has been reset.</p>
                    </div>
                    <Link to="/" className="mailto-btn" style={{ width: '100%', justifyContent: 'center' }}>
                        Return to Login
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="login-page">
            <div className="login-card">
                <div className="logo">
                    <div className="logo-icon">
                        <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M32 14L22 26h6v14h8V26h6L32 14z" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                            <circle cx="32" cy="46" r="5" stroke="currentColor" strokeWidth="2" fill="none" />
                        </svg>
                    </div>
                    <h1>Auto Vault</h1>
                    <p>Password Recovery</p>
                </div>

                {!successData ? (
                    <form onSubmit={handleRequestOtp} className="pin-form">
                        <p style={{ textAlign: 'center', marginBottom: '1rem', color: 'var(--text-muted)' }}>
                            Enter your username and we will send a 6-digit OTP to your registered Gmail.
                        </p>

                        <label htmlFor="username">Username</label>
                        <input
                            id="username"
                            type="text"
                            placeholder="Enter your username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            autoComplete="off"
                            autoFocus
                            className="text-input"
                        />

                        {error && <span className="error">{error}</span>}

                        <button type="submit" className="btn-primary" disabled={loading}>
                            {loading ? 'Sending OTP...' : 'Send OTP'}
                        </button>

                        <Link to="/" className="btn-back" title="Return to Login">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                        </Link>
                    </form>
                ) : (
                    <form onSubmit={handleResetPassword} className="pin-form">
                        <div className="forgot-result" style={{ marginBottom: '1rem' }}>
                            <p className="forgot-result-text" style={{ fontSize: '0.9rem' }}>
                                OTP sent to: <strong style={{ color: 'var(--accent-amber)' }}>{successData.maskedEmail}</strong>
                            </p>
                        </div>

                        <label htmlFor="otp">Enter 6-digit OTP</label>
                        <input
                            id="otp"
                            type="text"
                            placeholder="000000"
                            maxLength="6"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                            autoComplete="off"
                            autoFocus
                            className="text-input"
                            style={{ textAlign: 'center', fontSize: '1.25rem', letterSpacing: '0.5rem' }}
                        />

                        <label htmlFor="newPassword">New PIN</label>
                        <input
                            id="newPassword"
                            type="password"
                            placeholder="Enter new 4+ digit PIN"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="text-input"
                        />

                        <label htmlFor="confirmPassword">Confirm New PIN</label>
                        <input
                            id="confirmPassword"
                            type="password"
                            placeholder="Confirm new PIN"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="text-input"
                        />

                        {error && <span className="error">{error}</span>}

                        <button type="submit" className="btn-primary" disabled={loading}>
                            {loading ? 'Resetting PIN...' : 'Reset PIN'}
                        </button>

                        <button 
                            type="button" 
                            className="btn-back" 
                            onClick={() => setSuccessData(null)}
                            title="Go Back"
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                        </button>
                    </form>
                )}
            </div>

            <style>{`
        /* Existing Login Styles to maintain consistency */
        .login-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1.5rem;
          background: linear-gradient(165deg, #0c1222 0%, #0f172a 40%, #131c2e 100%);
        }
        .login-card {
          width: 100%;
          max-width: 400px;
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 20px;
          padding: 2.5rem;
          box-shadow: 0 25px 50px -12px rgba(0,0,0,.5);
        }
        .logo { text-align: center; margin-bottom: 1.5rem; }
        .logo-icon { width: 72px; height: 72px; margin: 0 auto 1rem; color: var(--accent-amber); }
        .logo-icon svg { width: 100%; height: 100%; }
        .logo h1 { font-family: var(--font-display); font-size: 1.75rem; font-weight: 600; color: var(--text); }
        .logo p { font-size: 0.9rem; color: var(--text-muted); margin-top: 0.25rem; }
        .pin-form { display: flex; flex-direction: column; gap: 0.75rem; }
        .pin-form label { font-size: 0.875rem; font-weight: 500; color: var(--text-muted); }
        .pin-form input { width: 100%; padding: 1rem 1.25rem; font-size: 1rem; background: var(--bg-elevated); border: 1px solid var(--border); border-radius: 12px; color: var(--text); transition: border-color 0.2s; }
        .pin-form input:focus { outline: none; border-color: var(--accent-amber); }
        .pin-form .error { font-size: 0.8rem; color: var(--accent-red); }
        .pin-form button[type="submit"] {
          margin-top: 0.5rem; padding: 1rem 1.5rem; font-size: 1rem; font-weight: 600; background: var(--accent-amber); color: #0c1222; border: none; border-radius: 12px; transition: background 0.2s, transform 0.1s; cursor: pointer;
        }
        .pin-form button[type="submit"]:hover:not(:disabled) { background: #fbbf24; }
        .pin-form button[type="submit"]:disabled { opacity: 0.6; cursor: not-allowed; }
        .back-to-login { color: var(--text-muted); font-size: 0.85rem; font-weight: 500; transition: color 0.2s; }
        .back-to-login:hover { color: var(--text); }
        .forgot-result { background: var(--bg-elevated); border: 1px solid var(--border); border-radius: 14px; padding: 1.5rem; text-align: center; animation: fadeUp 0.3s ease; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .forgot-result-icon { width: 40px; height: 40px; margin: 0 auto 0.75rem; color: var(--accent-green); }
        .mailto-btn { display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.75rem 1.5rem; font-size: 0.95rem; font-weight: 600; background: var(--accent-amber); color: #0c1222; border: none; border-radius: 10px; text-decoration: none; transition: background 0.2s; }
        .mailto-btn:hover { background: #fbbf24; }
      `}</style>
        </div>
    )
}
