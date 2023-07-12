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

type Append<T, X extends T, L extends T[]> = L["length"] extends 0
  ? [X]
  : [Head<L> | X, ...Append<T, X, Tail<L>>];

type PowerSet<T, L extends T[]> = L["length"] extends 0
  ? []
  : PowerSet<T, Tail<L>> extends infer X
  ? X extends T[]
    ? [...X, ...Append<T, Head<L>, X>]
    : never
  : never;

type Reverse<L extends unknown[]> = L["length"] extends 0
  ? []
  : [...Reverse<Tail<L>>, Head<L>];

type Builder<T, L extends (keyof T)[]> = Reverse<L> extends (keyof T)[]
  ? BuilderImpl<T, Reverse<L>>
  : never;

type BuilderImpl<T, L extends (keyof T)[]> = L["length"] extends 0
  ? never
  : BuilderImpl<T, Tail<L>> | Pick<T, L[number]>;

{
  interface Scene {
    foo: {};
    bar: {};
    baz: {};
  }

  type ScenePowerSet = PowerSet<keyof Scene, ["foo", "bar", "baz"]>;
  //    ^?

  type SceneBuilder = Builder<Scene, ["foo", "bar", "baz"]>; // order must match use
  //    ^?

  function useScene(_: Scene) {}

  let scene: SceneBuilder = { foo: {} };
  scene = { ...scene, bar: {} };
  scene = { ...scene, baz: {} };
  useScene(scene);
}
