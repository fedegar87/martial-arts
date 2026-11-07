"use client";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { signOut } from "@/lib/actions/auth";
import { revokePushSubscriptionOnSignOut } from "@/lib/actions/push-notifications";
import { unsubscribeFromPushNotifications } from "@/lib/push-client";
import { wrappingButtonClassName } from "@/lib/ui-classes";
import { LogOut } from "lucide-react";
import { useTransition } from "react";

export function SignOutButton() {
  const tr = useTranslations("ui");
  const [pending, start] = useTransition();

  function handleClick() {
    start(async () => {
      await clearClientState();
      await signOut();
    });
  }

  return (
    <Button
      variant="outline"
      onClick={handleClick}
      disabled={pending}
      className={`${wrappingButtonClassName} w-full`}
    >
      <LogOut className="mr-2 h-4 w-4" />
      {tr("signOut")}
    </Button>
  );
}

async function clearClientState() {
  try {
    const endpoint = await unsubscribeFromPushNotifications();
    if (endpoint) {
      await revokePushSubscriptionOnSignOut(endpoint);
    }
  } catch {
    // Push cleanup is best effort; server sign-out must never be blocked.
  }

  try {
    window.localStorage.clear();
    window.sessionStorage.clear();
  } catch {
    // Storage may be unavailable in private or restricted browsing modes.
  }

  if ("caches" in window) {
    try {
      const keys = await window.caches.keys();
      await Promise.all(keys.map((key) => window.caches.delete(key)));
    } catch {
      // Cache cleanup is best effort; server sign-out remains authoritative.
    }
  }
}
