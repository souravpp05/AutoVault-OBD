import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useVehicles } from '../context/VehicleContext'

export default function Vehicles() {
  const { vehicles, addVehicle, deleteVehicle, logout } = useVehicles()
  const navigate = useNavigate()
  const [form, setForm] = useState({ make: '', model: '', plate: '', year: '' })
  const [showForm, setShowForm] = useState(false)

  const handleAdd = (e) => {
    e.preventDefault()
    if (!form.make.trim() || !form.model.trim() || !form.plate.trim()) return
    addVehicle({
      make: form.make.trim(),
      model: form.model.trim(),
      plate: form.plate.trim().toUpperCase(),
      year: form.year || new Date().getFullYear(),
      fuelLogs: [],
      documents: [],
      alerts: [],
    })
    setForm({ make: '', model: '', plate: '', year: '' })
    setShowForm(false)
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const handleRemove = (e, v) => {
    e.stopPropagation()
    if (window.confirm(`Remove ${v.make} ${v.model} (${v.plate})? This will delete all fuel logs, documents, and alerts for this vehicle.`)) {
      deleteVehicle(v.id)
    }
  }

  return (
    <div className="vehicles-page">
      <div className="vp-aurora">
        <div className="vp-orb vp-orb-1" />
        <div className="vp-orb vp-orb-2" />
      </div>
      <div className="vp-grid-overlay" />

      <header className="vehicles-header glass">
        <button className="btn-back" onClick={() => navigate('/')} aria-label="Go back">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <div className="header-brand">
          <h1>My Vehicles</h1>
          <p>Fleet Intelligence Dashboard</p>
        </div>
        <div className="header-actions">
          <button className="btn-primary" onClick={() => navigate('/profile')} title="My Profile" aria-label="Profile">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            <span>Profile</span>
          </button>
          <button className="btn-secondary" onClick={handleLogout} title="Logout" aria-label="Logout" style={{ color: 'var(--accent-red)', borderColor: 'rgba(239, 68, 68, 0.3)' }}>
            Logout
          </button>
        </div>
      </header>

      <main className="vehicles-main">
        {vehicles.length === 0 && !showForm && (
          <div className="empty-state fade-in">
            <div className="empty-icon-container">🚗</div>
            <h2>No active vehicles</h2>
            <p>Connect your first vehicle to unlock real-time diagnostics and health tracking.</p>
            <button className="btn-primary" onClick={() => setShowForm(true)}>Initialize Fleet</button>
          </div>
        )}

        {(showForm || (vehicles.length > 0 && !showForm)) && (
          <div className="content-grid fade-in">
            {showForm && (
              <form className="add-form card glass" onSubmit={handleAdd}>
                <div className="form-header">
                  <h2>Add Vehicle</h2>
                  <p>Register a new unit to your vault</p>
                </div>
                <div className="form-grid">
                  <div className="input-group">
                    <label>Make</label>
                    <input value={form.make} onChange={e => setForm(f => ({ ...f, make: e.target.value }))} placeholder="e.g. Toyota" required />
                  </div>
                  <div className="input-group">
                    <label>Model</label>
                    <input value={form.model} onChange={e => setForm(f => ({ ...f, model: e.target.value }))} placeholder="e.g. Camry" required />
                  </div>
                  <div className="input-group">
                    <label>License Plate</label>
                    <input value={form.plate} onChange={e => setForm(f => ({ ...f, plate: e.target.value.toUpperCase() }))} placeholder="e.g. ABC 1234" required />
                  </div>
                  <div className="input-group">
                    <label>Year</label>
                    <input type="number" value={form.year} onChange={e => setForm(f => ({ ...f, year: e.target.value }))} placeholder={new Date().getFullYear()} min="1990" max={new Date().getFullYear() + 1} />
                  </div>
                </div>
                <div className="form-actions">
                  <button type="button" className="btn-ghost" onClick={() => { setShowForm(false); setForm({ make: '', model: '', plate: '', year: '' }) }}>Discard</button>
                  <button type="submit" className="btn-primary">Save Vehicle</button>
                </div>
              </form>
            )}

            {!showForm && vehicles.length > 0 && (
              <button className="btn-add-card glass" onClick={() => setShowForm(true)}>
                <div className="plus-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                </div>
                <span>Connect New Vehicle</span>
              </button>
            )}

            <div className="vehicle-list">
              {vehicles.map(v => (
                <article key={v.id} className="vehicle-card card glass" onClick={() => navigate(`/vehicle/${v.id}`)}>
                  <div className="vehicle-avatar-container">
                    <div className="vehicle-avatar">{v.make?.[0] || '?'}</div>
                  </div>
                  <div className="vehicle-info">
                    <h3>{v.make} {v.model}</h3>
                    <div className="plate-badge">{v.plate}</div>
                    <p className="year-text">{v.year ? `Model Year ${v.year}` : 'Year Unknown'}</p>
                  </div>
                  <div className="card-actions">
                    <button
                      type="button"
                      className="btn-remove-circle"
                      onClick={(e) => handleRemove(e, v)}
                      title="Remove vehicle"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}
      </main>

      <style>{`
        .vehicles-page {
          min-height: 100vh;
          position: relative;
          color: var(--text);
          padding-top: 80px;
          overflow-x: hidden;
          background: radial-gradient(ellipse 120% 60% at 50% -5%, rgba(10,18,40,1) 0%, #04070f 65%);
        }

        /* Aurora */
        .vp-aurora { position: absolute; inset: 0; pointer-events: none; z-index: 0; overflow: hidden; }
        .vp-orb {
          position: absolute; border-radius: 50%;
          filter: blur(120px); mix-blend-mode: screen;
          animation: float-orb 16s ease-in-out infinite alternate;
        }
        .vp-orb-1 {
          width: 55vw; height: 55vw; top: -25%; left: -15%;
          background: radial-gradient(circle, rgba(76,201,240,0.1) 0%, transparent 70%);
          animation-duration: 14s;
        }
        .vp-orb-2 {
          width: 45vw; height: 45vw; bottom: -20%; right: -10%;
          background: radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 70%);
          animation-duration: 19s;
          animation-direction: alternate-reverse;
        }
        @keyframes float-orb {
          0%   { transform: translate(0,0) scale(1); }
          50%  { transform: translate(3%,-5%) scale(1.07); }
          100% { transform: translate(-3%,4%) scale(0.95); }
        }
        .vp-grid-overlay {
          position: absolute; inset: 0; z-index: 1; pointer-events: none;
          background-image:
            linear-gradient(rgba(255,255,255,0.01) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.01) 1px, transparent 1px);
          background-size: 70px 70px;
          mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black 0%, transparent 100%);
        }

        .vehicles-header {
          position: fixed; top: 0; left: 0; right: 0; z-index: 1000;
          display: flex; justify-content: space-between; align-items: center;
          padding: 1rem 2rem; padding-left: 80px;
          margin: 1rem; border-radius: 20px;
          background: rgba(6,10,22,0.72);
          backdrop-filter: blur(20px) saturate(160%);
          border: 1px solid rgba(255,255,255,0.08);
          box-shadow: 0 8px 32px rgba(0,0,0,0.4);
        }
        .header-brand h1 {
          font-family: var(--font-display); font-size: 1.4rem; font-weight: 900;
          letter-spacing: -0.5px;
          background: linear-gradient(135deg, #fff 0%, #fca311 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .header-brand p {
          font-size: 0.72rem; color: var(--text-muted);
          text-transform: uppercase; letter-spacing: 1.2px; font-weight: 600;
        }
        .header-actions { display: flex; gap: 0.75rem; }

        .btn-profile {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.6rem 1.25rem;
          border-radius: 12px;
          color: var(--accent-amber);
          font-weight: 700;
          font-size: 0.85rem;
        }

        .btn-profile:hover {
          background: var(--accent-amber);
          color: #000;
        }

        .btn-icon.logout:hover {
          background: var(--accent-red);
          color: #fff;
        }

        .vehicles-main {
          padding: 2rem;
          max-width: 1000px;
          margin: 0 auto;
          position: relative;
          z-index: 10;
        }

        .empty-state {
          text-align: center;
          padding: 6rem 2rem;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .empty-icon-container {
          font-size: 4rem;
          margin-bottom: 2rem;
          width: 100px;
          height: 100px;
          background: rgba(252, 163, 17, 0.05);
          border-radius: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .empty-state h2 {
          font-family: var(--font-display);
          font-size: 2rem;
          margin-bottom: 1rem;
        }

        .empty-state p {
          color: var(--text-muted);
          max-width: 400px;
          margin-bottom: 2.5rem;
          line-height: 1.6;
        }

        .add-form {
          max-width: 600px;
          margin: 0 auto 3rem;
          padding: 2.5rem;
        }

        .form-header {
          margin-bottom: 2rem;
          text-align: center;
        }

        .form-header h2 {
          font-family: var(--font-display);
          font-size: 1.5rem;
          font-weight: 700;
        }

        .form-header p {
          font-size: 0.85rem;
          color: var(--text-muted);
        }

        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
        }

        .input-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .input-group label {
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          color: var(--text-dim);
          letter-spacing: 0.5px;
        }

        .input-group input {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--border);
          border-radius: 10px;
          padding: 0.75rem 1rem;
          color: #fff;
          font-size: 0.95rem;
        }

        .input-group input:focus {
          border-color: var(--accent-amber);
          background: rgba(255, 255, 255, 0.05);
          outline: none;
        }

        .form-actions {
          display: flex;
          gap: 1rem;
          margin-top: 2rem;
        }

        .form-actions button {
          flex: 1;
          padding: 0.85rem;
          border-radius: 10px;
          font-weight: 700;
        }

        .btn-ghost {
          background: transparent;
          border: 1px solid var(--border);
          color: var(--text-muted);
        }

        .btn-add-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          width: 100%;
          padding: 2.5rem;
          border-radius: 20px;
          border: 2px dashed var(--border);
          color: var(--text-muted);
          margin-bottom: 2rem;
          background: transparent;
        }

        .btn-add-card:hover {
          border-color: var(--accent-amber);
          color: var(--accent-amber);
          background: var(--accent-amber-glow);
        }

        .plus-icon {
          width: 48px;
          height: 48px;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .btn-add-card span {
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
          font-size: 0.8rem;
        }

        .vehicle-list {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1.5rem;
        }

        .vehicle-card {
          display: flex;
          align-items: center;
          gap: 1.25rem;
          padding: 1.5rem;
          position: relative;
        }

        .vehicle-avatar-container {
          position: relative;
        }

        .vehicle-avatar {
          width: 60px;
          height: 60px;
          background: linear-gradient(135deg, var(--accent-amber), #ffc300);
          border-radius: 18px;
          color: #000;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;

        .vehicle-thumb-img {
          width: 70px;
          height: 70px;
          border-radius: 18px;
          object-fit: cover;
          border: 2px solid var(--border);
        }
          font-size: 1.5rem;
          box-shadow: 0 5px 15px var(--accent-amber-glow);
        }

        .vehicle-info h3 {
          font-family: var(--font-display);
          font-size: 1.2rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
        }

        .plate-badge {
          display: inline-block;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--border);
          padding: 0.25rem 0.6rem;
          border-radius: 6px;
          font-family: monospace;
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--accent-amber);
          margin-bottom: 0.4rem;
        }

        .year-text {
          font-size: 0.75rem;
          color: var(--text-dim);
          font-weight: 600;
        }

        .card-actions {
          position: absolute;
          top: 1rem;
          right: 1rem;
          display: flex;
          gap: 0.5rem;
        }

        .btn-remove-circle {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-dim);
          background: transparent;
        }

        .btn-remove-circle:hover {
          color: var(--accent-red);
          background: rgba(244, 63, 94, 0.1);
        }
      `}</style>
    </div>
  )
}
