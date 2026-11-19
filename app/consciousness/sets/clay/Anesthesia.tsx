'use client';

import { useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { ContactShadows } from '@react-three/drei/core/ContactShadows';
import { Color, DoubleSide, Object3D, Vector3, type InstancedMesh } from 'three';
import { clamp, rng, smoothstep } from '../../visuals/palette';
import type { ClaySceneProps } from './ClayLive';
import { BEAD, C, MONO, PF, TUBE_R, lattice, orbit, tubeLength, useSceneTime } from './common';

/**
 * Q1, anesthesia. A stretch of microtubule; a collective oscillation (as
 * modelled, slowed for display) runs along it as an apricot swell. Teal
 * anesthetic molecules drift in, settle into pockets between α and β
 * tubulin, and still the oscillation round them; then they wash out and it
 * returns.
 */

const ROWS = 24;
const SITES = lattice(ROWS);
const N = SITES.length;
const L = tubeLength(ROWS);
const CYCLE = 14;
const FREQ = 0.55;
const TRAVEL = 1.9;
const DIST = 17;
export const ANESTHESIA_STILL = 4.6;

const r = rng(303);
const MOLECULES = Array.from({ length: 16 }, (_, i) => {
  const k = Math.floor(r() * PF);
  const j = 2 + Math.floor(r() * (ROWS - 5));
  const th = ((k + 0.5) / PF) * Math.PI * 2;
  const u = (j + 0.5 + ((k + 0.5) * 3) / PF) * 0.4;
  const dock = new Vector3(u - L / 2, (TUBE_R + 0.3) * Math.cos(th), (TUBE_R + 0.3) * Math.sin(th));
  const dir = new Vector3(0, Math.cos(th), Math.sin(th));
  const from = dock
    .clone()
    .addScaledVector(dir, 3.5 + r() * 2.5)
    .add(new Vector3((r() - 0.5) * 4, 0, 0));
  const away = dock
    .clone()
    .addScaledVector(dir, 4 + r() * 2)
    .add(new Vector3((r() - 0.5) * 3, 1.5, 0));
  return {
    dock,
    from,
    away,
    enter: 1.2 + i * 0.36 + r() * 0.3,
    leave: 8.6 + i * 0.16 + r() * 0.4,
    wob: r() * 6.28,
  };
});

function occupancy(m: (typeof MOLECULES)[number], tc: number) {
  return (
    smoothstep(m.enter + TRAVEL - 0.35, m.enter + TRAVEL, tc) *
    (1 - smoothstep(m.leave, m.leave + 0.35, tc))
  );
}

export function ClayAnesthesia({ still }: ClaySceneProps) {
  const t = useSceneTime(still, ANESTHESIA_STILL);
  const size = useThree((s) => s.size);
  const beads = useRef<InstancedMesh>(null);
  const mols = useRef<InstancedMesh>(null);
  const dummy = useMemo(() => new Object3D(), []);
  const col = useMemo(() => new Color(), []);
  const tmp = useMemo(() => new Vector3(), []);

  const aspect = size.width / Math.max(1, size.height);
  const halfW = DIST * Math.tan((15 * Math.PI) / 180) * aspect;
  const k = Math.min((halfW * 2 * 0.86) / L, 1.2);

  useFrame((state) => {
    const tt = t.current;
    const tc = ((tt % CYCLE) + CYCLE) % CYCLE;
    orbit(state.camera, tt, { dist: DIST, height: 4.2, sway: 0.14, yaw: -0.18 });
    const M = mols.current;
    const B = beads.current;
    if (!M || !B) return;

    const occ = MOLECULES.map((m) => occupancy(m, tc));

    // The molecules: in, settled, out.
    MOLECULES.forEach((m, i) => {
      let s = 0;
      if (tc >= m.enter && tc < m.enter + TRAVEL) {
        const e = smoothstep(m.enter, m.enter + TRAVEL, tc);
        tmp.lerpVectors(m.from, m.dock, e);
        tmp.y += 0.25 * Math.sin(tc * 3 + m.wob) * (1 - e);
        s = smoothstep(m.enter, m.enter + 0.3, tc);
      } else if (tc >= m.enter + TRAVEL && tc < m.leave) {
        tmp.copy(m.dock);
        tmp.y += 0.03 * Math.sin(tc * 5 + m.wob);
        s = 1;
      } else if (tc >= m.leave && tc < m.leave + 2.2) {
        const e = smoothstep(m.leave, m.leave + 2.2, tc);
        tmp.lerpVectors(m.dock, m.away, e);
        s = 1 - smoothstep(m.leave + 1.4, m.leave + 2.2, tc);
      }
      dummy.position.copy(tmp);
      dummy.scale.setScalar(0.24 * s);
      dummy.updateMatrix();
      M.setMatrixAt(i, dummy.matrix);
    });
    M.instanceMatrix.needsUpdate = true;

    // The lattice: the swell runs along the axis, stilled near molecules.
    for (let i = 0; i < N; i++) {
      const s = SITES[i];
      const x = s.u - L / 2;
      const y = TUBE_R * Math.cos(s.th);
      const z = TUBE_R * Math.sin(s.th);
      let damp = 0;
      MOLECULES.forEach((m, mi) => {
        if (occ[mi] <= 0) return;
        const d2 = (x - m.dock.x) ** 2 + (y - m.dock.y) ** 2 + (z - m.dock.z) ** 2;
        damp += occ[mi] * Math.exp(-d2 / 0.9);
      });
      const amp = 1 - 0.92 * clamp(damp);
      const phase = Math.PI * 2 * FREQ * tt - s.u * 0.75;
      const swell = amp * (0.5 + 0.5 * Math.sin(phase)) ** 2;
      const rr = 1 + 0.1 * swell;
      dummy.position.set(x, y * rr, z * rr);
      dummy.scale.setScalar(BEAD * 1.12 * (s.alpha ? 1 : 0.95) * (1 + 0.14 * swell));
      dummy.updateMatrix();
      B.setMatrixAt(i, dummy.matrix);
      col.copy(s.alpha ? C.w : C.lilac).lerp(C.a, smoothstep(0.15, 0.7, swell));
      B.setColorAt(i, col);
    }
    B.instanceMatrix.needsUpdate = true;
    if (B.instanceColor) B.instanceColor.needsUpdate = true;
  });

  return (
    <>
      <group scale={k} rotation={[0, 0, 0.04]}>
        <instancedMesh ref={beads} args={[undefined, undefined, N]} frustumCulled={false}>
          <sphereGeometry args={[1, 16, 12]} />
          <meshStandardMaterial color="#ffffff" roughness={0.62} />
        </instancedMesh>
        <instancedMesh
          ref={mols}
          args={[undefined, undefined, MOLECULES.length]}
          frustumCulled={false}
        >
          <sphereGeometry args={[1, 16, 12]} />
          <meshStandardMaterial color={C.b} roughness={0.38} />
        </instancedMesh>
        {/* The hollow core, dark, so the lattice reads as a tube. */}
        <mesh rotation={[0, 0, Math.PI / 2]} position={[-MONO * 0.6, 0, 0]}>
          <cylinderGeometry args={[TUBE_R - 0.1, TUBE_R - 0.1, L - MONO * 4.2, 32, 1, true]} />
          <meshStandardMaterial color={C.deep} roughness={0.9} side={DoubleSide} />
        </mesh>
      </group>
      <ContactShadows
        position={[0, -2.6, 0]}
        scale={halfW * 2.4}
        far={6}
        blur={2.4}
        opacity={0.35}
        resolution={512}
        color={'#3b2f7a'}
      />
    </>
  );
}
