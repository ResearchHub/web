import * as THREE from 'three';

/**
 * The hero's figure: a field's literature as stacks of paper on a paper
 * ground, one sheet per paper. A red line sweeps the field (the audit); as
 * it passes, the sheets holding an error slide out of their stacks, and a
 * moment later the top sheet of a few other stacks turns a paler red: later
 * papers that repeated the error. Illustrative, not data.
 *
 * Everything is drawn by three small shaders with no lights or shadow maps:
 * stacks are single boxes whose sides are striped into sheets, their
 * shadows are soft quads on the ground, and the loop is a function of time
 * alone, so a still frame is just `time = HOLD`.
 */

export interface StacksOptions {
  /** The page ground, so the field dissolves into it. */
  paper: string;
  /** The red pencil. */
  red: string;
  /** Text and striations. */
  ink: string;
  /** Draw one finished frame and stop (reduced motion). */
  still?: boolean;
  onReady?: () => void;
}

export interface StacksHandle {
  dispose: () => void;
}

/** A small seeded generator, so the field is the same on every visit. */
function mulberry(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// The loop, in seconds: the scan crosses, everything holds, then retracts.
const SWEEP = 10;
const HOLD = 15.5;
const LOOP = 18;

// A sheet of A-series paper lying flat, and how thick one reads.
const SHEET_W = 0.6;
const SHEET_D = 0.84;
const SHEET_T = 0.024;

// The direction the scan travels across the ground (unit, xz).
const SCAN_DIR = new THREE.Vector2(0.92, 0.39).normalize();
// Where the light comes from, and so which way shadows fall on the ground.
const SHADOW_DIR = new THREE.Vector2(0.78, -0.62).normalize();

const FADE = /* glsl */ `
  // How far a point is dissolved into the page: the field thins out toward
  // the left (where the headline sits) and into the distance.
  float fieldFade(vec3 w) {
    float left = smoothstep(-1.5, -10.5, w.x);
    float far = smoothstep(-7.0, -15.0, w.z);
    float right = smoothstep(13.0, 19.0, w.x);
    return clamp(max(max(left, far), right), 0.0, 1.0);
  }
`;

const STACK_VERT = /* glsl */ `
  attribute float aSeed;
  varying vec3 vW;
  varying vec3 vN;
  varying vec2 vUv;
  varying float vSeed;
  void main() {
    vec4 w = modelMatrix * instanceMatrix * vec4(position, 1.0);
    vW = w.xyz;
    vN = normalize(mat3(instanceMatrix) * normal);
    vUv = uv;
    vSeed = aSeed;
    gl_Position = projectionMatrix * viewMatrix * w;
  }
`;

const STACK_FRAG = /* glsl */ `
  precision highp float;
  uniform vec3 uPaper;
  uniform vec3 uInk;
  uniform vec3 uRed;
  uniform vec2 uScanDir;
  uniform float uScan;
  uniform float uScanOn;
  varying vec3 vW;
  varying vec3 vN;
  varying vec2 vUv;
  varying float vSeed;
  ${FADE}
  float hash(float n) { return fract(sin(n) * 43758.5453123); }

  void main() {
    vec3 sheet = vec3(0.992, 0.988, 0.972);
    vec3 col;
    if (vN.y > 0.5) {
      // The top sheet: a title, an author line and a block of text.
      col = sheet;
      float px = fwidth(vUv.y);
      float keep = 1.0 - smoothstep(0.012, 0.03, px);
      float row = floor(vUv.y / 0.052);
      float inRow = step(0.34, fract(vUv.y / 0.052));
      float len = 0.55 + 0.33 * hash(row * 7.3 + vSeed * 31.0);
      float body = inRow * step(0.13, vUv.x) * step(vUv.x, 0.13 + len * 0.74)
        * step(0.1, vUv.y) * step(vUv.y, 0.7);
      float title = step(0.2, vUv.x) * step(vUv.x, 0.8) * step(0.8, vUv.y) * step(vUv.y, 0.86);
      float author = step(0.34, vUv.x) * step(vUv.x, 0.66) * step(0.745, vUv.y) * step(vUv.y, 0.765);
      col = mix(col, uInk, keep * (body * 0.2 + title * 0.5 + author * 0.25));
      // Where lines are too fine to draw, the text block reads as a tone.
      float block = step(0.13, vUv.x) * step(vUv.x, 0.87) * step(0.1, vUv.y) * step(vUv.y, 0.7);
      col = mix(col, uInk, (1.0 - keep) * block * 0.085);
    } else {
      // A side: the edges of the sheets, each a hair lighter or darker.
      vec3 L = normalize(vec3(-0.55, 0.6, 0.6));
      float lit = 0.74 + 0.2 * max(dot(vN, L), 0.0);
      float s = vW.y / ${SHEET_T.toFixed(4)};
      float fw = fwidth(s);
      float fine = 1.0 - smoothstep(0.25, 0.7, fw);
      float gap = 1.0 - smoothstep(0.0, 0.34, abs(fract(s) - 0.5) * 2.0 - 0.62);
      float tone = (hash(floor(s) + vSeed * 91.0) - 0.5) * 0.09;
      float edge = mix(0.94, 1.0 - 0.2 * (1.0 - gap) + tone, fine);
      float ao = mix(0.8, 1.0, smoothstep(0.0, 0.42, vW.y));
      col = sheet * lit * edge * ao;
    }

    // The scan: a bright red line where the plane meets the surface, and a
    // faint wash on what it has just passed.
    float d = dot(vW.xz, uScanDir) - uScan;
    float line = exp(-abs(d) * 26.0);
    float wake = (1.0 - smoothstep(0.0, 2.6, -d)) * step(d, 0.0) * 0.16;
    col = mix(col, uRed, uScanOn * clamp(line * 0.95 + wake, 0.0, 1.0));

    col = mix(col, uPaper, fieldFade(vW));
    gl_FragColor = vec4(col, 1.0);
  }
`;

const SHADOW_VERT = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vW;
  void main() {
    vec4 w = modelMatrix * instanceMatrix * vec4(position, 1.0);
    vW = w.xyz;
    vUv = uv;
    gl_Position = projectionMatrix * viewMatrix * w;
  }
`;

const SHADOW_FRAG = /* glsl */ `
  precision highp float;
  uniform vec3 uInk;
  varying vec2 vUv;
  varying vec3 vW;
  ${FADE}
  void main() {
    // u runs across the shadow, v from the stack's foot outward.
    float across = smoothstep(0.0, 0.3, vUv.x) * smoothstep(1.0, 0.7, vUv.x);
    float along = (1.0 - smoothstep(0.15, 1.0, vUv.y)) * smoothstep(0.0, 0.05, vUv.y);
    float a = 0.3 * across * along * (1.0 - fieldFade(vW));
    gl_FragColor = vec4(uInk, a);
  }
`;

const GROUND_FRAG = /* glsl */ `
  precision highp float;
  uniform vec3 uRed;
  uniform vec2 uScanDir;
  uniform float uScan;
  uniform float uScanOn;
  varying vec2 vUv;
  varying vec3 vW;
  ${FADE}
  void main() {
    float d = dot(vW.xz, uScanDir) - uScan;
    float line = exp(-abs(d) * 30.0);
    float wake = (1.0 - smoothstep(0.0, 2.2, -d)) * step(d, 0.0) * 0.07;
    float a = uScanOn * clamp(line * 0.8 + wake, 0.0, 1.0) * (1.0 - fieldFade(vW));
    gl_FragColor = vec4(uRed, a);
  }
`;

// Flagged sheets. `aAt` is when the scan reaches the sheet; `aSlide` is how
// far (and which way, xz) it slides out; a copy has no slide and simply
// thickens into view a moment after its source is flagged.
const FLAG_VERT = /* glsl */ `
  attribute float aAt;
  attribute vec2 aSlide;
  attribute float aCopy;
  uniform float uTime;
  uniform float uOut;
  varying vec3 vW;
  varying vec3 vN;
  varying vec2 vUv;
  varying float vCopy;
  varying float vShow;
  float easeOutBack(float t) {
    float c = 1.4;
    float u = t - 1.0;
    return 1.0 + (c + 1.0) * u * u * u + c * u * u;
  }
  void main() {
    float t = clamp((uTime - aAt) / 0.7, 0.0, 1.0);
    float show = easeOutBack(t) * uOut;
    vec3 p = position;
    vec4 w = modelMatrix * instanceMatrix * vec4(p, 1.0);
    w.xz += aSlide * show;
    vW = w.xyz;
    vN = normalize(mat3(instanceMatrix) * normal);
    vUv = uv;
    vCopy = aCopy;
    vShow = clamp(t * uOut * 3.0, 0.0, 1.0);
    gl_Position = projectionMatrix * viewMatrix * w;
  }
`;

const FLAG_FRAG = /* glsl */ `
  precision highp float;
  uniform vec3 uPaper;
  uniform vec3 uRed;
  varying vec3 vW;
  varying vec3 vN;
  varying vec2 vUv;
  varying float vCopy;
  varying float vShow;
  ${FADE}
  void main() {
    if (vShow < 0.02) discard;
    vec3 L = normalize(vec3(-0.55, 0.6, 0.6));
    float lit = vN.y > 0.5 ? 1.0 : 0.72 + 0.2 * max(dot(vN, L), 0.0);
    vec3 col = uRed * lit;
    if (vN.y > 0.5) {
      // The sheet's text, reversed out of the red.
      float px = fwidth(vUv.y);
      float keep = 1.0 - smoothstep(0.012, 0.03, px);
      float inRow = step(0.34, fract(vUv.y / 0.052));
      float body = inRow * step(0.13, vUv.x) * step(vUv.x, 0.8) * step(0.1, vUv.y) * step(vUv.y, 0.7);
      col = mix(col, vec3(1.0), keep * body * 0.3);
    }
    // A copy is the same red, a little lighter: it inherited the error.
    col = mix(col, vec3(1.0), vCopy * 0.28);
    col = mix(uPaper, col, vShow);
    col = mix(col, uPaper, fieldFade(vW));
    gl_FragColor = vec4(col, 1.0);
  }
`;

interface Stack {
  x: number;
  z: number;
  h: number;
  rot: number;
}

/** Lays the field out: denser and taller toward the right and the middle. */
function layout(rand: () => number): Stack[] {
  const stacks: Stack[] = [];
  const stepX = 0.98;
  const stepZ = 1.22;
  for (let gz = -14; gz <= 9; gz++) {
    for (let gx = -13; gx <= 19; gx++) {
      const x = gx * stepX + (rand() - 0.5) * 0.3 + (gz % 2 ? 0.2 : -0.2);
      const z = gz * stepZ + (rand() - 0.5) * 0.3;
      // A soft ridge of well-cited work through the middle of the field.
      const ridge = Math.exp(-((x - 4.5) ** 2) / 70 - (z + 1.5) ** 2 / 34);
      const present = 0.3 + 0.7 * ridge;
      if (rand() > present) continue;
      const r = rand();
      const tall = rand() < 0.045 * (0.4 + ridge) ? 1.6 + rand() * 2.6 : 0;
      const h = 0.07 + (0.16 + 1.5 * ridge) * r * r * r + 0.5 * ridge * rand() + tall * ridge;
      stacks.push({ x, z, h: Math.max(SHEET_T * 3, h), rot: (rand() - 0.5) * 0.16 });
    }
  }
  return stacks;
}

export function createStacks(canvas: HTMLCanvasElement, opts: StacksOptions): StacksHandle {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    powerPreference: 'high-performance',
  });
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(26, 1, 0.5, 120);

  const paper = new THREE.Color(opts.paper).convertLinearToSRGB();
  const red = new THREE.Color(opts.red).convertLinearToSRGB();
  const ink = new THREE.Color(opts.ink).convertLinearToSRGB();
  const shared = {
    uPaper: { value: paper },
    uRed: { value: red },
    uInk: { value: ink },
    uScanDir: { value: SCAN_DIR },
    uScan: { value: -100 },
    uScanOn: { value: 1 },
    uTime: { value: 0 },
    uOut: { value: 1 },
  };

  const rand = mulberry(20261118);
  const stacks = layout(rand);
  const disposables: { dispose: () => void }[] = [renderer];

  // The stacks.
  const box = new THREE.BoxGeometry(SHEET_W, 1, SHEET_D).translate(0, 0.5, 0);
  const seeds = new Float32Array(stacks.length);
  const stackMat = new THREE.ShaderMaterial({
    uniforms: shared,
    vertexShader: STACK_VERT,
    fragmentShader: STACK_FRAG,
  });
  const stackMesh = new THREE.InstancedMesh(box, stackMat, stacks.length);
  const m = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const up = new THREE.Vector3(0, 1, 0);
  stacks.forEach((s, i) => {
    q.setFromAxisAngle(up, s.rot);
    m.compose(new THREE.Vector3(s.x, 0, s.z), q, new THREE.Vector3(1, s.h, 1));
    stackMesh.setMatrixAt(i, m);
    seeds[i] = rand();
  });
  box.setAttribute('aSeed', new THREE.InstancedBufferAttribute(seeds, 1));
  stackMesh.frustumCulled = false;
  stackMesh.renderOrder = 2;
  scene.add(stackMesh);
  disposables.push(box, stackMat);

  // Their shadows: a quad from each stack's foot, away from the light.
  const quad = new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2).translate(0, 0, -0.5);
  // After the rotation the quad spans x ∈ [-.5, .5], z ∈ [-1, 0]; v runs 0 → 1
  // toward -z, so it is laid along the shadow direction below.
  const shadowMat = new THREE.ShaderMaterial({
    uniforms: shared,
    vertexShader: SHADOW_VERT,
    fragmentShader: SHADOW_FRAG,
    transparent: true,
    depthWrite: false,
  });
  const shadowMesh = new THREE.InstancedMesh(quad, shadowMat, stacks.length);
  const shadowAngle = Math.atan2(-SHADOW_DIR.x, -SHADOW_DIR.y);
  stacks.forEach((s, i) => {
    const len = 0.5 + s.h * 0.85;
    q.setFromAxisAngle(up, shadowAngle);
    m.compose(
      new THREE.Vector3(
        s.x - SHADOW_DIR.x * 0.3,
        0.004 + (i % 7) * 0.0004,
        s.z - SHADOW_DIR.y * 0.3
      ),
      q,
      new THREE.Vector3(1.05, 1, len + 0.3)
    );
    shadowMesh.setMatrixAt(i, m);
  });
  shadowMesh.frustumCulled = false;
  shadowMesh.renderOrder = 1;
  scene.add(shadowMesh);
  disposables.push(quad, shadowMat);

  // The ground only shows the scan line.
  const ground = new THREE.PlaneGeometry(90, 70).rotateX(-Math.PI / 2);
  const groundMat = new THREE.ShaderMaterial({
    uniforms: shared,
    vertexShader: SHADOW_VERT.replace('instanceMatrix * ', ''),
    fragmentShader: GROUND_FRAG,
    transparent: true,
    depthWrite: false,
  });
  const groundMesh = new THREE.Mesh(ground, groundMat);
  groundMesh.position.y = 0.002;
  groundMesh.renderOrder = 0;
  scene.add(groundMesh);
  disposables.push(ground, groundMat);

  // Which sheets hold an error: more likely in tall, much-cited stacks.
  const scanMin = Math.min(...stacks.map((s) => s.x * SCAN_DIR.x + s.z * SCAN_DIR.y)) - 1.5;
  const scanMax = Math.max(...stacks.map((s) => s.x * SCAN_DIR.x + s.z * SCAN_DIR.y)) + 1.5;
  const reachedAt = (x: number, z: number) =>
    ((x * SCAN_DIR.x + z * SCAN_DIR.y - scanMin) / (scanMax - scanMin)) * SWEEP;

  interface Flag {
    x: number;
    y: number;
    z: number;
    rot: number;
    at: number;
    slide: [number, number];
    copy: boolean;
  }
  const flags: Flag[] = [];
  stacks.forEach((s) => {
    if (s.h < 0.3 || rand() > 0.11 + s.h * 0.12) return;
    const y = s.h * (0.3 + 0.62 * rand());
    // Slide out toward the viewer's right or toward the front, whichever
    // side of the stack the camera sees.
    const front = rand() < 0.5;
    const dir = front ? [Math.sin(s.rot), Math.cos(s.rot)] : [Math.cos(s.rot), -Math.sin(s.rot)];
    const reach = (front ? SHEET_D : SHEET_W) * (0.34 + 0.2 * rand());
    const at = reachedAt(s.x, s.z);
    flags.push({
      x: s.x,
      y,
      z: s.z,
      rot: s.rot,
      at,
      slide: [dir[0] * reach, dir[1] * reach],
      copy: false,
    });

    // About one error in five is copied (159 of 872 in the astrophysics
    // audit); a few are copied many times.
    if (rand() > 0.5) return;
    const copies = 1 + Math.floor(rand() * rand() * 6);
    for (let c = 0; c < copies; c++) {
      const target = stacks[Math.floor(rand() * stacks.length)];
      const dist = Math.hypot(target.x - s.x, target.z - s.z);
      if (target === s || dist < 1.4 || dist > 9) continue;
      flags.push({
        x: target.x,
        y: target.h,
        z: target.z,
        rot: target.rot,
        at: at + 1.1 + c * 0.3,
        slide: [0, 0],
        copy: true,
      });
    }
  });

  const flagBox = new THREE.BoxGeometry(SHEET_W * 1.005, SHEET_T * 1.5, SHEET_D * 1.005).translate(
    0,
    SHEET_T * 0.75,
    0
  );
  flagBox.setAttribute(
    'aAt',
    new THREE.InstancedBufferAttribute(new Float32Array(flags.map((f) => f.at)), 1)
  );
  flagBox.setAttribute(
    'aSlide',
    new THREE.InstancedBufferAttribute(new Float32Array(flags.flatMap((f) => f.slide)), 2)
  );
  flagBox.setAttribute(
    'aCopy',
    new THREE.InstancedBufferAttribute(new Float32Array(flags.map((f) => (f.copy ? 1 : 0))), 1)
  );
  const flagMat = new THREE.ShaderMaterial({
    uniforms: shared,
    vertexShader: FLAG_VERT,
    fragmentShader: FLAG_FRAG,
  });
  const flagMesh = new THREE.InstancedMesh(flagBox, flagMat, flags.length);
  flags.forEach((f, i) => {
    q.setFromAxisAngle(up, f.rot);
    m.compose(new THREE.Vector3(f.x, f.y, f.z), q, new THREE.Vector3(1, 1, 1));
    flagMesh.setMatrixAt(i, m);
  });
  flagMesh.frustumCulled = false;
  flagMesh.renderOrder = 3;
  scene.add(flagMesh);
  disposables.push(flagBox, flagMat);

  // The camera looks down on the field from the front right. The scene's
  // centre is moved off the canvas's centre so the field sits where the
  // layout leaves room: right of the text on wide screens, above it on phones.
  const target = new THREE.Vector3(3.2, 0.5, -0.6);
  const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
  let width = 0;
  let height = 0;
  function resize() {
    const rect = canvas.getBoundingClientRect();
    width = Math.max(1, Math.round(rect.width));
    height = Math.max(1, Math.round(rect.height));
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height, false);
    const wide = width >= 768;
    camera.fov = wide ? 26 : 30;
    camera.aspect = width / height;
    // Shift the principal point: + moves the scene right / down.
    const shiftX = wide ? -0.25 * width : 0;
    const shiftY = wide ? -0.02 * height : 0.3 * height;
    camera.setViewOffset(width, height, shiftX, shiftY, width, height);
    camera.updateProjectionMatrix();
  }

  function place(time: number) {
    const drift = Math.sin(time * 0.11) * 0.06;
    const wide = width >= 768;
    const dist = wide ? 27 : 52;
    const az = 0.42 + drift + pointer.x * 0.045;
    const el = 0.62 + pointer.y * 0.025;
    camera.position.set(
      target.x + Math.sin(az) * Math.cos(el) * dist,
      target.y + Math.sin(el) * dist,
      target.z + Math.cos(az) * Math.cos(el) * dist
    );
    camera.lookAt(target);
  }

  function draw(time: number) {
    const t = time % LOOP;
    shared.uTime.value = t;
    shared.uScan.value = scanMin + (scanMax - scanMin) * Math.min(t / SWEEP, 1.2);
    shared.uScanOn.value = t < SWEEP * 1.1 ? 1 : 0;
    // Everything retracts over the loop's last stretch.
    const out = (t - HOLD) / (LOOP - HOLD - 0.4);
    shared.uOut.value =
      1 - Math.min(1, Math.max(0, out)) ** 2 * (3 - 2 * Math.min(1, Math.max(0, out)));
    pointer.x += (pointer.tx - pointer.x) * 0.04;
    pointer.y += (pointer.ty - pointer.y) * 0.04;
    place(time);
    renderer.render(scene, camera);
  }

  let raf = 0;
  let running = false;
  let visible = true;
  let started = 0;
  // Open partway through the sweep, so the first thing seen is the audit at work.
  const OFFSET = 2.4;
  function frame(now: number) {
    if (!running) return;
    if (!started) started = now;
    draw((now - started) / 1000 + OFFSET);
    raf = requestAnimationFrame(frame);
  }
  function setRunning(next: boolean) {
    if (opts.still || next === running) return;
    running = next;
    cancelAnimationFrame(raf);
    if (running) raf = requestAnimationFrame(frame);
  }

  const onPointer = (e: PointerEvent) => {
    pointer.tx = (e.clientX / window.innerWidth - 0.5) * 2;
    pointer.ty = (e.clientY / window.innerHeight - 0.5) * 2;
  };
  const onVisibility = () => setRunning(visible && !document.hidden);
  const ro = new ResizeObserver(() => {
    resize();
    if (opts.still || !running) draw(opts.still ? HOLD - 1 : OFFSET);
  });
  const io = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    setRunning(visible && !document.hidden);
  });

  resize();
  ro.observe(canvas);
  io.observe(canvas);
  if (opts.still) {
    draw(HOLD - 1);
  } else {
    window.addEventListener('pointermove', onPointer, { passive: true });
    document.addEventListener('visibilitychange', onVisibility);
    setRunning(true);
  }
  opts.onReady?.();

  return {
    dispose() {
      running = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener('pointermove', onPointer);
      document.removeEventListener('visibilitychange', onVisibility);
      disposables.forEach((d) => d.dispose());
    },
  };
}
