import { useId, type ReactNode } from 'react';
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

/** Lets a shape inside the SVG spin or pulse around its own center. */
const OWN_CENTER = 'origin-center [transform-box:fill-box] motion-reduce:animate-none';

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

function drawNetwork(accent: string) {
  const layers = [3, 5, 5, 3].map((count, layer) =>
    Array.from({ length: count }, (_, index) => ({
      x: 70 + layer * 88,
      y: 150 + (index - (count - 1) / 2) * 46,
    }))
  );
  const edges = layers
    .slice(1)
    .flatMap((layer, index) => layer.flatMap((to) => layers[index].map((from) => ({ from, to }))));
  const lit = [layers[0][1], layers[1][3], layers[2][1], layers[3][2]];

  return (
    <>
      {edges.map(({ from, to }) => (
        <line
          key={`${from.x}-${from.y}-${to.y}`}
          x1={from.x}
          y1={from.y}
          x2={to.x}
          y2={to.y}
          stroke={accent}
          strokeOpacity={0.25}
        />
      ))}
      <polyline points={formatPoints(lit)} fill="none" stroke="#fff" strokeWidth={2.5} />
      {layers.flat().map((node) => (
        <circle key={`${node.x}-${node.y}`} cx={node.x} cy={node.y} r={7} fill="#fff" />
      ))}
      {lit.map((node, index) => (
        <circle
          key={node.x}
          cx={node.x}
          cy={node.y}
          r={15}
          fill={accent}
          fillOpacity={0.4}
          className={cn(OWN_CENTER, 'animate-pulse-dot')}
          style={{ animationDelay: `${index * 0.45}s` }}
        />
      ))}
    </>
  );
}

function drawRings(accent: string) {
  return (
    <>
      {Array.from({ length: 13 }, (_, ring) => {
        const base = 16 + ring * 15;
        const points = Array.from({ length: 72 }, (_, step) => {
          const angle = (step / 72) * TAU;
          const radius =
            base *
            (1 + 0.05 * Math.sin(angle * 3 + ring * 0.7) + 0.03 * Math.sin(angle * 7 + ring));
          return { x: 250 + Math.cos(angle) * radius * 1.1, y: 160 + Math.sin(angle) * radius };
        });
        const isHeavy = ring % 4 === 3;
        return (
          <polygon
            key={ring}
            points={formatPoints(points)}
            fill="none"
            stroke={isHeavy ? '#fff' : accent}
            strokeOpacity={isHeavy ? 0.85 : 0.45}
            strokeWidth={isHeavy ? 2.5 : 1.5}
          />
        );
      })}
      <circle cx={250} cy={160} r={6} fill="#fff" />
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
        className={cn(OWN_CENTER, 'animate-[spin_24s_linear_infinite]')}
      />
    </>
  );
}

function growBranches(
  start: Point,
  angle: number,
  length: number,
  depth: number,
  seed: number
): { d: string; width: number; tip?: Point }[] {
  const end = { x: start.x + Math.cos(angle) * length, y: start.y + Math.sin(angle) * length };
  const bend = (hashSeed(seed) - 0.5) * length * 0.5;
  const control = {
    x: (start.x + end.x) / 2 - Math.sin(angle) * bend,
    y: (start.y + end.y) / 2 + Math.cos(angle) * bend,
  };
  const segment = {
    d: `M${round(start.x)} ${round(start.y)}Q${round(control.x)} ${round(control.y)} ${round(end.x)} ${round(end.y)}`,
    width: 1 + depth * 1.3,
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
          strokeWidth={branch.width}
          strokeLinecap="round"
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
      <circle
        cx={170}
        cy={110}
        r={44}
        fill="none"
        stroke={accent}
        strokeWidth={2}
        className={cn(OWN_CENTER, 'animate-radiate')}
      />
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

function drawViruses(accent: string) {
  return (
    <>
      {drawVirus({ x: 80, y: 70 }, 22, accent)}
      {drawVirus({ x: 350, y: 250 }, 18, accent)}
      {drawVirus({ x: 95, y: 240 }, 14, accent)}
      {drawVirus(
        { x: 235, y: 150 },
        56,
        accent,
        cn(OWN_CENTER, 'animate-[spin_60s_linear_infinite]')
      )}
    </>
  );
}

function drawHelix(accent: string) {
  const strand = (sign: number) =>
    Array.from({ length: 111 }, (_, index) => {
      const x = -20 + index * 4;
      return { x, y: 150 + sign * Math.sin(x / 42) * 72 };
    });

  return (
    <>
      {Array.from({ length: 28 }, (_, index) => {
        const x = -16 + index * 16;
        const top = 150 + Math.sin(x / 42) * 72;
        const bottom = 150 - Math.sin(x / 42) * 72;
        const opacity = round(0.25 + 0.6 * Math.abs(Math.cos(x / 42)));
        return (
          <g key={x} strokeWidth={4} strokeLinecap="round" strokeOpacity={opacity}>
            <line x1={x} y1={round(top)} x2={x} y2={150} stroke={accent} />
            <line x1={x} y1={150} x2={x} y2={round(bottom)} stroke="#fff" />
          </g>
        );
      })}
      <polyline points={formatPoints(strand(1))} fill="none" stroke="#fff" strokeWidth={5} />
      <polyline points={formatPoints(strand(-1))} fill="none" stroke={accent} strokeWidth={5} />
    </>
  );
}

function drawContours(accent: string) {
  const peaks = [
    { center: { x: 260, y: 170 }, rings: 12, step: 17 },
    { center: { x: 70, y: 60 }, rings: 6, step: 15 },
  ];

  return (
    <>
      {peaks.flatMap(({ center, rings, step }) =>
        Array.from({ length: rings }, (_, ring) => {
          const base = 12 + ring * step;
          const points = Array.from({ length: 90 }, (_, index) => {
            const angle = (index / 90) * TAU;
            const radius =
              base *
              (1 +
                0.14 * Math.sin(3 * angle + ring * 0.35) +
                0.07 * Math.sin(5 * angle - ring * 0.5));
            return {
              x: center.x + Math.cos(angle) * radius,
              y: center.y + Math.sin(angle) * radius,
            };
          });
          const isHeavy = ring % 5 === 4;
          return (
            <polygon
              key={`${center.x}-${ring}`}
              points={formatPoints(points)}
              fill="none"
              stroke={isHeavy ? '#fff' : accent}
              strokeOpacity={isHeavy ? 0.9 : 0.5}
              strokeWidth={isHeavy ? 2.5 : 1.5}
            />
          );
        })
      )}
      <circle cx={260} cy={170} r={5} fill="#fff" />
    </>
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
      <g className={cn(OWN_CENTER, 'animate-[spin_40s_linear_infinite]')}>
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
    <>
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
    </>
  );
}

const CONSTELLATION = [
  { x: 60, y: 210 },
  { x: 110, y: 160 },
  { x: 170, y: 175 },
  { x: 220, y: 120 },
  { x: 290, y: 110 },
  { x: 330, y: 170 },
  { x: 300, y: 230 },
];

function traceSparkle(center: Point, size: number) {
  const { x, y } = center;
  return `M${x} ${y - size}Q${x} ${y} ${x + size} ${y}Q${x} ${y} ${x} ${y + size}Q${x} ${y} ${x - size} ${y}Q${x} ${y} ${x} ${y - size}Z`;
}

function drawConstellation(accent: string) {
  return (
    <>
      {Array.from({ length: 60 }, (_, index) => (
        <circle
          key={index}
          cx={round(hashSeed(index + 3) * 400)}
          cy={round(hashSeed(index + 71) * 300)}
          r={round(0.6 + hashSeed(index + 13) * 1.6)}
          fill="#fff"
          fillOpacity={0.65}
        />
      ))}
      <polyline
        points={formatPoints(CONSTELLATION)}
        fill="none"
        stroke={accent}
        strokeOpacity={0.7}
        strokeWidth={1.5}
      />
      {CONSTELLATION.map((star) => (
        <circle key={star.x} cx={star.x} cy={star.y} r={4} fill="#fff" />
      ))}
      <path
        d={traceSparkle({ x: 290, y: 110 }, 46)}
        fill="#fff"
        className={cn(OWN_CENTER, 'animate-pulse-slow')}
      />
      <path d={traceSparkle({ x: 110, y: 160 }, 18)} fill={accent} />
    </>
  );
}

const ARTWORK: Record<TopicId, (accent: string) => ReactNode> = {
  ai: drawNetwork,
  longevity: drawRings,
  cancer: drawCells,
  neuroscience: drawNeuron,
  heart: drawHeartbeat,
  infections: drawViruses,
  genetics: drawHelix,
  environment: drawContours,
  physics: drawAtom,
  chemistry: drawMolecule,
  other: drawConstellation,
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
        <pattern id={`${id}dots`} width="16" height="16" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="1" fill="#fff" fillOpacity="0.14" />
        </pattern>
        <filter id={`${id}glow`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <rect width="400" height="300" fill={`url(#${id}bg)`} />
      <rect width="400" height="300" fill={`url(#${id}dots)`} />
      <g filter={`url(#${id}glow)`}>{ARTWORK[topicId](accent)}</g>
    </svg>
  );
}
