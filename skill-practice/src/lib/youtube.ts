/**
 * Converte un URL YouTube (watch?v=, youtu.be, embed) nel formato embed con rel=0.
 * Ritorna null se l'URL non è riconosciuto.
 */
export function toYouTubeEmbedUrl(url: string): string | null {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }

  const host = parsed.hostname.replace(/^www\./, "");

  let videoId: string | null = null;

  if (host === "youtube.com" || host === "m.youtube.com") {
    if (parsed.pathname === "/watch") {
      videoId = parsed.searchParams.get("v");
    } else if (parsed.pathname.startsWith("/embed/")) {
      videoId = parsed.pathname.slice("/embed/".length).split("/")[0] || null;
    } else if (parsed.pathname.startsWith("/shorts/")) {
      videoId = parsed.pathname.slice("/shorts/".length).split("/")[0] || null;
    }
  } else if (host === "youtu.be") {
    videoId = parsed.pathname.slice(1).split("/")[0] || null;
  }

  if (!videoId) return null;

  return `https://www.youtube.com/embed/${videoId}?rel=0`;
}
