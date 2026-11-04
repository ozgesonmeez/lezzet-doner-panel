import type { Metadata } from "next";

export const metadata: Metadata = { alternates: { canonical: "/" } };

export default function PremiumMenuLayout({ children }: { children: React.ReactNode }) {
  return children;
}
