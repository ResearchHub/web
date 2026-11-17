'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import type { SceneProps } from './MicrographLive';
import { HUD_COLORS, beginHud, drawStrip, tracePanel } from './hud';
import {
  GREY,
  LIN,
  hash2,
  lumpyBead,
  rng,
  semMaterial,
  smoothstep,
  substrateMaterial,
} from './sem';
import { pxPerUnitAt } from './tube';

/**
 * Q6, gamma synchrony: cultured neurons as a scanning micrograph sees them,
 * cell bodies and neurites lying on a coverslip. Each cell lights when it
 * fires and the spike runs down its axon. A spike that lands in phase with
 * the population's 40 Hz gamma cycle is painted chartreuse, one out of phase
 * violet. Firing drifts from scattered (mostly violet, a few in phase by
 * chance) into locked gamma cycles (the whole field pulses chartreuse) and
 * back. The trace sums the population. Slowed about tenfold; spike timing
 * is the Ink figure's (visuals/scenes/raster.ts).
 */

const NEURONS = 30;
const GAMMA_MS = 25;
const WINDOW_MS = 420;
const SPEED = 95;
const SYNC_PERIOD = 46;
const STILL = 8.6;
/** How long a cell stays lit after a spike, in model ms. */
const GLOW_MS = 9;
/** Axon conduction, world units (µm) per model ms; slowed for display. */
const CONDUCT = 1.7;

function synchrony(cycle: number) {
  const p = (((cycle / SYNC_PERIOD) % 1) + 1) % 1;
  return smoothstep(0.08, 0.38, p) * (1 - smoothstep(0.68, 0.94, p));
}

function spikeTime(neuron: number, cycle: number): number | null {
  const rate = 0.34 + 0.18 * hash2(neuron, 999);
  if (hash2(neuron, cycle) > rate) return null;
  const s = synchrony(cycle);
  const locked = GAMMA_MS * 0.42 + (hash2(neuron, cycle + 7777) - 0.5) * 4;
  const free = hash2(neuron * 3 + 1, cycle) * GAMMA_MS;
  return cycle * GAMMA_MS + locked * s + free * (1 - s);
}

/** 0–1: how close a spike falls to its gamma cycle's peak. */
const inPhase = (st: number) => {
  const c = Math.floor(st / GAMMA_MS);
  const d = Math.abs(st - (c * GAMMA_MS + GAMMA_MS * 0.42));
  return 1 - smoothstep(3, 6, d);
};

// ---------------------------------------------------------------- layout

const COLS = 6;
const HALF_X = 175;
const HALF_Z = 112;

interface Cell {
  x: number;
  z: number;
  r: number;
  rot: number;
}

const CELLS: Cell[] = (() => {
  const r = rng(505);
  const rows = NEURONS / COLS;
  return Array.from({ length: NEURONS }, (_, i) => {
    const cx = i % COLS;
    const cz = Math.floor(i / COLS);
    return {
      x: -HALF_X + ((cx + 0.5) / COLS) * HALF_X * 2 + (r() - 0.5) * 34 + (cz % 2) * 12,
      z: -HALF_Z + ((cz + 0.5) / rows) * HALF_Z * 2 + (r() - 0.5) * 26,
      r: 7 + r() * 3.2,
      rot: r() * Math.PI * 2,
    };
  });
})();

/**
 * Neurites as one merged mesh of tapered tubes lying on the substrate. Each
 * vertex remembers its cell, its distance from the soma, and whether it is
 * on the axon, so the frame loop can light it.
 */
function buildNeurites() {
  const r = rng(77);
  const SIDES = 7;
  const pos: number[] = [];
  const nor: number[] = [];
  const idx: number[] = [];
  const owner: number[] = [];
  const along: number[] = [];
  const axon: number[] = [];
  const up = new THREE.Vector3(0, 1, 0);
  const tan = new THREE.Vector3();
  const bin = new THREE.Vector3();
  const off = new THREE.Vector3();

  const tube = (
    pts: THREE.Vector3[],
    radius: (f: number) => number,
    cell: number,
    start: number,
    isAxon: boolean
  ) => {
    const base = pos.length / 3;
    let d = start;
    for (let i = 0; i < pts.length; i++) {
      if (i > 0) d += pts[i].distanceTo(pts[i - 1]);
      const a = pts[Math.max(0, i - 1)];
      const b = pts[Math.min(pts.length - 1, i + 1)];
      tan.subVectors(b, a).normalize();
      bin.crossVectors(tan, up).normalize();
      const rad = radius(i / (pts.length - 1));
      for (let j = 0; j < SIDES; j++) {
        const ang = (j / SIDES) * Math.PI * 2;
        off.copy(bin).multiplyScalar(Math.cos(ang)).addScaledVector(up, Math.sin(ang));
        pos.push(pts[i].x + off.x * rad, rad * 0.78 + off.y * rad * 0.9, pts[i].z + off.z * rad);
        nor.push(off.x, off.y, off.z);
        owner.push(cell);
        along.push(d);
        axon.push(isAxon ? 1 : 0);
      }
    }
    for (let i = 0; i < pts.length - 1; i++)
      for (let j = 0; j < SIDES; j++) {
        const a = base + i * SIDES + j;
        const b = base + i * SIDES + ((j + 1) % SIDES);
        const c = a + SIDES;
        const e = b + SIDES;
        idx.push(a, c, b, b, c, e);
      }
  };

  /** A wandering path from (x, z) on a heading; steers toward `to` if given. */
  const walk = (
    x: number,
    z: number,
    heading: number,
    len: number,
    wiggle: number,
    to?: { x: number; z: number }
  ) => {
    const steps = Math.max(8, Math.round(len / 3));
    const step = len / steps;
    const pts = [new THREE.Vector3(x, 0, z)];
    let h = heading;
    let turn = 0;
    for (let i = 0; i < steps; i++) {
      turn = turn * 0.7 + (r() - 0.5) * wiggle;
      h += turn;
      if (to) {
        let want = Math.atan2(to.z - z, to.x - x) - h;
        want = Math.atan2(Math.sin(want), Math.cos(want));
        h += want * 0.22;
      }
      x += Math.cos(h) * step;
      z += Math.sin(h) * step;
      pts.push(new THREE.Vector3(x, 0, z));
    }
    return pts;
  };

  CELLS.forEach((cell, n) => {
    // Dendrites: four to six, tapering, some branching once.
    const k = 4 + Math.floor(r() * 3);
    for (let i = 0; i < k; i++) {
      const hd = cell.rot + (i / k) * Math.PI * 2 + (r() - 0.5) * 0.7;
      const len = 26 + r() * 30;
      const sx = cell.x + Math.cos(hd) * cell.r * 0.55;
      const sz = cell.z + Math.sin(hd) * cell.r * 0.55;
      const pts = walk(sx, sz, hd, len, 0.32);
      const r0 = 1.45 + r() * 0.55;
      tube(pts, (f) => r0 * (1 - 0.8 * f) + 0.25, n, 0, false);
      if (r() < 0.65) {
        const at = Math.floor(pts.length * (0.35 + r() * 0.3));
        const p = pts[at];
        const side = r() < 0.5 ? -1 : 1;
        const bl = 12 + r() * 16;
        const br = walk(p.x, p.z, hd + side * (0.5 + r() * 0.5), bl, 0.4);
        const rb = r0 * (1 - 0.8 * (at / pts.length)) * 0.75;
        tube(br, (f) => rb * (1 - 0.75 * f) + 0.2, n, (at / pts.length) * len, false);
      }
    }
    // The axon: thinner, even, wandering off toward another cell.
    const others = CELLS.map((c, j) => ({ j, d: Math.hypot(c.x - cell.x, c.z - cell.z) }))
      .filter((o) => o.j !== n)
      .sort((a, b) => a.d - b.d);
    const target = CELLS[others[Math.floor(r() * 3)].j];
    const hd = Math.atan2(target.z - cell.z, target.x - cell.x) + (r() - 0.5) * 1.2;
    const len = Math.hypot(target.x - cell.x, target.z - cell.z) * (0.85 + r() * 0.3);
    const pts = walk(
      cell.x + Math.cos(hd) * cell.r * 0.6,
      cell.z + Math.sin(hd) * cell.r * 0.6,
      hd,
      len,
      0.18,
      target
    );
    tube(pts, (f) => 0.85 - 0.2 * f, n, 0, true);
  });

  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
  g.setAttribute('color', new THREE.Float32BufferAttribute(new Float32Array(pos.length), 3));
  g.setIndex(idx);
  return {
    geo: g,
    owner: Uint8Array.from(owner),
    along: Float32Array.from(along),
    axon: Uint8Array.from(axon),
  };
}

const DEBRIS = 150;
const BINS = 120;
const KERNEL = [0.06, 0.12, 0.2, 0.24, 0.2, 0.12, 0.06];

// Per-frame scratch, so the frame loop allocates nothing.
const LAST = new Float64Array(NEURONS);
const FRESH = new Float32Array(NEURONS);
const SPIKE_C = Array.from({ length: NEURONS }, () => new THREE.Color());
const HIST = new Float64Array(BINS);
const FIELD = new Float64Array(BINS);
const m4 = new THREE.Matrix4();
const q = new THREE.Quaternion();
const v3 = new THREE.Vector3();
const s3 = new THREE.Vector3();
const c = new THREE.Color();
const Y_AXIS = new THREE.Vector3(0, 1, 0);
const DIST = 540;

export function Raster({ still, hud }: SceneProps) {
  const somas = useRef<THREE.InstancedMesh>(null);
  const debris = useRef<THREE.InstancedMesh>(null);
  const rig = useRef<THREE.Group>(null);
  const placed = useRef(false);
  const net = useMemo(() => buildNeurites(), []);
  const somaGeo = useMemo(() => {
    // Smooth-shaded: a cell body is a soft dome, not a faceted bead.
    const g = lumpyBead(11, 4, 0.22);
    g.deleteAttribute('normal');
    g.deleteAttribute('uv');
    const m = mergeVertices(g, 1e-4);
    m.computeVertexNormals();
    return m;
  }, []);
  const debrisGeo = useMemo(() => lumpyBead(4, 1, 0.4), []);
  const somaMat = useMemo(() => semMaterial({ base: 0.06, edge: 1.45 }), []);
  const netMat = useMemo(() => semMaterial({ base: 0.02, edge: 1.55, vertexColors: true }), []);
  const debrisMat = useMemo(() => semMaterial({ base: 0.12, edge: 1.1 }), []);
  const sub = useMemo(() => substrateMaterial(1.4), []);

  useFrame((state) => {
    const t = still ? STILL : STILL + state.clock.elapsedTime;
    const now = t * SPEED;
    const { width: w, height: h } = state.size;
    const cam = state.camera as THREE.PerspectiveCamera;
    const narrow = w / h < 1.1;
    const d0 = narrow ? DIST * 1.32 : DIST;
    cam.position.set(0, d0 * 0.8, d0 * 0.6);
    cam.lookAt(0, 0, narrow ? 4 : 22);
    if (rig.current) rig.current.rotation.set(0, narrow ? Math.PI / 2 : 0, 0);

    // Each cell's latest spike, how fresh it is, and its phase colour.
    const cNow = Math.floor(now / GAMMA_MS);
    for (let n = 0; n < NEURONS; n++) {
      let last = -1e9;
      for (let k = cNow - 4; k <= cNow; k++) {
        const st = spikeTime(n, k);
        if (st !== null && st <= now && st > last) last = st;
      }
      LAST[n] = last;
      FRESH[n] = Math.exp(-(now - last) / GLOW_MS);
      SPIKE_C[n].copy(LIN.b).lerp(LIN.a, inPhase(last));
    }

    if (somas.current) {
      for (let n = 0; n < NEURONS; n++) {
        const cell = CELLS[n];
        if (!placed.current) {
          q.setFromAxisAngle(Y_AXIS, cell.rot);
          v3.set(cell.x, cell.r * 0.22, cell.z);
          s3.set(cell.r * 1.08, cell.r * 0.62, cell.r);
          somas.current.setMatrixAt(n, m4.compose(v3, q, s3));
        }
        const f = FRESH[n];
        c.copy(GREY)
          .lerp(SPIKE_C[n], Math.min(0.9, f * 1.3))
          .multiplyScalar(1 + 0.9 * f);
        somas.current.setColorAt(n, c);
      }
      somas.current.instanceMatrix.needsUpdate = !placed.current;
      if (somas.current.instanceColor) somas.current.instanceColor.needsUpdate = true;
    }

    if (debris.current && !placed.current) {
      const r = rng(19);
      for (let i = 0; i < DEBRIS; i++) {
        const s = 0.5 + r() ** 2 * 1.6;
        v3.set((r() - 0.5) * HALF_X * 2.6, s * 0.3, (r() - 0.5) * HALF_Z * 2.8);
        q.setFromAxisAngle(Y_AXIS, r() * 6.28);
        s3.set(s, s * 0.7, s * (0.8 + r() * 0.6));
        debris.current.setMatrixAt(i, m4.compose(v3, q, s3));
        c.copy(GREY).multiplyScalar(0.75);
        debris.current.setColorAt(i, c);
      }
      debris.current.instanceMatrix.needsUpdate = true;
      if (debris.current.instanceColor) debris.current.instanceColor.needsUpdate = true;
    }
    placed.current = true;

    // Neurites: a glow near the soma, and a pulse running down the axon.
    const col = net.geo.attributes.color as THREE.BufferAttribute;
    const arr = col.array as Float32Array;
    for (let i = 0; i < net.owner.length; i++) {
      const n = net.owner[i];
      const d = net.along[i];
      const age = now - LAST[n];
      let light = FRESH[n] * Math.exp(-d / 11);
      if (net.axon[i] && age < 90) {
        const front = (d - age * CONDUCT) / 7;
        light = Math.max(light, Math.exp(-front * front) * Math.exp(-age / 45) * 0.95);
      }
      c.copy(GREY)
        .multiplyScalar(0.8)
        .lerp(SPIKE_C[n], Math.min(0.85, light * 1.3))
        .multiplyScalar(1 + 0.7 * light);
      arr[i * 3] = c.r;
      arr[i * 3 + 1] = c.g;
      arr[i * 3 + 2] = c.b;
    }
    col.needsUpdate = true;

    // ------------------------------------------------------------ the HUD
    const ctx = beginHud(hud);
    if (!ctx) return;
    const small = w < 520;
    const start = now - WINDOW_MS;
    const c0 = Math.floor(start / GAMMA_MS) - 1;
    HIST.fill(0);
    for (let n = 0; n < NEURONS; n++)
      for (let k = c0; k <= cNow + 1; k++) {
        const st = spikeTime(n, k);
        if (st === null || st < start || st > now) continue;
        const bi = Math.floor(((st - start) / WINDOW_MS) * BINS);
        if (bi >= 0 && bi < BINS) HIST[bi] += 1;
      }
    const mean = (NEURONS * 0.43) / (GAMMA_MS / (WINDOW_MS / BINS));
    for (let i = 0; i < BINS; i++) {
      let v = 0;
      for (let k = 0; k < KERNEL.length; k++) {
        const j = i + k - 3;
        if (j >= 0 && j < BINS) v += HIST[j] * KERNEL[k];
      }
      FIELD[i] = 0.32 + ((v - mean) / (mean * 3.2)) * 0.42;
    }

    const sh = small ? 22 : 26;
    const ph = Math.max(70, h * 0.2);
    const box = {
      x: small ? 8 : 14,
      y: h - sh - ph - (small ? 8 : 12),
      w: small ? w - 16 : Math.min(w * 0.46, 420),
      h: ph,
    };
    tracePanel(hud, ctx, box, 'Summed field · population, slowed ~10×', (plot) => {
      plot((x) => FIELD[Math.min(BINS - 1, Math.floor(x * BINS))], HUD_COLORS.w, 1, 1.4);
    });
    // Gamma cycles under the trace: chartreuse ticks, as strong as the lock.
    const px = box.x + 10;
    const pw = box.w - 20;
    for (let k = c0; k <= cNow + 1; k++) {
      const s = synchrony(k);
      if (s < 0.05) continue;
      const xf = (k * GAMMA_MS + GAMMA_MS * 0.42 - start) / WINDOW_MS;
      if (xf < 0 || xf > 1) continue;
      ctx.fillStyle = HUD_COLORS.a;
      ctx.globalAlpha = 0.85 * s;
      ctx.fillRect(px + xf * pw - 0.75, box.y + box.h - 7, 1.5, 4);
    }
    ctx.globalAlpha = 1;

    // Legend: what the two false colours mean.
    const fs = small ? 9 : 10;
    ctx.font = `500 ${fs}px ${hud.font}`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    const lx = small ? 12 : 18;
    const ly = small ? 14 : 20;
    const items: [string, string][] = [
      [HUD_COLORS.a, 'spike in phase with gamma (40 Hz)'],
      [HUD_COLORS.b, 'spike out of phase'],
    ];
    ctx.fillStyle = 'rgba(8,9,11,0.55)';
    ctx.fillRect(lx - 7, ly - 9, small ? 196 : 222, 36);
    items.forEach(([color, label], i) => {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(lx + 3, ly + i * 16, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(236,234,230,0.78)';
      ctx.fillText(label, lx + 12, ly + i * 16);
    });

    const ppu = pxPerUnitAt(cam, h, cam.position.length());
    drawStrip(hud, ctx, {
      pxPerUnit: ppu,
      unit: 'µm',
      mode: `SE · 5.0 kV   ×${Math.round((ppu / 1000) * 264600)}   gamma lock ${(synchrony(cNow) * 100).toFixed(0)}%`,
      place: 'strip',
    });
  });

  return (
    <>
      <group ref={rig}>
        <mesh geometry={net.geo} material={netMat} />
        <instancedMesh ref={somas} args={[somaGeo, somaMat, NEURONS]} frustumCulled={false} />
        <instancedMesh ref={debris} args={[debrisGeo, debrisMat, DEBRIS]} frustumCulled={false} />
      </group>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[3000, 3000]} />
        <primitive object={sub} attach="material" />
      </mesh>
    </>
  );
}
