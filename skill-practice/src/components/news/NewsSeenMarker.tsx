"use client";

import { useEffect, useTransition } from "react";
import { markNewsAsSeen } from "@/lib/actions/news";

type Props = {
  enabled: boolean;
};

export function NewsSeenMarker({ enabled }: Props) {
  const [, startTransition] = useTransition();

  useEffect(() => {
    if (!enabled) return;
    startTransition(async () => {
      await markNewsAsSeen();
    });
  }, [enabled]);

  return null;
}
