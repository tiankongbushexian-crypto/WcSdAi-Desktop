#!/usr/bin/env node
/** Real Chromium geometry and interactions for the shared service/account picker. */
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { resolveElectronBinary } from "./e2e/boot.mjs";
import { loadStyles } from "../apps/desktop/test/helpers/styles.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(join(root, "packages/agent-runtime/package.json"));
const { build } = require("esbuild");
const { electronBinary } = resolveElectronBinary(root);
const temp = await mkdtemp(join(tmpdir(), "wcsdai-provider-layout-"));
const artifacts = resolve(process.env.PROVIDER_LAYOUT_ARTIFACT_DIR || join(root, ".artifacts/provider-dialog-layout"));
await mkdir(artifacts, { recursive: true });
try {
  await build({
    entryPoints: [join(root, "scripts/e2e/provider-dialog-layout.tsx")],
    outfile: join(temp, "renderer.js"), bundle: true, platform: "browser", format: "iife", jsx: "automatic",
    define: { "process.env.NODE_ENV": '"production"' }, loader: { ".css": "empty" },
    alias: {
      "@pi-desktop/i18n": join(root, "packages/i18n/src/index.ts"),
      react: join(root, "apps/desktop/node_modules/react"),
      "react-dom": join(root, "apps/desktop/node_modules/react-dom"),
    },
    nodePaths: [join(root, "apps/desktop/node_modules")],
  });
  // Keep the production stylesheet cascade; Tailwind's token declaration is
  // emitted as ordinary CSS for this isolated component fixture.
  await writeFile(join(temp, "styles.css"), (await loadStyles())
    .replace('@import "tailwindcss";', "").replace(/@theme(?: inline)?/g, ":root"));
  await writeFile(join(temp, "index.html"), `<!doctype html><html data-theme="light" data-platform="darwin"><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="default-src 'self'; style-src 'self' 'unsafe-inline'"><link rel="stylesheet" href="styles.css"><body><script src="renderer.js"></script>`);
  await writeFile(join(temp, "main.cjs"), `
const { app, BrowserWindow } = require("electron");
const path = require("node:path");
const fs = require("node:fs/promises");
app.setPath("userData", path.join(__dirname, "profile"));
app.whenReady().then(async () => {
  const window = new BrowserWindow({ show: false, webPreferences: {
    sandbox: true, contextIsolation: true, nodeIntegration: false, backgroundThrottling: false,
  } });
  const results = [];
  let current;
  let failure;
  try {
    await window.loadFile(path.join(__dirname, "index.html"));
    for (const [width, height, zoom, locale, account] of [
      [1188, 794, 1, "zh-CN", false], [800, 560, 1, "zh-CN", false],
      [1440, 900, 1.25, "en", false], [1280, 1000, 1, "en", false],
      [800, 560, 1, "zh-CN", true], [1280, 1000, 1, "en", true],
    ]) {
      current = [width, height, zoom, locale, account ? "account" : "service"].join("-");
      window.setContentSize(width, height);
      window.webContents.setZoomFactor(zoom);
      const result = await window.webContents.executeJavaScript(
        "globalThis.providerDialogLayoutProbe(" + JSON.stringify(locale) + "," + account + ")");
      results.push({ name: current, ...result });
      await fs.writeFile(path.join(${JSON.stringify(artifacts)}, current + ".png"), (await window.webContents.capturePage()).toPNG());
    }
  } catch (error) {
    failure = { scenario: current, error: String(error) };
    await fs.writeFile(path.join(${JSON.stringify(artifacts)}, "failure.png"), (await window.webContents.capturePage()).toPNG());
  } finally {
    const report = { ok: !failure, results, failure };
    await fs.writeFile(path.join(${JSON.stringify(artifacts)}, "report.json"), JSON.stringify(report, null, 2));
    console.log("PROVIDER_DIALOG_LAYOUT " + JSON.stringify(report));
    window.destroy();
    app.exit(failure ? 1 : 0);
  }
});
`);
  const env = { ...process.env };
  delete env.ELECTRON_RUN_AS_NODE;
  const child = spawn(electronBinary, [join(temp, "main.cjs")], { env, stdio: ["ignore", "pipe", "pipe"] });
  let output = "";
  for (const stream of [child.stdout, child.stderr]) stream.on("data", (data) => { output += data; });
  const timeout = setTimeout(() => child.kill("SIGKILL"), 60_000);
  let code;
  try {
    code = await new Promise((resolve, reject) => { child.once("error", reject); child.once("close", resolve); });
  } finally { clearTimeout(timeout); }
  const line = output.split(/\r?\n/).find((item) => item.startsWith("PROVIDER_DIALOG_LAYOUT "));
  assert(line, `no layout result (exit=${code}): ${output.slice(-4000)}`);
  console.log(line);
  assert.equal(code, 0, output.slice(-6000));
  assert.equal(JSON.parse(line.slice("PROVIDER_DIALOG_LAYOUT ".length)).ok, true);
} finally { await rm(temp, { recursive: true, force: true }); }
