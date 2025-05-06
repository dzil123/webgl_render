import "../third-party/webgl-lint.js";

import * as util from "./util.js";
import * as canvas from "./canvas.js";

export import GL = WebGLRenderingContextStrict;
export type GL2 = WebGL2RenderingContextStrict &
  WebGLRenderingContextStrict.Base_OES_element_index_uint; // bug in webgl-strict-types

export enum VertexAttributeLayout {
  Position = 0,
  Normal = 1,
}

export interface Program<K extends string> {
  glProgram: WebGLProgram;
  uniforms: Record<K, WebGLUniformLocation | null>;
}

export function debugExt(gl: GL2, callback: (ext: any) => any): any {
  /* a esliant-disable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
  // @ts-ignore
  const ext: any = gl.getExtension("GMAN_debug_helper");
  if (ext) {
    return callback(ext);
  }
  /* a esalint-enable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
  return undefined;
}

export function loadGL(elementId: string): GL2 {
  const gl_ = canvas.getCanvasById(elementId).getContext("webgl2");
  const gl = util.nonnull(gl_) as unknown as GL2;

  resize(gl);
  debugExt(gl, (ext) =>
    ext.setConfiguration({
      failUnsetSamplerUniforms: true,
    }),
  );

  return gl;
}

function typeOfShader(gl: GL2, name: string): GL.ShaderType {
  if (name.endsWith(".vert")) {
    return gl.VERTEX_SHADER;
  } else if (name.endsWith(".frag")) {
    return gl.FRAGMENT_SHADER;
  } else {
    throw new Error(`Invalid shader name: ${name}`);
  }
}

// input.replaceAll(/^\s*#include\s+"([\w.-_]*)"/mg, (_, name) => name.toUpperCase())
export async function loadShader(gl: GL2, name: string): Promise<WebGLShader> {
  const include = await util.download("shaders/", "include.glsl", (r) =>
    r.text(),
  );
  let source = await util.download("shaders/", name, (r) => r.text());
  source = include + source;

  let shader = gl.createShader(typeOfShader(gl, name));
  shader = util.nonnull(shader);

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  return shader;
}

export async function loadProgram<K extends string>(
  gl: GL2,
  shaders: string[],
  uniformNames: K[],
): Promise<Program<K>> {
  const glProgram = util.nonnull(gl.createProgram());

  await Promise.all(
    shaders.map(async (name) => {
      const shader = await loadShader(gl, name);
      gl.attachShader(glProgram, shader);

      // let ext = util.nonnull(gl.getExtension("WEBGL_debug_shaders"));
      // console.log(ext.getTranslatedShaderSource(shader));

      gl.deleteShader(shader);
    }),
  );

  gl.linkProgram(glProgram);

  const numUniforms = gl.getProgramParameter(glProgram, gl.ACTIVE_UNIFORMS);
  console.log(`uniforms found: ${numUniforms}`);
  for (let i = 0; i < numUniforms; i++) {
    console.log(`uniform #${i}`, gl.getActiveUniform(glProgram, i));
  }

  const uniforms: Partial<Record<K, WebGLUniformLocation | null>> = {};
  uniformNames.forEach((name) => {
    uniforms[name] = gl.getUniformLocation(glProgram, name);
  });

  return { glProgram, uniforms: uniforms as never };
}

export function textureIndex(i: number): GL.TextureUnit {
  if (!(Number.isInteger(i) && 0 <= i && i < 32)) {
    throw new Error(`Texture index ${i} must be 0 <= x < 32`);
  }

  // @ts-expect-error this is the correct way to use the api
  return WebGL2RenderingContext.TEXTURE0 + i;
}

// TODO: rewrite this - texture units must only be unique within a program, not across programs
const globalTextures = util.new_globals<WebGLProgram, number>();

export function textureSetNearest(gl: GL2) {
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_R, gl.CLAMP_TO_EDGE);
}

// creates a f32 vec4 datatexture and returns a function to upload data to it
// this also sets the uniform on the program, so this program must be active (gl.useProgram) when this is called
export function textureFloat32Array(
  gl: GL2,
  program: WebGLProgram,
  name: string,
  width: number,
): (data: Float32Array) => void {
  // keep a counter for each program to assign a unique monotonic id for each texture
  const global_storage = globalTextures(program);
  if (global_storage[0] === undefined) {
    global_storage[0] = 0;
  } else {
    global_storage[0] += 1;
  }
  const index = util.nonnull(global_storage[0]);

  const unit = textureIndex(index);

  const uniformLocation = gl.getUniformLocation(program, name);
  if (uniformLocation === null) {
    console.warn(`unused texture '${name}'`);

    function writeTexture(_: Float32Array) {}

    return writeTexture;
  }

  let texture = gl.createTexture();
  texture = util.nonnull(texture);

  gl.activeTexture(unit);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  textureSetNearest(gl);

  gl.uniform1i(uniformLocation, index);

  const rowSize = 4 * width; // 'width' number of vec4s

  return writeTexture;

  function writeTexture(data: Float32Array) {
    if (!(data.length % rowSize == 0)) {
      throw new Error(`length of data not divisible by ${rowSize}`);
    }

    gl.activeTexture(unit);

    const target = gl.TEXTURE_2D;
    const level = 0;
    const internalFormat = gl.RGBA32F;
    const width_ = width;
    const height = data.length / rowSize;
    const border = 0;
    const format = gl.RGBA;
    const type = gl.FLOAT;
    const pixels = data;
    gl.texImage2D(
      target,
      level,
      internalFormat,
      width_,
      height,
      border,
      format,
      type,
      pixels,
    );
  }
}

export function resize(gl: GL2) {
  if (canvas.resize(gl.canvas)) {
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  }
}

export function premultipliedAlphaBlending(gl: GL2) {
  gl.enable(gl.BLEND);
  gl.blendEquation(gl.FUNC_ADD);
  gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
}
