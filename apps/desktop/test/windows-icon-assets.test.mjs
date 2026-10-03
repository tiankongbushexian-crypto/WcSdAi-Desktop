import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { icoRepresentations } from "./helpers/brand-image.mjs";

const appSizes = [16, 20, 24, 32, 40, 48, 64, 128, 256];
const traySizes = [16, 20, 24, 32, 40, 48, 64];

function geometry(frame, include) {
  const { width, height, pixels } = frame;
  let left = width, top = height, right = -1, bottom = -1, painted = 0;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const offset = (y * width + x) * 4;
      const rgba = [...pixels.subarray(offset, offset + 4)];
      const [r, g, b, alpha] = rgba;
      if (alpha > 0) assert.ok(r === g && g === b, "brand artwork remains monochrome");
      if (!include(rgba)) continue;
      left = Math.min(left, x); right = Math.max(right, x);
      top = Math.min(top, y); bottom = Math.max(bottom, y);
      painted++;
    }
  }
  assert.ok(painted > 0);
  return { width: right - left + 1, height: bottom - top + 1, painted,
    centerX: (left + right + 1) / 2, centerY: (top + bottom + 1) / 2 };
}

function transparentSurface(frame) {
  const { width, height, pixels } = frame;
  // A rounded white tile can also have transparent corners. Sample through the
  // top center and the symbol's internal opening to catch that actual defect.
  const alpha = (x, y) => pixels[(y * width + x) * 4 + 3];
  for (const [x, y] of [[0, 0], [width - 1, height - 1],
    [Math.floor(width / 2), Math.floor(height * 0.1)]]) {
    assert.equal(alpha(x, y), 0, "empty canvas and internal gaps have no white background");
  }
  assert.ok(alpha(Math.floor(width * 0.63), Math.floor(height * 0.42)) < 96,
    "internal opening is transparent apart from small-size antialiasing");
}

test("Windows application ICO removes the tile and fills desktop/taskbar sizes with the logo", async () => {
  const frames = icoRepresentations(await readFile(new URL("../build/icon.ico", import.meta.url)));
  for (const frame of frames) {
    assert.equal(frame.height, frame.width);
    transparentSurface(frame);
    const black = geometry(frame, ([r, , , alpha]) => r < 96 && alpha >= 128);
    assert.ok(black.width >= frame.width * 0.8, "logo uses the small icon canvas instead of tile padding");
    assert.ok(black.width <= frame.width * 0.94, "logo retains surrounding transparent space");
    assert.ok(black.height >= frame.height * 0.55 && black.height <= frame.height * 0.67,
      "canonical wide symbol retains its proportions");
    const silhouette = geometry(frame, ([, , , alpha]) => alpha >= 128);
    assert.ok(silhouette.painted < frame.width * frame.height * 0.46,
      "narrow white contour must not turn back into an opaque application tile");
    assert.ok(Math.abs(silhouette.centerX - frame.width / 2) <= 0.5);
    assert.ok(Math.abs(silhouette.centerY - frame.height / 2) <= 0.5);
  }
  assert.deepEqual(frames.map(frame => frame.width), appSizes);
});

for (const [theme, color] of [["light", 0], ["dark", 255]]) {
  test(`Windows ${theme} tray has native DPI layers with a transparent monochrome silhouette`, async () => {
    const frames = icoRepresentations(await readFile(new URL(`../build/tray-icon-win-${theme}.ico`, import.meta.url)));
    assert.deepEqual(frames.map(frame => frame.width), traySizes);
    for (const frame of frames) {
      transparentSurface(frame);
      for (let offset = 0; offset < frame.pixels.length; offset += 4) {
        if (frame.pixels[offset + 3] === 0) continue;
        assert.deepEqual([...frame.pixels.subarray(offset, offset + 3)], [color, color, color]);
      }
      const mark = geometry(frame, ([, , , alpha]) => alpha >= 128);
      assert.ok(mark.width >= frame.width * 0.8 && mark.width <= frame.width * 0.94);
      assert.ok(mark.height >= frame.height * 0.55 && mark.height <= frame.height * 0.67);
      assert.ok(Math.abs(mark.centerY - frame.height / 2) <= 0.5);
    }
  });
}
