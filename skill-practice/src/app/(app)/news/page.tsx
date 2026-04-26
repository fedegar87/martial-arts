import { redirect } from "next/navigation";
import { CalendarDays, MapPin, Newspaper, Pin } from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";
import { NewsSeenMarker } from "@/components/news/NewsSeenMarker";
import { getCurrentProfile } from "@/lib/queries/user-profile";
import { listNewsForSchool } from "@/lib/queries/news";
import type { NewsItem } from "@/lib/types";

export default async function NewsPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");

  const news = await listNewsForSchool(profile.school_id);

  return (
    <div className="space-y-6">
      <NewsSeenMarker enabled={news.length > 0} />
      <header>
        <h1 className="text-2xl font-semibold">Bacheca</h1>
        <p className="text-muted-foreground text-sm">
          Comunicazioni ed eventi della scuola.
        </p>
      </header>
      {news.length === 0 ? (
        <EmptyState
          icon={<Newspaper className="h-10 w-10" />}
          title="Nessuna comunicazione"
          description="Quando ci sono comunicazioni o eventi, li trovi qui."
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
  return (
    <article className="space-y-3 rounded-sm border bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="label-font text-primary text-xs">
              {item.type === "event" ? "Evento" : "Comunicazione"}
            </span>
            {item.pinned && <Pin className="text-primary h-3.5 w-3.5" />}
          </div>
          <h2 className="text-xl font-semibold">{item.title}</h2>
        </div>
        <time className="text-muted-foreground shrink-0 text-xs">
          {formatDate(item.published_at)}
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
              {formatDateTime(item.event_date)}
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

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("it-IT", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat("it-IT", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}
