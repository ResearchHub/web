import { hash2, smoothstep } from '../../visuals/palette';
import type { SpectralFigure } from './glsl';

/**
 * The hero. A microtubule drawn per pixel as a lit cylinder with its real
 * lattice: 13 protofilaments of alternating α/β beads wound as a 3-start
 * helix. It is in two states at once: a magenta and a cyan copy that drift
 * apart along a travelling wave, and where they overlap their light
 * interferes, in fringes of film colour. Then the superposition reduces:
 * one copy wins (equal odds, chosen per cycle), turns white and settles
 * back, a white pulse runs along it, and the other fades. Two more tubes
 * sit behind, out of focus.
 */

const CYCLE = 7.5;
const COLLAPSE = 0.74;

export const hero: SpectralFigure = {
  still: 4.6,
  uniforms: () => ({
    uWide: { value: 1 },
    uOffA: { value: 0 },
    uOffB: { value: 0 },
    uAlA: { value: 1 },
    uAlB: { value: 1 },
    uWhiteA: { value: 0 },
    uWhiteB: { value: 0 },
    uPulse: { value: -100 },
    uFlash: { value: 0 },
  }),
  update(u, t, w) {
    u.uWide.value = w >= 768 ? 1 : 0;
    const p = (((t / CYCLE) % 1) + 1) % 1;
    const cycle = Math.floor(t / CYCLE);
    const winA = hash2(cycle, 3) < 0.5;
    const split = smoothstep(0.04, 0.62, p);
    if (p < COLLAPSE) {
      u.uOffA.value = split;
      u.uOffB.value = split;
      u.uAlA.value = 1;
      u.uAlB.value = 1;
      u.uWhiteA.value = 0;
      u.uWhiteB.value = 0;
      u.uPulse.value = -100;
      u.uFlash.value = 0;
      return;
    }
    const age = (p - COLLAPSE) * CYCLE;
    const settle = Math.exp(-age * 3);
    const white = (1 - Math.exp(-age * 5)) * (1 - smoothstep(0.93, 1, p));
    const lose = Math.exp(-age * 7);
    u.uOffA.value = winA ? settle : 1;
    u.uOffB.value = winA ? 1 : settle;
    u.uAlA.value = winA ? 1 : lose;
    u.uAlB.value = winA ? lose : 1;
    u.uWhiteA.value = winA ? white : 0;
    u.uWhiteB.value = winA ? 0 : white;
    u.uPulse.value = -10 + age * 13;
    u.uFlash.value = Math.exp(-age * 1.1);
  },
  frag: /* glsl */ `
uniform float uWide;
uniform float uOffA, uOffB, uAlA, uAlB, uWhiteA, uWhiteB, uPulse, uFlash;

const float M = 0.36; // bead pitch, in tube radii

/* Light of one tube copy at axis coordinate u and across coordinate v
   (tube radii); px is one CSS pixel in tube radii. The tube is lit as a
   cylinder from the upper side: beads and body follow the Lambert term,
   and spec returns its glossy highlight band. Returns light and, in .w,
   its coverage for the interference term. */
vec4 tube(float u, float v, float roll, float px, float blur, out float spec) {
  spec = 0.0;
  if (abs(v) > 2.2) return vec4(0.0);
  float outer = 0.09 * exp(-pow(max(abs(v) - 1.0, 0.0) / 0.4, 2.0)) * step(1.0, abs(v));
  float edge = 1.0 - smoothstep(1.0 - px, 1.0 + px + blur, abs(v));
  // The cylinder's surface normal in its cross-section, toward the viewer.
  float vc = clamp(v, -1.0, 1.0);
  vec2 N = vec2(vc, sqrt(max(1.0 - vc * vc, 0.0)));
  vec2 L = normalize(vec2(0.5, 0.86));
  float lambert = max(dot(N, L), 0.0);
  spec = pow(max(dot(N, normalize(L + vec2(0.0, 1.0))), 0.0), 26.0) * edge;
  // Near wall.
  vec4 b = tubeBead(u, v, roll, false, M);
  float r = M * 0.36;
  float core = 1.0 - smoothstep(r - px - blur, r + px + blur, b.x);
  float halo = exp(-b.x * b.x / (r * r * 3.2));
  float lum = (0.12 + 1.1 * lambert) * (b.z < 0.5 ? 1.0 : 0.72);
  float light = lum * (core * 0.95 + halo * 0.2);
  // Far wall, faint through the hollow.
  vec4 f = tubeBead(u, v, roll, true, M);
  float fcore = 1.0 - smoothstep(r - px - blur, r + px + blur, f.x);
  light += fcore * 0.12 * (1.0 - core);
  // The body between the beads, and a thin bright rim.
  light += 0.06 + 0.1 * lambert;
  light += 0.18 * exp(-pow((abs(v) - 1.0) / (px * 2.0 + blur + 0.02), 2.0));
  return vec4(vec3(light * edge + outer), edge);
}

void main() {
  vec2 c = cssCoord();
  vec2 S = cssSize();
  vec2 P = vec2(c.x, S.y - c.y) / S.y; // y up, units of box height
  float px = 1.0 / S.y;

  vec2 ctr, d;
  float R;
  if (uWide > 0.5) {
    ctr = vec2(S.x / S.y * 0.69, 0.5);
    d = normalize(vec2(0.52, 0.85));
    R = 0.112;
  } else {
    ctr = vec2(S.x / S.y * 0.5, 0.715);
    d = normalize(vec2(1.0, 0.5));
    R = 0.088;
  }
  vec2 n = vec2(-d.y, d.x);
  vec2 rel = P - ctr;
  float u = dot(rel, d) / R;
  float v0 = dot(rel, n) / R;
  float pxR = px / R;
  float roll = uTime * 0.22;

  // The two copies, pushed apart along a travelling wave.
  float wave = 0.86 + 0.16 * sin(u * 0.45 - uTime * 1.3);
  float offA = uOffA * wave * 0.58;
  float offB = uOffB * wave * 0.58;
  float specA, specB, specX;
  vec4 ta = tube(u, v0 - offA, roll, pxR, 0.0, specA) * uAlA;
  vec4 tb = tube(u + 0.5 * M, v0 + offB, roll + 0.1, pxR, 0.0, specB) * uAlB;

  vec3 colA = mix(uA, uW, uWhiteA);
  vec3 colB = mix(uB, uW, uWhiteB);
  vec3 light = colA * ta.rgb * 1.35 + colB * tb.rgb * 1.35;

  // Where the copies overlap, their light interferes: bright and dark
  // fringes across the overlap, each in its own film colour, drifting with
  // the travelling wave and fading as one copy wins.
  float both = ta.w * tb.w;
  float wphase = u * 0.45 - uTime * 1.3;
  float phase = v0 * 6.5 - u * 0.35 - uTime * 1.6;
  float fringe = 0.5 + 0.5 * cos(phase * PI);
  float apart = smoothstep(0.12, 0.45, min(uOffA, uOffB) * wave);
  vec3 film = iri(phase * 0.07 + 0.1 * sin(wphase));
  light *= 1.0 - both * apart * 0.55 * (1.0 - fringe);
  light += film * both * apart * (0.25 + 1.25 * fringe * fringe);

  // The glossy band on each copy is a thin film: a rainbow that shifts
  // along the tube with the travelling wave. The white winner keeps a
  // softer, paler film.
  float thick = u * 0.1 - uTime * 0.18 + 0.12 * sin(wphase);
  vec3 filmA = mix(iri(thick + 0.15), uW, 0.15 + 0.5 * uWhiteA);
  vec3 filmB = mix(iri(thick + 0.6), uW, 0.15 + 0.5 * uWhiteB);
  light += filmA * specA * uAlA * 1.15;
  light += filmB * specB * uAlB * 1.15;

  // The reduction: a white pulse along the winning tube.
  float win = max(ta.w * uWhiteA, tb.w * uWhiteB);
  light += uW * win * uFlash * exp(-pow((u - uPulse) / 1.6, 2.0)) * 1.2;
  light += uW * win * uFlash * 0.12;

  // Two tubes behind, out of focus.
  vec2 c2 = ctr + n * (uWide > 0.5 ? 0.4 : -0.32) - d * 0.12;
  vec2 c3 = ctr - n * (uWide > 0.5 ? 0.42 : -0.52) + d * 0.2;
  vec4 t2 = tube(dot(P - c2, d) / (R * 0.55), dot(P - c2, n) / (R * 0.55), -roll, pxR, 0.12, specX);
  vec4 t3 = tube(dot(P - c3, d) / (R * 0.4), dot(P - c3, n) / (R * 0.4), roll * 0.7, pxR, 0.2, specX);
  light += mix(uDim, iri(0.15), 0.35) * (t2.rgb * 0.32 + t3.rgb * 0.2);

  // A soft bloom of each branch's colour behind the pair.
  float along = exp(-pow(u / 9.0, 2.0));
  light += uA * 0.07 * exp(-pow((v0 - offA) / 2.6, 2.0)) * along * uAlA;
  light += uB * 0.07 * exp(-pow((v0 + offB) / 2.6, 2.0)) * along * uAlB;

  // Faint two-source rings around the pair: the field they share.
  float rr = length(rel) / R;
  light += iri(rr * 0.05 - uTime * 0.03) * 0.035 * exp(-rr * 0.12) * (1.0 + 0.5 * cos(rr * 3.0 - uTime));

  // The warm, wet surroundings: drifting motes.
  vec2 cell = floor(c / 46.0);
  vec2 jit = vec2(hash12(cell), hash12(cell + 17.0));
  vec2 mote = (cell + 0.2 + 0.6 * jit) * 46.0
    + 6.0 * vec2(sin(uTime * (0.7 + jit.x) + jit.y * 6.0), cos(uTime * (0.9 + jit.y) + jit.x * 6.0));
  float md = length(c - mote);
  light += uDim * 0.35 * exp(-md * md / 2.5) * step(0.55, hash12(cell + 5.0));

  // Vignette.
  vec2 vq = c / S - 0.5;
  light *= 1.0 - 0.35 * dot(vq, vq) * 2.0;

  gl_FragColor = vec4(finish(light), 1.0);
}
`,
};
