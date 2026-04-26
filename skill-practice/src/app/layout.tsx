import type { Metadata } from "next";
import {
  Bebas_Neue,
  Cormorant_Garamond,
  Geist,
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

export const metadata: Metadata = {
  title: "Skill Practice",
  description: "Pratica guidata di arti marziali tradizionali",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Skill Practice",
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
      className={`dark ${geistSans.variable} ${displayFont.variable} ${bodyFont.variable} ${labelFont.variable} ${monoFont.variable} h-full antialiased`}
    >
      <body className="bg-background text-foreground min-h-full flex flex-col">
        <ServiceWorkerRegister />
        <div className="grain-overlay" aria-hidden="true" />
        {children}
      </body>
    </html>
  );
}
