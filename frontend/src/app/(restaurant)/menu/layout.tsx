import { restaurantMetadata } from "@/lib/restaurant-seo";

export const metadata = restaurantMetadata(
  "/menu",
  "Döner ve Dürüm Menüsü | 1 Lezzet Döner Bursa Kestel",
  "1 Lezzet Döner’in Bursa Kestel menüsünde tavuk döner, yaprak et döner ve dürüm seçeneklerini inceleyin. Menüdeki ürünleri ve fiyatları keşfedin.",
);

export default function MenuLayout({ children }: { children: React.ReactNode }) {
  return children;
}
