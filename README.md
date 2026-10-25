# WcSdAi downloads and updates

> [!NOTE]
> **WcSdAi 1.1.1 was published on 2026-10-25T09:50:33Z.**
> All three native CI builds passed. After the release owner's Mac rebooted, the verified packaged app passed encryption and second-process decryption using actual OS protected storage. The isolated account service flow also passed with real OS encryption. Earlier local authentication failures are retained in the verification report. The release assets are anonymously accessible; sizes, server digests and the downloaded checksum file match the verified files. The stable update manifest targets this verified 1.1.1 release. Do not install held version 1.1.0 or downgrade to 1.0.5 as a security workaround.

This public repository provides WcSdAi installers, the stable update manifest,
and the corresponding source and licenses for published builds. Active
development and its history are maintained separately in the private
`WcSdAi-Desktop-Source` repository. Published corresponding source remains public.

[Release 1.1.1](https://github.com/tiankongbushexian-crypto/WcSdAi-Desktop/releases/tag/v1.1.1) · [简体中文](README.zh-CN.md)

## 1.1.1 security update

This patch repairs the reproduced Agent networking subprocess crash with patched
Undici transports and updates Electron to 43.8.3 for TLS certificate-security
fixes. Account and update requests use Chromium networking without website
session cookies. Existing account login, allowed conversational models, recharge
and credit refresh, API providers, conversations and permission settings remain.

All three CI installer lanes passed on source
`9365d845a5d738d699e844b96f64aa8ffd9f1d08`. The
[verification report](releases/1.1.1-verification.md) distinguishes those results
from the local protected-storage checks that passed after reboot, and records
the completed publication and anonymous-access checks. These tests did not use a
real paid production account.
The complete lockfile audit still contains **68 records / 47 distinct security
advisories**; this patch is not an all-clear claim. See the
[full audit snapshot](releases/1.1.1-dependencies.json).

## Sign in to your WcSdAi account

1. Open the WcSdAi account card in model settings and select **Sign in**. Your system browser opens [api.90z.cn](https://api.90z.cn).
2. Sign in to your website account and approve access for this desktop device. Return to WcSdAi to use the automatically synchronized conversational models allowed for your account. No API key or endpoint entry is required for these account models.
3. Use the account card to recharge on the website. Check that the website is signed in to the same account. Once the balance is actually credited, return to WcSdAi and select **Refresh**.

Payment receipt and credit fulfillment are separate: wait for the website to finish crediting the balance before expecting it in the client. Model access follows the website's current permissions, balance or subscription allowance, and usage limits. This release covers supported conversational models, not every media-generation endpoint.

Existing API providers (BYOK), local conversations and permission settings are retained. Account sign-in is optional for existing providers. Signing out does not delete local conversations; desktop authorizations can be reviewed and revoked on the website.

## 1.1.1 downloads

<!-- RELEASE-ASSETS:START -->
| Platform | Installer | SHA-256 |
| --- | --- | --- |
| macOS Apple Silicon (arm64) | [Download](https://github.com/tiankongbushexian-crypto/WcSdAi-Desktop/releases/download/v1.1.1/WcSdAi-1.1.1-macos-arm64-unsigned.dmg) | `ef472d7e59761430cced747be0132e52c92a951562e25c9ddd6b9b3ea523fcf2` |
| macOS Intel (x64) | [Download](https://github.com/tiankongbushexian-crypto/WcSdAi-Desktop/releases/download/v1.1.1/WcSdAi-1.1.1-macos-x64-unsigned.dmg) | `5d1565cf524df7cb61ebe9f8fe4c4fe21c090d9156e4f8dcb6f431fef54f7129` |
| Windows (x64) | [Download](https://github.com/tiankongbushexian-crypto/WcSdAi-Desktop/releases/download/v1.1.1/WcSdAi-1.1.1-windows-x64-unsigned.exe) | `f5df7087649990488768c30675dfb29908cd657fb065d28192ae5b18bfedae13` |
<!-- RELEASE-ASSETS:END -->

[SHA256SUMS](https://github.com/tiankongbushexian-crypto/WcSdAi-Desktop/releases/download/v1.1.1/SHA256SUMS) covers the installers and archives. Exact asset sizes, hashes and corresponding source commits are recorded in [release metadata](releases/1.1.1.json).

See the [1.1.1 verification report](releases/1.1.1-verification.md) for the validation scope, results and remaining limitations.

The 1.1.1 artifacts have passed CI integrity checks and local protected-storage qualification. All eight published assets, including SHA256SUMS, are anonymously accessible. Remote sizes and server digests match the verified local files, and the anonymously downloaded checksum file matches; the installers were not all downloaded in full again. These are **unsigned team builds**: they include no Apple notarization or Windows publisher signature. Respect your operating system and organization security policies.

## Corresponding source and notices

All three 1.1.1 platform builds use the same application source commit. The release metadata records the exact installer-to-source mapping.

<!-- RELEASE-SOURCES:START -->
| Platforms | Corresponding source | Commit | SHA-256 |
| --- | --- | --- | --- |
| macOS arm64, macOS x64, Windows x64 | [Download source](https://github.com/tiankongbushexian-crypto/WcSdAi-Desktop/releases/download/v1.1.1/WcSdAi-1.1.1-source-9365d845a5d7.tar.gz) | `9365d845a5d738d699e844b96f64aa8ffd9f1d08` | `49b02ea8795ab0ad068c2a47a2a3d49ac6bcdca1d77dbaf2aa5ff14998ac7f68` |
<!-- RELEASE-SOURCES:END -->

Each complete platform ZIP includes the installer, its matching application source, build information, checksums and license/notice files:

- [macos-arm64 complete archive](https://github.com/tiankongbushexian-crypto/WcSdAi-Desktop/releases/download/v1.1.1/WcSdAi-1.1.1-macos-arm64-unsigned.zip)
- [macos-x64 complete archive](https://github.com/tiankongbushexian-crypto/WcSdAi-Desktop/releases/download/v1.1.1/WcSdAi-1.1.1-macos-x64-unsigned.zip)
- [windows-x64 complete archive](https://github.com/tiankongbushexian-crypto/WcSdAi-Desktop/releases/download/v1.1.1/WcSdAi-1.1.1-windows-x64-unsigned.zip)

**GitHub's automatically generated “Source code (zip)” and “Source code (tar.gz)” links contain this distribution repository's metadata only. They are not the application source. Use the explicitly named corresponding-source archives above.**

WcSdAi is based on [PI-Desktop](https://github.com/vastsa/PI-Desktop).
The upstream LGPLv3 license, original copyright notices, and applicable
third-party terms remain in force. See [LICENSE](LICENSE),
[NOTICE.md](NOTICE.md), [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md), and
[LICENSES/](LICENSES/). These files are preserved from the release artifacts.
Historical references to application source paths inside those notices are
resolved in the matching application source archive, not this small download
repository. Private development does not remove recipients' license rights.

## Existing clients and updates

The [held 1.1.0 report](releases/1.1.0-verification.md), corresponding source and historical checksums remain available. The stable manifest in this revision targets the verified public 1.1.1 release. Clients download and install it manually; the historical 1.1.0 installation hold remains in effect.


The public repository name and `updates/stable.json` path remain unchanged. **Versions 1.0.2 and later** can check for updates while online, display the new version and release notes, and open the public release page when you select Download. **Installation is manual; the app does not automatically install updates.** Version 1.0.1 needs a manual upgrade to gain update checking.

Downloads require no access to the private development repository or Actions artifacts. Keep the existing application data directory when upgrading. Previous releases remain available from [release history](https://github.com/tiankongbushexian-crypto/WcSdAi-Desktop/releases).

The [legacy workflow entry](https://github.com/tiankongbushexian-crypto/WcSdAi-Desktop/actions/workflows/team-builds.yml) provides download directions only. Installers are built and checked in the private source repository, then published here with their matching source and notices before the stable manifest is advanced. This public repository does not build or install the application automatically.

Maintainer: [tiankongbushexian-crypto](https://github.com/tiankongbushexian-crypto).
Organization: 量动科技. Website: <https://wanchuangsd.cn>.
Support: <2222223323@qq.com>.

## Local verification

Run `node scripts/verify-distribution.mjs` to check the public metadata. Add
`--assets /absolute/path/to/release-assets` to hash every staged release asset.
