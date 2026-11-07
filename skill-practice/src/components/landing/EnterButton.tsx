import Link from "next/link";
import { Button } from "@/components/ui/button";

export function EnterButton({ href }: { href: string }) {
  return (
    <Button asChild size="lg" className="min-h-14 px-12 text-lg">
      <Link href={href}>Entra</Link>
    </Button>
  );
}
