# WcSdAi verification report

> **Historical build evidence:** The hashes, test counts and packaged acceptance
> results below belong to the earlier brand-only build, before the later
> directory resolver and explicitly authorized physical migration. See
> [local data migration](local-data-migration.md) and its
> [separate verification report](migration-verification.md). These earlier
> results are preserved and must not be presented as migration verification.
> The later team-distribution change adds WcSdAi attribution to root `LICENSE`
> while preserving the full original LGPL text. Its package/license hashes and
> unsigned build checks are recorded in [team verification](team-verification.md).

Verification date: **2026-10-02 (Asia/Shanghai)**. Target: **WcSdAi 1.0.1**.
Status: **local engineering validation complete; publication remains blocked by
owner configuration and release qualification**. The final all-workspace test
run passed **6,396 JavaScript tests and 724 Rust tests (7,120 total)**.
Typechecks, lint, unsigned macOS arm64 packaging, DMG read-only inspection and
final packaged startup/restart acceptance passed. This is not a signed or
published release. Earlier results retain their individual tested fingerprints.

## Candidate and environment

| Field | Recorded value |
| --- | --- |
| Baseline | PI-Desktop v0.16.0 |
| HEAD and fetched base main | `22dfb87a84056127fad07617e8d06974f927bebc` |
| Request branch | `codex/wcsdai-brand-foundation` |
| Candidate state | Baseline plus the uncommitted request-worktree changes; no committed release candidate, tag or published release |
| Host | macOS 26.5, build 25F71, arm64 |
| Node.js | 22.23.3 |
| pnpm | 12.8.1 |
| Rust | rustc 1.98.1 (`48a229cea`, Homebrew) |
| Cargo | 1.98.1 (`797e8a9bc`, Homebrew) |
| Electron | 43.6.0 |
| Provider/API environment | Isolated profiles and synthetic/local fixtures; no real model credential or paid provider call |
| Support contact | `2222223323@qq.com`, confirmed by the project owner |

The existing checkout, dependency tree, package caches and Cargo target were
reused. No clone, initialization, fresh pnpm dependency environment, user-profile
migration or production-server login was performed. Logs and synthetic fixtures
live in ignored `.artifacts/`; they are not product resources.

Use `pnpm --config.verify-deps-before-run=false <script>` for the linked task
worktree. This prevents pnpm 12's pre-run dependency check from trying to replace
linked workspace directories. Clean CI still installs from the lockfile.

The first offline Cargo test attempt exposed missing test-only crate caches.
Under the repository's missing-dependency exception, Cargo downloaded only the
locked `fastrand 2.5.0`, `tempfile 3.27.0` and `rustix 1.1.4` into the existing
cache. No dependency versions or runtime were replaced to make tests pass.

## Recorded executable fingerprints

The successful renderer/Host brand E2E report at
`.artifacts/wcsdai/brand-e2e/verification.json` recorded:

| Evidence | SHA-256 |
| --- | --- |
| Tracked task diff at that run | `ce1710216fa7788ac6526bf0a880cb547ef5bb6099ade7fb4e31f72aaaa2ee3e` |
| Built Electron main at that run | `7a3f75fa60c34ec7a6efbf1c0bbab6d2b51b7aebd3759258a1e1f06b9668c495` |
| Built renderer entry at that run | `18615b2681894fcb9bf72ddb3de9e39296e1b569aab1bc0439a83cc8b73411de` |
| Rust debug host used by protocol E2E | `47a8fb11bb15a169196aa062a80075facd169485f84642c94b73fe1a9d8085f8` |

A tracked diff hash excludes untracked additions. The executable fingerprints
and test reports identify the actual earlier build; they are not a complete
source archive or proof of a later candidate. The final package includes the last OAuth success-page brand text adjustment.
Final package fingerprints are recorded below; `.artifacts/wcsdai/final-candidate.json`
records every modified/added source-file hash after report finalization.

## Commands and results

All log names below are relative to `.artifacts/wcsdai/` unless stated otherwise.
`Pending` means no final success is claimed. Prior and final results are kept
separate intentionally.

| Command / check | Recorded result | Evidence / scope |
| --- | --- | --- |
| `pnpm install` | **Not rerun intentionally** | Existing provisioned dependencies reused. Initial implicit pnpm pre-run attempts failed against linked directories; see failure classification. |
| `pnpm --config.verify-deps-before-run=false build:js` | **Passed**, including final official test-command prerequisite | `build-js.log`, `final-pnpm-test.log`; all workspace builds completed. |
| `pnpm --config.verify-deps-before-run=false -r --if-present typecheck` | **Passed**, final workspace check exit 0 | Earlier `typecheck.log`; final `final-workspace-typecheck.log`. |
| `pnpm --config.verify-deps-before-run=false lint` | **Passed**, final run exit 0 | `final-lint.log`: Biome checked 102 files and style tokens passed. |
| `pnpm --config.verify-deps-before-run=false test` | **Passed**, final run exit 0: 6,396 JS + 724 Rust tests | `final-pnpm-test.log`: 3,021 Vitest tests across 235 files, 3,364 desktop Node tests, 11 docs Node tests; 0 failed/cancelled in final desktop output and 0 failed/ignored Rust tests. |
| `cargo check --locked` | **Passed** | `cargo-check.log`, host-core 1.0.1; earlier baseline 0.16.0 also passed in `baseline-cargo-check.log`. |
| `cargo build -p host-core --locked` | **Passed**, explicit final debug build exit 0 | `cargo-build-debug.log`; earlier build and cached development launch also succeeded. |
| `cargo test -p host-core --locked` | **724 passed, 0 failed, 0 ignored** | `cargo-test.log`; 37.39 seconds test execution following 15.65 seconds compilation. |
| Brand/persistence/update regression tests | Red: **9 passed, 4 failed**; green: **13 passed, 0 failed** | `brand-regression-red.log`, `brand-regression-green.log`; data-profile compatibility and unconfigured update-feed rules. |
| Targeted desktop brand / packaging / settings / update contracts | **87 passed, 0 failed** | `brand-targeted.log`; corrected source contracts and relevant behavior tests. |
| `pnpm --config.verify-deps-before-run=false test:e2e` | **23 passed, 0 failed, 2 skipped** | `e2e-smoke.log`; real isolated Host RPC. |
| `pnpm --config.verify-deps-before-run=false test:e2e:plan` | **13 passed, 0 failed, 4 skipped** | `e2e-plan.log`; permissions, Plan state, restart, local commands and cancellation. |
| `pnpm --config.verify-deps-before-run=false test:e2e:mcp-market` | **5 passed, 0 failed** | `e2e-mcp-market.log`; no remote server installation or live network access. |
| `node scripts/e2e-tool-admission.mjs` | **1 scenario passed** | `e2e-tool-admission.log`; 4 active plus 12 queued local shell jobs preserve independent Read/Write capacity and drain cleanly. |
| `node scripts/e2e-electron-boot.mjs` | **4 checks passed** on earlier production build | `e2e-boot.log`; real Electron, sandboxed preload, Host, 800 synthetic sessions, project IPC and Ctrl+R protection. |
| `node scripts/e2e-wcsdai-brand.mjs` | **5 user-path checks passed** on recorded build | `brand-e2e/verification.json`; screenshots in the same directory. |
| Isolated `pnpm dev` with explicit Chromium profile | **Passed**, own processes stopped | `dev-smoke.log`, `dev-smoke.json`; command and native bundle evidence below. |
| `pnpm check:release-docs` with linked-worktree configuration | **Passed** on recorded candidate | `release-docs.log`: version 1.0.1 and README 1.0.x release line aligned. |
| `pnpm check:agent-policy` with linked-worktree configuration | **Passed** | `policy-check.log`: AGENTS/CLAUDE policy sync. |
| `pnpm check:pr-base` with linked-worktree configuration | **Passed at check time** | `pr-base.log`: HEAD equals fetched base. No PR or integration candidate was created. |
| VitePress docs build | **Passed** | `final-docs-build.log`: client/server build and rendering completed; nonblocking highlighting/chunk warnings remain. |
| Icon/source validation | **Passed** | `.artifacts/wcsdai-assets-verification.json`: vector paths retained, rounded tile, monochrome pixels, PNG/GIF/ICO/ICNS sizes and hashes. |
| License inventory regeneration and assertions | **Passed** | Lockfile coverage, unique rows, original LICENSE identity, KaTeX font metadata, Chromium notice hash and deterministic regeneration checked. |
| `node --check docs/wcsdai/generate-license-inventory.mjs` | **Passed** | Generator syntax checked. Biome explicitly excludes this docs path, so its zero-file invocation is not a lint pass. |
| Local unsigned macOS arm64 package | **Passed**, final build exit 0 | `package-macos-final.log`; earlier `package-info.json` recorded WcSdAi / 1.0.1 / `com.example.wcsdai`; final packaged inspection is separate below. |
| macOS arm64 DMG | **Passed** build and read-only mount inspection | `dmg-build-final.log`, `dmg-inspection.json`: final packaged ASAR, Host and notices match by hash; Applications shortcut present. No install, signing or notarization claimed. |
| Final packaged app startup/restart | **Passed**, two real launches of the final packaged app | `packaged-smoke.json`, `packaged-smoke.log`: packaged Host/preload/file renderer, zh-CN title, 800 persisted sessions and sessionGet restored; own process groups and temporary directories cleaned. |
| Final packaged licenses, native identity, icon and feed | **Passed** | `package-info.json`: 12 required resources inspected, original LICENSE preserved, validated ICNS bytes match, 1.0.1 / com.example.wcsdai confirmed, app-update.yml absent. |
| Read-only credentials / changed-text review | **Passed with no real credential findings** in the recorded scan | Main validation owner reviewed 3,073 files and 153 changed text files; known synthetic test fixtures retained. Repeat for any later credential-bearing change. |
| Local documentation / links | **Passed** | 396 inspected local link targets exist; `final-docs-check.log` validates 83 locale pairs and 558 documentation pages, including the changed-files report. |
| Release readiness gate | **Expected refusal verified** | `release-readiness.log`: readiness opt-in, fork GitHub feed and release URL are unset; the gate rejects publication as expected. This is not a release-ready pass. |

## Representative user paths and limits

The recorded brand E2E uses the real renderer, sandboxed preload, Electron Main
and Rust Host. It passed these five sequences:

1. Fresh boot shows WcSdAi, Simplified Chinese, the Chinese welcome and loaded
   product images.
2. Settings → Info shows WcSdAi, version 1.0.1, Copyright 2026 量动科技,
   the confirmed support email, PI-Desktop/LGPL attribution, website link and
   the unconfigured-update status.
3. A new project is created through public preload IPC, saved by the Host and
   found in the sidebar after restart.
4. The project sidebar creates and selects a Session; the composer appears and
   the Session remains in the persisted list.
5. A user explicitly selects English, restarts, and sees both that saved
   preference and the same project/Session; the Session can be reopened.

The native folder picker is bypassed at its public IPC boundary for automation.
Project creation, Host persistence and subsequent Session interactions remain
real. This is not a manual operating-system file-picker test.

The protocol smoke additionally covers provider creation and secret redaction,
Session message persistence and revision restoration, project deletion and its
running-session refusal, Read/Glob, path-escape permission rejection, Plan write
rejection, and plugin load/localization/tool-dispatch/disable. Plan E2E verifies
that pending approvals and queued/running executions do not replay unsafely
after Host restart. Tool admission performs actual local Read, Write and Bash
work in synthetic projects. MCP E2E validates install configuration, named
arguments, header credential scope and persistence/network-policy boundaries;
it does not execute arbitrary downloaded marketplace servers.

Rust's passing suite includes migrations and legacy project/model records,
Session restoration, provider order after reopen, permissions, plugin/MCP
validation, tools, cancellation and resource cleanup. This supplies regression
evidence without claiming a signed cross-version upgrade on a user's real data.
Real provider responses, paid APIs, external MCP servers and production updates
were not invoked. Those tests remain separately qualified release work.

## Isolated development launch

The validated command shape was:

```bash
pnpm --config.verify-deps-before-run=false dev -- \
  --user-data-dir=<temporary-chromium-profile> \
  --remote-debugging-port=<allocated-local-port> \
  --remote-debugging-address=127.0.0.1 \
  --password-store=basic
```

The child environment used an OS/tool-path allowlist, an empty model API key,
loopback test base, `PI_DESKTOP_BOOT_PROBE=1`, and a fresh Host data directory
under the platform temp directory named `pi-desktop-boot-wcsdai-dev-*`.
No user app or keychain was used. The probe exited successfully; its own process
group was checked empty and its temporary Host data was removed.

CDP observed `document.title === "WcSdAi"`, `lang === "zh-CN"`, the Chinese
welcome and a callable preload bridge at the local Vite URL. The boot probe
reported version 1.0.1, protocol 11, legacy storage identity `PI-Desktop`, six
macOS menu groups, successful project IPC and blocked Ctrl+R. All 800 synthetic
Sessions were returned in eight list reads: maximum read 97.9 ms, maximum Main
heartbeat gap 14.54 ms.

The native development bundle is
`.cache/electron-dev/43.6.0-a617f21eda64-v4/WcSdAi.app`.
Its plist has display/name/executable `WcSdAi`, identifier
`com.example.wcsdai.dev` and icon `icon.icns`. This development bundle uses
local ad-hoc signing; it is not Developer ID/notarization evidence.

`pnpm dev` rebuilds Main/preload in development mode. The final package must
therefore be rebuilt through the production build pipeline after this check.

## Skipped test cases

| Suite / case | Reason and practical limit |
| --- | --- |
| Smoke `E2E-008-live-model`, `E2E-009-stream` | API key deliberately unset; no live provider response or streaming claim. |
| Plan `E2E-107-late-expiry` | Public Host RPC has no clock-control boundary; no fake claim that the full expiry elapsed. |
| Plan `E2E-111-shell-change` | Only one available local shell; genuine selection changes have deterministic Host tests, not this native E2E case. |
| Plan `E2E-112-fallback` | Public RPC cannot make an installed shell unavailable without mutating the host environment. |
| Plan `E2E-115-60s-default` | Long-timeout switch unset; short-timeout validation and abort behavior passed, full 60-second leg did not run. |
| Windows/Linux/native Intel installers, signatures, upgrade/uninstall | This host is macOS arm64; those target environments and signing credentials were not supplied. |

## Failure classification and resolution evidence

| Failed attempt | Error / summary | Classification and outcome |
| --- | --- | --- |
| Initial `pnpm typecheck` / `pnpm lint`, including retries | pnpm attempted dependency reconciliation; `workspace hoist directory is not a real directory` for linked `node_modules/.pnpm` | Worktree/environment issue, unrelated to branding logic. CLI pre-run verification override allowed later explicit checks to complete without reinstalling. |
| First `CARGO_NET_OFFLINE=true cargo test -p host-core --locked` | Missing `fastrand v2.5.0`; HTTP refused in offline mode | Existing cache gap. Three locked test crates fetched into the existing cache; subsequent 724-test run passed. Original failure retained as `cargo-test-offline-attempt.log`. |
| Initial brand regression tests | 4 failures in data-profile compatibility and unconfigured update-feed behavior | Intentional failing repro during implementation. Following fixes, the same 13 tests passed. |
| Earlier recursive JS test run | Desktop: 3,362 tests; 3,342 passed, 13 failed, 7 cancelled | Intermediate failure retained as evidence. Brand/packaging source assertions were synchronized; the final official test run passed all 6,396 JS and 724 Rust tests. |
| Existing chat error-message test | Child test `network failures show the transport errno beside the error code` did not finish under the outer details/Continue test | Baseline test's misplaced closure left the child unawaited; test-only correction verified by the main validation owner. |
| Existing plugin WebSocket tests | Fake transport plus an unref'ed timeout let the event loop finish with pending assertions | Baseline test harness issue; test-only correction. |
| Existing plugin MCP timing test | Child-ready timing raced the 250 ms deadline under concurrent load | Existing load-sensitive test harness; test-only synchronization correction. The three repaired suites passed 50/50; the subsequent final all-workspace run also passed. |
| First development boot probe | `session-list probe requires its own temporary boot profile` | Harness initially used an artifacts subdirectory instead of the required immediate temp-directory child. Corrected fixture path, not product guard; final dev probe passed. First-attempt JSON/log preserved. |
| Earlier packaged boot probe | Same temporary-profile guard | Harness failure. Final packaged rerun passed; see packaged-smoke.json for the two successful launches. |
| Initial docs link validation | Generated license reference escaped the VitePress docs root | Documentation link corrected in generator and output; subsequent docs build passed. |
| Direct Biome invocation on inventory generator | `No files were processed` | Repository Biome includes do not cover `docs/`; recorded as not applicable, with syntax and generated-output checks instead. |

Packaging logged optional binaries for non-host platforms as unbundled, and
missing OpenBSD Koffi optional packages. The arm64 package build completed;
these messages are not evidence that other platform packages work. The initial
local build deliberately skipped macOS Developer ID signing.

## License and resource verification

The original LGPL `LICENSE` remains byte-identical to the baseline and its
`LICENSES/LGPL-3.0.txt` copy. Official GPLv3 and OFL1.1 companion texts are present.
The generated inventory covers **1,010 npm versions, 234 Cargo versions and one
KaTeX font group (20 TTF faces)**. It contains **211 pending metadata entries**
and **531 distinct collected license/notice texts** after filling the three
Cargo test-cache gaps. Pending values remain explicit; none is guessed.

KaTeX's npm package declaration is MIT while its actual font name tables declare
OFL1.1. The original font copyright, reserved names and license declarations
are preserved. Electron's original Chromium notice hash is recorded in the
inventory. Final package and DMG inspection verified the original Chromium
file and LGPL/GPL/third-party notices inside the actual rebuilt resources.
The collected notices include development/platform components, so the inventory
is broader than a per-installer SBOM.

Monochrome asset verification found zero visible non-neutral pixels in checked
outputs, preserved the supplied vector paths, and verified the rounded white
application tile. Product icons have black or white marks; antialiasing can
produce neutral grayscale edge pixels. The original app-resource filenames
that remain are compatibility paths, not evidence that the old artwork remains.
Historical documentation screenshots are explicitly described as inherited
upstream examples and need a separate publication refresh.

## Publication blockers and remaining decisions

- Confirm `com.example.wcsdai` as the final release Bundle ID; it is currently
  the user-specified placeholder-style value. Windows ID is the same; Linux
  entry/executable are `wcsdai.desktop` / `wcsdai`.
- Confirm download/update endpoint and GitHub publishing metadata. The feed is
  deliberately unconfigured (`build.publish: null`, empty release URL), so
  update delivery is disabled rather than falling back to the upstream feed.
- Provide WcSdAi macOS Developer ID/notarization and Windows signing credentials
  through approved secret storage. Do not copy upstream identity values.
- Qualify signed macOS arm64/x64, Windows x64 and Linux x64/arm64 installers,
  including upgrade, uninstall, rollback and platform permission behavior.
- Qualify old upstream data and OS-protected credentials with the final signed
  identity. Current tests preserve paths/formats and synthetic Session recovery;
  they do not replace an authorized signed-upgrade test using representative data.
- Make the exact corresponding modified LGPL source and applicable build/relink
  materials accessible with binary distribution, after explicit publishing
  authorization. An upstream-only link is insufficient for this modified build.
- Resolve missing license metadata for actually shipped target dependencies,
  embedded/native component notices, brand-artwork rights and the provenance
  of the vendored file-manager plugin's added MIT declaration.
- Confirm registered organization details and review legal/privacy data flows;
  approve and publish the privacy, terms and user-agreement drafts. Their proposed
  website URLs are not claimed to be deployed. The support email is already
  resolved and does not need another decision.
- Refresh public screenshots and obtain separate authorization for commit, push,
  tag, release upload or deployment. The recorded credential/diff review passed.

No user data format, technical Pi package names, plugin IDs, IPC protocol or
model-provider contract is intentionally renamed by the brand work. See
[brand migration](brand-migration.md), [license preparation](licensing-compliance.md)
and the [release checklist](release-checklist.md) for the exact retained surfaces
and remaining release gates.

## Final local artifact inspection

| Artifact | SHA-256 |
| --- | --- |
| WcSdAi-1.0.1-arm64.dmg (134,605,409 bytes) | `0e1493ddab0fe85bd3fea6240746cc018c2a4d23f957dd6e1d2e16c3f668a69f` |
| Packaged app.asar | `e8f722f8eb923a898ebf16176c917f9a6e23defb30aad26911a39ae65b1530d7` |
| Packaged release Host | `da908dbafe2066332a80901fea2111943540be0a8c994071e3ef66d83d69fb36` |
| Original and packaged LICENSE | `e3a994d82e644b03a792a930f574002658412f62407f5fee083f2555c5f23118` |

The DMG was mounted read-only with `hdiutil`, inspected and detached. Its
embedded application's ASAR, Host and license files matched the unpacked
final build byte for byte. It was not copied into Applications. Packaging ran
electron-builder's standard native dependency preparation and used its Electron
cache; no separate E2E dependency environment was installed.

Latest final fetch confirmed `origin/main` still equals the recorded base.
No PR integration candidate was created because commits/push/publication were
not requested. Remote `pi-host` automatic installation requires the matching
fork release artifacts to be published later; no unpublished fork download is
claimed available. No actual paid-provider response, signed legacy-keychain
upgrade, cross-platform install or production deployment was tested.

## Final packaged launch and recovery

The final two-phase harness (`node .artifacts/wcsdai/packaged-smoke.mjs`)
completed successfully on the same ASAR and Host hashes inspected in the DMG:

1. Launched the packaged executable using only its bundled Host and renderer,
   isolated HOME/profile/data, and no Host/renderer-path override. The full boot
   probe passed: 1.0.1, protocol 11, display WcSdAi, legacy storage identity,
   six native menu groups, project-removal IPC and blocked Ctrl+R. Eight reads
   returned all 800 fixture sessions; maximum list duration was 46 ms and
   maximum main-thread gap was 16.31 ms (test thresholds 1,000 ms).
2. Relaunched the same app with the same isolated data. CDP selected the real
   main window, confirmed file-based packaged renderer, title WcSdAi, zh-CN,
   ready Settings navigation and sandboxed preload. Public IPC recovered all
   800 unique sessions and loaded fixture session 1 with its saved model ID.
3. The boot phase exited itself; after recovery assertions the harness stopped
   only its owned process group. Both groups were confirmed empty and its three
   temporary directories removed. Native quit-confirmation interaction was
   not tested or bypassed in application code.

Intermediate packaged harness attempts exposed an overly broad CDP target
selector, a race with boot-probe automatic exit, an incorrect assumption that
ordinary appQuit skips the native confirmation, and macOS EPERM handling when
checking an already-empty process group. Their `first-attempt` through
`fourth-attempt` logs/reports were retained. These were harness-only fixes;
application code and packaged hashes did not change between the final attempts.
The final report has `result: PASS`, both phase results PASS, no cleanup errors,
and `temporaryDirectoriesRemoved: true`.
