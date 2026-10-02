import assert from "node:assert/strict";
import { register } from "node:module";
import { readFile } from "node:fs/promises";
import test from "node:test";

register(new URL("./helpers/ts-import-hooks.mjs", import.meta.url));
const {
  isNewerStableVersion,
  parseManualUpdateDownloadUrl,
  parseManualUpdateManifest,
  ManualUpdateFeed,
  MANUAL_UPDATE_FEED_URL,
  MANUAL_UPDATE_DOWNLOADS_URL,
  MAX_UPDATE_MANIFEST_BYTES,
} = await import("../electron/main/manual-update-feed.ts");

const page = "https://github.com/tiankongbushexian-crypto/WcSdAi-Desktop/actions/runs/123/artifacts/456";
function manifest(patch = {}) {
  return {
    schemaVersion: 1, version: "1.0.2",
    notes: { en: "• New update reminders", "zh-CN": "• 新增版本提醒" },
    downloads: { "darwin-arm64": { url: page, expiresAt: "2099-01-01T00:00:00.000Z" } },
    ...patch,
  };
}
const response = (value) => new Response(JSON.stringify(value));

test("the checked-in public manifest parses and the default download workflow exists", async () => {
  const stored = JSON.parse(await readFile(new URL("../../../updates/stable.json", import.meta.url), "utf8"));
  const parsed = parseManualUpdateManifest(stored);
  assert.ok(parsed.downloads["darwin-arm64"]);
  assert.ok(parsed.downloads["darwin-x64"]);
  assert.ok(parsed.downloads["win32-x64"]);
  const workflow = new URL(MANUAL_UPDATE_DOWNLOADS_URL).pathname.split("/").at(-1);
  assert.match(await readFile(new URL(`../../../.github/workflows/${workflow}`, import.meta.url), "utf8"), /workflow_dispatch:/);
});

test("version comparison orders numeric cores and only graduates installed prereleases to stable", () => {
  for (const [available, installed, expected] of [
    ["1.0.2", "1.0.1", true], ["1.0.10", "1.0.9", true],
    ["1.0.2", "1.0.2", false], ["1.0.1", "1.0.2", false],
    ["1.0.2", "1.0.2-rc.1", true], ["1.0.2", "1.0.2+team.1", false],
    ["1.0.2", "2.0.0-rc.1", false], ["2.0.0", "1.99.99", true],
  ]) assert.equal(isNewerStableVersion(available, installed), expected);
  for (const version of ["1.0", "v1.0.2", "01.0.2", "1.0.2-rc.1", "1.0.2+build", "9007199254740992.0.0"]) {
    assert.throws(() => isNewerStableVersion(version, "1.0.1"), /invalid update version/);
  }
  assert.throws(() => isNewerStableVersion("1.0.2", "1.0.2-01"), /invalid update version/);
});

test("download pages stay on this repository without executable URLs or URL normalization tricks", () => {
  const base = "https://github.com/tiankongbushexian-crypto/WcSdAi-Desktop";
  for (const path of ["/releases", "/releases/latest", "/releases/tag/v1.0.2", "/actions/runs/123", "/actions/runs/123/artifacts/456"]) {
    assert.equal(parseManualUpdateDownloadUrl(base + path), base + path);
  }
  for (const url of [
    page.replace("https:", "http:"), page.replace("github.com", "github.com.evil.test"),
    page.replace("github.com", "evil.test@github.com"), `${page}?redirect=evil`, `${page}#fragment`,
    page.replace("/123/", "/../123/"), page.replace("/123/", "/%31%32%33/"),
    page.replace("WcSdAi-Desktop", "PI-Desktop"), page.replace("github.com", "github.com:443"),
    `${base}/releases/download/v1.0.2/malware.exe`, `${base}/issues/1`, ` ${page}`,
    `file://${page}`, "javascript:alert(1)", `${base}/actions/runs/0`,
  ]) assert.equal(parseManualUpdateDownloadUrl(url), null, url);
});

test("manifest schema validates target keys, bilingual notes, stable version and Actions expiry", () => {
  assert.equal(parseManualUpdateManifest(manifest()).version, "1.0.2");
  const invalid = [
    null, [], manifest({ schemaVersion: 2 }), manifest({ version: "1.0.2-beta" }),
    manifest({ notes: { en: "present" } }), manifest({ notes: { en: " ", "zh-CN": "有" } }),
    manifest({ notes: { en: "a".repeat(8193), "zh-CN": "有" } }),
    manifest({ notes: { en: "\u0000", "zh-CN": "有" } }), manifest({ downloads: {} }),
    manifest({ downloads: { "darwin-mips": { url: page } } }),
    manifest({ downloads: { "darwin-arm64": { url: page } } }),
    manifest({ downloads: { "darwin-arm64": { url: page, expiresAt: "tomorrow" } } }),
    manifest({ downloads: { "darwin-arm64": { url: page, expiresAt: "2099-02-30T00:00:00Z" } } }),
  ];
  for (const value of invalid) assert.throws(() => parseManualUpdateManifest(value));
});

test("feed requests only fixed metadata without credentials and selects localized notes", async () => {
  const feed = new ManualUpdateFeed(async (url, options) => {
    assert.equal(url, MANUAL_UPDATE_FEED_URL);
    assert.equal(options.redirect, "error");
    assert.equal(options.credentials, "omit");
    assert.equal(options.cache, "no-store");
    assert.deepEqual(options.headers, { Accept: "application/json" });
    return response(manifest());
  });
  assert.deepEqual(await feed.check("1.0.1", "darwin", "arm64", 1000), { version: "1.0.2", available: true, downloadUrl: page });
  assert.equal(feed.notesFor("1.0.2", "zh-CN"), "• 新增版本提醒");
  assert.equal(feed.notesFor("1.0.2", "fr"), "• New update reminders");
  assert.equal(feed.notesFor("1.0.1", "en"), undefined);
  assert.equal(feed.downloadUrlFor("1.0.2", "darwin", "arm64"), page);
});

test("same and older releases produce no offer even when their old downloads expired", async () => {
  const feed = new ManualUpdateFeed(async () => response(manifest({
    downloads: { "darwin-arm64": { url: page, expiresAt: "2000-01-01T00:00:00Z" } },
  })));
  for (const current of ["1.0.2", "1.0.3"]) assert.equal((await feed.check(current, "darwin", "arm64", 1000)).available, false);
  await assert.rejects(feed.check("1.0.1", "darwin", "arm64", 1000), /unavailable for this device/);
});

test("a newer version cannot offer an absent architecture or an expired Actions download", async (t) => {
  t.mock.timers.enable({ apis: ["Date"], now: Date.parse("2098-12-31T23:59:59Z") });
  const feed = new ManualUpdateFeed(async () => response(manifest()));
  await assert.rejects(feed.check("1.0.1", "win32", "x64", 1000), /unavailable for this device/);
  await feed.check("1.0.1", "darwin", "arm64", 1000);
  t.mock.timers.tick(1001);
  assert.throws(() => feed.downloadUrlFor("1.0.2", "darwin", "arm64"), /unavailable for this device/);
});

test("feed rejects malformed, redirected, failed and oversized responses", async () => {
  for (const factory of [
    () => new Response("not JSON"), () => new Response("{}"), () => new Response("", { status: 404 }),
    () => new Response("{}", { headers: { "content-length": String(MAX_UPDATE_MANIFEST_BYTES + 1) } }),
    () => new Response(" ".repeat(MAX_UPDATE_MANIFEST_BYTES + 1)),
    () => Object.defineProperty(response(manifest()), "redirected", { value: true }),
  ]) {
    const feed = new ManualUpdateFeed(async () => factory());
    await assert.rejects(feed.check("1.0.1", "darwin", "arm64", 1000));
  }
});

test("timeout aborts the network and bounds even an uncooperative transport", async (t) => {
  t.mock.timers.enable({ apis: ["setTimeout"] });
  let signal;
  const feed = new ManualUpdateFeed(async (_, options) => { signal = options.signal; return new Promise(() => {}); });
  const pending = feed.check("1.0.1", "darwin", "arm64", 1000);
  const rejected = assert.rejects(pending, /timed out/);
  t.mock.timers.tick(1000);
  await rejected;
  assert.equal(signal.aborted, true);
  feed.dispose();
});

test("a stalled response body is cancelled at the check deadline", async (t) => {
  t.mock.timers.enable({ apis: ["setTimeout"] });
  let cancelled = false;
  const feed = new ManualUpdateFeed(async () => new Response(new ReadableStream({
    start(controller) { controller.enqueue(new TextEncoder().encode('{"version":')); },
    cancel() { cancelled = true; },
  })));
  const pending = feed.check("1.0.1", "darwin", "arm64", 1000);
  const rejected = assert.rejects(pending, /timed out/);
  await new Promise(setImmediate);
  t.mock.timers.tick(1000);
  await rejected;
  await new Promise(setImmediate);
  assert.equal(cancelled, true);
  assert.equal(feed.notesFor("1.0.2", "en"), undefined);
});

test("dispose cancels a pending check, suppresses late metadata and rejects subsequent work", async () => {
  let finish;
  let signal;
  const feed = new ManualUpdateFeed(async (_, options) => { signal = options.signal; return new Promise((resolve) => { finish = resolve; }); });
  const pending = feed.check("1.0.1", "darwin", "arm64", 1000);
  const rejected = assert.rejects(pending, /disposed/);
  feed.dispose();
  await rejected;
  assert.equal(signal.aborted, true);
  finish(response(manifest()));
  await new Promise(setImmediate);
  assert.equal(feed.notesFor("1.0.2", "en"), undefined);
  await assert.rejects(feed.check("1.0.1", "darwin", "arm64", 1000), /disposed/);
});
