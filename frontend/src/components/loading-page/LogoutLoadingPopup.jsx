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
  brandName = 'SKYPARK',
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
        fontFamily: "'Montserrat', -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;800;900&family=Playfair+Display:ital,wght@0,600;0,700;1,400&display=swap');

        @keyframes logoutPulseRing {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.85; transform: scale(1.08); }
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

      {/* ── Deep Luxury Teal & Charcoal Backdrop ──────────── */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at 50% 40%, #082226 0%, #051417 55%, #030a0b 100%)',
          transition: 'opacity 0.5s ease',
        }}
      />

      {/* Center Deep Primary Teal Glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 65% 55% at 50% 40%, rgba(18, 105, 115, 0.35) 0%, transparent 75%)',
        }}
      />

      {/* ── Geometric Grid Pattern ───────────── */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.25]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(241, 216, 194, 0.35) 1px, transparent 1px),
            linear-gradient(90deg, rgba(241, 216, 194, 0.35) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
          maskImage: 'radial-gradient(ellipse 80% 70% at 50% 50%, black 40%, transparent 95%)',
          WebkitMaskImage: 'radial-gradient(ellipse 80% 70% at 50% 50%, black 40%, transparent 95%)',
        }}
      />

      {/* ── Outer Precision Frame Box ──────────────────────────── */}
      <div className="absolute inset-0 border border-[#126973]/40 pointer-events-none z-10 shadow-[inset_0_0_60px_rgba(18,105,115,0.3)]" />

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
            borderColor: '#F1D8C2',
            filter: 'drop-shadow(0 0 10px rgba(241, 216, 194, 0.5))',
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
            style={{ border: '2px solid rgba(241, 216, 194, 0.4)' }}
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
              stroke="#F1D8C2"
              strokeWidth="1.4"
              strokeDasharray="6 10"
            />
          </svg>

          {/* Inner Dashed Ring */}
          <div
            className="absolute w-22 h-22 sm:w-28 sm:h-28 rounded-full"
            style={{ border: '1.2px dashed rgba(18, 105, 115, 0.6)' }}
          />

          {/* Center Logo / Lock Emblem */}
          <div
            className="w-18 h-18 sm:w-22 sm:h-22 rounded-full flex flex-col items-center justify-center shadow-2xl relative overflow-hidden p-3"
            style={{
              background: 'radial-gradient(circle, rgba(18, 105, 115, 0.7) 0%, rgba(5, 20, 23, 0.98) 100%)',
              border: '2px solid #F1D8C2',
              boxShadow: '0 0 40px rgba(18, 105, 115, 0.8), inset 0 0 25px rgba(18, 105, 115, 0.5)',
            }}
          >
            <LogOut
              size={30}
              className="text-[#F1D8C2] drop-shadow-[0_0_12px_rgba(241,216,194,0.8)] transform -translate-x-0.5"
            />
          </div>
        </div>

        {/* Brand Header Badge */}
        <div className="flex items-center gap-2 mb-2 px-3.5 py-1 rounded-full bg-[#0d343a]/90 border border-[#F1D8C2]/40 shadow-md">
          <Sparkles size={13} className="text-[#F1D8C2]" />
          <span className="text-[10.5px] font-bold tracking-widest text-[#F1D8C2] uppercase">
            {brandName} • SESSION SUMMARY
          </span>
        </div>

        {/* Large System Title */}
        <h1
          className="font-black uppercase leading-none mb-1 animate-logoutFadeUp text-center"
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 'clamp(28px, 4.5vw, 40px)',
            letterSpacing: '0.12em',
            color: '#F8F7F4',
            animationDelay: '0.08s',
            textShadow: '0 4px 20px rgba(0, 0, 0, 0.95), 0 2px 6px rgba(0, 0, 0, 0.8)',
          }}
        >
          LOGGING <span style={{ color: '#F1D8C2', textShadow: '0 0 25px rgba(241,216,194,0.7)' }}>OUT</span>
        </h1>

        {/* Goodbye User Subtitle */}
        {user && (
          <p
            className="text-xs font-medium uppercase tracking-widest mb-4 animate-logoutFadeUp text-center"
            style={{ color: 'rgba(248, 247, 244, 0.75)', animationDelay: '0.12s' }}
          >
            Ending Session for <span className="text-[#F1D8C2] font-bold">{displayName}</span>
          </p>
        )}

        {/* ── End-of-Session Summary Card ──────────── */}
        <div
          className="w-full bg-[#082024]/90 border border-[#F1D8C2]/25 rounded-2xl p-4 mb-4 backdrop-blur-md shadow-2xl animate-logoutFadeUp"
          style={{ animationDelay: '0.16s' }}
        >
          <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-[#126973]/40">
            <span className="text-[11px] font-extrabold tracking-wider text-[#F1D8C2] uppercase flex items-center gap-1.5">
              <CheckCircle2 size={14} className="text-emerald-400" />
              Session Performance
            </span>
            <span className="text-[10px] font-bold text-slate-300 flex items-center gap-1">
              <Clock size={12} className="text-[#F1D8C2]" />
              {duration}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Orders Taken */}
            <div className="p-3 rounded-xl bg-[#051619]/90 border border-[#126973]/40 flex flex-col">
              <div className="flex items-center gap-1.5 text-[#F1D8C2] text-[11px] font-bold uppercase tracking-wider mb-1">
                <Receipt size={14} />
                <span>Orders Taken</span>
              </div>
              <span className="text-2xl font-black text-white tracking-tight">
                {orderCount}
              </span>
              <span className="text-[10px] text-slate-300 font-medium mt-0.5">
                {orderCount === 1 ? '1 Order Processed' : `${orderCount} Orders Processed`}
              </span>
            </div>

            {/* Total Sales */}
            <div className="p-3 rounded-xl bg-[#051619]/90 border border-[#126973]/40 flex flex-col">
              <div className="flex items-center gap-1.5 text-emerald-400 text-[11px] font-bold uppercase tracking-wider mb-1">
                <DollarSign size={14} />
                <span>Total Sales</span>
              </div>
              <span className="text-2xl font-black text-emerald-300 tracking-tight">
                ${totalSales.toFixed(2)}
              </span>
              <span className="text-[10px] text-slate-300 font-medium mt-0.5">
                Session Revenue
              </span>
            </div>
          </div>
        </div>

        {/* Live Status Pill & Progress Indicator */}
        {showSub && (
          <div className="animate-logoutFadeUp">
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[#072428]/95 border border-[#F1D8C2]/30 shadow-xl backdrop-blur-md">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#F1D8C2] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#126973]"></span>
              </span>
              <span className="text-[11px] font-bold tracking-widest text-[#F1D8C2] uppercase">
                {phaseText}{dots}
              </span>
              <span className="font-mono text-[11px] font-extrabold text-[#7ecbd4] border-l border-[#F1D8C2]/30 pl-2.5">
                {Math.round(progress)}%
              </span>
            </div>
          </div>
        )}
      </div>

      {/* ── Full-Width Shimmering Progress Bar at Bottom ──────── */}
      <div className="absolute bottom-0 left-0 w-full h-[4px] sm:h-[5px] bg-[#041113] z-20 overflow-hidden border-t border-[#126973]/50">
        <div
          className="h-full transition-all duration-75 ease-out"
          style={{
            width: `${progress}%`,
            background: 'linear-gradient(90deg, #072328 0%, #126973 40%, #F1D8C2 85%, #ffffff 100%)',
            boxShadow: '0 0 16px rgba(241, 216, 194, 0.95), 0 0 30px rgba(18, 105, 115, 0.8)',
          }}
        />
        {/* Continuous Gliding Shimmer Light Beam */}
        <div className="absolute inset-0 w-1/4 bg-gradient-to-r from-transparent via-white/60 to-transparent animate-logoutShimmer pointer-events-none" />
      </div>
    </div>
  );
}
