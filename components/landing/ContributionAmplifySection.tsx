'use client';

import { ReactNode } from 'react';
import { ArrowRight } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { PixelBackdrop } from '@/app/endowment/components/PixelBackdrop';

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

interface ContributionAmplifySectionProps {
  /**
   * Extra decorative layer rendered behind the content, above the pixel
   * backdrops (e.g. the give page's dissolve into the hero above it).
   */
  backdrop?: ReactNode;
  /**
   * Pulls the section up over a preceding dark hero and rounds its top edge into
   * a shallow dome, so the hero peeks through the corners.
   */
  overlapHero?: boolean;
}

/**
 * Explains how a contribution is amplified on ResearchHub: a legend of the three
 * funding layers beside a bar chart comparing a traditional donation to the
 * stacked total on ResearchHub. Shared by the /give and /substation landing pages.
 */
export function ContributionAmplifySection({
  backdrop,
  overlapHero = false,
}: ContributionAmplifySectionProps) {
  return (
    <section className={`amplify${overlapHero ? ' amplify-overlap' : ''}`}>
      <PixelBackdrop side="bottom-left" className="amplify-pixel" />
      <PixelBackdrop side="bottom-right" className="amplify-pixel" />
      {backdrop}
      <div className="amplify-inner">
        <h2 className="amplify-h2">
          ResearchHub makes your contribution <span className="amplify-accent">go further.</span>
        </h2>

        <div className="amplify-grid">
          <ul className="amplify-legend">
            {LEGEND.map((item) => (
              <li key={item.key} className="amplify-legend-item">
                <span
                  className="amplify-legend-dot"
                  style={{ background: item.color }}
                  aria-hidden
                />
                <strong className="amplify-legend-title">{item.title}</strong>
                <p className="amplify-legend-body">{item.body}</p>
              </li>
            ))}
          </ul>

          <div className="amplify-compare-card">
            <div className="amplify-compare-cols">
              <div className="amplify-compare-col">
                <div className="amplify-compare-barwrap">
                  <span className="amplify-compare-col-label">Traditional donation</span>
                  <div
                    className="amplify-bar amplify-bar-single"
                    style={{ height: GIFT_HEIGHT }}
                    aria-label="Traditional donation: your contribution"
                  >
                    <span className="amplify-bar-seg-label">Your contribution</span>
                  </div>
                </div>
              </div>

              <div className="amplify-compare-arrow" aria-hidden>
                <ArrowRight className="w-5 h-5" />
              </div>

              <div className="amplify-compare-col">
                <div className="amplify-compare-barwrap">
                  <span className="amplify-compare-col-label amplify-compare-col-label-on">
                    <Logo size={34} noText />
                    On ResearchHub
                  </span>
                  <div
                    className="amplify-bar amplify-bar-stack"
                    aria-label="On ResearchHub: your gift plus additional layers"
                  >
                    {RH_SEGMENTS.map((seg) => (
                      <div
                        key={seg.label}
                        className="amplify-bar-seg"
                        style={{
                          height: seg.height,
                          background: seg.gradient,
                          color: seg.textColor,
                        }}
                      >
                        <span className="amplify-bar-seg-label">{seg.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Global rather than scoped: styled-jsx only adds its scoping class to
          plain DOM elements, so `Logo`-rendered markup and any backdrop passed in
          would go unstyled. Every selector is `amplify-` prefixed to avoid leaking. */}
      <style jsx global>{`
        .amplify {
          position: relative;
          z-index: 2;
          padding: 96px 28px;
          background:
            radial-gradient(ellipse 90% 70% at 50% -10%, rgba(57, 113, 255, 0.1), transparent 60%),
            linear-gradient(180deg, #eef3ff 0%, #f4f7ff 45%, #ffffff 100%);
          color: #0b1530;
          overflow: hidden;
        }
        .amplify-overlap {
          /* Pull up over the hero and round the top edge into a shallow dome so
             the cosmos peeks through the corners and the boundary slopes gently
             upward toward the middle. */
          margin-top: -46px;
          border-top-left-radius: 50% 46px;
          border-top-right-radius: 50% 46px;
          padding-top: 128px;
        }
        .amplify .amplify-pixel {
          z-index: 0;
          opacity: 0.4;
        }
        .amplify-inner {
          position: relative;
          z-index: 2;
          max-width: 1280px;
          margin: 0 auto;
        }
        .amplify-h2 {
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
        .amplify-accent {
          color: #3971ff;
        }
        .amplify-grid {
          display: grid;
          grid-template-columns: minmax(0, 0.92fr) minmax(0, 1.08fr);
          gap: 56px;
          align-items: center;
        }
        .amplify-legend {
          list-style: none;
          margin: 0;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: 18px;
        }
        .amplify-legend-item {
          display: grid;
          grid-template-columns: 14px 1fr;
          column-gap: 12px;
          row-gap: 2px;
        }
        .amplify-legend-dot {
          width: 12px;
          height: 12px;
          border-radius: 4px;
          display: inline-block;
          flex-shrink: 0;
          grid-column: 1;
          grid-row: 1;
          margin-top: 5px;
        }
        .amplify-legend-title {
          grid-column: 2;
          grid-row: 1;
          font-size: 17px;
          font-weight: 700;
          color: #0b1530;
        }
        .amplify-legend-body {
          grid-column: 2;
          grid-row: 2;
          margin: 0;
          font-size: 15.5px;
          color: #111827;
          line-height: 1.55;
        }

        .amplify-compare-card {
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 24px;
          padding: 30px 32px 26px;
          box-shadow: 0 30px 70px -36px rgba(13, 30, 80, 0.28);
        }
        .amplify-compare-cols {
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          gap: 12px;
          align-items: end;
          padding: 8px 0 8px;
        }
        .amplify-compare-col {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 14px;
        }
        .amplify-compare-col-label {
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
        .amplify-compare-col-label-on {
          color: #3971ff;
        }
        .amplify-compare-barwrap {
          width: 100%;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          align-items: center;
          gap: 12px;
          min-height: 330px;
        }
        .amplify-bar {
          width: 100%;
          max-width: 150px;
          border-radius: 10px;
          overflow: hidden;
          box-shadow: 0 12px 26px -16px rgba(13, 30, 80, 0.35);
        }
        .amplify-bar-single {
          background: linear-gradient(180deg, #4a7fff, #3971ff);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
        }
        .amplify-bar-stack {
          display: flex;
          flex-direction: column;
        }
        .amplify-bar-seg {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 4px 8px;
          text-align: center;
        }
        .amplify-bar-seg-label {
          font-size: 12px;
          font-weight: 700;
          line-height: 1.15;
          letter-spacing: -0.005em;
        }
        .amplify-compare-arrow {
          display: flex;
          align-items: center;
          justify-content: center;
          color: #cbd5e1;
          padding-bottom: 105px;
        }
        @media (max-width: 1024px) {
          .amplify-grid {
            grid-template-columns: minmax(0, 1fr);
            gap: 40px;
          }
          .amplify-h2 {
            font-size: 40px;
            margin-bottom: 40px;
          }
        }
        @media (max-width: 640px) {
          .amplify {
            padding: 72px 16px 64px;
          }
          .amplify-overlap {
            padding-top: 120px;
          }
          .amplify-h2 {
            font-size: 30px;
          }
          .amplify-compare-card {
            padding: 22px 18px 20px;
          }
          .amplify-compare-cols {
            gap: 8px;
          }
          .amplify-bar-seg-label {
            font-size: 10.5px;
          }
          .amplify-compare-arrow {
            padding-bottom: 90px;
          }
        }
      `}</style>
    </section>
  );
}
