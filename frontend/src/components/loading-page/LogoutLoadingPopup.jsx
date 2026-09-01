import React, { useState, useEffect } from 'react';
import {
  LogOut,
  Receipt,
  DollarSign,
  Clock,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

export default function LogoutLoadingPopup({
  isOpen = false,
  user = null,
  sessionSummary = null,
  title = 'LOGGING OUT',
  subMessage = 'Ending System Session',
  brandName = 'CATER POS',
  onComplete = null,
}) {
  const [progress, setProgress] = useState(0);
  const [dots, setDots] = useState('');
  const [showSub, setShowSub] = useState(false);

  // Fade-out transition state
  const [mounted, setMounted] = useState(() => Boolean(isOpen));
  const [visible, setVisible] = useState(() => Boolean(isOpen));

  // Handle isOpen transitions
  useEffect(() => {
    if (isOpen) {
      setMounted(true);
      const raf = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(raf);
    } else {
      setVisible(false);
      const timer = setTimeout(() => setMounted(false), 500);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // ── 60fps progress bar loop ──────────────────────────────────
  useEffect(() => {
    if (!isOpen) {
      setProgress(0);
      return;
    }

    let animationFrameId;
    let startTime = null;
    const duration = 2800; // 2.8s smooth logout sequence

    const animateProgress = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const rawPercent = Math.min(100, (elapsed / duration) * 100);

      // Smooth ease-out cubic curve
      const t = rawPercent / 100;
      const eased = Math.min(100, (1 - Math.pow(1 - t, 3)) * 100);

      setProgress(eased);

      if (rawPercent < 100) {
        animationFrameId = requestAnimationFrame(animateProgress);
      } else if (onComplete) {
        onComplete();
      }
    };

    animationFrameId = requestAnimationFrame(animateProgress);

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [isOpen, onComplete]);

  // Animated dots & delayed reveal
  useEffect(() => {
    if (!isOpen) {
      setDots('');
      setShowSub(false);
      return;
    }
    let count = 0;
    const dotTimer = setInterval(() => {
      count = (count + 1) % 4;
      setDots('.'.repeat(count));
    }, 350);
    const subTimer = setTimeout(() => setShowSub(true), 150);
    return () => {
      clearInterval(dotTimer);
      clearTimeout(subTimer);
    };
  }, [isOpen]);

  if (!mounted) return null;

  const displayName =
    user?.full_name || user?.username || 'Staff User';

  const orderCount = Number(sessionSummary?.orderCount || 0);
  const totalSales = Number(sessionSummary?.totalSales || 0);
  const duration = sessionSummary?.duration || 'Active Shift';

  // Dynamic status text based on progress
  let phaseText = 'Securing terminal session & auth token';
  if (progress > 35 && progress <= 70) {
    phaseText = 'Clearing local cache & session storage';
  } else if (progress > 70) {
    phaseText = 'Session ended safely. Redirecting';
  }

  return (
    <div
      className="fixed inset-0 z-[9999] select-none overflow-hidden font-sans"
      style={{
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        pointerEvents: visible ? 'all' : 'none',
      }}
    >
      <style>{`
        @keyframes logoutPulseRing {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.08); }
        }
        @keyframes logoutRotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes logoutFadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes logoutReveal {
          from { opacity: 0; transform: translateY(16px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes logoutShimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
        .animate-logoutPulseRing { animation: logoutPulseRing 3s ease-in-out infinite; }
        .animate-logoutRotate    { animation: logoutRotate 14s linear infinite; }
        .animate-logoutFadeUp    { animation: logoutFadeUp 0.5s ease-out both; }
        .animate-logoutReveal    { animation: logoutReveal 0.6s cubic-bezier(0.16, 1, 0.3, 1) both; }
        .animate-logoutShimmer   { animation: logoutShimmer 1.8s infinite; }
      `}</style>

      {/* ── Deep Luxury Dark Obsidian & Wine Backdrop ──────────── */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at 50% 40%, #1c0a0a 0%, #120505 55%, #0a0202 100%)',
          transition: 'opacity 0.5s ease',
        }}
      />

      {/* Center Deep Wine Glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 60% 50% at 50% 40%, rgba(138, 46, 46, 0.28) 0%, transparent 75%)',
        }}
      />

      {/* ── Geometric Square Grid Pattern Background ───────────── */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.2]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(232, 182, 182, 0.45) 1px, transparent 1px),
            linear-gradient(90deg, rgba(232, 182, 182, 0.45) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
          maskImage: 'radial-gradient(ellipse 80% 70% at 50% 50%, black 40%, transparent 95%)',
          WebkitMaskImage: 'radial-gradient(ellipse 80% 70% at 50% 50%, black 40%, transparent 95%)',
        }}
      />

      {/* ── Outer Precision Frame Box ──────────────────────────── */}
      <div className="absolute inset-0 border border-[#8A2E2E]/30 pointer-events-none z-10 shadow-[inset_0_0_60px_rgba(138,46,46,0.3)]" />

      {/* ── Four Precision Corner Square Brackets ──────────────── */}
      {[
        'top-0 left-0 border-t-2 border-l-2',
        'top-0 right-0 border-t-2 border-r-2',
        'bottom-0 left-0 border-b-2 border-l-2',
        'bottom-0 right-0 border-b-2 border-r-2',
      ].map((cls, i) => (
        <div
          key={i}
          className={`absolute w-10 h-10 sm:w-14 sm:h-14 z-20 ${cls}`}
          style={{
            borderColor: 'rgba(232, 182, 182, 0.85)',
            filter: 'drop-shadow(0 0 10px rgba(232, 182, 182, 0.5))',
          }}
        />
      ))}

      {/* ── Centered Content ──────────────────────────────────── */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full animate-logoutReveal px-4 max-w-lg mx-auto">
        
        {/* Animated Logout Icon Circle Ring */}
        <div className="relative w-28 h-28 sm:w-36 sm:h-36 mb-5 flex items-center justify-center">
          {/* Outer Pulse Glow Ring */}
          <div
            className="absolute inset-0 rounded-full animate-logoutPulseRing"
            style={{ border: '2px solid rgba(232, 182, 182, 0.35)' }}
          />

          {/* Middle Rotating Dashed Orbit Ring */}
          <svg
            className="absolute inset-2 w-[calc(100%-16px)] h-[calc(100%-16px)] animate-logoutRotate pointer-events-none opacity-70"
            viewBox="0 0 100 100"
          >
            <circle
              cx="50"
              cy="50"
              r="46"
              fill="none"
              stroke="#E8B6B6"
              strokeWidth="1.4"
              strokeDasharray="6 10"
            />
          </svg>

          {/* Inner Dashed Ring */}
          <div
            className="absolute w-22 h-22 sm:w-28 sm:h-28 rounded-full"
            style={{ border: '1.2px dashed rgba(232, 182, 182, 0.25)' }}
          />

          {/* Center Logo / Lock Emblem */}
          <div
            className="w-18 h-18 sm:w-22 sm:h-22 rounded-full flex flex-col items-center justify-center shadow-2xl relative overflow-hidden p-3"
            style={{
              background: 'radial-gradient(circle, rgba(138, 46, 46, 0.55) 0%, rgba(20, 6, 6, 0.95) 100%)',
              border: '2px solid rgba(232, 182, 182, 0.75)',
              boxShadow: '0 0 40px rgba(138, 46, 46, 0.7), inset 0 0 25px rgba(138, 46, 46, 0.5)',
            }}
          >
            <LogOut
              size={30}
              className="text-[#FDF4F4] drop-shadow-[0_0_12px_rgba(232,182,182,0.8)] transform -translate-x-0.5"
            />
          </div>
        </div>

        {/* Brand Header Badge */}
        <div className="flex items-center gap-2 mb-2 px-3 py-0.5 rounded-full bg-[#2a0e0e]/80 border border-[#8A2E2E]/50 shadow-md">
          <Sparkles size={13} className="text-[#E8B6B6]" />
          <span className="text-[10px] font-extrabold tracking-widest text-[#E8B6B6] uppercase">
            {brandName} • SESSION SUMMARY
          </span>
        </div>

        {/* Large System Title */}
        <h1
          className="font-black uppercase leading-none mb-1 animate-logoutFadeUp text-center"
          style={{
            fontSize: 'clamp(26px, 4.5vw, 38px)',
            letterSpacing: '0.15em',
            color: '#FDF4F4',
            animationDelay: '0.08s',
            textShadow: '0 4px 20px rgba(0, 0, 0, 0.95), 0 2px 6px rgba(0, 0, 0, 0.8)',
          }}
        >
          LOGGING <span className="text-[#8A2E2E]" style={{ color: '#8A2E2E', textShadow: '0 0 25px rgba(138,46,46,0.8)' }}>OUT</span>
        </h1>

        {/* Goodbye User Subtitle */}
        {user && (
          <p
            className="text-xs font-medium uppercase tracking-widest mb-4 animate-logoutFadeUp text-center"
            style={{ color: 'rgba(232, 182, 182, 0.75)', animationDelay: '0.12s' }}
          >
            Ending Session for <span className="text-white font-bold">{displayName}</span>
          </p>
        )}

        {/* ── End-of-Session Summary Card ──────────── */}
        <div
          className="w-full bg-[#180707]/90 border border-[#5c1c1c]/80 rounded-2xl p-4 mb-4 backdrop-blur-md shadow-2xl animate-logoutFadeUp"
          style={{ animationDelay: '0.16s' }}
        >
          <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-[#421414]">
            <span className="text-[11px] font-extrabold tracking-wider text-[#E8B6B6] uppercase flex items-center gap-1.5">
              <CheckCircle2 size={14} className="text-emerald-400" />
              Session Performance
            </span>
            <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
              <Clock size={12} />
              {duration}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Orders Taken */}
            <div className="p-3 rounded-xl bg-[#2a0e0e]/80 border border-[#5c1c1c]/50 flex flex-col">
              <div className="flex items-center gap-1.5 text-[#E8B6B6] text-[11px] font-bold uppercase tracking-wider mb-1">
                <Receipt size={14} />
                <span>Orders Taken</span>
              </div>
              <span className="text-2xl font-black text-white tracking-tight">
                {orderCount}
              </span>
              <span className="text-[10px] text-slate-400 font-medium mt-0.5">
                {orderCount === 1 ? '1 Order Processed' : `${orderCount} Orders Processed`}
              </span>
            </div>

            {/* Total Sales */}
            <div className="p-3 rounded-xl bg-[#2a0e0e]/80 border border-[#5c1c1c]/50 flex flex-col">
              <div className="flex items-center gap-1.5 text-emerald-400 text-[11px] font-bold uppercase tracking-wider mb-1">
                <DollarSign size={14} />
                <span>Total Sales</span>
              </div>
              <span className="text-2xl font-black text-emerald-300 tracking-tight">
                ${totalSales.toFixed(2)}
              </span>
              <span className="text-[10px] text-slate-400 font-medium mt-0.5">
                Session Revenue
              </span>
            </div>
          </div>
        </div>

        {/* Live Status Pill & Progress Indicator */}
        {showSub && (
          <div className="animate-logoutFadeUp">
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[#1e0a0a]/90 border border-[#5c1c1c] shadow-xl backdrop-blur-md">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E8B6B6] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#8A2E2E]"></span>
              </span>
              <span className="text-[11px] font-bold tracking-widest text-[#E8B6B6] uppercase">
                {phaseText}{dots}
              </span>
              <span className="font-mono text-[11px] font-extrabold text-[#fca5a5] border-l border-[#5c1c1c] pl-2.5">
                {Math.round(progress)}%
              </span>
            </div>
          </div>
        )}
      </div>

      {/* ── Full-Width Shimmering Progress Bar at Bottom ──────── */}
      <div className="absolute bottom-0 left-0 w-full h-[4px] sm:h-[5px] bg-[#1a0808] z-20 overflow-hidden border-t border-[#4a1616]">
        <div
          className="h-full transition-all duration-75 ease-out"
          style={{
            width: `${progress}%`,
            background: 'linear-gradient(90deg, #8A2E2E 0%, #E8B6B6 70%, #ffffff 100%)',
            boxShadow: '0 0 16px rgba(232, 182, 182, 0.95), 0 0 30px rgba(138, 46, 46, 0.8)',
          }}
        />
        {/* Continuous Gliding Shimmer Light Beam */}
        <div className="absolute inset-0 w-1/4 bg-gradient-to-r from-transparent via-white/60 to-transparent animate-logoutShimmer pointer-events-none" />
      </div>
    </div>
  );
}

