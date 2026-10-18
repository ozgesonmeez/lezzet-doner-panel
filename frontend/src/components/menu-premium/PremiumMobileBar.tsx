"use client";

import { Phone, ShoppingBag, UtensilsCrossed } from "lucide-react";

export default function PremiumMobileBar() {
  return (
    <nav
      aria-label="Hızlı erişim"
      className="fixed inset-x-0 bottom-0 z-[60] border-t border-[#eadfd2] bg-[#fffaf4]/95 px-3 pt-2 pb-[calc(env(safe-area-inset-bottom)+8px)] shadow-[0_-8px_30px_rgba(45,25,18,0.12)] backdrop-blur-xl md:hidden"
    >
      <div className="mx-auto grid max-w-md grid-cols-[1fr_1fr_1.35fr] gap-2">
        <a href="#menu" className="flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl border border-[#eadfd2] bg-white text-[#49372e] transition active:scale-[0.97]">
          <UtensilsCrossed size={19} strokeWidth={1.7}/>
          <span className="text-[11px] font-semibold">Menü</span>
        </a>

        <a href="tel:+905423941616" className="flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl border border-[#eadfd2] bg-white text-[#49372e] transition active:scale-[0.97]">
          <Phone size={19} strokeWidth={1.7}/>
          <span className="text-[11px] font-semibold">Hemen Ara</span>
        </a>

        <a href="#online-siparis" className="flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl bg-[#92182e] text-white shadow-sm transition active:scale-[0.97]">
          <ShoppingBag size={19} strokeWidth={1.7}/>
          <span className="text-[11px] font-bold">Sipariş Ver</span>
        </a>
      </div>
    </nav>
  );
}
