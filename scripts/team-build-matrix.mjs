#!/usr/bin/env node
/** Validate dispatch input before scheduling native installer runners. */
import { appendFileSync } from "node:fs";

const platform = process.env.TEAM_BUILD_PLATFORM ?? "all";
if (platform !== "all" && platform !== "windows") {
  throw new Error("Unsupported team build platform; expected all or windows");
}

const targets = [
  { os: "macos-15", platform: "macos", arch: "arm64" },
  { os: "macos-15-intel", platform: "macos", arch: "x64" },
  { os: "windows-latest", platform: "windows", arch: "x64" },
];
const matrix = { include: targets.filter((target) => platform === "all" || target.platform === platform) };
const output = `matrix=${JSON.stringify(matrix)}\n`;
if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, output);
process.stdout.write(output);
