'use client';

import { useEffect, useRef } from 'react';

// Indigo cosmos palette (medium indigo → light periwinkle). Matches the hero's
// lowered indigo edge at the top and lifts toward light going down, so the
// dissolve reads as a soft indigo fade rather than a heavy dark band. Avoids
// the brand primary blue per design direction.
const COSMOS: Array<[number, number, number]> = [
  [26, 35, 94], // #1A235E - meets the hero's indigo bottom edge
  [40, 46, 120],
  [49, 46, 129], // #312E81
  [79, 70, 229], // #4F46E5
  [129, 140, 248], // #818CF8
  [199, 210, 254], // #C7D2FE
];

/**
 * A pixelated dark→light transition strip. Pinned to the top of a light section
 * sitting beneath the dark cosmos hero: the top rows are dense dark navy pixels
 * (matching the hero's night sky) that dissolve downward into the section via a
 * vertical mask, so the seam between the two sections is a pixel dissolve rather
 * than a hard line or a large gradient.
 */
export function CosmosPixelFade({ height = 120 }: { height?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const W = 80;
    const H = 11;
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const o1 = Math.random() * 6.28;
    const o2 = Math.random() * 6.28;
    const o3 = Math.random() * 6.28;

    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const nx = x / W;
        const ny = y / H;
        let v = 0;
        v += Math.sin(nx * 4.0 + ny * 2.6 + o1) * 0.55;
        v += Math.sin(nx * 1.7 - ny * 4.2 + o2) * 0.5;
        v += Math.cos(nx * 7.3 + ny * 5.1 + o3) * 0.28;
        v += Math.sin(nx * 11.0 - ny * 8.5) * 0.14;
        v += (Math.random() - 0.5) * 0.18;
        // Keep the top rows deepest so they meet the hero's indigo edge; lower
        // rows lift toward light periwinkle (and are masked out anyway).
        v += (ny - 0.4) * 0.85;
        const t = Math.max(0, Math.min(1, (v + 1.3) / 2.6));
        const f = t * (COSMOS.length - 1);
        const i = Math.floor(f);
        const k = f - i;
        const a = COSMOS[i];
        const b = COSMOS[Math.min(i + 1, COSMOS.length - 1)];
        const r = Math.round(a[0] * (1 - k) + b[0] * k);
        const g = Math.round(a[1] * (1 - k) + b[1] * k);
        const bl = Math.round(a[2] * (1 - k) + b[2] * k);
        ctx.fillStyle = `rgb(${r},${g},${bl})`;
        ctx.fillRect(x, y, 1, 1);
      }
    }
  }, []);

  return (
    <>
      <canvas ref={ref} className="give-cosmos-fade" aria-hidden="true" style={{ height }} />
      <style jsx>{`
        .give-cosmos-fade {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          width: 100%;
          image-rendering: pixelated;
          image-rendering: crisp-edges;
          z-index: 1;
          pointer-events: none;
          mask-image: linear-gradient(to bottom, #000 0%, rgba(0, 0, 0, 0.92) 18%, transparent 62%);
          -webkit-mask-image: linear-gradient(
            to bottom,
            #000 0%,
            rgba(0, 0, 0, 0.92) 18%,
            transparent 62%
          );
        }
      `}</style>
    </>
  );
}
