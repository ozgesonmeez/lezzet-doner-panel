"use client";
import { useRef, useState } from "react";
import { ArrowLeft, ArrowRight, ArrowUpRight, UtensilsCrossed } from "lucide-react";
import type { MenuProduct } from "./PremiumCategories";

export function price(value: number) {
  return new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 2, minimumFractionDigits: 0 }).format(value);
}

export default function PremiumFeatured({ products, onOpen }: { products: MenuProduct[]; onOpen: (product: MenuProduct) => void }) {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  function goTo(index: number) {
    const container = sliderRef.current;
    if (!container) return;

    const slides = container.querySelectorAll<HTMLElement>("[data-featured-slide]");
    const next = Math.max(0, Math.min(index, slides.length - 1));

    slides[next]?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "start"
    });

    setCurrentIndex(next);
  }

  const featured = products.filter(p => p.featured);
  const display = (featured.length ? featured : products).slice(0, 4);
  return (
    <section className="bg-[#fffaf4] px-0 py-4 sm:py-6">
      <div className="mx-auto max-w-7xl">

        {display.length === 0 ? (
          <p className="rounded-2xl border border-[#e7d9cc] bg-white px-6 py-10 text-center text-[#826d60]">Ürünler eklendiğinde burada görünecek.</p>
        ) : (
          <>
          <div ref={sliderRef} onScroll={event => { const el = event.currentTarget; const step = el.clientWidth + 16; if (step > 0) setCurrentIndex(Math.min(display.length - 1, Math.max(0, Math.round(el.scrollLeft / step)))); }} className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {display.map(product => {
              const amounts = product.variants?.map(v => v.price).filter(v => Number.isFinite(v)) ?? [];
              const minPrice = amounts.length ? Math.min(...amounts) : product.basePrice;
              return (
                <button data-featured-slide type="button" key={product.id} onClick={() => onOpen(product)} className="group flex min-h-[230px] sm:h-[260px] w-full min-w-full shrink-0 snap-center overflow-hidden rounded-[24px] sm:h-[260px] border border-[#eadfd4] bg-white text-left shadow-[0_10px_35px_rgba(44,28,24,.045)] transition duration-300 hover:shadow-[0_20px_45px_rgba(44,28,24,.13)]">
                  <div className="relative flex min-h-[230px] w-[38%] shrink-0 items-center justify-center overflow-hidden bg-[#f0e6da] sm:h-[260px] sm:w-[38%]">
                    {product.imageUrl ? <img src={product.imageUrl} alt={product.name} loading="lazy" className="h-full w-full object-contain p-3 transition-transform duration-500 group-hover:scale-105" /> : <div className="flex flex-col items-center gap-3 text-[#b8a18e]"><UtensilsCrossed size={44} strokeWidth={1} /><span className="text-[10px] font-semibold uppercase tracking-widest">Görsel Yakında</span></div>}
                    {product.soldOut && <span className="absolute left-3 top-3 rounded-full bg-[#281c19] px-3 py-1 text-[10px] font-bold text-white">Tükendi</span>}
                    {!product.soldOut && product.newProduct && <span className="absolute left-3 top-3 rounded-full bg-[#bb0d31] px-3 py-1 text-[10px] font-bold text-white">Yeni</span>}
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col justify-between p-4 sm:min-h-[192px] sm:p-6">
                    <div>
                      <h3 className="font-serif text-lg font-bold leading-snug text-[#30201b] sm:text-[22px]">{product.name}</h3>
                      {product.description && <p className="mt-2 line-clamp-2 text-xs leading-5 text-[#8b776b]">{product.description}</p>}
                    </div>
                    <div className="mt-5 flex items-end justify-between gap-2 border-t border-[#f0e7df] pt-4">
                      <div><span className="block text-[10px] text-[#9c8678]">{amounts.length > 1 ? "Başlangıç fiyatı" : "Fiyat"}</span><strong className="mt-1 block text-lg font-bold text-[#bb0d31]">{minPrice !== null && minPrice !== undefined ? price(minPrice) : "Fiyat yakında"}</strong></div>
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#bb0d31] text-white transition group-hover:bg-[#8f0a25]"><ArrowUpRight size={18} /></span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
          <div className="mt-3 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold text-[#92182e]">
                {Math.min(currentIndex + 1, display.length)} / {display.length} lezzet
              </p>
              <p className="mt-1 text-[11px] text-[#8d7668]">
                Diğer lezzetleri keşfet →
              </p>
            </div>
            <div className="flex gap-2">
              <button type="button" aria-label="Önceki ürün" disabled={currentIndex === 0}
                onClick={() => goTo(currentIndex - 1)}
                className="flex size-10 items-center justify-center rounded-full border border-[#e6d7c9] bg-white text-[#92182e] disabled:opacity-30">
                <ArrowLeft size={18}/>
              </button>
              <button type="button" aria-label="Sonraki ürün" disabled={currentIndex >= display.length - 1}
                onClick={() => goTo(currentIndex + 1)}
                className="flex size-10 items-center justify-center rounded-full bg-[#92182e] text-white disabled:opacity-30">
                <ArrowRight size={18}/>
              </button>
            </div>
          </div>
          </>
        )}
      </div>
    </section>
  );
}
