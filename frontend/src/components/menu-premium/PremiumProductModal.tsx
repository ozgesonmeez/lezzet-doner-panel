"use client";

import { LanguageSelector, usePublicLocale } from "@/components/public-site/Locale";
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import type { MenuProduct } from "./PremiumCategories";
import { price } from "./PremiumFeatured";

type Props = {
  product: MenuProduct;
  onClose: () => void;
};

export default function PremiumProductModal({ product, onClose }: Props) {
  const { t, productName, productDescription, variantName } = usePublicLocale();
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
          aria-label={t("Kapat")}
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
                alt={productName(product)}
                className="max-h-[360px] w-full object-contain p-5 md:max-h-[480px] md:p-9"
              />
            ) : (
              <span className="text-sm text-[#9b8976]">
                {t("Ürün görseli bulunmuyor")}
              </span>
            )}
          </div>

          <div className="flex flex-col p-6 sm:p-9 md:justify-center">
            <div className="mb-2 flex flex-wrap items-center justify-between gap-x-2 pr-8">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#9b7c57]">
                {t("1 LEZZET DÖNER · ÖZEL SEÇKİ")}
              </p>
              <LanguageSelector />
            </div>

            <h2
              id="premium-product-title"
              className="pr-8 font-serif text-[28px] font-medium leading-tight text-[#36271f] sm:text-[34px]"
            >
              {productName(product)}
            </h2>

            {product.description && (
              <p className="mt-4 text-sm leading-7 text-[#8c7b6c]">
                {productDescription(product)}
              </p>
            )}

            {product.soldOut && (
              <p className="mt-4 text-sm font-semibold text-[#92182e]">
                {t("Bu ürün şu anda tükenmiştir.")}
              </p>
            )}

            <div className="my-6 h-px bg-[#e2d5c3]" />

            {product.variants.length > 0 && (
              <>
                <p className="mb-3 text-sm font-medium text-[#4b392d]">
                  {t("Porsiyon seçenekleri")}
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
                          {variantName(variant.name)}
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

            <div className="mt-5 divide-y divide-[#e3d7c9] rounded-2xl border border-[#e3d7c9] bg-[#fffdf9] px-4" aria-label={t("Ürün bilgilendirmesi")}>
              <details className="group">
                <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 py-2 text-sm font-semibold text-[#47352a] [&::-webkit-details-marker]:hidden">
                  {t("İçindekiler")}
                  <span aria-hidden="true" className="text-[#9c7953] motion-safe:transition-transform group-open:rotate-180">⌄</span>
                </summary>
                <p className="pb-3 text-sm leading-6 text-[#806f60]">
                  {t("Bu ürün için doğrulanmış bir içerik listesi henüz paylaşılmadı.")}
                </p>
              </details>
              <details className="group">
                <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 py-2 text-sm font-semibold text-[#47352a] [&::-webkit-details-marker]:hidden">
                  {t("Alerjen Bilgilendirmesi")}
                  <span aria-hidden="true" className="text-[#9c7953] motion-safe:transition-transform group-open:rotate-180">⌄</span>
                </summary>
                <div className="pb-3 text-sm leading-6 text-[#806f60]">
                  <p>{t("Alerjen bilgileri kullanılan ekmek, sos ve diğer malzemelere göre değişebilir. Gıda alerjiniz varsa sipariş vermeden önce işletmemizle iletişime geçiniz.")}</p>
                  <a href="tel:+905423941616" className="mt-2 inline-flex min-h-11 items-center font-semibold text-[#92182e] underline underline-offset-4">{t("İşletmeyi ara: 0542 394 16 16")}</a>
                </div>
              </details>
            </div>

            <div className="mt-7">
              <p className="text-[10px] uppercase tracking-[0.16em] text-[#998572]">
                {product.variants.length ? t("Seçilen porsiyon") : t("Ürün fiyatı")}
              </p>
              <p className="mt-1 font-serif text-2xl font-semibold text-[#3e2e24]">
                {currentPrice != null
                  ? price(currentPrice)
                  : t("Fiyat bilgisi yok")}
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="mt-6 w-full rounded-full bg-[#3d2b24] px-6 py-4 text-sm font-semibold text-[#fff9ee] transition hover:bg-[#513a30]"
            >
              {t("Menüye Dön")}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
