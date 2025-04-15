import * as util from "./util.js";
import { mat4, vec3, vec4, glMatrix } from "../third-party/gl-matrix/index.js";

const rad = glMatrix.toRadian;

await util.sleep(0.1);

function log(m: mat4) {
  function k(x: number, y: number): string {
    const i = x + y * 4;
    // @ts-ignore
    return m[i].toFixed(4).toString();
  }
  console.log(
    "\n" +
      `[ ${k(0, 0)} ${k(1, 0)} ${k(2, 0)} ${k(3, 0)}` +
      "\n" +
      `  ${k(0, 1)} ${k(1, 1)} ${k(2, 1)} ${k(3, 1)}` +
      "\n" +
      `  ${k(0, 2)} ${k(1, 2)} ${k(2, 2)} ${k(3, 2)}` +
      "\n" +
      `  ${k(0, 3)} ${k(1, 3)} ${k(2, 3)} ${k(3, 3)} ]`,
  );
}

const m = mat4.create();
mat4.identity(m);
mat4.translate(m, m, vec3.fromValues(0, 1, 5));
mat4.rotateX(m, m, rad(-20));
m[15] = 2;

log(m);

// let v = vec3.create();
// vec3.transformMat4(v, vec3.create(), m);
// console.log(vec3.str(v));

// let v4 = [0, 0, 0, 1];
const v4 = vec4.fromValues(0, 0.4, -1, 0);
vec4.transformMat4(v4, v4, m);
console.log(vec4.str(v4));

// console.log(mat4.str(m).sl);

throw "";
