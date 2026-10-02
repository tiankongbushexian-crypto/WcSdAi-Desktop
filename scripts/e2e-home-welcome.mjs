import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { execFile } from "node:child_process";
import { createRequire } from "node:module";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { createServer as createHttpServer } from "node:http";
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
const scratch = await mkdtemp(join(tmpdir(), "wcsdai-home-welcome-"));
const outputDirectory = join(scratch, "renderer");
const contentTypes = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".png": "image/png", ".gif": "image/gif", ".woff2": "font/woff2" };
const server = createHttpServer(async (request, response) => {
  const file = resolve(outputDirectory, `.${new URL(request.url, "http://localhost").pathname}`);
  if (!file.startsWith(`${outputDirectory}${sep}`)) { response.writeHead(403).end(); return; }
  try {
    const bytes = await readFile(file);
    response.writeHead(200, { "Content-Type": contentTypes[extname(file)] ?? "application/octet-stream" }).end(bytes);
  } catch { response.writeHead(404).end(); }
});
try {
  await build({ configFile: false, root: desktop, plugins: [tailwindcss()], logLevel: "warn",
    esbuild: { jsx: "automatic" }, build: { outDir: outputDirectory, emptyOutDir: true,
      rollupOptions: { input: join(desktop, "test/fixtures/home-welcome-flow.html") } } });
  await new Promise((resolve, reject) => { server.once("error", reject); server.listen(0, "127.0.0.1", resolve); });
  const url = `http://127.0.0.1:${server.address().port}/test/fixtures/home-welcome-flow.html`;
  const runner = join(scratch, "run.cjs");
  await writeFile(runner, `
const assert = require("node:assert/strict");
const { app, BrowserWindow } = require("electron");
app.setPath("userData", ${JSON.stringify(join(scratch, "profile"))});
app.commandLine.appendSwitch("no-proxy-server");
app.whenReady().then(async () => {
  const win = new BrowserWindow({ show: false, width: 900, height: 680, webPreferences: { nodeIntegration: false, contextIsolation: true, backgroundThrottling: false } });
  const errors = [];
  win.webContents.on("console-message", event => { if (event.level === "error") { errors.push(event.message); console.error(event.message); } });
  const read = source => win.webContents.executeJavaScript(source);
  const wait = source => read('new Promise((resolve, reject) => { const start=performance.now(); const poll=()=>{ if ('+source+') return resolve(true); if(performance.now()-start>10000) return reject(new Error('+JSON.stringify("Renderer condition timed out: "+source)+')); requestAnimationFrame(poll); }; poll(); })');
  const snapshot = () => read('(() => {const hero=document.querySelector(".home-welcome"); const heading=hero.querySelector("h1"); return { text: heading.querySelector(".home-welcome-readable")?.textContent ?? heading.textContent, logo: hero.querySelector("[data-logo-motion]").dataset.logoMotion, titleClass: heading.className, history: sessionStorage.getItem("wcsdai.home-welcome.temporary")};})()');
  await win.loadURL(${JSON.stringify(url)});
  await wait('document.querySelector(".home-welcome h1") && sessionStorage.getItem("wcsdai.home-welcome.temporary")');
  const first = await snapshot();
  await read('document.querySelector("#draft").value="Keep this draft"; document.querySelector("#rerender").click()');
  await wait('document.querySelector("#rerender").textContent.endsWith("1")');
  assert.deepEqual(await snapshot(), first, "an unrelated update must not reroll the greeting or motion");
  const variants = new Set([first.text]);
  let previous = first;
  for (let index=0; index<12; index++) {
    await read('document.querySelector("#new-session").click()');
    await wait('sessionStorage.getItem("wcsdai.home-welcome.temporary") !== '+JSON.stringify(previous.history));
    const next=await snapshot();
    assert.notEqual(next.text, previous.text, "new empty session must not repeat the previous greeting");
    assert.notEqual(next.logo, previous.logo, "new session chooses another logo treatment");
    assert.notEqual(next.titleClass, previous.titleClass, "new session chooses another text entrance");
    assert.equal(await read('document.querySelector("#draft").value'), "Keep this draft");
    variants.add(next.text); previous=next;
  }
  win.webContents.reload();
  await wait('document.querySelector(".home-welcome h1") && sessionStorage.getItem("wcsdai.home-welcome.temporary") !== '+JSON.stringify(previous.history));
  const refreshed=await snapshot();
  assert.notEqual(refreshed.text, previous.text, "refresh must skip the previous greeting");
  await read('document.querySelector("#project").click()');
  await wait('document.querySelector("#project-switcher")');
  assert.ok((await snapshot()).text.includes("Test Project"));
  await read('document.querySelector("#project-switcher").click()');
  await wait('document.querySelector("#project-menu")');
  if (!(await read('Boolean(document.querySelector(".home-mascot-vector"))'))) {
    await read('document.querySelector("#new-session").click()');
    await wait('document.querySelector(".home-mascot-vector")');
  }
  await win.webContents.debugger.attach("1.3");
  await win.webContents.debugger.sendCommand("Emulation.setEmulatedMedia", {features:[{name:"prefers-reduced-motion",value:"reduce"}]});
  const reduced = await read('Array.from(document.querySelectorAll(".home-welcome *")).every(el => getComputedStyle(el).animationName === "none")');
  assert.equal(reduced,true,"system reduced motion disables all home animations");
  const alignment = await read('(() => { const logo=document.querySelector(".empty-hero-icon").getBoundingClientRect(); const title=document.querySelector("h1").getBoundingClientRect();return Math.abs((logo.left+logo.width/2)-(title.left+title.width/2));})()');
  assert.ok(alignment < 0.1, "logo and title share the same horizontal center");
  const visualAlignment = await read('(() => { const group=document.querySelector(".home-mascot-vector svg > g"); const box=group.getBBox(); const center=new DOMPoint(box.x+box.width/2,box.y+box.height/2).matrixTransform(group.getScreenCTM()); const title=document.querySelector("h1").getBoundingClientRect(); return Math.abs(center.x-(title.left+title.width/2)); })()');
  assert.ok(visualAlignment < 0.1, "the visible canonical path bounds share the heading center");
  assert.equal(await read('getComputedStyle(document.querySelector(".home-mascot-vector")).color'), "rgb(0, 0, 0)");
  await read('document.documentElement.dataset.theme="dark"');
  assert.equal(await read('getComputedStyle(document.querySelector(".home-mascot-vector")).color'), "rgb(255, 255, 255)");
  assert.deepEqual(errors, []);
  console.log(JSON.stringify({ result:"passed", nonRepeatingTransitions:13, rerenderStable:true, draftPreserved:true, projectControlClickable:true, reducedMotion:true, centerDifferencePx:alignment, visualPathCenterDifferencePx:visualAlignment, monochromeThemes:true, observedGreetings:variants.size }));
  win.webContents.debugger.detach();
  win.destroy(); app.quit();
}).catch(error => { console.error(error); app.exit(1); });
`);
  const env = { ...process.env };
  delete env.ELECTRON_RUN_AS_NODE;
  const { stdout } = await execute(electronPath, [runner], { env, timeout: 90_000, maxBuffer: 1024 * 1024 });
  const result = JSON.parse(stdout.trim().split("\n").at(-1));
  assert.equal(result.result, "passed");
  const repository = fileURLToPath(new URL("../", import.meta.url));
  result.timestamp = new Date().toISOString();
  result.commit = (await execute("git", ["rev-parse", "HEAD"], { cwd: repository })).stdout.trim();
  result.baseMain = (await execute("git", ["rev-parse", "origin/main"], { cwd: repository })).stdout.trim();
  result.sourceSha256 = {};
  for (const file of [
    "apps/desktop/src/components/HomeWelcome.tsx", "apps/desktop/src/components/HomeMascotLogo.tsx",
    "apps/desktop/src/components/ChatSurface.tsx", "apps/desktop/src/lib/home-welcome.ts",
    "apps/desktop/src/styles/home-welcome.css", "apps/desktop/src/styles/chat-shell.css",
    "apps/desktop/src/styles/globals.css", "apps/desktop/src/styles/tokens.css",
    "packages/i18n/src/locales/zh-CN/index.ts", "apps/desktop/test/fixtures/home-welcome-flow.tsx",
    "scripts/e2e-home-welcome.mjs",
  ]) result.sourceSha256[file] = createHash("sha256").update(await readFile(join(repository, file))).digest("hex");
  const output = fileURLToPath(new URL("../.artifacts/wcsdai-updates-motion/", import.meta.url));
  await mkdir(output, { recursive: true });
  await writeFile(join(output, "home-welcome-flow.json"), `${JSON.stringify(result, null, 2)}\n`);
  console.log(JSON.stringify(result, null, 2));
} finally {
  await new Promise(resolve => server.close(resolve));
  await rm(scratch, { recursive: true, force: true });
}
