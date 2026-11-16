import { hexToRgb } from '../../theme';
import { INK, RGB, T, rgba, tint } from './inks';
import { PLATE_STILL, clamp, phoneArt, plateState } from './heroKit';
import type { PaperDraw, PaperFigure } from './paperFigure';

/**
 * Hero candidate K, "The view": a person seen from behind, looking out at a
 * landscape in a round window. A loupe on the back of their head shows a
 * microtubule there, its tubulin lattice. The landscape is printed twice, blue and
 * pink, out of register, and so is a band of the lattice: two states at
 * once, no settled view. Every 11 s both slide into register together and
 * print indigo: the microtubule's state settles and, with it, what the
 * person sees. The same rhythm as heroes A–C.
 */

const PF = 13;

interface Plate {
  key: string;
  cx: number;
  cy: number;
  R: number;
}

function bake(w: number, h: number): Plate {
  const wide = w >= h;
  const top = phoneArt(w, h);
  const R = wide ? clamp(Math.min(h * 0.3, w * 0.2), 130, 300) : clamp(top * 0.3, 80, 130);
  return {
    key: `${w}x${h}`,
    cx: wide ? w * 0.77 : w * 0.5,
    cy: wide ? h * 0.42 : top * 0.5,
    R,
  };
}

/** The landscape's shapes, in units of the window's radius. */
function landscape(X: (x: number) => number, Y: (y: number) => number) {
  const far = new Path2D();
  far.moveTo(X(-1.1), Y(0.2));
  const ridge: [number, number][] = [
    [-0.82, -0.05],
    [-0.6, 0.08],
    [-0.38, -0.2],
    [-0.2, 0.0],
    [0.02, -0.12],
    [0.3, 0.1],
    [0.55, -0.08],
    [0.8, 0.12],
    [1.1, 0.02],
  ];
  for (const [x, y] of ridge) far.lineTo(X(x), Y(y));
  far.lineTo(X(1.1), Y(1.2));
  far.lineTo(X(-1.1), Y(1.2));
  far.closePath();
  const near = new Path2D();
  near.moveTo(X(-1.1), Y(0.42));
  near.bezierCurveTo(X(-0.5), Y(0.18), X(0.1), Y(0.5), X(0.5), Y(0.3));
  near.bezierCurveTo(X(0.75), Y(0.2), X(0.95), Y(0.3), X(1.1), Y(0.32));
  near.lineTo(X(1.1), Y(1.2));
  near.lineTo(X(-1.1), Y(1.2));
  near.closePath();
  const birds = new Path2D();
  for (const [x, y, k] of [
    [-0.42, -0.5, 1],
    [-0.28, -0.6, 0.7],
    [-0.55, -0.4, 0.6],
  ]) {
    const s = 0.06 * k;
    birds.moveTo(X(x - s), Y(y));
    birds.quadraticCurveTo(X(x - s / 2), Y(y - s * 0.6), X(x), Y(y));
    birds.quadraticCurveTo(X(x + s / 2), Y(y - s * 0.6), X(x + s), Y(y));
  }
  return { far, near, birds };
}

export const heroView: PaperFigure = {
  still: PLATE_STILL,
  create(): PaperDraw {
    let plate: Plate | null = null;
    return (ctx, w, h, t) => {
      if (!plate || plate.key !== `${w}x${h}`) plate = bake(w, h);
      const { cx, cy, R } = plate;
      const { sep, flash } = plateState(t);
      const line = clamp(R * 0.012, 1.4, 2.8);
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';

      // The window on the world.
      const win = new Path2D();
      win.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.globalCompositeOperation = 'multiply';
      ctx.fillStyle = tint(T.accent, 0.1);
      ctx.fill(win);
      ctx.save();
      ctx.clip(win);
      // The sun, and its flare when the view settles.
      const [sx, sy] = [cx + R * 0.3, cy - R * 0.28];
      const glow = ctx.createRadialGradient(sx, sy, 0, sx, sy, R * (0.5 + 0.5 * flash));
      glow.addColorStop(0, rgba(hexToRgb(T.accent), 0.6 + 0.4 * flash));
      glow.addColorStop(1, rgba(hexToRgb(T.accent), 0));
      ctx.fillStyle = glow;
      ctx.fillRect(cx - R, cy - R, R * 2, R * 2);
      ctx.fillStyle = tint(T.accent, 0.8);
      ctx.beginPath();
      ctx.arc(sx, sy, R * 0.15, 0, Math.PI * 2);
      ctx.fill();
      // The two plates of the landscape, apart, then in register.
      const off = sep * R * 0.045;
      for (const [col, sign] of [
        [RGB.blue, -1],
        [RGB.pink, 1],
      ] as const) {
        const dx = sign * off;
        const dy = sign * off * 0.35;
        const { far, near, birds } = landscape(
          (x) => cx + x * R + dx,
          (y) => cy + y * R + dy
        );
        ctx.fillStyle = rgba(col, 0.32);
        ctx.fill(far);
        ctx.fillStyle = rgba(col, 0.55);
        ctx.fill(near);
        ctx.strokeStyle = rgba(col, 0.95);
        ctx.lineWidth = line;
        ctx.stroke(birds);
      }
      ctx.restore();
      ctx.strokeStyle = INK.indigo;
      ctx.lineWidth = line;
      ctx.stroke(win);

      // The person, from behind: head, neck, shoulders.
      const P = (x: number, y: number): [number, number] => [cx + x * R, cy + y * R];
      const body = new Path2D();
      body.ellipse(...P(0, 0.62), R * 0.2, R * 0.245, 0, 0, Math.PI * 2);
      body.moveTo(...P(-0.1, 0.78));
      body.lineTo(...P(-0.115, 0.92));
      body.quadraticCurveTo(...P(-0.42, 0.93), ...P(-0.62, 1.04));
      body.quadraticCurveTo(...P(-0.74, 1.12), ...P(-0.76, 1.45));
      body.lineTo(...P(0.76, 1.45));
      body.quadraticCurveTo(...P(0.74, 1.12), ...P(0.62, 1.04));
      body.quadraticCurveTo(...P(0.42, 0.93), ...P(0.115, 0.92));
      body.lineTo(...P(0.1, 0.78));
      body.closePath();
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = INK.indigo;
      ctx.lineWidth = line * 2;
      ctx.stroke(body);
      ctx.fillStyle = tint(T.accent, 0.5);
      ctx.fill(body);
      // Hair: a darker cap on the head.
      ctx.globalCompositeOperation = 'multiply';
      ctx.fillStyle = tint(T.accent, 0.3);
      ctx.beginPath();
      ctx.ellipse(...P(0, 0.6), R * 0.2, R * 0.22, 0, Math.PI * 1.05, Math.PI * 1.95);
      ctx.fill();

      // A marker on the back of the head, and a loupe beside it showing
      // what is there: a microtubule.
      const [mx, my] = P(0.05, 0.66);
      const mr = R * 0.045;
      const [lx, ly] = P(-0.7, 0.86);
      const wr = R * 0.27;
      const lead = Math.atan2(ly - my, lx - mx);
      ctx.strokeStyle = INK.indigo;
      ctx.lineWidth = line;
      ctx.beginPath();
      ctx.arc(mx, my, mr, 0, Math.PI * 2);
      ctx.moveTo(mx + Math.cos(lead) * mr, my + Math.sin(lead) * mr);
      ctx.lineTo(lx - Math.cos(lead) * wr, ly - Math.sin(lead) * wr);
      ctx.stroke();
      const [wx, wy] = [lx, ly];
      const hole = new Path2D();
      hole.arc(wx, wy, wr, 0, Math.PI * 2);
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = '#fffaf2';
      ctx.fill(hole);
      ctx.save();
      ctx.clip(hole);
      ctx.globalCompositeOperation = 'multiply';
      if (flash > 0.01) {
        const gl = ctx.createRadialGradient(wx, wy, 0, wx, wy, wr);
        gl.addColorStop(0, rgba(hexToRgb(T.accent), 0.9 * flash));
        gl.addColorStop(1, rgba(hexToRgb(T.accent), 0.2 * flash));
        ctx.fillStyle = gl;
        ctx.fill(hole);
      }
      // The tube runs up through the loupe, tilted; its front strands.
      ctx.translate(wx, wy);
      ctx.rotate(0.35);
      const tr = wr * 0.6;
      const mono = wr * 0.17;
      const beads: {
        x: number;
        y: number;
        rx: number;
        face: number;
        band: boolean;
        beta: boolean;
      }[] = [];
      for (let p = 0; p < PF; p++) {
        const th = (p / PF) * Math.PI * 2 + 0.1;
        const face = Math.cos(th);
        if (face < 0.1) continue;
        for (let r = -9; r <= 9; r++) {
          const y = (r + (3 * p) / PF) * mono;
          // A helical band of tubulin carrying the state.
          const band = Math.abs(((((r + (3 * p) / PF) % 6) + 6) % 6) - 3) < 0.8;
          beads.push({
            x: Math.sin(th) * tr,
            y,
            rx: ((tr * Math.PI * 2) / PF) * 0.42 * face,
            face,
            band,
            beta: r % 2 === 0,
          });
        }
      }
      beads.sort((a, b) => a.face - b.face);
      for (const b of beads) {
        ctx.beginPath();
        ctx.ellipse(b.x, b.y, Math.max(0.6, b.rx), mono * 0.44, 0, 0, Math.PI * 2);
        ctx.fillStyle = tint(T.accent, (b.beta ? 0.5 : 0.8) * (0.4 + 0.6 * b.face));
        ctx.fill();
        ctx.strokeStyle = rgba(RGB.indigo, 0.6 * b.face);
        ctx.lineWidth = 0.8;
        ctx.stroke();
      }
      const moff = sep * mono * 0.55;
      for (const [col, sign] of [
        [RGB.blue, -1],
        [RGB.pink, 1],
      ] as const) {
        ctx.fillStyle = rgba(col, 0.9);
        ctx.beginPath();
        for (const b of beads) {
          if (!b.band || b.face < 0.35) continue;
          const r = Math.min(b.rx, mono * 0.44) * 0.6;
          const y = b.y + sign * moff;
          ctx.moveTo(b.x + r, y);
          ctx.arc(b.x, y, r, 0, Math.PI * 2);
        }
        ctx.fill();
      }
      ctx.restore();
      ctx.globalCompositeOperation = 'multiply';
      ctx.strokeStyle = INK.indigo;
      ctx.lineWidth = line * 1.3;
      ctx.stroke(hole);

      // The figure fades out below the shoulders.
      ctx.globalCompositeOperation = 'destination-out';
      const [, f0] = P(0, 1.12);
      const [, f1] = P(0, 1.45);
      const fade = ctx.createLinearGradient(0, f0, 0, f1);
      fade.addColorStop(0, 'rgba(0,0,0,0)');
      fade.addColorStop(1, 'rgba(0,0,0,1)');
      ctx.fillStyle = fade;
      ctx.fillRect(0, f0, w, h - f0);
      ctx.globalCompositeOperation = 'source-over';
    };
  },
};
