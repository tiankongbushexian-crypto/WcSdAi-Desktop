import { createRoot } from "react-dom/client";
import { flushSync } from "react-dom";
import { createInstance } from "i18next";
import { I18nextProvider } from "react-i18next";
import { catalogs } from "@pi-desktop/i18n";
import type { ModelInfo, ProviderPublic, ProviderUpdateInput } from "@pi-desktop/shared";
import { ProviderSetupDialog } from "../../apps/desktop/src/components/settings/ProviderSetupDialog";
import { VendorAccountDialog, type VendorAccountForm } from "../../apps/desktop/src/components/settings/VendorAccountDialog";
import { api } from "../../apps/desktop/src/lib/api";

declare global {
  var providerDialogLayoutProbe: (locale: "en" | "zh-CN", account?: boolean) => Promise<unknown>;
}

const assert: (value: unknown, message: string) => asserts value = (value, message) => {
  if (!value) throw new Error(message);
};
const frame = () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
async function until(condition: () => boolean, label: string) {
  const deadline = performance.now() + 5000;
  while (!condition() && performance.now() < deadline) await frame();
  assert(condition(), label);
}
const models: ModelInfo[] = Array.from({ length: 22 }, (_, index) => ({
  modelId: `fixture-model-${String(index + 1).padStart(2, "0")}`,
  displayName: `Fixture model ${index + 1}`,
  providerId: "layout-fixture", source: "discovered", capabilities: ["text", "tools"],
  supportedThinkingLevels: ["off"], contextWindow: 128000, maxTokens: 8192,
}));
const fixture: ProviderPublic = {
  id: "layout-fixture", name: "Layout fixture", vendorKey: "custom", type: "openai_compatible",
  protocol: "openai_compatible", enabled: true, authKind: "api_key_and_base_url",
  apiStyle: "responses", baseUrl: "https://fixture.invalid/v1", hasSecret: true,
  supportsReasoning: false, supportedThinkingLevels: ["off"], createdAt: "", updatedAt: "",
  models: models.slice(0, 13).map((model) => ({ id: model.modelId, contextWindow: 128000,
    maxTokens: 8192, thinkingLevels: ["off"], defaultThinkingLevel: "off" })),
};
const mount = document.createElement("div");
document.body.append(mount);
const root = createRoot(mount);
let renderKey = 0;

globalThis.providerDialogLayoutProbe = async (locale, account = false) => {
  const i18n = createInstance();
  await i18n.init({ lng: locale, resources: {
    en: { translation: catalogs.en }, "zh-CN": { translation: catalogs["zh-CN"] },
  }, interpolation: { escapeValue: false } });
  let saved: ProviderUpdateInput | VendorAccountForm | undefined;
  // Only the external API boundary is stubbed. These are the actual dialog,
  // discovery/selection hooks, model editor, controls, and production styles.
  api.listProviderModels = async () => ({ models, source: "remote" });
  api.updateProvider = async (input) => {
    saved = structuredClone(input);
    return { provider: { ...fixture, ...input } };
  };
  const render = (provider: ProviderPublic) => flushSync(() => root.render(
    <I18nextProvider i18n={i18n}>
      {account ? <VendorAccountDialog key={++renderKey} provider={provider}
        initialName={provider.name} onClose={() => {}} saving={false}
        onSave={(form) => { saved = structuredClone(form); }} />
        : <ProviderSetupDialog key={++renderKey} provider={provider}
          onClose={() => {}} onSaved={() => {}} />}
    </I18nextProvider>,
  ));
  const query = <T extends HTMLElement>(selector: string): T => {
    const element = document.querySelector<T>(selector);
    assert(element, `missing ${selector}`);
    return element;
  };
  const button = (key: string) => {
    const element = [...document.querySelectorAll<HTMLButtonElement>("button")]
      .find((item) => item.textContent?.trim() === i18n.t(key));
    assert(element, `missing ${key}`);
    return element;
  };
  const reveal = async (element: HTMLElement) => {
    element.scrollIntoView({ block: "center", inline: "nearest" });
    await frame();
    const bounds = element.getBoundingClientRect();
    const hit = document.elementFromPoint(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2);
    assert(hit && (hit === element || element.contains(hit)),
      `control clipped or covered: ${element.className}`);
  };
  const click = async (element: HTMLElement) => {
    await reveal(element);
    flushSync(() => element.click());
    await frame();
  };
  const input = async (element: HTMLInputElement, value: string) => {
    await reveal(element);
    element.focus();
    flushSync(() => {
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!.call(element, value);
      element.dispatchEvent(new Event("input", { bubbles: true }));
    });
    await frame();
  };
  render(fixture);
  await until(() => document.querySelectorAll(".provider-models-row").length === 22,
    "discovery did not populate the production dialog");
  await Promise.all(document.getAnimations().map((animation) => animation.finished.catch(() => {})));
  const chosen = query(".provider-chosen-list");
  const available = query(".provider-models-list");
  const measurements = { viewport: [innerWidth, innerHeight], chosen: chosen.clientHeight,
    available: available.clientHeight, chosenScroll: chosen.scrollHeight };
  // A scroll container with a 0-10px viewport cannot expose even one model row.
  // This fails on the former flex-shrunk grid at the reported 1188x794 size.
  assert(chosen.clientHeight >= 100,
    `model settings viewport collapsed: ${JSON.stringify(measurements)}`);
  assert(available.clientHeight >= 100,
    `discovered models viewport collapsed: ${JSON.stringify(measurements)}`);
  const dialog = query<HTMLElement>("[role=dialog]").getBoundingClientRect();
  assert(dialog.left >= 0 && dialog.right <= innerWidth && dialog.top >= 0 && dialog.bottom <= innerHeight,
    "dialog escaped the viewport");

  // Reach the last chosen model, expand it, edit its alias and token budget.
  const rows = [...document.querySelectorAll<HTMLElement>(".provider-chosen-row")];
  const last = rows.at(-1)!;
  await click(last.querySelector<HTMLButtonElement>(".provider-chosen-advanced-toggle")!);
  const alias = last.querySelector<HTMLInputElement>(".provider-chosen-field input:not([type=number])")!;
  await input(alias, "Visible final model");
  const limit = last.querySelector<HTMLInputElement>("input[type=number]")!;
  await input(limit, "196608");
  assert(last.querySelector(".provider-chosen-advanced-toggle")?.getAttribute("aria-expanded") === "true",
    "model settings did not open");

  // Both search entry points stay reachable, and share the selection filter.
  const search = query<HTMLInputElement>(".provider-chosen-search");
  await input(search, "fixture-model-13");
  assert(document.querySelectorAll(".provider-chosen-row").length === 1, "chosen search failed");
  await input(search, "");
  assert(document.querySelectorAll(".provider-chosen-row").length === 13, "chosen search reset failed");
  await reveal(query(".provider-custom-model input"));
  await click(button(account ? "settings.save" : "settings.saveProvider"));
  await until(() => Boolean(saved), "model editor save did not complete");
  assert(saved, "model editor save missing");
  assert(saved.models?.length === 13 && saved.models[12].alias === "Visible final model" &&
    saved.models[12].contextWindow === 196608, "saved model settings were not preserved");
  if (!account) {
    assert("baseUrl" in saved && saved.baseUrl === fixture.baseUrl && saved.apiStyle === fixture.apiStyle &&
      !("secretValue" in saved), "model edits changed the service endpoint, protocol, or saved credential");
  }
  const next = { ...fixture, models: saved.models };
  render(next);
  await until(() => document.querySelectorAll(".provider-models-row").length === 22, "reopen discovery failed");
  const reopened = [...document.querySelectorAll<HTMLElement>(".provider-chosen-row")].at(-1)!;
  await click(reopened.querySelector<HTMLButtonElement>(".provider-chosen-advanced-toggle")!);
  const reopenedAlias = reopened.querySelector<HTMLInputElement>(".provider-chosen-field input:not([type=number])")!;
  await reveal(reopenedAlias);
  assert(reopenedAlias.value === "Visible final model", "reopen lost edited alias");
  assert(reopened.querySelector<HTMLInputElement>("input[type=number]")?.value === "196608",
    "reopen lost token limit");
  await Promise.all(document.getAnimations().map((animation) => animation.finished.catch(() => {})));
  return { ok: true, locale, account, measurements,
    scenario: "discover-22-scroll-13th-expand-edit-search-save-reopen",
    apiBoundary: "stubbed", hostPersistence: "not exercised", liveProvider: "not contacted" };
};
