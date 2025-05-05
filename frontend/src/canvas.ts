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

  // const width = Math.round(rect.width * dpr);
  // const height = Math.round(rect.height * dpr);

  const x = 50;
  const [width, height] = [x, x];

  if (canvas.width != width || canvas.height != height) {
    canvas.width = width;
    canvas.height = height;

    const resolution_element = util.nonnull(document.getElementById("res"));
    resolution_element.innerText = `${dpr} ${width} ${height}`;
    return true;
  }
  return false;
}

// monkey patch to follow OffscreenCanvas.convertToBlob
declare global {
  interface HTMLCanvasElement {
    convertToBlob: () => Promise<Blob>;
  }
}

HTMLCanvasElement.prototype.convertToBlob = async function convertToBlob() {
  return util.nonnull(
    await new Promise<Blob | null>((resolve) => this.toBlob(resolve)),
  );
};

export function getCanvasById(elementId: string): HTMLCanvasElement {
  const canvas = document.getElementById(elementId);
  if (!(canvas instanceof HTMLCanvasElement)) {
    throw new Error("Expected element to be a canvas");
  }
  resize(canvas);
  return canvas;
}
