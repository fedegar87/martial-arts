import Link from "next/link";

export function EnterButton({ href }: { href: string }) {
  return (
    <Link
      href={href}
      className="
        inline-flex items-center justify-center
        px-12 py-4
        rounded-lg
        border border-accent text-accent
        text-lg font-medium tracking-wide
        transition-colors duration-300 ease-out
        hover:bg-accent hover:text-background
        active:scale-[0.98]
      "
    >
      Entra
    </Link>
  );
}
