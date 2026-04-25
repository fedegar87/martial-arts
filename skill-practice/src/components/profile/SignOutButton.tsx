"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { signOut } from "@/lib/actions/auth";

export function SignOutButton() {
  const [pending, start] = useTransition();

  function handleClick() {
    start(async () => {
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
