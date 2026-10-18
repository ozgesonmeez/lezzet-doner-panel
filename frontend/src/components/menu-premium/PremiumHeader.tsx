"use client";

import { useState } from "react";
import Image from "next/image";
import { ArrowUpRight, Menu, X } from "lucide-react";

const links = [
  { label: "Ana Sayfa", href: "#ust" },
  { label: "Lezzetlerimiz", href: "#lezzetler" },
  { label: "Menümüz", href: "#menu" },
  { label: "Hakkımızda", href: "#hikayemiz" },
];

export default function PremiumHeader() {
  const [open, setOpen] = useState(false);
  return (
    <header className="absolute inset-x-0 top-0 z-50 border-b border-white/15 /90 text-white backdrop-blur-lg">
      <div className="mx-auto flex h-[80px] max-w-7xl items-center justify-between gap-4 px-5 md:h-[88px] md:px-10">
        <a href="#ust" onClick={() => setOpen(false)} aria-label="1 Lezzet Döner ana sayfa" className="flex h-[64px] w-[150px] shrink-0 items-center justify-center rounded-lg px-2 py-1 shadow-sm md:h-[70px] md:w-[180px]">
          <Image src="/lezzet-doner-logo-seffaf.png?v=20261012-215153" alt="1 Lezzet Döner" width={680} height={300} priority unoptimized className="h-full w-full object-contain" />
        </a>
        <nav aria-label="Ana menü" className="hidden items-center gap-7 text-[13px] font-semibold lg:flex">
          {links.map(link => <a key={link.href} href={link.href} className="transition hover:text-[#f1c2b3]">{link.label}</a>)}
        </nav>
        <a href="#menu" className="ml-auto hidden items-center gap-2 rounded-full px-5 py-3 text-xs font-bold transition hover:bg-[#d3183b] md:inline-flex lg:ml-0">Menüyü Keşfet <ArrowUpRight size={16}/></a>
        <button type="button" aria-label={open ? "Menüyü kapat" : "Menüyü aç"} aria-expanded={open} onClick={() => setOpen(!open)} className="flex size-10 items-center justify-center rounded-full border border-white/30 lg:hidden">{open ? <X size={21}/> : <Menu size={21}/>}</button>
      </div>
      {open && <nav aria-label="Mobil menü" className="flex flex-col gap-5 border-t border-white/15 px-7 py-6 text-sm font-semibold lg:hidden">{links.map(link => <a key={link.href} href={link.href} onClick={() => setOpen(false)}>{link.label}</a>)}<a href="#menu" onClick={() => setOpen(false)} className="text-[#f5a7b7]">Menüyü Keşfet →</a></nav>}
    </header>
  );
}
