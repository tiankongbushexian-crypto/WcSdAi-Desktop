import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

// A real macOS status item with isolated app state; no desktop runtime or provider.
assert.equal(process.platform, "darwin", "This native tray check requires macOS");
const execute = promisify(execFile);
const repository = fileURLToPath(new URL("../", import.meta.url));
const desktop = join(repository, "apps/desktop");
const require = createRequire(join(desktop, "package.json"));
const { build } = require("esbuild");
const electronPath = require("electron");
const scratch = await mkdtemp(join(tmpdir(), "wcsdai-macos-tray-"));
const output = join(repository, ".artifacts/wcsdai-icon-platforms");
const sourceFiles = [
  "scripts/e2e-macos-tray.mjs",
  "scripts/make-icon.py",
  "apps/desktop/electron/main/tray-image.ts",
  "apps/desktop/electron/main/bootstrap/app-lifecycle.ts",
  "apps/desktop/build/tray-icon-mac.png",
  "apps/desktop/build/tray-icon-mac@2x.png",
  "apps/desktop/package.json",
];
async function sourceHashes() {
  const hashes = {};
  for (const file of sourceFiles) {
    hashes[file] = createHash("sha256")
      .update(await readFile(join(repository, file))).digest("hex");
  }
  return hashes;
}

try {
  const sourceSha256 = await sourceHashes();
  const helper = join(scratch, "tray-image.cjs");
  await build({
    entryPoints: [join(desktop, "electron/main/tray-image.ts")],
    outfile: helper,
    bundle: true,
    platform: "node",
    format: "cjs",
    external: ["electron"],
    logLevel: "silent",
  });
  for (const directory of ["profile", "session", "logs", "crashes"]) {
    await mkdir(join(scratch, directory));
  }
  const runner = join(scratch, "run.cjs");
  await writeFile(runner, `
const assert = require("node:assert/strict");
const { app, nativeImage, Tray } = require("electron");
const { prepareTrayImage } = require(${JSON.stringify(helper)});
app.setPath("userData", ${JSON.stringify(join(scratch, "profile"))});
app.setPath("sessionData", ${JSON.stringify(join(scratch, "session"))});
app.setPath("crashDumps", ${JSON.stringify(join(scratch, "crashes"))});
app.setAppLogsPath(${JSON.stringify(join(scratch, "logs"))});
app.commandLine.appendSwitch("disable-background-networking");
let tray;

function inspectRepresentation(image, scaleFactor) {
  const size = image.getSize(scaleFactor);
  assert.deepEqual(size, { width: 22, height: 22 }, "every representation must retain the same logical size");
  const png = image.toPNG({ scaleFactor });
  const physicalSize = { width: png.readUInt32BE(16), height: png.readUInt32BE(20) };
  assert.deepEqual(physicalSize, { width: 22 * scaleFactor, height: 22 * scaleFactor });
  const { width, height } = physicalSize;
  const bitmap = image.toBitmap({ scaleFactor });
  assert.equal(bitmap.length, width * height * 4, "full-resolution bitmap must survive preparation");
  let left = width, top = height, right = -1, bottom = -1;
  let mass = 0, weightedX = 0, weightedY = 0;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const offset = (y * width + x) * 4;
      const alpha = bitmap[offset + 3];
      if (x === 0 || y === 0 || x === width - 1 || y === height - 1) {
        assert.equal(alpha, 0, "template must retain a transparent perimeter without a tile background");
      }
      if (alpha === 0) continue;
      assert.equal(bitmap[offset] | bitmap[offset + 1] | bitmap[offset + 2], 0,
        "every visible template pixel must be pure black");
      left = Math.min(left, x); top = Math.min(top, y);
      right = Math.max(right, x); bottom = Math.max(bottom, y);
      mass += alpha; weightedX += (x + 0.5) * alpha; weightedY += (y + 0.5) * alpha;
    }
  }
  assert.ok(mass > 0, "the actual status image must contain visible artwork");
  const alphaBounds = { x: left / scaleFactor, y: top / scaleFactor,
    width: (right - left + 1) / scaleFactor, height: (bottom - top + 1) / scaleFactor };
  const centroid = { x: weightedX / mass / scaleFactor, y: weightedY / mass / scaleFactor };
  assert.ok(alphaBounds.width >= 19 && alphaBounds.width <= 21,
    "the wide WcSdAi mark must retain its intended point width");
  assert.ok(alphaBounds.height >= 13 && alphaBounds.height <= 15,
    "the mark must fill the intended menu-bar height without oversizing");
  assert.ok(Math.abs(alphaBounds.x + alphaBounds.width / 2 - 11) <= 0.25, "artwork must be centered by painted bounds horizontally");
  assert.ok(Math.abs(alphaBounds.y + alphaBounds.height / 2 - 11) <= 0.25, "artwork must be centered by painted bounds vertically");
  return { scaleFactor, size, physicalSize, alphaBounds, centroid };
}

app.whenReady().then(async () => {
  app.dock?.hide();
  assert.equal(app.getPath("userData"), ${JSON.stringify(join(scratch, "profile"))});
  const source = nativeImage.createFromPath(${JSON.stringify(join(desktop, "build/tray-icon-mac.png"))});
  assert.equal(source.isEmpty(), false, "packaged template asset must load");
  assert.deepEqual(source.getScaleFactors().sort(), [1, 2], "Electron must discover the adjacent Retina asset");
  const before = [1, 2].map(scaleFactor => source.toBitmap({ scaleFactor }));
  const image = prepareTrayImage(source, "darwin");
  assert.equal(image.isTemplateImage(), true, "macOS must tint the silhouette as a native template");
  assert.deepEqual(image.getScaleFactors().sort(), [1, 2], "preparation must preserve both representations");
  assert.deepEqual(image.getSize(), { width: 22, height: 22 }, "native status image size uses logical points");
  for (const [index, scaleFactor] of [1, 2].entries()) {
    assert.deepEqual(image.toBitmap({ scaleFactor }), before[index], "preparation must not resample or distort the mark");
  }
  const representations = [1, 2].map(scaleFactor => inspectRepresentation(image, scaleFactor));
  for (const axis of ["x", "y"]) {
    assert.ok(Math.abs(representations[0].centroid[axis] - representations[1].centroid[axis]) <= 0.1,
      "standard and Retina displays must retain the same optical position");
  }
  tray = new Tray(image);
  assert.equal(tray.isDestroyed(), false, "native status item must be alive");
  const deadline = Date.now() + 5000;
  let bounds;
  do {
    bounds = tray.getBounds();
    if (bounds.width > 0 && bounds.height > 0) break;
    assert.ok(Date.now() < deadline, "native status item bounds were not allocated");
    await new Promise(resolve => setImmediate(resolve));
  } while (true);
  for (const value of Object.values(bounds)) assert.ok(Number.isFinite(value));
  assert.ok(bounds.width >= 22 && bounds.width <= 50, "status item must retain its point-sized width");
  assert.ok(bounds.height >= 22 && bounds.height <= 50, "status item must fit a native macOS menu bar");
  tray.destroy();
  assert.equal(tray.isDestroyed(), true, "native status item must be disposed");
  console.log(JSON.stringify({ result: "passed", electron: process.versions.electron,
    platform: process.platform, arch: process.arch, template: image.isTemplateImage(),
    logicalSize: image.getSize(), representations, trayBounds: bounds, trayDestroyed: true,
    isolatedProfile: true, productionDesktopStarted: false }));
  app.quit();
}).catch(error => {
  if (tray && !tray.isDestroyed()) tray.destroy();
  console.error(error);
  app.exit(1);
});
`);
  const env = { ...process.env };
  delete env.ELECTRON_RUN_AS_NODE;
  const { stdout, stderr } = await execute(electronPath, [runner], {
    env, timeout: 30_000, maxBuffer: 1024 * 1024,
  });
  const result = JSON.parse(stdout.trim().split("\n").at(-1));
  assert.equal(result.result, "passed");
  assert.deepEqual(await sourceHashes(), sourceSha256, "sources changed while the native check was running");
  result.timestamp = new Date().toISOString();
  result.commit = (await execute("git", ["rev-parse", "HEAD"], { cwd: repository })).stdout.trim();
  result.baseMain = (await execute("git", ["rev-parse", "origin/main"], { cwd: repository })).stdout.trim();
  result.sourceSha256 = sourceSha256;
  result.stderr = stderr.trim();
  await mkdir(output, { recursive: true });
  await writeFile(join(output, "native-tray.json"), JSON.stringify(result, null, 2) + "\n");
  console.log(JSON.stringify(result, null, 2));
} finally {
  await rm(scratch, { recursive: true, force: true });
}
