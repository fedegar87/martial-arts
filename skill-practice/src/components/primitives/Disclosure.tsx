"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { Card } from "@/components/ui/card";

type Props = {
  title: string;
  summary?: ReactNode;
  revealKey?: unknown;
  children: ReactNode;
};

export function Disclosure({ title, summary, revealKey, children }: Props) {
  const detailsRef = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    // Reveal asynchronous feedback without controlling native open/close state.
    if (revealKey && detailsRef.current) detailsRef.current.open = true;
  }, [revealKey]);

  return (
    <Card className="gap-0 py-0">
      <details ref={detailsRef} className="group/disclosure">
        <summary className="tap-feedback flex min-h-14 cursor-pointer list-none items-center gap-3 px-4 py-3 focus-visible:outline-offset-[-2px] [&::-webkit-details-marker]:hidden">
          <span className="min-w-0 flex-1">
            <span className="font-heading block text-base font-medium">{title}</span>
            {summary && (
              <span className="text-muted-foreground mt-0.5 block text-sm">{summary}</span>
            )}
          </span>
          <ChevronDown
            className="text-muted-foreground h-4 w-4 shrink-0 transition-transform group-open/disclosure:rotate-180"
            aria-hidden
          />
        </summary>
        <div className="px-4 pb-4">{children}</div>
      </details>
    </Card>
  );
}
