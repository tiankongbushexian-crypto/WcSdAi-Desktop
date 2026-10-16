import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { extractWindowsInstaller } from "./extract-windows-installer.mjs";

// Real tar input exercises the external archive boundary without mocked tools.
function archive(entries) {
  const blocks = [];
  for (const { name, type = "0", content = "fixture", link = "" } of entries) {
    const bytes = type === "0" ? Buffer.from(content) : Buffer.alloc(0);
    const header = Buffer.alloc(512);
    const put = (value, offset, length) => header.write(value, offset, length, "utf8");
    put(name, 0, 100);
    put("0000755\0", 100, 8);
    put("0000000\0", 108, 8);
    put("0000000\0", 116, 8);
    put(bytes.length.toString(8).padStart(11, "0") + "\0", 124, 12);
    put("00000000000\0", 136, 12);
    put("        ", 148, 8);
    put(type, 156, 1);
    put(link, 157, 100);
    put("ustar\0", 257, 6);
    put("00", 263, 2);
    const checksum = [...header].reduce((sum, byte) => sum + byte, 0);
    put(checksum.toString(8).padStart(6, "0") + "\0 ", 148, 8);
    blocks.push(header, bytes, Buffer.alloc((512 - bytes.length % 512) % 512));
  }
  return Buffer.concat([...blocks, Buffer.alloc(1024)]);
}

async function fixture(t, extra = [], required = true) {
  const root = await mkdtemp(join(tmpdir(), "wcsdai-extraction-test-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  const installer = join(root, "fixture.exe");
  const entries = [...(required ? [{ name: "WcSdAi.exe" }, { name: "resources/", type: "5" },
    { name: "resources/app.asar" }] : []), ...extra];
  await writeFile(installer, archive(entries));
  return { installer, destination: join(root, "payload"), entries };
}

test("extracts the complete payload including host, runtime, native libraries and DLLs", async (t) => {
  const extras = ["resources/bin/host.exe", "resources/agent-runtime/sidecar.js",
    "resources/app.asar.unpacked/native.node", "locales/en-US.pak", "ffmpeg.dll", "resources/file with spaces.txt"]
    .map((name) => ({ name, content: name }));
  const f = await fixture(t, extras);
  const result = await extractWindowsInstaller(f.installer, f.destination);
  assert.equal(result.directory, f.destination);
  assert.equal(result.executablePath, join(f.destination, "WcSdAi.exe"));
  assert.equal(result.asarPath, join(f.destination, "resources/app.asar"));
  assert.equal(result.entryCount, f.entries.length);
  assert.ok(result.tarPath.endsWith(process.platform === "win32" ? "tar.exe" : "tar"));
  assert.match(result.tarVersion, /tar/i);
  if (process.platform === "win32") assert.equal(result.tarPath, join(process.env.SystemRoot ?? "C:\\Windows", "System32", "tar.exe"));
  for (const entry of extras) assert.equal(await readFile(join(f.destination, entry.name), "utf8"), entry.content);
});

for (const name of ["/outside", "../outside", "resources/../outside", "resources//file", "C:/outside",
  "resources\\outside", "resources/app.asar:stream", "resources/trailing.", "resources/NUL.txt",
  "wcsdai.EXE", "resources/app.asar", "resources/app.asar/child"]) {
  test(`rejects unsafe or colliding payload path ${JSON.stringify(name)} before extraction`, async (t) => {
    const f = await fixture(t, [{ name }]);
    await assert.rejects(extractWindowsInstaller(f.installer, f.destination), /Unsafe|Duplicate|parent directory/);
    assert.equal(existsSync(f.destination), false);
  });
}

for (const type of ["1", "2", "6"]) {
  test(`rejects links and special entries (tar type ${type}) before extraction`, async (t) => {
    const f = await fixture(t, [{ name: "resources/unsafe", type, link: "WcSdAi.exe" }]);
    await assert.rejects(extractWindowsInstaller(f.installer, f.destination), /only regular files\/directories/);
    assert.equal(existsSync(f.destination), false);
  });
}

test("rejects an existing destination without changing caller-owned files", async (t) => {
  const f = await fixture(t);
  await mkdir(f.destination);
  const sentinel = join(f.destination, "keep");
  await writeFile(sentinel, "untouched");
  await assert.rejects(extractWindowsInstaller(f.installer, f.destination), /must not already exist/);
  assert.equal(await readFile(sentinel, "utf8"), "untouched");
});

test("rejects missing or empty required payload files", async (t) => {
  const missing = await fixture(t, [{ name: "WcSdAi.exe" }], false);
  await assert.rejects(extractWindowsInstaller(missing.installer, missing.destination), /missing required regular file/);
  assert.equal(existsSync(missing.destination), false);
  const empty = await fixture(t, [{ name: "WcSdAi.exe", content: "" }, { name: "resources/app.asar" }], false);
  await assert.rejects(extractWindowsInstaller(empty.installer, empty.destination), /Empty required payload/);
  assert.equal(existsSync(empty.destination), false, "failed extraction removes only its new directory");
});

test("an unsupported/corrupt installer cannot produce a successful payload", async (t) => {
  const f = await fixture(t);
  await writeFile(f.installer, "not an archive");
  await assert.rejects(extractWindowsInstaller(f.installer, f.destination));
  assert.equal(existsSync(f.destination), false);
});
