#!/usr/bin/env node
/** Actual unpacked Windows app + real renderer/theme IPC + desktop-composited pixels.
 * Usage: node scripts/e2e-windows-packaged-corners.mjs [--executable <win-unpacked/WcSdAi.exe>]
 * No installed app, user profile, provider or credential is used.
 */
import assert from "node:assert/strict";
import { execFile, spawn } from "node:child_process";
import { createHash, randomUUID } from "node:crypto";
import { once } from "node:events";
import { createReadStream } from "node:fs";
import { mkdir, mkdtemp, realpath, rm, stat, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, dirname, join, resolve } from "node:path";
import { createInterface } from "node:readline";
import { setTimeout as delay } from "node:timers/promises";
import { promisify } from "node:util";
import { repositoryRoot, resolveElectronBinary } from "./e2e/boot.mjs";
import { launchLiveVoiceDesktop } from "./e2e/live-voice-desktop.mjs";
import { waitFor } from "./e2e/wait.mjs";
import { assertCompositedCorners, assertPhysicalRegionBounds } from "./e2e/window-corner-assertions.mjs";

if (process.platform !== "win32") {
  console.log("SKIP packaged Windows corners: requires a Windows desktop runner");
  process.exit(0);
}
const root = resolve(repositoryRoot());
const args = process.argv.slice(2);
assert(args.length === 0 || (args.length === 2 && args[0] === "--executable"), "Supply --executable <unpacked WcSdAi.exe> or use the default release directory");
const executablePath = await realpath(resolve(args[1] || join(root, "apps/desktop/release/win-unpacked/WcSdAi.exe")));
assert.equal(basename(executablePath).toLowerCase(), "wcsdai.exe", "Use the unpacked product executable, not an installer");
const asarPath = join(dirname(executablePath), "resources/app.asar");
assert((await stat(asarPath)).isFile(), "An unpacked app.asar must accompany the executable");
const evidence = resolve(process.env.WCSDAI_EVIDENCE_DIR || join(root, ".artifacts/windows-corners-105/packaged-current"));
await mkdir(evidence, { recursive: true });
// Keep profiles and host databases outside the upload directory, even on failure.
const capturesRoot = await mkdtemp(join(evidence, "run-"));
const scratch = await mkdtemp(join(tmpdir(), "wcsdai-packaged-corners-"));
const dataDir = join(scratch, "data"), profile = join(scratch, "profile"), home = join(scratch, "home");
await Promise.all([dataDir, profile, home, join(scratch, "backdrop-profile")].map((path) => mkdir(path)));
const exec = promisify(execFile);
const hashFile = async (path) => {
  const hash = createHash("sha256");
  for await (const bytes of createReadStream(path)) hash.update(bytes);
  return hash.digest("hex");
};
const report = {
  timestamp: new Date().toISOString(), platform: process.platform, architecture: process.arch,
  executablePath, executableSha256: await hashFile(executablePath), appAsarSha256: await hashFile(asarPath),
  scratch, checks: [], limitations: [
    "Runs the actual unpacked executable with isolated home, profile and host data; no model request is made.",
    "The app's normal boot may check its public update feed; this does not validate model services or installers.",
    "Desktop pixel capture requires an interactive Windows desktop; a locked/headless desktop fails the probe.",
  ],
};
let desktop, backdrop;

async function launchBackdrop() {
  const env = { ...process.env, WCSDAI_CORNER_BACKDROP_PROFILE: join(scratch, "backdrop-profile") };
  delete env.ELECTRON_RUN_AS_NODE;
  delete env.NODE_OPTIONS;
  const child = spawn(resolveElectronBinary(root).electronBinary, [join(root, "scripts/e2e/windows-corners-backdrop.cjs")], {
    cwd: root, env, stdio: ["pipe", "pipe", "pipe"],
  });
  const lines = createInterface({ input: child.stdout });
  const replies = new Map();
  let ready, failure, sequence = 0;
  child.once("error", (error) => { failure = error; });
  child.stderr.resume();
  lines.on("line", (line) => {
    if (!line.startsWith("CORNER_BACKDROP ")) return;
    try {
      const message = JSON.parse(line.slice("CORNER_BACKDROP ".length));
      if (message.ready) ready = message;
      else replies.set(message.id, message);
    } catch { failure = new Error("Invalid backdrop response"); }
  });
  const alive = () => {
    if (failure) throw failure;
    assert(child.exitCode === null && child.signalCode === null, "Backdrop remains alive");
  };
  const close = async () => {
    if (child.exitCode === null && child.signalCode === null) {
      const exited = once(child, "exit");
      child.stdin.end(JSON.stringify({ action: "quit" }) + "\n");
      await Promise.race([exited, delay(5_000)]);
      if (child.exitCode === null && child.signalCode === null) {
        await exec("taskkill.exe", ["/PID", String(child.pid), "/T", "/F"], { timeout: 10_000 });
        await Promise.race([exited, delay(5_000)]);
      }
    }
    lines.close();
    assert(child.exitCode !== null || child.signalCode !== null, "Isolated backdrop exited");
  };
  try {
    await waitFor(() => { alive(); return ready; }, 20_000, "native backdrop ready");
    return { ...ready, close, color: async (color) => {
      const id = ++sequence;
      child.stdin.write(JSON.stringify({ action: "color", color, id }) + "\n");
      await waitFor(() => { alive(); return replies.has(id); }, 15_000, "backdrop color painted");
      assert.equal(replies.get(id).color, color); replies.delete(id);
    } };
  } catch (error) { await close(); throw error; }
}

async function nativeProbe(handle, label) {
  const { stdout } = await exec("powershell.exe", ["-NoLogo", "-NoProfile", "-NonInteractive", "-File",
    join(root, "scripts/e2e/probe-window-region.ps1"), "-windowHandle", handle,
    "-outputImagePath", join(capturesRoot, `${label}.png`)], { timeout: 20_000, maxBuffer: 1024 * 1024 });
  return JSON.parse(stdout.trim());
}
const rgb = (hex) => [1, 3, 5].map((offset) => Number.parseInt(hex.slice(offset, offset + 2), 16));
function assertBackdropCorners(result, expectedColor) {
  assert.equal(result.kind, 3, "Actual main HWND has a complex rounded region");
  assert.deepEqual(result.cornersExcluded, [true, true, true, true]);
  assert.equal(result.centerOwned, true);
  assertPhysicalRegionBounds(result, "packaged main window");
  assertCompositedCorners(result, backdrop.handle, rgb(expectedColor), "packaged main window");
}

try {
  backdrop = await launchBackdrop();
  desktop = await launchLiveVoiceDesktop({ root, dataDir, profile, home, evidence: capturesRoot, syntheticMicrophone: false, executablePath });
  await desktop.send("Page.bringToFront");
  // Language is fixture state written through public IPC, never renderer internals.
  await desktop.invoke("settingsSet", { language: "en" });
  await desktop.send("Page.reload");
  await waitFor(() => desktop.evaluate(`document.documentElement.lang === 'en' && !!document.querySelector('[data-nav="settings"]') && !document.querySelector('.startup-splash')`), 35_000, "packaged renderer and host ready");
  assert.equal(await desktop.evaluate("document.title"), "WcSdAi");
  report.version = await desktop.evaluate(`document.querySelector('.sidebar-version')?.textContent ?? null`);
  assert.equal((await desktop.invoke("windowControl", { action: "getState" })).maximized, false);
  const title = `WcSdAi isolated corners ${randomUUID()}`;
  await desktop.evaluate(`document.title = ${JSON.stringify(title)}`);
  const { stdout } = await exec("powershell.exe", ["-NoLogo", "-NoProfile", "-NonInteractive", "-File",
    join(root, "scripts/e2e/find-owned-window.ps1"), "-targetProcessId", String(desktop.pid), "-expectedTitle", title,
    "-backdropHandle", backdrop.handle], { timeout: 15_000 });
  const { handle } = JSON.parse(stdout.trim());
  report.mainWindowHandle = handle;
  report.processId = desktop.pid;
  report.backdropWindowHandle = backdrop.handle;
  await desktop.clickSelector('[data-nav="settings"]');
  await desktop.clickText("General", ".settings-nav-item");
  for (const theme of ["light", "dark"]) {
    await desktop.clickSelector(".settings-theme-trigger");
    await desktop.clickText(theme === "light" ? "Light" : "Dark", ".settings-theme-option");
    await waitFor(() => desktop.evaluate(`document.documentElement.dataset.theme === ${JSON.stringify(theme)}`), 10_000, `real ${theme} theme applied`);
    assert.equal((await desktop.invoke("settingsGet")).theme, theme);
    // Repeat the same public renderer-to-main operation as an acknowledged barrier.
    // This includes setBackgroundColor after setShape, the production order under test.
    const appearance = await desktop.invoke("windowSetBackgroundColor", { theme });
    assert.equal(appearance.applied, true);
    const captures = [];
    for (const [index, color] of ["#db2788", "#25c786"].entries()) {
      await backdrop.color(color);
      await desktop.send("Page.bringToFront");
      await desktop.evaluate("new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))");
      const result = await nativeProbe(handle, `${theme}-${index}`);
      captures.push({ color, result });
      // Persist even a failing sample: the screenshot + region pair is baseline evidence.
      report.checks.push({ theme, color, appearance, ...result });
      await writeFile(join(capturesRoot, "verification.json"), JSON.stringify(report, null, 2) + "\n");
      assertBackdropCorners(result, color);
    }
    assert(captures[0].result.samples.every((sample, index) =>
      sample.rgb.some((value, channel) => Math.abs(value - captures[1].result.samples[index].rgb[channel]) > 80)),
    `${theme}: corner pixels track changed backdrop, not opaque app pixels`);
  }
  report.result = "PASS";
  console.log("PASS packaged Windows renderer/theme IPC/native region/desktop corner pixels");
} catch (error) {
  report.result = "FAIL";
  report.error = error instanceof Error ? error.message : String(error);
  throw error;
} finally {
  let cleanupError;
  try {
    if (desktop) {
      await desktop.invoke("closeBehaviorSet", { behavior: "quit" }).catch(() => undefined);
      await desktop.invoke("windowControl", { action: "close" }).catch(() => undefined);
      await desktop.close();
    }
  } catch (error) { cleanupError = error; }
  try { await backdrop?.close(); } catch (error) { cleanupError ??= error; }
  if (!cleanupError) {
    try { await rm(scratch, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 }); }
    catch (error) { cleanupError = error; }
  }
  if (cleanupError) {
    report.result = "FAIL";
    report.cleanupError = cleanupError.message;
  }
  await writeFile(join(capturesRoot, "verification.json"), JSON.stringify(report, null, 2) + "\n");
  console.log(`Evidence: ${capturesRoot}`);
  if (cleanupError) throw cleanupError;
}
