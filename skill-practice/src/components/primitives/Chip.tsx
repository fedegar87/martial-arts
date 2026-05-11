import * as React from "react";
import { cn } from "@/lib/utils";

type ChipTone = "neutral" | "accent";
type ChipSize = "sm" | "md";

type ChipOptions = {
  active?: boolean;
  muted?: boolean;
  tone?: ChipTone;
  size?: ChipSize;
  className?: string;
};

export function chipClassName({
  active = false,
  muted = false,
  tone = "accent",
  size = "md",
  className,
}: ChipOptions = {}) {
  return cn(
    "tap-feedback label-font inline-flex min-w-0 max-w-full items-center justify-center gap-2 rounded-md border text-sm transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
    size === "sm" ? "min-h-8 px-2 text-xs" : "min-h-11 px-3",
    active
      ? tone === "accent"
        ? "border-primary bg-primary/10 text-primary"
        : "border-border bg-card text-foreground"
      : "border-border bg-card text-muted-foreground hover:bg-muted/50 hover:text-foreground",
    muted && "opacity-45",
    className,
  );
}

export function ChipButton({
  active,
  muted,
  tone,
  size,
  className,
  ...props
}: React.ComponentProps<"button"> & ChipOptions) {
  return (
    <button
      type="button"
      aria-pressed={active}
      className={chipClassName({ active, muted, tone, size, className })}
      {...props}
    />
  );
}
