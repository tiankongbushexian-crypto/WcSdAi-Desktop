# Repository pages and unsigned team packaging verification

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
