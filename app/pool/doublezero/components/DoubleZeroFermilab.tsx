'use client';

import { useEffect, useRef } from 'react';

/**
 * The experiment itself, drawn to scale.
 *
 * Geometry and numbers from Stancil et al., "Demonstration of Communication
 * Using Neutrinos" (arXiv:1203.2847). Distances are metres from the carbon
 * target, and the beamline is mapped linearly across the canvas, so the 240 m
 * of shale really is a quarter of the run and the decay pipe really is most
 * of it.
 */
const DECAY_PIPE_END_M = 675;
const ROCK_M = 240;
const ROCK_END_M = DECAY_PIPE_END_M + ROCK_M;
const BASELINE_M = 1035;

/** Expected detector events per pulse when the beam is on. */
const LAMBDA = 0.81;
const PULSE_PERIOD_S = 2.2;
const BIT_RATE = 0.1;

/**
 * The paper encoded "neutrino" in a 5-bit code: standard 7-bit ASCII with the
 * two leading bits dropped. Eight characters, so forty bits.
 */
const MESSAGE = 'neutrino';
const CODE_BITS = 5;
const MESSAGE_BITS = MESSAGE.length * CODE_BITS;
const MESSAGE_SECONDS = MESSAGE_BITS / BIT_RATE;

/** The animation loops one character. 'n' is 01110. */
const LETTER = 'n';
const LETTER_BITS = Array.from(
  { length: CODE_BITS },
  (_, i) => (LETTER.charCodeAt(0) >> (CODE_BITS - 1 - i)) & 1
);

/**
 * Events registered per pulse, for each bit of the loop. On-off keying means a
 * "0" is simply no pulse; and because lambda is below one, an honest "1" pulse
 * sometimes registers nothing at all. That miss is where the 1% error rate
 * comes from, so the loop shows one.
 */
const EVENTS_PER_BIT = [0, 1, 0, 2, 0];

/**
 * The bunch is drawn long rather than as a point, so that at any moment you can
 * see all four populations at once: mesons still in the pipe, the decays, muons
 * dying in the shale, and neutrinos already through it.
 */
const BUNCH_M = 250;
const FRONT_END_M = BASELINE_M + BUNCH_M + 60;

const PULSE_MS = 1700;
const PROTON_MS = 230;
const TRANSIT_MS = 1050;
const CYCLE_MS = PULSE_MS * CODE_BITS;

/** The detector reads out once the middle of the bunch is through it. */
const DETECT_MS = PROTON_MS + ((BASELINE_M + 130) / FRONT_END_M) * TRANSIT_MS;

const GREEN = '41, 249, 31';
const RED = '255, 62, 62';
const AMBER = '255, 176, 58';
const PROTON = '190, 214, 255';
const HOT = '214, 255, 206';

function hash(seed: number): number {
  const n = Math.sin(seed) * 43758.5453;
  return n - Math.floor(n);
}

interface Meson {
  /** Metres behind the front of the bunch. */
  stagger: number;
  /** Transverse offset in beam radii, -1 to 1. */
  lane: number;
  /** Where in the decay pipe this meson decays into a neutrino and a muon. */
  decayAt: number;
  /** How far the muon gets into the shale before it is absorbed. */
  muonStop: number;
  /** Neutrinos drift very slightly off the meson's line. */
  spread: number;
}

const MESONS: Meson[] = Array.from({ length: 30 }, (_, i) => ({
  // Spread along the bunch rather than clustered, so the beam reads as a stream.
  stagger: ((i + hash(i * 3.1) * 0.9) / 30) * BUNCH_M,
  lane: hash(i * 7.7) * 2 - 1,
  // Squared, because most mesons decay early in the pipe rather than uniformly.
  decayAt: 45 + hash(i * 11.3) ** 1.7 * (DECAY_PIPE_END_M - 120),
  muonStop: DECAY_PIPE_END_M + 15 + hash(i * 5.9) * (ROCK_M * 0.85),
  spread: hash(i * 13.7) * 2 - 1,
}));

const PROTONS = Array.from({ length: 13 }, (_, i) => ({
  stagger: i / 13,
  lane: hash(i * 17.3) * 2 - 1,
}));

/**
 * Fermilab's NuMI beamline into MINERvA, one proton pulse at a time.
 *
 * Protons hit a carbon target; the mesons that spray off are focused by
 * magnetic horns and decay in a 675 m helium pipe. Everything charged then dies
 * in 240 m of shale. Only the neutrinos come out the far side, and of the whole
 * bunch an average of 0.81 register in the detector — which is why a beam this
 * intense and a detector this large still only carried a word.
 */
export function DoubleZeroFermilab() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bitRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const countRef = useRef<HTMLSpanElement>(null);

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

    const bloom = (x: number, y: number, size: number, rgb: string, alpha: number) => {
      pixel(x, y, size + 6, `rgba(${rgb}, ${alpha * 0.07})`);
      pixel(x, y, size + 3, `rgba(${rgb}, ${alpha * 0.18})`);
    };

    const draw = (elapsed: number) => {
      if (w === 0 || h === 0) return;

      const bit = Math.floor(elapsed / PULSE_MS) % CODE_BITS;
      const t = elapsed % PULSE_MS;
      const on = LETTER_BITS[bit] === 1;
      const events = EVENTS_PER_BIT[bit];

      // --- layout -------------------------------------------------------
      // Driven by what has to fit rather than by percentages: one row of labels
      // above the beamline, distance marks and the receiver status below.
      const topRoom = 16;
      const botRoom = 36;
      const halfH = Math.min(54, Math.max(18, (h - topRoom - botRoom) / 2));
      const axisY = Math.round(topRoom + halfH + (h - topRoom - botRoom - halfH * 2) / 2);
      const runIn = w * 0.11;
      const x0 = runIn;
      const x1 = w * 0.975;
      /** Metres from the target to canvas x. */
      const mx = (m: number) => x0 + (m / BASELINE_M) * (x1 - x0);
      const pipeEnd = mx(DECAY_PIPE_END_M);
      const rockEnd = mx(ROCK_END_M);
      const detEnd = mx(BASELINE_M);

      ctx.clearRect(0, 0, w, h);

      ctx.fillStyle = 'rgba(148, 163, 184, 0.06)';
      for (let y = 6; y < h; y += 14) {
        for (let x = 6; x < w; x += 14) ctx.fillRect(x, y, 1, 1);
      }

      // --- the beamline, in zones ---------------------------------------
      // Proton run-in, drawn short: the Main Injector is far upstream.
      ctx.fillStyle = '#0d1526';
      ctx.fillRect(0, axisY - halfH, x0, halfH * 2);

      // Helium decay pipe.
      ctx.fillStyle = '#101f39';
      ctx.fillRect(x0, axisY - halfH, pipeEnd - x0, halfH * 2);

      // 240 m of shale, hatched.
      ctx.save();
      ctx.beginPath();
      ctx.rect(pipeEnd, axisY - halfH, rockEnd - pipeEnd, halfH * 2);
      ctx.clip();
      ctx.fillStyle = '#2b2118';
      ctx.fillRect(pipeEnd, axisY - halfH, rockEnd - pipeEnd, halfH * 2);
      ctx.strokeStyle = 'rgba(160, 120, 78, 0.3)';
      ctx.lineWidth = 1;
      for (let x = pipeEnd - halfH * 2; x < rockEnd + halfH * 2; x += 7) {
        ctx.beginPath();
        ctx.moveTo(x, axisY + halfH);
        ctx.lineTo(x + halfH * 2, axisY - halfH);
        ctx.stroke();
      }
      ctx.restore();

      // MINERvA.
      ctx.fillStyle = '#16264a';
      ctx.fillRect(rockEnd, axisY - halfH, detEnd - rockEnd, halfH * 2);
      ctx.strokeStyle = 'rgba(91, 255, 80, 0.5)';
      ctx.lineWidth = 1.25;
      ctx.strokeRect(
        Math.round(rockEnd) + 0.5,
        Math.round(axisY - halfH) + 0.5,
        Math.round(detEnd - rockEnd),
        Math.round(halfH * 2)
      );
      // Detector segmentation, the reason multiple events can be told apart.
      ctx.strokeStyle = 'rgba(91, 255, 80, 0.16)';
      ctx.lineWidth = 1;
      for (let x = rockEnd + 5; x < detEnd - 2; x += 5) {
        ctx.beginPath();
        ctx.moveTo(Math.round(x) + 0.5, axisY - halfH + 3);
        ctx.lineTo(Math.round(x) + 0.5, axisY + halfH - 3);
        ctx.stroke();
      }

      ctx.strokeStyle = 'rgba(148, 163, 184, 0.22)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, Math.round(axisY) + 0.5);
      ctx.lineTo(x1, Math.round(axisY) + 0.5);
      ctx.stroke();

      // The two magnetic horns that focus the meson spray back onto the axis.
      ctx.strokeStyle = 'rgba(99, 200, 255, 0.55)';
      ctx.lineWidth = 1.3;
      for (const dir of [-1, 1]) {
        ctx.beginPath();
        ctx.moveTo(mx(6), axisY + dir * 5);
        ctx.lineTo(mx(40), axisY + dir * (halfH * 0.78));
        ctx.lineTo(mx(78), axisY + dir * 7);
        ctx.stroke();
      }

      // Carbon target: a small solid block the protons run into.
      pixel(x0, axisY, 11, '#0b1530');
      pixel(x0, axisY, 8, '#63c8ff');
      pixel(x0, axisY, 3, '#eaf6ff');

      // --- the pulse ----------------------------------------------------
      const front = t < PROTON_MS ? -1 : ((t - PROTON_MS) / TRANSIT_MS) * FRONT_END_M;
      const hit = on && t >= PROTON_MS && t < PROTON_MS + 260;
      const hitK = hit ? 1 - (t - PROTON_MS) / 260 : 0;

      ctx.globalCompositeOperation = 'lighter';

      // Protons arriving from the Main Injector.
      if (on && t < PROTON_MS + 40) {
        for (const p of PROTONS) {
          const u = t / PROTON_MS - p.stagger * 0.5;
          if (u <= 0 || u > 1) continue;
          const x = u * x0;
          const y = axisY + p.lane * 3;
          pixel(x - 3, y, 2, `rgba(${PROTON}, 0.4)`);
          pixel(x, y, 3, `rgba(${PROTON}, 0.95)`);
        }
      }

      if (on && front >= 0) {
        for (const m of MESONS) {
          const at = front - m.stagger;
          if (at <= 0) continue;

          if (at < m.decayAt) {
            // Still a charged meson: diverging off the target, then pulled back
            // onto the axis by the horns.
            const focus = Math.min(1, at / 90);
            const lane = m.lane * (1 - focus * 0.72);
            const x = mx(at);
            const y = axisY + lane * (halfH - 7);
            pixel(x - 3.2, y, 2, `rgba(${RED}, 0.3)`);
            bloom(x, y, 3, RED, 0.9);
            pixel(x, y, 3, `rgba(${RED}, 0.95)`);
            continue;
          }

          // After the decay the two products get their own rail: muons below the
          // axis, neutrinos above. The shale then visibly ends one and not the
          // other, which is the whole point of the experiment.
          const drift = m.lane * (halfH * 0.18);
          const muonY = axisY + 7 + drift;
          const nuY = axisY - 7 + drift;

          if (at < m.muonStop) {
            const x = mx(at);
            pixel(x - 5, muonY, 1.6, `rgba(${AMBER}, 0.22)`);
            pixel(x - 3, muonY, 2, `rgba(${AMBER}, 0.42)`);
            bloom(x, muonY, 3, AMBER, 0.8);
            pixel(x, muonY, 3, `rgba(${AMBER}, 0.95)`);
          } else if (at < m.muonStop + 110) {
            // Absorbed: a puff of shale where it stopped.
            const k = 1 - (at - m.muonStop) / 110;
            const x = mx(m.muonStop);
            ctx.beginPath();
            ctx.arc(x, muonY, 2 + (1 - k) * 9, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(${AMBER}, ${0.55 * k})`;
            ctx.lineWidth = 1.2;
            ctx.stroke();
            pixel(x, muonY, 2, `rgba(${AMBER}, ${0.5 * k})`);
          }

          // The neutrino: straight through the shale as if it were not there.
          if (at <= FRONT_END_M) {
            const nx = mx(at);
            pixel(nx - 5, nuY, 1.6, `rgba(${GREEN}, 0.2)`);
            pixel(nx - 3.4, nuY, 2, `rgba(${GREEN}, 0.38)`);
            bloom(nx, nuY, 3, GREEN, 1);
            pixel(nx, nuY, 3, `rgba(${GREEN}, 0.95)`);
            pixel(nx, nuY, 1.4, `rgba(${HOT}, 0.95)`);
          }
        }
      }

      // Target flash.
      if (hitK > 0) {
        ctx.beginPath();
        ctx.arc(x0, axisY, 7 + (1 - hitK) * halfH * 0.9, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${HOT}, ${0.6 * hitK})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
        bloom(x0, axisY, 12, HOT, hitK);
      }

      // --- detector response --------------------------------------------
      const arrived = on && t >= DETECT_MS;
      const since = arrived ? t - DETECT_MS : 0;
      if (arrived && events > 0) {
        const k = Math.max(0, 1 - since / 520);
        for (let e = 0; e < events; e++) {
          const ex = rockEnd + (detEnd - rockEnd) * (0.3 + 0.4 * e);
          const ey = axisY + (e === 0 ? -3 : 6);
          // A short track through the segments, the way a real event reads out.
          ctx.strokeStyle = `rgba(${HOT}, ${0.85 * k})`;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(ex, ey);
          ctx.lineTo(ex + 13, ey + (e === 0 ? 9 : -11));
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(ex, ey, 3 + (1 - k) * 12, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(${GREEN}, ${0.7 * k})`;
          ctx.lineWidth = 1.4;
          ctx.stroke();
          bloom(ex, ey, 4, HOT, k);
          pixel(ex, ey, 3, `rgba(${HOT}, ${k})`);
        }
      }
      ctx.globalCompositeOperation = 'source-over';

      // --- labels -------------------------------------------------------
      const small = w < 460;
      ctx.font = `${small ? 8 : 9.5}px ui-monospace, SFMono-Regular, Menlo, monospace`;
      ctx.textAlign = 'center';
      const labelY = axisY - halfH - 9;

      // Left-aligned: the run-in is too narrow to centre this without clipping.
      ctx.textAlign = 'left';
      ctx.fillStyle = 'rgba(190, 214, 255, 0.75)';
      ctx.fillText(small ? 'PROTONS' : '120 GeV PROTONS', 3, labelY);
      ctx.textAlign = 'center';
      ctx.fillStyle = 'rgba(148, 163, 184, 0.8)';
      ctx.fillText(
        small ? '675 M DECAY PIPE' : '675 M HELIUM DECAY PIPE',
        (x0 + pipeEnd) / 2,
        labelY
      );
      ctx.fillStyle = 'rgba(214, 168, 116, 0.9)';
      ctx.fillText(small ? '240 M' : '240 M SHALE', (pipeEnd + rockEnd) / 2, labelY);
      ctx.fillStyle = 'rgba(91, 255, 80, 0.9)';
      ctx.fillText('MINERvA', (rockEnd + detEnd) / 2, labelY);

      const footY = axisY + halfH + 15;
      ctx.fillStyle = 'rgba(148, 163, 184, 0.6)';
      ctx.fillText(small ? 'C TARGET' : 'CARBON TARGET', x0, footY);
      ctx.textAlign = 'right';
      ctx.fillText('1.035 KM', detEnd, footY);

      // What the receiver actually sees, in the detector's own corner.
      ctx.textAlign = 'left';
      ctx.font = `${small ? 8 : 9.5}px ui-monospace, SFMono-Regular, Menlo, monospace`;
      if (!on) {
        ctx.fillStyle = 'rgba(148, 163, 184, 0.75)';
        ctx.fillText('BEAM OFF  \u2192  BIT 0', 4, h - 6);
      } else if (arrived && events === 0) {
        ctx.fillStyle = 'rgba(255, 176, 58, 0.95)';
        ctx.fillText('PULSE SENT, 0 EVENTS  \u2192  BIT ERROR', 4, h - 6);
      } else if (arrived) {
        ctx.fillStyle = 'rgba(91, 255, 80, 0.95)';
        ctx.fillText(`${events} EVENT${events > 1 ? 'S' : ''}  \u2192  BIT 1`, 4, h - 6);
      } else {
        ctx.fillStyle = 'rgba(148, 163, 184, 0.6)';
        ctx.fillText('PULSE IN FLIGHT', 4, h - 6);
      }

      // --- DOM readouts -------------------------------------------------
      bitRefs.current.forEach((el, i) => {
        el?.classList.toggle('dz-fnal-bit-live', i === bit);
      });
      const el = countRef.current;
      if (el) {
        const settled = on && arrived;
        el.textContent = settled ? `${events}` : '\u2013';
        el.classList.toggle('dz-fnal-count-idle', !settled);
        el.classList.toggle('dz-fnal-count-miss', settled && events === 0);
      }
    };

    // A "1" bit mid-flight: neutrinos crossing the shale, muons dying in it.
    const STILL = PULSE_MS + PROTON_MS + TRANSIT_MS * 0.72;
    const observer = new ResizeObserver(() => {
      resize();
      draw(STILL);
    });
    observer.observe(canvas);
    resize();

    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      draw(STILL);
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
    <figure className="dz-fnal">
      <figcaption className="dz-fnal-head">
        <span className="dz-fnal-title">Fermilab NuMI &rarr; MINERvA, 2012</span>
        <span className="dz-fnal-rate">0.1 bit / s</span>
      </figcaption>

      <div className="dz-fnal-stage">
        <canvas ref={canvasRef} className="dz-fnal-canvas" aria-hidden="true" />
      </div>

      <div className="dz-fnal-readouts">
        <div className="dz-fnal-row">
          <span className="dz-fnal-label">
            On-off keying
            <em>a pulse is a 1, no pulse is a 0</em>
          </span>
          <span className="dz-fnal-bits" aria-hidden>
            {LETTER_BITS.map((b, i) => (
              <span
                key={i}
                ref={(el) => {
                  bitRefs.current[i] = el;
                }}
                className={`dz-fnal-bit${b ? ' dz-fnal-bit-one' : ''}`}
              >
                {b}
              </span>
            ))}
            <em>&ldquo;{LETTER}&rdquo;</em>
          </span>
        </div>

        <div className="dz-fnal-row">
          <span className="dz-fnal-label">
            Events this pulse
            <em>
              &lambda; = {LAMBDA} per pulse &middot; one pulse every {PULSE_PERIOD_S} s
            </em>
          </span>
          <span className="dz-fnal-count" ref={countRef}>
            &middot;
          </span>
        </div>

        <p className="dz-fnal-foot">
          One word cost <strong>{MESSAGE_BITS} bits</strong> and{' '}
          <strong>
            {Math.floor(MESSAGE_SECONDS / 60)} min {MESSAGE_SECONDS % 60} s
          </strong>
          . A 170-tonne detector caught 0.81 neutrinos per pulse; everything else went straight
          through it.
        </p>
      </div>

      <style jsx>{`
        .dz-fnal {
          margin: 0;
          border: 1px solid rgba(41, 249, 31, 0.22);
          background:
            radial-gradient(120% 100% at 50% 0%, rgba(41, 249, 31, 0.07), transparent 62%), #05070f;
          font-family: var(--font-geist-mono), ui-monospace, 'SF Mono', monospace;
          box-shadow: 0 34px 70px -44px rgba(0, 0, 0, 0.9);
        }
        .dz-fnal-head {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          gap: 14px;
          padding: 14px 18px;
          border-bottom: 1px solid rgba(148, 163, 184, 0.14);
          font-size: 10.5px;
          letter-spacing: 0.09em;
          text-transform: uppercase;
        }
        /* NuMI and MINERvA are capitalised deliberately; no uppercasing here. */
        .dz-fnal-title {
          color: #c3cddd;
          text-transform: none;
          letter-spacing: 0.04em;
        }
        .dz-fnal-rate {
          flex-shrink: 0;
          color: #04120a;
          background: #29f91f;
          font-weight: 700;
          padding: 4px 7px;
        }
        .dz-fnal-stage {
          position: relative;
          aspect-ratio: 3 / 1;
        }
        .dz-fnal-canvas {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
        }
        .dz-fnal-readouts {
          border-top: 1px solid rgba(148, 163, 184, 0.14);
          padding: 4px 18px 18px;
        }
        .dz-fnal-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 14px;
          padding: 12px 0;
          border-bottom: 1px solid rgba(148, 163, 184, 0.1);
        }
        .dz-fnal-label {
          display: flex;
          flex-direction: column;
          gap: 4px;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.02em;
          text-transform: uppercase;
          color: #e6ecf7;
        }
        .dz-fnal-label em {
          font-style: normal;
          font-size: 10px;
          font-weight: 400;
          letter-spacing: 0.05em;
          text-transform: none;
          color: #6d7893;
        }
        .dz-fnal-bits {
          display: flex;
          align-items: center;
          gap: 4px;
          flex-shrink: 0;
        }
        .dz-fnal-bit {
          width: 20px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 700;
          color: #46516a;
          border: 1px solid rgba(148, 163, 184, 0.18);
          transition:
            color 0.15s ease,
            border-color 0.15s ease,
            background-color 0.15s ease;
        }
        .dz-fnal-bit-one {
          color: #9aa6bd;
        }
        .dz-fnal-bit.dz-fnal-bit-live {
          color: #04120a;
          background: #29f91f;
          border-color: #29f91f;
        }
        .dz-fnal-bits em {
          font-style: normal;
          font-size: 11px;
          color: #6d7893;
          margin-left: 4px;
        }
        .dz-fnal-count {
          flex-shrink: 0;
          min-width: 34px;
          text-align: right;
          font-size: 26px;
          font-weight: 700;
          font-variant-numeric: tabular-nums;
          line-height: 1;
          color: #5bff50;
          transition: color 0.15s ease;
        }
        .dz-fnal-count.dz-fnal-count-idle {
          color: #3f4a60;
        }
        .dz-fnal-count.dz-fnal-count-miss {
          color: #ffb03a;
        }
        .dz-fnal-foot {
          margin: 14px 0 0;
          font-size: 11.5px;
          line-height: 1.6;
          color: #98a4ba;
        }
        .dz-fnal-foot strong {
          color: #ffffff;
        }

        @media (max-width: 640px) {
          .dz-fnal-head,
          .dz-fnal-readouts {
            padding-left: 14px;
            padding-right: 14px;
          }
          .dz-fnal-stage {
            aspect-ratio: 16 / 9;
          }
          .dz-fnal-label {
            font-size: 11px;
          }
          .dz-fnal-bit {
            width: 17px;
            height: 22px;
          }
          .dz-fnal-count {
            font-size: 22px;
          }
        }
      `}</style>
    </figure>
  );
}
