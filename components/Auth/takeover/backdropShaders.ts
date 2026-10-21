/**
 * Fragment shaders for the sign-in takeover's backdrop. Each defines
 * `vec3 shade(vec2 fragCoord)` from `uRes`, `uTime` (seconds) and `uLayout`
 * (0 for the desktop panel, 1 for the band above the form on small screens),
 * and its motion repeats every eight seconds.
 */

export const BACKDROP_IDS = ['helix', 'threads', 'film'] as const;
export type BackdropId = (typeof BACKDROP_IDS)[number];

const COMMON = `
#define PI 3.14159265359
#define TAU 6.28318530718
const float LOOP = 8.0;
float hash11(float n) { return fract(sin(n * 127.1) * 43758.5453); }
float hash21(vec2 p) { p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
vec2 hash22(vec2 p) { vec3 q = fract(vec3(p.xyx) * vec3(.1031, .1030, .0973)); q += dot(q, q.yzx + 33.33); return fract((q.xx + q.yz) * q.zy); }
float vnoise(vec2 p) {
  vec2 i = floor(p), f = fract(p); vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash21(i), hash21(i + vec2(1, 0)), u.x), mix(hash21(i + vec2(0, 1)), hash21(i + vec2(1, 1)), u.x), u.y);
}
float fbm(vec2 p) { float s = 0.0, a = 0.5; for (int i = 0; i < 5; i++) { s += a * vnoise(p); p = p * 2.03 + 17.1; a *= 0.5; } return s; }
// A point that walks a small circle once per loop, so noise animates seamlessly.
vec2 loopWalk(float t, float r) { float a = TAU * t / LOOP; return r * vec2(cos(a), sin(a)); }
vec3 tonemap(vec3 c) { c = 1.0 - exp(-c); return pow(c, vec3(1.0 / 2.2)); }
float grain(vec2 fc, float t) { return hash21(fc + fract(t * 7.13) * 100.0) - 0.5; }
// Soft out-of-focus dots for depth.
vec3 bokeh(vec2 uv, float t, vec3 tint) {
  vec3 acc = vec3(0.0);
  for (int k = 0; k < 2; k++) {
    float sc = k == 0 ? 7.0 : 13.0;
    vec2 g = uv * sc + loopWalk(t, 0.35 + 0.2 * float(k));
    vec2 id = floor(g), f = fract(g) - 0.5;
    float h = hash21(id + float(k) * 9.1);
    if (h > 0.72) {
      vec2 o = (hash22(id) - 0.5) * 0.5;
      float r = mix(0.12, 0.3, hash21(id * 1.7));
      acc += tint * smoothstep(r, r * 0.55, length(f - o)) * (h - 0.72) * (k == 0 ? 0.9 : 0.5);
    }
  }
  return acc;
}
`;

/**
 * B-DNA at true proportions (radius 1, 0.34 rise and 36 degrees of twist per
 * base pair, strands offset to open the major and minor grooves), ray-marched.
 * It screws one base pair along its axis per loop.
 */
const HELIX = `
const float RISE = 0.34;
const float TWIST = 0.6283185;
const float GROOVE = 2.35;
const float RB = 0.13;
const float RR = 0.07;
mat3 FR; vec3 ORI; float PHASE; float SLIDE;
float sdCap(vec3 p, vec3 a, vec3 b, float r, out float h) { vec3 pa = p - a, ba = b - a; h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0); return length(pa - ba * h) - r; }
vec3 strand(float i, float s) { float a = i * TWIST + PHASE + s * GROOVE; return vec3(cos(a), sin(a), i * RISE + SLIDE); }
// x: distance, y: material (0 backbone, 1 base near strand A, 2 base near strand B), z: base-pair index
vec3 map(vec3 p) {
  vec3 q = transpose(FR) * (p - ORI);
  float i0 = floor((q.z - SLIDE) / RISE);
  vec3 res = vec3(1e5, 0.0, 0.0);
  float h;
  for (int k = -1; k <= 2; k++) {
    float i = i0 + float(k);
    vec3 a0 = strand(i, 0.0), a1 = strand(i + 1.0, 0.0), b0 = strand(i, 1.0), b1 = strand(i + 1.0, 1.0);
    float d = min(sdCap(q, a0, a1, RB, h), sdCap(q, b0, b1, RB, h));
    if (d < res.x) res = vec3(d, 0.0, i);
    float dr = sdCap(q, a0 * vec3(0.9, 0.9, 1.0), b0 * vec3(0.9, 0.9, 1.0), RR, h);
    if (dr < res.x) res = vec3(dr, h < 0.5 ? 1.0 : 2.0, i);
  }
  return res;
}
vec3 calcNormal(vec3 p) {
  vec2 e = vec2(0.002, 0.0);
  return normalize(vec3(map(p + e.xyy).x - map(p - e.xyy).x, map(p + e.yxy).x - map(p - e.yxy).x, map(p + e.yyx).x - map(p - e.yyx).x));
}
vec3 baseColor(float i, float side) {
  float t = floor(hash11(i * 3.7 + 1.3) * 4.0);
  vec3 c1 = t < 1.0 ? vec3(0.22, 0.44, 1.0) : t < 2.0 ? vec3(0.25, 0.85, 0.95) : t < 3.0 ? vec3(0.6, 0.42, 1.0) : vec3(1.0, 0.62, 0.3);
  vec3 c2 = t < 1.0 ? vec3(0.25, 0.85, 0.95) : t < 2.0 ? vec3(0.22, 0.44, 1.0) : t < 3.0 ? vec3(1.0, 0.62, 0.3) : vec3(0.6, 0.42, 1.0);
  return side < 1.5 ? c1 : c2;
}
vec3 shade(vec2 fc) {
  vec2 uv = (fc - 0.5 * uRes) / uRes.y;
  float t = uTime;
  PHASE = t / LOOP * TWIST;
  SLIDE = t / LOOP * RISE;
  vec3 w = normalize(mix(vec3(-0.28, 1.0, -0.55), vec3(-1.0, 0.3, -0.55), uLayout));
  ORI = mix(vec3(1.8, -1.1, -11.5), vec3(1.6, 0.25, -10.0), uLayout);
  vec3 u = normalize(cross(w, vec3(0.0, 0.0, 1.0))), v = cross(u, w);
  FR = mat3(u, v, w);
  vec3 rd = normalize(vec3(uv, -1.7));
  vec3 bg = mix(vec3(0.0008, 0.0015, 0.005), vec3(0.004, 0.01, 0.035), smoothstep(1.1, 0.0, length(uv - vec2(0.2, 0.05))));
  vec3 col = bg + bokeh(uv, t, vec3(0.05, 0.12, 0.35)) * 0.35;
  // Only march where the ray passes through a cylinder around the helix axis.
  vec3 lo = transpose(FR) * (-ORI), ld = transpose(FR) * rd;
  float a = dot(ld.xy, ld.xy), b = dot(lo.xy, ld.xy), c = dot(lo.xy, lo.xy) - 1.45 * 1.45;
  float disc = b * b - a * c;
  float glow = 0.0;
  if (disc > 0.0) {
    float sq = sqrt(disc);
    float d = max((-b - sq) / a, 0.0), dEnd = min((-b + sq) / a, 40.0);
    vec3 hit = vec3(-1.0);
    for (int s = 0; s < 110; s++) {
      if (d > dEnd) break;
      vec3 m = map(rd * d);
      glow += exp(-m.x * 9.0) * 0.012 * exp(-0.05 * d);
      if (m.x < 0.0015) { hit = vec3(d, m.yz); break; }
      d += m.x * 0.8;
    }
    if (hit.x > 0.0) {
      vec3 p = rd * hit.x, n = calcNormal(p);
      vec3 L = normalize(vec3(-0.5, 0.7, 0.6)), back = normalize(vec3(0.6, 0.3, -0.8));
      float diff = max(dot(n, L), 0.0), rim = pow(1.0 - max(dot(n, -rd), 0.0), 3.0);
      float spec = pow(max(dot(reflect(-L, n), -rd), 0.0), 48.0);
      vec3 alb = hit.y < 0.5 ? vec3(0.55, 0.68, 1.0) : baseColor(hit.z, hit.y);
      vec3 lit = alb * (0.03 + 0.75 * diff) + vec3(1.0) * spec * 0.9 + vec3(0.25, 0.5, 1.0) * rim * 1.6 + alb * max(dot(n, back), 0.0) * 0.3;
      col = mix(lit, bg, 1.0 - exp(-0.06 * max(hit.x - 8.0, 0.0)));
    }
  }
  col += vec3(0.2, 0.4, 1.0) * glow * 0.8;
  return tonemap(col * 1.25) + grain(fc, t) * 0.012;
}
`;

/** Glowing nerve threads from ridges of warped noise, cell bodies, and pulses running out from each cell. */
const THREADS = `
float fbm3(vec2 p) { float s = 0.0, a = 0.5; for (int i = 0; i < 3; i++) { s += a * vnoise(p); p = p * 2.03 + 17.1; a *= 0.5; } return s / 0.875; }
float ridgeField(vec2 p, float t) {
  vec2 q = vec2(fbm3(p * 0.7 + loopWalk(t, 0.12)), fbm3(p * 0.7 + vec2(5.2, 1.3) - loopWalk(t, 0.1)));
  float n = fbm3(p * 0.9 + 1.6 * q);
  return 1.0 - abs(n - 0.5) * 2.0;
}
vec3 shade(vec2 fc) {
  vec2 uv = fc / uRes.y;
  float t = uTime;
  vec3 col = vec3(0.0008, 0.0012, 0.004);
  for (int layer = 0; layer < 2; layer++) {
    float fl = float(layer);
    vec2 p = uv * mix(2.4, 4.2, fl) * mix(1.0, 1.2, uLayout) + vec2(3.0 * fl, 1.7 * fl);
    float r = ridgeField(p, t + fl * 2.0);
    float fil = pow(r, mix(60.0, 90.0, fl));
    float halo = pow(r, 14.0) * 0.08;
    vec2 ip = floor(p * 0.45);
    float dmin = 9.0; vec2 soma = vec2(0.0);
    for (int y = -1; y <= 1; y++) for (int x = -1; x <= 1; x++) {
      vec2 g = ip + vec2(float(x), float(y));
      vec2 o = (g + 0.2 + 0.6 * hash22(g + fl * 7.0)) / 0.45;
      float dd = length(p - o);
      if (dd < dmin) { dmin = dd; soma = o; }
    }
    float pulse = pow(0.5 + 0.5 * sin(dmin * 5.0 - TAU * 2.0 * t / LOOP + hash21(soma) * TAU), 14.0);
    float fade = mix(1.0, 0.35, fl);
    vec3 fcol = mix(vec3(0.12, 0.35, 1.0), vec3(0.2, 0.85, 1.0), r);
    col += fcol * (fil * 0.7 + halo) * fade;
    col += vec3(0.75, 0.95, 1.0) * fil * pulse * 1.6 * fade * exp(-dmin * 0.6);
    float body = exp(-dmin * dmin * mix(90.0, 160.0, fl));
    col += vec3(1.0, 0.85, 0.65) * body * 1.3 * fade + vec3(0.2, 0.45, 1.0) * exp(-dmin * 4.0) * 0.25 * fade;
  }
  return tonemap(col * 1.2) + grain(fc, t) * 0.015;
}
`;

/**
 * A soap bubble coloured by thin-film interference, I ~ sin^2(2 pi n d cos(theta) / lambda),
 * with the film draining thinner at the top and swirling.
 */
const FILM = `
vec3 film(float d, float ct) {
  vec3 ph = TAU * 2.0 * 1.33 * d * ct / vec3(650.0, 540.0, 450.0);
  vec3 s = sin(ph * 0.5);
  return s * s;
}
vec3 shade(vec2 fc) {
  vec2 uv = (fc - 0.5 * uRes) / uRes.y;
  float t = uTime;
  vec2 c = mix(vec2(0.12, 0.1), vec2(0.17, 0.03), uLayout);
  vec2 q = (uv - c) / mix(0.36, 0.38, uLayout);
  float r2 = dot(q, q);
  vec3 col = mix(vec3(0.0008, 0.0015, 0.005), vec3(0.004, 0.009, 0.03), smoothstep(1.3, 0.0, length(uv - c)));
  col += bokeh(uv, t, vec3(0.05, 0.12, 0.35)) * 0.25;
  if (r2 < 1.0) {
    vec3 n = vec3(q, sqrt(1.0 - r2));
    float ct = n.z;
    vec2 sp = n.xy * 1.6;
    vec2 w = vec2(fbm(sp * 1.4 + loopWalk(t, 0.25)), fbm(sp * 1.4 + vec2(3.1, 7.7) - loopWalk(t, 0.2)));
    float swirl = fbm(sp * 1.2 + 2.6 * w);
    float d = mix(60.0, 900.0, smoothstep(0.95, -0.9, n.y)) + (swirl - 0.5) * 480.0 * smoothstep(0.98, 0.6, n.y);
    float fres = 0.04 + 0.96 * pow(1.0 - ct, 4.0);
    vec3 env = mix(vec3(0.12, 0.16, 0.3), vec3(0.5, 0.6, 0.9), smoothstep(-0.2, 0.9, n.y));
    vec3 c3 = film(max(d, 0.0), ct) * env * (0.32 + 1.1 * fres);
    // Reflections of a window: a long arc and a bright point.
    float arc = exp(-pow((length(n.xy - vec2(0.1, -0.1)) - 0.82) / 0.035, 2.0)) * smoothstep(0.1, 0.6, -n.x + n.y);
    vec2 hp = n.xy - vec2(-0.42, 0.45);
    c3 += vec3(1.0) * (arc * 0.45 + exp(-dot(hp, hp) * 90.0) * 0.9);
    c3 += vec3(0.7, 0.8, 1.0) * pow(1.0 - ct, 7.0) * 0.4;
    col = mix(col, col * 0.6 + c3, smoothstep(1.0, 0.985, r2));
  }
  return tonemap(col * 1.3) + grain(fc, t) * 0.012;
}
`;

export const BACKDROP_SHADERS: Record<BackdropId, string> = {
  helix: COMMON + HELIX,
  threads: COMMON + THREADS,
  film: COMMON + FILM,
};

/** The helix is ray-marched, so it draws at a lower pixel ratio than the 2D fields. */
export const BACKDROP_MAX_PIXEL_RATIO: Record<BackdropId, number> = {
  helix: 1,
  threads: 1.5,
  film: 1.5,
};
