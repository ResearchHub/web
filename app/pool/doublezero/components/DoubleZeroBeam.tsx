'use client';

import { useEffect, useRef } from 'react';
import {
  CENTRAL_ANGLE,
  CENTRAL_ANGLE_DEG,
  CHORD_KM,
  CHORD_MS,
  FIBER_INDEX,
  RX_SITE,
  SHELL_CROSSINGS,
  SHELL_RADII,
  SURFACE_KM,
  SURFACE_MS,
  TX_SITE,
  formatKm,
  formatMs,
} from '../link';

/** Wall-clock length of one race, and the pause on the finished frame after it. */
const RUN_MS = 3400;
const HOLD_MS = 1700;
const CYCLE_MS = RUN_MS + HOLD_MS;
const SLOWDOWN = Math.round(RUN_MS / SURFACE_MS);

/** Where the chord packet's head sits when the fiber pulse finally lands. */
const CHORD_ARRIVES_AT = RUN_MS * (CHORD_MS / SURFACE_MS);

const GREEN = '41, 249, 31';
const CYAN = '99, 200, 255';
const GRAY = '158, 158, 158';
const HOT = '214, 255, 206';

const LAUNCH_MS = 560;
const RIPPLE_MS = 460;
const DETECT_MS = 1100;

/** Length of the neutrino burst as a fraction of the chord. */
const PACKET_SPAN = 0.15;
const PARTICLE_COUNT = 20;

interface Particle {
  /** How far behind the burst head this one rides, 0-1 of `PACKET_SPAN`. */
  lag: number;
  /** Lateral scatter across the beam, -1 to 1. */
  lane: number;
  /** Relative brightness and size, so the bolt has texture instead of a row of dots. */
  weight: number;
  /** The two that actually interact in the detector. Everything else misses. */
  detected: boolean;
}

/**
 * Fixed rather than random: the burst should look identical every cycle, and
 * identical between server and client.
 */
const PARTICLES: Particle[] = Array.from({ length: PARTICLE_COUNT }, (_, i) => {
  const hash = (seed: number) => {
    const n = Math.sin(seed) * 43758.5453;
    return n - Math.floor(n);
  };
  const lag = i / (PARTICLE_COUNT - 1);
  return {
    lag,
    lane: hash((i + 1) * 12.9898) * 2 - 1,
    // The leading edge of a burst is the dense part; the tail thins out.
    weight: (0.45 + hash((i + 1) * 78.233) * 0.55) * (1 - lag * 0.55),
    detected: i === 3 || i === 11,
  };
});

/**
 * The argument the whole RFP rests on, drawn to scale.
 *
 * One cross-section of the Earth through Madrid and Wellington — antipodes, so
 * the chord is a diameter and the surface route is a full half-circumference.
 * Both routes are released at once. Fiber has to follow the surface and crawls
 * through glass at c/1.47; a neutrino burst takes the chord at c, punching
 * through the mantle, the outer core and the inner core as if none of it were
 * there. It lands at 42.5 ms and then waits 55 ms for the cable.
 *
 * The burst also shows the other half of the problem: almost every particle
 * sails straight through the detector without interacting. Two register.
 */
export function DoubleZeroBeam() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chordClockRef = useRef<HTMLSpanElement>(null);
  const surfaceClockRef = useRef<HTMLSpanElement>(null);
  const deltaRef = useRef<HTMLParagraphElement>(null);
  const deltaValueRef = useRef<HTMLSpanElement>(null);
  const chordRowRef = useRef<HTMLDivElement>(null);
  const surfaceRowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

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

    const pixel = (x: number, y: number, size: number, fill: string) => {
      ctx.fillStyle = fill;
      const s = Math.max(1, Math.round(size));
      ctx.fillRect(Math.round(x - s / 2), Math.round(y - s / 2), s, s);
    };

    /** A square halo, so the bloom stays inside the pixel-art vocabulary. */
    const bloom = (x: number, y: number, size: number, rgb: string, alpha: number) => {
      pixel(x, y, size + 8, `rgba(${rgb}, ${alpha * 0.05})`);
      pixel(x, y, size + 4, `rgba(${rgb}, ${alpha * 0.12})`);
      pixel(x, y, size + 2, `rgba(${rgb}, ${alpha * 0.28})`);
    };

    const ring = (x: number, y: number, radius: number, stroke: string, width: number) => {
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.strokeStyle = stroke;
      ctx.lineWidth = width;
      ctx.stroke();
    };

    const draw = (elapsed: number) => {
      if (w === 0 || h === 0) return;

      const simMs = (Math.min(elapsed, RUN_MS) / RUN_MS) * SURFACE_MS;
      const headChord = simMs / CHORD_MS;
      const headSurface = simMs / SURFACE_MS;
      const launch = elapsed < LAUNCH_MS ? 1 - elapsed / LAUNCH_MS : 0;
      const detect =
        elapsed >= CHORD_ARRIVES_AT ? Math.max(0, 1 - (elapsed - CHORD_ARRIVES_AT) / DETECT_MS) : 0;
      const flashSurface = elapsed >= RUN_MS ? Math.max(0, 1 - (elapsed - RUN_MS) / 900) : 0;
      /** The dead time the whole pitch is about: chord in, cable still coming. */
      const waiting = headChord >= 1 && headSurface < 1;

      // --- layout -------------------------------------------------------
      const padY = 34;
      const padX = 34;
      const R = Math.max(40, Math.min((w - padX * 2) / 2, (h - padY * 2) / 2));
      const cx = w / 2;
      const cy = padY + R;
      const half = CENTRAL_ANGLE / 2;
      const ex = R * Math.sin(half);
      const ey = R * Math.cos(half);
      const txx = cx - ex;
      const rxx = cx + ex;
      const chordY = cy - ey;
      const span = rxx - txx;
      const angleTx = -Math.PI / 2 - half;
      const angleRx = -Math.PI / 2 + half;

      ctx.clearRect(0, 0, w, h);

      // --- pixel grid backdrop ------------------------------------------
      ctx.fillStyle = 'rgba(148, 163, 184, 0.06)';
      for (let y = 6; y < h; y += 14) {
        for (let x = 6; x < w; x += 14) ctx.fillRect(x, y, 1, 1);
      }

      // --- the Earth, in shells -----------------------------------------
      // Flat bands rather than a smooth gradient: this is a cross-section, and
      // discrete shells keep the boundaries the beam punches through legible.
      const bands: [number, string][] = [
        [1, '#101a33'],
        [SHELL_RADII[0], '#182545'],
        [SHELL_RADII[1], '#4a2436'],
        [SHELL_RADII[2], '#96311f'],
      ];
      for (const [frac, fill] of bands) {
        ctx.beginPath();
        ctx.arc(cx, cy, R * frac, 0, Math.PI * 2);
        ctx.fillStyle = fill;
        ctx.fill();
      }

      // Just enough heat bleeding off the core to stop the bands looking inert.
      ctx.globalCompositeOperation = 'lighter';
      const heat = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 0.5);
      heat.addColorStop(0, 'rgba(255, 108, 48, 0.26)');
      heat.addColorStop(0.42, 'rgba(190, 62, 40, 0.1)');
      heat.addColorStop(1, 'rgba(190, 62, 40, 0)');
      ctx.fillStyle = heat;
      ctx.fillRect(cx - R * 0.5, cy - R * 0.5, R, R);
      ctx.globalCompositeOperation = 'source-over';

      ctx.setLineDash([2, 4]);
      for (const frac of SHELL_RADII) {
        ring(cx, cy, R * frac, 'rgba(203, 213, 225, 0.3)', 1);
      }
      ctx.setLineDash([]);
      ring(cx, cy, R, 'rgba(203, 213, 225, 0.42)', 1.25);

      // --- the beam punching through each boundary ------------------------
      // Every shell the chord meets rings like struck metal as the burst
      // crosses it. Six crossings: three going in, three coming out.
      ctx.globalCompositeOperation = 'lighter';
      for (const crossing of SHELL_CROSSINGS) {
        const age = elapsed - crossing.at * CHORD_ARRIVES_AT;
        if (age < 0 || age > RIPPLE_MS) continue;
        const k = 1 - age / RIPPLE_MS;
        ring(cx, cy, R * SHELL_RADII[crossing.shell], `rgba(${GREEN}, ${0.42 * k})`, 1.4);
        const px = txx + span * crossing.at;
        ring(px, chordY, 3 + (1 - k) * 15, `rgba(${HOT}, ${0.6 * k * k})`, 1.2);
      }

      // The centre lights up as the burst crosses the inner core.
      const ignite = Math.max(0, 1 - Math.abs(headChord - 0.5) / 0.24);
      if (ignite > 0) {
        const core = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 0.42);
        core.addColorStop(0, `rgba(${HOT}, ${0.5 * ignite * ignite})`);
        core.addColorStop(0.45, `rgba(${GREEN}, ${0.16 * ignite})`);
        core.addColorStop(1, `rgba(${GREEN}, 0)`);
        ctx.fillStyle = core;
        ctx.fillRect(cx - R * 0.42, cy - R * 0.42, R * 0.84, R * 0.84);
      }
      ctx.globalCompositeOperation = 'source-over';

      // --- route A: around the surface ----------------------------------
      ctx.setLineDash([2, 5]);
      ctx.beginPath();
      ctx.arc(cx, cy, R, angleTx, angleRx);
      ctx.strokeStyle = `rgba(${GRAY}, 0.6)`;
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.setLineDash([]);

      if (headSurface > 0) {
        // Stroked in segments so the trail can fade out behind the pulse.
        const travelled = Math.min(1, headSurface);
        const sweep = angleRx - angleTx;
        const steps = 30;
        for (let i = 0; i < steps; i++) {
          const a = (i / steps) * travelled;
          const b = ((i + 1) / steps) * travelled;
          ctx.beginPath();
          ctx.arc(cx, cy, R, angleTx + sweep * a, angleTx + sweep * b);
          ctx.strokeStyle = `rgba(${CYAN}, ${0.18 + 0.62 * (i / steps) ** 2})`;
          ctx.lineWidth = 1.6 + 0.9 * (i / steps);
          ctx.stroke();
        }

        const ha = angleTx + sweep * travelled;
        const hx = cx + R * Math.cos(ha);
        const hy = cy + R * Math.sin(ha);
        ctx.globalCompositeOperation = 'lighter';
        bloom(hx, hy, 5, CYAN, 1);
        ctx.globalCompositeOperation = 'source-over';
        pixel(hx, hy, 5, '#e8f6ff');
      }

      // --- route B: straight through ------------------------------------
      // Dashed like the surface route, so the solid wake behind the burst is
      // the only thing that reads as distance actually covered.
      ctx.setLineDash([2, 5]);
      ctx.beginPath();
      ctx.moveTo(txx, chordY);
      ctx.lineTo(rxx, chordY);
      ctx.strokeStyle = `rgba(${GREEN}, 0.3)`;
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.setLineDash([]);

      if (headChord > 0) {
        const wake = Math.min(1, headChord);
        const trail = ctx.createLinearGradient(txx, 0, txx + span * wake, 0);
        trail.addColorStop(0, `rgba(${GREEN}, 0.12)`);
        trail.addColorStop(0.65, `rgba(${GREEN}, 0.5)`);
        trail.addColorStop(1, `rgba(${GREEN}, 0.95)`);
        ctx.beginPath();
        ctx.moveTo(txx, chordY);
        ctx.lineTo(txx + span * wake, chordY);
        ctx.strokeStyle = trail;
        ctx.lineWidth = 2.5;
        ctx.stroke();
      }

      // --- the burst ----------------------------------------------------
      ctx.globalCompositeOperation = 'lighter';

      // One wide bloom carried by the leading edge, so the bolt has a hot head
      // instead of every particle glowing its own halo into a green smear.
      if (headChord > 0 && headChord < 1.3) {
        const hx = txx + span * Math.min(1, headChord);
        const halo = ctx.createRadialGradient(hx, chordY, 0, hx, chordY, 26);
        halo.addColorStop(0, `rgba(${HOT}, 0.32)`);
        halo.addColorStop(0.35, `rgba(${GREEN}, 0.16)`);
        halo.addColorStop(1, `rgba(${GREEN}, 0)`);
        ctx.fillStyle = halo;
        ctx.fillRect(hx - 26, chordY - 26, 52, 52);
      }

      for (const p of PARTICLES) {
        const u = headChord - p.lag * PACKET_SPAN;
        if (u <= 0) continue;
        // Detected particles stop in the receiver; the rest keep going and
        // leave the Earth on the far side without ever interacting.
        const stopped = p.detected && u >= 1;
        const at = stopped ? 1 : u;
        if (at > 1.34) continue;
        const fade = stopped ? 1 : at > 1 ? 1 - (at - 1) / 0.34 : 1;
        const b = p.weight * fade;
        const x = txx + span * at;
        // The bundle spreads a little as it goes, the way a real beam would.
        const y = chordY + p.lane * (0.7 + at * 1.9);
        const size = stopped ? 4 : 1.6 + p.weight * 1.8;

        // A short streak behind each one, so they read as travelling at c
        // rather than sitting still.
        if (!stopped) {
          for (let k = 3; k >= 1; k--) {
            pixel(x - k * 2.6, y, size - k * 0.45, `rgba(${GREEN}, ${(b * 0.3) / k})`);
          }
        }
        pixel(x, y, size + 2, `rgba(${GREEN}, ${0.14 * b})`);
        pixel(x, y, size, `rgba(${GREEN}, ${0.95 * b})`);
        pixel(x, y, size - 1.4, `rgba(${HOT}, ${0.98 * b})`);
      }
      ctx.globalCompositeOperation = 'source-over';

      // --- endpoints ----------------------------------------------------
      pixel(txx, chordY, 11, '#0a0f1c');
      pixel(txx, chordY, 9, '#4256ff');
      pixel(rxx, chordY, 11, '#0a0f1c');
      pixel(rxx, chordY, 9, '#ff2f2f');

      ctx.globalCompositeOperation = 'lighter';

      // Launch: the source kicks, and a shell of light leaves with the burst.
      if (launch > 0) {
        ring(txx, chordY, 8 + (1 - launch) * 30, `rgba(${HOT}, ${0.55 * launch})`, 1.6);
        ring(txx, chordY, 8 + (1 - launch) * 16, `rgba(${GREEN}, ${0.45 * launch})`, 1.2);
        bloom(txx, chordY, 10, HOT, launch);
      }

      // Detection: two particles out of the whole burst land, and it shows.
      if (detect > 0) {
        const k = detect;
        const spikes = 8;
        ctx.strokeStyle = `rgba(${HOT}, ${0.7 * k * k})`;
        ctx.lineWidth = 1.4;
        for (let i = 0; i < spikes; i++) {
          const a = (i / spikes) * Math.PI * 2;
          const inner = 7;
          const outer = 10 + (1 - k) * 26;
          ctx.beginPath();
          ctx.moveTo(rxx + Math.cos(a) * inner, chordY + Math.sin(a) * inner);
          ctx.lineTo(rxx + Math.cos(a) * outer, chordY + Math.sin(a) * outer);
          ctx.stroke();
        }
        ring(rxx, chordY, 9 + (1 - k) * 30, `rgba(${GREEN}, ${0.75 * k})`, 2);
        bloom(rxx, chordY, 11, HOT, k);
        pixel(rxx, chordY, 9, `rgba(${HOT}, ${k})`);
      }

      // While the cable is still in flight, the receiver holds a green light.
      if (waiting) {
        const beat = 0.55 + 0.45 * Math.sin(elapsed / 130);
        ring(rxx, chordY, 13, `rgba(${GREEN}, ${0.3 * beat})`, 1.2);
      }

      if (flashSurface > 0) {
        ring(rxx, chordY, 9 + (1 - flashSurface) * 18, `rgba(${CYAN}, ${0.6 * flashSurface})`, 1.5);
      }
      ctx.globalCompositeOperation = 'source-over';

      // --- the two labels off the DoubleZero banner ---------------------
      ctx.font = '11px ui-monospace, SFMono-Regular, Menlo, monospace';
      ctx.textAlign = 'center';
      ctx.fillStyle = `rgba(${GRAY}, 0.9)`;
      ctx.fillText('the long way around', cx, cy - R - 13);
      ctx.fillStyle = `rgba(${GREEN}, 0.95)`;
      ctx.fillText('the short way through', cx, cy + R + 22);

      // --- readouts -----------------------------------------------------
      const gap = Math.max(0, simMs - CHORD_MS);
      if (chordClockRef.current) {
        chordClockRef.current.textContent = formatMs(Math.min(simMs, CHORD_MS));
      }
      if (surfaceClockRef.current) {
        surfaceClockRef.current.textContent = formatMs(simMs);
      }
      if (deltaValueRef.current) deltaValueRef.current.textContent = formatMs(gap);
      deltaRef.current?.classList.toggle('dz-beam-counting', waiting);
      chordRowRef.current?.classList.toggle('dz-beam-landed', simMs >= CHORD_MS);
      surfaceRowRef.current?.classList.toggle('dz-beam-landed', simMs >= SURFACE_MS);
    };

    const observer = new ResizeObserver(() => {
      resize();
      draw(CYCLE_MS);
    });
    observer.observe(canvas);
    resize();

    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      // One finished frame: the whole argument, minus the motion.
      draw(CYCLE_MS);
      return () => observer.disconnect();
    }

    let raf = 0;
    let start = 0;
    const frame = (now: number) => {
      if (!start) start = now;
      draw((now - start) % CYCLE_MS);
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
    };
  }, []);

  return (
    <figure className="dz-beam">
      <figcaption className="dz-beam-head">
        <span className="dz-beam-route">
          {TX_SITE.name} → {RX_SITE.name}
        </span>
        <span className="dz-beam-slow">
          {CENTRAL_ANGLE_DEG.toFixed(1)}° apart · slowed {SLOWDOWN}×
        </span>
      </figcaption>

      <div className="dz-beam-stage">
        <canvas ref={canvasRef} className="dz-beam-canvas" aria-hidden="true" />
      </div>

      <div className="dz-beam-readouts">
        <div className="dz-beam-row dz-beam-row-chord" ref={chordRowRef}>
          <span className="dz-beam-swatch" aria-hidden />
          <span className="dz-beam-name">
            Neutrino chord
            <em>{formatKm(CHORD_KM)} · through the inner core · at c</em>
          </span>
          <span className="dz-beam-clock">
            <span ref={chordClockRef}>0.0</span>
            <i>ms</i>
          </span>
        </div>

        <div className="dz-beam-row dz-beam-row-surface" ref={surfaceRowRef}>
          <span className="dz-beam-swatch" aria-hidden />
          <span className="dz-beam-name">
            Surface fiber
            <em>
              {formatKm(SURFACE_KM)} · great circle · n = {FIBER_INDEX}
            </em>
          </span>
          <span className="dz-beam-clock">
            <span ref={surfaceClockRef}>0.0</span>
            <i>ms</i>
          </span>
        </div>

        <p className="dz-beam-delta" ref={deltaRef}>
          <span ref={deltaValueRef}>0.0</span> ms earlier, every message
        </p>
      </div>

      <style jsx>{`
        .dz-beam {
          margin: 0;
          border: 1px solid rgba(148, 163, 184, 0.22);
          background:
            radial-gradient(120% 80% at 50% 0%, rgba(66, 86, 255, 0.1), transparent 60%), #070b16;
          box-shadow:
            0 40px 90px -50px rgba(0, 0, 0, 0.9),
            0 0 0 1px rgba(255, 255, 255, 0.03) inset;
        }
        .dz-beam-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 11px 16px;
          border-bottom: 1px solid rgba(148, 163, 184, 0.18);
          font-family: var(--font-geist-mono), ui-monospace, 'SF Mono', monospace;
          font-size: 11px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }
        .dz-beam-route {
          color: #dbe4f2;
          font-weight: 600;
        }
        .dz-beam-slow {
          color: #6d7893;
          text-align: right;
        }
        .dz-beam-stage {
          position: relative;
          aspect-ratio: 1 / 1;
        }
        /* Faint CRT scanlines and a vignette, so the panel reads as an
           instrument rather than a diagram. */
        .dz-beam-stage::after {
          content: '';
          position: absolute;
          inset: 0;
          pointer-events: none;
          background:
            radial-gradient(120% 120% at 50% 45%, transparent 55%, rgba(3, 6, 14, 0.55) 100%),
            repeating-linear-gradient(
              to bottom,
              rgba(255, 255, 255, 0.022) 0 1px,
              transparent 1px 3px
            );
        }
        .dz-beam-canvas {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
        }
        .dz-beam-readouts {
          border-top: 1px solid rgba(148, 163, 184, 0.18);
          padding: 6px 16px 16px;
        }
        .dz-beam-row {
          display: flex;
          align-items: center;
          gap: 11px;
          padding: 11px 0;
          border-bottom: 1px solid rgba(148, 163, 184, 0.1);
        }
        .dz-beam-swatch {
          flex-shrink: 0;
          width: 9px;
          height: 9px;
          opacity: 0.4;
          transition: opacity 0.2s ease;
        }
        .dz-beam-row-chord .dz-beam-swatch {
          background: #29f91f;
        }
        .dz-beam-row-surface .dz-beam-swatch {
          background: #63c8ff;
        }
        .dz-beam-row.dz-beam-landed .dz-beam-swatch {
          opacity: 1;
        }
        .dz-beam-row-chord.dz-beam-landed .dz-beam-swatch {
          box-shadow: 0 0 12px rgba(41, 249, 31, 0.9);
        }
        .dz-beam-name {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 3px;
          font-size: 13.5px;
          font-weight: 600;
          color: #e6ecf7;
        }
        .dz-beam-name em {
          font-family: var(--font-geist-mono), ui-monospace, 'SF Mono', monospace;
          font-style: normal;
          font-size: 10.5px;
          font-weight: 400;
          letter-spacing: 0.02em;
          color: #6d7893;
        }
        .dz-beam-clock {
          flex-shrink: 0;
          font-family: var(--font-geist-mono), ui-monospace, 'SF Mono', monospace;
          font-size: 20px;
          font-weight: 600;
          font-variant-numeric: tabular-nums;
          color: #5c6780;
          transition: color 0.2s ease;
        }
        .dz-beam-clock i {
          font-style: normal;
          font-size: 10.5px;
          margin-left: 3px;
          opacity: 0.65;
        }
        .dz-beam-row-chord.dz-beam-landed .dz-beam-clock {
          color: #5bff50;
        }
        .dz-beam-row-surface.dz-beam-landed .dz-beam-clock {
          color: #9fd8ff;
        }
        .dz-beam-delta {
          margin: 14px 0 0;
          font-family: var(--font-geist-mono), ui-monospace, 'SF Mono', monospace;
          font-size: 12px;
          letter-spacing: 0.03em;
          color: #8b96ad;
        }
        .dz-beam-delta span {
          font-size: 26px;
          font-weight: 700;
          font-variant-numeric: tabular-nums;
          color: #ffffff;
          margin-right: 2px;
          transition: text-shadow 0.2s ease;
        }
        /* The dead time is the product. Make it burn while it accumulates. */
        .dz-beam-delta.dz-beam-counting span {
          color: #b6ffae;
          text-shadow: 0 0 18px rgba(41, 249, 31, 0.75);
        }
        @media (max-width: 640px) {
          .dz-beam-head {
            font-size: 10px;
            letter-spacing: 0.05em;
          }
          .dz-beam-name {
            font-size: 12.5px;
          }
          .dz-beam-clock {
            font-size: 17px;
          }
          .dz-beam-delta span {
            font-size: 22px;
          }
        }
      `}</style>
    </figure>
  );
}
