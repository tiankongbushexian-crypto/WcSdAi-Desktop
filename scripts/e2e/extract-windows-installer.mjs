import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { lstat, mkdir, realpath, rm } from "node:fs/promises";
import { join, resolve } from "node:path";
import { promisify } from "node:util";

const execute = promisify(execFile);
const requiredFiles = ["WcSdAi.exe", "resources/app.asar"];
const tar = process.platform === "darwin" ? "/usr/bin/tar" : process.platform === "win32"
  ? join(process.env.SystemRoot ?? "C:\\Windows", "System32", "tar.exe") : "tar";
const key = (name) => name.normalize("NFC").toLowerCase();

function lines(text) {
  return text.replace(/\r\n/g, "\n").replace(/\n$/, "").split("\n");
}

function inventory(names, details) {
  assert(names.length > 0 && names.length === details.length, "Archive listing must contain matching names and types");
  const entries = new Map();
  for (let index = 0; index < names.length; index += 1) {
    const original = names[index];
    const directory = original.endsWith("/");
    const name = directory ? original.slice(0, -1) : original;
    const parts = name.split("/");
    assert(name && !/[\\:\x00-\x1f\x7f]/.test(name) && parts.every((part) =>
      part && part !== "." && part !== ".." && !/[. ]$/.test(part) &&
      !/^(?:con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/i.test(part)),
    `Unsafe installer payload path: ${original}`);
    const identity = key(name);
    assert(!entries.has(identity), `Duplicate installer payload path: ${original}`);
    const detail = details[index];
    assert(detail.startsWith(directory ? "d" : "-") && detail.endsWith(` ${original}`) &&
      !/ (?:->|link to) /.test(detail), `Installer payload must contain only regular files/directories: ${original}`);
    entries.set(identity, { name, directory });
  }
  for (const { name } of entries.values()) {
    const parts = name.split("/");
    for (let end = 1; end < parts.length; end += 1) {
      const parent = entries.get(key(parts.slice(0, end).join("/")));
      assert(!parent || parent.directory, `Installer file is also a parent directory: ${name}`);
    }
  }
  for (const name of requiredFiles) {
    const entry = entries.get(key(name));
    assert(entry?.name === name && !entry.directory, `Installer is missing required regular file: ${name}`);
  }
  return [...entries.values()];
}

/** Extract the complete delivered NSIS payload without executing its installer.
 * The destination must be a nonexistent child of caller-owned scratch space.
 * libarchive reads the embedded payload; unsupported formats fail closed.
 */
export async function extractWindowsInstaller(installerPath, destination) {
  const installer = await realpath(installerPath);
  assert((await lstat(installer)).isFile(), "Installer must be a regular file");
  const directory = resolve(destination);
  try {
    await lstat(directory);
    throw new Error("Installer extraction destination must not already exist");
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
  const invoke = (args) => execute(tar, args, {
    timeout: 120_000, maxBuffer: 8 * 1024 * 1024, windowsHide: true,
    env: { ...process.env, LC_ALL: "C", LANG: "C" },
  });
  const tarVersion = (await invoke(["--version"])).stdout.trim();
  // Validate every entry before creating the destination or writing payloads.
  const names = lines((await invoke(["-tf", installer])).stdout);
  const details = lines((await invoke(["-tvf", installer])).stdout);
  const entries = inventory(names, details);
  await mkdir(directory, { mode: 0o700 });
  try {
    await invoke(["-xf", installer, "-C", directory, "--no-same-owner", "--no-same-permissions"]);
    for (const { name, directory: isDirectory } of entries) {
      const path = join(directory, ...name.split("/"));
      const info = await lstat(path);
      assert(!info.isSymbolicLink() && (isDirectory ? info.isDirectory() : info.isFile() && info.nlink === 1),
        `Invalid extracted payload entry: ${name}`);
    }
    for (const name of requiredFiles) {
      assert((await lstat(join(directory, name))).size > 0, `Empty required payload file: ${name}`);
    }
    return {
      directory,
      executablePath: join(directory, "WcSdAi.exe"),
      asarPath: join(directory, "resources", "app.asar"),
      entryCount: entries.length,
      tarPath: tar,
      tarVersion,
    };
  } catch (error) {
    await rm(directory, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 });
    throw error;
  }
}
