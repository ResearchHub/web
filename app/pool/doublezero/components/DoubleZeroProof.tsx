'use client';

import { DoubleZeroFermilab } from './DoubleZeroFermilab';

const RECORD = [
  { value: '240 m', label: 'of solid rock' },
  { value: '1%', label: 'error rate' },
  { value: '1.035 km', label: 'baseline' },
  { value: '1', label: 'message, ever' },
];

export function DoubleZeroProof() {
  return (
    <section className="dz-proof">
      <div className="dz-proof-inner">
        <div className="dz-proof-head">
          <p className="dz-proof-eyebrow">Proof of principle</p>
          <h2 className="dz-proof-h2">
            The current world record is <span>0.1 bits per second.</span>
          </h2>
          <p className="dz-proof-sub">
            A neutrino beam has carried a digital message exactly once. Everything past that point
            is unclaimed.
          </p>
        </div>

        <div className="dz-proof-grid">
          <DoubleZeroFermilab />

          <div className="dz-proof-side">
            <dl className="dz-proof-record">
              {RECORD.map((r) => (
                <div key={r.label} className="dz-proof-record-item">
                  <dt className="dz-proof-record-value">{r.value}</dt>
                  <dd className="dz-proof-record-label">{r.label}</dd>
                </div>
              ))}
            </dl>

            <div className="dz-proof-now">
              <span className="dz-proof-year">2023</span>
              <p className="dz-proof-now-text">
                The LHC&apos;s forward detectors saw collider neutrinos for the first time.
                TeV-scale, tightly collimated, on a beamline that already runs &mdash; and at that
                energy the receiver shrinks by orders of magnitude.
              </p>
            </div>

            <p className="dz-proof-punch">
              The source exists. The detector exists. Nobody has aimed one at the other.
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        .dz-proof {
          padding: 100px 28px;
          background:
            radial-gradient(900px 460px at 50% 0, rgba(41, 249, 31, 0.05), transparent 62%), #f8fafc;
        }
        .dz-proof-inner {
          max-width: 1200px;
          margin: 0 auto;
        }
        .dz-proof-head {
          max-width: 760px;
          margin: 0 auto 52px;
          text-align: center;
        }
        .dz-proof-eyebrow {
          font-family: var(--font-geist-mono), ui-monospace, 'SF Mono', monospace;
          font-size: 11px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #0a7805;
          margin: 0 0 18px;
        }
        .dz-proof-h2 {
          font-family: 'Cal Sans', var(--font-geist-sans), system-ui, sans-serif;
          font-weight: 700;
          font-size: 50px;
          line-height: 1.08;
          letter-spacing: -0.026em;
          color: #0b1530;
          text-wrap: balance;
          margin: 0 0 18px;
        }
        .dz-proof-h2 span {
          font-family: var(--font-geist-mono), ui-monospace, 'SF Mono', monospace;
          font-size: 0.86em;
          letter-spacing: -0.01em;
          color: #0a7805;
        }
        .dz-proof-sub {
          font-size: 17px;
          line-height: 1.6;
          color: #4b5563;
          margin: 0;
        }
        .dz-proof-grid {
          display: grid;
          grid-template-columns: 1.05fr 0.95fr;
          gap: 44px;
          align-items: start;
        }
        .dz-proof-side {
          display: flex;
          flex-direction: column;
          gap: 30px;
        }
        .dz-proof-record {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1px;
          margin: 0;
          background: #e3e8ef;
          border: 1px solid #e3e8ef;
        }
        .dz-proof-record-item {
          background: #ffffff;
          padding: 20px 22px;
        }
        .dz-proof-record-value {
          font-family: var(--font-geist-mono), ui-monospace, 'SF Mono', monospace;
          font-size: 27px;
          font-weight: 700;
          line-height: 1;
          color: #0b1530;
        }
        .dz-proof-record-label {
          font-family: var(--font-geist-mono), ui-monospace, 'SF Mono', monospace;
          font-size: 10.5px;
          letter-spacing: 0.09em;
          text-transform: uppercase;
          color: #78839a;
          margin: 9px 0 0;
        }
        .dz-proof-now {
          display: flex;
          gap: 18px;
          align-items: flex-start;
        }
        .dz-proof-year {
          flex-shrink: 0;
          font-family: var(--font-geist-mono), ui-monospace, 'SF Mono', monospace;
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 0.04em;
          color: #ffffff;
          background: #0b1530;
          padding: 7px 10px;
        }
        .dz-proof-now-text {
          font-size: 15.5px;
          line-height: 1.62;
          color: #4b5563;
          margin: 0;
        }
        .dz-proof-punch {
          font-family: 'Cal Sans', var(--font-geist-sans), system-ui, sans-serif;
          font-size: 24px;
          font-weight: 700;
          line-height: 1.3;
          letter-spacing: -0.018em;
          color: #0b1530;
          margin: 0;
          padding-left: 18px;
          border-left: 3px solid #29f91f;
          text-wrap: balance;
        }

        @media (max-width: 1060px) {
          .dz-proof-grid {
            grid-template-columns: 1fr;
            gap: 34px;
          }
          .dz-proof-h2 {
            font-size: 38px;
          }
        }
        @media (max-width: 640px) {
          .dz-proof {
            padding: 72px 18px;
          }
          .dz-proof-h2 {
            font-size: 30px;
          }
          .dz-proof-record-value {
            font-size: 22px;
          }
          .dz-proof-punch {
            font-size: 20px;
          }
        }
      `}</style>
    </section>
  );
}
