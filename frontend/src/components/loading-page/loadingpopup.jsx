import React, { useState, useEffect, useRef } from 'react';

export default function KdsLoadingPopup({
  isOpen = true,
  user = null,
  role = 'staff',
  title = 'SKYPARK',
  subMessage = 'INITIALIZING HOSPITALITY SUITE',
  brandName = 'SKYPARK CONDOTEL & RESIDENCE',
  duration = 2400,
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
    const calledRef = { current: false };

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

  const systemTitle = title || 'SKYPARK';
  const subText = subMessage || 'Initializing';

  return (
    <div
      className="fixed inset-0 z-[99999] flex flex-col items-center justify-center overflow-hidden select-none bg-[#041012]"
      style={{
        fontFamily: "'Montserrat', -apple-system, BlinkMacSystemFont, sans-serif",
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? 'all' : 'none',
        transition: 'opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;800;900&family=Playfair+Display:ital,wght@0,600;0,700;1,400&display=swap');

        /* Subtle luxury grid */
        .kds-boot-bg::before {
          content: ''; position: absolute; inset: 0;
          background-image: 
            linear-gradient(rgba(241,216,194,0.035) 1px, transparent 1px), 
            linear-gradient(90deg, rgba(241,216,194,0.035) 1px, transparent 1px);
          background-size: 44px 44px;
          pointer-events: none;
        }
        .bs-ambient {
          position: absolute; top: -15%; left: 50%; transform: translateX(-50%);
          width: 65vw; height: 65vw; border-radius: 50%;
          background: radial-gradient(circle, rgba(18,105,115,0.35) 0%, rgba(241,216,194,0.06) 45%, transparent 70%);
          pointer-events: none;
          filter: blur(50px);
        }
        .bs-corner {
          position: absolute; width: 38px; height: 38px;
          opacity: 0; animation: bsFadeIn 0.5s 0.1s ease forwards;
        }
        .bs-corner--tl { top: 24px; left: 24px; border-top: 1.5px solid rgba(241,216,194,0.6); border-left: 1.5px solid rgba(241,216,194,0.6); }
        .bs-corner--tr { top: 24px; right: 24px; border-top: 1.5px solid rgba(241,216,194,0.6); border-right: 1.5px solid rgba(241,216,194,0.6); }
        .bs-corner--bl { bottom: 24px; left: 24px; border-bottom: 1.5px solid rgba(241,216,194,0.6); border-left: 1.5px solid rgba(241,216,194,0.6); }
        .bs-corner--br { bottom: 24px; right: 24px; border-bottom: 1.5px solid rgba(241,216,194,0.6); border-right: 1.5px solid rgba(241,216,194,0.6); }
        
        .bs-logo-wrap {
          position: relative; width: 110px; height: 110px;
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 24px;
        }
        .bs-halo {
          position: absolute; inset: -12px; border-radius: 50%;
          border: 1.5px solid rgba(241,216,194,0.3);
          animation: bsHaloPulse 2.8s ease-in-out infinite;
        }
        .bs-halo--outer { 
          inset: -26px; 
          border: 1px solid rgba(18,105,115,0.4); 
          animation-delay: 0.9s; 
        }
        @keyframes bsHaloPulse { 
          0%,100%{opacity:0.3;transform:scale(1);} 
          50%{opacity:0.85;transform:scale(1.06);} 
        }
        
        .bs-logo {
          width: 86px; height: auto; max-height: 86px; position: relative; z-index: 2;
          object-fit: contain;
          opacity: 0; animation: bsLogoIn 0.8s 0.25s cubic-bezier(0.16,1,0.3,1) forwards;
          filter: drop-shadow(0 8px 24px rgba(18,105,115,0.7));
        }
        @keyframes bsLogoIn { 
          from{opacity:0;transform:scale(0.9) translateY(6px);} 
          to{opacity:1;transform:scale(1) translateY(0);} 
        }
        
        .bs-inview {
          font-size: 11px; letter-spacing: 0.28em; text-transform: uppercase;
          color: rgba(241,216,194,0.75); margin-bottom: 6px; font-weight: 600;
          opacity: 0; animation: bsFadeIn 0.4s 0.3s ease forwards;
        }
        .bs-wordmark-wrap { overflow: hidden; opacity: 0; animation: bsFadeIn 0.01s 0.35s forwards; }
        .bs-wordmark {
          font-family: 'Playfair Display', serif;
          font-size: 36px; font-weight: 700; letter-spacing: 0.16em; padding-left: 0.16em;
          color: #F1D8C2;
          text-shadow: 0 4px 20px rgba(18,105,115,0.6);
          clip-path: inset(0 100% 0 0);
          animation: bsWordReveal 0.6s 0.35s cubic-bezier(0.16,1,0.3,1) forwards;
        }
        @keyframes bsWordReveal { to { clip-path: inset(0 0% 0 0); } }
        .bs-rule {
          height: 1.5px; 
          background: linear-gradient(90deg, transparent, rgba(241,216,194,0.6) 50%, transparent);
          transform: scaleX(0); transform-origin: center;
          animation: bsRuleGrow 0.5s 0.6s cubic-bezier(0.16,1,0.3,1) forwards;
          margin-top: 10px; width: 280px;
        }
        @keyframes bsRuleGrow { to { transform: scaleX(1); } }
        .bs-attr {
          font-size: 9.5px; letter-spacing: 0.25em; text-transform: uppercase;
          color: #7ecbd4; margin-top: 10px; font-weight: 600;
          opacity: 0; animation: bsFadeIn 0.4s 0.7s ease forwards;
        }
        .bs-status {
          margin-top: 36px; display: flex; align-items: center; gap: 10px;
          opacity: 0; animation: bsFadeIn 0.4s 0.6s ease forwards;
        }
        .bs-dash { width: 18px; height: 1px; background: linear-gradient(90deg, transparent, rgba(241,216,194,0.4)); }
        .bs-dash--r { background: linear-gradient(270deg, transparent, rgba(241,216,194,0.4)); }
        .bs-status-txt { font-size: 10px; letter-spacing: 0.18em; color: rgba(241,216,194,0.85); text-transform: uppercase; font-weight: 600; }
        
        .bs-progress { position: absolute; bottom: 0; left: 0; right: 0; height: 3.5px; background: rgba(18,105,115,0.25); }
        .bs-progress-fill {
          height: 100%; width: 0%;
          background: linear-gradient(90deg, #072328, #126973 40%, #F1D8C2 85%, #ffffff 100%);
          box-shadow: 0 0 16px rgba(241,216,194,0.85), 0 0 30px rgba(18,105,115,0.7);
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
        <img className="bs-logo" src="/skypark/Secondary Gold.png" alt="SKYPARK" onError={(e) => { e.currentTarget.src = '/logo-white.png'; }} />
      </div>

      <div className="bs-inview z-10">Condotel &amp; Residence</div>
      <div className="bs-wordmark-wrap z-10">
        <div className="bs-wordmark">{systemTitle}</div>
      </div>
      <div className="bs-rule z-10"></div>
      <div className="bs-attr z-10">Luxury Dining &amp; Hospitality Management</div>

      {showSub && (
        <div className="bs-status z-10 !mt-5">
          <div className="bs-dash"></div>
          <span className="bs-status-txt">
            {subText}{dots}
          </span>
          <span className="font-mono text-[10px] text-[#F1D8C2] border-l border-[#F1D8C2]/30 pl-2.5 font-bold">
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
