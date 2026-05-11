import "server-only";
import { getPracticeCalendarDays } from "@/lib/queries/progress";
import { PracticeCalendar } from "@/components/progress/PracticeCalendar";

export async function PracticeCalendarSection({ userId }: { userId: string }) {
  const days = await getPracticeCalendarDays(userId);
  return <PracticeCalendar days={days} />;
}
