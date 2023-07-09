export function sleep(sec: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, sec * 1000));
}

export function frame(): Promise<DOMHighResTimeStamp> {
  return new Promise((resolve) => requestAnimationFrame(resolve));
}

export function nonnull<T>(v: T): NonNullable<T> {
  if (v === undefined || v === null) {
    throw new Error("unexpected null");
  }
  return v;
}

export function new_globals<K, V>(): (key: K) => V[] {
  type Storage = [K, V[]];

  let storage: Storage[] = [];

  let get = (key: K) => {
    for (let item of storage) {
      if (item[0] === key) {
        return item[1];
      }
    }

    let item: Storage = [key, []];
    storage.push(item);
    return item[1];
  };

  return get;
}

export async function download<T>(
  subdir: string,
  url: string,
  callback: (r: Response) => Promise<T>
): Promise<T> {
  if (!url.startsWith("data:")) {
    url = subdir + url;
  }
  let response = await fetch(url);
  if (!response.ok) {
    throw new Error(
      `Failed to download ${url}: ${response.status} ${response.statusText}`
    );
  }

  let data = await callback(response);

  return data;
}

type MaybePromise<T> = Promise<T> | T;

export type Builder<
  T,
  F extends (keyof T)[],
  K extends keyof T = never,
  R extends unknown[] = []
> = R["length"] extends F["length"]
  ? R
  : Builder<
      T,
      F,
      K | F[R["length"]],
      [...R, (obj: Pick<T, K>, extra: never) => MaybePromise<Pick<T, K | F[R["length"]]>>]
    >;
