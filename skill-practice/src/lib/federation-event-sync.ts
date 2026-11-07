import "server-only";
import { brand } from "./brand.ts";
import { localDateKey } from "./date.ts";
import { parseFederationCalendar } from "./ical-events.ts";
import { createAdminClient } from "./supabase/admin.ts";

const MAX_FEED_BYTES = 2 * 1024 * 1024;

export async function syncFederationEvents({ force = false, now = new Date() } = {}) {
  const supabase = createAdminClient();
  if (!force) {
    const { data, error } = await supabase.from("federation_events").select("synced_at")
      .order("synced_at", { ascending: false }).limit(1).maybeSingle();
    if (error) throw new Error("Schema calendario federale non disponibile.", { cause: error });
    if (data && now.getTime() - Date.parse(data.synced_at) < 60 * 60 * 1000) return { skipped: true, imported: 0 };
  }
  const url = new URL(brand.calendar.feedUrl);
  if (url.protocol !== "https:" || url.hostname !== "calendar.google.com"
    || url.username || url.password || !url.pathname.endsWith("/public/basic.ics")) {
    throw new Error("Fonte calendario non valida.");
  }
  const response = await fetch(url, { cache: "no-store", redirect: "error", signal: AbortSignal.timeout(10000) });
  if (!response.ok || !response.body) throw new Error("Fonte calendario non disponibile.");
  if (Number(response.headers.get("content-length")) > MAX_FEED_BYTES) throw new Error("Calendario troppo grande.");
  const reader = response.body.getReader();
  const decoder = new TextDecoder("utf-8", { fatal: true });
  let size = 0;
  let text = "";
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > MAX_FEED_BYTES) throw new Error("Calendario troppo grande.");
      text += decoder.decode(value, { stream: true });
    }
    text += decoder.decode();
  } finally {
    await reader.cancel().catch(() => {});
    reader.releaseLock();
  }
  const year = Number(localDateKey(now, brand.calendar.timeZone).slice(0, 4));
  const from = `${year}-01-01`;
  const to = `${year + 1}-12-31`;
  const events = parseFederationCalendar(text, { from, to, timeZone: brand.calendar.timeZone });
  const { data, error } = await supabase.rpc("sync_federation_events", {
    p_events: events, p_from: from, p_to: to, p_fetched_at: now.toISOString(),
  });
  if (error) throw new Error("Sincronizzazione calendario non riuscita.", { cause: error });
  return { skipped: false, imported: Number(data) };
}
