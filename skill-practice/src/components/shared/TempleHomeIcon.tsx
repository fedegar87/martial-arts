import { forwardRef } from "react";
import type { LucideProps } from "lucide-react";

export const TempleHomeIcon = forwardRef<SVGSVGElement, LucideProps>(
  ({ className, ...props }, ref) => (
    <svg
      ref={ref}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <path d="M4 10.5c3.1-.5 5.8-1.7 8-3.7 2.2 2 4.9 3.2 8 3.7" />
      <path d="M7 7.3 12 3l5 4.3" />
      <path d="M5.5 10.5h13" />
      <path d="M6.5 13.5h11" />
      <path d="M7.5 20v-6.5" />
      <path d="M16.5 20v-6.5" />
      <path d="M10 20v-4h4v4" />
      <path d="M5 20h14" />
    </svg>
  ),
);

TempleHomeIcon.displayName = "TempleHomeIcon";
