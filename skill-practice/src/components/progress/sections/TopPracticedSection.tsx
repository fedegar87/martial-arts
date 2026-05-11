import "server-only";
import { getTopPracticedSkills } from "@/lib/queries/progress";
import { TopPracticedList } from "@/components/progress/TopPracticedList";

export async function TopPracticedSection({ userId }: { userId: string }) {
  const items = await getTopPracticedSkills(userId, 5);
  if (items.length === 0) return null;
  return <TopPracticedList items={items} />;
}
