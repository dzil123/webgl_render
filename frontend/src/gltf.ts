import * as webgl from "./webgl.js";
import * as util from "./util.js";

interface Gltf {
  readonly asset: { version: "2.0" };
  buffers: Buffer[];
  meshes: Mesh[];
  accessors: Accessor[];
  bufferViews: BufferView[];
}

const GLTF_DEFAULT: Gltf = {
  asset: { version: "2.0" },
  buffers: [],
  meshes: [],
  accessors: [],
  bufferViews: [],
};

const enum AccessorTypeEnum {
  SCALAR,
  VEC2,
  VEC3,
  MAT2,
  MAT3,
  MAT4,
}
type AccessorType = keyof typeof AccessorTypeEnum;

interface Accessor {
  bufferView?: number; // -> bufferViews
  byteOffset?: number;
  componentType: webgl.GL.ArrayType | webgl.GL.GLenum<"UNSIGNED_INT">;
  count: number;
  type: AccessorType;
}

// @ts-ignore
// let x: Accessor = null;

// if (x.type == AccessorType["MAT2"]) {
// }

interface BufferView {
  buffer: number; // -> buffers
  byteOffset?: number;
  byteLength: number;
  byteStride?: number;
  target?: webgl.GL.BufferTarget;
}

interface Buffer {
  uri?: string;
  byteLength: number;
}

interface Mesh {
  primitives: Primitive[];
}

interface Primitive {
  attributes: { [key: string]: number }; // -> accessors
  indices?: number; // -> accessors
  mode?: webgl.GL.DrawMode;
}

interface Scene {
  buffers: ArrayBuffer[];
  bufferViews: SceneBufferViews[];
}

interface SceneBufferViews {
  arrayView: BufferSource;
  glBuffer: WebGLBuffer;
  target: webgl.GL.BufferTarget;
}

async function downloadBuffer(buffer: Buffer): Promise<ArrayBuffer> {
  let uri = util.nonnull(buffer.uri);
  let data = await util.download("models/", uri, (r) => r.arrayBuffer());
  if (data.byteLength != buffer.byteLength) {
    throw { msg: "Size doesn't match", data, buffer };
  }
  return data;
}

function loadBufferView(
  gl: webgl.GL2,
  bufferView: BufferView,
  buffers: ArrayBuffer[]
): SceneBufferViews {
  if (bufferView.byteStride !== undefined) {
    throw "byteStride unsupported";
  }

  let array = util.nonnull(buffers[bufferView.buffer]);
  let offset = bufferView.byteOffset || 0;
  let target = util.nonnull(bufferView.target);

  // TODO: is it ok to use Uint8 regardless of AccessorType?
  let arrayView = new Uint8Array(array, offset, bufferView.byteLength);

  let glBuffer = util.nonnull(gl.createBuffer());
  gl.bindBuffer(target, glBuffer);
  gl.bufferData(target, arrayView, gl.STATIC_DRAW);

  return { arrayView, glBuffer, target };
}

async function downloadGltf(name: string): Promise<Gltf> {
  let gltf: Partial<Gltf> = await util.download("models/", name, (r) => r.json());
  console.dir(gltf);

  if (gltf?.asset?.version === "2.0") {
    return Object.assign(GLTF_DEFAULT, gltf);
  }

  throw { msg: "Unsupported gltf", asset: gltf.asset };
}

export async function loadGltf(gl: webgl.GL2, name: string): Promise<[Gltf, Scene]> {
  let gltf = await downloadGltf(name);

  let buffers = await Promise.all(gltf.buffers.map(downloadBuffer));
  let bufferViews = gltf.bufferViews.map((v) => loadBufferView(gl, v, buffers));

  let scene = { buffers, bufferViews };

  return [gltf, scene];
}