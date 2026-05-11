import { Skeleton } from "@/components/ui/skeleton";

type Props = {
  heightClass?: string;
};

export function ProgressSectionSkeleton({ heightClass = "h-24" }: Props) {
  return (
    <div
      className="space-y-3 rounded-lg border border-border bg-card p-4 shadow-[var(--shadow-sm)]"
      role="status"
      aria-busy="true"
    >
      <Skeleton className="h-5 w-40" />
      <Skeleton className={heightClass} />
    </div>
  );
}
