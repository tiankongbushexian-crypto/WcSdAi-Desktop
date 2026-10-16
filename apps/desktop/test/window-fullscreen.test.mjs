import assert from "node:assert/strict";
import { EventEmitter } from "node:events";
import test from "node:test";
import { isWindowFullScreen, setWindowFullScreen } from "../electron/main/window-fullscreen.ts";

const normalBounds = { x: 70, y: 60, width: 900, height: 620 };
const workArea = { x: 0, y: 0, width: 1920, height: 1040 };
const displayBounds = { x: 0, y: 0, width: 1920, height: 1080 };

// Model the external Electron 43.6.0 Win32 API: transparent Maximize and
// thickFrame:false SetFullScreen share one restore_bounds_ slot. IsMaximized
// compares the physical bounds with work_area; IsFullScreen stays false.
// https://github.com/electron/electron/blob/v43.6.0/shell/browser/native_window_views.cc
class BorderlessWindow extends EventEmitter {
  #bounds = { ...normalBounds };
  #restoreBounds = { ...normalBounds };
  getBounds() { return { ...this.#bounds }; }
  isMaximized() { return Object.keys(workArea).every((key) => this.#bounds[key] === workArea[key]); }
  isFullScreen() { return false; }
  maximize() {
    this.#restoreBounds = this.getBounds();
    this.#bounds = { ...workArea };
    this.emit("maximize");
  }
  unmaximize() {
    if (!this.isMaximized()) return;
    this.#bounds = { ...this.#restoreBounds };
    this.emit("unmaximize");
  }
  setFullScreen(enabled) {
    this.emit(enabled ? "enter-full-screen" : "leave-full-screen");
    if (enabled) {
      this.#restoreBounds = this.getBounds();
      this.#bounds = { ...displayBounds };
    } else {
      this.#bounds = { ...this.#restoreBounds };
    }
    this.emit("resize");
  }
}

test("maximized fullscreen returns to maximized then restores the original normal bounds", () => {
  const window = new BorderlessWindow();
  window.maximize();
  setWindowFullScreen(window, true, true);
  assert.equal(isWindowFullScreen(window), true);
  assert.deepEqual(window.getBounds(), displayBounds);
  setWindowFullScreen(window, false, true);
  assert.equal(isWindowFullScreen(window), false);
  assert.equal(window.isMaximized(), true);
  assert.deepEqual(window.getBounds(), workArea);
  window.unmaximize();
  assert.deepEqual(window.getBounds(), normalBounds);
});

test("repeated fullscreen requests preserve the original normal bounds", () => {
  const window = new BorderlessWindow();
  setWindowFullScreen(window, true, true);
  setWindowFullScreen(window, true, true);
  assert.equal(isWindowFullScreen(window), true);
  setWindowFullScreen(window, false, true);
  setWindowFullScreen(window, false, true);
  assert.equal(isWindowFullScreen(window), false);
  assert.equal(window.isMaximized(), false);
  assert.deepEqual(window.getBounds(), normalBounds);
});

test("repeated fullscreen requests preserve the prior maximized state across cycles", () => {
  const window = new BorderlessWindow();
  for (let cycle = 0; cycle < 2; cycle += 1) {
    window.maximize();
    setWindowFullScreen(window, true, true);
    setWindowFullScreen(window, true, true);
    setWindowFullScreen(window, false, true);
    setWindowFullScreen(window, false, true);
    assert.equal(window.isMaximized(), true);
    window.unmaximize();
    assert.deepEqual(window.getBounds(), normalBounds);
  }
  setWindowFullScreen(window, true, true);
  setWindowFullScreen(window, false, true);
  assert.equal(window.isMaximized(), false);
  assert.deepEqual(window.getBounds(), normalBounds);
});

test("a closed fullscreen window does not transfer state to a replacement window", () => {
  const closing = new BorderlessWindow();
  closing.maximize();
  setWindowFullScreen(closing, true, true);
  closing.emit("closed");
  const replacement = new BorderlessWindow();
  assert.equal(isWindowFullScreen(replacement), false);
  setWindowFullScreen(replacement, true, true);
  setWindowFullScreen(replacement, false, true);
  assert.equal(replacement.isMaximized(), false);
  assert.deepEqual(replacement.getBounds(), normalBounds);
});

test("other platforms retain native fullscreen and maximized-state ownership", () => {
  let nativeFullScreen = false;
  const window = {
    isFullScreen: () => nativeFullScreen,
    setFullScreen: (value) => { nativeFullScreen = value; },
    isMaximized: () => { throw new Error("native maximized state belongs to Electron"); },
    maximize: () => { throw new Error("must not change native maximized state"); },
    unmaximize: () => { throw new Error("must not change native maximized state"); },
  };
  setWindowFullScreen(window, true, false);
  assert.equal(isWindowFullScreen(window), true);
  setWindowFullScreen(window, false, false);
  assert.equal(isWindowFullScreen(window), false);
});
