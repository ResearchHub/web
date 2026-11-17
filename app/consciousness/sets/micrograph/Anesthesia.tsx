'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { SceneProps } from './MicrographLive';
import { HUD_COLORS, beginHud, drawStrip, tracePanel } from './hud';
import {
  GREY,
  LIN,
  MT,
  clamp,
  lattice,
  lumpyBead,
  rng,
  semMaterial,
  smoothstep,
  substrateMaterial,
} from './sem';
import { pxPerUnitAt, writeTube } from './tube';

/**
 * Q1, anesthesia: a stretch of microtubule wall in relief. A collective
 * oscillation (modelled, slowed) runs along it as a chartreuse wave and a
 * slight swelling of the beads. Anesthetic molecules (violet) drift in,
 * settle in pockets between tubulins and damp the wave around them, then
 * wash out. Timings and molecule schedule follow the Ink figure
 * (visuals/scenes/anesthesia.ts); the trace sums the lattice.
 */

const CYCLE = 14;
const ROWS_INK = 7;
const MOLECULES = 16;
const FREQ = 1.4;
const TRAVEL = 1.9;
const STILL = 5.0;
const ROWS = 60;
const SPIN = 0.2;

const SITES = lattice(ROWS);
const LEN = ROWS * MT.rise;

const r = rng(303);
const MOLS = Array.from({ length: MOLECULES }, (_, i) => ({
  site: r(),
  row: Math.floor(r() * ROWS_INK),
  fromX: r(),
  fromTop: r() < 0.5,
  toX: r(),
  toTop: r() < 0.5,
  enter: 1.4 + i * 0.36 + r() * 0.3,
  leave: 8.6 + i * 0.16 + r() * 0.4,
  wob: r() * 6.28,
}));

function occupancy(m: (typeof MOLS)[number], tc: number) {
  return (
    smoothstep(m.enter + TRAVEL - 0.35, m.enter + TRAVEL, tc) *
    (1 - smoothstep(m.leave, m.leave + 0.35, tc))
  );
}

function globalAmplitude(tc: number) {
  let occ = 0;
  for (const m of MOLS) occ += occupancy(m, tc);
  return 1 - 0.86 * (occ / MOLECULES);
}

// Pockets on the face toward the viewer: θ near π (local -x faces the camera).
const POCKETS = MOLS.map((m) => {
  const k = Math.round((Math.PI + (-1.0 + (2.0 * m.row) / (ROWS_INK - 1))) / ((2 * Math.PI) / 13));
  const theta = (k + 0.5) * ((2 * Math.PI) / 13) + SPIN;
  const z = (0.12 + 0.76 * m.site) * LEN - LEN / 2;
  return { theta, z };
});

const mol = new THREE.Matrix4();
const mq = new THREE.Quaternion();
const mp = new THREE.Vector3();
const ms = new THREE.Vector3();
const mc = new THREE.Color();
const me = new THREE.Euler();
const OSC = new Float32Array(SITES.length);
const DIST = 245;

export function Anesthesia({ still, hud }: SceneProps) {
  const tube = useRef<THREE.InstancedMesh>(null);
  const mols = useRef<THREE.InstancedMesh>(null);
  const rig = useRef<THREE.Group>(null);
  const geo = useMemo(() => lumpyBead(21, 2, 0.2), []);
  const molGeo = useMemo(() => lumpyBead(3, 1, 0.3), []);
  const mat = useMemo(() => semMaterial({ base: 0.16, edge: 1.2 }), []);
  const molMat = useMemo(() => semMaterial({ base: 0.22, edge: 1.3 }), []);
  const sub = useMemo(() => substrateMaterial(1), []);

  useFrame((state) => {
    const t = still ? STILL : STILL + state.clock.elapsedTime;
    const tc = ((t % CYCLE) + CYCLE) % CYCLE;
    const { width: w, height: h } = state.size;
    const cam = state.camera as THREE.PerspectiveCamera;
    const narrow = w / h < 1.1;
    cam.position.set(0, 0, narrow ? DIST * 0.9 : DIST);
    cam.lookAt(0, 0, 0);
    if (rig.current) {
      rig.current.position.set(0, narrow ? 20 : 14, 0);
      rig.current.rotation.set(0.38, 0, narrow ? -0.1 : -0.13);
    }

    // Molecules: where each is, and how settled.
    const placed = MOLS.map((m, i) => {
      const pk = POCKETS[i];
      const R = MT.radius + 3.2;
      // Local lattice coords (axis z), then the tube is turned so z → world x.
      const px = Math.cos(pk.theta) * R;
      const py = Math.sin(pk.theta) * R;
      const pz = pk.z;
      const off = (fromX: number, top: boolean) => [
        -46, // toward the viewer (local -x)
        top ? 70 : -70,
        (fromX - 0.5) * LEN,
      ];
      let x = 0;
      let y = 0;
      let z = 0;
      let vis = 0;
      if (tc >= m.enter && tc < m.leave + TRAVEL) {
        vis = 1;
        if (tc < m.enter + TRAVEL) {
          const f = smoothstep(0, 1, (tc - m.enter) / TRAVEL);
          const [sx, sy, sz] = off(m.fromX, m.fromTop);
          x = sx + (px - sx) * f;
          y = sy + (py - sy) * f + Math.sin(tc * 5 + m.wob) * 5 * (1 - f);
          z = sz + (pz - sz) * f + Math.cos(tc * 4 + m.wob) * 5 * (1 - f);
          vis = smoothstep(0, 0.2, (tc - m.enter) / TRAVEL);
        } else if (tc < m.leave) {
          x = px;
          y = py + Math.sin(tc * 9 + m.wob) * 0.3;
          z = pz + Math.cos(tc * 8 + m.wob) * 0.3;
        } else {
          const f = smoothstep(0, 1, (tc - m.leave) / TRAVEL);
          const [ex, ey, ez] = off(m.toX, m.toTop);
          x = px + (ex - px) * f;
          y = py + (ey - py) * f + Math.sin(tc * 5 + m.wob) * 5 * f;
          z = pz + (ez - pz) * f;
          vis = 1 - smoothstep(0.75, 1, f);
        }
      }
      return { x, y, z, vis, occ: occupancy(m, tc), pk };
    });

    if (mols.current) {
      placed.forEach((p, i) => {
        mq.setFromEuler(me.set(tc * 0.7 + i, i * 1.3, 0));
        mp.set(p.x, p.y, p.z);
        const s = 2.1 * p.vis;
        ms.set(s, s, s);
        mols.current!.setMatrixAt(i, mol.compose(mp, mq, ms));
        mc.copy(GREY).lerp(LIN.b, 0.9).multiplyScalar(1.25);
        mols.current!.setColorAt(i, mc);
      });
      mols.current.instanceMatrix.needsUpdate = true;
      if (mols.current.instanceColor) mols.current.instanceColor.needsUpdate = true;
    }

    const amp = globalAmplitude(tc);
    const omega = Math.PI * 2 * FREQ;
    const k = (Math.PI * 2) / (LEN * 0.45);
    const sigma2 = 13 * 13;
    const osc = (z: number, theta: number) => {
      let damp = 0;
      for (const p of placed) {
        if (p.occ <= 0.01) continue;
        const dz = z - p.pk.z;
        let dth = Math.abs(theta - p.pk.theta) % (Math.PI * 2);
        if (dth > Math.PI) dth = Math.PI * 2 - dth;
        const ds = dth * MT.radius;
        damp += p.occ * Math.exp(-(dz * dz + ds * ds) / sigma2);
      }
      return amp * Math.max(0.04, 1 - 0.96 * clamp(damp)) * Math.sin(k * z - omega * t);
    };

    if (tube.current) {
      const o = OSC;
      for (let i = 0; i < SITES.length; i++) {
        const s = SITES[i];
        o[i] = osc(s.z - LEN / 2, s.theta + SPIN);
      }
      writeTube(tube.current, {
        sites: SITES,
        zOffset: -LEN / 2,
        spin: SPIN,
        radial: (i) => 0.9 * o[i],
        color: (i, _z, c) => {
          const v = Math.max(0, o[i]);
          c.copy(GREY)
            .lerp(LIN.a, Math.min(0.9, v * 1.15))
            .multiplyScalar(1 + 0.3 * v);
        },
      });
    }

    const ctx = beginHud(hud);
    if (!ctx) return;
    const small = w < 520;
    const sh = small ? 22 : 26;
    const ph = Math.max(66, h * 0.19);
    tracePanel(
      hud,
      ctx,
      {
        x: small ? 8 : 14,
        y: h - sh - ph - (small ? 8 : 12),
        w: small ? w - 16 : Math.min(w * 0.46, 400),
        h: ph,
      },
      'Summed oscillation · model, slowed',
      (plot) => {
        const span = 3;
        plot((x) => {
          const tau = t - span + span * x;
          const tcc = ((tau % CYCLE) + CYCLE) % CYCLE;
          return 0.5 + 0.44 * globalAmplitude(tcc) * Math.sin(omega * tau);
        }, HUD_COLORS.a);
      }
    );
    drawStrip(hud, ctx, {
      pxPerUnit: pxPerUnitAt(cam, h, cam.position.z),
      unit: 'nm',
      mode: 'SE2 · 2.0 kV',
      mag: true,
      place: 'strip',
    });
  });

  return (
    <>
      <group ref={rig}>
        <group rotation={[0, Math.PI / 2, 0]}>
          <instancedMesh ref={tube} args={[geo, mat, SITES.length]} frustumCulled={false} />
          <instancedMesh ref={mols} args={[molGeo, molMat, MOLECULES]} frustumCulled={false} />
        </group>
      </group>
      <mesh position={[0, 0, -500]}>
        <planeGeometry args={[2400, 2400]} />
        <primitive object={sub} attach="material" />
      </mesh>
    </>
  );
}
