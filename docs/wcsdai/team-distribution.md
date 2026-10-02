# WcSdAi team installers

The owner selected unsigned installers for their own team's use on 2026-10-02.
Developer ID, Apple notarization and Windows code-signing credentials are not
required for this lane. This distribution choice does not change the LGPL or
third-party license terms, and does not change application permissions.

Maintainer: [tiankongbushexian-crypto](https://github.com/tiankongbushexian-crypto).
Organization: 量动科技. Website: <https://wanchuangsd.cn>.
Support and private security reports: <2222223323@qq.com>.

## Download location

The three native installers below are available from successful
[run 37018547778](https://github.com/tiankongbushexian-crypto/WcSdAi-Desktop/actions/runs/37018547778),
using source commit
[`6dc7fc9ebc63448f15a65b78542abe9505aabca3`](https://github.com/tiankongbushexian-crypto/WcSdAi-Desktop/commit/6dc7fc9ebc63448f15a65b78542abe9505aabca3).
Each native build job and desktop typecheck passed. Use the direct link for
your computer, or select its artifact from the run's **Artifacts** list.
The outer download is a ZIP archive containing the installer and its evidence.

| Computer | Download | Actions artifact | Installer inside |
| --- | --- | --- | --- |
| Mac with Apple Silicon | [Download verified installer](https://github.com/tiankongbushexian-crypto/WcSdAi-Desktop/actions/runs/37018547778/artifacts/11231618108) | `WcSdAi-1.0.1-macos-arm64-unsigned` | `WcSdAi-1.0.1-macos-arm64-unsigned.dmg` |
| Mac with Intel processor | [Download verified installer](https://github.com/tiankongbushexian-crypto/WcSdAi-Desktop/actions/runs/37018547778/artifacts/11232087687) | `WcSdAi-1.0.1-macos-x64-unsigned` | `WcSdAi-1.0.1-macos-x64-unsigned.dmg` |
| Windows x64 | [Download verified installer](https://github.com/tiankongbushexian-crypto/WcSdAi-Desktop/actions/runs/37018547778/artifacts/11231329104) | `WcSdAi-1.0.1-windows-x64-unsigned` | `WcSdAi-1.0.1-windows-x64-unsigned.exe` (NSIS installer) |

The workflow reads the actual version from `apps/desktop/package.json`; these
artifacts contain version 1.0.1. Corresponding source from the commit above,
checksums and notices accompany each installer. Do not use the portable Windows
executable as a substitute for the installer row.

Downloaded checksums, exact corresponding source and packaged resources have
been independently verified for all three installers. Their Actions artifacts
are available through 2026-11-01 under the current retention policy.

The downloaded Apple Silicon application passed two isolated launches and
restored all 800 fixture Sessions after restart. Native Intel and Windows
installation and existing-data upgrade checks remain pending. Refer to the
[team verification report](team-verification.md) for downloaded artifact checks
and the exact acceptance scope.

GitHub requires a signed-in account with repository read access to download
Actions artifacts. This workflow retains artifacts for 30 days, subject to
the repository's allowed retention settings.
See [GitHub's download instructions](https://docs.github.com/en/actions/how-tos/manage-workflow-runs/download-workflow-artifacts).
The repository is currently public: calling a build a team build does not make
it private or restrict downloads to team members. No repository visibility or
access-control change is included in this work.

**Availability:** the links above identify the successful 2026-10-02 run and its
three uploaded installer artifacts. Later candidates are listed under
[WcSdAi Team Installers](https://github.com/tiankongbushexian-crypto/WcSdAi-Desktop/actions/workflows/team-builds.yml);
check their results and source revision separately. No WcSdAi GitHub Release has
been published. The
[Releases page](https://github.com/tiankongbushexian-crypto/WcSdAi-Desktop/releases)
remains the possible longer-term download location after an explicitly
authorized publication; the links do not create a release.

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
