import * as util from "./util.js";

export function createOffscreen(
  width: number,
  height: number,
): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  return canvas;
}

export function createOffscreenSameSize(
  template: HTMLCanvasElement,
): HTMLCanvasElement {
  return createOffscreen(template.width, template.height);
}

/// true if resize occurred
export function resize(canvas: HTMLCanvasElement): boolean {
  const dpr = window.devicePixelRatio;
  // dpr = Math.min(dpr, 2);
  const rect = canvas.getBoundingClientRect();

  const width = Math.round(rect.width * dpr);
  const height = Math.round(rect.height * dpr);

  if (canvas.width != width || canvas.height != height) {
    canvas.width = width;
    canvas.height = height;

    const resolution_element = util.nonnull(document.getElementById("res"));
    resolution_element.innerText = `${dpr} ${width} ${height}`;
    return true;
  }
  return false;
}
