import { createRoot } from "react-dom/client";
import { createInstance } from "i18next";
import { I18nextProvider } from "react-i18next";
import { IPC, type UpdateState } from "@pi-desktop/shared";
import { en } from "../../../../packages/i18n/src/locales/en/index";
import { zhCN } from "../../../../packages/i18n/src/locales/zh-CN/index";
import { UpdateBanner } from "../../src/components/UpdateBanner";
import { UpdatesRow } from "../../src/features/settings/agent-sections";
import { ToastHost } from "../../src/components/Toast";
import { useAppStore } from "../../src/stores/app-store";
import "../../src/styles/globals.css";

const i18n = createInstance();
await i18n.init({ lng: "en", resources: { en: { translation: en }, "zh-CN": { translation: zhCN } }, interpolation: { escapeValue: false } });
const listeners = new Set<(...args: unknown[]) => void>();
const calls: Array<{ channel: string; args: unknown[] }> = [];
let rejectOpen = true;
let state: UpdateState = {
  mode: "manual", preference: "manual", defaultPreference: "manual", automaticSupported: false,
  status: "idle", currentVersion: "1.0.1", manualReminder: false,
  releasesUrl: "https://github.com/tiankongbushexian-crypto/WcSdAi-Desktop/actions/runs/123/artifacts/456",
};
window.piDesktop = {
  platform: "darwin", locale: "en", channels: IPC,
  async invoke<T>(channel: string, ...args: unknown[]) {
    calls.push({ channel, args });
    if (channel === IPC.invoke.updatesGetState) return { ok: true, data: state as T };
    if (channel === IPC.invoke.updatesCheck) {
      state = { ...state, status: "available", availableVersion: "1.0.2", manualReminder: true, releaseNotes: "• Fixture verified release highlights" };
      for (const listener of listeners) listener(state);
      return { ok: true, data: state as T };
    }
    if (channel === IPC.invoke.updatesOpenReleases) return rejectOpen
      ? { ok: false, error: { code: "UPDATE_LINK_UNAVAILABLE", message: "raw backend detail must stay out of this toast" } }
      : { ok: true, data: undefined as T };
    throw new Error(`Unexpected fixture IPC: ${channel}`);
  },
  on(channel, listener) {
    if (channel === IPC.event.updatesState) listeners.add(listener);
    return () => { listeners.delete(listener); };
  },
};
Object.assign(window, { updateFixture: {
  calls,
  setRejectOpen(value: boolean) { rejectOpen = value; },
  clearToasts() { useAppStore.setState({ toasts: [] }); },
  changeLanguage(locale: string) { return i18n.changeLanguage(locale); },
} });

createRoot(document.getElementById("root")!).render(
  <I18nextProvider i18n={i18n}>
    <section id="banner-surface" style={{ position: "relative", minHeight: 260 }}><UpdateBanner /></section>
    <section id="settings-surface"><UpdatesRow currentVersion="1.0.1" settings={{}} saveSettings={async () => {}} /></section>
    <ToastHost />
  </I18nextProvider>,
);
