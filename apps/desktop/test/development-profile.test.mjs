import assert from "node:assert/strict";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { register } from "node:module";
import { tmpdir } from "node:os";
import test from "node:test";
import { fileURLToPath, pathToFileURL } from "node:url";
import { readMainModule } from "./helpers/source-contracts.mjs";

const here = dirname(fileURLToPath(import.meta.url));

register(pathToFileURL(join(here, "helpers/ts-import-hooks.mjs")));
const {
  applyDevelopmentUserData,
  DEVELOPMENT_DATA_DIR_NAME,
  DEVELOPMENT_INSTALLATION_NAME,
  INSTALLATION_DATA_DIR_NAME,
  INSTALLATION_USER_DATA_NAME,
  LEGACY_ENCRYPTION_APP_NAME,
  resolveDataDir,
} = await import("../electron/main/data-paths.ts");

const indexSource = await readMainModule("index.ts");

test("a development build owns a different data directory than the shipped app", () => {
  const home = join(tmpdir(), "pi-desktop-profile-home");

  assert.equal(
    resolveDataDir({ override: undefined, development: false, home }),
    join(home, INSTALLATION_DATA_DIR_NAME),
  );
  assert.equal(
    resolveDataDir({ override: undefined, development: true, home }),
    join(home, DEVELOPMENT_DATA_DIR_NAME),
  );

  assert.equal(INSTALLATION_DATA_DIR_NAME, ".wcsdai");
  assert.equal(INSTALLATION_USER_DATA_NAME, "WcSdAi");
  assert.equal(DEVELOPMENT_DATA_DIR_NAME, ".wcsdai-dev");
  assert.equal(DEVELOPMENT_INSTALLATION_NAME, "WcSdAi Dev");
  assert.equal(LEGACY_ENCRYPTION_APP_NAME, "PI-Desktop");
});

for (const development of [false, true]) {
  test(`${development ? "development" : "installed"} profiles select fresh, legacy, migrated and explicit directories without writing`, (t) => {
    const root = mkdtempSync(join(tmpdir(), "wcsdai-profile-selection-"));
    t.after(() => rmSync(root, { recursive: true, force: true }));
    const home = join(root, "home");
    const appData = join(root, "appData");
    mkdirSync(home); mkdirSync(appData);
    const nextData = join(home, development ? ".wcsdai-dev" : ".wcsdai");
    const oldData = join(home, development ? ".pi-desktop-dev" : ".pi-desktop");
    const nextProfile = join(appData, development ? "WcSdAi Dev" : "WcSdAi");
    const oldProfile = join(appData, development ? "PI-Desktop Dev" : "PI-Desktop");
    const calls = [];
    const app = { commandLine: { hasSwitch: () => false }, getPath: () => appData, setPath: (name, path) => calls.push([name, path]) };
    const select = () => {
      calls.length = 0;
      applyDevelopmentUserData(app, development);
      return { data: resolveDataDir({ override: undefined, development, home }), profile: calls[0] };
    };
    assert.deepEqual(select(), { data: nextData, profile: ["userData", nextProfile] });
    assert.equal(existsSync(nextData), false);
    assert.equal(existsSync(nextProfile), false);
    mkdirSync(oldData); mkdirSync(oldProfile);
    writeFileSync(join(oldData, "fixture.txt"), "preserved host fixture");
    writeFileSync(join(oldProfile, "fixture.txt"), "preserved renderer fixture");
    assert.deepEqual(select(), { data: oldData, profile: ["userData", oldProfile] });
    assert.deepEqual(readdirSync(home), [development ? ".pi-desktop-dev" : ".pi-desktop"]);
    assert.deepEqual(readdirSync(appData), [development ? "PI-Desktop Dev" : "PI-Desktop"]);
    mkdirSync(nextData); mkdirSync(nextProfile);
    assert.deepEqual(select(), { data: nextData, profile: ["userData", nextProfile] });
    assert.equal(readFileSync(join(oldData, "fixture.txt"), "utf8"), "preserved host fixture");
    assert.equal(readFileSync(join(oldProfile, "fixture.txt"), "utf8"), "preserved renderer fixture");
    const explicit = join(root, "explicit");
    assert.equal(resolveDataDir({ override: explicit, development, home }), explicit);
    calls.length = 0;
    applyDevelopmentUserData({ ...app, commandLine: { hasSwitch: (name) => name === "user-data-dir" } }, development);
    assert.deepEqual(calls, []);
    assert.equal(existsSync(explicit), false);
  });

  test(`${development ? "development" : "installed"} migration alias preserves only the matching host logical root`, (t) => {
    const root = mkdtempSync(join(tmpdir(), "wcsdai-profile-alias-"));
    t.after(() => rmSync(root, { recursive: true, force: true }));
    const nextData = join(root, development ? ".wcsdai-dev" : ".wcsdai");
    const oldData = join(root, development ? ".pi-desktop-dev" : ".pi-desktop");
    const nextProfile = join(root, development ? "WcSdAi Dev" : "WcSdAi");
    const oldProfile = join(root, development ? "PI-Desktop Dev" : "PI-Desktop");
    mkdirSync(nextData); mkdirSync(nextProfile);
    symlinkSync(nextData, oldData, "junction");
    symlinkSync(nextProfile, oldProfile, "junction");
    const select = (override) => resolveDataDir({ override, development, home: root });
    assert.equal(select(), oldData, "the migrated host keeps historical lexical paths");
    assert.equal(select(nextData), nextData, "an explicit override still wins");
    const calls = [];
    applyDevelopmentUserData({ commandLine: { hasSwitch: () => false }, getPath: () => root, setPath: (name, path) => calls.push([name, path]) }, development);
    assert.deepEqual(calls, [["userData", nextProfile]], "Electron uses its branded profile after migration");
    rmSync(oldData);
    const unrelated = join(root, "unrelated-legacy-profile");
    mkdirSync(unrelated);
    symlinkSync(unrelated, oldData, "junction");
    assert.equal(select(), nextData, "a different legacy target does not replace current user data");
    rmSync(oldData);
    symlinkSync(join(root, "missing-legacy-target"), oldData, "junction");
    assert.throws(() => select(), { code: "ENOENT" }, "a broken alias must not silently select a fresh profile");
  });
}

test("PI_DESKTOP_DATA_DIR still overrides either profile", () => {
  const home = join(tmpdir(), "pi-desktop-profile-home");
  const override = join(tmpdir(), "pi-desktop-explicit-profile");

  for (const development of [false, true]) {
    assert.equal(
      resolveDataDir({ override, development, home }),
      override,
    );
  }

  // Every call site this replaced treated a blank value as unset, which is what
  // keeps `PI_DESKTOP_DATA_DIR=` from naming a relative directory.
  assert.equal(
    resolveDataDir({ override: "   ", development: true, home }),
    join(home, DEVELOPMENT_DATA_DIR_NAME),
  );
});

test("an explicit data directory reaches the child processes as an absolute path", () => {
  // host-core and the plugin host read the value as an environment variable
  // from a different working directory, so a relative override would resolve to
  // two different trees.
  const relative = join("pi-desktop-relative-profile");
  assert.equal(
    resolveDataDir({
      override: relative,
      development: false,
      home: join(tmpdir(), "pi-desktop-profile-home"),
    }),
    resolve(relative),
  );
});

test("applyDevelopmentUserData sets userData unless --user-data-dir is set", () => {
  const calls = [];
  const app = {
    commandLine: { hasSwitch: () => false },
    getPath: () => "/tmp/appData",
    setPath: (name, path) => calls.push([name, path]),
  };
  applyDevelopmentUserData(app, true);
  assert.deepEqual(calls, [
    ["userData", join("/tmp/appData", DEVELOPMENT_INSTALLATION_NAME)],
  ]);
  calls.length = 0;
  applyDevelopmentUserData(app, false);
  assert.deepEqual(calls, [["userData", join("/tmp/appData", "WcSdAi")]]);
  calls.length = 0;
  applyDevelopmentUserData(
    { ...app, commandLine: { hasSwitch: (name) => name === "user-data-dir" } },
    true,
  );
  assert.equal(calls.length, 0);
});

test("a development build takes its own userData before the single-instance lock", async () => {
  // The lock lives under `userData`, so the profile has to be applied before
  // Electron asks for it; otherwise a running packaged app refuses the lock and
  // `pnpm dev` quits on arrival.
  const pathsSource = await readMainModule("data-paths.ts");
  const apply = indexSource.indexOf("applyDevelopmentUserData(app, isDevelopmentBuild)");
  const setName = indexSource.indexOf("app.setName(LEGACY_ENCRYPTION_APP_NAME)");
  const lock = indexSource.indexOf("app.requestSingleInstanceLock()");

  assert.ok(apply > 0, "main must give the development build its own userData");
  assert.ok(lock > 0, "main must request the single-instance lock");
  assert.ok(setName > 0 && setName < apply);
  assert.ok(apply < lock);

  // An explicit `--user-data-dir` wins. The E2E harnesses point a build at a
  // throwaway profile with that switch, so overriding it would run their
  // assertions against the developer's own state instead.
  assert.match(
    pathsSource,
    /if \(!app\.commandLine\.hasSwitch\("user-data-dir"\)\) \{/,
  );

  // The two profiles are told apart by the same verdict everywhere, and it is
  // reached before the name the lock path derives from.
  const development = indexSource.search(
    /const isDevelopmentBuild =\s*\n?\s*process\.env\.PI_DESKTOP_DEV === "1" \|\| !app\.isPackaged;/,
  );
  assert.ok(development > 0 && development < apply);
});

test("main resolves one data directory and publishes it to everything below", () => {
  assert.match(indexSource, /const dataDir = desktopDataDir\(isDevelopmentBuild\);/);
  // The plugin runtime resolves this root from the environment rather than
  // taking it as a parameter, so the resolved value has to be the one it reads.
  assert.match(indexSource, /process\.env\.PI_DESKTOP_DATA_DIR = dataDir;/);
  assert.doesNotMatch(indexSource, /join\(homedir\(\), "\.pi-desktop"\)/);

  // Publishing happens after the lock verdict, which reads the same variable:
  // moving the write above `singleInstanceRequired` would make every launch
  // look like it had been given an explicit data directory and skip the lock.
  const lockVerdict = indexSource.indexOf(
    "const singleInstanceRequired = !process.env.PI_DESKTOP_DATA_DIR;",
  );
  assert.ok(lockVerdict > 0);
  assert.ok(
    indexSource.indexOf("process.env.PI_DESKTOP_DATA_DIR = dataDir;") > lockVerdict,
  );
});

test("downstream data directories follow the profile instead of the shipped default", async () => {
  const runtimeSource = await readMainModule("plugin-runtime.ts");
  assert.match(runtimeSource, /const root = desktopDataDir\(\);/);
  assert.doesNotMatch(runtimeSource, /join\(homedir\(\), "\.pi-desktop"\)/);

  // The plugin services already receive the resolved directory; the scratch
  // root was the one place that re-derived it.
  const servicesSource = await readMainModule("services/plugin-services.ts");
  assert.match(servicesSource, /return join\(dataDir, "scratch", sessionId\);/);
  assert.doesNotMatch(servicesSource, /join\(homedir\(\), "\.pi-desktop"\)/);
});
