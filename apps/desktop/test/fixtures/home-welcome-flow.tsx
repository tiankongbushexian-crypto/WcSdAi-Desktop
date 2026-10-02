import { useState } from "react";
import { createRoot } from "react-dom/client";
import { createInstance } from "i18next";
import { I18nextProvider } from "react-i18next";
import { zhCN } from "../../../../packages/i18n/src/locales/zh-CN/index";
import { HomeWelcome } from "../../src/components/HomeWelcome";
import "../../src/styles/globals.css";

const i18n = createInstance();
await i18n.init({ lng: "zh-CN", resources: { "zh-CN": { translation: zhCN } }, interpolation: { escapeValue: false } });
function Flow() {
  const [session, setSession] = useState(0);
  const [update, setUpdate] = useState(0);
  const [project, setProject] = useState(false);
  const [opened, setOpened] = useState(false);
  return <div style={{ width: 600, margin: "20px auto" }}>
    <button id="new-session" onClick={() => setSession(value => value + 1)}>New session</button>
    <button id="rerender" onClick={() => setUpdate(value => value + 1)}>Unrelated update {update}</button>
    <button id="project" onClick={() => setProject(value => !value)}>Switch context</button>
    <HomeWelcome key={`${session}:${project}`} kind={project ? "project" : "temporary"} project={project ? <button id="project-switcher" onClick={() => setOpened(true)}>Test Project</button> : undefined} />
    {opened && <div id="project-menu">Project menu opened</div>}
    <textarea id="draft" aria-label="Draft" />
  </div>;
}
createRoot(document.getElementById("root")!).render(<I18nextProvider i18n={i18n}><Flow/></I18nextProvider>);
