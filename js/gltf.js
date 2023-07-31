import { VertexAttributeLayout } from "./webgl.js";
import * as util from "./util.js";
const GLTF_DEFAULT = {
    asset: { version: "2.0" },
    buffers: [],
    meshes: [],
    accessors: [],
    bufferViews: [],
};
var AccessorTypeEnum;
(function (AccessorTypeEnum) {
    AccessorTypeEnum[AccessorTypeEnum["SCALAR"] = 0] = "SCALAR";
    AccessorTypeEnum[AccessorTypeEnum["VEC2"] = 1] = "VEC2";
    AccessorTypeEnum[AccessorTypeEnum["VEC3"] = 2] = "VEC3";
    AccessorTypeEnum[AccessorTypeEnum["VEC4"] = 3] = "VEC4";
    AccessorTypeEnum[AccessorTypeEnum["MAT2"] = 4] = "MAT2";
    AccessorTypeEnum[AccessorTypeEnum["MAT3"] = 5] = "MAT3";
    AccessorTypeEnum[AccessorTypeEnum["MAT4"] = 6] = "MAT4";
})(AccessorTypeEnum || (AccessorTypeEnum = {}));
function accessorTypeToNumComponents(t) {
    const LUT = {
        [AccessorTypeEnum.SCALAR]: 1,
        [AccessorTypeEnum.VEC2]: 2,
        [AccessorTypeEnum.VEC3]: 3,
        [AccessorTypeEnum.VEC4]: 4,
        [AccessorTypeEnum.MAT2]: 4,
        [AccessorTypeEnum.MAT3]: 9,
        [AccessorTypeEnum.MAT4]: 16,
    };
    return LUT[AccessorTypeEnum[t]];
}
function componentTypeToByteSize(t) {
    const LUT = {
        5120: 1,
        5121: 1,
        5122: 2,
        5123: 2,
        5124: 4,
        5125: 4,
        5126: 4, // FLOAT
    };
    return LUT[t];
}
async function downloadBuffer(buffer) {
    let uri = util.nonnull(buffer.uri);
    let data = await util.download("models/", uri, (r) => r.arrayBuffer());
    if (data.byteLength != buffer.byteLength) {
        throw { msg: "Size doesn't match", data, buffer };
    }
    return data;
}
function loadBufferView(gl, bufferView, scene) {
    if (bufferView.byteStride !== undefined) {
        throw "byteStride unsupported";
    }
    let array = util.nonnull(scene.buffers[bufferView.buffer]);
    let offset = bufferView.byteOffset || 0;
    let target = util.nonnull(bufferView.target); // TODO: lift restriction?
    // TODO: is it ok to use Uint8 regardless of AccessorType?
    let arrayView = new Uint8Array(array, offset, bufferView.byteLength);
    let glBuffer = util.nonnull(gl.createBuffer());
    gl.bindBuffer(target, glBuffer);
    gl.bufferData(target, arrayView, gl.STATIC_DRAW);
    gl.bindBuffer(target, null);
    return { arrayView, glBuffer, target };
}
function loadPrimitive(gl, gltf, primitive, scene) {
    let program = util.nonnull(gl.getParameter(gl.CURRENT_PROGRAM)); // must set program prior
    let vao = util.nonnull(gl.createVertexArray());
    gl.bindVertexArray(vao);
    let renderMode = { skipRender: true };
    let renderShared = {
        drawMode: primitive.mode ?? gl.TRIANGLES,
        vao,
    };
    attributesBlock: {
        positionBlock: {
            const vertexPosition = VertexAttributeLayout.Position;
            let accessorIndex = primitive.attributes["POSITION"];
            if (accessorIndex === undefined) {
                renderMode = { skipRender: true };
                break attributesBlock;
            }
            let accessor = util.nonnull(gltf.accessors[accessorIndex]);
            console.assert(accessor.type === "VEC3");
            console.assert(accessor.componentType === gl.FLOAT);
            // accessor.normalized known false
            let bufferViewIndex = accessor.bufferView;
            if (bufferViewIndex === undefined) {
                gl.disableVertexAttribArray(vertexPosition);
                gl.vertexAttrib3f(vertexPosition, 0, 0, 0);
                break positionBlock;
            }
            let gltfBufferView = util.nonnull(gltf.bufferViews[bufferViewIndex]);
            let bufferView = util.nonnull(scene.bufferViews[bufferViewIndex]);
            console.assert(bufferView.target === gl.ARRAY_BUFFER);
            gl.bindBuffer(bufferView.target, bufferView.glBuffer);
            gl.enableVertexAttribArray(vertexPosition);
            gl.vertexAttribPointer(vertexPosition, accessorTypeToNumComponents(accessor.type), accessor.componentType, accessor.normalized ?? false, gltfBufferView.byteStride ?? 0, accessor.byteOffset ?? 0);
            gl.bindBuffer(bufferView.target, null);
            renderMode = {
                ...renderShared,
                drawArrayCount: accessor.count,
            };
        }
        normalBlock: {
            const vertexNormal = VertexAttributeLayout.Normal;
            let accessorIndex = primitive.attributes["NORMAL"];
            if (accessorIndex === undefined) {
                break normalBlock;
            }
            let accessor = util.nonnull(gltf.accessors[accessorIndex]);
            console.assert(accessor.type === "VEC3");
            console.assert(accessor.componentType === gl.FLOAT);
            // accessor.normalized known false
            let bufferViewIndex = accessor.bufferView;
            if (bufferViewIndex === undefined) {
                gl.disableVertexAttribArray(vertexNormal);
                gl.vertexAttrib3f(vertexNormal, 0, 0, 0);
                break normalBlock;
            }
            let gltfBufferView = util.nonnull(gltf.bufferViews[bufferViewIndex]);
            let bufferView = util.nonnull(scene.bufferViews[bufferViewIndex]);
            console.assert(bufferView.target === gl.ARRAY_BUFFER);
            gl.bindBuffer(bufferView.target, bufferView.glBuffer);
            gl.enableVertexAttribArray(vertexNormal);
            gl.vertexAttribPointer(vertexNormal, accessorTypeToNumComponents(accessor.type), accessor.componentType, accessor.normalized ?? false, gltfBufferView.byteStride ?? 0, accessor.byteOffset ?? 0);
            gl.bindBuffer(bufferView.target, null);
        }
        indicesBlock: {
            let accessorIndex = primitive.indices;
            if (accessorIndex === undefined) {
                break indicesBlock;
            }
            let accessor = util.nonnull(gltf.accessors[accessorIndex]);
            console.assert(accessor.type === "SCALAR");
            console.assert([gl.UNSIGNED_BYTE, gl.UNSIGNED_SHORT, gl.UNSIGNED_INT].includes(accessor.componentType));
            let bufferViewIndex = accessor.bufferView;
            if (bufferViewIndex === undefined) {
                throw "Meaningless";
            }
            let gltfBufferView = util.nonnull(gltf.bufferViews[bufferViewIndex]);
            let bufferView = util.nonnull(scene.bufferViews[bufferViewIndex]);
            console.assert(bufferView.target === gl.ELEMENT_ARRAY_BUFFER);
            console.assert(gltfBufferView.byteStride === undefined);
            gl.bindBuffer(bufferView.target, bufferView.glBuffer);
            let offset = 0;
            if (accessor.byteOffset !== undefined) {
                offset = accessor.byteOffset / componentTypeToByteSize(accessor.componentType);
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
        renderMode;
        gl.deleteVertexArray(vao);
    }
    return renderMode;
}
export function draw(gl, renderMode) {
    if ("skipRender" in renderMode) {
        renderMode;
        return;
    }
    gl.bindVertexArray(renderMode.vao);
    if ("drawArrayCount" in renderMode) {
        renderMode;
        gl.drawArrays(renderMode.drawMode, 0, renderMode.drawArrayCount);
    }
    else {
        renderMode;
        gl.drawElements(renderMode.drawMode, renderMode.drawElementsCount, renderMode.componentType, // overloads are broken
        renderMode.byteOffset);
    }
    gl.bindVertexArray(null);
}
async function downloadGltf(name) {
    let gltf = await util.download("models/", name, (r) => r.json());
    console.dir(gltf);
    if (gltf?.asset?.version === "2.0") {
        return { ...GLTF_DEFAULT, ...gltf };
    }
    throw { msg: "Unsupported gltf", asset: gltf.asset };
}
export async function loadGltf(gl, name) {
    let gltf = await downloadGltf(name);
    let scene = {};
    scene.buffers = await Promise.all(gltf.buffers.map(downloadBuffer));
    scene.bufferViews = gltf.bufferViews.map((v) => loadBufferView(gl, v, scene));
    scene.meshes = gltf.meshes.map((mesh) => ({
        primitives: mesh.primitives.map((v) => loadPrimitive(gl, gltf, v, scene)),
    }));
    return [gltf, scene];
}
//# sourceMappingURL=gltf.js.map