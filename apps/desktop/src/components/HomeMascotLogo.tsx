import mascotMotionDarkUrl from "../assets/home-mascot-dark.gif";
import mascotMotionLightUrl from "../assets/home-mascot-light.gif";
import mascotStillDarkUrl from "../assets/home-mascot-still-dark.png";
import mascotStillLightUrl from "../assets/home-mascot-still-light.png";

export type HomeLogoMotion = "breathe" | "assemble" | "trace";

// These are the canonical three paths from build/wcsdai-symbol.svg.
const SYMBOL_PATHS = [
  "M 61 119 H 154 C 157.7 119 160 121.6 162 125.4 L 242.5 285.6 Q 245 290.2 242.8 294.7 L 199.7 386.4 Q 196.1 393.2 191.5 387.2 L 59.2 127.2 Q 55.7 120.1 61 119 Z",
  "M 208 119 H 447.5 Q 454.2 119 451 125.6 L 386.4 251.3 C 379.3 265.1 371.4 273 357.7 273 H 336 Q 328.7 273 332 266 L 367.5 189.1 Q 373 178 361.8 178 H 298.1 Q 292.3 178 289.5 183.8 L 266.9 231.8 Q 263.8 240.4 258.8 233.9 L 206.2 128.1 Q 202.2 119 208 119 Z",
  "M 294 247.5 Q 298.1 244.7 301.3 249.3 L 321.5 286.2 C 325.5 293.8 330.3 296 339.4 296 H 355.6 Q 364.2 296 370 292.5 L 334 371.8 C 327.4 385 318.8 391 303.1 391 C 291.2 391 281.2 386.8 274.7 376.8 L 255.8 340.5 Q 251.2 333.7 254.7 326.7 L 289.6 253.7 Q 291.5 249.1 294 247.5 Z",
] as const;

export function HomeMascotLogo({ motion = "breathe" }: { motion?: HomeLogoMotion }) {
  if (motion !== "breathe") {
    return (
      <span className="home-mascot-logo home-mascot-vector" data-testid="home-mascot-logo" data-logo-motion={motion} aria-hidden="true">
        <svg width="100" height="100" viewBox="0 0 512 512" fill="currentColor" focusable="false">
          <g transform="translate(1.07885 1)">
            {SYMBOL_PATHS.map((path, index) => (
              <g key={path} className={`home-symbol-piece home-symbol-piece-${index}`}>
                <path className="home-symbol-fill" d={path} />
                {motion === "trace" && <path className="home-symbol-trace" d={path} pathLength="1" />}
              </g>
            ))}
          </g>
        </svg>
      </span>
    );
  }
  return (
    <span
      className="home-mascot-logo"
      data-logo-motion="breathe"
      data-testid="home-mascot-logo"
      aria-hidden="true"
    >
      <img
        className="home-mascot-motion home-mascot-dark"
        src={mascotMotionDarkUrl}
        alt=""
        width={100}
        height={100}
        draggable={false}
      />
      <img
        className="home-mascot-motion home-mascot-light"
        src={mascotMotionLightUrl}
        alt=""
        width={100}
        height={100}
        draggable={false}
      />
      <img
        className="home-mascot-still home-mascot-dark"
        src={mascotStillDarkUrl}
        alt=""
        width={100}
        height={100}
        draggable={false}
      />
      <img
        className="home-mascot-still home-mascot-light"
        src={mascotStillLightUrl}
        alt=""
        width={100}
        height={100}
        draggable={false}
      />
    </span>
  );
}
