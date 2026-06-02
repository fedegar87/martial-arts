"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export function BackButton() {
  const router = useRouter();
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      aria-label="Indietro"
      className="-ml-2"
      onClick={() => {
        if (window.history.length > 1) router.back();
        else router.push("/library");
      }}
    >
      <ChevronLeft className="h-4 w-4" />
      Indietro
    </Button>
  );
}
