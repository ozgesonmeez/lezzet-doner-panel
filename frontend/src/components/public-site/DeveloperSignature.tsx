"use client";

import Image from "next/image";
import { usePublicLocale } from "./Locale";

export default function DeveloperSignature() {
  const { t } = usePublicLocale();
  return (
    <div className="mt-6 flex items-center justify-center gap-2.5 whitespace-nowrap text-[11px] text-[#e7d8ca]">
      <span lang="en">Designed &amp; Developed by</span>
      <a href="https://ozgesonmez-portfolio.vercel.app" target="_blank" rel="noopener noreferrer"
        aria-label={t("Özge Sönmez portföyü (yeni sekme)")}
        className="rounded-sm opacity-85 hover:opacity-100 focus-visible:outline-2 motion-safe:transition-opacity">
        <Image src="/ozge-sonmez-signature.png" alt="" width={2172} height={724} sizes="(min-width: 640px) 130px, 100px" className="h-auto w-[100px] invert sepia sm:w-[130px]" />
      </a>
    </div>
  );
}
