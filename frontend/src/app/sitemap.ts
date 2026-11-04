import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/restaurant-seo";

export default function sitemap(): MetadataRoute.Sitemap {
  return ["/", "/menu"].map((path) => ({ url: new URL(path, siteUrl).href }));
}
