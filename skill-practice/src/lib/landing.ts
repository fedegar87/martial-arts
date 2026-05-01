import { isProfileOnboarded, type OnboardingProfile } from "./onboarding-state.ts";

export function resolveLandingDestination(
  profile: OnboardingProfile | null,
): "/login" | "/onboarding" | "/hub" {
  if (!profile) return "/login";
  if (!isProfileOnboarded(profile)) return "/onboarding";
  return "/hub";
}
