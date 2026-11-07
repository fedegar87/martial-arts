"use server";

import { isLocale, LOCALE_COOKIE } from "@/lib/i18n/config";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

export async function setLocale(value: string): Promise<void> {
  if (!isLocale(value)) throw new Error("Unsupported locale");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) {
    const { error } = await supabase
      .from("notification_preferences")
      .update({ locale: value })
      .eq("user_id", user.id);
    if (error) throw new Error("Unable to save language preference");
  }
  (await cookies()).set(LOCALE_COOKIE, value, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  });
}
