# ADR: WcSdAi display brand with preserved storage identity

- Status: Accepted for this fork by the product owner
- Date: 2026-10-02
- Scope: fork of PI-Desktop v0.16.0; amends upstream brand/default-locale and
  application-ID decisions, plus a subsequently authorized local directory
  migration; process and security boundaries remain unchanged
- Related: [brand migration](../wcsdai/brand-migration.md),
  [local data migration](../wcsdai/local-data-migration.md), ADR 0278, ADR 0035

## Context

The owner explicitly requested WcSdAi, version 1.0.1, Simplified Chinese by
default, com.example.wcsdai, monochrome supplied artwork and preserved existing
sessions/configuration/permissions. Blind renaming would change Electron
userData and the OS encryption namespace even if host SQLite stayed in place.
Electron 43.6.0 derives Linux encryption product/application names and the
macOS Keychain service/account from Browser::GetName during startup.
See the [version-pinned implementation](https://github.com/electron/electron/blob/v43.6.0/shell/browser/electron_browser_main_parts.cc#L591-L633).

The owner subsequently authorized relocating the installed application's physical
data directories to WcSdAi names and removing the old application bundle after
verification. This amends the initial decision to keep every directory name
unchanged. Directory selection and the authorized filesystem operation are
separate: the resolver does not move or merge data.

## Decision

1. Display name and native package name are WcSdAi. The private root slug,
   Linux executable and desktop entry use wcsdai. Package scopes, Pi names,
   host executable, IPC, schemas, environment overrides and serialization
   markers stay unchanged.
2. Native Bundle ID and Windows AppUserModelId use com.example.wcsdai;
   development uses com.example.wcsdai.dev. This is a separate native app
   identity, pending owner's final release confirmation of the placeholder ID.
3. Keep Electron's internal app name PI-Desktop for OS encryption. Explicit
   WcSdAi labels cover app menu, native About, hide/quit, windows, tray,
   notifications and peer display info. This technical compatibility name
   must not be subjected to future global brand replacements.
4. New installations use `WcSdAi` / `WcSdAi Dev` userData and
   `~/.wcsdai` / `~/.wcsdai-dev` Host data. Before migration, an existing
   legacy directory remains the fallback when its WcSdAi counterpart is absent.
   Electron selects the new userData directory when present. Host selection
   retains the old logical root only when it is a symlink resolving to that
   exact new directory; historical absolute attachment paths, permissions and
   fork copies therefore keep working. An independent legacy directory cannot
   override an existing new root. Explicit overrides still win, development
   stays separate, and broken aliases fail observably. The resolver never
   copies, renames, merges or creates data; physical migration follows the
   separately authorized procedure and retains a recoverable backup.
5. Missing UI language means zh-CN. Explicit saved languages and Auto retain
   their behavior; English remains the translation fallback/source language.
6. The release address stays empty until owner confirmation. An unconfigured
   packaged build cannot check/download/install from the upstream feed.
   Existing platform updater behavior resumes once fork feed metadata and URL
   are configured. A tag readiness check blocks publication until configured.
7. Keep original LGPL and third-party notices. Package notices and exact
   installed Electron/Chromium license text; do not reuse upstream signing
   identity or claim signed artifacts without actual signing validation.
8. The owner's later distribution decision selects unsigned packages for their
   team. A separate manual `team-builds.yml` packages native macOS arm64/x64 and
   Windows x64 installers with corresponding source and checksums. It needs no
   signing secrets and does not enable an update feed. Existing signed tag
   release gates stay separate. Team intent does not change repository access
   control, license terms, OS security policy or runtime permissions.

## Alternatives

Renaming all pi identifiers was rejected because it breaks compatibility.
Unconditional directory renaming was rejected because it strands existing state.
Selecting the new Host spelling after relocation while relying only on an old
symlink was rejected: several consumers check lexical containment before
realpath, and session forks match recorded file prefixes. Retaining the old
logical Host root through a verified alias preserves those boundaries without
rewriting transcripts or broadening permissions. Fresh profiles use new names.
Renaming Electron's encryption identity was rejected because existing paired
host tokens and Chromium encrypted data could become unreadable. Plaintext
fallback or relaxed keychain permissions were rejected. A separate credential
migration is unnecessary while the legacy identity can be retained.

## Consequences

The native Bundle ID still changes OS permissions, installer identity and
signing trust. Tests prove profile selection and startup internal identity;
real signed upgrade, keychain authorization prompts, notifications, uninstall
and co-installation require platform release validation. Old and migrated paths
can refer to the same physical profile. The migration
must stop both applications and their writers; do not run the removed upstream
bundle alongside WcSdAi or rely on differently spelled profile paths to prove
mutual exclusion. Do not use an explicit `PI_DESKTOP_DATA_DIR` environment
variable to implement the normal migration, because it disables the normal
single-instance gate. Keep the legacy aliases while recorded paths depend on
them. Host startup still performs its existing stale-scratch cleanup, making a
verified pre-launch backup part of the loss-prevention boundary.

The physical move does not alter the SQLite format: the current Host schema
is **21** (`crates/host-core/src/db.rs`), and protocol remains **11**. The
separate shared `SCHEMA_VERSION = 16` constant is not the Host database version;
this migration changes neither. Migration-specific evidence must be recorded
for the later executable, separately from the earlier brand-only build.
An approved update endpoint and published legal policies remain prerequisites
for the optional public-update service. The current unsigned team lane uses
manual downloads and updates; it requires neither that service nor signing
credentials. See [team distribution](../wcsdai/team-distribution.md).
