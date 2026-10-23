# WcSdAi downloads and updates

This public repository provides WcSdAi installers, the stable update manifest,
and the corresponding source and licenses for published builds. Active
development and its history are maintained separately in the private
`WcSdAi-Desktop-Source` repository. Published corresponding source remains public.

[Release 1.0.5](https://github.com/tiankongbushexian-crypto/WcSdAi-Desktop/releases/tag/v1.0.5) · [简体中文](README.zh-CN.md)

## Download 1.0.5

These are the existing verified **1.0.5** installers, republished without
rebuilding or changing their bytes. The Windows package includes the real
rounded-corner repair. The macOS packages are unchanged.

| Platform | Installer | SHA-256 |
| --- | --- | --- |
| macOS Apple Silicon (arm64) | [Download](https://github.com/tiankongbushexian-crypto/WcSdAi-Desktop/releases/download/v1.0.5/WcSdAi-1.0.5-macos-arm64-unsigned.dmg) | `2f33b8cea129c38273e3310a8f4b7f4dbcffa1bb1323592fa3c47e2d2f830543` |
| macOS Intel (x64) | [Download](https://github.com/tiankongbushexian-crypto/WcSdAi-Desktop/releases/download/v1.0.5/WcSdAi-1.0.5-macos-x64-unsigned.dmg) | `0619632b465c42a907469a5f672d32cdc9393678d92ca427e58f145066024739` |
| Windows (x64) | [Download](https://github.com/tiankongbushexian-crypto/WcSdAi-Desktop/releases/download/v1.0.5/WcSdAi-1.0.5-windows-x64-unsigned.exe) | `8d84c843fd4886fdf2a0556ad0675f312f9d4bce4c812572e8cb2f8c31239db5` |

[SHA256SUMS](https://github.com/tiankongbushexian-crypto/WcSdAi-Desktop/releases/download/v1.0.5/SHA256SUMS) covers the installers and archives.
Choose the installer for your computer, quit WcSdAi, and install it over the
existing copy while retaining your data and backups. These are unsigned team
builds; publishing them here adds no Apple notarization or Windows publisher
signature. Respect your operating system and organization security policies.

## Corresponding source and notices

Use the source archive that matches your installer:

- [macOS corresponding source](https://github.com/tiankongbushexian-crypto/WcSdAi-Desktop/releases/download/v1.0.5/WcSdAi-1.0.5-source-66523a3480cb.tar.gz): `66523a3480cb42cd4e92b6747486cbeb7586c781`; SHA-256 `69553cf710fc57754322cfe585e006c3f8610f89f900fc942f8191a30f586b2f`.
- [Windows corresponding source](https://github.com/tiankongbushexian-crypto/WcSdAi-Desktop/releases/download/v1.0.5/WcSdAi-1.0.5-source-a2d1da936618.tar.gz): `a2d1da936618c3ccca1761289b5b6794b17481da`; SHA-256 `14858e4e32c52ec9f3440a474f23ef9823e4844590d9c18d6091ad423854de3f`.

The complete original artifact ZIPs include the installer, matching application
source, build information, checksums, and license/notice files:

- [macos-arm64 complete archive](https://github.com/tiankongbushexian-crypto/WcSdAi-Desktop/releases/download/v1.0.5/WcSdAi-1.0.5-macos-arm64-unsigned.zip)
- [macos-x64 complete archive](https://github.com/tiankongbushexian-crypto/WcSdAi-Desktop/releases/download/v1.0.5/WcSdAi-1.0.5-macos-x64-unsigned.zip)
- [windows-x64 complete archive](https://github.com/tiankongbushexian-crypto/WcSdAi-Desktop/releases/download/v1.0.5/WcSdAi-1.0.5-windows-x64-unsigned.zip)

**GitHub's automatically generated “Source code (zip)” and “Source code
(tar.gz)” links contain this distribution repository's metadata only. They are
not the application source. Use the explicitly named corresponding-source
archives above.**

WcSdAi is based on [PI-Desktop](https://github.com/vastsa/PI-Desktop).
The upstream LGPLv3 license, original copyright notices, and applicable
third-party terms remain in force. See [LICENSE](LICENSE),
[NOTICE.md](NOTICE.md), [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md), and
[LICENSES/](LICENSES/). These files are preserved from the release artifacts.
Historical references to application source paths inside those notices are
resolved in the matching application source archive, not this small download
repository. Private development does not remove recipients' license rights.

## Existing clients and updates

The public repository name and `updates/stable.json` path remain unchanged.
Clients with update checking continue reading the same public manifest and
open the release page after the user selects Download. Downloads require no
access to the private development repository and no Actions artifact access.
The version remains 1.0.5, so a client already on 1.0.5 does not receive a
newer-version notification solely because these downloads moved. Version 1.0.1
must be updated manually once to gain update checking.

The [legacy workflow entry](https://github.com/tiankongbushexian-crypto/WcSdAi-Desktop/actions/workflows/team-builds.yml)
now provides download directions only. Future installers are built and checked
in the private source repository, then published here together with their
matching source and notices before advancing the manifest version. This
repository does not build or install the application automatically.

Maintainer: [tiankongbushexian-crypto](https://github.com/tiankongbushexian-crypto).
Organization: 量动科技. Website: <https://wanchuangsd.cn>.
Support: <2222223323@qq.com>.

## Local verification

Run `node scripts/verify-distribution.mjs` to check the public metadata. Add
`--assets /absolute/path/to/release-assets` to hash every staged release asset.
