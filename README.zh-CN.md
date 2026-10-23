# WcSdAi 下载与更新

本公开仓库提供 WcSdAi 安装包、稳定版更新文件，以及已发布版本的对应源码和许可证。
开发仓库和开发历史保存在私有的 `WcSdAi-Desktop-Source` 中；已发布安装包的对应源码继续公开提供。

[1.0.5 下载页](https://github.com/tiankongbushexian-crypto/WcSdAi-Desktop/releases/tag/v1.0.5) · [English](README.md)

## 下载 1.0.5

以下均为已验证的 **1.0.5** 安装包，本次仅迁移下载位置，未重新构建或修改安装包。
Windows 包包含真实窗口圆角修复，macOS 包保持不变。

| 平台 | 安装包 | SHA-256 |
| --- | --- | --- |
| macOS Apple Silicon（arm64） | [Download](https://github.com/tiankongbushexian-crypto/WcSdAi-Desktop/releases/download/v1.0.5/WcSdAi-1.0.5-macos-arm64-unsigned.dmg) | `2f33b8cea129c38273e3310a8f4b7f4dbcffa1bb1323592fa3c47e2d2f830543` |
| macOS Intel（x64） | [Download](https://github.com/tiankongbushexian-crypto/WcSdAi-Desktop/releases/download/v1.0.5/WcSdAi-1.0.5-macos-x64-unsigned.dmg) | `0619632b465c42a907469a5f672d32cdc9393678d92ca427e58f145066024739` |
| Windows（x64） | [Download](https://github.com/tiankongbushexian-crypto/WcSdAi-Desktop/releases/download/v1.0.5/WcSdAi-1.0.5-windows-x64-unsigned.exe) | `8d84c843fd4886fdf2a0556ad0675f312f9d4bce4c812572e8cb2f8c31239db5` |

[SHA256SUMS 校验文件](https://github.com/tiankongbushexian-crypto/WcSdAi-Desktop/releases/download/v1.0.5/SHA256SUMS)覆盖全部安装包和归档。
选择对应平台，完全退出 WcSdAi 后覆盖安装，保留现有配置、数据及备份。
这些仍是未签名的团队安装包，下载迁移不会增加 Apple 公证或 Windows 发布者签名；请遵循系统及团队的安全策略。

## 对应源码与许可证

请选择与安装包匹配的应用源码：

- [macOS corresponding source](https://github.com/tiankongbushexian-crypto/WcSdAi-Desktop/releases/download/v1.0.5/WcSdAi-1.0.5-source-66523a3480cb.tar.gz): `66523a3480cb42cd4e92b6747486cbeb7586c781`; SHA-256 `69553cf710fc57754322cfe585e006c3f8610f89f900fc942f8191a30f586b2f`.
- [Windows corresponding source](https://github.com/tiankongbushexian-crypto/WcSdAi-Desktop/releases/download/v1.0.5/WcSdAi-1.0.5-source-a2d1da936618.tar.gz): `a2d1da936618c3ccca1761289b5b6794b17481da`; SHA-256 `14858e4e32c52ec9f3440a474f23ef9823e4844590d9c18d6091ad423854de3f`.

原始完整 ZIP 归档包含安装包、对应应用源码、构建信息、校验文件及许可证：

- [macos-arm64 complete archive](https://github.com/tiankongbushexian-crypto/WcSdAi-Desktop/releases/download/v1.0.5/WcSdAi-1.0.5-macos-arm64-unsigned.zip)
- [macos-x64 complete archive](https://github.com/tiankongbushexian-crypto/WcSdAi-Desktop/releases/download/v1.0.5/WcSdAi-1.0.5-macos-x64-unsigned.zip)
- [windows-x64 complete archive](https://github.com/tiankongbushexian-crypto/WcSdAi-Desktop/releases/download/v1.0.5/WcSdAi-1.0.5-windows-x64-unsigned.zip)

**GitHub 自动生成的 “Source code (zip)” 和 “Source code (tar.gz)” 只包含这个下载仓库的元数据，并非应用源码。请使用上面明确命名的对应源码归档。**

WcSdAi 基于 [PI-Desktop](https://github.com/vastsa/PI-Desktop)。上游 LGPLv3、原始版权声明及第三方许可证继续有效。
[LICENSE](LICENSE)、[NOTICE.md](NOTICE.md)、[THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) 和 [LICENSES/](LICENSES/)
均从已发布包原样保留。其中提到的历史应用源码路径，请在对应源码归档内查阅。
开发仓库私有化不影响接收者依许可证享有的权利。

## 已安装客户端与更新

公开仓库名称和 `updates/stable.json` 路径保持不变，已有更新检查功能的客户端继续读取原地址。
发现更高版本后，点击下载将打开公开 Release 页面，无需访问私有源码仓库或下载 Actions 构建产物的权限。
本次版本仍为 1.0.5，因此已安装 1.0.5 不会仅因下载位置迁移而提示新版；1.0.1 需要先手动升级一次才能获得更新检查功能。

[原工作流入口](https://github.com/tiankongbushexian-crypto/WcSdAi-Desktop/actions/workflows/team-builds.yml)现在只提供下载指引。
后续版本在私有源码仓库构建和验证，安装包、对应源码及许可证发布到这里后，再更新版本清单。
本公开仓库不构建应用，也不自动安装更新。

维护者：[tiankongbushexian-crypto](https://github.com/tiankongbushexian-crypto)；组织：量动科技。
官网：<https://wanchuangsd.cn>；支持邮箱：<2222223323@qq.com>。
