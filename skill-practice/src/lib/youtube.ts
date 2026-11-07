export function extractYouTubeId(url: string): string | null {
  const value = url.trim();
  const validId = /^[a-zA-Z0-9_-]{11}$/;
  if (!value || value.includes("PLACEHOLDER")) return null;
  if (validId.test(value)) return value;

  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    return null;
  }

  if (
    !["https:", "http:"].includes(parsed.protocol) ||
    parsed.username ||
    parsed.password ||
    parsed.port
  ) {
    return null;
  }

  const host = parsed.hostname.replace(/^www\./, "");
  let id: string | null = null;

  if (host === "youtube.com" || host === "m.youtube.com") {
    if (parsed.pathname === "/watch") {
      const ids = parsed.searchParams.getAll("v");
      id = ids.length === 1 ? ids[0] : null;
    } else {
      id = parsed.pathname.match(/^\/(?:embed|shorts)\/([^/]+)\/?$/)?.[1] ?? null;
    }
  } else if (host === "youtu.be") {
    id = parsed.pathname.match(/^\/([^/]+)\/?$/)?.[1] ?? null;
  } else if (host === "youtube-nocookie.com") {
    id = parsed.pathname.match(/^\/embed\/([^/]+)\/?$/)?.[1] ?? null;
  }

  return id && validId.test(id) ? id : null;
}

export function hasPlayableVideo(url: string | null | undefined): boolean {
  return extractYouTubeId(url ?? "") !== null;
}
