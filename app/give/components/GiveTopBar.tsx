'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { useSmartBack } from '@/hooks/useSmartBack';

const TALK_TO_TEAM_URL = 'https://cal.com/tyler-diorio/15min';

export function GiveTopBar() {
  const goBack = useSmartBack();
  // True once the user has scrolled past the hero section. Drives both the
  // white-background fade-in on the bar itself and the "Give now" CTA
  // visibility (kept hidden while the hero CTA is on-screen so there's only
  // one prominent CTA at a time).
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const hero = document.querySelector('.give-hero') as HTMLElement | null;
    if (!hero) return;

    const update = () => {
      const heroBottom = hero.offsetTop + hero.offsetHeight;
      setScrolled(window.scrollY >= heroBottom);
    };

    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  return (
    <header
      className={`give-topbar${scrolled ? ' give-topbar-visible' : ''}`}
      aria-label="Give page navigation"
      aria-hidden={!scrolled}
    >
      <div className="give-topbar-inner">
        <div className="give-topbar-left">
          <button
            type="button"
            onClick={goBack}
            className="give-topbar-back"
            aria-label="Go back"
            tabIndex={scrolled ? 0 : -1}
          >
            <ChevronLeft className="w-5 h-5" aria-hidden />
          </button>
          <Link
            href="/"
            className="give-topbar-logo"
            aria-label="ResearchHub home"
            tabIndex={scrolled ? 0 : -1}
          >
            <Logo size={28} />
          </Link>
        </div>

        <div className="give-topbar-right">
          <a
            href={TALK_TO_TEAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            tabIndex={scrolled ? 0 : -1}
            className="give-topbar-talk-btn"
          >
            Talk to the Team
          </a>
        </div>
      </div>

      <style jsx>{`
        .give-topbar {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 50;
          background: rgba(255, 255, 255, 0.92);
          border-bottom: 1px solid #e5e7eb;
          backdrop-filter: saturate(140%) blur(10px);
          -webkit-backdrop-filter: saturate(140%) blur(10px);
          box-shadow: 0 6px 20px -16px rgba(13, 30, 80, 0.25);
          opacity: 0;
          transform: translateY(-100%);
          pointer-events: none;
          transition:
            opacity 0.25s ease,
            transform 0.25s ease;
        }
        .give-topbar-visible {
          opacity: 1;
          transform: translateY(0);
          pointer-events: auto;
        }
        .give-topbar-inner {
          max-width: 1320px;
          margin: 0 auto;
          padding: 12px 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
        }
        .give-topbar-left {
          display: flex;
          align-items: center;
          gap: 8px;
          min-width: 0;
        }
        .give-topbar-back {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: transparent;
          color: #374151;
          border: 1px solid transparent;
          cursor: pointer;
          transition:
            background-color 0.15s ease,
            border-color 0.15s ease,
            color 0.15s ease;
        }
        .give-topbar-back:hover {
          background: rgba(15, 23, 42, 0.06);
          color: #0b1530;
        }
        .give-topbar-back:focus-visible {
          outline: 2px solid #3971ff;
          outline-offset: 2px;
        }
        .give-topbar-logo {
          display: inline-flex;
          align-items: center;
          padding: 4px 6px;
          border-radius: 8px;
        }
        .give-topbar-logo:focus-visible {
          outline: 2px solid #3971ff;
          outline-offset: 2px;
        }
        .give-topbar-right {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .give-topbar-talk-btn {
          display: inline-flex;
          align-items: center;
          height: 40px;
          padding: 0 20px;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 600;
          color: #fff;
          background: linear-gradient(to right, #3971ff, #4a7fff);
          box-shadow: 0 6px 16px -8px rgba(57, 113, 255, 0.55);
          text-decoration: none;
          transition:
            background 0.15s ease,
            box-shadow 0.15s ease;
        }
        .give-topbar-talk-btn:hover {
          background: linear-gradient(to right, #2c5ee8, #3971ff);
          box-shadow: 0 10px 22px -8px rgba(57, 113, 255, 0.7);
        }
        @media (max-width: 640px) {
          .give-topbar-inner {
            padding: 10px 16px;
          }
        }
      `}</style>
    </header>
  );
}
