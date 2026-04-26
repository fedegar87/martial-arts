import Link from "next/link";
import { Megaphone } from "lucide-react";

type Props = {
  unreadCount: number;
};

export function NewsBanner({ unreadCount }: Props) {
  if (unreadCount <= 0) return null;

  return (
    <Link
      href="/news"
      className="border-primary/40 bg-primary/10 text-primary flex items-center gap-3 rounded-sm border p-3 text-sm transition-colors hover:bg-primary/15"
    >
      <Megaphone className="h-4 w-4 shrink-0" />
      <span className="label-font">
        {unreadCount === 1
          ? "1 nuova comunicazione"
          : `${unreadCount} nuove comunicazioni`}
      </span>
    </Link>
  );
}
