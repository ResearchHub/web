'use client';

import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { ContactShadows } from '@react-three/drei/core/ContactShadows';
import {
  BufferAttribute,
  Color,
  DoubleSide,
  MeshStandardMaterial,
  Object3D,
  PlaneGeometry,
  type InstancedMesh,
} from 'three';
import { clamp, fract, rng, smoothstep } from '../../visuals/palette';
import type { ClaySceneProps } from './ClayLive';
import { C, orbit, useSceneTime } from './common';

/**
 * Q3, decoherence. The Wigner function of a "cat" state (one particle in
 * two places, x = ±a) as a clay sheet: an apricot hill and a teal hill are
 * the two branches; the violet ripples between them are the interference
 * term 2·D·e^{-x²-p²}·cos(2ap), whose dark dips go below zero, which no
 * classical distribution can. Pellets of environment fly through, D falls
 * from 1 to 0, and the ripples flatten to two plain hills: an ordinary
 * either-or. Then it is prepared again.
 */

const CYCLE = 9;
const XMAX = 4.6;
const PMAX = 2.5;
const SEP = 2.3;
const PSCALE = 1.55; // p is stretched so the fringes read
const SEG_X = 184;
const SEG_P = 96;
const HEIGHT = 1.45;
const DIST = 16;
export const WIGNER_STILL = 2.0;

function coherence(t: number) {
  const p = fract(t / CYCLE) * CYCLE;
  if (p < 1.6) return 1;
  if (p < 7.6) return Math.exp(-(p - 1.6) / 1.15);
  return smoothstep(7.6, 8.9, p);
}

const r = rng(77);
const PELLETS = Array.from({ length: 9 }, () => ({
  z: (r() - 0.5) * PMAX * 3.2,
  y: 0.8 + r() * 1.8,
  speed: 5 + r() * 5,
  dir: r() < 0.5 ? -1 : 1,
  off: r(),
  s: 0.05 + r() * 0.03,
}));

/**
 * A matte clay material whose tint steps with height in three crisp bands,
 * like contours cut in the clay. The hue comes from the vertex colour (which
 * term makes the height there); the band from the height itself, worked out
 * per pixel so the edges stay sharp on steep slopes.
 */
function bandedClay() {
  const mat = new MeshStandardMaterial({ vertexColors: true, roughness: 0.94, side: DoubleSide });
  mat.onBeforeCompile = (shader) => {
    shader.uniforms.uPale = { value: C.pale };
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nattribute float aH;\nvarying float vH;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvH = aH;');
    shader.fragmentShader = shader.fragmentShader
      .replace(
        '#include <common>',
        `#include <common>
varying float vH;
uniform vec3 uPale;
float clayStep(float e, float a) {
  float w = max(fwidth(a) * 0.8, 0.004);
  return smoothstep(e - w, e + w, a);
}`
      )
      .replace(
        '#include <color_fragment>',
        `float a = vH >= 0.0 ? vH : -vH * 2.6;
float bnd = 0.36 * clayStep(0.2, a) + 0.34 * clayStep(0.5, a) + 0.3 * clayStep(0.8, a);
diffuseColor.rgb = mix(uPale, vColor.rgb, bnd);`
      );
  };
  mat.customProgramCacheKey = () => 'clay-wigner-bands';
  return mat;
}

/** Wigner-only lighting: a low raking key from the side, so the relief shows. */
function WignerLights() {
  return (
    <>
      <hemisphereLight args={['#ffffff', '#c4b6ee', 1.15]} />
      <directionalLight position={[-10, 4.5, 3]} intensity={2.3} color="#fff3e6" />
      <directionalLight position={[4, 12, 7]} intensity={0.75} color="#eef0ff" />
      <directionalLight position={[2, 5, -10]} intensity={0.8} color="#ffffff" />
    </>
  );
}

export function ClayWigner({ still }: ClaySceneProps) {
  const t = useSceneTime(still, WIGNER_STILL);
  const size = useThree((s) => s.size);
  const pellets = useRef<InstancedMesh>(null);
  const dummy = useMemo(() => new Object3D(), []);
  const col = useMemo(() => new Color(), []);
  const tmp = useMemo(() => new Color(), []);
  const sheetMat = useMemo(() => bandedClay(), []);
  useEffect(() => () => sheetMat.dispose(), [sheetMat]);

  const geom = useMemo(() => {
    const g = new PlaneGeometry(XMAX * 2, PMAX * 2 * PSCALE, SEG_X, SEG_P);
    g.rotateX(-Math.PI / 2);
    g.setAttribute(
      'color',
      new BufferAttribute(new Float32Array(g.attributes.position.count * 3), 3)
    );
    g.setAttribute('aH', new BufferAttribute(new Float32Array(g.attributes.position.count), 1));
    return g;
  }, []);

  const aspect = size.width / Math.max(1, size.height);
  const k = Math.min(1, aspect / 1.3);

  useFrame((state) => {
    const tt = t.current;
    orbit(state.camera, tt, {
      dist: DIST,
      height: 9,
      sway: 0.14,
      yaw: 0.5,
      target: [0, 0.2, 0.3],
    });
    const d = coherence(tt);
    const theta = Math.sin(tt * 0.5) * 0.6;
    const pos = geom.attributes.position as BufferAttribute;
    const colors = geom.attributes.color as BufferAttribute;
    const heights = geom.attributes.aH as BufferAttribute;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const p = pos.getZ(i) / PSCALE;
      const g1 = Math.exp(-((x - SEP) ** 2) - p * p);
      const g2 = Math.exp(-((x + SEP) ** 2) - p * p);
      const gi = 2 * d * Math.exp(-x * x - p * p) * Math.cos(2 * SEP * p + theta);
      const h = g1 + g2 + gi;
      pos.setY(i, HEIGHT * h);
      // Colour follows height in stepped bands, like contours cut in clay;
      // the hue is whichever term makes the height there.
      heights.setX(i, h);
      if (h >= 0) {
        const wa = g1 ** 4;
        const wb = g2 ** 4;
        const wv = Math.max(gi, 0) ** 4;
        const sum = wa + wb + wv + 1e-9;
        col.copy(C.a).multiplyScalar(wa / sum);
        col.add(tmp.copy(C.b).multiplyScalar(wb / sum));
        col.add(tmp.copy(C.w).multiplyScalar(wv / sum));
      } else {
        col.copy(C.deep);
      }
      colors.setXYZ(i, col.r, col.g, col.b);
    }
    pos.needsUpdate = true;
    colors.needsUpdate = true;
    heights.needsUpdate = true;
    geom.computeVertexNormals();

    // Environment pellets streak across while coherence is lost.
    const P = pellets.current;
    if (P) {
      const rate = clamp((1 - d) * 1.6) * (1 - smoothstep(7.4, 8.2, fract(tt / CYCLE) * CYCLE));
      PELLETS.forEach((m, i) => {
        const span = XMAX * 2 + 4;
        const u = fract(m.off + (tt * m.speed) / span);
        const x = m.dir * (u * span - span / 2);
        dummy.position.set(x, m.y, m.z);
        dummy.scale.setScalar(i / PELLETS.length < rate ? m.s : 0);
        dummy.updateMatrix();
        P.setMatrixAt(i, dummy.matrix);
      });
      P.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <>
      <WignerLights />
      <group scale={k}>
        <mesh geometry={geom} material={sheetMat} />
        <instancedMesh
          ref={pellets}
          args={[undefined, undefined, PELLETS.length]}
          frustumCulled={false}
        >
          <sphereGeometry args={[1, 10, 8]} />
          <meshStandardMaterial color={C.dim} roughness={0.5} />
        </instancedMesh>
      </group>
      <ContactShadows
        position={[0, -1.6 * k, 0]}
        scale={16}
        far={4.5}
        blur={2.2}
        opacity={0.32}
        resolution={512}
        color={'#3b2f7a'}
      />
    </>
  );
}
