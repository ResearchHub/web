'use client';

const STROKE = '#0b1530';
const TRUNK = '#1e3a8a';
const LEAF_DARK = '#3971FF';
const LEAF_MID = '#60a5fa';

// Sprouts spaced across the strip, alternating size + facing direction.
// Positions are percentages of the strip width so they distribute across
// any viewport size.
const SPROUTS: ReadonlyArray<{ xPct: number; s: number; flip: 1 | -1; yOffset: number }> = [
  { xPct: 4, s: 0.85, flip: 1, yOffset: 0 },
  { xPct: 11, s: 1.1, flip: -1, yOffset: -2 },
  { xPct: 18, s: 0.95, flip: 1, yOffset: 1 },
  { xPct: 26, s: 0.8, flip: -1, yOffset: -1 },
  // gap in the middle where the tree trunk lands
  { xPct: 58, s: 0.9, flip: 1, yOffset: 0 },
  { xPct: 66, s: 1.15, flip: -1, yOffset: -3 },
  { xPct: 74, s: 0.85, flip: 1, yOffset: 1 },
  { xPct: 82, s: 1.0, flip: -1, yOffset: -1 },
  { xPct: 90, s: 0.95, flip: 1, yOffset: 0 },
  { xPct: 96, s: 0.8, flip: -1, yOffset: 0 },
];

// Tiny grass tuft strokes scattered across the soil for texture.
const TUFTS: ReadonlyArray<{ xPct: number }> = [
  { xPct: 7 },
  { xPct: 14 },
  { xPct: 22 },
  { xPct: 30 },
  { xPct: 38 },
  { xPct: 46 },
  { xPct: 54 },
  { xPct: 62 },
  { xPct: 70 },
  { xPct: 78 },
  { xPct: 86 },
  { xPct: 93 },
];

/**
 * Full-bleed soil strip that visually extends the EndowmentTree's ground all the
 * way to the viewport edges. Renders the mound + grass tufts + sprouts as a
 * single horizontal band that sits at the bottom of the hero section.
 */
export function EndowmentGround() {
  // The soil mound itself stretches edge-to-edge via preserveAspectRatio="none"
  // on a separate SVG. Sprouts + tufts are rendered as absolutely-positioned
  // SVGs at percentage offsets so they don't distort.
  return (
    <div className="endowment-ground" aria-hidden="true">
      <svg
        className="endowment-ground-soil"
        viewBox="0 0 1440 120"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Filled soil shape: no stroke, so its bottom edge can blend
            seamlessly with the section below. */}
        <path d="M 0 32 Q 720 0 1440 32 L 1440 120 L 0 120 Z" fill="#dbeafe" />
        {/* Top-edge outline only: drawn as an open path so we don't get
            a dividing line along the bottom of the soil. */}
        <path
          d="M 0 32 Q 720 0 1440 32"
          fill="none"
          stroke={STROKE}
          strokeWidth="3"
          strokeLinejoin="round"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>

      {TUFTS.map((t, i) => (
        <svg
          key={`tuft-${i}`}
          className="endowment-ground-tuft"
          style={{ left: `${t.xPct}%` }}
          viewBox="0 0 14 10"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g stroke={STROKE} strokeWidth="1.6" strokeLinecap="round" fill="none">
            <path d="M 3 9 q 2 -6 4 0" />
            <path d="M 6 9 q 2 -7 4 0" />
          </g>
        </svg>
      ))}

      {SPROUTS.map((sp, i) => (
        <svg
          key={`sprout-${i}`}
          className="endowment-ground-sprout"
          style={{ left: `${sp.xPct}%`, transform: `translateY(${sp.yOffset}px)` }}
          viewBox="-20 -36 40 40"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g transform={`scale(${sp.s * sp.flip}, ${sp.s})`}>
            <path
              d="M 0 0 C 2 -10, -2 -18, 0 -30"
              stroke={STROKE}
              strokeWidth="2.2"
              fill="none"
              strokeLinecap="round"
            />
            <path
              d="M 0 0 C 2 -10, -2 -18, 0 -30"
              stroke={TRUNK}
              strokeWidth="1.1"
              fill="none"
              strokeLinecap="round"
            />
            <path
              d="M 0 -14 C -8 -17, -14 -11, -12 -5 C -5 -7, 0 -11, 0 -14 Z"
              fill={LEAF_DARK}
              stroke={STROKE}
              strokeWidth="1.4"
              strokeLinejoin="round"
            />
            <path
              d="M 0 -26 C 8 -27, 14 -21, 12 -15 C 5 -17, 0 -22, 0 -26 Z"
              fill={LEAF_MID}
              stroke={STROKE}
              strokeWidth="1.4"
              strokeLinejoin="round"
            />
          </g>
        </svg>
      ))}

      <style jsx>{`
        .endowment-ground {
          position: absolute;
          left: 0;
          right: 0;
          bottom: 0;
          height: 88px;
          pointer-events: none;
          z-index: 3;
        }
        .endowment-ground-soil {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          display: block;
        }
        .endowment-ground-tuft {
          position: absolute;
          bottom: 56px;
          width: 18px;
          height: 14px;
          transform: translateX(-50%);
        }
        .endowment-ground-sprout {
          position: absolute;
          bottom: 58px;
          width: 32px;
          height: 36px;
          transform: translateX(-50%);
          overflow: visible;
        }
        @media (max-width: 1100px) {
          .endowment-ground {
            height: 72px;
          }
          .endowment-ground-tuft {
            bottom: 44px;
          }
          .endowment-ground-sprout {
            bottom: 46px;
          }
        }
      `}</style>
    </div>
  );
}
