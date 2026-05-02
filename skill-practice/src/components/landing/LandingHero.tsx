import { HorseEmblem } from "./HorseEmblem";
import { EnterButton } from "./EnterButton";

export function LandingHero({ ctaHref }: { ctaHref: string }) {
  return (
    <main
      className="
        landing-hero
        min-h-svh flex items-center justify-center px-6
        pt-[max(2rem,env(safe-area-inset-top))]
        pb-[max(3rem,env(safe-area-inset-bottom))]
      "
    >
      <div className="landing-hero__content w-full max-w-md flex flex-col items-center text-center">
        <HorseEmblem className="landing-hero__emblem landing-anim-horse w-full max-w-xs h-auto" />

        <h1
          className="landing-hero__ideogram landing-anim-ideogram mt-8 text-[80px] sm:text-[96px] leading-none text-accent font-serif-tc font-bold"
          lang="zh-Hant"
        >
          丙午
        </h1>

        <p
          className="landing-hero__citation landing-anim-citation mt-6 text-4xl text-foreground font-serif-tc font-medium"
          lang="zh-Hant"
        >
          學而不厭
        </p>

        <p className="landing-hero__translation landing-anim-translation mt-4 text-base italic text-muted-foreground">
          apprendere e non esserne mai sazio
        </p>

        <p className="landing-hero__author landing-anim-author mt-2 text-sm text-muted-foreground/70">
          — Confucio
        </p>

        <div className="landing-hero__cta landing-anim-cta mt-12">
          <EnterButton href={ctaHref} />
        </div>
      </div>
    </main>
  );
}
