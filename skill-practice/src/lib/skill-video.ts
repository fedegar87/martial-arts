import { extractYouTubeId } from "./youtube.ts";
import type { Skill } from "./types.ts";

type SkillVideos = Pick<
  Skill,
  | "video_url"
  | "video_label"
  | "secondary_video_url"
  | "secondary_video_label"
  | "thumbnail_url"
>;

export type SkillVideoVariant = {
  value: "1" | "2";
  videoId: string;
  url: string;
  label: string;
  thumbnailUrl: string | null;
};

export function localVideoThumbnailUrl(
  url: string | null | undefined,
): string | null {
  return url && /^\/video-thumbnails\/[a-zA-Z0-9][a-zA-Z0-9_-]*\.(?:avif|jpe?g|png|webp)$/i.test(url)
    ? url
    : null;
}

export function getSkillVideoVariants(skill: SkillVideos): SkillVideoVariant[] {
  const variants: SkillVideoVariant[] = [];
  const primaryId = extractYouTubeId(skill.video_url);
  const secondaryUrl = skill.secondary_video_url ?? "";
  const secondaryId = extractYouTubeId(secondaryUrl);

  if (primaryId) {
    variants.push({
      value: "1",
      videoId: primaryId,
      url: skill.video_url,
      label: skill.video_label?.trim() || "Video principale",
      thumbnailUrl: localVideoThumbnailUrl(skill.thumbnail_url),
    });
  }
  if (secondaryId && secondaryId !== primaryId) {
    variants.push({
      value: "2",
      videoId: secondaryId,
      url: secondaryUrl,
      label: skill.secondary_video_label?.trim() || "Secondo video",
      thumbnailUrl: null,
    });
  }
  return variants;
}

export function selectSkillVideo(
  variants: SkillVideoVariant[],
  requested: string | string[] | undefined,
): SkillVideoVariant | null {
  return (
    variants.find((variant) => variant.value === requested) ?? variants[0] ?? null
  );
}
