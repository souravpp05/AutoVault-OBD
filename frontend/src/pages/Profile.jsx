import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { API_URL } from '../config'

export default function Profile() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ name: '', phone: '', address: '', photoUrl: '' })
  const [message, setMessage] = useState('')
  const [vehicles, setVehicles] = useState([])

  useEffect(() => {
    const auth = JSON.parse(localStorage.getItem('autoVaultAuth') || '{}')
    if (!auth.authenticated || !auth.userId) {
      navigate('/')
      return
    }

    const fetchProfile = fetch(`${API_URL}/api/auth/profile/${auth.userId}`).then(r => r.json())
    const fetchVehicles = fetch(`${API_URL}/api/vehicles?userId=${auth.userId}`).then(r => r.json())

    Promise.all([fetchProfile, fetchVehicles])
      .then(([profileData, vehiclesData]) => {
        if (!profileData.error) {
          setForm({ 
            name: profileData.name || '', 
            phone: profileData.phone || '', 
            address: profileData.address || '',
            photoUrl: profileData.photoUrl || ''
          })
        }
        
        if (Array.isArray(vehiclesData)) {
          setVehicles(vehiclesData)
        }
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setLoading(false)
      })
  }, [navigate])

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setForm(f => ({ ...f, photoUrl: reader.result }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setMessage('')
    const auth = JSON.parse(localStorage.getItem('autoVaultAuth') || '{}')
    
    try {
      const res = await fetch(`${API_URL}/api/auth/profile/${auth.userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      const data = await res.json()
      if (data.success) {
        setMessage({ type: 'success', text: 'Profile updated successfully!' })
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to update profile' })
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Server error' })
    }
    setSaving(false)
  }

  if (loading) return <div className="loading">Loading profile...</div>

  return (
    <div className="profile-page">
      <header className="profile-header">
        <button className="btn-back" onClick={() => navigate('/vehicles')} aria-label="Back">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <h1>Personal Profile</h1>
      </header>

      <main className="profile-main">
        <div className="profile-container">
          
          {/* LEFT SIDE: PROFILE FORM */}
          <div className="profile-section">
            <h2 className="section-title">Your Details</h2>
            <p className="form-desc">
              Make your profile stand out. This information is publicly visible in the Marketplace to help buyers and renters contact you.
            </p>
            
            <form className="profile-form card" onSubmit={handleSubmit}>
              
              <div className="photo-upload-section">
                <div className="photo-preview">
                  {form.photoUrl ? (
                    <img src={form.photoUrl} alt="Profile" />
                  ) : (
                    <div className="photo-placeholder">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    </div>
                  )}
                </div>
                <div className="photo-actions">
                  <label className="btn-secondary photo-btn">
                    Upload Photo
                    <input type="file" accept="image/*" onChange={handlePhotoUpload} hidden />
                  </label>
                  {form.photoUrl && (
                    <button type="button" className="btn-text" onClick={() => setForm(f => ({ ...f, photoUrl: '' }))}>Remove</button>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label>Full Name</label>
                <input 
                  value={form.name} 
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))} 
                  placeholder="e.g. Jane Doe"
                />
              </div>
              
              <div className="form-group">
                <label>Phone Number</label>
                <input 
                  value={form.phone} 
                  onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} 
                  placeholder="e.g. +1 555-0123"
                />
              </div>

              <div className="form-group">
                <label>Location / Address</label>
                <textarea 
                  value={form.address} 
                  onChange={e => setForm(f => ({ ...f, address: e.target.value }))} 
                  placeholder="e.g. 123 Main St, New York, NY"
                  rows={3}
                />
              </div>

              {message && (
                <div className={`message ${message.type}`}>
                  {message.text}
                </div>
              )}

              <div className="form-actions">
                <button type="submit" className="btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>

          {/* RIGHT SIDE: YOUR VEHICLES */}
          <div className="listings-section">
            <h2 className="section-title">Your Vehicles</h2>
            <p className="form-desc">All vehicles currently registered to your account.</p>
            
            <div className="listed-vehicles">
              {vehicles.length === 0 ? (
                <div className="empty-listings card">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="48" height="48"><path d="M3 3h18v18H3zM9 9h6v6H9z"/></svg>
                  <h3>No vehicles found</h3>
                  <p>Register a vehicle in the dashboard to see it here.</p>
                </div>
              ) : (
                vehicles.map(v => (
                  <div key={v.id} className="listed-item card" onClick={() => navigate(`/vehicle/${v.id}`)}>
                    <div className="listed-photo">
                      {v.photoUrl
                        ? <img src={v.photoUrl} alt={v.model} />
                        : <div className="listed-avatar">{(v.make?.[0] || '?').toUpperCase()}</div>
                      }
                    </div>
                    <div className="listed-info">
                      <h4>{v.year} {v.make} {v.model}</h4>
                      <p className="plate">{v.plate}</p>
                      <div className="listed-tags">
                        {v.isForRent && <span className="tag rent">Rent {v.rentPrice ? `₹${v.rentPrice}/d` : ''} {v.rentExtraKmPrice ? `+₹${v.rentExtraKmPrice}/km` : ''}</span>}
                        {v.isForSell && <span className="tag sell">Sale {v.sellPrice ? `₹${v.sellPrice.toLocaleString()}` : ''}</span>}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </main>

      <style>{`
        .profile-page {
          min-height: 100vh;
          background: var(--bg-dark);
          color: var(--text);
        }
        .profile-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem 2rem;
          border-bottom: 1px solid var(--border);
          background: rgba(12, 18, 34, 0.96);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          position: sticky;
          top: 0;
          z-index: 100;
        }
        .btn-back {
          background: transparent;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0.5rem;
          border-radius: 8px;
          transition: background 0.2s;
        }
        .btn-back:hover {
          background: var(--bg-card);
          color: var(--text);
        }
        .profile-header h1 {
          font-family: var(--font-display);
          font-size: 1.5rem;
          font-weight: 600;
        }
        .profile-main {
          padding: 2rem 1.5rem;
          max-width: 1000px;
          margin: 0 auto;
        }
        .profile-container {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2.5rem;
          align-items: start;
        }
        @media (max-width: 768px) {
          .profile-container { grid-template-columns: 1fr; }
        }
        .section-title {
          font-family: var(--font-display);
          font-size: 1.3rem;
          margin-bottom: 0.5rem;
          color: #fff;
        }
        .form-desc {
          color: var(--text-muted);
          font-size: 0.9rem;
          margin-bottom: 1.5rem;
          line-height: 1.5;
        }
        
        /* Form Styles */
        .profile-form {
          padding: 2rem;
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 16px;
        }
        .photo-upload-section {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          margin-bottom: 2rem;
          padding-bottom: 1.5rem;
          border-bottom: 1px solid var(--border);
        }
        .photo-preview {
          width: 100px;
          height: 100px;
          border-radius: 50%;
          overflow: hidden;
          background: var(--bg-elevated);
          border: 2px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .photo-preview img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .photo-placeholder {
          color: var(--text-muted);
          width: 40px;
          height: 40px;
        }
        .photo-actions {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          align-items: flex-start;
        }
        .btn-secondary {
          padding: 0.5rem 1rem;
          background: var(--bg-elevated);
          border: 1px solid var(--border);
          border-radius: 8px;
          color: var(--text);
          font-size: 0.85rem;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-secondary:hover {
          background: var(--border);
        }
        .btn-text {
          background: none;
          border: none;
          color: #ef4444;
          font-size: 0.8rem;
          cursor: pointer;
        }
        .form-group {
          margin-bottom: 1.5rem;
        }
        .form-group label {
          display: block;
          font-size: 0.85rem;
          font-weight: 500;
          color: var(--text-muted);
          margin-bottom: 0.5rem;
        }
        .form-group input, .form-group textarea {
          width: 100%;
          padding: 0.75rem 1rem;
          background: var(--bg-elevated);
          border: 1px solid var(--border);
          border-radius: 8px;
          color: var(--text);
          font-family: inherit;
        }
        .form-group input:focus, .form-group textarea:focus {
          outline: none;
          border-color: var(--accent-amber);
        }
        .form-actions {
          margin-top: 2rem;
        }
        .btn-primary {
          width: 100%;
          padding: 0.8rem;
          background: var(--accent-amber);
          color: #0c1222;
          font-weight: 600;
          border: none;
          border-radius: 8px;
          cursor: pointer;
        }
        .btn-primary:hover {
          background: #fbbf24;
        }
        .message {
          padding: 1rem;
          border-radius: 8px;
          margin-bottom: 1.5rem;
          font-size: 0.9rem;
        }
        .message.success { background: rgba(16, 185, 129, 0.1); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.2); }
        .message.error { background: rgba(239, 68, 68, 0.1); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.2); }
        
        /* Listed Vehicles Styles */
        .listed-vehicles {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .listed-item {
          display: flex;
          gap: 1rem;
          padding: 1rem;
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 12px;
          cursor: pointer;
          transition: transform 0.2s, border-color 0.2s;
        }
        .listed-item:hover {
          transform: translateY(-2px);
          border-color: var(--accent-amber);
        }
        .listed-photo {
          width: 80px;
          height: 80px;
          border-radius: 8px;
          overflow: hidden;
          background: var(--bg-elevated);
          flex-shrink: 0;
        }
        .listed-photo img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .listed-avatar {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2.5rem;
          font-weight: 700;
          color: var(--text-muted);
          background: var(--bg-card);
          text-transform: uppercase;
          font-family: var(--font-display);
        }
        .listed-info h4 {
          margin: 0 0 0.3rem 0;
          font-size: 1rem;
        }
        .listed-info .plate {
          font-family: monospace;
          color: var(--text-muted);
          font-size: 0.8rem;
          margin: 0 0 0.5rem 0;
        }
        .listed-tags {
          display: flex;
          gap: 0.5rem;
        }
        .tag {
          font-size: 0.7rem;
          padding: 0.2rem 0.5rem;
          border-radius: 12px;
          font-weight: 600;
          text-transform: uppercase;
        }
        .tag.rent { background: rgba(99,102,241,.15); color: #818cf8; }
        .tag.sell { background: rgba(245,158,11,.15); color: #fcd34d; }
        .empty-listings {
          padding: 3rem 2rem;
          text-align: center;
          border: 1px dashed var(--border);
          border-radius: 16px;
          color: var(--text-muted);
        }
        .empty-listings svg {
          opacity: 0.5;
          margin-bottom: 1rem;
        }
        .empty-listings h3 {
          margin-bottom: 0.5rem;
          color: var(--text);
        }
        .empty-listings p {
          font-size: 0.85rem;
        }
      `}</style>
    </div>
  )
}

