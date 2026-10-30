# WcSdAi 下载与更新

> [!NOTE]
> **WcSdAi 1.2.0 was published on 2026-10-30T12:52:53Z.**
> All three native build lanes and their 21 required evidence artifacts passed. All eight GitHub release files passed anonymous size/digest verification and checksum-byte checks. The website mirror passed full server-hash checks and anonymous metadata/range verification; its download page displays 1.2.0 with all three platform choices. This revision activates the verified stable feed through its merge into public main. Do not install held version 1.1.0 or downgrade as a security workaround.

本公开仓库提供 WcSdAi 安装包、稳定版更新文件，以及已发布版本的对应源码和许可证。开发历史保存在私有 `WcSdAi-Desktop-Source` 仓库中；已发布安装包的对应源码继续公开提供。

Release instructions below follow the repository's English documentation policy; the existing Chinese project and license notices are preserved.

[Website downloads](https://api.90z.cn/download) · [GitHub release 1.2.0](https://github.com/tiankongbushexian-crypto/WcSdAi-Desktop/releases/tag/v1.2.0) · [English](README.md)

## 1.2.0 account model controls and Windows polish

- Configure account model aliases, context/output limits, thinking settings and capabilities. Local preferences survive account refresh and restart; individual fields can return to website defaults.
- Select website-authorized image generation/edit models without another API key. Exact model/operation credentials, normal billing, server-enforced limits and local tool permissions remain in effect. Failed paid image requests are not automatically replayed.
- Windows composes the window once with a symmetric radial alpha mask and one-physical-pixel edges, and uses a smaller inner account avatar within a button matching its neighbors. See the native evidence and actual DPI limits below.

The website must support the new image capability contract. Arbitrary chat models
cannot be converted into image endpoints. Login expiry and token revocation still
apply; no permanent sign-in or unrestricted model access is promised.

All three installers correspond to source `3c4d0108938df5e0cdaf1d94feb8a3033f1b99a4`. See the
[1.2.0 verification report](releases/1.2.0-verification.md) for actual native
results and remaining limits. Existing API providers, conversations, account
access and permission settings are preserved. Installation remains manual.

The Electron 43.8.3 and network security repairs from 1.1.1 remain included.
This release does not claim that all dependency advisories are resolved. The
[1.1.1 verification](releases/1.1.1-verification.md) and
[historical dependency audit](releases/1.1.1-dependencies.json) remain available;
that audit is historical evidence, not a new 1.2.0 audit run.

## Sign in to your WcSdAi account

1. Select the WcSdAi logo at the bottom of the sidebar, then **Sign in**. Your system browser opens [api.90z.cn](https://api.90z.cn).
2. Sign in to your website account and approve this desktop device. After the client securely stores credentials and synchronizes the account, the browser confirms success and returns to the dashboard. Return to WcSdAi to use the allowed conversational models without entering an API key or endpoint.
3. Open the avatar menu for your balance, allowed models, usage, recharge and Settings. Confirm that the website uses the same account when recharging. After the website actually credits the balance, return to the client and select **Refresh**.

Payment receipt and credit fulfillment are separate. Model access follows the
website's current permissions, balance or subscription allowance and usage limits.
Account settings cover supported conversational models and website-authorized image generation/edit endpoints; other media endpoints remain unsupported.
Existing API providers (BYOK) still work independently. Signing out does not delete
local conversations; website settings can review and revoke desktop authorizations.

## 1.2.0 downloads

Use the [website download page](https://api.90z.cn/download) as the main entry.
The direct GitHub mirror links below remain available for existing clients and
for users who prefer GitHub.

<!-- RELEASE-ASSETS:START -->
| Platform | Installer | SHA-256 |
| --- | --- | --- |
| macOS Apple Silicon (arm64) | [Download](https://github.com/tiankongbushexian-crypto/WcSdAi-Desktop/releases/download/v1.2.0/WcSdAi-1.2.0-macos-arm64-unsigned.dmg) | `c40f62b5cb2036e29e041335ab273605fc6f1f89702d5fe96134d96ca8f06013` |
| macOS Intel (x64) | [Download](https://github.com/tiankongbushexian-crypto/WcSdAi-Desktop/releases/download/v1.2.0/WcSdAi-1.2.0-macos-x64-unsigned.dmg) | `d388803aa7a677f39d2bebc159c50047edc5b76b25c0714c324807665bad8689` |
| Windows (x64) | [Download](https://github.com/tiankongbushexian-crypto/WcSdAi-Desktop/releases/download/v1.2.0/WcSdAi-1.2.0-windows-x64-unsigned.exe) | `6de34b6ad74563c6d96524d456270633c86e945dcd51179b8886a7f873c1a37d` |
<!-- RELEASE-ASSETS:END -->

[SHA256SUMS](https://github.com/tiankongbushexian-crypto/WcSdAi-Desktop/releases/download/v1.2.0/SHA256SUMS) covers all installers and archives. Exact sizes, hashes and source commits are recorded in [release metadata](releases/1.2.0.json).

These are **unsigned team builds**. macOS ad-hoc integrity seals are not Apple
Developer ID signatures or notarization; Windows installers have no publisher
certificate. Respect operating-system and organization security policies.

## Corresponding source and notices

Every platform uses the same exact application source. The table identifies its
archive independently of the private development repository.

<!-- RELEASE-SOURCES:START -->
| Platforms | Corresponding source | Commit | SHA-256 |
| --- | --- | --- | --- |
| macOS arm64, macOS x64, Windows x64 | [Application source](https://github.com/tiankongbushexian-crypto/WcSdAi-Desktop/releases/download/v1.2.0/WcSdAi-1.2.0-source-3c4d0108938d.tar.gz) | `3c4d0108938df5e0cdaf1d94feb8a3033f1b99a4` | `34ded1ee95c554bbcc6a979d5750397bed8a04c840ccd85b318966647706dd9b` |
<!-- RELEASE-SOURCES:END -->

Each full platform ZIP contains its installer, matching source, build information,
checksums and license/notice files. These ZIPs are not portable applications.

- [macos-arm64 full release archive](https://github.com/tiankongbushexian-crypto/WcSdAi-Desktop/releases/download/v1.2.0/WcSdAi-1.2.0-macos-arm64-unsigned.zip)
- [macos-x64 full release archive](https://github.com/tiankongbushexian-crypto/WcSdAi-Desktop/releases/download/v1.2.0/WcSdAi-1.2.0-macos-x64-unsigned.zip)
- [windows-x64 full release archive](https://github.com/tiankongbushexian-crypto/WcSdAi-Desktop/releases/download/v1.2.0/WcSdAi-1.2.0-windows-x64-unsigned.zip)

**GitHub's automatic “Source code (zip)” and “Source code (tar.gz)” downloads contain this public distribution repository's metadata only. Use the explicitly named application source archive above.**

WcSdAi 基于 [PI-Desktop](https://github.com/vastsa/PI-Desktop)。上游 LGPLv3、原始版权声明及第三方许可证继续有效。[LICENSE](LICENSE)、[NOTICE.md](NOTICE.md)、[THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) 和 [LICENSES/](LICENSES/) 均原样保留。其中提到的历史应用源码路径，请在对应源码归档内查阅。开发仓库私有化不影响接收者依许可证享有的权利。

## Existing clients and updates

The public repository name and `updates/stable.json` path are unchanged. This
revision activates the verified 1.2.0 manifest with the **GitHub release page**
as its destination for older clients. GitHub publication and website mirror
verification completed before this metadata revision was prepared for public main.

Applications 1.1.3 and later map the validated update action to the fixed official
website entry. Already installed 1.1.2 and earlier clients keep opening their
GitHub manifest destination until manually upgraded; new metadata does not alter
installed code. Downloads require no account or private repository access.

Versions **1.0.2 and later** can check online, display the version and release
notes, and open the download page. **Updates are installed manually; the client
does not silently replace the installed application.** Version 1.0.1 needs a
manual upgrade to gain update checking. Keep the existing data directory.

[1.1.4 verification](releases/1.1.4-verification.md),
[1.1.3 verification](releases/1.1.3-verification.md),
[1.1.2 verification](releases/1.1.2-verification.md),
[1.1.1 verification](releases/1.1.1-verification.md), the
[held 1.1.0 report](releases/1.1.0-verification.md), historical checksums and
corresponding source remain intact. The historical 1.1.0 hold still applies.
Earlier releases remain available in [release history](https://github.com/tiankongbushexian-crypto/WcSdAi-Desktop/releases).

The [legacy workflow entry](https://github.com/tiankongbushexian-crypto/WcSdAi-Desktop/actions/workflows/team-builds.yml) provides download directions only. It does not build, install or publish an application.

维护者：[tiankongbushexian-crypto](https://github.com/tiankongbushexian-crypto)；组织：量动科技。官网：<https://wanchuangsd.cn>；支持邮箱：<2222223323@qq.com>。

## Local verification

Run `node scripts/verify-distribution.mjs`. Add
`--assets /absolute/path/to/release-assets` to check the exact eight staged files
and independently hash the seven installer/archive assets.
