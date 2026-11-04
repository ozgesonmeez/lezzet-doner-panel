
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import "./globals.css";
import { restaurantName, siteUrl } from "@/lib/restaurant-seo";

import { AuthProvider } from "@/context/AuthContext";
import LayoutController from "@/components/LayoutController";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: siteUrl,
  title: restaurantName,
  robots: { index: false, follow: false },
  icons: { icon: { url: "/favicon.ico", sizes: "64x64", type: "image/x-icon" } },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body
        className={`${geistSans.variable} ${geistMono.variable} bg-[#f7f8fa] antialiased`}
      >
        <AuthProvider>
          <LayoutController>
            {children}
          </LayoutController>
        </AuthProvider>
      </body>
    </html>
  );
}
