'use client';

import { useEffect, useRef } from 'react';

interface PixelBackdropProps {
  /**
   * When true, render an "inverted" palette suited for dark backgrounds:
   * transparent → bright white/blue highlights instead of off-white → brand blue.
   * Pixels are also masked from the LEFT side (so they congregate on the right),
   * mirroring the hero treatment.
   */
  inverse?: boolean;
  /**
   * Where the pixels should concentrate. Defaults to 'right' (matching the
   * hero). 'bottom-right' / 'bottom-left' / 'top-left' / 'top-right' cluster
   * them into a single corner so they accent rather than dominate the section.
   */
  side?: 'left' | 'right' | 'full' | 'bottom-right' | 'bottom-left' | 'top-left' | 'top-right';
  /**
   * Color family for the pixels. Defaults to `blue` (matches the brand hero).
   * `emerald` is used by sections themed around the endowment / yield product.
   */
  tone?: 'blue' | 'emerald';
  className?: string;
}

const LIGHT_PALETTE: Array<[number, number, number]> = [
  [248, 250, 255],
  [239, 244, 255],
  [219, 234, 254],
  [191, 219, 254],
  [147, 197, 253],
  [96, 165, 250],
  [57, 113, 255],
];

// Emerald light palette: off-white → brand emerald. Mirrors LIGHT_PALETTE's
// progression so corner-mode masks read identically. The only difference is
// the hue. Used on light cards themed around the endowment.
const EMERALD_LIGHT_PALETTE: Array<[number, number, number]> = [
  [248, 252, 250],
  [236, 253, 245],
  [209, 250, 229],
  [167, 243, 208],
  [110, 231, 183],
  [52, 211, 153],
  [16, 185, 129],
];

// Inverse palette: dark navy → near-white through bright sky blues.
// Designed to sit on top of the band's dark gradient and read as a soft
// pixel-glow rather than competing color blocks.
const DARK_PALETTE: Array<[number, number, number]> = [
  [11, 21, 48],
  [30, 58, 138],
  [37, 99, 235],
  [57, 113, 255],
  [96, 165, 250],
  [147, 197, 253],
  [255, 255, 255],
];

const EMERALD_DARK_PALETTE: Array<[number, number, number]> = [
  [6, 35, 25],
  [6, 78, 59],
  [4, 120, 87],
  [5, 150, 105],
  [16, 185, 129],
  [110, 231, 183],
  [255, 255, 255],
];

export function PixelBackdrop({
  inverse = false,
  side = 'right',
  tone = 'blue',
  className,
}: Readonly<PixelBackdropProps>) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const W = 80;
    const H = 50;
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const stops =
      tone === 'emerald'
        ? inverse
          ? EMERALD_DARK_PALETTE
          : EMERALD_LIGHT_PALETTE
        : inverse
          ? DARK_PALETTE
          : LIGHT_PALETTE;

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
        // Bias: light variant biases darker on the right (tree side);
        // inverse variant biases brighter on the opposite side so the two
        // sections feel like mirror images of each other. Corner modes push
        // the densest noise into a single corner.
        if (side === 'right') {
          v += (nx - 0.4) * 1.2;
        } else if (side === 'left') {
          v += (0.6 - nx) * 1.2;
        } else if (side === 'bottom-right') {
          v += (nx - 0.5) * 1.0 + (ny - 0.5) * 1.0;
        } else if (side === 'bottom-left') {
          v += (0.5 - nx) * 1.0 + (ny - 0.5) * 1.0;
        } else if (side === 'top-left') {
          v += (0.5 - nx) * 1.0 + (0.5 - ny) * 1.0;
        } else if (side === 'top-right') {
          v += (nx - 0.5) * 1.0 + (0.5 - ny) * 1.0;
        }
        const t = Math.max(0, Math.min(1, (v + 1.3) / 2.6));
        const f = t * (stops.length - 1);
        const i = Math.floor(f);
        const k = f - i;
        const a = stops[i];
        const b = stops[Math.min(i + 1, stops.length - 1)];
        const r = Math.round(a[0] * (1 - k) + b[0] * k);
        const g = Math.round(a[1] * (1 - k) + b[1] * k);
        const bl = Math.round(a[2] * (1 - k) + b[2] * k);
        ctx.fillStyle = `rgb(${r},${g},${bl})`;
        ctx.fillRect(x, y, 1, 1);
      }
    }
  }, [inverse, side, tone]);

  const maskGradient =
    side === 'right'
      ? `linear-gradient(
            90deg,
            transparent 0%,
            rgba(0, 0, 0, 0.25) 18%,
            rgba(0, 0, 0, 0.6) 35%,
            rgba(0, 0, 0, 1) 50%,
            rgba(0, 0, 0, 1) 100%
          )`
      : side === 'left'
        ? `linear-gradient(
            270deg,
            transparent 0%,
            rgba(0, 0, 0, 0.25) 18%,
            rgba(0, 0, 0, 0.6) 35%,
            rgba(0, 0, 0, 1) 50%,
            rgba(0, 0, 0, 1) 100%
          )`
        : 'linear-gradient(90deg, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 100%)';

  // Where the soft halo sits (the masked area where pixels are visible).
  const ellipseAnchor =
    side === 'right'
      ? '65% 50%'
      : side === 'left'
        ? '35% 50%'
        : side === 'bottom-right'
          ? '88% 92%'
          : side === 'bottom-left'
            ? '12% 92%'
            : side === 'top-left'
              ? '12% 8%'
              : side === 'top-right'
                ? '88% 8%'
                : '50% 50%';

  const isCorner =
    side === 'bottom-right' ||
    side === 'bottom-left' ||
    side === 'top-left' ||
    side === 'top-right';

  // Corner modes use only a tight radial mask so the pixelation reads as a
  // single corner accent instead of spanning the section.
  const radialMask = isCorner
    ? `radial-gradient(
            ellipse 55% 70% at ${ellipseAnchor},
            rgba(0, 0, 0, 1) 0%,
            rgba(0, 0, 0, 0.6) 45%,
            transparent 80%
          )`
    : `radial-gradient(
            ellipse 90% 90% at ${ellipseAnchor},
            rgba(0, 0, 0, 1) 60%,
            transparent 100%
          )`;

  const maskImage = isCorner ? radialMask : `${maskGradient}, ${radialMask}`;

  const opacity = inverse ? 0.55 : 0.9;
  const blendMode = inverse ? 'screen' : 'normal';

  return (
    <>
      <canvas
        ref={ref}
        className={`endowment-pixel-bg${className ? ` ${className}` : ''}`}
        aria-hidden="true"
        style={{
          opacity,
          mixBlendMode: blendMode as any,
        }}
      />
      <style jsx>{`
        .endowment-pixel-bg {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          image-rendering: pixelated;
          image-rendering: crisp-edges;
          z-index: 0;
          pointer-events: none;
          mask-image: ${maskImage};
          mask-composite: intersect;
          -webkit-mask-image: ${maskImage};
          -webkit-mask-composite: source-in;
        }
      `}</style>
    </>
  );
}
