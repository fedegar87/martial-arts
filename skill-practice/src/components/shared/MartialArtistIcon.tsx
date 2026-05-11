import { forwardRef } from "react";
import type { LucideIcon, LucideProps } from "lucide-react";

const MartialArtistIconComponent = forwardRef<SVGSVGElement, LucideProps>(
  ({ className, size = 24, color = "currentColor", ...props }, ref) => (
    <svg
      ref={ref}
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      {...props}
    >
      <circle cx="7.5" cy="4.5" r="1.9" fill={color} opacity="0.7" />
      <path
        d="M7.5 6.5 L9.5 13.5"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M7 8.5 L3 8"
        stroke={color}
        strokeWidth="1.7"
        strokeLinecap="round"
        opacity="0.85"
      />
      <path
        d="M8 9 L11 11"
        stroke={color}
        strokeWidth="1.7"
        strokeLinecap="round"
        opacity="0.85"
      />
      <circle
        cx="9.3"
        cy="12.8"
        r="1.3"
        style={{ fill: "var(--primary)" }}
      />
      <path
        d="M9 14 L6.8 21"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M10 13.5 L21 9.5"
        stroke={color}
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <circle cx="21.2" cy="9.4" r="0.9" fill={color} opacity="0.9" />
    </svg>
  ),
);

MartialArtistIconComponent.displayName = "MartialArtistIcon";

export const MartialArtistIcon =
  MartialArtistIconComponent as unknown as LucideIcon;
