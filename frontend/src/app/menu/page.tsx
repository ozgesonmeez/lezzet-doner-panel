
"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Flame,
  MapPin,
  Search,
  Sparkles,
  UtensilsCrossed,
  X,
} from "lucide-react";

type MenuVariant = {
  id: number;
  name: string;
  price: number;
};

type MenuProduct = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  basePrice: number | null;
  soldOut: boolean;
  featured: boolean;
  newProduct: boolean;
  variants: MenuVariant[];
};

type MenuCategory = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  products: MenuProduct[];
};

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

function formatPrice(price: number) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(price);
}

function ProductCard({
  product,
  onOpen,
}: {
  product: MenuProduct;
  onOpen: (product: MenuProduct) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onOpen(product)}
      aria-label={`${product.name} ürün detaylarını incele`}
      className="group flex w-full min-h-[152px] overflow-hidden rounded-[22px] border border-[#E8DDD4] bg-white text-left shadow-[0_8px_24px_rgba(58,33,28,0.045)] transition duration-300 hover:border-[#D9C7BC] hover:shadow-[0_12px_30px_rgba(58,33,28,0.10)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#941B32] sm:flex-col sm:rounded-[28px] sm:hover:-translate-y-1"
    >
      <div className="relative w-[118px] shrink-0 self-stretch overflow-hidden bg-[#F6F0EB] min-[390px]:w-[138px] sm:aspect-[4/3] sm:w-full">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-contain p-1 transition-transform duration-500 group-hover:scale-[1.04] sm:p-2"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-[#F9F5F0] to-[#EEE3D9]">
            <div className="flex h-14 w-14 items-center justify-center rounded-full border border-[#E7D8CC] bg-white/60 sm:h-20 sm:w-20">
              <UtensilsCrossed
                size={27}
                strokeWidth={1.25}
                className="text-[#B49A8F] sm:h-9 sm:w-9"
              />
            </div>
            <span className="hidden text-[11px] font-semibold text-[#A68C80] sm:block">
              Görsel yakında
            </span>
          </div>
        )}

        {product.soldOut && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#FFFCF8]/80 backdrop-blur-[2px]">
            <span className="rounded-full bg-[#941B32] px-3 py-2 text-[10px] font-black text-white sm:px-5 sm:text-sm">
              TÜKENDİ
            </span>
          </div>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-between p-3.5 min-[390px]:p-4 sm:p-6">
        <div>
          {(product.newProduct || product.featured) && (
            <div className="mb-2 flex flex-wrap gap-1.5">
              {product.newProduct && (
                <span className="rounded-full bg-[#941B32] px-2.5 py-1 text-[9px] font-black text-white">
                  YENİ
                </span>
              )}
              {product.featured && (
                <span className="rounded-full bg-[#FFF4DF] px-2.5 py-1 text-[9px] font-black text-[#9A601C]">
                  ÖNE ÇIKAN
                </span>
              )}
            </div>
          )}

          <h4 className="text-[14px] font-black leading-snug tracking-[-0.02em] text-[#291C1D] min-[390px]:text-[16px] sm:text-xl">
            {product.name}
          </h4>

          {product.description && (
            <p className="mt-1.5 line-clamp-2 text-[11px] leading-[1.55] text-[#8D7770] sm:mt-2 sm:text-sm sm:leading-6">
              {product.description}
            </p>
          )}
        </div>

        <div className="mt-3 border-t border-[#F0E7DF] pt-3 sm:mt-5 sm:pt-4">
          {product.variants.length > 0 ? (
            <div className="space-y-2">
              {product.variants.map((variant) => (
                <div
                  key={variant.id}
                  className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1"
                >
                  <span className="rounded-md bg-[#F8F2ED] px-2 py-1 text-[11px] font-semibold text-[#75615B] sm:text-sm">
                    {variant.name}
                  </span>
                  <strong className="whitespace-nowrap text-[14px] font-black tracking-tight text-[#941B32] sm:text-lg">
                    {formatPrice(variant.price)}
                  </strong>
                </div>
              ))}
            </div>
          ) : product.basePrice !== null ? (
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-[#AB968B] sm:text-[10px]">
                Fiyat
              </p>
              <p className="mt-1 text-[22px] font-black leading-none tracking-tight text-[#941B32] sm:text-[26px]">
                {formatPrice(product.basePrice)}
              </p>
            </div>
          ) : (
            <p className="text-xs text-[#907B74] sm:text-sm">
              Fiyat bilgisi bulunmuyor.
            </p>
          )}
        </div>

        <div className="mt-3 flex items-center gap-1 text-[11px] font-bold text-[#941B32] sm:text-xs">
          Ürünü İncele <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
        </div>
      </div>
    </button>
  );
}

function ProductDetailModal({
  product,
  onClose,
}: {
  product: MenuProduct;
  onClose: () => void;
}) {
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-[#1D1014]/70 p-0 backdrop-blur-sm sm:items-center sm:p-5"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-detail-title"
        className="relative max-h-[92dvh] w-full max-w-2xl overflow-y-auto rounded-t-[28px] bg-[#FFFCF8] shadow-2xl sm:max-h-[90dvh] sm:rounded-[30px]"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Ürün detayını kapat"
          className={`absolute right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-[#291C1D] shadow-md transition hover:bg-[#F5E8E2] ${product.imageUrl ? "top-4" : "top-3 sm:top-5"}`}
        >
          <X size={21} />
        </button>

        {product.imageUrl && (
          <div className="relative flex aspect-[16/10] items-center justify-center overflow-hidden bg-[#F3ECE6] sm:aspect-[16/9]">
            <img
              src={product.imageUrl}
              alt={product.name}
              className="h-full w-full object-contain"
            />

            {product.soldOut && (
              <span className="absolute bottom-4 left-4 rounded-full bg-[#941B32] px-4 py-2 text-xs font-black text-white">
                TÜKENDİ
              </span>
            )}
          </div>
        )}

        <div className={product.imageUrl ? "p-6 sm:p-9" : "px-6 pb-6 pt-16 sm:px-9 sm:pb-9 sm:pt-16"}>
          <div className="flex flex-wrap gap-2">
            {product.newProduct && (
              <span className="rounded-full bg-[#941B32] px-3 py-1.5 text-[10px] font-black text-white">
                YENİ
              </span>
            )}

            {product.featured && (
              <span className="rounded-full bg-[#FFF0D6] px-3 py-1.5 text-[10px] font-black text-[#9A601C]">
                ÖNE ÇIKAN
              </span>
            )}
          </div>

          {!product.imageUrl && product.soldOut && (
            <span className="mt-3 inline-flex rounded-full bg-[#941B32] px-3 py-1.5 text-[10px] font-black text-white">
              TÜKENDİ
            </span>
          )}

          <h2
            id="product-detail-title"
            className="mt-3 text-2xl font-black tracking-tight sm:text-3xl"
          >
            {product.name}
          </h2>

          {product.description && (
            <p className="mt-4 text-sm leading-7 text-[#806B65] sm:text-base">
              {product.description}
            </p>
          )}

          <div className="mt-7 border-t border-[#E9DFD6] pt-6">
            {product.variants.length > 0 ? (
              <>
                <p className="mb-4 text-xs font-black uppercase tracking-[0.15em] text-[#A3263F]">
                  Gramaj ve Fiyat Seçenekleri
                </p>

                <div className="space-y-3">
                  {product.variants.map((variant) => (
                    <div
                      key={variant.id}
                      className="flex items-center justify-between gap-4 rounded-2xl border border-[#E9DFD6] bg-white px-5 py-4"
                    >
                      <span className="font-bold text-[#594744]">
                        {variant.name}
                      </span>

                      <strong className="text-lg font-black text-[#941B32]">
                        {formatPrice(variant.price)}
                      </strong>
                    </div>
                  ))}
                </div>
              </>
            ) : product.basePrice !== null ? (
              <div className="flex items-end justify-between gap-4">
                <span className="text-sm font-semibold text-[#806B65]">
                  Ürün Fiyatı
                </span>

                <strong className="text-3xl font-black text-[#941B32]">
                  {formatPrice(product.basePrice)}
                </strong>
              </div>
            ) : (
              <p className="text-sm text-[#806B65]">
                Fiyat bilgisi bulunmuyor.
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="mt-7 w-full rounded-2xl bg-[#941B32] px-6 py-4 text-sm font-black text-white transition hover:bg-[#761327]"
          >
            Menüye Dön
          </button>
        </div>
      </section>
    </div>
  );
}

export default function PublicMenuPage() {
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [activeCategory, setActiveCategory] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<MenuProduct | null>(
    null
  );

  useEffect(() => {
    const controller = new AbortController();

    async function loadMenu() {
      try {
        const response = await fetch(`${API_URL}/api/public/menu`, {
          signal: controller.signal,
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Menü yüklenemedi.");
        }

        const data: MenuCategory[] = await response.json();

        setCategories(data);
        setActiveCategory(null);
      } catch {
        if (!controller.signal.aborted) {
          setError("Menü şu anda yüklenemiyor. Lütfen tekrar deneyin.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    void loadMenu();

    return () => controller.abort();
  }, []);

  const selectedCategory = categories.find(
    (category) => category.id === activeCategory
  );

  const products = useMemo(() => {
    const term = search.trim().toLocaleLowerCase("tr-TR");

    if (term) {
      return categories.flatMap((category) =>
        category.products.filter((product) =>
          `${product.name} ${product.description ?? ""}`
            .toLocaleLowerCase("tr-TR")
            .includes(term)
        )
      );
    }

    return activeCategory === null
      ? categories.flatMap((category) => category.products)
      : selectedCategory?.products ?? [];
  }, [activeCategory, categories, selectedCategory, search]);

  const totalProducts = categories.reduce(
    (sum, category) => sum + category.products.length,
    0
  );

  return (
    <main className="min-h-screen bg-[#FAF8F5] text-[#291C1D]">
      {/* HEADER */}
      <header className="sticky top-0 z-40 border-b border-[#E9E1DA] bg-[#FFFCF8]/95 backdrop-blur-xl">
        <div className="mx-auto flex h-[64px] max-w-7xl items-center justify-between px-4 sm:h-[76px] sm:px-8">
          <a
            href="/menu"
            className="flex min-w-0 items-center gap-2.5 sm:gap-3"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#941B32] text-lg font-black text-white sm:h-11 sm:w-11 sm:rounded-2xl sm:text-xl">
              1
            </span>

            <span className="whitespace-nowrap text-[13px] font-black tracking-tight min-[390px]:text-base sm:text-xl">
              LEZZET <span className="text-[#941B32]">DÖNER</span>
            </span>
          </a>

          <nav className="hidden items-center gap-8 text-sm font-semibold text-[#5F4C4D] md:flex">
            <a href="#anasayfa" className="hover:text-[#941B32]">
              Ana Sayfa
            </a>

            <a href="#menu" className="hover:text-[#941B32]">
              Menümüz
            </a>

            <a href="#hakkimizda" className="hover:text-[#941B32]">
              Hakkımızda
            </a>
          </nav>

          <a
            href="#menu"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-[#941B32] px-3 py-2.5 text-[10px] font-bold text-white transition hover:bg-[#761327] min-[390px]:px-4 sm:gap-2 sm:px-5 sm:py-3 sm:text-xs"
          >
            Menüyü İncele
            <ArrowRight size={13} />
          </a>
        </div>
      </header>

      {/* COMPACT MOBILE HERO */}
      <section id="anasayfa" className="relative overflow-hidden bg-[#83172D] text-white">
        <div className="pointer-events-none absolute -right-20 -top-32 h-72 w-72 rounded-full bg-[#B83850]/25 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-5 py-6 sm:px-8 sm:py-12 lg:py-16">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[10px] font-bold tracking-[0.12em] text-[#FFE4C9]">
            <Flame size={13} /> 1 LEZZET DÖNER
          </span>
          <h1 className="mt-3 max-w-3xl text-[29px] font-black leading-[1.14] tracking-tight min-[390px]:text-[34px] sm:mt-5 sm:text-5xl lg:text-6xl">
            Gerçek Döner. <span className="text-[#F3BE94]">Gerçek Lezzet.</span>
          </h1>
          <div className="mt-3 flex items-center gap-2 text-xs font-medium text-white/80 sm:mt-5 sm:text-sm">
            <MapPin size={14} /> Bursa · Kestel
          </div>
          <p className="mt-3 hidden max-w-xl text-sm leading-7 text-white/75 sm:block">
            Tavuk dönerden yaprak et dönere, sevdiğin lezzetleri keşfet. Güncel menümüz ve fiyatlarımız bir dokunuş uzağında.
          </p>
        </div>
      </section>

      {/* RESTAURANT STRIP */}
      <div className="border-b border-[#EDE4DC] bg-[#FFFCF8]">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-5 py-2.5 sm:px-8 sm:py-4">
          <span className="text-[11px] font-semibold text-[#745F5A] sm:text-sm">Taze lezzetler, güncel fiyatlar</span>
          {!loading && !error && (
            <span className="text-[11px] font-semibold text-[#9C8980] sm:text-xs">
              {categories.length} kategori · {totalProducts} ürün
            </span>
          )}
        </div>
      </div>

      {/* MENU */}
      <section
        id="menu"
        className="mx-auto max-w-7xl scroll-mt-20 px-4 py-6 sm:scroll-mt-24 sm:px-8 sm:py-16"
      >
        <div className="text-center">
          <span className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.17em] text-[#A3263F] sm:text-xs">
            <Sparkles size={14} />
            Lezzetlerimizi Keşfet
          </span>

          <h2 className="mt-1.5 text-2xl font-black tracking-tight sm:mt-4 sm:text-5xl">
            Menümüz
          </h2>

          <p className="mt-1 text-xs leading-6 text-[#8D7770] sm:mt-4 sm:text-base">
            Favori lezzetlerini keşfet, güncel fiyatları incele.
          </p>
        </div>

        {/* SEARCH */}
        <div className="mx-auto mt-4 flex max-w-xl items-center gap-3 rounded-2xl border border-[#E9DFD6] bg-white px-4 py-3.5 shadow-sm transition focus-within:border-[#A3263F] sm:mt-10 sm:px-5 sm:py-4">
          <Search size={19} className="shrink-0 text-[#941B32]" />

          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Canın ne çekiyor?"
            aria-label="Ürün ara"
            className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-[#AD9B94]"
          />

          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              aria-label="Aramayı temizle"
              className="text-[#9C8980] hover:text-[#941B32]"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {loading ? (
          <div className="py-20 text-center text-[#8D7770]">
            Menümüz yükleniyor...
          </div>
        ) : error ? (
          <div
            role="alert"
            className="mt-10 rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-red-700"
          >
            {error}
          </div>
        ) : (
          <>
            {/* CATEGORIES */}
            <div className="-mx-4 mt-5 flex gap-2.5 overflow-x-auto px-4 pb-4 sm:mx-0 sm:mt-11 sm:gap-3 sm:px-0">
              <button
                type="button"
                onClick={() => {
                  setActiveCategory(null);
                  setSearch("");
                }}
                aria-pressed={activeCategory === null && !search}
                className={`shrink-0 rounded-full px-4 py-2.5 text-xs font-bold transition sm:px-6 sm:py-3 sm:text-sm ${
                  activeCategory === null && !search
                    ? "bg-[#941B32] text-white shadow-md shadow-[#941B32]/15"
                    : "border border-[#E9DFD6] bg-white text-[#65514F] hover:border-[#941B32]"
                }`}
              >
                Tüm Ürünler
              </button>
              {categories.map((category) => {
                const active =
                  category.id === activeCategory && !search;

                return (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => {
                      setActiveCategory(category.id);
                      setSearch("");
                    }}
                    aria-pressed={active}
                    className={`shrink-0 rounded-full px-4 py-2.5 text-xs font-bold transition sm:px-6 sm:py-3 sm:text-sm ${
                      active
                        ? "bg-[#941B32] text-white shadow-md shadow-[#941B32]/15"
                        : "border border-[#E9DFD6] bg-white text-[#65514F] hover:border-[#941B32]"
                    }`}
                  >
                    {category.name}
                  </button>
                );
              })}
            </div>

            {/* CATEGORY HEADING */}
            <div className="mt-3 flex items-end justify-between gap-3 border-b border-[#EAE0D7] pb-4 sm:mt-8 sm:gap-4 sm:pb-5">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.15em] text-[#A3263F] sm:text-[11px]">
                  {search ? "Arama Sonuçları" : activeCategory === null ? "Bütün Lezzetler" : "Seçili Kategori"}
                </p>

                <h3 className="mt-2 text-xl font-black tracking-tight sm:text-3xl">
                  {search
                    ? "Bulunan Lezzetler"
                    : activeCategory === null ? "Tüm Ürünler" : selectedCategory?.name ?? "Ürünler"}
                </h3>

                {!search && selectedCategory?.description && (
                  <p className="mt-1.5 text-xs text-[#907B74] sm:mt-2 sm:text-sm">
                    {selectedCategory.description}
                  </p>
                )}
              </div>

              <span className="shrink-0 rounded-full bg-[#F1E8E0] px-3 py-1.5 text-[10px] font-bold text-[#8A6B61] sm:px-4 sm:py-2 sm:text-xs">
                {products.length} ürün
              </span>
            </div>

            {/* PRODUCT CARDS */}
            {products.length === 0 ? (
              <div className="mt-6 rounded-[24px] border border-dashed border-[#E3D5C9] bg-white px-5 py-12 text-center sm:mt-8 sm:rounded-[28px] sm:py-16">
                <UtensilsCrossed
                  size={36}
                  className="mx-auto text-[#BAA59A]"
                />

                <p className="mt-4 text-sm text-[#8D7770]">
                  {search
                    ? "Aradığın lezzeti bulamadık."
                    : "Bu kategoride henüz ürün bulunmuyor."}
                </p>
              </div>
            ) : (
              <div className="mt-4 grid gap-3 sm:mt-8 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 xl:gap-7">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onOpen={setSelectedProduct}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </section>

      {/* ABOUT */}
      <section
        id="hakkimizda"
        className="bg-[#FFF1E5] px-5 py-12 sm:px-6 sm:py-20"
      >
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#941B32] sm:text-xs">
            1 Lezzet Döner
          </p>

          <h2 className="mt-3 text-2xl font-black tracking-tight sm:mt-4 sm:text-4xl">
            Lezzetli Bir Mola Ver
          </h2>

          <p className="mt-4 text-xs leading-7 text-[#79655E] sm:mt-5 sm:text-base sm:leading-8">
            Tavuk döner, yaprak et döner ve birbirinden lezzetli
            seçeneklerimizi keşfet. Güncel ürünlerimizi ve fiyatlarımızı
            menümüzden kolayca inceleyebilirsin.
          </p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#2B1B1E] px-5 py-8 text-white sm:px-6 sm:py-10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="text-center sm:text-left">
            <p className="text-base font-black tracking-tight sm:text-lg">
              1 LEZZET DÖNER
            </p>

            <p className="mt-2 text-xs text-white/50">
              Bursa · Kestel
            </p>
          </div>

          <p className="text-[11px] text-white/50 sm:text-xs">
            © {new Date().getFullYear()} 1 Lezzet Döner
          </p>
        </div>
      </footer>

      {/* PRODUCT DETAIL MODAL */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </main>
  );
}
