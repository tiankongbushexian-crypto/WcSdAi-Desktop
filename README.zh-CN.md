# WcSdAi 下载与更新

> [!NOTE]
> **WcSdAi 1.1.2 was published on 2026-10-25T14:03:53Z.**
> All three native build lanes and their 14 required evidence artifacts passed. All eight GitHub release files are anonymously accessible; their reported digests, sizes and the downloaded checksum bytes match the qualified local files. The website mirror also passed full server-hash checks and anonymous download verification; its download page now shows 1.1.2 and all three platform choices. Do not install held version 1.1.0 or downgrade as a security workaround.

本公开仓库提供 WcSdAi 安装包、稳定版更新文件，以及已发布版本的对应源码和许可证。开发历史保存在私有 `WcSdAi-Desktop-Source` 仓库中；已发布安装包的对应源码继续公开提供。

Release instructions below follow the repository's English documentation policy; the existing Chinese project and license notices are preserved.

[Website downloads](https://api.90z.cn/download) · [GitHub release 1.1.2](https://github.com/tiankongbushexian-crypto/WcSdAi-Desktop/releases/tag/v1.1.2) · [English](README.md)

## 1.1.2 account and window improvements

- The sidebar avatar opens account information, balance, allowed models, recharge, usage, refresh and Settings. The WcSdAi logo represents the signed-out state.
- Browser authorization shows progress until protected credential storage and account/model synchronization finish. It then confirms success and returns to the website dashboard after three seconds. Failed authorization does not show success or redirect automatically.
- Windows corners use antialiased transparency with native hit regions in light and dark themes. Maximized and fullscreen windows remain rectangular. Hovering over a project row uses the normal arrow cursor; project dragging remains available.
- The website download page identifies macOS Apple Silicon arm64, macOS Intel x64 and Windows x64 installers, with installation help, corresponding source, notices and checksums.

All three installers correspond to source `96e3c64d9facc104fe69d1cdf9ab05e83e857a0a`. See the
[1.1.2 verification report](releases/1.1.2-verification.md) for actual native
results and remaining limits. Existing API providers, conversations, account
access and permission settings are preserved. Installation remains manual.

The Electron 43.8.3 and network security repairs from 1.1.1 remain included.
This release does not claim that all dependency advisories are resolved. The
[1.1.1 verification](releases/1.1.1-verification.md) and
[historical dependency audit](releases/1.1.1-dependencies.json) remain available;
that audit is historical evidence, not a new 1.1.2 audit run.

## Sign in to your WcSdAi account

1. Select the WcSdAi logo at the bottom of the sidebar, then **Sign in**. Your system browser opens [api.90z.cn](https://api.90z.cn).
2. Sign in to your website account and approve this desktop device. After the client securely stores credentials and synchronizes the account, the browser confirms success and returns to the dashboard. Return to WcSdAi to use the allowed conversational models without entering an API key or endpoint.
3. Open the avatar menu for your balance, allowed models, usage, recharge and Settings. Confirm that the website uses the same account when recharging. After the website actually credits the balance, return to the client and select **Refresh**.

Payment receipt and credit fulfillment are separate. Model access follows the
website's current permissions, balance or subscription allowance and usage limits.
This integration covers supported conversational models, not every media endpoint.
Existing API providers (BYOK) still work independently. Signing out does not delete
local conversations; website settings can review and revoke desktop authorizations.

## 1.1.2 downloads

Use the [website download page](https://api.90z.cn/download) as the main entry.
The direct GitHub mirror links below remain available for existing clients and
for users who prefer GitHub.

<!-- RELEASE-ASSETS:START -->
| Platform | Installer | SHA-256 |
| --- | --- | --- |
| macOS Apple Silicon (arm64) | [Download](https://github.com/tiankongbushexian-crypto/WcSdAi-Desktop/releases/download/v1.1.2/WcSdAi-1.1.2-macos-arm64-unsigned.dmg) | `3dd2256c1646292b4421f91bc13ea2b888e1718c8ea36ca33cd1cfc264fe04fc` |
| macOS Intel (x64) | [Download](https://github.com/tiankongbushexian-crypto/WcSdAi-Desktop/releases/download/v1.1.2/WcSdAi-1.1.2-macos-x64-unsigned.dmg) | `57b8ab76e47369ffb02a2270e9972f2cde5664b2f0c75c4e08a66e258b114175` |
| Windows (x64) | [Download](https://github.com/tiankongbushexian-crypto/WcSdAi-Desktop/releases/download/v1.1.2/WcSdAi-1.1.2-windows-x64-unsigned.exe) | `6e76b2afac8f101217eccfdf7235c09135614efe43f1cb830d2a674b7eac2ca6` |
<!-- RELEASE-ASSETS:END -->

[SHA256SUMS](https://github.com/tiankongbushexian-crypto/WcSdAi-Desktop/releases/download/v1.1.2/SHA256SUMS) covers all installers and archives. Exact sizes, hashes and source commits are recorded in [release metadata](releases/1.1.2.json).

These are **unsigned team builds**. macOS ad-hoc integrity seals are not Apple
Developer ID signatures or notarization; Windows installers have no publisher
certificate. Respect operating-system and organization security policies.

## Corresponding source and notices

Every platform uses the same exact application source. The table identifies its
archive independently of the private development repository.

<!-- RELEASE-SOURCES:START -->
| Platforms | Corresponding source | Commit | SHA-256 |
| --- | --- | --- | --- |
| macOS arm64, macOS x64, Windows x64 | [Application source](https://github.com/tiankongbushexian-crypto/WcSdAi-Desktop/releases/download/v1.1.2/WcSdAi-1.1.2-source-96e3c64d9fac.tar.gz) | `96e3c64d9facc104fe69d1cdf9ab05e83e857a0a` | `af378765140909c62608a7cac5d7af04defcfb3ddcad700eab4025c0a79b8c59` |
<!-- RELEASE-SOURCES:END -->

Each full platform ZIP contains its installer, matching source, build information,
checksums and license/notice files. These ZIPs are not portable applications.

- [macos-arm64 full release archive](https://github.com/tiankongbushexian-crypto/WcSdAi-Desktop/releases/download/v1.1.2/WcSdAi-1.1.2-macos-arm64-unsigned.zip)
- [macos-x64 full release archive](https://github.com/tiankongbushexian-crypto/WcSdAi-Desktop/releases/download/v1.1.2/WcSdAi-1.1.2-macos-x64-unsigned.zip)
- [windows-x64 full release archive](https://github.com/tiankongbushexian-crypto/WcSdAi-Desktop/releases/download/v1.1.2/WcSdAi-1.1.2-windows-x64-unsigned.zip)

**GitHub's automatic “Source code (zip)” and “Source code (tar.gz)” downloads contain this public distribution repository's metadata only. Use the explicitly named application source archive above.**

WcSdAi 基于 [PI-Desktop](https://github.com/vastsa/PI-Desktop)。上游 LGPLv3、原始版权声明及第三方许可证继续有效。[LICENSE](LICENSE)、[NOTICE.md](NOTICE.md)、[THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) 和 [LICENSES/](LICENSES/) 均原样保留。其中提到的历史应用源码路径，请在对应源码归档内查阅。开发仓库私有化不影响接收者依许可证享有的权利。

## Existing clients and updates

The public repository name and `updates/stable.json` path are unchanged. This
revision advances the stable manifest to the verified 1.1.2 **GitHub release
page**, preserving compatibility with older clients. Both GitHub and website
assets passed anonymous download verification before this manifest change.
The website is an additional download entry; downloads require no access to the
private source repository.

Versions **1.0.2 and later** can check online, display the version and release
notes, and open the download page. **Updates are installed manually; the client
does not silently replace the installed application.** Version 1.0.1 needs a
manual upgrade to gain update checking. Keep the existing data directory.

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
