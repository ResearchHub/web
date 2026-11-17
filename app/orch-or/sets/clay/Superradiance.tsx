'use client';

import { useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { ContactShadows } from '@react-three/drei/core/ContactShadows';
import { Color, Object3D, type InstancedMesh, type Mesh, type MeshStandardMaterial } from 'three';
import { clamp, rng, smoothstep } from '../../visuals/palette';
import type { ClaySceneProps } from './ClayLive';
import { BEAD, C, TUBE_R, lattice, orbit, tubeLength, useSceneTime } from './common';

/**
 * Q3, quantum states in microtubules (superradiance). A microtubule with
 * its open end toward us: 13 beads round the hollow core. First the
 * tryptophans emit on their own: scattered, faint teal flashes. Then an
 * excitation runs along the tube, every site pulses apricot in step, and
 * they emit together: one bright, fast burst and a shell of light leaving
 * the tube. Schematic; numbers and timings are illustrative.
 */

const ROWS = 26;
const SITES = lattice(ROWS);
const N = SITES.length;
const L = tubeLength(ROWS);
const CYCLE = 10;
const IND_START = 0.3;
const IND_TAU = 1.3;
const WAVE_START = 4.6;
const WAVE_DUR = 0.8;
const BURST = 5.6;
const BURST_TAU = 0.3;
const DIST = 17;
export const SUPERRADIANCE_STILL = 5.9;

const r = rng(1013);
const EMIT = SITES.map(() => IND_START - Math.log(1 - r() * 0.98) * IND_TAU);

export function ClaySuperradiance({ still }: ClaySceneProps) {
  const t = useSceneTime(still, SUPERRADIANCE_STILL);
  const size = useThree((s) => s.size);
  const beads = useRef<InstancedMesh>(null);
  const haloB = useRef<InstancedMesh>(null);
  const haloA = useRef<InstancedMesh>(null);
  const shell = useRef<Mesh>(null);
  const dummy = useMemo(() => new Object3D(), []);
  const col = useMemo(() => new Color(), []);

  const aspect = size.width / Math.max(1, size.height);
  const k = Math.min(1, aspect / 1.25);

  useFrame((state) => {
    const tt = t.current;
    const tc = ((tt % CYCLE) + CYCLE) % CYCLE;
    orbit(state.camera, tt, { dist: DIST, height: 2.6, sway: 0.12, yaw: 0.1 });
    const B = beads.current;
    const HB = haloB.current;
    const HA = haloA.current;
    const S = shell.current;
    if (!B || !HB || !HA || !S) return;

    const out = 1 - smoothstep(CYCLE - 0.7, CYCLE - 0.05, tc);
    const front = clamp((tc - WAVE_START) / WAVE_DUR) * L;
    const inPhase = tc >= WAVE_START && tc < BURST + 1.1;
    const pulse = 0.5 + 0.5 * Math.sin((tc - WAVE_START) * Math.PI * 2 * 1.8);
    const flash = tc >= BURST ? Math.exp(-(tc - BURST) / BURST_TAU) : 0;
    const build = smoothstep(WAVE_START, BURST, tc) * (tc < BURST ? 1 : 0);
    const settle = 1 - smoothstep(BURST + 0.6, BURST + 1.1, tc);

    for (let i = 0; i < N; i++) {
      const s = SITES[i];
      const x = s.u - L / 2;
      const y = TUBE_R * Math.cos(s.th);
      const z = TUBE_R * Math.sin(s.th);

      // On its own: each site flashes teal on its own clock.
      const age = tc - EMIT[i];
      const own = age >= 0 && age < 0.5 && tc < WAVE_START ? (1 - age / 0.5) * out : 0;
      // In step: lit by the passing excitation, all at one phase, then the burst.
      let step = 0;
      if (inPhase && s.u <= front) {
        const lit = smoothstep(front, front - L * 0.12, s.u);
        step = ((0.3 + 0.45 * pulse * (0.4 + build)) * (1 - flash) * lit + flash) * settle * out;
      }

      dummy.position.set(x, y, z);
      dummy.scale.setScalar(BEAD * (s.alpha ? 1 : 0.94) * (1 + 0.25 * own + 0.3 * step));
      dummy.updateMatrix();
      B.setMatrixAt(i, dummy.matrix);
      col
        .copy(s.alpha ? C.w : C.lilac)
        .lerp(C.b, clamp(own * 1.2))
        .lerp(C.a, clamp(step * 1.3))
        .lerp(C.accent, clamp(flash * 0.6));
      B.setColorAt(i, col);

      dummy.scale.setScalar(BEAD * 2.1 * own);
      dummy.updateMatrix();
      HB.setMatrixAt(i, dummy.matrix);
      dummy.scale.setScalar(BEAD * (1.5 + 1.6 * flash) * clamp(step));
      dummy.updateMatrix();
      HA.setMatrixAt(i, dummy.matrix);
    }
    B.instanceMatrix.needsUpdate = true;
    HB.instanceMatrix.needsUpdate = true;
    HA.instanceMatrix.needsUpdate = true;
    if (B.instanceColor) B.instanceColor.needsUpdate = true;

    // The collective burst leaves the tube as one shell of light.
    const age = tc - BURST;
    const m = S.material as MeshStandardMaterial;
    if (age > 0 && age < 1.2) {
      const g = 1 + age * 1.6;
      S.visible = true;
      S.scale.set((L / 2 + 0.8) * (1 + age * 0.35), TUBE_R * 1.5 * g, TUBE_R * 1.5 * g);
      m.opacity = 0.22 * Math.exp(-age / 0.3) * out;
    } else {
      S.visible = false;
    }
  });

  return (
    <>
      <group scale={k} rotation={[0, 1.22, 0]} position={[1.2, 0.5, -3]}>
        <instancedMesh ref={beads} args={[undefined, undefined, N]} frustumCulled={false}>
          <sphereGeometry args={[1, 16, 12]} />
          <meshStandardMaterial color="#ffffff" roughness={0.6} />
        </instancedMesh>
        <instancedMesh ref={haloB} args={[undefined, undefined, N]} frustumCulled={false}>
          <sphereGeometry args={[1, 12, 8]} />
          <meshBasicMaterial color={C.b} transparent opacity={0.28} depthWrite={false} />
        </instancedMesh>
        <instancedMesh ref={haloA} args={[undefined, undefined, N]} frustumCulled={false}>
          <sphereGeometry args={[1, 12, 8]} />
          <meshBasicMaterial color={C.a} transparent opacity={0.26} depthWrite={false} />
        </instancedMesh>
        {/* The cut end: a dark hollow core inside the ring of 13. */}
        <mesh position={[-L / 2 + 1.5, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
          <circleGeometry args={[TUBE_R - BEAD * 0.6, 40]} />
          <meshStandardMaterial color={C.deep} roughness={0.8} />
        </mesh>
        <mesh ref={shell} visible={false}>
          <sphereGeometry args={[1, 40, 24]} />
          <meshStandardMaterial
            color={C.a}
            emissive={C.a}
            emissiveIntensity={0.6}
            roughness={0.5}
            transparent
            depthWrite={false}
          />
        </mesh>
      </group>
      <ContactShadows
        position={[0, -2.5, 0]}
        scale={22}
        far={6}
        blur={2.4}
        opacity={0.33}
        resolution={512}
        color={'#3b2f7a'}
      />
    </>
  );
}
