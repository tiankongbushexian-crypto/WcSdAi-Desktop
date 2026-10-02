# WcSdAi brand reference

| Field | Value |
|---|---|
| Product / full name / short name | WcSdAi |
| Slug | wcsdai |
| Repository directory | WcSdAi-Desktop |
| Version | 1.0.2; verified macOS arm64/x64 and Windows x64 team installers available |
| Slogan | 让 AI 更简单 (Make AI simpler) |
| Organization / copyright owner | 量动科技 |
| Copyright | Copyright 2026 量动科技; upstream and third-party rights retained |
| Website | https://wanchuangsd.cn (provided by owner; deployment not part of this task) |
| Support | 2222223323@qq.com (explicitly confirmed) |
| Owner | tiankongbushexian-crypto |
| Source | https://github.com/tiankongbushexian-crypto/WcSdAi-Desktop |
| Upstream | https://github.com/vastsa/PI-Desktop, v0.16.0 |
| Default UI language | Simplified Chinese (zh-CN) when no setting exists |
| Operating timezone | Asia/Shanghai (Beijing); documentation/release dates use this zone |
| Runtime timezones | Existing OS/user/schedule timezone behavior retained; no clock or stored timestamp rewrite |
| Models / API endpoint / marketplace | Original provider configuration, Pi catalog and marketplace retained |
| Telemetry | Existing implementation/settings retained; no new collection endpoint |
| macOS Bundle ID | com.example.wcsdai; development com.example.wcsdai.dev |
| Windows AppUserModelId | com.example.wcsdai |
| Linux executable / desktop entry | wcsdai / wcsdai.desktop |
| Platforms | macOS arm64 + x64; Windows x64; Linux x64 + arm64 |
| Current distribution | Unsigned internal-team packages through the manual WcSdAi Team Installers workflow; verified 1.0.2 native builds available from run 37031890473 |
| Optional later release channel | GitHub Releases, pending explicit publication |
| Download / update URL | README links verified Actions artifacts. Packaged 1.0.2 checks the fixed GitHub `updates/stable.json` manifest for notifications; automatic installation remains disabled. |
| Privacy / terms / user agreement | Local [drafts](legal/README.md); public URLs pending |

## About text

WcSdAi — Make AI simpler. Copyright 2026 量动科技. Based on PI-Desktop,
licensed under GNU LGPL v3.0; upstream and third-party notices are retained.
The Info page links the fork source and displays website/support contacts.

## Asset rules

Use the owner-supplied WcSdAi symbol geometry, normalized to pure black or
white. The application tile is white with rounded corners and transparent
padding; tray and in-app marks use black/white for their theme. Neutral
backgrounds and edge antialiasing do not introduce brand hues. Historical
upstream screenshots are labeled reference material, not current screenshots.

The canonical vector is `apps/desktop/build/wcsdai-symbol.svg`. Generated files
and original source hash are listed in `apps/desktop/build/brand-assets.json`.
Run `python3 scripts/make-icon.py` with existing Pillow and Node sharp available
(`NODE_PATH` may point at the bundled workspace library); no install is needed
for routine application builds because generated assets are checked in.
`python3 scripts/make-dmg-background.py` regenerates DMG art.
Supplied-logo license/trademark authority needs confirmation before release.

## Compatibility

Electron internal `app.getName()` remains `PI-Desktop` solely for the existing
OS-encryption identity. Menus, About, windows, notifications and bundles use
WcSdAi explicitly. New installations use `WcSdAi` / `WcSdAi Dev` userData and
`~/.wcsdai` / `~/.wcsdai-dev` Host roots. Existing unmigrated installations
continue using their legacy directory when the corresponding new root is absent.
After an explicitly authorized physical move, Electron selects the new profile;
Host keeps the legacy logical root when its symlink resolves to that exact new
physical directory, preserving historical paths and permission/fork behavior.
An independent old directory does not override an existing new Host root.
The resolver selects paths only; it never migrates or merges data automatically.
See [local data migration](local-data-migration.md) for backup, validation,
compatibility aliases and rollback.

Explicit data/userData overrides still win. Technical packages, IPC, Host SQLite
schema **21** (`crates/host-core/src/db.rs`), protocol **11**, plugin IDs and
formats remain unchanged. The shared `SCHEMA_VERSION = 16` constant is a
separate metadata surface and does not describe the current Host database.
Native IDs identify a separate app; installer upgrade/uninstall and OS-protected
credential access must be tested on each target. The owner chose unsigned
team packages, so signing credentials are not a current prerequisite. If signed
public distribution is later selected, qualify that distinct signed artifact.
See [team distribution](team-distribution.md) and the [1.0.2 verification report](1.0.2-verification.md).
