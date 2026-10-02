# WcSdAi licensing and distribution preparation

Review date: 2026-10-02. Target: WcSdAi 1.0.1, based on PI-Desktop v0.16.0.
Maintainer: tiankongbushexian-crypto. Organization: 量动科技.
Website: <https://wanchuangsd.cn>. Contact: <2222223323@qq.com>.
Repository: <https://github.com/tiankongbushexian-crypto/WcSdAi-Desktop>.
Status: local and private team build preparation; public release is a separate,
optional delivery decision.

## Preserved upstream terms

WcSdAi is a fork of <https://github.com/vastsa/PI-Desktop>. Root `LICENSE`
contains a short WcSdAi copyright attribution followed by the complete,
unchanged original GNU LGPL v3.0 text. The attribution adds no license terms and
does not replace the Free Software Foundation's license-text copyright.
`LICENSES/LGPL-3.0.txt` remains byte-identical to the baseline root `LICENSE`.
The original text's SHA-256 is
`e3a994d82e644b03a792a930f574002658412f62407f5fee083f2555c5f23118`.
The attribution is one HTML comment, which Licensee removes before matching;
the remaining content is exactly the original text. `LICENSES/LGPL-3.0.txt`
is the only direct file in `LICENSES/`. Companion GPL/OFL texts, third-party
notices and their index live under `LICENSES/components/`, so repository-level
license detection does not mistake them for additional project licenses.
All texts remain included in packages and source archives. Stable Licensee
v10.1.0 scans the root and direct `LICENSES/` children, and reduces these two
matching LGPL files to one license. GitHub's final displayed classification
must still be checked after publication. See
[GitHub license detection](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/licensing-a-repository#detecting-a-license)
and [Licensee's project aggregation](https://github.com/licensee/licensee/blob/v10.1.0/lib/licensee/projects/project.rb).
`Cargo.toml` declares `LGPL-3.0-or-later`; that declaration is retained.
Existing per-file and third-party notices are retained. Copyright 2026 量动科技
covers its original contributions, not upstream authors' work.

LGPLv3 incorporates GPLv3. Copies of both texts are included. Modified covered
work must satisfy applicable source and notice requirements. A combined-work
distribution must preserve the LGPL modification/debugging rights and use a
permitted relinking/recombination route; installation information may be
required. Renaming the app or providing only a link to unmodified upstream
source does not fulfill these obligations. The exact source, object/build
materials and delivery method must be reviewed for the packaged release.
See [LGPLv3](https://www.gnu.org/licenses/lgpl-3.0.html),
[GPLv3](https://www.gnu.org/licenses/gpl-3.0.html), and the
[GNU license FAQ](https://www.gnu.org/licenses/gpl-faq.html).

Independently authored modules and third-party dependencies keep their explicit
licenses; their independence is not assumed merely because they live in a new
directory. This migration introduces no proprietary relicensing of covered work.

## Private team use and unsigned builds

The current intended workflow is private, non-commercial team use. That
purpose does not create a non-commercial license or restrict rights already
granted by the applicable licenses. GNU's FAQ confirms that private
modifications and internal organizational use do not, by themselves, require
public release of the modified source. See the
[GNU FAQ on private modifications](https://www.gnu.org/licenses/gpl-faq.html#GPLRequireSourcePostedPublic).

Before handing copies to other people or organizations, identify the actual
recipients and applicable source-delivery requirements. Calling a delivery
"team use" does not establish that every recipient is within one organization.
Where source delivery is required, prepare the exact modified source, build
instructions and license/notice materials for recipients; an upstream-only
source link is insufficient. Public GitHub publication is one possible
delivery route, not an automatic requirement for private use.

The requested team build omits publisher signing credentials and notarization.
Signing and operating-system acceptance are packaging matters separate from
license compliance. This choice does not remove permission checks, credential
protection or any source/notice obligation. It does not authorize publishing
a release or changing the third-party licenses.

## Evidence and coverage

| Material | Evidence | Result / remaining work |
| --- | --- | --- |
| LGPL text | `LICENSES/LGPL-3.0.txt` compared with the baseline Git blob; the LGPL body in root `LICENSE` compared with that copy | Original text preserved byte for byte; only the separate WcSdAi copyright attribution is new. |
| GPL text | `LICENSES/components/GPL-3.0.txt`, fetched from GNU's canonical text URL | Added as the companion incorporated license. |
| npm dependency versions | Both YAML documents in `pnpm-lock.yaml`; exact installed package manifests in the existing pnpm store | Inventory includes package-manager binaries, direct, transitive, optional, build and docs packages. Missing metadata stays pending. |
| Cargo dependencies | `Cargo.lock` and exact-version manifests in the local Cargo registry source cache | All registry lock entries included; uncached target/dev crates stay pending. |
| Original third-party notice text | Root license/notice files and license directories from matched package versions | Deduplicated into `LICENSES/components/third-party-notices.txt`; original text is not rewritten. Nested embedded code still requires final package review. |
| Electron | Installed `43.6.0` MIT text and original `dist/LICENSES.chromium.html` | Inventory records Chromium notice SHA-256; packaging copies the original HTML directly from the installed runtime. |
| KaTeX fonts | Twenty installed TTF font faces, original name-table copyright/license records | OFL 1.1 declarations and reserved font names preserved in the notices; canonical `LICENSES/components/OFL-1.1.txt` added. |
| General UI icons | `lucide-react 1.31.0` installed ISC notice | Preserved; general-purpose icons are separate from the product brand mark. |
| System interface fonts | Current `fonts.ts`, tracked asset search, ADR 0298 | No standalone interface font assets added; KaTeX math fonts are handled separately. |
| Bundled plugins | Existing `pi.file-manager` MIT notice and pinned `UPSTREAM.md`; in-tree `pi.browser` source | File-manager provenance states the upstream release had no LICENSE and this repo added one: publisher authority needs confirmation. |
| MCP / SDKs / examples | Lockfile inventory and existing source/manifests | External marketplace/server downloads are not bundled into this audit; each installed version requires its own license review. |
| WcSdAi artwork | User-supplied refined logo folder | `【待确认许可证：WcSdAi brand assets】`; ownership/distribution evidence not supplied. |
| Screenshots / docs | Existing repository materials retained with attribution | Historical screenshots can contain upstream marks or third-party content; refresh and approve before external marketing. |

The complete [table](dependency-inventory.md) and
[machine-readable inventory](dependency-inventory.json) contain name, version,
declared license, source URL, source-provision status, scope and evidence.
Inventory totals and pending counts are generated, not estimates. The metadata
table is deliberately broader than a runtime SBOM. A top-level `MIT` value does
not establish the license of every embedded binary, font or vendored source.

Reproduce without installing dependencies or querying registries:

```bash
node docs/wcsdai/generate-license-inventory.mjs /path/to/provisioned/checkout
```

The generator reads the existing host dependency tree and Cargo cache. Run it
again after changing lockfiles or preparing a different target. Keep the
regenerated license texts and inventory from the actual release candidate.

## Binary and source delivery gate

For a delivery that conveys binaries to recipients outside private internal use:

1. Confirm the exact release commit, corresponding source archive and build
   instructions are accessible to recipients. Include the existing Pi patch
   files and relevant packaging scripts; do not substitute an upstream-only URL.
2. Resolve pending licenses for components actually shipped on that target and
   separately document excluded development/platform packages. Review copyleft
   and dual-license choices, including MPL entries, against final use.
3. Preserve `LICENSE`, `NOTICE.md`, `THIRD_PARTY_NOTICES.md`, the `LICENSES/`
   collection and the runtime Chromium notice in every package. Verify actual
   unpacked installers, not only the builder configuration.
4. Verify that About exposes upstream attribution and a way to read the local
   notices. The product E2E/packaging report supplies executable evidence.
5. Produce any additional corresponding-source, build/relink or installation
   materials required by the chosen distribution form. Test rebuilding the
   covered modified source from the release materials.
6. Confirm brand asset rights, vendored plugin provenance, final operating
   entity details and legal-page review. Record the final license decision for
   independently authored modules before introducing a separate license.

No Git push, tag, source offer, binary upload, website deployment or release
publication is performed by this documentation work. The fork URL is a source
location for any subsequently authorized publication; it does not imply the
local modifications are already public. Recipient-facing binary distribution
must satisfy the applicable gates above. Private use is not contingent on a
public GitHub release or on obtaining publisher signing certificates.

## Legal-page drafts

The [privacy policy](legal/privacy-policy.md), [service terms](legal/terms-of-service.md)
and [user agreement](legal/user-agreement.md) are local drafts. Proposed URLs
are documented in [their index](legal/README.md); none is claimed to be deployed.
They describe existing product behavior and contain concrete unresolved operator
items. They do not add telemetry or change provider, plugin or permission policy.
