import assert from "node:assert/strict";
import { EventEmitter } from "node:events";
import test from "node:test";
import { DEFAULT_WINDOW_CORNER_RADIUS, installWindowShape, roundedWindowShape, setWindowCornerRadius } from "../electron/main/window-shape.ts";
import { setWindowFullScreen } from "../electron/main/window-fullscreen.ts";

test("the default shape has visibly rounded corners without changing the window bounds", () => {
  assert.equal(DEFAULT_WINDOW_CORNER_RADIUS, 12);
  const rects = roundedWindowShape(1200, 800, DEFAULT_WINDOW_CORNER_RADIUS);
  assert.deepEqual(rects[0], { x: 9, y: 0, width: 1182, height: 1 });
  assert.deepEqual(rects[1], { x: 9, y: 799, width: 1182, height: 1 });
  assert.deepEqual(rects.at(-1), { x: 0, y: 12, width: 1200, height: 776 });
});

test("explicit small and square theme shapes remain supported", () => {
  const rects = roundedWindowShape(100, 80, 4);
  assert.deepEqual(rects[0], { x: 2, y: 0, width: 96, height: 1 });
  assert.deepEqual(rects[1], { x: 2, y: 79, width: 96, height: 1 });
  assert.deepEqual(rects.at(-1), { x: 0, y: 4, width: 100, height: 72 });
  assert.deepEqual(roundedWindowShape(100, 80, 0), []);
});

test("shape follows resize and becomes rectangular in maximized or fullscreen states", () => {
  const window = new EventEmitter();
  let bounds = { x: 20, y: 30, width: 100, height: 80 };
  let maximized = false;
  let lastShape = null;
  window.getBounds = () => bounds;
  window.isDestroyed = () => false;
  window.isMaximized = () => maximized;
  window.isFullScreen = () => false;
  window.setFullScreen = (value) => window.emit(value ? "enter-full-screen" : "leave-full-screen");
  window.setShape = (rects) => { lastShape = rects; };
  const shape = installWindowShape(window, 4);
  assert.deepEqual(lastShape[0], { x: 2, y: 0, width: 96, height: 1 });
  bounds = { ...bounds, width: 120 };
  window.emit("resize");
  assert.equal(lastShape[0].width, 116);
  maximized = true;
  window.emit("maximize");
  assert.deepEqual(lastShape, []);
  maximized = false;
  window.emit("unmaximize");
  assert.equal(lastShape[0].width, 116);
  setWindowFullScreen(window, true, true);
  assert.deepEqual(lastShape, []);
  setWindowFullScreen(window, false, true);
  assert.equal(lastShape[0].width, 116);
  assert.equal(shape.setRadius(100), 24);
  assert.equal(lastShape[0].width < 116, true);
  assert.equal(setWindowCornerRadius(window, 0), 0);
  assert.deepEqual(lastShape, []);
  assert.equal(setWindowCornerRadius(window, 4), 4);
  assert.equal(lastShape[0].width, 116);
  window.emit("closed");
  assert.equal(window.listenerCount("resize"), 0);
  assert.equal(setWindowCornerRadius(window, 8), null);
});
