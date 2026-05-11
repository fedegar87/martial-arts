import * as React from "react";
import { cn } from "@/lib/utils";

type FormSelectProps = React.ComponentProps<"select"> & {
  label?: React.ReactNode;
  helperText?: React.ReactNode;
  wrapperClassName?: string;
};

export function formSelectClassName(className?: string) {
  return cn(
    "min-h-11 w-full rounded-md border border-input bg-background px-3 text-sm transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
    className,
  );
}

export function FormSelect({
  label,
  helperText,
  wrapperClassName,
  className,
  children,
  ...props
}: FormSelectProps) {
  return (
    <label className={cn("block space-y-1.5 text-sm", wrapperClassName)}>
      {label && <span className="text-muted-foreground">{label}</span>}
      <select className={formSelectClassName(className)} {...props}>
        {children}
      </select>
      {helperText}
    </label>
  );
}
