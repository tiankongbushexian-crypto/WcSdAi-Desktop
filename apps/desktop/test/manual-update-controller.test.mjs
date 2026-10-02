import assert from "node:assert/strict";
import { register, registerHooks } from "node:module";
import test from "node:test";

// Only Electron and its binary updater are external edges. The production
// controller, metadata parser, policy and reminder persistence run together.
const electron = `data:text/javascript,${encodeURIComponent(`
  export const app = { isPackaged: false, getAppPath: () => "/fixture" };
  export const shell = { opened: [], async openExternal(url) { this.opened.push(url); } };
`)}`;
const updater = `data:text/javascript,${encodeURIComponent(`
  import { EventEmitter } from "node:events";
  export class NsisUpdater extends EventEmitter {}
  export const autoUpdater = Object.assign(new EventEmitter(), {
    checks: 0, downloads: 0, installs: 0,
    async checkForUpdates() { this.checks++; this.emit("checking-for-update"); this.emit("update-not-available"); },
    async downloadUpdate() { this.downloads++; },
    quitAndInstall() { this.installs++; },
  });
  export default { NsisUpdater, autoUpdater };
`)}`;
registerHooks({ resolve(specifier, context, next) {
  if (specifier === "electron") return { url: electron, shortCircuit: true };
  if (specifier === "electron-updater") return { url: updater, shortCircuit: true };
  return next(specifier, context);
} });
register(new URL("./helpers/ts-import-hooks.mjs", import.meta.url));
const { AppUpdaterController, AUTO_CHECK_TIMEOUT_MS, MANUAL_CHECK_TIMEOUT_MS } = await import("../electron/main/updater.ts");
const { shell } = await import("electron");
const { autoUpdater } = await import("electron-updater");
const flush = () => new Promise(setImmediate);
const page = "https://github.com/tiankongbushexian-crypto/WcSdAi-Desktop/actions/runs/123/artifacts/456";
const manifest = {
  schemaVersion: 1, version: "1.0.2",
  notes: { en: "• New update reminders", "zh-CN": "• 新增版本提醒" },
  downloads: Object.fromEntries(["darwin-arm64", "darwin-x64", "win32-x64"].map((key) => [key, { url: page, expiresAt: "2099-01-01T00:00:00Z" }])),
};
const response = () => new Response(JSON.stringify(manifest));
function harness(t, options = {}) {
  const sent = [];
  const persisted = [];
  const logs = [];
  const controller = new AppUpdaterController({
    logger: { app: (...args) => logs.push(args) },
    send: (channel, state) => sent.push({ channel, ...state }),
    currentVersion: "1.0.1", platform: "darwin", arch: "arm64", isPackaged: true,
    distribution: "installed", fetchUpdateManifest: async () => response(),
    readUpdateSettings: async () => ({}),
    persistLastNotifiedVersion: async (version) => { persisted.push(version); },
    ...options,
  });
  t.after(() => controller.dispose());
  return { controller, sent, persisted, logs };
}

test("packaged team check shows the newer version and notes then opens its validated download page", async (t) => {
  let locale = "zh-CN";
  const { controller, sent, persisted } = harness(t, { getLocale: () => locale });
  assert.equal(controller.getState().mode, "manual");
  assert.equal(controller.getState().automaticSupported, false);
  assert.equal(controller.getState().defaultPreference, "manual");
  const state = await controller.check({ manual: true });
  assert.equal(state.status, "available");
  assert.equal(state.availableVersion, "1.0.2");
  assert.equal(state.releaseNotes, "• 新增版本提醒");
  assert.equal(state.manualReminder, true);
  assert.equal(state.manual, true);
  assert.deepEqual(sent.map((item) => item.status), ["checking", "available"]);
  assert.deepEqual(persisted, ["1.0.2"]);
  await controller.openReleases();
  assert.equal(shell.opened.at(-1), page);
  locale = "en";
  assert.equal(controller.refreshReleaseNotes().releaseNotes, "• New update reminders");
  controller.setPreference("automatic");
  assert.equal(controller.getState().mode, "manual");
  assert.equal(autoUpdater.autoDownload, false);
  assert.equal(autoUpdater.autoInstallOnAppQuit, false);
  await assert.rejects(controller.download(), /not supported/);
  assert.throws(() => controller.install(), /no downloaded update/);
  assert.equal(autoUpdater.checks, 0);
  assert.equal(autoUpdater.downloads, 0);
  assert.equal(autoUpdater.installs, 0);
});

for (const [platform, arch] of [["darwin", "x64"], ["win32", "x64"]]) {
  test(`${platform} ${arch} team installs stay manual even with an old automatic preference`, async (t) => {
    const { controller } = harness(t, { platform, arch, readUpdateSettings: async () => ({ updatePreference: "automatic" }) });
    const state = await controller.check();
    assert.equal(state.mode, "manual");
    assert.equal(state.status, "available");
    assert.equal(state.preference, "manual");
  });
}

test("scheduled checks start after 15 seconds, repeat every 6 hours, and stop at disposal", async (t) => {
  t.mock.timers.enable({ apis: ["setTimeout", "setInterval"] });
  let requests = 0;
  const { controller } = harness(t, { fetchUpdateManifest: async () => { requests++; return response(); } });
  controller.startAutoCheck();
  controller.startAutoCheck();
  await flush();
  t.mock.timers.tick(14_999);
  await flush();
  assert.equal(requests, 0);
  t.mock.timers.tick(1);
  await flush();
  assert.equal(requests, 1);
  assert.equal(controller.getState().status, "available");
  assert.equal(controller.getState().manual, false);
  t.mock.timers.tick(6 * 60 * 60 * 1000);
  await flush();
  assert.equal(requests, 2);
  controller.dispose();
  t.mock.timers.tick(6 * 60 * 60 * 1000);
  await flush();
  assert.equal(requests, 2);
});

test("repeat checks and a restored version marker do not reannounce or repersist a release", async (t) => {
  const first = harness(t);
  await first.controller.check();
  await first.controller.check();
  assert.deepEqual(first.persisted, ["1.0.2"]);
  const restarted = harness(t, { readUpdateSettings: async () => ({ lastNotifiedUpdateVersion: first.persisted[0] }) });
  assert.equal((await restarted.controller.check()).manualReminder, false);
  assert.equal(restarted.controller.getState().availableVersion, "1.0.2");
  assert.deepEqual(restarted.persisted, []);
});

test("current and newer installed versions are up to date without a reminder", async (t) => {
  for (const currentVersion of ["1.0.2", "1.0.3"]) {
    const { controller, persisted } = harness(t, { currentVersion });
    const state = await controller.check({ manual: true });
    assert.equal(state.status, "up-to-date");
    assert.equal(state.availableVersion, undefined);
    assert.equal(state.releaseNotes, undefined);
    assert.deepEqual(persisted, []);
  }
});

test("development and unsupported devices make no network requests", async (t) => {
  for (const options of [{ isPackaged: false }, { arch: "ia32" }, { platform: "freebsd" }]) {
    let requests = 0;
    const { controller } = harness(t, { ...options, fetchUpdateManifest: async () => { requests++; return response(); } });
    controller.startAutoCheck();
    assert.equal(controller.getState().mode, "disabled");
    await assert.rejects(controller.check({ manual: true }), /not configured/);
    assert.equal(requests, 0);
  }
});

test("automatic failures remain ambient and manual failures are observable", async (t) => {
  for (const fetchUpdateManifest of [
    async () => { throw new Error("offline fixture"); },
    async () => new Response("{invalid JSON"),
    async () => new Response(JSON.stringify({ ...manifest, downloads: { "darwin-arm64": { url: "https://evil.test/download" } } })),
  ]) {
    const { controller, logs, persisted } = harness(t, { fetchUpdateManifest });
    assert.equal((await controller.check()).status, "idle");
    assert.equal(controller.getState().manual, false);
    await assert.rejects(controller.check({ manual: true }));
    assert.equal(controller.getState().status, "error");
    assert.equal(controller.getState().manual, true);
    assert.equal(logs.length, 2);
    assert.deepEqual(persisted, []);
  }
});

test("an offline periodic check keeps a previously offered release available", async (t) => {
  let online = true;
  const { controller } = harness(t, { fetchUpdateManifest: async () => { if (!online) throw new Error("offline"); return response(); } });
  await controller.check();
  online = false;
  const state = await controller.check();
  assert.equal(state.status, "available");
  assert.equal(state.availableVersion, "1.0.2");
  assert.equal(state.releaseNotes, manifest.notes.en);
});

test("opening an expired discovered artifact fails without calling the external browser", async (t) => {
  t.mock.timers.enable({ apis: ["Date"], now: Date.parse("2098-12-31T23:59:59Z") });
  const { controller } = harness(t);
  await controller.check();
  const openedBefore = shell.opened.length;
  t.mock.timers.tick(1001);
  await assert.rejects(controller.openReleases(), /unavailable for this device/);
  assert.equal(shell.opened.length, openedBefore);
});

test("automatic and explicit check deadlines abort the request and let later checks recover", async (t) => {
  t.mock.timers.enable({ apis: ["setTimeout"] });
  let signal;
  let online = false;
  const { controller } = harness(t, { fetchUpdateManifest: async (_, options) => {
    signal = options.signal;
    return online ? response() : new Promise(() => {});
  } });
  const automatic = controller.check();
  await flush();
  t.mock.timers.tick(AUTO_CHECK_TIMEOUT_MS);
  assert.equal((await automatic).status, "idle");
  assert.equal(signal.aborted, true);
  const manual = controller.check({ manual: true });
  const rejected = assert.rejects(manual, /timed out/);
  await flush();
  t.mock.timers.tick(MANUAL_CHECK_TIMEOUT_MS);
  await rejected;
  assert.equal(controller.getState().status, "error");
  online = true;
  assert.equal((await controller.check()).status, "available");
});

test("concurrent checks reuse active discovery and disposed late responses cannot publish or persist", async (t) => {
  let finish;
  let signal;
  let requests = 0;
  const { controller, sent, persisted } = harness(t, { fetchUpdateManifest: async (_, options) => {
    signal = options.signal; requests++;
    return new Promise((resolve) => { finish = resolve; });
  } });
  const pending = controller.check();
  await flush();
  assert.equal((await controller.check()).status, "checking");
  assert.equal(requests, 1);
  controller.dispose();
  const count = sent.length;
  await pending;
  finish(response());
  await flush();
  assert.equal(signal.aborted, true);
  assert.equal(sent.length, count);
  assert.deepEqual(persisted, []);
  await controller.check();
  assert.equal(requests, 1);
  await assert.rejects(controller.openReleases(), /disposed/);
});

test("dispose while Host preferences load cannot start background work", async (t) => {
  let ready;
  let requests = 0;
  const { controller, sent } = harness(t, {
    readUpdateSettings: async () => new Promise((resolve) => { ready = resolve; }),
    fetchUpdateManifest: async () => { requests++; return response(); },
  });
  const pending = controller.check();
  controller.dispose();
  ready({});
  await pending;
  assert.equal(requests, 0);
  assert.deepEqual(sent, []);
});

test("an explicitly configured signed updater still uses its existing in-app lane", async (t) => {
  let requests = 0;
  const { controller } = harness(t, { updateFeedConfigured: true, fetchUpdateManifest: async () => { requests++; return response(); } });
  const state = await controller.check();
  assert.equal(state.mode, "in-app");
  assert.equal(state.status, "up-to-date");
  assert.equal(state.automaticSupported, true);
  assert.equal(autoUpdater.autoDownload, true);
  assert.equal(autoUpdater.autoInstallOnAppQuit, true);
  assert.equal(requests, 0);
  assert.equal(autoUpdater.checks, 1);
});
