import * as util from "./util.js";
import * as canvas from "./canvas.js";
const canvasReal = canvas.getCanvasById("canvas");
canvas.resize(canvasReal);
export const ctx = util.nonnull(canvas.createOffscreenSameSize(canvasReal).getContext("2d", { alpha: false }));
ctx.fillStyle = "white";
ctx.font = `200 ${ctx.canvas.width * 0.5}px serif`;
ctx.textAlign = "center";
ctx.textBaseline = "middle";
ctx.fillText("H", ctx.canvas.width / 2, ctx.canvas.height / 2);
// �￼
// const url = ctx.canvas.toDataURL();
// document.addEventListener("click", () => window.open(url, "_blank"), {
//   once: true,
// });
//# sourceMappingURL=demo_2d.js.map