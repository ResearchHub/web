import type { SpectralFigure } from './glsl';

/**
 * Q5, from microtubule to mind. Neurons as cells in a sheet of tissue
 * (a jittered Voronoi field): each soma flashes white when it fires. Firing
 * drifts from scattered to locked to 25 ms gamma cycles (40 Hz, slowed for
 * display) and back; when locked, the flashes sweep across the sheet in
 * bands and the cycles glow magenta. Along the bottom, the summed field
 * (cyan) oscillates when they lock and goes ragged when they do not. Spike
 * timing follows the Ink raster figure.
 */

export const raster: SpectralFigure = {
  still: 6.3,
  uniforms: () => ({}),
  update() {},
  frag: /* glsl */ `
const float GAMMA = 25.0;     // ms
const float SPEED = 70.0;     // model ms per second
const float SYNC_PERIOD = 46.0;
const float WINDOW = 420.0;   // ms shown on the field trace

float synchrony(float cycle) {
  float p = fract(cycle / SYNC_PERIOD);
  return smoothstep(0.08, 0.38, p) * (1.0 - smoothstep(0.68, 0.94, p));
}

/* When neuron n fires in a gamma cycle (ms), or -1 if it does not. The
   locked time is delayed with x, so locked flashes sweep across. */
float spikeTime(float n, float cycle, float sweep) {
  float rate = 0.34 + 0.18 * hash12(vec2(n, 999.0));
  if (hash12(vec2(n, cycle)) > rate) return -1.0;
  float s = synchrony(cycle);
  float locked = GAMMA * 0.42 + (hash12(vec2(n, cycle + 7777.0)) - 0.5) * 4.0 + sweep;
  float free_ = hash12(vec2(n * 3.0 + 1.0, cycle)) * GAMMA;
  return cycle * GAMMA + locked * s + free_ * (1.0 - s);
}

float fieldAt(float ms) {
  float cyc = floor(ms / GAMMA);
  float s = mix(synchrony(cyc), synchrony(cyc + 1.0), fract(ms / GAMMA));
  float n1 = hash12(vec2(floor(ms / 6.0), 5.0));
  float n2 = hash12(vec2(floor(ms / 6.0) + 1.0, 5.0));
  float ragged = mix(n1, n2, smoothstep(0.0, 1.0, fract(ms / 6.0))) - 0.5;
  return s * cos(TAU * (ms / GAMMA - 0.42 - 0.12)) * 0.9 + (1.0 - s) * ragged * 0.55;
}

void main() {
  vec2 c = cssCoord();
  vec2 S = cssSize();
  float now = uTime * SPEED;
  vec3 light = vec3(0.0);

  float top = S.y * 0.05, bottom = S.y * 0.7;
  float cs = (bottom - top) / 6.5;

  if (c.y < bottom + cs * 0.5) {
    vec2 g = vec2(c.x, c.y - top) / cs;
    vec2 cell = floor(g);
    float f1 = 9.0, f2 = 9.0;
    vec2 best = vec2(0.0);
    vec2 bestC = vec2(0.0);
    for (int j = -1; j <= 1; j++) {
      for (int i = -1; i <= 1; i++) {
        vec2 nc = cell + vec2(float(i), float(j));
        vec2 jit = vec2(hash12(nc + 0.5), hash12(nc + 19.7));
        vec2 pt = nc + 0.2 + 0.6 * jit;
        float d = length(g - pt);
        if (d < f1) { f2 = f1; f1 = d; best = nc; bestC = pt; }
        else if (d < f2) { f2 = d; }
      }
    }
    float inside = smoothstep(bottom + cs * 0.3, bottom - cs * 0.2, c.y) * smoothstep(top - cs * 0.3, top + cs * 0.2, c.y);
    float n = best.x * 7.0 + best.y * 131.0;
    vec2 soma = vec2(bestC.x * cs, bestC.y * cs + top);
    float sweep = soma.x / S.x * 7.0;

    // Flash from this cycle's spike or the last one.
    float cyc = floor(now / GAMMA);
    float flash = 0.0;
    for (int k = 0; k < 2; k++) {
      float st = spikeTime(n, cyc - float(k), sweep);
      if (st >= 0.0 && now >= st) flash = max(flash, exp(-(now - st) / 9.0));
    }
    float s = synchrony(cyc);

    float dpx = f1 * cs;
    float somaR = cs * 0.12;
    float core = 1.0 - smoothstep(somaR - 1.0, somaR + 1.0, dpx);
    // Membrane between cells, faint; it carries the gamma glow.
    float edge = stroke((f2 - f1) * cs * 0.5, 0.6);
    float gam = s * pow(0.5 + 0.5 * cos(TAU * (now / GAMMA - 0.42 - sweep / GAMMA - 0.1)), 2.0);

    vec3 cellLight = uW * core * (0.22 + 1.6 * flash);
    cellLight += mix(uW, iri(0.1 + flash * 0.3), 0.3) * exp(-dpx * dpx / (somaR * somaR * (2.0 + 10.0 * flash))) * flash * 0.9;
    cellLight += uDim * edge * 0.16;
    cellLight += mix(uA, iri(0.92 + f1 * 0.2), 0.25) * (edge * 0.75 + exp(-f1 * f1 * 3.0) * 0.18) * gam;
    // Neurites: short spokes from each soma toward its neighbours, lit when it fires.
    float spokes = pow(abs(cos(atan(g.y - bestC.y, g.x - bestC.x) * 3.0 + hash12(best) * 6.0)), 40.0);
    cellLight += uW * spokes * smoothstep(0.55, 0.12, f1) * step(somaR, dpx) * (0.08 + 0.5 * flash);
    light += cellLight * inside;
  }

  // The summed field along the bottom: now at the right edge.
  float base = S.y * 0.86, amp = S.y * 0.065;
  float left = S.x * 0.04, right = S.x * 0.96;
  if (c.y > base - amp * 2.2 && c.y < base + amp * 2.2 && c.x > left && c.x < right) {
    float ms = now - WINDOW * (right - c.x) / (right - left);
    float y = base - amp * fieldAt(ms);
    float e = 1.5;
    float ms2 = now - WINDOW * (right - c.x - e) / (right - left);
    float slope = (fieldAt(ms2) - fieldAt(ms)) * amp / e;
    float d = abs(c.y - y) / sqrt(1.0 + slope * slope);
    light += uB * (stroke(d, 0.9) * 1.1 + exp(-d * d / 20.0) * 0.3);
    light += uDim * 0.2 * stroke(c.y - base, 0.4);
    // Gamma cycles shaded on the trace as synchrony rises.
    float cy = floor(ms / GAMMA);
    float ph = fract(ms / GAMMA - 0.42 + 0.16);
    light += uA * 0.12 * synchrony(cy) * exp(-pow((ph - 0.5) * 6.0, 2.0)) * smoothstep(amp * 2.2, amp * 1.4, abs(c.y - base));
  }

  gl_FragColor = vec4(finish(light), 1.0);
}
`,
};
