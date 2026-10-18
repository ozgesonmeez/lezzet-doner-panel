"use client";

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

  if (isPublicPage) {
    return <>{children}</>;
  }

  return <AppShell>{children}</AppShell>;
}
