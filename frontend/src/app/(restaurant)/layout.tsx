import { cookies } from "next/headers";
import { PublicSiteLayout } from "@/components/LayoutController";

export default async function RestaurantLayout({ children }: { children: React.ReactNode }) {
  const locale = (await cookies()).get("lezzet-language")?.value === "en" ? "en" : "tr";
  return <PublicSiteLayout initialLocale={locale}>{children}</PublicSiteLayout>;
}
