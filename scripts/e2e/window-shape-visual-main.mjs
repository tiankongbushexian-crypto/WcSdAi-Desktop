import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import { version as osVersion } from "node:os";
import { promisify } from "node:util";
import { app, BrowserWindow, screen } from "electron";
import { installWindowShape, roundedWindowShape, setWindowCornerRadius } from "../../apps/desktop/electron/main/window-shape.ts";
import { setWindowFullScreen } from "../../apps/desktop/electron/main/window-fullscreen.ts";
import { assertCompositedCorners, assertPhysicalRegionBounds } from "./window-corner-assertions.mjs";

const [profile, evidence, probePath, baselineMode, runId] = process.argv.slice(2);
const cssOnly = baselineMode === "css-only";
const transparentComparison = baselineMode === "transparent";
app.setPath("userData", profile);
// The runner owns termination. Destroying the final fixture window must not
// quit with code 0 before a failed assertion has written its async receipt.
app.on("window-all-closed", () => {});
const exec = promisify(execFile);
const reports = [];
const environment = { platform: process.platform, systemVersion: process.getSystemVersion(), osVersion: osVersion(), electron: process.versions.electron, variant: baselineMode };
const handleOf = (window) => window.getNativeWindowHandle().readBigUInt64LE().toString();
const waitFor = async (condition, label) => {
  const deadline = Date.now() + 5000;
  while (!condition()) {
    if (Date.now() > deadline) throw new Error(`Timed out: ${label}`);
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
};

async function run() {
  await app.whenReady();
  const area = screen.getPrimaryDisplay().workArea;
  const width = Math.min(900, area.width - 100);
  const height = Math.min(650, area.height - 100);
  assert.ok(width >= 500 && height >= 400, "native visual fixture needs an interactive desktop");
  const safeWebPreferences = { sandbox: true, contextIsolation: true, nodeIntegration: false };
  const backdrop = new BrowserWindow({ ...area, show: false, frame: false,
    thickFrame: false, backgroundColor: "#db2788", webPreferences: safeWebPreferences });
  const window = new BrowserWindow({ show: false, width, height,
    x: area.x + 50, y: area.y + 50, minWidth: 400, minHeight: 300,
    frame: false, thickFrame: false, resizable: true, backgroundColor: "#ffffff",
    ...(transparentComparison ? { transparent: true } : {}),
    webPreferences: safeWebPreferences });
  // This flag is a deliberate broken fixture, never a production app option.
  if (!cssOnly) installWindowShape(window);
  const handle = handleOf(window);
  const backdropHandle = handleOf(backdrop);
  let backdropRgb = [219, 39, 136];
  async function readNativeWindow(targetHandle, filename) {
    const { stdout } = await exec("powershell.exe", ["-NoLogo", "-NoProfile", "-NonInteractive", "-File",
      probePath, "-windowHandle", targetHandle, "-outputImagePath", join(evidence, `${filename}.png`)],
    { timeout: 15000, windowsHide: true });
    return JSON.parse(stdout.trim());
  }
  async function probe(label, rounded, minimumInset = 1) {
    const filename = label.replace(/[^a-z0-9]+/gi, "-").toLowerCase();
    const result = await readNativeWindow(handle, filename);
    reports.push({ label, foregroundHandle: handle, backdropHandle, backdropRgb, logicalBounds: window.getBounds(), ...result });
    await writeFile(join(evidence, "native-visual-report.json"), JSON.stringify({ status: "RUNNING", cssOnly, runId, environment, reports }, null, 2));
    if (rounded) {
      // Pixel assertions run first so --baseline-css-only proves they reject a
      // rounded CSS outline that still paints opaque native corner pixels.
      assertCompositedCorners(result, backdropHandle, backdropRgb, label);
      assert.equal(result.kind, 3, `${label}: complex rounded native region`);
      assert.deepEqual(result.cornersExcluded, [true, true, true, true], `${label}: all four corners cut out`);
      assert.equal(result.centerOwned, true, `${label}: window center remains hit-testable`);
      assert.ok(result.topInset >= minimumInset, `${label}: visible corner inset`);
      assertPhysicalRegionBounds(result, label);
    } else {
      assert.ok(result.kind === 0 || (result.kind === 2 && result.cornersExcluded.every((value) => !value)), `${label}: rectangular region`);
    }
  }
  async function paintTheme(color) {
    // Follow production window/background IPC ordering with an unchanged radius.
    if (!cssOnly) setWindowCornerRadius(window, 12);
    window.setBackgroundColor(color);
    await window.webContents.executeJavaScript(`document.documentElement.style.setProperty('--background', ${JSON.stringify(color)}); new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))`);
  }
  try {
    await backdrop.loadURL("data:text/html," + encodeURIComponent("<style>html,body{margin:0;width:100%;height:100%;background:#db2788}</style>"));
    backdrop.show();
    await window.loadURL("data:text/html," + encodeURIComponent(`<!doctype html><style>
      :root{--background:#fff}*{box-sizing:border-box}html,body{margin:0;width:100%;height:100%;background:var(--background)}
      body{display:grid;grid-template-columns:28% 1fr;font:16px system-ui}aside{background:#f1f1f1;padding:24px}
      main{display:grid;grid-template-rows:60px 1fr 120px}header,footer{padding:24px}article{display:grid;place-items:center}
      body:after{content:'';position:fixed;inset:0;border:1px solid #888;border-radius:12px;pointer-events:none}
      footer div{height:80px;border-radius:20px;background:#f5f5f5;box-shadow:0 2px 20px #0002}
      </style><aside>WcSdAi<br>Projects<br>Sessions</aside><main><header>New task</header><article>Rendered native corner fixture</article><footer><div></div></footer></main>`));
    window.setMinimumSize(400, 300);
    window.show();
    window.focus();
    if (baselineMode === "reapply-after-show") {
      const visibleBounds = window.getBounds();
      window.setShape(roundedWindowShape(visibleBounds.width, visibleBounds.height, 12));
    }
    await paintTheme("#ffffff");
    if (baselineMode === "reapply-after-background") {
      const visibleBounds = window.getBounds();
      window.setShape(roundedWindowShape(visibleBounds.width, visibleBounds.height, 12));
    }
    // Its outer corners are outside the smaller foreground window. Confirm the
    // actual desktop contains the intended backdrop before judging any cutout.
    const backdropControl = await readNativeWindow(backdropHandle, "backdrop-control");
    const backdropDomColors = await backdrop.webContents.executeJavaScript("({html: getComputedStyle(document.documentElement).backgroundColor, body: getComputedStyle(document.body).backgroundColor})");
    reports.push({ label: "backdrop control", backdropHandle, backdropRgb, nativeBackground: backdrop.getBackgroundColor(), domColors: backdropDomColors, logicalBounds: backdrop.getBounds(), ...backdropControl });
    assertCompositedCorners(backdropControl, backdropHandle, backdropRgb, "backdrop control");
    await probe("default 12 DIP corners", true, 7);
    backdropRgb = [37, 199, 134];
    backdrop.setBackgroundColor("#25c786");
    await backdrop.webContents.executeJavaScript("document.documentElement.style.background = '#25c786'; document.body.style.background = '#25c786'");
    await probe("corners reveal changed backdrop", true, 7);
    await paintTheme("#181818");
    await probe("dark theme keeps real corners", true, 7);
    window.blur();
    await waitFor(() => !window.isFocused(), "window blur");
    await probe("inactive real corners", true, 7);
    window.focus();
    window.minimize();
    await waitFor(() => window.isMinimized(), "native minimize");
    window.restore();
    window.focus();
    await waitFor(() => !window.isMinimized() && window.isVisible(), "native restore");
    await probe("minimize restore real corners", true, 7);
    window.setSize(width - 60, height - 50);
    await probe("resized corners", true, 7);
    window.maximize();
    await waitFor(() => window.isMaximized(), "native maximize");
    await probe("maximized rectangle", false);
    window.unmaximize();
    await waitFor(() => !window.isMaximized(), "native unmaximize");
    await probe("restored rounded corners", true, 7);
    setWindowFullScreen(window, true, true);
    await probe("fullscreen rectangle", false);
    setWindowFullScreen(window, false, true);
    await probe("exit fullscreen restores corners", true, 7);
    assert.equal(setWindowCornerRadius(window, 0), 0);
    await probe("explicit plugin square corners", false);
    assert.equal(setWindowCornerRadius(window, 24), 24);
    await probe("explicit plugin maximum corners", true, 15);
    window.destroy();
    assert.equal(setWindowCornerRadius(window, 12), null);
    const result = { status: "PASS", cssOnly, runId, environment, reports };
    await writeFile(join(evidence, "native-visual-report.json"), JSON.stringify(result, null, 2));
    console.log("NATIVE_WINDOW_REGION " + JSON.stringify(result));
  } finally {
    if (!window.isDestroyed()) window.destroy();
    backdrop.destroy();
  }
}

run().then(() => app.exit(0), async (error) => {
  await writeFile(join(evidence, "native-visual-report.json"), JSON.stringify({ status: "FAIL", cssOnly, runId, environment, error: String(error), reports }, null, 2));
  console.error(error);
  app.exit(1);
});
