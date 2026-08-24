'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Icon } from '@/components/ui/icons';
import { Logo } from '@/components/ui/Logo';
import { PoolFundCta } from '../../components/PoolFundCta';
import { SubstationLightning } from './SubstationLightning';

export function SubstationHero() {
  return (
    <section className="substation-hero">
      <div className="substation-hero-bg" aria-hidden="true">
        <Image
          src="/pool/substation/hero.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="substation-hero-bg-img"
        />
        <div className="substation-hero-overlay" />
      </div>
      <SubstationLightning />

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
        className="substation-hero-logo"
      >
        <Logo size={32} variant="white" />
      </Link>

      <div className="substation-hero-inner">
        <h1 className="substation-hero-h1">
          <span className="substation-h1-line">It&apos;s definitely not the substation.</span>
          <span className="substation-h1-accent text-primary-400">Prove it.</span>
        </h1>
        <p className="substation-hero-lead">
          The 49ers lead the league in injuries. Some blame the electrical substation next to
          Levi&apos;s Stadium, others call it nonsense. Until now, no one has studied it.
        </p>
        <div className="substation-hero-ctas">
          <PoolFundCta className="substation-hero-fund-btn">
            <Icon name="giveRSC" size={20} color="white" />
            Fund
          </PoolFundCta>
          <p className="substation-hero-subtext">
            Funds will go towards prominent research proposals
          </p>
        </div>
      </div>

      <div className="substation-hero-hazard" aria-hidden="true" />

      <style jsx>{`
        .substation-hero {
          position: relative;
          padding: 160px 28px 140px;
          overflow: hidden;
          background: #0a0f1e;
          color: #e2e8f0;
          min-height: min(calc(100vh - 60px), 905px);
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
        .substation-hero-bg {
          position: absolute;
          inset: 0;
          z-index: 0;
        }
        .substation-hero-bg :global(.substation-hero-bg-img) {
          object-fit: cover;
          object-position: center 30%;
        }
        .substation-hero-overlay {
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse at 50% 42%, rgba(10, 15, 30, 0.1), rgba(10, 15, 30, 0.72) 78%),
            linear-gradient(
              180deg,
              rgba(10, 15, 30, 0.55) 0%,
              rgba(10, 15, 30, 0.35) 40%,
              rgba(10, 15, 30, 0.92) 100%
            );
        }
        .substation-hero-inner {
          width: 100%;
          max-width: 900px;
          margin: 0 auto;
          position: relative;
          z-index: 2;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .substation-hero-h1 {
          font-family: 'Cal Sans', var(--font-geist-sans), system-ui, sans-serif;
          font-weight: 700;
          font-size: 76px;
          line-height: 1.04;
          letter-spacing: -0.03em;
          margin: 0 0 28px;
          color: #f8fafc;
          text-shadow: 0 4px 32px rgba(0, 0, 0, 0.55);
        }
        .substation-h1-line {
          display: block;
          color: #f8fafc;
        }
        /* Color comes from the Tailwind \`text-primary-400\` class on the element:
           500 is too dark to read against the night photo behind it. */
        .substation-h1-accent {
          display: block;
          text-shadow:
            0 0 42px rgba(96, 165, 250, 0.45),
            0 2px 10px rgba(4, 8, 20, 0.85),
            0 4px 32px rgba(0, 0, 0, 0.65);
        }
        .substation-hero-lead {
          font-size: 20px;
          line-height: 1.55;
          color: #dbe2ee;
          max-width: 640px;
          margin: 0 0 36px;
          font-weight: 500;
          text-shadow: 0 2px 14px rgba(0, 0, 0, 0.6);
        }
        .substation-hero-ctas {
          display: flex;
          flex-direction: column;
          gap: 14px;
          align-items: center;
        }
        .substation-hero-subtext {
          font-size: 14px;
          font-weight: 500;
          color: #b6c2d6;
          margin: 0;
          text-shadow: 0 1px 8px rgba(0, 0, 0, 0.6);
        }
        .substation-hero-hazard {
          position: absolute;
          left: 0;
          right: 0;
          bottom: 0;
          height: 10px;
          z-index: 2;
          background: repeating-linear-gradient(
            -45deg,
            #60a5fa 0,
            #60a5fa 14px,
            #101320 14px,
            #101320 28px
          );
          opacity: 0.9;
        }
        @media (max-width: 1100px) {
          .substation-hero {
            min-height: auto;
            padding: 130px 28px 120px;
          }
          .substation-hero-h1 {
            font-size: 56px;
          }
        }
        @media (max-width: 640px) {
          .substation-hero {
            padding: 110px 20px 110px;
          }
          .substation-hero-h1 {
            font-size: 38px;
            margin: 0 0 20px;
          }
          .substation-hero-lead {
            font-size: 16px;
            margin: 0 0 30px;
          }
        }
      `}</style>
      {/* Global: styled-jsx doesn't add its scoping class to `Link`-rendered
          anchors, so these CTA/logo rules must be global to apply. */}
      <style jsx global>{`
        .substation-hero-logo {
          transition: background-color 0.15s ease;
        }
        .substation-hero-logo:hover {
          background: rgba(255, 255, 255, 0.08);
        }
        .substation-hero-logo:focus-visible {
          outline: 2px solid #60a5fa;
          outline-offset: 2px;
        }
        .substation-hero-fund-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          height: 60px;
          padding: 0 44px;
          border-radius: 16px;
          font-size: 19px;
          font-weight: 800;
          letter-spacing: 0.01em;
          color: #ffffff;
          background: linear-gradient(to right, #4a7fff, #3971ff);
          box-shadow:
            0 10px 28px -8px rgba(57, 113, 255, 0.65),
            0 0 0 1px rgba(147, 197, 253, 0.35) inset;
          text-decoration: none;
          transition:
            transform 0.15s ease,
            background 0.15s ease,
            box-shadow 0.15s ease;
          white-space: nowrap;
        }
        .substation-hero-fund-btn:hover {
          background: linear-gradient(to right, #3971ff, #2563eb);
          box-shadow:
            0 16px 34px -8px rgba(57, 113, 255, 0.8),
            0 0 0 1px rgba(147, 197, 253, 0.5) inset;
          transform: translateY(-1px);
          color: #ffffff;
        }
        @media (max-width: 640px) {
          .substation-hero-fund-btn {
            width: 100%;
            max-width: 340px;
          }
        }
      `}</style>
    </section>
  );
}
