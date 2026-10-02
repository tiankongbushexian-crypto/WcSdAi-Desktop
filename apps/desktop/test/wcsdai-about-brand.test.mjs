import assert from "node:assert/strict";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createInstance } from "i18next";
import { I18nextProvider } from "react-i18next";
import { catalogs } from "@pi-desktop/i18n";
import { createServer } from "vite";

// Exercise the actual Settings destination and its shared components. No host
// writes or external requests are needed to display attribution and support.
test("Settings Info exposes WcSdAi identity, support and retained upstream license", async (t) => {
  const previousWindow = globalThis.window;
  globalThis.window = { piDesktop: { platform: "darwin" } };
  t.after(() => {
    if (previousWindow === undefined) delete globalThis.window;
    else globalThis.window = previousWindow;
  });
  const server = await createServer({
    root: fileURLToPath(new URL("..", import.meta.url)),
    configFile: false,
    server: { middlewareMode: true, hmr: false, ws: false },
    esbuild: { jsx: "automatic" },
    appType: "custom",
    optimizeDeps: { noDiscovery: true, include: [] },
  });
  try {
    const { SettingsPage } = await server.ssrLoadModule("/src/features/settings/SettingsPage.tsx");
    const { useAppStore } = await server.ssrLoadModule("/src/stores/app-store.ts");
    Object.assign(useAppStore.getInitialState(), {
      settingsTab: "about",
      settings: { language: "zh-CN", developerMode: false },
      settingsBootstrapStatus: "ready",
      version: { name: "WcSdAi", version: "1.0.1", protocolVersion: 11, hostVersion: "1.0.1" },
    });
    const i18n = createInstance();
    for (const [locale, catalog] of Object.entries(catalogs)) {
      await i18n.init({ lng: locale, resources: { [locale]: { translation: catalog } } });
      const html = renderToStaticMarkup(createElement(I18nextProvider, { i18n }, createElement(SettingsPage)));
      assert.ok(html.includes(catalog.brand.aboutTitle), locale);
      assert.match(html, /WcSdAi/);
      assert.match(html, /1\.0\.1/);
      assert.match(html, /Copyright 2026 量动科技/);
      assert.match(html, /PI-Desktop/);
      assert.match(html, /GNU LGPL v3\.0/);
      assert.match(html, /2222223323@qq\.com/);
      assert.match(html, /href="https:\/\/wanchuangsd\.cn"/);
      assert.match(html, /href="https:\/\/github\.com\/tiankongbushexian-crypto\/WcSdAi-Desktop"/);
    }
  } finally {
    await server.close();
  }
});
