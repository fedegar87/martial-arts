export type OnboardingProfile = {
  preparing_exam_id: string | null;
  preparing_exam_taichi_id: string | null;
  plan_mode?: "exam" | "custom";
};

export function isProfileOnboarded(profile: OnboardingProfile): boolean {
  if (profile.plan_mode === "custom") return true;
  return Boolean(
    profile.preparing_exam_id || profile.preparing_exam_taichi_id,
  );
}
