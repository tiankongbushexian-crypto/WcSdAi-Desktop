// Disposable, credential-free backdrop for native desktop corner pixel tests.
const { app, BrowserWindow, screen } = require("electron");
const { createServer } = require("node:http");
const { resolve } = require("node:path");

if (!process.env.WCSDAI_CORNER_BACKDROP_PROFILE) throw new Error("Missing isolated backdrop profile");
const token = process.env.WCSDAI_CORNER_BACKDROP_TOKEN;
if (!/^[a-f0-9-]{36}$/.test(token || "")) throw new Error("Missing isolated backdrop capability");
app.setPath("userData", resolve(process.env.WCSDAI_CORNER_BACKDROP_PROFILE));
const emit = (value) => console.log("CORNER_BACKDROP " + JSON.stringify(value));
app.whenReady().then(async () => {
  const workArea = screen.getPrimaryDisplay().workArea;
  const window = new BrowserWindow({
    ...workArea, show: false, frame: false, thickFrame: false, resizable: false,
    backgroundColor: "#db2788", skipTaskbar: true,
    webPreferences: { sandbox: true, contextIsolation: true, nodeIntegration: false },
  });
  let pending = Promise.resolve();
  // GUI Electron on Windows may close stdin immediately. Use an explicitly
  // authenticated loopback request/response channel, independent of console IO.
  const server = createServer((request, response) => {
    if (request.socket.remoteAddress !== "127.0.0.1" || request.method !== "POST" || request.url !== `/${token}`) {
      response.writeHead(404).end(); return;
    }
    let body = "";
    request.on("data", (bytes) => {
      body += bytes.toString();
      if (body.length > 1024) request.destroy();
    });
    request.on("error", () => response.destroy());
    request.on("end", () => {
      pending = pending.then(async () => {
        const command = JSON.parse(body);
        if (command.action === "quit") {
          response.once("finish", () => app.exit(0));
          response.setHeader("Content-Type", "application/json");
          response.end(JSON.stringify({ ok: true })); return;
        }
        if (command.action === "front") {
          window.show(); window.focus(); window.moveTop();
          response.setHeader("Content-Type", "application/json");
          response.end(JSON.stringify({ ok: true })); return;
        }
        if (command.action !== "color" || !/^#[0-9a-f]{6}$/i.test(command.color)) throw new Error("Invalid backdrop command");
        window.setBackgroundColor(command.color);
        await window.webContents.executeJavaScript(`new Promise(resolve => {
          document.documentElement.style.background = ${JSON.stringify(command.color)};
          requestAnimationFrame(() => requestAnimationFrame(resolve));
        })`);
        response.setHeader("Content-Type", "application/json");
        response.end(JSON.stringify({ ok: true, color: command.color }));
      }).catch((error) => {
        console.error("Backdrop command failed: " + error.message);
        response.writeHead(500).end("Backdrop command failed");
      });
    });
  });
  server.requestTimeout = 15_000;
  server.headersTimeout = 10_000;
  await window.loadURL("data:text/html,<html style='background:%23db2788'><title>WcSdAi corner test backdrop</title></html>");
  window.showInactive();
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  emit({ ready: true, handle: window.getNativeWindowHandle().readBigUInt64LE().toString(), workArea, port: server.address().port });
}).catch((error) => { console.error(error.message); app.exit(1); });
