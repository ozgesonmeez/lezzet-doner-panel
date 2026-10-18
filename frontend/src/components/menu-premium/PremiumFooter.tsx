import Image from "next/image";
import {
  ArrowUpRight,
  Clock3,
  MapPin,
  Phone,
} from "lucide-react";

const directionsUrl =
  "https://www.google.com/maps/dir/?api=1&destination=Ahmet%20Vefik%20Pa%C5%9Fa%20Mahallesi%20Pazaryeri%20Sokak%20No%3A10%2FA%20Kestel%20Bursa";

export default function PremiumFooter() {
  return (
    <footer className="bg-[#201311] px-5 pb-7 pt-10 text-[#f7eee8] sm:px-10 sm:pt-14">
      <div className="mx-auto max-w-7xl">

        {/* Marka */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-7">
          <div>
            <a href="#ust" aria-label="1 Lezzet Döner ana sayfa">
              <Image
                src="/lezzet-doner-logo-seffaf.png"
                alt="1 Lezzet Döner"
                width={356}
                height={162}
                unoptimized
                className="h-auto w-[145px] object-contain sm:w-[175px]"
              />
            </a>
            <p className="mt-2 text-xs leading-5 text-[#c9b8b0]">
              Lezzetin her lokmada hissedildiği yer.
            </p>
          </div>

          <span className="text-[10px] font-bold uppercase tracking-[.2em] text-[#e5b8aa]">
            Bursa · Kestel
          </span>
        </div>

        {/* İletişim kartları */}
        <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-3">

          <a
            href={directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="1 Lezzet Döner için yol tarifi al"
            className="group flex min-w-0 flex-col rounded-2xl border border-white/10 bg-[#35231f] p-3.5 transition hover:border-[#e4364f]/60 sm:p-6"
          >
            <MapPin size={20} className="text-[#e4364f]" />

            <h3 className="mt-3 text-sm font-semibold text-white sm:text-base">
              Konumumuz
            </h3>

            <p className="mt-2 text-[11px] leading-5 text-[#c9b8b0] sm:text-sm">
              Ahmet Vefik Paşa Mah.
              <br />
              Pazaryeri Sk. No: 10/A
              <br />
              Bursa / Kestel
            </p>

            <span className="mt-auto inline-flex items-center gap-1 pt-4 text-xs font-semibold text-[#f2c6b9] group-hover:text-white">
              Yol Tarifi
              <ArrowUpRight size={14} />
            </span>
          </a>

          <a
            href="tel:+905423941616"
            aria-label="0542 394 16 16 numarasını ara"
            className="group flex min-w-0 flex-col rounded-2xl border border-white/10 bg-[#35231f] p-3.5 transition hover:border-[#e4364f]/60 sm:p-6"
          >
            <Phone size={20} className="text-[#e4364f]" />

            <h3 className="mt-3 text-sm font-semibold text-white sm:text-base">
              Sipariş Hattı
            </h3>

            <p className="mt-2 break-words text-[12px] font-semibold leading-5 text-[#f7eee8] sm:text-base">
              0542 394 16 16
            </p>

            <span className="mt-auto inline-flex items-center gap-1 pt-4 text-xs font-semibold text-[#f2c6b9] group-hover:text-white">
              Hemen Ara
              <ArrowUpRight size={14} />
            </span>
          </a>
          {/* Çalışma saatleri */}
        <div className="col-span-2 mt-3 rounded-2xl border border-white/10 bg-[#35231f] px-4 py-4 sm:px-6 lg:col-span-1 lg:mt-0">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Clock3 size={18} className="shrink-0 text-[#e4364f]" />
              <h3 className="text-sm font-semibold text-white">
                Çalışma Saatleri
              </h3>
            </div>

            <span className="text-[11px] font-medium text-[#f2c6b9] lg:hidden">
              Pazar kapalı
            </span>
          </div>


          {/* Masaüstü: gün gün çalışma saatleri */}
          <div className="mt-4 hidden space-y-2 border-t border-white/10 pt-4 text-xs lg:block">
              <div className="flex items-center justify-between gap-3">
                <span className="text-[#c9b8b0]">Pazartesi</span>
                <span className="font-semibold text-white">09:00 – 21:30</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-[#c9b8b0]">Salı</span>
                <span className="font-semibold text-white">09:00 – 21:30</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-[#c9b8b0]">Çarşamba</span>
                <span className="font-semibold text-white">09:00 – 21:30</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-[#c9b8b0]">Perşembe</span>
                <span className="font-semibold text-white">09:00 – 21:30</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-[#c9b8b0]">Cuma</span>
                <span className="font-semibold text-white">09:00 – 21:30</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-[#c9b8b0]">Cumartesi</span>
                <span className="font-semibold text-white">09:00 – 21:30</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-[#c9b8b0]">Pazar</span>
                <span className="font-semibold text-[#f2c6b9]">Kapalı</span>
              </div>
          </div>

          <div className="mt-3 flex lg:hidden flex-wrap items-center justify-between gap-x-4 gap-y-1 text-xs sm:text-sm">
            <span className="text-[#c9b8b0]">
              Pazartesi – Cumartesi
            </span>
            <span className="font-semibold text-white">
              09:00 – 21:30
            </span>
          </div>
        </div>

        </div>

        {/* Alt navigasyon */}
        <div className="mt-8 flex flex-wrap gap-x-5 gap-y-3 border-t border-white/10 pt-6 text-xs text-[#c9b8b0] sm:text-sm">
          <a href="#ust" className="transition hover:text-white">
            Ana Sayfa
          </a>
          <a href="#lezzetler" className="transition hover:text-white">
            Lezzetlerimiz
          </a>
          <a href="#menu" className="transition hover:text-white">
            Menümüz
          </a>
          <a href="#hikayemiz" className="transition hover:text-white">
            Hakkımızda
          </a>
        </div>

        <div className="mt-7 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-5 text-[11px] text-[#a9958d]">
          <span>
            © {new Date().getFullYear()} 1 Lezzet Döner.
            Tüm hakları saklıdır.
          </span>

          <a href="#ust" className="transition hover:text-white">
            Başa dön ↑
          </a>
        </div>

      </div>
    </footer>
  );
}
