import * as util from "./util.js";
const url = "ws://localhost:9080";
let conn = null;
let promises_open = [];
let status_html = util.nonnull(document.getElementById("websocket_status"));
function promises_foreach(callback) {
    promises_open.forEach(callback);
    promises_open.length = 0;
}
function make_on_message(msg_handler) {
    return on_message;
    async function on_message(event) {
        if (event.data instanceof ArrayBuffer) {
            throw new Error("unexpected arraybuffer");
        }
        let data_raw;
        if (event.data instanceof Blob) {
            data_raw = await event.data.text();
        }
        else {
            data_raw = event.data;
        }
        let data = JSON.parse(data_raw);
        console.log("got", typeof data, JSON.stringify(data));
        status_html.innerText = "connected";
        msg_handler(data);
    }
}
async function on_open() {
    status_html.innerText = "connected, no message";
    console.log("ws open");
    promises_foreach((element) => element.resolve());
}
async function on_close() {
    status_html.innerText = "not connected";
    console.log("ws close");
}
async function on_error(event) {
    console.log("ws error", JSON.stringify(event));
    promises_foreach((element) => element.reject());
}
export function createWS(message_handler) {
    if (conn !== null) {
        conn.close();
    }
    let promise = new Promise((resolve, reject) => {
        promises_open.push({ resolve, reject });
    });
    conn = new WebSocket(url);
    conn.addEventListener("message", make_on_message(message_handler));
    conn.addEventListener("open", on_open);
    conn.addEventListener("close", on_close);
    conn.addEventListener("error", on_error);
    return promise;
}
//# sourceMappingURL=websocket.js.map