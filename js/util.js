export function sleep(sec) {
    return new Promise((resolve) => setTimeout(resolve, sec * 1000));
}
export function frame() {
    return new Promise((resolve) => requestAnimationFrame(resolve));
}
export function nonnull(v) {
    if (v === null) {
        throw new Error("unexpected null");
    }
    return v;
}
export function new_globals() {
    let storage = [];
    let get = (key) => {
        for (let item of storage) {
            if (item[0] === key) {
                return item[1];
            }
        }
        let item = [key, []];
        storage.push(item);
        return item[1];
    };
    return get;
}
//# sourceMappingURL=util.js.map