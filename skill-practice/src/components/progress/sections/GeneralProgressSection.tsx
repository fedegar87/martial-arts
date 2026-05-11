import "server-only";
import { getGeneralProgress } from "@/lib/queries/progress";
import { GeneralProgressSummary } from "@/components/progress/GeneralProgressSummary";

export async function GeneralProgressSection({ userId }: { userId: string }) {
  const progress = await getGeneralProgress(userId);
  return <GeneralProgressSummary progress={progress} />;
}
