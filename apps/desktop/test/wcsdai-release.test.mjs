import assert from "node:assert/strict";
import test from "node:test";
import { releaseReadinessErrors } from "../../../scripts/check-wcsdai-release.mjs";

const configured = {
  ready: "true",
  publish: [{ provider: "github", owner: "tiankongbushexian-crypto", repo: "WcSdAi-Desktop" }],
  releasesUrl: "https://github.com/tiankongbushexian-crypto/WcSdAi-Desktop/releases/latest",
};

test("release readiness rejects missing approval and upstream or incomplete delivery", () => {
  assert.equal(releaseReadinessErrors(configured).length, 0);
  assert.equal(releaseReadinessErrors({ ...configured, ready: undefined }).length, 1);
  assert.equal(releaseReadinessErrors({ ...configured, publish: [], releasesUrl: "" }).length, 2);
  assert.equal(releaseReadinessErrors({
    ...configured,
    publish: [{ provider: "github", owner: "vastsa", repo: "PI-Desktop" }],
    releasesUrl: "https://github.com/vastsa/PI-Desktop/releases/latest",
  }).length, 2);
});
