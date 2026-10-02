# Local installation and data migration verification

Checked on 2026-10-02 (Asia/Shanghai), following the owner's explicit request
to uninstall PI-Desktop and move its data into WcSdAi without losing settings.
This is separate from the earlier [brand build report](verification-report.md).
The reusable procedure is [local-data-migration.md](local-data-migration.md).

The subsequent repository-page/team-distribution update has its own
[verification record](team-verification.md). The DMG hash below describes the
migration-time package; the later package contains updated license attribution
and notices without replacing the running installation or its data.

## Candidate and environment

- Branch: `codex/wcsdai-brand-foundation`; HEAD/base:
  `22dfb87a84056127fad07617e8d06974f927bebc`, plus the uncommitted request changes.
  `origin/main` was fetched again during final validation; no commit or push was
  requested or performed. Artifact hashes identify the actual executable tested.
- macOS 26.5, Apple Silicon; Node 22.23.3, pnpm 12.8.1, Rust 1.98.1.
- Installed application: `/Applications/WcSdAi.app`, version 1.0.1,
  bundle identifier `com.example.wcsdai`.
- Installed/rebuilt `app.asar` SHA-256:
  `398663aef06e5a36ba877bd4a7171e9a8924405ebd8591f58dbbe47ac6340e76`.
- Rebuilt `WcSdAi-1.0.1-arm64.dmg` SHA-256:
  `82d3d1676ddc69af3e85e2dd6f37b05666b013bfe67061d70f315919da42b44a`.
- Existing dependencies and caches were reused. pnpm commands use
  `--config.verify-deps-before-run=false` in the linked worktree to prevent
  pnpm 12 from reinstalling the already provisioned dependency tree.

## Local operation and preservation evidence

The old application's normal quit was confirmed before copying data. No active
turn or queued job existed at that point. Full coherent copies of Host data,
the installed and development Electron profiles, and the old app bundle were
created in a private backup outside the repository. Every copied file was
verified by size/hash, with directory, permission and symlink metadata checked.
Host data alone contained 80,424 entries / 68,098 files (8,993,636,301 bytes).
The complete backup and private manifests remain available for rollback.

Physical directories were renamed to the new absent destinations. Old root
names were retained as symlinks; no databases, messages or arbitrary absolute
paths were rewritten. All original file entries were verified again after the
move. The layout is:

| Data | Physical location | Compatibility alias |
| --- | --- | --- |
| Installed Host data | `~/.wcsdai` | `~/.pi-desktop` |
| Installed Electron profile | `~/Library/Application Support/WcSdAi` | Former `PI-Desktop` profile |
| Existing development Electron profile | `~/Library/Application Support/WcSdAi Dev` | Former `PI-Desktop Dev` profile |

No old development Host directory existed, so no development Host data was
moved. External project folders and `.agents` were not modified. The Host
retains the matching old logical root to preserve historical attachment and
plugin paths; Electron uses the new profile. The internal OS encryption name
remains `PI-Desktop`, independently from the visible brand.

Immediately after the first installed launch, SQLite integrity was `ok`, schema
was 21, and row counts and full-row hashes matched for **all 25 tables** against
the stopped baseline. The four Host encrypted credentials were successfully
decrypted in memory before and after relocation. No plaintext credential was
printed, saved, or added to repository artifacts. Both installed plugin paths
still existed and neither referenced the removed old application bundle.

The native window, menu and About page showed WcSdAi 1.0.1 with protocol 11 and
Host 1.0.1. Original projects and conversations appeared in the sidebar. The
application was then quit normally and launched again from its installed path.
The final read-only snapshot confirmed:

| Retained state | Result |
| --- | --- |
| Projects | Both original records retained; only `last_opened_at` changed |
| Sessions | All 18 original records unchanged; one additional empty session |
| Messages | All 7,734 original records unchanged |
| Provider configurations | All four original records unchanged |
| Credential metadata | All four original records unchanged |
| Models | All 69 IDs retained; discovered model metadata refreshed during live use |
| All tables | Integrity `ok`; no original primary-key row removed |

The model differences were limited to `display_name`, `capabilities_json`,
`context_window` and `updated_at`. These are precisely the existing
`cache_discovered_models` upsert fields. Opening the composer model menu or an
existing Provider editor can refresh that cache without changing saved Provider
configuration. This is consistent with live model discovery, but the database
comparison alone does not identify the triggering interaction. It is not
claimed that normal startup automatically refreshes this cache. Original values
remain available in the immutable backup.

Only after the new installation and data were verified was the old application
moved out of `/Applications` into the user's Trash. Its separate verified backup
was also retained. The running application is WcSdAi. Private backup locations,
database manifests and credential evidence are intentionally outside Git.

## Checks on this candidate

| Check | Result |
| --- | --- |
| Desktop profile, single-instance, branding and native menu tests | 36 passed |
| Desktop TypeScript check | Passed |
| Host-runtime migrated attachment tests | 5 passed |
| Host-runtime TypeScript check | Passed |
| `cargo test -p host-core --locked fork_` | 12 passed; 713 unrelated tests filtered out |
| `pnpm lint` | Passed: Biome and style-token checks |
| Desktop `pack` | Passed; installed bundle matches the rebuilt ASAR |
| DMG build with `--publish never` | Passed |
| Read-only DMG inspection | Passed; ASAR matches installed app, native ID/version and license files verified |
| Native installed launch, normal quit, restart | Passed with original data |
| Initial / post-restart SQLite comparisons | Passed with the live-use differences recorded above |
| Documentation checks and diff whitespace | Passed |

Local test/build evidence is under ignored `.artifacts/wcsdai/migration-*`.
Real-user evidence is only in the private backup. The previous full-suite
totals and previous artifact hashes in the brand report apply to that earlier
build; this narrower follow-up did not repeat those suites.

## Remaining limits

- Preserve the compatibility aliases while historical absolute paths depend on
  them. Do not run the old bundle concurrently against the same data.
- Host credential decryption was verified; every external OAuth login,
  browser partition and paid model interaction was not exercised. No paid
  inference was submitted as a migration test.
- The native Dock automation surface timed out. An old pinned PI-Desktop
  shortcut may remain even though its installed application has been removed;
  the verified launch destination is `/Applications/WcSdAi.app`.
- This migration was verified on this Mac. Windows junction behavior and Linux
  desktop migration were not exercised. Release signing, notarization and the
  other publication blockers in the release checklist remain separate work.
