# Third-party notices for WcSdAi

Audit date: 2026-10-02. Target release: 1.0.1 (unreleased).

WcSdAi preserves the licenses and attribution of PI-Desktop and third-party
components. The full resolved dependency table is
[`docs/wcsdai/dependency-inventory.md`](docs/wcsdai/dependency-inventory.md), with
machine-readable evidence in the adjacent JSON file. Each row records name,
version, declared license, package source, source-provision review status and
local evidence. The initial inventory covers 1,010 npm package versions and
234 Cargo crate versions, including development and target-specific entries.

Original texts collected from the host are in
[`LICENSES/components/third-party-notices.txt`](LICENSES/components/third-party-notices.txt). Preserve
all copyright statements there. A missing local manifest is reported as
`【待确认许可证：dependency-name】`; it is not assumed to use its parent package's
license. The inventory is not a final shipped-binary SBOM or legal clearance.

| Component / category | Evidence and license handling | Release follow-up |
| --- | --- | --- |
| PI-Desktop source, repository Markdown, original examples and in-tree plugins | Original root LGPLv3 `LICENSE`; Cargo declares `LGPL-3.0-or-later`. Original per-file notices take precedence for their components. | Publish matching modified source/build materials with an authorized release. |
| `@earendil-works/pi-ai`, `pi-agent-core`, `pi-coding-agent`, `pi-mcp`, `pi-telemetry` | Actual `0.99.1` package metadata declares MIT; names and existing patch files remain unchanged. Some installed packages carry metadata without a top-level license file. | Obtain corresponding original notices from the exact release/source; include applicable patch source. |
| Electron / Chromium / Node.js embedded components | Electron `43.6.0` declares MIT; its generated `LICENSES.chromium.html` includes additional bundled components with separate terms. | Include the original runtime license and Chromium HTML notice; inspect actual native packages on each platform. |
| React, React DOM, Zustand, renderer and Markdown libraries | Per-version metadata and original texts in the generated inventory. | Match notices to the final bundled dependency graph. |
| `lucide-react` icons | `1.31.0`, ISC metadata and original `LICENSE`. Brand-only artwork replacement does not replace general-purpose Lucide UI icons. | Retain ISC attribution for shipped icons. |
| KaTeX math fonts | `katex 0.16.47` metadata is MIT; the actual installed TTF name records declare SIL OFL 1.1 and retain Design Science / Khan Academy copyright and reserved font names. | Preserve `LICENSES/components/OFL-1.1.txt` and the extracted original font notices when emitting KaTeX fonts. |
| Interface fonts | Current `apps/desktop/src/lib/fonts.ts` uses installed system fonts, with no standalone tracked font files found. Earlier ADR text about bundled font families is historical; its amendment removes those assets. | Verify final output for additional font assets and retain their actual licenses. System fonts are not newly redistributed by this brand change. |
| Bundled `pi.file-manager 0.5.2` | Existing MIT notice attributed to Tioit-Wang and pinned `UPSTREAM.md` preserved. That provenance record explicitly says the original upstream release supplied no license file and this repository added one. | Confirm licensing authority and source/embedded-dependency notices with the publisher before public distribution; do not treat the added notice as independent proof of permission. |
| Bundled `pi.browser` and example plugins | In-tree source under the repository license unless a component explicitly supplies separate terms; original plugin IDs/authors retained. | Review embedded resources in independently distributed `.piplug` archives. |
| MCP components and external-service SDKs | MCP, OpenAI, Anthropic, Google, AWS and other resolved SDK versions appear in the inventory. Provider service terms are distinct from SDK licenses. | Review separately installed servers and marketplace plugins at their actual versions; do not claim their full catalog is covered. |
| `electron-updater`, `electron-builder`, packaging utilities | MIT metadata for the resolved updater and builder; native helper and platform dependencies have their own inventory rows/notices. | Complete Windows/Linux-only dependency metadata and helper-binary notices on those build runners. |
| Rust host-core / bundled SQLite / native allocator and TLS | Cargo lockfile rows and locally cached original texts; preserve crate-specific notices including embedded native projects. `option-ext` declares MPL-2.0. | Review copyleft file/source obligations, compile-time features and native embedded code; do not infer obligations from a top-level crate license alone. |
| CSS optimizer / sanitization | `lightningcss` declares MPL-2.0; DOMPurify declares `(MPL-2.0 OR Apache-2.0)`. | Record the selected valid license where there is a choice and whether code is distributed or only a build tool. |
| WcSdAi logo and derived application icons | User-supplied WcSdAi asset pack; no distribution license or ownership document supplied. | `【待确认许可证：WcSdAi brand assets】`; obtain owner authorization/provenance before external distribution. |
| Upstream screenshots, illustrations and Markdown | Preserved as upstream material with source attribution; screenshots may include third-party marks or content. | Confirm rights and privacy; replace historical product screenshots with verified fork screenshots before publication. |

The exact list of pending entries is generated rather than maintained manually.
Transitive inclusion, a registry URL, or a permissive-looking SPDX expression
does not by itself prove all notices and corresponding-source obligations of a
distributed installer have been satisfied. See the
[compliance plan](docs/wcsdai/licensing-compliance.md) for release gates.
