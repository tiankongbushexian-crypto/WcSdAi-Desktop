#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";

const FORK = "tiankongbushexian-crypto/WcSdAi-Desktop";

export function releaseReadinessErrors({ ready, publish, releasesUrl }) {
  const errors = [];
  if (ready !== "true") errors.push("WCSDAI_RELEASE_READY must be explicitly enabled after the release checklist is complete.");
  if (!Array.isArray(publish) || publish.length !== 1 ||
      publish[0]?.provider !== "github" ||
      `${publish[0]?.owner}/${publish[0]?.repo}` !== FORK) {
    errors.push("Configure exactly one GitHub update feed owned by the WcSdAi fork.");
  }
  if (releasesUrl !== `https://github.com/${FORK}/releases/latest`) {
    errors.push("Confirm the WcSdAi release URL; upstream update delivery is prohibited.");
  }
  return errors;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const pkg = JSON.parse(readFileSync(new URL("../apps/desktop/package.json", import.meta.url), "utf8"));
  const updater = readFileSync(new URL("../apps/desktop/electron/main/updater.ts", import.meta.url), "utf8");
  const errors = releaseReadinessErrors({
    ready: process.env.WCSDAI_RELEASE_READY,
    publish: pkg.build.publish,
    releasesUrl: updater.match(/export const RELEASES_URL = "([^"]*)"/)?.[1],
  });
  if (errors.length) {
    console.error(errors.join("\n"));
    process.exitCode = 1;
  } else {
    console.log("WcSdAi release configuration is ready; platform signing and artifact gates still apply.");
  }
}
