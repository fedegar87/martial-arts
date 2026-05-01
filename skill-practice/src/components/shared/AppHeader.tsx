import Link from "next/link";

export function AppHeader() {
  return (
    <header className="material-bar hairline flex h-14 items-center border-b px-5 pt-[env(safe-area-inset-top)]">
      <Link
        href="/hub"
        aria-label="Torna alla home"
        className="tap-feedback inline-flex min-h-12 min-w-12 items-center justify-center text-2xl font-bold text-accent transition-opacity hover:opacity-80 font-serif-tc"
        lang="zh-Hant"
      >
        丙午
      </Link>
    </header>
  );
}
