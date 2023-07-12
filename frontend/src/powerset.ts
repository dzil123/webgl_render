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

type Helper<T, X extends T, R extends T[]> = R["length"] extends 0
  ? [X]
  : [Head<R> | X, ...Helper<T, X, Tail<R>>];

type PowerSet<T, L extends T[]> = L["length"] extends 0
  ? []
  : PowerSet<T, Tail<L>> extends infer Recursion
  ? Recursion extends T[]
    ? [...Recursion, ...Helper<T, Head<L>, Recursion>]
    : never
  : never;
