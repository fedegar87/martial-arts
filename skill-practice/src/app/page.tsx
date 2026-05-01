import { LandingHero } from "@/components/landing/LandingHero";
import { resolveLandingDestination } from "@/lib/landing";
import { getCurrentProfile } from "@/lib/queries/user-profile";

export default async function RootPage() {
  let profile = null;
  try {
    profile = await getCurrentProfile();
  } catch {
    // Fallback silenzioso: la landing resta visibile, CTA -> /login
  }

  const destination = resolveLandingDestination(profile);
  return <LandingHero ctaHref={destination} />;
}
