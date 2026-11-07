import type { UiTranslator } from "@/lib/i18n/config";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import Link from "next/link";

function LINKS(tr: UiTranslator) {
  return [
    { href: "/privacy", label: tr("privacy") },
    { href: "/terms", label: tr("terms") },
    { href: "/cookies", label: tr("cookies") },
    { href: "/disclaimer", label: tr("disclaimer") },
  ];
}

export function LegalLinks({ className }: { className?: string }) {
  const tr = useTranslations("ui");
  return (
    <nav
      aria-label={tr("legalDocuments")}
      className={cn(
        "text-muted-foreground flex flex-wrap gap-x-3 gap-y-1 text-xs",
        className,
      )}
    >
      {LINKS(tr).map((link) => (
        <Link key={link.href} href={link.href} className="hover:underline">
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
