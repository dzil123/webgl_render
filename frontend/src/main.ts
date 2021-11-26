import * as util from "./util.js";
import * as webgl from "./webgl.js";

let gl = webgl.loadGL();

let vert = await webgl.loadShader(gl, "fullscreen_tri.vert");
let frag = await webgl.loadShader(gl, "raymarch.frag");

let program = util.nonnull(gl.createProgram());
gl.attachShader(program, vert);
gl.attachShader(program, frag);
gl.linkProgram(program);

gl.clearColor(1.0, 1.0, 1.0, 1.0);
gl.useProgram(program);

// framebuffer vs renderbuffer

while (true) {
  let x = await util.frame();
  //   if (Math.random() < 0.01) {
  //     console.log(x);
  //   }

  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 3);
}
