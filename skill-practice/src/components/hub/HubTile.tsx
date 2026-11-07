import type { LucideIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";

type HubTileProps = {
  href: string;
  Icon: LucideIcon;
  title: string;
  subtitle: string;
  animClassName: string;
};

export function HubTile({
  href,
  Icon,
  title,
  subtitle,
  animClassName,
}: HubTileProps) {
  const tr = useTranslations("ui");
  const isPrimary = href === "/today";

  return (
    <Link
      href={href}
      className={`tap-feedback flex items-center gap-4 rounded-xl border border-border/80 bg-card/70 px-5 py-4 transition-all duration-300 hover:border-primary/50 hover:bg-card hover:shadow-[0_4px_20px_rgba(0,0,0,0.5)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
        isPrimary
          ? "border-primary/40 bg-card shadow-[0_2px_16px_var(--tint-glow)]"
          : ""
      } ${animClassName}`}
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-primary/25 bg-primary/10 text-primary">
        <Icon className="h-5 w-5" aria-hidden />
      </div>
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <span className="label-font text-base font-semibold tracking-wide text-foreground">
            {title}
          </span>
          {isPrimary && (
            <span className="label-font rounded border border-primary/40 bg-primary/10 px-1.5 py-0.5 text-[10px] text-primary">
              {tr("today")}
            </span>
          )}
        </div>
        <span className="text-[13px] text-muted-foreground">{subtitle}</span>
      </div>
    </Link>
  );
}
