"use client";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export function BackButton() {
  const tr = useTranslations("ui");
  const router = useRouter();
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      aria-label={tr("back")}
      className="-ml-2"
      onClick={() => {
        if (window.history.length > 1) router.back();
        else router.push("/library");
      }}
    >
      <ChevronLeft className="h-4 w-4" />
      {tr("back")}
    </Button>
  );
}
