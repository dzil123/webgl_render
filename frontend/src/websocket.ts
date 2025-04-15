import * as util from "./util.js";

const url = "ws://localhost:9080";

interface WSListener {
  resolve: (value?: void) => void;
  reject: (reason?: any) => void;
}

let conn: WebSocket | null = null;
const promises_open: Array<WSListener> = [];
const status_html = util.nonnull(document.getElementById("websocket_status"));

function promises_foreach(callback: (element: WSListener) => void) {
  promises_open.forEach(callback);
  promises_open.length = 0;
}

function make_on_message(
  msg_handler: (data: object) => void,
): (event: MessageEvent) => void {
  return on_message;

  async function on_message(event: MessageEvent) {
    if (event.data instanceof ArrayBuffer) {
      throw new Error("unexpected arraybuffer");
    }

    let data_raw: string;
    if (event.data instanceof Blob) {
      data_raw = await event.data.text();
    } else {
      data_raw = event.data;
    }

    const data: object = JSON.parse(data_raw);

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

async function on_error(event: Event) {
  console.log("ws error", JSON.stringify(event));
  promises_foreach((element) => element.reject());
}

export function createWS(
  message_handler: (data: object) => void,
): Promise<void> {
  if (conn !== null) {
    conn.close();
  }

  const promise = new Promise<void>((resolve, reject) => {
    promises_open.push({ resolve, reject });
  });

  conn = new WebSocket(url);

  conn.addEventListener("message", make_on_message(message_handler));
  conn.addEventListener("open", on_open);
  conn.addEventListener("close", on_close);
  conn.addEventListener("error", on_error);

  return promise;
}
