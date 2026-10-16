import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { IPC } from "@pi-desktop/shared";

const { build } = createRequire(new URL("../../../packages/agent-runtime/package.json", import.meta.url))("esbuild");
const result = await build({
  entryPoints: [fileURLToPath(new URL("../electron/main/ipc/window-ipc.ts", import.meta.url))],
  bundle: true, write: false, platform: "node", format: "esm",
  plugins: [{ name: "native-electron-boundary", setup(build) {
    build.onResolve({ filter: /^electron$/ }, () => ({ path: "electron", namespace: "fixture" }));
    build.onLoad({ filter: /.*/, namespace: "fixture" }, () => ({ contents: "export const BrowserWindow = {};" }));
  } }],
});
const { registerWindowIpc } = await import(`data:text/javascript;base64,${Buffer.from(result.outputFiles[0].text).toString("base64")}`);

test("window actions return authoritative fullscreen and page zoom while preserving controls and destroyed fallbacks", async () => {
  const handlers = new Map();
  let maximized = false;
  let destroyed = false;
  let contentsDestroyed = false;
  let minimized = false;
  let current = {
    isDestroyed: () => destroyed,
    isMaximized: () => maximized,
    isFullScreen: () => true,
    webContents: { isDestroyed: () => contentsDestroyed, getZoomFactor: () => 1.5 },
    maximize: () => { maximized = true; },
    unmaximize: () => { maximized = false; },
    minimize: () => { minimized = true; },
    close: () => { destroyed = true; },
  };
  registerWindowIpc({
    registrar: { handle: (channel, handler) => handlers.set(channel, handler), handleWithEvent: () => {} },
    getMainWindow: () => current,
  });
  const control = (action) => handlers.get(IPC.invoke.windowControl)({ action });
  assert.deepEqual(await control("getState"), { maximized: false, fullScreen: true, zoomFactor: 1.5 });
  assert.deepEqual(await control("toggleMaximize"), { maximized: true, fullScreen: true, zoomFactor: 1.5 });
  assert.deepEqual(await control("toggleMaximize"), { maximized: false, fullScreen: true, zoomFactor: 1.5 });
  assert.deepEqual(await control("minimize"), { maximized: false, fullScreen: true, zoomFactor: 1.5 });
  assert.equal(minimized, true);
  contentsDestroyed = true;
  assert.deepEqual(await control("getState"), { maximized: false, fullScreen: true, zoomFactor: 1 });
  const empty = { maximized: false, fullScreen: false, zoomFactor: 1 };
  assert.deepEqual(await control("close"), empty);
  assert.deepEqual(await control("getState"), empty);
  current = null;
  assert.deepEqual(await control("getState"), empty);
  await assert.rejects(control("unsupported"), /unsupported window control action/);
});
