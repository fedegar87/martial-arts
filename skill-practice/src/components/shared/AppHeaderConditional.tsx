"use client";

import { usePathname } from "next/navigation";
import { AppHeader } from "./AppHeader";

export function AppHeaderConditional() {
  const pathname = usePathname();
  if (pathname === "/hub") return null;
  return <AppHeader />;
}
