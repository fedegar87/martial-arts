type LandingProfile = {
  preparing_exam_id: string | null;
  preparing_exam_taichi_id: string | null;
};

export function resolveLandingDestination(
  profile: LandingProfile | null,
): "/login" | "/onboarding" | "/today" {
  if (!profile) return "/login";
  if (!profile.preparing_exam_id && !profile.preparing_exam_taichi_id) {
    return "/onboarding";
  }
  return "/today";
}
