#!/usr/bin/env node
/** WcSdAi's real Electron/Host brand and persistence path, with no provider calls. */
import assert from "node:assert/strict";
import { execFileSync, spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdir, mkdtemp, readFile, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { assertDesktopBuild, repositoryRoot } from "./e2e/boot.mjs";
import { launchLiveVoiceDesktop } from "./e2e/live-voice-desktop.mjs";
import { waitFor } from "./e2e/wait.mjs";

const root = resolve(repositoryRoot());
const { mainPath, rendererPath } = assertDesktopBuild(root);
const evidence = resolve(process.env.WCSDAI_EVIDENCE_DIR || join(root, ".artifacts/wcsdai/brand-e2e"));
await mkdir(evidence, { recursive: true });
const scratch = await mkdtemp(join(evidence, "isolated-"));
const dataDir = join(scratch, "data");
const profile = join(scratch, "profile");
const home = join(scratch, "home");
const project = join(scratch, "Brand continuity");
await Promise.all([dataDir, profile, home, project].map((path) => mkdir(path)));
await writeFile(join(project, "README.md"), "# Brand continuity fixture\n");
const checks = [];
let desktop;
let sessionId;
const launch = async () => {
  const instance = await launchLiveVoiceDesktop({ root, dataDir, profile, home, evidence, syntheticMicrophone: false });
  await instance.send("Page.bringToFront");
  return instance;
};
const bodyContains = (text) => desktop.evaluate(`document.body.innerText.includes(${JSON.stringify(text)})`);
const clickInfo = () => desktop.clickText("信息", ".settings-nav-item");
const visibleSession = () => desktop.evaluate(`!!document.querySelector('.thread-item-main[aria-current="page"]')`);
const git = (...args) => execFileSync("git", args, { cwd: root, encoding: "utf8" }).trim();
async function trackedDiffHash() {
  const child = spawn("git", ["diff", "--binary"], { cwd: root, stdio: ["ignore", "pipe", "pipe"] });
  const hash = createHash("sha256");
  child.stdout.on("data", (chunk) => hash.update(chunk));
  child.stderr.resume();
  await new Promise((resolve, reject) => {
    child.once("error", reject);
    child.once("close", (code) => code === 0 ? resolve() : reject(new Error("Cannot fingerprint the candidate diff")));
  });
  return hash.digest("hex");
}
const report = {
  timestamp: new Date().toISOString(),
  commit: git("rev-parse", "HEAD"),
  baseMain: git("rev-parse", "origin/main"),
  trackedDiffSha256: await trackedDiffHash(),
  mainBuildSha256: createHash("sha256").update(await readFile(mainPath)).digest("hex"),
  rendererEntrySha256: createHash("sha256").update(await readFile(rendererPath)).digest("hex"),
  platform: process.platform,
  architecture: process.arch,
  scratch,
  checks,
  limitations: [
    "The native project-folder picker is bypassed at the public preload IPC boundary; actual project creation, persistence and session UI use the real host.",
    "No provider requests, user profile, user credentials, signing or published update feed are used.",
  ],
};

async function record(label, check) {
  await check();
  checks.push(label);
  console.log(`PASS ${label}`);
}

try {
  desktop = await launch();
  await record("fresh boot shows WcSdAi in Simplified Chinese", async () => {
    assert.equal(await desktop.evaluate("document.title"), "WcSdAi");
    assert.equal(await desktop.evaluate("document.documentElement.lang"), "zh-CN");
    const settings = await desktop.invoke("settingsGet");
    assert.ok(settings.language === undefined || settings.language === "zh-CN");
    assert.equal(await bodyContains("今天想做点什么？"), true);
    const logos = await desktop.evaluate(`Array.from(document.querySelectorAll('.brand-logo, .home-mascot-logo img')).map(img => ({ complete: img.complete, width: img.naturalWidth }))`);
    assert.ok(logos.length > 0);
    assert.ok(logos.every((logo) => logo.complete && logo.width > 0));
    await desktop.screenshot("01-fresh-boot-zh-CN.png");
  });

  await record("Settings Info exposes product identity, attribution and pending updates", async () => {
    await desktop.clickSelector('[data-nav="settings"]');
    await clickInfo();
    await waitFor(() => bodyContains("关于 WcSdAi"), 10_000, "brand attribution page");
    for (const text of ["Copyright 2026 量动科技", "2222223323@qq.com", "PI-Desktop", "GNU LGPL v3.0", "1.0.1"]) {
      assert.equal(await bodyContains(text), true, text);
    }
    assert.equal(await desktop.evaluate(`document.querySelector('a[href="https://wanchuangsd.cn"]') !== null`), true);
    await waitFor(() => bodyContains("尚未配置更新地址"), 10_000, "disabled updater status");
    await desktop.screenshot("02-settings-info.png");
  });

  await record("new project persists through the real preload and Rust host", async () => {
    const { group } = await desktop.invoke("projectGroupCreate", { name: "Brand continuity", folders: [project] });
    assert.equal(group.name, "Brand continuity");
    assert.ok(group.roots.some((entry) => entry.path === project));
    await desktop.invoke("projectSet", project);
    const { groups } = await desktop.invoke("projectGroupList");
    assert.ok(groups.some((entry) => entry.id === group.id));
    await desktop.close();
    desktop = await launch();
    await waitFor(() => desktop.evaluate(`!!document.querySelector('[aria-label="Brand continuity"]')`), 10_000, "new project in sidebar");
  });

  await record("new session is created from the project sidebar and can be reopened", async () => {
    const initial = await desktop.invoke("sessionList");
    // Header actions intentionally stay pointer-inert until hovered or focused.
    const point = await desktop.evaluate(`(() => {
      const rect = document.querySelector('[aria-label="Brand continuity"]').getBoundingClientRect();
      return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    })()`);
    await desktop.send("Input.dispatchMouseEvent", { type: "mouseMoved", ...point });
    await desktop.click(`document.querySelector('[aria-label="Brand continuity"]')?.closest('[data-sidebar-project-group]')?.querySelector('.sidebar-session-group-add')`);
    await waitFor(async () => {
      const { sessions } = await desktop.invoke("sessionList");
      sessionId = sessions.find((session) => session.projectPath === project && !initial.sessions.some((prior) => prior.id === session.id))?.id;
      return Boolean(sessionId);
    }, 10_000, "new project session persisted");
    await waitFor(visibleSession, 10_000, "new session selected");
    assert.equal(await desktop.evaluate(`!!document.querySelector('[contenteditable="true"], textarea.composer-textarea')`), true);
    await desktop.screenshot("03-project-session.png");
  });

  await record("an explicit language choice persists alongside project/session data", async () => {
    await desktop.clickSelector('[data-nav="settings"]');
    await desktop.clickText("常规", ".settings-nav-item");
    await desktop.clickSelector('button[aria-label="语言"]');
    await desktop.clickText("English", ".settings-language-option");
    await waitFor(() => desktop.evaluate('document.documentElement.lang === "en"'), 10_000, "selected English language");
    assert.equal((await desktop.invoke("settingsGet")).language, "en");
    await desktop.close();
    desktop = await launch();
    assert.equal(await desktop.evaluate("document.documentElement.lang"), "en");
    const { sessions } = await desktop.invoke("sessionList");
    assert.ok(sessions.some((session) => session.id === sessionId && session.projectPath === project));
    if (await desktop.evaluate(`document.querySelector('[aria-label="Brand continuity"]').getAttribute('aria-expanded') !== 'true'`)) {
      await desktop.clickSelector('[aria-label="Brand continuity"]');
    }
    await desktop.clickSelector('.thread-item-main');
    await waitFor(visibleSession, 10_000, "restored session selected");
    await desktop.screenshot("04-restored-session-en.png");
  });
  report.result = "PASS";
} catch (error) {
  report.result = "FAIL";
  report.error = error instanceof Error ? error.message : String(error);
  if (desktop) {
    try {
      await desktop.screenshot("failure.png");
      report.visibleState = await desktop.evaluate(`({ title: document.title, language: document.documentElement.lang, body: document.body.innerText.slice(0, 2500) })`);
    } catch (captureError) {
      report.captureError = captureError instanceof Error ? captureError.message : String(captureError);
    }
  }
  throw error;
} finally {
  await desktop?.close();
  await writeFile(join(evidence, "verification.json"), JSON.stringify(report, null, 2) + "\n");
  console.log(`Evidence: ${evidence}`);
}
