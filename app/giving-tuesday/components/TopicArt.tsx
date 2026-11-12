import { useId, type CSSProperties, type ReactNode } from 'react';
import { cn } from '@/utils/styles';
import type { Topic } from '@/app/giving-tuesday/lib/topics';

type TopicId = Topic['id'];

interface Point {
  x: number;
  y: number;
}

const PALETTES: Record<TopicId, { deep: string; bright: string; accent: string }> = {
  ai: { deep: '#0b1a4a', bright: '#3971ff', accent: '#9cc2ff' },
  longevity: { deep: '#03302a', bright: '#10b981', accent: '#a7f3d0' },
  cancer: { deep: '#4c0519', bright: '#f43f5e', accent: '#fecdd3' },
  neuroscience: { deep: '#2a0653', bright: '#8b5cf6', accent: '#ddd6fe' },
  heart: { deep: '#450a0a', bright: '#ef4444', accent: '#fecaca' },
  infections: { deep: '#4a1d04', bright: '#f59e0b', accent: '#fde68a' },
  genetics: { deep: '#042f2e', bright: '#14b8a6', accent: '#99f6e4' },
  environment: { deep: '#052e16', bright: '#22c55e', accent: '#bbf7d0' },
  physics: { deep: '#0f0c33', bright: '#6366f1', accent: '#c7d2fe' },
  chemistry: { deep: '#082f3d', bright: '#06b6d4', accent: '#a5f3fc' },
  other: { deep: '#0b0f19', bright: '#475569', accent: '#e2e8f0' },
};

/** For the box around a `TopicArt`: the art animates only while the box is hovered or focused. */
export const ANIMATE_ART_ON_HOVER =
  'group [&:not(:hover):not(:focus-visible)_*]:[animation-play-state:paused]';

/** Lets a shape inside the SVG spin or pulse around its own center. */
const OWN_CENTER = 'origin-center [transform-box:fill-box] motion-reduce:animate-none';

/**
 * A bright pulse running along a stroke drawn with `pathLength={100}`, shown only while its card
 * is hovered.
 */
const SIGNAL =
  'opacity-0 transition-opacity group-hover:opacity-100 animate-[trace-flow_1.6s_linear_infinite] motion-reduce:hidden';

const TAU = Math.PI * 2;

/** The same value for the same seed on the server and in the browser. */
function hashSeed(seed: number) {
  const value = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return value - Math.floor(value);
}

function round(value: number) {
  return Math.round(value * 10) / 10;
}

function formatPoints(points: Point[]) {
  return points.map((point) => `${round(point.x)},${round(point.y)}`).join(' ');
}

const CHIP_SIDES = [
  { x: 1, y: 0 },
  { x: -1, y: 0 },
  { x: 0, y: 1 },
  { x: 0, y: -1 },
];

function drawChip(accent: string) {
  const center = { x: 230, y: 140 };
  const traces = CHIP_SIDES.flatMap((side, sideIndex) =>
    [-2, -1, 0, 1, 2].map((pin) => {
      const seed = sideIndex * 5 + pin;
      const across = { x: Math.abs(side.y) * pin * 20, y: Math.abs(side.x) * pin * 20 };
      const start = { x: center.x + side.x * 58 + across.x, y: center.y + side.y * 58 + across.y };
      const out = 18 + hashSeed(seed) * 36;
      const bend = { x: start.x + side.x * out, y: start.y + side.y * out };
      const reach = 22 + hashSeed(seed + 40) * 34;
      const end = {
        x: bend.x + side.x * reach + Math.sign(across.x) * reach,
        y: bend.y + side.y * reach + Math.sign(across.y) * reach,
      };
      return { points: [start, bend, end], end };
    })
  );

  return (
    <>
      {traces.map(({ points, end }, index) => (
        <g key={formatPoints(points)}>
          <polyline
            points={formatPoints(points)}
            fill="none"
            stroke={accent}
            strokeOpacity={0.7}
            strokeWidth={2.5}
          />
          <polyline
            points={formatPoints(points)}
            pathLength={100}
            fill="none"
            stroke="#fff"
            strokeWidth={4}
            strokeLinecap="round"
            strokeDasharray="22 78"
            className={SIGNAL}
            style={{ animationDelay: `${round(hashSeed(index + 60) * 1.6)}s` }}
          />
          <circle cx={round(end.x)} cy={round(end.y)} r={4.5} fill="#fff" />
        </g>
      ))}
      <rect
        x={center.x - 58}
        y={center.y - 58}
        width={116}
        height={116}
        rx={14}
        fill={accent}
        fillOpacity={0.15}
        stroke="#fff"
        strokeWidth={2.5}
      />
      <rect
        x={center.x - 30}
        y={center.y - 30}
        width={60}
        height={60}
        rx={6}
        fill={accent}
        fillOpacity={0.55}
        stroke="#fff"
        strokeWidth={2}
        className={cn(OWN_CENTER, 'animate-pulse-slow')}
      />
    </>
  );
}

/** Sand settling out of the top bulb; the bottom pile plays it in reverse to fill up. */
const SAND =
  'animate-[drain_4s_linear_infinite] [transform-box:fill-box] motion-reduce:animate-none';

function drawHourglass(accent: string) {
  return (
    <>
      <line x1={166} y1={58} x2={166} y2={242} stroke="#fff" strokeOpacity={0.6} strokeWidth={4} />
      <line x1={274} y1={58} x2={274} y2={242} stroke="#fff" strokeOpacity={0.6} strokeWidth={4} />
      <path
        d="M178 64C178 118 212 134 212 150C212 166 178 182 178 236H262C262 182 228 166 228 150C228 134 262 118 262 64Z"
        fill="#fff"
        fillOpacity={0.08}
        stroke="#fff"
        strokeWidth={2.5}
      />
      <path
        d="M190 104C197 124 214 138 220 147C226 138 243 124 250 104Z"
        fill={accent}
        className={cn(SAND, 'origin-bottom')}
      />
      <line
        x1={220}
        y1={150}
        x2={220}
        y2={232}
        pathLength={100}
        stroke={accent}
        strokeWidth={3}
        strokeLinecap="round"
        strokeDasharray="6 14"
        className="animate-[trace-flow_0.8s_linear_infinite] motion-reduce:animate-none"
      />
      <path
        d="M184 233Q220 190 256 233Z"
        fill={accent}
        className={cn(SAND, 'origin-bottom [animation-direction:reverse]')}
      />
      <rect x={152} y={50} width={136} height={12} rx={6} fill="#fff" />
      <rect x={152} y={238} width={136} height={12} rx={6} fill="#fff" />
    </>
  );
}

function drawCells(accent: string) {
  const cells = Array.from({ length: 35 }, (_, index) => {
    const row = Math.floor(index / 7);
    const column = index % 7;
    return {
      x: 30 + column * 62 + (row % 2) * 31 + (hashSeed(index) - 0.5) * 16,
      y: 30 + row * 62 + (hashSeed(index + 50) - 0.5) * 16,
      r: 19 + hashSeed(index + 100) * 8,
    };
  }).filter((cell) => Math.hypot(cell.x - 220, cell.y - 150) > 84);

  return (
    <>
      {cells.map((cell) => (
        <g key={`${round(cell.x)}-${round(cell.y)}`}>
          <circle
            cx={round(cell.x)}
            cy={round(cell.y)}
            r={round(cell.r)}
            fill="#fff"
            fillOpacity={0.08}
            stroke={accent}
            strokeOpacity={0.5}
          />
          <circle
            cx={round(cell.x)}
            cy={round(cell.y)}
            r={round(cell.r * 0.38)}
            fill={accent}
            fillOpacity={0.55}
          />
        </g>
      ))}
      <circle
        cx={220}
        cy={150}
        r={50}
        fill={accent}
        fillOpacity={0.35}
        stroke="#fff"
        strokeWidth={2}
      />
      <circle cx={220} cy={150} r={20} fill="#fff" fillOpacity={0.85} />
      <circle
        cx={220}
        cy={150}
        r={68}
        fill="none"
        stroke="#fff"
        strokeWidth={2}
        strokeDasharray="6 10"
      />
      {[0, 1].map((ring) => (
        <circle
          key={ring}
          cx={220}
          cy={150}
          r={68}
          fill="none"
          stroke="#fff"
          strokeWidth={3}
          className={cn(OWN_CENTER, 'animate-[lock-on_1.8s_ease-out_infinite] opacity-0')}
          style={{ animationDelay: `${ring * 0.9}s` }}
        />
      ))}
    </>
  );
}

function growBranches(
  start: Point,
  angle: number,
  length: number,
  depth: number,
  seed: number
): { d: string; depth: number; tip?: Point }[] {
  const end = { x: start.x + Math.cos(angle) * length, y: start.y + Math.sin(angle) * length };
  const bend = (hashSeed(seed) - 0.5) * length * 0.5;
  const control = {
    x: (start.x + end.x) / 2 - Math.sin(angle) * bend,
    y: (start.y + end.y) / 2 + Math.cos(angle) * bend,
  };
  const segment = {
    d: `M${round(start.x)} ${round(start.y)}Q${round(control.x)} ${round(control.y)} ${round(end.x)} ${round(end.y)}`,
    depth,
    tip: depth === 0 ? end : undefined,
  };
  if (depth === 0) return [segment];
  const spread = 0.35 + hashSeed(seed + 7) * 0.3;
  return [
    segment,
    ...growBranches(end, angle - spread, length * 0.72, depth - 1, seed * 2 + 1),
    ...growBranches(end, angle + spread, length * 0.72, depth - 1, seed * 2 + 2),
  ];
}

function drawNeuron(accent: string) {
  const soma = { x: 200, y: 150 };
  const branches = Array.from({ length: 7 }, (_, index) =>
    growBranches(soma, (index / 7) * TAU + hashSeed(index + 3), 62, 3, index + 11)
  ).flat();

  return (
    <>
      {branches.map((branch) => (
        <path
          key={branch.d}
          d={branch.d}
          fill="none"
          stroke={accent}
          strokeOpacity={0.8}
          strokeWidth={1 + branch.depth * 1.3}
          strokeLinecap="round"
        />
      ))}
      {branches.map((branch) => (
        <path
          key={`signal-${branch.d}`}
          d={branch.d}
          pathLength={100}
          fill="none"
          stroke="#fff"
          strokeWidth={2 + branch.depth}
          strokeLinecap="round"
          strokeDasharray="35 65"
          className={SIGNAL}
          style={{ animationDelay: `${(3 - branch.depth) * 0.4}s` }}
        />
      ))}
      {branches.map(
        (branch) =>
          branch.tip && (
            <circle
              key={`tip-${branch.d}`}
              cx={round(branch.tip.x)}
              cy={round(branch.tip.y)}
              r={3}
              fill="#fff"
            />
          )
      )}
      <circle
        cx={soma.x}
        cy={soma.y}
        r={34}
        fill={accent}
        fillOpacity={0.3}
        className={cn(OWN_CENTER, 'animate-pulse-dot')}
      />
      <circle cx={soma.x} cy={soma.y} r={20} fill="#fff" />
    </>
  );
}

const HEARTBEAT = [
  [0, 0],
  [20, 0],
  [28, -12],
  [36, 0],
  [46, 0],
  [52, 14],
  [60, -80],
  [68, 34],
  [76, 0],
  [96, 0],
  [110, -22],
  [124, 0],
  [150, 0],
];

function drawHeartbeat(accent: string) {
  const line = Array.from({ length: 4 }, (_, beat) =>
    HEARTBEAT.map(([x, y]) => ({ x: -40 + beat * 150 + x, y: 170 + y }))
  ).flat();

  return (
    <>
      {Array.from({ length: 20 }, (_, index) => (
        <line
          key={`v${index}`}
          x1={index * 20}
          y1={0}
          x2={index * 20}
          y2={300}
          stroke="#fff"
          strokeOpacity={0.07}
        />
      ))}
      {Array.from({ length: 15 }, (_, index) => (
        <line
          key={`h${index}`}
          x1={0}
          y1={index * 20}
          x2={400}
          y2={index * 20}
          stroke="#fff"
          strokeOpacity={0.07}
        />
      ))}
      <polyline
        points={formatPoints(line)}
        fill="none"
        stroke={accent}
        strokeOpacity={0.5}
        strokeWidth={9}
        strokeLinejoin="round"
      />
      <polyline
        points={formatPoints(line)}
        fill="none"
        stroke="#fff"
        strokeWidth={3}
        strokeLinejoin="round"
        className="transition-opacity duration-500 group-hover:opacity-25"
      />
      <polyline
        points={formatPoints(line)}
        pathLength={100}
        fill="none"
        stroke="#fff"
        strokeWidth={5}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="22 78"
        className={cn(SIGNAL, '[animation-duration:2.4s]')}
      />
    </>
  );
}

function drawVirus(center: Point, radius: number, accent: string, className?: string) {
  const spikes = Math.round(radius / 3.2);
  return (
    <g className={className}>
      {Array.from({ length: spikes }, (_, index) => {
        const angle = (index / spikes) * TAU;
        return (
          <g key={index}>
            <line
              x1={round(center.x + Math.cos(angle) * radius)}
              y1={round(center.y + Math.sin(angle) * radius)}
              x2={round(center.x + Math.cos(angle) * radius * 1.3)}
              y2={round(center.y + Math.sin(angle) * radius * 1.3)}
              stroke="#fff"
              strokeOpacity={0.8}
              strokeWidth={Math.max(1.5, radius / 18)}
            />
            <circle
              cx={round(center.x + Math.cos(angle) * radius * 1.36)}
              cy={round(center.y + Math.sin(angle) * radius * 1.36)}
              r={round(radius * 0.09)}
              fill={accent}
            />
          </g>
        );
      })}
      <circle
        cx={center.x}
        cy={center.y}
        r={radius}
        fill={accent}
        fillOpacity={0.3}
        stroke="#fff"
        strokeWidth={2}
      />
      {[0, 1, 2, 3, 4].map((index) => (
        <circle
          key={index}
          cx={round(center.x + (hashSeed(index + radius) - 0.5) * radius)}
          cy={round(center.y + (hashSeed(index + radius + 9) - 0.5) * radius)}
          r={round(radius * 0.14)}
          fill="#fff"
          fillOpacity={0.45}
        />
      ))}
    </g>
  );
}

/** A small virus floating up and down; each one sets its own duration so they drift apart. */
const BOB = 'animate-[bob_3s_ease-in-out_infinite] motion-reduce:animate-none';

function drawViruses(accent: string) {
  return (
    <>
      {drawVirus({ x: 80, y: 70 }, 22, accent, cn(BOB, '[animation-duration:2.6s]'))}
      {drawVirus({ x: 350, y: 250 }, 18, accent, cn(BOB, '[animation-duration:3.2s]'))}
      {drawVirus({ x: 95, y: 240 }, 14, accent, cn(BOB, '[animation-duration:2.2s]'))}
      {drawVirus(
        { x: 235, y: 150 },
        56,
        accent,
        cn(OWN_CENTER, 'animate-[spin_16s_linear_infinite]')
      )}
    </>
  );
}

/** One full twist, in SVG units. The helix is drawn a twist wider than the frame and slides by one. */
const HELIX_PERIOD = 264;

function drawHelix(accent: string) {
  const twist = (x: number) => (x / HELIX_PERIOD) * TAU;
  const strand = (sign: number) =>
    Array.from({ length: 177 }, (_, index) => {
      const x = -284 + index * 4;
      return { x, y: 150 + sign * Math.sin(twist(x)) * 72 };
    });

  return (
    <g
      className="animate-[scroll-x_5s_linear_infinite] motion-reduce:animate-none"
      style={{ '--period': `${HELIX_PERIOD}px` } as CSSProperties}
    >
      {Array.from({ length: 43 }, (_, index) => {
        const x = -280 + index * (HELIX_PERIOD / 16);
        const top = 150 + Math.sin(twist(x)) * 72;
        const bottom = 150 - Math.sin(twist(x)) * 72;
        const opacity = round(0.25 + 0.6 * Math.abs(Math.cos(twist(x))));
        return (
          <g key={x} strokeWidth={4} strokeLinecap="round" strokeOpacity={opacity}>
            <line x1={x} y1={round(top)} x2={x} y2={150} stroke={accent} />
            <line x1={x} y1={150} x2={x} y2={round(bottom)} stroke="#fff" />
          </g>
        );
      })}
      <polyline points={formatPoints(strand(1))} fill="none" stroke="#fff" strokeWidth={5} />
      <polyline points={formatPoints(strand(-1))} fill="none" stroke={accent} strokeWidth={5} />
    </g>
  );
}

function drawLeaf(accent: string) {
  const veins = [0.22, 0.36, 0.5, 0.64, 0.78].flatMap((along) => {
    const start = { x: 120 + along * 200, y: 230 - along * 160 };
    const length = 70 * Math.sin(along * Math.PI);
    return [1, -1].map((side) => ({
      start,
      end: {
        x: start.x + length * (0.55 + side * 0.45),
        y: start.y - length * (0.55 - side * 0.45),
      },
    }));
  });

  return (
    <g className="animate-[sway_3s_ease-in-out_infinite] [transform-origin:120px_230px] motion-reduce:animate-none">
      <path
        d="M120 230Q102 254 86 282"
        fill="none"
        stroke="#fff"
        strokeWidth={5}
        strokeLinecap="round"
      />
      <path
        d="M120 230C108 140 200 66 320 70C330 176 236 246 120 230Z"
        fill={accent}
        fillOpacity={0.3}
        stroke="#fff"
        strokeWidth={2.5}
      />
      <line
        x1={120}
        y1={230}
        x2={320}
        y2={70}
        stroke="#fff"
        strokeWidth={3}
        strokeLinecap="round"
      />
      {veins.map(({ start, end }) => (
        <line
          key={formatPoints([end])}
          x1={round(start.x)}
          y1={round(start.y)}
          x2={round(end.x)}
          y2={round(end.y)}
          stroke="#fff"
          strokeOpacity={0.7}
          strokeWidth={2}
          strokeLinecap="round"
        />
      ))}
    </g>
  );
}

function drawAtom(accent: string) {
  const center = { x: 220, y: 150 };

  return (
    <>
      {Array.from({ length: 44 }, (_, index) => (
        <circle
          key={index}
          cx={round(hashSeed(index) * 400)}
          cy={round(hashSeed(index + 99) * 300)}
          r={round(0.6 + hashSeed(index + 7) * 1.4)}
          fill="#fff"
          fillOpacity={0.7}
        />
      ))}
      <g className={cn(OWN_CENTER, 'animate-[spin_10s_linear_infinite]')}>
        {[0, 60, 120].map((angle, index) => (
          <g key={angle} transform={`rotate(${angle} ${center.x} ${center.y})`}>
            <ellipse
              cx={center.x}
              cy={center.y}
              rx={150}
              ry={46}
              fill="none"
              stroke="#fff"
              strokeOpacity={0.55}
              strokeWidth={2}
            />
            <circle
              cx={round(center.x + 150 * Math.cos(index * 2.1))}
              cy={round(center.y + 46 * Math.sin(index * 2.1))}
              r={7}
              fill={accent}
            />
          </g>
        ))}
      </g>
      {[0, 1, 2, 3, 4, 5, 6].map((index) => (
        <circle
          key={index}
          cx={round(center.x + Math.cos(index * 2.4) * (index === 0 ? 0 : 10))}
          cy={round(center.y + Math.sin(index * 2.4) * (index === 0 ? 0 : 10))}
          r={9}
          fill={index % 2 === 0 ? '#fff' : accent}
        />
      ))}
    </>
  );
}

const MOLECULE = [
  [-2, 1],
  [-1, 0],
  [0, 0],
  [1, -1],
  [1, 0],
  [2, -1],
  [0, 1],
];

function drawMolecule(accent: string) {
  const side = 32;
  const rings = MOLECULE.map(([q, r]) => {
    const center = { x: 200 + side * Math.sqrt(3) * (q + r / 2), y: 150 + side * 1.5 * r };
    const corners = Array.from({ length: 6 }, (_, corner) => {
      const angle = ((60 * corner - 30) * Math.PI) / 180;
      return { x: center.x + side * Math.cos(angle), y: center.y + side * Math.sin(angle) };
    });
    return { center, corners };
  });
  const atoms = [
    ...new Map(
      rings.flatMap(({ corners }) => corners).map((atom) => [formatPoints([atom]), atom])
    ).values(),
  ];

  return (
    <g className={cn(OWN_CENTER, 'animate-[spin_14s_linear_infinite]')}>
      {rings.map(({ center, corners }, index) => (
        <g key={formatPoints([center])}>
          <polygon
            points={formatPoints(corners)}
            fill="#fff"
            fillOpacity={0.06}
            stroke="#fff"
            strokeOpacity={0.8}
            strokeWidth={2.5}
          />
          {index % 2 === 0 && (
            <circle
              cx={round(center.x)}
              cy={round(center.y)}
              r={side * 0.52}
              fill="none"
              stroke={accent}
              strokeWidth={2}
            />
          )}
        </g>
      ))}
      {atoms.map((atom, index) => (
        <circle
          key={formatPoints([atom])}
          cx={round(atom.x)}
          cy={round(atom.y)}
          r={index % 5 === 0 ? 8 : 4.5}
          fill={index % 5 === 0 ? accent : '#fff'}
          stroke={index % 5 === 0 ? '#fff' : 'none'}
          strokeWidth={2}
        />
      ))}
    </g>
  );
}

function drawBulb(accent: string) {
  const center = { x: 220, y: 118 };
  const rays = Array.from({ length: 9 }, (_, index) => {
    const angle = Math.PI + (index / 8) * Math.PI;
    return {
      x1: round(center.x + Math.cos(angle) * 78),
      y1: round(center.y + Math.sin(angle) * 78),
      x2: round(center.x + Math.cos(angle) * 102),
      y2: round(center.y + Math.sin(angle) * 102),
    };
  });

  return (
    <>
      <g
        className={cn(
          OWN_CENTER,
          'scale-90 opacity-40 transition duration-500 group-hover:scale-100 group-hover:opacity-100'
        )}
      >
        {rays.map((ray) => (
          <line
            key={`${ray.x1}-${ray.y1}`}
            {...ray}
            stroke={accent}
            strokeWidth={4}
            strokeLinecap="round"
          />
        ))}
      </g>
      <g className="opacity-0 transition-opacity duration-500 group-hover:opacity-100">
        <circle
          cx={center.x}
          cy={center.y}
          r={56}
          fill={accent}
          fillOpacity={0.6}
          className={cn(OWN_CENTER, 'animate-pulse-dot')}
        />
      </g>
      <path
        d="M196 182C196 160 168 148 168 116A52 52 0 1 1 272 116C272 148 244 160 244 182Z"
        fill="#fff"
        fillOpacity={0.12}
        stroke="#fff"
        strokeWidth={2.5}
        className="transition-[fill-opacity] duration-500 group-hover:[fill-opacity:0.45]"
      />
      <polyline
        points="206,180 206,140 213,128 220,140 227,128 234,140 234,180"
        fill="none"
        stroke={accent}
        strokeWidth={2.5}
        strokeLinejoin="round"
        className="transition-colors duration-500 group-hover:stroke-white"
      />
      <rect x={194} y={188} width={52} height={10} rx={5} fill="#fff" />
      <rect x={198} y={202} width={44} height={10} rx={5} fill="#fff" fillOpacity={0.8} />
      <rect x={208} y={216} width={24} height={8} rx={4} fill="#fff" fillOpacity={0.6} />
    </>
  );
}

const ARTWORK: Record<TopicId, (accent: string) => ReactNode> = {
  ai: drawChip,
  longevity: drawHourglass,
  cancer: drawCells,
  neuroscience: drawNeuron,
  heart: drawHeartbeat,
  infections: drawViruses,
  genetics: drawHelix,
  environment: drawLeaf,
  physics: drawAtom,
  chemistry: drawMolecule,
  other: drawBulb,
};

/** A field's illustration, drawn in its own colors. It fills its box and crops to fit. */
export function TopicArt({
  topicId,
  className,
}: Readonly<{ topicId: TopicId; className?: string }>) {
  const id = useId().replace(/\W/g, '');
  const { deep, bright, accent } = PALETTES[topicId];

  return (
    <svg
      viewBox="0 0 400 300"
      preserveAspectRatio="xMidYMid slice"
      className={cn('block', className)}
      aria-hidden
    >
      <defs>
        <radialGradient id={`${id}bg`} cx="72%" cy="25%" r="95%">
          <stop offset="0%" stopColor={bright} />
          <stop offset="100%" stopColor={deep} />
        </radialGradient>
        <filter id={`${id}glow`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <rect width="400" height="300" fill={`url(#${id}bg)`} />
      <g filter={`url(#${id}glow)`}>{ARTWORK[topicId](accent)}</g>
    </svg>
  );
}
