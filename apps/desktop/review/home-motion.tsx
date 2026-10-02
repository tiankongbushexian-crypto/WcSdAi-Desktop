import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { createInstance } from "i18next";
import { I18nextProvider, useTranslation } from "react-i18next";
import { zhCN } from "../../../packages/i18n/src/locales/zh-CN/index";
import { HomeWelcomeView } from "../src/components/HomeWelcome";
import { HomeMascotLogo } from "../src/components/HomeMascotLogo";
import { Button, Select, Textarea } from "../src/components/ui";
import { chooseNextIndex, HOME_LOGO_MOTIONS, HOME_TEXT_MOTIONS, type HomeWelcomeKind } from "../src/lib/home-welcome";
import "../src/styles/globals.css";
import "./home-motion.css";

const copy = {
  title: "让想法，自然发生。", subtitle: "首页文案与动效审核 · 仅本地预览，尚未发布",
  logo: "标志动效", text: "文字入场", scene: "预览场景", empty: "新任务", temporary: "临时会话", project: "项目会话",
  breathe: "现有 · 轻呼吸", assemble: "方案 A · 合流成形", trace: "方案 B · 光路描形",
  rise: "柔和浮现", letters: "逐字舒展", focus: "清晰聚焦",
  replay: "重播入场", refresh: "换一句文案", light: "切换浅色", dark: "切换深色",
  reduce: "减少动态", restore: "恢复动态", pause: "暂停动态", play: "播放动态",
  instruction: "任选组合预览；文案只在新会话或刷新时变化。",
  draft: "在这里输入想法，动效不会打断你…", presets: "当前场景的 8 句预设", mark: "WcSdAi / 01",
  assembleDetail: "三片沿标志自身斜线舒展，再轻柔聚拢。", traceDetail: "光路循着轮廓描形，再回到完整标志。", breatheDetail: "保留现有的克制呼吸，方便对照。",
  footer: "黑白双主题 · 原始矢量轮廓 · 支持系统减少动态 · 文案与标志共用中心轴",
  axis: "显示中心轴", hideAxis: "隐藏中心轴", previewProject: "WcSdAi-Desktop",
};
const i18n = createInstance();
await i18n.init({ lng: "zh-CN", resources: { "zh-CN": { translation: { ...zhCN, review: copy } } }, interpolation: { escapeValue: false } });
function Review() {
  const { t } = useTranslation();
  const [theme, setTheme] = useState("light");
  const [kind, setKind] = useState<HomeWelcomeKind>("temporary");
  const [logo, setLogo] = useState<0 | 1 | 2>(1);
  const [text, setText] = useState<0 | 1 | 2>(0);
  const [greeting, setGreeting] = useState(0);
  const [replay, setReplay] = useState(0);
  const [reduced, setReduced] = useState(false);
  const [paused, setPaused] = useState(false);
  const [axis, setAxis] = useState(false);
  useEffect(() => { document.documentElement.dataset.theme = theme; }, [theme]);
  const title = t(`chat.homeWelcome.${kind}.g${greeting}`, { project: "__PROJECT__" });
  const replayEntrance = () => setReplay((value) => value + 1);
  return <main className="motion-review">
    <header><span className="review-mark">{t("review.mark")}</span><div><Button variant="ghost" onClick={() => setTheme(theme === "light" ? "dark" : "light")}>{t(`review.${theme === "light" ? "dark" : "light"}`)}</Button><Button variant="ghost" onClick={() => setReduced(!reduced)} aria-pressed={reduced}>{t(`review.${reduced ? "restore" : "reduce"}`)}</Button></div></header>
    <section className="review-intro"><p>{t("review.subtitle")}</p><h2>{t("review.title")}</h2></section>
    <div className="review-workbench">
      <section className={`review-stage${axis ? " review-stage-axis" : ""}`}>
        <HomeWelcomeView key={`${replay}-${kind}-${greeting}-${logo}-${text}`} text={title} project={kind === "project" ? <Button className="project-underline" variant="ghost">{t("review.previewProject")}</Button> : undefined} logoMotion={HOME_LOGO_MOTIONS[logo]} textMotion={HOME_TEXT_MOTIONS[text]} reducedMotion={reduced} paused={paused}/>
        <div className="review-composer"><Textarea aria-label={t("review.draft")} placeholder={t("review.draft")} /></div>
      </section>
      <aside>
        <label>{t("review.scene")}<Select value={kind} onChange={(event) => setKind(event.target.value as HomeWelcomeKind)}>{["temporary", "empty", "project"].map(value => <option key={value} value={value}>{t(`review.${value}`)}</option>)}</Select></label>
        <label>{t("review.logo")}<Select value={logo} onChange={(event) => setLogo(Number(event.target.value) as 0 | 1 | 2)}>{HOME_LOGO_MOTIONS.map((motion, index) => <option key={motion} value={index}>{t(`review.${motion}`)}</option>)}</Select></label>
        <label>{t("review.text")}<Select value={text} onChange={(event) => setText(Number(event.target.value) as 0 | 1 | 2)}>{HOME_TEXT_MOTIONS.map((motion, index) => <option key={motion} value={index}>{t(`review.${motion}`)}</option>)}</Select></label>
        <Button onClick={replayEntrance}>{t("review.replay")}</Button>
        <Button variant="secondary" onClick={() => { setGreeting(chooseNextIndex(8, greeting)); replayEntrance(); }}>{t("review.refresh")}</Button>
        <Button variant="ghost" onClick={() => setPaused(!paused)}>{t(`review.${paused ? "play" : "pause"}`)}</Button>
        <Button variant="ghost" onClick={() => setAxis(!axis)}>{t(`review.${axis ? "hideAxis" : "axis"}`)}</Button>
        <p>{t("review.instruction")}</p>
      </aside>
    </div>
    <section className="review-options">{HOME_LOGO_MOTIONS.map((motion, index) => <Button className={`review-option${logo === index ? " selected" : ""}`} variant="ghost" key={motion} onClick={() => setLogo(index as 0 | 1 | 2)} aria-pressed={logo === index}>
      <div className="home-welcome" data-reduced-motion={reduced || undefined} data-motion-paused={paused || undefined}><HomeMascotLogo motion={motion}/></div><strong>{t(`review.${motion}`)}</strong><span>{t(`review.${motion}Detail`)}</span>
    </Button>)}</section>
    <section className="review-presets"><h3>{t("review.presets")}</h3><div>{Array.from({length:8}, (_, index) => <Button key={index} variant="ghost" aria-pressed={greeting === index} onClick={() => {setGreeting(index);replayEntrance();}}>{t(`chat.homeWelcome.${kind}.g${index}`, {project:t("review.previewProject")})}</Button>)}</div></section>
    <footer>{t("review.footer")}</footer>
  </main>;
}
createRoot(document.getElementById("review-root")!).render(<I18nextProvider i18n={i18n}><Review/></I18nextProvider>);
