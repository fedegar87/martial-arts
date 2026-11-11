import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { brand } from "@/lib/brand";

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
    customProgramsResult,
    practiceLogsResult,
    trainingScheduleResult,
    notificationPreferencesResult,
    pushSubscriptionsResult,
    notificationDeliveriesResult,
    federationEventRemindersResult,
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
    supabase.from("custom_programs").select("*").eq("user_id", user.id).order("created_at"),
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
      .from("notification_preferences")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle(),
    supabase
      .from("push_subscriptions")
      .select("id, endpoint, user_agent, created_at, last_seen_at, revoked_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true }),
    supabase
      .from("notification_deliveries")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true }),
    supabase
      .from("federation_event_reminders")
      .select("event_id,created_at,event:federation_events(id,title,starts_at,starts_on,cancelled)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true }),
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

  const queryError = [
    profileResult,
    planItemsResult,
    customProgramsResult,
    practiceLogsResult,
    trainingScheduleResult,
    notificationPreferencesResult,
    pushSubscriptionsResult,
    notificationDeliveriesResult,
    federationEventRemindersResult,
    weeklyReflectionsResult,
    deletionRequestsResult,
  ].find((result) => result.error);

  // Un export GDPR non deve apparire completo se una sezione e fallita.
  if (queryError?.error) {
    return NextResponse.json(
      { error: "Export incompleto, riprova." },
      { status: 500 },
    );
  }

  const exportedAt = new Date().toISOString();
  const payload = {
    exported_at: exportedAt,
    account: {
      user_id: user.id,
      email: user.email ?? null,
    },
    profile: profileResult.data ?? null,
    plan_items: planItemsResult.data ?? [],
    custom_programs: customProgramsResult.data ?? [],
    practice_logs: practiceLogsResult.data ?? [],
    training_schedule: trainingScheduleResult.data ?? null,
    notification_preferences: notificationPreferencesResult.data ?? null,
    push_subscriptions: pushSubscriptionsResult.data ?? [],
    notification_deliveries: notificationDeliveriesResult.data ?? [],
    federation_event_reminders: federationEventRemindersResult.data ?? [],
    weekly_reflections: weeklyReflectionsResult.data ?? [],
    account_deletion_requests: deletionRequestsResult.data ?? [],
  };

  const fileDate = exportedAt.slice(0, 10);
  return new NextResponse(JSON.stringify(payload, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="${brand.exportSlug}-export-${fileDate}.json"`,
      "Cache-Control": "no-store",
    },
  });
}
