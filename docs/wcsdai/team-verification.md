# Repository pages and unsigned team packaging verification

Latest accepted delivery: [native team build 37018547778](https://github.com/tiankongbushexian-crypto/WcSdAi-Desktop/actions/runs/37018547778), based on `6dc7fc9ebc63448f15a65b78542abe9505aabca3`. See [accepted hosted team build](#accepted-hosted-team-build) below for downloads and verification. Earlier sections preserve their original candidate evidence.

Date: 2026-10-02 (Asia/Shanghai). Branch: `codex/wcsdai-brand-foundation`.
HEAD/base: `22dfb87a84056127fad07617e8d06974f927bebc`, plus the ongoing
uncommitted WcSdAi request changes. The primary `main` checkout remains clean.
This record follows the owner's request to update repository identity pages
and provide macOS/Windows downloads without publisher signing for team use.
It records the local preparation stage. After these checks, the owner explicitly
authorized commit, push, integration through repository checks and native
GitHub Actions builds/uploads. Subsequent remote run results are recorded by
their commit and workflow run; the pre-publication observations below remain
historical evidence.

## Observable changes

- README and its Chinese version identify tiankongbushexian-crypto, 量动科技,
  Copyright 2026, wanchuangsd.cn and 2222223323@qq.com, with three platform
  download entries near the top.
- CONTRIBUTING points to this fork and follows the current worktree/commit
  rules. SECURITY uses the owner's private-report contact and makes no
  inherited response-time promise on their behalf.
- Root LICENSE initially had a separate 840-byte project attribution/contact
  preface for the local package below. Before committing, this was reduced to
  a 79-byte attribution comment so license-detection normalization sees the
  unchanged original text. Detailed contact and fork attribution remain in
  NOTICE.md. Source LICENSE SHA-256 at the first committed candidate:
  `2f7551de1c91066e20f389aa26ada7190981321303788e28c8e34151cf8ba1c3`.
  The following 7,652-byte LGPL text is byte-identical to the original, as is
  LICENSES/LGPL-3.0.txt. No upstream/third-party copyright was reassigned and no
  noncommercial-only restriction was introduced.
- The separate manual Team Installers lane targets native macOS arm64/x64 and
  Windows x64, requires no publisher certificate/notarization credentials,
  and prepares named installers, corresponding source, notices and checksums.
- The signed public-release lane is retained for a possible later choice.
  Automatic updates remain unconfigured. No runtime protocol, provider,
  permission, session or persistence logic changed in this follow-up.

## Native local packaging

Environment: macOS 26.5 arm64, Node 22.23.3, pnpm 12.8.1, Rust 1.98.1.
Existing dependencies and caches were reused. Executed from the worktree:

```sh
CSC_IDENTITY_AUTO_DISCOVERY=false pnpm --config.verify-deps-before-run=false \
  --filter @pi-desktop/desktop run dist:mac --arm64 \
  -c.mac.identity=null -c.mac.notarize=false -c.forceCodeSigning=false
```

The existing `dist:mac` supplies `--publish never`. Build completed with exit 0,
including dependency builds, native release Host, runtime/renderer bundles,
DMG and ZIP packaging. Its log explicitly records skipped macOS code signing
because the identity was set to null. No publisher signature or notarization
is claimed.

Read-only DMG inspection confirmed version 1.0.1, `com.example.wcsdai`, and
exact copies of the updated root LICENSE/NOTICE plus original LGPL text in
the application resources. The application ASAR is byte-identical to the
previously installed and restart-tested migration build; this follow-up adds
packaged legal resources without changing that executable bundle.

| Evidence | SHA-256 |
| --- | --- |
| Native arm64 DMG | `db6ca92dc1eafea86888c90fb6a924f5cccd8ec2fe646aa5aa29ff0861991749` |
| Application ASAR | `398663aef06e5a36ba877bd4a7171e9a8924405ebd8591f58dbbe47ac6340e76` |
| Earlier local-preview packaged LICENSE (before final prefix reduction) | `f2259ef5f136e666e0f05daf4c9f548d0f6e533b0a3c9bdf0d04883cac1d7b20` |
| Original LGPL payload and LICENSES copy | `e3a994d82e644b03a792a930f574002658412f62407f5fee083f2555c5f23118` |

Local logs, package inspection metadata and a clearly named unsigned arm64
preview are under ignored `.artifacts/wcsdai/team-*`. The preview is an
uncommitted local build, not a hosted Actions run. The clean-commit archive
helper must not attach the old HEAD source to this newer worktree binary.

## Checks and limits

- The 13 new source/build/collection tests and 18 existing CI workflow tests
  passed (31 total). Temporary Git repositories and artifact fixtures exercise
  preparation, matching source collection, checksums, dirty-candidate rejection
  and tracked-license-file selection. Real electron-builder argument parsing
  verifies one `--publish never` and a null publish configuration; native build
  process spawning is the mocked external boundary.
- The final Windows-shell review replaced the POSIX-only single-quoted
  dependency selector with equivalent double quoting. The five existing
  runtime-build contract tests and the 13 team tests passed after that change;
  the actual dependency build completed for all nine workspaces on macOS.
  Native Windows execution remains a remote-runner check.
- README local links/assets/anchors and identity/platform strings were checked
  in both languages. The release-documentation gate initially caught a missing
  `1.0.x` status line after rewriting; both READMEs were corrected and the gate
  passed without changing the checker.
- Agent-policy synchronization, the release-documentation gate, root lint,
  documentation checks and the documentation production build passed.
  The new MJS helper is outside the existing Biome lint include set; its
  syntax and behavior were checked with Node and the tests above.
  Diff-whitespace checks passed. The previous complete runtime-suite totals
  remain historical evidence, not a repeated run for this follow-up.
- Staging the previously untracked third-party notice bundle exposed upstream
  trailing whitespace and mixed line endings. A path-specific Git attribute
  preserves those verbatim legal inputs and exempts only end-of-line/end-of-file
  whitespace diagnostics for that file. Source-file whitespace checks remain
  unchanged.
- Initial GitHub inspection still reported the repository license as Other,
  despite the root text matching LGPL. Stable Licensee also aggregates direct
  children of `LICENSES/`; bundled GPL/OFL/component notices therefore created
  an ambiguous project result. These companion notices and their index now live
  under `LICENSES/components/`, with the original LGPL copy remaining directly
  under `LICENSES/`. Generator, links and collection fixtures follow this layout.
  The earlier local preview above predates this notice-layout adjustment.
- GitHub read-only inspection confirmed the fork is public, has default branch
  `main`, and had no Releases at this check. “Team” describes intended use,
  not an access-control restriction.
- No commit, push, tag, PR, GitHub workflow dispatch, installer upload, Release
  creation or server deployment was performed. README links become usable
  after the workflow is integrated and a build succeeds.
- Intel macOS and Windows packaging/install tests, and actual hosted download
  verification, remain pending their native runners. No Windows installer is
  falsely claimed available. OS warnings on unsigned software remain possible.
- The running WcSdAi installation, its data, credentials and compatibility
  aliases were not changed by this follow-up.

## Follow-up: macOS bundle integrity and repository license detection

The initial preview used `mac.identity=null`. Native strict verification found
that its inherited linker signature did not seal the renamed app resources.
The team lane now uses `mac.identity=-` to create an ad-hoc seal, requiring
no publisher certificate or Apple account. Developer ID, notarization and
Windows publisher signing remain disabled. Existing app entitlements were
retained.

An actual local arm64 package from the existing built outputs passed
`codesign --verify --deep --strict` both before packaging and inside the
read-only mounted DMG. Both copies show `Signature=adhoc`,
`TeamIdentifier=not set`, and identifier `com.example.wcsdai`; their bundled
Host also passed verification. The DMG SHA-256 is
`36e943b797e04883492ebc03a9dbd652535cdc8b345ec53c9e857a5c3a7b500d`.
Its ASAR remains
`398663aef06e5a36ba877bd4a7171e9a8924405ebd8591f58dbbe47ac6340e76`.
Current notices and the unchanged LGPL match their source files.

The newly sealed packaged app passed two real isolated launches: boot probe
and recovery of all 800 synthetic Sessions after restart. Owned processes and
temporary directories were cleaned. No live model, user profile, installation
or Gatekeeper download-approval test was performed. Local evidence is
`.artifacts/wcsdai/team-adhoc-verification.json` and
`.artifacts/wcsdai/team-packaged-smoke.json` (SHA-256
`1956f51d166a4b169354b09bb688705a4670508eb9958df6106101f1e83026ec`).

The workflow now rejects failed strict verification or a non-ad-hoc publisher
identity before upload. Its preparation suite passed 14 tests, including
executing the native verification step against controlled command fixtures.
Earlier notice-layout and packaging coverage passed 22 tests. Stable Licensee
v10.1.0's file selection and aggregation methods select only the two LGPL copies
after the layout change; both match 100%. GitHub's actual result must also be
checked after pushing.

The initial committed candidate `85a3d23ce8014dbe3f21f8d0f4839072b190075f`
passed all four PR checks, including 725 Rust tests on the Linux runner:
[CI](https://github.com/tiankongbushexian-crypto/WcSdAi-Desktop/actions/runs/37007595412),
[documentation](https://github.com/tiankongbushexian-crypto/WcSdAi-Desktop/actions/runs/37007595442),
and [base ancestry](https://github.com/tiankongbushexian-crypto/WcSdAi-Desktop/actions/runs/37007595418).
The local follow-up package above predates its follow-up commit. Final head
checks and native installer availability are recorded by the subsequent PR
and Team Installers workflow runs.

After the notice-layout change, the GitHub license API still returned Other.
The unchanged attribution comment was therefore moved after the exact original
LGPL text, keeping the standard GNU heading first. Final source LICENSE SHA-256:
`554a96d21a0eb27516db46d1cefd31ec69f35c0dde20b64cef921edadd8121fe`.
This footer-only source adjustment postdates the local package hashes above.
Hosted packages use the final committed notices. It changes no executable code,
entitlement or packaging parameter; server-side recognition remains a separate
metadata check.

## First hosted candidate: delivery checks found a missing notice

[PR #1](https://github.com/tiankongbushexian-crypto/WcSdAi-Desktop/pull/1)
merged after all four checks passed for
`9373158a6b82fea4dc21f51e92610aa89b4cf942`. Its merge commit is
`0e31e45b25322c68b6b5dec4cf0622347ec9bca5`; local main was synchronized only
after the remote merge. The repository About description and homepage now use
WcSdAi / 量动科技 and https://wanchuangsd.cn. README, Chinese README,
CONTRIBUTING, LICENSE and SECURITY on remote main matched their committed blobs.

[The first native run](https://github.com/tiankongbushexian-crypto/WcSdAi-Desktop/actions/runs/37010853990)
built all three installers successfully from that merge commit. Downloading
each artifact and recomputing every `SHA256SUMS` entry passed. Their source
archives matched the exact committed source and carried SHA-256
`7472ba6650ba2511b8a51f0ecefbe4ea5e5e2e6120abe9b655cd4f17afaac07c`.
These are historical build results, **not the accepted download candidate**:
actual macOS bundle inspection found a missing Chromium notice.

The downloaded arm64 app passed strict ad-hoc verification, native identity,
icon and all eight tracked legal-file checks. Two isolated launches restored
all 800 synthetic Sessions, with WcSdAi branding and zh-CN. Its DMG SHA-256 is
`0f7d2e3b64ecbabb34dafc2552c8adb0893149851d707787c23ee9a8599727c0`.
No live provider, installed app or real user profile was used. Owned processes,
profiles and mount points were cleaned. The corresponding ignored evidence is
`hosted-arm64-verification-37010853990.json`,
`hosted-team-packaged-smoke-37010853990.json` and
`download-verification.json` under `.artifacts/wcsdai/`.

The actual package lacked `licenses/Electron-LICENSES.chromium.html` anywhere
in the app or frameworks. Electron 43.6.0 installs its runtime on demand, not
through `postinstall`; the clean runner had never started development Electron.
electron-builder downloaded its own runtime, warned that the extra-resource
source under `node_modules/electron/dist` did not exist, then continued. Its
macOS packaging also removes the runtime's root Chromium notice. The local
developer environment already had that extra-resource source, masking the
clean-runner omission. This is a packaging defect introduced by relying on a
local runtime path, not a session or data-compatibility failure. Delivery must
use a rebuilt candidate whose notice preparation and final packaged copy are
checked by the common packaging path.

Static extraction of the first Windows NSIS package with the existing system
archive tool confirmed that its payload root already contained Chromium and
Electron notices; the missing notice defect was confirmed in macOS, not in the
entire Windows payload. Its app and Host are unsigned AMD64 executables, the
product/version/icon and all eight tracked legal resources matched, and its
ASAR identifies the installed distribution. No Windows executable was run.
The evidence is `.artifacts/wcsdai/windows-static-0e31/report.json`; actual
Windows installation, startup, upgrades and OS-protected credentials remain
device acceptance work.

## Chromium notice repair candidate

Commit `c92bac5995293592d7e1b6f83f0dc6dfc48407e1` contains the shared
extraction/verification hooks. Its base is
`0e31e45b25322c68b6b5dec4cf0622347ec9bca5`. The actual PR #2 integration
candidate had the identical executable tree to the tested head. The 36
packaging tests (13 runtime-notice, 9 footprint, 14 team-workflow) and five
runtime-build contract tests passed; lint, release-doc, agent-policy,
documentation and base-ancestry checks also passed.

Actual arm64 directory packaging at the committed head preserved all eight
tracked legal files and the 19,956,022-byte Chromium notice, with SHA-256
`7ae82e97b8a60b9d97871e0e11a05285aea2d42bef665f93f6a4f415235839ed`.
The builder log confirms the notice gate ran before ad-hoc signing. The app
passed strict signature validation and two isolated launches restoring all
800 synthetic Sessions. Processes and profiles were cleaned without touching
the user's installation or data. Evidence under `.artifacts/wcsdai/`:
`runtime-notices-c92bac599529-package-verification.json` and
`runtime-notices-c92bac599529-smoke.json`.

The first full JS CI attempt at this commit failed one pre-existing MCP timing
test: `a remote MCP tool can run longer than the connection timeout` in
`apps/desktop/test/plugin-mcp.test.mjs`. Its real loopback HTTP initialization
exceeded the test's 20 ms connection budget at approximately 26 ms, before the
tool call began. The test and production MCP module are unchanged from the
base. All 30 tests in that file passed in the focused local run (the relevant
tool call took 88 ms). The failure log remains
`chromium-notices-ci-failure.log`; focused evidence is under `mcp-ci-c92/`.
Only the failed JS job was rerun at the same commit; no timeout, permission,
production code or test assertion was weakened. A green retry does not remove
this underlying test timing sensitivity.

All four PR #2 checks passed on that retry, and the fix merged as
`0d7673eb9a7d3dbb4fd5d1e9fa7be0cd90ff22be`. Main CI also passed without a
retry. The subsequent
[native run](https://github.com/tiankongbushexian-crypto/WcSdAi-Desktop/actions/runs/37015957023)
passed both macOS architectures but failed Windows before extraction: the Windows
release launcher invokes the builder directly, which detected `apps/desktop`
as its workspace root and correctly rejected a hook outside that boundary.
The source archive downloaded from this run matched all 3,083 committed blobs;
this partial run is not the accepted cross-platform delivery candidate.

The follow-up places the same hook inside the desktop build directory and
tests resolution with the desktop directory as the strictest workspace root.
It preserves the builder's path restriction and changes no runtime code or
notice verification logic. Failed native artifacts are not treated as passing
Windows evidence.

The path fix is commit `9bbab5572e1e16d92c2e20f615b505be4e7df73d`, based on
`0d7673eb9a7d3dbb4fd5d1e9fa7be0cd90ff22be`. The stricter relative-path
resolver test first reproduced the old rejection, then all 36 packaging tests
passed. The hook body is unchanged byte for byte. Actual arm64 packaging from
that committed candidate passed the notice gate, strict ad-hoc verification,
all legal/brand checks and two isolated launches restoring all 800 synthetic
Sessions. Its PR #3 integration candidate has the same executable tree as the
tested head. No user installation or profile was touched. Evidence:
`runtime-notices-9bbab5572e1e-package-verification.json` and
`runtime-notices-9bbab5572e1e-smoke.json` under `.artifacts/wcsdai/`.


## Accepted hosted team build

All three native build jobs, platform typechecks, artifact collection/upload,
and the corresponding-source job passed in
[run 37018547778](https://github.com/tiankongbushexian-crypto/WcSdAi-Desktop/actions/runs/37018547778).
The executable/source commit is `6dc7fc9ebc63448f15a65b78542abe9505aabca3`,
the merge of PR #3. Its four PR checks passed without retry. Subsequent
changes in this delivery record and the deterministic MCP test below do not
change the runtime or installer contents; the artifacts correctly identify
their actual source commit rather than a later documentation commit.

| Platform | Verified artifact | Installer bytes | Installer SHA-256 |
| --- | --- | ---: | --- |
| macos-arm64 | [Download](https://github.com/tiankongbushexian-crypto/WcSdAi-Desktop/actions/runs/37018547778/artifacts/11231618108) | 134,647,642 | `d61bc559177bbb01a713b7f24e48d401cd6f383c4ae68e8d0a4fc573608fcbb1` |
| macos-x64 | [Download](https://github.com/tiankongbushexian-crypto/WcSdAi-Desktop/actions/runs/37018547778/artifacts/11232087687) | 140,845,573 | `e0c7008a8eaab8bb4fc1d31bc5c804727532c6448d2eb02e5f042af2acc05c10` |
| windows-x64 | [Download](https://github.com/tiankongbushexian-crypto/WcSdAi-Desktop/actions/runs/37018547778/artifacts/11231329104) | 119,882,116 | `0c10fe1672d62017aa68aa8a9c96d34f12807336555cad6cb0a97e09f64e01da` |

Every downloaded installer artifact passed all 12 outer checksum entries.
The separate source artifact passed its 11 entries. Every source archive
matched all 3,084 Git blobs, including modes and symlink targets, at the exact
build commit. The common source tarball SHA-256 is
`5f7362a787eb07c1f9014f7d69074a908aee71ac1c33e2fd1b1fcfda641f9948`.
The [separate source download](https://github.com/tiankongbushexian-crypto/WcSdAi-Desktop/actions/runs/37018547778/artifacts/11231692178)
is also included inside each installer artifact. Downloads require GitHub
sign-in/read access and expire after the configured 30-day retention
(2026-11-01 for this run). No tag or GitHub Release was created.

The actual downloaded Apple Silicon DMG passed native WcSdAi / 1.0.1 /
com.example.wcsdai identity, arm64 app/Host architecture, icon and eight
tracked legal-file checks against the build commit. Its 19,956,022-byte
Chromium notice matched the actual native packaging log, SHA-256
`7ae82e97b8a60b9d97871e0e11a05285aea2d42bef665f93f6a4f415235839ed`.
Both mounted and copied applications passed strict ad-hoc seal verification.
Two isolated launches of the copied app restored exactly 800 distinct synthetic
Sessions after restart, including Session reads. Owned processes, temporary
profiles and mount points were cleaned, with no cleanup errors. No existing
application installation or real user data was modified by these checks.

The Intel DMG passed the same static identity, icon, legal-file and Chromium
checks, with x86_64 app/Host binaries and strict ad-hoc seals. Its application
was not executed on this arm64 host.

The Windows NSIS payload was extracted with the existing system archive tool,
without executing an EXE. App and Host are AMD64 PE32+; version 1.0.1, company
量动科技, WcSdAi title, installed-distribution metadata, icon and all eight legal
resources matched the build commit. The installer/app/Host have empty
Authenticode certificate tables. The packaged Chromium notice equals the
runtime's root copy byte for byte: 20,313,960 bytes, SHA-256
`c971fa90cb787337e9df73773f3b43cd5621f035e53cded439bd927b3b759e0c`.
It matches all three actual native packaging passes in the job log, excluding
earlier test-fixture hashes. No Windows execution or installation is claimed.

Evidence under ignored `.artifacts/wcsdai/`:

- `download-verification-37018547778.json`
- `hosted-arm64-verification-37018547778.json` (SHA-256 `897cdea4e3fafae54a53aadeb8215c6da6bae99d4c7c6cd5162fc67744532b2c`)
- `hosted-team-packaged-smoke-37018547778.json` (SHA-256 `ed5cad25063366f121e77abcad42dd9f33e504d045b14758b318abca8ccc2832`)
- `hosted-x64-verification-37018547778.json` (SHA-256 `3ad57d4b45ad8a8636720c52660fbb0e02accc9fd9fbf240519528d623d74a30`)
- `windows-static-6dc7-final/report.json` (SHA-256 `de812da9d238c86abf853a4309759603791e7bc1e2c73b940a3d563eb78a18c2`)

After accepting this replacement, the five superseded installer artifacts
from runs `37010853990` and `37015957023` were removed to avoid accidental
downloads of obsolete candidates. Their workflow logs, corresponding-source
artifacts and local historical verification evidence remain available.

Actual Windows and Intel Mac installation, startup, upgrade, uninstall and
OS-protected credential acceptance still require representative team devices.
Live model-provider and external MCP services were not called. Automatic
updates remain unconfigured; team updates use manual installer replacement.

## Deterministic MCP timeout regression coverage

Main CI run `37018516708` at the installer source commit hit the same existing
20 ms initialization race again, at approximately 28 ms. Installer builds and
native typechecks passed independently; the failed full CI attempt is retained
as evidence, not reported as green. The failure log is
`.artifacts/wcsdai/final-main-ci-failure.log`.

The follow-up changes only the timeout test in `plugin-mcp.test.mjs`, using the
real public `McpServerClient`, an immediate HTTP `fetchImpl` handshake and a
deferred tool response. It waits until `tools/call` starts, advances a controlled
clock by 80 ms, and proves the request was not aborted by the 20 ms connection
budget before completing within its 500 ms tool budget. Neighboring real
loopback HTTP tests remain. The unused wall-clock slow-tool fixture branch was
removed. Production timeouts, transports and permissions are unchanged.

All 30 tests passed on the existing Node 22.23.3 and Node 24.19.0 runtimes.
Two isolated production-text mutation fixtures both failed the intended signal
assertion: one drops the transport's tool timeout, the other uses the connection
budget for the tool request. Neither produced unhandled rejections or cancelled
tests. No mutation touched tracked production code or required new dependencies.
Evidence: `mcp-timeout-controlled-node22.log`,
`mcp-timeout-controlled-node24.log` and `mcp-timeout-mutations/*.log` under
`.artifacts/wcsdai/`. This test-only repair does not require rebuilding the
accepted installers from an unchanged runtime tree.
