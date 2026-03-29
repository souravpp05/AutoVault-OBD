import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

const API_URL = 'http://localhost:3001/api'

export default function ResetPassword() {
    const [searchParams] = useSearchParams()
    const token = searchParams.get('token')

    const [pin, setPin] = useState('')
    const [confirmPin, setConfirmPin] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const navigate = useNavigate()

    // If no token in URL, show error
    if (!token) {
        return (
            <div className="login-page">
                <div className="login-card" style={{ textAlign: 'center' }}>
                    <h2>Invalid Link</h2>
                    <p style={{ color: 'var(--text-muted)', margin: '1rem 0' }}>This password reset link is invalid or is missing a token.</p>
                    <button onClick={() => navigate('/')} className="mailto-btn">Return to Login</button>
                </div>
            </div>
        )
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')

        if (!pin.trim()) {
            setError('Please enter a new PIN')
            return
        }
        if (pin.length < 4) {
            setError('PIN must be at least 4 digits')
            return
        }
        if (pin !== confirmPin) {
            setError('PINs do not match')
            return
        }

        setLoading(true)
        try {
            const res = await fetch(`${API_URL}/auth/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, newPassword: pin })
            })
            const data = await res.json()

            if (!res.ok) {
                setError(data.error || 'Failed to reset password. The link might be expired.')
                setLoading(false)
                return
            }

            setSuccess(true)
            setLoading(false)
        } catch {
            setError('Connection error')
            setLoading(false)
        }
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
                    <p>Create New PIN</p>
                </div>

                {!success ? (
                    <form onSubmit={handleSubmit} className="pin-form">
                        <p style={{ textAlign: 'center', marginBottom: '1rem', color: 'var(--text-muted)' }}>
                            Please enter your new 4-digit PIN below.
                        </p>

                        <label htmlFor="pin">New PIN</label>
                        <input
                            id="pin"
                            type="password"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            maxLength={8}
                            placeholder="••••"
                            value={pin}
                            onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                            autoComplete="off"
                            autoFocus
                        />

                        <label htmlFor="confirmPin">Confirm New PIN</label>
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

                        {error && <span className="error">{error}</span>}
                        <button type="submit" className="btn-primary" disabled={loading}>
                            {loading ? 'Saving...' : 'Reset PIN'}
                        </button>
                    </form>
                ) : (
                    <div className="forgot-result">
                        <div className="forgot-result-icon">
                            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M3 8l9 6 9-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <polyline points="9 11 12 14 22 4" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                        <h3 style={{ color: 'var(--text)', marginBottom: '0.5rem' }}>Success!</h3>
                        <p className="forgot-result-text">
                            Your PIN has been successfully reset. You can now login with your new PIN.
                        </p>
                        <button onClick={() => navigate('/')} className="mailto-btn" style={{ width: '100%', justifyContent: 'center', marginTop: '1rem' }}>
                            Go to Login
                        </button>
                    </div>
                )}
            </div>

            {/* Reuse exact same styling to avoid duplicates/mismatches */}
            <style>{`
        .login-page { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 1.5rem; background: linear-gradient(165deg, #0c1222 0%, #0f172a 40%, #131c2e 100%); }
        .login-card { width: 100%; max-width: 400px; background: var(--bg-card); border: 1px solid var(--border); border-radius: 20px; padding: 2.5rem; box-shadow: 0 25px 50px -12px rgba(0,0,0,.5); }
        .logo { text-align: center; margin-bottom: 1.5rem; }
        .logo-icon { width: 72px; height: 72px; margin: 0 auto 1rem; color: var(--accent-amber); }
        .logo-icon svg { width: 100%; height: 100%; }
        .logo h1 { font-family: var(--font-display); font-size: 1.75rem; font-weight: 600; color: var(--text); }
        .logo p { font-size: 0.9rem; color: var(--text-muted); margin-top: 0.25rem; }
        .pin-form { display: flex; flex-direction: column; gap: 0.75rem; }
        .pin-form label { font-size: 0.875rem; font-weight: 500; color: var(--text-muted); }
        .pin-form input { width: 100%; padding: 1rem 1.25rem; font-size: 1.25rem; letter-spacing: 0.3em; text-align: center; background: var(--bg-elevated); border: 1px solid var(--border); border-radius: 12px; color: var(--text); transition: border-color 0.2s; }
        .pin-form input:focus { outline: none; border-color: var(--accent-amber); }
        .pin-form .error { font-size: 0.8rem; color: var(--accent-red); }
        .pin-form button[type="submit"] { margin-top: 0.5rem; padding: 1rem 1.5rem; font-size: 1rem; font-weight: 600; background: var(--accent-amber); color: #0c1222; border: none; border-radius: 12px; transition: background 0.2s, transform 0.1s; cursor: pointer; }
        .pin-form button[type="submit"]:hover:not(:disabled) { background: #fbbf24; }
        .pin-form button[type="submit"]:disabled { opacity: 0.6; cursor: not-allowed; }
        .forgot-result { background: var(--bg-elevated); border: 1px solid var(--border); border-radius: 14px; padding: 1.5rem; text-align: center; animation: fadeUp 0.3s ease; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .forgot-result-icon { width: 40px; height: 40px; margin: 0 auto 0.75rem; color: var(--accent-green); }
        .mailto-btn { display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.75rem 1.5rem; font-size: 0.95rem; font-weight: 600; background: var(--accent-amber); color: #0c1222; border: none; border-radius: 10px; cursor: pointer; text-decoration: none; transition: background 0.2s; box-sizing: border-box; }
        .mailto-btn:hover { background: #fbbf24; }
      `}</style>
        </div>
    )
}
