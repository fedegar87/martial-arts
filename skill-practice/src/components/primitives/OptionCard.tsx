import * as React from "react";
import { cn } from "@/lib/utils";

type Props = React.ComponentProps<"label"> & {
  selected?: boolean;
  disabled?: boolean;
};

export function OptionCard({
  selected = false,
  disabled = false,
  className,
  ...props
}: Props) {
  return (
    <label
      data-selected={selected ? "" : undefined}
      data-disabled={disabled ? "" : undefined}
      className={cn(
        "tap-feedback flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-border bg-card px-4 py-2 text-sm transition-colors focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/30",
        selected && "border-primary bg-primary/10 text-foreground",
        !selected && "hover:bg-muted/50",
        disabled && "cursor-not-allowed opacity-50",
        className,
      )}
      {...props}
    />
  );
}
