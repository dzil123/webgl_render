import { mat4 } from "../third-party/gl-matrix/index.js";

import * as util from "./util.js";
import * as webgl from "./webgl.js";
import * as gltf from "./gltf.js";
// import "./demo.js";

let gl = webgl.loadGL();

let vert = await webgl.loadShader(gl, "particle.vert");
let frag = await webgl.loadShader(gl, "particle.frag");

// let ext = util.nonnull(gl.getExtension("WEBGL_debug_shaders"));
// console.log(ext.getTranslatedShaderSource(vert));
// console.log(ext.getTranslatedShaderSource(frag));

let program = util.nonnull(gl.createProgram());
gl.attachShader(program, vert);
gl.attachShader(program, frag);
gl.linkProgram(program);

let aspect = gl.canvas.width / gl.canvas.height;

gl.clearColor(0.5, 0.5, 0.5, 1.0);
gl.useProgram(program);

let [gltfDoc, scene] = await gltf.loadGltf(gl, "polygon.gltf");

let render = scene.meshes[0]!.primitives[0]!;

// framebuffer vs renderbuffer

let fps_element = util.nonnull(document.getElementById("fps"));
let fps_avg_element = util.nonnull(document.getElementById("fps_avg"));
let then = 0;
let then_then = 0;
let counter = 0;
const avg_len = 60;

while (true) {
  let now = (await util.frame()) / 1000;

  webgl.resize(gl);

  let delta = now - then;
  then = now;
  let fps = 1.0 / delta;
  let fps_str = fps.toFixed(2);
  fps_element.innerText = fps_str;

  counter += 1;
  if (counter >= avg_len) {
    counter = 0;
    let delta = now - then_then;
    then_then = now;
    let fps = avg_len / delta;
    let fps_str = fps.toFixed(2);
    fps_avg_element.innerText = fps_str;
  }

  let fov = 70.0;
  let aspect = gl.canvas.width / gl.canvas.height;

  gl.clear(gl.COLOR_BUFFER_BIT);

  gltf.draw(gl, render);
}

function generate_polygon(count: number): [Float32Array, Uint8Array] {
  let delta_angle = (Math.PI * 2) / count;
  let start_angle = (Math.PI + delta_angle) * -0.5;
  let scale = 1.0 / Math.cos(delta_angle * 0.5);

  let array = new Float32Array(count * 2);

  for (let i = 0; i < count; i++) {
    let angle = start_angle + delta_angle * i;
    console.log((angle * 180) / Math.PI);

    array[i * 2] = Math.cos(angle) * scale;
    array[i * 2 + 1] = Math.sin(angle) * scale;
  }

  console.log(array);

  let indexArray = new Uint8Array((count - 2) * 3);
  for (let i = 0; i < count; i++) {
    indexArray[i * 3] = 0;
    indexArray[i * 3 + 1] = i + 1;
    indexArray[i * 3 + 2] = i + 2;
  }
  console.log(indexArray);

  return [array, indexArray];
}
