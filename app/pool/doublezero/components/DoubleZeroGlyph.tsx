/**
 * The three shapes sitting inside the DoubleZero mark, lifted out one per
 * research track: the green circle, the red square, the blue triangle. Cells,
 * dither and drop shadows are copied from the mark, and each glyph keeps the
 * mark's light plate behind it so the shadows still land.
 */
const GLYPHS = {
  circle: [
    '.........',
    '.........',
    '...GGK...',
    '..GggGK..',
    '..GggGK..',
    '..KGGKK..',
    '...KKK...',
    '.........',
    '.........',
  ],
  square: [
    '.........',
    '.........',
    '..RRRRK..',
    '..RrrRK..',
    '..RrrRK..',
    '..RRRK...',
    '..KKK....',
    '.........',
    '.........',
  ],
  triangle: [
    '.........',
    '.........',
    '..C......',
    '..BC.....',
    '..BBC....',
    '..BBBC...',
    '..BBBBC..',
    '..KKKK...',
    '.........',
  ],
} as const;

const PALETTE: Record<string, string> = {
  K: '#000000',
  G: '#0a7805',
  g: '#29f91f',
  R: '#e80000',
  r: '#7c0405',
  B: '#0819d8',
  C: '#3faff0',
};

const SPAN = 9;

export type DoubleZeroGlyphName = keyof typeof GLYPHS;

interface DoubleZeroGlyphProps {
  name: DoubleZeroGlyphName;
  /** Rendered edge length in px. */
  size?: number;
  className?: string;
}

export function DoubleZeroGlyph({ name, size = 56, className }: Readonly<DoubleZeroGlyphProps>) {
  const grid = GLYPHS[name];

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${SPAN} ${SPAN}`}
      className={className}
      shapeRendering="crispEdges"
      aria-hidden="true"
      focusable="false"
    >
      <rect x="0" y="0" width={SPAN} height={SPAN} fill="#d7d7d7" />
      {grid.flatMap((row, y) =>
        [...row].map((ch, x) =>
          ch === '.' ? null : (
            <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill={PALETTE[ch]} />
          )
        )
      )}
    </svg>
  );
}
