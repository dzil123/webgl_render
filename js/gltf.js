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
    let target = util.nonnull(bufferView.target);
    // TODO: is it ok to use Uint8 regardless of AccessorType?
    let arrayView = new Uint8Array(array, offset, bufferView.byteLength);
    let glBuffer = util.nonnull(gl.createBuffer());
    gl.bindBuffer(target, glBuffer);
    gl.bufferData(target, arrayView, gl.STATIC_DRAW);
    return { arrayView, glBuffer, target };
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
    const [buildBuffers, buildBufferViews] = [
        async () => ({ buffers: await Promise.all(gltf.buffers.map(downloadBuffer)) }),
        (scene) => ({
            ...scene,
            bufferViews: gltf.bufferViews.map((v) => loadBufferView(gl, v, scene)),
        }),
    ];
    let scene1 = await buildBuffers();
    let scene = buildBufferViews(scene1);
    return [gltf, scene];
}
//# sourceMappingURL=gltf.js.map