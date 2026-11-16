/**
 * A curve sampled by arc length, for figures that move things along a path
 * at an even speed (the film strip in hero F).
 */

export type Pt = [number, number];

export interface Track {
  pts: Pt[];
  /** Arc length at each point. */
  len: number[];
}

/** A cubic Bézier, sampled `n` times. */
export function cubicTrack(p0: Pt, p1: Pt, p2: Pt, p3: Pt, n = 240): Track {
  const pts: Pt[] = [];
  const len: number[] = [];
  for (let i = 0; i <= n; i++) {
    const u = i / n;
    const a = (1 - u) ** 3;
    const b = 3 * (1 - u) ** 2 * u;
    const c = 3 * (1 - u) * u * u;
    const d = u ** 3;
    const pt: Pt = [
      a * p0[0] + b * p1[0] + c * p2[0] + d * p3[0],
      a * p0[1] + b * p1[1] + c * p2[1] + d * p3[1],
    ];
    len.push(i ? len[i - 1] + Math.hypot(pt[0] - pts[i - 1][0], pt[1] - pts[i - 1][1]) : 0);
    pts.push(pt);
  }
  return { pts, len };
}

/** The point `d` along the track and the direction there; straight on past either end. */
export function trackAt({ pts, len }: Track, d: number): { x: number; y: number; a: number } {
  const n = len.length - 1;
  let lo = 0;
  let hi = n;
  if (d <= 0 || d >= len[n]) {
    const [i, j] = d <= 0 ? [0, 1] : [n - 1, n];
    const seg = len[j] - len[i] || 1;
    const k = d <= 0 ? d / seg : (d - len[n]) / seg;
    const [bx, by] = d <= 0 ? pts[0] : pts[n];
    const dx = pts[j][0] - pts[i][0];
    const dy = pts[j][1] - pts[i][1];
    return { x: bx + dx * k, y: by + dy * k, a: Math.atan2(dy, dx) };
  }
  while (hi - lo > 1) {
    const m = (lo + hi) >> 1;
    if (len[m] < d) lo = m;
    else hi = m;
  }
  const k = (d - len[lo]) / (len[hi] - len[lo] || 1);
  const dx = pts[hi][0] - pts[lo][0];
  const dy = pts[hi][1] - pts[lo][1];
  return { x: pts[lo][0] + dx * k, y: pts[lo][1] + dy * k, a: Math.atan2(dy, dx) };
}

export const easeInOut = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
