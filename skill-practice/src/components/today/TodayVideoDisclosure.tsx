"use client";
import { useTranslations } from "next-intl";

import { VideoPlayer } from "@/components/skill/VideoPlayer";
import { Button } from "@/components/ui/button";
import { getSkillVideoVariants } from "@/lib/skill-video";
import { ChevronUp, Play } from "lucide-react";
import Link from "next/link";
import { useId, useState } from "react";

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
  const tr = useTranslations("ui");
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const variants = getSkillVideoVariants(
    {
      video_url: videoUrl,
      secondary_video_url: secondaryVideoUrl ?? null,
      video_label: null,
      secondary_video_label: null,
      thumbnail_url: null,
    },
    tr,
  );
  const firstVideo = variants[0];

  if (!firstVideo) {
    return (
      <p className="text-muted-foreground text-xs">{tr("videoUnavailable")}</p>
    );
  }

  const hasSecondary = variants.length > 1;

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
            {tr("closeVideo")}
          </>
        ) : (
          <>
            <Play aria-hidden />
            {tr("reviewVideo")}
          </>
        )}
      </Button>
      {open && (
        <div id={panelId} className="space-y-2">
          <VideoPlayer
            key={firstVideo.videoId}
            videoUrl={firstVideo.url}
            title={skillName}
          />
          {hasSecondary && (
            <div>
              <Button
                asChild
                variant="link"
                size="xs"
                className="h-auto px-0 whitespace-normal"
              >
                <Link href={`/skill/${skillId}?v=2`}>
                  {tr("secondVideoHint")}
                </Link>
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
