import { THEMES, hexToRgb } from '../../theme';

/**
 * What every Spectral figure shares: one full-frame triangle, a fragment
 * shader per figure, and a small GLSL prelude. Shaders are GLSL ES 1.00 so
 * they run on WebGL1 and WebGL2 alike.
 */

export type Uniforms = Record<string, { value: number | number[] | Float32Array }>;

export interface SpectralFigure {
  /** The representative moment: the captured still and the reduced-motion frame. */
  still: number;
  /** The figure's fragment shader body (the prelude is prepended). */
  frag: string;
  /** Figure-specific uniforms with their initial values. */
  uniforms: () => Uniforms;
  /** Per-frame uniform values; `w`, `h` are CSS pixels. */
  update: (u: Uniforms, t: number, w: number, h: number) => void;
}

export const VERTEX = /* glsl */ `
attribute vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const rgb = (hex: string) => hexToRgb(hex).map((c) => c / 255);
const T = THEMES.spectral;

/** Palette uniforms, from the Spectral theme in theme.ts. */
export const paletteUniforms = (): Uniforms => ({
  uInk: { value: rgb(T.ink) },
  uA: { value: rgb(T.gold) },
  uB: { value: rgb(T.ice) },
  uW: { value: rgb(T.white) },
  uDim: { value: rgb(T.dim) },
  uAcc: { value: rgb(T.accent) },
});

export const PRELUDE = /* glsl */ `
precision highp float;
uniform vec2 uRes;   // device pixels
uniform float uDpr;
uniform float uTime;
uniform vec3 uInk, uA, uB, uW, uDim, uAcc;

#define PI 3.14159265
#define TAU 6.2831853

float sat(float x) { return clamp(x, 0.0, 1.0); }

float hash12(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

/* Thin-film colour: the hue a soap film shows as its thickness (x)
   changes, leaning on the two branch colours so the figures stay in the
   set's palette. */
vec3 iri(float x) {
  vec3 s = 0.5 + 0.5 * cos(TAU * (x + vec3(0.0, 0.33, 0.67)));
  vec3 ab = mix(uA, uB, 0.5 + 0.5 * cos(TAU * x));
  return mix(s, ab, 0.35);
}

/* CSS-pixel coordinates, y down, and the box size in CSS pixels. */
vec2 cssCoord() { return vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y) / uDpr; }
vec2 cssSize() { return uRes / uDpr; }

/* Light is added on the midnight ground and rolled off softly, so bright
   overlaps go white-hot instead of clipping to a flat colour. A little
   noise keeps the dark gradients from banding. */
vec3 finish(vec3 light) {
  light = max(light, 0.0);
  vec3 c = uInk + (1.0 - uInk) * (1.0 - exp(-light));
  c += (hash12(gl_FragCoord.xy + fract(uTime) * 61.0) - 0.5) / 255.0 * 1.5;
  return c;
}

/* Soft line of half-width w (CSS px) around distance d. */
float stroke(float d, float w) { return 1.0 - smoothstep(w - 0.6, w + 0.6, abs(d)); }

/* One bead of a microtubule's lattice: 13 protofilaments round the tube, a
   3-start helix, beads of pitch m (in tube radii). u runs along the axis,
   v across it (-1..1, tube radius 1); back = true reads the far wall.
   Returns (distance to the nearest bead centre, depth cos(theta),
   alpha/beta parity, protofilament*64 + monomer as an id). */
vec4 tubeBead(float u, float v, float roll, bool back, float m) {
  float th = asin(clamp(v, -0.999, 0.999));
  if (back) th = PI - th;
  float dth = TAU / 13.0;
  float k = floor((th - roll) / dth + 0.5);
  float thk = k * dth + roll;
  float pf = mod(k, 13.0);
  float uk = u - pf * 3.0 * m / 13.0;
  float j = floor(uk / m + 0.5);
  float du = uk - j * m;
  float across = v - sin(thk);
  return vec4(length(vec2(across, du)), cos(thk), mod(j, 2.0), pf * 64.0 + j);
}
`;
