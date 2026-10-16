import type { api } from "./api";

type WindowChromeBridge = Pick<typeof api, "windowControl" | "onWindowMaximized" | "onWindowFullScreen">;

/** Keep native geometry in DIP, independently of page zoom and display DPI. */
export function installWindowChromeState(target: Window, bridge: WindowChromeBridge): () => void {
  const root = target.document.documentElement;
  let disposed = false;
  let revision = 0;
  let resizeFrame = 0;
  const refresh = async () => {
    const request = ++revision;
    try {
      const state = await bridge.windowControl("getState");
      if (disposed || request !== revision) return;
      root.dataset.maximized = String(state.maximized);
      root.dataset.fullscreen = String(state.fullScreen);
      root.style.setProperty("--ds-window-zoom", String(state.zoomFactor));
    } catch (error) {
      if (!disposed && request === revision) {
        console.warn("Unable to synchronize native window appearance", error);
      }
    }
  };
  // Subscribe before the snapshot: reload may have missed did-finish-load's
  // initial event, and later native events must invalidate an older response.
  const offMaximized = bridge.onWindowMaximized(({ maximized }) => {
    root.dataset.maximized = String(maximized);
    void refresh();
  });
  const offFullScreen = bridge.onWindowFullScreen(({ fullScreen }) => {
    root.dataset.fullscreen = String(fullScreen);
    void refresh();
  });
  const onResize = () => {
    if (resizeFrame) return;
    resizeFrame = target.requestAnimationFrame(() => {
      resizeFrame = 0;
      void refresh();
    });
  };
  target.addEventListener("resize", onResize);
  void refresh();
  return () => {
    disposed = true;
    offMaximized();
    offFullScreen();
    target.removeEventListener("resize", onResize);
    if (resizeFrame) target.cancelAnimationFrame(resizeFrame);
    delete root.dataset.maximized;
    delete root.dataset.fullscreen;
    root.style.removeProperty("--ds-window-zoom");
  };
}
