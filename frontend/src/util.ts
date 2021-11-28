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
