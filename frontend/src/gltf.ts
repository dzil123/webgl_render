import { GL, GL2 } from "./webgl.js";
import * as util from "./util.js";

interface Gltf {
  readonly asset: { version: "2.0" };
  buffers: Buffer[];
  meshes: Mesh[];
  accessors: Accessor[] & SpecialAccessor;
  bufferViews: BufferView[];
}

const GLTF_DEFAULT: Gltf = {
  asset: { version: "2.0" },
  buffers: [],
  meshes: [],
  accessors: [],
  bufferViews: [],
};

enum AccessorTypeEnum {
  SCALAR,
  VEC2,
  VEC3,
  VEC4,
  MAT2,
  MAT3,
  MAT4,
}
type AccessorType = keyof typeof AccessorTypeEnum;

function accessorTypeToNumComponents(t: AccessorType) {
  const LUT = {
    [AccessorTypeEnum.SCALAR]: 1,
    [AccessorTypeEnum.VEC2]: 2,
    [AccessorTypeEnum.VEC3]: 3,
    [AccessorTypeEnum.VEC4]: 4,
    [AccessorTypeEnum.MAT2]: 4,
    [AccessorTypeEnum.MAT3]: 9,
    [AccessorTypeEnum.MAT4]: 16,
  } as const;

  return LUT[AccessorTypeEnum[t]];
}

interface Accessor {
  bufferView?: number; // -> bufferViews
  byteOffset?: number;
  componentType: GL.ArrayType | GL.GLenum<"UNSIGNED_INT">;
  count: number;
  type: AccessorType;
  normalized?: boolean;
}

interface BufferView {
  buffer: number; // -> buffers
  byteOffset?: number;
  byteLength: number;
  byteStride?: number;
  target?: GL.BufferTarget;
}

interface Buffer {
  uri?: string;
  byteLength: number;
}

interface Mesh {
  primitives: Primitive[];
}

interface Primitive {
  attributes: { [key: string]: number } & SpecialAttribute; // -> accessors
  indices?: Indices; // -> accessors
  mode?: GL.DrawMode;
}

type Brand<S extends string> = number & { __brand: S };

type SpecialTypes = {
  POSITION: { componentType: GL.GLenum<"FLOAT">; type: "VEC3" };
};

type Indices = Brand<"Indices">;

type SpecialAccessor = { [K in keyof SpecialTypes as Brand<K>]: SpecialTypes[K] } & {
  [x: Indices]: {
    componentType:
      | GL.GLenum<"UNSIGNED_BYTE">
      | GL.GLenum<"UNSIGNED_SHORT">
      | GL.GLenum<"UNSIGNED_INT">;
    type: "SCALAR";
  };
};

type SpecialAttribute = { [K in keyof SpecialTypes]: Brand<K> };

interface Scene {
  buffers: ArrayBuffer[];
  bufferViews: {
    arrayView: BufferSource;
    glBuffer: WebGLBuffer;
    target: GL.BufferTarget;
  }[];
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
  gl: GL2,
  bufferView: BufferView,
  scene: Pick<Scene, "buffers">
): Scene["bufferViews"][0] {
  if (bufferView.byteStride !== undefined) {
    throw "byteStride unsupported";
  }

  let array = util.nonnull(scene.buffers[bufferView.buffer]);
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
    return { ...GLTF_DEFAULT, ...gltf };
  }

  throw { msg: "Unsupported gltf", asset: gltf.asset };
}

export async function loadGltf(gl: GL2, name: string): Promise<[Gltf, Scene]> {
  let gltf = await downloadGltf(name);

  let scene: util.Builder<Scene, ["buffers", "bufferViews"]>;
  scene = { buffers: await Promise.all(gltf.buffers.map(downloadBuffer)) };
  scene = {
    ...scene,
    bufferViews: gltf.bufferViews.map((v) => loadBufferView(gl, v, scene)),
  };

  return [gltf, scene];
}
