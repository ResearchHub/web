/**
 * The DoubleZero Foundation mark, transcribed cell-for-cell off the artwork on
 * the RFP banner: a 16x18 pixel plate holding a green circle, a red square and
 * a blue triangle. Those three shapes key the three research tracks further
 * down the page, so the mark has to stay pixel-exact rather than approximated.
 *
 * `W` cells are the artwork's background showing through and render as nothing,
 * which lets the same grid sit on the light and dark sections alike.
 */
const MARK_GRID = [
  'KKKKKKKKKKKKAWWW',
  'KWWWWWWWWWWWAAWW',
  'KWLLLLLLLLLLAWAW',
  'KWLLLGGKLLLLAWWA',
  'KWLLGggGKLLLKKKK',
  'KWLLGggGKLLLLLWK',
  'KWLLKGGKKLLLLLWK',
  'KWLLLKKKLLLLLLWK',
  'KWLLLLLLLRRRRKWW',
  'KWLCLLLLLRrrRKWW',
  'KWLBCLLLLRrrRKWW',
  'KWLBBCLLLRRRKWWW',
  'KWLBBBCLLKKKWWWK',
  'KWLBBBBCLWWWWKWK',
  'KWLKKKKWWWWWWKWK',
  'KWLLLWWWWWKKKKWK',
  'KWWWWWWWWWWWWWWK',
  'KKKWWWWWWKKKKKKK',
] as const;

const COLS = 16;
const ROWS = 18;

/** Sampled straight off the banner PNG. */
const LIGHT_PALETTE: Record<string, string> = {
  K: '#000000',
  L: '#d7d7d7',
  A: '#9e9e9e',
  G: '#0a7805',
  g: '#29f91f',
  R: '#e80000',
  r: '#7c0405',
  B: '#0819d8',
  C: '#3faff0',
};

/** Outline and plate invert so the mark still reads on the dark hero. */
const DARK_PALETTE: Record<string, string> = {
  K: '#eef2f9',
  L: '#212a3f',
  A: '#5a647e',
  G: '#12a30a',
  g: '#5bff50',
  R: '#ff2f2f',
  r: '#9c0c0d',
  B: '#4256ff',
  C: '#63c8ff',
};

interface Cell {
  x: number;
  y: number;
  w: number;
  ch: string;
}

/**
 * Horizontal runs of one colour collapse into a single rect, taking the mark
 * from 288 nodes down to ~90.
 */
const CELLS: Cell[] = (() => {
  const out: Cell[] = [];
  MARK_GRID.forEach((row, y) => {
    let x = 0;
    while (x < COLS) {
      const ch = row[x];
      if (ch === 'W') {
        x++;
        continue;
      }
      let w = 1;
      while (x + w < COLS && row[x + w] === ch) w++;
      out.push({ x, y, w, ch });
      x += w;
    }
  });
  return out;
})();

interface DoubleZeroMarkProps {
  /** Rendered height in px; width follows the 16:18 grid. */
  size?: number;
  variant?: 'light' | 'dark';
  className?: string;
}

export function DoubleZeroMark({
  size = 36,
  variant = 'light',
  className,
}: Readonly<DoubleZeroMarkProps>) {
  const palette = variant === 'dark' ? DARK_PALETTE : LIGHT_PALETTE;

  return (
    <svg
      width={(size * COLS) / ROWS}
      height={size}
      viewBox={`0 0 ${COLS} ${ROWS}`}
      className={className}
      shapeRendering="crispEdges"
      aria-hidden="true"
      focusable="false"
    >
      {CELLS.map((c) => (
        <rect key={`${c.x}-${c.y}`} x={c.x} y={c.y} width={c.w} height={1} fill={palette[c.ch]} />
      ))}
    </svg>
  );
}
