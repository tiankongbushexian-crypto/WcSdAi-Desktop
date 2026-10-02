# WcSdAi team installers

The owner selected unsigned installers for their own team's use on 2026-10-02.
Developer ID, Apple notarization and Windows code-signing credentials are not
required for this lane. This distribution choice does not change the LGPL or
third-party license terms, and does not change application permissions.

Maintainer: [tiankongbushexian-crypto](https://github.com/tiankongbushexian-crypto).
Organization: 量动科技. Website: <https://wanchuangsd.cn>.
Support and private security reports: <2222223323@qq.com>.

## Download location

Open [WcSdAi Team Installers](https://github.com/tiankongbushexian-crypto/WcSdAi-Desktop/actions/workflows/team-builds.yml),
choose a successful run, then download the matching item under **Artifacts**.
The outer download is a ZIP archive containing the installer and its evidence.

| Computer | Actions artifact | Installer inside |
| --- | --- | --- |
| Mac with Apple Silicon | `WcSdAi-1.0.1-macos-arm64-unsigned` | `WcSdAi-1.0.1-macos-arm64-unsigned.dmg` |
| Mac with Intel processor | `WcSdAi-1.0.1-macos-x64-unsigned` | `WcSdAi-1.0.1-macos-x64-unsigned.dmg` |
| Windows x64 | `WcSdAi-1.0.1-windows-x64-unsigned` | `WcSdAi-1.0.1-windows-x64-unsigned.exe` (NSIS installer) |

The workflow reads the actual version from `apps/desktop/package.json`; the
table illustrates the current 1.0.1 version. Source, checksums and notices
accompany the artifacts. Do not use the portable Windows executable as a
substitute for the installer row.

GitHub requires a signed-in account with repository read access to download
Actions artifacts. This workflow retains artifacts for 30 days, subject to
the repository's allowed retention settings.
See [GitHub's download instructions](https://docs.github.com/en/actions/how-tos/manage-workflow-runs/download-workflow-artifacts).
The repository is currently public: calling a build a team build does not make
it private or restrict downloads to team members. No repository visibility or
access-control change is included in this work.

**Availability:** use the successful workflow run's Artifacts list as the source
of truth for downloadable packages; a workflow link alone does not prove a
build exists. The repository had no Releases when first checked on 2026-10-02. Its
[Releases page](https://github.com/tiankongbushexian-crypto/WcSdAi-Desktop/releases)
remains the possible longer-term download location after an explicitly
authorized publication; the links do not create a release.

## Build and installation expectations

The manual workflow uses native runners for macOS arm64, macOS Intel x64 and
Windows x64, and the existing desktop build scripts. A clean runner installs
locked dependencies and builds its native Rust Host. Locally, reuse the
already provisioned toolchain and caches; do not reinstall just to test this
lane. Packaging uses `--publish never`; signed release secrets are not consumed.
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
create a GitHub Release, deploy to a server, or enable automatic application
updates. `build.publish` remains null and `RELEASES_URL` remains empty. Team
members update manually by installing a later verified team package.

The existing `release.yml` and `scripts/release-macos.sh` remain available as
the separate signed public-release lane. Its signing and update-feed gates
are not prerequisites for **WcSdAi Team Installers**. See the
[release checklist](release-checklist.md) for the two scopes.
