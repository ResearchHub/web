'use client';

import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { ContactShadows } from '@react-three/drei/core/ContactShadows';
import { RoundedBox } from '@react-three/drei/core/RoundedBox';
import {
  BufferAttribute,
  BufferGeometry,
  Color,
  Object3D,
  type InstancedMesh,
  type Mesh,
  type MeshBasicMaterial,
} from 'three';
import { clamp, hash2, smoothstep } from '../../visuals/palette';
import type { ClaySceneProps } from './ClayLive';
import { C, orbit, softSpot, useSceneTime } from './common';

/**
 * Q6, from microtubule to mind. Thirty neurons as clay beads in rows on a
 * shelf; each pops up violet when it fires. Firing drifts from scattered
 * to locked to 25 ms gamma cycles (40 Hz, slowed for display): then the
 * whole population pops together, row on row, and a faint apricot glow on
 * the shelf beats with each cycle. The teal clay tube in front is the
 * summed activity over the last 140 ms, newest at the right: it
 * lies nearly flat while firing is scattered and swings in waves once the
 * population locks.
 */

const COLS = 6;
const ROWS = 5;
const NEURONS = COLS * ROWS;
const GAMMA_MS = 25;
const SPEED = 36; // model milliseconds per second of animation
const SYNC_PERIOD = 18; // gamma cycles
const WINDOW_MS = 140;
const SIGMA = 6; // ms, smoothing of the summed activity
const DIST = 17;
export const RASTER_STILL = 4.5;

const SAMPLES = 150;
const RADIAL = 14;
const TUBE_R = 0.15;
const TUBE_W = 9.6;
const TUBE_Y = -0.35;
const TUBE_Z = 3.6;
const GAIN = 1.65;

const rate = (n: number) => 0.62 + 0.2 * hash2(n, 999);

function synchrony(cycle: number) {
  const p = (((cycle / SYNC_PERIOD) % 1) + 1) % 1;
  return smoothstep(0.1, 0.36, p) * (1 - smoothstep(0.7, 0.94, p));
}

function spikeTime(n: number, cycle: number): number | null {
  if (hash2(n, cycle) > rate(n)) return null;
  const s = synchrony(cycle);
  const locked = GAMMA_MS * 0.42 + (hash2(n, cycle + 7777) - 0.5) * 3;
  const free = hash2(n * 3 + 1, cycle) * GAMMA_MS;
  return cycle * GAMMA_MS + locked * s + free * (1 - s);
}

/** The latest spike at or before `ms`, if recent. */
function lastSpike(n: number, ms: number) {
  const c = Math.floor(ms / GAMMA_MS);
  for (let k = c; k >= c - 2; k--) {
    const st = spikeTime(n, k);
    if (st !== null && st <= ms) return st;
  }
  return null;
}

/** Its long-run average, so the tube's rest line is the same either way. */
const MEAN =
  Array.from({ length: NEURONS }, (_, n) => rate(n)).reduce((a, b) => a + b, 0) *
  ((SIGMA * Math.sqrt(2 * Math.PI)) / GAMMA_MS / NEURONS);

/** Summed activity at model time `ms`: each spike, smoothed over ~6 ms. */
function field(ms: number, now: number) {
  let v = 0;
  const c = Math.floor(ms / GAMMA_MS);
  for (let n = 0; n < NEURONS; n++) {
    for (let k = c - 1; k <= c + 1; k++) {
      const st = spikeTime(n, k);
      if (st === null || st > now) continue;
      const d = (ms - st) / SIGMA;
      v += Math.exp(-0.5 * d * d);
    }
  }
  return v / NEURONS - MEAN;
}

const GRID = Array.from({ length: NEURONS }, (_, i) => {
  const col = i % COLS;
  const row = Math.floor(i / COLS);
  return { x: (col - (COLS - 1) / 2) * 1.42, z: (row - (ROWS - 1) / 2) * 1.12 - 0.3 };
});

/** A tube of rings round a centre line in the x–y plane; positions set per frame. */
function tubeGeometry() {
  const g = new BufferGeometry();
  g.setAttribute('position', new BufferAttribute(new Float32Array(SAMPLES * RADIAL * 3), 3));
  const idx: number[] = [];
  for (let i = 0; i < SAMPLES - 1; i++) {
    for (let j = 0; j < RADIAL; j++) {
      const a = i * RADIAL + j;
      const b = i * RADIAL + ((j + 1) % RADIAL);
      const c = a + RADIAL;
      const d = b + RADIAL;
      idx.push(a, c, b, b, c, d);
    }
  }
  g.setIndex(idx);
  return g;
}

export function ClayRaster({ still }: ClaySceneProps) {
  const t = useSceneTime(still, RASTER_STILL);
  const size = useThree((s) => s.size);
  const somas = useRef<InstancedMesh>(null);
  const glow = useRef<Mesh>(null);
  const capL = useRef<Mesh>(null);
  const capR = useRef<Mesh>(null);
  const dummy = useMemo(() => new Object3D(), []);
  const col = useMemo(() => new Color(), []);
  const spot = useMemo(() => softSpot(), []);
  const tube = useMemo(() => tubeGeometry(), []);
  const line = useMemo(() => new Float32Array(SAMPLES), []);
  useEffect(
    () => () => {
      spot.dispose();
      tube.dispose();
    },
    [spot, tube]
  );

  const aspect = size.width / Math.max(1, size.height);
  const k = Math.min(1, aspect / 1.3);

  useFrame((state) => {
    const tt = t.current;
    orbit(state.camera, tt, { dist: DIST, height: 9.4, sway: 0.12, target: [0, -0.1, 0.9] });
    const S = somas.current;
    const G = glow.current;
    if (!S || !G || !capL.current || !capR.current) return;
    const now = tt * SPEED;
    const cyc = Math.floor(now / GAMMA_MS);
    const sync = synchrony(cyc);

    // The neurons: each pops up and turns violet when it fires.
    for (let n = 0; n < NEURONS; n++) {
      const st = lastSpike(n, now);
      const pop = st === null ? 0 : Math.exp(-(now - st) / 7);
      const r = 0.3 * (1 + 0.32 * pop);
      dummy.position.set(GRID[n].x, r + 0.32 * pop, GRID[n].z);
      dummy.scale.setScalar(r);
      dummy.updateMatrix();
      S.setMatrixAt(n, dummy.matrix);
      col.copy(C.lilac).lerp(C.w, clamp(pop * 1.4));
      S.setColorAt(n, col);
    }
    S.instanceMatrix.needsUpdate = true;
    if (S.instanceColor) S.instanceColor.needsUpdate = true;

    // The gamma cycle: a faint glow on the shelf, beating when they lock.
    const phase = ((now % GAMMA_MS) + GAMMA_MS) % GAMMA_MS;
    const beat = Math.exp(-(((phase - GAMMA_MS * 0.5) / 5) ** 2));
    (G.material as MeshBasicMaterial).opacity = (0.04 + 0.22 * beat) * sync;

    // The summed activity as one clay tube, newest at the right.
    for (let i = 0; i < SAMPLES; i++) {
      const u = i / (SAMPLES - 1);
      line[i] = TUBE_Y + GAIN * field(now - (1 - u) * WINDOW_MS, now);
    }
    const pos = tube.attributes.position as BufferAttribute;
    const dx = TUBE_W / (SAMPLES - 1);
    for (let i = 0; i < SAMPLES; i++) {
      const x = -TUBE_W / 2 + i * dx;
      const y = line[i];
      const dy = (line[Math.min(SAMPLES - 1, i + 1)] - line[Math.max(0, i - 1)]) / 2;
      const len = Math.hypot(dx, dy);
      const nx = -dy / len;
      const ny = dx / len;
      for (let j = 0; j < RADIAL; j++) {
        const a = (j / RADIAL) * Math.PI * 2;
        const c = Math.cos(a) * TUBE_R;
        pos.setXYZ(i * RADIAL + j, x + nx * c, y + ny * c, TUBE_Z + Math.sin(a) * TUBE_R);
      }
    }
    pos.needsUpdate = true;
    tube.computeVertexNormals();
    capL.current.position.set(-TUBE_W / 2, line[0], TUBE_Z);
    capR.current.position.set(TUBE_W / 2, line[SAMPLES - 1], TUBE_Z);
  });

  return (
    <>
      <group scale={k} position={[0, 0, -0.4]}>
        <RoundedBox args={[9.4, 0.5, 5.6]} radius={0.22} smoothness={4} position={[0, -0.25, -0.3]}>
          <meshStandardMaterial color={C.pale} roughness={0.85} />
        </RoundedBox>
        <mesh
          ref={glow}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 0.012, -0.3]}
          scale={[5.2, 3.4, 1]}
        >
          <circleGeometry args={[1, 64]} />
          <meshBasicMaterial color={C.a} map={spot} transparent opacity={0} depthWrite={false} />
        </mesh>
        <instancedMesh ref={somas} args={[undefined, undefined, NEURONS]} frustumCulled={false}>
          <sphereGeometry args={[1, 28, 20]} />
          <meshStandardMaterial color="#ffffff" roughness={0.62} />
        </instancedMesh>
        <mesh geometry={tube}>
          <meshStandardMaterial color={C.b} roughness={0.5} />
        </mesh>
        <mesh ref={capL} scale={TUBE_R}>
          <sphereGeometry args={[1, 16, 12]} />
          <meshStandardMaterial color={C.b} roughness={0.5} />
        </mesh>
        <mesh ref={capR} scale={TUBE_R}>
          <sphereGeometry args={[1, 16, 12]} />
          <meshStandardMaterial color={C.b} roughness={0.5} />
        </mesh>
      </group>
      <ContactShadows
        position={[0, -1.6 * k, 0]}
        scale={18}
        far={3.5}
        blur={2.4}
        opacity={0.3}
        resolution={512}
        color={'#3b2f7a'}
      />
    </>
  );
}
