import type { Metadata } from "next";

export const siteUrl = new URL("https://www.1lezzetdoner.com");
export const restaurantName = "1 Lezzet Döner";
export const logoPath = "/lezzet-doner-logo-seffaf.png";

export function restaurantMetadata(
  path: "/" | "/menu",
  title: string,
  description: string,
): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    robots: { index: true, follow: true },
    openGraph: {
      type: "website",
      locale: "tr_TR",
      siteName: restaurantName,
      url: path,
      title,
      description,
      images: [{ url: logoPath, alt: restaurantName }],
    },
  };
}
