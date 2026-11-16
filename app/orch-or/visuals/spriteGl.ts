import { SPRITE_STRIDE } from './heroModel';

/**
 * A WebGL2 point-sprite renderer for the hero: one draw call for every
 * tubulin monomer, glow and dust particle, additively blended. Returns null
 * where WebGL2 is unavailable, and the caller falls back to Canvas 2D.
 */

const VERT = `#version 300 es
in vec2 a_pos;
in vec2 a_sizeSoft;
in vec4 a_color;
uniform vec2 u_res;
uniform float u_dpr;
uniform float u_maxSize;
out vec4 v_color;
out float v_soft;
void main() {
  vec2 clip = (a_pos / u_res) * 2.0 - 1.0;
  gl_Position = vec4(clip.x, -clip.y, 0.0, 1.0);
  gl_PointSize = min(a_sizeSoft.x * u_dpr, u_maxSize);
  v_color = a_color;
  v_soft = a_sizeSoft.y;
}`;

const FRAG = `#version 300 es
precision mediump float;
in vec4 v_color;
in float v_soft;
out vec4 o;
void main() {
  float d = length(gl_PointCoord - 0.5) * 2.0;
  if (d > 1.0) discard;
  float hard = smoothstep(1.0, 0.62, d) * 0.9 + exp(-d * d * 5.0) * 0.25;
  float soft = exp(-d * d * 4.5);
  float a = mix(hard, soft, v_soft) * v_color.a;
  o = vec4(v_color.rgb * a, a);
}`;

export interface SpriteRenderer {
  draw(data: Float32Array, count: number, w: number, h: number, dpr: number): void;
  dispose(): void;
}

function compile(gl: WebGL2RenderingContext, type: number, src: string) {
  const sh = gl.createShader(type);
  if (!sh) return null;
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    gl.deleteShader(sh);
    return null;
  }
  return sh;
}

export function createSpriteRenderer(canvas: HTMLCanvasElement): SpriteRenderer | null {
  let gl: WebGL2RenderingContext | null = null;
  try {
    gl = canvas.getContext('webgl2', {
      alpha: true,
      premultipliedAlpha: true,
      antialias: false,
      powerPreference: 'low-power',
    });
  } catch {
    gl = null;
  }
  if (!gl) return null;

  const vs = compile(gl, gl.VERTEX_SHADER, VERT);
  const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
  const prog = gl.createProgram();
  if (!vs || !fs || !prog) return null;
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null;

  const vao = gl.createVertexArray();
  const buf = gl.createBuffer();
  gl.bindVertexArray(vao);
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  const stride = SPRITE_STRIDE * 4;
  const attr = (name: string, size: number, offset: number) => {
    const loc = gl!.getAttribLocation(prog, name);
    gl!.enableVertexAttribArray(loc);
    gl!.vertexAttribPointer(loc, size, gl!.FLOAT, false, stride, offset * 4);
  };
  attr('a_pos', 2, 0);
  attr('a_sizeSoft', 2, 2);
  attr('a_color', 4, 4);
  gl.bindVertexArray(null);

  const uRes = gl.getUniformLocation(prog, 'u_res');
  const uDpr = gl.getUniformLocation(prog, 'u_dpr');
  const uMax = gl.getUniformLocation(prog, 'u_maxSize');
  const range = gl.getParameter(gl.ALIASED_POINT_SIZE_RANGE) as Float32Array;
  const maxSize = range?.[1] ?? 64;
  let capacity = 0;

  return {
    draw(data, count, w, h, dpr) {
      const g = gl!;
      g.viewport(0, 0, g.drawingBufferWidth, g.drawingBufferHeight);
      g.clearColor(0, 0, 0, 0);
      g.clear(g.COLOR_BUFFER_BIT);
      if (count === 0) return;
      g.useProgram(prog);
      g.bindVertexArray(vao);
      g.bindBuffer(g.ARRAY_BUFFER, buf);
      if (data.byteLength > capacity) {
        g.bufferData(g.ARRAY_BUFFER, data.byteLength, g.DYNAMIC_DRAW);
        capacity = data.byteLength;
      }
      g.bufferSubData(g.ARRAY_BUFFER, 0, data, 0, count * SPRITE_STRIDE);
      g.uniform2f(uRes, w, h);
      g.uniform1f(uDpr, dpr);
      g.uniform1f(uMax, maxSize);
      g.enable(g.BLEND);
      g.blendFunc(g.ONE, g.ONE);
      g.drawArrays(g.POINTS, 0, count);
      g.bindVertexArray(null);
    },
    dispose() {
      gl!.deleteBuffer(buf);
      gl!.deleteVertexArray(vao);
      gl!.deleteProgram(prog);
    },
  };
}
