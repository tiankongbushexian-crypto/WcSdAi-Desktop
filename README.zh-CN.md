<div align="center">

<img src="docs/image/readme/logo.png" alt="WcSdAi" width="108" />

# WcSdAi

### 可拆卸的 AI Agent 桌面工作台

**把项目、Agent、模型、插件和工作流，装进一个长期可用的桌面环境。**

本地优先 · 模型自由 · 插件驱动 · macOS / Windows / Linux

<br />

[![Stars](https://img.shields.io/github/stars/tiankongbushexian-crypto/WcSdAi-Desktop?style=flat\&label=stars)](https://github.com/tiankongbushexian-crypto/WcSdAi-Desktop/stargazers)
[![CI](https://github.com/tiankongbushexian-crypto/WcSdAi-Desktop/actions/workflows/ci.yml/badge.svg)](https://github.com/tiankongbushexian-crypto/WcSdAi-Desktop/actions/workflows/ci.yml)
[![License](https://img.shields.io/badge/license-LGPL--3.0--or--later-black)](LICENSE)

<br />

**[团队安装包](https://github.com/tiankongbushexian-crypto/WcSdAi-Desktop/actions/workflows/team-builds.yml)** ·
[Releases](https://github.com/tiankongbushexian-crypto/WcSdAi-Desktop/releases) ·
[使用文档](docs/README.md) ·
[插件开发](docs/plugin-development.md) ·
[界面预览](docs/guide/screenshots.md) ·
[English](README.md)

<br />

<img src="docs/image/readme/home.webp" alt="WcSdAi" width="94%" />

<br />

**你的项目留在本地 · 你的模型由你选择 · 你的工作台由你组装**

</div>

## 团队下载

**当前发布线：1.0.x。目标版本：1.0.1；尚未发布 WcSdAi GitHub Release。**

WcSdAi — **让ai更简单** — 是面向团队使用的 AI 桌面工作台，由 **量动科技**的 **[tiankongbushexian-crypto](https://github.com/tiankongbushexian-crypto)** 维护。原创贡献版权：**Copyright 2026 量动科技**。官网：[wanchuangsd.cn](https://wanchuangsd.cn)；技术支持：[2222223323@qq.com](mailto:2222223323@qq.com)。

| 平台 | 下载入口 | 1.0.1 版本的 Actions artifact | ZIP 内的安装包 |
| --- | --- | --- | --- |
| macOS Apple Silicon（arm64） | [下载已验证安装包](https://github.com/tiankongbushexian-crypto/WcSdAi-Desktop/actions/runs/37018547778/artifacts/11231618108) | `WcSdAi-1.0.1-macos-arm64-unsigned` | `WcSdAi-1.0.1-macos-arm64-unsigned.dmg` |
| macOS Intel（x64） | [下载已验证安装包](https://github.com/tiankongbushexian-crypto/WcSdAi-Desktop/actions/runs/37018547778/artifacts/11232087687) | `WcSdAi-1.0.1-macos-x64-unsigned` | `WcSdAi-1.0.1-macos-x64-unsigned.dmg` |
| Windows（x64） | [下载已验证安装包](https://github.com/tiankongbushexian-crypto/WcSdAi-Desktop/actions/runs/37018547778/artifacts/11231329104) | `WcSdAi-1.0.1-windows-x64-unsigned` | `WcSdAi-1.0.1-windows-x64-unsigned.exe` |

**构建与下载状态：**三个安装包均已构建并可下载，来自成功的[原生构建运行 37018547778](https://github.com/tiankongbushexian-crypto/WcSdAi-Desktop/actions/runs/37018547778)，源码提交为 [`6dc7fc9ebc63`](https://github.com/tiankongbushexian-crypto/WcSdAi-Desktop/commit/6dc7fc9ebc63448f15a65b78542abe9505aabca3)。三个原生构建任务及桌面端类型检查均已通过。下载的 Apple Silicon 应用已通过两次隔离启动，并在重启后恢复全部 800 个测试 Session。Intel 和 Windows 的实际安装、升级仍待验证，构建通过不代表这些验证已完成。产物检查和验证范围见[团队验证报告](docs/wcsdai/team-verification.md)。

1. 登录 GitHub，使用对本仓库有读取权限的账号。
2. 点击上表对应平台的直接下载链接，或打开成功的运行，在运行摘要底部找到 **Artifacts**。
3. 下载对应平台的 artifact ZIP，解压后打开其中的 `.dmg` 或 `.exe` 安装包。ZIP 同时包含校验值、构建信息、对应源码和许可证声明。工作流将 Artifacts 保留 30 天。

团队安装包目前**未签名**：没有 macOS Developer ID 签名及公证，也没有 Windows 发布者签名。系统可能提示未知开发者或无法验证发布者；团队内部使用不会改变操作系统的安全要求。

[GitHub Releases 页面](https://github.com/tiankongbushexian-crypto/WcSdAi-Desktop/releases)是长期发布渠道，目前尚无 WcSdAi 发布版本。Linux 继续保留源码与构建配置支持，暂不在本次团队安装包矩阵中。

默认产品语言为简体中文，保留原有模型供应商配置、插件市场和技术包名。全新安装使用 `~/.wcsdai` 存放 Host 数据，Electron 配置目录名为 `WcSdAi`；已有 PI-Desktop 数据通过旧路径回退和迁移兼容别名保持可用。迁移现有数据前请阅读[数据迁移与兼容说明](docs/wcsdai/local-data-migration.md)。

[品牌迁移](docs/wcsdai/brand-migration.md) · [本机验证](docs/wcsdai/verification-report.md) · [发布清单](docs/wcsdai/release-checklist.md)

本文继承的 PI-Desktop 截图用于说明工作流，可能包含上游历史品牌，并非当前 WcSdAi 构建的截图。

---

## 为什么是 WcSdAi？

终端 Agent 擅长执行，IDE Agent 擅长嵌入编辑器。

WcSdAi 想做得更进一步：

> **给 AI Agent 一个独立、长期、可扩展的桌面工作空间。**

<table>
<tr>

<td width="25%" valign="top">

### 独立工作台

不依附某个 IDE 或 Terminal。

Project、Session、Review、Preview 与 Agent 都有自己的空间。

</td>

<td width="25%" valign="top">

### 插件驱动

插件扩展的不只是 Agent。

面板、视图、Widget、Tool、MCP、主题与后台服务都可以插件化。

</td>

<td width="25%" valign="top">

### Agent 编排

一个 Agent 不够，就拆开做。

Subagent 与 Worker Session 可以承担独立任务并行工作。

</td>

<td width="25%" valign="top">

### 模型自由

云端、本地、自建网关、Compatible API。

模型随时换，工作流不用换。

</td>

</tr>
</table>

<div align="center">

**它不是某个模型的壳，也不是某个 IDE 的插件。**

### 它是承载 Agent 工作流的桌面平台。

</div>

---

## 插件不是附加功能，而是工作台的一部分

WcSdAi 的 Core 负责提供稳定底座。

**真正属于你的工作流，由插件组合出来。**

<table>
<tr>

<td width="33%" valign="top">

### Agent

扩展 Agent 能力

**Agent Tools**
**Skills**
**Completion**
**pi Extensions**

</td>

<td width="33%" valign="top">

### Workspace

扩展整个桌面

**Commands**
**Panels**
**Work Panel Views**
**Floating Widgets**
**Themes**

</td>

<td width="33%" valign="top">

### Platform

扩展运行平台

**MCP Servers**
**Resident Services**
**Plugin Message Bus**

</td>

</tr>
</table>

插件不必只是“给 Agent 多加一个 Tool”。

它可以是一整个产品：

```text
Voice Agent
├── Floating Widget
├── Speech Service
├── Agent Tool
└── Commands

GitHub Workspace
├── Work Panel
├── MCP Server
├── Agent Tools
└── Background Service

Session Analytics
├── Dashboard
├── Commands
└── Workspace View
```

### 插件能做什么？

| 能力                  | 用途                  |
| ------------------- | ------------------- |
| **Command**         | 向全局命令系统添加操作         |
| **Panel**           | 创建独立插件界面            |
| **Floating Widget** | 创建语音球、状态窗、计时器等悬浮界面  |
| **Work Panel View** | 向右侧工作区加入新视图         |
| **Agent Tool**      | 注册 Agent 可调用工具      |
| **Completion**      | 调用用户已经配置的模型         |
| **Skill**           | 为 Agent 提供可复用能力与工作流 |
| **Theme**           | 修改工作台视觉             |
| **MCP Server**      | 接入本地或远程 MCP         |
| **Service**         | 运行常驻后台任务            |
| **Message Bus**     | 在插件之间传递消息           |

插件可以通过 `.piplug` 分发，也可以从插件市场安装。

<div align="center">

### [开发一个插件 →](docs/plugin-development.md)

</div>

---

## 一个底座，组装不同的工作流

```text
                         WcSdAi
                             │
          ┌──────────────────┼──────────────────┐
          │                  │                  │
        Agent            Workspace           Platform
          │                  │                  │
     Agent Tools           Panels              MCP
       Skills             Widgets            Services
     Subagents             Views            Message Bus
   pi Extensions          Themes
          │                  │                  │
          └──────────────────┼──────────────────┘
                             │
                       Your Workflow
```

WcSdAi 可以只是一个 Coding Agent。

也可以被组装成：

**AI 开发工作台 · Voice Agent · DevOps Console · GitHub Workspace · 数据分析助手 · 多 Agent 调度中心 · 自动化平台**

> **Core 提供底座，插件决定它最终长什么样。**

---

## 三种工作方式

<table>
<tr>

<td width="33%" valign="top">

### Agent

**你给任务，它直接做。**

读代码、改文件、跑命令、测试、持续迭代。

适合日常开发。

</td>

<td width="33%" valign="top">

### Plan

**它先给方案，你确认后再执行。**

先研究项目，再生成实施计划。

适合重构与高风险修改。

</td>

<td width="33%" valign="top">

### Goal

**你定义结果，它决定路径。**

锁定目标与验收条件，其余交给 Agent。

适合复杂与长期任务。

</td>

</tr>
</table>

高权限操作始终经过 WcSdAi 的 Permission Layer。

---

## 一个 Agent 不够，就拆开做

复杂任务不应该全部挤在一个 Context 里。

WcSdAi 提供两层任务拆分能力。

### Subagents

把独立工作交给后台 Agent：

**代码调查 · 独立实现 · 测试分析 · Research · Review**

每个 Subagent 拥有独立 Context，完成后将结果返回主 Agent。

### Session Orchestrator

需要更完整、更长期的并行任务时，可以继续拆成多个 Worker Session。

```text
Main Session
│
├── Worker A
│   └── Frontend
│
├── Worker B
│   └── Backend
│
├── Worker C
│   └── Tests
│
└── Worker D
    └── Review
```

Worker 是完整的 WcSdAi Session：

**独立 Context · 独立运行 · 可直接查看 · 可持续接受任务 · 保留完整 Transcript**

<table>
<tr>

<td width="50%">

<img src="docs/image/readme/session-orchestrator-overview.png" alt="Session Orchestrator" />

<p align="center"><sub>一个 Session 编排多个 Worker</sub></p>

</td>

<td width="50%">

<img src="docs/image/readme/session-orchestrator-worker.png" alt="Worker Session" />

<p align="center"><sub>每个 Worker 都是完整、可查看的 Session</sub></p>

</td>

</tr>
</table>

<div align="center">

**从「一个 Agent 帮我写代码」，走向「多个 Agent 分工完成任务」。**

</div>

---

## 为持续工作而设计

WcSdAi 围绕：

<div align="center">

### Project → Session → Agent → Work

</div>

而不是围绕一次性聊天窗口设计。

支持：

* 多 Project / 多 Session
* Pin / Archive / Branch / Search
* Agent 运行时继续 Queue Prompt
* 使用 `@` 引用项目文件
* Slash Commands
* Diff Review
* Command Output
* Work Panel
* Streaming Checkpoint
* 异常后尽可能恢复任务现场

**Session 可以跨多次启动持续工作。**

---

## 看见 Agent 在做什么

<table>
<tr>

<td width="50%">

<img src="docs/image/readme/chat_en.png" alt="WcSdAi Session" />

<p align="center"><sub>长期 Session，而不是一次性对话</sub></p>

</td>

<td width="50%">

<img src="docs/image/readme/model_en.png" alt="WcSdAi Model" />

<p align="center"><sub>在 Session 中直接切换模型与推理等级</sub></p>

</td>

</tr>

<tr>

<td width="50%">

<img src="docs/image/readme/plugins_en.png" alt="WcSdAi Plugins" />

<p align="center"><sub>插件市场：扩展 Agent，也扩展整个桌面</sub></p>

</td>

<td width="50%">

<img src="docs/image/readme/addmodel_en.png" alt="WcSdAi Providers" />

<p align="center"><sub>连接 Provider、Gateway 或本地模型</sub></p>

</td>

</tr>
</table>

<div align="center">

**[查看更多界面 →](docs/guide/screenshots.md)**

</div>

---

## 模型可以换，工作流不用换

WcSdAi 不把 Agent 工作流绑定到某一家模型厂商。

支持：

**OpenAI · Anthropic · OpenAI Compatible API · 自建 Gateway · Ollama · LM Studio · Local Model**

每个模型都可以独立配置：

**Provider · Model ID · Context Window · 最大输出 · Reasoning / Thinking · Temperature · OAuth · API Key · Endpoint**

不同 Session 可以使用不同模型。

同一个 Session 也可以随时切换。

```text
Planning     → Model A
Coding       → Model B
Review       → Model C
Private Task → Local Model
```

> **模型是可以替换的组件，而不是工作流本身。**

---

## 已经在用其他 Coding Agent？

已有工作不需要从零开始。

WcSdAi 可以导入本地 Session：

**Claude Code · Codex · OpenCode · Pi**

---

## Local-first

WcSdAi 不要求你把开发环境搬到我们的云端。

| 数据                   | 默认行为               |
| -------------------- | ------------------ |
| Project              | 本地                 |
| Session              | 本地                 |
| Settings             | 本地                 |
| Logs                 | 本地                 |
| API Credentials      | 本地加密凭据存储           |
| WcSdAi Telemetry | 无                  |
| Model Request        | 直接发送到你配置的 Provider |

**无需 WcSdAi 账号。**

**无需经过 WcSdAi 云端 Relay。**

使用远程模型时，请求所需 Context 会直接发送给对应 Provider。

---

## 权限属于你

Agent 可以读取文件、修改代码、运行命令、调用 Tool、使用扩展和委派任务。

高权限操作仍然经过 Permission Layer：

```text
Agent
  ↓
Tool Request
  ↓
Permission Layer
  ↓
Allow / Ask / Deny
  ↓
Execution
```

**你决定每个 Session 拥有多少自主权。**

---

## 开始使用

<table>
<tr>

<td width="25%" valign="top">

### 01

**下载**

安装 WcSdAi

</td>

<td width="25%" valign="top">

### 02

**连接模型**

配置 Provider

</td>

<td width="25%" valign="top">

### 03

**打开项目**

选择本地 Repository

</td>

<td width="25%" valign="top">

### 04

**开始工作**

Agent / Plan / Goal

</td>

</tr>
</table>

<div align="center">

### [WcSdAi 团队安装包 →](https://github.com/tiankongbushexian-crypto/WcSdAi-Desktop/actions/workflows/team-builds.yml)

**macOS Apple Silicon · macOS Intel · Windows x64**

</div>

当前可用情况、artifact 名称和下载步骤见[团队下载](#团队下载)。手动团队工作流构建未签名的 macOS `.dmg` 和 Windows NSIS `.exe` 安装包，不会创建 GitHub Release 或配置自动更新。

Linux 源码构建仍保留 `.AppImage`、`.deb`、`.rpm` 和 `.asar` 打包目标；本工作流不提供 Linux 团队 artifact。

<details>
<summary><strong>Linux Compatibility</strong></summary>

<br />

Linux 软件包（x64 与 arm64）需要 **glibc 2.35+**。

常见支持版本：

* Ubuntu 22.04+
* Debian 12+
* Fedora 36+

检查当前版本：

```bash
ldd --version
```

</details>

---

## Built on Pi

WcSdAi 构建在 [pi](https://github.com/badlogic/pi-mono) 生态之上。

Agent Runtime 使用：

* `pi-ai`
* `pi-agent-core`

> **Pi 提供 Agent Engine，WcSdAi 在其上构建 Desktop Workspace、Session、权限、插件与 Agent 编排。**

---

## 开发者

WcSdAi 也可以作为开发者构建 Agent 产品的宿主平台。

你可以开发：

**Plugin · MCP Server · Skill · Agent Tool · pi Extension · Theme · Panel · Floating Widget · Background Service**

### 插件快速开始

内置模板：

* `panel-basic`
* `agent-tool-basic`
* `skill-pack`
* `full-demo`

创建完成后即可作为 Development Plugin 加载。

**[Plugin Development Guide →](docs/plugin-development.md)**

### 从源码运行

<details>
<summary><strong>Development Setup</strong></summary>

<br />

#### Requirements

* Node.js `>=22.19`
* pnpm `12.8.1` (see `packageManager` in `package.json`)
* Stable Rust Toolchain

#### Start

```bash
# Use the existing checkout; do not clone or reinstall for a task worktree.
cd WcSdAi-Desktop

# A clean, unprovisioned checkout only: pnpm install --frozen-lockfile

cargo build -p host-core
pnpm build:js

pnpm dev
```

#### Validate

```bash
pnpm typecheck
pnpm lint
pnpm test
```

</details>

### 文档

[Documentation](docs/README.md) ·
[Architecture](docs/spec/02-architecture/01-architecture.md) ·
[Specification](docs/spec/README.md) ·
[Plugin Development](docs/plugin-development.md) ·
[E2E Test Plan](docs/spec/06-delivery/04-e2e-test-plan.md) ·
[Release Runbook](docs/spec/06-delivery/06-release-runbook.md) ·
[AGENTS.md](AGENTS.md)

---

## Contributing

欢迎：

**Issues · Pull Requests · Plugins · Skills · MCP Integrations · Documentation · Translations**

对于相对独立的新能力，优先考虑一个问题：

> **它是否更适合作为一个 Plugin？**

让 Core 保持克制，让生态持续生长。

**[提交 Issue](https://github.com/tiankongbushexian-crypto/WcSdAi-Desktop/issues/new/choose)** ·
[查看 Issues](https://github.com/tiankongbushexian-crypto/WcSdAi-Desktop/issues) ·
[开发插件](docs/plugin-development.md)

---


## 友情链接

[Linux.Do](https://linux.do/) — 新的理想型社区

---

## 上游项目致谢

以下开发致谢和 Token 使用量属于原始 PI-Desktop 项目，不代表本 fork 的开发用量。

> **Not by a lone genius, but by a token-powered construction crew.**

PI-Desktop 的开发过程中使用了来自多个 Provider 的模型。

累计模型使用量已超过 **27 Billion Tokens**。

感谢参与构建 PI-Desktop 的每一位贡献者，以及陪我们一起写下这些代码的模型。

---

## License

WcSdAi 基于 [PI-Desktop](https://github.com/vastsa/PI-Desktop) 的 `v0.16.0` 版本 fork。PI-Desktop 使用 **GNU Lesser General Public License v3.0**，Cargo workspace 标注为 `LGPL-3.0-or-later`。WcSdAi 保留 [LICENSE](LICENSE) 和 [LICENSES/LGPL-3.0.txt](LICENSES/LGPL-3.0.txt) 中的原始 LGPL 许可正文、上游版权声明及第三方归属。上游代码及其修改部分依照适用的 LGPLv3 要求提供；独立新增模块和第三方依赖按照各自明确的许可证处理，品牌改造不会改变上游代码的许可证。

Copyright 2026 量动科技 仅适用于量动科技原创的 WcSdAi 贡献。详见 [NOTICE](NOTICE.md)、[第三方声明](THIRD_PARTY_NOTICES.md)、[许可证原文](LICENSES/components/README.md) 和 [合规计划](docs/wcsdai/licensing-compliance.md)。发布二进制包前必须按适用条款提供对应修改源码、构建说明、第三方声明及必要的安装或重新链接材料。团队内分发同样遵循这些许可要求；每个平台的团队 artifact 都附带对应构建的源码归档和声明。GitHub Releases 将在另行确认发布后提供。

---

<div align="center">

<img src="docs/image/readme/logo.png" alt="WcSdAi" width="72" />

## WcSdAi

### Build your own Agent workspace.

**你的模型 · 你的 Agent · 你的插件 · 你的工作台**

<br />

**[团队安装包](https://github.com/tiankongbushexian-crypto/WcSdAi-Desktop/actions/workflows/team-builds.yml)** ·
[Releases](https://github.com/tiankongbushexian-crypto/WcSdAi-Desktop/releases) ·
[Documentation](docs/README.md) ·
[Build a Plugin](docs/plugin-development.md)

<br /><br />

<sub>Local-first · Model-agnostic · Plugin-powered</sub>

</div>
