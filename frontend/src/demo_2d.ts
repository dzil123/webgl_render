import * as util from "./util.js";
import * as canvas from "./canvas.js";

const canvasReal = canvas.getCanvasById("canvas");

export const ctx = util.nonnull(
  canvas.createOffscreenSameSize(canvasReal).getContext("2d", { alpha: false }),
);

const text = new URLSearchParams(location.search).get("t");

ctx.filter = "url(#alphaThresholdFilter)";
ctx.fillStyle = "white";
ctx.font = `200 ${ctx.canvas.width * 0.2}px serif`;
ctx.textAlign = "center";
ctx.textBaseline = "middle";
ctx.fillText(
  text ?? "horse plinko",
  toHalf(ctx.canvas.width / 2),
  toHalf(ctx.canvas.height * 0.8),
  ctx.canvas.width,
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
