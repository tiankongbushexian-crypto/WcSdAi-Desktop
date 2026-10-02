# Home welcome and motion review

Status: visual direction approved by the user on 2026-10-02. Both new logo
animations, all three text entrances, and randomized greeting presets were
approved after local preview. Remote publication is outside this review.

## Review surface

Run `node scripts/preview-wcsdai-home.mjs` from the request worktree, using the
existing desktop dependencies. Open
`http://127.0.0.1:18762/review/home-motion.html`. The server binds to loopback.
It does not connect to the host, load account credentials, or modify projects.
The preview imports the real `HomeWelcomeView`, `HomeMascotLogo`, and renderer
CSS. It is not a separately recreated animation. The production renderer build
has only `index.html` as its entry, so the review page is not an application route.

The review includes theme, scene, logo, text entrance, replay, greeting, pause,
reduced-motion, and center-guide controls. Review controls do not persist an
approval or change the installed application.

## Visual choices

- **Existing / Breathe** retains the existing black/white GIF and still pair.
- **A / Converge** moves the three original vector pieces gently along their
  own diagonal directions, then returns them to the canonical mark. The motion
  uses an 8.4-second cycle with a long settled hold.
- **B / Outline flow** traces the same three path contours in sequence before
  restoring their solid fills. The timing and monochrome theme are shared with
  A, but the geometry remains stationary.

The exact three paths are preserved from `build/wcsdai-symbol.svg`. The original
`translate(1.07885 1)` places their visible bounds around the 512px canvas center.
The 100px logo slot and heading share one center axis; no asymmetric heading
padding or punctuation-specific horizontal offset is applied. Text and logo can
be compared against the center guide. Decorative vectors are `aria-hidden`.

Text entrances are a small upward fade, staggered glyph entrance, and soft
focus-to-clear. Each plays once on entry; the headline does not rotate on a
timer while the user writes. Glyph animation exposes one uninterrupted hidden
accessible title and hides only the duplicate animated glyphs. A project title
uses a whole-line rise instead of splitting its real project-switcher button.
System reduced motion shows the entire headline and a still mark immediately.
The preview's pause control freezes vectors and substitutes the existing GIF's
still image because native GIF playback cannot be paused with CSS.

## Greeting lifecycle

Each empty, temporary, and project context has eight greeting entries. English,
Simplified Chinese, and Traditional Chinese have complete distinct sets. Other
shipped languages currently retain their existing translated greeting in each
entry; they do not fall back to English.

`ChatSurface` keys `HomeWelcome` by active session and context. The component
chooses once on mount. Unrelated renderer/store updates do not select another
headline or restart the text animation. A new empty session or window refresh
chooses a different greeting, logo motion, and text entrance from the previous
choice in that context. `sessionStorage` retains only three numeric option
indices per context; it stores no project names, paths, or conversation data.
If browser storage is unavailable, an in-memory choice retains same-renderer
non-repeat behavior. Project names remain the original `HomeProjectSwitcher`.

The composer, onboarding, conversation layout, transcript selection, and
permission/ask rules remain unchanged.

## Validation

- `node --test apps/desktop/test/home-welcome.test.mjs apps/desktop/test/renderer-branding.test.mjs apps/desktop/test/home-empty-layout.test.mjs apps/desktop/test/home-project-switcher.test.mjs apps/desktop/test/temporary-session-workspace.test.mjs`: 16 tests pass.
- `node scripts/check-style-tokens.mjs`: passes.
- `node scripts/e2e-home-welcome.mjs`: isolated Electron browser fixture with
  production `HomeWelcome` and CSS; covers repeated new-session entry, refresh,
  no reroll on unrelated render, retained input draft, clickable project control,
  system reduced motion, and the shared horizontal center. This does not start
  the desktop host or access the user's running application/profile.
- The component flow report is written to
  `.artifacts/wcsdai-updates-motion/home-welcome-flow.json`. It records the
  base/head commits and SHA-256 fingerprints of the tested source, including
  uncommitted candidate files. The fixture is built into a temporary static
  renderer before launch; it does not depend on development HMR timing.
- Desktop `tsc -p apps/desktop/tsconfig.json --noEmit` passes after workspace
  dependencies are built; i18n catalog tests pass (29 tests).

The user approved the local visual direction on 2026-10-02. This record does
not itself authorize a commit, push, remote merge, tag, or package publication.
Follow the root task's current delivery authorization for those actions.
