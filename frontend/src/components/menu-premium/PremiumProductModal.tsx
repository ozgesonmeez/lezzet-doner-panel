"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import type { MenuProduct } from "./PremiumCategories";
import { price } from "./PremiumFeatured";

type Props = {
  product: MenuProduct;
  onClose: () => void;
};

export default function PremiumProductModal({ product, onClose }: Props) {
  const [selectedVariantId, setSelectedVariantId] = useState<number | null>(null);

  useEffect(() => {
    setSelectedVariantId(null);
  }, [product.id]);

  const selectedVariant =
    product.variants.find(v => v.id === selectedVariantId) ??
    product.variants[0];

  const currentPrice = product.variants.length
    ? selectedVariant?.price
    : product.basePrice;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-[#21130f]/75 p-0 backdrop-blur-sm sm:items-center sm:p-5"
      onMouseDown={event => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="premium-product-title"
        className="relative max-h-[94dvh] w-full max-w-4xl overflow-y-auto rounded-t-[30px] border border-[#e2d5c3] bg-[#faf7f0] shadow-2xl sm:rounded-[28px]"
      >
        <button
          type="button"
          aria-label="Kapat"
          onClick={onClose}
          className="absolute right-4 top-4 z-20 flex size-10 items-center justify-center rounded-full border border-[#e5d8c7] bg-[#fffdf9] text-[#49372e] shadow-sm transition hover:bg-[#eee4d6]"
        >
          <X size={19} />
        </button>

        <div className="grid md:grid-cols-2">
          <div className="flex min-h-[230px] items-center justify-center bg-[#f0e8dc] md:min-h-[480px]">
            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={product.name}
                className="max-h-[360px] w-full object-contain p-5 md:max-h-[480px] md:p-9"
              />
            ) : (
              <span className="text-sm text-[#9b8976]">
                Ürün görseli bulunmuyor
              </span>
            )}
          </div>

          <div className="flex flex-col p-6 sm:p-9 md:justify-center">
            <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#9b7c57]">
              1 LEZZET DÖNER · ÖZEL SEÇKİ
            </p>

            <h2
              id="premium-product-title"
              className="pr-8 font-serif text-[28px] font-medium leading-tight text-[#36271f] sm:text-[34px]"
            >
              {product.name}
            </h2>

            {product.description && (
              <p className="mt-4 text-sm leading-7 text-[#8c7b6c]">
                {product.description}
              </p>
            )}

            {product.soldOut && (
              <p className="mt-4 text-sm font-semibold text-[#92182e]">
                Bu ürün şu anda tükenmiştir.
              </p>
            )}

            <div className="my-6 h-px bg-[#e2d5c3]" />

            {product.variants.length > 0 && (
              <>
                <p className="mb-3 text-sm font-medium text-[#4b392d]">
                  Porsiyon seçenekleri
                </p>

                <div className="grid grid-cols-2 gap-2">
                  {product.variants.map(variant => {
                    const active = selectedVariant?.id === variant.id;
                    return (
                      <button
                        key={variant.id}
                        type="button"
                        aria-pressed={active}
                        onClick={() => setSelectedVariantId(variant.id)}
                        className={`rounded-xl border px-3 py-3 text-left transition ${
                          active
                            ? "border-[#9c7953] bg-[#eee4d6]"
                            : "border-[#e3d7c9] bg-[#fffdf9] hover:border-[#bda17b]"
                        }`}
                      >
                        <span className="block text-sm font-medium text-[#47352a]">
                          {variant.name}
                        </span>
                        <span className="mt-1 block text-sm font-semibold text-[#806448]">
                          {price(variant.price)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </>
            )}

            {/* LEZZET_INGREDIENT_ALLERGEN_V1 */}
            <div className="mt-6 space-y-2" aria-label="Ürün bilgilendirmesi">
              <details className="group rounded-2xl border border-[#e3d7c9] bg-[#fffdf9] px-4 py-3">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-semibold text-[#47352a] [&::-webkit-details-marker]:hidden">
                  <span className="inline-flex items-center gap-2"><span aria-hidden="true" className="text-base">🥬</span>İçindekiler ve ürün açıklaması</span>
                  <span aria-hidden="true" className="text-[#9c7953] transition-transform group-open:rotate-180">⌄</span>
                </summary>
                <div className="pt-3 text-sm leading-6 text-[#806f60]">
                  {product.description ? (
                    <p>{product.description}</p>
                  ) : (
                    <p>Bu ürünün içerik açıklaması henüz paylaşılmadı.</p>
                  )}
                  <p className="mt-2 text-xs text-[#9a806d]">Açıklama, tam içerik listesi yerine geçmeyebilir. Ayrıntılar için işletmemize danışabilirsiniz.</p>
                </div>
              </details>
              <details className="group rounded-2xl border border-[#e3d7c9] bg-[#fffdf9] px-4 py-3">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-semibold text-[#47352a] [&::-webkit-details-marker]:hidden">
                  <span className="inline-flex items-center gap-2"><span aria-hidden="true" className="text-base">🌾</span>Alerjen bilgileri</span>
                  <span aria-hidden="true" className="text-[#9c7953] transition-transform group-open:rotate-180">⌄</span>
                </summary>
                <div className="pt-3 text-sm leading-6 text-[#806f60]">
                  {/* LEZZET_MINI_ICON_V1 */}
                  <p>Bu ürün için doğrulanmış alerjen listesi henüz yayınlanmadı. Alerjiniz veya gıda hassasiyetiniz varsa sipariş vermeden önce içerik ve çapraz temas risklerini işletmemizle teyit edin.</p>
                  <p className="mt-3 text-[11px] font-semibold text-[#927d6c]">Alerjen simgeleri · yalnızca örnektir, bu ürünün içeriğini belirtmez</p>
                  <div className="mt-2 flex flex-wrap gap-1.5" aria-label="Genel alerjen simgeleri, ürüne özel değildir">
                    {([{ icon: "🌾", label: "Gluten" }, { icon: "🥛", label: "Süt" }, { icon: "🥚", label: "Yumurta" }, { icon: "🌱", label: "Soya" }, { icon: "🌰", label: "Sert kabuklu yemiş" }] as const).map(item => (
                      <span key={item.label} className="inline-flex items-center gap-1.5 rounded-full border border-[#eadfd2] bg-[#faf7f0] px-2.5 py-1 text-[11px] text-[#70584b]">
                        <span aria-hidden="true">{item.icon}</span>{item.label}
                      </span>
                    ))}
                  </div>
                  <a href="tel:+905423941616" className="mt-3 inline-flex font-semibold text-[#92182e] underline underline-offset-4">İşletmeyi ara: 0542 394 16 16</a>
                </div>
              </details>
            </div>

            <div className="mt-7">
              <p className="text-[10px] uppercase tracking-[0.16em] text-[#998572]">
                {product.variants.length ? "Seçilen porsiyon" : "Ürün fiyatı"}
              </p>
              <p className="mt-1 font-serif text-2xl font-semibold text-[#3e2e24]">
                {currentPrice != null
                  ? price(currentPrice)
                  : "Fiyat bilgisi yok"}
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="mt-6 w-full rounded-full bg-[#3d2b24] px-6 py-4 text-sm font-semibold text-[#fff9ee] transition hover:bg-[#513a30]"
            >
              Menüye Dön
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
