"use client";

import { useState } from "react";
import Image from "next/image";
import { Play, VideoOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { extractYouTubeId } from "@/lib/youtube";
import { localVideoThumbnailUrl } from "@/lib/skill-video";
import { YouTubePlayback } from "./YouTubePlayback";

type Props = {
  videoUrl: string;
  title: string;
  thumbnailUrl?: string | null;
};

export function VideoPlayer({
  videoUrl,
  title,
  thumbnailUrl,
}: Props) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [failedThumbnailUrl, setFailedThumbnailUrl] = useState<string | null>(null);
  const videoId = extractYouTubeId(videoUrl);
  const safeThumbnailUrl = localVideoThumbnailUrl(thumbnailUrl);
  const showThumbnail =
    safeThumbnailUrl !== null && failedThumbnailUrl !== safeThumbnailUrl;

  if (!videoId) {
    return <UnavailablePlaceholder />;
  }

  return (
    <div className="space-y-2">
      {isPlaying ? (
        <YouTubePlayback key={videoId} videoId={videoId} title={title} />
      ) : (
        <Button
          type="button"
          variant="outline"
          onClick={() => setIsPlaying(true)}
          aria-label={`Riproduci video: ${title}`}
          className="relative aspect-video h-auto min-h-[200px] w-full flex-col gap-3 overflow-hidden whitespace-normal p-4"
        >
          {showThumbnail && (
            <>
              <Image
                src={safeThumbnailUrl}
                alt=""
                fill
                unoptimized
                className="object-cover"
                onError={() => setFailedThumbnailUrl(safeThumbnailUrl)}
              />
              <span aria-hidden className="absolute inset-0 bg-black/75" />
            </>
          )}
          <span className="bg-primary text-primary-foreground relative flex h-14 w-14 shrink-0 items-center justify-center rounded-full shadow-lg">
            <Play className="ml-0.5 size-6" fill="currentColor" aria-hidden />
          </span>
          <span className="relative space-y-1 text-center">
            <span className="block text-sm font-medium">Riproduci video</span>
            <span className="text-muted-foreground block text-xs leading-relaxed">
              {title}
            </span>
          </span>
        </Button>
      )}
      <p className="text-muted-foreground text-xs">
        YouTube viene caricato solo dopo Play.
      </p>
    </div>
  );
}

function UnavailablePlaceholder() {
  return (
    <p className="text-muted-foreground flex items-center gap-2 text-sm">
      <VideoOff className="h-4 w-4 shrink-0" aria-hidden />
      Video non ancora disponibile.
    </p>
  );
}
