# License texts included with WcSdAi

This directory contains companion and third-party license materials. The
project's unchanged LGPL text remains one level up at `LICENSES/LGPL-3.0.txt`.
Keeping supplemental texts here avoids treating them as additional project
licenses during repository-level license detection; all files are still shipped.

| File | Source and purpose |
| --- | --- |
| [LGPL-3.0.txt](../LGPL-3.0.txt) | Byte-identical copy of PI-Desktop's original root `LICENSE`. The current root file adds a separate WcSdAi copyright attribution before this unchanged license text. |
| [GPL-3.0.txt](GPL-3.0.txt) | GNU GPL v3 text, obtained from <https://www.gnu.org/licenses/gpl-3.0.txt>; LGPLv3 incorporates its terms. |
| [OFL-1.1.txt](OFL-1.1.txt) | Canonical SIL OFL 1.1 text from <https://openfontlicense.org/documents/OFL.txt>. Its example copyright header is generic; actual KaTeX font copyright and reserved names are preserved in the collected original notices. |
| [third-party-notices.txt](third-party-notices.txt) | Original license, notice, copyright and author files collected from installed npm packages, cached Cargo sources and the bundled file-manager plugin. Identical text is stored once with all component references. |

Electron 43.6.0 supplies `electron/dist/LICENSES.chromium.html`. The packaging
configuration copies that original file to
`licenses/Electron-LICENSES.chromium.html`; it is not duplicated as a 19 MB
source-controlled file. Its audited SHA-256 and version are recorded in
[`dependency-inventory.json`](../../docs/wcsdai/dependency-inventory.json).
Preserve Electron's own runtime license files as well.

The inventory includes development, optional and cross-platform dependencies;
its inclusion is not a claim that all of them ship in each installer. Local
metadata and a collected license file are evidence, not a complete audit of
every embedded component. Missing metadata/texts and target-platform differences
must be resolved during release qualification. See
[`THIRD_PARTY_NOTICES.md`](../../THIRD_PARTY_NOTICES.md) and
[`licensing-compliance.md`](../../docs/wcsdai/licensing-compliance.md).

Regenerate from the provisioned dependency checkout without installing:

```bash
node docs/wcsdai/generate-license-inventory.mjs /path/to/provisioned/checkout
```

The generator reads only manifests, lockfiles and named notice files. It performs
no network access, dependency installation, publishing, or license inference for
missing metadata. Re-run it after lockfile changes or when qualifying a new
platform and review the resulting diff before distribution.
