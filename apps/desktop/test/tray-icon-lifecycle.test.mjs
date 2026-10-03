import assert from "node:assert/strict";
import { EventEmitter } from "node:events";
import { copyFile, mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { createTrayIconController } from "../electron/main/tray-image.ts";

async function fixture(t, { platform = "win32", dark = false, packaged = true } = {}) {
  const resourceRoot = await mkdtemp(join(tmpdir(), "wcsdai-tray-icons-"));
  t.after(() => rm(resourceRoot, { recursive: true, force: true }));
  for (const name of ["tray-icon-win-light.ico", "tray-icon-win-dark.ico", "tray-icon-mac.png", "icon.png"]) {
    await copyFile(new URL(`../build/${name}`, import.meta.url), join(resourceRoot, name));
  }
  await copyFile(join(resourceRoot, "icon.png"), join(resourceRoot, "tray-icon.png"));
  // Only Electron's native objects are replaced. Production path selection,
  // image preparation, existence checks and lifecycle wiring run unchanged.
  const theme = Object.assign(new EventEmitter(), {
    shouldUseDarkColorsForSystemIntegratedUI: dark,
    shouldUseDarkColors: !dark,
  });
  const nativeTrays = [];
  const loadedPaths = [];
  const warnings = [];
  const source = {
    size: { width: 22, height: 22 }, template: false,
    isEmpty: () => false,
    setTemplateImage(value) { this.template = value; },
    resize(size) { return { ...this, size }; },
  };
  let rejectCreation = false;
  let rejectUpdate = false;
  const controller = createTrayIconController({
    platform, resourceRoot, packaged, nativeTheme: theme,
    loadImage(path) { loadedPaths.push(path); return source; },
    createNativeTray(image) {
      if (rejectCreation) throw new Error("native ICO loading rejected");
      const tray = {
        image, images: [image], destroyed: false,
        setImage(next) {
          if (rejectUpdate) throw new Error("native ICO update rejected");
          this.image = next;
          this.images.push(next);
        },
        isDestroyed() { return this.destroyed; },
        destroy() { assert.equal(this.destroyed, false); this.destroyed = true; },
      };
      nativeTrays.push(tray);
      return tray;
    },
    logger: { app(_category, _level, message) { warnings.push(message); } },
  });
  t.after(() => controller.dispose());
  return { controller, resourceRoot, theme, nativeTrays, loadedPaths, warnings, source,
    rejectCreation(value) { rejectCreation = value; },
    rejectUpdate(value) { rejectUpdate = value; },
  };
}

test("Windows tray launch follows the system taskbar theme, refreshes native ICOs and releases its listener on quit", async (t) => {
  const f = await fixture(t);
  const tray = f.controller.create();
  assert.equal(tray.image, join(f.resourceRoot, "tray-icon-win-light.ico"));
  assert.deepEqual(f.loadedPaths, [], "Windows receives an ICO path without flattening DPI representations");
  assert.equal(f.controller.create(), tray, "one resident tray survives repeated creation requests");
  assert.equal(f.nativeTrays.length, 1);
  assert.equal(f.theme.listenerCount("updated"), 1);

  f.theme.shouldUseDarkColors = true;
  f.theme.emit("updated");
  assert.equal(tray.images.length, 1, "an app-only appearance preference does not repaint the system tray");
  f.theme.shouldUseDarkColorsForSystemIntegratedUI = true;
  f.theme.emit("updated");
  assert.equal(tray.image, join(f.resourceRoot, "tray-icon-win-dark.ico"));
  f.theme.shouldUseDarkColorsForSystemIntegratedUI = false;
  f.theme.emit("updated");
  assert.equal(tray.image, join(f.resourceRoot, "tray-icon-win-light.ico"));

  f.controller.dispose();
  assert.equal(tray.destroyed, true);
  assert.equal(f.theme.listenerCount("updated"), 0);
  f.theme.shouldUseDarkColorsForSystemIntegratedUI = true;
  f.theme.emit("updated");
  assert.equal(tray.images.length, 3, "no late native update runs after disposal");
  f.controller.dispose();
  assert.equal(f.controller.create(), null, "a disposed lifecycle cannot recreate the tray");
});

test("Windows development and installed launches select white artwork on a dark system taskbar", async (t) => {
  for (const packaged of [false, true]) {
    const f = await fixture(t, { dark: true, packaged });
    assert.equal(f.controller.create().image, join(f.resourceRoot, "tray-icon-win-dark.ico"));
    assert.deepEqual(f.loadedPaths, []);
  }
});

test("a missing Windows tray image leaves startup usable and can be retried without a leaked listener", async (t) => {
  const f = await fixture(t);
  const path = join(f.resourceRoot, "tray-icon-win-light.ico");
  await rm(path);
  assert.equal(f.controller.create(), null);
  assert.equal(f.theme.listenerCount("updated"), 0);
  assert.deepEqual(f.warnings, ["tray icon missing"]);
  await copyFile(new URL("../build/tray-icon-win-light.ico", import.meta.url), path);
  assert.equal(f.controller.create().image, path);
  assert.equal(f.theme.listenerCount("updated"), 1);
});

test("a rejected native Windows image keeps the current icon and retries on the next system update", async (t) => {
  const f = await fixture(t);
  f.rejectCreation(true);
  assert.equal(f.controller.create(), null);
  assert.equal(f.theme.listenerCount("updated"), 0);
  f.rejectCreation(false);
  const tray = f.controller.create();
  f.rejectUpdate(true);
  f.theme.shouldUseDarkColorsForSystemIntegratedUI = true;
  f.theme.emit("updated");
  assert.equal(tray.image, join(f.resourceRoot, "tray-icon-win-light.ico"));
  f.rejectUpdate(false);
  f.theme.emit("updated");
  assert.equal(tray.image, join(f.resourceRoot, "tray-icon-win-dark.ico"));
  assert.deepEqual(f.warnings, ["tray icon could not be created", "tray icon update failed"]);
});

test("a missing alternate Windows theme image retains the resident tray until the resource becomes available", async (t) => {
  const f = await fixture(t);
  const tray = f.controller.create();
  const path = join(f.resourceRoot, "tray-icon-win-dark.ico");
  await rm(path);
  f.theme.shouldUseDarkColorsForSystemIntegratedUI = true;
  f.theme.emit("updated");
  assert.equal(tray.image, join(f.resourceRoot, "tray-icon-win-light.ico"));
  assert.equal(tray.destroyed, false);
  assert.deepEqual(f.warnings, ["tray icon missing"]);
  await copyFile(new URL("../build/tray-icon-win-dark.ico", import.meta.url), path);
  f.theme.emit("updated");
  assert.equal(tray.image, path);
});

test("macOS preserves its template and Linux preserves its existing 16px tray behavior", async (t) => {
  for (const platform of ["darwin", "linux"]) {
    for (const packaged of [false, true]) {
      const f = await fixture(t, { platform, packaged });
      const tray = f.controller.create();
      assert.equal(f.theme.listenerCount("updated"), 0);
      if (platform === "darwin") {
        assert.equal(tray.image, f.source);
        assert.equal(tray.image.template, true);
        assert.deepEqual(tray.image.size, { width: 22, height: 22 });
        assert.deepEqual(f.loadedPaths, [join(f.resourceRoot, "tray-icon-mac.png")]);
      } else {
        assert.deepEqual(tray.image.size, { width: 16, height: 16 });
        assert.equal(tray.image.template, false);
        assert.deepEqual(f.loadedPaths, [join(f.resourceRoot, packaged ? "tray-icon.png" : "icon.png")]);
      }
      f.controller.dispose();
      assert.equal(tray.destroyed, true);
    }
  }
});

test("an unreadable macOS PNG never creates an empty native tray", async (t) => {
  const f = await fixture(t, { platform: "darwin" });
  f.source.isEmpty = () => true;
  assert.equal(f.controller.create(), null);
  assert.equal(f.nativeTrays.length, 0);
  assert.deepEqual(f.warnings, ["tray icon could not be loaded"]);
});
