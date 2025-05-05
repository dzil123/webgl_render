export function sleep(sec) {
    return new Promise((resolve) => setTimeout(resolve, sec * 1000));
}
export function frame() {
    return new Promise((resolve) => requestAnimationFrame(resolve));
}
export async function mainloop(callback) {
    const fps_element = nonnull(document.getElementById("fps"));
    const fps_avg_element = nonnull(document.getElementById("fps_avg"));
    let then = 0;
    let then_then = 0;
    let counter = 0;
    const avg_len = 60;
    while (true) {
        await sleep(1);
        const now = (await frame()) / 1000;
        const delta = now - then;
        then = now;
        const fps = 1.0 / delta;
        const fps_str = fps.toFixed(2);
        fps_element.innerText = fps_str;
        counter += 1;
        if (counter >= avg_len) {
            counter = 0;
            const delta = now - then_then;
            then_then = now;
            const fps = avg_len / delta;
            const fps_str = fps.toFixed(2);
            fps_avg_element.innerText = fps_str;
        }
        callback();
    }
}
export function nonnull(v) {
    if (v === undefined || v === null) {
        throw new Error("unexpected null");
    }
    return v;
}
export function new_globals() {
    const storage = [];
    const get = (key) => {
        for (const item of storage) {
            if (item[0] === key) {
                return item[1];
            }
        }
        const item = [key, []];
        storage.push(item);
        return item[1];
    };
    return get;
}
export async function download(subdir, url, callback) {
    if (!url.startsWith("data:")) {
        url = subdir + url;
    }
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to download ${url}: ${response.status} ${response.statusText}`);
    }
    const data = await callback(response);
    return data;
}
//# sourceMappingURL=util.js.map