import { hash2, smoothstep } from '../../visuals/palette';
import type { SpectralFigure } from './glsl';

/**
 * Q5, objective reduction. Spacetime as a grid of light lensed by a mass.
 * The mass is in two places at once, so there are two geometries: a
 * magenta grid bent by the mass on the left, a cyan grid bent by the mass
 * on the right, superposed (where they disagree they make a moiré). The
 * gauge at the right accumulates E_G·t/ħ; when it reaches 1 (t ≈ τ = ħ/E_G)
 * one geometry wins, white, and the other vanishes; which one is random,
 * with equal odds. Then the gauge drains and it starts again.
 */

const CYCLE = 8.5;
const COLLAPSE = 0.64;
const split = (p: number) => smoothstep(0.06, 0.52, Math.min(p, COLLAPSE));

const STEPS = 256;
const GAUGE = (() => {
  const table = new Float64Array(STEPS + 1);
  let acc = 0;
  for (let i = 1; i <= STEPS; i++) {
    acc += split((i / STEPS) * COLLAPSE) ** 2 * (COLLAPSE / STEPS);
    table[i] = acc;
  }
  return table.map((v) => v / acc);
})();

export const spacetime: SpectralFigure = {
  still: 4.2,
  uniforms: () => ({
    uSplit: { value: 0 },
    uAlA: { value: 1 },
    uAlB: { value: 1 },
    uWhiteA: { value: 0 },
    uWhiteB: { value: 0 },
    uGauge: { value: 0 },
    uFlash: { value: 0 },
  }),
  update(u, t) {
    const p = (((t / CYCLE) % 1) + 1) % 1;
    const cycle = Math.floor(t / CYCLE);
    const winA = hash2(cycle, 41) < 0.5;
    const collapsed = p >= COLLAPSE;
    const fadeIn = smoothstep(0, 0.05, p);
    if (!collapsed) {
      u.uSplit.value = split(p);
      u.uAlA.value = fadeIn;
      u.uAlB.value = fadeIn;
      u.uWhiteA.value = 0;
      u.uWhiteB.value = 0;
      u.uGauge.value = GAUGE[Math.round((p / COLLAPSE) * STEPS)];
      u.uFlash.value = 0;
      return;
    }
    const age = (p - COLLAPSE) * CYCLE;
    const loser = 1 - smoothstep(COLLAPSE, COLLAPSE + 0.025, p);
    const white = smoothstep(COLLAPSE, COLLAPSE + 0.05, p);
    const out = 1 - smoothstep(0.94, 1, p);
    u.uSplit.value = 1;
    u.uAlA.value = (winA ? 1 : loser) * out;
    u.uAlB.value = (winA ? loser : 1) * out;
    u.uWhiteA.value = winA ? white : 0;
    u.uWhiteB.value = winA ? 0 : white;
    u.uGauge.value = 1 - smoothstep(COLLAPSE + 0.02, 0.8, p);
    u.uFlash.value = Math.exp(-age * 2.4);
  },
  frag: /* glsl */ `
uniform float uSplit, uAlA, uAlB, uWhiteA, uWhiteB, uGauge, uFlash;

const float SEP = 0.34;

/* Where the grid line through point c came from, for a mass at m: the
   sheet is pulled in toward the mass (a lens), more strongly close in. */
vec2 unwarp(vec2 c, vec2 m, float sigma, float k) {
  vec2 d = c - m;
  float r2 = dot(d, d);
  return c + d * k * exp(-r2 / (sigma * sigma));
}

float grid(vec2 q, float g) {
  vec2 f = abs(fract(q / g + 0.5) - 0.5) * g;
  return max(stroke(f.x, 0.55), stroke(f.y, 0.55));
}

void main() {
  vec2 c = cssCoord();
  vec2 S = cssSize();
  vec3 light = vec3(0.0);

  float cx = S.x * 0.45;
  float cy = S.y * 0.52;
  float off = uSplit * SEP * S.x * 0.5;
  vec2 mA = vec2(cx - off, cy);
  vec2 mB = vec2(cx + off, cy);
  float sigma = S.y * 0.2;
  float g = S.y / 13.0;
  float k = 0.9;

  // Each geometry's grid, and how deep each point sits in its well.
  vec2 qa = unwarp(c, mA, sigma, k);
  vec2 qb = unwarp(c, mB, sigma, k);
  float wellA = exp(-dot(c - mA, c - mA) / (sigma * sigma));
  float wellB = exp(-dot(c - mB, c - mB) / (sigma * sigma));
  // Lines thin out a little where the sheet is stretched into the well.
  float ga = grid(qa - vec2(cx, cy), g) * (1.0 - 0.35 * wellA);
  float gb = grid(qb - vec2(cx, cy), g) * (1.0 - 0.35 * wellB);

  float fade = smoothstep(S.x * 0.86, S.x * 0.78, c.x) * smoothstep(0.0, S.y * 0.08, c.y) * smoothstep(S.y, S.y * 0.92, c.y) * smoothstep(0.0, S.x * 0.05, c.x);
  vec3 colA = mix(uA, uW, uWhiteA);
  vec3 colB = mix(uB, uW, uWhiteB);
  light += colA * ga * uAlA * 0.85 * fade;
  light += colB * gb * uAlB * 0.85 * fade;

  // The depth of each well, as a soft glow pooling at its centre.
  light += colA * wellA * wellA * 0.25 * uAlA * fade;
  light += colB * wellB * wellB * 0.25 * uAlB * fade;
  // Where both grids light the same pixel, a film-coloured sheen.
  light += iri(dot(c, vec2(0.002, 0.003)) + uTime * 0.03) * ga * gb * uAlA * uAlB * 0.5 * fade;

  // The masses.
  float mr = S.y * 0.028;
  float da = length(c - mA), db = length(c - mB);
  light += colA * uAlA * (1.0 - smoothstep(mr - 1.0, mr + 1.0, da)) * 1.6;
  light += colA * uAlA * exp(-da * da / (mr * mr * 6.0)) * 0.6;
  light += colB * uAlB * (1.0 - smoothstep(mr - 1.0, mr + 1.0, db)) * 1.6;
  light += colB * uAlB * exp(-db * db / (mr * mr * 6.0)) * 0.6;
  // The reduction flash.
  vec2 mw = uWhiteA > uWhiteB ? mA : mB;
  float dw = length(c - mw);
  light += uW * uFlash * (exp(-dw * dw / (sigma * sigma * 0.5)) * 0.6 + stroke(dw - (1.0 - uFlash) * sigma * 2.5, 1.5) * 0.8);

  // The gauge: E_G·t/ħ, filling in film colour, white at 1.
  float bx = S.x * 0.915, bw = max(5.0, S.x * 0.012);
  float bt = S.y * 0.16, bb = S.y * 0.86;
  vec2 bq = vec2(abs(c.x - bx) - bw * 0.5, max(bt - c.y, c.y - bb));
  float box = length(max(bq, 0.0)) + min(max(bq.x, bq.y), 0.0);
  light += uDim * stroke(box, 0.6) * 0.6;
  float level = bb - uGauge * (bb - bt);
  if (bq.x < -1.0 && c.y > level && c.y < bb - 1.0) {
    float h = (bb - c.y) / (bb - bt);
    vec3 fill = mix(uB, uA, h) * 0.8 + iri(h * 0.6 + 0.1) * 0.5;
    light += mix(fill, uW, smoothstep(0.9, 1.0, uGauge)) * (0.9 + 0.8 * smoothstep(0.9, 1.0, uGauge));
  }
  // The threshold tick at 1.
  light += uW * 0.7 * stroke(c.y - bt, 0.6) * step(abs(c.x - bx), bw * 1.4);

  gl_FragColor = vec4(finish(light), 1.0);
}
`,
};
