'use client';

import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { ContactShadows } from '@react-three/drei/core/ContactShadows';
import {
  BufferAttribute,
  CanvasTexture,
  Color,
  PlaneGeometry,
  RepeatWrapping,
  SRGBColorSpace,
  type Mesh,
  type MeshStandardMaterial,
} from 'three';
import { fract, hash2, smoothstep } from '../../visuals/palette';
import type { ClaySceneProps } from './ClayLive';
import { C, orbit, useSceneTime } from './common';

/**
 * Q5, objective reduction. A rubber sheet for spacetime, dented by one mass
 * in two places at once: an apricot ball and a teal ball, each half the
 * mass, each making half a dent (the two geometries). The gauge at the side
 * fills with E_G·t/ħ; when it reaches the top (t ≈ τ = ħ/E_G) one geometry
 * wins (either, with equal odds): its ball sets solid violet and its dent
 * deepens to full; the other ball and dent vanish. Never observed.
 */

const CYCLE = 8.5;
const COLLAPSE = 0.64;
const SEP = 1.9;
const FULL = 1.9;
const BALL = 0.5;
const DIST = 16;
export const SPACETIME_STILL = 4.2;

const split = (p: number) => smoothstep(0.06, 0.52, Math.min(p, COLLAPSE));
const STEPS = 256;
const GAUGE = (() => {
  const table = new Float64Array(STEPS + 1);
  let acc = 0;
  for (let i = 1; i <= STEPS; i++) {
    acc += split((i / STEPS) * COLLAPSE) ** 2 * (COLLAPSE / STEPS);
    table[i] = acc;
  }
  return table.map((v) => v / acc);
})();
const gauge = (p: number) => (p >= COLLAPSE ? 1 : GAUGE[Math.round((p / COLLAPSE) * STEPS)]);

function well(x: number, z: number, mx: number) {
  const d2 = (x - mx) ** 2 + z * z * 1.1;
  return Math.exp(-d2 / 0.55) * 0.7 + Math.exp(-d2 / 3.2) * 0.45;
}

function gridTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const g = c.getContext('2d')!;
  g.fillStyle = '#ffffff';
  g.fillRect(0, 0, 256, 256);
  g.strokeStyle = 'rgba(59, 47, 122, 0.42)';
  g.lineWidth = 5;
  g.strokeRect(0, 0, 256, 256);
  const tex = new CanvasTexture(c);
  tex.wrapS = tex.wrapT = RepeatWrapping;
  tex.repeat.set(16, 11);
  tex.colorSpace = SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

export function ClaySpacetime({ still }: ClaySceneProps) {
  const t = useSceneTime(still, SPACETIME_STILL);
  const size = useThree((s) => s.size);
  const ballA = useRef<Mesh>(null);
  const ballB = useRef<Mesh>(null);
  const fill = useRef<Mesh>(null);
  const tmp = useMemo(() => ({ c: new Color() }), []);

  const geom = useMemo(() => {
    const g = new PlaneGeometry(10, 7, 130, 91);
    g.rotateX(-Math.PI / 2);
    g.setAttribute(
      'color',
      new BufferAttribute(new Float32Array(g.attributes.position.count * 3), 3)
    );
    return g;
  }, []);
  const tex = useMemo(() => gridTexture(), []);
  useEffect(() => () => tex.dispose(), [tex]);

  const aspect = size.width / Math.max(1, size.height);
  const k = Math.min(1, aspect / 1.3);

  useFrame((state) => {
    const tt = t.current;
    orbit(state.camera, tt, { dist: DIST, height: 8.2, sway: 0.16, target: [0.3, -1.0, 0.5] });
    const A = ballA.current;
    const B = ballB.current;
    const F = fill.current;
    if (!A || !B || !F) return;

    const p = fract(tt / CYCLE);
    const cycle = Math.floor(tt / CYCLE);
    const winA = hash2(cycle, 41) < 0.5;
    const s = split(p);
    const c = smoothstep(COLLAPSE, COLLAPSE + 0.05, p);
    const settle = smoothstep(0.82, 0.99, p);
    const hue = smoothstep(0.02, 0.2, p) * (1 - c);

    // Each place's share of the mass, and where it sits.
    const wA = winA ? 0.5 + 0.5 * c : 0.5 * (1 - c);
    const wB = 1 - wA;
    const xA = SEP * s * (winA ? 1 - settle : 1);
    const xB = -SEP * s * (winA ? 1 : 1 - settle);
    const single = s < 0.015;

    const heightAt = (x: number, z: number) =>
      single ? -FULL * well(x, z, 0) : -FULL * (wA * well(x, z, xA) + wB * well(x, z, xB));

    const pos = geom.attributes.position as BufferAttribute;
    const colors = geom.attributes.color as BufferAttribute;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      const ea = single ? 0 : wA * well(x, z, xA);
      const eb = single ? 0 : wB * well(x, z, xB);
      pos.setY(i, single ? -FULL * well(x, z, 0) : -FULL * (ea + eb));
      tmp.c.copy(C.pale);
      tmp.c.lerp(C.a, Math.min(1, ea * 1.5) * hue);
      tmp.c.lerp(C.b, Math.min(1, eb * 1.5) * hue);
      tmp.c.lerp(C.w, Math.min(1, (winA ? ea : eb) * 1.2) * c * 0.75);
      colors.setXYZ(i, tmp.c.r, tmp.c.g, tmp.c.b);
    }
    pos.needsUpdate = true;
    colors.needsUpdate = true;
    geom.computeVertexNormals();

    // The balls sit in their dents.
    const ball = (m: Mesh, isA: boolean, x: number) => {
      const won = isA === winA;
      const mat = m.material as MeshStandardMaterial;
      const share = isA ? wA : wB;
      const shown = single ? isA : share > 0.01;
      m.visible = shown;
      if (!shown) return;
      const rad =
        BALL * (single ? 1.15 : 0.82 + 0.33 * (won ? c : 0)) * (won ? 1 : Math.sqrt(share * 2));
      m.position.set(x, heightAt(x, 0) + rad * 0.92, 0);
      m.scale.setScalar(rad);
      tmp.c.copy(C.w).lerp(isA ? C.a : C.b, won ? hue : smoothstep(0.02, 0.2, p));
      mat.color.copy(tmp.c);
      mat.opacity = won ? 1 - 0.25 * hue : single ? 1 : 0.75 * Math.min(1, share * 2);
    };
    ball(A, true, single ? 0 : xA);
    ball(B, false, xB);

    // The gauge: E_G·t/ħ fills it; at the top, the reduction.
    const g = gauge(p);
    const level = p < COLLAPSE ? g : 1 - smoothstep(0.9, 0.99, p);
    F.scale.set(1, Math.max(0.001, level), 1);
    F.position.y = -1 + level;
    const fm = F.material as MeshStandardMaterial;
    fm.color.copy(C.accent).lerp(C.w, c * (1 - smoothstep(0.9, 0.99, p)));
  });

  return (
    <>
      <group scale={k} position={[-0.4 * k, 0, 0]}>
        <mesh geometry={geom}>
          <meshStandardMaterial vertexColors map={tex} roughness={0.7} />
        </mesh>
        <mesh ref={ballA}>
          <sphereGeometry args={[1, 40, 28]} />
          <meshStandardMaterial roughness={0.45} transparent />
        </mesh>
        <mesh ref={ballB}>
          <sphereGeometry args={[1, 40, 28]} />
          <meshStandardMaterial roughness={0.45} transparent />
        </mesh>
        {/* The gauge: a glass tube and its fill. */}
        <group position={[4.6, 0.5, -2.3]} scale={[0.9, 1.15, 0.9]}>
          <mesh position={[0, 0, 0]}>
            <cylinderGeometry args={[0.3, 0.3, 2, 32, 1, true]} />
            <meshStandardMaterial color="#ffffff" roughness={0.2} transparent opacity={0.35} />
          </mesh>
          <mesh ref={fill}>
            <cylinderGeometry args={[0.24, 0.24, 2, 28]} />
            <meshStandardMaterial roughness={0.55} />
          </mesh>
          <mesh position={[0, 1.02, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.32, 0.05, 12, 32]} />
            <meshStandardMaterial color={C.w} roughness={0.5} />
          </mesh>
          <mesh position={[0, -1.08, 0]}>
            <cylinderGeometry args={[0.42, 0.46, 0.16, 32]} />
            <meshStandardMaterial color={C.lilac} roughness={0.6} />
          </mesh>
        </group>
      </group>
      <ContactShadows
        position={[0, -2.2 * k, 0]}
        scale={18}
        far={4}
        blur={2.6}
        opacity={0.3}
        resolution={512}
        color={'#3b2f7a'}
      />
    </>
  );
}
