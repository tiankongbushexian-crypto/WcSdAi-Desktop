import assert from "node:assert/strict";
import test from "node:test";
import { assertCompositedCorners, assertCssOnlyRejected, assertPhysicalRegionBounds } from "./window-corner-assertions.mjs";

const color = [219, 39, 136];
function fixture() {
  return { kind: 3, dpi: 144, windowRect: { width: 1350, height: 975 },
    regionBounds: { left: 0, top: 0, width: 1350, height: 975 },
    samples: ["top-left", "top-right", "bottom-left", "bottom-right"].map((corner) => ({ corner, rgb: [...color], rootWindowHandle: "1234" })) };
}

test("physical corners show and hit the backdrop at fractional display scale", () => {
  const result = fixture();
  assertCompositedCorners(result, "1234", color, "rounded");
  assertPhysicalRegionBounds(result, "rounded");
});

test("a rounded HRGN cannot hide opaque composed pixels or foreground hit ownership", () => {
  const opaque = fixture();
  opaque.samples[0].rgb = [255, 255, 255];
  assert.throws(() => assertCompositedCorners(opaque, "1234", color, "opaque"), /must show backdrop/);
  const intercepting = fixture();
  intercepting.samples[2].rootWindowHandle = "5678";
  assert.throws(() => assertCompositedCorners(intercepting, "1234", color, "intercepting"), /must hit the backdrop/);
});

test("a stale unscaled HRGN cannot pass against the physical window dimensions", () => {
  const result = fixture();
  result.regionBounds = { left: 0, top: 0, width: 900, height: 650 };
  assert.throws(() => assertPhysicalRegionBounds(result, "stale DPI"), /width matches the physical window/);
});

test("negative control accepts only this run's missing-backdrop pixel assertion", () => {
  const receipt = { status: "FAIL", cssOnly: true, runId: "this-run", error: "AssertionError [ERR_ASSERTION]: default 12 DIP corners: top-left must show backdrop 219,39,136, got 255,255,255" };
  assertCssOnlyRejected(1, receipt, "this-run");
  assert.throws(() => assertCssOnlyRejected(0, receipt, "this-run"), /must exit/);
  assert.throws(() => assertCssOnlyRejected(1, { ...receipt, error: "Electron binary missing" }, "this-run"), /must fail the actual/);
  assert.throws(() => assertCssOnlyRejected(1, receipt, "new-run"), /belongs to this run/);
});
