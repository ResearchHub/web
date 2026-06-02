'use client';

import { useEffect, useRef } from 'react';

type StarType = 'dust' | 'glow' | 'sparkle';

interface Star {
  x: number; // 0..1 of width
  y: number; // 0..1 of height
  r: number; // core radius px
  a: number; // base alpha
  color: string; // 'r,g,b'
  type: StarType;
  len: number; // spike length for sparkles
}

const WHITE = '255,255,255';
// Cool + warm accent tints, mirroring the reference (blue + occasional pink).
const TINTS = ['199,210,254', '147,197,253', '125,211,252', '244,114,182'];
const DUST_TINTS = ['255,255,255', '255,255,255', '199,210,254', '125,211,252', '94,234,212'];

const rgba = (c: string, a: number) => `rgba(${c},${a})`;
const TAU = Math.PI * 2;

function drawSpike(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  len: number,
  angle: number,
  color: string,
  width: number,
  alpha: number
) {
  const dx = Math.cos(angle);
  const dy = Math.sin(angle);
  const x1 = x - dx * len;
  const y1 = y - dy * len;
  const x2 = x + dx * len;
  const y2 = y + dy * len;
  const g = ctx.createLinearGradient(x1, y1, x2, y2);
  g.addColorStop(0, rgba(color, 0));
  g.addColorStop(0.5, rgba(color, alpha));
  g.addColorStop(1, rgba(color, 0));
  ctx.strokeStyle = g;
  ctx.lineWidth = width;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

function drawSparkle(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  len: number,
  color: string,
  a: number
) {
  // Soft halo.
  const g = ctx.createRadialGradient(x, y, 0, x, y, len * 0.95);
  g.addColorStop(0, rgba(color, 0.9 * a));
  g.addColorStop(0.22, rgba(color, 0.32 * a));
  g.addColorStop(1, rgba(color, 0));
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, len * 0.95, 0, TAU);
  ctx.fill();

  // Long vertical + horizontal flares, shorter diagonals for an 8-point sparkle.
  drawSpike(ctx, x, y, len, 0, color, 1.4, 0.9 * a);
  drawSpike(ctx, x, y, len, Math.PI / 2, color, 1.4, 0.9 * a);
  drawSpike(ctx, x, y, len * 0.5, Math.PI / 4, color, 1, 0.5 * a);
  drawSpike(ctx, x, y, len * 0.5, -Math.PI / 4, color, 1, 0.5 * a);

  // Bright white core.
  ctx.fillStyle = rgba(WHITE, Math.min(1, a + 0.1));
  ctx.beginPath();
  ctx.arc(x, y, 1.7, 0, TAU);
  ctx.fill();
}

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

/**
 * A cosmos backdrop: a field of static stars with soft glows and a handful of
 * bright diffraction-spike "sparkle" stars (blue/pink tints), painted to a
 * canvas. Redraws on resize only (no animation loop) so it stays cheap behind
 * the animated globe.
 */
export function Starfield({ density = 0.00024 }: { density?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Star[]>([]);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let w = 1;
    let h = 1;

    const build = () => {
      const area = w * h;
      const dustCount = Math.round(area * density);
      const glowCount = Math.round(dustCount * 0.06);
      const sparkleCount = clamp(Math.round(area * 0.0000055), 4, 12);
      const stars: Star[] = [];

      for (let i = 0; i < dustCount; i++) {
        stars.push({
          x: Math.random(),
          y: Math.random(),
          r: 0.3 + Math.random() * 0.95,
          a: 0.2 + Math.random() * 0.55,
          color: DUST_TINTS[(Math.random() * DUST_TINTS.length) | 0],
          type: 'dust',
          len: 0,
        });
      }
      for (let i = 0; i < glowCount; i++) {
        stars.push({
          x: Math.random(),
          y: Math.random(),
          r: 0.9 + Math.random() * 1.1,
          a: 0.5 + Math.random() * 0.4,
          color: Math.random() < 0.5 ? WHITE : TINTS[(Math.random() * TINTS.length) | 0],
          type: 'glow',
          len: 0,
        });
      }
      for (let i = 0; i < sparkleCount; i++) {
        // Mostly white/blue sparkles, occasional pink, with one larger hero star.
        const roll = Math.random();
        const color = roll < 0.55 ? WHITE : roll < 0.85 ? '199,210,254' : '244,114,182';
        stars.push({
          x: Math.random(),
          y: Math.random(),
          r: 1.6,
          a: 0.7 + Math.random() * 0.3,
          color,
          type: 'sparkle',
          len: 14 + Math.random() * 20,
        });
      }
      // One prominent hero sparkle, biased toward the upper area.
      stars.push({
        x: 0.2 + Math.random() * 0.6,
        y: 0.1 + Math.random() * 0.4,
        r: 2,
        a: 1,
        color: WHITE,
        type: 'sparkle',
        len: 40 + Math.random() * 18,
      });

      starsRef.current = stars;
    };

    const paint = () => {
      ctx.clearRect(0, 0, w, h);

      // Plain dust first (normal blending).
      ctx.globalCompositeOperation = 'source-over';
      for (const s of starsRef.current) {
        if (s.type !== 'dust') continue;
        ctx.fillStyle = rgba(s.color, s.a);
        ctx.beginPath();
        ctx.arc(s.x * w, s.y * h, s.r, 0, TAU);
        ctx.fill();
      }

      // Glows + sparkles add light on top.
      ctx.globalCompositeOperation = 'lighter';
      for (const s of starsRef.current) {
        const x = s.x * w;
        const y = s.y * h;
        if (s.type === 'glow') {
          const g = ctx.createRadialGradient(x, y, 0, x, y, s.r * 6);
          g.addColorStop(0, rgba(s.color, s.a));
          g.addColorStop(1, rgba(s.color, 0));
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(x, y, s.r * 6, 0, TAU);
          ctx.fill();
          ctx.fillStyle = rgba(WHITE, s.a);
          ctx.beginPath();
          ctx.arc(x, y, s.r * 0.7, 0, TAU);
          ctx.fill();
        } else if (s.type === 'sparkle') {
          drawSparkle(ctx, x, y, s.len, s.color, s.a);
        }
      }
      ctx.globalCompositeOperation = 'source-over';
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      w = Math.max(1, rect.width);
      h = Math.max(1, rect.height);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      build();
      paint();
    };

    resize();
    let ro: ResizeObserver | null = null;
    if (window.ResizeObserver) {
      ro = new ResizeObserver(resize);
      ro.observe(canvas);
    } else {
      window.addEventListener('resize', resize);
    }
    return () => {
      if (ro) ro.disconnect();
      else window.removeEventListener('resize', resize);
    };
  }, [density]);

  return (
    <>
      <canvas ref={ref} className="give-starfield" aria-hidden="true" />
      <style jsx>{`
        .give-starfield {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          z-index: 0;
          pointer-events: none;
        }
      `}</style>
    </>
  );
}
