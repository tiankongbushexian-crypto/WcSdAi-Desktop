# Desktop build resources

`electron-runtime-notices.mjs` provides the shared electron-builder
`afterExtract` and `afterPack` hooks configured in `../package.json`.
The module stays inside this desktop package so direct native builder launches
can resolve it even when their detected workspace root is `apps/desktop`.

The extraction hook preserves the actual target Electron runtime's Chromium
notice in app resources before macOS deletes the original root copy. The final
hook requires that copy's SHA256 to match before signing or installer creation.
Missing, empty or changed notices fail every platform's packaging lane. The
hooks do not depend on a development Electron installation.
