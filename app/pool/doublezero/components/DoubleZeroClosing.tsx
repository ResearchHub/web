'use client';

import { Icon } from '@/components/ui/icons';
import { PoolFundCta } from '../../components/PoolFundCta';

/**
 * The page's closing ask. Deliberately one column and one action: this landing
 * page exists to convert funders, not to recruit applicants.
 */
export function DoubleZeroClosing() {
  return (
    <section className="dz-closing">
      <div className="dz-closing-inner">
        <p className="dz-closing-eyebrow">The DoubleZero Science Fund</p>
        <h2 className="dz-closing-h2">Fund the next order of magnitude.</h2>
        <p className="dz-closing-sub">
          Your contribution is pooled across every open proposal in this call. Non-extractive: no
          cut is taken from your gift.
        </p>

        <PoolFundCta className="dz-closing-solid">
          <Icon name="giveRSC" size={20} color="white" />
          Fund this research
        </PoolFundCta>

        <p className="dz-closing-contact">
          Questions about this call &mdash;{' '}
          <a href="mailto:lewis@doublezero.xyz">lewis@doublezero.xyz</a>
        </p>
      </div>

      <style jsx global>{`
        .dz-closing {
          padding: 90px 28px;
          background:
            radial-gradient(760px 380px at 50% 0, rgba(66, 86, 255, 0.16), transparent 66%), #05070f;
          color: #e6ecf7;
        }
        .dz-closing-inner {
          max-width: 620px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }
        .dz-closing-eyebrow {
          font-family: var(--font-geist-mono), ui-monospace, 'SF Mono', monospace;
          font-size: 11px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #5bff50;
          margin: 0 0 18px;
        }
        .dz-closing-h2 {
          font-family: 'Cal Sans', var(--font-geist-sans), system-ui, sans-serif;
          font-size: 42px;
          font-weight: 700;
          line-height: 1.08;
          letter-spacing: -0.026em;
          color: #ffffff;
          margin: 0 0 18px;
          text-wrap: balance;
        }
        .dz-closing-sub {
          font-size: 16px;
          line-height: 1.6;
          color: #98a4ba;
          margin: 0 0 32px;
        }
        .dz-closing-solid {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          width: 100%;
          height: 58px;
          padding: 0 34px;
          font-size: 17px;
          font-weight: 700;
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
        }
        .dz-closing-solid:hover {
          background: linear-gradient(to right, #3971ff, #2563eb);
          box-shadow:
            0 18px 38px -10px rgba(57, 113, 255, 0.85),
            0 0 0 1px rgba(147, 197, 253, 0.45) inset;
          transform: translateY(-1px);
          color: #ffffff;
        }
        .dz-closing-contact {
          margin: 22px 0 0;
          font-family: var(--font-geist-mono), ui-monospace, 'SF Mono', monospace;
          font-size: 12px;
          letter-spacing: 0.03em;
          color: #6d7893;
        }
        .dz-closing-contact a {
          color: #9fd8ff;
          text-decoration: none;
          border-bottom: 1px solid rgba(159, 216, 255, 0.4);
        }
        .dz-closing-contact a:hover {
          color: #ffffff;
          border-bottom-color: #ffffff;
        }

        @media (max-width: 640px) {
          .dz-closing {
            padding: 68px 18px;
          }
          .dz-closing-h2 {
            font-size: 30px;
          }
        }
      `}</style>
    </section>
  );
}
