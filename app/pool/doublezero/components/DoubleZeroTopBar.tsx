'use client';

import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { Icon } from '@/components/ui/icons';
import { useSmartBack } from '@/hooks/useSmartBack';
import { PoolFundCta } from '../../components/PoolFundCta';
import { useScrolledPast } from '../../hooks/useScrolledPast';
import { DoubleZeroMark } from './DoubleZeroMark';

export function DoubleZeroTopBar() {
  const goBack = useSmartBack();
  // Drives the bar's fade-in and its "Fund" CTA, kept hidden while the hero's
  // own CTA is still on screen.
  const scrolled = useScrolledPast('.dz-hero');

  return (
    <header
      className={`dz-topbar${scrolled ? ' dz-topbar-visible' : ''}`}
      aria-label="DoubleZero call navigation"
      aria-hidden={!scrolled}
    >
      <div className="dz-topbar-inner">
        <div className="dz-topbar-left">
          <button
            type="button"
            onClick={goBack}
            className="dz-topbar-back"
            aria-label="Go back"
            tabIndex={scrolled ? 0 : -1}
          >
            <ChevronLeft className="w-5 h-5" aria-hidden />
          </button>
          <span className="dz-topbar-org">
            <DoubleZeroMark size={28} />
            <span className="dz-topbar-org-name">DoubleZero</span>
          </span>
          <span className="dz-topbar-cross" aria-hidden>
            &#10005;
          </span>
          <Link
            href="/"
            className="dz-topbar-logo"
            aria-label="ResearchHub home"
            tabIndex={scrolled ? 0 : -1}
          >
            <Logo size={26} />
          </Link>
        </div>

        <PoolFundCta tabIndex={scrolled ? 0 : -1} className="dz-topbar-fund-btn">
          <Icon name="giveRSC" size={16} color="white" />
          Fund
        </PoolFundCta>
      </div>

      <style jsx>{`
        .dz-topbar {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 50;
          background: rgba(255, 255, 255, 0.93);
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
        .dz-topbar-visible {
          opacity: 1;
          transform: translateY(0);
          pointer-events: auto;
        }
        .dz-topbar-inner {
          max-width: 1320px;
          margin: 0 auto;
          padding: 11px 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
        }
        .dz-topbar-left {
          display: flex;
          align-items: center;
          gap: 10px;
          min-width: 0;
        }
        .dz-topbar-back {
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
          flex-shrink: 0;
          transition:
            background-color 0.15s ease,
            color 0.15s ease;
        }
        .dz-topbar-back:hover {
          background: rgba(15, 23, 42, 0.06);
          color: #0b1530;
        }
        .dz-topbar-back:focus-visible {
          outline: 2px solid #3971ff;
          outline-offset: 2px;
        }
        .dz-topbar-org {
          display: inline-flex;
          align-items: center;
          gap: 9px;
          min-width: 0;
        }
        .dz-topbar-org-name {
          font-size: 14.5px;
          font-weight: 700;
          letter-spacing: -0.01em;
          color: #0b1530;
          white-space: nowrap;
        }
        .dz-topbar-cross {
          flex-shrink: 0;
          font-size: 12px;
          line-height: 1;
          color: #98a1b3;
        }
        @media (max-width: 720px) {
          .dz-topbar-org-name {
            display: none;
          }
        }
        @media (max-width: 640px) {
          .dz-topbar-inner {
            padding: 10px 16px;
          }
        }
      `}</style>
      {/* Global: styled-jsx doesn't add its scoping class to `Link`-rendered
          anchors, so the CTA and logo rules must be global to apply. */}
      <style jsx global>{`
        .dz-topbar-logo {
          display: inline-flex;
          align-items: center;
          padding: 4px 6px;
          border-radius: 8px;
        }
        .dz-topbar-logo:focus-visible {
          outline: 2px solid #3971ff;
          outline-offset: 2px;
        }
        .dz-topbar-fund-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          height: 40px;
          padding: 0 20px;
          flex-shrink: 0;
          font-size: 14px;
          font-weight: 700;
          color: #ffffff;
          background: linear-gradient(to right, #4a7fff, #3971ff);
          box-shadow: 0 6px 16px -8px rgba(57, 113, 255, 0.65);
          text-decoration: none;
          transition:
            background 0.15s ease,
            box-shadow 0.15s ease;
        }
        .dz-topbar-fund-btn:hover {
          background: linear-gradient(to right, #3971ff, #2563eb);
          box-shadow: 0 10px 22px -8px rgba(57, 113, 255, 0.8);
          color: #ffffff;
        }
      `}</style>
    </header>
  );
}
