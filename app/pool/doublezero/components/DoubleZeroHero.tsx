'use client';

import Link from 'next/link';
import { Icon } from '@/components/ui/icons';
import { Logo } from '@/components/ui/Logo';
import { PoolFundCta } from '../../components/PoolFundCta';
import { DoubleZeroBeam } from './DoubleZeroBeam';
import { DoubleZeroMark } from './DoubleZeroMark';

export function DoubleZeroHero() {
  return (
    <section className="dz-hero">
      <div className="dz-hero-grid-bg" aria-hidden="true" />

      <div className="dz-hero-inner">
        <header className="dz-hero-mast">
          <div className="dz-hero-lockup">
            <div className="dz-hero-org">
              <DoubleZeroMark size={46} variant="dark" />
              <span className="dz-hero-org-name">DoubleZero</span>
            </div>
            <span className="dz-hero-cross" aria-label="in partnership with">
              &#10005;
            </span>
            <Link href="/" aria-label="ResearchHub home" className="dz-hero-partner-logo">
              <Logo size={30} variant="white" />
            </Link>
          </div>
        </header>

        <div className="dz-hero-body">
          <div className="dz-hero-copy">
            <h1 className="dz-hero-h1">
              <span>Every signal goes around the Earth.</span>
              <span className="dz-hero-h1-accent">Neutrinos go straight through.</span>
            </h1>
            <p className="dz-hero-lead">
              No cables. <span>No barriers.</span>
            </p>
            <p className="dz-hero-support">
              A neutrino passes through ocean, rock and iron core as if none of it were there
              &mdash; a straight line no cable can take. DoubleZero is putting{' '}
              <strong>$100K</strong> behind the beams, detectors and protocols that turn it into a
              working channel.
            </p>

            <div className="dz-hero-ctas">
              <PoolFundCta className="dz-hero-fund-btn">
                <Icon name="giveRSC" size={20} color="white" />
                Fund this research
              </PoolFundCta>
              <p className="dz-hero-subtext">Pooled across every proposal in the call</p>
            </div>
          </div>

          <div className="dz-hero-visual">
            <DoubleZeroBeam />
          </div>
        </div>
      </div>

      <div className="dz-hero-rule" aria-hidden="true" />

      <style jsx>{`
        .dz-hero {
          position: relative;
          overflow: hidden;
          padding: 40px 28px 84px;
          background:
            radial-gradient(900px 620px at 78% 12%, rgba(66, 86, 255, 0.16), transparent 66%),
            radial-gradient(700px 500px at 8% 88%, rgba(41, 249, 31, 0.06), transparent 70%),
            #05070f;
          color: #e6ecf7;
        }
        .dz-hero-grid-bg {
          position: absolute;
          inset: 0;
          z-index: 0;
          background-image: radial-gradient(rgba(148, 163, 184, 0.16) 1px, transparent 1px);
          background-size: 16px 16px;
          mask-image: radial-gradient(ellipse 80% 70% at 50% 30%, #000 10%, transparent 78%);
          -webkit-mask-image: radial-gradient(
            ellipse 80% 70% at 50% 30%,
            #000 10%,
            transparent 78%
          );
        }
        .dz-hero-inner {
          position: relative;
          z-index: 1;
          max-width: 1240px;
          margin: 0 auto;
        }

        /* --- masthead: whose call this is ------------------------------- */
        .dz-hero-mast {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
          flex-wrap: wrap;
          padding-bottom: 22px;
          border-bottom: 1px solid rgba(148, 163, 184, 0.18);
        }
        /* One co-branded lockup: whose call this is, and where it runs. */
        .dz-hero-lockup {
          display: flex;
          align-items: center;
          gap: 20px;
          flex-wrap: wrap;
        }
        .dz-hero-org {
          display: flex;
          align-items: center;
          gap: 14px;
        }
        .dz-hero-org-name {
          font-size: 24px;
          font-weight: 700;
          letter-spacing: -0.015em;
          color: #ffffff;
        }
        .dz-hero-cross {
          font-size: 18px;
          line-height: 1;
          color: #6b7690;
        }

        /* --- body ------------------------------------------------------- */
        .dz-hero-body {
          display: grid;
          grid-template-columns: 1fr 0.86fr;
          align-items: center;
          gap: 64px;
          padding-top: 56px;
        }
        .dz-hero-h1 {
          font-family: 'Cal Sans', var(--font-geist-sans), system-ui, sans-serif;
          font-weight: 700;
          font-size: 60px;
          line-height: 1.03;
          letter-spacing: -0.032em;
          margin: 0 0 26px;
          color: #ffffff;
          text-wrap: balance;
        }
        .dz-hero-h1 span {
          display: block;
          text-wrap: balance;
        }
        .dz-hero-h1-accent {
          color: #5bff50;
          text-shadow: 0 0 46px rgba(41, 249, 31, 0.3);
        }
        /* A tagline rather than a paragraph: the animation carries the
           explanation, so this only has to land the promise. */
        .dz-hero-lead {
          font-family: 'Cal Sans', var(--font-geist-sans), system-ui, sans-serif;
          font-size: 27px;
          font-weight: 700;
          line-height: 1.2;
          letter-spacing: -0.02em;
          color: #8e9bb2;
          margin: 0 0 18px;
        }
        .dz-hero-lead span {
          color: #e6ecf7;
        }
        .dz-hero-support {
          font-size: 16.5px;
          line-height: 1.62;
          color: #98a4ba;
          max-width: 540px;
          margin: 0 0 32px;
        }
        .dz-hero-support strong {
          color: #ffffff;
          font-weight: 700;
        }
        .dz-hero-ctas {
          display: flex;
          flex-direction: column;
          align-items: stretch;
          gap: 12px;
          max-width: 560px;
        }
        .dz-hero-subtext {
          font-size: 13.5px;
          color: #778399;
          margin: 0;
          text-align: center;
        }
        .dz-hero-visual {
          min-width: 0;
        }
        .dz-hero-rule {
          position: absolute;
          left: 0;
          right: 0;
          bottom: 0;
          height: 6px;
          background: repeating-linear-gradient(
            90deg,
            #29f91f 0 6px,
            #05070f 6px 12px,
            #4256ff 12px 18px,
            #05070f 18px 24px,
            #e80000 24px 30px,
            #05070f 30px 36px
          );
          opacity: 0.55;
        }

        @media (max-width: 1060px) {
          .dz-hero-body {
            grid-template-columns: 1fr;
            gap: 44px;
            padding-top: 42px;
          }
          .dz-hero-h1 {
            font-size: 46px;
          }
          .dz-hero-visual {
            max-width: 520px;
            width: 100%;
          }
        }
        @media (max-width: 640px) {
          .dz-hero {
            padding: 26px 18px 68px;
          }
          .dz-hero-h1 {
            font-size: 34px;
            margin: 0 0 20px;
          }
          .dz-hero-lead {
            font-size: 21px;
            margin: 0 0 14px;
          }
          .dz-hero-support {
            font-size: 15.5px;
            margin: 0 0 26px;
          }
          .dz-hero-org-name {
            font-size: 20px;
          }
          .dz-hero-cross {
            font-size: 15px;
          }
        }
      `}</style>
      {/* Global: styled-jsx doesn't add its scoping class to `Link`-rendered
          anchors, so the CTA and logo rules must be global to apply. */}
      <style jsx global>{`
        .dz-hero-partner-logo {
          display: inline-flex;
          align-items: center;
          padding: 4px 6px;
          border-radius: 6px;
          transition: background-color 0.15s ease;
        }
        .dz-hero-partner-logo:hover {
          background: rgba(255, 255, 255, 0.08);
        }
        .dz-hero-partner-logo:focus-visible {
          outline: 2px solid #4256ff;
          outline-offset: 2px;
        }
        .dz-hero-fund-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          width: 100%;
          height: 58px;
          padding: 0 34px;
          font-size: 17px;
          font-weight: 700;
          letter-spacing: 0.01em;
          color: #ffffff;
          background: linear-gradient(to right, #4a7fff, #3971ff);
          box-shadow:
            0 12px 30px -10px rgba(57, 113, 255, 0.7),
            0 0 0 1px rgba(147, 197, 253, 0.3) inset;
          text-decoration: none;
          transition:
            transform 0.15s ease,
            background 0.15s ease,
            box-shadow 0.15s ease;
          white-space: nowrap;
        }
        .dz-hero-fund-btn:hover {
          background: linear-gradient(to right, #3971ff, #2563eb);
          box-shadow:
            0 18px 38px -10px rgba(57, 113, 255, 0.85),
            0 0 0 1px rgba(147, 197, 253, 0.45) inset;
          transform: translateY(-1px);
          color: #ffffff;
        }
      `}</style>
    </section>
  );
}
