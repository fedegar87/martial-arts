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
      <circle cx="12.5" cy="4.5" r="2" />
      <path d="M11.5 7 9 10.8l3.5 2.6 3-3.8" />
      <path d="M9.2 10.7 5 9" />
      <path d="M15.2 9.8 19 7.6" />
      <path d="M12.4 13.4 9 20" />
      <path d="M9 20H5.5" />
      <path d="M12.8 13.4 17.2 16" />
      <path d="M17.2 16 21 14.5" />
    </svg>
  ),
);

MartialArtistIconComponent.displayName = "MartialArtistIcon";

export const MartialArtistIcon = MartialArtistIconComponent as LucideIcon;
