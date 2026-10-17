# WcSdAi team installers

The owner selected unsigned installers for their own team's use on 2026-10-02.
Developer ID, Apple notarization and Windows code-signing credentials are not
required for this lane. This distribution choice does not change the LGPL or
third-party license terms, and does not change application permissions.

Maintainer: [tiankongbushexian-crypto](https://github.com/tiankongbushexian-crypto).
Organization: 量动科技. Website: <https://wanchuangsd.cn>.
Support and private security reports: <2222223323@qq.com>.

## Download location

The verified downloads remain **1.0.5**. The Windows replacement is built by [Windows-only run 38983170175](https://github.com/tiankongbushexian-crypto/WcSdAi-Desktop/actions/runs/38983170175) from [`a2d1da936618`](https://github.com/tiankongbushexian-crypto/WcSdAi-Desktop/commit/a2d1da936618c3ccca1761289b5b6794b17481da). The unchanged macOS installers remain from [native run 38897319964](https://github.com/tiankongbushexian-crypto/WcSdAi-Desktop/actions/runs/38897319964) and [`66523a3480cb`](https://github.com/tiankongbushexian-crypto/WcSdAi-Desktop/commit/66523a3480cb42cd4e92b6747486cbeb7586c781). Downloaded archive and installer checksums, exact corresponding source, packaged identity and notices passed inspection.

**Windows-only 1.0.5 replacement:** The Windows download entry replaces the earlier 1.0.5 installer to fix opaque outer corners. The version remains 1.0.5, so existing 1.0.5 Windows clients do not receive a newer-version notification. Download the replacement manually, verify its SHA-256, then run the installer; keep existing data and backups. The macOS installers and their download entries are unchanged.

This version fixes the AI-service model list's constrained-height layout,
adds more visible Windows corners and a theme-aware inside perimeter, and
uses WcSdAi in built-in assistant product prompts. Provider/model identities,
custom system prompt precedence and historical session messages are preserved.

| Platform | Download entry | Actions artifact for version 1.0.5 | Installer inside the ZIP |
| --- | --- | --- | --- |
| macOS Apple Silicon (arm64) | [Download verified installer](https://github.com/tiankongbushexian-crypto/WcSdAi-Desktop/actions/runs/38897319964/artifacts/12045120678) | `WcSdAi-1.0.5-macos-arm64-unsigned` | `WcSdAi-1.0.5-macos-arm64-unsigned.dmg` |
| macOS Intel (x64) | [Download verified installer](https://github.com/tiankongbushexian-crypto/WcSdAi-Desktop/actions/runs/38897319964/artifacts/12045066607) | `WcSdAi-1.0.5-macos-x64-unsigned` | `WcSdAi-1.0.5-macos-x64-unsigned.dmg` |
| Windows (x64) | [Download verified installer](https://github.com/tiankongbushexian-crypto/WcSdAi-Desktop/actions/runs/38983170175/artifacts/12082232787) | `WcSdAi-1.0.5-windows-x64-unsigned` | `WcSdAi-1.0.5-windows-x64-unsigned.exe` |

Each artifact ZIP includes the named installer, checksums, build information, corresponding source and notices. Use the Windows NSIS installer in the table; a portable executable is not its substitute. Exact source is also available separately: [Windows replacement source](https://github.com/tiankongbushexian-crypto/WcSdAi-Desktop/actions/runs/38983170175/artifacts/12081418268) for `a2d1da936618`, and [macOS original-batch source](https://github.com/tiankongbushexian-crypto/WcSdAi-Desktop/actions/runs/38897319964/artifacts/12044462246) for `66523a3480cb`. Use the source archive from the same batch as its installer.

| Installer file | SHA-256 |
| --- | --- |
| `WcSdAi-1.0.5-macos-arm64-unsigned.dmg` | `2f33b8cea129c38273e3310a8f4b7f4dbcffa1bb1323592fa3c47e2d2f830543` |
| `WcSdAi-1.0.5-macos-x64-unsigned.dmg` | `0619632b465c42a907469a5f672d32cdc9393678d92ca427e58f145066024739` |
| `WcSdAi-1.0.5-windows-x64-unsigned.exe` | `8d84c843fd4886fdf2a0556ad0675f312f9d4bce4c812572e8cb2f8c31239db5` |

| Artifact | Expiry in Asia/Shanghai (Beijing) | GitHub UTC expiry |
| --- | --- | --- |
| macOS Apple Silicon (arm64) | 2026-11-15 20:03:17 | 2026-11-15T12:03:17Z |
| macOS Intel (x64) | 2026-11-15 20:09:38 | 2026-11-15T12:09:38Z |
| Windows (x64) | 2026-11-16 07:56:24 | 2026-11-15T23:56:24Z |
| Mac original-batch source | 2026-11-15 19:58:37 | 2026-11-15T11:58:37Z |
| Windows replacement source | 2026-11-16 07:46:38 | 2026-11-15T23:46:38Z |

The [Windows hotfix report](1.0.5-windows-hotfix.md) records the replacement's native corner pixels, mouse resizing, fullscreen restoration and packaged-app checks, including the runner OS and limits. These checks do not establish installation, upgrade, recovery or visual acceptance on a team Windows 11 device. The [1.0.5 verification report](1.0.5-verification.md) retains the original macOS batch and local-upgrade evidence. Historical [1.0.4 checks](1.0.4-verification.md) remain separate evidence.

GitHub requires a signed-in account with repository read access to download
Actions artifacts. Retention is 30 days, subject to repository limits. See
[GitHub's download instructions](https://docs.github.com/en/actions/how-tos/manage-workflow-runs/download-workflow-artifacts).
This repository is public; a team build is not a private distribution.

Later candidates appear under [WcSdAi Team Installers](https://github.com/tiankongbushexian-crypto/WcSdAi-Desktop/actions/workflows/team-builds.yml);
check their results and source separately. This batch creates no Git tag or
GitHub Release and does not deploy a server.

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
   Leave **Installer platforms to build** at `all` for the three native lanes,
   or select `windows` to rebuild only Windows x64. Both choices first archive
   the exact corresponding source; an invalid selector fails before building.
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
