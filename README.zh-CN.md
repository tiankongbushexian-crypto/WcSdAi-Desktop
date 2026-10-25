# WcSdAi 下载与更新

> [!WARNING]
> **Do not install WcSdAi 1.1.0. Security patch 1.1.1 is being prepared.**
> A high-severity Undici failure in the Agent networking dependency has been reproduced: an affected response can terminate the subprocess and interrupt tasks. Do not downgrade to 1.0.5 as a security workaround; it contains the same affected dependency. No credential disclosure or code execution has been demonstrated. See the [updated security assessment](releases/1.1.0-verification.md#security-hold-and-dependency-assessment).

本公开仓库提供 WcSdAi 安装包、稳定版更新文件，以及已发布版本的对应源码和许可证。
开发仓库和开发历史保存在私有的 `WcSdAi-Desktop-Source` 中；已发布安装包的对应源码继续公开提供。

[Release 1.1.0](https://github.com/tiankongbushexian-crypto/WcSdAi-Desktop/releases/tag/v1.1.0) · [English](README.md)

## 1.1.0 release addendum

The new release instructions below are maintained in English; the existing Chinese project and license notices are preserved.

## Sign in to your WcSdAi account

1. Open the WcSdAi account card in model settings and select **Sign in**. Your system browser opens [api.90z.cn](https://api.90z.cn).
2. Sign in to your website account and approve access for this desktop device. Return to WcSdAi to use the automatically synchronized conversational models allowed for your account. No API key or endpoint entry is required for these account models.
3. Use the account card to recharge on the website. Check that the website is signed in to the same account. Once the balance is actually credited, return to WcSdAi and select **Refresh**.

Payment receipt and credit fulfillment are separate: wait for the website to finish crediting the balance before expecting it in the client. Model access follows the website's current permissions, balance or subscription allowance, and usage limits. This release covers supported conversational models, not every media-generation endpoint.

Existing API providers (BYOK), local conversations and permission settings are retained. Account sign-in is optional for existing providers. Signing out does not delete local conversations; desktop authorizations can be reviewed and revoked on the website.

## 1.1.0 artifacts — installation paused

<!-- RELEASE-ASSETS:START -->
| Platform | Installer | SHA-256 |
| --- | --- | --- |
| macOS Apple Silicon (arm64) | [Download](https://github.com/tiankongbushexian-crypto/WcSdAi-Desktop/releases/download/v1.1.0/WcSdAi-1.1.0-macos-arm64-unsigned.dmg) | `ff497571cd95709f02516686bf643a762a6987cc93403cd81a3c3f12a780d1ec` |
| macOS Intel (x64) | [Download](https://github.com/tiankongbushexian-crypto/WcSdAi-Desktop/releases/download/v1.1.0/WcSdAi-1.1.0-macos-x64-unsigned.dmg) | `f3b59d81d9c372b34e0fa34ff74a162dbf391602228a99707161d47337d37c74` |
| Windows (x64) | [Download](https://github.com/tiankongbushexian-crypto/WcSdAi-Desktop/releases/download/v1.1.0/WcSdAi-1.1.0-windows-x64-unsigned.exe) | `7b12e2b4789e24b459d37ae028f1ba1600f31eece9a242d0d4fba479088b15e6` |
<!-- RELEASE-ASSETS:END -->

[SHA256SUMS](https://github.com/tiankongbushexian-crypto/WcSdAi-Desktop/releases/download/v1.1.0/SHA256SUMS) covers the installers and archives. Exact asset sizes, hashes and corresponding source commits are recorded in [release metadata](releases/1.1.0.json).

See the [1.1.0 verification report](releases/1.1.0-verification.md) for the validation scope, results and remaining limitations.

The 1.1.0 files remain available for integrity verification and corresponding-source access; installation is paused while 1.1.1 is prepared and validated. These are **unsigned team builds**: they include no Apple notarization or Windows publisher signature. Respect your operating system and organization security policies.

## Corresponding source and notices

All three 1.1.0 platform builds use the same application source commit. The release metadata records the exact installer-to-source mapping.

<!-- RELEASE-SOURCES:START -->
| Platforms | Corresponding source | Commit | SHA-256 |
| --- | --- | --- | --- |
| macOS arm64, macOS x64, Windows x64 | [Download source](https://github.com/tiankongbushexian-crypto/WcSdAi-Desktop/releases/download/v1.1.0/WcSdAi-1.1.0-source-2bc2ebf1df14.tar.gz) | `2bc2ebf1df14149cdf1b8a9ace1ef575b18e15a7` | `62e3c341f954f48dcc3e9dfb36d9279b5d7e193dbb676331e892f11b43c1f5c7` |
<!-- RELEASE-SOURCES:END -->

Each complete platform ZIP includes the installer, its matching application source, build information, checksums and license/notice files:

- [macos-arm64 complete archive](https://github.com/tiankongbushexian-crypto/WcSdAi-Desktop/releases/download/v1.1.0/WcSdAi-1.1.0-macos-arm64-unsigned.zip)
- [macos-x64 complete archive](https://github.com/tiankongbushexian-crypto/WcSdAi-Desktop/releases/download/v1.1.0/WcSdAi-1.1.0-macos-x64-unsigned.zip)
- [windows-x64 complete archive](https://github.com/tiankongbushexian-crypto/WcSdAi-Desktop/releases/download/v1.1.0/WcSdAi-1.1.0-windows-x64-unsigned.zip)

**GitHub's automatically generated “Source code (zip)” and “Source code (tar.gz)” links contain this distribution repository's metadata only. They are not the application source. Use the explicitly named corresponding-source archives above.**

WcSdAi 基于 [PI-Desktop](https://github.com/vastsa/PI-Desktop)。上游 LGPLv3、原始版权声明及第三方许可证继续有效。
[LICENSE](LICENSE)、[NOTICE.md](NOTICE.md)、[THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) 和 [LICENSES/](LICENSES/)
均从已发布包原样保留。其中提到的历史应用源码路径，请在对应源码归档内查阅。
开发仓库私有化不影响接收者依许可证享有的权利。

## Existing clients and updates

The public repository name and `updates/stable.json` path remain unchanged. **Versions 1.0.2 and later** can check for updates while online, display the new version and release notes, and open the public release page when you select Download. **Installation is manual; the app does not automatically install updates.** Version 1.0.1 needs a manual upgrade to gain update checking.

Downloads require no access to the private development repository or Actions artifacts. Keep the existing application data directory when upgrading. Previous releases remain available from [release history](https://github.com/tiankongbushexian-crypto/WcSdAi-Desktop/releases).

The [legacy workflow entry](https://github.com/tiankongbushexian-crypto/WcSdAi-Desktop/actions/workflows/team-builds.yml) provides download directions only. Installers are built and checked in the private source repository, then published here with their matching source and notices before the stable manifest is advanced. This public repository does not build or install the application automatically.

维护者：[tiankongbushexian-crypto](https://github.com/tiankongbushexian-crypto)；组织：量动科技。
官网：<https://wanchuangsd.cn>；支持邮箱：<2222223323@qq.com>。
