import { forwardRef } from "react";
import type { LucideIcon, LucideProps } from "lucide-react";

const MartialArtistIconComponent = forwardRef<SVGSVGElement, LucideProps>(
  (
    {
      className,
      size = 24,
      color = "currentColor",
      strokeWidth = 1.5,
      ...props
    },
    ref,
  ) => (
    <svg
      ref={ref}
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <circle cx="12" cy="5" r="2" />
      <path d="M5 14.5 L7.5 9.5 L16.5 9.5 L19 14.5" />
      <path d="M10 9.5 L12 13.5 L14 9.5" />
      <line
        x1="4.5"
        y1="14.5"
        x2="19.5"
        y2="14.5"
        strokeWidth={Number(strokeWidth) * 1.8}
      />
      <path d="M5 14.5 L3.5 20 L20.5 20 L19 14.5" />
    </svg>
  ),
);

MartialArtistIconComponent.displayName = "MartialArtistIcon";

export const MartialArtistIcon =
  MartialArtistIconComponent as unknown as LucideIcon;
