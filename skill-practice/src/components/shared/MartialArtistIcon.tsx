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
      <circle cx="12" cy="5.5" r="2" fill={color} opacity="0.6" />
      <path
        d="M6 14 L8 10 L16 10 L18 14 Z"
        fill={color}
        opacity="0.5"
      />
      <path
        d="M10 10 L12 13 L14 10"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect
        x="5"
        y="13.4"
        width="14"
        height="2.4"
        rx="0.4"
        style={{ fill: "var(--primary)" }}
      />
      <path
        d="M5 15.8 L3.5 20.5 L20.5 20.5 L19 15.8 Z"
        fill={color}
        opacity="0.5"
      />
    </svg>
  ),
);

MartialArtistIconComponent.displayName = "MartialArtistIcon";

export const MartialArtistIcon =
  MartialArtistIconComponent as unknown as LucideIcon;
