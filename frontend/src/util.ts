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

export type Builder<T, L extends (keyof T)[]> = Reverse<L> extends (keyof T)[]
  ? BuilderImpl<T, Reverse<L>>
  : never;
