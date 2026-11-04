"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode, type RefObject } from "react";
import { categoryDescriptionEnglish, categoryEnglish, productEnglish, variantEnglish } from "@/lib/public-menu-translations";
import { messages } from "@/lib/public-messages";

export type Locale = "tr" | "en";
export const localeKey = "lezzet-language";
const LocaleContext = createContext<{ locale: Locale; setLocale: (locale: Locale) => void } | null>(null);

export function PublicLocale({ initialLocale, scope, children }: { initialLocale: Locale; scope: RefObject<HTMLDivElement | null>; children: ReactNode }) {
  const [locale, setLocale] = useState(initialLocale);

  useEffect(() => {
    document.documentElement.lang = locale;
    return () => { document.documentElement.lang = "tr"; };
  }, [locale]);

  useEffect(() => {
    function syncPreference(event: StorageEvent) {
      if (event.key === localeKey && (event.newValue === "tr" || event.newValue === "en")) {
        setLocale(event.newValue);
      }
    }
    window.addEventListener("storage", syncPreference);
    return () => window.removeEventListener("storage", syncPreference);
  }, []);

  function selectLocale(next: Locale) {
    document.cookie = `${localeKey}=${next}; Path=/; Max-Age=31536000; SameSite=Lax`;
    try { localStorage.setItem(localeKey, next); } catch { /* Cookie still preserves the preference. */ }
    setLocale(next);
  }

  return (
    <LocaleContext.Provider value={{ locale, setLocale: selectLocale }}>
      <div lang={locale} ref={scope} tabIndex={-1} className="ld-public-site">{children}</div>
    </LocaleContext.Provider>
  );
}

export function usePublicLocale() {
  const context = useContext(LocaleContext);
  if (!context) throw new Error("PublicLocale is required");
  const { locale, setLocale } = context;
  const copy = useMemo(() => ({
    t: (text: string) => locale === "en" ? messages[text] ?? text : text,
    categoryName: (category: { id: number; name: string }) =>
      locale === "en" ? categoryEnglish[category.id] ?? category.name : category.name,
    categoryDescription: (category: { id: number; description: string | null }) =>
      locale === "en" && category.description ? categoryDescriptionEnglish[category.id] ?? category.description : category.description,
    productName: (product: { id: number; name: string }) =>
      locale === "en" ? productEnglish[product.id]?.[0] ?? product.name : product.name,
    productDescription: (product: { id: number; description: string | null }) =>
      locale === "en" && product.description ? productEnglish[product.id]?.[1] ?? product.description : product.description,
    variantName: (name: string) =>
      locale === "en" ? variantEnglish[name] ?? name.replace(/^(\d+)\s*gr\.?$/i, "$1 g") : name,
  }), [locale]);
  return { locale, setLocale, ...copy };
}

export function LanguageSelector() {
  const { locale, setLocale } = usePublicLocale();
  return (
    <div role="group" aria-label="Dil / Language" className="flex shrink-0 items-center gap-1 text-[11px] font-semibold">
      {(["tr", "en"] as const).map(language => (
        <button key={language} type="button" lang={language} aria-label={language === "tr" ? "Türkçe" : "English"} aria-pressed={locale === language} onClick={() => setLocale(language)}
          className="grid min-h-11 min-w-8 place-items-center rounded focus-visible:outline-2 aria-pressed:underline aria-pressed:underline-offset-4">
          {language.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
