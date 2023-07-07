import * as util from "./util.js";
import * as webgl from "./webgl.js";
import * as gltf from "./gltf.js";
// import "./demo.js";
let gl = webgl.loadGL();
let [gltfDoc, scene] = await gltf.loadGltf(gl, "polygon.gltf");
let vert = await webgl.loadShader(gl, "particle.vert");
let frag = await webgl.loadShader(gl, "particle.frag");
// let ext = util.nonnull(gl.getExtension("WEBGL_debug_shaders"));
// console.log(ext.getTranslatedShaderSource(vert));
// console.log(ext.getTranslatedShaderSource(frag));
let program = util.nonnull(gl.createProgram());
gl.attachShader(program, vert);
gl.attachShader(program, frag);
gl.linkProgram(program);
let aspect = gl.canvas.width / gl.canvas.height;
gl.clearColor(0.5, 0.5, 0.5, 1.0);
gl.useProgram(program);
/*
const num_verts = 5;
let [vertexData, indexData] = generate_polygon(num_verts);

let indexBuffer = util.nonnull(gl.createBuffer());
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indexData, gl.STATIC_DRAW);

let vertexBuffer = util.nonnull(gl.createBuffer());
gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
gl.bufferData(gl.ARRAY_BUFFER, vertexData, gl.STATIC_DRAW);
*/
{
    const vertexPosition = gl.getAttribLocation(program, "pos");
    const numComponents = 3; // pull out 2 values per iteration
    const type = gl.FLOAT; // the data in the buffer is 32bit floats
    const normalize = false; // don't normalize
    const stride = 0; // how many bytes to get from one set of values to the next
    // 0 = use type and numComponents above
    const offset = 0; // how many bytes inside the buffer to start from
    gl.vertexAttribPointer(vertexPosition, numComponents, type, normalize, stride, offset);
    gl.enableVertexAttribArray(vertexPosition);
}
// framebuffer vs renderbuffer
let fps_element = util.nonnull(document.getElementById("fps"));
let fps_avg_element = util.nonnull(document.getElementById("fps_avg"));
let then = 0;
let then_then = 0;
let counter = 0;
const avg_len = 60;
let primitive = util.nonnull(gltfDoc.meshes?.[0]?.primitives[0]);
let position_index = util.nonnull(primitive.attributes["POSITION"]);
let indices_index = util.nonnull(primitive.indices);
let position_accessor = util.nonnull(gltfDoc.accessors?.[position_index]);
let indices_accessor = util.nonnull(gltfDoc.accessors?.[indices_index]); // narrow indices interface - must be unsigned
console.assert(position_accessor.type == "VEC3");
console.assert(indices_accessor.type == "SCALAR");
let position_bufferview = scene.bufferViews[util.nonnull(position_accessor.bufferView)];
let indices_bufferview = scene.bufferViews[util.nonnull(indices_accessor.bufferView)];
while (true) {
    let now = (await util.frame()) / 1000;
    webgl.resize(gl);
    let delta = now - then;
    then = now;
    let fps = 1.0 / delta;
    let fps_str = fps.toFixed(2);
    fps_element.innerText = fps_str;
    counter += 1;
    if (counter >= avg_len) {
        counter = 0;
        let delta = now - then_then;
        then_then = now;
        let fps = avg_len / delta;
        let fps_str = fps.toFixed(2);
        fps_avg_element.innerText = fps_str;
    }
    let fov = 70.0;
    let aspect = gl.canvas.width / gl.canvas.height;
    gl.clear(gl.COLOR_BUFFER_BIT);
    // gl.drawElements(gl.TRIANGLES, indexData.length, gl.UNSIGNED_BYTE, 0);
    gl.drawElements(gl.TRIANGLES, indices_accessor.count, indices_accessor.componentType, // since this is an indices_accessor, it must be unsigned integer
    0);
}
function generate_polygon(count) {
    let delta_angle = (Math.PI * 2) / count;
    let start_angle = delta_angle * -0.5;
    let scale = 1.0 / Math.cos(start_angle);
    let array = new Float32Array(count * 2);
    for (let i = 0; i < count; i++) {
        let angle = start_angle + delta_angle * i;
        console.log((angle * 180) / Math.PI);
        array[i * 2] = Math.sin(angle) * scale;
        array[i * 2 + 1] = -Math.cos(angle) * scale;
    }
    console.log(array);
    let indexArray = new Uint8Array((count - 2) * 3);
    for (let i = 0; i < count; i++) {
        indexArray[i * 3] = 0;
        indexArray[i * 3 + 1] = i + 1;
        indexArray[i * 3 + 2] = i + 2;
    }
    console.log(indexArray);
    return [array, indexArray];
}
//# sourceMappingURL=main.js.map