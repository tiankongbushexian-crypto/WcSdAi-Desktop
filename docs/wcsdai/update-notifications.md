# WcSdAi update notifications

## Delivery behavior

WcSdAi team packages discover newer stable releases and open the matching
download page for a manual installation. They never download an installer,
replace application files, quit to install, or install on ordinary app quit.
No publisher certificate, server account, GitHub token, or paid provider is
needed by the notification client.

Electron Main owns discovery, validation, localized notes, reminder state and
the external download action. Existing update IPC, Settings → Info, the
application menu and the ambient update notice are reused. The renderer cannot
supply a feed URL or choose an arbitrary download destination.

- Packaged applications check 15 seconds after startup, then every 6 hours.
  A Settings/menu check is available immediately. An offline initial check
  retries at the next scheduled interval or explicit check.
- Background checks have an 8-second deadline. Explicit checks have a
  15-second deadline. Both abort the metadata request on timeout.
- A newer release shows its version and localized plain-text highlights.
  Chinese UI locales use `zh-CN`; other locales use English.
- A reminder is persisted once per version in the existing Host-owned
  `lastNotifiedUpdateVersion` setting. Dismissing the notice or restarting does
  not repeatedly announce that version. Settings keeps the release accessible.
- Team delivery always has effective preference `manual`, including profiles
  that previously selected automatic installation. No persisted preference or
  user-session data is rewritten by this compatibility rule.
- Background network, malformed-feed and timeout failures do not open a toast.
  A previously discovered release remains visible after an offline check.
  Explicit checks expose an error and can be retried.
- If opening the download page fails, both the notice and Settings show a
  localized error toast and retain the download action for retry. Raw network
  or native-shell error text is not inserted into that toast.
- Unpackaged development runs and unsupported platform/architecture pairs
  remain disabled. Supported target keys are `darwin-arm64`, `darwin-x64`,
  `win32-x64`, `linux-arm64` and `linux-x64`. A manifest need only publish
  targets with a verified package; a newer version missing the current target
  cannot be offered as a download.

The separately configured signed `electron-updater` lane is retained. It is
selected only when both its fixed release endpoint and packaged feed are
configured. `publish: null` team packages use notification-only discovery
without requiring `app-update.yml`.

## Published manifest

The client reads one fixed public URL:

`https://raw.githubusercontent.com/tiankongbushexian-crypto/WcSdAi-Desktop/main/updates/stable.json`

The manifest is limited to 64 KiB and schema version 1:

```json
{
  "schemaVersion": 1,
  "version": "1.0.2",
  "notes": {
    "en": "• Example release highlight",
    "zh-CN": "• 示例更新说明"
  },
  "downloads": {
    "darwin-arm64": {
      "url": "https://github.com/tiankongbushexian-crypto/WcSdAi-Desktop/releases/tag/v1.0.2"
    }
  }
}
```

This example documents the schema; it does not announce an available build.
The checked-in manifest must refer only to packages already built, downloaded
and verified. A newer app can safely ship while the manifest still names an
older release: comparisons do not offer downgrades.

`version` is a stable `major.minor.patch` with no leading zeroes, prerelease or
build suffix. Installed versions may have valid SemVer prerelease/build suffixes;
an installed prerelease can graduate to the stable release with the same core.
Both notes entries are required, nonempty plain text, each at most 8 KiB.

Each download must be an HTTPS page in this exact GitHub repository:

- `/releases`, `/releases/latest` or `/releases/tag/<tag>`;
- `/actions/runs/<run-id>` or `/actions/runs/<run-id>/artifacts/<artifact-id>`.

Queries, fragments, credentials, alternate repositories, encoded paths,
redirected manifest responses and direct executable URLs are rejected. The
client requests metadata without credentials and never follows a manifest
redirect. Opening a verified GitHub page delegates ordinary page navigation to
the user's browser; it does not silently retrieve or execute that page's files.

Actions targets must include an `expiresAt` UTC ISO timestamp, for example
`"2026-11-01T14:20:01.000Z"`. Expiry is checked at discovery **and** when the
user opens a discovered update. An expired newer download is an unavailable
update, not a usable offer. An expired download for the already installed or
older version does not prevent an up-to-date result. Releases pages can omit
expiry. Actions downloads require GitHub login and repository read access.

## Current team metadata

The manifest remains **1.0.5**. The Windows x64 download entry and expiry now refer to [Windows-only run 38983170175](https://github.com/tiankongbushexian-crypto/WcSdAi-Desktop/actions/runs/38983170175), built from [`a2d1da936618`](https://github.com/tiankongbushexian-crypto/WcSdAi-Desktop/commit/a2d1da936618c3ccca1761289b5b6794b17481da). The macOS arm64/x64 entries remain byte-for-byte unchanged from [run 38897319964](https://github.com/tiankongbushexian-crypto/WcSdAi-Desktop/actions/runs/38897319964), built from [`66523a3480cb`](https://github.com/tiankongbushexian-crypto/WcSdAi-Desktop/commit/66523a3480cb42cd4e92b6747486cbeb7586c781). The version, release notes and macOS download targets are unchanged.

Existing 1.0.2–1.0.4 clients can still discover version 1.0.5, read its notes and open the matching platform download. **Already installed 1.0.5 Windows clients must download and reinstall the Windows replacement manually:** a different artifact for the same version does not trigger a newer-version notification. Installation remains manual; the app does not replace itself or quit to install. macOS users do not need this Windows replacement.

The Windows installer expires at **2026-11-15T23:56:24Z**; its [separate corresponding source](https://github.com/tiankongbushexian-crypto/WcSdAi-Desktop/actions/runs/38983170175/artifacts/12081418268) expires at **2026-11-15T23:46:38Z**. The [team distribution guide](team-distribution.md) retains the unchanged Mac links and source, exact installer checksums and all expiry times. See the [Windows hotfix report](1.0.5-windows-hotfix.md) for the replacement's native/packaged test evidence and remaining device checks; original macOS verification remains in the [1.0.5 verification report](1.0.5-verification.md).

## Operational sequence

1. Review and approve the application changes, including visual changes.
2. Build packages for the intended platforms. Verify package identity, startup,
   checksums, notices and matching source as described in the team runbook.
3. Update `updates/stable.json` with that verified version, bilingual notes and
   actual download pages/expiry. Review it and deliver it to `main` only under
   the owner's publication authorization.
4. Existing notification-capable installations discover the version during
   their next check. Users choose when to download and install.

The already distributed **1.0.1** packages do not contain this checker. Those
users must manually install a notification-capable build once. Publishing a
manifest cannot enable checks inside that old executable. No production server
deployment is part of this implementation. Publication of the manifest and a
notification-capable installer are separate from local implementation/tests.

## Manual upgrade acceptance

For an already installed notification-capable version, verify delivery through
that application's Settings → Info → Check for Updates (or the native menu).
Use the real fixed public manifest after the new platform packages have been
downloaded and verified; never override the production feed with a test fixture.
Confirm the newer version and notes, choose its download action, then download
the matching artifact through GitHub. An authenticated artifact link may
start the ZIP download directly without leaving a persistent browser page.
Verify the received artifact rather than requiring a page to remain open.
The owner installs the
package through the normal manual installer workflow and restarts WcSdAi.
Confirm the installed version, the changed feature and existing project/session
and configuration continuity without exposing credential values.

Preparing packages, publishing a manifest and completing that installed-app
journey are separate acceptance steps. A direct replacement from a worktree or
locally built app does not demonstrate the check → download → manual-install
journey. Until all new packages are verified, retain the previous manifest and
verified download links. The [1.0.3 verification report](1.0.3-verification.md)
records the completed 1.0.2 → 1.0.3 journey. Its visual result was subsequently
rejected by the owner; the [1.0.4 verification report](1.0.4-verification.md)
records the approved correction and its package checks.
For 1.0.4, the owner explicitly chose to install the new release themselves.
The agent must not quit, replace, relaunch or grant security exceptions for the
owner’s installed app as part of that publication; isolated test profiles remain
the validation environment.

## Verification

`manual-update-feed.test.mjs` covers schema and URL boundaries, numeric version
comparison, same/older releases, locale selection, missing targets, expiry,
size limits, malformed/redirected responses, abortable timeout and disposal.
`manual-update-controller.test.mjs` enters through the real production
`AppUpdaterController`: check → available version/notes → open validated page,
plus scheduled checks, preference compatibility, version reminder persistence,
offline recovery, concurrent checks, shutdown races and preserved signed-lane
behavior. Only network, Electron and binary updater edges are replaced by test
fixtures. No real installer, production profile or provider is touched.

Existing update preference, source contract, timeout and cache tests remain
applicable. `node scripts/e2e-update-notifications.mjs` builds and mounts the
production update notice, Settings row, update hook, API bridge, store and toast
host in an isolated Electron renderer. A fixture substitutes the preload edge:
the real check button discovers a release, its notes appear, both download
buttons show localized errors on rejection and succeed on retry without sending
a URL. The runner also verifies its console-error collector using a deliberate
sentinel before requiring a clean result. Package and cross-platform installation
acceptance remain separate; neither controller nor renderer fixture tests prove
installation on another operating system.
