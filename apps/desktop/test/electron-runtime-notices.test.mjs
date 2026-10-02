import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, rename, rm, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const root = fileURLToPath(new URL("../../../", import.meta.url));
const desktop = join(root, "apps/desktop");
const require = createRequire(import.meta.url);
const builderRequire = createRequire(require.resolve("electron-builder"));
const { resolveFunction } = builderRequire("app-builder-lib/out/util/resolve.js");
const config = JSON.parse(await readFile(join(desktop, "package.json"), "utf8")).build;
const sourceName = "LICENSES.chromium.html";
const packagedName = "Electron-LICENSES.chromium.html";

async function hooks() {
  const result = {};
  for (const name of ["afterExtract", "afterPack"]) {
    assert.equal(typeof config[name], "string", `${name} must be registered for every packaging lane`);
    // Keep a relative executor so the builder actually applies its workspace
    // boundary. Direct Windows builder launches may discover only this app.
    const executor = `.${sep}${relative(process.cwd(), resolve(desktop, config[name]))}`;
    result[name] = await resolveFunction("module", executor, name, desktop);
    assert.equal(typeof result[name], "function");
  }
  return result;
}

async function fixture(t, platform, notice = "<html>Target Electron runtime licenses</html>\n") {
  const appOutDir = await mkdtemp(join(tmpdir(), "wcsdai-runtime-notices-"));
  t.after(() => rm(appOutDir, { recursive: true, force: true }));
  const mac = platform === "darwin";
  const extractedResources = mac ? join(appOutDir, "Electron.app/Contents/Resources") : join(appOutDir, "resources");
  const finalResources = mac ? join(appOutDir, "WcSdAi.app/Contents/Resources") : extractedResources;
  await mkdir(extractedResources, { recursive: true });
  if (notice !== null) await writeFile(join(appOutDir, sourceName), notice);
  const context = {
    appOutDir,
    electronPlatformName: platform,
    packager: {
      info: { framework: { distMacOsAppName: "Electron.app" } },
      getResourcesDir: () => finalResources,
    },
  };
  async function finishPacking() {
    if (mac) {
      // electron-builder renames the runtime bundle and removes the original
      // root-level Chromium notice before invoking afterPack.
      await rename(join(appOutDir, "Electron.app"), join(appOutDir, "WcSdAi.app"));
      await rm(join(appOutDir, sourceName));
    }
  }
  return { context, notice, finalNotice: join(finalResources, "licenses", packagedName), finishPacking };
}

test("runtime notice hooks resolve within a desktop-only builder workspace", async () => {
  const resolved = await hooks();
  assert.notEqual(resolved.afterExtract, resolved.afterPack);
  assert.ok(!config.extraResources.some((resource) => resource.from?.includes("node_modules/electron/dist")));
});

for (const platform of ["darwin", "win32", "linux"]) {
  test(`${platform} packaging retains the extracted runtime notice without an installed Electron dist`, async (t) => {
    const { afterExtract, afterPack } = await hooks();
    const f = await fixture(t, platform);
    await afterExtract(f.context);
    await f.finishPacking();
    await afterPack(f.context);
    assert.equal(await readFile(f.finalNotice, "utf8"), f.notice);
  });
}

for (const [label, notice] of [["missing", null], ["empty", ""], ["whitespace-only", " \n\t"]]) {
  test(`${label} extracted Chromium notice fails before an installer can be built`, async (t) => {
    const { afterExtract } = await hooks();
    const f = await fixture(t, "darwin", notice);
    await assert.rejects(afterExtract(f.context), /Chromium notice/);
    await assert.rejects(readFile(f.finalNotice), { code: "ENOENT" });
  });
}

test("a directory cannot substitute for an extracted Chromium notice", async (t) => {
  const { afterExtract } = await hooks();
  const f = await fixture(t, "linux", null);
  await mkdir(join(f.context.appOutDir, sourceName));
  await assert.rejects(afterExtract(f.context), /Chromium notice/);
});

for (const platform of ["darwin", "win32", "linux"]) {
  test(`${platform} final package refuses a missing, empty or changed notice`, async (t) => {
    const { afterExtract, afterPack } = await hooks();
    for (const replacement of [null, "", "<html>Different runtime notice</html>"]) {
      const f = await fixture(t, platform);
      await afterExtract(f.context);
      await f.finishPacking();
      if (replacement === null) await rm(f.finalNotice);
      else await writeFile(f.finalNotice, replacement);
      await assert.rejects(afterPack(f.context), /Chromium notice/);
    }
  });
}

test("concurrent output directories preserve their own runtime notice and verification requires extraction", async (t) => {
  const { afterExtract, afterPack } = await hooks();
  const first = await fixture(t, "darwin", "Runtime A notice");
  const second = await fixture(t, "win32", "Runtime B notice");
  await assert.rejects(afterPack(first.context), /Chromium notice.*prepared/);
  await Promise.all([afterExtract(first.context), afterExtract(second.context)]);
  await Promise.all([first.finishPacking(), second.finishPacking()]);
  await Promise.all([afterPack(second.context), afterPack(first.context)]);
  assert.equal(await readFile(first.finalNotice, "utf8"), first.notice);
  assert.equal(await readFile(second.finalNotice, "utf8"), second.notice);
  await assert.rejects(afterPack(first.context), /Chromium notice.*prepared/);
});

test("repeated Windows packaging refreshes the notice and failed hooks cannot reuse an earlier digest", async (t) => {
  const { afterExtract, afterPack } = await hooks();
  const f = await fixture(t, "win32", "First runtime notice");
  await afterExtract(f.context);
  await writeFile(f.finalNotice, "Corrupt notice");
  await assert.rejects(afterPack(f.context), /Chromium notice.*differs/);
  await assert.rejects(afterPack(f.context), /Chromium notice.*prepared/);

  await writeFile(join(f.context.appOutDir, sourceName), "Second runtime notice");
  await afterExtract(f.context);
  await afterPack(f.context);
  assert.equal(await readFile(f.finalNotice, "utf8"), "Second runtime notice");

  await afterExtract(f.context);
  await writeFile(join(f.context.appOutDir, sourceName), "");
  await assert.rejects(afterExtract(f.context), /Chromium notice.*empty/);
  await assert.rejects(afterPack(f.context), /Chromium notice.*prepared/);
});
