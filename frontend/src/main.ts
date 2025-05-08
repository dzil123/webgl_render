import * as util from "./util.js";
import * as webgl from "./webgl.js";
// import "./demo.js";
import { ctx } from "./demo_2d.js";

const gl = webgl.loadGL("canvas");
gl.clearColor(0, 0, 0, 1);
gl.clear(gl.COLOR_BUFFER_BIT);

const programSim = await webgl.loadProgram(
  gl,
  ["fullscreen_tri.vert", "sandSim.frag"],
  ["bw", "buffer", "frame"],
);

const programRender = await webgl.loadProgram(
  gl,
  ["fullscreen_tri.vert", "sandRender.frag"],
  ["buffer", "gradient"],
);

const _aspect = gl.canvas.width / gl.canvas.height;

gl.useProgram(programSim.glProgram);

const texture_indexes = {
  bw: 1,
  buffer1: 2, // src
  buffer2: 3, // dest
  gradient: 4,
};

const textures = Object.fromEntries(
  Object.keys(texture_indexes).map((name) => {
    const tex = gl.createTexture();

    webgl.debugExt(gl, (ext) => ext.tagObject(tex, name));

    return [name, tex];
  }),
) as Record<keyof typeof texture_indexes, WebGLTexture | null>;

const bindTexture = (tex: keyof typeof texture_indexes) => {
  gl.activeTexture(webgl.textureIndex(texture_indexes[tex]));
  gl.bindTexture(gl.TEXTURE_2D, textures[tex]);
};

const initTexture = (tex: keyof typeof texture_indexes) => {
  bindTexture(tex);
  webgl.textureSetNearest(gl);
};

initTexture("bw");
gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
gl.texImage2D(gl.TEXTURE_2D, 0, gl.R8, gl.RED, gl.UNSIGNED_BYTE, ctx.canvas);
gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
gl.uniform1i(programSim.uniforms.bw, texture_indexes.bw);

(["buffer1", "buffer2"] as const).forEach((tex) => {
  initTexture(tex);
  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.RGB,
    gl.canvas.width,
    gl.canvas.height,
    0,
    gl.RGB,
    gl.UNSIGNED_BYTE,
    null,
  );
});
gl.uniform1i(programSim.uniforms.buffer, texture_indexes.buffer1);

gl.useProgram(programRender.glProgram);
gl.uniform1i(programRender.uniforms.buffer, texture_indexes.buffer2);

initTexture("gradient");
const gradientData = [
  0x0, 0x00, 0x0, 0x07, 0x07, 0x07, 0x1f, 0x07, 0x07, 0x2f, 0x0f, 0x07, 0x47,
  0x0f, 0x07, 0x57, 0x17, 0x07, 0x67, 0x1f, 0x07, 0x77, 0x1f, 0x07, 0x8f, 0x27,
  0x07, 0x9f, 0x2f, 0x07, 0xaf, 0x3f, 0x07, 0xbf, 0x47, 0x07, 0xc7, 0x47, 0x07,
  0xdf, 0x4f, 0x07, 0xdf, 0x57, 0x07, 0xdf, 0x57, 0x07, 0xd7, 0x5f, 0x07, 0xd7,
  0x5f, 0x07, 0xd7, 0x67, 0x0f, 0xcf, 0x6f, 0x0f, 0xcf, 0x77, 0x0f, 0xcf, 0x7f,
  0x0f, 0xcf, 0x87, 0x17, 0xc7, 0x87, 0x17, 0xc7, 0x8f, 0x17, 0xc7, 0x97, 0x1f,
  0xbf, 0x9f, 0x1f, 0xbf, 0x9f, 0x1f, 0xbf, 0xa7, 0x27, 0xbf, 0xa7, 0x27, 0xbf,
  0xaf, 0x2f, 0xb7, 0xaf, 0x2f, 0xb7, 0xb7, 0x2f, 0xb7, 0xb7, 0x37, 0xcf, 0xcf,
  0x6f, 0xdf, 0xdf, 0x9f, 0xef, 0xef, 0xc7, 0x80, 0x00, 0x00,
];
gl.texImage2D(
  gl.TEXTURE_2D,
  0,
  gl.RGB,
  gradientData.length / 3,
  1,
  0,
  gl.RGB,
  gl.UNSIGNED_BYTE,
  new Uint8Array(gradientData),
);
gl.uniform1i(programRender.uniforms.gradient, texture_indexes.gradient);

const debug = false;
if (debug) {
  bindTexture("buffer1");
  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.RGB,
    1,
    1,
    0,
    gl.RGB,
    gl.UNSIGNED_BYTE,
    new Uint8Array([255, 0, 0]),
  );

  bindTexture("buffer2");
  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.RGB,
    1,
    1,
    0,
    gl.RGB,
    gl.UNSIGNED_BYTE,
    new Uint8Array([0, 255, 0]),
  );
}

const fboSim = gl.createFramebuffer();

// for sim program
const swapAndBindBuffers = () => {
  [textures.buffer1, textures.buffer2] = [textures.buffer2, textures.buffer1];

  bindTexture("buffer1");
};

// TODO: two separate FBOs instead of modifying single FBO
const renderToBuffer = () => {
  gl.bindFramebuffer(gl.READ_FRAMEBUFFER, null);
  gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, fboSim);
  gl.framebufferTexture2D(
    gl.DRAW_FRAMEBUFFER,
    gl.COLOR_ATTACHMENT0,
    gl.TEXTURE_2D,
    textures.buffer2,
    0,
  );
};

gl.useProgram(programRender.glProgram);
gl.drawArrays(gl.TRIANGLE_STRIP, 0, 3);
// await util.sleep(5);
await util.frame();
if (false) {
  gl.clearColor(1, 1, 1, 1);
  swapAndBindBuffers();
  renderToBuffer();
  gl.clear(gl.COLOR_BUFFER_BIT);
  swapAndBindBuffers();
  renderToBuffer();
  gl.clear(gl.COLOR_BUFFER_BIT);
}

let frame = 0;
await util.mainloop(async () => {
  let ffwd = false;
  do {
    if (ffwd) {
      // await util.sleep(0);
    }

    frame += 1;
    document.getElementById("frame")!.textContent = "" + frame;

    gl.useProgram(programSim.glProgram);
    swapAndBindBuffers();
    // bindTexture("buffer1");
    gl.uniform1ui(programSim.uniforms.frame, frame);
    renderToBuffer();
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 3);
  } while (((ffwd = true), frame < 0));

  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  gl.useProgram(programRender.glProgram);
  bindTexture("buffer2");
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 3);
});

function _generate_polygon(count: number): [Float32Array, Uint8Array] {
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
