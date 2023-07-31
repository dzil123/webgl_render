import { mat4 } from "../third-party/gl-matrix/index.js";
import * as util from "./util.js";
import * as webgl from "./webgl.js";
import * as gltf from "./gltf.js";
import * as websocket from "./websocket.js";
// import "./demo.js";
const modelMat = mat4.create();
const viewMat = mat4.create();
const modelViewMat = mat4.create(); // tmp
const projectionMat = mat4.create();
function message_handler(data) {
    mat4.invert(viewMat, data["mat4"]);
}
let gl = webgl.loadGL();
let program = await webgl.loadProgram(gl, ["3d.vert", "3d.frag"], ["modelview_mat", "projection_mat"]);
program.uniforms.modelview_mat;
let aspect = gl.canvas.width / gl.canvas.height;
gl.clearColor(0.5, 0.5, 0.5, 1.0);
gl.useProgram(program.glProgram);
gl.enable(gl.DEPTH_TEST);
gl.enable(gl.BLEND);
// premultiplied alpha
gl.blendEquationSeparate(gl.FUNC_ADD, gl.FUNC_ADD);
gl.blendFuncSeparate(gl.ONE, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
// const modelName = "polygon.gltf";
const modelName = "suzanne.gltf";
let [gltfDoc, scene] = await gltf.loadGltf(gl, modelName);
let render = scene.meshes[0].primitives[0];
const defaultViewMat = [
    0.760406, 0, -0.649448, 0, -0.039648, 0.998135, -0.046421, 0, 0.648236, 0.061048,
    0.758988, 0, 3.823527, 0.299516, 7.624601, 1,
];
mat4.invert(viewMat, defaultViewMat);
let ws_promise = websocket.createWS(message_handler);
// framebuffer vs renderbuffer
let fps_element = util.nonnull(document.getElementById("fps"));
let fps_avg_element = util.nonnull(document.getElementById("fps_avg"));
let then = 0;
let then_then = 0;
let counter = 0;
const avg_len = 60;
while (true) {
    await util.sleep(0.03);
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
    mat4.perspective(projectionMat, fov, aspect, 0.1, 10.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    mat4.mul(modelViewMat, modelMat, viewMat);
    gl.uniformMatrix4fv(program.uniforms.modelview_mat, false, modelViewMat);
    gl.uniformMatrix4fv(program.uniforms.projection_mat, false, projectionMat);
    gltf.draw(gl, render);
}
function generate_polygon(count) {
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
//# sourceMappingURL=main.js.map