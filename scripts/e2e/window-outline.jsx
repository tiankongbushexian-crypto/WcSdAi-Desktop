// Production controls and CSS; only the native preload boundary is simulated.
import { createRoot } from "react-dom/client";
import { flushSync } from "react-dom";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { IPC } from "@pi-desktop/shared";
import { installWindowChromeState } from "../../apps/desktop/src/lib/window-chrome-state";
import { api } from "../../apps/desktop/src/lib/api";
import { WindowControls } from "../../apps/desktop/src/components/WindowControls";

const listeners = new Set();
const fullscreenListeners = new Set();
let fullScreen = true;
let maximized = false;
let initialState;
const actions = [];
window.piDesktop = {
  platform: "win32",
  on(channel, listener) {
    if (channel === IPC.event.windowFullScreen) {
      fullscreenListeners.add(listener);
      return () => fullscreenListeners.delete(listener);
    }
    if (channel !== IPC.event.windowMaximized) throw new Error(`Unexpected event ${channel}`);
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  async invoke(channel, { action }) {
    if (channel !== IPC.invoke.windowControl) throw new Error(`Unexpected IPC ${channel}`);
    actions.push(action);
    if (action === "getState" && !initialState) return new Promise((resolve) => { initialState = resolve; });
    if (action === "toggleMaximize") {
      maximized = !maximized;
      for (const listener of listeners) listener({ maximized });
    }
    return { ok: true, data: { maximized, fullScreen, zoomFactor: await window.fixtureNative.getZoomFactor() } };
  },
};
await i18n.use(initReactI18next).init({ lng: "en", resources: {} });
const root = createRoot(document.getElementById("root"));
const element = document.documentElement;
element.style.setProperty("--ds-window-corner-radius", "12px");
flushSync(() => root.render(<WindowControls />));
const disposeState = installWindowChromeState(window, api);
const settle = async () => { await new Promise(requestAnimationFrame); await new Promise(requestAnimationFrame); };
function assert(value, label) { if (!value) throw new Error(label); }
const outline = () => getComputedStyle(document.body, "::after");
async function press(label) {
  const button = document.querySelector(`[aria-label="${label}"]`);
  assert(button, `Missing ${label} button`);
  const rect = button.getBoundingClientRect();
  assert(button.contains(document.elementFromPoint(rect.x + rect.width / 2, rect.y + rect.height / 2)), `${label} must not be covered by the outline`);
  button.click();
  await settle();
}

window.windowOutlineProbe = async () => {
  await settle();
  assert(element.dataset.fullscreen === "true" && outline().content === "none", "initial state recovers fullscreen when its initial event was missed on reload");
  fullScreen = false;
  for (const listener of fullscreenListeners) listener({ fullScreen });
  await settle();
  const results = [];
  for (const theme of ["light", "dark"]) {
    element.dataset.theme = theme;
    await settle();
    const style = outline();
    assert(style.content === '""' && style.borderTopWidth === "1px", `${theme}: a visible one-pixel window perimeter is required`);
    assert(style.borderRadius === "12px", `${theme}: outline follows the native default radius`);
    assert(style.pointerEvents === "none", `${theme}: outline cannot intercept pointer actions`);
    assert(style.borderTopColor !== "rgba(0, 0, 0, 0)", `${theme}: border must be visible`);
    results.push({ theme, color: style.borderTopColor, radius: style.borderRadius });
  }
  assert(results[0].color !== results[1].color, "outline must follow the light/dark palette");
  // A native event arriving before getState must not be undone by its stale reply.
  maximized = true;
  for (const listener of listeners) listener({ maximized });
  initialState({ ok: true, data: { maximized: false, fullScreen: false, zoomFactor: 1 } });
  await settle();
  assert(document.querySelector('[aria-label="Restore"]'), "late initial state cannot undo native maximize");
  assert(outline().content === "none", "maximized windows have no inset perimeter");
  await press("Restore");
  assert(outline().content === '""', "restore restores the perimeter");
  await press("Maximize");
  assert(outline().content === "none", "maximize removes the perimeter");
  await press("Restore");
  fullScreen = true;
  for (const listener of fullscreenListeners) listener({ fullScreen });
  await settle();
  assert(outline().content === "none", "fullscreen has no perimeter");
  fullScreen = false;
  for (const listener of fullscreenListeners) listener({ fullScreen });
  await settle();
  element.style.setProperty("--ds-window-corner-radius", "0px");
  assert(outline().borderRadius === "0px", "square plugin themes retain square outlines");
  element.style.setProperty("--ds-window-corner-radius", "24px");
  assert(outline().borderRadius === "24px", "maximum plugin radius remains supported");
  await press("Minimize");
  await press("Close");
  assert(actions.includes("minimize") && actions.includes("close"), "minimize and close remain reachable");
  for (const platform of ["darwin", "linux"]) {
    element.dataset.platform = platform;
    assert(outline().content === "none", `${platform} must keep its existing native chrome`);
  }
  element.dataset.platform = "win32";
  element.dataset.surface = "plugin-launcher";
  assert(outline().content === "none", "auxiliary windows must not gain the main-window perimeter");
  delete element.dataset.surface;
  element.style.setProperty("--ds-window-corner-radius", "12px");
  return { status: "PASS", coverage: "Windows renderer emulation; native Windows shape/resize not exercised on macOS", results };
};

window.windowOutlineZoomProbe = async (zoom) => {
  const end = performance.now() + 5000;
  while (Number(element.style.getPropertyValue("--ds-window-zoom")) !== zoom && performance.now() < end) await settle();
  assert(Number(element.style.getPropertyValue("--ds-window-zoom")) === zoom, "native zoom must synchronize after resize");
  const radiusDip = parseFloat(outline().borderRadius) * zoom;
  const borderDip = parseFloat(outline().borderTopWidth) * zoom;
  assert(Math.abs(radiusDip - 12) < 0.02, `zoom ${zoom}: radius ${radiusDip} DIP must match the 12 DIP native cutout`);
  assert(Math.abs(borderDip - 1) < 0.51, `zoom ${zoom}: border ${borderDip} DIP must remain within physical pixel rounding`);
  return { zoom, devicePixelRatio, radiusDip, borderDip };
};
window.windowOutlineDisposeProbe = () => {
  disposeState();
  flushSync(() => root.unmount());
  assert(listeners.size + fullscreenListeners.size === 0 && element.dataset.maximized === undefined && element.dataset.fullscreen === undefined, "disposal removes listeners and state attributes");
};
