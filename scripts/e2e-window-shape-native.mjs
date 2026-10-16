#!/usr/bin/env node
/** Native Windows shape probe with a disposable Electron window, no host/provider. */
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { randomUUID } from "node:crypto";
import { createRequire } from "node:module";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { repositoryRoot, resolveElectronBinary } from "./e2e/boot.mjs";
import { assertCssOnlyRejected } from "./e2e/window-corner-assertions.mjs";

if (process.platform !== "win32") {
  console.log("SKIP native Windows window region: requires a Windows runner");
  process.exit(0);
}
const root = repositoryRoot();
const { build } = createRequire(join(root, "packages/agent-runtime/package.json"))("esbuild");
const baselineOnly = process.argv.includes("--baseline-css-only");
const verifyOnly = process.argv.includes("--verify-css-only-rejected");
const temp = await mkdtemp(join(tmpdir(), "wcsdai-window-region-"));
try {
  await build({ entryPoints: [join(root, "scripts/e2e/window-shape-visual-main.mjs")],
    outfile: join(temp, "main.cjs"), bundle: true, platform: "node", format: "cjs", external: ["electron"], target: "node22" });
  const env = { ...process.env }; delete env.ELECTRON_RUN_AS_NODE;
  async function runCase(cssOnly) {
    const runId = randomUUID();
    const evidence = join(root, ".artifacts/windows-corners-105", cssOnly ? "native-css-only" : "native-current");
    await mkdir(evidence, { recursive: true });
    const child = spawn(resolveElectronBinary(root).electronBinary, [join(temp, "main.cjs"), join(temp, runId), evidence, join(root, "scripts/e2e/probe-window-region.ps1"), cssOnly ? "css-only" : "current", runId], { env, stdio: ["ignore", "pipe", "pipe"] });
    let output = "";
    for (const stream of [child.stdout, child.stderr]) stream.on("data", (chunk) => { output += chunk; });
    const timer = setTimeout(() => child.kill("SIGKILL"), 180_000);
    let code;
    try { code = await new Promise((resolve, reject) => { child.once("error", reject); child.once("close", resolve); }); }
    finally { clearTimeout(timer); }
    await writeFile(join(evidence, "electron-output.log"), output);
    const receipt = JSON.parse(await readFile(join(evidence, "native-visual-report.json"), "utf8"));
    assert.equal(receipt.runId, runId, "Native visual evidence belongs to this invocation");
    return { code, output, receipt, runId, evidence };
  }
  const failures = [];
  try {
    const result = await runCase(true);
    if (baselineOnly) assert.equal(result.code, 0, result.output);
    else {
      assertCssOnlyRejected(result.code, result.receipt, result.runId);
      await writeFile(join(result.evidence, "negative-control.json"), JSON.stringify({ status: "PASS", reason: "CSS-only opaque corner was rejected by the desktop pixel assertion", runId: result.runId }, null, 2));
      console.log("PASS CSS-only opaque corners rejected by composed desktop pixels");
    }
  } catch (error) { failures.push(error); }
  // Retain production baseline evidence even if the negative control fails for
  // an unexpected reason. Never turn an arbitrary process failure into a pass.
  if (!verifyOnly && !baselineOnly) {
    try {
      const result = await runCase(false);
      assert.equal(result.code, 0, result.output);
      assert.equal(result.receipt.status, "PASS");
      console.log("NATIVE_WINDOW_REGION " + JSON.stringify(result.receipt));
    } catch (error) { failures.push(error); }
  }
  if (failures.length) throw new AggregateError(failures, "Native window visual verification failed");
} finally { await rm(temp, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 }); }
