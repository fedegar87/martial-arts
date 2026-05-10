import Link from "next/link";
import type { ReactNode } from "react";
import { RotateCcw, Search, SlidersHorizontal, Video, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SKILL_CATEGORY_LABELS } from "@/lib/labels";
import { cn } from "@/lib/utils";
import type { Discipline, SkillCategory } from "@/lib/types";

type CategoryOption = {
  value: SkillCategory;
  count: number;
};

type Props = {
  basePath: string;
  discipline: Discipline;
  currentCategory?: SkillCategory;
  categories: CategoryOption[];
  withVideo: boolean;
  query: string;
  resultCount: number;
  totalCount: number;
  allVisibleCount: number;
  videoCount: number;
};

export function LibraryFilters({
  basePath,
  discipline,
  currentCategory,
  categories,
  withVideo,
  query,
  resultCount,
  totalCount,
  allVisibleCount,
  videoCount,
}: Props) {
  const hasActiveFilters = Boolean(currentCategory || withVideo || query);

  const buildHref = (updates: {
    category?: SkillCategory | null;
    withVideo?: boolean;
    query?: string | null;
  }) => {
    const params = new URLSearchParams();
    const nextCategory =
      updates.category === undefined ? currentCategory : updates.category;
    const nextWithVideo =
      updates.withVideo === undefined ? withVideo : updates.withVideo;
    const nextQuery = updates.query === undefined ? query : updates.query;

    params.set("d", discipline);
    if (nextCategory) params.set("category", nextCategory);
    if (nextWithVideo) params.set("withVideo", "1");
    if (nextQuery) params.set("q", nextQuery);
    return `${basePath}?${params.toString()}`;
  };

  const resetHref = `${basePath}?d=${discipline}`;

  return (
    <section className="space-y-3 rounded-md border border-border/70 bg-card/40 p-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 shrink-0 text-primary" />
          <div className="min-w-0">
            <h2 className="text-sm font-medium">Filtri</h2>
            <p className="text-muted-foreground text-xs">
              {resultCount} di {totalCount} {totalCount === 1 ? "contenuto" : "contenuti"}
            </p>
          </div>
        </div>
        {hasActiveFilters && (
          <Link
            href={resetHref}
            className="tap-feedback label-font inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-sm border border-border px-2.5 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Azzera
          </Link>
        )}
      </div>

      <form action={basePath} className="flex gap-2">
        <input type="hidden" name="d" value={discipline} />
        {currentCategory && (
          <input type="hidden" name="category" value={currentCategory} />
        )}
        {withVideo && <input type="hidden" name="withVideo" value="1" />}
        <label htmlFor="library-search" className="sr-only">
          Cerca
        </label>
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="library-search"
            name="q"
            type="search"
            defaultValue={query}
            placeholder="Cerca forme o tecniche"
            className="min-h-11 pl-9 pr-3"
          />
        </div>
        <Button type="submit" variant="outline" size="icon-lg" aria-label="Cerca">
          <Search className="h-4 w-4" />
        </Button>
      </form>

      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2" aria-label="Filtri attivi">
          {query && (
            <ActiveFilter href={buildHref({ query: null })} label={query} />
          )}
          {currentCategory && (
            <ActiveFilter
              href={buildHref({ category: null })}
              label={SKILL_CATEGORY_LABELS[currentCategory]}
            />
          )}
          {withVideo && (
            <ActiveFilter href={buildHref({ withVideo: false })} label="Con video" />
          )}
        </div>
      )}

      <div className="scroll-chips pb-1" role="list" aria-label="Categorie">
        <FilterChip
          href={buildHref({ category: null })}
          active={!currentCategory}
          label="Tutte"
          count={allVisibleCount}
        />
        {categories.map((category) => (
          <FilterChip
            key={category.value}
            href={buildHref({ category: category.value })}
            active={currentCategory === category.value}
            label={SKILL_CATEGORY_LABELS[category.value]}
            count={category.count}
            muted={category.count === 0 && currentCategory !== category.value}
          />
        ))}
      </div>

      <div className="flex">
        <FilterChip
          href={buildHref({ withVideo: !withVideo })}
          active={withVideo}
          label="Con video"
          count={videoCount}
          icon={<Video className="h-3.5 w-3.5" />}
          wide
        />
      </div>
    </section>
  );
}

function FilterChip({
  href,
  active,
  label,
  count,
  icon,
  muted = false,
  wide = false,
}: {
  href: string;
  active: boolean;
  label: string;
  count: number;
  icon?: ReactNode;
  muted?: boolean;
  wide?: boolean;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      title={`${label}: ${count}`}
      className={cn(
        "tap-feedback label-font inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-md border px-3 text-sm transition-colors",
        wide ? "w-full sm:w-auto" : "min-w-24",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border text-muted-foreground hover:bg-muted hover:text-foreground",
        muted && "opacity-45",
      )}
    >
      {icon}
      <span className="truncate">{label}</span>
      <span
        className={cn(
          "rounded-sm px-1.5 py-0.5 text-[0.68rem] leading-none",
          active ? "bg-background/20" : "bg-muted text-muted-foreground",
        )}
      >
        {count}
      </span>
    </Link>
  );
}

function ActiveFilter({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="tap-feedback inline-flex min-h-8 max-w-full items-center gap-1.5 rounded-sm border border-border px-2 text-xs text-muted-foreground hover:bg-muted hover:text-foreground"
    >
      <span className="truncate">{label}</span>
      <X className="h-3 w-3 shrink-0" />
    </Link>
  );
}
