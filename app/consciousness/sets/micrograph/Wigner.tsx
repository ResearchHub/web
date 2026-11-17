'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { SceneProps } from './MicrographLive';
import { beginHud, drawStrip } from './hud';
import {
  GREY,
  LIN,
  clamp,
  fract,
  hash2,
  lumpyBead,
  semMaterial,
  smoothstep,
  substrateMaterial,
} from './sem';
import { pxPerUnitAt } from './tube';

/**
 * Q4, decoherence: the Wigner function of a "cat" state (one particle in
 * two places, x = ±a) as a surface in relief. The two peaks are the two
 * branches, painted chartreuse and violet; the ripples between are the
 * interference term 2·D·e^{-x²-p²}·cos(2ap), grey, with dips below zero
 * that no classical distribution can have. Specks of environment (orange)
 * strike the surface and drive D from 1 to 0: the ripples flatten and two
 * plain peaks remain; then the state is re-prepared. Maths and timing
 * follow visuals/scenes/wigner.ts.
 */

const CYCLE = 9;
const XMAX = 4.6;
const PMAX = 2.5;
const SEP = 2.35;
const STILL = 2.5;
const NX = 170;
const NP = 92;
const U = 20; // world units per x or p unit
const H = 19; // world units per unit of W
const SPECKS = 30;

function coherence(t: number) {
  const p = fract(t / CYCLE) * CYCLE;
  if (p < 1.6) return 1;
  if (p < 7.6) return Math.exp(-(p - 1.6) / 1.15);
  return smoothstep(7.6, 8.9, p);
}

const m4 = new THREE.Matrix4();
const q = new THREE.Quaternion();
const v = new THREE.Vector3();
const s3 = new THREE.Vector3();
const c = new THREE.Color();
const Y_AXIS = new THREE.Vector3(0, 1, 0);
const DIST = 250;

export function Wigner({ still, hud }: SceneProps) {
  const surf = useRef<THREE.Mesh>(null);
  const specks = useRef<THREE.InstancedMesh>(null);
  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(2 * XMAX * U, 2 * PMAX * U, NX, NP);
    g.rotateX(-Math.PI / 2);
    g.setAttribute(
      'color',
      new THREE.BufferAttribute(new Float32Array(g.attributes.position.count * 3), 3)
    );
    return g;
  }, []);
  const mat = useMemo(
    () => semMaterial({ base: 0.1, edge: 1.3, vertexColors: true, grid: 0.45, gridCells: [1, 34] }),
    []
  );
  const speckGeo = useMemo(() => lumpyBead(9, 1, 0.3), []);
  const speckMat = useMemo(() => semMaterial({ base: 0.3, edge: 1.2 }), []);
  const sub = useMemo(() => substrateMaterial(1), []);

  useFrame((state) => {
    const t = still ? STILL : STILL + state.clock.elapsedTime;
    const { width: w, height: h } = state.size;
    const cam = state.camera as THREE.PerspectiveCamera;
    const narrow = w / h < 1.1;
    const d0 = narrow ? DIST * 1.5 : DIST;
    // Seen from a front corner, so the ripples (bands along x) show in relief.
    cam.position.set(d0 * 0.42, d0 * 0.6, d0 * 0.72);
    cam.lookAt(narrow ? 6 : 0, narrow ? 4 : -2, narrow ? 0 : 6);

    const D = coherence(t);
    const theta = Math.sin(t * 0.5) * 0.6;

    const pos = geo.attributes.position as THREE.BufferAttribute;
    const col = geo.attributes.color as THREE.BufferAttribute;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i) / U;
      const p = -pos.getZ(i) / U;
      const gA = Math.exp(-((x + SEP) ** 2) - p * p);
      const gB = Math.exp(-((x - SEP) ** 2) - p * p);
      const gi = 2 * D * Math.exp(-x * x - p * p) * Math.cos(2 * SEP * p + theta);
      const W = gA + gB + gi;
      pos.setY(i, W * H);
      c.copy(GREY)
        .multiplyScalar(0.62)
        .lerp(LIN.a, clamp(gA * 1.5) * 0.85)
        .lerp(LIN.b, clamp(gB * 1.5) * 0.85);
      if (W < 0) c.multiplyScalar(1 - 0.55 * clamp(-W * 1.4));
      else c.multiplyScalar(1 + 0.18 * clamp(gi));
      col.setXYZ(i, c.r, c.g, c.b);
    }
    pos.needsUpdate = true;
    col.needsUpdate = true;
    geo.computeVertexNormals();

    // Environment specks: more of them as coherence is lost.
    const rate = 1 - D;
    if (specks.current) {
      for (let i = 0; i < SPECKS; i++) {
        const P = 1.0 + hash2(i, 5) * 0.7;
        const ph = t / P + hash2(i, 9);
        const k = Math.floor(ph);
        const tau = ph - k;
        const on = hash2(i, k) < rate * 0.7;
        let scale = 0;
        if (on && tau < 0.82) {
          const x1 = (hash2(i, k + 11) * 2 - 1) * XMAX * 0.85;
          const p1 = (hash2(i, k + 23) * 2 - 1) * PMAX * 0.8;
          const dir = hash2(i, k + 37) * Math.PI * 2;
          const land = 0.7;
          const f = Math.min(1, tau / land);
          const gA = Math.exp(-((x1 + SEP) ** 2) - p1 * p1);
          const gB = Math.exp(-((x1 - SEP) ** 2) - p1 * p1);
          const gi = 2 * D * Math.exp(-x1 * x1 - p1 * p1) * Math.cos(2 * SEP * p1 + theta);
          const y1 = (gA + gB + gi) * H + 1.5;
          const sx = x1 * U - Math.cos(dir) * 70;
          const sz = -p1 * U - Math.sin(dir) * 40;
          v.set(sx + (x1 * U - sx) * f, 70 + (y1 - 70) * f, sz + (-p1 * U - sz) * f);
          scale = tau < land ? 1.05 : 1.05 * (1 - smoothstep(land, 0.82, tau)) * 1.5;
        }
        q.setFromAxisAngle(Y_AXIS, i);
        s3.setScalar(scale);
        specks.current.setMatrixAt(i, m4.compose(v, q, s3));
        c.copy(LIN.accent).multiplyScalar(1.15);
        specks.current.setColorAt(i, c);
      }
      specks.current.instanceMatrix.needsUpdate = true;
      if (specks.current.instanceColor) specks.current.instanceColor.needsUpdate = true;
    }

    const ctx = beginHud(hud);
    if (!ctx) return;
    drawStrip(hud, ctx, {
      pxPerUnit: pxPerUnitAt(cam, h, cam.position.length()) * U,
      unit: 'x₀',
      mode: `W(x, p) · coherence D ${D.toFixed(2)}`,
      place: 'strip',
    });
  });

  return (
    <>
      <mesh ref={surf} geometry={geo} material={mat} />
      <instancedMesh ref={specks} args={[speckGeo, speckMat, SPECKS]} frustumCulled={false} />
      <mesh position={[0, -40, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[3000, 3000]} />
        <primitive object={sub} attach="material" />
      </mesh>
    </>
  );
}
