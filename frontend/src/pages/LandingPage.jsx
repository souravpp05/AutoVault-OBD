import { useNavigate } from 'react-router-dom'
import { useEffect, useRef } from 'react'

export default function LandingPage() {
  const navigate = useNavigate()
  const canvasRef = useRef(null)

  // Particle starfield
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let w = canvas.width = window.innerWidth
    let h = canvas.height = window.innerHeight
    const stars = Array.from({ length: 180 }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      r: Math.random() * 1.4 + 0.2,
      o: Math.random() * 0.6 + 0.1,
      speed: Math.random() * 0.25 + 0.05
    }))

    let animId
    const draw = () => {
      ctx.clearRect(0, 0, w, h)
      stars.forEach(s => {
        s.o += (Math.random() - 0.5) * 0.04
        s.o = Math.max(0.05, Math.min(0.8, s.o))
        s.y += s.speed
        if (s.y > h) { s.y = 0; s.x = Math.random() * w }
        ctx.beginPath()
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(200, 220, 255, ${s.o})`
        ctx.fill()
      })
      animId = requestAnimationFrame(draw)
    }
    draw()

    const onResize = () => {
      w = canvas.width = window.innerWidth
      h = canvas.height = window.innerHeight
    }
    window.addEventListener('resize', onResize)
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', onResize) }
  }, [])

  return (
    <div className="landing-page">
      {/* Particle canvas */}
      <canvas ref={canvasRef} className="star-canvas" />

      {/* Animated aurora orbs */}
      <div className="aurora-orbs">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
        <div className="orb orb-4" />
      </div>

      {/* Grid overlay */}
      <div className="grid-overlay" />

      <div className="hero-content">
        <div className="brand-badge glass fade-in">
          <span className="badge-dot" />
          Premium Vehicle Intelligence
        </div>

        <h1 className="hero-title fade-in">
          Auto<span className="title-accent">Vault</span>
        </h1>

        <p className="hero-subtitle fade-in">
          Secure. Intelligent. Transparent.
        </p>

        <div className="hero-stats fade-in">
          <div className="stat-pill"><span>🔴</span> Live OBD</div>
          <div className="stat-pill"><span>🛡️</span> Verified Health</div>
          <div className="stat-pill"><span>⚡</span> Real-Time Data</div>
        </div>

        <div className="hero-cards fade-in">
          <div className="hero-card" onClick={() => navigate('/diary')}>
            <div className="card-glow card-glow-amber" />
            <div className="hero-icon-container">
              <span className="hero-icon">🔒</span>
              <div className="icon-ring" />
            </div>
            <h2>User Diary</h2>
            <p>Your secure personal vault for fuel tracking, real-time health diagnostics, and vehicle insights.</p>
            <button className="btn-primary">Manage Fleet →</button>
          </div>

          <div className="hero-card hero-card-alt" onClick={() => navigate('/marketplace')}>
            <div className="card-glow card-glow-blue" />
            <div className="hero-icon-container">
              <span className="hero-icon">✨</span>
              <div className="icon-ring icon-ring-blue" />
            </div>
            <h2>Marketplace</h2>
            <p>Buy or rent vehicles with verified OBD health reports. Complete transparency, zero guesswork.</p>
            <button className="btn-secondary">Explore Now →</button>
          </div>
        </div>
      </div>

      <style>{`
        .landing-page {
          min-height: 100vh;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          overflow: hidden;
          background: radial-gradient(ellipse 120% 80% at 50% -10%, rgba(12,18,40,1) 0%, #04070f 60%);
        }

        /* Starfield canvas */
        .star-canvas {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 0;
        }

        /* Aurora orbs */
        .aurora-orbs {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 1;
        }
        .orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(90px);
          mix-blend-mode: screen;
        }
        .orb-1 {
          width: 55vw; height: 55vw;
          top: -20%; left: -15%;
          background: radial-gradient(circle, rgba(76,201,240,0.18) 0%, transparent 70%);
          animation: float-orb 14s ease-in-out infinite alternate;
        }
        .orb-2 {
          width: 45vw; height: 45vw;
          bottom: -15%; right: -10%;
          background: radial-gradient(circle, rgba(124,58,237,0.2) 0%, transparent 70%);
          animation: float-orb 18s ease-in-out infinite alternate-reverse;
        }
        .orb-3 {
          width: 30vw; height: 30vw;
          top: 30%; right: 15%;
          background: radial-gradient(circle, rgba(252,163,17,0.1) 0%, transparent 70%);
          animation: float-orb 11s ease-in-out infinite alternate;
        }
        .orb-4 {
          width: 25vw; height: 25vw;
          bottom: 20%; left: 20%;
          background: radial-gradient(circle, rgba(16,185,129,0.09) 0%, transparent 70%);
          animation: float-orb 16s ease-in-out infinite alternate-reverse;
        }
        @keyframes float-orb {
          0%   { transform: translate(0, 0) scale(1); }
          50%  { transform: translate(3%, -5%) scale(1.08); }
          100% { transform: translate(-3%, 4%) scale(0.94); }
        }

        /* Subtle grid */
        .grid-overlay {
          position: absolute;
          inset: 0;
          z-index: 1;
          pointer-events: none;
          background-image:
            linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px);
          background-size: 80px 80px;
          mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black 0%, transparent 100%);
        }

        /* Content */
        .hero-content {
          position: relative;
          z-index: 10;
          width: 100%;
          max-width: 1050px;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0;
        }

        /* Badge */
        .brand-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.45rem 1.1rem;
          border-radius: 100px;
          font-size: 0.72rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 2px;
          color: var(--accent-amber);
          margin-bottom: 1.8rem;
          border: 1px solid rgba(252,163,17,0.2);
          box-shadow: 0 0 24px rgba(252,163,17,0.08), inset 0 0 12px rgba(252,163,17,0.04);
        }
        .badge-dot {
          width: 7px; height: 7px;
          border-radius: 50%;
          background: var(--accent-amber);
          box-shadow: 0 0 8px rgba(252,163,17,0.8);
          animation: pulse-dot 2s ease-in-out infinite;
        }
        @keyframes pulse-dot {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.4); opacity: 0.7; }
        }

        /* Title */
        .hero-title {
          font-family: var(--font-display);
          font-size: clamp(3.5rem, 10vw, 6.5rem);
          font-weight: 900;
          margin-bottom: 0.75rem;
          color: #fff;
          letter-spacing: -3px;
          line-height: 1;
          text-shadow: 0 0 80px rgba(76,201,240,0.15);
        }
        .title-accent {
          background: linear-gradient(135deg, #fca311 0%, #f59e0b 40%, #4cc9f0 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          filter: drop-shadow(0 0 30px rgba(252,163,17,0.4));
        }

        /* Subtitle */
        .hero-subtitle {
          font-size: clamp(1rem, 2vw, 1.35rem);
          color: var(--text-muted);
          margin-bottom: 2rem;
          font-weight: 400;
          letter-spacing: 0.5px;
        }

        /* Stat pills */
        .hero-stats {
          display: flex;
          gap: 0.75rem;
          flex-wrap: wrap;
          justify-content: center;
          margin-bottom: 3.5rem;
        }
        .stat-pill {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.4rem 1rem;
          border-radius: 100px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          font-size: 0.78rem;
          font-weight: 600;
          color: var(--text-muted);
          backdrop-filter: blur(10px);
          transition: all 0.3s;
        }
        .stat-pill:hover {
          border-color: rgba(252,163,17,0.3);
          color: #fff;
          background: rgba(255,255,255,0.07);
        }

        /* Cards */
        .hero-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 2rem;
          width: 100%;
        }

        .hero-card {
          position: relative;
          padding: 2.5rem 2rem;
          text-align: center;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0;
          background: rgba(8, 14, 30, 0.7);
          backdrop-filter: blur(24px) saturate(160%);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 28px;
          transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
          overflow: hidden;
          box-shadow: 0 8px 40px rgba(0,0,0,0.5);
        }
        .hero-card:hover {
          transform: translateY(-8px) scale(1.01);
          border-color: rgba(252,163,17,0.3);
          box-shadow: 0 24px 70px rgba(0,0,0,0.6), 0 0 60px rgba(252,163,17,0.07);
        }
        .hero-card-alt:hover {
          border-color: rgba(76,201,240,0.3);
          box-shadow: 0 24px 70px rgba(0,0,0,0.6), 0 0 60px rgba(76,201,240,0.07);
        }

        /* Card inner glow */
        .card-glow {
          position: absolute;
          top: -30%; left: -20%;
          width: 140%; height: 70%;
          border-radius: 50%;
          filter: blur(60px);
          opacity: 0;
          transition: opacity 0.5s;
          pointer-events: none;
        }
        .hero-card:hover .card-glow { opacity: 1; }
        .card-glow-amber { background: radial-gradient(ellipse, rgba(252,163,17,0.12) 0%, transparent 70%); }
        .card-glow-blue  { background: radial-gradient(ellipse, rgba(76,201,240,0.12) 0%, transparent 70%); }

        /* Icon */
        .hero-icon-container {
          position: relative;
          width: 80px; height: 80px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 22px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1.8rem;
          font-size: 2.5rem;
          transition: transform 0.4s cubic-bezier(0.4,0,0.2,1);
          box-shadow: inset 0 0 20px rgba(255,255,255,0.02);
        }
        .icon-ring {
          position: absolute;
          inset: -8px;
          border-radius: 28px;
          border: 1px solid rgba(252,163,17,0.15);
          animation: ring-pulse 3s ease-in-out infinite;
        }
        .icon-ring-blue { border-color: rgba(76,201,240,0.15); }
        @keyframes ring-pulse {
          0%, 100% { transform: scale(1); opacity: 0.5; }
          50% { transform: scale(1.06); opacity: 1; }
        }
        .hero-card:hover .hero-icon-container {
          transform: scale(1.12) translateY(-4px);
          box-shadow: 0 12px 30px rgba(0,0,0,0.3);
        }

        .hero-card h2 {
          font-family: var(--font-display);
          font-size: 1.75rem;
          font-weight: 800;
          margin-bottom: 0.9rem;
          color: #fff;
        }
        .hero-card p {
          color: var(--text-muted);
          line-height: 1.65;
          margin-bottom: 2rem;
          font-size: 0.95rem;
        }
        .hero-card button {
          width: 100%;
          padding: 0.9rem;
          border-radius: 14px;
          font-weight: 700;
          font-size: 0.9rem;
          letter-spacing: 0.5px;
        }

        @media (max-width: 768px) {
          .landing-page { padding: 1.5rem 1rem; }
          .hero-cards { gap: 1.25rem; }
          .hero-stats { gap: 0.5rem; }
          .hero-title { letter-spacing: -2px; }
        }
      `}</style>
    </div>
  )
}
