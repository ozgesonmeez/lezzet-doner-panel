"use client";

import { PublicLocale, type Locale } from "@/components/public-site/Locale";
import { useRef } from "react";
import BackToTop from "@/components/public-site/BackToTop";
import ScrollReveal from "@/components/public-site/ScrollReveal";
import { usePathname } from "next/navigation";
import AppShell from "@/components/AppShell";

export default function LayoutController({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const isPublicPage =
    pathname === "/" ||
    pathname === "/menu" ||
    pathname.startsWith("/menu/") ||
    pathname === "/menu-premium" ||
    pathname.startsWith("/menu-premium/");

  if (isPublicPage) return children;

  return <AppShell>{children}</AppShell>;
}

export function PublicSiteLayout({ children, initialLocale }: { children: React.ReactNode; initialLocale: Locale }) {
  const pathname = usePathname();
  const publicSite = useRef<HTMLDivElement>(null);
    return (
      <PublicLocale initialLocale={initialLocale} scope={publicSite}>
        {children}
        <ScrollReveal key={pathname} scope={publicSite} />
        <BackToTop focusTop={() => publicSite.current?.focus({ preventScroll: true })} />
      </PublicLocale>
    );
}
