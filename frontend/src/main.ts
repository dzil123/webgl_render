import * as util from "./util.js";
import * as webgl from "./webgl.js";

let gl = webgl.loadGL();

// gl.viewport()

gl.clearColor(1.0, 1.0, 1.0, 1.0);
gl.clear(gl.COLOR_BUFFER_BIT);

let vert = await webgl.loadShader(gl, "fullscreen_tri.vert");
let frag = await webgl.loadShader(gl, "demo.frag");

let program = gl.createProgram();
if (program === null) {
  throw new Error("program is null");
}
gl.attachShader(program, vert);
gl.attachShader(program, frag);
gl.linkProgram(program);

gl.useProgram(program);
gl.drawArrays(gl.TRIANGLE_STRIP, 0, 3);
// gl.drawArrays(gl.POINTS, 0, 3);
