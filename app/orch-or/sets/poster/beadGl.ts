import { SPRITE_STRIDE } from '../../visuals/heroModel';

/**
 * The Ink hero's sprites, painted on paper instead of added as light. The
 * sprite list is the same (`heroFrame` with `depthOrder`), but each in-focus
 * monomer is shaded as a small lit bead (a sphere with a key light from the
 * upper left and a soft highlight) and painted over what is behind it, so
 * the near wall of the tube covers the far wall. Out-of-focus sprites (the
 * tubes behind, the dust) stay soft discs. The axis glow, which on black
 * is light, becomes a yellow wash under the tube that flares at collapse.
 * Returns null where WebGL2 is unavailable.
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
uniform vec3 u_wash;
out vec4 o;
void main() {
  vec2 q = (gl_PointCoord - 0.5) * 2.0;
  float d = length(q);
  if (d > 1.0) discard;
  vec3 col;
  float a;
  if (v_soft > 0.95) {
    // The axis glow: a broad yellow wash.
    a = exp(-d * d * 3.2) * v_color.a * 2.6;
    col = u_wash;
  } else if (v_soft > 0.5) {
    // Out of focus: a soft disc in the sprite's colour.
    a = exp(-d * d * 3.0) * smoothstep(1.0, 0.75, d) * v_color.a * 1.25;
    col = v_color.rgb;
  } else {
    // In focus: a lit bead.
    vec3 n = vec3(q.x, -q.y, sqrt(max(0.0, 1.0 - d * d)));
    vec3 l = normalize(vec3(-0.5, 0.62, 0.6));
    float diff = max(dot(n, l), 0.0);
    float spec = pow(max(dot(reflect(-l, n), vec3(0.0, 0.0, 1.0)), 0.0), 18.0);
    col = v_color.rgb * (0.62 + 0.5 * diff) + vec3(spec * 0.42);
    a = smoothstep(0.82, 0.7, d) * min(1.0, v_color.a * 1.35);
  }
  o = vec4(col * a, a);
}`;

export interface BeadRenderer {
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

export function createBeadRenderer(
  canvas: HTMLCanvasElement,
  wash: [number, number, number]
): BeadRenderer | null {
  let gl: WebGL2RenderingContext | null = null;
  try {
    gl = canvas.getContext('webgl2', {
      alpha: true,
      premultipliedAlpha: true,
      antialias: false,
      preserveDrawingBuffer: false,
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
  const uWash = gl.getUniformLocation(prog, 'u_wash');
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
      g.uniform3f(uWash, wash[0] / 255, wash[1] / 255, wash[2] / 255);
      g.enable(g.BLEND);
      // Painted, not added: each mark covers what is behind it.
      g.blendFunc(g.ONE, g.ONE_MINUS_SRC_ALPHA);
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
