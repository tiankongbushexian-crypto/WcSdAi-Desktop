# ADR 0317: Preserve Windows resizing without the native frameless rim

- Status: Accepted
- Date: 2026-09-29
- Deciders: PI-Desktop maintainers
- Related: D635, D637, E2E-167, ADR 0025, ADR 0248

## Context

Electron 43 paints a visible region on the left, bottom, and right of a
frameless, resizable Windows window with the default thick frame. The renderer
cannot paint into that native area. Disabling `WS_THICKFRAME` removes the rim
and window animations. Although Electron's public option description warns of
losing edge dragging, the pinned Electron 43.6 frameless hit test still handles
native edge and corner resizing. The application requires its existing minimum
size, settled bounds persistence, and separate work-panel resize ownership to
remain intact.

## Decision

Disable the Windows thick frame on the main window only. Retain Electron's
native frameless edge/corner hit testing and the current minimum-size contract;
the renderer adds no resize handles or geometry IPC. Qualify this against the
pinned Electron version with real native edge/corner drags and minimum-size
checks, since the public option description is more restrictive than the
observed implementation.

macOS and Linux keep native edge resizing. Work-panel width remains a separate
renderer-owned interaction; the window resize changes only application bounds.
Electron's `thickFrame: false` fullscreen path changes display bounds without
setting the value returned by `isFullScreen()`. Main tracks this fallback so
fullscreen toggles, renderer events, and persisted normal bounds remain correct.

Apply a native 12 DIP rounded shape (WcSdAi amendment below) to the Windows main window. Electron's
`setShape` removes both drawing and pointer hit testing outside its rectangles,
so the corner cutouts have no opaque fill while the existing native background
colour remains theme-owned inside the window. Main reapplies the shape on
resize, and makes it rectangular while maximized or fullscreen. A plugin with
`ui.window.appearance` may declare an integer `cornerRadius` from 0 to 24 DIP
alongside its background colours. The selected theme supplies it through the
existing window-appearance IPC; removing the theme restores 12 DIP. Main validates
the value and the calling renderer before changing the native shape.

## Alternatives

- Keep the thick frame: leaves the visible rim.
- Make the window transparent: changes the opaque background and theme
  contract without removing the need to qualify native resizing.
- Use only renderer CSS rounding: leaves the opaque native background visible
  in the corners and cannot change the window's native hit region.
- Pin an older Electron: trades away newer security and runtime fixes for a
  historical rendering behavior.
- Wait for an upstream Electron fix: does not resolve the current UI defect.

## Consequences

- The Windows main window has no painted left, bottom, or right native rim.
- Native edge resizing and minimum size remain owned by Electron on every
  platform; there is no parallel renderer/Main resize path.
- Windows native shadow, minimize/maximize animation, and snap behavior may
  differ with `WS_THICKFRAME` removed. They require native qualification before
  landing; the application must not claim parity without that check.
- The native shadow cannot be made theme-configurable through Electron while
  this thick-frame-free window retains its current bounds. An external CSS
  shadow would need transparent window margin or a companion surface, changing
  window geometry and lifecycle; this decision does not add a shadow setting.
- `setShape` is an experimental Electron API and its pixel-row curve is not
  anti-aliased by Windows. Native corner hit testing is qualified on the target
  Electron version rather than assumed from CSS.
- The Plugin SDK gains one optional, permission-gated appearance property. Old
  manifests remain valid. No host RPC, database schema, or persisted format
  changes.

## WcSdAi 1.0.5 visual amendment (2026-10-16)

The owner reported that the 4 DIP cutouts looked square and the light window
merged into white windows behind it. The fork changes the shared default to
12 DIP and draws a theme-aware 1px inside perimeter, following the authorized
theme's radius. The perimeter is pointer-transparent, reserves no layout space,
and is absent while maximized/fullscreen. Removing a theme now restores 12 DIP.

This keeps the same native shape, hit-test, opaque background, permission and
geometry ownership. No transparent margins, companion shadow windows or custom
resize handles are introduced. Native-region checks and renderer interaction
checks are recorded separately from Windows visual/device acceptance.

The existing Electron-only `window/control` response also supplies read-only
`fullScreen` and `zoomFactor` fields from Main. This avoids estimating page
zoom from display DPI and recovers fullscreen state when a renderer reload
misses the initial event. The renderer compensates the perimeter's CSS geometry
using that zoom, rejects stale state responses and disposes its subscriptions.
Existing action inputs and consumers of `maximized` remain compatible; Host RPC,
plugin appearance permissions and persisted data do not change.
