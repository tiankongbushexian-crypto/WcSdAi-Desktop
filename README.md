# WcSdAi downloads and updates

> [!NOTE]
> **WcSdAi 1.4.0 was published on GitHub at 2026-11-20T07:51:22Z.**
> The eight uploaded files match the qualified local release receipt in size and GitHub digest metadata, checked at 2026-11-20T07:51:23.177627+00:00. This is not a claim of anonymous full-file downloads or website/feed activation; their actual status is recorded separately in the [verification report](releases/1.4.0-verification.md). Held version 1.1.0 remains unavailable; do not downgrade as a security workaround.

This public repository provides installers, stable update metadata, corresponding application source and licenses. Active development and its history live in the private `WcSdAi-Desktop-Source` repository. Published application source remains public.

[Website downloads](https://api.90z.cn/download) · [GitHub release 1.4.0](https://github.com/tiankongbushexian-crypto/WcSdAi-Desktop/releases/tag/v1.4.0) · [简体中文](README.zh-CN.md)

## 1.4.0 in-app updates

- View a newer version and its release notes, then select **Download update** in the client. Packages come from the official WcSdAi website.
- After verification, select **Install and restart** when you are ready. Save or clear unsent drafts, let tasks finish, and close editors or active plugin/remote sessions first. If safe preparation cannot complete, installation is blocked and the client explains the next step.
- Downloading alone does not authorize installation. Closing the window or quitting normally while a package is only cached does not install it.

Existing accounts, billing, API configurations, personal model parameters and conversations remain. The fixes and agent/workcopy features in earlier releases remain included. This update does not require deleting the application-data directory or re-entering API credentials.

All three installers correspond to source `6dfae19f0b5d12d96de4c810fa77a2175628eb4c`. See the [1.4.0 verification report](releases/1.4.0-verification.md) for the actual native qualification and publication evidence, including website and update-feed status. GitHub release metadata alone does not establish website availability.

The Electron 43.8.3 and network security repairs from 1.1.1 remain included. This release does not claim that all dependency advisories are resolved. The [1.1.1 verification](releases/1.1.1-verification.md) and [historical dependency audit](releases/1.1.1-dependencies.json) remain available; that audit is not a new 1.4.0 audit run.

## Sign in to your WcSdAi account

1. Select the WcSdAi logo at the bottom of the sidebar, then **Sign in**. Your system browser opens [api.90z.cn](https://api.90z.cn).
2. Sign in to your website account and approve this desktop device. After the client securely stores credentials and synchronizes the account, the browser confirms success and returns to the dashboard. Return to WcSdAi to use the allowed conversational models without entering an API key or endpoint.
3. Open the avatar menu for your balance, allowed models, usage, recharge and Settings. Confirm that the website uses the same account when recharging. After the website actually credits the balance, return to the client and select **Refresh**.

Payment receipt and credit fulfillment are separate. Model access follows the
website's current permissions, balance or subscription allowance and usage limits.
Account settings cover supported conversational models and website-authorized image generation/edit endpoints; other media endpoints remain unsupported.
Existing API providers (BYOK) still work independently. Signing out does not delete
local conversations; website settings can review and revoke desktop authorizations.

## 1.4.0 downloads

Use the [website download page](https://api.90z.cn/download) as the main entry.
The direct GitHub mirror links below remain available for existing clients and
for users who prefer GitHub.

<!-- RELEASE-ASSETS:START -->
| Platform | Installer | SHA-256 |
| --- | --- | --- |
| macOS Apple Silicon (arm64) | [Download](https://github.com/tiankongbushexian-crypto/WcSdAi-Desktop/releases/download/v1.4.0/WcSdAi-1.4.0-macos-arm64-unsigned.dmg) | `69e3497131a77f529ca4bcc174acc5e9a4a9f1c2b21f55d5350123cf5976bdb4` |
| macOS Intel (x64) | [Download](https://github.com/tiankongbushexian-crypto/WcSdAi-Desktop/releases/download/v1.4.0/WcSdAi-1.4.0-macos-x64-unsigned.dmg) | `976d59d436d19a28a836a51e55712b08d71a4da9ab38fd84c1d3335c94fd903f` |
| Windows (x64) | [Download](https://github.com/tiankongbushexian-crypto/WcSdAi-Desktop/releases/download/v1.4.0/WcSdAi-1.4.0-windows-x64-unsigned.exe) | `be2062cea8c7f3e9055dc993e118954f358f6ac317ad090a82c94746173c55ab` |
<!-- RELEASE-ASSETS:END -->

[SHA256SUMS](https://github.com/tiankongbushexian-crypto/WcSdAi-Desktop/releases/download/v1.4.0/SHA256SUMS) covers all installers and archives. Exact sizes, hashes and source commits are recorded in [release metadata](releases/1.4.0.json).

These are **unsigned team builds**. macOS ad-hoc integrity seals are not Apple
Developer ID signatures or notarization; Windows installers have no publisher
certificate. Respect operating-system and organization security policies.

## Corresponding source and notices

Every platform uses the same exact application source. The table identifies its
archive independently of the private development repository.

<!-- RELEASE-SOURCES:START -->
| Platforms | Corresponding source | Commit | SHA-256 |
| --- | --- | --- | --- |
| macOS arm64, macOS x64, Windows x64 | [Application source](https://github.com/tiankongbushexian-crypto/WcSdAi-Desktop/releases/download/v1.4.0/WcSdAi-1.4.0-source-6dfae19f0b5d.tar.gz) | `6dfae19f0b5d12d96de4c810fa77a2175628eb4c` | `16433774b76d7269127ed363b5939cd5a25440800e6fe7655c39b45e840182da` |
<!-- RELEASE-SOURCES:END -->

Each full platform ZIP contains its installer, matching source, build information,
checksums and license/notice files. These ZIPs are not portable applications.

- [macos-arm64 full release archive](https://github.com/tiankongbushexian-crypto/WcSdAi-Desktop/releases/download/v1.4.0/WcSdAi-1.4.0-macos-arm64-unsigned.zip)
- [macos-x64 full release archive](https://github.com/tiankongbushexian-crypto/WcSdAi-Desktop/releases/download/v1.4.0/WcSdAi-1.4.0-macos-x64-unsigned.zip)
- [windows-x64 full release archive](https://github.com/tiankongbushexian-crypto/WcSdAi-Desktop/releases/download/v1.4.0/WcSdAi-1.4.0-windows-x64-unsigned.zip)

**GitHub's automatic “Source code (zip)” and “Source code (tar.gz)” downloads contain this public distribution repository's metadata only. Use the explicitly named application source archive above.**

WcSdAi is based on [PI-Desktop](https://github.com/vastsa/PI-Desktop). Its upstream LGPLv3 license, original copyrights and third-party terms remain in force. [LICENSE](LICENSE), [NOTICE.md](NOTICE.md), [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) and [LICENSES/](LICENSES/) are preserved. Historical application paths in notices refer to the matching source archive. Private development does not remove recipients' license rights.

## Existing clients and updates

**Coming from 1.3.2 or earlier? Install 1.4.0 manually once from the [official download page](https://api.90z.cn/download).** An older installed client cannot gain the new installer through update metadata alone. After this first installation, later supported releases can be downloaded and installed inside the client with your confirmation.

| Your installation | In-app installation |
| --- | --- |
| Mac Apple Silicon (arm64) or Intel (x64) | A normally installed app in a location writable by your account. Do not run it directly from the mounted DMG. |
| Windows x64, installed for the current user | Supported when Windows registration matches the running copy, including a supported custom installation folder. |
| Windows installed for all users, portable, or unrecognized installation | Use the official download page and install manually. |

The client validates signed update information and package integrity before installation. This release signing is **not Apple Developer ID notarization or a Windows publisher certificate**; existing operating-system security checks still apply.

Once you select **Install and restart**, let the process finish. If the client says native cancellation is unconfirmed, do not force quit; contact [support](mailto:2222223323@qq.com). On Mac, after explicit installation has been authorized and the native installer is ready, a crash or forced process termination may finish that already authorized installation. The app cannot intercept operating-system force termination.

Keep the existing application-data directory. The website remains available for the first upgrade, unsupported installations and recovery. Downloads require no account or access to the private development repository.

The public repository name and legacy `updates/stable.json` path remain unchanged. Versions 1.1.3 through 1.3.2 continue opening the official download page; versions 1.0.2 through 1.1.2 keep opening their GitHub update destination until manually upgraded. Version 1.0.1 needs a manual upgrade. The new signed website feed is separate and does not replace the legacy feed's format.

[1.3.2 verification](releases/1.3.2-verification.md),
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
