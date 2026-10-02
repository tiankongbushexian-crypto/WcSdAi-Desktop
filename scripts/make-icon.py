#!/usr/bin/env python3
"""Render WcSdAi brand resources from the canonical monochrome SVG.

Run: python3 scripts/make-icon.py
Requires Pillow and Node.js with sharp available (locally or via NODE_PATH).
No dependencies are downloaded. Pillow emits ICO and ICNS on every platform.

SVG geometry is the source of truth; raster assets are generated outputs.
The app tile is white with rounded corners and transparent outer padding.
Renderer/tray marks stay transparent with pure black or white RGB values.
"""

from __future__ import annotations

import hashlib
import io
import json
import subprocess
import xml.etree.ElementTree as ET
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
BUILD = ROOT / "apps" / "desktop" / "build"
ASSETS = ROOT / "apps" / "desktop" / "src" / "assets"
SOURCE = BUILD / "wcsdai-symbol.svg"
SVG_NS = "http://www.w3.org/2000/svg"
SOURCE_PACKAGE = "WcSdAi-logo-refined/symbol/svg/symbol-black.svg"
SOURCE_SHA256 = "b8608e607e057df97b8485ac158e7e0aeb9e51e551ea71e9548e335103a315c8"
BASE = 1024
DURATIONS = [900, 180, 180, 180, 180, 180, 180, 240]
RENDER_JS = """
const fs = require('node:fs');
const sharp = require('sharp');
const size = Number(process.argv[1]);
sharp(fs.readFileSync(0), { density: 288 })
  .resize(size, size).png().toBuffer()
  .then(data => process.stdout.write(data))
  .catch(error => { console.error(error.message); process.exitCode = 1; });
"""


def symbol_body() -> str:
    """Accept only the checked-in, self-contained vector mark."""
    svg = ET.fromstring(SOURCE.read_text())
    allowed = {f"{{{SVG_NS}}}{tag}" for tag in ("svg", "title", "g", "path")}
    if svg.get("viewBox") != "0 0 512 512":
        raise ValueError("canonical symbol must use a 512px square viewBox")
    for node in svg.iter():
        if node.tag not in allowed:
            raise ValueError(f"unsupported canonical SVG element: {node.tag}")
        if any("href" in key or key.startswith("on") for key in node.attrib):
            raise ValueError("canonical SVG must not contain external resources or events")
        if node.get("fill", "none") not in ("none", "#000000"):
            raise ValueError("canonical symbol must use pure black")
    group = svg.find(f"{{{SVG_NS}}}g")
    if group is None:
        raise ValueError("canonical symbol has no geometry")
    ET.register_namespace("", SVG_NS)
    return ET.tostring(group, encoding="unicode")


def svg_document(body: str, view_box: int = BASE) -> str:
    return (
        f'<svg xmlns="{SVG_NS}" width="{view_box}" height="{view_box}" '
        f'viewBox="0 0 {view_box} {view_box}" role="img" '
        f'aria-label="WcSdAi"><title>WcSdAi</title>{body}</svg>\n'
    )


def mark_svg(body: str, color: str, scale: float = 1.0) -> str:
    offset = 256 * (1 - scale)
    group = body.replace("#000000", color)
    return svg_document(
        f'<g transform="translate({offset:g} {offset:g}) scale({scale:g})">'
        f"{group}</g>",
        512,
    )


def render(svg: str, size: int) -> Image.Image:
    output = subprocess.run(
        ["node", "-e", RENDER_JS, str(size)],
        input=svg.encode(), capture_output=True, check=False,
    )
    if output.returncode:
        raise RuntimeError(
            "SVG rendering failed; provide Node.js and sharp via NODE_PATH:\n"
            + output.stderr.decode()
        )
    return Image.open(io.BytesIO(output.stdout)).convert("RGBA")


def render_mark(body: str, color: str, size: int, scale: float = 1) -> Image.Image:
    # Keep RGB constant even at antialiased transparent edges.
    alpha = render(mark_svg(body, color, scale), size).getchannel("A")
    result = Image.new("RGBA", (size, size), color)
    result.putalpha(alpha)
    return result


def save_png(image: Image.Image, path: Path, outputs: list[Path]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    image.save(path, optimize=True)
    outputs.append(path)


def save_motion(body: str, color: str, theme: str, outputs: list[Path]) -> None:
    # Keep the established eight-frame cadence and reduced-motion first frame.
    scales = [1, 1.016, 1.032, 1.046, 1.034, 1.019, 1.006, 0.994]
    frames = [render_mark(body, color, 200, scale) for scale in scales]
    save_png(frames[0], ASSETS / f"home-mascot-still-{theme}.png", outputs)
    indexed = []
    rgb = (0, 0, 0) if color == "#000000" else (255, 255, 255)
    for frame in frames:
        # GIF only supports binary alpha. A fixed two-color palette prevents
        # tinted outlines and remains transparent on every theme surface.
        index = frame.getchannel("A").point(lambda alpha: 1 if alpha >= 128 else 0)
        indexed_frame = Image.frombytes("P", frame.size, index.tobytes())
        indexed_frame.putpalette([0, 0, 0, *rgb] + [0] * (256 * 3 - 6))
        indexed.append(indexed_frame)
    path = ASSETS / f"home-mascot-{theme}.gif"
    indexed[0].save(
        path, save_all=True, append_images=indexed[1:], duration=DURATIONS,
        loop=0, transparency=0, disposal=2, optimize=False,
    )
    outputs.append(path)


def validate(path: Path) -> dict[str, object]:
    with Image.open(path) as image:
        sizes = sorted(image.ico.sizes()) if image.format == "ICO" else [image.size]
        durations = []
        for i in range(getattr(image, "n_frames", 1)):
            image.seek(i)
            rgba = image.convert("RGBA")
            if any(r != g or g != b for r, g, b, a in rgba.getdata() if a):
                raise ValueError(f"non-neutral pixel in {path}")
            if image.format == "GIF":
                durations.append(image.info["duration"])
        if durations and durations != DURATIONS:
            raise ValueError(f"animation cadence changed: {durations}")
        return {
            "path": path.relative_to(ROOT).as_posix(),
            "sha256": hashlib.sha256(path.read_bytes()).hexdigest(),
            "sizes": sizes,
            "alpha_extrema": rgba.getchannel("A").getextrema(),
            "frames_ms": durations,
        }


def main() -> None:
    body = symbol_body()
    outputs: list[Path] = []
    tile = '<rect x="80" y="80" width="864" height="864" rx="196" fill="#FFFFFF"/>'
    app_svg = svg_document(tile + f'<g transform="translate(128 128) scale(1.5)">{body}</g>')
    (BUILD / "wcsdai-app-icon.svg").write_text(app_svg)
    (ROOT / "docs" / "public" / "brand-mark.svg").write_text(app_svg)
    master = render(app_svg, BASE)
    save_png(master, BUILD / "icon_1024.png", outputs)
    save_png(render(app_svg, 512), BUILD / "icon.png", outputs)
    save_png(master, ROOT / "docs" / "public" / "app-icon.png", outputs)
    save_png(render(app_svg, 512), ROOT / "docs" / "image" / "readme" / "logo.png", outputs)
    for theme, color in (("light", "#000000"), ("dark", "#FFFFFF")):
        save_png(render_mark(body, color, 192), ASSETS / "brand" / f"logo-{theme}.png", outputs)
        save_motion(body, color, theme, outputs)
    save_png(render_mark(body, "#FFFFFF", BASE), BUILD / "logo_dark.png", outputs)
    save_png(render_mark(body, "#000000", BASE), BUILD / "tray-icon-mac.png", outputs)

    windows_icon = BUILD / "icon.ico"
    master.save(windows_icon, format="ICO", sizes=[(s, s) for s in (16, 32, 48, 64, 128, 256)])
    outputs.append(windows_icon)
    iconset = BUILD / "icon.iconset"
    iconset.mkdir(exist_ok=True)
    rendered_sizes: dict[int, Image.Image] = {}
    for size in (16, 32, 128, 256, 512):
        for factor, suffix in ((1, ""), (2, "@2x")):
            pixels = size * factor
            if pixels not in rendered_sizes:
                rendered_sizes[pixels] = render(app_svg, pixels)
            rendered_sizes[pixels].save(iconset / f"icon_{size}x{size}{suffix}.png")
    # Pillow's ICNS writer accepts exact vector-rendered PNG representations,
    # keeping generation portable without silently leaving a stale macOS icon.
    icns = BUILD / "icon.icns"
    master.save(icns, format="ICNS", append_images=list(rendered_sizes.values()))
    outputs.append(icns)

    manifest = {
        "source_package": SOURCE_PACKAGE,
        "source_sha256": SOURCE_SHA256,
        "canonical_source": SOURCE.relative_to(ROOT).as_posix(),
        "canonical_sha256": hashlib.sha256(SOURCE.read_bytes()).hexdigest(),
        "source_rights": "User supplied; license and trademark authorization pending confirmation before release.",
        "changes": "Preserve all vector paths; normalize #111827 to #000000; derive white reverse marks and rounded white app tile.",
        "outputs": [validate(path) for path in outputs],
    }
    (BUILD / "brand-assets.json").write_text(json.dumps(manifest, indent=2) + "\n")
    print(f"Rendered and validated {len(outputs)} monochrome assets from {SOURCE.name}")


if __name__ == "__main__":
    main()
