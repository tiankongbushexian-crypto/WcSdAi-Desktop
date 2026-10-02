import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { inflateSync } from "node:zlib";
import { prepareTrayImage } from "../electron/main/tray-image.ts";

function pngSize(bytes) {
  assert.deepEqual([...bytes.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10]);
  assert.equal(bytes[24], 8, "template uses 8-bit channels");
  assert.equal(bytes[25], 6, "template retains RGBA transparency");
  return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
}

// Decode the checked-in RGBA PNGs without adding a production image dependency.
function rgbaPixels(bytes) {
  const { width, height } = pngSize(bytes);
  assert.equal(bytes[28], 0, "template PNGs must be non-interlaced");
  const chunks = [];
  for (let offset = 8; offset < bytes.length;) {
    const length = bytes.readUInt32BE(offset);
    if (bytes.toString("ascii", offset + 4, offset + 8) === "IDAT") {
      chunks.push(bytes.subarray(offset + 8, offset + 8 + length));
    }
    offset += length + 12;
  }
  const raw = inflateSync(Buffer.concat(chunks));
  const stride = width * 4;
  assert.equal(raw.length, (stride + 1) * height);
  const pixels = Buffer.alloc(stride * height);
  for (let y = 0; y < height; y++) {
    const filter = raw[y * (stride + 1)];
    assert.ok(filter <= 4);
    for (let x = 0; x < stride; x++) {
      const index = y * stride + x;
      const left = x >= 4 ? pixels[index - 4] : 0;
      const above = y > 0 ? pixels[index - stride] : 0;
      const upperLeft = x >= 4 && y > 0 ? pixels[index - stride - 4] : 0;
      const prediction = left + above - upperLeft;
      const distances = [left, above, upperLeft].map((value) => Math.abs(prediction - value));
      const paeth = [left, above, upperLeft][distances.indexOf(Math.min(...distances))];
      const correction = [0, left, above, Math.floor((left + above) / 2), paeth][filter];
      pixels[index] = raw[y * (stride + 1) + x + 1] + correction;
    }
  }
  return { width, height, pixels };
}

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
      if (alpha >= 128) {
        minX = Math.min(minX, x); maxX = Math.max(maxX, x);
        minY = Math.min(minY, y); maxY = Math.max(maxY, y);
      }
      mass += alpha; massX += (x + 0.5) * alpha; massY += (y + 0.5) * alpha;
    }
  }
  return { width: (maxX - minX + 1) / scale, height: (maxY - minY + 1) / scale,
    centerX: massX / mass / scale, centerY: massY / mass / scale };
}

test("macOS tray ships point-sized artwork and a matching Retina representation", async () => {
  const normal = await readFile(new URL("../build/tray-icon-mac.png", import.meta.url));
  assert.deepEqual(pngSize(normal), { width: 26, height: 22 });
  const retina = await readFile(new URL("../build/tray-icon-mac@2x.png", import.meta.url));
  assert.deepEqual(pngSize(retina), { width: 52, height: 44 });
  const geometries = [templateGeometry(normal, 1), templateGeometry(retina, 2)];
  for (const geometry of geometries) {
    assert.ok(geometry.height >= 15 && geometry.height <= 17, "painted height fills the status item");
    assert.ok(geometry.width >= 22 && geometry.width <= 24, "wide logo retains its proportions");
    assert.ok(Math.abs(geometry.centerX - 13) <= 0.3, "horizontal optical center");
    assert.ok(Math.abs(geometry.centerY - 11) <= 0.55, "vertical optical center");
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
  const image = prepareTrayImage(imageDouble({ width: 26, height: 22 }, [1, 2]), "darwin");
  assert.deepEqual(image.getSize(), { width: 26, height: 22 });
  assert.deepEqual(image.getScaleFactors(), [1, 2]);
  assert.equal(image.isTemplateImage(), true);
});

for (const platform of ["win32", "linux"]) {
  test(`${platform} keeps the existing 16px non-template tray image`, () => {
    const image = prepareTrayImage(imageDouble({ width: 512, height: 512 }), platform);
    assert.deepEqual(image.getSize(), { width: 16, height: 16 });
    assert.equal(image.isTemplateImage(), false);
  });
}
