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
- [x] Keep automatic updates disabled and use manual replacement for team versions.
- [x] Owner authorizes commit/push/integration and remote workflow execution/artifact upload.
- [ ] Execute the native macOS/Windows jobs and verify installer checksums and matching source artifacts.
- [ ] Test the resulting installers and existing-data upgrades on representative team Macs and Windows PCs.
- [ ] Share the successful Actions run's artifact links with recipients.

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
- [x] Original LGPL license text retained with a WcSdAi project preface; LGPL/GPL copies and notices supplied.
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
The updater returns disabled without an approved URL and packaged metadata;
existing updater download/install logic remains intact. To prepare a later
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
