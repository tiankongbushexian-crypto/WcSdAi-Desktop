import type { NativeImage } from "electron";

/** Preserve the point-sized macOS template and its loaded Retina image. */
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
