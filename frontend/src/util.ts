export function sleep(sec: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, sec * 1000));
}

export function frame(): Promise<DOMHighResTimeStamp> {
  return new Promise((resolve) => requestAnimationFrame(resolve));
}

export async function mainloop(callback: () => void) {
  const fps_element = nonnull(document.getElementById("fps"));
  const fps_avg_element = nonnull(document.getElementById("fps_avg"));
  let then = 0;
  let then_then = 0;
  let counter = 0;
  const avg_len = 60;

  while (true) {
    await sleep(0.03);
    const now = (await frame()) / 1000;

    const delta = now - then;
    then = now;
    const fps = 1.0 / delta;
    const fps_str = fps.toFixed(2);
    fps_element.innerText = fps_str;

    counter += 1;
    if (counter >= avg_len) {
      counter = 0;
      const delta = now - then_then;
      then_then = now;
      const fps = avg_len / delta;
      const fps_str = fps.toFixed(2);
      fps_avg_element.innerText = fps_str;
    }

    callback();
  }
}

export function nonnull<T>(v: T): NonNullable<T> {
  if (v === undefined || v === null) {
    throw new Error("unexpected null");
  }
  return v;
}

export function new_globals<K, V>(): (key: K) => V[] {
  type Storage = [K, V[]];

  const storage: Storage[] = [];

  const get = (key: K) => {
    for (const item of storage) {
      if (item[0] === key) {
        return item[1];
      }
    }

    const item: Storage = [key, []];
    storage.push(item);
    return item[1];
  };

  return get;
}

export async function download<T>(
  subdir: string,
  url: string,
  callback: (r: Response) => Promise<T>,
): Promise<T> {
  if (!url.startsWith("data:")) {
    url = subdir + url;
  }
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(
      `Failed to download ${url}: ${response.status} ${response.statusText}`,
    );
  }

  const data = await callback(response);

  return data;
}

type Head<T extends unknown[]> = ((...args: T) => never) extends (
  _: infer R,
  ...args: any
) => never
  ? R
  : never;

type Tail<T extends unknown[]> = ((...args: T) => never) extends (
  _: any,
  ...args: infer R
) => never
  ? R
  : never;

type Reverse<L extends unknown[]> = L["length"] extends 0
  ? []
  : [...Reverse<Tail<L>>, Head<L>];

type BuilderImpl<T, L extends (keyof T)[]> = L["length"] extends 0
  ? never
  : BuilderImpl<T, Tail<L>> | Pick<T, L[number]>;

export type Builder<T, L extends (keyof T)[]> =
  Reverse<L> extends (keyof T)[] ? BuilderImpl<T, Reverse<L>> : never;
