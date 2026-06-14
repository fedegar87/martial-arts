import type { MetadataRoute } from "next";
import { brand } from "@/lib/brand";

// Manifest PWA generato dal brand centralizzato (sostituisce public/manifest.json).
// Determina nome e icona dell'app installata.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: brand.appName,
    short_name: brand.shortName,
    description: brand.description,
    start_url: "/",
    display: "standalone",
    orientation: "any",
    background_color: brand.backgroundColor,
    theme_color: brand.themeColor,
    lang: brand.lang,
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
