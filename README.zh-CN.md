# WcSdAi 下载与更新

> [!NOTE]
> **WcSdAi 1.4.0 已于 2026-11-20T07:51:22Z 在 GitHub 发布。**
> 八个文件的大小及 GitHub 提供的哈希已于 2026-11-20T07:51:23.177627+00:00 核对，与本地已验收发布回执一致。这不等于匿名全量下载或官网／更新入口已上线；这些环节的实际状态单独记录在[验证报告](releases/1.4.0-verification.md)中。1.1.0 继续暂停发布，请勿通过降级绕过安全限制。

本公开仓库提供 WcSdAi 安装包、稳定版更新文件，以及已发布版本的对应源码和许可证。开发历史保存在私有 `WcSdAi-Desktop-Source` 仓库中；已发布安装包的对应源码继续公开提供。

[官网下载](https://api.90z.cn/download) · [GitHub 1.4.0 发布页](https://github.com/tiankongbushexian-crypto/WcSdAi-Desktop/releases/tag/v1.4.0) · [English](README.md)

## 1.4.0 内置更新

- 客户端发现新版后展示更新内容。点击“下载更新”，直接从 WcSdAi 官网下载安装包。
- 校验完成后，由你点击“安装并重启”。请先保存或清空未发送的草稿、等待任务结束，并关闭编辑器及正在使用的插件页面或远程连接。无法确认安全保存时，客户端会阻止安装并显示原因。
- 只下载不会安装。安装包仅处于缓存状态时，关闭窗口或正常退出客户端不会触发升级。

原有账号、计费、API 配置、个人模型参数和会话保留，之前版本的修复及任务验收、浏览器验证、独立工作副本能力继续保留。无需删除应用数据目录或重新填写 API 凭据。

三个平台安装包均对应源码 `6dfae19f0b5d12d96de4c810fa77a2175628eb4c`。实际原生验收、官网镜像与更新入口的状态见 [1.4.0 验证报告](releases/1.4.0-verification.md)。GitHub 发布回执不能代替官网可用性验证。

继续包含 Electron 43.8.3 及 1.1.1 的网络安全修复，不代表所有依赖安全公告均已解决。[1.1.1 验证报告](releases/1.1.1-verification.md)与[历史依赖审计](releases/1.1.1-dependencies.json)继续保留；历史审计不能作为一次新的 1.4.0 审计。

## 登录 WcSdAi 账号

1. 点击客户端侧栏底部的 WcSdAi 标志，选择“登录”。系统浏览器将打开 [api.90z.cn](https://api.90z.cn)。
2. 登录网站账号并授权当前设备。客户端安全保存凭据并完成账号同步后，浏览器显示登录成功并返回网站控制台。回到客户端即可使用账号允许的对话模型，无需填写 API 密钥和接口地址。
3. 点击头像可查看余额、可用模型、使用情况、充值入口与设置。充值时核对网站登录的账号；网站实际入账后，回到客户端点击“刷新账号”。

支付成功与实际入账是不同环节。模型使用遵循网站当前权限、余额或订阅额度及使用限制。客户端支持网站允许的对话模型、图片生成与编辑接口，其他媒体接口尚不支持。

原有自填密钥的 API 服务仍可独立使用。退出账号不会删除本地会话；可在网站设置中查看或撤销设备授权。

## 1.4.0 下载

请优先使用[官网下载页](https://api.90z.cn/download)。以下 GitHub 镜像链接为旧客户端和需要通过 GitHub 下载的用户保留。

<!-- RELEASE-ASSETS:START -->
| 平台 | 安装包 | SHA-256 |
| --- | --- | --- |
| macOS Apple 芯片（arm64） | [下载](https://github.com/tiankongbushexian-crypto/WcSdAi-Desktop/releases/download/v1.4.0/WcSdAi-1.4.0-macos-arm64-unsigned.dmg) | `69e3497131a77f529ca4bcc174acc5e9a4a9f1c2b21f55d5350123cf5976bdb4` |
| macOS Intel（x64） | [下载](https://github.com/tiankongbushexian-crypto/WcSdAi-Desktop/releases/download/v1.4.0/WcSdAi-1.4.0-macos-x64-unsigned.dmg) | `976d59d436d19a28a836a51e55712b08d71a4da9ab38fd84c1d3335c94fd903f` |
| Windows（x64） | [下载](https://github.com/tiankongbushexian-crypto/WcSdAi-Desktop/releases/download/v1.4.0/WcSdAi-1.4.0-windows-x64-unsigned.exe) | `be2062cea8c7f3e9055dc993e118954f358f6ac317ad090a82c94746173c55ab` |
<!-- RELEASE-ASSETS:END -->

[SHA256SUMS](https://github.com/tiankongbushexian-crypto/WcSdAi-Desktop/releases/download/v1.4.0/SHA256SUMS)覆盖所有安装包及归档文件。[发布元数据](releases/1.4.0.json)记录各文件的字节大小、校验值与对应源码提交。

这些是**未签名的团队安装包**。macOS 的临时完整性签名不是 Apple Developer ID 签名或公证；Windows 安装包没有发布者证书。请遵循操作系统和所在组织的安全策略。

## 对应源码与许可证

三个平台使用同一份精确源码。下表中的应用源码归档独立于私有开发仓库提供。

<!-- RELEASE-SOURCES:START -->
| 平台 | 对应源码 | 提交 | SHA-256 |
| --- | --- | --- | --- |
| macOS arm64、macOS x64、Windows x64 | [应用源码](https://github.com/tiankongbushexian-crypto/WcSdAi-Desktop/releases/download/v1.4.0/WcSdAi-1.4.0-source-6dfae19f0b5d.tar.gz) | `6dfae19f0b5d12d96de4c810fa77a2175628eb4c` | `16433774b76d7269127ed363b5939cd5a25440800e6fe7655c39b45e840182da` |
<!-- RELEASE-SOURCES:END -->

每个平台的完整 ZIP 包含安装包、匹配的源码、构建信息、校验文件和许可证声明；这些 ZIP 不是免安装便携版。

- [macos-arm64 完整发布归档](https://github.com/tiankongbushexian-crypto/WcSdAi-Desktop/releases/download/v1.4.0/WcSdAi-1.4.0-macos-arm64-unsigned.zip)
- [macos-x64 完整发布归档](https://github.com/tiankongbushexian-crypto/WcSdAi-Desktop/releases/download/v1.4.0/WcSdAi-1.4.0-macos-x64-unsigned.zip)
- [windows-x64 完整发布归档](https://github.com/tiankongbushexian-crypto/WcSdAi-Desktop/releases/download/v1.4.0/WcSdAi-1.4.0-windows-x64-unsigned.zip)

**GitHub 自动生成的“Source code (zip)”和“Source code (tar.gz)”只包含公开分发仓库的元数据。请下载上方明确命名的应用源码归档。**

WcSdAi 基于 [PI-Desktop](https://github.com/vastsa/PI-Desktop)。上游 LGPLv3、原始版权声明及第三方许可证继续有效。[LICENSE](LICENSE)、[NOTICE.md](NOTICE.md)、[THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) 和 [LICENSES/](LICENSES/) 均保留。声明中的历史应用源码路径请在对应源码归档内查阅。开发仓库私有化不影响接收者依许可证享有的权利。

## 已安装客户端与更新

**目前使用 1.3.2 或更早版本，需要先从[官网下载页](https://api.90z.cn/download)手动安装一次 1.4.0。** 仅修改服务器更新信息，无法给旧客户端增加安装能力。完成这一次升级后，后续适用版本即可在客户端内下载，并由你确认安装和重启。

| 当前安装方式 | 内置安装支持情况 |
| --- | --- |
| Mac Apple 芯片（arm64）或 Intel（x64） | 应用已正常安装，且当前账号对安装位置有写入权限；不要直接从 DMG 磁盘映像中运行。 |
| Windows x64，仅为当前用户安装 | 系统安装登记与当前运行的应用一致时支持，包括符合条件的自定义安装目录。 |
| Windows 为所有用户安装、便携版或无法确认的安装位置 | 从官网下载安装包，手动安装。 |

客户端在安装前验证更新信息的签名和安装包完整性。这里的更新签名**不等于 Apple Developer ID 公证或 Windows 发布者证书**，系统原有的安全检查仍然适用。

点击“安装并重启”后，请等待流程完成。若提示无法确认系统安装程序已安全取消，请勿强制关闭，并联系[技术支持](mailto:2222223323@qq.com)。Mac 在你已确认安装、系统安装程序准备就绪后，即使进程崩溃或被强制结束，也可能完成这次已授权安装；应用无法拦截系统强制终止。

请保留现有应用数据目录。官网继续提供首次升级、不支持内置安装时的下载和故障恢复入口；下载安装包无需登录账号或访问私有开发仓库。

公开仓库名称和旧版 `updates/stable.json` 路径保持不变。1.1.3 至 1.3.2 继续打开官网下载页；1.0.2 至 1.1.2 仍打开旧更新信息中的 GitHub 入口，手动升级后才会改变。1.0.1 需要手动升级。新版带签名的官网更新信息使用独立入口，不替换旧入口的格式。

[1.3.2 验证报告](releases/1.3.2-verification.md)、[1.3.1 验证报告](releases/1.3.1-verification.md)、[1.3.0 验证报告](releases/1.3.0-verification.md)、[1.2.0 验证报告](releases/1.2.0-verification.md)、[1.1.4 验证报告](releases/1.1.4-verification.md)、[1.1.3 验证报告](releases/1.1.3-verification.md)、[1.1.2 验证报告](releases/1.1.2-verification.md)、[1.1.1 验证报告](releases/1.1.1-verification.md)、[暂停发布的 1.1.0 记录](releases/1.1.0-verification.md)、历史校验文件及对应源码均保留。1.1.0 的暂停发布状态仍然有效。更早版本见[发布历史](https://github.com/tiankongbushexian-crypto/WcSdAi-Desktop/releases)。

[旧工作流入口](https://github.com/tiankongbushexian-crypto/WcSdAi-Desktop/actions/workflows/team-builds.yml)仅显示下载指引，不构建、安装或发布应用。

维护者：[tiankongbushexian-crypto](https://github.com/tiankongbushexian-crypto)；组织：量动科技。官网：<https://wanchuangsd.cn>；支持邮箱：<2222223323@qq.com>。

## 本地校验

运行 `node scripts/verify-distribution.mjs`。附加 `--assets /absolute/path/to/release-assets` 可核对暂存目录中确切的八个文件，并独立计算其中七个安装包和归档文件的哈希。
