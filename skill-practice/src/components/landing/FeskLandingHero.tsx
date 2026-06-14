import { EnterButton } from "./EnterButton";
import { brand } from "@/lib/brand";

// Landing pubblica FESK: logo della federazione, nome app, ideogrammi e motto "Fong
// Ttai". Testi e ideogrammi vengono dal brand centralizzato (src/lib/brand.ts).
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
          alt={brand.shortName}
          width={176}
          height={176}
          className="landing-anim-horse h-44 w-44 rounded-3xl shadow-xl"
        />

        <h1 className="landing-anim-ideogram mt-8 text-4xl font-display font-semibold text-foreground">
          {brand.appName}
        </h1>

        <p
          className="landing-anim-citation mt-5 text-5xl text-accent font-serif-tc font-medium tracking-[0.15em]"
          lang="zh-Hant"
        >
          {brand.landing.ideogram}
        </p>

        <p className="landing-anim-translation mt-3 text-xl italic text-muted-foreground">
          {brand.landing.motto}
        </p>

        <div className="landing-anim-cta mt-12">
          <EnterButton href={ctaHref} />
        </div>
      </div>
    </main>
  );
}
