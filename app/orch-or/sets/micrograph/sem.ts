import * as THREE from 'three';
import { THEMES } from '../../theme';

/**
 * Shared pieces of the Micrograph set: the electron-microscope material, a
 * lumpy protein bead, the microtubule lattice and a few helpers.
 *
 * The material imitates secondary-electron imaging rather than optical
 * light: brightness comes mostly from edges (surfaces seen at a grazing
 * angle emit more electrons) plus a soft detector-side term, so forms read
 * as pale rims around darker faces. Colour is a multiplier per instance or
 * per vertex: grey for ordinary matter, false colour only where it means
 * something, and values above 1 for a brief brightening.
 */

const T = THEMES.micrograph;

/** Theme colours in linear space, for shaders. */
export const LIN = {
  ink: new THREE.Color(T.ink),
  a: new THREE.Color(T.gold),
  b: new THREE.Color(T.ice),
  w: new THREE.Color(T.white),
  accent: new THREE.Color(T.accent),
};

/** The neutral grey of unpainted matter, as a colour multiplier. */
export const GREY = new THREE.Color(0.78, 0.78, 0.76);

const SEM_VERT = /* glsl */ `
varying vec3 vN;
varying vec3 vV;
varying vec3 vC;
varying vec2 vUv;
varying vec3 vW;
void main() {
  vec4 p = vec4(position, 1.0);
  vec3 n = normal;
  #ifdef USE_INSTANCING
    p = instanceMatrix * p;
    n = mat3(instanceMatrix) * n;
  #endif
  vec4 wp = modelMatrix * p;
  vN = normalize(mat3(modelMatrix) * n);
  vV = normalize(cameraPosition - wp.xyz);
  vW = wp.xyz;
  vC = vec3(1.0);
  #ifdef USE_INSTANCING_COLOR
    vC = instanceColor;
  #elif defined(USE_COLOR)
    vC = color;
  #endif
  vUv = uv;
  gl_Position = projectionMatrix * viewMatrix * wp;
}
`;

const SEM_FRAG = /* glsl */ `
uniform vec3 uLight;
uniform float uBase;
uniform float uEdge;
uniform float uOpacity;
uniform float uGrid;
uniform vec2 uGridCells;
uniform vec3 uTint;
uniform float uEdgePow;
varying vec3 vN;
varying vec3 vV;
varying vec3 vC;
varying vec2 vUv;
varying vec3 vW;

float hash(vec3 p) {
  p = fract(p * 0.3183099 + 0.1);
  p *= 17.0;
  return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
}

void main() {
  vec3 n = normalize(vN);
  if (!gl_FrontFacing) n = -n;
  vec3 v = normalize(vV);
  float ndv = clamp(abs(dot(n, v)), 0.0, 1.0);
  // Edge effect: grazing surfaces are bright.
  float edge = pow(1.0 - ndv, uEdgePow);
  // The detector sits up and to the left: faces toward it are lighter.
  float det = max(dot(n, normalize(uLight)), 0.0);
  float s = max(0.0, uBase + 0.34 * det + uEdge * edge);
  // Fine surface tooth, as on a sputter-coated sample.
  s *= 0.93 + 0.14 * hash(floor(vW * 2.2));
  vec3 col = s * vC * uTint;
  if (uGrid > 0.0) {
    vec2 g = abs(fract(vUv * uGridCells - 0.5) - 0.5) / fwidth(vUv * uGridCells);
    float line = 1.0 - min(min(g.x, g.y), 1.0);
    col += uGrid * line * (0.25 + 0.5 * edge) * vec3(0.9);
  }
  gl_FragColor = vec4(col, uOpacity);
  #include <colorspace_fragment>
}
`;

export interface SemOptions {
  base?: number;
  edge?: number;
  transparent?: boolean;
  grid?: number;
  gridCells?: [number, number];
  vertexColors?: boolean;
  edgePow?: number;
  additive?: boolean;
}

export function semMaterial({
  base = 0.2,
  edge = 1.15,
  transparent = false,
  grid = 0,
  gridCells = [24, 24],
  vertexColors = false,
  edgePow = 2.2,
  additive = false,
}: SemOptions = {}) {
  return new THREE.ShaderMaterial({
    vertexShader: SEM_VERT,
    fragmentShader: SEM_FRAG,
    vertexColors,
    transparent: transparent || additive,
    depthWrite: !(transparent || additive),
    blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending,
    uniforms: {
      uLight: { value: new THREE.Vector3(-0.55, 0.75, 0.6) },
      uBase: { value: base },
      uEdge: { value: edge },
      uOpacity: { value: 1 },
      uGrid: { value: grid },
      uGridCells: { value: new THREE.Vector2(...gridCells) },
      uTint: { value: new THREE.Color(1, 1, 1) },
      uEdgePow: { value: edgePow },
    },
  });
}

const SUBSTRATE_FRAG = /* glsl */ `
uniform vec3 uInk;
uniform float uGrain;
varying vec2 vUv;
float h2(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(h2(i), h2(i + vec2(1, 0)), u.x), mix(h2(i + vec2(0, 1)), h2(i + vec2(1, 1)), u.x), u.y);
}
float fbm(vec2 p) {
  float a = 0.5, s = 0.0;
  for (int i = 0; i < 5; i++) { s += a * noise(p); p *= 2.03; a *= 0.5; }
  return s;
}
void main() {
  // A carbon support film: mottled grey, finely grained.
  vec2 p = vUv * 9.0;
  float m = fbm(p) * 0.65 + fbm(p * 5.3 + 7.0) * 0.35;
  float pits = smoothstep(0.62, 0.7, fbm(p * 2.4 + 3.1));
  float g = 0.004 + 0.022 * m + 0.012 * pits;
  vec3 col = uInk * 0.7 + vec3(g) * uGrain;
  gl_FragColor = vec4(col, 1.0);
  #include <colorspace_fragment>
}
`;

/** The mottled grey film the specimen lies on (a large plane behind it). */
export function substrateMaterial(grain = 1) {
  return new THREE.ShaderMaterial({
    vertexShader: /* glsl */ `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: SUBSTRATE_FRAG,
    uniforms: { uInk: { value: LIN.ink }, uGrain: { value: grain } },
  });
}

/** Seeded random numbers. */
export function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function hash2(a: number, b: number) {
  let h = Math.imul(a | 0, 374761393) + Math.imul(b | 0, 668265263);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}

export const clamp = (x: number, lo = 0, hi = 1) => Math.max(lo, Math.min(hi, x));
export function smoothstep(e0: number, e1: number, x: number) {
  const t = clamp((x - e0) / (e1 - e0));
  return t * t * (3 - 2 * t);
}
export const fract = (x: number) => x - Math.floor(x);

/**
 * A tubulin monomer: a slightly flattened sphere with lumps, so a lattice of
 * them reads as protein rather than as ball bearings.
 */
export function lumpyBead(seed = 7, detail = 2, lump = 0.16) {
  const g = new THREE.IcosahedronGeometry(1, detail);
  const pos = g.attributes.position as THREE.BufferAttribute;
  const r = rng(seed);
  const bumps = Array.from({ length: 7 }, () =>
    new THREE.Vector3(r() - 0.5, r() - 0.5, r() - 0.5).normalize()
  );
  const v = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i).normalize();
    let k = 1;
    for (const b of bumps) k += lump * Math.max(0, v.dot(b)) ** 6;
    v.multiplyScalar(k);
    pos.setXYZ(i, v.x, v.y * 0.92, v.z);
  }
  g.computeVertexNormals();
  return g;
}

/** Microtubule geometry, in nanometres. */
export const MT = {
  pf: 13,
  rise: 4.05, // one monomer along a protofilament
  radius: 11.4, // to the centre of a monomer (outer diameter ~25 nm)
  start: 3, // 3-start helix: each protofilament is offset by 3 × rise / 13
  bead: 2.35, // bead radius
};

export interface Site {
  k: number; // protofilament
  j: number; // monomer along it
  theta: number;
  z: number; // along the axis
  alpha: boolean; // α- or β-tubulin
}

/** Lattice sites of a microtubule `rows` monomers long, axis along +z from 0. */
export function lattice(rows: number): Site[] {
  const out: Site[] = [];
  for (let k = 0; k < MT.pf; k++) {
    const theta = (k / MT.pf) * Math.PI * 2;
    const off = (k * MT.start * MT.rise) / MT.pf;
    for (let j = 0; j < rows; j++) {
      out.push({ k, j, theta, z: j * MT.rise + off, alpha: j % 2 === 0 });
    }
  }
  return out;
}
