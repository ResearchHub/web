'use client';

import { ArrowRight } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { PixelBackdrop } from '@/app/endowment/components/PixelBackdrop';
import { CosmosPixelFade } from './CosmosPixelFade';

interface LegendEntry {
  key: string;
  color: string;
  title: string;
  body: string;
}

const LEGEND: ReadonlyArray<LegendEntry> = [
  {
    key: 'gift',
    color: '#3971ff',
    title: 'Your contribution',
    body: 'The dollars you commit go directly to the opportunity, with minimal platform overhead.',
  },
  {
    key: 'community',
    color: '#16a34a',
    title: 'Community contributions',
    body: 'Community members typically match contributions, stretching your impact further.',
  },
  {
    key: 'credits',
    color: '#f97316',
    title: 'Funding Credits',
    body: 'Yield from the Endowment flows into live opportunities as Funding Credits.',
  },
  {
    key: 'peer',
    color: '#7c3aed',
    title: 'Peer reviewer contributions',
    body: 'Reviewers earn RSC for their work; those credits can flow back into research as an additional layer.',
  },
];

// Stacked segments for the "On ResearchHub" bar, ordered bottom → top so the
// gift sits at the base and the optional layers build on top of it. Heights are
// illustrative px values; the traditional bar matches the "Your gift" height so
// the extra layers read as additive.
interface Segment {
  label: string;
  height: number;
  gradient: string;
  textColor: string;
}

const GIFT_HEIGHT = 150;

const RH_SEGMENTS: ReadonlyArray<Segment> = [
  {
    label: 'Peer review',
    height: 42,
    gradient: 'linear-gradient(180deg, #8b5cf6, #7c3aed)',
    textColor: '#fff',
  },
  {
    label: 'Funding Credits',
    height: 56,
    gradient: 'linear-gradient(180deg, #fb923c, #f97316)',
    textColor: '#fff',
  },
  {
    label: 'Community contributions',
    height: 80,
    gradient: 'linear-gradient(180deg, #22c55e, #16a34a)',
    textColor: '#fff',
  },
  {
    label: 'Your contribution',
    height: GIFT_HEIGHT,
    gradient: 'linear-gradient(180deg, #4a7fff, #3971ff)',
    textColor: '#fff',
  },
];

export function GiveAmplify() {
  return (
    <section className="give-amplify">
      <CosmosPixelFade height={120} />
      <PixelBackdrop side="bottom-left" className="give-amplify-pixel" />
      <PixelBackdrop side="bottom-right" className="give-amplify-pixel" />
      <div className="give-amplify-inner">
        <h2 className="give-amplify-h2">
          On ResearchHub, your contribution{' '}
          <span className="give-amplify-accent">doesn&rsquo;t work alone.</span>
        </h2>

        <div className="give-amplify-grid">
          <ul className="give-amplify-legend">
            {LEGEND.map((item) => (
              <li key={item.key} className="give-legend-item">
                <span className="give-legend-dot" style={{ background: item.color }} aria-hidden />
                <strong className="give-legend-title">{item.title}</strong>
                <p className="give-legend-body">{item.body}</p>
              </li>
            ))}
          </ul>

          <div className="give-compare-card">
            <div className="give-compare-cols">
              <div className="give-compare-col">
                <div className="give-compare-barwrap">
                  <span className="give-compare-col-label">Traditional donation</span>
                  <div
                    className="give-bar give-bar-single"
                    style={{ height: GIFT_HEIGHT }}
                    aria-label="Traditional donation: your contribution"
                  >
                    <span className="give-bar-seg-label">Your contribution</span>
                  </div>
                </div>
              </div>

              <div className="give-compare-arrow" aria-hidden>
                <ArrowRight className="w-5 h-5" />
              </div>

              <div className="give-compare-col">
                <div className="give-compare-barwrap">
                  <span className="give-compare-col-label give-compare-col-label-on">
                    <Logo size={34} noText />
                    On ResearchHub
                  </span>
                  <div
                    className="give-bar give-bar-stack"
                    aria-label="On ResearchHub: your gift plus additional layers"
                  >
                    {RH_SEGMENTS.map((seg) => (
                      <div
                        key={seg.label}
                        className="give-bar-seg"
                        style={{
                          height: seg.height,
                          background: seg.gradient,
                          color: seg.textColor,
                        }}
                      >
                        <span className="give-bar-seg-label">{seg.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .give-amplify {
          position: relative;
          z-index: 2;
          /* Pull up over the hero and round the top edge into a shallow dome so
             the cosmos peeks through the corners and the boundary slopes gently
             upward toward the middle. */
          margin-top: -46px;
          border-top-left-radius: 50% 46px;
          border-top-right-radius: 50% 46px;
          padding: 128px 28px 96px;
          background:
            radial-gradient(ellipse 90% 70% at 50% -10%, rgba(57, 113, 255, 0.1), transparent 60%),
            linear-gradient(180deg, #eef3ff 0%, #f4f7ff 45%, #ffffff 100%);
          color: #0b1530;
          overflow: hidden;
        }
        .give-amplify :global(.give-amplify-pixel) {
          z-index: 0;
          opacity: 0.4;
        }
        .give-amplify-inner {
          position: relative;
          z-index: 2;
          max-width: 1280px;
          margin: 0 auto;
        }
        .give-amplify-h2 {
          font-family: 'Cal Sans', var(--font-geist-sans), system-ui, sans-serif;
          font-weight: 700;
          font-size: 48px;
          line-height: 1.08;
          letter-spacing: -0.024em;
          color: #0b1530;
          text-wrap: balance;
          text-align: center;
          max-width: 760px;
          margin: 0 auto 56px;
        }
        .give-amplify-accent {
          color: #3971ff;
        }
        .give-amplify-grid {
          display: grid;
          grid-template-columns: minmax(0, 0.92fr) minmax(0, 1.08fr);
          gap: 56px;
          align-items: center;
        }
        .give-amplify-legend {
          list-style: none;
          margin: 0;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: 18px;
        }
        @media (max-width: 1024px) {
          .give-amplify-grid {
            grid-template-columns: minmax(0, 1fr);
            gap: 40px;
          }
          .give-amplify-h2 {
            font-size: 40px;
            margin-bottom: 40px;
          }
        }
        @media (max-width: 640px) {
          .give-amplify {
            padding: 120px 16px 64px;
          }
          .give-amplify-h2 {
            font-size: 30px;
          }
        }
      `}</style>
      <style jsx global>{`
        .give-legend-item {
          display: grid;
          grid-template-columns: 14px 1fr;
          column-gap: 12px;
          row-gap: 2px;
        }
        .give-legend-dot {
          width: 12px;
          height: 12px;
          border-radius: 4px;
          display: inline-block;
          flex-shrink: 0;
        }
        .give-legend-item .give-legend-dot {
          grid-column: 1;
          grid-row: 1;
          margin-top: 5px;
        }
        .give-legend-title {
          grid-column: 2;
          grid-row: 1;
          font-size: 17px;
          font-weight: 700;
          color: #0b1530;
        }
        .give-legend-body {
          grid-column: 2;
          grid-row: 2;
          margin: 0;
          font-size: 15.5px;
          color: #111827;
          line-height: 1.55;
        }

        .give-compare-card {
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 24px;
          padding: 30px 32px 26px;
          box-shadow: 0 30px 70px -36px rgba(13, 30, 80, 0.28);
        }
        .give-compare-cols {
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          gap: 12px;
          align-items: end;
          padding: 8px 0 8px;
        }
        .give-compare-col {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 14px;
        }
        .give-compare-col-label {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          font-size: 11.5px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #6b7280;
          text-align: center;
        }
        .give-compare-col-label-on {
          color: #3971ff;
        }
        .give-compare-barwrap {
          width: 100%;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          align-items: center;
          gap: 12px;
          min-height: 330px;
        }
        .give-bar {
          width: 100%;
          max-width: 150px;
          border-radius: 10px;
          overflow: hidden;
          box-shadow: 0 12px 26px -16px rgba(13, 30, 80, 0.35);
        }
        .give-bar-single {
          background: linear-gradient(180deg, #4a7fff, #3971ff);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
        }
        .give-bar-stack {
          display: flex;
          flex-direction: column;
        }
        .give-bar-seg {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 4px 8px;
          text-align: center;
        }
        .give-bar-seg-label {
          font-size: 12px;
          font-weight: 700;
          line-height: 1.15;
          letter-spacing: -0.005em;
        }
        .give-compare-arrow {
          display: flex;
          align-items: center;
          justify-content: center;
          color: #cbd5e1;
          padding-bottom: 105px;
        }
        @media (max-width: 640px) {
          .give-compare-card {
            padding: 22px 18px 20px;
          }
          .give-compare-cols {
            gap: 8px;
          }
          .give-bar-seg-label {
            font-size: 10.5px;
          }
          .give-compare-arrow {
            padding-bottom: 90px;
          }
        }
      `}</style>
    </section>
  );
}
