/**
 * Flat, printed icons for the four parts of the open problem (what
 * consciousness is, where it arises, whether it needs quantum physics,
 * whether it can be computed). Each
 * is two or three flat inks (the set's blue, pink, indigo and yellow from
 * the CSS variables), slightly out of register like a risograph. They are
 * still when the server renders them; once the chain has run (`data-seq`
 * on the Sequence box) each starts one small, slow loop, set in orch.css.
 * With reduced motion the chain never runs, so they stay still.
 */

const BLUE = 'var(--o-gold)';
const PINK = 'var(--o-ice)';
const INDIGO = 'var(--o-white)';
const YELLOW = 'var(--o-accent)';

/**
 * A patch of Penrose tiling: five thick rhombs round a point and five thin
 * ones between them, which together make a regular decagon. As SVG paths
 * centred on (32, 32), `r` from the centre to each outer corner.
 */
function penrosePatch(r: number) {
  const s = r / 1.618034;
  const u = (deg: number, len: number): [number, number] => [
    32 + Math.cos((deg * Math.PI) / 180) * len,
    32 + Math.sin((deg * Math.PI) / 180) * len,
  ];
  const d = (pts: [number, number][]) =>
    `M${pts.map(([x, y]) => `${x.toFixed(2)},${y.toFixed(2)}`).join('L')}Z`;
  const thick: string[] = [];
  const thin: string[] = [];
  for (let k = 0; k < 5; k++) {
    const t = -90 + k * 72;
    // Thick: acute corner (72°) at the centre.
    thick.push(d([[32, 32], u(t - 36, s), u(t, r), u(t + 36, s)]));
    // Thin: its 144° corner where two thick rhombs meet, filling the notch.
    thin.push(d([u(t + 36, s), u(t, r), u(t + 36, r), u(t + 72, r)]));
  }
  return { thick, thin };
}

const PENROSE = penrosePatch(27);

/** 4. Whether it can be computed: a patch of Penrose tiling. Penrose's own example
 *  of a question no algorithm settles is whether shapes like these tile
 *  the plane; these never repeat. Thick tiles in blue, thin in pink, a
 *  yellow ground printed a little off, the patch turning slowly. */
function NonComputability() {
  return (
    <>
      <path
        d={PENROSE.thick.concat(PENROSE.thin).join(' ')}
        transform="translate(2.2 2.4)"
        fill={YELLOW}
        opacity="0.75"
      />
      <g className="o-ti-tiles">
        {PENROSE.thick.map((d, i) => (
          <path
            key={`a${i}`}
            d={d}
            fill={BLUE}
            opacity="0.92"
            stroke="var(--o-ink)"
            strokeWidth="1.4"
            strokeLinejoin="round"
          />
        ))}
        {PENROSE.thin.map((d, i) => (
          <path
            key={`b${i}`}
            d={d}
            fill={PINK}
            opacity="0.9"
            stroke="var(--o-ink)"
            strokeWidth="1.4"
            strokeLinejoin="round"
          />
        ))}
      </g>
    </>
  );
}

/** 3. Whether it needs quantum physics: two states of one thing, side by
 *  side, that fall together into one. */
function ObjectiveReduction() {
  return (
    <>
      <path
        d="M4 50 C18 50 22 60 32 60 C42 60 46 50 60 50"
        fill="none"
        stroke={INDIGO}
        strokeWidth="2"
        opacity="0.5"
      />
      <path
        d="M8 43 C20 43 24 51 32 51 C40 51 44 43 56 43"
        fill="none"
        stroke={INDIGO}
        strokeWidth="2"
        opacity="0.3"
      />
      <g className="o-ti-or-merged">
        <circle cx="32" cy="27" r="11" fill={INDIGO} />
      </g>
      <g className="o-ti-or-a">
        <circle cx="24" cy="27" r="11" fill={BLUE} opacity="0.92" />
      </g>
      <g className="o-ti-or-b">
        <circle
          cx="40"
          cy="27"
          r="11"
          fill={PINK}
          opacity="0.9"
          style={{ mixBlendMode: 'multiply' }}
        />
      </g>
    </>
  );
}

/** 2. Where it arises: a neuron, and under it a rhythm that sets when it
 *  fires: the wave scrolls and the cell pulses on each crest. */
function Orchestration() {
  return (
    <>
      <g stroke={INDIGO} strokeWidth="2.6" strokeLinecap="round" fill="none">
        <path d="M32 24 L17 9 M17 9 L9 11 M17 9 L16 2" />
        <path d="M32 24 L48 8 M48 8 L56 10 M48 8 L47 1" />
        <path d="M32 24 L32 42" />
      </g>
      <g className="o-ti-soma">
        <circle cx="32" cy="23" r="9.5" fill={PINK} />
        <circle
          cx="33.5"
          cy="24.5"
          r="9.5"
          fill={BLUE}
          opacity="0.3"
          style={{ mixBlendMode: 'multiply' }}
        />
      </g>
      <svg x="2" y="42" width="60" height="20" viewBox="0 0 56 20" overflow="hidden">
        <path
          className="o-ti-wave"
          d="M0 10 Q7 0 14 10 T28 10 T42 10 T56 10 T70 10 T84 10"
          fill="none"
          stroke={BLUE}
          strokeWidth="2.8"
          strokeLinecap="round"
        />
      </svg>
    </>
  );
}

/** 1. What it is: a meter with no agreed scale, its needle never settling. */
function Measure() {
  const ticks = Array.from({ length: 9 }, (_, i) => {
    const a = Math.PI * (1 + i / 8);
    return [
      32 + Math.cos(a) * 21,
      44 + Math.sin(a) * 21,
      32 + Math.cos(a) * 25.5,
      44 + Math.sin(a) * 25.5,
    ];
  });
  return (
    <>
      <path
        d="M5 44 A27 27 0 0 1 59 44 Z"
        transform="translate(2.2 2.4)"
        fill={YELLOW}
        opacity="0.75"
      />
      <path
        d="M11 44 A21 21 0 0 1 32 23"
        fill="none"
        stroke={BLUE}
        strokeWidth="6"
        opacity="0.92"
      />
      <path
        d="M32 23 A21 21 0 0 1 53 44"
        fill="none"
        stroke={PINK}
        strokeWidth="6"
        opacity="0.9"
        style={{ mixBlendMode: 'multiply' }}
      />
      <g stroke={INDIGO} strokeWidth="1.6" strokeLinecap="round" opacity="0.7">
        {ticks.map(([x1, y1, x2, y2], i) => (
          <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} />
        ))}
      </g>
      <g className="o-ti-needle">
        <path d="M32 44 L32 18" stroke={INDIGO} strokeWidth="2.8" strokeLinecap="round" />
      </g>
      <circle cx="32" cy="44" r="3.6" fill={INDIGO} />
      <path d="M4 52 L60 52" stroke={INDIGO} strokeWidth="2" strokeLinecap="round" opacity="0.5" />
    </>
  );
}

const ICONS = [Measure, Orchestration, ObjectiveReduction, NonComputability];

export function TenetIcon({ index }: { index: number }) {
  const Art = ICONS[index];
  if (!Art) return null;
  return (
    <svg
      aria-hidden
      viewBox="0 0 64 64"
      className="o-tenet-icon h-[72px] w-[72px] shrink-0 overflow-visible"
      style={{ isolation: 'isolate' }}
    >
      <Art />
    </svg>
  );
}
