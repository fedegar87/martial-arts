import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <section className="space-y-6">
      <header className="material-bar sticky top-0 z-30 -mx-4 border-b border-border px-4 pt-3 pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-2">
            <Skeleton className="h-3 w-40" />
            <Skeleton className="h-7 w-32" />
          </div>
          <div className="flex shrink-0 gap-1">
            <Skeleton className="h-9 w-9 rounded-md" />
            <Skeleton className="h-9 w-9 rounded-md" />
          </div>
        </div>
      </header>
      <div className="space-y-2">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-1.5 w-full rounded-full" />
      </div>
      <div className="space-y-3">
        <Skeleton className="h-64 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    </section>
  );
}
