import { forwardRef } from "react";
import type { LucideIcon, LucideProps } from "lucide-react";

const MartialArtistIconComponent = forwardRef<SVGSVGElement, LucideProps>(
  ({ className, ...props }, ref) => (
    <svg
      ref={ref}
      viewBox="0 -960 960 960"
      fill="currentColor"
      stroke="none"
      className={className}
      {...props}
    >
      {/* Google Material Symbols sports_martial_arts, Apache 2.0. */}
      <path d="m400-80-20-360-127-73-14 52 81 141-69 40-99-170 48-172 230-132-110-110 56-56 184 183-144 83 48 42 328-268 48 56-340 344-20 400h-80ZM200-680q-33 0-56.5-23.5T120-760q0-33 23.5-56.5T200-840q33 0 56.5 23.5T280-760q0 33-23.5 56.5T200-680Z" />
    </svg>
  ),
);

MartialArtistIconComponent.displayName = "MartialArtistIcon";

export const MartialArtistIcon = MartialArtistIconComponent as LucideIcon;
