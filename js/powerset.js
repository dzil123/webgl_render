"use strict";
{
    //    ^?
    function useScene(_) { }
    let scene = { foo: {} };
    scene = { ...scene, bar: {} };
    scene = { ...scene, baz: {} };
    useScene(scene);
}
//# sourceMappingURL=powerset.js.map