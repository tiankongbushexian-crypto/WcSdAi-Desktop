# Local data migration to WcSdAi

This procedure applies only after the owner explicitly authorizes a physical
directory migration and removal of the old application. It is a general
procedure, not a record that a particular user's data has been migrated or
verified. The original brand-only task did not authorize moving user data;
the later request does. Do not publish local database contents, credentials,
project names, absolute personal paths or recovery archives in this repository.

## Selection contract

The source of truth is `apps/desktop/electron/main/data-paths.ts`. Selection
never copies, renames, merges, deletes or creates a directory.

| State | Host data selected | Electron userData selected |
| --- | --- | --- |
| Fresh installed profile, neither directory exists | `~/.wcsdai` | `WcSdAi` below Electron `appData` |
| Only the legacy directory exists | `~/.pi-desktop` | `PI-Desktop` below `appData` |
| New directory exists; old directory is absent or independent | `~/.wcsdai` | `WcSdAi` below `appData` |
| Old Host root is a symlink to the exact new root | `~/.pi-desktop` as the logical root; `~/.wcsdai` as the physical root | `WcSdAi` below `appData` when present |

Development follows the same rules independently with `.wcsdai-dev` /
`.pi-desktop-dev` and `WcSdAi Dev` / `PI-Desktop Dev`. An explicit
`PI_DESKTOP_DATA_DIR` or `--user-data-dir` still takes precedence. The normal
installed migration must use resolver selection rather than adding a
`PI_DESKTOP_DATA_DIR` launch override: that override intentionally skips the
normal single-instance gate for isolated test environments.

On macOS, the installed Electron profile is normally moved from
`~/Library/Application Support/PI-Desktop` to
`~/Library/Application Support/WcSdAi`. Resolve the actual platform `appData`
location before acting; do not infer a Windows or Linux path from that example.
The old profile path may remain a compatibility symlink to the new profile.

The Host's old logical prefix is deliberate. File preview/open/image consumers
can check lexical containment before following links; session-fork input copying
matches both the logical source path and its canonical path. Merely moving data
and keeping an old symlink while selecting only the new Host spelling can reject
historical attachment paths or omit referenced files from forks. Retaining the
matching legacy logical root keeps those boundaries intact. Keep the alias at
the data-root level; scratch/session/pasted directories themselves remain real
directories, as required by the fork-file safety checks.

An independent old directory must not override an existing new one. Do not merge
two installations automatically. Inspect directory types and link targets before
acting; unresolved aliases remain observable errors, not a reason to initialize
an empty fallback profile.

## Backup, stop writers and validate

1. Record the authorized source and destination, app versions, executable
   identity and intended recovery location in a private local record. Record
   the current candidate separately from the earlier
   [brand-only verification report](verification-report.md).
2. Prepare a complete recoverable backup of both Host data and Electron
   userData, plus the old app bundle. A preliminary backup taken before stopping
   writers is not proof of a consistent database or browser profile. Retain
   existing recovery copies, then finalize a coherent backup after step 3.
3. Stop both applications normally, stop their Host/Agent/plugin children and
   other processes writing these profiles, and verify that no turn, queue or
   scheduled/background writer is still active. Closing a window alone is not
   sufficient. Keep them stopped throughout final backup, validation and rename.
4. Validate the final backup while the source is quiescent. Include hidden
   files, permissions, symlinks and all directory contents. In particular,
   preserve `secrets/.machine-key`, encrypted blobs, `pi.sqlite` and any
   accompanying `-wal` / `-shm` files, transcript/session trees, attachments,
   scratch, review snapshots, plugin registry/data, outbox and settings files.
   The Electron copy includes `Local Storage`, `IndexedDB`, `Partitions`,
   browser state and any other profile entries present. Do not select only the
   SQLite file or discard a WAL before validating the complete stopped state.
5. Verify file counts, sizes, permissions and hashes locally without printing
   file contents. Validate database integrity using a stopped copy and retain
   a private baseline of relevant counts/IDs for later comparison. Do not run
   application startup against the backup: Host startup performs the existing
   stale-scratch sweep, including scratch directories older than seven days
   even when their Session still exists, plus orphan review cleanup.

Host credentials use the existing `secrets/.machine-key`; if it is absent,
`SecretStore::open` generates a new key. Do not create a replacement key, export
plaintext credentials or change protection permissions as part of migration.
Electron's internal application name remains `PI-Desktop` through
`LEGACY_ENCRYPTION_APP_NAME`, preserving its OS-backed encryption identity
independently of the new userData directory and visible WcSdAi name. A changed
native bundle/signing identity can still require OS authorization; record its
actual behavior rather than claiming directory continuity proves decryption.

## Move the physical roots and keep aliases

After the stopped-state backup is verified, rename each selected source to its
new, absent destination on the same filesystem. Never overwrite an existing
destination. If a cross-filesystem copy is necessary, treat it as a separate
copy-and-verify operation and retain the source until verification completes.

For an installed macOS profile, the intended layout is:

```text
~/.wcsdai/                              actual Host data
~/.pi-desktop -> ~/.wcsdai              compatibility alias
~/Library/Application Support/WcSdAi/   actual Electron profile
~/Library/Application Support/PI-Desktop -> WcSdAi
```

The arrows describe relationships, not shell commands. Verify each alias resolves
to the exact intended destination, with no cycle or unrelated target. Verify
that reading either spelling reaches the same files and that the final Host
resolver selects the old logical prefix. Electron selects the new userData
profile. Keep development profiles separate unless their migration was also
explicitly authorized.

Do not rewrite arbitrary absolute paths inside transcripts, plugin settings,
SQLite, browser files or model messages. Old installed-plugin paths are retained
through the root alias; bundled plugin paths are reconciled from the current
app's resources while retaining enabled state and scope. Preserve aliases while
historical references depend on them.

## Verify before removing the old bundle

Start only WcSdAi, through its normal installed entry point and without test
profile overrides. Confirm that the intended rebuilt executable is running.
Keep the old application stopped. Record results privately and summarize only
non-sensitive evidence in a separate migration report.

- Confirm the display brand/version, selected Host logical and physical roots,
  Electron profile and unchanged internal encryption name.
- Compare baseline project, Session, transcript, provider and plugin state;
  reopening an existing Session must restore its content and configuration.
- Check representative old absolute scratch/attachment references, inline
  images and file open/reveal actions. Exercise a fork with an old pasted-file
  reference in an isolated fixture, including independent child-file retention.
- Check existing plugin state, browser/plugin persisted partitions and the
  application's own local settings; bundled plugins must resolve from WcSdAi.
- Check existing speech attachments if used. The speech input path check is
  lexical; canonical and alias spellings are not interchangeable at every
  consumer, even though the normal producers retain the logical Host spelling.
- Confirm credential availability through the authorized application flow
  without displaying secrets. Directory hashes alone do not prove OS-backed
  decryption, and this check does not authorize paid-provider or remote-server
  requests.
- Quit normally and restart; confirm retained state and the ordinary
  single-instance behavior. Account for documented startup housekeeping against
  the immutable backup instead of claiming unchanged live scratch counts.

The directory operation does not change Host SQLite schema **21**, defined in
`crates/host-core/src/db.rs`, or protocol **11**. The separate shared
`SCHEMA_VERSION = 16` metadata constant is not the current Host database schema.
Historical upstream schema descriptions remain historical evidence.

Only after migration acceptance should the authorized old app bundle be removed
from its installed location. Retain its recoverable copy, the complete data
backup and the alias relationship. Removing an application bundle must not
invoke a cleanup utility that also deletes the now-shared legacy data paths.
Keep the new application stopped if the old bundle must be restored.

## Rollback and evidence

Stop every writer before rollback. First preserve any changes made after
migration in a separate recovery copy. Identify which paths are aliases and
which are real directories; never recursively delete an alias target. Restore
the old bundle together with the coherent data/profile snapshot that matches
it, without merging divergent databases or starting both applications. Do not
assume a newer database is safe for an older executable merely because its path
has been restored.

Record the executed candidate hash or artifact hash, backup and validation
results, migration layout, acceptance results, startup cleanup, remaining OS
prompts and rollback availability in the later migration report. The previous
build's hashes, test totals and packaged startup results remain valid only for
that previous build; this procedure itself claims no local migration result.
