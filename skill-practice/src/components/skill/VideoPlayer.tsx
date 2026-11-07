"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Play, VideoOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { extractYouTubeId } from "@/lib/youtube";
import { localVideoThumbnailUrl } from "@/lib/skill-video";

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
  const frameRef = useRef<HTMLIFrameElement>(null);
  const videoId = extractYouTubeId(videoUrl);
  const safeThumbnailUrl = localVideoThumbnailUrl(thumbnailUrl);
  const showThumbnail =
    safeThumbnailUrl !== null && failedThumbnailUrl !== safeThumbnailUrl;

  useEffect(() => {
    if (isPlaying) frameRef.current?.focus({ preventScroll: true });
  }, [isPlaying]);

  if (!videoId) {
    return <UnavailablePlaceholder />;
  }

  return (
    <div className="space-y-2">
      {isPlaying ? (
        <div className="relative aspect-video min-h-[200px] w-full overflow-hidden rounded-md bg-black">
          <iframe
            ref={frameRef}
            src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&playsinline=1`}
            title={title}
            allow="autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
            className="absolute inset-0 h-full w-full border-0"
          />
        </div>
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
