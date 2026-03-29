import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { API_URL } from '../config'

function ObdStrip({ obd }) {
  if (!obd || !obd.lastUpdated) {
    return <div className="obd-strip obd-empty">📡 No OBD data recorded</div>
  }
  const score = obd.healthScore ?? 0
  const statusColor = score >= 80 ? '#10b981' : score >= 50 ? '#f59e0b' : '#ef4444'
  return (
    <div className="obd-strip">
      <span className="obd-chip" style={{ color: statusColor }}>
        ❤️ {score} <em>{obd.healthStatus}</em>
      </span>
      <span className="obd-chip">🔋 {obd.batteryVoltage?.toFixed(1) ?? '—'}V</span>
      <span className="obd-chip">⛽ {obd.fuelPercent ?? '—'}%</span>
    </div>
  )
}

function ObdDetailPanel({ vehicle, onClose }) {
  const obd = vehicle?.obdHealth
  const hasData = obd && obd.lastUpdated
  const score = obd?.healthScore ?? 0
  const healthColor = score >= 80 ? '#10b981' : score >= 50 ? '#f59e0b' : '#ef4444'

  return (
    <div className="detail-overlay" onClick={onClose}>
      <div className="detail-panel" onClick={e => e.stopPropagation()}>
        <button className="detail-close" onClick={onClose}>✕</button>

        {/* === BANNER === */}
        <div className="detail-banner">
          <div className="banner-gradient" />
          <div className="banner-content">
            <div className="banner-left">
              <h2 className="banner-make">{vehicle.make}</h2>
              <h1 className="banner-model">{vehicle.model}</h1>
              <div className="banner-meta">
                <span>{vehicle.year || 'N/A'}</span>
                <span className="banner-dot">·</span>
                <span>{vehicle.plate}</span>
                {vehicle.location && <><span className="banner-dot">·</span><span>📍 {vehicle.location}</span></>}
              </div>
              <div className="banner-badges">
                {vehicle.isForRent && (
                  <span className="banner-badge rent">
                    🚗 Rent · <strong>{vehicle.rentPrice ? `₹${vehicle.rentPrice}/day` : 'Price TBD'}</strong>
                    {vehicle.rentExtraKmPrice && <span> +₹{vehicle.rentExtraKmPrice}/km</span>}
                  </span>
                )}
                {vehicle.isForSell && (
                  <span className="banner-badge sell">
                    💰 Sale · <strong>{vehicle.sellPrice ? `₹${vehicle.sellPrice.toLocaleString()}` : 'Price TBD'}</strong>
                  </span>
                )}
              </div>
            </div>
            {hasData && (
              <div className="banner-score" style={{ borderColor: healthColor }}>
                <span className="score-num" style={{ color: healthColor }}>{score}</span>
                <span className="score-tag" style={{ color: healthColor }}>{obd.healthStatus}</span>
              </div>
            )}
          </div>
        </div>

        {/* OBD Section */}
        <div className="detail-section">
          <h3>📡 OBD Health Reading</h3>
          {!hasData ? (
            <div className="detail-no-obd">No OBD data has been recorded for this vehicle yet.</div>
          ) : (
            <>
              {obd.checkEngine && (
                <div className="check-engine-alert">
                  ⚠️ Check Engine: <strong>{obd.checkEngineCode}</strong>
                  <br /><small>{obd.checkEngineDesc}</small>
                </div>
              )}
              <div className="detail-grid">
                <div className="detail-stat">
                  <span className="stat-label">🔋 Battery</span>
                  <span className="stat-value">{obd.batteryVoltage?.toFixed(1)}V</span>
                  <span className="stat-sub">{obd.batteryHealth}% · {obd.batteryStatus}</span>
                </div>
                <div className="detail-stat">
                  <span className="stat-label">⛽ Fuel</span>
                  <span className="stat-value">{obd.fuelPercent}%</span>
                  <span className="stat-sub">{obd.fuelLevel?.toFixed(1)}L / {obd.tankCapacity}L</span>
                </div>
                <div className="detail-stat">
                  <span className="stat-label">🛣️ Odometer</span>
                  <span className="stat-value">{obd.odometer?.toLocaleString()}</span>
                  <span className="stat-sub">km</span>
                </div>
                <div className="detail-stat">
                  <span className="stat-label">📈 Avg Mileage</span>
                  <span className="stat-value">{obd.avgMileage?.toFixed(1) ?? '—'}</span>
                  <span className="stat-sub">km/L</span>
                </div>
              </div>
              <p className="detail-updated">Last updated: {new Date(obd.lastUpdated).toLocaleString()}</p>
            </>
          )}
        </div>

        {/* Owner Section */}
        <div className="detail-section">
          <h3>👤 Owner Info</h3>
          <div className="owner-details">
            <p><strong>Name:</strong> {vehicle.ownerInfo?.name || '—'}</p>
            <p><strong>Phone:</strong> {vehicle.ownerInfo?.phone || '—'}</p>
            <p><strong>Location:</strong> {vehicle.location || vehicle.ownerInfo?.address || '—'}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Marketplace() {
  const navigate = useNavigate()
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [selected, setSelected] = useState(null)
  const [viewingPhoto, setViewingPhoto] = useState(null)
  const [locationSearch, setLocationSearch] = useState('')

  useEffect(() => {
    fetch(`${API_URL}/api/marketplace/vehicles`)
      .then(res => res.json())
      .then(data => {
        setVehicles(data)
        setLoading(false)
      })
      .catch(err => {
        console.error('Failed to load marketplace data:', err)
        setLoading(false)
      })
  }, [])

  const filteredVehicles = vehicles.filter(v => {
    const typeMatch = filter === 'rent' ? v.isForRent : filter === 'sell' ? v.isForSell : (v.isForRent || v.isForSell)
    if (!typeMatch) return false
    if (!locationSearch.trim()) return true
    const q = locationSearch.trim().toLowerCase()
    const loc = (v.location || v.ownerInfo?.address || '').toLowerCase()
    return loc.includes(q)
  })

  return (
    <div className="marketplace-page">
      <header className="marketplace-header">
        <div className="header-left">
          <button className="btn-back" onClick={() => navigate('/')}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          </button>
          <div>
            <h1>Marketplace</h1>
            <p>Find the perfect vehicle to rent or buy</p>
          </div>
        </div>
        <div className="header-actions">
          {sessionStorage.getItem('autoVaultPin') && (
            <button className="btn-primary" onClick={() => navigate('/profile')} title="My Profile" aria-label="Profile">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              My Profile
            </button>
          )}
        </div>
      </header>

      <div className="search-bar-row">
        <div className="search-wrapper">
          <svg className="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input
            className="location-search"
            type="text"
            placeholder="Search by location (e.g. Mumbai, Delhi...)"
            value={locationSearch}
            onChange={e => setLocationSearch(e.target.value)}
          />
          {locationSearch && (
            <button className="search-clear" onClick={() => setLocationSearch('')}>✕</button>
          )}
        </div>
        {locationSearch && (
          <p className="search-result-hint">
            {filteredVehicles.length === 0
              ? `No vehicles found near "${locationSearch}"`
              : `${filteredVehicles.length} vehicle${filteredVehicles.length > 1 ? 's' : ''} found near "${locationSearch}"`}
          </p>
        )}
      </div>

      <div className="filter-tabs">
        <button className={filter === 'all' ? 'active' : ''} onClick={() => setFilter('all')}>All Vehicles</button>
        <button className={filter === 'rent' ? 'active' : ''} onClick={() => setFilter('rent')}>For Rent</button>
        <button className={filter === 'sell' ? 'active' : ''} onClick={() => setFilter('sell')}>For Sale</button>
      </div>

      <main className="marketplace-main">
        {loading ? (
          <div className="loading">Loading vehicles...</div>
        ) : filteredVehicles.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🚙</div>
            <h2>No vehicles found</h2>
            <p>There are currently no vehicles available matching your filter.</p>
          </div>
        ) : (
          <div className="vehicle-grid">
            {filteredVehicles.map(v => (
              <article key={v.id} className="market-card card" onClick={() => setSelected(v)} title="Click to see OBD details">

                <div className="card-content">
                  <h3>{v.make} {v.model}</h3>
                  <p className="vehicle-details">{v.year ? v.year : 'Unknown Year'} · Plate: {v.plate}</p>

                  {/* OBD Strip */}
                  <ObdStrip obd={v.obdHealth} />

                  {/* Price Info */}
                  {(v.isForRent || v.isForSell) && (
                    <div className="price-info-block">
                      {v.isForRent && (
                        <div className="price-row rent-price">
                          <span className="price-label">🚗 Rent</span>
                          <div className="price-values">
                            {v.rentPrice ? <strong>₹{v.rentPrice.toLocaleString()}<span className="price-unit">/day</span></strong> : <span className="price-na">Price TBD</span>}
                            {v.rentExtraKmPrice && <span className="price-extra">+₹{v.rentExtraKmPrice}/km extra</span>}
                          </div>
                        </div>
                      )}
                      {v.isForSell && (
                        <div className="price-row sell-price">
                          <span className="price-label">💰 Sale</span>
                          <div className="price-values">
                            {v.sellPrice ? <strong>₹{v.sellPrice.toLocaleString()}</strong> : <span className="price-na">Price TBD</span>}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="owner-info">
                    <div className="owner-header">
                      {v.ownerInfo?.photoUrl ? (
                        <img src={v.ownerInfo.photoUrl} alt="Owner" className="owner-photo" />
                      ) : (
                        <div className="owner-photo-placeholder">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                        </div>
                      )}
                      <h4>Seller / Owner Info</h4>
                    </div>
                    <div className="owner-details">
                      <p><strong>Name:</strong> {v.ownerInfo?.name || '—'}</p>
                      <p><strong>Phone:</strong> {v.ownerInfo?.phone || '—'}</p>
                      <p><strong>Location:</strong> {v.location || v.ownerInfo?.address || '—'}</p>
                    </div>
                  </div>

                  <div className="view-obd-hint">🔍 Click card to view full OBD report</div>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

      {/* Full Screen Image Viewer */}
      {viewingPhoto && (
        <div className="photo-viewer-overlay" onClick={() => setViewingPhoto(null)}>
          <div className="photo-viewer-content" onClick={e => e.stopPropagation()}>
            <button className="close-viewer" onClick={() => setViewingPhoto(null)}>✕</button>
            <img src={viewingPhoto} alt="Full view" className="full-photo" />
          </div>
        </div>
      )}

      {/* OBD Detail Panel */}
      {selected && <ObdDetailPanel vehicle={selected} onClose={() => setSelected(null)} />}

      <style>{`
        .marketplace-page {
          min-height: 100vh;
          background: var(--bg-dark);
          color: var(--text);
        }
        .marketplace-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1.5rem;
          padding: 1.5rem 2rem;
          padding-left: 80px;
          background: var(--bg-elevated);
          border-bottom: 1px solid var(--border);
        }
        .header-left {
          display: flex;
          align-items: center;
          gap: 1rem;
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
        .btn-back:hover { background: var(--bg-card); color: var(--text); }
        .marketplace-header h1 {
          font-family: var(--font-display);
          font-size: 1.75rem;
          font-weight: 600;
          margin-bottom: 0.25rem;
        }
        .marketplace-header p { color: var(--text-muted); font-size: 0.95rem; }
        .filter-tabs {
          display: flex;
          justify-content: center;
          gap: 1rem;
          padding: 1.5rem;
          border-bottom: 1px solid var(--border);
        }
        .filter-tabs button {
          background: transparent;
          border: 1px solid var(--border);
          padding: 0.6rem 1.5rem;
          border-radius: 20px;
          color: var(--text-muted);
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }
        .filter-tabs button:hover { border-color: var(--text-muted); color: var(--text); }
        .filter-tabs button.active {
          background: var(--accent-amber);
          color: #0c1222;
          border-color: var(--accent-amber);
        }

        /* Search Bar */
        .search-bar-row {
          padding: 1rem 2rem 0;
          max-width: 800px;
          margin: 0 auto;
        }
        .search-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }
        .search-icon {
          position: absolute;
          left: 1rem;
          color: var(--text-muted);
          pointer-events: none;
        }
        .location-search {
          width: 100%;
          padding: 0.85rem 3rem;
          background: rgba(255,255,255,0.05);
          border: 1px solid var(--border);
          border-radius: 50px;
          color: #fff;
          font-size: 0.95rem;
          font-family: var(--font-body);
          transition: all 0.2s;
          outline: none;
        }
        .location-search::placeholder { color: var(--text-muted); }
        .location-search:focus {
          border-color: var(--accent-amber);
          background: rgba(252,163,17,0.05);
          box-shadow: 0 0 0 3px rgba(252,163,17,0.1);
        }
        .search-clear {
          position: absolute;
          right: 1rem;
          background: transparent;
          border: none;
          color: var(--text-muted);
          font-size: 1rem;
          cursor: pointer;
          padding: 0.25rem;
          border-radius: 50%;
          transition: color 0.2s;
        }
        .search-clear:hover { color: #fff; }
        .search-result-hint {
          margin-top: 0.5rem;
          font-size: 0.82rem;
          color: var(--accent-amber);
          text-align: center;
          font-weight: 500;
        }
        .marketplace-main { padding: 2rem; max-width: 1200px; margin: 0 auto; }
        .vehicle-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 2rem;
        }
        .market-card {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 16px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s;
        }
        .market-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 30px rgba(0,0,0,0.4);
          border-color: var(--accent-amber);
        }
        .photo-container {
          position: relative;
          height: 200px;
          background: var(--bg-elevated);
          overflow: hidden;
        }
        .vehicle-photo { width: 100%; height: 100%; object-fit: cover; }
        .no-photo-bar {
          padding: 0.75rem 1rem;
          background: linear-gradient(135deg, rgba(30,40,70,0.8), rgba(20,28,50,0.9));
          display: flex;
          align-items: center;
          justify-content: flex-start;
          gap: 0.5rem;
          border-bottom: 1px solid var(--border);
          min-height: 44px;
        }
        .badges { position: absolute; top: 1rem; right: 1rem; display: flex; gap: 0.5rem; }
        .no-photo-bar .badges { position: relative; top: unset; right: unset; }
        .badge {
          padding: 0.3rem 0.8rem;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          color: #fff;
          backdrop-filter: blur(4px);
        }
        .badge.rent { background: rgba(59, 130, 246, 0.9); }
        .badge.sell { background: rgba(16, 185, 129, 0.9); }
        .card-content { padding: 1.5rem; flex: 1; }
        .card-content h3 { font-family: var(--font-display); font-size: 1.25rem; margin-bottom: 0.25rem; }
        .vehicle-details {
          color: var(--text-muted);
          font-size: 0.9rem;
          margin-bottom: 0.75rem;
        }

        /* Price Info Block */
        .price-info-block {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          margin: 0.75rem 0;
          padding: 0.75rem 1rem;
          background: rgba(255,255,255,0.03);
          border: 1px solid var(--border);
          border-radius: 12px;
        }
        .price-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          flex-wrap: wrap;
        }
        .price-label {
          font-size: 0.78rem;
          font-weight: 700;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          white-space: nowrap;
        }
        .price-values {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 0.1rem;
        }
        .price-values strong {
          font-family: var(--font-display);
          font-size: 1.1rem;
          color: #fff;
        }
        .price-unit {
          font-size: 0.7rem;
          font-weight: 500;
          color: var(--text-muted);
          margin-left: 2px;
        }
        .price-extra {
          font-size: 0.72rem;
          color: var(--text-muted);
        }
        .price-na {
          font-size: 0.8rem;
          color: var(--text-muted);
          font-style: italic;
        }
        .rent-price .price-values strong { color: #60a5fa; }
        .sell-price .price-values strong { color: #34d399; }

        /* OBD Strip */
        .obd-strip {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          padding: 0.6rem 0.75rem;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 10px;
          margin-bottom: 1rem;
        }
        .obd-strip.obd-empty {
          color: var(--text-muted);
          font-size: 0.8rem;
          justify-content: center;
        }
        .obd-chip {
          font-size: 0.8rem;
          color: var(--text);
          display: flex;
          align-items: center;
          gap: 0.25rem;
          white-space: nowrap;
        }
        .obd-chip em { font-style: normal; color: var(--text-muted); }

        /* View hint */
        .view-obd-hint {
          text-align: center;
          font-size: 0.78rem;
          color: var(--accent-amber);
          opacity: 0.7;
          margin-top: 0.75rem;
        }

        .owner-info {
          background: rgba(255, 255, 255, 0.03);
          padding: 1rem;
          border-radius: 12px;
          border-top: 1px dashed var(--border);
          padding-top: 1rem;
          margin-top: 0.5rem;
        }
        .owner-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 0.75rem;
        }
        .owner-photo, .owner-photo-placeholder {
          width: 32px; height: 32px; border-radius: 50%; object-fit: cover;
        }
        .owner-photo-placeholder {
          background: var(--bg-card);
          display: flex; align-items: center; justify-content: center;
          color: var(--text-muted); border: 1px solid var(--border);
        }
        .owner-photo-placeholder svg { width: 18px; height: 18px; }
        .owner-header h4 {
          font-size: 0.85rem; text-transform: uppercase;
          letter-spacing: 0.5px; color: var(--text-muted); margin: 0;
        }
        .owner-details p { font-size: 0.9rem; margin-bottom: 0.4rem; display: flex; gap: 0.5rem; }
        .owner-details p strong { color: var(--text-muted); min-width: 65px; }
        .loading, .empty-state { text-align: center; padding: 4rem; color: var(--text-muted); }
        .empty-icon { font-size: 4rem; margin-bottom: 1rem; opacity: 0.8; }
        .empty-state h2 { font-family: var(--font-display); font-size: 1.5rem; margin-bottom: 0.5rem; color: var(--text); }

        /* === Detail Overlay / Panel === */
        .detail-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.65);
          backdrop-filter: blur(4px);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1.5rem;
          animation: fadeIn 0.2s ease;
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .detail-panel {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 20px;
          width: 100%;
          max-width: 580px;
          max-height: 90vh;
          overflow-y: auto;
          position: relative;
          animation: slideUp 0.25s ease;
        }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .detail-close {
          position: absolute;
          top: 1rem;
          right: 1rem;
          z-index: 10;
          background: rgba(0,0,0,0.55);
          border: 1px solid rgba(255,255,255,0.15);
          border-radius: 50%;
          width: 36px; height: 36px;
          display: flex; align-items: center; justify-content: center;
          color: #fff;
          cursor: pointer;
          font-size: 1rem;
          transition: all 0.2s;
          backdrop-filter: blur(6px);
        }
        .detail-close:hover { background: rgba(239,68,68,0.8); border-color: transparent; }
        .detail-header-gallery {
          margin-bottom: 2rem;
          background: var(--bg-elevated);
          border-radius: 16px;
          overflow: hidden;
          padding: 1rem;
          border: 1px solid var(--border);
        }
        .main-photo-container {
          position: relative;
          height: 300px;
          border-radius: 12px;
          overflow: hidden;
          background: #000;
        }
        .detail-main-photo {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }
        .gallery-nav {
          position: absolute;
          inset: 0;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0 1rem;
          pointer-events: none;
        }
        .gallery-nav button {
          pointer-events: auto;
          background: rgba(0,0,0,0.5);
          color: #fff;
          border: none;
          width: 40px; height: 40px;
          border-radius: 50%;
          font-size: 1.5rem;
          cursor: pointer;
          backdrop-filter: blur(4px);
          transition: all 0.2s;
        }
        .gallery-nav button:hover { background: var(--accent-amber); color: #000; }
        
        .thumbnail-strip {
          display: flex;
          gap: 0.75rem;
          margin-top: 1rem;
          overflow-x: auto;
          padding-bottom: 0.5rem;
        }
        .thumb {
          width: 60px; height: 45px;
          border-radius: 6px;
          object-fit: cover;
          cursor: pointer;
          opacity: 0.6;
          border: 2px solid transparent;
          transition: all 0.2s;
        }
        .thumb.active { opacity: 1; border-color: var(--accent-amber); }
        .thumb:hover { opacity: 1; }

        .detail-basic-info { margin-top: 1.5rem; }
        .detail-basic-info h2 { font-family: var(--font-display); font-size: 1.5rem; margin-bottom: 0.25rem; }
        
        .photo-count {
          position: absolute;
          bottom: 1rem;
          left: 1rem;
          background: rgba(0,0,0,0.6);
          color: #fff;
          padding: 0.25rem 0.6rem;
          border-radius: 6px;
          font-size: 0.75rem;
          display: flex;
          align-items: center;
          gap: 0.4rem;
          backdrop-filter: blur(4px);
        }
        .detail-header h2 { font-family: var(--font-display); font-size: 1.35rem; margin-bottom: 0.2rem; }
        .detail-sub { font-size: 0.875rem; color: var(--text-muted); margin-bottom: 0.5rem; }
        .detail-badges { display: flex; gap: 0.4rem; }
        .detail-section { margin-bottom: 1.5rem; padding: 0 1.5rem; }
        .detail-section:last-child { padding-bottom: 1.5rem; }
        .detail-section h3 { font-size: 0.9rem; text-transform: uppercase; letter-spacing: 0.5px; color: var(--text-muted); margin-bottom: 1rem; }
        .detail-no-obd {
          text-align: center;
          padding: 1.5rem;
          background: var(--bg-elevated);
          border-radius: 12px;
          color: var(--text-muted);
          font-size: 0.9rem;
        }
        .detail-health-score {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          margin-bottom: 1.25rem;
        }
        .score-circle {
          width: 80px; height: 80px;
          border-radius: 50%;
          border: 3px solid;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .score-num { font-size: 1.5rem; font-weight: 700; line-height: 1; }
        .score-label { font-size: 0.7rem; opacity: 0.8; margin-top: 2px; }
        .check-engine-alert {
          background: rgba(239, 68, 68, 0.12);
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: 10px;
          padding: 0.75rem 1rem;
          font-size: 0.875rem;
          color: #fca5a5;
          line-height: 1.5;
        }
        .detail-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.75rem;
        }
        .detail-stat {
          background: var(--bg-elevated);
          border-radius: 10px;
          padding: 0.85rem 1rem;
          display: flex; flex-direction: column; gap: 0.2rem;
        }
        .stat-label { font-size: 0.78rem; color: var(--text-muted); }
        .stat-value { font-size: 1.1rem; font-weight: 600; color: var(--text); }
        .stat-sub { font-size: 0.75rem; color: var(--text-muted); }
        .detail-updated {
          text-align: right;
          font-size: 0.75rem;
          color: var(--text-muted);
          margin-top: 0.75rem;
          opacity: 0.7;
        }

        /* btn-profile style (consistent with other pages) */
        .btn-profile {
          display: flex; align-items: center; gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 10px;
          color: var(--text);
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }
        /* Detail Banner */
        .detail-banner {
          position: relative;
          overflow: hidden;
          background: linear-gradient(135deg, #0f1a35 0%, #1a2a50 50%, #0d1525 100%);
          border-bottom: 1px solid rgba(252,163,17,0.2);
          padding: 2rem;
        }
        .banner-gradient {
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse at top left, rgba(252,163,17,0.12) 0%, transparent 60%),
                      radial-gradient(ellipse at bottom right, rgba(59,130,246,0.1) 0%, transparent 60%);
          pointer-events: none;
        }
        .banner-content {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
        }
        .banner-left { flex: 1; }
        .banner-make {
          font-size: 0.85rem;
          font-weight: 700;
          letter-spacing: 3px;
          text-transform: uppercase;
          color: var(--accent-amber);
          margin-bottom: 0.15rem;
        }
        .banner-model {
          font-family: var(--font-display);
          font-size: 2rem;
          font-weight: 800;
          color: #fff;
          line-height: 1.1;
          margin-bottom: 0.5rem;
          letter-spacing: -0.5px;
        }
        .banner-meta {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.85rem;
          color: rgba(255,255,255,0.55);
          margin-bottom: 1rem;
          flex-wrap: wrap;
        }
        .banner-dot { opacity: 0.4; }
        .banner-badges { display: flex; gap: 0.6rem; flex-wrap: wrap; }
        .banner-badge {
          padding: 0.45rem 1rem;
          border-radius: 50px;
          font-size: 0.82rem;
          font-weight: 600;
          letter-spacing: 0.3px;
        }
        .banner-badge.rent {
          background: rgba(59,130,246,0.18);
          border: 1px solid rgba(59,130,246,0.4);
          color: #93c5fd;
        }
        .banner-badge.sell {
          background: rgba(16,185,129,0.18);
          border: 1px solid rgba(16,185,129,0.4);
          color: #6ee7b7;
        }
        .banner-score {
          width: 82px;
          height: 82px;
          border-radius: 50%;
          border: 3px solid;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: rgba(0,0,0,0.3);
          flex-shrink: 0;
        }
        .banner-score .score-num {
          font-size: 1.8rem;
          font-weight: 800;
          line-height: 1;
          font-family: var(--font-display);
        }
        .score-tag {
          font-size: 0.6rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          opacity: 0.85;
        }
      `}</style>
    </div>
  )
}
