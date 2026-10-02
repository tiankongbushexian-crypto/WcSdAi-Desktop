import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { HomeMascotLogo, type HomeLogoMotion } from "./HomeMascotLogo";
import {
  chooseHomeWelcome, HOME_LOGO_MOTIONS, HOME_TEXT_MOTIONS,
  previousHomeWelcome, rememberHomeWelcome, type HomeTextMotion, type HomeWelcomeKind,
} from "../lib/home-welcome";

function AnimatedWords({ text }: { text: string }) {
  return <>{Array.from(text).map((character, index) => (
    <span className="home-welcome-letter" key={`${index}-${character}`} style={{ "--letter-delay": `${Math.min(index, 20) * 22}ms` } as CSSProperties}>{character}</span>
  ))}</>;
}

/** Shared by the chat surface and the local motion review: one markup/CSS source. */
export function HomeWelcomeView({
  text, project, logoMotion = "assemble", textMotion = "rise", reducedMotion = false, paused = false,
}: {
  text: string; project?: ReactNode; logoMotion?: HomeLogoMotion; textMotion?: HomeTextMotion;
  reducedMotion?: boolean; paused?: boolean;
}) {
  const [before, after] = text.split("__PROJECT__");
  // Project names remain real focusable controls; their label is never aria-hidden.
  const animateLetters = textMotion === "letters" && !project;
  return (
    <div className="empty-hero home-welcome" data-reduced-motion={reducedMotion || undefined} data-motion-paused={paused || undefined}>
      <div className="empty-hero-icon" data-testid="home-icon" aria-hidden><HomeMascotLogo motion={logoMotion} /></div>
      <h1 className={`home-welcome-title home-welcome-title-${textMotion === "letters" && project ? "rise" : textMotion}`}>
        {animateLetters ? <>
          <span className="home-welcome-readable">{text}</span>
          <span aria-hidden="true"><AnimatedWords text={text} /></span>
        </> : <>{before}{project}{after}</>}
      </h1>
    </div>
  );
}

/** Mount with a session/context key so normal store updates never change the greeting. */
export function HomeWelcome({ kind, project }: { kind: HomeWelcomeKind; project?: ReactNode }) {
  const { t } = useTranslation();
  const [choice] = useState(() => chooseHomeWelcome(previousHomeWelcome(kind)));
  useEffect(() => rememberHomeWelcome(kind, choice), [kind, choice]);
  return <HomeWelcomeView
    text={t(`chat.homeWelcome.${kind}.g${choice.greeting}`, { project: "__PROJECT__" })}
    project={project}
    logoMotion={HOME_LOGO_MOTIONS[choice.logo]}
    textMotion={HOME_TEXT_MOTIONS[choice.text]}
  />;
}
