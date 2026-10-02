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
  NOTICE.md. Final source LICENSE SHA-256:
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
