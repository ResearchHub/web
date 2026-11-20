import type { CSSProperties } from 'react';

/**
 * Line icons for the four benefits, drawn in white for the blue section:
 * results that hold (a steady stack, checked), funding that goes further (a
 * coin sent to a checked paper), treatments sooner (a capsule) and smarter
 * AI (a spark). Each is drawn in parts (`a-bn-part`, in the order `--k`)
 * so that it can assemble itself when the section scrolls in (audit.css);
 * as rendered by the server it is complete.
 */

const LINE = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2.2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const;
const TINT = 'rgb(255 255 255 / 0.16)';

/** The part's place in its icon's order of arrival. */
const k = (n: number) => ({ '--k': n }) as CSSProperties;

/** Science that holds up: three stacks set down widest first, then a check. */
function Holds() {
  return (
    <>
      <path className="a-bn-part" style={k(0)} d="M4 58H60" {...LINE} opacity={0.6} />
      <rect
        className="a-bn-part a-bn-drop"
        style={k(1)}
        x={9}
        y={44}
        width={46}
        height={14}
        rx={1.5}
        {...LINE}
        fill={TINT}
      />
      <rect
        className="a-bn-part a-bn-drop"
        style={k(3)}
        x={15}
        y={30}
        width={34}
        height={14}
        rx={1.5}
        {...LINE}
        fill={TINT}
      />
      <rect
        className="a-bn-part a-bn-drop"
        style={k(5)}
        x={21}
        y={16}
        width={22}
        height={14}
        rx={1.5}
        {...LINE}
        fill={TINT}
      />
      <g className="a-bn-part" style={k(8)}>
        <circle cx={48} cy={13} r={9.5} fill="currentColor" />
        <path
          d="M43.4 13.2 l3.2 3.3 l5.8 -7.2"
          fill="none"
          stroke="var(--a-blue)"
          strokeWidth={2.6}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </>
  );
}

/** Funding that goes further: a coin, an arrow, and the checked paper it reaches. */
function Funds() {
  return (
    <>
      <g className="a-bn-part" style={k(0)}>
        <circle cx={19} cy={43} r={14} {...LINE} fill={TINT} />
        <path
          d="M23.5 37.5 c-1.5 -2.2 -9 -2.4 -9 1.8 c0 4.4 9.4 2.6 9.4 7.2 c0 4.2 -8 4 -9.8 1.4 M19 32.5 v21"
          {...LINE}
          strokeWidth={2}
        />
      </g>
      <path
        className="a-bn-part a-bn-draw"
        style={k(3)}
        pathLength={1}
        d="M32 31 L41 22"
        {...LINE}
      />
      <path className="a-bn-part" style={k(5)} d="M41 28.5 V22 H34.5" {...LINE} />
      <rect
        className="a-bn-part"
        style={k(6)}
        x={43}
        y={5}
        width={18}
        height={24}
        rx={1.5}
        {...LINE}
        fill={TINT}
      />
      <path
        className="a-bn-part a-bn-draw"
        style={k(9)}
        pathLength={1}
        d="M47.5 17.5 l3 3.2 l5.5 -7"
        {...LINE}
        strokeWidth={2.4}
      />
    </>
  );
}

/** Treatments, sooner: a capsule turning into place, half of it filled. */
function Treats() {
  return (
    <g className="a-bn-part a-bn-spin" style={k(0)}>
      <g transform="rotate(-40 32 32)">
        <rect x={8} y={21} width={48} height={22} rx={11} {...LINE} fill={TINT} />
        <path
          d="M32 21 V43 H19 a11 11 0 0 1 0 -22 Z"
          fill="currentColor"
          stroke="currentColor"
          strokeWidth={2.2}
          strokeLinejoin="round"
        />
        <path d="M40 27.5 h7" {...LINE} opacity={0.75} />
      </g>
    </g>
  );
}

/** Smarter AI: a large spark, then a small one that keeps twinkling. */
function Learns() {
  return (
    <>
      <path
        className="a-bn-part a-bn-spin"
        style={k(0)}
        d="M27 8 C29 23 35 29 50 31 C35 33 29 39 27 54 C25 39 19 33 4 31 C19 29 25 23 27 8 Z"
        {...LINE}
        fill={TINT}
      />
      <path
        className="a-bn-part a-bn-twinkle"
        style={k(5)}
        d="M50 6 C50.8 11 53 13.2 58 14 C53 14.8 50.8 17 50 22 C49.2 17 47 14.8 42 14 C47 13.2 49.2 11 50 6 Z"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth={1.4}
        strokeLinejoin="round"
      />
      <path className="a-bn-part" style={k(7)} d="M49 43 v8 M45 47 h8" {...LINE} opacity={0.8} />
    </>
  );
}

/** In the order of `BENEFITS`. */
const ICONS = [Holds, Funds, Treats, Learns];

export function BenefitIcon({ index }: { index: number }) {
  const Art = ICONS[index];
  if (!Art) return null;
  return (
    <svg
      aria-hidden
      viewBox="0 0 64 64"
      className="h-[72px] w-[72px] overflow-visible tablet:h-[88px] tablet:w-[88px]"
    >
      <Art />
    </svg>
  );
}
