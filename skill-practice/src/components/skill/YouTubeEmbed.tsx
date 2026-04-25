import { toYouTubeEmbedUrl } from "@/lib/youtube";

type Props = {
  videoUrl: string;
  title?: string;
};

export function YouTubeEmbed({ videoUrl, title }: Props) {
  const embedUrl = toYouTubeEmbedUrl(videoUrl);

  if (!embedUrl) {
    return (
      <div className="bg-muted text-muted-foreground flex aspect-video w-full items-center justify-center rounded-lg text-sm">
        Video non disponibile
      </div>
    );
  }

  return (
    <div className="aspect-video w-full overflow-hidden rounded-lg bg-black">
      <iframe
        src={embedUrl}
        title={title ?? "Video"}
        className="h-full w-full"
        loading="lazy"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}
