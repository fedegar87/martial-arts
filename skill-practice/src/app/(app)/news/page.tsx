import type { UiTranslator } from "@/lib/i18n/config";

import { CalendarEventCard } from "@/components/calendar/CalendarEventCard";
import { BulletinHeader } from "@/components/news/BulletinHeader";
import { NewsSeenMarker } from "@/components/news/NewsSeenMarker";
import { EmptyState } from "@/components/shared/EmptyState";
import { Card, CardContent } from "@/components/ui/card";
import { localDateKey } from "@/lib/date";
import { getFederationCalendarData } from "@/lib/queries/federation-events";
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

  const today = localDateKey();
  const [news, federation] = await Promise.all([
    listNewsForSchool(profile.school_id),
    getFederationCalendarData(
      profile.id,
      today,
      `${Number(today.slice(0, 4)) + 1}-12-31`,
    ),
  ]);
  const upcoming = federation.events.slice(0, 3);
  const eventDate = (value: string) =>
    new Intl.DateTimeFormat(tr("locale"), {
      day: "numeric",
      month: "short",
      year: "numeric",
      timeZone: "UTC",
    }).format(new Date(`${value}T00:00:00Z`));

  return (
    <div className="space-y-6">
      <NewsSeenMarker enabled={news.length > 0} />
      <BulletinHeader active="communications" />
      <section aria-labelledby="upcoming-events" className="space-y-3">
        <h2 id="upcoming-events" className="text-lg font-semibold">
          {tr("upcomingEvents")}
        </h2>
        <Card>
          <CardContent>
            {federation.unavailable ? (
              <p role="status" className="text-muted-foreground text-sm">
                {tr("eventsUnavailable")}
              </p>
            ) : upcoming.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                {tr("noUpcomingEvents")}
              </p>
            ) : (
              <ul className="divide-border divide-y">
                {upcoming.map((event) => (
                  <li key={event.id} className="py-2 first:pt-0 last:pb-0">
                    <p className="text-primary text-xs">
                      <time dateTime={event.starts_on}>
                        {eventDate(event.starts_on)}
                      </time>
                      {event.ends_on !== event.starts_on && (
                        <>
                          {" "}
                          –{" "}
                          <time dateTime={event.ends_on}>
                            {eventDate(event.ends_on)}
                          </time>
                        </>
                      )}
                    </p>
                    <CalendarEventCard
                      event={event}
                      publicVapidKey={
                        process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? ""
                      }
                      reminderTime={federation.reminderTime}
                    />
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </section>
      <section aria-labelledby="communications" className="space-y-3">
        <h2 id="communications" className="text-lg font-semibold">
          {tr("communications")}
        </h2>
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
      </section>
    </div>
  );
}

function NewsCard({ item }: { item: NewsItem }) {
  const tr = useTranslations("ui");
  return (
    <article>
      <Card>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0 space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="label-font text-primary text-xs">
                  {item.type === "event" ? tr("event") : tr("announcement")}
                </span>
                {item.pinned && (
                  <Pin
                    className="text-primary h-3.5 w-3.5"
                    aria-label={tr("pinnedAnnouncement")}
                  />
                )}
              </div>
              <h3 className="text-lg font-semibold wrap-anywhere">
                {item.title}
              </h3>
            </div>
            <time
              dateTime={item.published_at}
              className="text-muted-foreground text-xs"
            >
              {formatDate(tr, item.published_at)}
            </time>
          </div>
          <p className="text-muted-foreground whitespace-pre-wrap wrap-anywhere text-sm leading-relaxed">
            {item.body}
          </p>
          {(item.event_date || item.event_location) && (
            <div className="border-border flex flex-col gap-1 border-t pt-3 text-sm sm:flex-row sm:items-center sm:gap-4">
              {item.event_date && (
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <CalendarDays className="h-4 w-4 shrink-0" aria-hidden />
                  {formatDateTime(tr, item.event_date)}
                </span>
              )}
              {item.event_location && (
                <span className="text-muted-foreground flex items-center gap-1.5 wrap-anywhere">
                  <MapPin className="h-4 w-4 shrink-0" aria-hidden />
                  {item.event_location}
                </span>
              )}
            </div>
          )}
        </CardContent>
      </Card>
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
