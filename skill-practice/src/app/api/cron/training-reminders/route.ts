import { timingSafeEqual } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { sendDueTrainingReminders } from "@/lib/training-reminder-sender";
import { syncFederationEvents } from "@/lib/federation-event-sync";
import { sendDueEventReminders } from "@/lib/event-reminder-sender";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let calendarAvailable = true;
  try {
    await syncFederationEvents();
  } catch {
    calendarAvailable = false;
    console.error("Federation calendar sync failed; event reminders skipped.");
  }
  const result = {
    ...await sendDueTrainingReminders(),
    events: calendarAvailable ? await sendDueEventReminders() : { sourceUnavailable: true },
  };
  return NextResponse.json(result, {
    headers: {
      "Cache-Control": "no-store",
    },
  });
}

export const POST = GET;

function isAuthorized(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) return false;

  const authorization = request.headers.get("authorization");
  if (!authorization?.startsWith("Bearer ")) return false;

  const provided = Buffer.from(authorization.slice("Bearer ".length));
  const expected = Buffer.from(secret);
  if (provided.length !== expected.length) return false;

  return timingSafeEqual(provided, expected);
}
