'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Check, Copy, Users } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import AnimatedGlobe from '@/components/Globe/AnimatedGlobe';
import { Starfield } from '@/app/give/components/Starfield';
import { useReferralShare } from './useReferralShare';

export function ReferralHero() {
  const { copyLink, isCopied } = useReferralShare();

  // The AnimatedGlobe canvas is sized in px, so we measure its column and clamp
  // to keep it crisp on desktop while never overflowing on small screens.
  const globeWrapRef = useRef<HTMLDivElement>(null);
  const [globeSize, setGlobeSize] = useState(460);

  useEffect(() => {
    const el = globeWrapRef.current;
    if (!el) return;
    const measure = () => {
      const w = el.getBoundingClientRect().width;
      setGlobeSize(Math.round(Math.max(260, Math.min(480, w))));
    };
    measure();
    let ro: ResizeObserver | null = null;
    if (window.ResizeObserver) {
      ro = new ResizeObserver(measure);
      ro.observe(el);
    } else {
      window.addEventListener('resize', measure);
    }
    return () => {
      if (ro) ro.disconnect();
      else window.removeEventListener('resize', measure);
    };
  }, []);

  const handleSeeHowItWorks = () => {
    const target = document.getElementById('referral-how');
    if (!target) return;
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    target.scrollIntoView({
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
      block: 'start',
    });
  };

  return (
    <section className="referral-hero">
      <Starfield />
      <div className="referral-hero-blob" aria-hidden="true" />
      <Link
        href="/"
        aria-label="ResearchHub home"
        style={{
          position: 'absolute',
          top: 28,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 3,
          display: 'inline-flex',
          alignItems: 'center',
          padding: '6px 10px',
          borderRadius: 10,
        }}
        className="referral-hero-logo"
      >
        <Logo size={32} variant="white" />
      </Link>
      <div className="referral-hero-inner">
        <div>
          <div className="referral-hero-eyebrow">
            <Users className="w-5 h-5 text-[#c7d2fe]" aria-hidden />
            Referrals on ResearchHub
          </div>
          <h1 className="referral-hero-h1">
            <span className="referral-h1-line">Refer a funder, </span>
            <span className="referral-h1-accent">accelerate science.</span>
          </h1>
          <p className="referral-hero-lead">
            Invite funders to ResearchHub and you both earn 10% in Funding Credits on everything
            they contribute over the next 6 months.
          </p>
          <div className="referral-hero-assurances">
            <span className="referral-hero-assurance">
              <Check className="w-[18px] h-[18px] text-[#34d399]" strokeWidth={2.5} aria-hidden />
              10% bonus for both of you
            </span>
            <span className="referral-hero-assurance">
              <Check className="w-[18px] h-[18px] text-[#34d399]" strokeWidth={2.5} aria-hidden />
              Credits fund any proposal
            </span>
          </div>
          <div className="referral-hero-ctas">
            <button type="button" onClick={copyLink} className="referral-hero-copy-btn">
              {isCopied ? (
                <Check className="w-[18px] h-[18px]" strokeWidth={2.5} aria-hidden />
              ) : (
                <Copy className="w-[18px] h-[18px]" aria-hidden />
              )}
              {isCopied ? 'Copied!' : 'Copy your link'}
            </button>
            <button
              type="button"
              onClick={handleSeeHowItWorks}
              className="referral-hero-secondary-btn"
            >
              See how it works
            </button>
          </div>
        </div>

        <div className="referral-hero-globe" ref={globeWrapRef}>
          <AnimatedGlobe size={globeSize} theme="dark" className="referral-hero-globe-canvas" />
        </div>
      </div>

      <style jsx>{`
        .referral-hero {
          position: relative;
          padding: 160px 28px 120px;
          overflow: hidden;
          /* Deep-space cosmos: an indigo nebula glow near the globe falling off
             into near-black, so the starfield and the glowing globe read. */
          background:
            radial-gradient(circle at 72% 40%, rgba(67, 56, 202, 0.42), transparent 55%),
            radial-gradient(circle at 28% 82%, rgba(49, 46, 129, 0.3), transparent 60%),
            linear-gradient(168deg, #0b1238 0%, #101a45 55%, #1a235e 100%);
          color: #e2e8f0;
          min-height: min(calc(100vh - 60px), 905px);
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
        .referral-hero-logo {
          transition: background-color 0.15s ease;
        }
        .referral-hero-logo:hover {
          background: rgba(255, 255, 255, 0.08);
        }
        .referral-hero-logo:focus-visible {
          outline: 2px solid #93c5fd;
          outline-offset: 2px;
        }
        .referral-hero-inner {
          width: 100%;
          max-width: 1320px;
          margin: 0 auto;
          position: relative;
          z-index: 2;
          display: grid;
          grid-template-columns: 1fr 1.05fr;
          gap: 64px;
          align-items: center;
        }
        .referral-hero-globe {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
        }
        .referral-hero-globe :global(.referral-hero-globe-canvas) {
          max-width: 100%;
        }
        .referral-hero-blob {
          position: absolute;
          width: 620px;
          height: 620px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(57, 113, 255, 0.18), transparent 70%);
          filter: blur(40px);
          pointer-events: none;
          top: -160px;
          right: -180px;
        }
        .referral-hero-h1 {
          font-family: 'Cal Sans', var(--font-geist-sans), system-ui, sans-serif;
          font-weight: 700;
          font-size: 72px;
          line-height: 1.04;
          letter-spacing: -0.03em;
          margin: 0 0 32px;
          color: #f8fafc;
        }
        .referral-h1-line {
          display: inline;
          color: #f8fafc;
        }
        .referral-h1-accent {
          display: inline;
          color: #93c5fd;
        }
        .referral-hero-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          font-family: var(--font-geist-sans), system-ui, sans-serif;
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #c7d2fe;
          margin-bottom: 32px;
        }
        .referral-hero-lead {
          font-size: 20px;
          line-height: 1.55;
          color: #cbd5e1;
          max-width: 560px;
          margin: 0 0 28px;
          font-weight: 500;
        }
        .referral-hero-assurances {
          display: flex;
          align-items: center;
          gap: 24px;
          flex-wrap: wrap;
          margin: 0 0 28px;
        }
        .referral-hero-assurance {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 16px;
          font-weight: 600;
          color: #e2e8f0;
        }
        .referral-hero-ctas {
          display: flex;
          gap: 12px;
          align-items: center;
          flex-wrap: wrap;
        }
        .referral-hero-copy-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          height: 54px;
          /* Reserve width for the longest label so the button doesn't shrink
             (and shift the neighboring CTA) when it swaps to "Copied!". */
          min-width: 200px;
          padding: 0 28px;
          border-radius: 14px;
          font-size: 16px;
          font-weight: 600;
          color: #fff;
          background: linear-gradient(to right, #3971ff, #4a7fff);
          box-shadow: 0 8px 20px -8px rgba(57, 113, 255, 0.55);
          border: 0;
          cursor: pointer;
          transition:
            background 0.15s ease,
            box-shadow 0.15s ease;
          white-space: nowrap;
        }
        .referral-hero-copy-btn:hover {
          background: linear-gradient(to right, #2c5ee8, #3971ff);
          box-shadow: 0 12px 24px -8px rgba(57, 113, 255, 0.7);
        }
        .referral-hero-secondary-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          height: 54px;
          padding: 0 24px;
          border-radius: 14px;
          font-size: 16px;
          font-weight: 600;
          color: #e2e8f0;
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.18);
          cursor: pointer;
          transition:
            background 0.15s ease,
            border-color 0.15s ease;
          white-space: nowrap;
        }
        .referral-hero-secondary-btn:hover {
          background: rgba(255, 255, 255, 0.12);
          border-color: rgba(255, 255, 255, 0.32);
        }
        @media (max-width: 1280px) {
          .referral-hero {
            padding: 120px 28px 100px;
            min-height: min(calc(100vh - 60px), 777px);
          }
          .referral-hero-inner {
            gap: 48px;
          }
          .referral-hero-h1 {
            font-size: 72px;
          }
          .referral-hero-lead {
            margin: 0 0 24px;
          }
        }
        @media (max-width: 1100px) {
          .referral-hero {
            min-height: auto;
            padding: 104px 28px 80px;
          }
          .referral-hero-inner {
            grid-template-columns: 1fr;
            gap: 32px;
          }
          .referral-hero-globe {
            order: -1;
            max-width: 420px;
            margin: 0 auto;
          }
          .referral-hero-h1 {
            font-size: 56px;
          }
          .referral-hero-lead {
            margin: 0 0 32px;
          }
        }
        @media (max-width: 768px) {
          .referral-hero-eyebrow {
            display: none;
          }
        }
        @media (max-width: 640px) {
          .referral-hero {
            padding: 100px 20px 64px;
          }
          .referral-hero-h1 {
            font-size: 40px;
            margin: 0 0 20px;
          }
          .referral-hero-lead {
            font-size: 17px;
            margin: 0 0 28px;
          }
          .referral-hero-ctas {
            flex-direction: column;
            align-items: stretch;
            gap: 10px;
          }
          .referral-hero-copy-btn,
          .referral-hero-secondary-btn {
            width: 100%;
          }
        }
      `}</style>
    </section>
  );
}
