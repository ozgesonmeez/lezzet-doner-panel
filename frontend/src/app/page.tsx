import {
  logoPath,
  restaurantMetadata,
  restaurantName,
  siteUrl,
} from "@/lib/restaurant-seo";
import PremiumMenuPage from "./menu-premium/page";

export const metadata = restaurantMetadata(
  "/",
  "1 Lezzet Döner | Bursa Kestel’de Döner ve Dürüm",
  "Bursa Kestel’de 1 Lezzet Döner’in tavuk döner, yaprak et döner ve dürüm çeşitlerini keşfedin. Güncel menüyü inceleyin ve online yemek siparişi verin.",
);

const restaurant = {
  "@context": "https://schema.org",
  "@type": "Restaurant",
  "@id": new URL("/#restaurant", siteUrl).href,
  name: restaurantName,
  url: siteUrl.href,
  logo: new URL(logoPath, siteUrl).href,
  telephone: "+905423941616",
  servesCuisine: "Döner",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Ahmet Vefik Paşa Mahallesi, Pazaryeri Sokak No: 10/A",
    addressLocality: "Kestel",
    addressRegion: "Bursa",
    addressCountry: "TR",
  },
  hasMenu: new URL("/menu", siteUrl).href,
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(restaurant).replace(/</g, "\\u003c"),
        }}
      />
      <PremiumMenuPage />
    </>
  );
}
