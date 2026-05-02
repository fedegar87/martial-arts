import Link from "next/link";
import { TempleHomeIcon } from "./TempleHomeIcon";

export function AppHeader() {
  return (
    <header className="material-bar hairline flex h-14 items-center border-b px-5 pt-[env(safe-area-inset-top)]">
      <Link
        href="/hub"
        aria-label="Torna alla home"
        className="tap-feedback inline-flex min-h-12 min-w-12 items-center justify-center text-accent transition-opacity hover:opacity-80"
      >
        <TempleHomeIcon className="h-6 w-6" aria-hidden />
      </Link>
    </header>
  );
}
