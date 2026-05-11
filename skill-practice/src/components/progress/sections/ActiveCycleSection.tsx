import "server-only";
import { getActiveCycleProgress } from "@/lib/queries/progress";
import { ActiveCycleProgress } from "@/components/progress/ActiveCycleProgress";
import type { UserProfile } from "@/lib/types";

export async function ActiveCycleSection({ profile }: { profile: UserProfile }) {
  const progress = await getActiveCycleProgress(profile.id, profile);
  if (!progress) return null;
  return <ActiveCycleProgress progress={progress} />;
}
