import { NextResponse, type NextRequest } from "next/server";
import { sendDueTrainingReminders } from "@/lib/training-reminder-sender";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await sendDueTrainingReminders();
  return NextResponse.json(result, {
    headers: {
      "Cache-Control": "no-store",
    },
  });
}

function isAuthorized(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;

  const authorization = request.headers.get("authorization");
  if (authorization === `Bearer ${secret}`) return true;

  return request.nextUrl.searchParams.get("secret") === secret;
}
