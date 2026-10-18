import {
  ArrowUpRight,
  Coffee,
  Flame,
  Package,
  Sandwich,
  UtensilsCrossed,
} from "lucide-react";

export type MenuVariant = {
  id: number;
  name: string;
  price: number;
};

export type MenuProduct = {
  id: number;
  name: string;
  description: string | null;
  imageUrl: string | null;
  basePrice: number | null;
  soldOut: boolean;
  featured: boolean;
  newProduct: boolean;
  variants: MenuVariant[];
};

export type MenuCategory = {
  id: number;
  name: string;
  description: string | null;
  products: MenuProduct[];
};

function getCategoryIcon(name: string) {
  const normalized = name.toLocaleLowerCase("tr-TR");

  if (normalized.includes("tavuk")) return Flame;
  if (normalized.includes("et döner")) return Sandwich;
  if (normalized.includes("içecek")) return Coffee;
  if (normalized.includes("yan ürün")) return UtensilsCrossed;
  if (normalized.includes("menü")) return Package;

  return UtensilsCrossed;
}

export default function PremiumCategories({
  categories,
  onSelect,
}: {
  categories: MenuCategory[];
  onSelect: (id: number) => void;
}) {
  return (
    <section
      id="lezzetler"
      className="relative isolate overflow-hidden px-5 py-9 sm:px-10 sm:py-24"
    >
      {/* Warm editorial texture; no product images are modified. */}
      
      
      <div className="relative mx-auto max-w-7xl">
        <div className="mb-6 text-center sm:mb-12">
          <p className="text-[11px] font-bold uppercase tracking-[0.32em] text-[#92182e]">
            1 LEZZET DÖNER
          </p>

          <h2 className="mt-3 font-serif text-3xl font-semibold tracking-tight text-[#2c1d18] sm:mt-4 sm:text-6xl">
            Lezzetlerimizi keşfedin.
          </h2>
          <div aria-hidden="true" className="mx-auto mt-3 h-[2px] w-12 rounded-full bg-[#a91d38] sm:mt-5 sm:w-14" />
          <p className="mx-auto mt-3 text-[10px] font-semibold uppercase tracking-[.22em] text-[#a98569]">
            Özenle hazırlanan lezzetler
          </p>

          <p className="mx-auto mt-2 max-w-xl text-xs leading-5 text-[#8d7668] sm:mt-4 sm:text-sm sm:leading-7">
            Damak tadınıza uygun kategoriyi seçin, favori lezzetinizi keşfedin.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2.5 sm:gap-5 lg:grid-cols-5">
          {categories.map((category) => {
            const Icon = getCategoryIcon(category.name);
            const photo = category.products.find(
              (product) => product.imageUrl
            )?.imageUrl;

            return (
              <button
                key={category.id}
                type="button"
                onClick={() => onSelect(category.id)}
                className="group relative overflow-hidden rounded-[24px] border border-[#e7d4c2] bg-[#fffaf5] text-left shadow-[0_14px_38px_rgba(57,29,18,0.09)] transition-all duration-300 hover:-translate-y-1 hover:border-[#92182e]/40 hover:shadow-[0_20px_45px_rgba(57,29,18,0.12)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#92182e]"
              >
                <div className="relative flex aspect-[6/4] items-center justify-center overflow-hidden bg-gradient-to-br sm:aspect-[5/4] from-[#f6e7d7] via-[#f0dfcd] to-[#e8d1ba]">
                  {photo ? (
                    <img
                      src={photo}
                      alt={category.name}
                      loading="lazy"
                      className="h-full w-full object-contain p-3 transition-transform sm:p-4 duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex size-14 items-center justify-center rounded-full border border-[#dfc8b7] bg-[#fffaf4] sm:size-24">
                      <Icon
                        size={30}
                        strokeWidth={1.2}
                        className="text-[#92182e]"
                      />
                    </div>
                  )}

                  <span className="absolute bottom-3 left-3 rounded-full border border-white/70 bg-white/90 px-3 py-1 text-[10px] font-bold text-[#71594c] shadow-sm">
                    {category.products.length} ürün
                  </span>
                </div>

                <div className="flex min-h-[66px] items-center justify-between gap-2 border-t border-[#edddcd] px-3 py-3 sm:min-h-[100px] sm:px-5 sm:py-4">
                  <h3 className="font-serif text-sm font-bold leading-snug text-[#30201b] sm:text-xl">
                    {category.name}
                  </h3>

                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#f8eeee] text-[#92182e] transition-colors group-hover:bg-[#92182e] group-hover:text-white">
                    <ArrowUpRight size={17} />
                  </span>
                </div>

                <div className="absolute inset-x-0 bottom-0 h-[3px] bg-[#92182e] opacity-0 transition-opacity group-hover:opacity-100" />
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
