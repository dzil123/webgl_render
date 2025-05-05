import * as util from "./util.js";
import * as webgl from "./webgl.js";
// import "./demo.js";
import { ctx } from "./demo_2d.js";

const gl = webgl.loadGL("canvas");

const programSim = await webgl.loadProgram(
  gl,
  ["fullscreen_tri.vert", "sandSim.frag"],
  ["bw", "buffer"],
);

const programRender = await webgl.loadProgram(
  gl,
  ["fullscreen_tri.vert", "sandRender.frag"],
  ["buffer"],
);

const _aspect = gl.canvas.width / gl.canvas.height;

gl.clearColor(0.5, 0.5, 0.5, 1.0);
gl.useProgram(programSim.glProgram);

const texture_indexes = {
  bw: 1,
  buffer1: 2, // src
  buffer2: 3, // dest
};

const textures = Object.fromEntries(
  Object.keys(texture_indexes).map((name) => {
    const tex = gl.createTexture();

    /* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
    // @ts-ignore
    const ext = gl.getExtension("GMAN_debug_helper") as any;
    if (ext) {
      ext.tagObject(tex, name);
    }
    /* eslint-enable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */

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
gl.texImage2D(gl.TEXTURE_2D, 0, gl.R8, gl.RED, gl.UNSIGNED_BYTE, ctx.canvas);
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

gl.enable(gl.BLEND);
// premultiplied alpha
gl.blendEquationSeparate(gl.FUNC_ADD, gl.FUNC_ADD);
gl.blendFuncSeparate(
  gl.ONE,
  gl.ONE_MINUS_SRC_ALPHA,
  gl.ONE,
  gl.ONE_MINUS_SRC_ALPHA,
);

await util.mainloop(() => {
  console.log("frame");
  webgl.resize(gl);

  gl.useProgram(programSim.glProgram);
  swapAndBindBuffers();
  // bindTexture("buffer1");
  renderToBuffer();
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 3);

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
