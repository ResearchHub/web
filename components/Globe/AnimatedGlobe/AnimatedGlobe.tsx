'use client';

import { useCallback, useEffect, useMemo, useRef } from 'react';

/* ─────────────────────────────────────────────────────────────────────────
   Color tokens
───────────────────────────────────────────────────────────────────────── */
const HS = {
  blue: '57,113,255', // #3971FF — brand blue (globe wires, city dots)
  blue2: '91,141,255', // #5B8DFF — lighter blue (glow accents)
  blueLt: '147,197,253', // #93C5FD — pale blue (ambient city dot glow)
  blueDeep: '37,76,194', // #254CC2 — deep blue (sphere fill edge)
  rsc: '249,115,22', // #F97316 — RSC orange (arcs + glyphs)
} as const;

const rgba = (c: string, a: number) => `rgba(${c},${a})`;
const TAU = Math.PI * 2;
const D2R = Math.PI / 180;

/* Seeded RNG so the animation is deterministic across renders. */
function mulberry(seed: number): () => number {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ─────────────────────────────────────────────────────────────────────────
   Canvas types
───────────────────────────────────────────────────────────────────────── */
type Ctx = CanvasRenderingContext2D;
type Vec3 = { x: number; y: number; z: number };
type Rot = { cy: number; sy: number; ct: number; st: number };
type DrawFn = (ctx: Ctx, t: number, w: number, h: number) => void;

/* rAF loop + DPR-aware resize, mirroring the standalone useHeroCanvas hook. */
function useHeroCanvas(draw: DrawFn) {
  const ref = useRef<HTMLCanvasElement>(null);
  const drawRef = useRef(draw);
  drawRef.current = draw;

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf = 0;
    let w = 1;
    let h = 1;
    let loggedError = false;
    const start = performance.now();

    const paint = (t: number) => {
      ctx.clearRect(0, 0, w, h);
      try {
        drawRef.current(ctx, t, w, h);
      } catch (err) {
        if (!loggedError) {
          loggedError = true;
          // eslint-disable-next-line no-console
          console.error('[AnimatedGlobe]', err);
        }
      }
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const r = canvas.getBoundingClientRect();
      w = Math.max(1, r.width);
      h = Math.max(1, r.height);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      paint((performance.now() - start) / 1000);
    };

    resize();

    let ro: ResizeObserver | null = null;
    if (window.ResizeObserver) {
      ro = new ResizeObserver(resize);
      ro.observe(canvas);
    } else {
      window.addEventListener('resize', resize);
    }

    const loop = (now: number) => {
      paint((now - start) / 1000);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      if (raf) cancelAnimationFrame(raf);
      if (ro) ro.disconnect();
      else window.removeEventListener('resize', resize);
    };
  }, []);

  return ref;
}

function glow(ctx: Ctx, x: number, y: number, r: number, color: string, a: number) {
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, rgba(color, a));
  g.addColorStop(1, rgba(color, 0));
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, TAU);
  ctx.fill();
  ctx.restore();
}

/* ─────────────────────────────────────────────────────────────────────────
   Globe helpers
───────────────────────────────────────────────────────────────────────── */
type City = [name: string, lat: number, lon: number, tier: number];

const CITIES: City[] = [
  ['NYC', 40.7, -74.0, 1],
  ['SF', 37.8, -122.4, 1],
  ['LA', 34.0, -118.2, 1],
  ['Toronto', 43.7, -79.4, 2],
  ['Vancouver', 49.3, -123.1, 2],
  ['Mexico City', 19.4, -99.1, 2],
  ['Bogotá', 4.6, -74.1, 3],
  ['Lima', -12.0, -77.0, 3],
  ['São Paulo', -23.5, -46.6, 1],
  ['Buenos Aires', -34.6, -58.4, 2],
  ['Santiago', -33.4, -70.6, 3],
  ['London', 51.5, -0.1, 1],
  ['Paris', 48.9, 2.4, 1],
  ['Berlin', 52.5, 13.4, 2],
  ['Madrid', 40.4, -3.7, 2],
  ['Rome', 41.9, 12.5, 2],
  ['Stockholm', 59.3, 18.1, 3],
  ['Amsterdam', 52.4, 4.9, 2],
  ['Zurich', 47.4, 8.5, 2],
  ['Moscow', 55.8, 37.6, 2],
  ['Istanbul', 41.0, 28.9, 2],
  ['Tel Aviv', 32.1, 34.8, 3],
  ['Dubai', 25.2, 55.3, 2],
  ['Cairo', 30.0, 31.2, 2],
  ['Lagos', 6.5, 3.4, 2],
  ['Nairobi', -1.3, 36.8, 2],
  ['Cape Town', -33.9, 18.4, 2],
  ['Casablanca', 33.6, -7.6, 3],
  ['Accra', 5.6, -0.2, 3],
  ['Mumbai', 19.1, 72.9, 1],
  ['Delhi', 28.6, 77.2, 2],
  ['Bangalore', 12.97, 77.6, 2],
  ['Karachi', 24.9, 67.0, 3],
  ['Tehran', 35.7, 51.4, 3],
  ['Singapore', 1.3, 103.8, 2],
  ['Bangkok', 13.8, 100.5, 3],
  ['Jakarta', -6.2, 106.8, 3],
  ['Beijing', 39.9, 116.4, 1],
  ['Shanghai', 31.2, 121.5, 1],
  ['Hong Kong', 22.3, 114.2, 2],
  ['Seoul', 37.6, 127.0, 2],
  ['Tokyo', 35.7, 139.7, 1],
  ['Sydney', -33.9, 151.2, 2],
  ['Melbourne', -37.8, 144.9, 3],
  ['Auckland', -36.9, 174.8, 3],
];

function unitVec(lat: number, lon: number): Vec3 {
  const la = lat * D2R;
  const lo = lon * D2R;
  const cl = Math.cos(la);
  return { x: cl * Math.sin(lo), y: -Math.sin(la), z: cl * Math.cos(lo) };
}

function makeRot(rotY: number, tilt: number): Rot {
  return { cy: Math.cos(rotY), sy: Math.sin(rotY), ct: Math.cos(tilt), st: Math.sin(tilt) };
}

function applyRot(v: Vec3, rot: Rot, R: number): Vec3 {
  const x1 = v.x * rot.cy + v.z * rot.sy;
  const z1 = -v.x * rot.sy + v.z * rot.cy;
  const y1 = v.y;
  const y2 = y1 * rot.ct - z1 * rot.st;
  const z2 = y1 * rot.st + z1 * rot.ct;
  return { x: x1 * R, y: y2 * R, z: z2 * R };
}

function slerp(a: Vec3, b: Vec3, t: number): Vec3 {
  const dot = Math.max(-1, Math.min(1, a.x * b.x + a.y * b.y + a.z * b.z));
  const theta = Math.acos(dot);
  const s = Math.sin(theta);
  if (s < 1e-4) return { x: a.x, y: a.y, z: a.z };
  const w1 = Math.sin((1 - t) * theta) / s;
  const w2 = Math.sin(t * theta) / s;
  return { x: a.x * w1 + b.x * w2, y: a.y * w1 + b.y * w2, z: a.z * w1 + b.z * w2 };
}

const CITY_VEC: Vec3[] = CITIES.map((c) => unitVec(c[1], c[2]));

function drawWireSphere(ctx: Ctx, cx: number, cy: number, R: number, rot: Rot) {
  const drawCurve = (samples: Vec3[], primary: boolean) => {
    ctx.strokeStyle = rgba(HS.blue, primary ? 0.7 : 0.42);
    ctx.lineWidth = primary ? 1.7 : 1.15;
    let drawing = false;
    ctx.beginPath();
    for (let i = 0; i < samples.length; i++) {
      const p = applyRot(samples[i], rot, R);
      if (p.z >= -0.04 * R) {
        const X = cx + p.x;
        const Y = cy + p.y;
        if (!drawing) {
          ctx.moveTo(X, Y);
          drawing = true;
        } else {
          ctx.lineTo(X, Y);
        }
      } else {
        drawing = false;
      }
    }
    ctx.stroke();
  };
  for (let lat = -75; lat <= 75; lat += 15) {
    const samples: Vec3[] = [];
    for (let i = 0; i <= 96; i++) samples.push(unitVec(lat, -180 + (360 * i) / 96));
    drawCurve(samples, lat === 0);
  }
  for (let lon = -180; lon < 180; lon += 15) {
    const samples: Vec3[] = [];
    for (let i = 0; i <= 60; i++) samples.push(unitVec(-90 + (180 * i) / 60, lon));
    drawCurve(samples, lon === 0);
  }
}

function drawSphereFill(ctx: Ctx, cx: number, cy: number, R: number) {
  const g = ctx.createRadialGradient(cx - R * 0.25, cy - R * 0.25, R * 0.1, cx, cy, R);
  g.addColorStop(0, rgba(HS.blueLt, 0.18));
  g.addColorStop(0.55, rgba(HS.blue, 0.12));
  g.addColorStop(1, rgba(HS.blueDeep, 0.2));
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(cx, cy, R, 0, TAU);
  ctx.fill();
}

function drawCityDot(
  ctx: Ctx,
  cx: number,
  cy: number,
  R: number,
  rot: Rot,
  vec: Vec3,
  tier: number,
  t: number,
  ph: number,
  color: string
) {
  const p = applyRot(vec, rot, R);
  if (p.z < 0) return;
  const fade = Math.min(1, p.z / R + 0.2);
  // Gentle, slow breath rather than an attention-grabbing twinkle.
  const tw = 0.82 + 0.18 * (0.5 + 0.5 * Math.sin(t * 0.6 + ph));
  const size = tier === 1 ? 2.6 : tier === 2 ? 2.1 : 1.7;
  glow(ctx, cx + p.x, cy + p.y, size * 4, color, 0.55 * fade * tw);
  ctx.fillStyle = rgba('255,255,255', 0.95 * fade);
  ctx.beginPath();
  ctx.arc(cx + p.x, cy + p.y, size, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = rgba(color, 0.85 * fade);
  ctx.lineWidth = 1.1;
  ctx.beginPath();
  ctx.arc(cx + p.x, cy + p.y, size + 0.6, 0, TAU);
  ctx.stroke();
}

function drawArcPath(
  ctx: Ctx,
  cx: number,
  cy: number,
  R: number,
  rot: Rot,
  vA: Vec3,
  vB: Vec3,
  t01: number,
  color: string,
  opacity: number,
  width: number
) {
  const N = 36;
  const lim = Math.min(N, Math.ceil(N * t01));
  if (lim < 1) return;
  ctx.beginPath();
  for (let i = 0; i <= lim; i++) {
    const tt = i / N;
    const v = slerp(vA, vB, tt);
    const lift = 1 + Math.sin(tt * Math.PI) * 0.2;
    const p = applyRot(v, rot, R * lift);
    const X = cx + p.x;
    const Y = cy + p.y;
    if (i === 0) ctx.moveTo(X, Y);
    else ctx.lineTo(X, Y);
  }
  ctx.strokeStyle = rgba(color, opacity);
  ctx.lineWidth = width || 1.5;
  ctx.lineCap = 'round';
  ctx.stroke();
  if (t01 < 1.02) {
    const tt = Math.min(1, t01);
    const v = slerp(vA, vB, tt);
    const lift = 1 + Math.sin(tt * Math.PI) * 0.2;
    const p = applyRot(v, rot, R * lift);
    glow(ctx, cx + p.x, cy + p.y, 10, color, 0.95 * opacity);
  }
}

type ArcSlot = {
  offset: number;
  period: number;
  dur: number;
  pairs: [number, number][];
};

function buildArcSlots(
  seed: number,
  count: number,
  period: number,
  dur: number,
  gap: number
): ArcSlot[] {
  const rnd = mulberry(seed);
  const slots: ArcSlot[] = [];
  for (let i = 0; i < count; i++) {
    const pairs: [number, number][] = [];
    for (let k = 0; k < 30; k++) {
      const a = Math.floor(rnd() * CITIES.length);
      let b = Math.floor(rnd() * CITIES.length);
      if (b === a) b = (b + 1) % CITIES.length;
      pairs.push([a, b]);
    }
    slots.push({ offset: i * gap, period, dur, pairs });
  }
  return slots;
}

type ArcCallback = (a: number, b: number, t01: number, fade: number) => void;

function runArcSlots(slots: ArcSlot[], t: number, cb: ArcCallback) {
  for (const slot of slots) {
    const cyc = Math.floor((t + slot.offset + 1000) / slot.period);
    const local = (t + slot.offset + 1000) % slot.period;
    if (local > slot.dur) continue;
    const fillT = slot.dur * 0.55;
    const t01 = Math.min(1, local / fillT);
    const fade =
      local > slot.dur * 0.78
        ? Math.max(0, 1 - (local - slot.dur * 0.78) / (slot.dur * 0.22))
        : Math.min(1, local / 0.3);
    const idx = ((cyc % slot.pairs.length) + slot.pairs.length) % slot.pairs.length;
    const [a, b] = slot.pairs[idx];
    cb(a, b, t01, fade);
  }
}

/* Cartoony scientist avatars that land on a city as funding arrives. The
   source images are square with the subject framed inside an inscribed circle,
   so clipping to a circle crops them cleanly. */
const AVATAR_SRCS = [
  '/globe-avatars/1.png',
  '/globe-avatars/2.png',
  '/globe-avatars/3.png',
  '/globe-avatars/4.png',
  '/globe-avatars/5.png',
  '/globe-avatars/6.png',
];
const AVATAR_COUNT = AVATAR_SRCS.length;

/* lucide FlaskConical path data (24x24 viewBox), used for the corner badge. */
const FLASK_PATH_DATA = [
  'M10 2v7.527a2 2 0 0 1-.211.896L4.72 20.55a1 1 0 0 0 .9 1.45h12.76a1 1 0 0 0 .9-1.45l-5.069-10.127A2 2 0 0 1 14 9.527V2',
  'M8.5 2h7',
  'M7 16h10',
];
let flaskPathCache: Path2D[] | null = null;
function getFlaskPaths(): Path2D[] {
  if (!flaskPathCache) flaskPathCache = FLASK_PATH_DATA.map((d) => new Path2D(d));
  return flaskPathCache;
}

/* A small orange flask badge that sits at the corner of a landed avatar. */
function drawFlaskBadge(ctx: Ctx, bx: number, by: number, br: number) {
  ctx.save();
  ctx.fillStyle = '#F97316';
  ctx.beginPath();
  ctx.arc(bx, by, br, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = Math.max(1.5, br * 0.18);
  ctx.beginPath();
  ctx.arc(bx, by, br, 0, TAU);
  ctx.stroke();
  const scale = (br * 1.3) / 24;
  ctx.translate(bx, by);
  ctx.scale(scale, scale);
  ctx.translate(-12, -12);
  ctx.strokeStyle = '#ffffff';
  ctx.fillStyle = '#ffffff';
  ctx.lineWidth = 2.3;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  for (const p of getFlaskPaths()) ctx.stroke(p);
  ctx.restore();
}

/* ─────────────────────────────────────────────────────────────────────────
   AnimatedGlobe
───────────────────────────────────────────────────────────────────────── */
interface Props {
  /** Diameter (square edge) of the globe scene in px. Default: 280 */
  size?: number;
  className?: string;
}

export default function AnimatedGlobe({ size = 280, className }: Props) {
  const { slots, ph, acts } = useMemo(() => {
    const rnd = mulberry(73);
    return {
      slots: buildArcSlots(73, 3, 7.5, 5.0, 2.2),
      ph: CITIES.map(() => rnd() * TAU),
      // Multiple landings can be live simultaneously.
      acts: [] as { t: number; city: number; avatar: number }[],
    };
  }, []);

  // Preload the avatar images once on the client; drawn onto the canvas as
  // funding lands on a city.
  const avatarsRef = useRef<HTMLImageElement[]>([]);
  useEffect(() => {
    avatarsRef.current = AVATAR_SRCS.map((src) => {
      const img = new Image();
      img.src = src;
      return img;
    });
  }, []);

  const draw = useCallback<DrawFn>(
    (ctx, t, w, h) => {
      const cx = w * 0.5;
      const cy = h * 0.5;
      const R = Math.min(w, h) * 0.4;
      const rot = makeRot(t * 0.35, -0.3);
      drawSphereFill(ctx, cx, cy, R);
      drawWireSphere(ctx, cx, cy, R, rot);
      ctx.strokeStyle = rgba(HS.blue, 0.85);
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, TAU);
      ctx.stroke();

      const FADE_IN = 0.85;
      const HOLD = 1.5;
      const FADE_OUT = 1.15;
      const LIFE = FADE_IN + HOLD + FADE_OUT;

      // Drop landings that have fully faded out.
      for (let k = acts.length - 1; k >= 0; k--) {
        if (t - acts[k].t > LIFE) acts.splice(k, 1);
      }

      runArcSlots(slots, t, (a, b, t01, fade) => {
        drawArcPath(ctx, cx, cy, R, rot, CITY_VEC[a], CITY_VEC[b], t01, HS.rsc, 0.95 * fade, 1.8);
        if (t01 >= 0.94) {
          const pv = applyRot(CITY_VEC[b], rot, R);
          // Only land if this city isn't already showing a live avatar.
          const already = acts.some((ac) => ac.city === b);
          if (pv.z >= 0.12 && !already) {
            acts.push({ t, city: b, avatar: (b * 7 + Math.floor(t)) % AVATAR_COUNT });
          }
        }
      });

      const activeCities = new Set(acts.map((ac) => ac.city));
      for (let i = 0; i < CITIES.length; i++) {
        if (activeCities.has(i)) continue;
        // Tier-1 hubs plus every other tier-2 city get an ambient dot.
        const tier = CITIES[i][3];
        if (tier >= 3) continue;
        if (tier === 2 && i % 2 !== 0) continue;
        drawCityDot(ctx, cx, cy, R, rot, CITY_VEC[i], tier, t, ph[i], HS.blueLt);
      }

      for (const ac of acts) {
        const age = t - ac.t;
        const p = applyRot(CITY_VEC[ac.city], rot, R);
        if (age > LIFE || p.z < 0) continue;
        const sx = cx + p.x;
        const sy = cy + p.y;
        let env: number;
        if (age < FADE_IN) env = age / FADE_IN;
        else if (age < FADE_IN + HOLD) env = 1;
        else env = Math.max(0, 1 - (age - FADE_IN - HOLD) / FADE_OUT);
        env = env * env * (3 - 2 * env);
        const chipR = 26 * (0.62 + 0.38 * env);
        if (age < FADE_IN) {
          ctx.strokeStyle = rgba(HS.rsc, 0.45 * (1 - age / FADE_IN));
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(sx, sy, chipR + age * 34, 0, TAU);
          ctx.stroke();
        }
        glow(ctx, sx, sy, chipR * 1.55, HS.rsc, 0.22 * env);
        ctx.save();
        ctx.globalAlpha = env;
        ctx.beginPath();
        ctx.arc(sx, sy, chipR, 0, TAU);
        ctx.closePath();
        ctx.clip();
        // On-brand backstop in case the avatar framing leaves a sliver.
        ctx.fillStyle = '#eef4ff';
        ctx.fillRect(sx - chipR, sy - chipR, chipR * 2, chipR * 2);
        const img = avatarsRef.current[ac.avatar];
        if (img && img.complete && img.naturalWidth > 0) {
          const d = chipR * 2;
          ctx.drawImage(img, sx - chipR, sy - chipR, d, d);
        }
        ctx.restore();
        // Brand ring around the avatar.
        ctx.globalAlpha = env;
        ctx.strokeStyle = rgba(HS.rsc, 0.9);
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(sx, sy, chipR, 0, TAU);
        ctx.stroke();
        // Flask badge tucked into the bottom-right corner.
        drawFlaskBadge(ctx, sx + chipR * 0.72, sy + chipR * 0.72, chipR * 0.4);
        ctx.globalAlpha = 1;
      }
    },
    [slots, ph, acts]
  );

  const canvasRef = useHeroCanvas(draw);

  return (
    <div
      className={className}
      style={{ position: 'relative', width: size, height: size }}
      role="img"
      aria-label="Wireframe globe; cities light up with running experiments as they receive funding"
    >
      <canvas
        ref={canvasRef}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block' }}
      />
    </div>
  );
}
