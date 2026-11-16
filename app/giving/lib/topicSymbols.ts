import type { Topic } from '@/app/giving/lib/topics';

/**
 * Flat illustrations for the Giving Tuesday topics. Each symbol is drawn on a 400 by 300
 * canvas, centered on (200, 150), as a list of parts. A part's `role` picks its color from the
 * topic's palette, and its `motion` names the small animation it plays while its card is
 * hovered (see `TopicArt.module.css`).
 */

type TopicId = Topic['id'];

export type Role = 'main' | 'accent' | 'dark' | 'light' | 'pink' | 'teal';

export type Motion =
  | 'draw'
  | 'pop'
  | 'popSoft'
  | 'flow'
  | 'twinkle'
  | 'tilt'
  | 'float'
  | 'beat'
  | 'spin'
  | 'squash'
  | 'leaf'
  | 'rock'
  | 'sparkle';

interface Animated {
  motion?: Motion;
  /** Seconds before the motion starts, so neighbors move one after another. */
  delay?: number;
}

/** A part with a `transform` never gets a `motion`: the CSS animation would replace it. */
export type SymbolPart =
  | (Animated & { kind: 'shape'; d: string; role: Role; transform?: string })
  | (Animated & { kind: 'line'; d: string; role: Role; width: number; transform?: string })
  | (Animated & { kind: 'group'; parts: SymbolPart[] });

export interface TopicPalette {
  background: string;
  main: string;
  accent: string;
  dark: string;
  light: string;
  pink?: string;
  teal?: string;
  /** A dark background, so text on it is white. */
  isDark?: boolean;
}

export const TOPIC_PALETTES: Record<TopicId, TopicPalette> = {
  ai: {
    background: '#E4E8FF',
    main: '#4C5BD4',
    accent: '#FFB547',
    dark: '#27307A',
    light: '#BFC8FF',
  },
  longevity: {
    background: '#FFEBD6',
    main: '#F08A4B',
    accent: '#F5A93D',
    dark: '#8A3E1F',
    light: '#FFD6B3',
  },
  cancer: {
    background: '#FFE4EC',
    main: '#E8679A',
    accent: '#FFB84D',
    dark: '#A33468',
    light: '#FFF5F8',
  },
  neuroscience: {
    background: '#F1E6FF',
    main: '#B48CF2',
    accent: '#F49AC2',
    dark: '#6A3FB8',
    light: '#FBF6FF',
  },
  heart: {
    background: '#FFE5DF',
    main: '#EE5560',
    accent: '#FFB347',
    dark: '#9E1B33',
    light: '#FFFFFF',
  },
  infections: {
    background: '#DDF6F0',
    main: '#1FA3A0',
    accent: '#8EF0D2',
    dark: '#0E5E63',
    light: '#F2FFFB',
  },
  genetics: {
    background: '#E5F7DC',
    main: '#2E9E6E',
    accent: '#9ED94A',
    dark: '#1C5E43',
    light: '#FFFFFF',
  },
  environment: {
    background: '#DFF1FB',
    main: '#4BA3D9',
    accent: '#5CC28A',
    dark: '#1F6E4A',
    light: '#E9F7FF',
  },
  physics: {
    background: '#1E2156',
    main: '#B57BEA',
    accent: '#FFD27A',
    dark: '#4E2283',
    light: '#E8ECFF',
    isDark: true,
  },
  chemistry: {
    background: '#FFF2D2',
    main: '#3CC2B5',
    accent: '#F5A623',
    dark: '#5A4320',
    light: '#FFFFFF',
    pink: '#F27A8A',
  },
  other: {
    background: '#F1ECFF',
    main: '#7A5CD6',
    accent: '#FFC94A',
    dark: '#4A3A8C',
    light: '#FFFFFF',
    pink: '#F49AC2',
    teal: '#3CC2B5',
  },
};

// ---------- geometry ----------

const round = (n: number) => Math.round(n * 10) / 10;
type Point = [number, number];

const polar = (cx: number, cy: number, r: number, deg: number): Point => [
  cx + r * Math.cos((deg * Math.PI) / 180),
  cy + r * Math.sin((deg * Math.PI) / 180),
];
const polyline = (pts: Point[]) => 'M' + pts.map(([x, y]) => `${round(x)} ${round(y)}`).join('L');
const closed = (pts: Point[]) => polyline(pts) + 'Z';
const circle = (cx: number, cy: number, r: number) =>
  `M${cx - r} ${cy}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0Z`;
const ellipse = (cx: number, cy: number, rx: number, ry: number) =>
  `M${cx - rx} ${cy}a${rx} ${ry} 0 1 0 ${2 * rx} 0a${rx} ${ry} 0 1 0 ${-2 * rx} 0Z`;
const roundedRect = (x: number, y: number, w: number, h: number, r: number) =>
  `M${x + r} ${y}H${x + w - r}A${r} ${r} 0 0 1 ${x + w} ${y + r}V${y + h - r}A${r} ${r} 0 0 1 ${x + w - r} ${y + h}H${x + r}A${r} ${r} 0 0 1 ${x} ${y + h - r}V${y + r}A${r} ${r} 0 0 1 ${x + r} ${y}Z`;
const sparkle = (x: number, y: number, l: number) =>
  `M${x} ${y - l}Q${x} ${y} ${x + l} ${y}Q${x} ${y} ${x} ${y + l}Q${x} ${y} ${x - l} ${y}Q${x} ${y} ${x} ${y - l}Z`;
const heart = (cx: number, cy: number, s: number) =>
  closed(
    Array.from({ length: 60 }, (_, i): Point => {
      const t = (i / 60) * Math.PI * 2;
      return [
        cx + s * 16 * Math.sin(t) ** 3,
        cy - s * (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)),
      ];
    })
  );

const shape = (d: string, role: Role, extra: Partial<SymbolPart> = {}): SymbolPart =>
  ({ kind: 'shape', d, role, ...extra }) as SymbolPart;
const line = (d: string, role: Role, width: number, extra: Partial<SymbolPart> = {}): SymbolPart =>
  ({ kind: 'line', d, role, width, ...extra }) as SymbolPart;
const group = (motion: Motion, parts: SymbolPart[], delay?: number): SymbolPart => ({
  kind: 'group',
  motion,
  parts,
  delay,
});

// ---------- symbols ----------

function chip(): SymbolPart[] {
  const parts: SymbolPart[] = [];
  const traces: [string, number, number, number][] = [
    ['M280 114H304L322 96', 326, 92, 7],
    ['M120 186H96L78 204', 74, 208, 7],
    ['M236 230V250H266', 272, 250, 6],
    ['M164 70V50H136', 130, 50, 6],
  ];
  traces.forEach(([d, x, y, r], i) => {
    parts.push(
      line(d, 'accent', 4, { motion: 'draw', delay: i * 0.25 }),
      shape(circle(x, y, r), 'accent', { motion: 'pop', delay: i * 0.25 + 0.5 })
    );
  });
  [-36, -12, 12, 36].forEach((o) =>
    parts.push(
      line(`M${200 + o} 92V70`, 'dark', 8),
      line(`M${200 + o} 208V230`, 'dark', 8),
      line(`M142 ${150 + o}H120`, 'dark', 8),
      line(`M258 ${150 + o}H280`, 'dark', 8)
    )
  );
  parts.push(
    shape(roundedRect(142, 92, 116, 116, 18), 'main'),
    shape(roundedRect(172, 122, 56, 56, 10), 'accent', { motion: 'popSoft' }),
    shape(circle(158, 108, 5), 'light')
  );
  return parts;
}

function hourglass(): SymbolPart[] {
  return [
    group('tilt', [
      shape(
        'M154 80H246C246 120 208 130 208 150C208 170 246 180 246 220H154C154 180 192 170 192 150C192 130 154 120 154 80Z',
        'light'
      ),
      shape('M172 108H228C222 124 204 134 200 144C196 134 178 124 172 108Z', 'accent'),
      line('M200 146V200', 'accent', 3, { motion: 'flow' }),
      shape('M164 216C172 196 188 188 200 186C212 188 228 196 236 216Z', 'accent'),
      shape(roundedRect(138, 64, 124, 18, 9), 'dark'),
      shape(roundedRect(138, 218, 124, 18, 9), 'dark'),
    ]),
    shape(sparkle(292, 92, 13), 'accent', { motion: 'twinkle' }),
    shape(sparkle(112, 196, 8), 'accent', { motion: 'twinkle', delay: 0.5 }),
  ];
}

function headWithIdeas(): SymbolPart[] {
  const nodes: Point[] = [
    [196, 92],
    [158, 112],
    [234, 112],
    [180, 146],
    [222, 142],
    [200, 176],
  ];
  return [
    shape(
      'M150 242V202C120 188 108 158 112 128C116 86 152 58 196 58C244 58 276 92 276 132L292 166C296 172 292 178 286 178H276V198C276 210 266 216 254 216H232V242Z',
      'main'
    ),
    line(
      'M158 112L196 92L234 112M158 112L180 146L222 142L234 112M196 92L180 146M222 142L200 176L180 146',
      'light',
      4,
      { motion: 'draw' }
    ),
    ...nodes.map(([x, y], i) =>
      shape(circle(x, y, i === 0 ? 9 : 7), i === 0 ? 'accent' : 'light', {
        motion: 'pop',
        delay: i * 0.18,
      })
    ),
  ];
}

function ribbon(): SymbolPart[] {
  return [
    group('float', [
      line(
        'M168 238C176 202 214 152 222 118C232 82 216 60 200 60C184 60 168 82 178 118C186 152 224 202 232 238',
        'main',
        26
      ),
    ]),
    shape(sparkle(282, 90, 15), 'accent', { motion: 'twinkle' }),
    shape(sparkle(122, 110, 10), 'accent', { motion: 'twinkle', delay: 0.4 }),
    shape(sparkle(292, 190, 8), 'accent', { motion: 'twinkle', delay: 0.8 }),
  ];
}

function heartbeat(): SymbolPart[] {
  return [
    group('beat', [shape(heart(200, 146, 5.3), 'main')]),
    line('M104 150H164L180 118L198 188L214 132L226 150H296', 'light', 7, { motion: 'draw' }),
  ];
}

function shield(): SymbolPart[] {
  const particle: SymbolPart[] = [shape(circle(200, 150, 26), 'light')];
  for (let i = 0; i < 8; i++) {
    const [ax, ay] = polar(200, 150, 26, i * 45);
    const [bx, by] = polar(200, 150, 38, i * 45);
    const [cx, cy] = polar(200, 150, 41, i * 45);
    particle.push(
      line(`M${round(ax)} ${round(ay)}L${round(bx)} ${round(by)}`, 'light', 5),
      shape(circle(round(cx), round(cy), 5.5), 'light')
    );
  }
  return [
    group('float', [
      shape('M200 60L270 88V148C270 196 240 224 200 242C160 224 130 196 130 148V88Z', 'main'),
      group('spin', particle),
    ]),
  ];
}

function helix(): SymbolPart[] {
  const xa = (y: number) => 200 + 44 * Math.sin((y - 60) * 0.042);
  const xb = (y: number) => 200 - 44 * Math.sin((y - 60) * 0.042);
  let a = '';
  let b = '';
  let rungs = '';
  for (let y = 60; y <= 240; y += 3) {
    a += `${y === 60 ? 'M' : 'L'}${round(xa(y))} ${y}`;
    b += `${y === 60 ? 'M' : 'L'}${round(xb(y))} ${y}`;
  }
  for (let y = 66; y <= 236; y += 13) {
    if (Math.abs(xa(y) - xb(y)) > 18) rungs += `M${round(xa(y))} ${y}H${round(xb(y))}`;
  }
  return [
    group('tilt', [
      line(b, 'accent', 10),
      line(rungs, 'light', 5, { motion: 'draw' }),
      line(a, 'main', 10),
    ]),
  ];
}

function globe(): SymbolPart[] {
  return [
    shape(circle(190, 146, 76), 'main'),
    line(ellipse(190, 146, 32, 76), 'light', 3, { motion: 'squash' }),
    line('M190 70V222M114 146H266M128 108Q190 122 252 108M128 184Q190 170 252 184', 'light', 3),
    group('leaf', [
      shape('M232 236C232 190 262 166 306 160C306 206 278 232 232 236Z', 'accent'),
      line('M236 232Q262 196 300 164', 'dark', 3),
    ]),
  ];
}

function molecule(): SymbolPart[] {
  const ring = [0, 1, 2, 3, 4, 5].map((k) => polar(188, 156, 58, -90 + k * 60));
  const [o1x, o1y] = polar(188, 156, 116, -30);
  const [o2x, o2y] = polar(188, 156, 112, 150);
  return [
    group('rock', [
      line(
        `M${round(ring[1][0])} ${round(ring[1][1])}L${round(o1x)} ${round(o1y)}M${round(ring[4][0])} ${round(ring[4][1])}L${round(o2x)} ${round(o2y)}`,
        'dark',
        8
      ),
      line(closed(ring), 'dark', 8),
      line(circle(188, 156, 32), 'dark', 5),
      ...ring.map(([x, y]) => shape(circle(round(x), round(y), 14), 'main')),
      shape(circle(round(o1x), round(o1y), 20), 'accent', { motion: 'pop', delay: 0.2 }),
      shape(circle(round(o2x), round(o2y), 17), 'pink', { motion: 'pop', delay: 0.6 }),
      shape(circle(round(o1x) - 6, round(o1y) - 6, 5), 'light'),
    ]),
  ];
}

function planet(): SymbolPart[] {
  const tilt = 'rotate(-18 200 150)';
  return [
    shape(sparkle(96, 76, 11), 'light', { motion: 'twinkle' }),
    shape(sparkle(312, 66, 8), 'light', { motion: 'twinkle', delay: 0.5 }),
    shape(sparkle(320, 228, 10), 'light', { motion: 'twinkle', delay: 0.9 }),
    shape(circle(84, 210, 3), 'light', { motion: 'pop', delay: 0.3 }),
    shape(circle(140, 248, 2.5), 'light', { motion: 'pop', delay: 0.7 }),
    group('float', [
      line('M90 150A110 26 0 0 1 310 150', 'accent', 10, { transform: tilt }),
      shape(circle(200, 150, 58), 'main'),
      line('M146 136Q200 126 254 136M150 170Q200 162 250 170', 'dark', 5),
      line('M90 150A110 26 0 0 0 310 150', 'accent', 10, { transform: tilt }),
    ]),
  ];
}

function shapesAndSparkle(): SymbolPart[] {
  return [
    group(
      'float',
      [shape(roundedRect(104, 82, 34, 34, 7), 'main', { transform: 'rotate(15 121 99)' })],
      0.2
    ),
    group('float', [shape(circle(130, 206, 24), 'teal')], 0.5),
    group('float', [shape('M266 182L298 238H234Z', 'pink')], 0.8),
    shape(sparkle(200, 140, 62), 'accent', { motion: 'sparkle' }),
    shape(sparkle(300, 84, 16), 'main', { motion: 'twinkle', delay: 0.3 }),
  ];
}

export const TOPIC_SYMBOLS: Record<TopicId, SymbolPart[]> = {
  ai: chip(),
  longevity: hourglass(),
  cancer: ribbon(),
  neuroscience: headWithIdeas(),
  heart: heartbeat(),
  infections: shield(),
  genetics: helix(),
  environment: globe(),
  physics: planet(),
  chemistry: molecule(),
  other: shapesAndSparkle(),
};
