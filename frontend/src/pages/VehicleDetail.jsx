import { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useVehicles } from '../context/VehicleContext'
import { API_URL } from '../config'
import Tesseract from 'tesseract.js'

const TABS = ['OBD Readings', 'Documents', 'Alerts', 'Rent/Sell']

export default function VehicleDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { getVehicle, updateVehicle } = useVehicles()
  const vehicle = getVehicle(id)
  const [tab, setTab] = useState('OBD Readings')

  if (!vehicle) {
    return (
      <div className="vd-page">
        <p>Vehicle not found.</p>
        <button onClick={() => navigate('/vehicles')}>Back to Vehicles</button>
      </div>
    )
  }

  return (
    <div className="vd-page">
      <div className={`fullscreen-bg ${
        tab === 'OBD Readings' ? 'bg-obd' :
        tab === 'Documents' ? 'bg-docs' :
        tab === 'Alerts' ? 'bg-alerts' :
        'bg-market'
      }`}></div>

      <div className="background-decor">
        <div className="glow glow-1"></div>
        <div className="glow glow-2"></div>
      </div>

      <div className="fixed-nav-wrapper">
        <header className="vd-header glass">
          <div className="vd-header-left">
            <button className="btn-back" onClick={() => navigate('/vehicles')} aria-label="Back to Vehicles">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            </button>
          <div className="header-brand">
            <h1>{vehicle.make} {vehicle.model}</h1>
            <p className="plate-tag">{vehicle.plate}{vehicle.year ? ` · ${vehicle.year}` : ''}</p>
          </div>
          </div>
          <div className="header-actions">
            <button className="btn-primary" onClick={() => navigate('/profile')} title="My Profile" aria-label="Profile">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              <span>Profile</span>
            </button>
          </div>
        </header>

        <nav className="tabs-container">
          <div className="tabs glass">
            {TABS.map(t => (
              <button key={t} className={`tab-btn ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
                {t}
              </button>
            ))}
          </div>
        </nav>
      </div>

      <main className="vd-main">
        {tab === 'OBD Readings' && <FuelSection vehicle={vehicle} />}
        {tab === 'Documents' && <DocumentsSection vehicle={vehicle} onUpdate={(d) => updateVehicle(id, d)} />}
        {tab === 'Alerts' && <AlertsSection vehicle={vehicle} onUpdate={(d) => updateVehicle(id, d)} />}
        {tab === 'Rent/Sell' && <RentSellSection vehicle={vehicle} onUpdate={(d) => updateVehicle(id, d)} />}
      </main>

      <style>{`
        .vd-page {
          min-height: 100vh;
          background: var(--bg-dark);
          position: relative;
          color: var(--text);
          padding-top: 155px; /* Combined height of header (70px) + tabs + padding */
          overflow-x: hidden;
        }

        .fixed-nav-wrapper {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 2000;
          background: #0c1222;
          border-bottom: 2px solid var(--border);
          box-shadow: 0 10px 30px rgba(0,0,0,0.5);
        }


        .background-decor {
          position: absolute;
          inset: 0;
          pointer-events: none;
        }

        .glow {
          position: absolute;
          width: 50vw;
          height: 50vw;
          filter: blur(120px);
          opacity: 0.1;
          border-radius: 50%;
        }

        .glow-1 { top: -20%; left: -20%; background: var(--accent-amber); }
        .glow-2 { bottom: -20%; right: -20%; background: var(--accent-blue); }

        .vd-header {
          height: 70px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0 2rem;
          border-bottom: 1px solid rgba(255,255,255,0.05);
          padding-left: 80px;
        }

        .vd-header-left {
          display: flex;
          align-items: center;
          gap: 1.5rem;
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
          background: rgba(255, 255, 255, 0.05);
          color: var(--text);
        }

        .header-brand h1 {
          font-family: var(--font-display);
          font-size: 1.25rem;
          font-weight: 800;
          letter-spacing: -0.5px;
          color: #fff;
          margin: 0;
        }

        .plate-tag {
          font-size: 0.7rem;
          color: var(--accent-amber);
          text-transform: uppercase;
          letter-spacing: 1px;
          font-weight: 700;
          font-family: monospace;
          background: rgba(252,163,17,0.05);
          padding: 0.2rem 0.5rem;
          border-radius: 6px;
          display: inline-block;
          margin-top: 0.1rem;
        }

        .header-actions {
          display: flex;
          gap: 0.75rem;
        }

        .tabs-container {
          padding: 0.75rem 2rem;
          background: transparent;
        }


        .tabs {
          display: flex;
          padding: 6px;
          border-radius: 20px;
          gap: 6px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--border);
          overflow-x: auto;
          scrollbar-width: none;
          max-width: 1000px;
          margin: 0 auto;
        }

        .tabs::-webkit-scrollbar { display: none; }

        .tab-btn {
          flex: 1;
          padding: 0.8rem 1.25rem;
          border-radius: 14px;
          font-size: 0.85rem;
          font-weight: 700;
          color: var(--text-muted);
          background: transparent;
          white-space: nowrap;
          transition: all var(--transition-fast);
        }

        .tab-btn:hover {
          color: #fff;
          background: rgba(255, 255, 255, 0.05);
        }

        .tab-btn.active {
          background: var(--accent-amber);
          color: #000;
          box-shadow: 0 4px 15px var(--accent-amber-glow);
        }

        .vd-main {
          padding: 0 2rem 4rem;
          max-width: 1000px;
          margin: 0 auto;
          position: relative;
          z-index: 10;
        }

        /* Dash Section & Header */
        .dashboard-section { margin-bottom: 3rem; }
        .section-header { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1.5rem; }
        .section-header h2, .section-header h3 { font-family: var(--font-display); font-size: 1.5rem; color: #fff; margin: 0; }
        .section-tag { padding: 0.2rem 0.5rem; border-radius: 6px; font-size: 0.65rem; font-weight: 800; text-transform: uppercase; }
        .live-tag { background: #22c55e; color: #000; }
        .stored-tag { background: rgba(255,255,255,0.1); color: var(--text-muted); }

        /* OBD Header */
        .obd-header { margin-bottom: 2rem; padding: 1.5rem; background: rgba(255,255,255,0.02); border: 1px solid var(--border); border-radius: 20px; }
        .obd-title-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; flex-wrap: wrap; gap: 1rem; }
        .obd-connect-group, .obd-status-group { display: flex; gap: 0.75rem; align-items: center; }
        .obd-connect-btn { display: flex; align-items: center; gap: 0.5rem; padding: 0.6rem 1rem; background: rgba(255,255,255,0.05); border: 1px solid var(--border); border-radius: 10px; color: var(--text); font-size: 0.85rem; font-weight: 600; cursor: pointer; transition: all 0.2s; }
        .obd-connect-btn:hover { background: var(--accent-blue); border-color: var(--accent-blue); color: #000; }
        .obd-connect-btn.server-btn:hover { background: var(--accent-amber); border-color: var(--accent-amber); }
        .obd-badge { display: flex; align-items: center; gap: 0.5rem; padding: 0.4rem 0.8rem; border-radius: 20px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; }
        .obd-badge.connected { background: rgba(34,197,94,0.1); color: #22c55e; }
        .obd-badge.connecting { background: rgba(245,158,11,0.1); color: #f59e0b; }
        .obd-badge.error { background: rgba(239,68,68,0.1); color: #ef4444; }
        .obd-dot { width: 8px; height: 8px; border-radius: 50%; background: currentColor; }
        .obd-sync { font-size: 0.75rem; color: var(--text-muted); display: block; }

        /* Health & Live Data */
        .health-dashboard { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1.5rem; }
        .dash-card { padding: 1.5rem; border-radius: 24px; display: flex; flex-direction: column; gap: 1.25rem; background: rgba(255,255,255,0.03); border: 1px solid var(--border); transition: transform 0.3s, border-color 0.3s; }
        .dash-card:hover { border-color: rgba(255,255,255,0.1); transform: translateY(-2px); }
        .dash-card-header { display: flex; align-items: center; gap: 0.75rem; }
        .dash-icon { width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; border-radius: 8px; }
        .dash-label { font-size: 0.8rem; font-weight: 600; color: var(--text-muted); }
        .dash-value.lg { font-size: 2rem; font-weight: 800; color: #fff; font-family: var(--font-display); }
        
        .live-section { background: rgba(34,197,94,0.02); border: 1px solid rgba(34,197,94,0.1); border-radius: 24px; padding: 2rem; }
        .live-gauges { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1.25rem; }
        .live-gauge-card { background: rgba(0,0,0,0.3); border: 1px solid var(--border); border-radius: 20px; padding: 1.5rem; text-align: center; display: flex; flex-direction: column; gap: 0.5rem; }
        .live-gauge-label { font-size: 0.7rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; }
        .live-gauge-value { font-size: 1.5rem; font-weight: 800; color: #fff; font-family: var(--font-display); }

        /* Documents & Alerts Lists */

        /* Documents & Alerts Lists */
        .doc-list, .alert-list { display: flex; flex-direction: column; gap: 1rem; list-style: none; padding: 0; }
        .doc-item, .alert-item { background: rgba(255,255,255,0.03); border: 1px solid var(--border); border-radius: 16px; padding: 1.25rem; display: flex; flex-direction: column; gap: 0.75rem; }
        .alert-item.overdue { border-left: 4px solid #ef4444; }
        .alert-item.urgent { border-left: 4px solid #f59e0b; }

        /* Rent/Sell Styles */
        .rs-card { padding: 1.5rem; }
        .photo-gallery-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 1rem; }
        .photo-item { position: relative; border-radius: 16px; overflow: hidden; height: 120px; border: 1px solid var(--border); cursor: pointer; }
        .preview-img { width: 100%; height: 100%; object-fit: cover; }
        .add-photo-card { border: 2px dashed var(--border); border-radius: 16px; height: 120px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 0.5rem; color: var(--text-muted); cursor: pointer; transition: all 0.2s; }
        .add-photo-card:hover { border-color: var(--accent-amber); color: var(--accent-amber); background: rgba(252,163,17,0.05); }

        /* Buttons - Small, Glass & Primary Polish */
        .btn-sm, .btn-glass {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.6rem 1.2rem;
          border-radius: 12px;
          font-size: 0.85rem;
          font-weight: 700;
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: var(--text-muted);
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .btn-sm:hover, .btn-glass:hover {
          color: #fff;
          background: rgba(255, 255, 255, 0.12);
          border-color: rgba(255, 255, 255, 0.3);
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
        }

        .btn-glass.active {
          background: var(--accent-amber);
          color: #000;
          border-color: var(--accent-amber);
        }

        /* Add Form Styling */
        .add-form {
          margin: 1.5rem 0;
          padding: 2rem;
          background: rgba(255, 255, 255, 0.02);
          backdrop-filter: blur(20px);
          border: 1px solid var(--border);
          border-radius: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          animation: slideDown 0.3s ease-out;
        }

        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .form-row {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .form-row label {
          font-size: 0.85rem;
          font-weight: 700;
          color: var(--text-muted);
        }

        .add-form input, .add-form select, .mc-input {
          background: rgba(0, 0, 0, 0.2);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 0.8rem 1rem;
          color: #fff;
          font-size: 0.9rem;
          transition: all 0.2s;
        }

        .add-form input:focus, .add-form select:focus, .mc-input:focus {
          outline: none;
          border-color: var(--accent-amber);
          background: rgba(0, 0, 0, 0.3);
          box-shadow: 0 0 0 4px rgba(252, 163, 17, 0.1);
        }

        .add-form input[type="date"]::-webkit-calendar-picker-indicator {
          filter: invert(1);
          cursor: pointer;
        }

        /* Custom File Input */
        .file-attach {
          position: relative;
        }
        .file-input {
          position: absolute;
          width: 0.1px;
          height: 0.1px;
          opacity: 0;
          overflow: hidden;
          z-index: -1;
        }
        .file-label {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          padding: 1.5rem;
          background: rgba(255, 255, 255, 0.02);
          border: 2px dashed var(--border);
          border-radius: 16px;
          color: var(--text-muted);
          cursor: pointer;
          transition: all 0.2s;
        }
        .file-label:hover {
          border-color: var(--accent-amber);
          color: var(--accent-amber);
          background: rgba(252, 163, 17, 0.05);
        }
        .file-label.scanning {
          border-color: var(--accent-blue);
          color: var(--accent-blue);
          background: rgba(76, 201, 240, 0.05);
        }

        .ocr-status {
          font-size: 0.8rem;
          font-weight: 600;
          margin-top: 0.5rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .ocr-status.detected-date { color: #22c55e; }
        .ocr-status.scanning-status { color: var(--accent-blue); }
        .ocr-status.error { color: #ef4444; }
        /* Fullscreen Background */
        .fullscreen-bg {
          position: fixed;
          inset: 0;
          z-index: -1;
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
          transition: background-image 0.8s ease-in-out;
        }

        .fullscreen-bg::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(12, 18, 34, 0.85) 0%, rgba(12, 18, 34, 0.98) 100%);
        }

        .bg-obd { background-image: url('/assets/imagery/obd_bg.png'); }
        .bg-docs { background-image: url('/assets/imagery/documents_bg.png'); }
        .bg-alerts { background-image: url('/assets/imagery/alerts_bg.png'); }
        .bg-market { background-image: url('/assets/imagery/rent_sell_bg.png'); }

        /* Section Treatments - Refined Glassmorphism */
        .section {
          padding: 2.5rem;
          border-radius: 32px;
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(15px);
          -webkit-backdrop-filter: blur(15px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          position: relative;
          overflow: hidden;
          transition: transform 0.3s ease, border-color 0.3s ease;
          box-shadow: 0 20px 40px rgba(0,0,0,0.4);
        }

        .section:hover {
          border-color: rgba(255, 255, 255, 0.15);
        }

        .section::before { display: none; }

        .section > * {
          position: relative;
          z-index: 1;
        }

        /* Section Heading Spacing */
        .section-head { margin-bottom: 2rem; display: flex; justify-content: space-between; align-items: center; }
        .section-head h2 { font-family: var(--font-display); font-size: 1.75rem; font-weight: 800; color: #fff; margin: 0; text-shadow: 0 2px 10px rgba(0,0,0,0.5); }

        .btn-primary:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          filter: grayscale(1);
        }

        .toggle-group {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 0.5rem;
        }
        .toggle-group.rent-group {
          flex-direction: column;
          align-items: flex-start;
          background: rgba(255, 255, 255, 0.02);
          padding: 1rem;
          border-radius: 12px;
          border: 1px solid var(--border);
        }
        .rent-inputs {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
          gap: 0.75rem;
          width: 100%;
          margin-top: 0.5rem;
        }
        .toggle-group.sell-group {
          background: rgba(255, 255, 255, 0.02);
          padding: 1rem;
          border-radius: 12px;
          border: 1px solid var(--border);
          justify-content: space-between;
        }
        .price-input {
          width: 100%;
          padding: 0.6rem 0.8rem;
          font-size: 0.85rem;
        }

        /* Section Treatments */
        /* Removed section-specific backgrounds */

        @media (max-width: 768px) {
          .vd-header { padding-left: 60px; padding-right: 1rem; }
          .tabs-container { padding: 0.75rem 1rem 0; top: 70px; }
          .tabs { border-radius: 16px; }
          .vd-main { padding: 0 1rem 4rem; }
          .mc-body { flex-direction: column; align-items: flex-start; }
          .mc-stats { gap: 1.5rem; }
        }
      `}</style>
    </div>
  )
}


function FuelSection({ vehicle }) {
  const [obd, setObd] = useState(null)
  const [obdStatus, setObdStatus] = useState('disconnected')
  const [lastSync, setLastSync] = useState(null)
  const [intervalRef, setIntervalRef] = useState(null)
  const [connectionMode, setConnectionMode] = useState(null)
  const [showBridgeHelp, setShowBridgeHelp] = useState(false)
  const [dataSource, setDataSource] = useState(null)
  const [storedHealth, setStoredHealth] = useState(null)
  const [enginePopupDismissed, setEnginePopupDismissed] = useState(false)

  // Load stored health data on mount; if none, auto-fetch simulated data
  useEffect(() => {
    const loadHealth = async () => {
      const auth = JSON.parse(localStorage.getItem('autoVaultAuth') || '{}')
      const userId = auth.userId || ''
      try {
        const res = await fetch(`${API_URL}/api/vehicles/${vehicle.id}/health?userId=${userId}`)
        if (res.ok) {
          const data = await res.json()
          if (data && data.lastUpdated) {
            setStoredHealth(data)
            return
          }
        }
      } catch { }
      // No stored health data — dash will show placeholder until real data arrives
    }
    loadHealth()
  }, [vehicle.id])

  const fetchObd = async () => {
    const auth = JSON.parse(localStorage.getItem('autoVaultAuth') || '{}')
    const userId = auth.userId || ''
    try {
      const res = await fetch(`${API_URL}/api/obd/${vehicle.id}?userId=${userId}`)
      if (res.ok) {
        const data = await res.json()

        if (data.error || data.connected === false) {
           setObdStatus('disconnected')
           setObd(null)
           return
        }

        setObd(data)
        setObdStatus('connected')
        setLastSync(new Date())
        setDataSource(data.source || 'bridge')
        setConnectionMode(data.source === 'bridge' ? 'bridge' : 'live')
        // Update stored health from live data
        if (data.health) {
          setStoredHealth(prev => ({
            ...prev,
            healthScore: data.health.score,
            healthStatus: data.health.status,
            checkEngine: data.checkEngine?.active || false,
            checkEngineCode: data.checkEngine?.code || '',
            checkEngineDesc: data.checkEngine?.desc || '',
            batteryVoltage: data.battery?.voltage || 0,
            batteryHealth: data.battery?.health || 0,
            batteryStatus: data.battery?.status || 'Unknown',
            fuelLevel: data.sensor?.fuelLevel || 0,
            fuelPercent: data.sensor?.fuelPercent || 0,
            tankCapacity: data.sensor?.tankCapacity || 0,
            avgMileage: data.computed?.avgMileage || 0,
            odometer: data.sensor?.odometer || 0,
            ...(data.service || {}),
            lastUpdated: new Date().toISOString()
          }))
        }
      } else {
        setObdStatus('error')
      }
    } catch {
      setObdStatus('error')
    }
  }

  const connectBluetooth = async () => {
    setObdStatus('connecting')
    if ('bluetooth' in navigator) {
      try {
        const { default: obdService } = await import('../services/ObdBluetoothService.js')
        obdService.onData((event) => {
          if (event.type === 'data') {
            setObd(event.data)
            setLastSync(new Date())
            setDataSource('ble')
          } else if (event.type === 'disconnected') {
            setObdStatus('disconnected')
            setConnectionMode(null)
          }
        })

        // Initialize odometer from database before connecting
        const baseline = storedHealth?.odometer || 0
        obdService.setOdometerBaseline(baseline)

        await obdService.connectBLE()
        setObdStatus('connected')
        setConnectionMode('ble')
        setDataSource('ble')
        return
      } catch (err) {
        console.log('BLE failed, falling back:', err.message)
      }
    }
    connectServer()
  }

  const connectSerial = async () => {
    setObdStatus('connecting')
    if ('serial' in navigator) {
      try {
        const { default: obdService } = await import('../services/ObdBluetoothService.js')
        obdService.onData((event) => {
          if (event.type === 'data') {
            setObd(event.data)
            setLastSync(new Date())
            setDataSource('serial')
          } else if (event.type === 'disconnected') {
            setObdStatus('disconnected')
            setConnectionMode(null)
          }
        })

        // Initialize odometer from database
        const baseline = storedHealth?.odometer || 0
        obdService.setOdometerBaseline(baseline)

        // Pass server info for auto-syncing
        const auth = JSON.parse(localStorage.getItem('autoVaultAuth') || '{}')
        const userId = auth.userId || ''
        const serverUrl = API_URL

        await obdService.connectSerial(vehicle.id, serverUrl, userId)
        setObdStatus('connected')
        setConnectionMode('serial')
        setDataSource('serial')
        return
      } catch (err) {
        console.log('Serial failed:', err.message)
        setObdStatus('disconnected')
        alert('Serial connection failed. Make sure your device is plugged in and you are using a compatible browser.')
      }
    } else {
      alert('Web Serial is not supported in this browser. Use Chrome, Edge, or Opera.')
      setObdStatus('disconnected')
    }
  }

  const connectServer = () => {
    setObdStatus('connecting')
    fetchObd()
    const id = setInterval(fetchObd, 5000)
    setIntervalRef(id)
  }

  const disconnectObd = async () => {
    if (intervalRef) clearInterval(intervalRef)
    setIntervalRef(null)
    if (connectionMode === 'ble' || connectionMode === 'serial') {
      try {
        const { default: obdService } = await import('../services/ObdBluetoothService.js')
        obdService.disconnect()
      } catch { }
    }
    setObdStatus('disconnected')
    setConnectionMode(null)
    setDataSource(null)
  }

  const resetService = async (type) => {
    const auth = JSON.parse(localStorage.getItem('autoVaultAuth') || '{}')
    const userId = auth.userId || ''
    try {
      const res = await fetch(`${API_URL}/api/vehicles/${vehicle.id}/service-reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, userId })
      })
      if (res.ok) {
        const data = await res.json()
        setStoredHealth(data.obdHealth)
      }
    } catch { }
  }

  useEffect(() => {
    return () => { if (intervalRef) clearInterval(intervalRef) }
  }, [intervalRef])

  const modeLabel = connectionMode === 'ble' ? '🔵 BLE Direct' :
    connectionMode === 'bridge' ? '🟢 OBD Bridge' : ''

  // Use live data if connected, otherwise stored health
  const health = obd ? {
    score: obd.health?.score ?? storedHealth?.healthScore ?? 0,
    status: obd.health?.status ?? storedHealth?.healthStatus ?? 'Unknown'
  } : storedHealth ? {
    score: storedHealth.healthScore,
    status: storedHealth.healthStatus
  } : null

  const checkEngine = obd?.checkEngine ?? (storedHealth ? {
    active: storedHealth.checkEngine,
    code: storedHealth.checkEngineCode,
    desc: storedHealth.checkEngineDesc
  } : null)

  const battery = obd ? {
    voltage: obd.battery?.voltage ?? storedHealth?.batteryVoltage ?? 0,
    health: obd.battery?.health ?? storedHealth?.batteryHealth ?? 0,
    status: obd.battery?.status ?? storedHealth?.batteryStatus ?? 'Unknown'
  } : storedHealth ? {
    voltage: storedHealth.batteryVoltage,
    health: storedHealth.batteryHealth,
    status: storedHealth.batteryStatus
  } : null

  const fuel = obd ? {
    level: obd.sensor.fuelLevel,
    percent: obd.sensor.fuelPercent,
    capacity: obd.sensor.tankCapacity
  } : storedHealth ? {
    level: storedHealth.fuelLevel,
    percent: storedHealth.fuelPercent,
    capacity: storedHealth.tankCapacity
  } : null

  const mileage = obd?.computed?.avgMileage ?? storedHealth?.avgMileage ?? null

  const service = obd?.service ?? (storedHealth ? {
    nextServiceKm: storedHealth.nextServiceKm,
    serviceKmRemaining: storedHealth.serviceKmRemaining,
    serviceStatus: storedHealth.serviceStatus,
    nextOilChangeKm: storedHealth.nextOilChangeKm,
    oilChangeKmRemaining: storedHealth.oilChangeKmRemaining,
    oilChangeStatus: storedHealth.oilChangeStatus
  } : null)

  const warnings = obd?.warnings || []
  const hasHealthData = health || storedHealth
  const hasEngineWarning = warnings.some(w => w.message?.includes('Engine Problem'))

  // Re-show popup when a NEW engine warning appears
  useEffect(() => { if (hasEngineWarning) setEnginePopupDismissed(false) }, [hasEngineWarning])

  const healthColor = (score) => score >= 80 ? '#22c55e' : score >= 50 ? '#f59e0b' : '#ef4444'

  return (
    <section className="section fuel-section">

      {/* === ENGINE WARNING BANNER (inline at top) === */}
      {hasEngineWarning && !enginePopupDismissed && (
        <div className="engine-banner">
          <div className="engine-banner-inner">
            <svg className="engine-banner-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="28" height="28">
              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            <div className="engine-banner-text">
              <span className="engine-banner-title">⚠ ENGINE WARNING — {checkEngine?.code || 'CHECK ENGINE'}</span>
              <span className="engine-banner-desc">{checkEngine?.desc || 'Major engine problem detected'} · Pull over safely</span>
            </div>
            <button className="engine-banner-close" onClick={() => setEnginePopupDismissed(true)}>✕</button>
          </div>
        </div>
      )}
      {/* OBD Connection Header */}
      <div className="obd-header">
        <div className="obd-title-row">
          <h2>Vehicle Dashboard</h2>
          {obdStatus === 'disconnected' ? (
            <div className="obd-connect-group">
              <button className="obd-connect-btn" onClick={connectBluetooth}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6.5 6.5l11 11L12 23V1l5.5 5.5-11 11" /></svg>
                Bluetooth
              </button>
              <button className="obd-connect-btn serial-btn" onClick={connectSerial}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
                Serial/USB
              </button>
              <button className="obd-connect-btn server-btn" onClick={connectServer}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12.55a11 11 0 0114.08 0" /><path d="M1.42 9a16 16 0 0121.16 0" /><path d="M8.53 16.11a6 6 0 016.95 0" /><circle cx="12" cy="20" r="1" /></svg>
                Server
              </button>
            </div>
          ) : (
            <div className="obd-status-group">
              <div className={`obd-badge ${obdStatus}`}>
                <span className="obd-dot" />
                {obdStatus === 'connected' ? 'OBD Live' : obdStatus === 'connecting' ? 'Connecting...' : 'Error'}
              </div>
              {connectionMode && <span className="obd-mode-label">{modeLabel}</span>}
              {(obdStatus === 'connected' || obdStatus === 'error') && (
                <button className="obd-disconnect-btn" onClick={disconnectObd}>Disconnect</button>
              )}
            </div>
          )}
        </div>
        {lastSync && obdStatus === 'connected' && (
          <span className="obd-sync">Last sync: {lastSync.toLocaleTimeString()} · Refreshing every {connectionMode === 'ble' ? '3s' : '5s'}</span>
        )}
        {storedHealth?.lastUpdated && obdStatus === 'disconnected' && (
          <span className="obd-sync">Last OBD sync: {new Date(storedHealth.lastUpdated).toLocaleString()} · Stored data shown below</span>
        )}
      </div>

      {/* ========================================== */}
      {/* SECTION 1: VEHICLE HEALTH OVERVIEW         */}
      {/* Always visible — persisted / simulated      */}
      {/* ========================================== */}
      {(() => {
        const displayHealth = health
        const displayBattery = battery
        const displayFuel = fuel
        const displayMileage = mileage
        const displayService = service
        const displayCheckEngine = checkEngine || { active: false }

        return (
          <div className="dashboard-section">
            {!hasHealthData && (
              <div className="no-obd-card">
                <div className="no-obd-icon">📡</div>
                <div className="no-obd-text">
                  <strong>OBD reading not taken for this vehicle</strong>
                  <span>No real scanner data has been recorded yet. Connect your ELM327 OBD scanner to start tracking real health data.</span>
                </div>
              </div>
            )}

            {hasHealthData && (
              <>
                <div className="section-header">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>
                  <h3>Vehicle Health Overview</h3>
                  {!obd && storedHealth && <span className="section-tag stored-tag">Stored</span>}
                  {obd && <span className="section-tag live-tag">Live</span>}
                </div>

                <div className="health-dashboard">
                  {/* 1. Car Health Status */}
                  <div className="dash-card health-score-card">
                    <div className="dash-card-header">
                      <div className="dash-icon health-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>
                      </div>
                      <span className="dash-label">Car Health Status</span>
                    </div>
                    <div className="health-gauge-wrap">
                      <div className="health-ring" style={{ '--health-pct': `${displayHealth?.score || 0}%`, '--health-color': healthColor(displayHealth?.score || 0) }}>
                        <span className="health-score">{displayHealth?.score || 0}</span>
                      </div>
                      <div className="health-info">
                        <span className={`health-status-badge ${(displayHealth?.status || 'Unknown').toLowerCase()}`}>{displayHealth?.status || 'Unknown'}</span>
                      </div>
                    </div>
                  </div>

                  {/* 2. Check Engine */}
                  <div className={`dash-card check-engine-card ${displayCheckEngine?.active ? 'alert-active' : ''}`}>
                    <div className="dash-card-header">
                      <div className={`dash-icon engine-icon ${displayCheckEngine?.active ? 'alert' : 'ok'}`}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
                      </div>
                      <span className="dash-label">Check Engine</span>
                    </div>
                    <div className="engine-ok">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5"><path d="M22 11.08V12a10 10 0 11-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                      <span>All Clear</span>
                    </div>
                  </div>

                  {/* 3. Battery */}
                  <div className="dash-card">
                    <div className="dash-card-header">
                      <div className={`dash-icon battery-icon ${displayBattery?.status === 'Critical' ? 'critical' : displayBattery?.status === 'Weak' ? 'weak' : 'ok'}`}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="6" width="18" height="12" rx="2" /><line x1="23" y1="10" x2="23" y2="14" /><line x1="7" y1="10" x2="7" y2="14" /><line x1="11" y1="10" x2="11" y2="14" /></svg>
                      </div>
                      <span className="dash-label">Battery Health</span>
                    </div>
                    <span className="dash-value lg">{displayBattery?.voltage || 0}<small>V</small></span>
                    <div className="battery-bar-wrap">
                      <div className="battery-bar">
                        <div className="battery-bar-fill" style={{ width: `${displayBattery?.health || 0}%`, background: (displayBattery?.health || 0) >= 70 ? '#22c55e' : (displayBattery?.health || 0) >= 40 ? '#f59e0b' : '#ef4444' }} />
                      </div>
                      <span className="battery-pct">{displayBattery?.health || 0}%</span>
                    </div>
                    <span className={`battery-status-label ${(displayBattery?.status || 'unknown').toLowerCase()}`}>{displayBattery?.status || 'Unknown'}</span>
                  </div>

                  {/* 4. Fuel Level */}
                  <div className="dash-card fuel-level-card">
                    <div className="dash-card-header">
                      <div className="dash-icon fuel-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 22V6a2 2 0 012-2h8a2 2 0 012 2v16" /><path d="M3 22h12" /><path d="M7 10h4" /><path d="M18 8l2-2v6l-2 2" /><path d="M15 14v4" /><path d="M15 18h2a2 2 0 002-2v-3" /></svg>
                      </div>
                      <span className="dash-label">Current Fuel Level</span>
                    </div>
                    <div className="fuel-gauge-wrap">
                      <div className="fuel-gauge-bar">
                        <div className="fuel-gauge-fill" style={{ width: `${displayFuel?.percent || 0}%`, background: (displayFuel?.percent || 0) > 50 ? '#22c55e' : (displayFuel?.percent || 0) > 20 ? '#f59e0b' : '#ef4444' }} />
                      </div>
                      <div className="fuel-gauge-info">
                        <span className="dash-value">{displayFuel?.level || 0}<small> / {displayFuel?.capacity || 0} L</small></span>
                        <span className="gauge-pct">{displayFuel?.percent || 0}%</span>
                      </div>
                    </div>
                  </div>

                  {/* 5. Mileage */}
                  <div className="dash-card">
                    <div className="dash-card-header">
                      <div className="dash-icon mileage-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>
                      </div>
                      <span className="dash-label">Average Mileage</span>
                    </div>
                    <span className="dash-value lg">{displayMileage?.toFixed(1) || '—'}<small> km/L</small></span>
                    <span className="dash-sub">{obd ? (dataSource === 'ble' ? 'Live · Bluetooth' : dataSource === 'bridge' ? 'Live · Bridge' : 'Live') : 'Last recorded'}</span>
                  </div>
                </div>
              </>
            )}
          </div>
        )
      })()}

      {/* ========================================== */}
      {/* SECTION 2: LIVE RUNNING DATA               */}
      {/* Only visible when OBD is connected          */}
      {/* ========================================== */}
      {obd && obdStatus === 'connected' && (
        <div className="dashboard-section live-section">
          <div className="section-header live-header">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
            <h3>Live Running Data</h3>
            <span className="section-tag live-pulse-tag">● LIVE</span>
          </div>

          {/* Warnings */}
          {warnings.length > 0 && (
            <div className="warning-banners">
              {warnings.map((w, i) => (
                <div key={i} className={`warning-banner ${w.severity}`}>
                  <span className="warning-icon">{w.icon}</span>
                  <span className="warning-msg">{w.message}</span>
                </div>
              ))}
            </div>
          )}

          {/* Live Gauges */}
          <div className="live-gauges">
            <div className={`live-gauge-card ${obd.sensor.speed > 120 ? 'gauge-danger' : ''}`}>
              <span className="live-gauge-label">Current Speed</span>
              <span className="live-gauge-value">{obd.sensor.speed}<small> km/h</small></span>
              {obd.sensor.speed > 120 && <span className="gauge-warning-tag">⚠ OVERSPEED</span>}
            </div>
            <div className="live-gauge-card">
              <span className="live-gauge-label">Engine RPM</span>
              <span className="live-gauge-value">{obd.sensor.rpm}</span>
            </div>
            <div className={`live-gauge-card ${obd.sensor.engineTemp > 105 ? 'gauge-danger' : ''}`}>
              <span className="live-gauge-label">Engine Temp</span>
              <span className="live-gauge-value">{obd.sensor.engineTemp}°<small>C</small></span>
              {obd.sensor.engineTemp > 105 && <span className="gauge-warning-tag">🔥 OVERHEATING</span>}
            </div>
            <div className={`live-gauge-card ${obd.sensor.voltage < 11.8 ? 'gauge-danger' : ''}`}>
              <span className="live-gauge-label">Battery Voltage</span>
              <span className="live-gauge-value">{obd.sensor.voltage}<small>V</small></span>
              {obd.sensor.voltage < 11.8 && <span className="gauge-warning-tag">🪫 LOW</span>}
            </div>
            <div className="live-gauge-card">
              <span className="live-gauge-label">Odometer</span>
              <span className="live-gauge-value">{obd.sensor.odometer.toLocaleString()}<small> km</small></span>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

const MAX_FILE_SIZE = 3 * 1024 * 1024 // 3MB
const ACCEPT_FILES = '.pdf,.jpg,.jpeg,.png,.webp'
const IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']

// Extract date from OCR text
function extractDateFromText(text) {
  // Patterns to look for
  const patterns = [
    // Look for "Valid Upto", "Expiry", "Valid Till", "Expires" followed by date
    /(?:valid\s*(?:upto|till)|expir(?:y|es)|due\s*date)[:\s]*([0-9]{1,2})[\s\/\-]([0-9]{1,2})[\s\/\-]([0-9]{2,4})/gi,
    // dd/mm/yyyy or dd-mm-yyyy
    /\b([0-9]{1,2})[\s\/\-]([0-9]{1,2})[\s\/\-](20[2-9][0-9])\b/g,
    // yyyy-mm-dd (ISO format)
    /\b(20[2-9][0-9])[\s\/\-]([0-9]{1,2})[\s\/\-]([0-9]{1,2})\b/g,
  ]

  for (const pattern of patterns) {
    const matches = [...text.matchAll(pattern)]
    for (const match of matches) {
      let day, month, year

      // Check if it's ISO format (year first)
      if (match[1].length === 4) {
        year = parseInt(match[1])
        month = parseInt(match[2])
        day = parseInt(match[3])
      } else {
        day = parseInt(match[1])
        month = parseInt(match[2])
        year = parseInt(match[3])
        if (year < 100) year += 2000
      }

      // Validate date
      if (month >= 1 && month <= 12 && day >= 1 && day <= 31 && year >= 2024) {
        // Return in yyyy-mm-dd format for input[type=date]
        return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      }
    }
  }
  return null
}

function DocumentsSection({ vehicle, onUpdate }) {
  const docs = vehicle.documents || []
  const alerts = vehicle.alerts || []
  const [open, setOpen] = useState(false)
  const [scanning, setScanning] = useState(false)
  const [form, setForm] = useState({ type: 'Insurance', expiry: '', fileData: null, fileName: '', fileError: '', ocrStatus: '' })

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) {
      setForm(f => ({ ...f, fileData: null, fileName: '', fileError: '', ocrStatus: '' }))
      return
    }
    if (file.size > MAX_FILE_SIZE) {
      setForm(f => ({ ...f, fileData: null, fileName: '', fileError: 'File too large (max 3MB)', ocrStatus: '' }))
      return
    }

    const reader = new FileReader()
    reader.onload = async (ev) => {
      const fileData = ev.target?.result || null
      setForm(f => ({ ...f, fileData, fileName: file.name, fileError: '', ocrStatus: '' }))

      // Run OCR only on images
      if (IMAGE_TYPES.includes(file.type) && fileData) {
        setScanning(true)
        setForm(f => ({ ...f, ocrStatus: 'Scanning for expiry date...' }))

        try {
          const result = await Tesseract.recognize(fileData, 'eng', {
            logger: () => { } // Suppress progress logs
          })

          const extractedDate = extractDateFromText(result.data.text)
          if (extractedDate) {
            setForm(f => ({ ...f, expiry: extractedDate, ocrStatus: '✓ Expiry date detected!' }))
          } else {
            setForm(f => ({ ...f, ocrStatus: 'No date found - please enter manually' }))
          }
        } catch (err) {
          console.error('OCR error:', err)
          setForm(f => ({ ...f, ocrStatus: 'Scan failed - please enter date manually' }))
        } finally {
          setScanning(false)
        }
      }
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  const handleAdd = (e) => {
    e.preventDefault()
    if (!form.expiry) return

    const doc = {
      name: form.type,
      type: form.type,
      expiry: form.expiry,
      ...(form.fileData && { fileData: form.fileData, fileName: form.fileName }),
    }

    // Auto-create alert for expiry
    const newAlert = {
      title: `Renew ${form.type}`,
      type: form.type,
      dueDate: form.expiry
    }

    // Update both documents and alerts
    onUpdate({
      documents: [...docs, doc],
      alerts: [...alerts, newAlert]
    })

    setForm({ type: 'Insurance', expiry: '', fileData: null, fileName: '', fileError: '', ocrStatus: '' })
    setOpen(false)
  }

  const daysUntil = (d) => {
    const diff = new Date(d) - new Date()
    return Math.ceil(diff / (1000 * 60 * 60 * 24))
  }

  const handleViewDoc = (d) => {
    if (d.fileData) window.open(d.fileData, '_blank', 'noopener')
  }

  const handleDeleteDoc = (index) => {
    if (window.confirm('Delete this document?')) {
      onUpdate({ documents: docs.filter((_, i) => i !== index) })
    }
  }

  return (
    <section className="section">
      <div className="section-head">
        <h2>Documentation</h2>
        <button className={`btn-glass ${open ? 'active' : ''}`} onClick={() => setOpen(!open)}>
          {open ? (
            <>✕ Cancel</>
          ) : (
            <>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>
              Add Document
            </>
          )}
        </button>
      </div>
      {open && (
        <form className="add-form card" onSubmit={handleAdd}>
          <div className="form-row">
            <label>Type</label>
            <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
              <option>Insurance</option>
              <option>Registration</option>
              <option>Inspection</option>
              <option>Pollution</option>
              <option>Other</option>
            </select>
          </div>
          <div className="form-row">
            <label>Upload document image (auto-detects expiry date)</label>
            <div className="file-attach">
              <input
                type="file"
                id="doc-file"
                accept={ACCEPT_FILES}
                onChange={handleFileChange}
                className="file-input"
                disabled={scanning}
              />
              <label htmlFor="doc-file" className={`file-label ${scanning ? 'scanning' : ''}`}>
                {scanning ? (
                  <span className="spinner"></span>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
                )}
                {scanning ? 'Scanning...' : form.fileName || 'Choose image file (JPG, PNG, WebP)'}
              </label>
              {form.fileError && <span className="file-error">{form.fileError}</span>}

              {/* OCR Status Display */}
              {scanning && <span className="ocr-status scanning-status">🔍 Scanning for expiry date...</span>}
              {!scanning && form.expiry && (
                <span className="ocr-status detected-date">
                  ✓ Expiry Date Detected: <strong>{new Date(form.expiry).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</strong>
                </span>
              )}
              {!scanning && form.ocrStatus && !form.expiry && (
                <div className="ocr-fallback">
                  <span className="ocr-status error">⚠ No date found in image</span>
                  <div className="fallback-input">
                    <label>Enter expiry date manually:</label>
                    <input
                      type="date"
                      value={form.expiry}
                      onChange={e => setForm(f => ({ ...f, expiry: e.target.value }))}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
          <button type="submit" className="btn-primary" disabled={scanning || !form.expiry}>
            {!form.expiry ? 'Upload image to detect date' : 'Add Document'}
          </button>
        </form>
      )}
      <ul className="doc-list">
        {docs.map((d, i) => {
          const days = daysUntil(d.expiry)
          const status = days < 0 ? 'expired' : days <= 30 ? 'soon' : 'ok'
          return (
            <li key={i} className={`doc-item ${status}`}>
              <div className="doc-item-top">
                <div>
                  <strong>{d.name}</strong>
                  <span className="type">{d.type}</span>
                </div>
                <div className="item-actions">
                  {d.fileData && (
                    <button type="button" className="btn-view" onClick={() => handleViewDoc(d)} title="View attached document">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                      View
                    </button>
                  )}
                  <button type="button" className="btn-delete" onClick={() => handleDeleteDoc(i)} title="Delete document">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                  </button>
                </div>
              </div>
              <span className="due">Expires {new Date(d.expiry).toLocaleDateString()} {days < 0 ? '(Expired)' : days <= 30 ? `(${days} days)` : ''}</span>
            </li>
          )
        })}
        {docs.length === 0 && !open && <li className="empty">No documents. Add insurance, registration, pollution, etc.</li>}
      </ul>
    </section>
  )
}



function AlertsSection({ vehicle, onUpdate }) {
  const alerts = vehicle.alerts || []
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ title: '', type: 'Service', dueDate: '' })

  const handleAdd = (e) => {
    e.preventDefault()
    if (!form.title.trim() || !form.dueDate) return
    onUpdate({ alerts: [...alerts, { title: form.title.trim(), type: form.type, dueDate: form.dueDate }] })
    setForm({ title: '', type: 'Service', dueDate: '' })
    setOpen(false)
  }

  const daysUntil = (d) => Math.ceil((new Date(d) - new Date()) / (1000 * 60 * 60 * 24))

  const handleDeleteAlert = (index) => {
    if (window.confirm('Delete this alert?')) {
      onUpdate({ alerts: alerts.filter((_, i) => i !== index) })
    }
  }

  return (
    <section className="section">
      <div className="section-head">
        <h2>Time-based alerts</h2>
        <button className={`btn-glass ${open ? 'active' : ''}`} onClick={() => setOpen(!open)}>
          {open ? '✕ Cancel' : 'Add Alert'}
        </button>
      </div>
      {open && (
        <form className="add-form card" onSubmit={handleAdd}>
          <div className="form-row">
            <label>Title</label>
            <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Oil change due" required />
          </div>
          <div className="form-row">
            <label>Type</label>
            <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
              <option>Service</option>
              <option>Inspection</option>
              <option>Insurance</option>
              <option>Tax</option>
              <option>Other</option>
            </select>
          </div>
          <div className="form-row">
            <label>Due date</label>
            <input type="date" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} required />
          </div>
          <button type="submit" className="btn-primary">Add alert</button>
        </form>
      )}
      <ul className="alert-list">
        {alerts.map((a, i) => {
          const days = daysUntil(a.dueDate)
          const status = days < 0 ? 'overdue' : (days <= 7 ? 'urgent' : 'upcoming')
          return (
            <li key={i} className={`alert-item ${status}`}>
              <div className="alert-item-content">
                <div>
                  <strong>{a.title}</strong>
                  <span className="type">{a.type}</span>
                </div>
                <button type="button" className="btn-delete" onClick={() => handleDeleteAlert(i)}>✕</button>
              </div>
              <span className="due">Due {new Date(a.dueDate).toLocaleDateString()}</span>
            </li>
          )
        })}
        {alerts.length === 0 && !open && <li className="empty">No alerts.</li>}
      </ul>
    </section>
  )
}

function RentSellSection({ vehicle, onUpdate }) {
  const [location, setLocation] = useState(vehicle.location || '')
  const [isForRent, setIsForRent] = useState(vehicle.isForRent || false)
  const [isForSell, setIsForSell] = useState(vehicle.isForSell || false)
  const [rentPrice, setRentPrice] = useState(vehicle.rentPrice || '')
  const [rentExtraKmPrice, setRentExtraKmPrice] = useState(vehicle.rentExtraKmPrice || '')
  const [sellPrice, setSellPrice] = useState(vehicle.sellPrice || '')

  const handleSave = async (e) => {
    const btn = e.currentTarget
    const og = btn.innerText
    btn.innerText = 'Saving...'
    try {
      await onUpdate({
        location,
        isForRent,
        isForSell,
        rentPrice: rentPrice ? Number(rentPrice) : null,
        rentExtraKmPrice: rentExtraKmPrice ? Number(rentExtraKmPrice) : null,
        sellPrice: sellPrice ? Number(sellPrice) : null,
        photos: [],
        photoUrl: null
      })
      btn.innerText = 'Saved!'
      btn.style.background = '#10b981'
      btn.style.color = '#fff'
      setTimeout(() => {
        btn.innerText = og
        btn.style.background = ''
        btn.style.color = ''
      }, 2000)
    } catch {
      btn.innerText = 'Failed'
      btn.style.background = '#ef4444'
      setTimeout(() => { btn.innerText = og; btn.style.background = '' }, 2000)
    }
  }

  return (
    <section className="section">
      <div className="section-head">
        <h2>Marketplace Settings</h2>
      </div>
      <div className="rs-card card">
        <div className="form-row">
          <label>Location</label>
          <input value={location} onChange={e => setLocation(e.target.value)} className="mc-input" placeholder="City, State" />
        </div>
        <div className="form-row toggles">
          <div className="toggle-group rent-group">
            <label><input type="checkbox" checked={isForRent} onChange={e => setIsForRent(e.target.checked)} /> Ready to Rent</label>
            {isForRent && (
              <div className="rent-inputs">
                <input type="number" placeholder="Price/day (e.g. 500)" value={rentPrice} onChange={e => setRentPrice(e.target.value)} className="mc-input price-input" title="Price per day" />
                <input type="number" placeholder="Extra ₹/km (e.g. 8)" value={rentExtraKmPrice} onChange={e => setRentExtraKmPrice(e.target.value)} className="mc-input price-input" title="Price for extra KM" />
              </div>
            )}
          </div>
          <div className="toggle-group sell-group">
            <label><input type="checkbox" checked={isForSell} onChange={e => setIsForSell(e.target.checked)} /> Ready to Sell</label>
            {isForSell && (
              <input type="number" placeholder="Selling Price (e.g. 150000)" value={sellPrice} onChange={e => setSellPrice(e.target.value)} className="mc-input price-input" style={{ width: '180px' }} />
            )}
          </div>
        </div>
        <button onClick={handleSave} className="btn-primary">Save</button>
      </div>
    </section>
  )
}
