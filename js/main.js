import * as util from "./util.js";
import * as webgl from "./webgl.js";
import * as websocket from "./websocket.js";
// import "./demo.js";
function message_handler(data) {
    uploadCameraMatrix(new Float32Array(data["mat4"]));
}
let gl = webgl.loadGL();
let vert = await webgl.loadShader(gl, "fullscreen_tri.vert");
let frag = await webgl.loadShader(gl, "raymarch.frag");
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
    1, 0, 0, 0, 0, 0.976, -0.216, 0, 0, 0.216, 0.976, 0, 0, 1, 5, 1,
]));
uploadSceneSpheres(new Float32Array([0, 0, -1, 2.7, 3, 1, 0, 1.2, -2, -1, 1, 1]));
let ws_promise = websocket.createWS(message_handler);
while (true) {
    let sec = (await util.frame()) / 1000;
    uploadGlobals(new Float32Array([sec, 0, 0, 0]));
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 3);
}
//# sourceMappingURL=main.js.map