"use client";
import type { UiTranslator } from "@/lib/i18n/config";

import { useTranslations } from "next-intl";

import { ChipButton } from "@/components/primitives/Chip";
import {
  loadYouTubeApi,
  supportedPlaybackRates,
  type YouTubePlayer,
} from "@/lib/youtube-api";
import { useEffect, useRef, useState } from "react";

type Props = { videoId: string; title: string };

function rateLabel(tr: UiTranslator, rate: number): string {
  return `${rate.toLocaleString(tr("locale"))}×`;
}

export function YouTubePlayback({ videoId, title }: Props) {
  const tr = useTranslations("ui");
  const hostRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YouTubePlayer | null>(null);
  const [rates, setRates] = useState<number[]>([]);
  const [rate, setRate] = useState(1);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    let disposed = false;
    let connectedPlayer: YouTubePlayer | null = null;
    // The API owns the iframe; React only owns its container.
    const frame = document.createElement("iframe");
    const params = new URLSearchParams({
      autoplay: "1",
      rel: "0",
      playsinline: "1",
      enablejsapi: "1",
      origin: window.location.origin,
    });
    frame.src = `https://www.youtube-nocookie.com/embed/${videoId}?${params}`;
    frame.title = title;
    frame.allow = "autoplay; encrypted-media; picture-in-picture";
    frame.allowFullscreen = true;
    frame.referrerPolicy = "strict-origin-when-cross-origin";
    frame.className = "absolute inset-0 h-full w-full border-0";
    host.append(frame);
    frame.focus({ preventScroll: true });

    void loadYouTubeApi()
      .then((api) => {
        if (disposed) return;
        connectedPlayer = new api.Player(frame, {
          events: {
            onReady(event) {
              if (disposed) return;
              playerRef.current = event.target;
              setRates(
                supportedPlaybackRates(
                  event.target.getAvailablePlaybackRates(),
                ),
              );
              event.target.setPlaybackRate(1);
              setRate(event.target.getPlaybackRate());
            },
            onPlaybackRateChange(event) {
              if (!disposed && Number.isFinite(event.data)) setRate(event.data);
            },
            onError() {
              if (!disposed) setRates([]);
            },
          },
        });
      })
      .catch(() => {
        if (!disposed && !host.querySelector("iframe")) host.append(frame);
      });

    return () => {
      disposed = true;
      playerRef.current = null;
      try {
        connectedPlayer?.destroy();
      } catch {
        frame.remove();
      }
      host.replaceChildren();
    };
  }, [videoId, title]);

  return (
    <div className="space-y-2">
      <div
        ref={hostRef}
        className="relative aspect-video min-h-[200px] w-full overflow-hidden rounded-md bg-black"
      />
      {rates.length > 1 && (
        <div
          className="flex flex-wrap items-center gap-2"
          role="group"
          aria-label={tr("videoSpeed")}
        >
          <span className="text-muted-foreground text-xs">
            {tr("speed")}
            {rates.includes(rate) ? "" : ` (${rateLabel(tr, rate)})`}
          </span>
          {rates.map((value) => (
            <ChipButton
              key={value}
              size="sm"
              tone="neutral"
              className="min-h-11 min-w-11"
              active={rate === value}
              aria-label={tr("speedValue", { p0: rateLabel(tr, value) })}
              onClick={() => {
                try {
                  playerRef.current?.setPlaybackRate(value);
                } catch {
                  setRates([]);
                }
              }}
            >
              {rateLabel(tr, value)}
            </ChipButton>
          ))}
        </div>
      )}
    </div>
  );
}
