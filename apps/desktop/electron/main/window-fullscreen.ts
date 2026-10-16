import type { BrowserWindow } from "electron";

// Electron's Win32 thickFrame:false path fills display.bounds() but leaves
// BrowserWindow.isFullScreen() false. Track that fallback for toggle and state.
// Transparent Win32 maximize and thickFrame:false fullscreen share Electron's
// restore-bounds slot. Keep only the prior mode here; Electron still owns bounds.
const borderlessFullScreen = new WeakMap<BrowserWindow, boolean>();

export function isWindowFullScreen(window: BrowserWindow): boolean {
  return borderlessFullScreen.has(window) || window.isFullScreen();
}

export function setWindowFullScreen(
  window: BrowserWindow,
  fullScreen: boolean,
  borderlessWindowsMain: boolean,
): void {
  if (!borderlessWindowsMain) {
    window.setFullScreen(fullScreen);
    return;
  }
  if (fullScreen) {
    if (borderlessFullScreen.has(window)) return;
    const wasMaximized = window.isMaximized();
    borderlessFullScreen.set(window, wasMaximized);
    if (wasMaximized) window.unmaximize();
    window.setFullScreen(true);
  } else {
    const wasMaximized = borderlessFullScreen.get(window);
    if (wasMaximized === undefined) return;
    borderlessFullScreen.delete(window);
    window.setFullScreen(false);
    if (wasMaximized) window.maximize();
  }
}
