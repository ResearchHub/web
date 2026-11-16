'use client';

import { Mesh, Program, Renderer, Triangle } from 'ogl';
import { useEffect, useRef, useState } from 'react';
import { useFigureLoop } from '../../visuals/useFigureLoop';
import type { LiveFigureProps } from '../types';
import { PRELUDE, VERTEX, paletteUniforms, type SpectralFigure, type Uniforms } from './glsl';
import { anesthesia } from './anesthesia';
import { hero } from './hero';
import { raster } from './raster';
import { spacetime } from './spacetime';
import { superradiance } from './superradiance';
import { wigner } from './wigner';

const FIGURES: Record<LiveFigureProps['fig'], SpectralFigure> = {
  hero,
  anesthesia,
  superradiance,
  wigner,
  spacetime,
  raster,
};

interface Gl {
  renderer: Renderer;
  mesh: Mesh;
  uniforms: Uniforms;
}

/**
 * The Spectral set: each figure is one full-frame fragment shader drawn with
 * OGL, so the picture is a field computed per pixel. The loop, sizing,
 * off-screen pause and still frame come from `useFigureLoop`.
 */
export default function SpectralLive({ fig, still, onReady }: LiveFigureProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glRef = useRef<Gl | null>(null);
  const failed = useRef(false);
  const figure = FIGURES[fig];
  // `?spectral-t=<seconds>` starts (or, with reduced motion, freezes) the
  // figure at that moment, for checking frames.
  const [start] = useState(() => {
    const v = Number(new URLSearchParams(window.location.search).get('spectral-t'));
    return Number.isFinite(v) && v > 0 ? v : figure.still;
  });

  const ready = useFigureLoop(
    canvasRef,
    (t, { w, h, dpr }) => {
      const canvas = canvasRef.current;
      if (!canvas || failed.current) return false;
      if (!glRef.current) {
        try {
          const renderer = new Renderer({
            canvas,
            width: canvas.width,
            height: canvas.height,
            dpr: 1,
            depth: false,
            powerPreference: 'low-power',
          });
          // OGL sizes the canvas's style; the page sizes it instead.
          canvas.style.width = '';
          canvas.style.height = '';
          const uniforms: Uniforms = {
            uRes: { value: [canvas.width, canvas.height] },
            uDpr: { value: dpr },
            uTime: { value: t },
            ...paletteUniforms(),
            ...figure.uniforms(),
          };
          const program = new Program(renderer.gl, {
            vertex: VERTEX,
            fragment: PRELUDE + figure.frag,
            uniforms,
            depthTest: false,
            depthWrite: false,
          });
          const mesh = new Mesh(renderer.gl, { geometry: new Triangle(renderer.gl), program });
          glRef.current = { renderer, mesh, uniforms };
        } catch {
          failed.current = true;
          return false;
        }
      }
      const { renderer, mesh, uniforms } = glRef.current;
      renderer.width = canvas.width;
      renderer.height = canvas.height;
      uniforms.uRes.value = [canvas.width, canvas.height];
      uniforms.uDpr.value = dpr;
      uniforms.uTime.value = t;
      figure.update(uniforms, t, w, h);
      renderer.render({ scene: mesh });
    },
    { still: start, maxDpr: still ? 2 : 1.5 }
  );

  useEffect(() => {
    if (ready) onReady();
  }, [ready, onReady]);

  // Free the GL context when the figure leaves (the gallery holds many).
  useEffect(
    () => () => {
      const gl = glRef.current?.renderer.gl;
      glRef.current = null;
      gl?.getExtension('WEBGL_lose_context')?.loseContext();
    },
    []
  );

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      data-renderer="ogl"
      className="absolute inset-0 h-full w-full bg-[var(--o-ink)]"
    />
  );
}
