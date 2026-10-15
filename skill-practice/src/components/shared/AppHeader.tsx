import Link from "next/link";
import { User } from "lucide-react";
import { TempleHomeIcon } from "./TempleHomeIcon";

export function AppHeader() {
  return (
    <header className="material-bar hairline flex min-h-14 items-center justify-between border-b px-5 pt-[env(safe-area-inset-top)]">
      <Link
        href="/hub"
        aria-label="Torna alla home"
        className="tap-feedback inline-flex min-h-12 min-w-12 items-center justify-center text-primary transition-all hover:opacity-90 active:scale-95"
      >
        <TempleHomeIcon className="h-6 w-6 drop-shadow-[0_0_8px_var(--tint-glow)]" aria-hidden />
      </Link>
      <Link
        href="/profile"
        aria-label="Profilo"
        className="tap-feedback inline-flex min-h-12 min-w-12 items-center justify-center text-primary transition-all hover:opacity-90 active:scale-95"
      >
        <User className="h-5 w-5 drop-shadow-[0_0_8px_var(--tint-glow)]" aria-hidden />
      </Link>
    </header>
  );
}
