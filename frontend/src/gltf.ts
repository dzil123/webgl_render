import { GL, GL2, VertexAttributeLayout } from "./webgl.js";
import * as util from "./util.js";
import { mat4, vec3, vec4, glMatrix } from "../third-party/gl-matrix/index.js";

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

function componentTypeToByteSize(
  t: GL.ArrayType | GL.GLenum<"INT"> | GL.GLenum<"UNSIGNED_INT">,
): number {
  const LUT = {
    5120: 1, // BYTE
    5121: 1, // UNSIGNED_BYTE
    5122: 2, // SHORT
    5123: 2, // UNSIGNED_SHORT
    5124: 4, // INT
    5125: 4, // UNSIGNED_INT
    5126: 4, // FLOAT
  } as any;

  return LUT[t];
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
  NORMAL: { componentType: GL.GLenum<"FLOAT">; type: "VEC3" };
};

type Indices = Brand<"Indices">;
type IndicesComponentType =
  | GL.GLenum<"UNSIGNED_BYTE">
  | GL.GLenum<"UNSIGNED_SHORT">
  | GL.GLenum<"UNSIGNED_INT">;

type SpecialAccessor = {
  [K in keyof SpecialTypes as Brand<K>]: SpecialTypes[K];
} & {
  [x: Indices]: {
    componentType: IndicesComponentType;
    type: "SCALAR";
  };
};

type SpecialAttribute = { [K in keyof SpecialTypes]?: Brand<K> };

interface Scene {
  buffers: ArrayBuffer[];
  bufferViews: {
    arrayView: BufferSource;
    glBuffer: WebGLBuffer;
    target: GL.BufferTarget;
  }[];
  meshes: {
    primitives: RenderMode[];
  }[];
}

async function downloadBuffer(buffer: Buffer): Promise<ArrayBuffer> {
  const uri = util.nonnull(buffer.uri);
  const data = await util.download("models/", uri, (r) => r.arrayBuffer());
  if (data.byteLength != buffer.byteLength) {
    throw { msg: "Size doesn't match", data, buffer };
  }
  return data;
}

function loadBufferView(
  gl: GL2,
  bufferView: BufferView,
  scene: Pick<Scene, "buffers">,
): Scene["bufferViews"][0] {
  if (bufferView.byteStride !== undefined) {
    throw "byteStride unsupported";
  }

  const array = util.nonnull(scene.buffers[bufferView.buffer]);
  const offset = bufferView.byteOffset || 0;
  const target = util.nonnull(bufferView.target); // TODO: lift restriction?

  // TODO: is it ok to use Uint8 regardless of AccessorType?
  const arrayView = new Uint8Array(array, offset, bufferView.byteLength);

  const glBuffer = util.nonnull(gl.createBuffer());
  gl.bindBuffer(target, glBuffer);
  gl.bufferData(target, arrayView, gl.STATIC_DRAW);
  gl.bindBuffer(target, null);

  return { arrayView, glBuffer, target };
}

interface RenderSkip {
  skipRender: true;
}

interface RenderCommon {
  drawMode: GL.DrawMode;
  vao: WebGLVertexArrayObject;
}

interface RenderArray extends RenderCommon {
  drawArrayCount: number;
}

interface RenderElements extends RenderCommon {
  drawElementsCount: number;
  byteOffset: number;
  componentType: IndicesComponentType;
}

type RenderMode = RenderSkip | RenderArray | RenderElements;

function loadPrimitive(
  gl: GL2,
  gltf: Gltf,
  primitive: Primitive,
  scene: Pick<Scene, "buffers" | "bufferViews">,
): RenderMode {
  const program = util.nonnull(gl.getParameter(gl.CURRENT_PROGRAM)); // must set program prior

  const vao = util.nonnull(gl.createVertexArray());
  gl.bindVertexArray(vao);

  let renderMode: RenderMode = { skipRender: true };
  const renderShared: RenderCommon = {
    drawMode: primitive.mode ?? gl.TRIANGLES,
    vao,
  };

  attributesBlock: {
    positionBlock: {
      const vertexPosition = VertexAttributeLayout.Position;

      const accessorIndex = primitive.attributes["POSITION"];
      if (accessorIndex === undefined) {
        renderMode = { skipRender: true };
        break attributesBlock;
      }

      const accessor = util.nonnull(gltf.accessors[accessorIndex]);
      console.assert(accessor.type === "VEC3");
      console.assert(accessor.componentType === gl.FLOAT);
      // accessor.normalized known false

      const bufferViewIndex = accessor.bufferView;
      if (bufferViewIndex === undefined) {
        gl.disableVertexAttribArray(vertexPosition);
        gl.vertexAttrib3f(vertexPosition, 0, 0, 0);
        break positionBlock;
      }
      const gltfBufferView = util.nonnull(gltf.bufferViews[bufferViewIndex]);
      const bufferView = util.nonnull(scene.bufferViews[bufferViewIndex]);
      console.assert(bufferView.target === gl.ARRAY_BUFFER);

      gl.bindBuffer(bufferView.target, bufferView.glBuffer);
      gl.enableVertexAttribArray(vertexPosition);
      gl.vertexAttribPointer(
        vertexPosition,
        accessorTypeToNumComponents(accessor.type) as any,
        accessor.componentType,
        accessor.normalized ?? false,
        gltfBufferView.byteStride ?? 0,
        accessor.byteOffset ?? 0,
      );
      gl.bindBuffer(bufferView.target, null);

      renderMode = {
        ...renderShared,
        drawArrayCount: accessor.count,
      };
    }

    normalBlock: {
      const vertexNormal = VertexAttributeLayout.Normal;

      const accessorIndex = primitive.attributes["NORMAL"];
      if (accessorIndex === undefined) {
        break normalBlock;
      }

      const accessor = util.nonnull(gltf.accessors[accessorIndex]);
      console.assert(accessor.type === "VEC3");
      console.assert(accessor.componentType === gl.FLOAT);
      // accessor.normalized known false

      const bufferViewIndex = accessor.bufferView;
      if (bufferViewIndex === undefined) {
        gl.disableVertexAttribArray(vertexNormal);
        gl.vertexAttrib3f(vertexNormal, 0, 0, 0);
        break normalBlock;
      }

      const gltfBufferView = util.nonnull(gltf.bufferViews[bufferViewIndex]);
      const bufferView = util.nonnull(scene.bufferViews[bufferViewIndex]);
      console.assert(bufferView.target === gl.ARRAY_BUFFER);

      gl.bindBuffer(bufferView.target, bufferView.glBuffer);
      gl.enableVertexAttribArray(vertexNormal);
      gl.vertexAttribPointer(
        vertexNormal,
        accessorTypeToNumComponents(accessor.type) as any,
        accessor.componentType,
        accessor.normalized ?? false,
        gltfBufferView.byteStride ?? 0,
        accessor.byteOffset ?? 0,
      );
      gl.bindBuffer(bufferView.target, null);
    }

    indicesBlock: {
      const accessorIndex = primitive.indices;
      if (accessorIndex === undefined) {
        break indicesBlock;
      }

      const accessor = util.nonnull(gltf.accessors[accessorIndex]);
      console.assert(accessor.type === "SCALAR");
      console.assert(
        [gl.UNSIGNED_BYTE, gl.UNSIGNED_SHORT, gl.UNSIGNED_INT].includes(
          accessor.componentType,
        ),
      );

      const bufferViewIndex = accessor.bufferView;
      if (bufferViewIndex === undefined) {
        throw "Meaningless";
      }
      const gltfBufferView = util.nonnull(gltf.bufferViews[bufferViewIndex]);
      const bufferView = util.nonnull(scene.bufferViews[bufferViewIndex]);
      console.assert(bufferView.target === gl.ELEMENT_ARRAY_BUFFER);
      console.assert(gltfBufferView.byteStride === undefined);

      gl.bindBuffer(bufferView.target, bufferView.glBuffer);

      let offset = 0;
      if (accessor.byteOffset !== undefined) {
        offset =
          accessor.byteOffset / componentTypeToByteSize(accessor.componentType);
        console.assert(Number.isInteger(offset));
      }

      renderMode = {
        ...renderShared,
        drawElementsCount: accessor.count,
        byteOffset: offset,
        componentType: accessor.componentType,
      };
    }
  }

  gl.bindVertexArray(null);

  if ("skipRender" in renderMode) {
    renderMode satisfies RenderSkip;
    gl.deleteVertexArray(vao);
  }

  return renderMode;
}

export function draw(gl: GL2, renderMode: RenderMode) {
  if ("skipRender" in renderMode) {
    renderMode satisfies RenderSkip;
    return;
  }

  gl.bindVertexArray(renderMode.vao);

  if ("drawArrayCount" in renderMode) {
    renderMode satisfies RenderArray;
    gl.drawArrays(renderMode.drawMode, 0, renderMode.drawArrayCount);
  } else {
    renderMode satisfies RenderElements;
    gl.drawElements(
      renderMode.drawMode,
      renderMode.drawElementsCount,
      renderMode.componentType as any, // overloads are broken
      renderMode.byteOffset,
    );
  }

  gl.bindVertexArray(null);
}

async function downloadGltf(name: string): Promise<Gltf> {
  const gltf: Partial<Gltf> = await util.download("models/", name, (r) =>
    r.json(),
  );
  console.dir(gltf);

  if (gltf?.asset?.version === "2.0") {
    return { ...GLTF_DEFAULT, ...gltf };
  }

  throw { msg: "Unsupported gltf", asset: gltf.asset };
}

export async function loadGltf(gl: GL2, name: string): Promise<[Gltf, Scene]> {
  const gltf = await downloadGltf(name);

  const scene: Partial<Scene> = {};

  scene.buffers = await Promise.all(gltf.buffers.map(downloadBuffer));

  scene.bufferViews = gltf.bufferViews.map((v) =>
    loadBufferView(gl, v, scene as any),
  );

  scene.meshes = gltf.meshes.map((mesh) => ({
    primitives: mesh.primitives.map((v) =>
      loadPrimitive(gl, gltf, v, scene as any),
    ),
  }));

  return [gltf, scene as Scene];
}
