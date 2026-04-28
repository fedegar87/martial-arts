import HorseSvg from "@public/landing/cavallo-fuoco.svg";

export function HorseEmblem({ className }: { className?: string }) {
  return <HorseSvg className={className} aria-hidden="true" focusable="false" />;
}
