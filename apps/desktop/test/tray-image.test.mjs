import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { pngSize, rgbaPixels } from "./helpers/brand-image.mjs";
import { prepareTrayImage } from "../electron/main/tray-image.ts";

function templateGeometry(bytes, scale) {
  const { width, height, pixels } = rgbaPixels(bytes);
  let minX = width, minY = height, maxX = -1, maxY = -1;
  let mass = 0, massX = 0, massY = 0;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      const alpha = pixels[i + 3];
      assert.equal(pixels[i] + pixels[i + 1] + pixels[i + 2], 0, "template pixels stay pure black");
      if (x === 0 || x === width - 1 || y === 0 || y === height - 1) {
        assert.equal(alpha, 0, "the full mark fits within transparent margins");
      }
      // Include visible antialiased edge pixels when centering the silhouette.
      if (alpha >= 16) {
        minX = Math.min(minX, x); maxX = Math.max(maxX, x);
        minY = Math.min(minY, y); maxY = Math.max(maxY, y);
      }
      mass += alpha; massX += (x + 0.5) * alpha; massY += (y + 0.5) * alpha;
    }
  }
  return { width: (maxX - minX + 1) / scale, height: (maxY - minY + 1) / scale,
    boundsCenterX: (minX + maxX + 1) / 2 / scale,
    boundsCenterY: (minY + maxY + 1) / 2 / scale,
    centerX: massX / mass / scale, centerY: massY / mass / scale };
}

test("macOS tray ships point-sized artwork and a matching Retina representation", async () => {
  const normal = await readFile(new URL("../build/tray-icon-mac.png", import.meta.url));
  assert.deepEqual(pngSize(normal), { width: 22, height: 22 });
  const retina = await readFile(new URL("../build/tray-icon-mac@2x.png", import.meta.url));
  assert.deepEqual(pngSize(retina), { width: 44, height: 44 });
  const geometries = [templateGeometry(normal, 1), templateGeometry(retina, 2)];
  for (const geometry of geometries) {
    assert.ok(geometry.height >= 13 && geometry.height <= 15, "painted height fits neighboring status items");
    assert.ok(geometry.width >= 19 && geometry.width <= 21, "wide logo retains its proportions");
    assert.ok(Math.abs(geometry.boundsCenterX - 11) <= 0.25, "horizontal painted bounds center");
    assert.ok(Math.abs(geometry.boundsCenterY - 11) <= 0.25, "vertical painted bounds center without a downward offset");
  }
  assert.ok(Math.abs(geometries[0].centerY - geometries[1].centerY) < 0.1);
  assert.ok(Math.abs(geometries[0].centerX - geometries[1].centerX) < 0.1);
});

function imageDouble(size, scales = [1]) {
  return {
    template: false,
    getSize: () => size,
    getScaleFactors: () => scales,
    isTemplateImage() { return this.template; },
    setTemplateImage(value) { this.template = value; },
    resize(nextSize) { return imageDouble(nextSize); },
  };
}

test("macOS preserves logical dimensions and Retina representations while enabling template tinting", () => {
  const image = prepareTrayImage(imageDouble({ width: 22, height: 22 }, [1, 2]), "darwin");
  assert.deepEqual(image.getSize(), { width: 22, height: 22 });
  assert.deepEqual(image.getScaleFactors(), [1, 2]);
  assert.equal(image.isTemplateImage(), true);
});

test("Linux keeps the existing 16px non-template tray image", () => {
  const image = prepareTrayImage(imageDouble({ width: 512, height: 512 }), "linux");
  assert.deepEqual(image.getSize(), { width: 16, height: 16 });
  assert.equal(image.isTemplateImage(), false);
});
