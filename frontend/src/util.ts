export function sleep(sec: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, sec * 1000));
}

export function frame(): Promise<DOMHighResTimeStamp> {
  return new Promise((resolve) => requestAnimationFrame(resolve));
}

export function nonnull<T>(v: T | null): T {
  if (v === null) {
    throw new Error("unexpected null");
  }
  return v;
}
