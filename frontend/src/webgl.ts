/// <reference path="../node_modules/webgl-strict-types/index.d.ts" />

import "../third-party/webgl-lint.js";
import { mat4 } from "../third-party/gl-matrix/index.js";

import * as util from "./util.js";

type GL2Context = WebGL2RenderingContextStrict;
import GL = WebGLRenderingContextStrict;
import GL2 = WebGL2RenderingContextStrict;

export function loadGL(): GL2 {
  let canvas = document.getElementById("canvas");
  if (!(canvas instanceof HTMLCanvasElement)) {
    throw new Error("Expected element to be a canvas");
  }

  let gl = canvas.getContext("webgl2") as any as GL2Context;
  gl = util.nonnull(gl);

  return gl;
}

async function downloadShader(name: string): Promise<string> {
  let url = `/shaders/${name}`;
  let response = await fetch(url);
  if (!response.ok) {
    throw new Error(
      `Failed to download shader ${name}: ${response.status} ${response.statusText}`
    );
  }

  let source = await response.text();
  return source;
}

function typeOfShader(gl: GL2Context, name: string): GL.ShaderType {
  if (name.endsWith(".vert")) {
    return gl.VERTEX_SHADER;
  } else if (name.endsWith(".frag")) {
    return gl.FRAGMENT_SHADER;
  } else {
    throw new Error(`Invalid shader name: ${name}`);
  }
}

export async function loadShader(
  gl: GL2Context,
  name: string
): Promise<WebGLShader> {
  let source = await downloadShader(name);

  let shader = gl.createShader(typeOfShader(gl, name));
  shader = util.nonnull(shader);

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  return shader;
}

function textureIndex(i: number): GL.TextureUnit {
  const GL_TEXTURE0 = 0x84c0;

  if (!(Number.isInteger(i) && 0 <= i && i < 32)) {
    throw new Error(`Texture index ${i} must be 0 <= x < 32`);
  }

  // @ts-ignore
  return GL_TEXTURE0 + i;
}

const globalTextures = util.new_globals<WebGLProgram, number>();

export function texture(
  gl: GL2,
  program: WebGLProgram,
  name: string,
  width: number
): (data: Float32Array) => void {
  // keep a counter for each program to assign a unique monotonic id for each texture
  let global_storage = globalTextures(program);
  if (global_storage.length == 0) {
    global_storage[0] = 0;
  } else {
    global_storage[0] += 1;
  }
  let index = global_storage[0];

  let unit = textureIndex(index);

  let uniformLocation = gl.getUniformLocation(program, name);
  if (uniformLocation === null) {
    console.warn(`unused texture '${name}'`);

    function writeTexture(_: Float32Array) {}

    return writeTexture;
  }

  let texture = gl.createTexture();
  texture = util.nonnull(texture);

  gl.activeTexture(unit);
  gl.bindTexture(gl.TEXTURE_2D, texture);

  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_R, gl.CLAMP_TO_EDGE);

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
      pixels
    );
  }
}
