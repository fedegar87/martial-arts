"use client";

import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  disableFederationEventReminder,
  enableFederationEventReminder,
} from "@/lib/actions/federation-events";
import { brand } from "@/lib/brand";
import { formatFederationEventTime } from "@/lib/federation-event-logic";
import {
  getPushSupportState,
  pushSupportErrorMessage,
  subscribeToPushNotifications,
} from "@/lib/push-client";
import type { CalendarFederationEvent } from "@/lib/types";
import { Bell, BellOff, ChevronRight, ExternalLink, X } from "lucide-react";
import { useState, useTransition } from "react";

type Props = {
  event: CalendarFederationEvent;
  publicVapidKey: string;
  reminderTime: string;
};

export function CalendarEventCard({
  event,
  publicVapidKey,
  reminderTime,
}: Props) {
  const tr = useTranslations("ui");
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(event.reminderSelected);
  const [feedback, setFeedback] = useState<{
    text: string;
    error: boolean;
  } | null>(null);
  const [pending, startTransition] = useTransition();
  const time = formatFederationEventTime(event, tr("locale"));
  const date = (value: string) =>
    new Intl.DateTimeFormat(tr("locale"), {
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    }).format(new Date(`${value}T00:00:00Z`));

  function handleReminder() {
    setFeedback(null);
    if (!selected) {
      const support = getPushSupportState(publicVapidKey);
      if (support !== "supported") {
        setFeedback({
          text: pushSupportErrorMessage(support, tr),
          error: true,
        });
        return;
      }
    }
    startTransition(async () => {
      try {
        const result = selected
          ? await disableFederationEventReminder(event.id)
          : await enableFederationEventReminder({
              eventId: event.id,
              subscription: await subscribeToPushNotifications(
                publicVapidKey,
                tr,
              ),
              timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
              userAgent: navigator.userAgent,
            });
        if ("error" in result) setFeedback({ text: result.error, error: true });
        else {
          setSelected(!selected);
          setFeedback({
            text: selected ? tr("reminderRemoved") : tr("reminderEnabled"),
            error: false,
          });
        }
      } catch (error) {
        setFeedback({
          text: error instanceof Error ? error.message : tr("operationFailed"),
          error: true,
        });
      }
      setOpen(true);
    });
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          className="h-auto min-h-12 w-full justify-between gap-3 px-0 py-2 text-left whitespace-normal"
        >
          <span className="min-w-0">
            <span className="block normal-case tracking-normal wrap-anywhere">
              {event.title}
            </span>
            <span className="text-muted-foreground block text-xs font-normal normal-case tracking-normal wrap-anywhere">
              {event.cancelled
                ? tr("cancelled")
                : [time, event.location].filter(Boolean).join(" · ")}
            </span>
          </span>
          <ChevronRight className="h-4 w-4 shrink-0" aria-hidden />
        </Button>
      </SheetTrigger>
      <SheetContent
        side="bottom"
        showCloseButton={false}
        className="material-sheet overscroll-contain pb-[env(safe-area-inset-bottom)]"
      >
        <SheetHeader className="pr-16">
          <SheetTitle className="wrap-anywhere">{event.title}</SheetTitle>
          <SheetDescription>
            {date(event.starts_on)}
            {event.ends_on !== event.starts_on && ` – ${date(event.ends_on)}`}
            {" · "}
            {event.cancelled ? tr("cancelled") : time}
          </SheetDescription>
        </SheetHeader>
        <SheetClose asChild>
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 min-h-12 min-w-12"
            aria-label={tr("close")}
          >
            <X className="h-5 w-5" aria-hidden />
          </Button>
        </SheetClose>
        <div className="space-y-4 px-4 pb-4">
          {event.location && (
            <p className="text-sm wrap-anywhere">{event.location}</p>
          )}
          {event.description && (
            <p className="text-sm whitespace-pre-line wrap-anywhere">
              {event.description}
            </p>
          )}
          {(selected || (publicVapidKey && event.canRemind)) && (
            <div className="space-y-2">
              <Button
                variant="outline"
                onClick={handleReminder}
                disabled={pending}
              >
                {selected ? (
                  <BellOff className="h-4 w-4" aria-hidden />
                ) : (
                  <Bell className="h-4 w-4" aria-hidden />
                )}
                {pending
                  ? tr("saving")
                  : selected
                    ? tr("removeReminder")
                    : tr("remindMe")}
              </Button>
              <p className="text-muted-foreground text-xs">
                {tr("dayBeforeAt")} {reminderTime}
                {tr("atReminderTime")}
              </p>
            </div>
          )}
          {feedback && (
            <p
              className={
                feedback.error
                  ? "text-destructive text-sm"
                  : "text-muted-foreground text-sm"
              }
              role={feedback.error ? "alert" : "status"}
            >
              {feedback.text}
            </p>
          )}
          <Button asChild variant="link" className="px-0">
            <a
              href={brand.calendar.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              {tr("officialCalendar")}{" "}
              <ExternalLink className="h-3.5 w-3.5" aria-hidden />
            </a>
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
