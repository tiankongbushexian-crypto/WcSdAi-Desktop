#!/usr/bin/env node
/** Actual unpacked Windows app + real renderer/theme IPC + desktop-composited pixels.
 * Usage: node scripts/e2e-windows-packaged-corners.mjs [--executable <win-unpacked/WcSdAi.exe> | --backdrop-only]
 * No installed app, user profile, provider or credential is used.
 */
import assert from "node:assert/strict";
import { execFile, spawn } from "node:child_process";
import { createHash, randomUUID } from "node:crypto";
import { once } from "node:events";
import { createReadStream } from "node:fs";
import { mkdir, mkdtemp, realpath, rm, stat, writeFile } from "node:fs/promises";
import { release, tmpdir, version } from "node:os";
import { basename, dirname, join, resolve } from "node:path";
import { createInterface } from "node:readline";
import { setTimeout as delay } from "node:timers/promises";
import { promisify } from "node:util";
import { repositoryRoot, resolveElectronBinary } from "./e2e/boot.mjs";
import { launchLiveVoiceDesktop } from "./e2e/live-voice-desktop.mjs";
import { waitFor } from "./e2e/wait.mjs";
import { assertCompositedCorners, assertPhysicalRegionBounds } from "./e2e/window-corner-assertions.mjs";

const args = process.argv.slice(2);
const backdropOnly = args.length === 1 && args[0] === "--backdrop-only";
if (process.platform !== "win32" && !backdropOnly) {
  console.log("SKIP packaged Windows corners: requires a Windows desktop runner");
  process.exit(0);
}
const root = resolve(repositoryRoot());
assert(backdropOnly || args.length === 0 || (args.length === 2 && args[0] === "--executable"), "Supply --executable <unpacked WcSdAi.exe>, --backdrop-only or use the default release directory");
const executablePath = backdropOnly ? null : await realpath(resolve(args[1] || join(root, "apps/desktop/release/win-unpacked/WcSdAi.exe")));
const asarPath = executablePath ? join(dirname(executablePath), "resources/app.asar") : null;
if (executablePath) {
  assert.equal(basename(executablePath).toLowerCase(), "wcsdai.exe", "Use the unpacked product executable, not an installer");
  assert((await stat(asarPath)).isFile(), "An unpacked app.asar must accompany the executable");
}
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
  osRelease: release(), osVersion: version(),
  mode: backdropOnly ? "backdrop-preflight" : "packaged-app",
  executablePath, executableSha256: executablePath ? await hashFile(executablePath) : null,
  appAsarSha256: asarPath ? await hashFile(asarPath) : null,
  scratch, checks: [], stages: [], limitations: backdropOnly ? [
    "Only the disposable Electron backdrop and its loopback control are tested; no packaged app is launched.",
    "Successful color acknowledgements do not establish Windows native corner pixels.",
  ] : [
    "Runs the actual unpacked executable with isolated home, profile and host data; no model request is made.",
    "The app's normal boot may check its public update feed; this does not validate model services or installers.",
    "Desktop pixel capture requires an interactive Windows desktop; a locked/headless desktop fails the probe.",
  ],
};
let desktop, backdrop;
const stage = async (name) => {
  report.stage = name;
  report.stages.push({ name, timestamp: new Date().toISOString() });
  await writeFile(join(capturesRoot, "verification.json"), JSON.stringify(report, null, 2) + "\n");
};

async function launchBackdrop() {
  const token = randomUUID();
  const env = { ...process.env, WCSDAI_CORNER_BACKDROP_PROFILE: join(scratch, "backdrop-profile"), WCSDAI_CORNER_BACKDROP_TOKEN: token };
  delete env.ELECTRON_RUN_AS_NODE;
  delete env.NODE_OPTIONS;
  const child = spawn(resolveElectronBinary(root).electronBinary, [join(root, "scripts/e2e/windows-corners-backdrop.cjs")], {
    cwd: root, env, stdio: ["ignore", "pipe", "pipe"],
  });
  const lines = createInterface({ input: child.stdout });
  let ready, failure, stderr = "", stdout = "";
  child.once("error", (error) => { failure = error; });
  child.stderr.on("data", (bytes) => { stderr = (stderr + bytes).slice(-65536); });
  lines.on("line", (line) => {
    stdout = (stdout + line + "\n").slice(-65536);
    if (!line.startsWith("CORNER_BACKDROP ")) return;
    try {
      const message = JSON.parse(line.slice("CORNER_BACKDROP ".length));
      if (message.ready) ready = message;
    } catch { failure = new Error("Invalid backdrop response"); }
  });
  const alive = () => {
    if (failure) throw failure;
    assert(child.exitCode === null && child.signalCode === null,
      `Backdrop exited before readiness (code=${child.exitCode}, signal=${child.signalCode}); see backdrop-process.json`);
  };
  const command = async (body) => {
    alive();
    const response = await fetch(`http://127.0.0.1:${ready.port}/${token}`, {
      method: "POST", body: JSON.stringify(body), headers: { "Content-Type": "application/json" },
      signal: AbortSignal.timeout(15_000),
    });
    assert.equal(response.status, 200, "Backdrop command accepted");
    const result = await response.json();
    assert.equal(result.ok, true, "Backdrop command completed");
    return result;
  };
  const close = async () => {
    let closeError;
    try {
      if (child.exitCode === null && child.signalCode === null) {
        const exited = once(child, "exit");
        if (ready) {
          try { await command({ action: "quit" }); } catch (error) { closeError = error; }
        } else child.kill();
        await Promise.race([exited, delay(5_000)]);
        if (child.exitCode === null && child.signalCode === null) {
          if (process.platform === "win32") await exec("taskkill.exe", ["/PID", String(child.pid), "/T", "/F"], { timeout: 10_000, windowsHide: true });
          else child.kill("SIGKILL");
          await Promise.race([exited, delay(5_000)]);
        }
      }
    } finally {
      lines.close();
      await writeFile(join(capturesRoot, "backdrop-process.json"), JSON.stringify({
        pid: child.pid, exitCode: child.exitCode, signal: child.signalCode, ready: Boolean(ready),
        stdout: stdout.replaceAll(token, "[fixture-capability]"), stderr: stderr.replaceAll(token, "[fixture-capability]"),
      }, null, 2) + "\n");
    }
    assert(child.exitCode !== null || child.signalCode !== null, "Isolated backdrop exited");
    if (closeError) throw closeError;
  };
  try {
    await waitFor(() => { alive(); return ready; }, 20_000, "native backdrop ready");
    assert(Number.isInteger(ready.port) && ready.port > 0 && ready.port <= 65535, "Backdrop uses an ephemeral TCP port");
    const unauthorized = await fetch(`http://127.0.0.1:${ready.port}/unauthorized`, {
      method: "POST", body: "{}", signal: AbortSignal.timeout(5_000),
    });
    assert.equal(unauthorized.status, 404, "Backdrop rejects requests without the fixture capability");
    return { ...ready, close, front: () => command({ action: "front" }), color: async (color) => {
      assert.equal((await command({ action: "color", color })).color, color);
    } };
  } catch (error) { await close(); throw error; }
}

async function nativeProbe(handle, label) {
  const { stdout } = await exec("powershell.exe", ["-NoLogo", "-NoProfile", "-NonInteractive", "-File",
    join(root, "scripts/e2e/probe-window-region.ps1"), "-windowHandle", handle,
    "-outputImagePath", join(capturesRoot, `${label}.png`)], { timeout: 20_000, maxBuffer: 1024 * 1024, windowsHide: true });
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
  await stage("launch-backdrop");
  backdrop = await launchBackdrop();
  if (backdropOnly) {
    await backdrop.front();
    for (const [index, color] of ["#db2788", "#25c786"].entries()) {
      await backdrop.color(color);
      const result = process.platform === "win32" ? await nativeProbe(backdrop.handle, `backdrop-preflight-${index}`) : null;
      report.checks.push({ phase: "backdrop-preflight", color, acknowledged: true, nativePixels: result });
      if (result) assertCompositedCorners(result, backdrop.handle, rgb(color), "backdrop itself is visible and painted");
    }
  } else {
  const area = backdrop.workArea;
  assert(area.width >= 880 && area.height >= 640, "Runner desktop must fit the product's minimum window and exposed backdrop");
  report.fixtureWindowBounds = {
    x: area.x + 40, y: area.y + 40,
    width: Math.min(1000, area.width - 80), height: Math.min(720, area.height - 80),
  };
  // Use the production persisted-bounds format before startup. Do not resize
  // the live window: doing so could hide an initial show/shape regression.
  await writeFile(join(dataDir, "window-state.json"), JSON.stringify(report.fixtureWindowBounds) + "\n");
  await stage("launch-packaged-application");
  desktop = await launchLiveVoiceDesktop({ root, dataDir, profile, home, evidence: capturesRoot, syntheticMicrophone: false, executablePath });
  await desktop.send("Page.bringToFront");
  assert.equal(await desktop.evaluate("document.title"), "WcSdAi");
  await stage("read-application-version");
  const applicationVersion = await desktop.invoke("appGetVersion");
  assert.equal(applicationVersion.name, "WcSdAi");
  assert.match(applicationVersion.version, /^\d+\.\d+\.\d+(?:[-+].+)?$/);
  report.version = applicationVersion.version;
  report.initialWindowState = await desktop.invoke("windowControl", { action: "getState" });
  assert.equal(report.initialWindowState.maximized, false);
  const title = `WcSdAi isolated corners ${randomUUID()}`;
  await desktop.evaluate(`document.title = ${JSON.stringify(title)}`);
  const { stdout } = await exec("powershell.exe", ["-NoLogo", "-NoProfile", "-NonInteractive", "-File",
    join(root, "scripts/e2e/find-owned-window.ps1"), "-targetProcessId", String(desktop.pid), "-expectedTitle", title,
    "-backdropHandle", backdrop.handle], { timeout: 15_000, windowsHide: true });
  const { handle } = JSON.parse(stdout.trim());
  report.mainWindowHandle = handle;
  report.processId = desktop.pid;
  report.backdropWindowHandle = backdrop.handle;
  report.initialRenderer = await desktop.evaluate(`(() => {
    const root = document.documentElement;
    return { theme: root.dataset.theme, platform: root.dataset.platform,
      maximized: root.dataset.maximized, fullscreen: root.dataset.fullscreen,
      cssRadius: getComputedStyle(root).getPropertyValue('--ds-window-corner-radius').trim(),
      devicePixelRatio: devicePixelRatio, width: innerWidth, height: innerHeight };
  })()`);
  const captureCorners = async (phase, appearance) => {
    const captures = [];
    for (const [index, color] of ["#db2788", "#25c786"].entries()) {
      await backdrop.color(color);
      await desktop.send("Page.bringToFront");
      await desktop.evaluate("new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))");
      const result = await nativeProbe(handle, `${phase}-${index}`);
      captures.push({ color, result });
      report.checks.push({ phase, color, appearance, ...result });
      // Preserve the raw HRGN and desktop pixels even when an assertion fails.
      await writeFile(join(capturesRoot, "verification.json"), JSON.stringify(report, null, 2) + "\n");
      assertBackdropCorners(result, color);
    }
    assert(captures[0].result.samples.every((sample, index) =>
      sample.rgb.some((value, channel) => Math.abs(value - captures[1].result.samples[index].rgb[channel]) > 80)),
    `${phase}: corner pixels track changed backdrop, not opaque app pixels`);
  };
  // Capture before test-induced settings writes, reload, theme IPC or resize.
  await stage("capture-initial-corners");
  await captureCorners("initial", { source: "production-startup", ...report.initialRenderer });
  // Language is fixture state written through public IPC, never renderer internals.
  await stage("set-fixture-language");
  await desktop.invoke("settingsSet", { language: "en" });
  await stage("reload-renderer");
  await desktop.send("Page.reload");
  await stage("wait-reloaded-navigation");
  await waitFor(() => desktop.evaluate(`globalThis.document?.documentElement?.lang === 'en' && !!globalThis.document?.querySelector('[data-nav="settings"]') && !globalThis.document?.querySelector('.startup-splash')`), 35_000, "packaged renderer and host ready");
  await stage("open-settings-general");
  await desktop.clickSelector('[data-nav="settings"]');
  await desktop.clickText("General", ".settings-nav-label");
  for (const theme of ["light", "dark"]) {
    await stage(`choose-${theme}-theme`);
    await desktop.clickSelector(".settings-theme-trigger");
    await desktop.clickText(theme === "light" ? "Light" : "Dark", ".settings-theme-option-title");
    await waitFor(() => desktop.evaluate(`document.documentElement.dataset.theme === ${JSON.stringify(theme)}`), 10_000, `real ${theme} theme applied`);
    await stage(`wait-${theme}-theme-persistence`);
    await waitFor(async () => (await desktop.invoke("settingsGet")).theme === theme,
      10_000, `real ${theme} theme persisted`);
    // Repeat the same public renderer-to-main operation as an acknowledged barrier.
    // This includes setBackgroundColor after setShape, the production order under test.
    await stage(`acknowledge-${theme}-appearance`);
    const appearance = await desktop.invoke("windowSetBackgroundColor", { theme });
    assert.equal(appearance.applied, true);
    await stage(`capture-${theme}-corners`);
    await captureCorners(theme, appearance);
  }
  }
  await stage("completed");
  report.result = "PASS";
  console.log(backdropOnly ? "PASS isolated backdrop launch/color/quit preflight" : "PASS packaged Windows renderer/theme IPC/native region/desktop corner pixels");
} catch (error) {
  report.result = "FAIL";
  report.failedStage = report.stage;
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
