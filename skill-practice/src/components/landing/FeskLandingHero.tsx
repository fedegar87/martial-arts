import { EnterButton } from "./EnterButton";

// Landing pubblica FESK: logo della federazione e direzione "Fong Ttai / Abbondanza
// di pace". Copy breve, da approvare con FESK se usata come motto ufficiale.
export function FeskLandingHero({ ctaHref }: { ctaHref: string }) {
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
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/icons/icon-512.png"
          alt="FESK"
          width={176}
          height={176}
          className="landing-anim-horse h-44 w-44 rounded-3xl shadow-xl"
        />

        <h1 className="landing-anim-ideogram mt-8 text-4xl font-display font-semibold text-foreground">
          FESK Practice
        </h1>

        <p className="landing-anim-citation mt-5 text-3xl text-accent font-display font-medium">
          Fong Ttai
        </p>

        <p className="landing-anim-translation mt-3 text-base italic text-muted-foreground">
          Abbondanza di pace
        </p>

        <div className="landing-anim-cta mt-12">
          <EnterButton href={ctaHref} />
        </div>
      </div>
    </main>
  );
}
