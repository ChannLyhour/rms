import { useState, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Lock, User, ArrowRight } from 'lucide-react'
import toast from 'react-hot-toast'
import KdsLoadingPopup from '../../components/loading-page/loadingpopup'

/* ── Static ambient orbs ── */
const ORBS = [
  { w: 500, h: 500, top: '-12%', left: '-8%',  delay: '0s',   dur: '20s', op: 0.10 },
  { w: 360, h: 360, top: '55%',  left: '55%',  delay: '-7s',  dur: '24s', op: 0.08 },
  { w: 260, h: 260, top: '15%',  left: '72%',  delay: '-3s',  dur: '16s', op: 0.06 },
  { w: 180, h: 180, top: '80%',  left: '5%',   delay: '-11s', dur: '18s', op: 0.05 },
]

const DEMO_USERS = [
  { label: 'Admin',   username: 'admin',   color: '#BF4040', bg: 'rgba(191,64,64,0.10)',   border: 'rgba(191,64,64,0.25)'   },
  { label: 'Cashier', username: 'cashier', color: '#10b981', bg: 'rgba(16,185,129,0.10)',  border: 'rgba(16,185,129,0.25)'  },
  { label: 'Kitchen', username: 'kitchen', color: '#f59e0b', bg: 'rgba(245,158,11,0.10)',  border: 'rgba(245,158,11,0.25)'  },
]

export default function Login() {
  const [form, setForm]           = useState({ username: '', password: '' })
  const [loading, setLoading]     = useState(false)
  const [loggingIn, setLoggingIn] = useState(false)
  const [focused, setFocused]     = useState(null)
  const roleRef                   = useRef('')   // ref avoids stale-closure in onComplete
  const { login }                 = useAuth()
  const navigate                  = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    const result = await login(form.username, form.password)
    setLoading(false)

    if (result.success) {
      roleRef.current = result.role ?? ''   // store role in ref immediately
      setLoggingIn(true)
    } else {
      toast.error(result.error)
    }
  }

  const handleLoadComplete = useCallback(() => {
    toast.success('Welcome back!')
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
      {/* ── Unified loading overlay ── */}
      <KdsLoadingPopup
        isOpen={loggingIn}
        user={{ username: form.username }}
        title="exView POS"
        subMessage="INITIALIZING SYSTEM"
        duration={1800}
        onComplete={handleLoadComplete}
      />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');

        .lg-root {
          min-height: 100dvh;
          display: flex;
          align-items: stretch;
          background: #0b0606;
          font-family: 'Inter', system-ui, sans-serif;
          overflow: hidden;
          position: relative;
        }
        .lg-root::before {
          content: '';
          position: absolute; inset: 0;
          background-image:
            linear-gradient(rgba(232,182,182,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(232,182,182,0.03) 1px, transparent 1px);
          background-size: 44px 44px;
          pointer-events: none;
          z-index: 0;
        }
        .lg-orb {
          position: absolute;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(191,64,64,1) 0%, transparent 70%);
          pointer-events: none;
          animation: lgOrbFloat var(--dur) var(--delay) ease-in-out infinite alternate;
        }
        @keyframes lgOrbFloat {
          from { transform: translate(0,0) scale(1); }
          to   { transform: translate(16px,20px) scale(1.04); }
        }
        /* corner accents */
        .lg-corner { position: fixed; width: 32px; height: 32px; pointer-events: none; z-index: 0; opacity: 0.3; }
        .lg-corner-tl { top: 20px; left: 20px; border-top: 1px solid rgba(232,182,182,0.5); border-left: 1px solid rgba(232,182,182,0.5); }
        .lg-corner-br { bottom: 20px; right: 20px; border-bottom: 1px solid rgba(232,182,182,0.5); border-right: 1px solid rgba(232,182,182,0.5); }

        /* ── brand panel (left) ── */
        .lg-brand {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 60px 56px;
          position: relative; z-index: 1;
        }
        @media (max-width: 860px) { .lg-brand { display: none; } }
        .lg-brand-eyebrow {
          font-size: 10px; letter-spacing: 0.35em; text-transform: uppercase;
          color: rgba(232,182,182,0.4); margin-bottom: 28px;
          display: flex; align-items: center; gap: 10px;
        }
        .lg-brand-eyebrow::before {
          content: ''; display: block; width: 28px; height: 1px;
          background: rgba(232,182,182,0.3);
        }
        .lg-brand-logo {
          width: 68px; height: 68px; border-radius: 18px;
          background: linear-gradient(135deg, #BF4040, #8A2E2E);
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 32px;
          box-shadow: 0 12px 40px rgba(191,64,64,0.35);
        }
        .lg-brand-title {
          font-size: clamp(34px, 3.5vw, 52px); font-weight: 900;
          letter-spacing: -0.02em; line-height: 1.12;
          background: linear-gradient(160deg, #ffffff 30%, #E8B6B6 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text; margin-bottom: 18px;
        }
        .lg-brand-desc {
          font-size: 13.5px; line-height: 1.8;
          color: rgba(232,182,182,0.4); max-width: 360px; margin-bottom: 44px;
        }
        .lg-feature-item {
          display: flex; align-items: center; gap: 12px;
          font-size: 13px; color: rgba(232,182,182,0.55); margin-bottom: 14px;
        }
        .lg-feature-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: #BF4040; box-shadow: 0 0 8px rgba(191,64,64,0.7);
          flex-shrink: 0;
        }

        /* ── divider ── */
        .lg-divider {
          width: 1px; flex-shrink: 0; z-index: 1;
          background: linear-gradient(to bottom,
            transparent, rgba(232,182,182,0.14) 30%,
            rgba(232,182,182,0.14) 70%, transparent);
        }
        @media (max-width: 860px) { .lg-divider { display: none; } }

        /* ── form panel (right) ── */
        .lg-form-panel {
          width: 100%; max-width: 460px; flex-shrink: 0;
          display: flex; flex-direction: column;
          justify-content: center; align-items: center;
          padding: 48px 32px; position: relative; z-index: 1;
        }
        @media (max-width: 860px) { .lg-form-panel { max-width: 100%; } }
        .lg-form-inner { width: 100%; max-width: 348px; }

        /* ── card ── */
        .lg-card {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(232,182,182,0.12);
          border-radius: 24px; padding: 34px 30px;
          backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px);
          box-shadow: 0 32px 80px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.06);
          position: relative; overflow: hidden;
        }
        .lg-card::before {
          content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(232,182,182,0.35), transparent);
        }
        .lg-card::after {
          content: ''; position: absolute;
          top: 0; left: -60%; width: 60%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(232,182,182,0.04), transparent);
          animation: lgCardShimmer 3.5s 0.6s ease-in-out forwards;
          pointer-events: none;
        }
        @keyframes lgCardShimmer { to { left: 150%; } }

        /* ── card header ── */
        .lg-card-logo {
          width: 50px; height: 50px; border-radius: 13px;
          background: linear-gradient(135deg, #BF4040, #8A2E2E);
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 16px;
          box-shadow: 0 8px 24px rgba(191,64,64,0.4);
        }
        .lg-card-title {
          text-align: center; font-size: 20px; font-weight: 700;
          color: #fff; letter-spacing: -0.02em; margin-bottom: 5px;
        }
        .lg-card-sub {
          text-align: center; font-size: 12px;
          color: rgba(232,182,182,0.4); margin-bottom: 28px;
        }

        /* ── inputs ── */
        .lg-label {
          display: block; font-size: 10.5px; font-weight: 600;
          letter-spacing: 0.09em; text-transform: uppercase;
          color: rgba(232,182,182,0.45); margin-bottom: 7px;
        }
        .lg-field {
          position: relative; border-radius: 11px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(232,182,182,0.12);
          transition: border-color .2s, box-shadow .2s, background .2s;
          margin-bottom: 14px;
        }
        .lg-field.focused {
          border-color: rgba(191,64,64,0.55);
          background: rgba(191,64,64,0.06);
          box-shadow: 0 0 0 3px rgba(191,64,64,0.14), inset 0 1px 0 rgba(255,255,255,0.04);
        }
        .lg-field-icon {
          position: absolute; left: 13px; top: 50%; transform: translateY(-50%);
          color: rgba(232,182,182,0.3); transition: color .2s; pointer-events: none;
        }
        .lg-field.focused .lg-field-icon { color: rgba(191,64,64,0.75); }
        .lg-input {
          width: 100%; background: transparent; border: none; outline: none;
          padding: 13px 15px 13px 40px;
          font-size: 13px; font-family: 'Inter', system-ui, sans-serif;
          color: #fff; border-radius: 11px;
        }
        .lg-input::placeholder { color: rgba(232,182,182,0.2); }

        /* ── submit ── */
        .lg-btn {
          width: 100%; padding: 13px 24px; border-radius: 11px; border: none;
          cursor: pointer; font-size: 13.5px; font-weight: 700;
          font-family: 'Inter', system-ui, sans-serif; letter-spacing: 0.03em;
          color: #fff;
          background: linear-gradient(135deg, #BF4040 0%, #8A2E2E 100%);
          box-shadow: 0 6px 24px rgba(191,64,64,0.4), inset 0 1px 0 rgba(255,255,255,0.12);
          transition: transform .15s, box-shadow .15s, opacity .15s;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          margin-top: 6px; position: relative; overflow: hidden;
        }
        .lg-btn::before {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(to bottom, rgba(255,255,255,0.1), transparent);
          pointer-events: none;
        }
        .lg-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 10px 32px rgba(191,64,64,0.5), inset 0 1px 0 rgba(255,255,255,0.12); }
        .lg-btn:active:not(:disabled) { transform: translateY(1px) scale(0.985); }
        .lg-btn:disabled { opacity: 0.55; cursor: not-allowed; }
        .lg-spinner {
          width: 14px; height: 14px; border: 2px solid rgba(255,255,255,0.3);
          border-top-color: white; border-radius: 50%;
          animation: lgSpin .7s linear infinite;
        }
        @keyframes lgSpin { to { transform: rotate(360deg); } }

        /* ── demo section ── */
        .lg-demo {
          margin-top: 18px; padding: 15px 18px; border-radius: 13px;
          border: 1px solid rgba(232,182,182,0.09);
          background: rgba(255,255,255,0.025);
        }
        .lg-demo-label {
          font-size: 10px; font-weight: 500; letter-spacing: 0.06em; text-transform: uppercase;
          color: rgba(232,182,182,0.3); margin-bottom: 11px; text-align: center;
        }
        .lg-pills { display: flex; gap: 7px; }
        .lg-pill {
          flex: 1; padding: 8px 0; border-radius: 8px;
          border: 1px solid var(--pb); background: var(--pbg); color: var(--pc);
          font-size: 11.5px; font-weight: 700; font-family: 'Inter', system-ui, sans-serif;
          cursor: pointer; letter-spacing: 0.03em;
          transition: filter .15s, transform .15s;
        }
        .lg-pill:hover { filter: brightness(1.35); transform: translateY(-1px); }
        .lg-pill:active { transform: scale(0.96); }

        /* ── theme toggle ── */
        .lg-theme { position: absolute; top: 22px; right: 22px; z-index: 20; }

        /* ── footer ── */
        .lg-footer {
          text-align: center; margin-top: 18px; font-size: 10.5px;
          color: rgba(232,182,182,0.2); letter-spacing: 0.04em;
        }
      `}</style>

      <div className="lg-root">
        {ORBS.map((o, i) => (
          <div key={i} className="lg-orb" style={{
            width: o.w, height: o.h, top: o.top, left: o.left,
            opacity: o.op, '--dur': o.dur, '--delay': o.delay,
          }} />
        ))}

        <div className="lg-corner lg-corner-tl" />
        <div className="lg-corner lg-corner-br" />


        {/* ── LEFT: brand panel ── */}
        <div className="lg-brand">

          <div className="lg-brand-title" style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: 'clamp(38px, 4vw, 58px)', fontWeight: 900, letterSpacing: '0.08em', textTransform: 'uppercase', WebkitTextFillColor: 'unset', background: 'none', marginBottom: 18 }}>
            <span style={{ color: '#ffffff' }}>CATER</span>
            <span style={{ color: '#BF4040', marginLeft: '0.25em' }}>POS</span>
          </div>
          <p className="lg-brand-desc">
            A unified point-of-sale & hospitality platform built for speed, clarity, and control.
          </p>
          {['Real-time kitchen display sync', 'Multi-role staff access control', 'Smart analytics & reporting', 'Seamless table & order management'].map(f => (
            <div key={f} className="lg-feature-item">
              <span className="lg-feature-dot" />
              {f}
            </div>
          ))}
        </div>

        {/* divider */}
        <div className="lg-divider" />

        {/* ── RIGHT: form panel ── */}
        <div className="lg-form-panel">
          <div className="lg-form-inner">
            <div className="lg-card">
            
              <div className="lg-card-title">Welcome back</div>
              <div className="lg-card-sub">Sign in to your staff account</div>

              <form onSubmit={handleSubmit}>
                <label className="lg-label" htmlFor="login-username">Username</label>
                <div className={`lg-field${focused === 'username' ? ' focused' : ''}`}>
                  <User size={14} className="lg-field-icon" />
                  <input
                    id="login-username"
                    type="text"
                    required
                    autoComplete="username"
                    value={form.username}
                    onChange={e => setForm({ ...form, username: e.target.value })}
                    onFocus={() => setFocused('username')}
                    onBlur={() => setFocused(null)}
                    placeholder="e.g. admin"
                    className="lg-input"
                  />
                </div>

                <label className="lg-label" htmlFor="login-password">Password</label>
                <div className={`lg-field${focused === 'password' ? ' focused' : ''}`}>
                  <Lock size={14} className="lg-field-icon" />
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
                    className="lg-input"
                  />
                </div>

                <button id="login-submit" type="submit" disabled={loading} className="lg-btn">
                  {loading
                    ? <><div className="lg-spinner" />…</>
                    : <>Sign In <ArrowRight size={14} /></>
                  }
                </button>
              </form>
            </div>

            {/* demo credentials */}
            <div className="lg-demo">
              <div className="lg-demo-label">Quick demo · password: <strong style={{ color: 'rgba(232,182,182,0.6)' }}>password</strong></div>
              <div className="lg-pills">
                {DEMO_USERS.map(u => (
                  <button
                    key={u.username}
                    type="button"
                    className="lg-pill"
                    style={{ '--pc': u.color, '--pbg': u.bg, '--pb': u.border }}
                    onClick={() => setForm({ username: u.username, password: 'password' })}
                  >
                    {u.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="lg-footer">CATER POS · Hunter Enterprise Suite</div>
          </div>
        </div>
      </div>
    </>
  )
}
