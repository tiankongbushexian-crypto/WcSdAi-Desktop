# WcSdAi downloads and updates

> [!NOTE]
> **WcSdAi 1.3.2 was published on 2026-11-20T04:38:02Z.**
> All three native platforms and all 30 required package/evidence artifacts passed qualification. GitHub's eight public assets passed size/digest-metadata checks, anonymous HTTP availability checks and exact checksum-file comparison. Website mirror verification and stable-feed activation are recorded separately in the [verification report](releases/1.3.2-verification.md). Do not install held version 1.1.0 or downgrade as a security workaround.

This public repository provides installers, stable update metadata, corresponding application source and licenses. Active development and its history live in the private `WcSdAi-Desktop-Source` repository. Published application source remains public.

[Website downloads](https://api.90z.cn/download) · [GitHub release 1.3.2](https://github.com/tiankongbushexian-crypto/WcSdAi-Desktop/releases/tag/v1.3.2) · [简体中文](README.zh-CN.md)

## 1.3.2 output files and Windows settings

- Reveal local transcript outputs in their containing system folder. Repair Windows paths, file/sandbox links, special filenames and session workcopy references. Explicit image preview remains available; missing or restricted paths report a clear error.
- Keep the Windows interface-format picker above the settings dialog so its supported options can be selected, saved and reopened. Website-managed models retain their website-issued protocol.
- Keep Recharge, Refresh and Sign out on one aligned line, moving the complete group below the description in narrow layouts.

Existing accounts, billing, API configurations, personal model parameters and sessions remain. The account-model reliability improvements from 1.3.1 and agent/workcopy features from 1.3.0 remain included. This release does not redeploy the API backend.

All three installers correspond to source `ed3cd0b02e37bae66b6e921e903b9384b937d4d1`. See the
[1.3.2 verification report](releases/1.3.2-verification.md) for actual native
results and remaining limits. Existing API providers, conversations, account
access and permission settings are preserved. Installation remains manual.

The Electron 43.8.3 and network security repairs from 1.1.1 remain included.
This release does not claim that all dependency advisories are resolved. The
[1.1.1 verification](releases/1.1.1-verification.md) and
[historical dependency audit](releases/1.1.1-dependencies.json) remain available;
that audit is historical evidence, not a new 1.3.2 audit run.

## Sign in to your WcSdAi account

1. Select the WcSdAi logo at the bottom of the sidebar, then **Sign in**. Your system browser opens [api.90z.cn](https://api.90z.cn).
2. Sign in to your website account and approve this desktop device. After the client securely stores credentials and synchronizes the account, the browser confirms success and returns to the dashboard. Return to WcSdAi to use the allowed conversational models without entering an API key or endpoint.
3. Open the avatar menu for your balance, allowed models, usage, recharge and Settings. Confirm that the website uses the same account when recharging. After the website actually credits the balance, return to the client and select **Refresh**.

Payment receipt and credit fulfillment are separate. Model access follows the
website's current permissions, balance or subscription allowance and usage limits.
Account settings cover supported conversational models and website-authorized image generation/edit endpoints; other media endpoints remain unsupported.
Existing API providers (BYOK) still work independently. Signing out does not delete
local conversations; website settings can review and revoke desktop authorizations.

## 1.3.2 downloads

Use the [website download page](https://api.90z.cn/download) as the main entry.
The direct GitHub mirror links below remain available for existing clients and
for users who prefer GitHub.

<!-- RELEASE-ASSETS:START -->
| Platform | Installer | SHA-256 |
| --- | --- | --- |
| macOS Apple Silicon (arm64) | [Download](https://github.com/tiankongbushexian-crypto/WcSdAi-Desktop/releases/download/v1.3.2/WcSdAi-1.3.2-macos-arm64-unsigned.dmg) | `600bdc66b27292e9386cc60a801e2de4c0a862e85da9e696696d9fa00d4e8ef4` |
| macOS Intel (x64) | [Download](https://github.com/tiankongbushexian-crypto/WcSdAi-Desktop/releases/download/v1.3.2/WcSdAi-1.3.2-macos-x64-unsigned.dmg) | `5491101bf8e0207291b1cfedbe83d6b93bab3d2be3680b221ba7ff799a1caf4a` |
| Windows (x64) | [Download](https://github.com/tiankongbushexian-crypto/WcSdAi-Desktop/releases/download/v1.3.2/WcSdAi-1.3.2-windows-x64-unsigned.exe) | `85f9888a3a8206c3c9edc7d9650aef33aefbbba97d352e9d0a23f0d86b61bc68` |
<!-- RELEASE-ASSETS:END -->

[SHA256SUMS](https://github.com/tiankongbushexian-crypto/WcSdAi-Desktop/releases/download/v1.3.2/SHA256SUMS) covers all installers and archives. Exact sizes, hashes and source commits are recorded in [release metadata](releases/1.3.2.json).

These are **unsigned team builds**. macOS ad-hoc integrity seals are not Apple
Developer ID signatures or notarization; Windows installers have no publisher
certificate. Respect operating-system and organization security policies.

## Corresponding source and notices

Every platform uses the same exact application source. The table identifies its
archive independently of the private development repository.

<!-- RELEASE-SOURCES:START -->
| Platforms | Corresponding source | Commit | SHA-256 |
| --- | --- | --- | --- |
| macOS arm64, macOS x64, Windows x64 | [Application source](https://github.com/tiankongbushexian-crypto/WcSdAi-Desktop/releases/download/v1.3.2/WcSdAi-1.3.2-source-ed3cd0b02e37.tar.gz) | `ed3cd0b02e37bae66b6e921e903b9384b937d4d1` | `489a39658c3584bcfbebd5e997a45aa19b392b09e1f0aaab7970518bc0932f74` |
<!-- RELEASE-SOURCES:END -->

Each full platform ZIP contains its installer, matching source, build information,
checksums and license/notice files. These ZIPs are not portable applications.

- [macos-arm64 full release archive](https://github.com/tiankongbushexian-crypto/WcSdAi-Desktop/releases/download/v1.3.2/WcSdAi-1.3.2-macos-arm64-unsigned.zip)
- [macos-x64 full release archive](https://github.com/tiankongbushexian-crypto/WcSdAi-Desktop/releases/download/v1.3.2/WcSdAi-1.3.2-macos-x64-unsigned.zip)
- [windows-x64 full release archive](https://github.com/tiankongbushexian-crypto/WcSdAi-Desktop/releases/download/v1.3.2/WcSdAi-1.3.2-windows-x64-unsigned.zip)

**GitHub's automatic “Source code (zip)” and “Source code (tar.gz)” downloads contain this public distribution repository's metadata only. Use the explicitly named application source archive above.**

WcSdAi is based on [PI-Desktop](https://github.com/vastsa/PI-Desktop). Its upstream LGPLv3 license, original copyrights and third-party terms remain in force. [LICENSE](LICENSE), [NOTICE.md](NOTICE.md), [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) and [LICENSES/](LICENSES/) are preserved. Historical application paths in notices refer to the matching source archive. Private development does not remove recipients' license rights.

## Existing clients and updates

The public repository name and `updates/stable.json` path are unchanged. The
1.3.2 feed retains the **GitHub release page** as its destination for older
clients. Publication and mirror verification receipts, including the stable-feed
activation time, are recorded in the [verification report](releases/1.3.2-verification.md).

Applications 1.1.3 and later map the validated update action to the fixed official
website entry. Already installed 1.1.2 and earlier clients keep opening their
GitHub manifest destination until manually upgraded; new metadata does not alter
installed code. Downloads require no account or private repository access.

Versions **1.0.2 and later** can check online, display the version and release
notes, and open the download page. **Updates are installed manually; the client
does not silently replace the installed application.** Version 1.0.1 needs a
manual upgrade to gain update checking. Keep the existing data directory.

[1.3.1 verification](releases/1.3.1-verification.md),
[1.3.0 verification](releases/1.3.0-verification.md),
[1.2.0 verification](releases/1.2.0-verification.md),
[1.1.4 verification](releases/1.1.4-verification.md),
[1.1.3 verification](releases/1.1.3-verification.md),
[1.1.2 verification](releases/1.1.2-verification.md),
[1.1.1 verification](releases/1.1.1-verification.md), the
[held 1.1.0 report](releases/1.1.0-verification.md), historical checksums and
corresponding source remain intact. The historical 1.1.0 hold still applies.
Earlier releases remain available in [release history](https://github.com/tiankongbushexian-crypto/WcSdAi-Desktop/releases).

The [legacy workflow entry](https://github.com/tiankongbushexian-crypto/WcSdAi-Desktop/actions/workflows/team-builds.yml) provides download directions only. It does not build, install or publish an application.

Maintainer: [tiankongbushexian-crypto](https://github.com/tiankongbushexian-crypto). Organization: 量动科技. Website: <https://wanchuangsd.cn>. Support: <2222223323@qq.com>.

## Local verification

Run `node scripts/verify-distribution.mjs`. Add
`--assets /absolute/path/to/release-assets` to check the exact eight staged files
and independently hash the seven installer/archive assets.
