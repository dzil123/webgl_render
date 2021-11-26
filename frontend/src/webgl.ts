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
