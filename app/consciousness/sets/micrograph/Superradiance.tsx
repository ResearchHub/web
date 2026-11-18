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
 * Q3, quantum states: superradiance. A microtubule with its open end toward
 * the viewer, 13 strands round the hollow core. First the tryptophans emit
 * on their own: scattered violet flashes, a low slow decay on the trace.
 * Then an excitation runs down the tube, every site pulses chartreuse in
 * step, and they emit one bright burst: tall and fast on the trace. Timings
 * follow the Ink figure (visuals/scenes/superradiance.ts); schematic.
 */

const CYCLE = 10;
const IND_START = 0.3;
const IND_TAU = 1.3;
const WAVE_START = 4.6;
const WAVE_DUR = 0.7;
const BURST = 5.6;
const BURST_TAU = 0.26;
const TRACE_T = 3;
const STILL = 5.8;
const ROWS = 40;

const SITES = lattice(ROWS);
const LEN = ROWS * MT.rise;
const r = rng(1013);
const EMIT = SITES.map(() => IND_START - Math.log(1 - r() * 0.98) * IND_TAU);

const indCurve = (tau: number) => (tau < 0 ? 0 : 0.3 * Math.exp(-tau / IND_TAU));
const burstCurve = (tau: number) =>
  tau < -0.06 ? 0 : tau < 0 ? 0.95 * smoothstep(-0.06, 0, tau) : 0.95 * Math.exp(-tau / BURST_TAU);

const DIST = 235;

export function Superradiance({ still, hud }: SceneProps) {
  const tube = useRef<THREE.InstancedMesh>(null);
  const shell = useRef<THREE.Mesh>(null);
  const rig = useRef<THREE.Group>(null);
  const geo = useMemo(() => lumpyBead(5, 2, 0.2), []);
  const mat = useMemo(() => semMaterial({ base: 0.16, edge: 1.25 }), []);
  const shellMat = useMemo(() => {
    // Rim only: the detector term is cancelled so the shell reads as an edge.
    const m = semMaterial({ base: -0.36, edge: 1.4, edgePow: 7, additive: true });
    m.side = THREE.DoubleSide;
    return m;
  }, []);
  const sub = useMemo(() => substrateMaterial(1), []);

  useFrame((state) => {
    const t = still ? STILL : STILL + state.clock.elapsedTime;
    const tc = ((t % CYCLE) + CYCLE) % CYCLE;
    const { width: w, height: h } = state.size;
    const cam = state.camera as THREE.PerspectiveCamera;
    const narrow = w / h < 1.1;
    cam.position.set(0, 0, narrow ? DIST * 1.25 : DIST);
    cam.lookAt(0, 0, 0);
    if (rig.current) {
      rig.current.position.set(narrow ? -22 : -48, narrow ? 2 : -2, 40);
      rig.current.rotation.set(0.42, narrow ? -0.5 : -0.62, 0.1);
    }

    const out = 1 - smoothstep(CYCLE - 0.8, CYCLE - 0.1, tc);
    const front = clamp((tc - WAVE_START) / WAVE_DUR) * LEN;
    const inPhase = tc >= WAVE_START && tc < BURST + 0.9;
    const pulse = 0.5 + 0.5 * Math.sin((tc - WAVE_START) * Math.PI * 2 * 2.2);
    const flash = tc >= BURST ? Math.exp(-(tc - BURST) / BURST_TAU) : 0;
    const build = smoothstep(WAVE_START, BURST, tc) * (tc < BURST ? 1 : 0);
    const settle = 1 - smoothstep(BURST + 0.5, BURST + 0.9, tc);

    if (tube.current)
      writeTube(tube.current, {
        sites: SITES,
        // Open end at z = 0, toward the viewer; the tube runs away along -z.
        zOffset: -LEN,
        spin: 0.25,
        color: (i, z, o) => {
          const u = -z; // distance from the open end
          o.copy(GREY);
          const age = tc - EMIT[i];
          if (age >= 0 && age < 0.5 && tc < WAVE_START) {
            const f = 1 - age / 0.5;
            o.lerp(LIN.b, 0.9 * f).multiplyScalar(1 + 1.1 * f);
          }
          if (inPhase && u <= front) {
            const lit = smoothstep(front, front - LEN * 0.12, u);
            const a = ((0.2 + 0.35 * pulse * (0.4 + build)) * (1 - flash) * lit + flash) * settle;
            o.lerp(LIN.a, Math.min(0.92, a * 1.8)).multiplyScalar(1 + 0.9 * a);
          }
          o.multiplyScalar(out * 0.85 + 0.15);
        },
      });

    // The burst: a shell of light leaving the whole tube.
    if (shell.current) {
      const age = tc - BURST;
      const on = age > 0 && age < 1.4;
      shell.current.visible = on;
      if (on) {
        const g = 1.4 + age * 3;
        shell.current.scale.set(MT.radius * 1.6 * g, MT.radius * 1.6 * g, (LEN / 2) * (1.15 + age));
        shellMat.uniforms.uOpacity.value = 0.7 * Math.exp(-age / 0.45) * out;
        (shellMat.uniforms.uTint.value as THREE.Color).copy(LIN.a).multiplyScalar(1.4);
      }
    }

    const ctx = beginHud(hud);
    if (!ctx) return;
    const small = w < 520;
    const sh = small ? 22 : 26;
    const ph = Math.max(70, h * 0.2);
    tracePanel(
      hud,
      ctx,
      {
        x: small ? 8 : 14,
        y: h - sh - ph - (small ? 8 : 12),
        w: small ? w - 16 : Math.min(w * 0.42, 380),
        h: ph,
      },
      'Emission · intensity against time',
      (plot) => {
        const fade = (c: string) =>
          out < 1
            ? c +
              Math.round(out * 255)
                .toString(16)
                .padStart(2, '0')
            : c;
        plot(
          (x) => indCurve(x * TRACE_T),
          fade(HUD_COLORS.b),
          Math.min(1, (tc - IND_START) / TRACE_T)
        );
        if (tc > BURST - 0.06)
          plot(
            (x) => burstCurve(x * TRACE_T),
            fade(HUD_COLORS.a),
            Math.min(1, (tc - BURST) / TRACE_T),
            1.8
          );
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
        <instancedMesh ref={tube} args={[geo, mat, SITES.length]} frustumCulled={false} />
        <mesh ref={shell} position={[0, 0, -LEN / 2]} visible={false}>
          <sphereGeometry args={[1, 48, 32]} />
          <primitive object={shellMat} attach="material" />
        </mesh>
      </group>
      <mesh position={[0, 0, -600]}>
        <planeGeometry args={[2400, 2400]} />
        <primitive object={sub} attach="material" />
      </mesh>
    </>
  );
}
