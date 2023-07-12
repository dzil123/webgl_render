export let foo = 1;
{
    function useScene(_) { }
    let scene = { foo: {} };
    scene = { ...scene, bar: {} };
    scene = { ...scene, baz: {} };
    useScene(scene);
}
/*
  List
  for item in List:
    item = Pick<T, item>

*/
function run() {
    let scene = { foo: {} };
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
//# sourceMappingURL=foo.js.map