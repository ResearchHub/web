'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { SceneProps } from './MicrographLive';
import { HUD_COLORS, beginHud, drawStrip } from './hud';
import { GREY, LIN, clamp, fract, hash2, semMaterial, smoothstep, substrateMaterial } from './sem';
import { pxPerUnitAt } from './tube';

/**
 * Q4, objective reduction: a membrane in relief stands for spacetime. One
 * mass in superposition sits in two places at once, so the membrane is
 * dented two ways: geometry A (chartreuse) and geometry B (violet), the
 * mass shown as a pale ghost in each. The gauge accumulates E_G·t/ħ; when it
 * reaches 1 (t ≈ τ = ħ/E_G) one geometry wins (either, equal odds), its dent
 * whitens and a ripple runs out, and the other relaxes flat. Penrose's
 * proposal; never observed. Timing follows visuals/scenes/spacetime.ts.
 */

const CYCLE = 8.5;
const COLLAPSE = 0.64;
const SEP = 0.34;
const STILL = 4.2;
const HALF = 110; // world half-size of the membrane
const DEPTH = 40;

const split = (p: number) => smoothstep(0.06, 0.52, Math.min(p, COLLAPSE));
const GAUGE_STEPS = 256;
const gaugeTable = (() => {
  const table = new Float64Array(GAUGE_STEPS + 1);
  let acc = 0;
  for (let i = 1; i <= GAUGE_STEPS; i++) {
    const p = (i / GAUGE_STEPS) * COLLAPSE;
    acc += split(p) ** 2 * (COLLAPSE / GAUGE_STEPS);
    table[i] = acc;
  }
  for (let i = 0; i <= GAUGE_STEPS; i++) table[i] /= acc;
  return table;
})();
const gauge = (p: number) =>
  p >= COLLAPSE ? 1 : gaugeTable[Math.round((p / COLLAPSE) * GAUGE_STEPS)];

function well(u: number, v: number, mu: number) {
  const d2 = (u - mu) ** 2 + (v * 1.15) ** 2;
  return Math.exp(-d2 / 0.05) * 0.75 + Math.exp(-d2 / 0.35) * 0.45;
}

const c = new THREE.Color();
const DIST = 370;

export function Spacetime({ still, hud }: SceneProps) {
  const ballA = useRef<THREE.Mesh>(null);
  const ballB = useRef<THREE.Mesh>(null);
  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(HALF * 2, HALF * 2, 150, 150);
    g.rotateX(-Math.PI / 2);
    g.setAttribute(
      'color',
      new THREE.BufferAttribute(new Float32Array(g.attributes.position.count * 3), 3)
    );
    return g;
  }, []);
  const mat = useMemo(
    () =>
      semMaterial({ base: 0.08, edge: 1.25, vertexColors: true, grid: 0.55, gridCells: [24, 24] }),
    []
  );
  const matA = useMemo(() => semMaterial({ base: 0.2, edge: 1.3, transparent: true }), []);
  const matB = useMemo(() => semMaterial({ base: 0.2, edge: 1.3, transparent: true }), []);
  const sub = useMemo(() => substrateMaterial(1), []);

  useFrame((state) => {
    const t = still ? STILL : STILL + state.clock.elapsedTime;
    const { width: w, height: h } = state.size;
    const cam = state.camera as THREE.PerspectiveCamera;
    const narrow = w / h < 1.1;
    const d0 = narrow ? DIST * 1.45 : DIST;
    cam.position.set(0, d0 * 0.62, d0 * 0.78);
    cam.lookAt(narrow ? 0 : 16, -22, narrow ? 0 : 4);

    const p = fract(t / CYCLE);
    const cycle = Math.floor(t / CYCLE);
    const winner = hash2(cycle, 41) < 0.5 ? -1 : 1; // -1: A wins, 1: B wins
    const collapsed = p >= COLLAPSE;
    const s = split(p);
    const settle = smoothstep(0.82, 0.99, p);
    const age = collapsed ? (p - COLLAPSE) * CYCLE : 0;
    const flash = collapsed ? Math.exp(-age * 2.4) : 0;

    // Each geometry: where its dent is, how deep, how strongly painted.
    let muA = -SEP * s;
    let muB = SEP * s;
    let wA = 1;
    let wB = 1;
    if (collapsed) {
      const lose = 1 - smoothstep(0, 0.35, age);
      if (winner < 0) {
        muA = -SEP * (1 - settle);
        wB = lose;
      } else {
        muB = SEP * (1 - settle);
        wA = lose;
      }
    }
    // Before they part, one dent: let the two overlap rather than add.
    const join = 1 - smoothstep(0.0, 0.25, s);
    const whiten = collapsed ? smoothstep(0, 0.4, age) : 0;
    const muW = winner < 0 ? muA : muB;
    const rho = age * 0.55;
    const ring = collapsed ? Math.exp(-age * 1.4) : 0;

    const pos = geo.attributes.position as THREE.BufferAttribute;
    const col = geo.attributes.color as THREE.BufferAttribute;
    for (let i = 0; i < pos.count; i++) {
      const u = pos.getX(i) / HALF;
      const v = pos.getZ(i) / HALF;
      const a = well(u, v, muA) * wA;
      const b = well(u, v, muB) * wB;
      let dip = Math.max(a, b) * join + Math.min(1.2, a + b) * (1 - join);
      if (ring > 0.01) {
        const r = Math.hypot(u - muW, v * 1.15);
        dip -= ring * 0.12 * Math.exp(-(((r - rho) / 0.06) ** 2));
      }
      pos.setY(i, -dip * DEPTH);
      c.copy(GREY).multiplyScalar(0.46);
      const pa = clamp(a * 1.25) * 0.8;
      const pb = clamp(b * 1.25) * 0.8;
      if (winner < 0) {
        c.lerp(LIN.a, pa * (1 - whiten)).lerp(LIN.b, pb);
        c.lerp(LIN.w, pa * whiten * 0.6);
      } else {
        c.lerp(LIN.a, pa).lerp(LIN.b, pb * (1 - whiten));
        c.lerp(LIN.w, pb * whiten * 0.6);
      }
      col.setXYZ(i, c.r, c.g, c.b);
    }
    pos.needsUpdate = true;
    col.needsUpdate = true;
    geo.computeVertexNormals();

    // The mass, as a ghost in each place.
    const R = 11;
    const place = (
      mesh: THREE.Mesh | null,
      m: THREE.ShaderMaterial,
      mu: number,
      weight: number,
      tint: THREE.Color,
      isWinner: boolean
    ) => {
      if (!mesh) return;
      mesh.visible = weight > 0.01;
      const y = -(well(mu, 0, mu) * weight) * DEPTH + R * 0.82;
      mesh.position.set(mu * HALF, y, 0);
      mesh.scale.setScalar(R * (0.4 + 0.6 * weight));
      const tc = m.uniforms.uTint.value as THREE.Color;
      tc.copy(GREY).lerp(tint, 0.85);
      if (collapsed && isWinner) tc.lerp(LIN.w, whiten).multiplyScalar(1 + 1.6 * flash);
      m.uniforms.uOpacity.value = collapsed && isWinner ? 0.65 + 0.35 * whiten : 0.62 * weight;
    };
    place(ballA.current, matA, muA, wA, LIN.a, winner < 0);
    place(ballB.current, matB, muB, wB, LIN.b, winner > 0);

    const ctx = beginHud(hud);
    if (!ctx) return;
    // The gauge: E_G·t/ħ accumulating towards 1.
    const small = w < 520;
    const gx = w - (small ? 26 : 40);
    const gTop = h * 0.14;
    const gBot = h - (small ? 22 : 26) - h * 0.1;
    const gv = collapsed ? 1 - smoothstep(COLLAPSE + 0.02, 0.8, p) : gauge(p);
    ctx.fillStyle = 'rgba(8,9,11,0.6)';
    ctx.fillRect(gx - 9, gTop - 30, 18, gBot - gTop + 46);
    ctx.fillStyle = 'rgba(242,240,234,0.18)';
    ctx.fillRect(gx - 1, gTop, 2, gBot - gTop);
    ctx.fillStyle = collapsed ? HUD_COLORS.accent : HUD_COLORS.w;
    ctx.globalAlpha = collapsed ? 0.6 + 0.4 * flash : 0.85;
    ctx.fillRect(gx - 3, gBot - (gBot - gTop) * gv, 6, (gBot - gTop) * gv);
    ctx.globalAlpha = 1;
    ctx.fillStyle = 'rgba(242,240,234,0.85)';
    ctx.fillRect(gx - 7, gTop - 1, 14, 2);
    ctx.font = `500 ${small ? 9 : 10}px ${hud.font}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = 'rgba(236,234,230,0.75)';
    ctx.fillText('1', gx, gTop - 10);
    // E_G·t/ħ, with G set as a subscript.
    ctx.textAlign = 'left';
    const tail = '·t/ħ';
    const fs = small ? 9 : 10;
    const wE = ctx.measureText('E').width;
    const wT = ctx.measureText(tail).width;
    ctx.font = `500 ${fs * 0.75}px ${hud.font}`;
    const wG = ctx.measureText('G').width;
    const x0 = gx - 14 - wE - wG - wT;
    ctx.fillText('G', x0 + wE, gTop - 7);
    ctx.font = `500 ${fs}px ${hud.font}`;
    ctx.fillText('E', x0, gTop - 10);
    ctx.fillText(tail, x0 + wE + wG, gTop - 10);
    drawStrip(hud, ctx, {
      pxPerUnit: pxPerUnitAt(cam, h, cam.position.length()) * HALF * 0.2,
      unit: 'a.u.',
      mode: 'relief · schematic, not to scale',
      place: 'strip',
    });
  });

  return (
    <>
      <mesh geometry={geo} material={mat} />
      <mesh ref={ballA} material={matA}>
        <icosahedronGeometry args={[1, 4]} />
      </mesh>
      <mesh ref={ballB} material={matB}>
        <icosahedronGeometry args={[1, 4]} />
      </mesh>
      <mesh position={[0, -120, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[3000, 3000]} />
        <primitive object={sub} attach="material" />
      </mesh>
    </>
  );
}
