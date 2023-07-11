export let foo = 1;

interface Scene {
  foo: {};
  bar: {};
  baz: {};
}

// oh boy don't do this
type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (
  k: infer I
) => void
  ? I
  : never;
type LastOf<T> = UnionToIntersection<
  T extends any ? () => T : never
> extends () => infer R
  ? R
  : never;

// TS4.0+
type Push<T extends any[], V> = [...T, V];

// TS4.1+
type TuplifyUnion<
  T,
  L = LastOf<T>,
  N = [T] extends [never] ? true : false
> = true extends N ? [] : Push<TuplifyUnion<Exclude<T, L>>, L>;

// type Partial<T> = never;

type Head<T> = T extends [infer First, ...infer Rest] ? First : never;
type Tail<T> = T extends [infer First, ...infer Rest] ? Rest : never;

// type Foo__ = Tail<TuplifyUnion<keyof Scene>>;

type PartialScene =
  | Partial<Scene>
  | (Partial<Scene> & Pick<Scene, "foo">)
  | (Partial<Scene> & Pick<Scene, "foo" | "bar">)
  | (Partial<Scene> & Pick<Scene, "foo" | "bar" | "baz">);

type PartialScene2 =
  | Pick<Scene, "foo">
  | Pick<Scene, "foo" | "bar">
  | Pick<Scene, "foo" | "bar" | "baz">;

type PowerSet<T, F extends (keyof T)[]> = F["length"] extends 0 ? number : boolean;
// type X = Expand<PowerSet<keyof "">>;
// type X1 = ExpandRecursively<PowerSet<keyof "">>;

// type X = Expand<TuplifyUnion<keyof Scene>>;
// type X = Expand<LastOf<keyof {}>>;

// function powerset(x: number[], y: number[] = []): number[][] {
//   if (x.length == 0) {
//   } else {
//     let first = x[-1] as number;
//     let rest = x.pop();
//     let pt = powerset(rest);

//   }

// type AppendToAll<T,

//   throw "";
// }

// type XX<T> = LastOf<T> extends never ? [] : [1, ...XX<Exclude<T, LastOf<T>>>];
type XX<T, U> = LastOf<U> extends never
  ? never
  : XX<T, Exclude<U, LastOf<U>>> | Foo<T, LastOf<U>>;

// [ Foo<T, X> for X in List ]
type ApplyFoo<T, List> = LastOf<List> extends never
  ? never
  : ApplyFoo<T, PopLast<List>> | Foo<T, LastOf<List>>;

type Foo<T, U> = [T | U];

type NotEmpty<List, T> = LastOf<List> extends never ? never : T; // for reference, cant actually use
type PopLast<List> = Exclude<List, LastOf<List>>;

// type ApplyFoo<Param, List> = NotEmpty<
//   List,
//   ApplyFoo<Param, Exclude<List, LastOf<List>>> | Foo<Param, LastOf<List>>
// >;

// type _A<T> = _B<T, {}, keyof T>;
// type _B<T, R, L extends keyof T> = LastOf<L> extends never
//   ? R
//   : _B<T, R, PopLast<L>> | _C<T, LastOf<L>, _B<T, R, PopLast<L>>>;
// type _C<T, X extends keyof T, R> = LastOf<R> extends never
//   ? never
//   : _C<T, X, PopLast<R>> | PopLast<R> | Pick<T, X>;

// type K = TuplifyUnion<keyof Scene>;
type K_ = ExpandRecursively<(keyof Scene)[]>;

type _A<T> = _B<T, {}, TuplifyUnion<keyof T>>;

type _B<T, R, L> = Head<L> extends never
  ? R
  : _B<T, R, Tail<L>> | _C<T, Head<L>, _B<T, R, Tail<L>>>;

type _C<T, X extends keyof T, R> = Head<R> extends never
  ? never
  : _C<T, X, Tail<R>> | (Tail<R> & Pick<T, X>);

type K = Expand<ApplyFoo<"a", 0 | 1 | 2>>;
type K1 = Expand<Pick<Scene, "foo"> | Pick<Scene, "bar">>;

type K2 = _A<Scene>;

// type foo = ExpandRecursively<PowerSet<Scene>>;

import { Builder } from "./util.js";

type B = Builder<Scene, ["foo", "bar"]>;

type bar1 = ExpandRecursively<B>;
type bar2 = Expand<B>;

type Expand<T> = T extends infer O ? { [K in keyof O]: O[K] } : never;

type ExpandRecursively<T> = T extends object
  ? T extends infer O
    ? { [K in keyof O]: ExpandRecursively<O[K]> }
    : never
  : T;

type ExpandPartialScene = Expand<PartialScene2>;
type ExpandRecursivelyPartialScene = ExpandRecursively<PartialScene2>;

/*
  List
  for item in List:
    item = Pick<T, item>

*/

function run() {
  let scene: ExpandRecursivelyPartialScene = { foo: {} };
  // scene.foo = {};
  scene = { ...scene, bar: {} };
  scene = { ...scene, baz: {} };
  let scene2: Scene = scene;
}
