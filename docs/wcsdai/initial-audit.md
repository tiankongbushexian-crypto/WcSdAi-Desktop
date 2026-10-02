# WcSdAi initial audit

Audit date: 2026-10-02 (Asia/Shanghai). Baseline: PI-Desktop v0.16.0,
commit `22dfb87a84056127fad07617e8d06974f927bebc`.

## Repository state

The primary checkout started clean on `main`. Origin is
`https://github.com/tiankongbushexian-crypto/WcSdAi-Desktop.git`; upstream is
`https://github.com/vastsa/PI-Desktop.git`. No clone or initialization was run.
The task uses branch `codex/wcsdai-brand-foundation` and its dedicated sibling
worktree. No commit, push, tag, release, deployment, or server login is authorized
by this task. User-provided server credentials are not needed or recorded.

## Directory and ownership map

```text
apps/
  desktop/
    src/                  React renderer, components, pages, stores, styles
    electron/main/        Thin Electron orchestration, updater, native integration
    electron/preload/     Sandboxed IPC bridge
    build/                Platform icons, DMG artwork, entitlements
    resources/            Built-in plugins and skills
    test/                 Desktop unit, interaction, contract and E2E fixtures
  pi-host/                Headless remote host distribution
crates/host-core/          Rust host, SQLite, authoritative state and native tools
packages/
  shared/                 Cross-boundary contracts, version, changelog
  i18n/                   Nine shipped locale catalogs
  agent-runtime/          Pi agent execution sidecar
  agent-host/             Admission, permissions, queues and host events
  host-runtime/           Process supervision and transports
  racp/                   Remote protocol transport
  plugin-sdk/             Extension contract
  plugin-devkit/          Plugin development CLI
  voice-runtime/          Voice services
examples/plugins/         Example extension source
scripts/                  Build/release tools and isolated E2E harnesses
.github/workflows/        CI, documentation, release and Linux packaging
 docs/spec/               Product, architecture, runtime, UX, security, delivery
 docs/adr/                Architectural decisions
 docs/wcsdai/             Fork audit, mapping, branding, compliance and delivery
```

## Toolchain and build surfaces

Electron 43, React 19, TypeScript 5.9, Vite 7 / electron-vite 4, Tailwind 4,
Zustand, i18next, Rust 2021, SQLite and pi-ai / pi-agent-core 0.99.1.
Observed host: macOS 26.5 arm64, Node 22.23.3, pnpm 12.8.1,
Rust/Cargo 1.98.1. The release CI intentionally uses Node 24 to match Electron.

`package.json` fans out to 13 pnpm workspaces; `pnpm-workspace.yaml` pins Pi
patches and existing supply-chain overrides. `Cargo.toml` has one workspace
member, host-core. `apps/desktop/package.json` embeds electron-builder config.
`electron.vite.config.ts` bundles main/preload/renderer. Version surfaces are
synchronized by `scripts/release.mjs`; it must not be run with `--tag` here.

| Command | Existing purpose / task treatment |
|---|---|
| `pnpm install --frozen-lockfile` | Already provisioned; intentionally not rerun. Reuse host dependencies. |
| `pnpm typecheck` | Builds workspaces, then workspace typechecks. |
| `pnpm lint` | Biome and workspace style-token checks. |
| `pnpm test` | JS build, workspace tests and Rust tests. |
| `cargo check --locked` | Rust compile analysis. |
| `cargo build -p host-core --locked` | Local Rust host binary. |
| `pnpm build:js` | All JS packages including renderer. |
| `pnpm dev` | Branded Electron development launcher. Use isolated profiles. |
| `pnpm test:e2e:boot` / `pnpm test:e2e` | Electron boot and host protocol smoke. |
| `pnpm check:release-docs` / `pnpm check:agent-policy` | Release metadata / policy consistency. |

See verification-report.md for actual outputs and final results; prior user
reports of successful setup are context, not checks independently rerun here.

## Baseline brand search

Counts below are tracked files containing each case-insensitive string at the
baseline; overlaps are intentional and the dependency lockfile is excluded.

| String | Matching files |
|---|---|
| `PI-Desktop` | 1171 |
| `PI Desktop` | 5 |
| `pi-desktop` | 1171 |
| `pi desktop` | 5 |
| `AIUO` | 33 |
| `vastsa` | 52 |
| `net.aiuo.pi-desktop` | 18 |

| Category | Existing value / treatment |
|---|---|
| Visible product | PI-Desktop in shared APP_NAME, renderer catalogs, menus and native text → WcSdAi |
| Root slug | pi-desktop → wcsdai |
| Technical names | @pi-desktop/*, pi-ai, pi-agent-core, pi-host, host-core → preserve |
| IPC/RPC and formats | pi-desktop/* channels, .piplug, .pi, config provenance → preserve |
| Native identity | net.aiuo.pi-desktop / .dev → com.example.wcsdai / .dev |
| Installers | PI-Desktop*, pi-desktop deb/rpm/desktop entry → WcSdAi / wcsdai |
| Data | ~/.pi-desktop, ~/.pi-desktop-dev, Electron PI-Desktop profiles → preserve |
| Upstream attribution | vastsa / PI-Desktop / LGPL → preserve as provenance |
| Market | AIUO-Net marketplace/catalog and extension IDs → preserve |
| Feedback | vastsa/PI-Desktop → fork repository |
| Updates | upstream GitHub feed → pending fork release configuration; never upstream auto-install |
| Assets | build/icon*, logo_dark, renderer brand PNG and home mascot → supplied monochrome WcSdAi vector |

## License and third-party status

Root LICENSE is LGPLv3; Cargo workspace declares LGPL-3.0-or-later. Preserve
original license bytes and upstream history. Dependency license metadata,
Electron/Chromium notices, built-in plugin provenance, examples, MCP, fonts,
images and supplied artwork require an evidence-backed inventory, maintained
in licensing-compliance.md and THIRD_PARTY_NOTICES.md. Unknown terms and
unverified artwork ownership remain release blockers, not inferred permissions.

## Findings and execution choices

- Direct brand/copy/config edits fit existing architecture; no agent runtime,
  provider protocol, permissions or SQLite schema redesign is justified.
- APP_NAME currently determines Electron userData; explicit legacy profile names
  are necessary before changing display name to avoid losing apparent state.
- Native app IDs change installation identity; in-place upstream installer
  replacement is not promised. Existing host data formats remain unchanged.
- Upstream macOS signing identity is hardcoded; replace with required operator
  configuration. No signing secrets are supplied or required for local checks.
- Default UI language changes to Simplified Chinese; explicit saved languages
  and explicit Auto remain respected. Do not rewrite session timestamps or
  scheduler timezones merely to express Beijing as the brand operating timezone.
- Delivery R2 says commit every change, contrary to AGENTS.md §17 (commit only
  when asked). Follow AGENTS.md and synchronize conflicting delivery text.
- pnpm 12 auto dependency verification initially rejected linked .pnpm and
  mutable task-state links. This is a worktree environment issue, not a brand
  regression. Use a real task-state directory and per-run dependency-check
  override when reusing the verified store; never weaken CI installation.

## Pending information

Confirmed support email: `2222223323@qq.com`. Pending: final production Bundle
ID approval (`com.example.wcsdai` is the requested placeholder), update/download
endpoint, signing identities/certificates, published policy URLs and legal
review, supplied artwork rights and unresolved third-party licenses. Server
access and deployment are outside this local task.

## Execution order

1. Record brand mapping and compatibility invariants.
2. Change the smallest display/locale surface and test it.
3. Apply monochrome assets, native identity, packaging and fork links.
4. Verify storage profiles, permissions and representative project/session path.
5. Complete license inventory, packaged notices and legal drafts.
6. Build, typecheck, lint, tests and isolated Electron/host E2E.
7. Inspect local package, document results and unresolved release gates.
