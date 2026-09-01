import { useState, useRef, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Lock, User, ArrowRight, Sun, Moon } from 'lucide-react'
import toast from 'react-hot-toast'
import KdsLoadingPopup from '../../components/loading-page/loadingpopup'

/* ── Ambient floating orbs ── */
const ORBS = [
  { w: 560, h: 560, top: '-12%', left: '-8%',  delay: '0s',   dur: '20s' },
  { w: 450, h: 450, top: '48%',  left: '55%',  delay: '-6s',  dur: '24s' },
  { w: 320, h: 320, top: '8%',   left: '68%',  delay: '-3s',  dur: '16s' },
  { w: 260, h: 260, top: '78%',  left: '12%',  delay: '-10s', dur: '18s' },
]

export default function Login() {
  const [form, setForm]           = useState({ username: '', password: '' })
  const [loading, setLoading]     = useState(false)
  const [loggingIn, setLoggingIn] = useState(false)
  const [focused, setFocused]     = useState(null)
  const [theme, setTheme]         = useState(() => localStorage.getItem('skypark_theme') || 'dark')
  const roleRef                   = useRef('')
  const { login }                 = useAuth()
  const navigate                  = useNavigate()

  useEffect(() => {
    localStorage.setItem('skypark_theme', theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'))
  }

  const isDark = theme === 'dark'

  const demoUsers = isDark ? [
    { label: 'Admin',   username: 'admin',   color: '#F1D8C2', bg: 'rgba(241, 216, 194, 0.14)', border: 'rgba(241, 216, 194, 0.40)' },
    { label: 'Cashier', username: 'cashier', color: '#7ecbd4', bg: 'rgba(18, 105, 115, 0.25)',  border: 'rgba(126, 203, 212, 0.45)' },
    { label: 'Kitchen', username: 'kitchen', color: '#f1d8c2', bg: 'rgba(18, 105, 115, 0.18)',  border: 'rgba(241, 216, 194, 0.25)' },
  ] : [
    { label: 'Admin',   username: 'admin',   color: '#126973', bg: 'rgba(241, 216, 194, 0.45)', border: 'rgba(241, 216, 194, 0.85)' },
    { label: 'Cashier', username: 'cashier', color: '#126973', bg: 'rgba(18, 105, 115, 0.12)',  border: 'rgba(18, 105, 115, 0.35)' },
    { label: 'Kitchen', username: 'kitchen', color: '#7c532b', bg: 'rgba(241, 216, 194, 0.35)', border: 'rgba(241, 216, 194, 0.75)' },
  ]

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    const result = await login(form.username, form.password)
    setLoading(false)

    if (result.success) {
      roleRef.current = result.role ?? ''
      setLoggingIn(true)
    } else {
      toast.error(result.error || 'Invalid credentials')
    }
  }

  const handleLoadComplete = useCallback(() => {
    toast.success('Welcome back to SKYPARK')
    switch (roleRef.current) {
      case 'admin':   navigate('/dashboard'); break
      case 'manager': navigate('/dashboard'); break
      case 'cashier': navigate('/pos');       break
      case 'kitchen': navigate('/kds');       break
      default:        navigate('/pos')
    }
  }, [navigate])

  return (
    <>
      {/* ── Unified Loading Overlay ── */}
      <KdsLoadingPopup
        isOpen={loggingIn}
        user={{ username: form.username }}
        title="SKYPARK"
        subMessage="INITIALIZING HOSPITALITY SUITE"
        duration={1800}
        onComplete={handleLoadComplete}
      />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;800;900&family=Playfair+Display:ital,wght@0,600;0,700;1,400&display=swap');

        /* ── THEME TOKENS ── */
        .skypark-login-root.theme-dark {
          --sp-bg-base: #041012;
          --sp-bg-gradient: 
            radial-gradient(circle at 18% 22%, rgba(18, 105, 115, 0.35) 0%, transparent 50%),
            radial-gradient(circle at 82% 78%, rgba(241, 216, 194, 0.12) 0%, transparent 45%),
            linear-gradient(180deg, #051316 0%, #020809 100%);
          --sp-grid: rgba(241, 216, 194, 0.035);
          --sp-orb-1: rgba(18, 105, 115, 0.32);
          --sp-orb-2: rgba(241, 216, 194, 0.14);
          --sp-orb-3: rgba(37, 138, 151, 0.25);
          --sp-orb-4: rgba(241, 216, 194, 0.10);
          
          --sp-corner: #F1D8C2;
          --sp-text-main: #F8F7F4;
          --sp-text-sub: rgba(248, 247, 244, 0.7);
          --sp-text-muted: rgba(248, 247, 244, 0.5);
          
          --sp-card-bg: linear-gradient(145deg, rgba(8, 30, 34, 0.90) 0%, rgba(4, 18, 20, 0.96) 100%);
          --sp-card-border: rgba(241, 216, 194, 0.28);
          --sp-card-title: #F1D8C2;
          --sp-card-sub: rgba(248, 247, 244, 0.65);
          --sp-card-shadow: 0 32px 80px rgba(0, 0, 0, 0.75), 0 0 0 1px rgba(18, 105, 115, 0.4), 0 12px 36px -10px rgba(18, 105, 115, 0.3);
          
          --sp-label: #F1D8C2;
          --sp-field-bg: rgba(4, 15, 17, 0.7);
          --sp-field-border: rgba(241, 216, 194, 0.22);
          --sp-field-focus-bg: rgba(18, 105, 115, 0.22);
          --sp-field-focus-border: #F1D8C2;
          --sp-field-focus-shadow: 0 0 0 3px rgba(241, 216, 194, 0.18), 0 4px 20px rgba(18, 105, 115, 0.45);
          --sp-field-icon: rgba(241, 216, 194, 0.5);
          --sp-field-icon-active: #F1D8C2;
          --sp-field-placeholder: rgba(248, 247, 244, 0.28);
          
          --sp-btn-bg: linear-gradient(135deg, #126973 0%, #0d4e56 100%);
          --sp-btn-color: #F1D8C2;
          --sp-btn-border: rgba(241, 216, 194, 0.45);
          --sp-btn-hover-bg: linear-gradient(135deg, #1a838f 0%, #126973 100%);
          --sp-btn-hover-color: #ffffff;
          --sp-btn-shadow: 0 8px 24px rgba(18, 105, 115, 0.5);
          
          --sp-demo-bg: rgba(18, 105, 115, 0.15);
          --sp-demo-border: rgba(241, 216, 194, 0.2);
          --sp-demo-label: rgba(241, 216, 194, 0.7);
          --sp-demo-strong: #F1D8C2;
          
          --sp-divider: linear-gradient(to bottom, transparent, rgba(241, 216, 194, 0.25) 20%, rgba(18, 105, 115, 0.6) 50%, rgba(241, 216, 194, 0.25) 80%, transparent);
          --sp-footer: rgba(241, 216, 194, 0.5);
          
          --sp-toggle-bg: rgba(18, 105, 115, 0.25);
          --sp-toggle-border: rgba(241, 216, 194, 0.35);
          --sp-toggle-color: #F1D8C2;
        }

        .skypark-login-root.theme-light {
          --sp-bg-base: #F8F7F4;
          --sp-bg-gradient: 
            radial-gradient(circle at 18% 22%, rgba(241, 216, 194, 0.45) 0%, transparent 50%),
            radial-gradient(circle at 82% 78%, rgba(18, 105, 115, 0.12) 0%, transparent 45%),
            linear-gradient(180deg, #FAF8F5 0%, #F1EEE8 100%);
          --sp-grid: rgba(18, 105, 115, 0.04);
          --sp-orb-1: rgba(241, 216, 194, 0.5);
          --sp-orb-2: rgba(18, 105, 115, 0.15);
          --sp-orb-3: rgba(241, 216, 194, 0.4);
          --sp-orb-4: rgba(18, 105, 115, 0.10);
          
          --sp-corner: #126973;
          --sp-text-main: #072328;
          --sp-text-sub: #126973;
          --sp-text-muted: #5c7075;
          
          --sp-card-bg: linear-gradient(145deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 247, 244, 0.98) 100%);
          --sp-card-border: rgba(241, 216, 194, 0.85);
          --sp-card-title: #126973;
          --sp-card-sub: #5c7075;
          --sp-card-shadow: 0 24px 60px rgba(18, 105, 115, 0.10), 0 0 0 1px rgba(241, 216, 194, 0.6), 0 8px 24px -6px rgba(18, 105, 115, 0.08);
          
          --sp-label: #126973;
          --sp-field-bg: #FFFFFF;
          --sp-field-border: rgba(18, 105, 115, 0.22);
          --sp-field-focus-bg: rgba(18, 105, 115, 0.04);
          --sp-field-focus-border: #126973;
          --sp-field-focus-shadow: 0 0 0 3px rgba(18, 105, 115, 0.15), 0 4px 14px rgba(241, 216, 194, 0.35);
          --sp-field-icon: #126973;
          --sp-field-icon-active: #126973;
          --sp-field-placeholder: rgba(18, 105, 115, 0.35);
          
          --sp-btn-bg: linear-gradient(135deg, #126973 0%, #0d4e56 100%);
          --sp-btn-color: #F1D8C2;
          --sp-btn-border: #126973;
          --sp-btn-hover-bg: linear-gradient(135deg, #187a86 0%, #126973 100%);
          --sp-btn-hover-color: #FFFFFF;
          --sp-btn-shadow: 0 8px 24px rgba(18, 105, 115, 0.30);
          
          --sp-demo-bg: rgba(241, 216, 194, 0.25);
          --sp-demo-border: rgba(241, 216, 194, 0.65);
          --sp-demo-label: #5c7075;
          --sp-demo-strong: #126973;
          
          --sp-divider: linear-gradient(to bottom, transparent, rgba(18, 105, 115, 0.2) 20%, rgba(241, 216, 194, 0.7) 50%, rgba(18, 105, 115, 0.2) 80%, transparent);
          --sp-footer: #5c7075;
          
          --sp-toggle-bg: #FFFFFF;
          --sp-toggle-border: rgba(18, 105, 115, 0.25);
          --sp-toggle-color: #126973;
        }

        .skypark-login-root {
          min-height: 100dvh;
          display: flex;
          align-items: stretch;
          background: var(--sp-bg-base);
          background-image: var(--sp-bg-gradient);
          font-family: 'Montserrat', -apple-system, BlinkMacSystemFont, sans-serif;
          overflow: hidden;
          position: relative;
          transition: background-color 0.4s ease, color 0.4s ease;
        }

        /* Subtle luxury grid lines */
        .skypark-login-root::before {
          content: '';
          position: absolute; inset: 0;
          background-image:
            linear-gradient(var(--sp-grid) 1px, transparent 1px),
            linear-gradient(90deg, var(--sp-grid) 1px, transparent 1px);
          background-size: 52px 52px;
          pointer-events: none;
          z-index: 0;
        }

        /* Floating orbs */
        .sp-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(50px);
          pointer-events: none;
          animation: spOrbFloat var(--dur) var(--delay) ease-in-out infinite alternate;
          transition: background 0.4s ease;
        }
        @keyframes spOrbFloat {
          from { transform: translate(0, 0) scale(1); }
          to   { transform: translate(22px, 26px) scale(1.06); }
        }

        /* Corner Accents */
        .sp-corner {
          position: fixed;
          width: 36px;
          height: 36px;
          pointer-events: none;
          z-index: 1;
          opacity: 0.6;
        }
        .sp-corner-tl {
          top: 24px; left: 24px;
          border-top: 1.5px solid var(--sp-corner);
          border-left: 1.5px solid var(--sp-corner);
        }
        .sp-corner-br {
          bottom: 24px; right: 24px;
          border-bottom: 1.5px solid var(--sp-corner);
          border-right: 1.5px solid var(--sp-corner);
        }

        /* Theme Toggle Button */
        .sp-theme-toggle {
          position: absolute;
          top: 24px;
          right: 24px;
          z-index: 20;
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          border-radius: 9999px;
          background: var(--sp-toggle-bg);
          border: 1px solid var(--sp-toggle-border);
          color: var(--sp-toggle-color);
          font-family: 'Montserrat', sans-serif;
          font-size: 11.5px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          cursor: pointer;
          backdrop-filter: blur(12px);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .sp-theme-toggle:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
        }

        /* ── BRAND PANEL (LEFT) ── */
        .sp-brand-panel {
          flex: 1.15;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 64px 72px;
          position: relative;
          z-index: 1;
        }
        @media (max-width: 960px) { .sp-brand-panel { display: none; } }

        .sp-logo-container {
          margin-bottom: 24px;
        }
        .sp-logo-img {
          height: 84px;
          width: auto;
          filter: drop-shadow(0 10px 24px rgba(0, 0, 0, 0.3));
          transition: transform 0.3s ease;
        }

        .sp-brand-desc {
          font-size: 14.5px;
          line-height: 1.8;
          color: var(--sp-text-sub);
          max-width: 420px;
          margin-top: 8px;
        }

        /* ── VERTICAL DIVIDER ── */
        .sp-divider {
          width: 1px;
          flex-shrink: 0;
          z-index: 1;
          background: var(--sp-divider);
        }
        @media (max-width: 960px) { .sp-divider { display: none; } }

        /* ── FORM PANEL (RIGHT) ── */
        .sp-form-panel {
          width: 100%;
          max-width: 490px;
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          padding: 48px 36px;
          position: relative;
          z-index: 1;
        }
        @media (max-width: 960px) { .sp-form-panel { max-width: 100%; } }
        .sp-form-inner { width: 100%; max-width: 368px; }

        /* ── CARD ── */
        .sp-card {
          background: var(--sp-card-bg);
          border: 1px solid var(--sp-card-border);
          border-radius: 24px;
          padding: 38px 32px;
          backdrop-filter: blur(28px);
          -webkit-backdrop-filter: blur(28px);
          box-shadow: var(--sp-card-shadow);
          position: relative;
          overflow: hidden;
          transition: background 0.35s ease, border-color 0.35s ease, box-shadow 0.35s ease;
        }

        /* Top gold shimmer bar */
        .sp-card::before {
          content: '';
          position: absolute; top: 0; left: 0; right: 0; height: 2px;
          background: linear-gradient(90deg, transparent, var(--sp-corner), transparent);
        }

        .sp-card-header {
          text-align: center;
          margin-bottom: 28px;
        }
        .sp-card-title {
          font-family: 'Playfair Display', serif;
          font-size: 26px;
          font-weight: 700;
          color: var(--sp-card-title);
          letter-spacing: 0.06em;
          margin-bottom: 6px;
        }
        .sp-card-sub {
          font-size: 12.5px;
          color: var(--sp-card-sub);
          letter-spacing: 0.04em;
        }

        /* ── INPUT FIELDS ── */
        .sp-label {
          display: block;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--sp-label);
          margin-bottom: 8px;
        }
        .sp-field {
          position: relative;
          border-radius: 12px;
          background: var(--sp-field-bg);
          border: 1px solid var(--sp-field-border);
          transition: all 0.25s ease;
          margin-bottom: 18px;
        }
        .sp-field.focused {
          border-color: var(--sp-field-focus-border);
          background: var(--sp-field-focus-bg);
          box-shadow: var(--sp-field-focus-shadow);
        }
        .sp-field-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--sp-field-icon);
          transition: color 0.2s;
          pointer-events: none;
        }
        .sp-field.focused .sp-field-icon {
          color: var(--sp-field-icon-active);
        }
        .sp-input {
          width: 100%;
          background: transparent;
          border: none;
          outline: none;
          padding: 14px 16px 14px 44px;
          font-size: 13.5px;
          font-family: 'Montserrat', sans-serif;
          color: var(--sp-text-main);
          border-radius: 12px;
        }
        .sp-input::placeholder {
          color: var(--sp-field-placeholder);
        }

        /* ── SUBMIT BUTTON ── */
        .sp-btn-submit {
          width: 100%;
          padding: 14px 24px;
          border-radius: 12px;
          border: 1px solid var(--sp-btn-border);
          cursor: pointer;
          font-size: 13.5px;
          font-weight: 700;
          font-family: 'Montserrat', sans-serif;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--sp-btn-color);
          background: var(--sp-btn-bg);
          box-shadow: var(--sp-btn-shadow);
          transition: all 0.22s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          margin-top: 8px;
          position: relative;
          overflow: hidden;
        }
        .sp-btn-submit:hover:not(:disabled) {
          transform: translateY(-2px);
          background: var(--sp-btn-hover-bg);
          color: var(--sp-btn-hover-color);
          box-shadow: 0 12px 34px rgba(18, 105, 115, 0.5);
        }
        .sp-btn-submit:active:not(:disabled) {
          transform: translateY(1px) scale(0.99);
        }
        .sp-btn-submit:disabled {
          opacity: 0.55;
          cursor: not-allowed;
        }
        .sp-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(241, 216, 194, 0.3);
          border-top-color: var(--sp-btn-color);
          border-radius: 50%;
          animation: spSpin 0.7s linear infinite;
        }
        @keyframes spSpin { to { transform: rotate(360deg); } }

        /* ── DEMO SHORTCUT SECTION ── */
        .sp-demo-box {
          margin-top: 20px;
          padding: 16px 18px;
          border-radius: 14px;
          border: 1px solid var(--sp-demo-border);
          background: var(--sp-demo-bg);
          transition: all 0.3s ease;
        }
        .sp-demo-label {
          font-size: 10.5px;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--sp-demo-label);
          margin-bottom: 12px;
          text-align: center;
        }
        .sp-demo-label strong {
          color: var(--sp-demo-strong);
        }
        .sp-pills {
          display: flex;
          gap: 8px;
        }
        .sp-pill {
          flex: 1;
          padding: 8px 4px;
          border-radius: 9px;
          border: 1px solid var(--pb);
          background: var(--pbg);
          color: var(--pc);
          font-size: 12px;
          font-weight: 700;
          font-family: 'Montserrat', sans-serif;
          cursor: pointer;
          letter-spacing: 0.03em;
          transition: all 0.18s ease;
          text-align: center;
        }
        .sp-pill:hover {
          filter: brightness(1.15);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        }
        .sp-pill:active {
          transform: scale(0.96);
        }

        /* ── FOOTER ── */
        .sp-footer {
          text-align: center;
          margin-top: 22px;
          font-size: 11px;
          color: var(--sp-footer);
          letter-spacing: 0.08em;
        }
      `}</style>

      <div className={`skypark-login-root theme-${theme}`}>
        {/* Theme Toggle Button */}
        <button
          type="button"
          className="sp-theme-toggle"
          onClick={toggleTheme}
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDark ? (
            <>
              <Sun size={14} /> <span>Light</span>
            </>
          ) : (
            <>
              <Moon size={14} /> <span>Dark</span>
            </>
          )}
        </button>

        {/* Floating background glowing orbs */}
        {ORBS.map((o, i) => (
          <div key={i} className="sp-orb" style={{
            width: o.w,
            height: o.h,
            top: o.top,
            left: o.left,
            background: `radial-gradient(circle, var(--sp-orb-${i + 1}) 0%, transparent 70%)`,
            '--dur': o.dur,
            '--delay': o.delay,
          }} />
        ))}

        {/* Decorative corner borders */}
        <div className="sp-corner sp-corner-tl" />
        <div className="sp-corner sp-corner-br" />

        {/* ── LEFT: Brand Panel ── */}
        <div className="sp-brand-panel">
          <div className="sp-logo-container">
            <img 
              src={isDark ? '/skypark/Secondary Gold.png' : '/skypark/Primary.png'} 
              alt="SKYPARK Logo" 
              className="sp-logo-img" 
              onError={(e) => { e.currentTarget.style.display = 'none' }}
            />
          </div>

          <p className="sp-brand-desc">
            A luxury point-of-sale and residence dining management platform engineered for speed, elegance, and complete guest satisfaction.
          </p>
        </div>

        {/* Elegant vertical divider */}
        <div className="sp-divider" />

        {/* ── RIGHT: Login Form Panel ── */}
        <div className="sp-form-panel">
          <div className="sp-form-inner">
            <div className="sp-card">
              
              <div className="sp-card-header">
                <h2 className="sp-card-title">SKYPARK</h2>
                <p className="sp-card-sub">Sign in to your SKYPARK account</p>
              </div>

              <form onSubmit={handleSubmit}>
                <label className="sp-label" htmlFor="login-username">Username</label>
                <div className={`sp-field${focused === 'username' ? ' focused' : ''}`}>
                  <User size={15} className="sp-field-icon" />
                  <input
                    id="login-username"
                    type="text"
                    required
                    autoComplete="username"
                    value={form.username}
                    onChange={e => setForm({ ...form, username: e.target.value })}
                    onFocus={() => setFocused('username')}
                    onBlur={() => setFocused(null)}
                    placeholder="e.g. admin, cashier"
                    className="sp-input"
                  />
                </div>

                <label className="sp-label" htmlFor="login-password">Password</label>
                <div className={`sp-field${focused === 'password' ? ' focused' : ''}`}>
                  <Lock size={15} className="sp-field-icon" />
                  <input
                    id="login-password"
                    type="password"
                    required
                    autoComplete="current-password"
                    value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                    onFocus={() => setFocused('password')}
                    onBlur={() => setFocused(null)}
                    placeholder="••••••••"
                    className="sp-input"
                  />
                </div>

                <button id="login-submit" type="submit" disabled={loading} className="sp-btn-submit">
                  {loading
                    ? <><div className="sp-spinner" /> Signing in…</>
                    : <>Enter Portal <ArrowRight size={15} /></>
                  }
                </button>
              </form>
            </div>

            {/* Demo Quick Accounts */}
            <div className="sp-demo-box">
              <div className="sp-demo-label">Quick demo · password: <strong>password</strong></div>
              <div className="sp-pills">
                {demoUsers.map(u => (
                  <button
                    key={u.username}
                    type="button"
                    className="sp-pill"
                    style={{ '--pc': u.color, '--pbg': u.bg, '--pb': u.border }}
                    onClick={() => setForm({ username: u.username, password: 'password' })}
                  >
                    {u.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="sp-footer">SKYPARK Condotel &amp; Residence · POS &amp; RMS Suite</div>
          </div>
        </div>
      </div>
    </>
  )
}
