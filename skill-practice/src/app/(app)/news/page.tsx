import type { UiTranslator } from "@/lib/i18n/config";

import { NewsSeenMarker } from "@/components/news/NewsSeenMarker";
import { EmptyState } from "@/components/shared/EmptyState";
import { listNewsForSchool } from "@/lib/queries/news";
import { getCurrentProfile } from "@/lib/queries/user-profile";
import type { NewsItem } from "@/lib/types";
import { CalendarDays, MapPin, Newspaper, Pin } from "lucide-react";
import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";

export default async function NewsPage() {
  const tr = await getTranslations("ui");
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");

  const news = await listNewsForSchool(profile.school_id);

  return (
    <div className="space-y-6">
      <NewsSeenMarker enabled={news.length > 0} />
      <header>
        <h1 className="text-2xl font-semibold">{tr("news")}</h1>
        <p className="text-muted-foreground text-sm">{tr("newsDescription")}</p>
      </header>
      {news.length === 0 ? (
        <EmptyState
          icon={<Newspaper className="h-10 w-10" />}
          title={tr("noNews")}
          description={tr("newsEmptyDescription")}
        />
      ) : (
        <div className="space-y-3">
          {news.map((item) => (
            <NewsCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}

function NewsCard({ item }: { item: NewsItem }) {
  const tr = useTranslations("ui");
  return (
    <article className="space-y-3 rounded-md border border-border/80 bg-card p-4 shadow-[0_2px_12px_rgba(0,0,0,0.35),inset_0_1px_0_0_rgba(255,255,255,0.04)]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="label-font text-primary text-xs">
              {item.type === "event" ? tr("event") : tr("announcement")}
            </span>
            {item.pinned && <Pin className="text-primary h-3.5 w-3.5" />}
          </div>
          <h2 className="text-xl font-semibold">{item.title}</h2>
        </div>
        <time className="text-muted-foreground shrink-0 text-xs">
          {formatDate(tr, item.published_at)}
        </time>
      </div>
      <p className="text-muted-foreground whitespace-pre-wrap text-sm leading-relaxed">
        {item.body}
      </p>
      {(item.event_date || item.event_location) && (
        <div className="border-border flex flex-col gap-1 border-t pt-3 text-sm sm:flex-row sm:items-center sm:gap-4">
          {item.event_date && (
            <span className="text-muted-foreground flex items-center gap-1.5">
              <CalendarDays className="h-4 w-4" />
              {formatDateTime(tr, item.event_date)}
            </span>
          )}
          {item.event_location && (
            <span className="text-muted-foreground flex items-center gap-1.5">
              <MapPin className="h-4 w-4" />
              {item.event_location}
            </span>
          )}
        </div>
      )}
    </article>
  );
}

function formatDate(tr: UiTranslator, value: string): string {
  return new Intl.DateTimeFormat(tr("locale"), {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function formatDateTime(tr: UiTranslator, value: string): string {
  return new Intl.DateTimeFormat(tr("locale"), {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}
