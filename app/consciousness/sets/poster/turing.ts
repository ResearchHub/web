import { clamp, smoothstep } from '../../visuals/palette';
import { RGB, rgba } from './inks';
import { printFonts } from './type';
import type { PaperDraw, PaperFigure } from './paperFigure';

/**
 * Q2, can you compute your way to consciousness: a Turing machine at work.
 * Its head steps along a tape, writing one symbol per step (a digit 0–9);
 * each digit is the size of one dot, so every pass along the tape is one
 * row of a halftone picture, printed above in blue as it is written. Row by
 * row the steps add up to a sunset over the sea, then the picture clears
 * and the machine starts again. A step counter runs at the top left.
 * Nothing in the figure says whether the machine sees the sunset: that is
 * the question.
 */

const COLS = 32;
const ROWS = 18;
/** Seconds per symbol written, and for the head's return at a row's end. */
const STEP = 0.06;
const RETURN = 0.4;
const ROW_T = COLS * STEP + RETURN;
const BUILD = ROWS * ROW_T;
const HOLD = 3.5;
const FADE = 1;
const CYCLE = BUILD + HOLD + FADE;

/** How dark the picture is at a cell (0 paper .. 1 full ink): the sun half set into the sea. */
function tone(x: number, y: number) {
  const horizon = ROWS * 0.58;
  const sx = COLS * 0.6;
  const sr = ROWS * 0.26;
  const d = Math.hypot(x - sx, y - horizon);
  if (y < horizon) {
    if (d < sr) return 0.95;
    // The sky: pale above, deepening towards the horizon, a halo round the sun.
    const v = y / horizon;
    const halo = 0.22 * Math.exp(-(((d - sr) / (ROWS * 0.1)) ** 2));
    return clamp(0.04 + 0.26 * v * v + halo, 0, 1);
  }
  if (y < horizon + 1) return 0.62;
  // The sea: ripples, and the sun's path broken into bands, narrowing towards us.
  const depth = (y - horizon) / (ROWS - horizon);
  const half = sr * (1 - depth * 0.55);
  const band = Math.floor(y) % 2 === 0 ? 1 : 0.55;
  const path = Math.abs(x - sx) < half ? 0.9 * band : 0;
  const ripple = 0.1 * Math.sin(x * 0.8 + y * 2.1);
  return clamp(Math.max(path, 0.24 + ripple + depth * 0.1), 0, 1);
}

/** The symbol for each cell: the dot's size as one digit. */
const DIGITS: number[][] = Array.from({ length: ROWS }, (_, r) =>
  Array.from({ length: COLS }, (_, c) => Math.round(tone(c + 0.5, r + 0.5) * 9))
);

const fmt = (n: number) => n.toLocaleString('en-US');

export const turing: PaperFigure = {
  // Thirteen rows in, the head halfway along the fourteenth.
  still: 13 * ROW_T + 16 * STEP + 0.03,
  create(): PaperDraw {
    return (ctx, w, h, t) => {
      const fonts = printFonts(ctx.canvas);
      const time = ((t % CYCLE) + CYCLE) % CYCLE;
      const done = time >= BUILD;
      // Where the machine is: row, cell, and how far into this step.
      const row = done ? ROWS : Math.floor(time / ROW_T);
      const inRow = done ? 0 : time - row * ROW_T;
      const writing = inRow < COLS * STEP;
      const col = writing ? Math.floor(inRow / STEP) : COLS;
      const stepFrac = writing ? inRow / STEP - col : 0;
      const fadeOut = 1 - smoothstep(BUILD + HOLD, CYCLE, time);

      // The grid: the picture's cells and the tape's share their columns.
      const cs = Math.min((w * 0.88) / COLS, (h * 0.58) / ROWS);
      const x0 = (w - cs * COLS) / 2;
      const y0 = h * 0.13;
      const tapeY = y0 + cs * ROWS + Math.max(h * 0.09, cs * 1.8);
      const cellH = cs * 1.15;
      const cx = (c: number) => x0 + (c + 0.5) * cs;

      ctx.globalCompositeOperation = 'multiply';

      // The picture so far, one dot per symbol written.
      for (let r = 0; r <= Math.min(row, ROWS - 1); r++) {
        const upTo = r < row ? COLS : col + (writing ? 1 : 0);
        for (let c = 0; c < upTo; c++) {
          const d = DIGITS[r][c];
          if (d === 0) continue;
          // The newest dot swells in as it is written.
          const fresh = r === row && c === col ? smoothstep(0, 0.5, stepFrac) : 1;
          const rad = (d / 9) * cs * 0.5 * fresh;
          ctx.fillStyle = rgba(RGB.blue, 0.9 * fadeOut);
          ctx.beginPath();
          ctx.arc(cx(c), y0 + (r + 0.5) * cs, rad, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // The tape: one cell per column, holding this row's symbols.
      const small = cs < 15;
      ctx.lineWidth = 1;
      ctx.strokeStyle = rgba(RGB.indigo, 0.42);
      ctx.beginPath();
      ctx.moveTo(x0 - cs * 0.8, tapeY);
      ctx.lineTo(x0 + COLS * cs + cs * 0.8, tapeY);
      ctx.moveTo(x0 - cs * 0.8, tapeY + cellH);
      ctx.lineTo(x0 + COLS * cs + cs * 0.8, tapeY + cellH);
      for (let c = 0; c <= COLS; c++) {
        ctx.moveTo(x0 + c * cs, tapeY);
        ctx.lineTo(x0 + c * cs, tapeY + cellH);
      }
      ctx.stroke();
      // The tape runs on past both ends.
      ctx.setLineDash([2, 3]);
      ctx.beginPath();
      ctx.moveTo(x0 - cs * 1.8, tapeY + cellH / 2);
      ctx.lineTo(x0 - cs * 0.9, tapeY + cellH / 2);
      ctx.moveTo(x0 + COLS * cs + cs * 0.9, tapeY + cellH / 2);
      ctx.lineTo(x0 + COLS * cs + cs * 1.8, tapeY + cellH / 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // Symbols on the tape: this row's, as far as written. While the head
      // returns, the last row's fade.
      const tapeRow = writing ? row : Math.min(row, ROWS - 1);
      const tapeFade = writing ? 1 : 1 - smoothstep(0, RETURN, inRow - COLS * STEP);
      if (!done) {
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = `600 ${Math.round(cs * 0.62)}px ${fonts.display}`;
        const upTo = writing ? col + 1 : COLS;
        for (let c = 0; c < upTo; c++) {
          const d = DIGITS[tapeRow][c];
          const a = (c === col && writing ? smoothstep(0.1, 0.5, stepFrac) : 1) * tapeFade;
          if (small) {
            // Too small for digits: a bar as tall as the symbol's value.
            ctx.fillStyle = rgba(RGB.indigo, 0.8 * a);
            const bh = (d / 9) * cellH * 0.7;
            ctx.fillRect(cx(c) - cs * 0.18, tapeY + cellH * 0.85 - bh, cs * 0.36, bh);
          } else {
            ctx.fillStyle = rgba(RGB.indigo, 0.9 * a);
            ctx.fillText(String(d), cx(c), tapeY + cellH * 0.54);
          }
        }
      }

      // The head: a pink frame over the cell being written, gliding to the
      // next cell at the end of each step, and back to the start between rows.
      let hx: number;
      if (done) hx = cx(COLS - 1) + cs * 1.4;
      else if (writing) hx = cx(col) + cs * smoothstep(0.62, 1, stepFrac);
      else {
        const back = smoothstep(0, RETURN, inRow - COLS * STEP);
        hx = cx(COLS) + (cx(0) - cx(COLS)) * back;
      }
      const pad = cs * 0.14;
      ctx.strokeStyle = rgba(RGB.pink, 0.95 * (done ? fadeOut * 0.6 : 1));
      ctx.lineWidth = clamp(cs * 0.11, 1.6, 3);
      ctx.beginPath();
      ctx.roundRect(hx - cs / 2 - pad, tapeY - pad, cs + pad * 2, cellH + pad * 2, cs * 0.18);
      ctx.stroke();
      // Its pointer, and a dashed line up to the dot it is printing.
      ctx.fillStyle = rgba(RGB.pink, 0.95 * (done ? fadeOut * 0.6 : 1));
      ctx.beginPath();
      ctx.moveTo(hx, tapeY + cellH + pad + cs * 0.12);
      ctx.lineTo(hx - cs * 0.28, tapeY + cellH + pad + cs * 0.5);
      ctx.lineTo(hx + cs * 0.28, tapeY + cellH + pad + cs * 0.5);
      ctx.closePath();
      ctx.fill();
      if (writing) {
        ctx.save();
        ctx.setLineDash([2, 4]);
        ctx.strokeStyle = rgba(RGB.pink, 0.55);
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(hx, tapeY - pad);
        ctx.lineTo(hx, y0 + (row + 0.5) * cs + cs * 0.55);
        ctx.stroke();
        ctx.restore();
      }

      // The step counter: every symbol written is one step.
      const steps = done ? ROWS * COLS : row * COLS + (writing ? col + 1 : COLS);
      ctx.textAlign = 'left';
      ctx.textBaseline = 'alphabetic';
      ctx.fillStyle = rgba(RGB.indigo, 0.7);
      const label = clamp(w * 0.017, 10, 13);
      ctx.font = `500 ${label}px ${fonts.body}`;
      ctx.fillText('Step', x0, y0 - cs * 0.9);
      const lw = ctx.measureText('Step ').width;
      ctx.font = `600 ${label * 1.25}px ${fonts.display}`;
      ctx.fillText(fmt(steps), x0 + lw, y0 - cs * 0.9);
      ctx.font = `500 ${label}px ${fonts.body}`;
      ctx.textAlign = 'right';
      ctx.fillText('Tape', x0 + COLS * cs, tapeY + cellH + pad + cs * 0.5 + label * 1.4);
      ctx.globalCompositeOperation = 'source-over';
    };
  },
};
