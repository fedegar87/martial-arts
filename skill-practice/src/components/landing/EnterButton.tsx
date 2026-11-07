import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import Link from "next/link";

export function EnterButton({ href }: { href: string }) {
  const tr = useTranslations("ui");
  return (
    <Button asChild size="lg" className="min-h-14 px-12 text-lg">
      <Link href={href}>{tr("enter")}</Link>
    </Button>
  );
}
