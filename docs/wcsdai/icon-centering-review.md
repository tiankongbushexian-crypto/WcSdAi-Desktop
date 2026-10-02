# WcSdAi application icon centering review

- Review date: 2026-10-02 (Asia/Shanghai).
- Status: **Owner approved candidate A: 12% enlargement with a 27 px optical offset.**
- Scope: application mark size/placement and its generated native/documentation
  icons. This asset change does not install the application, publish a package
  or change user data.

## Finding

The current application icon is geometrically centered. In the 1024 px master,
the black mark occupies `[216, 308, 808, 716)` and the rounded white tile occupies
`[80, 80, 944, 944)`. Its top and bottom bounding-box margins inside the tile are
both 228 px. The installed application's ICNS hash matches this repository
baseline, so the observed appearance is not caused by a stale installed icon.

The broad upper strokes contain more black area than the lower strokes. The
centroid of the thresholded black pixels is at `y = 467.7598`, while the image's
pixel-index center is `511.5`. This measurable top-heavy distribution helps
explain why equal geometric margins can still look unbalanced. Area centroid is
an aid to comparison, not a claim to precisely model human visual perception.

## Review candidates

The owner subsequently requested a larger mark without filling the tile. Both
new candidates enlarge the mark by 12% around the tile center. All three retain
the same symbol paths, aspect ratio, rounded white tile, transparent outer
padding and monochrome colors. Horizontal placement remains geometrically
centered; the new black bounds are 662 px wide inside the 864 px white tile
(76.62%), with 101 px of horizontal padding on each side.

| Candidate | Mark scale / downward shift in the 1024 px master | Black bounds `[left, top, right, bottom)` | Top / bottom margin inside tile | Black-pixel centroid y |
|---|---|---|---|---:|
| Existing version | 1.5 / 0 px | `[216, 308, 808, 716)` | 228 / 228 px | 467.7598 |
| A: larger mark with optical correction | 1.68 / 27 px | `[181, 311, 843, 767)` | 231 / 177 px | 489.8171 |
| B: larger mark with area-centroid alignment | 1.68 / 49 px | `[181, 333, 843, 789)` | 253 / 155 px | 511.8171 |

Candidate A balances geometric alignment with the heavier upper strokes. Its
27 px adjustment equals about 1.69 px at a 64 px Dock icon and 0.84 px at 32 px.
The owner approved this version after reviewing the comparison. Candidate B
illustrates the full area-centroid correction and remains a review asset only.

The local comparison includes large previews and actual 64 px / 32 px icons:
`.artifacts/wcsdai-updates-motion/icon-preview/index.html`. It contains the
baseline, proposed enlarged 27 px offset and alternative enlarged 49 px offset
side by side. The larger zero-offset mark was measured again to derive the new
49 px area-centroid adjustment; the previous smaller mark's offset was not reused.

## Implementation

`scripts/make-icon.py` applies `APP_ICON_SYMBOL_SCALE = 1.68` and
`APP_ICON_OPTICAL_OFFSET_Y = 27` only to the outer application-tile transform.
This changes `translate(128 128) scale(1.5)` to
`translate(81.92 108.92) scale(1.68)`. The canonical
`apps/desktop/build/wcsdai-symbol.svg` is byte-for-byte unchanged, including all
three original paths. Its SHA256 remains
`556e07599bd6284ed53faf348c73c280db0624f5e3f03e16ed3504ced3a0bd46`.

Generated outputs are `wcsdai-app-icon.svg`, the 1024/512 px PNGs, ICO, ICNS,
the README icon and the public documentation icon/SVG. `brand-assets.json`
records their new hashes, scale and optical offset. Renderer, tray and existing
home animation assets retain their original bytes; the home motion review is a
separate change.

## Verification

- At the target 1.68 scale, the black-mark crop is pixel-identical before and
  after its 27 px translation. The canonical paths and aspect ratio are
  unchanged; the 12% enlargement is intentional. Pixel bounds and centroids
  consistently use the same threshold (`alpha >= 128` and RGB channels below
  128).
- The complete tile alpha channel is byte-identical, so corner radius, outer
  padding and transparency are unchanged.
- ICO retains 16, 32, 48, 64, 128 and 256 px representations.
- ICNS retains all eight existing representations: 16@2x, 32@2x, 128@1x,
  128@2x, 256@1x, 256@2x, 512@1x and 512@2x. No native size was removed.
- Every decoded ICO and ICNS representation has the same alpha bytes as its
  baseline and contains only neutral RGB values; antialiasing is preserved.
- The complete generator ran in an isolated scratch tree with the existing
  Python/Pillow and Node/sharp runtimes. All eight generated application-icon
  files and the manifest were reproduced byte-for-byte. The eight unrelated
  renderer, tray and home assets also reproduced unchanged. No dependency was
  installed.
- `node --test apps/desktop/test/development-branding.test.mjs
  apps/desktop/test/packaging-footprint.test.mjs`: **20 tests passed**.
- Detailed per-representation pixel bounds, SHA256s and the executable
  verification script are in the local ignored preview directory as
  `verification.json` and `verify.py`.

No new unit test is required for this static asset size/positioning change.
Existing manifest/native packaging checks, actual decoded icon inspection and a complete
generator reproducibility run cover its risks. This does not prove installed
Dock cache refresh or Windows shell rendering; those belong to the approved
installation candidate's platform checks.
