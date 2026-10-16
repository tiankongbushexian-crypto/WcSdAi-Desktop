import assert from "node:assert/strict";
import { setImmediate } from "node:timers/promises";
import test from "node:test";
import { installWindowChromeState } from "../src/lib/window-chrome-state.ts";

test("initial native state recovers fullscreen after reload and stale replies cannot undo later events", async () => {
  const requests = [];
  const maximizedListeners = new Set();
  const fullscreenListeners = new Set();
  const frames = new Map();
  const properties = new Map();
  const target = new EventTarget();
  target.document = { documentElement: { dataset: {}, style: {
    setProperty: (key, value) => properties.set(key, value),
    removeProperty: (key) => properties.delete(key),
  } } };
  target.requestAnimationFrame = (callback) => { frames.set(1, callback); return 1; };
  target.cancelAnimationFrame = (id) => frames.delete(id);
  const subscribe = (listeners) => (listener) => { listeners.add(listener); return () => listeners.delete(listener); };
  const dispose = installWindowChromeState(target, {
    windowControl: (action) => {
      assert.equal(action, "getState");
      return new Promise((resolve) => requests.push(resolve));
    },
    onWindowMaximized: subscribe(maximizedListeners),
    onWindowFullScreen: subscribe(fullscreenListeners),
  });
  const state = { maximized: false, fullScreen: true, zoomFactor: 1.5 };
  requests.shift()(state);
  await setImmediate();
  assert.deepEqual(target.document.documentElement.dataset, { maximized: "false", fullscreen: "true" });
  assert.equal(properties.get("--ds-window-zoom"), "1.5");
  for (const listener of fullscreenListeners) listener({ fullScreen: false });
  for (const listener of maximizedListeners) listener({ maximized: true });
  requests.shift()({ ...state, fullScreen: true });
  requests.shift()({ maximized: true, fullScreen: false, zoomFactor: 0.5 });
  await setImmediate();
  assert.deepEqual(target.document.documentElement.dataset, { maximized: "true", fullscreen: "false" });
  assert.equal(properties.get("--ds-window-zoom"), "0.5");
  target.dispatchEvent(new Event("resize"));
  target.dispatchEvent(new Event("resize"));
  assert.equal(frames.size, 1, "resize is coalesced to one read per frame");
  frames.get(1)(); frames.clear();
  assert.equal(requests.length, 1);
  target.dispatchEvent(new Event("resize"));
  dispose();
  requests.shift()(state);
  await setImmediate();
  assert.deepEqual(target.document.documentElement.dataset, {});
  assert.equal(properties.size, 0);
  assert.equal(frames.size, 0);
  assert.equal(maximizedListeners.size + fullscreenListeners.size, 0);
  target.dispatchEvent(new Event("resize"));
  assert.equal(frames.size, 0, "disposed owner does not restart reads");
});
