# WcSdAi 1.0.1 release checklist

Current target: **unsigned team installers**, explicitly selected by the owner
on 2026-10-02. The owner subsequently authorized committing, pushing, integrating
through repository checks and uploading native team-build artifacts. Hosted
build results must be checked before claiming a package available. Signed public
distribution is an optional future lane, not a prerequisite for team packages.

## Team installer checklist

- [x] Use the owner's organization, maintainer and contact information in README, CONTRIBUTING, SECURITY and the project license notice.
- [x] Keep original LGPL license text and third-party attribution; team use does not introduce a different license.
- [x] Provide separate macOS Apple Silicon, macOS Intel and Windows x64 download entries in both READMEs.
- [x] Prepare a manual native build workflow without Developer ID, notarization or Windows signing secrets.
- [x] Validate the macOS ad-hoc app seals on both native hosted runners; no publisher certificate is used.
- [x] Download the hosted macOS arm64 artifact, launch it twice in an isolated profile and restore all 800 fixture Sessions after restart.
- [x] Keep automatic installation disabled and use manual replacement for team versions; 1.0.2 adds notification-only checks.
- [x] Owner authorizes commit/push/integration and remote workflow execution/artifact upload.
- [x] Complete macOS arm64, macOS Intel x64 and Windows x64 native build jobs and desktop typechecks in [run 37018547778](https://github.com/tiankongbushexian-crypto/WcSdAi-Desktop/actions/runs/37018547778).
- [x] Include corresponding source from commit `6dc7fc9ebc63448f15a65b78542abe9505aabca3`, build information, license notices and checksums with all three uploaded installers.
- [x] Verify all three downloaded installers' checksums, bundled resources and exact corresponding source; all four artifacts remain available through 2026-11-01.
- [ ] Test the resulting installers and existing-data upgrades on representative team Macs and Windows PCs.
- [x] Publish the successful Actions run's three direct artifact links in both READMEs and the team distribution guide.

See [team distribution](team-distribution.md) for artifact names, download
instructions and OS installation expectations. “Unsigned” means no verified
publisher identity; it does not require disabling OS security or app approvals.

## Optional signed public-release checklist

- [x] Target version is 1.0.1; shared/JS/Cargo version surfaces synchronized.
- [x] Product display name WcSdAi; technical Pi identifiers retained.
- [x] Black/white icons and rounded app tile generated.
- [ ] Confirm com.example.wcsdai as the final macOS Bundle ID (placeholder risk).
- [x] Windows AppUserModelId selected: com.example.wcsdai.
- [x] Linux entry selected: wcsdai.desktop; executable wcsdai.
- [ ] Verify website ownership, HTTPS and actual published content.
- [x] Support email confirmed: 2222223323@qq.com.
- [ ] Confirm download/update URL; set publish metadata and RELEASES_URL together.
- [x] Original LGPL license text retained with a WcSdAi attribution footer; LGPL/GPL copies and notices supplied.
- [x] THIRD_PARTY_NOTICES.md and license inventory supplied.
- [x] LGPL compliance preparation documented.
- [ ] Make exact corresponding modified source available with each binary.
- [ ] Resolve missing dependency license metadata and plugin/artwork provenance.
- [ ] Review and approve privacy/terms/user-agreement drafts, then publish URLs.
- [x] Full pnpm test, workspace typechecks and lint pass; detailed scope is in verification-report.md.
- [x] Reviewed tracked/new files and added lines for supplied server data and credential formats; no actual secrets found.
- [ ] Supply WcSdAi macOS Developer ID and notarization credentials.
- [ ] Supply Windows Code Signing credentials and verify Authenticode.
- [x] Build unsigned macOS arm64 app and DMG; inspect native identity, icon and actual bundled notices.
- [x] Launch final packaged app and restore all 800 isolated fixture Sessions after restart.
- [ ] Test signed installers on native macOS arm64/x64, Windows x64, Linux x64/arm64.
- [ ] Test upgrade, uninstall, rollback, OS permission prompts and notifications.
- [ ] Test upstream-existing data and OS-protected credentials with signed binaries.
- [x] English and Chinese READMEs updated with fork attribution.
- [x] 1.0.1 release-note drafts added to all nine in-app catalogs.
- [ ] Run an explicitly authorized real-provider response and external MCP smoke before claiming those integrations qualified.
- [ ] Include matching pi-host release archives/checksums before remote-host automatic installation is advertised.
- [ ] Owner authorizes commit, push, tag, GitHub Release and upload explicitly.

## Signed public-release configuration

The app currently has `build.publish: null` and empty `RELEASES_URL`.
These values are intentional for the unsigned team lane; no update server or
signing account needs to be supplied for that lane.
Packaged 1.0.2 team builds use the fixed, validated GitHub version manifest for
notifications and download-page navigation. Development builds remain disabled.
The existing signed updater download/install logic remains intact. To prepare a later
release, configure the fork repository's GitHub feed, set its approved latest
release URL, then validate `pnpm check:wcsdai-release` with
`WCSDAI_RELEASE_READY=true` only after this checklist is complete. CI requires
the corresponding repository variable for tags. Do not point to the upstream
feed. No server login or custom update service is required for this channel.

macOS uses Actions secrets `CSC_LINK`, `CSC_KEY_PASSWORD`, `APPLE_ID`,
`APPLE_APP_SPECIFIC_PASSWORD`, `APPLE_TEAM_ID`, and variable
`MAC_SIGNING_IDENTITY` (certificate common name without Developer ID prefix).
Windows uses `WIN_CSC_LINK` and `WIN_CSC_KEY_PASSWORD`; tag packaging forces
code signing. Keep values out of repository files and logs. Local unsigned
packaging remains available for development, and cannot prove signing or
notarization. See [electron-builder v26 signing documentation](https://www.electron.build/v26/docs/features/code-signing/).

The native architecture matrix is inherited from the upstream release lanes,
not cross-compiled from this Mac. Do not label an arm64 local build as tested
on Intel, Windows or Linux.

## 1.0.2 notification and motion candidate

- [x] Owner approved icon A: 12% larger, 27/1024px optical downward offset.
- [x] Owner approved both new logo motions, three text entrances and randomized greetings.
- [x] Version surfaces and all nine shipped changelog catalogs synchronized.
- [x] Notification metadata parser and real Main controller tested against offline,
  timeout, malformed/oversized feed, unsupported target, expired download and disposal.
- [x] Automatic binary download/install remains off for unsigned team packages.
- [x] Current `updates/stable.json` initially advertises only verified 1.0.1 artifacts.
- [ ] Complete final candidate and PR integration checks before merging.
- [ ] Build, download and verify three native 1.0.2 installers and corresponding source.
- [ ] Update the manifest and README links only after those artifacts are verified.

Existing 1.0.1 users must install 1.0.2 manually once. The checker cannot be
retroactively added to an already installed executable. No server deployment,
Git tag or GitHub Release is needed for this notification-only Actions lane.
