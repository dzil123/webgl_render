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

// type Foo__ = TuplifyUnion<keyof Scene>;

type PartialScene =
  | Partial<Scene>
  | (Partial<Scene> & Pick<Scene, "foo">)
  | (Partial<Scene> & Pick<Scene, "foo" | "bar">)
  | (Partial<Scene> & Pick<Scene, "foo" | "bar" | "baz">);
// | (Partial<Scene> & Pick<Scene, "foo" | "bar" | "baz" | "qux">);

type PartialScene2 =
  | Pick<Scene, "foo">
  | Pick<Scene, "foo" | "bar">
  | Pick<Scene, "foo" | "bar" | "baz">;

type PartialScene3 =
  | Pick<Scene, "foo">
  | Pick<Scene, "bar">
  | Pick<Scene, "baz">
  | Pick<Scene, "foo" | "bar">
  | Pick<Scene, "foo" | "baz">
  | Pick<Scene, "bar" | "baz">
  | Pick<Scene, "foo" | "bar" | "baz">;

// | Pick<Scene, "foo" | "bar" | "baz" | "qux">;

type PowerSet<T, F extends (keyof T)[]> = F["length"] extends 0
  ? number
  : boolean;
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

type List<T, L extends T[]> = L extends [infer First extends T, ...infer Rest]
  ? [First, Rest]
  : never;

// type Head<T, L extends (keyof T)[]> = List<T, L>[0];
// type Tail<T, L extends (keyof T)[]> = List<T, L>[1];

type LenMinus1<L extends unknown[]> = L extends [L[number], ...infer Rest]
  ? Rest["length"]
  : never;

type Tuple<TItem, TLength extends number> = [TItem, ...TItem[]] & {
  length: TLength;
};

type Sub1<N extends number> = LenMinus1<Tuple<never, N>>;

// type List<L extends unknown[]> = L extends [
//   infer First extends L[number],
//   ...(infer Rest & Tuple<L[number], LenMinus1<L>>)
// ]
//   ? // ? { first: First; rest: Rest }
//     [First, Rest]
//   : never;

// type Head<T, L extends T[]> = List<T, L>[0];
// type Tail<T, L extends T[]> = List<T, L>[1];

// type ListA<T, L extends (keyof T)[]> = List<keyof T, L>;
// type ListB<T, L extends Partial<T>[]> = List<Partial<T>, L>;

// type HeadA<T, L extends (keyof T)[]> = List<L>[0];
// type TailA<T, L extends (keyof T)[]> = List<L>[1];

// type HeadB<T, L extends Partial<T>[]> = List<L>[0];
// type TailB<T, L extends Partial<T>[]> = List<L>[1];

// type HeadA<T, L extends (keyof T)[]> = List<keyof T, L>[0];
// type TailA<T, L extends (keyof T)[]> = List<keyof T, L>[1];

// type HeadB<T, L extends Partial<T>[]> = List<Partial<T>, L>[0];
// type TailB<T, L extends Partial<T>[]> = List<Partial<T>, L>[1];

type HeadPrime<T extends unknown[]> = ((...args: T) => never) extends (
  _: infer R,
  ...args: any
) => never
  ? R
  : never;

type TailPrime<T extends unknown[]> = ((...args: T) => never) extends (
  _: any,
  ...args: infer R
) => never
  ? R
  : never;

type Head<T extends unknown[]> = T["length"] extends 0 ? never : HeadPrime<T>;
type Tail<T extends unknown[]> = T["length"] extends 0 ? never : TailPrime<T>;

type HeadA<T, L extends (keyof T)[]> = Head<L>;
type TailA<T, L extends (keyof T)[]> = Tail<L>;

type HeadB<T, L extends Partial<T>[]> = Head<L>;
type TailB<T, L extends Partial<T>[]> = Tail<L>;

type ListToUnion<T extends unknown[]> = T[number];

// type _A<T, K extends (keyof T)[]> = _B<T, {}, K>;

// type _B<T, R extends Partial<T>[], L extends (keyof T)[]> = HeadA<
//   T,
//   L
// > extends never
//   ? R
//   : _B<T, R, TailA<T, L>> | _C<T, HeadA<T, L>, _B<T, R, TailA<T, L>>>;
// // : [_B<T, R, TailA<T, L>>, ..._C<T, HeadA<T, L>, _B<T, R, TailA<T, L>>>];

// type _C<T, X extends keyof T, R extends Partial<T>[]> = HeadB<
//   T,
//   R
// > extends never
//   ? never
//   : // : _C<T, X, TailB<T, R>> | (ListToUnion<TailB<T, R>> & Pick<T, X>);
//     _C<T, X, TailB<T, R>> | _D<TailB<T, R>, Pick<T, X>>;

// type _D<T extends unknown[], X> = T["length"] extends 0
//   ? X
//   : ListToUnion<T> & X;

// : ListToUnion<TailB<T, R>> & Pick<T, X>;

// type _C<T, X extends keyof T, R extends (keyof T)[]> = R["length"] extends 0
//   ? [X]
//   : // : [_D<Tail<R>, X>, ..._C<T, X, Tail<R>>];
//     // [ListToUnion<Tail<R>> | X, ..._C<T, X, Tail<R>>];
//     [Head<R> | X, ..._C<T, X, Tail<R>>];

// type _A<T, K extends T[]> = _B<T, [], K>;

// type _B<T, R extends T[], L extends T[]> = L["length"] extends 0
//   ? R
//   : [..._B<T, R, Tail<L>>, ..._C<T, Head<L>, _B<T, R, Tail<L>>>];
// // // : _B<T, R, Tail<L>> | _C<T, Head<L>, _B<T, R, Tail<L>>>;

// type _B<T, L extends (keyof T)[], N extends number[]> = N["length"] extends 0
//   ? L
//   : L["length"] extends 0
//   ? []
//   : _B<T, Tail<L>, Tail<N>> extends infer _B2 | (keyof T)[]
//   ? [..._B2]
//   : [];

type ForEachPick<T, L extends (keyof T)[]> = L["length"] extends 0
  ? never
  : Pick<T, Head<L>> | ForEachPick<T, Tail<L>>;

type _A<T, L extends (keyof T)[]> = ForEachPick<T, _B<keyof T, L>>;

type _B<T, L extends T[]> = L["length"] extends 0
  ? []
  : _B<T, Tail<L>> extends infer _B2
  ? _B2 extends T[]
    ? [..._B2, ..._C<T, Head<L>, _B2>]
    : []
  : [];

type _C<T, X extends T, R extends T[]> = R["length"] extends 0
  ? [X]
  : [Head<R> | X, ..._C<T, X, Tail<R>>];

// type _D<T extends unknown[], X> = T["length"] extends 0
//   ? X
//   : ListToUnion<T> | X;

// type X = _C<any, "foo", ["qux", "bar", "baz"]>;
// type X0 = [];
// type X1 = [...X0, ..._C<any, "foo", []>];
// type X2 = [...X1, ..._C<any, "bar", X1>];
// type X3 = [...X2, ..._C<any, "baz", X2>];
// type X = X3;
// type X = _B<any, ["foo", "bar", "baz"], [1, 2, 3, 4]>;
// type X = _B<any, [1, 2]>;
// type X = _A<any, [1, 2]>;
// type X = _A<Scene, ["foo", "bar", "baz"]>;
type X = Builder2<Scene, ["foo", "bar", "baz"]>;
// type X = _C2<Scene, ["foo", "bar", "baz"]>;
type X_ = Expand<X>;

type Builder2<T, L extends (keyof T)[]> = L["length"] extends 0
  ? never
  : Builder2<T, Tail<L>> | _C2<T, L>;

type _C2<T, L extends (keyof T)[]> = L["length"] extends 1
  ? Pick<T, Head<L>>
  : Pick<T, Head<L>> & _C2<T, Tail<L>>;

type _C3<T, L extends (keyof T)[]> = Pick<T, L[number]>;

type AAA = Expand<_C2<Scene, ["foo", "bar"]>>;
type AAA2 = Expand<_C2<Scene, ["foo", "bar"]>>;

{
  function useScene(_: Scene) {}

  let scene: PartialScene3 = { foo: {} } as const;
  scene = { ...scene, bar: {} } as const;
  scene = { ...scene, baz: {} } as const;
  useScene(scene);
}

// type X = _D<["foo", "bar"], "baz">;
// type X = ListToUnion<[]>;
// type X1 = Expand<List<number, []>>;
// type X2 = Expand<Head<[]>>;
// type X = Expand<LenMinus1<[1]>>;
// type X = X_<[5, 6, 7, 8]>;
// type X = ListToUnion<[5, 6, 7, 8]>;
// type X1 = Pick<Scene, "baz" | "foo">;
// type X2 = Expand<Pick<Scene, "baz"> | Pick<Scene, "foo">>;

// {
//   type foo = Pick<Scene, "foo">;
//   type bar = Pick<Scene, "bar">;
//   type baz = Pick<Scene, "baz">;

//   type X =
//     | never
//     | foo
//     | bar
//     | baz
//     | (foo & bar)
//     | (foo & baz)
//     | (bar & baz)
//     | (foo & bar & baz);
//   type X_ = Expand<X>;

//   type Y = _D<[bar, baz], foo>;
//   type Y_ = Expand<Y>;
// }

// type X_<L extends unknown[]> = Tuple<L[number], LenMinus1<L>>;

// type X = () [P in keyof Scene]: number }

// type X = keyof {[P in keyof Scene as Pick<Scene, P>]: never};

// type _Foo = Expand<_A<Scene, ["foo", "bar", "baz"]>>;
// type _Foo = Expand<Head<Scene, ["foo", "bar", "baz"]>>;
// type _Foo = Expand<Tail<Scene, ["foo", "bar", "baz"]>>;
// type _Foo = ExpandRecursively<_C<Scene, "foo", ["bar", "baz"]>>;

// type K2 = _A<Scene>;

// type foo = ExpandRecursively<PowerSet<Scene>>;

type Test = Pick<Scene, "foo"> | Pick<Scene, "foo" | "bar">;

type DoesExtend<A, B> = A extends B ? true : false;

type F = DoesExtend<[1], []>;

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
  // let scene2: Scene = scene;
}
// {
//   type Tail<T extends unknown[]> = ((...args: T) => never) extends (
//     _: any,
//     ...args: infer R
//   ) => never
//     ? R
//     : never;

//   type X = Tail<[1, 2, 3]>;
// }
