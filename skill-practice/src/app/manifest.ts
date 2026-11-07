import { brand, localizedBrand } from "@/lib/brand";
import { DEFAULT_LOCALE } from "@/lib/i18n/config";
import type { MetadataRoute } from "next";

// Manifest PWA generato dal brand centralizzato (sostituisce public/manifest.json).
// Determina nome e icona dell'app installata.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: brand.appName,
    short_name: brand.shortName,
    description: localizedBrand(DEFAULT_LOCALE).description,
    start_url: "/",
    display: "standalone",
    orientation: "any",
    background_color: brand.backgroundColor,
    theme_color: brand.themeColor,
    lang: DEFAULT_LOCALE,
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
