"use client";

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
  const publicSite = useRef<HTMLDivElement>(null);

  const isPublicPage =
    pathname === "/" ||
    pathname === "/menu" ||
    pathname.startsWith("/menu/") ||
    pathname === "/menu-premium" ||
    pathname.startsWith("/menu-premium/");

  if (isPublicPage) {
    return (
      <div ref={publicSite} tabIndex={-1} className="ld-public-site">
        {children}
        <ScrollReveal key={pathname} scope={publicSite} />
        <BackToTop focusTop={() => publicSite.current?.focus({ preventScroll: true })} />
      </div>
    );
  }

  return <AppShell>{children}</AppShell>;
}
