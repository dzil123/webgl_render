export function sleep(sec: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, sec * 1000));
}

export function frame(): Promise<DOMHighResTimeStamp> {
  return new Promise((resolve) => requestAnimationFrame(resolve));
}

export async function mainloop(callback: () => Promise<void>) {
  const fps_element = nonnull(document.getElementById("fps"));
  const fps_avg_element = nonnull(document.getElementById("fps_avg"));
  const frame_element = nonnull(document.getElementById("frame"));
  let then = 0;
  let then_then = 0;
  let counter = 0;
  const avg_len = 60;

  while (true) {
    let now, delta;
    while (true) {
      now = (await frame()) / 1000;
      delta = now - then;
      if (delta + 0.001 > 0.1) {
        break;
      }
    }

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

    await callback();
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
