export {};

function sleep(sec: number) {
  return new Promise((resolve) => setTimeout(resolve, sec * 1000));
}

function frame() {
  return new Promise((resolve) => requestAnimationFrame(resolve));
}

await sleep(0.5);

const url = "ws://localhost:9080";
let conn = new WebSocket(url);

conn.addEventListener("message", async (event) => {
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
});

conn.addEventListener("open", () => {
  console.log("sending");
  conn.send(JSON.stringify({ hello: "world" }));
});

// document.body.innerText += "1231231232";

setTimeout(() => {}, 2000);
