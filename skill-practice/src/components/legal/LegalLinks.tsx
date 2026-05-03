import Link from "next/link";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Termini" },
  { href: "/cookies", label: "Cookie" },
  { href: "/disclaimer", label: "Disclaimer" },
];

export function LegalLinks({ className }: { className?: string }) {
  return (
    <nav
      aria-label="Documenti legali"
      className={cn(
        "text-muted-foreground flex flex-wrap gap-x-3 gap-y-1 text-xs",
        className,
      )}
    >
      {LINKS.map((link) => (
        <Link key={link.href} href={link.href} className="hover:underline">
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
