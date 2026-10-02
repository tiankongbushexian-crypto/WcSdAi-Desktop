import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { createRequire } from "node:module";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, join, resolve, sep } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

const execute = promisify(execFile);
const desktop = fileURLToPath(new URL("../apps/desktop/", import.meta.url));
const require = createRequire(join(desktop, "package.json"));
const { build } = await import(require.resolve("vite"));
const { default: tailwindcss } = await import(require.resolve("@tailwindcss/vite"));
const electronPath = require("electron");
const scratch = await mkdtemp(join(tmpdir(), "wcsdai-update-notifications-"));
const rendererDirectory = join(scratch, "renderer");
const contentTypes = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css" };
const server = createServer(async (request, response) => {
  const file = resolve(rendererDirectory, `.${new URL(request.url, "http://localhost").pathname}`);
  if (!file.startsWith(`${rendererDirectory}${sep}`)) { response.writeHead(403).end(); return; }
  try {
    const bytes = await readFile(file);
    response.writeHead(200, { "Content-Type": contentTypes[extname(file)] ?? "application/octet-stream" }).end(bytes);
  } catch { response.writeHead(404).end(); }
});
try {
  await build({ configFile: false, root: desktop, plugins: [tailwindcss()], logLevel: "warn",
    esbuild: { jsx: "automatic" }, build: { outDir: rendererDirectory, emptyOutDir: true,
      rollupOptions: { input: join(desktop, "test/fixtures/update-notification-flow.html") } } });
  await new Promise((resolve, reject) => { server.once("error", reject); server.listen(0, "127.0.0.1", resolve); });
  const url = `http://127.0.0.1:${server.address().port}/test/fixtures/update-notification-flow.html`;
  const runner = join(scratch, "run.cjs");
  await writeFile(runner, `
const assert = require("node:assert/strict");
const { app, BrowserWindow } = require("electron");
app.setPath("userData", ${JSON.stringify(join(scratch, "profile"))});
app.commandLine.appendSwitch("no-proxy-server");
app.whenReady().then(async () => {
  const win = new BrowserWindow({ show: false, width: 1000, height: 800, webPreferences: { nodeIntegration: false, contextIsolation: true, backgroundThrottling: false } });
  const errors = [];
  win.webContents.on("console-message", (details) => { if (details.level === "error") errors.push(details.message); });
  const read = source => win.webContents.executeJavaScript(source);
  const wait = source => read('new Promise((resolve, reject) => { const start=performance.now(); const poll=()=>{ if ('+source+') return resolve(true); if(performance.now()-start>10000) return reject(new Error("Renderer condition timed out: " + '+JSON.stringify(source)+')); requestAnimationFrame(poll); }; poll(); })');
  const click = (surface, label) => read('Array.from(document.querySelectorAll('+JSON.stringify(surface+' button')+')).find(button=>button.textContent.trim()==='+JSON.stringify(label)+').click()');
  await win.loadURL(${JSON.stringify(url)});
  await wait('document.querySelector("#settings-surface button") && window.updateFixture');
  const consoleErrorCaptured = new Promise(resolve => {
    const listener = details => {
      if (details.message !== 'update-fixture-console-sentinel') return;
      win.webContents.off('console-message', listener);
      resolve();
    };
    win.webContents.on('console-message', listener);
  });
  await read('console.error("update-fixture-console-sentinel")');
  await consoleErrorCaptured;
  assert.deepEqual(errors, ['update-fixture-console-sentinel'], 'console error capture must observe real Electron event details');
  errors.length = 0;
  await click('#settings-surface', 'Check for updates');
  await wait('document.querySelector(".update-notice") && document.querySelector(".update-settings-notes")');
  assert.ok((await read('document.querySelector(".update-notice").textContent')).includes('1.0.2'));
  assert.ok((await read('document.querySelector(".update-notice-notes").textContent')).includes('Fixture verified release highlights'));
  await click('#banner-surface', 'View release');
  await wait('document.querySelector(".toast.error")');
  const english = 'Could not open the download page. Check for updates and try again.';
  assert.equal(await read('document.querySelector(".toast-message").textContent'), english);
  assert.equal(await read('document.querySelector(".toast.error").getAttribute("role")'), 'alert');
  await read('window.updateFixture.clearToasts(); window.updateFixture.setRejectOpen(false)');
  await wait('!document.querySelector(".toast")');
  await click('#banner-surface', 'View release');
  await wait('window.updateFixture.calls.filter(call=>call.channel===window.piDesktop.channels.invoke.updatesOpenReleases).length===2');
  assert.equal(await read('document.querySelector(".toast")'), null);
  assert.ok(await read('Boolean(document.querySelector(".update-notice"))'), 'successful opening preserves the offer');
  await read('window.updateFixture.setRejectOpen(true); void window.updateFixture.changeLanguage("zh-CN")');
  await wait('document.querySelector(".update-notice-title").textContent === "软件更新"');
  const chineseAction = await read('document.querySelector(".update-notice-actions button").textContent.trim()');
  await click('#settings-surface', chineseAction);
  await wait('document.querySelector(".toast.error")');
  assert.equal(await read('document.querySelector(".toast-message").textContent'), '无法打开下载页，请重新检查更新后再试。');
  await read('window.updateFixture.clearToasts(); window.updateFixture.setRejectOpen(false)');
  await wait('!document.querySelector(".toast")');
  await click('#settings-surface', chineseAction);
  await wait('window.updateFixture.calls.filter(call=>call.channel===window.piDesktop.channels.invoke.updatesOpenReleases).length===4');
  assert.equal(await read('document.querySelector(".toast")'), null);
  const openCalls = await read('window.updateFixture.calls.filter(call=>call.channel===window.piDesktop.channels.invoke.updatesOpenReleases)');
  assert.ok(openCalls.every(call=>call.args.length===0), 'renderer must never send a download URL');
  assert.deepEqual(errors, []);
  console.log(JSON.stringify({ result:'passed', checkToOffer:true, notesVisible:true, bannerErrorAndRetry:true, settingsErrorAndRetry:true, localized:['en','zh-CN'], noRendererUrl:true, nativeDownloadNotInvoked:true, consoleErrorCaptureVerified:true }));
  win.destroy(); app.quit();
}).catch(error => { console.error(error); app.exit(1); });
`);
  const env = { ...process.env };
  delete env.ELECTRON_RUN_AS_NODE;
  const { stdout } = await execute(electronPath, [runner], { env, timeout: 90_000, maxBuffer: 1024 * 1024 });
  const result = JSON.parse(stdout.trim().split("\n").at(-1));
  assert.equal(result.result, "passed");
  const output = fileURLToPath(new URL("../.artifacts/wcsdai-updates-motion/", import.meta.url));
  await mkdir(output, { recursive: true });
  await writeFile(join(output, "update-notification-flow.json"), `${JSON.stringify(result, null, 2)}\n`);
  console.log(JSON.stringify(result, null, 2));
} finally {
  await new Promise((resolve) => server.close(resolve));
  await rm(scratch, { recursive: true, force: true });
}
