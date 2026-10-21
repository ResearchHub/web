/**
 * Draws one full-screen fragment shader into a canvas with WebGL2. The shader
 * body defines `vec3 shade(vec2 fragCoord)` and may read `uRes`, `uTime` and
 * `uLayout`.
 */

export interface ShaderRenderer {
  /** Draws the frame for `seconds`, at the canvas's current CSS size. */
  render: (seconds: number) => void;
  dispose: () => void;
}

interface ShaderRendererOptions {
  /** Passed to the shader as `uLayout`. */
  layout: number;
  /** Caps device pixels per CSS pixel, to bound the cost of heavy shaders. */
  maxPixelRatio: number;
}

const VERTEX = `#version 300 es
in vec2 aPosition;
void main() { gl_Position = vec4(aPosition, 0.0, 1.0); }`;

const fragmentSource = (body: string) => `#version 300 es
precision highp float;
uniform vec2 uRes;
uniform float uTime;
uniform float uLayout;
out vec4 outColor;
${body}
void main() { outColor = vec4(shade(gl_FragCoord.xy), 1.0); }`;

function compile(gl: WebGL2RenderingContext, type: number, source: string): WebGLShader {
  const shader = gl.createShader(type);
  if (!shader) throw new Error('Could not create shader');
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw new Error(gl.getShaderInfoLog(shader) ?? 'Shader failed to compile');
  }
  return shader;
}

/** Returns null when the browser has no WebGL2. */
export function createShaderRenderer(
  canvas: HTMLCanvasElement,
  body: string,
  { layout, maxPixelRatio }: ShaderRendererOptions
): ShaderRenderer | null {
  const gl = canvas.getContext('webgl2', {
    alpha: false,
    antialias: false,
    depth: false,
    powerPreference: 'low-power',
  });
  if (!gl) return null;

  const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX);
  const fragment = compile(gl, gl.FRAGMENT_SHADER, fragmentSource(body));
  const program = gl.createProgram();
  if (!program) throw new Error('Could not create program');
  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error(gl.getProgramInfoLog(program) ?? 'Program failed to link');
  }
  gl.useProgram(program);

  // One triangle that covers the screen.
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const position = gl.getAttribLocation(program, 'aPosition');
  gl.enableVertexAttribArray(position);
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

  const resolution = gl.getUniformLocation(program, 'uRes');
  const time = gl.getUniformLocation(program, 'uTime');
  gl.uniform1f(gl.getUniformLocation(program, 'uLayout'), layout);

  return {
    render(seconds) {
      if (gl.isContextLost()) return;
      const ratio = Math.min(window.devicePixelRatio || 1, maxPixelRatio);
      const width = Math.max(1, Math.round(canvas.clientWidth * ratio));
      const height = Math.max(1, Math.round(canvas.clientHeight * ratio));
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }
      gl.viewport(0, 0, width, height);
      gl.uniform2f(resolution, width, height);
      gl.uniform1f(time, seconds);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    },
    dispose() {
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      gl.deleteShader(vertex);
      gl.deleteShader(fragment);
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    },
  };
}
