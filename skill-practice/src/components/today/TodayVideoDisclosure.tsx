"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { ChevronUp, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VideoPlayer } from "@/components/skill/VideoPlayer";
import { hasPlayableVideo } from "@/lib/youtube";

type Props = {
  skillId: string;
  skillName: string;
  videoUrl: string;
  secondaryVideoUrl?: string | null;
};

export function TodayVideoDisclosure({
  skillId,
  skillName,
  videoUrl,
  secondaryVideoUrl,
}: Props) {
  const [open, setOpen] = useState(false);
  const panelId = useId();

  if (!hasPlayableVideo(videoUrl)) {
    return (
      <p className="text-muted-foreground text-xs">
        Video non ancora disponibile.
      </p>
    );
  }

  const hasSecondary = hasPlayableVideo(secondaryVideoUrl);

  return (
    <div className="space-y-3">
      <Button
        type="button"
        variant="outline"
        size="sm"
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        onClick={() => setOpen((current) => !current)}
      >
        {open ? (
          <>
            <ChevronUp aria-hidden />
            Chiudi video
          </>
        ) : (
          <>
            <Play aria-hidden />
            Ripassa il video
          </>
        )}
      </Button>
      {open && (
        <div id={panelId} className="space-y-2">
          <VideoPlayer videoUrl={videoUrl} title={skillName} />
          {hasSecondary && (
            <div>
              <Button
                asChild
                variant="link"
                size="xs"
                className="h-auto px-0 whitespace-normal"
              >
                <Link href={`/skill/${skillId}`}>
                  Vedi anche il secondo video nella scheda
                </Link>
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
