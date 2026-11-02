# WcSdAi downloads and updates

> [!NOTE]
> **WcSdAi 1.3.0 was published on 2026-11-02T18:30:37Z.**
> All three native build lanes and their 24 required evidence artifacts passed. All eight GitHub release files passed anonymous size/digest verification and checksum-byte checks. The website mirror passed full server-hash checks and anonymous metadata/range verification; its download page displays 1.3.0 with all three platform choices. This revision activates the verified stable feed through its merge into public main. Do not install held version 1.1.0 or downgrade as a security workaround.

This public repository provides installers, stable update metadata, corresponding application source and licenses. Active development and its history live in the private `WcSdAi-Desktop-Source` repository. Published application source remains public.

[Website downloads](https://api.90z.cn/download) · [GitHub release 1.3.0](https://github.com/tiankongbushexian-crypto/WcSdAi-Desktop/releases/tag/v1.3.0) · [简体中文](README.zh-CN.md)

## 1.3.0 checkable agent work

- Record task acceptance criteria and real command results. Failed, blocked, cancelled and changed-after-check states remain visible rather than becoming success claims.
- Browser actions wait for usable controls, preserve controlled-input state and cancel on stop or page changes. Failed observation does not automatically replay an action.
- Opt an empty local Git project session into an independent workcopy. Review first, then explicitly confirm a merge; stale previews, conflicts and collisions fail closed. Copies and incomplete-landing recovery evidence are retained.

Account model controls, authorized image generation, original API providers,
conversations and permissions remain. Failed paid image requests are not automatically replayed.
Workcopies are not OS sandboxes; configured stdio MCP and the independent global
file-manager retain their selected directories. Tests measure controlled execution
behavior, not model intelligence or parity with another coding product.

All three installers correspond to source `5bc94e81e425e270aad0401188e64e1f8d27755e`. See the
[1.3.0 verification report](releases/1.3.0-verification.md) for actual native
results and remaining limits. Existing API providers, conversations, account
access and permission settings are preserved. Installation remains manual.

The Electron 43.8.3 and network security repairs from 1.1.1 remain included.
This release does not claim that all dependency advisories are resolved. The
[1.1.1 verification](releases/1.1.1-verification.md) and
[historical dependency audit](releases/1.1.1-dependencies.json) remain available;
that audit is historical evidence, not a new 1.3.0 audit run.

## Sign in to your WcSdAi account

1. Select the WcSdAi logo at the bottom of the sidebar, then **Sign in**. Your system browser opens [api.90z.cn](https://api.90z.cn).
2. Sign in to your website account and approve this desktop device. After the client securely stores credentials and synchronizes the account, the browser confirms success and returns to the dashboard. Return to WcSdAi to use the allowed conversational models without entering an API key or endpoint.
3. Open the avatar menu for your balance, allowed models, usage, recharge and Settings. Confirm that the website uses the same account when recharging. After the website actually credits the balance, return to the client and select **Refresh**.

Payment receipt and credit fulfillment are separate. Model access follows the
website's current permissions, balance or subscription allowance and usage limits.
Account settings cover supported conversational models and website-authorized image generation/edit endpoints; other media endpoints remain unsupported.
Existing API providers (BYOK) still work independently. Signing out does not delete
local conversations; website settings can review and revoke desktop authorizations.

## 1.3.0 downloads

Use the [website download page](https://api.90z.cn/download) as the main entry.
The direct GitHub mirror links below remain available for existing clients and
for users who prefer GitHub.

<!-- RELEASE-ASSETS:START -->
| Platform | Installer | SHA-256 |
| --- | --- | --- |
| macOS Apple Silicon (arm64) | [Download](https://github.com/tiankongbushexian-crypto/WcSdAi-Desktop/releases/download/v1.3.0/WcSdAi-1.3.0-macos-arm64-unsigned.dmg) | `2a89c970713d944074a1741d5b8b118070086dbf43d9714db0ff6aef4ea26c27` |
| macOS Intel (x64) | [Download](https://github.com/tiankongbushexian-crypto/WcSdAi-Desktop/releases/download/v1.3.0/WcSdAi-1.3.0-macos-x64-unsigned.dmg) | `6be016a84f3b8d18bc8fa2ad45bf6b76588117fbf3fc03357540df587aabfa9d` |
| Windows (x64) | [Download](https://github.com/tiankongbushexian-crypto/WcSdAi-Desktop/releases/download/v1.3.0/WcSdAi-1.3.0-windows-x64-unsigned.exe) | `fcf8f80c9db4e216b7f2555725e811fc4ca2afad1e07f0b48b07400a503f0ad4` |
<!-- RELEASE-ASSETS:END -->

[SHA256SUMS](https://github.com/tiankongbushexian-crypto/WcSdAi-Desktop/releases/download/v1.3.0/SHA256SUMS) covers all installers and archives. Exact sizes, hashes and source commits are recorded in [release metadata](releases/1.3.0.json).

These are **unsigned team builds**. macOS ad-hoc integrity seals are not Apple
Developer ID signatures or notarization; Windows installers have no publisher
certificate. Respect operating-system and organization security policies.

## Corresponding source and notices

Every platform uses the same exact application source. The table identifies its
archive independently of the private development repository.

<!-- RELEASE-SOURCES:START -->
| Platforms | Corresponding source | Commit | SHA-256 |
| --- | --- | --- | --- |
| macOS arm64, macOS x64, Windows x64 | [Application source](https://github.com/tiankongbushexian-crypto/WcSdAi-Desktop/releases/download/v1.3.0/WcSdAi-1.3.0-source-5bc94e81e425.tar.gz) | `5bc94e81e425e270aad0401188e64e1f8d27755e` | `c4652217df4bed3d95e758296352a70e8b404de65642aae09d23e441602182b9` |
<!-- RELEASE-SOURCES:END -->

Each full platform ZIP contains its installer, matching source, build information,
checksums and license/notice files. These ZIPs are not portable applications.

- [macos-arm64 full release archive](https://github.com/tiankongbushexian-crypto/WcSdAi-Desktop/releases/download/v1.3.0/WcSdAi-1.3.0-macos-arm64-unsigned.zip)
- [macos-x64 full release archive](https://github.com/tiankongbushexian-crypto/WcSdAi-Desktop/releases/download/v1.3.0/WcSdAi-1.3.0-macos-x64-unsigned.zip)
- [windows-x64 full release archive](https://github.com/tiankongbushexian-crypto/WcSdAi-Desktop/releases/download/v1.3.0/WcSdAi-1.3.0-windows-x64-unsigned.zip)

**GitHub's automatic “Source code (zip)” and “Source code (tar.gz)” downloads contain this public distribution repository's metadata only. Use the explicitly named application source archive above.**

WcSdAi is based on [PI-Desktop](https://github.com/vastsa/PI-Desktop). Its upstream LGPLv3 license, original copyrights and third-party terms remain in force. [LICENSE](LICENSE), [NOTICE.md](NOTICE.md), [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) and [LICENSES/](LICENSES/) are preserved. Historical application paths in notices refer to the matching source archive. Private development does not remove recipients' license rights.

## Existing clients and updates

The public repository name and `updates/stable.json` path are unchanged. This
revision activates the verified 1.3.0 manifest with the **GitHub release page**
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
