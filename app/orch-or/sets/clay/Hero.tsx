'use client';

import { useLayoutEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import {
  Color,
  CylinderGeometry,
  DoubleSide,
  Object3D,
  type DirectionalLight,
  type InstancedMesh,
  type MeshStandardMaterial,
} from 'three';
import { fract, hash2, smoothstep } from '../../visuals/palette';
import type { ClaySceneProps } from './ClayLive';
import { BEAD, C, MONO, TUBE_R, lattice, orbit, tubeLength, useSceneTime } from './common';

/**
 * The hero: a microtubule in clay (13 protofilaments, 3-start helix, α and
 * β beads in two tones round a dark hollow core), large on a diagonal and
 * slowly turning about its axis. It splits into two copies, apricot and
 * teal, that pull apart along a travelling wave: a superposition. Then it
 * reduces: one copy (either, with equal odds) slides back and sets solid
 * violet; the other fades.
 */

const ROWS = 34;
const SITES = lattice(ROWS);
const N = SITES.length;
const L = tubeLength(ROWS);
const SEGS = ROWS - 2;
const R_BEAD = BEAD * 1.14;
const R_CORE = TUBE_R - 0.1;
const CYCLE = 7.5;
const COLLAPSE = 0.72;
const DMAX = 1.75;
const DIST = 30;
export const HERO_STILL = 4.05;

/** How far the copies stand apart at a point along the axis (0.35–1). */
const envelope = (u: number, t: number) => 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(u * 0.55 - t * 2.1));

/** Hero-only lighting: low ambient, a shadow-casting key, a cool fill, a rim. */
function HeroLights() {
  const key = useRef<DirectionalLight>(null);
  useLayoutEffect(() => {
    const cam = key.current?.shadow.camera;
    if (!cam) return;
    cam.left = cam.bottom = -22;
    cam.right = cam.top = 22;
    cam.near = 1;
    cam.far = 80;
    cam.updateProjectionMatrix();
  }, []);
  return (
    <>
      <hemisphereLight args={['#ffffff', '#b7a5e8', 0.62]} />
      <directionalLight
        ref={key}
        position={[-9, 16, 14]}
        intensity={2.3}
        color="#fff2e4"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0004}
        shadow-normalBias={0.04}
      />
      <directionalLight position={[12, -3, 8]} intensity={0.5} color="#dde4ff" />
      <directionalLight position={[3, 7, -14]} intensity={1.5} color="#ffffff" />
    </>
  );
}

export function ClayHero({ still }: ClaySceneProps) {
  const t = useSceneTime(still, HERO_STILL);
  const size = useThree((s) => s.size);
  const beadsA = useRef<InstancedMesh>(null);
  const beadsB = useRef<InstancedMesh>(null);
  const coreA = useRef<InstancedMesh>(null);
  const coreB = useRef<InstancedMesh>(null);
  const dummy = useMemo(() => new Object3D(), []);
  const tones = useMemo(() => ({ a: new Color(), b: new Color(), core: new Color() }), []);
  const coreGeom = useMemo(
    () => new CylinderGeometry(1, 1, 1, 24, 1, true).rotateZ(Math.PI / 2),
    []
  );

  // Composition: big on the right of a wide box, across the top of a phone.
  const aspect = size.width / Math.max(1, size.height);
  const wide = size.width >= 768 || aspect >= 1;
  const halfH = DIST * Math.tan((15 * Math.PI) / 180);
  const halfW = halfH * aspect;
  const layout = wide
    ? {
        pos: [halfW * 0.44, halfH * 0.06, 0] as const,
        k: Math.min(halfH * 0.19, halfW * 0.16),
        tilt: 0.52,
        yaw: 0.5,
      }
    : {
        pos: [0, halfH * 0.5, 0] as const,
        k: halfW * 0.21,
        tilt: -0.3,
        yaw: 0.45,
      };

  useFrame((state) => {
    const tt = t.current;
    orbit(state.camera, tt, { dist: DIST, height: 5.5, sway: 0.06 });
    const p = fract(tt / CYCLE);
    const cycle = Math.floor(tt / CYCLE);
    const winA = hash2(cycle, 3) < 0.5;
    const split = smoothstep(0.04, 0.5, p);
    const hue = smoothstep(0.01, 0.16, p);
    const c = smoothstep(COLLAPSE, COLLAPSE + 0.08, p);
    const q = hue * (1 - c);
    const spin = tt * 0.12;

    const copy = (beads: InstancedMesh, core: InstancedMesh, isA: boolean) => {
      const won = isA === winA;
      const sign = isA ? 1 : -1;
      const reach = split * (p < COLLAPSE ? 1 : won ? 1 - c : 1 + 0.9 * c);
      const tint = won ? q : hue;
      const base = isA ? C.a : C.b;
      tones.a.copy(C.w).lerp(base, tint);
      tones.b
        .copy(C.lilac)
        .lerp(base, tint)
        .lerp(C.pale, 0.16 * tint);
      tones.core.copy(C.deep).lerp(base, 0.08 * tint);
      const opacity = won || p < COLLAPSE ? 1 : 1 - c;
      const shown = opacity > 0.01 && (isA || hue > 0.004);
      beads.visible = core.visible = shown;
      if (!shown) return;
      (beads.material as MeshStandardMaterial).opacity = opacity;
      const cm = core.material as MeshStandardMaterial;
      cm.opacity = opacity;
      cm.color.copy(tones.core);

      for (let i = 0; i < N; i++) {
        const s = SITES[i];
        const d = sign * DMAX * reach * envelope(s.u, tt);
        const th = s.th + spin;
        dummy.position.set(s.u - L / 2, TUBE_R * Math.cos(th) + d, TUBE_R * Math.sin(th) + d * 0.2);
        dummy.scale.setScalar(R_BEAD * (s.alpha ? 1 : 0.95));
        dummy.updateMatrix();
        beads.setMatrixAt(i, dummy.matrix);
        beads.setColorAt(i, s.alpha ? tones.a : tones.b);
      }
      beads.instanceMatrix.needsUpdate = true;
      if (beads.instanceColor) beads.instanceColor.needsUpdate = true;

      // The hollow core, in short segments that follow the wave.
      for (let j = 0; j < SEGS; j++) {
        const u = (j + 2.5) * MONO;
        const d = sign * DMAX * reach * envelope(u, tt);
        dummy.position.set(u - L / 2, d, d * 0.2);
        dummy.scale.set(MONO * 1.04, R_CORE, R_CORE);
        dummy.updateMatrix();
        core.setMatrixAt(j, dummy.matrix);
      }
      core.instanceMatrix.needsUpdate = true;
    };
    if (beadsA.current && coreA.current) copy(beadsA.current, coreA.current, true);
    if (beadsB.current && coreB.current) copy(beadsB.current, coreB.current, false);
  });

  const copyMeshes = (
    beads: React.RefObject<InstancedMesh | null>,
    core: React.RefObject<InstancedMesh | null>
  ) => (
    <>
      <instancedMesh
        ref={beads}
        args={[undefined, undefined, N]}
        frustumCulled={false}
        castShadow
        receiveShadow
      >
        <sphereGeometry args={[1, 20, 14]} />
        <meshStandardMaterial color="#ffffff" roughness={0.78} metalness={0} transparent />
      </instancedMesh>
      <instancedMesh
        ref={core}
        args={[coreGeom, undefined, SEGS]}
        frustumCulled={false}
        receiveShadow
      >
        <meshStandardMaterial roughness={0.9} side={DoubleSide} transparent />
      </instancedMesh>
    </>
  );

  return (
    <>
      <HeroLights />
      <group position={layout.pos} scale={layout.k} rotation={[0, layout.yaw, layout.tilt, 'ZYX']}>
        {copyMeshes(beadsA, coreA)}
        {copyMeshes(beadsB, coreB)}
      </group>
    </>
  );
}
