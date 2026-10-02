import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { gunzipSync } from "node:zlib";
import test from "node:test";
import { buildTeamInstaller, packageInstaller, packageSource, teamBuildPlan } from "../../../scripts/team-installers.mjs";

const repository = fileURLToPath(new URL("../../../", import.meta.url));
const require = createRequire(import.meta.url);
const builderRequire = createRequire(require.resolve("electron-builder"));
const { parse } = builderRequire("yaml");
const { configureBuildCommand, createYargs, normalizeOptions } = require("electron-builder/out/builder.js");
const workflow = parse(readFileSync(join(repository, ".github/workflows/team-builds.yml"), "utf8"));
const digest = (path) => createHash("sha256").update(readFileSync(path)).digest("hex");

function fixture(t, publish = null) {
  const root = mkdtempSync(join(tmpdir(), "wcsdai-team-test-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const put = (path, content) => writeFileSync(join(root, path), content);
  mkdirSync(join(root, "apps/desktop/release"), { recursive: true });
  mkdirSync(join(root, "LICENSES"));
  put("apps/desktop/package.json", JSON.stringify({ version: "1.0.1", build: { productName: "WcSdAi", publish } }));
  for (const path of ["LICENSE", "NOTICE.md", "THIRD_PARTY_NOTICES.md", "LICENSES/fixture.txt"]) put(path, `Fixture notice: ${path}\n`);
  put(".gitignore", "apps/desktop/release/\nprivate-local.txt\nuntracked.txt\nLICENSES/private-fixture.txt\nsource/\nartifact/\nempty-artifact/\nmissing-notice/\n");
  function git(args) {
    const result = spawnSync("git", args, { cwd: root, encoding: "utf8" });
    assert.equal(result.status, 0, result.stderr);
    return result.stdout.trim();
  }
  git(["init", "-q"]);
  git(["add", "--", "apps/desktop/package.json", "LICENSE", "NOTICE.md", "THIRD_PARTY_NOTICES.md", "LICENSES/fixture.txt", ".gitignore"]);
  git(["-c", "user.name=Team Build Fixture", "-c", "user.email=fixture@example.invalid", "-c", "commit.gpgsign=false", "commit", "-qm", "test: isolated source fixture"]);
  const commit = git(["rev-parse", "HEAD"]);
  put("private-local.txt", "LOCAL FIXTURE MUST NEVER SHIP\n");
  put("untracked.txt", "UNTRACKED FIXTURE MUST NEVER SHIP\n");
  put("LICENSES/private-fixture.txt", "IGNORED LEGAL-DIRECTORY FIXTURE MUST NEVER SHIP\n");
  return { root, commit, put };
}

function tarNames(path) {
  const bytes = gunzipSync(readFileSync(path));
  const names = [];
  for (let offset = 0; offset + 512 <= bytes.length && bytes[offset] !== 0;) {
    const name = bytes.subarray(offset, offset + 100).toString().split("\0")[0];
    const size = Number.parseInt(bytes.subarray(offset + 124, offset + 136).toString().replace(/\0/g, "").trim(), 8) || 0;
    names.push(name);
    offset += 512 + Math.ceil(size / 512) * 512;
  }
  return names;
}

test("manual team workflow uses one candidate, native runners and artifact-only permissions", () => {
  assert.equal(workflow.name, "WcSdAi Team Installers");
  assert.deepEqual(Object.keys(workflow.on), ["workflow_dispatch"]);
  assert.deepEqual(workflow.permissions, { contents: "read" });
  assert.deepEqual(Object.keys(workflow.jobs), ["source", "installers"]);
  assert.equal(workflow.jobs.installers.needs, "source");
  assert.deepEqual(workflow.jobs.installers.strategy.matrix.include, [
    { os: "macos-15", platform: "macos", arch: "arm64" },
    { os: "macos-15-intel", platform: "macos", arch: "x64" },
    { os: "windows-latest", platform: "windows", arch: "x64" },
  ]);
  for (const job of Object.values(workflow.jobs)) {
    const checkout = job.steps.find((step) => step.uses?.startsWith("actions/checkout@"));
    assert.equal(checkout.with.ref, "${{ github.sha }}");
    assert.equal(checkout.with["persist-credentials"], false);
    const upload = job.steps.find((step) => step.uses?.startsWith("actions/upload-artifact@"));
    assert.equal(upload.with["if-no-files-found"], "error");
    assert.equal(upload.with["retention-days"], 30);
    assert.equal(upload.if, undefined, "a failed build must not upload a partial artifact");
    assert.equal(job.permissions, undefined);
  }
  const source = JSON.stringify(workflow);
  assert.doesNotMatch(source, /secrets\.|contents.*write|gh release|git push|git tag|spctl|xattr|Set-MpPreference/);
  assert.ok(workflow.jobs.installers.steps.some((step) => step.run === "node scripts/team-installers.mjs build ${{ matrix.platform }} ${{ matrix.arch }}"));
  assert.ok(workflow.jobs.installers.steps.some((step) => step.run === "pnpm install --frozen-lockfile"));
});

for (const [platform, arch, nativePlatform] of [["macos", "arm64", "darwin"], ["macos", "x64", "darwin"], ["windows", "x64", "win32"]]) {
  test(`${platform} ${arch} build invokes the existing entry point without certificate or publishing credentials`, (t) => {
    const { root, commit } = fixture(t);
    let invocation;
    buildTeamInstaller({ root, platform, arch, nativePlatform, nativeArch: arch,
      env: { GITHUB_SHA: commit, CSC_LINK: "fixture", WIN_CSC_LINK: "fixture", APPLE_ID: "fixture", AZURE_CLIENT_SECRET: "fixture", GITHUB_TOKEN: "fixture", GH_TOKEN: "fixture", PATH: "fixture-path" },
      run: (...args) => { invocation = args; return { status: 0 }; },
    });
    const [command, args, options] = invocation;
    assert.equal(command, platform === "windows" ? "pnpm.cmd" : "pnpm");
    assert.ok(args.includes(platform === "windows" ? "dist:win" : "dist:mac"));
    assert.ok(args.includes(`--${arch}`));
    assert.ok(!args.includes("--publish"), "existing dist entry points own the single publish policy");
    assert.ok(!args.includes("-c.publish=null"), "keep the validated null from package config, not the CLI string literal");
    assert.ok(args.includes("-c.forceCodeSigning=false"));
    if (platform === "macos") {
      assert.ok(args.includes("-c.mac.identity=null"));
      assert.ok(args.includes("-c.mac.notarize=false"));
    } else {
      assert.ok(args.includes("-c.win.signExecutable=false"));
      assert.ok(!args.includes("-c.win.signAndEditExecutable=false"), "icon and executable metadata must still be applied");
    }
    assert.deepEqual(options.env, { GITHUB_SHA: commit, PATH: "fixture-path", CSC_IDENTITY_AUTO_DISCOVERY: "false" });
  });
}

test("real electron-builder parsing preserves publish never and the package's null feed", () => {
  const desktop = JSON.parse(readFileSync(join(repository, "apps/desktop/package.json")));
  const releaseScript = readFileSync(join(repository, "scripts/build-desktop-release.mjs"), "utf8");
  for (const [platform, arch] of [["macos", "arm64"], ["macos", "x64"], ["windows", "x64"]]) {
    const plan = teamBuildPlan(platform, arch);
    const forwarded = plan.slice(plan.indexOf("run") + 2);
    let entryArgs;
    if (platform === "macos") {
      entryArgs = desktop.scripts["dist:mac"].split("electron-builder ").at(-1).trim().split(/\s+/);
    } else {
      const nsisInvocation = releaseScript.match(/await runBuilder\(\[([\s\S]*?)\.\.\.forwardedArgs/)[1];
      entryArgs = [...nsisInvocation.matchAll(/"([^"]+)"/g)].map((match) => match[1]);
    }
    const normalized = normalizeOptions(configureBuildCommand(createYargs()).parse([...entryArgs, ...forwarded]));
    assert.equal(normalized.publish, "never");
    assert.equal({ ...desktop.build, ...normalized.config }.publish, null);
    if (platform === "macos") assert.equal(normalized.config.mac.identity, null);
  }
});

test("source archive contains exactly committed source, with a checksum and candidate identity", (t) => {
  const { root, commit } = fixture(t);
  const result = packageSource({ root, output: join(root, "source"), expectedCommit: commit });
  const manifest = JSON.parse(readFileSync(join(result.output, "BUILD-INFO.json")));
  assert.equal(manifest.commit, commit);
  assert.equal(manifest.sourceSha256, digest(join(result.output, manifest.sourceFile)));
  const names = tarNames(join(result.output, manifest.sourceFile));
  assert.ok(names.some((name) => name.endsWith("/apps/desktop/package.json")));
  assert.ok(names.some((name) => name.endsWith("/LICENSES/fixture.txt")));
  assert.ok(!names.some((name) => name.endsWith("/LICENSES/private-fixture.txt")));
  assert.ok(!names.some((name) => /private-local|untracked|\/release\//.test(name)));
});

for (const [platform, arch, input] of [["macos", "arm64", "WcSdAi-1.0.1-arm64.dmg"], ["macos", "x64", "WcSdAi-1.0.1-x64.dmg"], ["windows", "x64", "WcSdAi-Setup-1.0.1.exe"]]) {
  test(`${platform} ${arch} artifact includes the actual installer, matching source and notices only`, (t) => {
    const { root, commit, put } = fixture(t);
    const source = packageSource({ root, output: join(root, "source"), expectedCommit: commit });
    put(`apps/desktop/release/${input}`, "INSTALLER FIXTURE BYTES");
    put("apps/desktop/release/private-runtime.json", "PRIVATE FIXTURE MUST NEVER SHIP");
    put("apps/desktop/release/WcSdAi-Portable-1.0.1.exe", "PORTABLE IS NOT AN INSTALLER");
    const result = packageInstaller({ root, output: join(root, "artifact"), sourceDir: source.output, platform, arch, expectedCommit: commit });
    const info = JSON.parse(readFileSync(join(result.output, "BUILD-INFO.json")));
    assert.equal(result.artifactName, `WcSdAi-1.0.1-${platform}-${arch}-unsigned`);
    assert.equal(readFileSync(join(result.output, info.installer), "utf8"), "INSTALLER FIXTURE BYTES");
    assert.deepEqual(readdirSync(join(result.output, "LICENSES")), ["fixture.txt"]);
    assert.deepEqual(readdirSync(result.output).sort(), ["BUILD-INFO.json", "BUILD-INFO.md", "LICENSE", "LICENSES", "NOTICE.md", "SHA256SUMS", "THIRD_PARTY_NOTICES.md", info.installer, info.sourceFile].sort());
    const sums = readFileSync(join(result.output, "SHA256SUMS"), "utf8").trim().split("\n");
    for (const line of sums) {
      const [hash, name] = line.split("  ");
      assert.equal(hash, digest(join(result.output, name)), name);
    }
    assert.match(readFileSync(join(result.output, "BUILD-INFO.md"), "utf8"), /unsigned team artifact/);
  });
}

test("missing or wrong-architecture installers and mismatched source fail before upload staging", (t) => {
  const { root, commit, put } = fixture(t);
  const source = packageSource({ root, output: join(root, "source"), expectedCommit: commit });
  const output = join(root, "artifact");
  const collect = (platform = "macos", arch = "x64") => packageInstaller({ root, output, sourceDir: source.output, platform, arch, expectedCommit: commit });
  put("apps/desktop/release/WcSdAi-1.0.1-arm64.dmg", "wrong architecture");
  put("apps/desktop/release/WcSdAi-Portable-1.0.1.exe", "portable only");
  assert.throws(() => collect(), /Required installer missing/);
  assert.throws(() => collect("windows"), /Required installer missing/);
  assert.equal(existsSync(output), false);
  const infoPath = join(source.output, "BUILD-INFO.json");
  const info = JSON.parse(readFileSync(infoPath));
  writeFileSync(infoPath, JSON.stringify({ ...info, commit: "0".repeat(40) }));
  assert.throws(() => collect(), /does not match/);
  writeFileSync(infoPath, JSON.stringify(info));
  writeFileSync(join(source.output, info.sourceFile), "modified archive");
  assert.throws(() => collect(), /does not match/);
  assert.equal(existsSync(output), false);
});

test("wrong candidate, configured feed, nonnative runner and build failure stop the lane", (t) => {
  const { root, commit, put } = fixture(t);
  assert.throws(() => packageSource({ root, output: join(root, "bad-source"), expectedCommit: "0".repeat(40) }), /commit does not match/);
  const base = { root, platform: "macos", arch: "arm64", nativePlatform: "darwin", nativeArch: "arm64", env: { GITHUB_SHA: commit }, run: () => ({ status: 17 }) };
  assert.throws(() => buildTeamInstaller(base), /failed \(17\)/);
  assert.throws(() => buildTeamInstaller({ ...base, nativeArch: "x64" }), /native runner/);
  put("apps/desktop/package.json", JSON.stringify({ version: "1.0.1", build: { productName: "WcSdAi", publish: { provider: "github" } } }));
  assert.throws(() => buildTeamInstaller(base), /working tree contains/);
  const configured = fixture(t, { provider: "github" });
  assert.throws(() => buildTeamInstaller({ ...base, root: configured.root, env: { GITHUB_SHA: configured.commit } }), /publish:null/);
});

test("same-version tracked and staged edits, and new untracked source cannot claim the archived commit", (t) => {
  const { root, commit, put } = fixture(t);
  const archive = () => packageSource({ root, output: join(root, "source"), expectedCommit: commit });
  put("NOTICE.md", "changed attribution on the same version");
  assert.throws(archive, /working tree contains/);
  const stage = spawnSync("git", ["add", "--", "NOTICE.md"], { cwd: root });
  assert.equal(stage.status, 0);
  assert.throws(archive, /working tree contains/);
  assert.equal(existsSync(join(root, "source")), false);
  const other = fixture(t);
  other.put("apps/desktop/untracked-source.ts", "export const fixture = true;\n");
  assert.throws(() => packageSource({ root: other.root, output: join(other.root, "source") }), /working tree contains/);
});

test("artifact collection refuses empty input, missing notices and an existing output", (t) => {
  const { root, commit, put } = fixture(t);
  const source = packageSource({ root, output: join(root, "source"), expectedCommit: commit });
  const options = { root, output: join(root, "empty-artifact"), sourceDir: source.output, platform: "windows", arch: "x64", expectedCommit: commit };
  put("apps/desktop/release/WcSdAi-Setup-1.0.1.exe", "");
  assert.throws(() => packageInstaller(options), /nonempty regular file/);
  put("apps/desktop/release/WcSdAi-Setup-1.0.1.exe", "INSTALLER");
  assert.throws(() => packageInstaller(options), /output already exists/);
  rmSync(join(root, "NOTICE.md"));
  assert.throws(() => packageInstaller({ ...options, output: join(root, "missing-notice") }), /working tree contains/);
});
