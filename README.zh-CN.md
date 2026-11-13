# WcSdAi 下载与更新

> [!NOTE]
> **WcSdAi 1.3.1 已于 2026-11-13T08:29:05Z 发布。**
> 三个平台及全部 27 个必要安装包／验证产物均已通过验收。GitHub 的八个公开文件已核对大小、平台提供的哈希、匿名访问和校验文件完整内容。官网镜像验证与稳定更新入口的启用情况单独记录在[验证报告](releases/1.3.1-verification.md)中。1.1.0 仍为暂停发布版本，请勿安装，也不要通过降级绕过安全限制。

本公开仓库提供 WcSdAi 安装包、稳定版更新文件，以及已发布版本的对应源码和许可证。开发历史保存在私有 `WcSdAi-Desktop-Source` 仓库中；已发布安装包的对应源码继续公开提供。

[官网下载](https://api.90z.cn/download) · [GitHub 1.3.1 发布页](https://github.com/tiankongbushexian-crypto/WcSdAi-Desktop/releases/tag/v1.3.1) · [English](README.md)

## 1.3.1 账号模型稳定性改进

- 修复账号授权的 Grok 请求：使用网站下发的协议和接口地址，个人模型参数不会改变请求协议。手动添加的 API 服务保持原有行为。
- 上游暂时不可用时，保留已授权模型并明确显示状态，恢复后无需重新设置模型参数。真实撤权、余额和订阅限制仍然生效。
- 模型选择列表合并展示等效别名，保留原有选择、独立参数和自定义名称；不会因为模型不可用而自动切换到另一计费分组。
- 网站管理员使用记录可区分所属用户和已记录的客户端设备，筛选和导出采用相同规则。普通用户与观察者的可见数据仍受权限限制。

原有账号、计费计算、API 配置、个人模型参数和会话历史保留。1.3.0 提供的任务验收、浏览器验证和独立 Git 工作副本能力继续保留。失败的付费请求不会自动重试。

三个平台安装包均对应源码 `7c9f08fc93bd5aaa68733e827d8aab97cfeee07e`。实际原生验收结果与限制见 [1.3.1 验证报告](releases/1.3.1-verification.md)。更新仍需手动安装。

本版继续包含 Electron 43.8.3 及 1.1.1 的网络安全修复，不代表所有依赖安全公告均已解决。[1.1.1 验证报告](releases/1.1.1-verification.md)与[历史依赖审计](releases/1.1.1-dependencies.json)继续保留；历史审计不能作为一次新的 1.3.1 审计。

## 登录 WcSdAi 账号

1. 点击客户端侧栏底部的 WcSdAi 标志，选择“登录”。系统浏览器将打开 [api.90z.cn](https://api.90z.cn)。
2. 登录网站账号并授权当前设备。客户端安全保存凭据并完成账号同步后，浏览器显示登录成功并返回网站控制台。回到客户端即可使用账号允许的对话模型，无需填写 API 密钥和接口地址。
3. 点击头像可查看余额、可用模型、使用情况、充值入口与设置。充值时核对网站登录的账号；网站实际入账后，回到客户端点击“刷新账号”。

支付成功与实际入账是不同环节。模型使用遵循网站当前权限、余额或订阅额度及使用限制。客户端支持网站允许的对话模型、图片生成与编辑接口，其他媒体接口尚不支持。

原有自填密钥的 API 服务仍可独立使用。退出账号不会删除本地会话；可在网站设置中查看或撤销设备授权。

## 1.3.1 下载

请优先使用[官网下载页](https://api.90z.cn/download)。以下 GitHub 镜像链接为旧客户端和需要通过 GitHub 下载的用户保留。

<!-- RELEASE-ASSETS:START -->
| 平台 | 安装包 | SHA-256 |
| --- | --- | --- |
| macOS Apple 芯片（arm64） | [下载](https://github.com/tiankongbushexian-crypto/WcSdAi-Desktop/releases/download/v1.3.1/WcSdAi-1.3.1-macos-arm64-unsigned.dmg) | `f85b39e240bf0b69033e6711f0c1f1205b20480e880997f40eca09e958823c56` |
| macOS Intel（x64） | [下载](https://github.com/tiankongbushexian-crypto/WcSdAi-Desktop/releases/download/v1.3.1/WcSdAi-1.3.1-macos-x64-unsigned.dmg) | `cfde11f9cc8011a6917b41bbbb55f648e490c2c741f9d86b4a22094a0173b16b` |
| Windows（x64） | [下载](https://github.com/tiankongbushexian-crypto/WcSdAi-Desktop/releases/download/v1.3.1/WcSdAi-1.3.1-windows-x64-unsigned.exe) | `c9584ab51a6a91b4453e662bc636357c194059a8dd6b29669fb2dbff0b786eed` |
<!-- RELEASE-ASSETS:END -->

[SHA256SUMS](https://github.com/tiankongbushexian-crypto/WcSdAi-Desktop/releases/download/v1.3.1/SHA256SUMS)覆盖所有安装包及归档文件。[发布元数据](releases/1.3.1.json)记录各文件的字节大小、校验值与对应源码提交。

这些是**未签名的团队安装包**。macOS 的临时完整性签名不是 Apple Developer ID 签名或公证；Windows 安装包没有发布者证书。请遵循操作系统和所在组织的安全策略。

## 对应源码与许可证

三个平台使用同一份精确源码。下表中的应用源码归档独立于私有开发仓库提供。

<!-- RELEASE-SOURCES:START -->
| 平台 | 对应源码 | 提交 | SHA-256 |
| --- | --- | --- | --- |
| macOS arm64、macOS x64、Windows x64 | [应用源码](https://github.com/tiankongbushexian-crypto/WcSdAi-Desktop/releases/download/v1.3.1/WcSdAi-1.3.1-source-7c9f08fc93bd.tar.gz) | `7c9f08fc93bd5aaa68733e827d8aab97cfeee07e` | `c0578383e1dcef4d03ca865b89409ca267513da6fed93d495bc197da8cc9dcba` |
<!-- RELEASE-SOURCES:END -->

每个平台的完整 ZIP 包含安装包、匹配的源码、构建信息、校验文件和许可证声明；这些 ZIP 不是免安装便携版。

- [macos-arm64 完整发布归档](https://github.com/tiankongbushexian-crypto/WcSdAi-Desktop/releases/download/v1.3.1/WcSdAi-1.3.1-macos-arm64-unsigned.zip)
- [macos-x64 完整发布归档](https://github.com/tiankongbushexian-crypto/WcSdAi-Desktop/releases/download/v1.3.1/WcSdAi-1.3.1-macos-x64-unsigned.zip)
- [windows-x64 完整发布归档](https://github.com/tiankongbushexian-crypto/WcSdAi-Desktop/releases/download/v1.3.1/WcSdAi-1.3.1-windows-x64-unsigned.zip)

**GitHub 自动生成的“Source code (zip)”和“Source code (tar.gz)”只包含公开分发仓库的元数据。请下载上方明确命名的应用源码归档。**

WcSdAi 基于 [PI-Desktop](https://github.com/vastsa/PI-Desktop)。上游 LGPLv3、原始版权声明及第三方许可证继续有效。[LICENSE](LICENSE)、[NOTICE.md](NOTICE.md)、[THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) 和 [LICENSES/](LICENSES/) 均保留。声明中的历史应用源码路径请在对应源码归档内查阅。开发仓库私有化不影响接收者依许可证享有的权利。

## 已安装客户端与更新

公开仓库名称和 `updates/stable.json` 路径保持不变。1.3.1 更新文件继续使用 **GitHub 发布页**作为旧客户端的下载目标。GitHub 发布、官网镜像校验及更新入口实际启用时间记录在[验证报告](releases/1.3.1-verification.md)中。

1.1.3 及以上客户端会在验证更新目标后打开固定的官网下载入口。1.1.2 及更早版本仍按自身代码打开更新文件中的 GitHub 地址，手动升级后才会改变；仅修改更新文件不能改变已安装代码。下载无需登录账号或访问私有仓库。

**1.0.2 及以上版本**可联网检查新版、显示更新内容并打开下载页。**更新需要手动安装，客户端不会静默替换已安装应用。** 1.0.1 需要先手动升级才能获得检查更新功能。请保留现有数据目录。

[1.3.0 验证报告](releases/1.3.0-verification.md)、[1.2.0 验证报告](releases/1.2.0-verification.md)、[1.1.4 验证报告](releases/1.1.4-verification.md)、[1.1.3 验证报告](releases/1.1.3-verification.md)、[1.1.2 验证报告](releases/1.1.2-verification.md)、[1.1.1 验证报告](releases/1.1.1-verification.md)、[暂停发布的 1.1.0 记录](releases/1.1.0-verification.md)、历史校验文件及对应源码均保留。1.1.0 的暂停发布状态仍然有效。更早版本见[发布历史](https://github.com/tiankongbushexian-crypto/WcSdAi-Desktop/releases)。

[旧工作流入口](https://github.com/tiankongbushexian-crypto/WcSdAi-Desktop/actions/workflows/team-builds.yml)仅显示下载指引，不构建、安装或发布应用。

维护者：[tiankongbushexian-crypto](https://github.com/tiankongbushexian-crypto)；组织：量动科技。官网：<https://wanchuangsd.cn>；支持邮箱：<2222223323@qq.com>。

## 本地校验

运行 `node scripts/verify-distribution.mjs`。附加 `--assets /absolute/path/to/release-assets` 可核对暂存目录中确切的八个文件，并独立计算其中七个安装包和归档文件的哈希。
