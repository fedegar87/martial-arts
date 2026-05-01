import { Video, VideoOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { hasPlayableVideo } from "@/lib/youtube";
import { cn } from "@/lib/utils";

type Props = {
  videoUrl: string | null | undefined;
  compact?: boolean;
};

export function VideoAvailabilityBadge({ videoUrl, compact = false }: Props) {
  const available = hasPlayableVideo(videoUrl);
  const Icon = available ? Video : VideoOff;
  const label = available ? "Video disponibile" : "Video mancante";

  return (
    <Badge
      variant="outline"
      aria-label={label}
      title={compact ? label : undefined}
      className={cn(
        available
          ? "border-border bg-transparent text-muted-foreground"
          : "border-[color:var(--status-warning)] bg-transparent text-[var(--status-warning)]",
        compact && "px-1.5",
      )}
    >
      <Icon className={compact ? "h-3 w-3" : "mr-1 h-3 w-3"} />
      {!compact && label}
    </Badge>
  );
}
