# WcSdAi brand migration

Baseline: PI-Desktop v0.16.0. Target: WcSdAi 1.0.1 (unreleased).
This plan records the permitted brand surface; the verification report records
executed checks. Historical release notes, ADR context and third-party attribution
remain evidence of the upstream product, not failed global replacements.

| Original value | New value | Type | Files / surface | Modified | Verification |
|---|---|---|---|---|---|
| PI-Desktop | WcSdAi | Product, window, menu, notification | shared/protocol.ts; Electron APP_NAME consumers | Yes | native identity + boot E2E |
| PI-Desktop | WcSdAi | Welcome, Settings, About, empty/error/command copy | i18n locales; renderer Settings | Yes | locale/About tests |
| English / OS when absent | zh-CN when absent; explicit Auto follows OS | Fresh UI preference | i18n; renderer; main menu | Yes | default + saved-language tests |
| pi-desktop | wcsdai | Private root slug | package.json | Yes | manifest check |
| net.aiuo.pi-desktop | com.example.wcsdai | macOS Bundle ID / Windows AppUserModelId | shared/protocol.ts; desktop package | Yes | native identity contract |
| net.aiuo.pi-desktop.dev | com.example.wcsdai.dev | Development bundle | scripts/dev-electron.mjs | Yes | launcher test + plist |
| pi-desktop.desktop | wcsdai.desktop | Linux desktop entry | desktop package | Yes | packaging test |
| PI-Desktop-* / pi-desktop deb/rpm | WcSdAi-* / wcsdai deb/rpm | Installer/artifact names | desktop package; release workflow; export scripts | Yes | package inspection |
| PI logo, mascot, tray and DMG | Supplied monochrome vector; rounded neutral app tile | Assets / splash | build; renderer assets; docs assets | Yes | dimensions + monochrome + visual inspection |
| PI-Desktop / PI-Desktop Dev | WcSdAi / WcSdAi Dev when present; legacy fallback before migration | Electron localStorage, partitions, cache and instance lock | main/data-paths.ts | Resolver updated after explicit migration authorization | fresh/legacy/migrated profile regressions; separate local migration acceptance |
| ~/.pi-desktop / ~/.pi-desktop-dev | ~/.wcsdai / ~/.wcsdai-dev for fresh/physical roots; matching legacy alias remains logical root after migration | Host config, SQLite, logs, cache, secrets | main/data-paths.ts; host-core | Resolver updated; physical move is separately authorized | alias containment/fork regressions; separate local migration acceptance |
| @pi-desktop/*, pi-ai, pi-agent-core | Unchanged | Technical packages / imports | workspaces, lockfiles | Preserve | build/typecheck |
| pi-desktop-host-core, pi-host, piDistribution, piDesktop | Unchanged | Executable/runtime/bridge contracts | Rust, runtime, packaging | Preserve | host/IPC tests |
| pi-desktop/*, .piplug, pi.* extension IDs | Unchanged | IPC and extension formats | shared, plugins | Preserve | protocol + plugin tests |
| vastsa/PI-Desktop | tiankongbushexian-crypto/WcSdAi-Desktop | Feedback/source/remote-host release repo | shared/github-feedback.ts | Yes | feedback / remote-host tests |
| Upstream latest release URL | Empty, pending confirmation | Update/download address | updater + publish config | Yes | unconfigured feed disabled test |
| aiuo.net docs | Fork-local documentation / wanchuangsd.cn brand site | Documentation links | README; help links; docs config | Yes | link audit |
| Upstream signing identity | No publisher credentials for current team lane; operator credentials only for optional signed release | macOS / Windows signing | team-builds.yml; release workflow; signing scripts | Yes | team packaging tests; retained signed-lane tests |
| PI-Desktop CI / Release | WcSdAi CI / Release | Workflow display name | .github/workflows | Yes | YAML + packaging contracts |
| 0.16.0 | 1.0.1 | Workspace/application version | release.mjs version surfaces; changelog | Yes | check:release-docs |
| pi-desktop in app-owned request templates | wcsdai | Default UA / client title | provider header templates | Yes | header tests |
| Provider-specific UA, OAuth client IDs | Unchanged | Provider compatibility | vendor runtime | Preserve | existing tests |
| Local crash product name | WcSdAi through APP_NAME | Observability | startup crashReporter | Yes | existing crash tests |
| Existing telemetry transport/settings | Unchanged | Telemetry | Pi dependencies / current app policy | Preserve | no endpoint/default change |
| Visible PI-Desktop test expectations | WcSdAi | Tests | branding/UI/packaging tests | Yes | targeted and full suites |
| Upstream copyright / LGPL | Unchanged original license text with a short WcSdAi attribution footer; detailed contacts in NOTICE | Legal | LICENSE; NOTICE; LICENSES; THIRD_PARTY_NOTICES | Yes | compare LGPL payload hash + license normalization + package contents |
| Upstream contributor and security contacts | tiankongbushexian-crypto / 量动科技 / 2222223323@qq.com | Repository community pages | CONTRIBUTING.md; SECURITY.md | Yes | identity/link review; no invented response SLA |
| No team installer entry | macOS Apple Silicon / Intel and Windows x64 download entries | Repository download experience | README.md; README.zh-CN.md; team-distribution.md | Yes | destinations and artifact names checked against workflow |
| Signed publication as the only documented delivery | Separate manually triggered unsigned team build | Team distribution | team-builds.yml; release-checklist.md; release runbook | Yes | native matrix, explicit unsigned flags, source/checksum/notice fixture tests |
| POSIX-only single-quoted dependency selector | Equivalent double-quoted selector supported by Windows cmd | Cross-platform build | desktop package build:deps; runtime-build-contract.test.mjs | Yes | actual dependency build; existing build contracts; native team runners |

No global textual substitution is permitted for technical identifiers,
serialization markers, user data, protocol versions, migrations, marketplace
URLs or provider authentication. There is no separate startup splash product
component; the existing window, home mark and DMG artwork are the brand surfaces.

## Compatibility exceptions verified during implementation

Electron's internal `app.getName()` remains `PI-Desktop` because Electron 43
uses it for macOS Keychain service/account and Linux encryption identity.
Native bundle identity, window title, menu labels, About, notifications and
renderer display are independently WcSdAi. The encrypted credential identity
is independent of physical storage names. The subsequent owner-authorized
[local data migration](local-data-migration.md) moves the physical roots while
retaining legacy aliases; Host uses the legacy logical spelling only for an
alias to the exact current root. New profiles use WcSdAi names; unmigrated
profiles retain legacy fallback. The resolver does not move, merge or delete
anything. Signed upgrade and OS prompt behavior still require a release-device
test, and earlier brand-only build results do not validate this later resolver.

Current Host SQLite schema is **21**, from `crates/host-core/src/db.rs`;
protocol is **11**. The shared metadata constant `SCHEMA_VERSION = 16` is
separate from the database version. This work changes neither surface.

MCP registration `clientInfo` / OAuth `client_name`, MCP control-plane tool
names and existing tool instructions, OpenCode routing client and User-Agent
(`pi-desktop/1.0.1`), live-voice system instructions, imported-plugin markers,
and upstream ecosystem environment variables remain compatibility identifiers.
Only the OAuth completion browser message and user-authored provider header
presets use the new display brand. This avoids changing authentication caches,
provider routing or Agent instructions during a brand-only migration.

Every modification has one of these purposes: displayed brand/asset replacement,
release identity and feed isolation, legal attribution, preservation of profiles
and encryption identity, subsequently authorized physical directory migration,
language default, or verification of those changes.
Three upstream test-only defects were repaired (unawaited nested chat test,
fake WebSocket timeout event-loop lifetime, and MCP child startup/deadline race)
so full validation can run reliably; no production timeout or permission changed.

## 1.0.4 platform icon correction

The owner rejected the 1.0.3 Mac menu-bar proportions and supplied Windows
screenshots showing excessive empty space and a white application tile. These
are separate platform surfaces; the original vector geometry, Mac Dock/Linux
application assets and home animations remain unchanged. Runtime/data contracts
are not part of this correction.

| Original value | New value | Type | Files / surface | Modified | Verification |
|---|---|---|---|---|---|
| 26×22pt Mac tray, 16pt mark, +1.25pt vertical offset | 22×22pt canvas, 13.5pt mark, no vertical offset, 1x/2x | macOS menu bar | make-icon.py; tray-icon-mac.png; tray-icon-mac@2x.png | Candidate | Geometry regression + native Tray + package resources; owner review separate |
| Windows icon.ico with padded white tile | Larger transparent black symbol with approved thin white outline in independent multi-size ICO | Windows desktop/taskbar/installer | make-icon.py; wcsdai-windows-icon.svg; icon.ico | Candidate; owner approved variant A | ICO alpha/bounds + packaged resource inspection; Windows visual acceptance separate |
| Windows tray resized from application tile to 16×16 | Separate black/white transparent ICO selected by system appearance; native DPI selection | Windows notification area | tray-image.ts; tray-icon-win-light.ico; tray-icon-win-dark.ico; desktop package | Candidate | Theme/lifecycle regression + packaged resource checks; native Windows acceptance separate |

Execution results, selected artwork and publication identifiers belong in the
[1.0.4 verification report](1.0.4-verification.md). The previous 1.0.3 package
and data-preservation evidence remains a historical result, not proof of this
new candidate or its visual acceptance.
