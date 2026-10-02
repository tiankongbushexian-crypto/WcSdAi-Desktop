import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createServer } from "vite";
import { createInstance } from "i18next";
import { I18nextProvider } from "react-i18next";
import { chooseNextIndex, chooseHomeWelcome, previousHomeWelcome, rememberHomeWelcome } from "../src/lib/home-welcome.ts";

test("new greetings and motion choices skip the immediately previous choice for every random bucket", () => {
  for (const count of [3, 8]) for (let previous = 0; previous < count; previous++) {
    const observed = new Set();
    for (let bucket = 0; bucket < count - 1; bucket++) {
      const next = chooseNextIndex(count, previous, () => (bucket + .5) / (count - 1));
      assert.notEqual(next, previous);
      assert.ok(next >= 0 && next < count);
      observed.add(next);
    }
    assert.equal(observed.size, count - 1);
  }
  assert.equal(chooseNextIndex(1, 0), 0);
  assert.throws(() => chooseNextIndex(0), RangeError);
  assert.deepEqual(chooseHomeWelcome({ greeting: 0, logo: 0, text: 0 }, () => 0), { greeting: 1, logo: 1, text: 1 });
});

test("refresh history survives browser storage and degrades safely when storage is blocked", () => {
  const storage = new Map();
  const previous = globalThis.sessionStorage;
  globalThis.sessionStorage = { getItem: key => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, value) };
  try {
    const choice = { greeting: 2, logo: 1, text: 0 };
    rememberHomeWelcome("temporary", choice);
    assert.deepEqual(previousHomeWelcome("temporary"), choice);
    storage.set("wcsdai.home-welcome.project", "{broken");
    assert.equal(previousHomeWelcome("project"), undefined);
    globalThis.sessionStorage = { getItem() { throw new Error("blocked"); }, setItem() { throw new Error("blocked"); } };
    assert.deepEqual(previousHomeWelcome("temporary"), choice);
    rememberHomeWelcome("empty", choice);
    assert.deepEqual(previousHomeWelcome("empty"), choice);
  } finally {
    if (previous === undefined) delete globalThis.sessionStorage;
    else globalThis.sessionStorage = previous;
  }
});

test("the real welcome renders readable greetings and keeps the project switcher interactive", async () => {
  const server = await createServer({ root: fileURLToPath(new URL("..", import.meta.url)), configFile: false,
    server: { middlewareMode: true, hmr: false, ws: false }, esbuild: { jsx: "automatic" }, appType: "custom",
    optimizeDeps: { noDiscovery: true, include: [] } });
  try {
    const { HomeWelcomeView, HomeWelcome } = await server.ssrLoadModule("/src/components/HomeWelcome.tsx");
    const { zhCN } = await server.ssrLoadModule("/../../packages/i18n/src/locales/zh-CN/index.ts");
    const { en } = await server.ssrLoadModule("/../../packages/i18n/src/locales/en/index.ts");
    for (const [language, catalog] of Object.entries({ en, "zh-CN": zhCN })) {
      const i18n = createInstance();
      await i18n.init({ lng: language, resources: { [language]: { translation: catalog } } });
      for (const kind of ["empty", "temporary", "project"]) {
        const greetings = Object.values(catalog.chat.homeWelcome[kind]);
        assert.equal(greetings.length, 8);
        assert.equal(new Set(greetings).size, 8);
        const project = kind === "project" ? createElement("button", { type: "button", "data-testid": "project-switcher" }, "My project") : undefined;
        const html = renderToStaticMarkup(createElement(I18nextProvider, { i18n }, createElement(HomeWelcome, { kind, project })));
        assert.match(html, /<h1/);
        assert.doesNotMatch(html, /chat\.homeWelcome|__PROJECT__/);
        if (kind === "project") assert.match(html, /<button[^>]*data-testid="project-switcher"[^>]*>My project<\/button>/);
        else assert.doesNotMatch(html, /<button|project-switcher|My project/);
      }
    }
    const text = "一起把思路理清。";
    const letters = renderToStaticMarkup(createElement(HomeWelcomeView, { text, textMotion: "letters", logoMotion: "trace" }));
    assert.ok(letters.includes(`<span class="home-welcome-readable">${text}</span>`));
    assert.match(letters, /<span aria-hidden="true"><span class="home-welcome-letter"/);
    assert.match(letters, /data-logo-motion="trace"/);
    const project = renderToStaticMarkup(createElement(HomeWelcomeView, { text: "在 __PROJECT__ 里开始。", project: createElement("button", null, "Project"), textMotion: "letters" }));
    assert.match(project, /在 <button>Project<\/button> 里开始。/);
    assert.doesNotMatch(project, /home-welcome-readable/);
    const source = await readFile(new URL("../build/wcsdai-symbol.svg", import.meta.url), "utf8");
    const paths = [...source.matchAll(/<path[^>]* d="([^"]+)"/g)].map(match => match[1]);
    for (const path of paths) assert.ok(letters.includes(`d="${path}"`), "the animation preserves each canonical path");
  } finally { await server.close(); }
});
