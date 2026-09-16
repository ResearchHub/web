'use client';

import { useEffect, useRef } from 'react';

interface MeshPoint {
  x: number;
  y: number;
  r: number;
  bright: boolean;
}

const TAU = Math.PI * 2;

/**
 * A structured "connection mesh" backdrop for the referral hero: a jittered
 * grid of nodes joined by faint links between near neighbors. Distinct from the
 * give hero's random Starfield, it reinforces the page's referral-network theme
 * at the background level. Static (redraws on resize only) so it stays cheap
 * behind the animated network graphic.
 */
export function ReferralMesh({ spacing = 132 }: { spacing?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const pointsRef = useRef<MeshPoint[]>([]);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let w = 1;
    let h = 1;

    const build = () => {
      const cols = Math.ceil(w / spacing) + 1;
      const rows = Math.ceil(h / spacing) + 1;
      const points: MeshPoint[] = [];
      for (let i = 0; i <= cols; i++) {
        for (let j = 0; j <= rows; j++) {
          // Jitter each node off its grid slot so links read organically.
          const jitter = spacing * 0.34;
          points.push({
            x: i * spacing + (Math.random() - 0.5) * 2 * jitter,
            y: j * spacing + (Math.random() - 0.5) * 2 * jitter,
            r: 0.8 + Math.random() * 1.4,
            bright: Math.random() < 0.12,
          });
        }
      }
      pointsRef.current = points;
    };

    const paint = () => {
      ctx.clearRect(0, 0, w, h);
      const points = pointsRef.current;
      const maxDist = spacing * 1.32;

      // Links between near neighbors.
      ctx.lineWidth = 1;
      for (let a = 0; a < points.length; a++) {
        for (let b = a + 1; b < points.length; b++) {
          const dx = points[a].x - points[b].x;
          const dy = points[a].y - points[b].y;
          const dist = Math.hypot(dx, dy);
          if (dist > maxDist) continue;
          const t = 1 - dist / maxDist;
          ctx.strokeStyle = `rgba(147,197,253,${0.04 + t * 0.14})`;
          ctx.beginPath();
          ctx.moveTo(points[a].x, points[a].y);
          ctx.lineTo(points[b].x, points[b].y);
          ctx.stroke();
        }
      }

      // Nodes.
      for (const p of points) {
        if (p.bright) {
          const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 6);
          g.addColorStop(0, 'rgba(199,210,254,0.85)');
          g.addColorStop(1, 'rgba(199,210,254,0)');
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r * 6, 0, TAU);
          ctx.fill();
        }
        ctx.fillStyle = p.bright ? 'rgba(224,236,255,0.95)' : 'rgba(147,197,253,0.42)';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, TAU);
        ctx.fill();
      }
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
  }, [spacing]);

  return (
    <>
      <canvas ref={ref} className="referral-mesh" aria-hidden="true" />
      <style jsx>{`
        .referral-mesh {
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
