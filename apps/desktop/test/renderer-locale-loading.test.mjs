import assert from "node:assert/strict";
import i18n from "i18next";
import test from "node:test";
import { catalogs, flattenCatalog } from "@pi-desktop/i18n";
import { applyAppLanguage, resolveAppLanguage } from "../src/lib/renderer-language.ts";
import {
  loadRendererCatalog,
  loadRendererResources,
} from "../src/lib/renderer-catalogs.ts";

test("renderer locale resources load English fallback and the selected catalog", async () => {
  const resources = await loadRendererResources("zh-CN");

  assert.equal(
    resources.en.translation["app.starting"],
    catalogs.en.app.starting,
  );
  assert.equal(
    resources["zh-CN"].translation["app.starting"],
    catalogs["zh-CN"].app.starting,
  );
  assert.deepEqual(await loadRendererCatalog("zh-CN"), catalogs["zh-CN"]);
});

test("changing the renderer language loads its catalog before switching", async (t) => {
  const previousDocument = globalThis.document;
  globalThis.document = { documentElement: { lang: "en" } };
  t.after(() => {
    if (previousDocument === undefined) delete globalThis.document;
    else globalThis.document = previousDocument;
  });

  await i18n.init({
    lng: "en",
    fallbackLng: "en",
    resources: {
      en: { translation: flattenCatalog(catalogs.en) },
    },
    interpolation: { escapeValue: false },
  });

  await applyAppLanguage("zh-CN");

  assert.equal(i18n.language, "zh-CN");
  assert.equal(i18n.t("app.starting"), catalogs["zh-CN"].app.starting);
  assert.equal(globalThis.document.documentElement.lang, "zh-CN");
});


test("WcSdAi defaults to Simplified Chinese and preserves explicit language preferences", async (t) => {
  const previousWindow = globalThis.window;
  const previousDocument = globalThis.document;
  globalThis.window = { piDesktop: { locale: "de-DE" } };
  globalThis.document = { documentElement: { lang: "en" } };
  t.after(() => {
    if (previousWindow === undefined) delete globalThis.window;
    else globalThis.window = previousWindow;
    if (previousDocument === undefined) delete globalThis.document;
    else globalThis.document = previousDocument;
  });

  assert.equal(resolveAppLanguage(undefined), "zh-CN");
  assert.equal(resolveAppLanguage("auto"), "de");
  assert.equal(resolveAppLanguage("en"), "en");
  assert.equal(resolveAppLanguage("zh-TW"), "zh-TW");

  await applyAppLanguage(undefined);
  assert.equal(i18n.language, "zh-CN");
  assert.equal(i18n.t("app.starting"), "正在启动 WcSdAi…");
  await applyAppLanguage("en");
  assert.equal(i18n.t("app.starting"), "Starting WcSdAi…");
  await applyAppLanguage("auto");
  assert.equal(i18n.language, "de");
  assert.equal(globalThis.document.documentElement.lang, "de");
});
