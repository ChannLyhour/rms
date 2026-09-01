import React, { useState, useEffect, useRef } from 'react';

export default function KdsLoadingPopup({
  isOpen = true,
  user = null,
  role = 'staff',
  title = 'CATER POS',
  subMessage = 'INITIALIZING SYSTEM',
  brandName = 'CATER POS',
  duration = 3200,
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

  // ── JavaScript requestAnimationFrame loop for ultra-smooth 60fps progress ──
  useEffect(() => {
    if (!isOpen) {
      setProgress(0);
      return;
    }

    let animationFrameId;
    let startTime = null;
    const animDuration = Math.max(500, duration);
    const calledRef = { current: false };  // guard: fire onComplete only once

    const animateProgress = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const rawPercent = Math.min(100, (elapsed / animDuration) * 100);

      // Smooth ease-out cubic curve
      const t = rawPercent / 100;
      const eased = Math.min(100, (1 - Math.pow(1 - t, 3)) * 100);

      setProgress(eased);

      if (rawPercent < 100) {
        animationFrameId = requestAnimationFrame(animateProgress);
      } else if (onComplete && !calledRef.current) {
        calledRef.current = true;
        onComplete();
      }
    };

    animationFrameId = requestAnimationFrame(animateProgress);

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [isOpen, duration, onComplete]);

  // Animated dots
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
    }, 250);
    const subTimer = setTimeout(() => setShowSub(true), 100);
    return () => {
      clearInterval(dotTimer);
      clearTimeout(subTimer);
    };
  }, [isOpen]);

  if (!mounted) return null;

  const displayName =
    user?.full_name || user?.name || user?.username || (role === 'kitchen' ? 'Kitchen Staff' : role === 'admin' ? 'Administrator' : 'Staff');

  const systemTitle = title || 'CATER POS';
  const subText = subMessage || 'Initializing';

  return (
    <div
      className="fixed inset-0 z-[99999] flex flex-col items-center justify-center overflow-hidden select-none bg-[#0a0303]"
      style={{
        fontFamily: "'Work Sans', system-ui, sans-serif",
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? 'all' : 'none',
        transition: 'opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      <style>{`
        /* Subtle grid */
        .kds-boot-bg::before {
          content: ''; position: absolute; inset: 0;
          background-image: linear-gradient(rgba(232,182,182,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(232,182,182,0.04) 1px, transparent 1px);
          background-size: 40px 40px;
          pointer-events: none;
        }
        .bs-ambient {
          position: absolute; top: -10%; left: 50%; transform: translateX(-50%);
          width: 60vw; height: 60vw; border-radius: 50%;
          background: radial-gradient(circle, rgba(191,64,64,0.12) 0%, transparent 65%);
          pointer-events: none;
        }
        .bs-corner {
          position: absolute; width: 36px; height: 36px;
          opacity: 0; animation: bsFadeIn 0.5s 0.1s ease forwards;
        }
        .bs-corner--tl { top: 22px; left: 22px; border-top: 1.5px solid rgba(232,182,182,0.35); border-left: 1.5px solid rgba(232,182,182,0.35); }
        .bs-corner--tr { top: 22px; right: 22px; border-top: 1.5px solid rgba(232,182,182,0.35); border-right: 1.5px solid rgba(232,182,182,0.35); }
        .bs-corner--bl { bottom: 22px; left: 22px; border-bottom: 1.5px solid rgba(232,182,182,0.35); border-left: 1.5px solid rgba(232,182,182,0.35); }
        .bs-corner--br { bottom: 22px; right: 22px; border-bottom: 1.5px solid rgba(232,182,182,0.35); border-right: 1.5px solid rgba(232,182,182,0.35); }
        
        .bs-logo-wrap {
          position: relative; width: 100px; height: 100px;
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 28px;
        }
        .bs-halo {
          position: absolute; inset: -14px; border-radius: 50%;
          border: 1px solid rgba(232,182,182,0.18);
          animation: bsHaloPulse 2.5s ease-in-out infinite;
        }
        .bs-halo--outer { inset: -28px; border-color: rgba(232,182,182,0.08); animation-delay: 0.8s; }
        @keyframes bsHaloPulse { 0%,100%{opacity:0.3;transform:scale(1);} 50%{opacity:0.9;transform:scale(1.06);} }
        
        .bs-logo {
          width: 80px; height: auto; max-height: 80px; position: relative; z-index: 2;
          object-fit: contain;
          opacity: 0; animation: bsLogoIn 0.8s 0.25s cubic-bezier(0.16,1,0.3,1) forwards;
          filter: drop-shadow(0 4px 24px rgba(232,182,182,0.6));
        }
        @keyframes bsLogoIn { from{opacity:0;transform:scale(0.9) translateY(4px);} to{opacity:1;transform:scale(1) translateY(0);} }
        
        .bs-inview {
          font-family: 'Geist Mono', ui-monospace, monospace;
          font-size: 10px; letter-spacing: 0.32em; text-transform: uppercase;
          color: rgba(232,182,182,0.55); margin-bottom: 6px;
          opacity: 0; animation: bsFadeIn 0.4s 0.3s ease forwards;
        }
        .bs-wordmark-wrap { overflow: hidden; opacity: 0; animation: bsFadeIn 0.01s 0.35s forwards; }
        .bs-wordmark {
          font-size: 34px; font-weight: 900; letter-spacing: 0.28em; padding-left: 0.28em;
          background: linear-gradient(160deg, #ffffff 20%, #E8B6B6 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
          clip-path: inset(0 100% 0 0);
          animation: bsWordReveal 0.6s 0.35s cubic-bezier(0.16,1,0.3,1) forwards;
        }
        @keyframes bsWordReveal { to { clip-path: inset(0 0% 0 0); } }
        .bs-rule {
          height: 1px; background: linear-gradient(90deg, transparent, rgba(232,182,182,0.45), transparent);
          transform: scaleX(0); transform-origin: center;
          animation: bsRuleGrow 0.5s 0.6s cubic-bezier(0.16,1,0.3,1) forwards;
          margin-top: 8px; width: 260px;
        }
        @keyframes bsRuleGrow { to { transform: scaleX(1); } }
        .bs-attr {
          font-family: 'Geist Mono', ui-monospace, monospace;
          font-size: 8.5px; letter-spacing: 0.22em; text-transform: uppercase;
          color: rgba(232,182,182,0.4); margin-top: 8px;
          opacity: 0; animation: bsFadeIn 0.4s 0.7s ease forwards;
        }
        .bs-status {
          margin-top: 36px; display: flex; align-items: center; gap: 9px;
          opacity: 0; animation: bsFadeIn 0.4s 0.6s ease forwards;
        }
        .bs-dash { width: 16px; height: 1px; background: linear-gradient(90deg, transparent, rgba(232,182,182,0.35)); }
        .bs-dash--r { background: linear-gradient(270deg, transparent, rgba(232,182,182,0.35)); }
        .bs-status-txt { font-family: 'Geist Mono', ui-monospace, monospace; font-size: 9px; letter-spacing: 0.15em; color: rgba(232,182,182,0.65); text-transform: uppercase; }
        
        .bs-progress { position: absolute; bottom: 0; left: 0; right: 0; height: 3px; background: rgba(232,182,182,0.1); }
        .bs-progress-fill {
          height: 100%; width: 0%;
          background: linear-gradient(90deg, #8A2E2E, #BF4040, #E8B6B6, #ffffff);
          box-shadow: 0 0 12px rgba(232,182,182,0.8);
          transition: width 0.08s linear;
        }
        @keyframes bsFadeIn { to { opacity: 1; } }
      `}</style>

      <div className="absolute inset-0 kds-boot-bg pointer-events-none z-0" />
      <div className="bs-ambient"></div>
      <div className="bs-corner bs-corner--tl"></div>
      <div className="bs-corner bs-corner--tr"></div>
      <div className="bs-corner bs-corner--bl"></div>
      <div className="bs-corner bs-corner--br"></div>

      <div className="bs-logo-wrap z-10">
        <div className="bs-halo bs-halo--outer"></div>
        <div className="bs-halo"></div>
        <img className="bs-logo" src="/logo-white.png" alt="Hunter Group" />
      </div>

      <div className="bs-inview z-10">Hunter Enterprise Suite</div>
      <div className="bs-wordmark-wrap z-10">
        <div className="bs-wordmark">{systemTitle}</div>
      </div>
      <div className="bs-rule z-10"></div>
      <div className="bs-attr z-10">Point of Sale & Hospitality</div>

      {user && (
        <div className="mt-5 text-[11px] font-bold tracking-[0.2em] text-[#E8B6B6]/90 uppercase opacity-0" style={{ animation: 'bsFadeIn 0.4s 0.6s ease forwards' }}>
          Welcome, {displayName}
        </div>
      )}

      {showSub && (
        <div className="bs-status z-10 !mt-4">
          <div className="bs-dash"></div>
          <span className="bs-status-txt">
            {subText}{dots}
          </span>
          <span className="font-mono text-[9px] text-[#E8B6B6]/80 border-l border-[#E8B6B6]/30 pl-2">
            {Math.round(progress)}%
          </span>
          <div className="bs-dash bs-dash--r"></div>
        </div>
      )}

      <div className="bs-progress z-10">
        <div className="bs-progress-fill" style={{ width: `${progress}%` }}></div>
      </div>
    </div>
  );
}
