// Disposable, credential-free backdrop for native desktop corner pixel tests.
const { app, BrowserWindow, screen } = require("electron");
const { createInterface } = require("node:readline");
const { resolve } = require("node:path");

if (!process.env.WCSDAI_CORNER_BACKDROP_PROFILE) throw new Error("Missing isolated backdrop profile");
app.setPath("userData", resolve(process.env.WCSDAI_CORNER_BACKDROP_PROFILE));
const emit = (value) => console.log("CORNER_BACKDROP " + JSON.stringify(value));
app.whenReady().then(async () => {
  const workArea = screen.getPrimaryDisplay().workArea;
  const window = new BrowserWindow({
    ...workArea, show: false, frame: false, thickFrame: false, resizable: false,
    backgroundColor: "#db2788", skipTaskbar: true,
    webPreferences: { sandbox: true, contextIsolation: true, nodeIntegration: false },
  });
  const input = createInterface({ input: process.stdin });
  let pending = Promise.resolve();
  input.on("line", (line) => {
    pending = pending.then(async () => {
      const command = JSON.parse(line);
      if (command.action === "quit") { app.exit(0); return; }
      if (command.action !== "color" || !/^#[0-9a-f]{6}$/i.test(command.color)) throw new Error("Invalid backdrop command");
      window.setBackgroundColor(command.color);
      await window.webContents.executeJavaScript(`new Promise(resolve => {
        document.documentElement.style.background = ${JSON.stringify(command.color)};
        requestAnimationFrame(() => requestAnimationFrame(resolve));
      })`);
      emit({ id: command.id, color: command.color });
    }).catch((error) => { console.error(error.message); app.exit(1); });
  });
  input.once("close", () => app.exit(0));
  await window.loadURL("data:text/html,<html style='background:%23db2788'><title>WcSdAi corner test backdrop</title></html>");
  window.showInactive();
  emit({ ready: true, handle: window.getNativeWindowHandle().readBigUInt64LE().toString(), workArea });
}).catch((error) => { console.error(error.message); app.exit(1); });
