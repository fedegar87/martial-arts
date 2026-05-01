export function extractYouTubeId(url: string): string | null {
  if (!url || url.includes("PLACEHOLDER")) return null;
  if (/^[a-zA-Z0-9_-]{11}$/.test(url)) return url;

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }

  const host = parsed.hostname.replace(/^www\./, "");

  if (host === "youtube.com" || host === "m.youtube.com") {
    if (parsed.pathname === "/watch") return parsed.searchParams.get("v");
    if (parsed.pathname.startsWith("/embed/")) {
      return parsed.pathname.slice("/embed/".length).split("/")[0] || null;
    }
    if (parsed.pathname.startsWith("/shorts/")) {
      return parsed.pathname.slice("/shorts/".length).split("/")[0] || null;
    }
  }

  if (host === "youtu.be") {
    return parsed.pathname.slice(1).split("/")[0] || null;
  }

  return null;
}

export function hasPlayableVideo(url: string | null | undefined): boolean {
  return extractYouTubeId(url ?? "") !== null;
}
