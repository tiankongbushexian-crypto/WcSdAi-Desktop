import { createHash } from "node:crypto";
import { lstat, mkdir, readFile, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";

// Both hooks run in the same builder process. Keep each architecture/output's
// digest separate, and consume it even when final verification fails.
const preparedDigests = new Map();
const noticeName = "Electron-LICENSES.chromium.html";
const digest = (bytes) => createHash("sha256").update(bytes).digest("hex");

async function readNotice(path) {
  const stat = await lstat(path).catch((error) => {
    throw new Error(`Required Chromium notice cannot be read: ${path}`, { cause: error });
  });
  if (!stat.isFile()) throw new Error(`Required Chromium notice is not a regular file: ${path}`);
  const bytes = await readFile(path);
  if (!bytes.toString("utf8").trim()) throw new Error(`Required Chromium notice is empty: ${path}`);
  return bytes;
}

export async function afterExtract(context) {
  const key = resolve(context.appOutDir);
  preparedDigests.delete(key);
  // Use the target runtime downloaded by electron-builder, not a possibly
  // absent or differently targeted node_modules/electron/dist installation.
  const bytes = await readNotice(join(context.appOutDir, "LICENSES.chromium.html"));
  const platform = context.electronPlatformName;
  let resources;
  if (platform === "darwin" || platform === "mas") {
    resources = join(context.appOutDir, context.packager.info.framework.distMacOsAppName, "Contents", "Resources");
  } else if (platform === "win32" || platform === "linux") {
    resources = join(context.appOutDir, "resources");
  } else {
    throw new Error(`Unsupported Electron platform for Chromium notices: ${platform}`);
  }
  const directory = join(resources, "licenses");
  await mkdir(directory, { recursive: true });
  // On macOS this must precede createMacApp: it deletes the root notice and
  // renames Electron.app, carrying the preserved resource into WcSdAi.app.
  await writeFile(join(directory, noticeName), bytes);
  preparedDigests.set(key, digest(bytes));
}

export async function afterPack(context) {
  const key = resolve(context.appOutDir);
  const expected = preparedDigests.get(key);
  preparedDigests.delete(key);
  if (!expected) throw new Error("Required Chromium notice was not prepared from this extracted runtime");
  const path = join(context.packager.getResourcesDir(context.appOutDir), "licenses", noticeName);
  const actual = digest(await readNotice(path));
  if (actual !== expected) throw new Error(`Packaged Chromium notice differs from the extracted Electron runtime: ${path}`);
  console.log(`Verified packaged Chromium notice SHA256: ${actual}`);
}
