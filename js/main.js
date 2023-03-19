import * as util from "./util.js";
import * as webgl from "./webgl.js";
import * as websocket from "./websocket.js";
// import "./demo.js";
function message_handler(data) {
    // console.log(data["mat4"]);
    uploadCameraMatrix(new Float32Array(data["mat4"]));
    uploadSceneSpheres(new Float32Array(data["objects"]["sphere"]));
}
let gl = webgl.loadGL();
let vert = await webgl.loadShader(gl, "fullscreen_tri.vert");
let frag = await webgl.loadShader(gl, "raymarch.frag");
// let ext = util.nonnull(gl.getExtension("WEBGL_debug_shaders"));
// console.log(ext.getTranslatedShaderSource(vert));
// console.log(ext.getTranslatedShaderSource(frag));
let program = util.nonnull(gl.createProgram());
gl.attachShader(program, vert);
gl.attachShader(program, frag);
gl.linkProgram(program);
let aspect = gl.canvas.width / gl.canvas.height;
gl.clearColor(1.0, 1.0, 1.0, 1.0);
gl.useProgram(program);
// framebuffer vs renderbuffer
let uploadCameraMatrix = webgl.texture(gl, program, "cameraMatrix", 4);
let uploadSceneSpheres = webgl.texture(gl, program, "sceneSpheres", 1);
let uploadGlobals = webgl.texture(gl, program, "globals", 1);
uploadCameraMatrix(new Float32Array([
    0.760406, 0, -0.649448, 0, -0.039648, 0.998135, -0.046421, 0, 0.648236,
    0.061048, 0.758988, 0, 3.823527, 0.299516, 7.624601, 1,
]));
uploadSceneSpheres(new Float32Array([0, 0, -1, 2.7, 3, 1, 0, 1.2, -2, -1, 1, 1]));
let ws_promise = websocket.createWS(message_handler);
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
    uploadGlobals(new Float32Array([now, fov, aspect, 0]));
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 3);
}
//# sourceMappingURL=main.js.map