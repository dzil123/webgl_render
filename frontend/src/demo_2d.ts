import * as util from "./util.js";
import * as canvas from "./canvas.js";

const canvasReal = canvas.getCanvasById("canvas");
canvas.resize(canvasReal);

export const ctx = util.nonnull(
  canvas.createOffscreenSameSize(canvasReal).getContext("2d", { alpha: false }),
);

ctx.filter = "url(#alphaThresholdFilter)";
ctx.fillStyle = "white";
ctx.font = `200 ${ctx.canvas.width * 0.5}px serif`;
ctx.textAlign = "center";
ctx.textBaseline = "middle";
ctx.fillText(
  "_ -- _",
  toHalf(ctx.canvas.width / 2),
  toHalf(ctx.canvas.height * 0.7),
);
// �￼

void (async () => {
  return;
  const blob = await ctx.canvas.convertToBlob();
  const url = URL.createObjectURL(blob);
  document.addEventListener("click", () => window.open(url, "_blank"), {
    once: true,
  });
})();

function toHalf(x: number) {
  return Math.round(x + 0.5) - 0.5;
}
