import { mat4 } from "../third-party/gl-matrix/index.js";

import * as util from "./util.js";
import * as webgl from "./webgl.js";
import * as gltf from "./gltf.js";
import * as websocket from "./websocket.js";
// import "./demo.js";
import { ctx } from "./demo_2d.js";

const modelMat = mat4.create();
const viewMat = mat4.create();
const modelViewMat = mat4.create(); // tmp
const projectionMat = mat4.create();

function message_handler(data: { [name: string]: any }) {
  // console.log(JSON.stringify(data["mat4"]));
  mat4.invert(viewMat, data["mat4"]);
}

const gl = webgl.loadGL("canvas");

const program = await webgl.loadProgram(
  gl,
  // ["3d.vert", "3d.frag"],
  // ["modelview_mat", "projection_mat"],
  ["fullscreen_tri.vert", "tex.frag"],
  ["mytex"],
);

const aspect = gl.canvas.width / gl.canvas.height;

gl.clearColor(0.5, 0.5, 0.5, 1.0);
gl.useProgram(program.glProgram);

const bw_tex = gl.createTexture();
gl.activeTexture(gl.TEXTURE3);
gl.bindTexture(gl.TEXTURE_2D, bw_tex);

gl.texImage2D(
  gl.TEXTURE_2D,
  0,
  gl.RGBA,
  1,
  1,
  0,
  gl.RGBA,
  gl.UNSIGNED_BYTE,
  new Uint8Array([0, 0, 255, 255]),
);

gl.texImage2D(
  gl.TEXTURE_2D, // target: GL.TexImage2DTarget
  0, // level: GLint
  gl.R8, // internalformat: GL2['R8']
  // ctx.canvas.width, // width: GLsizei (optional)
  // ctx.canvas.height, // height: GLsizei (optional)
  // 0, // border: 0 (optional)
  gl.RED, // format: GL2['RED']
  gl.UNSIGNED_BYTE, // type: GL2['UNSIGNED_BYTE']
  ctx.canvas, // source: TexImageSource
);

gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_R, gl.CLAMP_TO_EDGE);

gl.uniform1i(program.uniforms.mytex, 3);

gl.enable(gl.DEPTH_TEST);
gl.enable(gl.BLEND);
// premultiplied alpha
gl.blendEquationSeparate(gl.FUNC_ADD, gl.FUNC_ADD);
gl.blendFuncSeparate(
  gl.ONE,
  gl.ONE_MINUS_SRC_ALPHA,
  gl.ONE,
  gl.ONE_MINUS_SRC_ALPHA,
);

// const modelName = "polygon.gltf";
// const modelName = "suzanne.gltf";
const modelName = "suzanne_smooth.gltf";
const [gltfDoc, scene] = await gltf.loadGltf(gl, modelName);

const render = scene.meshes[0]!.primitives[0]!;

const defaultViewMat = [
  0.793353, 0, -0.608761, 0, -0.113548, 0.98245, -0.147979, 0, 0.598078,
  0.186524, 0.77943, 0, 2.028424, 0.556175, 2.414567, 1,
] as const;
mat4.invert(viewMat, defaultViewMat);

// const ws_promise = websocket.createWS(message_handler);

// framebuffer vs renderbuffer

await util.mainloop(() => {
  webgl.resize(gl);

  const fov = 70.0;
  const aspect = gl.canvas.width / gl.canvas.height;
  mat4.perspective(projectionMat, fov, aspect, 0.1, 10.0);

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  mat4.mul(modelViewMat, modelMat, viewMat);

  // gl.uniformMatrix4fv(program.uniforms.modelview_mat, false, modelViewMat);
  // gl.uniformMatrix4fv(program.uniforms.projection_mat, false, projectionMat);

  // gltf.draw(gl, render);
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 3);
});

function generate_polygon(count: number): [Float32Array, Uint8Array] {
  const delta_angle = (Math.PI * 2) / count;
  const start_angle = (Math.PI + delta_angle) * -0.5;
  const scale = 1.0 / Math.cos(delta_angle * 0.5);

  const array = new Float32Array(count * 2);

  for (let i = 0; i < count; i++) {
    const angle = start_angle + delta_angle * i;
    console.log((angle * 180) / Math.PI);

    array[i * 2] = Math.cos(angle) * scale;
    array[i * 2 + 1] = Math.sin(angle) * scale;
  }

  console.log(array);

  const indexArray = new Uint8Array((count - 2) * 3);
  for (let i = 0; i < count; i++) {
    indexArray[i * 3] = 0;
    indexArray[i * 3 + 1] = i + 1;
    indexArray[i * 3 + 2] = i + 2;
  }
  console.log(indexArray);

  return [array, indexArray];
}
