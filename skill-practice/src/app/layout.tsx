import type { Metadata } from "next";
import {
  Bebas_Neue,
  Cormorant_Garamond,
  Geist,
  Noto_Serif_TC,
  Space_Mono,
  Spectral,
} from "next/font/google";
import { ServiceWorkerRegister } from "@/components/pwa/ServiceWorkerRegister";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const displayFont = Cormorant_Garamond({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const bodyFont = Spectral({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

const labelFont = Bebas_Neue({
  variable: "--font-label",
  subsets: ["latin"],
  weight: "400",
});

const monoFont = Space_Mono({
  variable: "--font-space-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const serifTcFont = Noto_Serif_TC({
  variable: "--font-serif-tc",
  weight: ["500", "700"],
  display: "swap",
  preload: false,
});

const appName = "Kung Fu Practice";
const appDescription = "Pratica guidata di Kung Fu tradizionale";

function normalizeSiteUrl(url: string | undefined) {
  if (!url) return undefined;
  return url.startsWith("http://") || url.startsWith("https://")
    ? url
    : `https://${url}`;
}

const siteUrl =
  normalizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL) ??
  normalizeSiteUrl(process.env.VERCEL_PROJECT_PRODUCTION_URL) ??
  normalizeSiteUrl(process.env.VERCEL_URL) ??
  "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: appName,
  title: {
    default: appName,
    template: `%s | ${appName}`,
  },
  description: appDescription,
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      {
        url: "/icons/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: appName,
  },
  openGraph: {
    type: "website",
    locale: "it_IT",
    url: "/",
    siteName: appName,
    title: appName,
    description: appDescription,
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: `${appName} - ${appDescription}`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: appName,
    description: appDescription,
    images: ["/og-image.png"],
  },
};

export const viewport = {
  themeColor: "#080808",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="it"
      className={`dark ${geistSans.variable} ${displayFont.variable} ${bodyFont.variable} ${labelFont.variable} ${monoFont.variable} ${serifTcFont.variable} h-full antialiased`}
    >
      <body className="bg-background text-foreground min-h-full flex flex-col">
        <ServiceWorkerRegister />
        <div className="grain-overlay" aria-hidden="true" />
        {children}
      </body>
    </html>
  );
}
