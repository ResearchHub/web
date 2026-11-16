'use client';

import { useLayoutEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { SceneProps } from './MicrographLive';
import { beginHud, drawStrip } from './hud';
import { writeTube } from './tube';
import {
  GREY,
  LIN,
  MT,
  fract,
  hash2,
  lattice,
  lumpyBead,
  semMaterial,
  smoothstep,
  substrateMaterial,
} from './sem';

/**
 * Hero: a microtubule at high magnification, long and diagonal. A
 * superposition shows as two false-colour copies (chartreuse, violet)
 * pulled apart by a travelling wave; then it reduces: one copy (either,
 * equal odds) slides back and turns grey with a brief brightening, the other
 * crumbles away. A second tube lies out of focus behind.
 */

const CYCLE = 7.5;
const COLLAPSE = 0.74;
const STILL = CYCLE * 0.62;
const ROWS = 74;
const SEP = 15; // nm, half the separation at full superposition
const FOV = 28;
export const DIST_WIDE = 430;
export const DIST_PHONE = 640;

const SITES = lattice(ROWS);
const LEN = ROWS * MT.rise;

export function Hero({ still, hud }: SceneProps) {
  const a = useRef<THREE.InstancedMesh>(null);
  const b = useRef<THREE.InstancedMesh>(null);
  const back = useRef<THREE.InstancedMesh>(null);
  const tilt = useRef<THREE.Group>(null);
  const geo = useMemo(() => lumpyBead(11, 2, 0.2), []);
  const mat = useMemo(() => semMaterial({ base: 0.17, edge: 1.2 }), []);
  const backMat = useMemo(() => semMaterial({ base: 0.12, edge: 0.8 }), []);
  const sub = useMemo(() => substrateMaterial(1), []);

  useLayoutEffect(() => {
    // The tube behind: still, grey, out of focus.
    if (back.current)
      writeTube(back.current, {
        sites: SITES,
        zOffset: -LEN / 2,
        spin: 0.4,
        color: (_i, _z, out) => out.copy(GREY).multiplyScalar(0.7),
      });
  }, []);

  useFrame((state) => {
    const t = still ? STILL : STILL + state.clock.elapsedTime;
    const { width: w, height: h } = state.size;
    const cam = state.camera as THREE.PerspectiveCamera;
    const wide = w >= 768 || w / h > 1.05;

    // Framing: the tube in the right ~55% on wide boxes, the top on phones.
    const tanH = Math.tan(((FOV / 2) * Math.PI) / 180);
    const D = wide ? DIST_WIDE : DIST_PHONE;
    const visH = 2 * D * tanH;
    const visW = visH * (w / h);
    cam.position.set(0, 0, D);
    cam.lookAt(0, 0, 0);
    if (tilt.current) {
      tilt.current.position.set(wide ? visW * 0.2 : 0, wide ? 0 : visH * 0.2, 0);
      tilt.current.rotation.set(wide ? 0.32 : 0.2, 0, wide ? 1.12 : 0.42);
    }

    const ph = fract(t / CYCLE);
    const cycle = Math.floor(t / CYCLE);
    const winner = hash2(cycle, 3) < 0.5 ? 0 : 1;
    const s = smoothstep(0.04, 0.6, ph) * (1 - smoothstep(COLLAPSE, COLLAPSE + 0.015, ph));
    const collapsed = ph >= COLLAPSE;
    const age = collapsed ? (ph - COLLAPSE) * CYCLE : 0;
    const flash = collapsed ? Math.exp(-age * 2.2) : 0;
    // Before the reduction both copies separate; after, the winner returns.
    const back2 = collapsed ? 1 - smoothstep(0, 0.6, age) : 1;
    const paint = smoothstep(0.02, 0.35, s);
    const spin = t * 0.12;
    const wave = (z: number) => 0.45 + 0.55 * (0.5 + 0.5 * Math.sin(z * 0.034 - t * 2.4));

    const copy = (mesh: THREE.InstancedMesh | null, idx: 0 | 1) => {
      if (!mesh) return;
      const sign = idx === 0 ? 1 : -1;
      const tint = idx === 0 ? LIN.a : LIN.b;
      const isWinner = idx === winner;
      // Before splitting there is one grey tube (copy 0); copy 1 grows out.
      const presence = collapsed
        ? isWinner
          ? 1
          : 1 - smoothstep(0, 0.45, age)
        : idx === 0
          ? 1
          : smoothstep(0.0, 0.08, s);
      writeTube(mesh, {
        sites: SITES,
        zOffset: -LEN / 2,
        spin,
        shiftY: (z) => sign * SEP * (collapsed ? (isWinner ? back2 : 1) : s) * wave(z),
        scale: (i) => {
          if (presence >= 1) return 1;
          // The losing copy crumbles bead by bead.
          const jitter = hash2(i, cycle * 7 + idx);
          return smoothstep(jitter * 0.6, jitter * 0.6 + 0.4, presence);
        },
        color: (_i, z, out) => {
          if (collapsed && isWinner) {
            out.copy(tint).lerp(LIN.w, smoothstep(0, 0.35, age));
            out.multiplyScalar(1 + 1.6 * flash * (0.6 + 0.4 * wave(z)));
            out.lerp(GREY, smoothstep(0.3, 1.2, age) * 0.8);
          } else {
            out.copy(GREY).lerp(tint, paint * 0.72);
            out.multiplyScalar(1 + 0.2 * paint);
          }
        },
      });
      mesh.visible = presence > 0.001;
    };
    copy(a.current, 0);
    copy(b.current, 1);

    const ctx = beginHud(hud);
    if (ctx) {
      const pxPerNm = h / visH;
      drawStrip(hud, ctx, {
        pxPerUnit: pxPerNm,
        unit: 'nm',
        mode: 'SE2 · 3.0 kV',
        mag: true,
        place: wide ? 'bottom-right' : 'top-left',
        lift: wide ? 128 : 62,
      });
    }
  });

  const n = SITES.length;
  return (
    <>
      <group ref={tilt}>
        <group rotation={[0, Math.PI / 2, 0]}>
          <instancedMesh ref={a} args={[geo, mat, n]} frustumCulled={false} />
          <instancedMesh ref={b} args={[geo, mat, n]} frustumCulled={false} />
        </group>
      </group>
      <group position={[-150, -40, -320]} rotation={[0.1, 0, 0.78]}>
        <group rotation={[0, Math.PI / 2, 0]}>
          <instancedMesh ref={back} args={[geo, backMat, n]} frustumCulled={false} />
        </group>
      </group>
      <mesh position={[0, 0, -700]}>
        <planeGeometry args={[2400, 2400]} />
        <primitive object={sub} attach="material" />
      </mesh>
    </>
  );
}
