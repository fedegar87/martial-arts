import { LegacyLandingHero } from "@/components/landing/LegacyLandingHero";
import { resolveLandingDestination } from "@/lib/landing";
import { getCurrentProfile } from "@/lib/queries/user-profile";

// Variante personale legacy (cavallo di fuoco + Confucio), conservata accanto alla
// landing pubblica FESK su /.
export default async function LandingLegacyPage() {
  let profile = null;
  try {
    profile = await getCurrentProfile();
  } catch {
    // Fallback silenzioso: la landing resta visibile, CTA -> /login
  }

  const destination = resolveLandingDestination(profile);
  return <LegacyLandingHero ctaHref={destination} />;
}
