import assert from "node:assert/strict";

export function assertCssOnlyRejected(code, receipt, runId) {
  assert.equal(code, 1, "CSS-only fixture must exit with an assertion failure");
  assert.equal(receipt.runId, runId, "CSS-only failure evidence belongs to this run");
  assert.equal(receipt.status, "FAIL");
  assert.equal(receipt.cssOnly, true);
  assert.match(receipt.error, /^AssertionError \[ERR_ASSERTION\]: default 12 DIP corners: top-left must show backdrop 219,39,136, got \d+,\d+,\d+$/,
    "CSS-only fixture must fail the actual missing-backdrop pixel assertion");
}

/** Compare actual desktop pixels and hit ownership, independently of HRGN. */
export function assertCompositedCorners(result, backdropHandle, backdropRgb, label) {
  assert.equal(result.samples.length, 4, `${label}: four physical corners sampled`);
  for (const sample of result.samples) {
    assert.ok(sample.rgb.every((value, index) => Math.abs(value - backdropRgb[index]) <= 4),
      `${label}: ${sample.corner} must show backdrop ${backdropRgb}, got ${sample.rgb}`);
    assert.equal(sample.rootWindowHandle, backdropHandle,
      `${label}: ${sample.corner} must hit the backdrop window`);
  }
}

export function assertPhysicalRegionBounds(result, label) {
  assert.ok(result.dpi >= 96, `${label}: native window DPI reported`);
  assert.equal(result.regionBounds.left, 0, `${label}: native region starts at left window edge`);
  assert.equal(result.regionBounds.top, 0, `${label}: native region starts at top window edge`);
  // Fractional DIP -> physical pixel rounding can differ by one pixel.
  assert.ok(Math.abs(result.regionBounds.width - result.windowRect.width) <= 1,
    `${label}: native region width matches the physical window`);
  assert.ok(Math.abs(result.regionBounds.height - result.windowRect.height) <= 1,
    `${label}: native region height matches the physical window`);
}
