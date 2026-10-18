"use client";
import PremiumIntro from "@/components/menu-premium/PremiumIntro";
import PremiumProductModal from "@/components/menu-premium/PremiumProductModal";
import PremiumScrollReveal from "@/components/menu-premium/PremiumScrollReveal";
import PremiumReviewCTA from "@/components/menu-premium/PremiumReviewCTA";
import PremiumGoogleReviews from "@/components/menu-premium/PremiumGoogleReviews";

import PremiumOnlineOrder from "@/components/menu-premium/PremiumOnlineOrder";
import { useEffect, useMemo, useState } from "react";
import { ArrowUpRight, ChevronDown, Search, X, UtensilsCrossed } from "lucide-react";
import PremiumHeader from "@/components/menu-premium/PremiumHeader";
import PremiumMobileBar from "@/components/menu-premium/PremiumMobileBar";
import PremiumHero from "@/components/menu-premium/PremiumHero";
import PremiumCategories, {type MenuCategory,type MenuProduct} from "@/components/menu-premium/PremiumCategories";
import PremiumFeatured, {price} from "@/components/menu-premium/PremiumFeatured";
import PremiumFooter from "@/components/menu-premium/PremiumFooter";


// Müşteri tarafında çalışan önerici: yalnızca API'den gelen mevcut ürünleri kullanır.
function LezzetOnerici({products, categories, onOpen}: {products: MenuProduct[]; categories: MenuCategory[]; onOpen: (product: MenuProduct) => void}) {
  const [expanded, setExpanded] = useState(false);
  const [appetite, setAppetite] = useState<"big" | "small" | "classic">("big");
  const [protein, setProtein] = useState<"tavuk" | "et">("tavuk");
  const [showResult, setShowResult] = useState(false);
  const available = useMemo(() => products.filter(p => !p.soldOut), [products]);
  const recommended = useMemo(() => {
    const normalize = (s: string) => s.toLocaleLowerCase("tr-TR");
    // "Et" kelimesi "etli" vb. ifadelerle karışmasın; tavuk ürünlerini et sayma.
    const menuCategoryIds = new Set(
      categories.filter(c => normalize(c.name).trim() === "menüler").flatMap(c => c.products.map(p => p.id))
    );
    const candidates = available.filter(p => {
      if (appetite === "big" && !menuCategoryIds.has(p.id)) return false;
      const name = normalize(p.name);
      const searchable = name;
      return protein === "tavuk"
        ? searchable.includes("tavuk") && !/(^|[^a-zçğıöşü])et([^a-zçğıöşü]|$)/i.test(name)
        : /(^|[^a-zçğıöşü])et([^a-zçğıöşü]|$)/i.test(searchable) && !name.includes("tavuk");
    });
    const rank = (p: MenuProduct) => {
      const name = normalize(p.name);
      const words = [name, normalize(p.description || "")].join(" ");
      let score = p.imageUrl ? 2 : 0;
      if (appetite === "big") {
        if (/zurna|atom|200\s*(gr|g)|büyük|dub(le)?/.test(words)) score += 12;
        if (/yarım|küçük|mini/.test(name)) score -= 10;
      } else if (appetite === "small") {
        if (/yarım|küçük|mini|50\s*(gr|g)/.test(words)) score += 12;
        if (/zurna|atom|büyük/.test(name)) score -= 8;
      } else {
        if (/hatay|dürüm|ekmek|yaprak/.test(name)) score += 8;
      }
      return score;
    };
    return [...candidates].sort((a, b) => rank(b) - rank(a))[0] || null;
  }, [available, appetite, protein, categories]);
  const formatPrice = (value: number) => new Intl.NumberFormat("tr-TR", {style: "currency", currency: "TRY"}).format(value);
  const minimumPrice = recommended ? (recommended.variants.length
    ? Math.min(...recommended.variants.map(v => v.price))
    : recommended.basePrice) : null;
  return (
    <section aria-label="Bugün Ne Yesem?" className="px-5 py-3 sm:px-10 sm:py-4">
      <div className="mx-auto max-w-7xl overflow-hidden rounded-[20px] border border-[#bda384]/60 bg-[#2b1d19] shadow-[0_8px_24px_rgba(44,29,24,.10)]">
        <button type="button" aria-expanded={expanded} onClick={() => setExpanded(v => !v)} className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left sm:px-7 sm:py-5">
          <span className="min-w-0">
            <span className="block text-[9px] font-bold uppercase tracking-[.22em] text-[#d8b78b]">SANA ÖZEL LEZZET REHBERİ</span>
            <span className="mt-1 block font-serif text-xl font-semibold text-[#fff8ee] sm:text-2xl">Bugün Ne Yesem?</span>
            <span className="mt-1 block text-[11px] text-[#d7c2b1]">İki seçimle lezzetini keşfet.</span>
          </span>
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-[#a58a6b] text-[#e8cba2]"><ChevronDown size={18} className={`transition-transform duration-300 ${expanded ? "rotate-180" : ""}`}/></span>
        </button>
        {expanded && (
          <div className="border-t border-[#6a5140] bg-[#fffaf4] px-4 py-4 sm:px-7 sm:py-5">
            <p className="mb-2 text-xs font-semibold text-[#3d2b22]"><span className="mr-2 text-[#a67e55]">01</span> Nasıl bir şey yemek istersin?</p>
            <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
              {([{value:"big",label:"Çok açım"},{value:"small",label:"Az olsun"},{value:"classic",label:"Klasik"}] as const).map(item => (
                <button key={item.value} type="button" aria-pressed={appetite === item.value} onClick={() => {setAppetite(item.value);setShowResult(false);}} className={`min-h-11 rounded-xl border px-2 py-2 text-[11px] font-semibold transition sm:text-xs ${appetite === item.value ? "border-[#a98962] bg-[#38261e] text-[#fff8ee]" : "border-[#e8d9c9] bg-white text-[#60483a] hover:border-[#b99a77]"}`}>{item.label}</button>
              ))}
            </div>
            <p className="mb-2 mt-4 text-xs font-semibold text-[#3d2b22]"><span className="mr-2 text-[#a67e55]">02</span> Et mi, tavuk mu?</p>
            <div className="grid grid-cols-2 gap-2">
              {([{value:"tavuk",label:"Tavuk Döner"},{value:"et",label:"Et Döner"}] as const).map(item => (
                <button key={item.value} type="button" aria-pressed={protein === item.value} onClick={() => {setProtein(item.value);setShowResult(false);}} className={`min-h-11 rounded-xl border px-3 py-2 text-xs font-semibold transition ${protein === item.value ? "border-[#a98962] bg-[#38261e] text-[#fff8ee]" : "border-[#e8d9c9] bg-white text-[#60483a] hover:border-[#b99a77]"}`}>{item.label}</button>
              ))}
            </div>
            <button type="button" onClick={() => setShowResult(true)} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#2b1d19] px-4 py-3 text-xs font-bold tracking-wide text-[#fff8ee] transition hover:bg-[#493126]">BANA LEZZET ÖNER <ArrowUpRight size={15} className="text-[#dfbd92]"/></button>
            {showResult && (
              <div aria-live="polite" className="mt-4 rounded-2xl border border-[#dfcfbc] bg-white p-3 sm:p-4">
                {recommended ? (
                  <div className="flex items-center gap-3 sm:gap-5">
                    <div className="flex size-24 shrink-0 items-center justify-center rounded-xl bg-[#f5ede3] p-2 sm:size-32">{recommended.imageUrl ? <img src={recommended.imageUrl} alt={recommended.name} className="h-full w-full object-contain"/> : <UtensilsCrossed size={28} className="text-[#aa8d70]"/>}</div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[9px] font-bold uppercase tracking-[.16em] text-[#a17a50]">SANA ÖNERİMİZ</p>
                      <h3 className="mt-1 font-serif text-lg font-semibold leading-tight text-[#30201a] sm:text-xl">{recommended.name}</h3>
                      {minimumPrice !== null && <p className="mt-1 text-xs font-bold text-[#92182e]">{recommended.variants.length ? "Başlangıç " : ""}{formatPrice(minimumPrice)}</p>}
                      <button type="button" onClick={() => onOpen(recommended)} className="mt-2 inline-flex items-center gap-1 rounded-full bg-[#92182e] px-3 py-2 text-[11px] font-bold text-white transition hover:bg-[#711125]">Ürünü İncele <ArrowUpRight size={13}/></button>
                    </div>
                  </div>
                ) : <p className="py-2 text-center text-xs leading-5 text-[#796455]">Bu tercihe uygun, satışta olan bir ürün bulunamadı. Diğer seçeneği deneyebilirsin.</p>}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

const API_URL=process.env.NEXT_PUBLIC_API_URL||"http://localhost:8080";
export default function PremiumMenuPage(){
  const [categories,setCategories]=useState<MenuCategory[]>([]);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState("");
  const [active,setActive]=useState<number|null>(null);
  const [search,setSearch]=useState("");
  const [selected,setSelected]=useState<MenuProduct|null>(null);
 const [featuredOpen,setFeaturedOpen]=useState(false);
  useEffect(()=>{const controller=new AbortController();(async()=>{try{const res=await fetch(`${API_URL}/api/public/menu`,{signal:controller.signal,cache:"no-store"});if(!res.ok)throw new Error("Menü yüklenemedi");const data:MenuCategory[]=await res.json();setCategories(data);}catch{if(!controller.signal.aborted)setError("Menü şu anda yüklenemiyor. Lütfen daha sonra tekrar deneyin.");}finally{if(!controller.signal.aborted)setLoading(false);}})();return()=>controller.abort();},[]);
  useEffect(()=>{if(!selected)return;const previous=document.body.style.overflow;document.body.style.overflow="hidden";const close=(e:KeyboardEvent)=>{if(e.key==="Escape")setSelected(null)};window.addEventListener("keydown",close);return()=>{document.body.style.overflow=previous;window.removeEventListener("keydown",close)};},[selected]);
  const all=useMemo(()=>categories.flatMap(c=>c.products),[categories]);
  const effectiveActive = active;
  const searching = Boolean(search.trim());
  const products = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("tr-TR");
    return all.filter(p => {
      if (query) return `${p.name} ${p.description || ""}`.toLocaleLowerCase("tr-TR").includes(query);
      return categories.find(c => c.id === effectiveActive)?.products.some(item => item.id === p.id) ?? false;
    });
  }, [all, categories, effectiveActive, search]);
  const hero=all.find(p=>p.featured&&p.imageUrl)||all.find(p=>p.imageUrl);
  function selectCategory(id:number|null){
  setActive(id);
  requestAnimationFrame(() => {
    document.getElementById("menu")?.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  });
}
  return <main className="min-h-screen bg-[#fffaf4] text-[#2c1d18]"><PremiumIntro/><PremiumHeader/><PremiumHero imageUrl={hero?.imageUrl} productName={hero?.name}/>
    <div className="border-b border-[#eadfd2] bg-[#fffaf4] px-5 py-4 text-center">
  <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-[#92182e] sm:text-xs">
    GERÇEK LEZZET, HER LOKMADA
  </p>
</div>


<div className="ld-logo-watermark">
<section className="relative flex min-h-[175px] items-center justify-center px-5 py-8 sm:min-h-[205px] sm:px-10 sm:py-10">
  <div className="relative z-10 mx-auto w-full max-w-7xl">
    <a
      href="tel:+905423941616"
      aria-label="0542 394 16 16 numarasını telefonla ara"
      className="group mx-auto flex w-full max-w-[440px] items-center gap-4 rounded-[24px] border border-[#5b4036] bg-[#2b1d19] px-5 py-5 text-left shadow-[0_14px_35px_rgba(43,29,25,0.16)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_20px_45px_rgba(43,29,25,0.22)] sm:px-7"
    >
      <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl border border-[#705347] bg-[#47332d] text-[#e8c3a0]">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.96.34 1.9.65 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.22a2 2 0 0 1 2.11-.45c.91.31 1.85.53 2.81.65A2 2 0 0 1 22 16.92Z"/>
        </svg>
      </span>

      <span className="min-w-0 flex-1">
        <span className="block text-[10px] font-bold uppercase tracking-[0.22em] text-[#d6b9a4]">
          SİPARİŞ HATTI
        </span>
        <span className="mt-1 block font-serif text-xl font-bold tracking-wide text-white sm:text-2xl">
          0542 394 16 16
        </span>
        <span className="mt-1 block text-xs text-[#d6b9a4]">
          Lezzet bir telefon uzağında.
        </span>
      </span>

      <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-[#705347] text-[#e8c3a0] transition group-hover:bg-[#e8c3a0] group-hover:text-[#2b1d19]">
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M7 17 17 7M7 7h10v10"/>
        </svg>
      </span>
    </a>
  </div>
</section>

{!loading&&!error&&<PremiumCategories categories={categories} onSelect={selectCategory}/>}

    {!loading&&!error&&(
 <section className="bg-transparent px-5 py-8 sm:px-10">
  <div className="mx-auto max-w-7xl">
   <button
    type="button"
    aria-expanded={featuredOpen}
    aria-controls="premium-featured-content"
    onClick={()=>setFeaturedOpen(value=>!value)}
    className="flex w-full items-center justify-between gap-4 rounded-[22px] border border-[#eadfd2] bg-white px-5 py-5 text-left shadow-sm transition hover:border-[#d5b9a5] sm:px-7"
   >
    <div>
     <p className="text-[10px] font-bold uppercase tracking-[.24em] text-[#92182e]">
      USTALIĞIMIZIN İMZASI
     </p>
     <h2 className="mt-2 font-serif text-xl font-bold text-[#2c1d18] sm:text-2xl">
      Öne Çıkan Lezzetlerimiz
     </h2>
     <p className="mt-1 text-xs text-[#8d7668]">
      {featuredOpen?"Lezzetleri gizle":"Lezzetleri göster"}
     </p>
    </div>
    <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#f8eeee] text-[#92182e]">
     <ChevronDown
      size={21}
      className={`transition-transform duration-300 ${featuredOpen?"rotate-180":""}`}
     />
    </span>
   </button>
   <div
    id="premium-featured-content"
    className={`grid transition-[grid-template-rows,opacity] duration-300 ease-in-out ${featuredOpen?"grid-rows-[1fr] opacity-100":"grid-rows-[0fr] opacity-0"}`}
   >
    <div className="min-h-0 overflow-hidden">
     {featuredOpen&&<PremiumFeatured products={all} onOpen={setSelected}/>}
    </div>
   </div>
  </div>
 </section>
)}
    {!loading&&!error&&<LezzetOnerici products={all} categories={categories} onOpen={setSelected}/>}
    
    <section id="menu" className="scroll-mt-24 bg-transparent px-5 py-16 sm:px-10 sm:py-24"><div className="mx-auto max-w-7xl"><div className="mb-8 flex flex-wrap items-end justify-between gap-5"><div><p className="text-[11px] font-black uppercase tracking-[.25em] text-[#92182e]">1 LEZZET DÖNER</p><h2 className="mt-3 font-serif text-5xl font-semibold tracking-tight sm:text-7xl">Menümüz.</h2><p className="mt-3 text-sm text-[#8d7668]">Güncel ürünlerimizi ve fiyatlarımızı keşfet.</p></div><label className="flex w-full items-center gap-3 rounded-full border border-[#e8d9ca] bg-white px-5 py-3 sm:w-[300px]"><Search size={18} className="text-[#92182e]"/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Ürün ara..." className="w-full bg-transparent text-sm outline-none" aria-label="Ürün ara"/></label></div>
    {loading?<p className="py-14 text-center text-[#8d7668]">Menü yükleniyor...</p>:error?<p role="alert" className="rounded-2xl bg-red-50 p-6 text-red-700">{error}</p>:<><div className="mb-9 flex gap-2 overflow-x-auto pb-3">{categories.map(c=><button key={c.id} type="button" onClick={()=>{setActive(c.id);setSearch("");}} className={`shrink-0 rounded-full px-5 py-3 text-xs font-bold ${(!searching && effectiveActive===c.id)?"bg-[#92182e] text-white":"border border-[#eadfd2] bg-[#f7efe7]"}`}>{c.name}</button>)}</div><div className="mb-5 flex items-center justify-between"><h3 className="font-serif text-2xl font-bold">{searching?"Arama Sonuçları":categories.find(c=>c.id===effectiveActive)?.name ?? "Kategorilerimiz"}</h3>{(effectiveActive !== null || searching) && <span className="text-xs text-[#937e70]">{products.length} ürün</span>}</div>{products.length?<div className="grid gap-3 sm:gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{products.map((p,index)=><button type="button" key={p.id} onClick={()=>setSelected(p)} style={{animationDelay:`${Math.min(index,8)*55}ms`}} className="ld-product-enter group flex overflow-hidden rounded-[20px] border border-[#e9dccc] bg-white text-left shadow-sm transition hover:border-[#d5b9a5] hover:shadow-lg sm:block sm:rounded-[24px] sm:hover:-translate-y-1"><div className="relative flex w-[112px] shrink-0 items-center justify-center overflow-hidden bg-[#f0e3d4] sm:aspect-[5/4] sm:w-full">{p.imageUrl?<img src={p.imageUrl} alt={p.name} loading="lazy" className="h-full w-full object-contain p-3 transition duration-500 group-hover:scale-105"/>:<UtensilsCrossed size={29} strokeWidth={1.1} className="text-[#baa18d]"/>}{p.soldOut&&<span className="absolute left-3 top-3 rounded-full bg-[#92182e] px-3 py-1 text-xs font-bold text-white">Tükendi</span>}</div><div className="min-w-0 flex-1 p-3 sm:p-5"><h4 className="font-serif text-base font-bold sm:text-xl">{p.name}</h4>{p.description&&<p className="mt-1 line-clamp-2 text-xs leading-5 text-[#8d7668] sm:mt-2">{p.description}</p>}{p.variants.length > 0 && (
  <div className="mt-3 grid grid-cols-3 gap-1.5 sm:grid-cols-2 sm:gap-2">
    {p.variants.map(v => (
      <div key={v.id} className="min-w-0 rounded-xl border border-[#eadfd2] bg-[#fffaf4] px-2.5 py-2 sm:px-3">
        <span className="block text-[11px] font-semibold text-[#71594c]">{v.name}</span>
        <strong className="mt-1 block text-sm font-bold text-[#92182e]">{price(v.price)}</strong>
      </div>
    ))}
  </div>
)}
<div className="mt-3 flex items-center justify-between gap-2 border-t border-[#eee1d5] pt-2 sm:mt-5 sm:pt-4"><strong className="text-sm font-bold text-[#92182e] sm:text-lg">{p.variants.length ? "Ürünü İncele" : p.basePrice!==null ? price(p.basePrice) : "Fiyat bilgisi yok"}</strong><span className="flex size-9 items-center justify-center rounded-full bg-[#92182e] text-white"><ArrowUpRight size={17}/></span></div></div></button>)}</div>:<div className="flex flex-col items-center gap-3 rounded-2xl bg-[#f7efe7] px-6 py-9 text-center">
  {effectiveActive===null&&!searching&&(
    <img
      src="/lezzet-doner-logo-seffaf.png"
      alt="1 Lezzet Döner"
      className="h-28 w-28 object-contain drop-shadow-sm sm:h-32 sm:w-32"
    />
  )}
  <p className="text-sm text-[#8d7668]">
    {effectiveActive===null&&!searching
      ? "Lezzetlerimizi keşfetmek için yukarıdan bir kategori seçin."
      : searching ? "Aramanızla eşleşen ürün bulunamadı." : "Bu kategoride henüz ürün bulunmuyor."}
  </p>
</div>}</>}</div></section>
    <PremiumGoogleReviews/>
    <PremiumReviewCTA/>
    <PremiumOnlineOrder/>
    </div>
    <PremiumScrollReveal/>
    <PremiumFooter/>
    <PremiumMobileBar/>
    {selected && (
        <PremiumProductModal
          key={selected.id}
          product={selected}
          onClose={() => setSelected(null)}
        />
      )}
  </main>;
}
