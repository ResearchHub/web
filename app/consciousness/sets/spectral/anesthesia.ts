import { rng, smoothstep } from '../../visuals/palette';
import type { SpectralFigure, Uniforms } from './glsl';

/**
 * Q1, anesthesia. A stretch of microtubule wall, unrolled: rows are
 * protofilaments, α and β tubulin alternate along each row, each row is
 * shifted by the lattice's helical offset. A collective oscillation runs
 * through it as a travelling wave of light whose crests shimmer in film
 * colour (modelled, slowed for display). Anesthetic molecules (cyan) drift
 * in, settle in pockets between α and β, and damp the wave around them;
 * then they wash out and it recovers. The trace below sums the lattice.
 */

const CYCLE = 14;
const ROWS = 9;
const N = 16;

const r = rng(303);
const MOLS = Array.from({ length: N }, (_, i) => ({
  site: r(),
  row: Math.floor(r() * ROWS),
  fromX: r(),
  fromTop: r() < 0.5,
  toX: r(),
  toTop: r() < 0.5,
  enter: 1.2 + i * 0.36 + r() * 0.3,
  leave: 8.8 + i * 0.16 + r() * 0.4,
  wob: r() * 6.28,
}));

/** Lattice geometry in CSS pixels, shared with the shader through uniforms. */
function lattice(w: number, h: number) {
  const top = h * 0.08;
  const bottom = h * 0.64;
  const rowH = (bottom - top) / ROWS;
  const pitch = rowH * 0.95;
  const x0 = w * 0.04;
  return { top, bottom, rowH, pitch, x0 };
}

const ease = (x: number) => smoothstep(0, 1, x);

export const anesthesia: SpectralFigure = {
  still: 6.4,
  uniforms: (): Uniforms => ({
    uLat: { value: [0, 0, 0, 0] },
    // Plain arrays: OGL matches uniform arrays (uMol[0]...) only to Array values.
    uMol: { value: new Array<number>(N * 4).fill(0) },
    uEnter: { value: MOLS.map((m) => m.enter) },
    uLeave: { value: MOLS.map((m) => m.leave) },
  }),
  update(u, t, w, h) {
    const L = lattice(w, h);
    u.uLat.value = [L.top, L.rowH, L.pitch, L.x0];
    const tc = ((t % CYCLE) + CYCLE) % CYCLE;
    const cols = Math.floor((w - 2 * L.x0) / L.pitch / 2) - 1;
    const mol = u.uMol.value as number[];
    MOLS.forEach((m, i) => {
      // A pocket between an α (even) and the β after it.
      const j = 2 * Math.floor(m.site * cols) + 1;
      const px = L.x0 + (j + 0.5 + (m.row * 3) / 13) * L.pitch;
      const py = L.top + (m.row + 0.5) * L.rowH;
      const sx = m.fromX * w;
      const sy = m.fromTop ? -20 : L.bottom + 30;
      const ex = m.toX * w;
      const ey = m.toTop ? -20 : L.bottom + 30;
      const a = ease((tc - m.enter) / 1.5);
      const b = ease((tc - m.leave) / 1.4);
      const wobble = (1 - a + b) * 10 * Math.sin(tc * 1.7 + m.wob);
      let x = sx + (px - sx) * a;
      let y = sy + (py - sy) * a;
      x += (ex - px) * b;
      y += (ey - py) * b + wobble;
      const settled =
        smoothstep(m.enter + 1.2, m.enter + 1.6, tc) * (1 - smoothstep(m.leave, m.leave + 0.5, tc));
      const alpha =
        smoothstep(m.enter - 0.2, m.enter + 0.4, tc) *
        (1 - smoothstep(m.leave + 0.9, m.leave + 1.4, tc));
      mol[i * 4] = x;
      mol[i * 4 + 1] = y;
      mol[i * 4 + 2] = alpha;
      mol[i * 4 + 3] = settled;
    });
  },
  frag: /* glsl */ `
uniform vec4 uLat;          // top, row height, bead pitch, left (CSS px)
uniform vec4 uMol[16];      // x, y, presence, settled
uniform float uEnter[16];
uniform float uLeave[16];

const float ROWS = 9.0;
const float CYCLE = 14.0;
const float FREQ = 1.4;

void main() {
  vec2 c = cssCoord();
  vec2 S = cssSize();
  float top = uLat.x, rowH = uLat.y, pitch = uLat.z, x0 = uLat.w;
  float bottom = top + rowH * ROWS;
  vec3 light = vec3(0.0);

  // Damping around settled molecules.
  float damp = 0.0;
  for (int i = 0; i < 16; i++) {
    vec4 m = uMol[i];
    vec2 dm = c - m.xy;
    damp += m.w * exp(-dot(dm, dm) / (pitch * pitch * 5.5));
  }
  float amp = 1.0 - 0.92 * sat(damp);

  // The wall.
  if (c.y > top - rowH && c.y < bottom + rowH) {
    float k = floor((c.y - top) / rowH);
    if (k >= 0.0 && k < ROWS) {
      float yc = top + (k + 0.5) * rowH;
      float jf = (c.x - x0) / pitch - k * 3.0 / 13.0;
      float j = floor(jf + 0.5);
      float dx = (jf - j) * pitch;
      float dy = c.y - yc;
      float isA = 1.0 - mod(j, 2.0);
      float br = pitch * (isA > 0.5 ? 0.34 : 0.3);
      float d = length(vec2(dx, dy * 1.05));
      float core = 1.0 - smoothstep(br - 0.8, br + 0.8, d);
      float rim = stroke(d - br, 0.7);
      float fadeX = smoothstep(x0 - pitch, x0 + pitch * 2.0, c.x) * (1.0 - smoothstep(S.x - x0 - pitch * 2.0, S.x - x0 + pitch, c.x));

      // The oscillation: a travelling wave across the lattice.
      float phase = TAU * (FREQ * uTime - (j + k * 3.0 / 13.0) * 0.085) + k * 0.35;
      float crest = 0.5 + 0.5 * cos(phase);
      float glow = pow(crest, 2.0) * amp;
      vec3 shimmer = mix(uA, iri(0.85 + crest * 0.3 + c.x / S.x * 0.15 + k * 0.02), 0.45);

      // Glassy beads: shaded as small spheres lit from the upper left.
      vec2 off = vec2(dx, dy) / br;
      float sph = sqrt(max(1.0 - dot(off, off), 0.0));
      float spec = pow(sat(dot(vec3(off * vec2(1.0, -1.0), sph), normalize(vec3(-0.4, 0.5, 0.75)))), 12.0);
      vec3 bead = uW * (isA > 0.5 ? 0.16 : 0.09) * core * (0.4 + 0.6 * sph) + uW * 0.22 * rim + uW * spec * core * 0.35;
      bead += shimmer * glow * (core * 1.4 + rim * 0.5);
      light += bead * fadeX;
      // The oscillation as a continuous field under the lattice.
      float kf = (c.y - top) / rowH - 0.5;
      float fieldPhase = TAU * (FREQ * uTime - ((c.x - x0) / pitch - kf * 3.0 / 13.0) * 0.085) + kf * 0.35;
      float field = pow(0.5 + 0.5 * cos(fieldPhase), 3.0) * amp;
      light += mix(uA, iri(0.88 + c.x / S.x * 0.2), 0.4) * field * 0.26 * fadeX * (1.0 - core);
      // Halo between beads, carried by the wave.
      light += uA * glow * 0.22 * exp(-d * d / (pitch * pitch * 0.09)) * fadeX;
    }
  }

  // The molecules: a small cluster of three atoms with a soft halo.
  for (int i = 0; i < 16; i++) {
    vec4 m = uMol[i];
    if (m.z < 0.01) continue;
    vec2 dm = c - m.xy;
    float rr = pitch * 0.2;
    float a1 = length(dm);
    float a2 = length(dm - vec2(rr * 1.3, -rr * 0.6));
    float a3 = length(dm - vec2(-rr * 0.9, -rr * 1.0));
    float atoms = max(max(1.0 - smoothstep(rr - 0.7, rr + 0.7, a1),
      1.0 - smoothstep(rr * 0.75 - 0.7, rr * 0.75 + 0.7, a2)),
      1.0 - smoothstep(rr * 0.7 - 0.7, rr * 0.7 + 0.7, a3));
    light += uB * m.z * (atoms * 1.4 + 0.5 * exp(-a1 * a1 / (pitch * pitch * 0.35)));
    // A ring where it damps the wave.
    light += uB * m.z * m.w * stroke(a1 - pitch * 0.62, 0.6) * 0.3;
  }

  // The trace: summed oscillation over the last 3 s, now at the right.
  float tl = S.x * 0.06, tr = S.x * 0.94;
  float base = S.y * 0.83, th = S.y * 0.1;
  if (c.y > base - th * 1.6 && c.y < base + th * 1.6 && c.x > tl - 4.0 && c.x < tr + 4.0) {
    float tau = uTime - 3.0 * (1.0 - (c.x - tl) / (tr - tl));
    float tc = mod(tau, CYCLE);
    float bound = 0.0;
    for (int i = 0; i < 16; i++) {
      bound += smoothstep(uEnter[i] + 1.2, uEnter[i] + 1.6, tc) * (1.0 - smoothstep(uLeave[i], uLeave[i] + 0.5, tc));
    }
    float A = 1.0 - 0.72 * bound / 16.0;
    float y = base - th * A * cos(TAU * FREQ * tau);
    float slope = th * A * TAU * FREQ * 3.0 / (tr - tl);
    float dd = abs(c.y - y) / sqrt(1.0 + slope * slope);
    float live = step(c.x, tr) * step(tl, c.x);
    light += uA * live * (stroke(dd, 0.9) * 1.1 + exp(-dd * dd / 18.0) * 0.25);
    light += uDim * 0.25 * stroke(c.y - base, 0.4) * live;
    // The present moment.
    vec2 head = vec2(tr, base - th * A * cos(TAU * FREQ * uTime));
    light += uA * exp(-dot(c - head, c - head) / 30.0) * 1.2;
  }

  gl_FragColor = vec4(finish(light), 1.0);
}
`,
};
