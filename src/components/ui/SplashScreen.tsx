'use client';
import { useState, useEffect } from 'react';

export default function SplashScreen() {
  const [isVisible, setIsVisible] = useState(true);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Check if splash screen was already shown in this session
    const hasShown = sessionStorage.getItem('tenali_splash_shown');
    if (hasShown) {
      setIsVisible(false);
      return;
    }

    // Lock scrolling while splash screen is active
    document.body.style.overflow = 'hidden';

    // Animate progress bar over 4.3 seconds
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 1;
      });
    }, 43);

    // Trigger fade-out transition at 4.4 seconds
    const fadeTimer = setTimeout(() => {
      setIsFadingOut(true);
    }, 4400);

    // Completely remove splash screen at 5.0 seconds (5000ms)
    const removeTimer = setTimeout(() => {
      setIsVisible(false);
      sessionStorage.setItem('tenali_splash_shown', 'true');
      document.body.style.overflow = '';
    }, 5000);

    return () => {
      clearInterval(interval);
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
      document.body.style.overflow = '';
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'radial-gradient(circle at center, #1e3a8a 0%, #0f172a 65%, #020617 100%)',
        color: '#ffffff',
        overflow: 'hidden',
        opacity: isFadingOut ? 0 : 1,
        transform: isFadingOut ? 'scale(1.06)' : 'scale(1)',
        filter: isFadingOut ? 'blur(8px)' : 'none',
        transition: 'opacity 0.5s ease-out, transform 0.5s ease-out, filter 0.5s ease-out',
        pointerEvents: isFadingOut ? 'none' : 'auto',
      }}
    >
      {/* Dynamic Background Ambient Light Orbs */}
      <div
        style={{
          position: 'absolute',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(59, 130, 246, 0.25) 0%, rgba(59, 130, 246, 0) 70%)',
          filter: 'blur(40px)',
          animation: 'pulseGlow 3s infinite ease-in-out',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(234, 179, 8, 0.18) 0%, rgba(234, 179, 8, 0) 70%)',
          filter: 'blur(50px)',
          animation: 'pulseGlow 4s infinite ease-in-out 1.5s',
          pointerEvents: 'none',
        }}
      />

      {/* Main Flash Card Container */}
      <div
        style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          padding: '40px 32px',
          borderRadius: '32px',
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(20px)',
          border: '1.5px solid rgba(255, 255, 255, 0.15)',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
          maxWidth: '380px',
          width: '90%',
          animation: 'splashCardEnter 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        }}
      >
        {/* Animated Glowing Aura Ring Behind Logo */}
        <div
          style={{
            position: 'absolute',
            top: '36px',
            width: '130px',
            height: '130px',
            borderRadius: '50%',
            background: 'conic-gradient(from 0deg, #3b82f6, #eab308, #3b82f6)',
            filter: 'blur(12px)',
            opacity: 0.7,
            animation: 'spinAura 4s linear infinite',
          }}
        />

        {/* Logo Container */}
        <div
          style={{
            position: 'relative',
            width: '110px',
            height: '110px',
            borderRadius: '26px',
            background: '#ffffff',
            padding: '12px',
            boxShadow: '0 12px 36px rgba(0, 0, 0, 0.35)',
            border: '2px solid rgba(255, 255, 255, 0.9)',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            animation: 'logoPop 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
          }}
        >
          <img
            src="/images/logo.png"
            alt="Tenali Exams Publishers Logo"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
            }}
          />
        </div>

        {/* Publisher Title */}
        <h1
          style={{
            fontFamily: 'var(--font-heading), system-ui, sans-serif',
            fontSize: '1.45rem',
            fontWeight: 800,
            letterSpacing: '-0.3px',
            background: 'linear-gradient(135deg, #ffffff 0%, #cbd5e1 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            margin: '0 0 6px 0',
            textTransform: 'uppercase',
          }}
        >
          Tenali Exams Publishers
        </h1>

        {/* Tagline */}
        <div
          style={{
            fontSize: '0.85rem',
            fontWeight: 700,
            color: '#eab308',
            letterSpacing: '1.5px',
            textTransform: 'uppercase',
            marginBottom: '28px',
            textShadow: '0 0 12px rgba(234, 179, 8, 0.4)',
          }}
        >
          Excellence in Every Page
        </div>

        {/* Animated Progress Bar */}
        <div
          style={{
            width: '100%',
            height: '5px',
            borderRadius: '999px',
            background: 'rgba(255, 255, 255, 0.1)',
            overflow: 'hidden',
            marginBottom: '16px',
            position: 'relative',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${progress}%`,
              background: 'linear-gradient(90deg, #3b82f6 0%, #eab308 100%)',
              borderRadius: '999px',
              boxShadow: '0 0 10px #3b82f6',
              transition: 'width 0.05s linear',
            }}
          />
        </div>

        {/* Subtitle Slogan */}
        <div
          style={{
            fontSize: '0.72rem',
            fontWeight: 600,
            color: 'rgba(255, 255, 255, 0.65)',
            letterSpacing: '0.5px',
          }}
        >
          Right Preparation • Clear Concepts • Sure Success
        </div>
      </div>

      {/* Embedded Animation Keyframes */}
      <style jsx global>{`
        @keyframes pulseGlow {
          0%, 100% { transform: scale(1); opacity: 0.6; }
          50% { transform: scale(1.15); opacity: 0.9; }
        }
        @keyframes spinAura {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes splashCardEnter {
          from { opacity: 0; transform: translateY(20px) scale(0.92); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes logoPop {
          0% { transform: scale(0.6) rotate(-10deg); opacity: 0; }
          70% { transform: scale(1.08) rotate(2deg); opacity: 1; }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
