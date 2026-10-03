import assert from "node:assert/strict";
import { inflateSync } from "node:zlib";

export function pngSize(bytes) {
  assert.deepEqual([...bytes.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10]);
  assert.equal(bytes[24], 8, "template uses 8-bit channels");
  assert.equal(bytes[25], 6, "template retains RGBA transparency");
  return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
}

// Decode the checked-in RGBA PNGs without adding a production image dependency.
export function rgbaPixels(bytes) {
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

export function icoRepresentations(bytes) {
  assert.equal(bytes.readUInt16LE(0), 0);
  assert.equal(bytes.readUInt16LE(2), 1, "file must be a Windows icon");
  const count = bytes.readUInt16LE(4);
  assert.ok(count > 0 && bytes.length >= 6 + count * 16);
  const frames = [];
  for (let index = 0; index < count; index++) {
    const at = 6 + index * 16;
    const width = bytes[at] || 256, height = bytes[at + 1] || 256;
    const length = bytes.readUInt32LE(at + 8), offset = bytes.readUInt32LE(at + 12);
    assert.ok(offset >= 6 + count * 16 && offset + length <= bytes.length);
    const frame = rgbaPixels(bytes.subarray(offset, offset + length));
    assert.deepEqual([frame.width, frame.height], [width, height]);
    frames.push(frame);
  }
  assert.equal(new Set(frames.map(frame => frame.width)).size, count, "DPI sizes must be unique");
  return frames.sort((a, b) => a.width - b.width);
}
