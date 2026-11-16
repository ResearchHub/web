/**
 * Flat, printed icons for the four tenets, one per link of the chain. Each
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

/** 1. Non-computability: a patch of Penrose tiling. Penrose's own example
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

/** 2. Objective reduction: two states of one thing, side by side over a
 *  dip in spacetime, that fall together into one. */
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

/** 3. Microtubules: a short tube of tubulin beads, its open end a ring of
 *  thirteen; a wave runs along it. */
const RING = Array.from({ length: 13 }, (_, i) => {
  const a = (i / 13) * Math.PI * 2;
  return [13 + Math.cos(a) * 7.5, 32 + Math.sin(a) * 17] as const;
});
function Microtubules() {
  const rows = [19, 26.5, 34, 41.5];
  return (
    <>
      <rect x="13" y="15" width="49" height="34" rx="5" fill={YELLOW} opacity="0.6" />
      {rows.map((y, r) =>
        Array.from({ length: 6 }, (_, i) => (
          <circle
            key={`${r}-${i}`}
            className="o-ti-bead"
            style={{ '--k': i } as React.CSSProperties}
            cx={24 + i * 6.4 + (r % 2) * 3.2}
            cy={y + 2.2}
            r="2.8"
            fill={(i + r) % 2 ? BLUE : INDIGO}
          />
        ))
      )}
      <ellipse cx="13" cy="32" rx="10" ry="20" fill="var(--o-ink)" />
      {RING.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="2.6" fill={i % 2 ? PINK : BLUE} />
      ))}
    </>
  );
}

/** 4. Orchestration: a neuron, and under it a rhythm that sets when it
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

const ICONS = [NonComputability, ObjectiveReduction, Microtubules, Orchestration];

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
