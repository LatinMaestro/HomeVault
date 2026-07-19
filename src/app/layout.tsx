import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { NativeRuntime } from "@/components/native-runtime";
import { ServiceWorkerRegistration } from "@/components/service-worker-registration";
import { canonicalProductionOrigin } from "@/lib/site";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0f766e",
};

export const metadata: Metadata = {
  metadataBase: new URL(canonicalProductionOrigin),
  applicationName: "HomeVault",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [{ url: "/icons/homevault.svg", type: "image/svg+xml" }],
  },
  appleWebApp: {
    capable: true,
    title: "HomeVault",
    statusBarStyle: "default",
  },
  formatDetection: {
    telephone: false,
  },
  title: {
    default: "HomeVault",
    template: "%s | HomeVault",
  },
  description:
    "A privacy-first home records vault for maintenance, warranties, receipts, documents and household assets.",
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="min-h-screen antialiased">
        {children}
        <NativeRuntime />
        <ServiceWorkerRegistration />
      </body>
    </html>
  );
}

