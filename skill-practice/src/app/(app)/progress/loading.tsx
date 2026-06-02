import { Skeleton } from "@/components/ui/skeleton";
import { ProgressSectionSkeleton } from "@/components/progress/sections/ProgressSectionSkeleton";

export default function Loading() {
  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <Skeleton className="h-8 w-36" />
        <Skeleton className="h-8 w-36 rounded-md" />
      </header>
      <ProgressSectionSkeleton heightClass="h-16" />
      <ProgressSectionSkeleton heightClass="h-16" />
      <ProgressSectionSkeleton heightClass="h-40" />
      <ProgressSectionSkeleton heightClass="h-56" />
    </div>
  );
}
