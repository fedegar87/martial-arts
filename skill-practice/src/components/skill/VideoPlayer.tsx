"use client";

import { useState } from "react";
import { Play } from "lucide-react";
import { extractYouTubeId } from "@/lib/youtube";
import { PracticeModeBadge } from "@/components/skill/PracticeModeBadge";
import { CategoryIcon } from "@/components/skill/CategoryIcon";
import type { PracticeMode, SkillCategory } from "@/lib/types";

type Props = {
  videoUrl: string;
  title: string;
  category?: SkillCategory;
  practiceMode?: PracticeMode;
};

export function VideoPlayer({
  videoUrl,
  title,
  category,
  practiceMode,
}: Props) {
  const [isPlaying, setIsPlaying] = useState(false);
  const videoId = extractYouTubeId(videoUrl);

  if (!videoId) {
    return <UnavailablePlaceholder category={category} />;
  }

  if (isPlaying) {
    return (
      <div className="relative w-full">
        <div className="aspect-video w-full overflow-hidden rounded-md bg-black">
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&playsinline=1`}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="h-full w-full border-0"
          />
        </div>
        {practiceMode && (
          <div className="absolute right-2 top-2">
            <PracticeModeBadge mode={practiceMode} compact />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative w-full">
      <button
        type="button"
        onClick={() => setIsPlaying(true)}
        aria-label={`Riproduci video: ${title}`}
        className="tap-feedback hairline bg-card hover:bg-primary/10 active:bg-primary/20 focus-visible:outline-primary flex aspect-video w-full cursor-pointer flex-col items-center justify-center gap-3 rounded-md border filter sepia-[0.12] transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-2"
      >
        <CategoryIcon category={category} className="text-primary h-8 w-8" />
        <span className="text-foreground px-4 text-center text-sm font-medium leading-tight">
          {title}
        </span>
        <span className="bg-primary text-primary-foreground flex h-14 w-14 items-center justify-center rounded-full shadow-lg">
          <Play className="ml-0.5 h-6 w-6" fill="currentColor" aria-hidden />
        </span>
      </button>
      {practiceMode && (
        <div className="absolute right-2 top-2">
          <PracticeModeBadge mode={practiceMode} compact />
        </div>
      )}
    </div>
  );
}

function UnavailablePlaceholder({ category }: { category?: SkillCategory }) {
  return (
    <div className="surface-inset flex aspect-video w-full flex-col items-center justify-center gap-2 rounded-md filter sepia-[0.12]">
      <CategoryIcon category={category} className="text-primary/80 h-7 w-7" />
      <span className="text-muted-foreground text-sm">
        Video non ancora disponibile
      </span>
    </div>
  );
}
