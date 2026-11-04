"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell, ChevronDown, ArrowUpRight } from "lucide-react";
import { getMenuProducts, type MenuProduct } from "@/lib/menu-api";
import type { Courier, DailyCash } from "@/lib/api";

type Notice = { id: string; text: string; href: string; action: string; tone: "orange" | "red" | "blue" };

export default function OperationsAlerts({ dailyCash, couriers }: {
  dailyCash: DailyCash | null;
  couriers: Courier[];
}) {
  const [menuProducts, setMenuProducts] = useState<MenuProduct[] | null>(null);
  const [menuUnavailable, setMenuUnavailable] = useState(false);
  const [expanded, setExpanded] = useState(true);

  useEffect(() => {
    let active = true;
    getMenuProducts()
      .then((data) => { if (active) { setMenuProducts(data); setMenuUnavailable(false); } })
      .catch(() => { if (active) setMenuUnavailable(true); });
    return () => { active = false; };
  }, []);

  const notices: Notice[] = [];
  const packages = couriers.reduce((sum, c) => sum + c.packageCount, 0);
  if (dailyCash && dailyCash.incomes.length === 0 && packages > 0) {
    notices.push({ id: "cash", text: `${packages} paket kaydı var, ancak bugünün Günlük Kasa gelir kaydı bulunmuyor.`, href: "/gunluk-kasa", action: "Kasayı kontrol et", tone: "red" });
  }
  if (menuProducts) {
    const missingImages = menuProducts.filter((p) => p.active && !p.imageUrl).length;
    const soldOut = menuProducts.filter((p) => p.active && p.soldOut).length;
    if (missingImages > 0) notices.push({id:"image",text:`QR Menü'de ${missingImages} aktif ürünün görseli eksik.`,href:"/qr-menu",action:"Ürünleri düzenle",tone:"orange"});
    if (soldOut > 0) notices.push({id:"soldout",text:`QR Menü'de ${soldOut} ürün tükendi olarak işaretli.`,href:"/qr-menu",action:"Durumları kontrol et",tone:"blue"});
  }

  return (
    <section className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 xl:mt-6" aria-label="İşletme bildirimleri">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button type="button" onClick={() => setExpanded((value) => !value)} aria-expanded={expanded} className="flex items-center gap-3 text-left">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-600"><Bell size={19}/></span>
          <span>
            <span className="block text-sm font-bold text-[#082d4e]">İşletme Kontrol Merkezi {notices.length ? `· ${notices.length}` : ""}</span>
            <span className="block text-xs text-slate-500">Kasa ve QR Menü için hızlı kontroller</span>
          </span>
          <ChevronDown size={17} className={`text-slate-400 transition ${expanded ? "rotate-180" : ""}`}/>
        </button>
        <Link href="/raporlar" className="inline-flex min-h-10 items-center gap-1.5 rounded-xl border border-slate-200 px-3 text-xs font-bold text-slate-700 hover:bg-slate-50">
          PDF / Excel Raporları <ArrowUpRight size={15}/>
        </Link>
      </div>
      {expanded && (
        <div className="mt-4 space-y-2">
          {notices.length ? notices.map((notice) => (
            <Link key={notice.id} href={notice.href} className={`flex flex-wrap items-center justify-between gap-2 rounded-xl border px-3 py-3 text-xs sm:text-sm ${notice.tone === "red" ? "border-red-100 bg-red-50 text-red-800" : notice.tone === "orange" ? "border-orange-100 bg-orange-50 text-orange-900" : "border-blue-100 bg-blue-50 text-blue-900"}`}>
              <span>{notice.text}</span>
              <span className="inline-flex items-center gap-1 whitespace-nowrap font-bold">{notice.action}<ArrowUpRight size={14}/></span>
            </Link>
          )) : <p className="rounded-xl bg-emerald-50 p-3 text-sm font-medium text-emerald-800">Görüntülenen verilerde dikkat gerektiren bir durum bulunmadı.</p>}
          {menuUnavailable && <p className="text-xs text-slate-500">QR Menü kontrolü şu an yapılamadı. Uyarı bulunmaması menünün eksiksiz olduğu anlamına gelmez.</p>}
          <p className="text-[11px] text-slate-400">Uyarılar sayfa açıldığında güncellenir. Anlık bildirim veya finansal kayıt oluşturmaz.</p>
        </div>
      )}
    </section>
  );
}
