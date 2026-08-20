import type {
  Metadata,
} from "next";

import {
  Geist,
  Geist_Mono,
} from "next/font/google";

import "./globals.css";

import {
  AuthProvider,
} from "@/context/AuthContext";

import AppShell from "@/components/AppShell";

const geistSans =
  Geist({
    variable:
      "--font-geist-sans",
    subsets: ["latin"],
  });

const geistMono =
  Geist_Mono({
    variable:
      "--font-geist-mono",
    subsets: ["latin"],
  });

export const metadata: Metadata =
  {
    title:
      "Lezzet Döner Yönetim Paneli",

    description:
      "Lezzet Döner günlük operasyon, kurye ve finans yönetim paneli",
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
          <AppShell>
            {children}
          </AppShell>
        </AuthProvider>
      </body>
    </html>
  );
}