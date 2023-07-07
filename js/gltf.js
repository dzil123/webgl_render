import * as util from "./util.js";
async function downloadBuffer(buffer) {
    let uri = util.nonnull(buffer.uri);
    let data = await util.download("models/", uri, (r) => r.arrayBuffer());
    if (data.byteLength != buffer.byteLength) {
        throw { msg: "Size doesn't match", data, buffer };
    }
    return data;
}
function loadBufferView(gl, bufferView, buffers) {
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
export async function loadGltf(gl, name) {
    let gltf = await util.download("models/", name, (r) => r.json());
    console.dir(gltf);
    if (gltf.asset.version !== "2.0") {
        throw { msg: "Unsupported gltf", asset: gltf.asset };
    }
    gltf.buffers = gltf.buffers || [];
    gltf.bufferViews = gltf.bufferViews || [];
    let buffers = await Promise.all(gltf.buffers.map(downloadBuffer));
    let bufferViews = gltf.bufferViews.map((v) => loadBufferView(gl, v, buffers));
    let scene = { buffers, bufferViews };
    return [gltf, scene];
}
//# sourceMappingURL=gltf.js.map