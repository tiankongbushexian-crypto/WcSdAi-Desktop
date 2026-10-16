#!/usr/bin/env node
/** Native Windows shape probe with a disposable Electron window, no host/provider. */
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { repositoryRoot, resolveElectronBinary } from "./e2e/boot.mjs";

if (process.platform !== "win32") {
  console.log("SKIP native Windows window region: requires a Windows runner");
  process.exit(0);
}
const root = repositoryRoot();
const { build } = createRequire(join(root, "packages/agent-runtime/package.json"))("esbuild");
const temp = await mkdtemp(join(tmpdir(), "wcsdai-window-region-"));
try {
  const source = `
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { app, BrowserWindow } from 'electron';
import { installWindowShape, setWindowCornerRadius } from ${JSON.stringify(join(root, "apps/desktop/electron/main/window-shape.ts"))};
import { setWindowFullScreen } from ${JSON.stringify(join(root, "apps/desktop/electron/main/window-fullscreen.ts"))};
app.setPath('userData', ${JSON.stringify(join(temp, "profile"))});
const exec = promisify(execFile);
await app.whenReady();
const window = new BrowserWindow({ show: false, width: 900, height: 650,
  frame: false, thickFrame: false, resizable: true, backgroundColor: '#ffffff',
  webPreferences: { sandbox: true, contextIsolation: true, nodeIntegration: false } });
installWindowShape(window);
const handle = window.getNativeWindowHandle().readBigUInt64LE().toString();
const reports = [];
async function probe(label, rounded, minimumInset = 1) {
  const { stdout } = await exec('powershell.exe', ['-NoLogo', '-NoProfile', '-NonInteractive', '-File',
    ${JSON.stringify(join(root, "scripts/e2e/probe-window-region.ps1"))}, handle], { timeout: 15000 });
  const result = JSON.parse(stdout.trim());
  if (rounded) {
    assert.equal(result.kind, 3, label + ': complex rounded native region');
    assert.deepEqual(result.cornersExcluded, [true, true, true, true], label + ': all four corners cut out');
    assert.equal(result.centerOwned, true, label + ': window center remains hit-testable');
    assert.ok(result.topInset >= minimumInset, label + ': visible corner inset');
  } else {
    assert.ok(result.kind === 0 || (result.kind === 2 && result.cornersExcluded.every(value => !value)), label + ': rectangular region');
  }
  reports.push({ label, ...result });
}
try {
  await window.loadURL('data:text/html,<title>WcSdAi isolated window region test</title>');
  window.show();
  await probe('default 12 DIP corners', true, 7);
  window.setSize(840, 600);
  await probe('resized corners', true, 7);
  const maximized = once(window, 'maximize'); window.maximize(); await maximized;
  await probe('maximized rectangle', false);
  const restored = once(window, 'unmaximize'); window.unmaximize(); await restored;
  await probe('restored rounded corners', true, 7);
  setWindowFullScreen(window, true, true);
  await probe('fullscreen rectangle', false);
  setWindowFullScreen(window, false, true);
  await probe('exit fullscreen restores corners', true, 7);
  assert.equal(setWindowCornerRadius(window, 0), 0);
  await probe('explicit plugin square corners', false);
  assert.equal(setWindowCornerRadius(window, 24), 24);
  await probe('explicit plugin maximum corners', true, 15);
  console.log('NATIVE_WINDOW_REGION ' + JSON.stringify({ status: 'PASS', reports }));
  window.destroy();
  assert.equal(setWindowCornerRadius(window, 12), null);
  app.exit(0);
} catch (error) { console.error(error); app.exit(1); }
`;
  // Top-level await stays in an async IIFE because Electron's main entry is CJS.
  const split = source.indexOf("app.setPath");
  await build({ stdin: { contents: source.slice(0, split) + "(async () => {" + source.slice(split) + "})().catch(error => { console.error(error); app.exit(1); });", resolveDir: root, loader: "ts" },
    outfile: join(temp, "main.cjs"), bundle: true, platform: "node", format: "cjs", external: ["electron"], target: "node22" });
  const env = { ...process.env }; delete env.ELECTRON_RUN_AS_NODE;
  const child = spawn(resolveElectronBinary(root).electronBinary, [join(temp, "main.cjs")], { env, stdio: ["ignore", "pipe", "pipe"] });
  let output = "";
  for (const stream of [child.stdout, child.stderr]) stream.on("data", (chunk) => { output += chunk; });
  const timer = setTimeout(() => child.kill("SIGKILL"), 120_000);
  let code;
  try { code = await new Promise((resolve, reject) => { child.once("error", reject); child.once("close", resolve); }); }
  finally { clearTimeout(timer); }
  assert.equal(code, 0, output);
  const result = output.split(/\r?\n/).find((line) => line.startsWith("NATIVE_WINDOW_REGION "));
  assert(result, output);
  console.log(result);
} finally { await rm(temp, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 }); }
