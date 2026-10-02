export type HomeWelcomeKind = "empty" | "temporary" | "project";
export type HomeTextMotion = "rise" | "letters" | "focus";
export type HomeWelcomeChoice = { greeting: number; logo: number; text: number };
export const HOME_GREETING_COUNT = 8;
export const HOME_LOGO_MOTIONS = ["breathe", "assemble", "trace"] as const;
export const HOME_TEXT_MOTIONS = ["rise", "letters", "focus"] as const;

/** Uniformly choose any option except the last one, including across reloads. */
export function chooseNextIndex(count: number, previous: number | undefined, random = Math.random): number {
  if (!Number.isInteger(count) || count < 1) throw new RangeError("The option count must be a positive integer");
  if (count === 1) return 0;
  const hasPrevious = Number.isInteger(previous) && previous !== undefined && previous >= 0 && previous < count;
  const candidate = Math.min(count - (hasPrevious ? 2 : 1), Math.max(0, Math.floor(random() * (count - (hasPrevious ? 1 : 0)))));
  return hasPrevious && candidate >= previous ? candidate + 1 : candidate;
}

export function chooseHomeWelcome(previous?: HomeWelcomeChoice, random = Math.random): HomeWelcomeChoice {
  return {
    greeting: chooseNextIndex(HOME_GREETING_COUNT, previous?.greeting, random),
    logo: chooseNextIndex(HOME_LOGO_MOTIONS.length, previous?.logo, random),
    text: chooseNextIndex(HOME_TEXT_MOTIONS.length, previous?.text, random),
  };
}

const previousChoices = new Map<HomeWelcomeKind, HomeWelcomeChoice>();
const storageKey = (kind: HomeWelcomeKind) => `wcsdai.home-welcome.${kind}`;

export function previousHomeWelcome(kind: HomeWelcomeKind): HomeWelcomeChoice | undefined {
  try {
    const value: unknown = JSON.parse(sessionStorage.getItem(storageKey(kind)) ?? "null");
    if (value && typeof value === "object" && "greeting" in value && "logo" in value && "text" in value &&
        typeof value.greeting === "number" && typeof value.logo === "number" && typeof value.text === "number") {
      return { greeting: value.greeting, logo: value.logo, text: value.text };
    }
  } catch {
    // Decorative preferences remain usable when browser storage is unavailable.
  }
  return previousChoices.get(kind);
}

export function rememberHomeWelcome(kind: HomeWelcomeKind, choice: HomeWelcomeChoice): void {
  previousChoices.set(kind, choice);
  try {
    sessionStorage.setItem(storageKey(kind), JSON.stringify(choice));
  } catch {
    // In-memory history still prevents repeats for this renderer lifetime.
  }
}
