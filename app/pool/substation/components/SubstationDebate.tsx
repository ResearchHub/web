'use client';

import Image from 'next/image';

interface Argument {
  title: string;
  body: string;
}

const FOR: ReadonlyArray<Argument> = [
  {
    title: 'The injuries are real',
    body: 'The Niners have topped the league in adjusted games lost for years — $95M+ sat on injured reserve in 2025 alone.',
  },
  {
    title: 'The mechanism is plausible',
    body: 'Low-frequency EMF degrades collagen and raises oxidative stress in the lab; chronic exposure could weaken tendons over time.',
  },
  {
    title: 'The debunking runs on vibes',
    body: 'The "nonsense" verdicts rest on the absence of a study, not the presence of one. No one has actually measured it.',
  },
];

const AGAINST: ReadonlyArray<Argument> = [
  {
    title: 'The dose doesn\u2019t add up',
    body: 'An independent scientist measured the facility at ~400\u00d7 below the unsafe threshold — about a commercial gym\u2019s worth.',
  },
  {
    title: 'The timeline doesn\u2019t fit',
    body: 'The team has practiced there since 1988 and won Super Bowls. The injury spike is recent; the substation is not.',
  },
  {
    title: 'The evidence isn\u2019t there',
    body: 'The WHO finds no established harm from low-frequency EMF, and no literature ties it to injury. Correlation isn\u2019t causation.',
  },
];

export function SubstationDebate() {
  return (
    <section className="substation-debate">
      <div className="substation-debate-inner">
        <div className="substation-debate-head">
          <h2 className="substation-debate-h2">
            The case, <span className="substation-debate-accent">both sides.</span>
          </h2>
          <p className="substation-debate-sub">
            The strongest argument for the theory, and the strongest against it. We&apos;re not here
            to pick a side — we&apos;re here to fund the study that settles it.
          </p>
        </div>

        <div className="substation-debate-grid">
          <div className="substation-debate-side">
            <div className="substation-debate-side-head">
              <h3 className="substation-debate-side-title">The case for</h3>
            </div>
            <ul className="substation-debate-legend">
              {FOR.map((arg) => (
                <li key={arg.title} className="substation-debate-legend-item">
                  <span
                    className="substation-debate-swatch substation-debate-swatch-for"
                    aria-hidden
                  />
                  <strong className="substation-debate-legend-title">{arg.title}</strong>
                  <p className="substation-debate-legend-body">{arg.body}</p>
                </li>
              ))}
            </ul>
          </div>

          <div className="substation-debate-verdict">
            <div className="substation-debate-verdict-img">
              <Image
                src="/pool/substation/verdict-gavel.jpg"
                alt="A judge's gavel hovering over a crackling electrical substation, split between a blue and a gray side"
                fill
                sizes="(max-width: 980px) 220px, 240px"
                className="substation-debate-verdict-img-el"
              />
            </div>
            <div className="substation-debate-verdict-label">Verdict</div>
            <div className="substation-debate-verdict-text">Still out</div>
          </div>

          <div className="substation-debate-side">
            <div className="substation-debate-side-head">
              <h3 className="substation-debate-side-title">The case against</h3>
            </div>
            <ul className="substation-debate-legend">
              {AGAINST.map((arg) => (
                <li key={arg.title} className="substation-debate-legend-item">
                  <span
                    className="substation-debate-swatch substation-debate-swatch-against"
                    aria-hidden
                  />
                  <strong className="substation-debate-legend-title">{arg.title}</strong>
                  <p className="substation-debate-legend-body">{arg.body}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <style jsx>{`
        .substation-debate {
          padding: 96px 28px;
          background:
            radial-gradient(900px 480px at 50% 0%, rgba(57, 113, 255, 0.07), transparent 60%),
            #f8fafc;
        }
        .substation-debate-inner {
          max-width: 1240px;
          margin: 0 auto;
        }
        .substation-debate-head {
          text-align: center;
          max-width: 720px;
          margin: 0 auto 56px;
        }
        .substation-debate-h2 {
          font-family: 'Cal Sans', var(--font-geist-sans), system-ui, sans-serif;
          font-weight: 700;
          font-size: 52px;
          line-height: 1.08;
          letter-spacing: -0.024em;
          color: #0b1530;
          text-wrap: balance;
          margin: 0 0 18px;
        }
        .substation-debate-accent {
          color: #3971ff;
        }
        .substation-debate-sub {
          font-size: 17px;
          line-height: 1.6;
          color: #4b5563;
          margin: 0;
        }

        .substation-debate-grid {
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          gap: 32px;
          align-items: center;
        }
        .substation-debate-side-head {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 20px;
        }
        .substation-debate-side-title {
          font-family: 'Cal Sans', var(--font-geist-sans), system-ui, sans-serif;
          font-size: 24px;
          font-weight: 700;
          letter-spacing: -0.02em;
          color: #0b1530;
          margin: 0;
        }

        .substation-debate-legend {
          list-style: none;
          margin: 0;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: 18px;
        }
        .substation-debate-legend-item {
          display: grid;
          grid-template-columns: 14px 1fr;
          column-gap: 12px;
          row-gap: 2px;
        }
        .substation-debate-swatch {
          width: 12px;
          height: 12px;
          border-radius: 4px;
          display: inline-block;
          flex-shrink: 0;
          grid-column: 1;
          grid-row: 1;
          margin-top: 5px;
        }
        .substation-debate-swatch-for {
          background: #16a34a;
        }
        .substation-debate-swatch-against {
          background: #dc2626;
        }
        .substation-debate-legend-title {
          grid-column: 2;
          grid-row: 1;
          font-size: 17px;
          font-weight: 700;
          color: #0b1530;
        }
        .substation-debate-legend-body {
          grid-column: 2;
          grid-row: 2;
          margin: 0;
          font-size: 15.5px;
          line-height: 1.55;
          color: #111827;
        }

        /* --- center verdict --- */
        .substation-debate-verdict {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }
        .substation-debate-verdict-img {
          position: relative;
          width: 240px;
          height: 240px;
          border-radius: 24px;
          overflow: hidden;
          border: 1px solid #e6eaf1;
          box-shadow:
            0 0 0 8px rgba(57, 113, 255, 0.08),
            0 28px 56px -24px rgba(11, 21, 48, 0.4);
          transform: rotate(-2deg);
        }
        .substation-debate-verdict-img-el {
          object-fit: cover;
        }
        .substation-debate-verdict-label {
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: #94a3b8;
          margin-top: 22px;
        }
        .substation-debate-verdict-text {
          font-family: 'Cal Sans', var(--font-geist-sans), system-ui, sans-serif;
          font-size: 28px;
          font-weight: 700;
          letter-spacing: -0.02em;
          color: #0b1530;
          margin-top: 4px;
        }

        @media (max-width: 980px) {
          .substation-debate-grid {
            grid-template-columns: 1fr;
            gap: 24px;
          }
          .substation-debate-verdict {
            order: -1;
            margin-bottom: 0;
          }
          .substation-debate-verdict-img {
            width: 150px;
            height: 150px;
            border-radius: 18px;
            box-shadow:
              0 0 0 6px rgba(57, 113, 255, 0.08),
              0 20px 40px -20px rgba(11, 21, 48, 0.4);
          }
          .substation-debate-verdict-label {
            margin-top: 14px;
          }
          .substation-debate-verdict-text {
            font-size: 22px;
          }
        }
        @media (max-width: 1100px) {
          .substation-debate-h2 {
            font-size: 38px;
          }
        }
        @media (max-width: 640px) {
          .substation-debate {
            padding: 48px 16px;
          }
          .substation-debate-head {
            margin-bottom: 28px;
          }
          .substation-debate-h2 {
            font-size: 30px;
            margin-bottom: 10px;
          }
          .substation-debate-sub {
            font-size: 15px;
          }
          .substation-debate-side-head {
            margin-bottom: 12px;
          }
          .substation-debate-side-title {
            font-size: 20px;
          }
          .substation-debate-legend {
            gap: 14px;
          }
          .substation-debate-legend-title {
            font-size: 15px;
          }
          .substation-debate-legend-body {
            font-size: 14px;
            line-height: 1.5;
          }
          .substation-debate-verdict-img {
            width: 120px;
            height: 120px;
          }
        }
      `}</style>
    </section>
  );
}
