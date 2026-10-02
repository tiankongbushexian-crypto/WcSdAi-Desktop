import { lstatSync, realpathSync } from "node:fs";
import { homedir } from "node:os";
import { resolve } from "node:path";

/**
 * Electron owns the single-instance lock, renderer storage and persistent
 * browser/plugin partitions under userData. Host-core owns pi.sqlite, secrets,
 * transcripts, plugins and logs under the separate host data directory.
 * WcSdAi names are preferred; an existing legacy directory remains usable
 * until migration creates the new directory. A host-data compatibility alias
 * retains its legacy logical root for historical attachment and tool paths.
 * Selection never copies, renames, merges or creates user data. Development remains
 * separate from the installed profile, and explicit overrides still win.
 */

/** Preserve OS-backed encryption independently from branded directory names. */
export const LEGACY_ENCRYPTION_APP_NAME = "PI-Desktop";
export const INSTALLATION_USER_DATA_NAME = "WcSdAi";
export const DEVELOPMENT_INSTALLATION_NAME = "WcSdAi Dev";

/** Data directory of a shipped installation, below the user's home. */
export const INSTALLATION_DATA_DIR_NAME = ".wcsdai";

/** Data directory of a development installation, below the user's home. */
export const DEVELOPMENT_DATA_DIR_NAME = ".wcsdai-dev";

function preferredDirectory(root: string, currentName: string, legacyName: string): string {
  const current = resolve(root, currentName);
  if (lstatSync(current, { throwIfNoEntry: false })) return current;
  const legacy = resolve(root, legacyName);
  return lstatSync(legacy, { throwIfNoEntry: false }) ? legacy : current;
}

function hostDataDirectory(root: string, currentName: string, legacyName: string): string {
  const current = resolve(root, currentName);
  const legacy = resolve(root, legacyName);
  const currentEntry = lstatSync(current, { throwIfNoEntry: false });
  const legacyEntry = lstatSync(legacy, { throwIfNoEntry: false });
  if (!currentEntry) return legacyEntry ? legacy : current;
  // Historical messages and file grants use the logical scratch/attachment
  // prefix. Only an alias to this exact migrated root keeps the old spelling;
  // an independent old installation must not override an existing WcSdAi root.
  // Resolution errors are intentionally observable, never a fresh-profile fallback.
  if (legacyEntry?.isSymbolicLink() && realpathSync(legacy) === realpathSync(current)) {
    return legacy;
  }
  return current;
}

export type DataDirInput = {
  /** `PI_DESKTOP_DATA_DIR`; an explicit directory wins over either profile. */
  override: string | undefined;
  /** True for a development build. */
  development: boolean;
  /** The user's home directory. */
  home: string;
};

/**
 * The data directory one installation owns.
 *
 * `PI_DESKTOP_DATA_DIR` stays the escape hatch it always was: an explicit
 * directory wins, which is how the E2E harnesses, the capture rig, and
 * side-by-side profiles keep choosing their own root. The result is absolute,
 * because it reaches host-core as a child-process environment variable from a
 * working directory that need not be this one, and because `homedir()` is the
 * only other input that could be relative. Without an override a migrated or
 * fresh installation uses its WcSdAi directory; an unmigrated installation
 * continues using its existing legacy directory. A legacy symlink to the
 * migrated directory preserves the historical logical host-data prefix.
 */
export function resolveDataDir({
  override,
  development,
  home,
}: DataDirInput): string {
  const explicit = override?.trim();
  if (explicit) return resolve(explicit);
  return hostDataDirectory(
    home,
    development ? DEVELOPMENT_DATA_DIR_NAME : INSTALLATION_DATA_DIR_NAME,
    development ? ".pi-desktop-dev" : ".pi-desktop",
  );
}

/**
 * The data directory this process owns.
 *
 * Electron main passes its own verdict for `development`, because only it can
 * ask `app.isPackaged`, and it publishes the resolved directory back to
 * `PI_DESKTOP_DATA_DIR` at boot. That publication is what keeps the plugin
 * runtime — which resolves this root from the environment rather than taking
 * it as a parameter — on one directory instead of falling back to the shipped
 * default, which would strand a development host's plugin data inside the
 * packaged profile.
 */
export function desktopDataDir(
  development: boolean = process.env.PI_DESKTOP_DEV === "1",
): string {
  return resolveDataDir({
    override: process.env.PI_DESKTOP_DATA_DIR,
    development,
    home: homedir(),
  });
}

/** The Electron `app` surface this helper needs; kept structural so tests need no Electron. */
export type UserDataApp = {
  commandLine: { hasSwitch(name: string): boolean };
  getPath(name: "appData"): string;
  setPath(name: "userData", path: string): void;
};

/**
 * Pin both profiles independently of the OS encryption identity. Legacy
 * renderer state remains reachable until its branded directory exists.
 * Development owns a separate single-instance lock (D236, ADR 0094).
 * An explicit `--user-data-dir` wins, because that is how the E2E harnesses
 * point a build at a throwaway profile.
 */
export function applyDevelopmentUserData(
  app: UserDataApp,
  development: boolean,
): void {
  if (!app.commandLine.hasSwitch("user-data-dir")) {
    app.setPath(
      "userData",
      preferredDirectory(
        app.getPath("appData"),
        development ? DEVELOPMENT_INSTALLATION_NAME : INSTALLATION_USER_DATA_NAME,
        development ? "PI-Desktop Dev" : "PI-Desktop",
      ),
    );
  }
}
