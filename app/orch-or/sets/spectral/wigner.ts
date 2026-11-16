import { smoothstep } from '../../visuals/palette';
import type { SpectralFigure } from './glsl';

/**
 * Q3, decoherence. The Wigner function of a cat state, one particle in two
 * places (x = ±a), as a luminous field seen from above with contour lines:
 * magenta and cyan peaks are the two branches; between them the
 * interference term 2·D·e^{-x²-p²}·cos(2ap) shows as fringes, bright where
 * positive and cut dark where negative (no classical distribution can dip
 * below zero). Environment particles streak through and drive D from 1 to
 * 0: the fringes wash out and an either-or remains; then it is re-prepared.
 */

const CYCLE = 9;

function coherence(t: number) {
  const p = ((t % CYCLE) + CYCLE) % CYCLE;
  if (p < 1.6) return 1;
  if (p < 7.6) return Math.exp(-(p - 1.6) / 1.15);
  return smoothstep(7.6, 8.9, p);
}

/** How busy the environment is: high while coherence is being lost. */
function noise(t: number) {
  const p = ((t % CYCLE) + CYCLE) % CYCLE;
  return smoothstep(1.2, 2.0, p) * (1 - smoothstep(6.2, 7.6, p));
}

export const wigner: SpectralFigure = {
  still: 1.9,
  uniforms: () => ({ uD: { value: 1 }, uNoise: { value: 0 } }),
  update(u, t) {
    u.uD.value = coherence(t);
    u.uNoise.value = noise(t);
  },
  frag: /* glsl */ `
uniform float uD;
uniform float uNoise;

const float SEP = 2.9;

vec3 parts(vec2 q) {
  float ga = exp(-(q.x + SEP) * (q.x + SEP) - q.y * q.y);
  float gb = exp(-(q.x - SEP) * (q.x - SEP) - q.y * q.y);
  float gi = 2.0 * uD * exp(-q.x * q.x - q.y * q.y) * cos(2.0 * SEP * q.y);
  return vec3(ga, gb, gi);
}

float wf(vec2 q) { vec3 g = parts(q); return g.x + g.y + g.z; }

void main() {
  vec2 c = cssCoord();
  vec2 S = cssSize();
  float unit = min(S.x * 0.92 / 9.6, S.y / 6.4);
  vec2 q = vec2(c.x - S.x * 0.5, S.y * 0.5 - c.y) / unit;

  vec3 g = parts(q);
  float w = g.x + g.y + g.z;
  vec3 light = vec3(0.0);

  // A faint ground glow over the whole distribution, so the negative
  // dips can be cut out of it.
  float env = exp(-q.x * q.x * 0.08 - q.y * q.y * 0.35);
  light += mix(uB, uA, 0.5) * 0.05 * env;

  // The two branches.
  light += uA * g.x * 1.25 + uB * g.y * 1.25;

  // Interference: positive fringes in film colour, negative ones dark.
  float film = q.y * 0.2 + q.x * 0.05 + 0.2 + 0.02 * uTime;
  vec3 coh = mix(iri(film), uW, 0.1 + 0.4 * sat(g.z - 1.2));
  light += coh * max(g.z, 0.0) * 1.15;
  light *= 1.0 - sat(-g.z * 1.4) * 0.92;
  light += iri(film + 0.5) * sat(-g.z) * 0.08;

  // Contours of W every 0.2, sized in screen pixels via the gradient.
  float e = 0.02;
  vec2 grad = vec2(wf(q + vec2(e, 0.0)) - wf(q - vec2(e, 0.0)),
                   wf(q + vec2(0.0, e)) - wf(q - vec2(0.0, e))) / (2.0 * e);
  float L = 0.2;
  float dl = (fract(w / L + 0.5) - 0.5) * L / max(length(grad), 1e-3) * unit;
  float level = floor(w / L + 0.5);
  float on = step(0.5, abs(level)) * stroke(dl, 0.55);
  vec3 lineCol = level < 0.0 ? iri(film + 0.6) * 0.8
    : mix(mix(uA, uB, smoothstep(-1.0, 1.0, q.x)), uW, sat(g.z * 2.0));
  light += lineCol * on * 0.55 * smoothstep(0.0, 0.3, abs(w));

  // Phase-space axes.
  float ax = stroke(c.y - S.y * 0.5, 0.5) + stroke(c.x - S.x * 0.5, 0.5);
  light += uDim * ax * 0.1;

  // Environment: particles streaking through, more while coherence falls.
  float row = floor(c.y / 7.0);
  float h1 = hash12(vec2(row, 3.0));
  float h2 = hash12(vec2(row, 11.0));
  float speed = (0.35 + h2 * 0.8) * (h1 < 0.5 ? 1.0 : -1.0);
  float span = S.x + 160.0;
  float head = fract(h1 * 7.0 + uTime * speed * 0.45) * span - 80.0;
  float behind = (c.x - head) * -sign(speed);
  float tail = behind > 0.0 ? exp(-behind / 16.0) : exp(behind * 0.8);
  float rowY = (row + 0.5) * 7.0;
  float thin = exp(-pow((c.y - rowY) / (0.8 + 0.6 * exp(-max(behind, 0.0) / 3.0)), 2.0));
  float live = step(hash12(vec2(row, floor(uTime * 0.6 + h2 * 9.0))), 0.1 + 0.32 * uNoise);
  light += mix(uDim, uW, 0.5) * tail * thin * live * (0.2 + 0.8 * uNoise) * 1.1;

  gl_FragColor = vec4(finish(light), 1.0);
}
`,
};
