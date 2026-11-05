'use client';

import { useEffect, useRef } from 'react';

interface Point {
  x: number;
  y: number;
}

interface Bolt {
  main: Point[];
  branches: Point[][];
}

interface Pulse {
  offset: number;
  peak: number;
}

/**
 * Randomly walks a jagged polyline across the hero. Most bolts fall from the
 * sky; some arc upward out of the substation itself so it reads as "alive".
 */
function generateBolt(width: number, height: number): Bolt {
  const fromSky = Math.random() < 0.7;
  const dir = fromSky ? 1 : -1;
  const startX = width * (0.08 + Math.random() * 0.84);
  const startY = fromSky ? -12 : height * (0.72 + Math.random() * 0.2);
  const endY = fromSky
    ? height * (0.5 + Math.random() * 0.4)
    : height * (0.05 + Math.random() * 0.2);

  const main: Point[] = [{ x: startX, y: startY }];
  const seg = height / (16 + Math.random() * 10);
  let x = startX;
  let y = startY;
  let guard = 0;
  while ((dir === 1 ? y < endY : y > endY) && guard++ < 64) {
    x += (Math.random() - 0.5) * seg * 1.7;
    y += dir * seg * (0.65 + Math.random() * 0.6);
    main.push({ x, y });
  }

  const branches: Point[][] = [];
  const branchCount = 1 + Math.floor(Math.random() * 3);
  for (let i = 0; i < branchCount && main.length >= 5; i++) {
    const origin = main[2 + Math.floor(Math.random() * (main.length - 4))];
    const bDir = Math.random() < 0.5 ? -1 : 1;
    const bSeg = seg * 0.65;
    const branch: Point[] = [{ x: origin.x, y: origin.y }];
    let bx = origin.x;
    let by = origin.y;
    const steps = 2 + Math.floor(Math.random() * 4);
    for (let s = 0; s < steps; s++) {
      bx += bDir * bSeg * (0.4 + Math.random() * 0.8);
      by += dir * bSeg * (0.5 + Math.random() * 0.5);
      branch.push({ x: bx, y: by });
    }
    branches.push(branch);
  }

  return { main, branches };
}

/**
 * Canvas layer that fires random purple/indigo lightning strikes across the
 * substation hero: a jagged bolt with branches, a flicker envelope of 1-3
 * pulses per strike, and a soft indigo flash. Idle (and cheap) between
 * strikes; disabled entirely under prefers-reduced-motion.
 */
export function SubstationLightning() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf = 0;
    let w = 0;
    let h = 0;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = rect.width;
      h = rect.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    let bolt: Bolt | null = null;
    let strikeStart = 0;
    let strikeTtl = 0;
    let pulses: Pulse[] = [];
    let nextStrikeAt = performance.now() + 700 + Math.random() * 1800;

    const strike = (now: number) => {
      bolt = generateBolt(w, h);
      strikeStart = now;
      strikeTtl = 380 + Math.random() * 420;
      const pulseCount = 1 + Math.floor(Math.random() * 3);
      pulses = Array.from({ length: pulseCount }, (_, i) => ({
        offset: i * (90 + Math.random() * 120),
        peak: 0.55 + Math.random() * 0.45,
      }));
      nextStrikeAt = now + strikeTtl + 900 + Math.random() * 4200;
    };

    const intensityAt = (now: number) => {
      const elapsed = now - strikeStart;
      if (!bolt || elapsed < 0 || elapsed > strikeTtl) return 0;
      let v = 0;
      for (const p of pulses) {
        const t = elapsed - p.offset;
        if (t < 0 || t > 140) continue;
        v = Math.max(v, p.peak * (1 - t / 140));
      }
      return v;
    };

    const strokePath = (
      pts: Point[],
      width: number,
      style: string,
      blur: number,
      blurColor: string
    ) => {
      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
      ctx.lineWidth = width;
      ctx.strokeStyle = style;
      ctx.shadowBlur = blur;
      ctx.shadowColor = blurColor;
      ctx.stroke();
      ctx.shadowBlur = 0;
    };

    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      if (now >= nextStrikeAt) strike(now);

      ctx.clearRect(0, 0, w, h);
      const intensity = intensityAt(now);
      if (!bolt || intensity <= 0.01) return;

      ctx.globalCompositeOperation = 'lighter';

      const fx = bolt.main[0].x;
      const fy = Math.min(h * 0.4, bolt.main[bolt.main.length - 1].y);
      const flash = ctx.createRadialGradient(fx, fy, 0, fx, fy, Math.max(w, h) * 0.7);
      flash.addColorStop(0, `rgba(129, 140, 248, ${0.16 * intensity})`);
      flash.addColorStop(1, 'rgba(129, 140, 248, 0)');
      ctx.fillStyle = flash;
      ctx.fillRect(0, 0, w, h);

      strokePath(
        bolt.main,
        6,
        `rgba(99, 102, 241, ${0.28 * intensity})`,
        30,
        'rgba(139, 92, 246, 0.8)'
      );
      strokePath(
        bolt.main,
        2.75,
        `rgba(167, 139, 250, ${0.75 * intensity})`,
        18,
        'rgba(167, 139, 250, 0.9)'
      );
      strokePath(
        bolt.main,
        1.25,
        `rgba(245, 240, 255, ${0.95 * intensity})`,
        8,
        'rgba(237, 233, 254, 0.95)'
      );

      for (const branch of bolt.branches) {
        strokePath(
          branch,
          3.5,
          `rgba(129, 140, 248, ${0.2 * intensity})`,
          20,
          'rgba(139, 92, 246, 0.7)'
        );
        strokePath(
          branch,
          1.5,
          `rgba(196, 181, 253, ${0.6 * intensity})`,
          10,
          'rgba(196, 181, 253, 0.8)'
        );
      }

      ctx.globalCompositeOperation = 'source-over';
    };

    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <>
      <canvas ref={canvasRef} className="substation-lightning" aria-hidden="true" />
      <style jsx>{`
        .substation-lightning {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          z-index: 1;
          pointer-events: none;
          mix-blend-mode: screen;
        }
      `}</style>
    </>
  );
}
