import * as util from "./util.js";
import * as webgl from "./webgl.js";

let gl = webgl.loadGL();

// gl.viewport()

let vert = await webgl.loadShader(gl, "fullscreen_tri.vert");
let frag = await webgl.loadShader(gl, "demo.frag");

let program = gl.createProgram();
if (program === null) {
  throw new Error("program is null");
}
gl.attachShader(program, vert);
gl.attachShader(program, frag);
gl.linkProgram(program);

// gl.useProgram(program);
// gl.drawArrays(gl.TRIANGLE_STRIP, 0, 3);
// gl.drawArrays(gl.POINTS, 0, 3);

gl.clearColor(1.0, 1.0, 1.0, 1.0);
gl.useProgram(program);

// gl.bindFramebuffer(null);

// framebuffer vs renderbuffer

const uniformOneIndex = 0;
// gl.uniformBlockBinding(
//   program,
//   gl.getUniformBlockIndex(program, "One"),
//   uniformOneIndex
// );

const uniformOneData = new Float32Array([
  1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 1, 1, 0, 0, 0, 1, 1, 0, 1, 0, 1, 0,
]);
const uniformOneDataLength = uniformOneData.length / 4;
// const uniformOneBuffer = gl.createBuffer();
// if (uniformOneBuffer === null) {
//   throw new Error("uniformOneBuffer is null");
// }
// gl.bindBuffer(gl.UNIFORM_BUFFER, uniformOneBuffer);
// gl.bufferData(gl.UNIFORM_BUFFER, uniformOneData, gl.STATIC_DRAW);

// gl.bindBufferBase(gl.UNIFORM_BUFFER, uniformOneIndex, uniformOneBuffer);

// const uniformTextureLocation = util.nonnull(
//   gl.getUniformLocation(program, "in_colors3")
// );

const uniformTextureLocation = gl.getUniformLocation(program, "in_colors3");

var texture = gl.createTexture();
texture = util.nonnull(texture);

gl.activeTexture(gl.TEXTURE0);
gl.bindTexture(gl.TEXTURE_2D, texture);

{
  const target = gl.TEXTURE_2D;
  const level = 0;
  const internalFormat = gl.RGBA32F;
  const width = uniformOneDataLength;
  const height = 1;
  const border = 0;
  const format = gl.RGBA;
  const type = gl.FLOAT;
  const pixels = uniformOneData;
  gl.texImage2D(
    target,
    level,
    internalFormat,
    width,
    height,
    border,
    format,
    type,
    pixels
  );
}

gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_R, gl.CLAMP_TO_EDGE);

gl.uniform1i(uniformTextureLocation, 0);

while (true) {
  let x = await util.frame();
  //   if (Math.random() < 0.01) {
  //     console.log(x);
  //   }

  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 3);
}
