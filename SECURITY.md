# WcSdAi Security Policy

WcSdAi is a local-first desktop application maintained by
[tiankongbushexian-crypto](https://github.com/tiankongbushexian-crypto) for
量动科技. It is based on [PI-Desktop](https://github.com/vastsa/PI-Desktop).

- Repository: <https://github.com/tiankongbushexian-crypto/WcSdAi-Desktop>
- Website: <https://wanchuangsd.cn>
- Security and support contact: <2222223323@qq.com>
- Copyright 2026 量动科技 for original WcSdAi contributions; see [NOTICE.md](NOTICE.md).

## Versions and Builds

The current WcSdAi development target is `1.0.1`. Include the exact version,
commit or build identifier when reporting an issue. Reproduce against the most
recent maintainer-provided team build, or the latest
[WcSdAi release](https://github.com/tiankongbushexian-crypto/WcSdAi-Desktop/releases)
when one is available. This link does not imply that a public release has been
published. Maintainers assess reports for older builds individually; this
policy does not promise a fixed support lifetime.

## Reporting a Vulnerability

**Please do not report security vulnerabilities through public GitHub issues,
pull requests, or discussions.**

Send a private report to **2222223323@qq.com** with the subject:

```text
[WcSdAi Security] <short description>
```

If private vulnerability reporting is enabled for the WcSdAi repository, you
may also use GitHub's private security advisory form:

<https://github.com/tiankongbushexian-crypto/WcSdAi-Desktop/security/advisories/new>

Please include as much of the following information as you can:

- A clear description of the vulnerability and its security impact.
- The affected WcSdAi version, operating system, and installation type.
- Reproduction steps or a minimal proof of concept using synthetic data.
- The affected component, feature, configuration, or extension boundary.
- Sanitized logs, screenshots, stack traces, or suggested remediation.

Remove API keys, access tokens, passwords, private source code, personal data,
and other sensitive information before sending a report. Do not test against
other users, access data that does not belong to you, or perform destructive
actions. This policy does not establish a bug bounty or promise a monetary
reward.

## Response and Disclosure

Reports are handled on a best-effort basis. No fixed acknowledgement,
assessment or resolution deadline is promised. Maintainers may request a
sanitized reproduction and coordinate remediation and disclosure with the
reporter. Reporter credit requires the reporter's permission.

Please allow reasonable time to investigate and prepare a fix before public
disclosure. Keep vulnerability details private during coordination and avoid
including credentials or other people's data in follow-up messages.

## Scope

Reports are in scope when they affect WcSdAi builds supplied by the
maintainers, release artifacts, Electron main or preload boundaries, the Rust
host core, the agent runtime, or the handling of credentials, permissions,
local files, plugins, MCP servers, or IPC/RPC messages.

Issues that affect only a third-party provider, model service, operating
system, dependency, or user-installed extension should also be reported to the
relevant maintainer. They remain in scope for WcSdAi if its integration
introduces an exploitable permission, sandbox, or credential-handling weakness.
Private team use does not disable these security boundaries.
