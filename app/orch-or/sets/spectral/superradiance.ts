import { rng } from '../../visuals/palette';
import type { SpectralFigure, Uniforms } from './glsl';

const CYCLE = 10;
const IND_START = 0.3;
const IND_TAU = 1.3;
const WAVE_START = 4.6;
const M = 0.3; // bead pitch in tube radii (as in the shader)
const MAX_SRC = 24;

// A sample of sites that emit on their own, each at its own moment.
const r = rng(1013);
const SITES = Array.from({ length: 64 }, () => ({
  k: Math.floor(r() * 13),
  j: Math.floor(r() * 22),
  emit: IND_START - Math.log(1 - r() * 0.98) * IND_TAU,
}));

/**
 * Q2, quantum states in microtubules: superradiance. A microtubule side-on,
 * its open end showing 13 protofilaments round the hollow core; every
 * tubulin carries tryptophan. First the sites emit on their own: sparse dim
 * cyan flickers, and the trace below decays slowly. Then an excitation
 * sweeps along the tube, every site pulses magenta in step, and they emit
 * together: one bright burst with a wavefront leaving the tube, and a
 * tall, fast spike on the trace beside the slow cyan curve. Schematic:
 * numbers of sites and timings are illustrative (as in the Ink figure).
 */

export const superradiance: SpectralFigure = {
  still: 5.8,
  uniforms: (): Uniforms => ({
    // x, y (CSS px), age (s), 1 on the near wall
    uSrc: { value: new Array<number>(MAX_SRC * 4).fill(-1) },
  }),
  update(u, t, w, h) {
    const tc = ((t % CYCLE) + CYCLE) % CYCLE;
    const R = Math.min(h * 0.17, w * 0.125);
    const cy = h * 0.33;
    const x0 = w * 0.07 + R * 0.42 + R * 0.25;
    const src = u.uSrc.value as number[];
    src.fill(-1);
    let n = 0;
    for (const s of SITES) {
      const age = tc - s.emit;
      if (age < 0 || age > 1.4 || tc > WAVE_START + 0.3 || n >= MAX_SRC) continue;
      const th = (s.k / 13) * Math.PI * 2 + 0.25;
      const uu = s.j * M + (s.k * 3 * M) / 13;
      src[n * 4] = x0 + uu * R;
      src[n * 4 + 1] = cy + R * Math.sin(th);
      src[n * 4 + 2] = age;
      src[n * 4 + 3] = Math.cos(th) > 0 ? 1 : 0;
      n++;
    }
  },
  frag: /* glsl */ `
uniform vec4 uSrc[24];

const float CYCLE = 10.0;
const float IND_START = 0.3;
const float IND_TAU = 1.3;
const float WAVE_START = 4.6;
const float WAVE_DUR = 0.7;
const float BURST = 5.6;
const float BURST_TAU = 0.26;
const float TRACE_T = 3.0;
const float M = 0.3; // bead pitch in tube radii

float indCurve(float tau) { return tau < 0.0 ? 0.0 : 0.3 * exp(-tau / IND_TAU); }
float burstCurve(float tau) {
  if (tau < -0.06) return 0.0;
  if (tau < 0.0) return 0.95 * smoothstep(-0.06, 0.0, tau);
  return 0.95 * exp(-tau / BURST_TAU);
}

/* One trace curve as a glowing line: f over [from, upTo] on the axis. */
vec3 curve(vec2 c, float left, float right, float base, float height, float upTo, float from, int which, vec3 col) {
  if (upTo <= from) return vec3(0.0);
  float tau = (c.x - left) / (right - left) * TRACE_T;
  if (tau < from || tau > min(upTo, TRACE_T)) return vec3(0.0);
  float e = 0.004;
  float f0 = which == 0 ? indCurve(tau) : burstCurve(tau);
  float f1 = which == 0 ? indCurve(tau + e) : burstCurve(tau + e);
  float y = base - f0 * height;
  float slope = (f1 - f0) / e * height / (right - left) * TRACE_T;
  float d = abs(c.y - y) / sqrt(1.0 + slope * slope);
  return col * (stroke(d, 1.0) * 1.1 + exp(-d * d / 26.0) * 0.3);
}

void main() {
  vec2 c = cssCoord();
  vec2 S = cssSize();
  float tc = mod(uTime, CYCLE);
  float out_ = 1.0 - smoothstep(CYCLE - 0.8, CYCLE - 0.1, tc);

  float R = min(S.y * 0.17, S.x * 0.125);
  float cy = S.y * 0.33;
  float skew = 0.42;
  float x0 = S.x * 0.07 + R * skew + R * 0.25;
  float len = S.x * 0.95 - x0;
  float u = (c.x - x0) / R;
  float v = (c.y - cy) / R;
  float px = 1.0 / R;
  float tail = 1.0 - smoothstep(len * 0.6, len, c.x - x0);

  float front = x0 + sat((tc - WAVE_START) / WAVE_DUR) * len;
  bool inPhase = tc >= WAVE_START && tc < BURST + 0.9;
  float pulse = 0.5 + 0.5 * sin((tc - WAVE_START) * TAU * 2.2);
  float flash = tc >= BURST ? exp(-(tc - BURST) / BURST_TAU) : 0.0;
  float build = smoothstep(WAVE_START, BURST, tc) * (tc < BURST ? 1.0 : 0.0);
  float settle = 1.0 - smoothstep(BURST + 0.5, BURST + 0.9, tc);

  vec3 light = vec3(0.0);

  if (c.x > x0 - R * 0.1 && abs(v) < 1.25) {
    float region = smoothstep(1.2, 1.0, abs(v)) * smoothstep(x0 - R * 0.1, x0 + R * 0.25, c.x);
    for (int w = 0; w < 2; w++) {
      bool back = w == 1;
      vec4 b = tubeBead(u, v, 0.25, back, M);
      float r = M * 0.36;
      float depth = 0.5 + 0.5 * b.y;
      float lum = (back ? 0.14 : 0.2 + 0.8 * depth * depth) * tail;
      float core = 1.0 - smoothstep(r - px, r + px, b.x);
      float halo = exp(-b.x * b.x / (r * r * 0.9));
      light += uW * lum * core * (b.z < 0.5 ? 0.55 : 0.34);

      // In step: lit by the passing excitation, all at one phase.
      if (inPhase && c.x <= front) {
        float lit = smoothstep(front, front - len * 0.1, c.x);
        float a = ((0.2 + 0.35 * pulse * (0.4 + build)) * (1.0 - flash) * lit + flash) * settle;
        vec3 col = mix(uA, iri(0.9 + u * 0.01), 0.2);
        light += col * lum * a * (core * 1.4 + halo * (0.6 + 0.7 * flash) * region);
      }
    }
    // Round the tube: darker toward its silhouette, a soft highlight above the axis.
    light *= 0.5 + 0.5 * sqrt(max(1.0 - v * v, 0.0));
    light += uW * 0.06 * exp(-pow((v + 0.4) / 0.25, 2.0)) * tail * region;
    // Tube walls: soft rims.
    float rim = exp(-pow((abs(v) - 1.06) / (px * 1.6 + 0.01), 2.0));
    light += uW * rim * 0.22 * tail;
    light += uDim * 0.05 * (1.0 - v * v) * step(abs(v), 1.0) * tail;
  }

  // The emitted light. On their own, sites flash at random moments and
  // each sends out its own small wavelet, out of step with the rest; in
  // step, the tube sends out coherent wavefronts, bright and brief.
  for (int i = 0; i < 24; i++) {
    vec4 e = uSrc[i];
    if (e.z < 0.0) continue;
    float d = length(c - e.xy);
    float near = 0.35 + 0.65 * e.w;
    float br = M * R * 0.36;
    float f = sat(1.0 - e.z / 0.45);
    light += uB * near * f * ((1.0 - smoothstep(br - 1.0, br + 1.0, d)) * 1.3 + exp(-d * d / (br * br * 3.0)) * 0.9);
    float rad = e.z * R * 1.1;
    float fade = exp(-e.z * 3.0) * smoothstep(0.0, 0.1, e.z);
    light += mix(uB, iri(0.45 + e.z * 0.3), 0.3) * stroke(d - rad, 1.0) * fade * near * 0.55;
  }
  float dv = abs(c.y - cy) - R * 1.12;
  if (dv > 0.0) {
    float spread = exp(-dv / (R * 1.3)) * smoothstep(x0 - R * 0.9, x0 + R * 0.4, c.x) * (1.0 - smoothstep(x0 + len * 0.55, x0 + len, c.x));
    float lam = R * 0.3;
    float coh = flash + 0.25 * build * pulse;
    float ph = dv / lam - (tc - WAVE_START) * 7.0;
    float bands = pow(0.5 + 0.5 * cos(ph * TAU), 6.0);
    float lit = smoothstep(front + R, front - R, c.x);
    light += mix(uA, iri(0.9 + ph * 0.02), 0.35) * bands * coh * spread * lit * 0.9;
  }

  // The open end: an ellipse with the 13 protofilaments round the core.
  vec2 e = vec2((c.x - x0) / (skew * R), (c.y - cy) / R);
  float er = length(e);
  float ellD = (er - 1.06) * R * min(skew, 1.0);
  light += uW * stroke(ellD, 0.8) * 0.35;
  light += uDim * stroke((er - 0.78) * R * skew, 0.6) * 0.18;
  for (int k = 0; k < 13; k++) {
    float th = float(k) / 13.0 * TAU + 0.25;
    vec2 p = vec2(x0 - skew * R * cos(th), cy + R * sin(th));
    float d = length(c - p);
    float mr = M * R * 0.36 * 1.5;
    light += uW * stroke(d - mr, 0.8) * 0.8;
    light += uW * (1.0 - smoothstep(mr * 0.4, mr * 0.4 + 1.0, d)) * 0.6;
    light += uA * flash * settle * exp(-d * d / (mr * mr * 2.0)) * 0.8;
  }

  // The burst: the tube flares and one wavefront leaves it.
  if (flash > 0.01) {
    float hv = (c.y - cy) / (R * 2.2);
    float along = smoothstep(x0 - R, x0 + R, c.x) * (1.0 - smoothstep(x0 + len * 0.6, x0 + len, c.x));
    light += uA * flash * 0.5 * exp(-hv * hv * 2.0) * along;
    float age = tc - BURST;
    float grow = age * S.x * 0.4;
    vec2 ctr = vec2(x0 + len * 0.36, cy);
    vec2 rad = vec2(len * 0.42 + grow, R * 1.25 + grow * 0.6);
    vec2 q = (c - ctr) / rad;
    float ring = (length(q) - 1.0) * min(rad.x, rad.y);
    light += iri(0.9 + length(q) * 0.2) * stroke(ring, 1.2) * exp(-age / 0.35) * 0.9;
    light += uA * exp(-ring * ring / 140.0) * exp(-age / 0.35) * 0.3;
  }

  // The trace: emitted intensity against time, both curves on one axis.
  float left = S.x * 0.08, right = S.x * 0.95;
  float base = S.y * 0.92, height = S.y * 0.25;
  if (c.y > base - height * 1.15 && c.y < base + 6.0) {
    light += uDim * 0.35 * stroke(c.y - base, 0.5) * step(left, c.x) * step(c.x, right);
    light += uDim * 0.35 * stroke(c.x - left, 0.5) * step(base - height * 1.05, c.y);
    light += curve(c, left, right, base, height, tc - IND_START, 0.0, 0, uB);
    light += curve(c, left, right, base, height, tc - BURST, -0.06, 1, uA);
    // The pens.
    float ti = min(TRACE_T, tc - IND_START);
    if (ti > 0.0 && ti < TRACE_T) {
      vec2 hp = vec2(left + ti / TRACE_T * (right - left), base - indCurve(ti) * height);
      light += uB * exp(-dot(c - hp, c - hp) / 24.0);
    }
    float tb = min(TRACE_T, tc - BURST);
    if (tb > 0.0 && tb < TRACE_T) {
      vec2 hp = vec2(left + tb / TRACE_T * (right - left), base - burstCurve(tb) * height);
      light += uA * exp(-dot(c - hp, c - hp) / 24.0);
    }
  }

  gl_FragColor = vec4(finish(light * out_), 1.0);
}
`,
};
