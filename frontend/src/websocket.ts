const url = "ws://localhost:9080";

interface WSListener {
  resolve: (value?: unknown) => void;
  reject: (reason?: any) => void;
}

let conn: WebSocket | null = null;
let promises_open: Array<WSListener> = [];

function promises_foreach(callback: (element: WSListener) => void) {
  promises_open.forEach(callback);
  promises_open.length = 0;
}

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

  let data: object = JSON.parse(data_raw);

  console.log("got", typeof data, JSON.stringify(data));
}

async function on_open() {
  console.log("ws open");
  promises_foreach((element) => element.resolve());
}

async function on_close() {
  console.log("ws close");
}

async function on_error(event: Event) {
  console.log("ws error", JSON.stringify(event));
  promises_foreach((element) => element.reject());
}

function createWS(): Promise<unknown> {
  if (conn !== null) {
    conn.close();
  }

  let promise = new Promise((resolve, reject) => {
    promises_open.push({ resolve, reject });
  });

  conn = new WebSocket(url);

  conn.addEventListener("message", on_message);
  conn.addEventListener("open", on_open);
  conn.addEventListener("close", on_close);
  conn.addEventListener("error", on_error);

  return promise;
}
