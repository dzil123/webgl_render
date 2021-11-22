export {};

function sleep(sec: number) {
  return new Promise((resolve) => setTimeout(resolve, sec * 1000));
}

function frame() {
  return new Promise((resolve) => requestAnimationFrame(resolve));
}

await sleep(0.5);

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

async function onmessage(event: MessageEvent) {
  if (event.data instanceof ArrayBuffer) {
    throw "unexpected arraybuffer";
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

async function onopen() {
  console.log("ws open");
  promises_foreach((element) => element.resolve());
}

async function onclose() {
  console.log("ws close");
}

async function onerror(event: Event) {
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

  conn.addEventListener("message", onmessage);
  conn.addEventListener("open", onopen);
  conn.addEventListener("close", onclose);
  conn.addEventListener("error", onerror);

  return promise;
}

function log_ready() {
  if (conn === null) {
    console.log("readystate", "null");
  } else {
    console.log("readystate", conn.readyState);
  }
}

for (let i = 0; i < 3; i++) {
  try {
    await createWS();
    break;
  } catch {
    await sleep(1);
  }
}
// conn = null;
conn?.send(JSON.stringify("whoami"));
