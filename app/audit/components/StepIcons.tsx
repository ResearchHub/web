/**
 * Drawn icons for the four steps of an audit, in this page's own hand: black line on paper, the red pencil
 * for an error and the blue pencil for a check. Each is complete as the
 * server renders it; where motion is welcome each then runs one small, slow
 * loop (audit.css).
 */

const INK = 'var(--a-ink)';
const RED = 'var(--a-red)';
const BLUE = 'var(--a-blue)';
const SHEET = 'var(--a-sheet)';

/** A sheet of paper with lines of text; each line is [distance from the top, length]. */
function Sheet({
  x,
  y,
  w,
  h,
  lines = [],
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  lines?: [number, number][];
}) {
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={1.5}
        fill={SHEET}
        stroke={INK}
        strokeWidth={2}
        strokeLinejoin="round"
      />
      {lines.map(([dy, len]) => (
        <line
          key={dy}
          x1={x + 4}
          x2={x + 4 + len}
          y1={y + dy}
          y2={y + dy}
          stroke={INK}
          strokeWidth={1.8}
          strokeLinecap="round"
          opacity={0.4}
        />
      ))}
    </g>
  );
}

function Check({ d, className }: { d: string; className?: string }) {
  return (
    <path
      className={className}
      d={d}
      fill="none"
      stroke={BLUE}
      strokeWidth={2.4}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  );
}

/** Published and corrected: the error is corrected in the paper that
 *  made it, and the two papers that draw on it stay clean. */
function Fixed() {
  return (
    <>
      <g fill="none" stroke={INK} strokeWidth={1.6} strokeDasharray="2 3" opacity={0.65}>
        <path d="M31 24 C37 24 37 16 43 16" />
        <path d="M31 40 C37 40 37 48 43 48" />
      </g>
      <Sheet
        x={43}
        y={5}
        w={17}
        h={22}
        lines={[
          [6, 9],
          [11, 7],
          [16, 9],
        ]}
      />
      <Sheet
        x={43}
        y={37}
        w={17}
        h={22}
        lines={[
          [6, 9],
          [11, 7],
          [16, 9],
        ]}
      />
      <Sheet
        x={4}
        y={12}
        w={27}
        h={40}
        lines={[
          [7, 17],
          [13, 13],
          [19, 12],
          [25, 15],
          [31, 11],
        ]}
      />
      <line
        className="a-oi-err"
        x1={8}
        x2={20}
        y1={31}
        y2={31}
        stroke={RED}
        strokeWidth={2.8}
        strokeLinecap="round"
      />
      <Check className="a-oi-fix" d="M22 31 l2.3 2.5 l4.2 -5.6" />
    </>
  );
}

/** A line of a paper picked out in the red pencil. */
function Highlight({ x, y, w, muted }: { x: number; y: number; w: number; muted?: boolean }) {
  return (
    <rect
      x={x}
      y={y - 3.5}
      width={w}
      height={7}
      rx={1}
      fill={muted ? INK : RED}
      opacity={muted ? 0.12 : 0.28}
    />
  );
}

/** A small flag on a pole, in the margin beside a flagged line. */
function Flag({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <path d={`M${x} ${y - 5} V${y + 6}`} stroke={RED} strokeWidth={1.8} strokeLinecap="round" />
      <path d={`M${x} ${y - 5} l8.5 3 l-8.5 3 z`} fill={RED} stroke={RED} strokeLinejoin="round" />
    </g>
  );
}

/** It flags possible errors: two lines of a paper highlighted in red, each
 *  with a flag in the margin. */
function Flagged() {
  return (
    <>
      <Sheet
        x={8}
        y={6}
        w={38}
        h={52}
        lines={[
          [8, 26],
          [14, 22],
          [21, 24],
          [28, 26],
          [35, 21],
          [42, 25],
        ]}
      />
      <Highlight x={10.5} y={27} w={29} />
      <Highlight x={10.5} y={41} w={26} />
      <Flag x={51} y={27} />
      <Flag x={51} y={41} />
    </>
  );
}

/** One of the experts: a head and shoulders. */
function Person({ y }: { y: number }) {
  return (
    <g fill={SHEET} stroke={INK} strokeWidth={2} strokeLinejoin="round">
      <path d={`M43 ${y + 12.5} a7.5 7 0 0 1 15 0 z`} />
      <circle cx={50.5} cy={y} r={4.2} />
    </g>
  );
}

/** Experts check each flag: the flagged paper beside three reviewers. One
 *  flag is confirmed (blue check), the other rejected (struck out). */
function Experts() {
  return (
    <>
      <Sheet
        x={3}
        y={7}
        w={32}
        h={50}
        lines={[
          [8, 18],
          [14, 16],
          [21, 15],
          [28, 18],
          [35, 14],
          [42, 17],
        ]}
      />
      <Highlight x={5.5} y={28} w={19} />
      <Highlight x={5.5} y={42} w={18} muted />
      <Check d="M25.5 28 l2.2 2.4 l4 -5.2" />
      <path
        d="M26.5 39.5 l5 5 M31.5 39.5 l-5 5"
        stroke={INK}
        strokeWidth={2}
        strokeLinecap="round"
        opacity={0.55}
      />
      <Person y={11} />
      <Person y={30} />
      <Person y={49} />
    </>
  );
}

/** AI reads the papers: the red line passes over each paper in turn,
 *  and each gets its check. */
function Checked() {
  const lines: [number, number][] = [
    [6, 8],
    [11, 6],
    [16, 8],
  ];
  return (
    <>
      <Sheet x={3} y={16} w={16} h={22} lines={lines} />
      <Sheet x={24} y={16} w={16} h={22} lines={lines} />
      <Sheet x={45} y={16} w={16} h={22} lines={lines} />
      <Check className="a-oi-t1" d="M7 48 l2.7 2.9 l4.8 -6.3" />
      <Check className="a-oi-t2" d="M28 48 l2.7 2.9 l4.8 -6.3" />
      <Check className="a-oi-t3" d="M49 48 l2.7 2.9 l4.8 -6.3" />
      <line
        className="a-oi-scan"
        x1={62.5}
        x2={62.5}
        y1={8}
        y2={46}
        stroke={RED}
        strokeWidth={2.2}
        strokeLinecap="round"
      />
    </>
  );
}

/** In the order of the audit's steps (`AUDIT_STEPS`). */
const ICONS = [Checked, Flagged, Experts, Fixed];

export function StepIcon({ index }: { index: number }) {
  const Art = ICONS[index];
  if (!Art) return null;
  return (
    <svg
      aria-hidden
      viewBox="0 0 64 64"
      className="a-oi h-[64px] w-[64px] shrink-0 overflow-visible tablet:h-[84px] tablet:w-[84px]"
    >
      <Art />
    </svg>
  );
}
