"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { signOut } from "@/lib/actions/auth";
import { revokePushSubscriptionOnSignOut } from "@/lib/actions/push-notifications";
import { unsubscribeFromTrainingReminders } from "@/lib/push-client";

export function SignOutButton() {
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
      className="w-full"
    >
      <LogOut className="mr-2 h-4 w-4" />
      Esci
    </Button>
  );
}

async function clearClientState() {
  try {
    const endpoint = await unsubscribeFromTrainingReminders();
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
