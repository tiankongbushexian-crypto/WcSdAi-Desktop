import type { NativeImage, NativeTheme, Tray } from "electron";
import { existsSync } from "node:fs";
import { join } from "node:path";
import type { Logger } from "./logger";

/** Prepare PNG trays; Windows passes a multi-resolution ICO path instead. */
export function prepareTrayImage(
  source: NativeImage,
  platform: NodeJS.Platform,
): NativeImage {
  if (platform === "darwin") {
    source.setTemplateImage(true);
    return source;
  }
  return source.resize({ width: 16, height: 16 });
}

type TrayIconDependencies = {
  platform: NodeJS.Platform;
  resourceRoot: string;
  packaged: boolean;
  nativeTheme: Pick<NativeTheme, "shouldUseDarkColorsForSystemIntegratedUI" | "on" | "off">;
  loadImage: (path: string) => NativeImage;
  createNativeTray: (image: NativeImage | string) => Tray;
  logger: Pick<Logger, "app">;
};

/** Own native image selection, system-appearance updates and tray disposal. */
export function createTrayIconController({
  platform, resourceRoot, packaged, nativeTheme, loadImage, createNativeTray, logger,
}: TrayIconDependencies) {
  let tray: Tray | null = null;
  let displayedPath: string | null = null;
  let disposed = false;

  function trayIconPath(): string | null {
    const filename = platform === "darwin"
      ? "tray-icon-mac.png"
      : platform === "win32"
        ? `tray-icon-win-${nativeTheme.shouldUseDarkColorsForSystemIntegratedUI ? "dark" : "light"}.ico`
        : packaged ? "tray-icon.png" : "icon.png";
    const path = join(resourceRoot, filename);
    if (existsSync(path)) return path;
    logger.app("lifecycle", "warn", "tray icon missing", { data: { iconPath: path } });
    return null;
  }

  function updateWindowsTrayImage() {
    if (!tray || disposed || tray.isDestroyed()) return;
    const path = trayIconPath();
    if (!path || path === displayedPath) return;
    try {
      // Passing the ICO path lets Windows select its native DPI representation.
      tray.setImage(path);
      displayedPath = path;
    } catch (error) {
      logger.app("lifecycle", "warn", "tray icon update failed", {
        data: { iconPath: path, error: String(error) },
      });
    }
  }

  function create(): Tray | null {
    if (disposed) return null;
    if (tray) return tray;
    const path = trayIconPath();
    if (!path) return null;
    let image: NativeImage | string = path;
    if (platform !== "win32") {
      const source = loadImage(path);
      if (source.isEmpty()) {
        logger.app("lifecycle", "warn", "tray icon could not be loaded", {
          data: { iconPath: path },
        });
        return null;
      }
      image = prepareTrayImage(source, platform);
    }
    try {
      tray = createNativeTray(image);
    } catch (error) {
      logger.app("lifecycle", "warn", "tray icon could not be created", {
        data: { iconPath: path, error: String(error) },
      });
      return null;
    }
    displayedPath = path;
    if (platform === "win32") nativeTheme.on("updated", updateWindowsTrayImage);
    return tray;
  }

  function dispose() {
    if (disposed) return;
    disposed = true;
    if (platform === "win32") nativeTheme.off("updated", updateWindowsTrayImage);
    if (tray && !tray.isDestroyed()) tray.destroy();
    tray = null;
    displayedPath = null;
  }

  return { create, dispose };
}
