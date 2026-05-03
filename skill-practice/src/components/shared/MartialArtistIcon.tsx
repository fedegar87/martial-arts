import { forwardRef } from "react";
import type { LucideIcon, LucideProps } from "lucide-react";

const MartialArtistIconComponent = forwardRef<SVGSVGElement, LucideProps>(
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
      <circle cx="11" cy="4.5" r="2" />
      <path d="m10 7-2 3.5 3.5 2 3.5-3" />
      <path d="m8 10.5-4-1" />
      <path d="m11.5 12.5-3 6.5" />
      <path d="m8.5 19-3 1.5" />
      <path d="m11.5 12.5 5 1.5 3.5-2.5" />
    </svg>
  ),
);

MartialArtistIconComponent.displayName = "MartialArtistIcon";

export const MartialArtistIcon = MartialArtistIconComponent as LucideIcon;
