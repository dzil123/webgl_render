export function sleep(sec) {
    return new Promise((resolve) => setTimeout(resolve, sec * 1000));
}
export function frame() {
    return new Promise((resolve) => requestAnimationFrame(resolve));
}
export function nonnull(v) {
    if (v === undefined || v === null) {
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
export async function download(subdir, url, callback) {
    if (!url.startsWith("data:")) {
        url = subdir + url;
    }
    let response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to download ${url}: ${response.status} ${response.statusText}`);
    }
    let data = await callback(response);
    return data;
}
//# sourceMappingURL=util.js.map