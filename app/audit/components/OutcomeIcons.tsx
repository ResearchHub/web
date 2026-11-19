/**
 * Drawn icons for the four outcomes under "What science gains when its
 * errors are found", as /consciousness has for its four tenets, in this
 * page's own hand: black line on paper, the red pencil for an error and the
 * blue pencil for a check. Each is complete as the server renders it; where
 * motion is welcome each then runs one small, slow loop (audit.css).
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

/** 1. Fixed before they spread: the error is corrected in the paper that
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

/** 2. Results that hold: new work, in black, set down on a stack that has
 *  been checked. */
function Holds() {
  return (
    <>
      <path d="M5 58 H59" stroke={INK} strokeWidth={2} strokeLinecap="round" opacity={0.5} />
      {[
        [13, 49],
        [11, 41],
        [14, 33],
        [12, 25],
      ].map(([x, y]) => (
        <rect
          key={y}
          x={x}
          y={y}
          width={36}
          height={8}
          rx={1}
          fill={SHEET}
          stroke={INK}
          strokeWidth={2}
          strokeLinejoin="round"
        />
      ))}
      <Check d="M52.5 41 l3 3.2 l5.5 -7.2" />
      <rect
        className="a-oi-drop"
        x={14}
        y={17}
        width={36}
        height={8}
        rx={1}
        fill={INK}
        stroke={INK}
        strokeWidth={2}
        strokeLinejoin="round"
      />
    </>
  );
}

/** 3. Answered sooner: an open question, and the mark that it is settled. */
function Answered() {
  return (
    <>
      <Sheet x={11} y={6} w={36} h={50} />
      <g className="a-oi-ask">
        <path
          d="M22 24 C22 14.5 37 14.5 37 24 C37 30.5 29.5 30.5 29.5 37.5"
          fill="none"
          stroke={INK}
          strokeWidth={3.2}
          strokeLinecap="round"
        />
        <circle cx={29.5} cy={45} r={2} fill={INK} />
      </g>
      <g className="a-oi-fix a-oi-slow">
        <circle cx={47} cy={49} r={10.5} fill={BLUE} stroke={SHEET} strokeWidth={2} />
        <path
          d="M41.8 49.2 l3.6 3.7 l6.6 -8.2"
          fill="none"
          stroke={SHEET}
          strokeWidth={2.6}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </>
  );
}

/** 4. Checked as it appears: the red line passes over each new paper in
 *  turn, and each gets its check. */
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

const ICONS = [Fixed, Holds, Answered, Checked];

export function OutcomeIcon({ index }: { index: number }) {
  const Art = ICONS[index];
  if (!Art) return null;
  return (
    <svg
      aria-hidden
      viewBox="0 0 64 64"
      className="a-oi h-[60px] w-[60px] shrink-0 overflow-visible tablet:h-[88px] tablet:w-[88px]"
    >
      <Art />
    </svg>
  );
}
