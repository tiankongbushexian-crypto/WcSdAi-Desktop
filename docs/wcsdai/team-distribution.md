# WcSdAi team installers

The owner selected unsigned installers for their own team's use on 2026-10-02.
Developer ID, Apple notarization and Windows code-signing credentials are not
required for this lane. This distribution choice does not change the LGPL or
third-party license terms, and does not change application permissions.

Maintainer: [tiankongbushexian-crypto](https://github.com/tiankongbushexian-crypto).
Organization: 量动科技. Website: <https://wanchuangsd.cn>.
Support and private security reports: <2222223323@qq.com>.

## Download location

The verified download batch is **1.0.4**, from successful [native run
37099512277](https://github.com/tiankongbushexian-crypto/WcSdAi-Desktop/actions/runs/37099512277), built from source commit
[`4e4ab0dbd981ece9e5e8414ddb889082d9269274`](https://github.com/tiankongbushexian-crypto/WcSdAi-Desktop/commit/4e4ab0dbd981ece9e5e8414ddb889082d9269274). All three native jobs
and their desktop typechecks passed. The owner approved the revised Mac and
Windows artwork and will perform the local upgrade themselves.

| Platform | Download entry | Actions artifact for version 1.0.4 | Installer inside the ZIP |
| --- | --- | --- | --- |
| macOS Apple Silicon (arm64) | [Download verified installer](https://github.com/tiankongbushexian-crypto/WcSdAi-Desktop/actions/runs/37099512277/artifacts/11265079113) | `WcSdAi-1.0.4-macos-arm64-unsigned` | `WcSdAi-1.0.4-macos-arm64-unsigned.dmg` |
| macOS Intel (x64) | [Download verified installer](https://github.com/tiankongbushexian-crypto/WcSdAi-Desktop/actions/runs/37099512277/artifacts/11265174135) | `WcSdAi-1.0.4-macos-x64-unsigned` | `WcSdAi-1.0.4-macos-x64-unsigned.dmg` |
| Windows (x64) | [Download verified installer](https://github.com/tiankongbushexian-crypto/WcSdAi-Desktop/actions/runs/37099512277/artifacts/11265329290) | `WcSdAi-1.0.4-windows-x64-unsigned` | `WcSdAi-1.0.4-windows-x64-unsigned.exe` |

Each artifact ZIP includes the named installer, checksums, build information,
corresponding source and notices. Use the Windows NSIS installer in the table;
a portable executable is not its substitute. Exact corresponding source is
also available as a [separate artifact](https://github.com/tiankongbushexian-crypto/WcSdAi-Desktop/actions/runs/37099512277/artifacts/11264959431).

Downloaded checksums, corresponding source, packaged identity and licenses,
and actual packaged icon resources passed independent inspection. Both macOS
packages contain the approved 22×22 and 44×44 template PNGs. The Windows
executable/installer resources contain the transparent outlined application
ICO, and the application resources include both monochrome tray ICOs.
The downloaded Apple Silicon app passed 2 isolated launches and restored all 800 fixture Sessions after restart. Its production checker also read the public manifest successfully;
the manifest still named 1.0.3 during that package check, so no downgrade
was offered. Intel/Windows installation, upgrade and visual checks remain
pending. See the [1.0.4 report](1.0.4-verification.md) for scope and evidence.
The [1.0.3 report](1.0.3-verification.md) retains the earlier manual-upgrade
journey; it does not establish a local 1.0.4 upgrade.

| Artifact | Expiry in Asia/Shanghai (Beijing) | GitHub UTC expiry |
| --- | --- | --- |
| macOS Apple Silicon (arm64) | 2026-11-02 13:23:53 | 2026-11-02T05:23:53Z |
| macOS Intel (x64) | 2026-11-02 13:27:44 | 2026-11-02T05:27:44Z |
| Windows (x64) | 2026-11-02 13:31:41 | 2026-11-02T05:31:41Z |
| Corresponding source | 2026-11-02 13:20:41 | 2026-11-02T05:20:41Z |

GitHub requires a signed-in account with repository read access to download
Actions artifacts. Retention is 30 days, subject to repository limits. See
[GitHub's download instructions](https://docs.github.com/en/actions/how-tos/manage-workflow-runs/download-workflow-artifacts).
This repository is public; a team build is not a private distribution.
No repository visibility or access-control change is included.

Later candidates appear under [WcSdAi Team Installers](https://github.com/tiankongbushexian-crypto/WcSdAi-Desktop/actions/workflows/team-builds.yml);
check their results and source separately. No WcSdAi GitHub Release has been
published. The [Releases page](https://github.com/tiankongbushexian-crypto/WcSdAi-Desktop/releases) remains the possible long-term
download location after an explicitly authorized publication.

## Build and installation expectations

The manual workflow uses native runners for macOS arm64, macOS Intel x64 and
Windows x64, and the existing desktop build scripts. A clean runner installs
locked dependencies and builds its native Rust Host. Locally, reuse the
already provisioned toolchain and caches; do not reinstall just to test this
lane. Packaging uses `--publish never`; signed release secrets are not consumed.
The common packaging hooks preserve the Chromium notice from the actual target
Electron runtime downloaded by the builder. Missing or empty source notices,
or a missing, empty or changed final packaged copy, fail the build before
signing and installer generation. This also applies to local and optional
public-release packaging; a development Electron download is not required.
The source/installer collection helper requires a clean committed candidate;
an uncommitted local preview must not be labelled as matching an older commit's
source archive. Ignored build outputs are not treated as source changes.

macOS packages have no verified Developer ID or Apple notarization. The build
applies an ad-hoc app seal (`mac.identity=-`) and verifies it with native
`codesign --verify --deep --strict`; this needs no account or certificate and
does not authenticate a publisher. Windows packages have no verified
publisher signature. The operating system or a team's device-management policy
may warn or prevent installation. Noncommercial use does not create an OS
exemption. No command in this workflow disables Gatekeeper, Defender, signature
checks, sandboxing or the application's approval system.

After extracting the download, verify `SHA256SUMS` before installing. Retain
the source and build information from the same run. The macOS `.dmg` contains
WcSdAi.app; the Windows `.exe` is the normal installer. Test each target on its
own OS, and preserve existing data and backups when replacing an older build.
An artifact build is not proof that installation or upgrade passed on that OS.

## Maintainer workflow

1. Use the existing PR and main-branch gates for the prepared changes. The owner
   authorized commit/push/integration and remote team builds on 2026-10-02.
2. Make the workflow available on the default branch, then open **Actions →
   WcSdAi Team Installers → Run workflow** and choose the intended revision.
3. Wait for native build/test jobs to finish. Check the version, commit,
   platform/architecture, checksums and included source for each artifact.
4. Test installation and data continuity on representative team devices, then
   share the successful run's download link with recipients.

The workflow uploads Actions artifacts only. It does not push commits or tags,
create a GitHub Release or deploy to a server. `build.publish` remains null and
`RELEASES_URL` remains empty, so automatic installation remains off. Starting
with 1.0.2, packaged builds check the fixed GitHub version manifest and show
release notes plus a download action. Team members install the verified package
manually. The existing 1.0.1 must be upgraded manually once to gain this feature.
See [update notifications](update-notifications.md) for manifest publication,
artifact expiry and the startup/periodic check policy.

The existing `release.yml` and `scripts/release-macos.sh` remain available as
the separate signed public-release lane. Its signing and update-feed gates
are not prerequisites for **WcSdAi Team Installers**. See the
[release checklist](release-checklist.md) for the two scopes.
