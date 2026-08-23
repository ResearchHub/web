'use client';

import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { Icon } from '@/components/ui/icons';
import { useSmartBack } from '@/hooks/useSmartBack';
import { PoolFundCta } from '../../components/PoolFundCta';
import { useScrolledPast } from '../../hooks/useScrolledPast';

export function SubstationTopBar() {
  const goBack = useSmartBack();
  // Drives both the white-background fade-in on the bar itself and the "Fund"
  // CTA visibility, kept hidden while the hero CTA is still on-screen.
  const scrolled = useScrolledPast('.substation-hero');

  return (
    <header
      className={`substation-topbar${scrolled ? ' substation-topbar-visible' : ''}`}
      aria-label="Substation page navigation"
      aria-hidden={!scrolled}
    >
      <div className="substation-topbar-inner">
        <div className="substation-topbar-left">
          <button
            type="button"
            onClick={goBack}
            className="substation-topbar-back"
            aria-label="Go back"
            tabIndex={scrolled ? 0 : -1}
          >
            <ChevronLeft className="w-5 h-5" aria-hidden />
          </button>
          <Link
            href="/"
            className="substation-topbar-logo"
            aria-label="ResearchHub home"
            tabIndex={scrolled ? 0 : -1}
          >
            <Logo size={28} />
          </Link>
        </div>

        <div className="substation-topbar-right">
          <PoolFundCta tabIndex={scrolled ? 0 : -1} className="substation-topbar-fund-btn">
            <Icon name="giveRSC" size={16} color="white" />
            Fund
          </PoolFundCta>
        </div>
      </div>

      <style jsx>{`
        .substation-topbar {
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
        .substation-topbar-visible {
          opacity: 1;
          transform: translateY(0);
          pointer-events: auto;
        }
        .substation-topbar-inner {
          max-width: 1320px;
          margin: 0 auto;
          padding: 12px 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
        }
        .substation-topbar-left {
          display: flex;
          align-items: center;
          gap: 8px;
          min-width: 0;
        }
        .substation-topbar-back {
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
        .substation-topbar-back:hover {
          background: rgba(15, 23, 42, 0.06);
          color: #0b1530;
        }
        .substation-topbar-back:focus-visible {
          outline: 2px solid #3971ff;
          outline-offset: 2px;
        }
        .substation-topbar-right {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        @media (max-width: 640px) {
          .substation-topbar-inner {
            padding: 10px 16px;
          }
        }
      `}</style>
      {/* Global: styled-jsx doesn't add its scoping class to `Link`-rendered
          anchors, so these CTA/logo rules must be global to apply. */}
      <style jsx global>{`
        .substation-topbar-logo {
          display: inline-flex;
          align-items: center;
          padding: 4px 6px;
          border-radius: 8px;
        }
        .substation-topbar-logo:focus-visible {
          outline: 2px solid #3971ff;
          outline-offset: 2px;
        }
        .substation-topbar-fund-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          height: 40px;
          padding: 0 20px;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 700;
          color: #ffffff;
          background: linear-gradient(to right, #60a5fa, #3971ff);
          box-shadow: 0 6px 16px -8px rgba(57, 113, 255, 0.65);
          text-decoration: none;
          transition:
            background 0.15s ease,
            box-shadow 0.15s ease;
        }
        .substation-topbar-fund-btn:hover {
          background: linear-gradient(to right, #3971ff, #2563eb);
          box-shadow: 0 10px 22px -8px rgba(57, 113, 255, 0.8);
          color: #ffffff;
        }
      `}</style>
    </header>
  );
}
