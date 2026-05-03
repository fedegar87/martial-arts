import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
  }

  const [
    profileResult,
    planItemsResult,
    practiceLogsResult,
    trainingScheduleResult,
    weeklyReflectionsResult,
    deletionRequestsResult,
  ] = await Promise.all([
    supabase
      .from("user_profiles")
      .select("*, school:schools(name)")
      .eq("id", user.id)
      .maybeSingle(),
    supabase
      .from("user_plan_items")
      .select("*, skill:skills(id, name, name_italian, discipline, category)")
      .eq("user_id", user.id)
      .order("added_at", { ascending: true }),
    supabase
      .from("practice_logs")
      .select("*")
      .eq("user_id", user.id)
      .order("date", { ascending: true })
      .order("created_at", { ascending: true }),
    supabase
      .from("training_schedule")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle(),
    supabase
      .from("weekly_reflections")
      .select("*")
      .eq("user_id", user.id)
      .order("week_start", { ascending: true }),
    supabase
      .from("account_deletion_requests")
      .select("*")
      .eq("user_id", user.id)
      .order("requested_at", { ascending: true }),
  ]);

  const exportedAt = new Date().toISOString();
  const payload = {
    exported_at: exportedAt,
    account: {
      user_id: user.id,
      email: user.email ?? null,
    },
    profile: profileResult.data ?? null,
    plan_items: planItemsResult.data ?? [],
    practice_logs: practiceLogsResult.data ?? [],
    training_schedule: trainingScheduleResult.data ?? null,
    weekly_reflections: weeklyReflectionsResult.data ?? [],
    account_deletion_requests: deletionRequestsResult.data ?? [],
  };

  const fileDate = exportedAt.slice(0, 10);
  return new NextResponse(JSON.stringify(payload, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="kung-fu-practice-export-${fileDate}.json"`,
      "Cache-Control": "no-store",
    },
  });
}
