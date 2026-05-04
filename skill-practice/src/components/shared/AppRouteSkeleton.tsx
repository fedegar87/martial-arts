import { Skeleton } from "@/components/ui/skeleton";

type AppRouteSkeletonProps = {
  variant?: "default" | "list" | "detail" | "calendar" | "form";
};

export function AppRouteSkeleton({
  variant = "default",
}: AppRouteSkeletonProps) {
  return (
    <section className="space-y-6" role="status" aria-busy="true">
      <span className="sr-only">Caricamento...</span>
      <HeaderSkeleton />
      {variant === "detail" ? (
        <DetailSkeleton />
      ) : variant === "calendar" ? (
        <CalendarSkeleton />
      ) : variant === "form" ? (
        <FormSkeleton />
      ) : (
        <ListSkeleton compact={variant === "default"} />
      )}
    </section>
  );
}

function HeaderSkeleton() {
  return (
    <header className="space-y-3">
      <Skeleton className="h-8 w-44" />
      <Skeleton className="h-4 w-64 max-w-full" />
      <div className="flex gap-2 overflow-hidden">
        <Skeleton className="h-10 w-24 shrink-0 rounded-md" />
        <Skeleton className="h-10 w-28 shrink-0 rounded-md" />
        <Skeleton className="h-10 w-20 shrink-0 rounded-md" />
      </div>
    </header>
  );
}

function ListSkeleton({ compact }: { compact: boolean }) {
  const rows = compact ? 4 : 7;

  return (
    <div className="space-y-4">
      <Skeleton className="h-24 rounded-md" />
      <div className="space-y-2">
        {Array.from({ length: rows }).map((_, index) => (
          <Skeleton key={index} className="h-16 rounded-md" />
        ))}
      </div>
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="space-y-5">
      <Skeleton className="aspect-video w-full rounded-md" />
      <div className="flex flex-wrap gap-2">
        <Skeleton className="h-6 w-20 rounded-sm" />
        <Skeleton className="h-6 w-24 rounded-sm" />
        <Skeleton className="h-6 w-16 rounded-sm" />
      </div>
      <Skeleton className="h-28 rounded-md" />
      <Skeleton className="h-20 rounded-md" />
    </div>
  );
}

function CalendarSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <Skeleton className="h-10 w-24 rounded-md" />
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-10 w-24 rounded-md" />
      </div>
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: 35 }).map((_, index) => (
          <Skeleton key={index} className="aspect-square rounded-sm" />
        ))}
      </div>
    </div>
  );
}

function FormSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-20 rounded-md" />
      <Skeleton className="h-40 rounded-md" />
      <Skeleton className="h-28 rounded-md" />
      <Skeleton className="h-11 w-full rounded-sm" />
    </div>
  );
}
