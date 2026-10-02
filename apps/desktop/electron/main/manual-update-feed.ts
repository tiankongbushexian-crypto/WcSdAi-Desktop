/** Public release discovery for team builds; this service never fetches binaries. */
export const MANUAL_UPDATE_FEED_URL =
  "https://raw.githubusercontent.com/tiankongbushexian-crypto/WcSdAi-Desktop/main/updates/stable.json";
export const MANUAL_UPDATE_DOWNLOADS_URL =
  "https://github.com/tiankongbushexian-crypto/WcSdAi-Desktop/actions/workflows/team-builds.yml";
export const MAX_UPDATE_MANIFEST_BYTES = 64 * 1024;

const REPOSITORY_PATH = "/tiankongbushexian-crypto/WcSdAi-Desktop";
const TARGETS = ["darwin-arm64", "darwin-x64", "win32-x64", "linux-arm64", "linux-x64"] as const;
type Target = (typeof TARGETS)[number];
type Download = { url: string; expiresAt?: string };
export type ManualUpdateManifest = {
  schemaVersion: 1;
  version: string;
  notes: { en: string; "zh-CN": string };
  downloads: Partial<Record<Target, Download>>;
};
export type ManualUpdateResult = {
  version: string;
  available: boolean;
  downloadUrl?: string;
};

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** SemVer core comparison, including graduation from an installed prerelease. */
function versionParts(version: string, stableOnly: boolean): { core: number[]; prerelease: boolean } {
  const match = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?(?:\+([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?$/.exec(version);
  if (!match || version.length > 128 || (stableOnly && (match[4] || match[5]))) {
    throw new Error("invalid update version");
  }
  const core = match.slice(1, 4).map(Number);
  if (core.some((part) => !Number.isSafeInteger(part)) ||
      match[4]?.split(".").some((part) => /^\d+$/.test(part) && part.length > 1 && part.startsWith("0"))) {
    throw new Error("invalid update version");
  }
  return { core, prerelease: Boolean(match[4]) };
}

export function isNewerStableVersion(available: string, installed: string): boolean {
  const target = versionParts(available, true);
  const current = versionParts(installed, false);
  for (let index = 0; index < 3; index += 1) {
    if (target.core[index] !== current.core[index]) return target.core[index] > current.core[index];
  }
  return current.prerelease;
}

/** Only human-facing release/download pages in the maintained fork are allowed. */
export function parseManualUpdateDownloadUrl(value: unknown): string | null {
  if (typeof value !== "string" || value.length > 2048 || /[%\\\s]/.test(value)) return null;
  try {
    const url = new URL(value);
    if (url.origin !== "https://github.com" || url.username || url.password || url.search || url.hash || url.href !== value) return null;
    const path = url.pathname.slice(REPOSITORY_PATH.length);
    if (!url.pathname.startsWith(`${REPOSITORY_PATH}/`)) return null;
    return /^\/actions\/runs\/[1-9]\d*(?:\/artifacts\/[1-9]\d*)?$/.test(path) ||
      /^\/releases(?:\/latest|\/tag\/[A-Za-z0-9][A-Za-z0-9._-]*)?$/.test(path)
      ? url.href : null;
  } catch {
    return null;
  }
}

export function parseManualUpdateManifest(value: unknown): ManualUpdateManifest {
  if (!record(value) || value.schemaVersion !== 1 || typeof value.version !== "string" ||
      !record(value.notes) || !record(value.downloads)) throw new Error("invalid update manifest");
  versionParts(value.version, true);
  for (const locale of ["en", "zh-CN"]) {
    const notes = value.notes[locale];
    if (typeof notes !== "string" || !notes.trim() || Buffer.byteLength(notes, "utf8") > 8192 || /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(notes)) {
      throw new Error("invalid update notes");
    }
  }
  const downloads: ManualUpdateManifest["downloads"] = {};
  const entries = Object.entries(value.downloads);
  if (entries.length === 0) throw new Error("update downloads are missing");
  for (const [target, download] of entries) {
    if (!TARGETS.includes(target as Target) || !record(download)) throw new Error("invalid update target");
    const url = parseManualUpdateDownloadUrl(download.url);
    if (!url) throw new Error("invalid update download page");
    const expiresAt = download.expiresAt;
    if ((url.includes("/actions/") && expiresAt === undefined) ||
        (expiresAt !== undefined && (typeof expiresAt !== "string" ||
        !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(expiresAt) ||
        !Number.isFinite(Date.parse(expiresAt)) ||
        new Date(expiresAt).toISOString() !== expiresAt.replace(/(?<!\.\d{3})Z$/, ".000Z")))) {
      throw new Error("invalid update download expiry");
    }
    downloads[target as Target] = { url, ...(typeof expiresAt === "string" ? { expiresAt } : {}) };
  }
  return { schemaVersion: 1, version: value.version, notes: { en: value.notes.en as string, "zh-CN": value.notes["zh-CN"] as string }, downloads };
}

async function readManifest(response: Response, signal: AbortSignal): Promise<ManualUpdateManifest> {
  if (!response.ok || response.redirected) {
    await response.body?.cancel();
    throw new Error("update feed unavailable");
  }
  const declaredSize = Number(response.headers.get("content-length"));
  if (declaredSize > MAX_UPDATE_MANIFEST_BYTES) {
    await response.body?.cancel();
    throw new Error("update manifest is too large");
  }
  if (!response.body) throw new Error("empty update manifest");
  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  let cancelRead: (() => void) | undefined;
  const aborted = new Promise<never>((_, reject) => {
    cancelRead = () => { void reader.cancel(signal.reason).then(() => reject(signal.reason), reject); };
    signal.addEventListener("abort", cancelRead, { once: true });
  });
  try {
    signal.throwIfAborted();
    while (true) {
      const { done, value } = await Promise.race([reader.read(), aborted]);
      signal.throwIfAborted();
      if (done) break;
      size += value.byteLength;
      if (size > MAX_UPDATE_MANIFEST_BYTES) throw new Error("update manifest is too large");
      chunks.push(value);
    }
    return parseManualUpdateManifest(JSON.parse(Buffer.concat(chunks).toString("utf8")));
  } finally {
    if (cancelRead) signal.removeEventListener("abort", cancelRead);
    await reader.cancel();
    reader.releaseLock();
  }
}

export function supportsManualUpdateTarget(platform: string, arch: string): boolean {
  return TARGETS.includes(`${platform}-${arch}` as Target);
}

/** Owns the cancellable metadata request and the last validated locale catalog. */
export class ManualUpdateFeed {
  private manifest?: ManualUpdateManifest;
  private pending?: AbortController;
  private disposed = false;
  private readonly fetchImpl: typeof fetch;

  constructor(fetchImpl: typeof fetch = fetch) {
    this.fetchImpl = fetchImpl;
  }

  notesFor(version: string, locale: string | null | undefined): string | undefined {
    if (this.manifest?.version !== version) return undefined;
    return this.manifest.notes[locale?.startsWith("zh") ? "zh-CN" : "en"];
  }

  downloadUrlFor(version: string, platform: string, arch: string): string {
    const download = this.manifest?.version === version
      ? this.manifest.downloads[`${platform}-${arch}` as Target] : undefined;
    if (!download || (download.expiresAt && Date.parse(download.expiresAt) <= Date.now())) {
      throw new Error("update download is unavailable for this device");
    }
    return download.url;
  }

  async check(currentVersion: string, platform: string, arch: string, timeoutMs: number): Promise<ManualUpdateResult> {
    if (this.disposed) throw new Error("update checker disposed");
    if (this.pending) throw new Error("update check already pending");
    const controller = new AbortController();
    this.pending = controller;
    const timer = setTimeout(() => controller.abort(new Error("update check timed out")), timeoutMs);
    timer.unref?.();
    let rejectAborted: (() => void) | undefined;
    const aborted = new Promise<never>((_, reject) => {
      rejectAborted = () => reject(controller.signal.reason);
      controller.signal.addEventListener("abort", rejectAborted, { once: true });
    });
    try {
      const manifest = await Promise.race([
        this.fetchImpl(MANUAL_UPDATE_FEED_URL, {
          signal: controller.signal,
          redirect: "error",
          credentials: "omit",
          cache: "no-store",
          headers: { Accept: "application/json" },
        }).then((response) => readManifest(response, controller.signal)),
        aborted,
      ]);
      controller.signal.throwIfAborted();
      const available = isNewerStableVersion(manifest.version, currentVersion);
      const download = manifest.downloads[`${platform}-${arch}` as Target];
      if (available && (!download || (download.expiresAt && Date.parse(download.expiresAt) <= Date.now()))) {
        throw new Error("update download is unavailable for this device");
      }
      this.manifest = manifest;
      return { version: manifest.version, available, downloadUrl: available ? download?.url : undefined };
    } finally {
      clearTimeout(timer);
      if (rejectAborted) controller.signal.removeEventListener("abort", rejectAborted);
      // Release a response body even when status/size validation rejected it
      // before the streaming reader was created.
      controller.abort();
      this.pending = undefined;
    }
  }

  dispose(): void {
    this.disposed = true;
    this.pending?.abort(new Error("update checker disposed"));
  }
}
