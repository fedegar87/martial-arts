import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { hasPlayableVideo } from "@/lib/youtube";
import { Video, VideoOff } from "lucide-react";
import { useTranslations } from "next-intl";

type Props = {
  videoUrl: string | null | undefined;
  secondaryVideoUrl?: string | null;
  compact?: boolean;
};

export function VideoAvailabilityBadge({
  videoUrl,
  secondaryVideoUrl,
  compact = false,
}: Props) {
  const tr = useTranslations("ui");
  const available =
    hasPlayableVideo(videoUrl) || hasPlayableVideo(secondaryVideoUrl);
  const Icon = available ? Video : VideoOff;
  const label = available ? tr("videoAvailable") : tr("videoMissing");

  return (
    <Badge
      variant="outline"
      aria-label={label}
      title={compact ? label : undefined}
      className={cn(
        available
          ? "border-primary bg-transparent text-primary"
          : "border-border bg-transparent text-muted-foreground",
        compact && "px-1.5",
      )}
    >
      <Icon className={compact ? "h-3 w-3" : "mr-1 h-3 w-3"} />
      {!compact && label}
    </Badge>
  );
}
