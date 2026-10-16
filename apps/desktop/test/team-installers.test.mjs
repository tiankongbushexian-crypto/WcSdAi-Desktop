import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { chmodSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
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
  mkdirSync(join(root, "LICENSES/components"), { recursive: true });
  put("apps/desktop/package.json", JSON.stringify({ version: "1.0.1", build: { productName: "WcSdAi", publish } }));
  for (const path of ["LICENSE", "NOTICE.md", "THIRD_PARTY_NOTICES.md", "LICENSES/LGPL-3.0.txt", "LICENSES/components/fixture.txt"]) put(path, `Fixture notice: ${path}\n`);
  put(".gitignore", "apps/desktop/release/\nprivate-local.txt\nuntracked.txt\nLICENSES/components/private-fixture.txt\nsource/\nartifact/\nempty-artifact/\nmissing-notice/\n");
  function git(args) {
    const result = spawnSync("git", args, { cwd: root, encoding: "utf8" });
    assert.equal(result.status, 0, result.stderr);
    return result.stdout.trim();
  }
  git(["init", "-q"]);
  git(["add", "--", "apps/desktop/package.json", "LICENSE", "NOTICE.md", "THIRD_PARTY_NOTICES.md", "LICENSES/LGPL-3.0.txt", "LICENSES/components/fixture.txt", ".gitignore"]);
  git(["-c", "user.name=Team Build Fixture", "-c", "user.email=fixture@example.invalid", "-c", "commit.gpgsign=false", "commit", "-qm", "test: isolated source fixture"]);
  const commit = git(["rev-parse", "HEAD"]);
  put("private-local.txt", "LOCAL FIXTURE MUST NEVER SHIP\n");
  put("untracked.txt", "UNTRACKED FIXTURE MUST NEVER SHIP\n");
  put("LICENSES/components/private-fixture.txt", "IGNORED LEGAL-DIRECTORY FIXTURE MUST NEVER SHIP\n");
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
  assert.deepEqual(Object.keys(workflow.jobs).sort(), ["installers", "native-corners", "source"]);
  assert.equal(workflow.jobs.installers.needs, "source");
  assert.equal(workflow.jobs.installers.strategy.matrix, "${{ fromJSON(needs.source.outputs.matrix) }}");
  for (const [jobId, job] of Object.entries(workflow.jobs)) {
    const checkout = job.steps.find((step) => step.uses?.startsWith("actions/checkout@"));
    assert.equal(checkout.with.ref, "${{ github.sha }}");
    assert.equal(checkout.with["persist-credentials"], false);
    assert.equal(job.permissions, undefined);
    if (jobId === "native-corners") continue;
    const producer = jobId === "source" ? "source" : "installer";
    const uploads = job.steps.filter((step) => step.uses?.startsWith("actions/upload-artifact@")
      && step.with.name === `\${{ steps.${producer}.outputs.artifact-name }}`);
    assert.equal(uploads.length, 1, "each job must upload its exact collected distribution artifact once");
    const [upload] = uploads;
    assert.equal(upload.with.path, `\${{ steps.${producer}.outputs.artifact-path }}`);
    assert.equal(upload.with["if-no-files-found"], "error");
    assert.equal(upload.with["retention-days"], 30);
    assert.equal(upload.if, undefined, "a failed build must not upload a partial artifact");
    assert.equal(upload["continue-on-error"], undefined);
  }
  const source = JSON.stringify(workflow);
  assert.doesNotMatch(source, /secrets\.|contents.*write|gh release|git push|git tag|spctl|xattr|Set-MpPreference/);
  assert.ok(workflow.jobs.installers.steps.some((step) => step.run === "node scripts/team-installers.mjs build ${{ matrix.platform }} ${{ matrix.arch }}"));
  assert.ok(workflow.jobs.installers.steps.some((step) => step.run === "pnpm install --frozen-lockfile"));
});

test("Windows native region probe installs the locked Electron runtime before launching it", () => {
  const steps = workflow.jobs.installers.steps;
  const probeIndex = steps.findIndex((step) => step.run === "node scripts/e2e-window-shape-native.mjs");
  assert.ok(probeIndex > 0, "the native region gate must run before artifact collection");
  const install = steps[probeIndex - 1];
  const probe = steps[probeIndex];
  assert.equal(install.run, "node apps/desktop/node_modules/electron/install.js");
  assert.equal(install.if, "matrix.platform == 'windows'");
  assert.equal(probe.if, install.if);
  assert.equal(install["continue-on-error"], undefined);
  assert.equal(probe["continue-on-error"], undefined);
  assert.ok(probeIndex > steps.findIndex((step) => step.run?.includes("team-installers.mjs build")));
  assert.ok(probeIndex < steps.findIndex((step) => step.run?.includes("team-installers.mjs installer")));
});

test("Windows corner gates must pass before installer collection while diagnostic evidence survives failure", () => {
  const steps = workflow.jobs.installers.steps;
  const buildIndex = steps.findIndex((step) => step.run === "node scripts/team-installers.mjs build ${{ matrix.platform }} ${{ matrix.arch }}");
  const collectIndex = steps.findIndex((step) => step.id === "installer");
  const uploadIndex = steps.findIndex((step) => step.uses?.startsWith("actions/upload-artifact@")
    && step.with.name === "${{ steps.installer.outputs.artifact-name }}");
  assert.ok(buildIndex >= 0 && collectIndex > buildIndex && uploadIndex > collectIndex);
  const gateIndices = ["e2e-window-shape-native.mjs", "e2e-windows-packaged-corners.mjs"].map((script) => {
    const index = steps.findIndex((step) => step.run === `node scripts/${script}`);
    assert.ok(index > buildIndex && index < collectIndex, `${script} must gate installer collection`);
    assert.equal(steps[index].if, script === "e2e-window-shape-native.mjs"
      ? "matrix.platform == 'windows'"
      : "${{ !cancelled() && matrix.platform == 'windows' && steps.windows-runtime.outcome == 'success' }}");
    assert.equal(steps[index]["continue-on-error"], undefined);
    return index;
  });
  for (const index of [collectIndex, uploadIndex]) {
    assert.equal(steps[index].if, undefined, "failed corner checks must prevent shipping an installer");
    assert.equal(steps[index]["continue-on-error"], undefined);
  }
  const diagnosticUploads = steps.filter((step) => step.uses?.startsWith("actions/upload-artifact@")
    && step.with.name === "WcSdAi-windows-corners-${{ github.sha }}");
  assert.equal(diagnosticUploads.length, 1);
  const [evidence] = diagnosticUploads;
  assert.equal(evidence.if, "always() && matrix.platform == 'windows'");
  assert.ok(steps.indexOf(evidence) > Math.max(...gateIndices));
  assert.ok(steps.indexOf(evidence) < collectIndex);
  assert.equal(evidence.with.path, ".artifacts/windows-corners-105", "upload only dedicated corner evidence, never release binaries or fixture profiles");
  assert.notEqual(evidence.with["include-hidden-files"], true);
  assert.equal(evidence.with["if-no-files-found"], "error");
  assert.equal(evidence.with["retention-days"], 30);
  assert.equal(evidence["continue-on-error"], undefined);
});

test("team dispatch defaults to all platforms and accepts an isolated Windows build", (t) => {
  const input = workflow.on.workflow_dispatch?.inputs?.platform;
  assert.deepEqual(input, {
    description: "Installer platforms to build",
    type: "choice",
    required: false,
    default: "all",
    options: ["all", "windows"],
  });
  const selection = workflow.jobs.source.steps.find((step) => step.id === "matrix");
  assert.ok(selection, "validate the selection before archiving or uploading source");
  assert.equal(selection.run, "node scripts/team-build-matrix.mjs");
  assert.equal(selection.env.TEAM_BUILD_PLATFORM, "${{ inputs.platform || 'all' }}");
  assert.equal(selection.if, undefined);
  assert.equal(selection["continue-on-error"], undefined);
  assert.ok(workflow.jobs.source.steps.indexOf(selection) < workflow.jobs.source.steps.findIndex((step) => step.id === "source"));
  assert.equal(workflow.jobs.source.if, "inputs.mode != 'native-corners'", "every installer selection requires corresponding source");
  assert.equal(workflow.jobs.source.outputs.matrix, "${{ steps.matrix.outputs.matrix }}");
  assert.equal(workflow.jobs.installers.strategy.matrix, "${{ fromJSON(needs.source.outputs.matrix) }}");
  const root = mkdtempSync(join(tmpdir(), "wcsdai-matrix-test-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const all = [
    { os: "macos-15", platform: "macos", arch: "arm64" },
    { os: "macos-15-intel", platform: "macos", arch: "x64" },
    { os: "windows-latest", platform: "windows", arch: "x64" },
  ];
  for (const [index, value] of [undefined, "all", "windows"].entries()) {
    const output = join(root, `output-${index}`);
    const env = { ...process.env, GITHUB_OUTPUT: output };
    delete env.TEAM_BUILD_PLATFORM;
    if (value !== undefined) env.TEAM_BUILD_PLATFORM = value;
    const result = spawnSync(process.execPath, ["scripts/team-build-matrix.mjs"], { cwd: repository, env, encoding: "utf8" });
    assert.equal(result.status, 0, result.stderr);
    const lines = readFileSync(output, "utf8").trim().split("\n");
    assert.equal(lines.length, 1, "publish exactly one validated matrix output");
    assert.ok(lines[0].startsWith("matrix="));
    assert.deepEqual(JSON.parse(lines[0].slice("matrix=".length)), { include: value === "windows" ? [all[2]] : all });
  }
  for (const value of ["linux", "", "WINDOWS", "windows\nextra=all"]) {
    const output = join(root, "invalid-output");
    const result = spawnSync(process.execPath, ["scripts/team-build-matrix.mjs"], {
      cwd: repository, env: { ...process.env, GITHUB_OUTPUT: output, TEAM_BUILD_PLATFORM: value }, encoding: "utf8",
    });
    assert.notEqual(result.status, 0, "invalid selections must fail before a build matrix is emitted");
    assert.match(result.stderr, /Unsupported team build platform/);
    assert.equal(existsSync(output), false);
  }
});

test("native-corners dispatch runs independent Windows diagnostics without publishing distribution artifacts", () => {
  assert.deepEqual(workflow.on.workflow_dispatch?.inputs?.mode, {
    description: "Build installers or run only Windows corner diagnostics",
    type: "choice", required: false, default: "installers", options: ["installers", "native-corners"],
  });
  assert.equal(workflow.jobs.source.if, "inputs.mode != 'native-corners'");
  assert.equal(workflow.jobs.installers.needs, "source");
  assert.equal(workflow.jobs.installers.if, undefined, "skipped source must also skip installer builds");
  const job = workflow.jobs["native-corners"];
  assert.equal(job.if, "inputs.mode == 'native-corners'");
  assert.equal(job["runs-on"], "windows-latest");
  assert.equal(job.needs, undefined, "diagnostics must not wait for source packaging");
  assert.equal(job["continue-on-error"], undefined);
  const steps = job.steps;
  assert.ok(steps.some((step) => step.uses?.startsWith("pnpm/action-setup@")));
  assert.ok(steps.some((step) => step.uses?.startsWith("actions/setup-node@")
    && step.with["node-version"] === 24 && step.with.cache === "pnpm"));
  const dependencies = steps.findIndex((step) => step.run === "pnpm install --frozen-lockfile");
  const build = steps.findIndex((step) => step.run === "pnpm --config.verify-deps-before-run=false --filter @pi-desktop/shared --filter @pi-desktop/plugin-sdk -r build");
  const runtime = steps.findIndex((step) => step.id === "native-runtime");
  assert.ok(dependencies >= 0 && build > dependencies && runtime > build);
  assert.equal(steps[runtime].run, "node apps/desktop/node_modules/electron/install.js");
  assert.equal(steps[runtime]["continue-on-error"], undefined);
  const backdrop = steps.findIndex((step) => step.run === "node scripts/e2e-windows-packaged-corners.mjs --backdrop-only");
  const native = steps.findIndex((step) => step.run === "node scripts/e2e-window-shape-native.mjs");
  assert.ok(backdrop > runtime && native > backdrop);
  assert.equal(steps[backdrop]["continue-on-error"], undefined, "failed preflight must fail the diagnostic job");
  assert.equal(steps[native].if, "${{ !cancelled() && steps.native-runtime.outcome == 'success' }}", "retain native evidence even after backdrop preflight fails");
  assert.equal(steps[native]["continue-on-error"], undefined);
  const uploads = steps.filter((step) => step.uses?.startsWith("actions/upload-artifact@"));
  assert.equal(uploads.length, 1, "diagnostics may upload only their evidence");
  assert.equal(uploads[0].if, "always()");
  assert.deepEqual(uploads[0].with, {
    name: "WcSdAi-windows-corners-diagnostic-${{ github.sha }}",
    path: ".artifacts/windows-corners-105", "if-no-files-found": "error", "retention-days": 30,
  });
  assert.ok(steps.indexOf(uploads[0]) > native);
  assert.doesNotMatch(JSON.stringify(job), /team-installers\.mjs|download-artifact|rust-toolchain|cargo |electron-builder|dist:win|release\/|profile/);
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
      assert.ok(args.includes("-c.mac.identity=-"), "seal the bundle ad hoc without a publisher certificate");
      assert.ok(args.includes("-c.mac.notarize=false"));
    } else {
      assert.ok(args.includes("-c.win.signExecutable=false"));
      assert.ok(!args.includes("-c.win.signAndEditExecutable=false"), "icon and executable metadata must still be applied");
    }
    assert.deepEqual(options.env, { GITHUB_SHA: commit, PATH: "fixture-path", CSC_IDENTITY_AUTO_DISCOVERY: "false" });
  });
}

test("macOS workflow rejects broken or publisher-signed bundles before collection", { skip: process.platform === "win32" }, (t) => {
  const steps = workflow.jobs.installers.steps;
  const step = steps.find((entry) => entry.name === "Verify macOS ad-hoc bundle integrity");
  assert.equal(step.if, "matrix.platform == 'macos'");
  assert.ok(steps.indexOf(step) > steps.findIndex((entry) => entry.run?.includes("team-installers.mjs build")));
  assert.ok(steps.indexOf(step) < steps.findIndex((entry) => entry.run?.includes("team-installers.mjs installer")));
  const root = mkdtempSync(join(tmpdir(), "wcsdai-seal-test-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const bin = join(root, "bin");
  mkdirSync(bin);
  const stub = join(bin, "codesign");
  writeFileSync(stub, [
    "#!/usr/bin/env node",
    "if (process.argv.at(-1) !== process.env.TEAM_EXPECTED_APP) process.exit(42);",
    "if (process.argv.includes('--verify')) process.exit(Number(process.env.TEAM_VERIFY_EXIT || '0'));",
    "process.stderr.write(process.env.TEAM_SIGNATURE);",
  ].join("\n"));
  chmodSync(stub, 0o755);
  for (const [arch, appDir] of [["arm64", "mac-arm64"], ["x64", "mac"]]) {
    const app = `apps/desktop/release/${appDir}/WcSdAi.app`;
    mkdirSync(join(root, app), { recursive: true });
    const run = (signature, verifyExit = "0") => spawnSync("bash", ["-c", step.run], {
      cwd: root, encoding: "utf8", env: { ...process.env, PATH: `${bin}:${process.env.PATH}`, TEAM_MAC_ARCH: arch, TEAM_EXPECTED_APP: app, TEAM_VERIFY_EXIT: verifyExit, TEAM_SIGNATURE: signature },
    });
    const valid = "Signature=adhoc\nTeamIdentifier=not set\n";
    assert.equal(run(valid).status, 0);
    assert.notEqual(run(valid, "1").status, 0, "failed deep/strict validation must stop collection");
    assert.notEqual(run("Authority=Developer ID Application: Fixture\nTeamIdentifier=FIXTURE123\n").status, 0);
    assert.notEqual(run("Signature=adhoc\nTeamIdentifier=FIXTURE123\n").status, 0);
  }
});

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
    if (platform === "macos") assert.equal(normalized.config.mac.identity, "-");
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
  assert.ok(names.some((name) => name.endsWith("/LICENSES/components/fixture.txt")));
  assert.ok(!names.some((name) => name.endsWith("/LICENSES/components/private-fixture.txt")));
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
    assert.deepEqual(readdirSync(join(result.output, "LICENSES")).sort(), ["LGPL-3.0.txt", "components"]);
    assert.deepEqual(readdirSync(join(result.output, "LICENSES/components")), ["fixture.txt"]);
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
