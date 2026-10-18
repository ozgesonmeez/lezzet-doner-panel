"use client";

import { ArrowUpRight, Bike, MapPin, ConciergeBell } from "lucide-react";

const platforms = [
  {
    name: "Trendyol GO Yemek",
    logo: "/siparis/uber-eats.svg",
    url: "https://tgoyemek.com/restoranlar/105331",
  },
  {
    name: "Yemeksepeti",
    logo: "/siparis/yemeksepeti.svg",
    url: "https://www.yemeksepeti.com/restaurant/web6/bir-lezzet-doner",
  },
];

export default function PremiumOnlineOrder() {
  return (
    <section
      id="online-siparis"
      aria-labelledby="online-siparis-baslik"
      className="bg-transparent px-5 pt-12 pb-8 sm:px-10 sm:pt-16 sm:pb-10"
    >
      <div className="mx-auto max-w-5xl">
        <div className="overflow-hidden rounded-[30px] bg-[#261713] px-6 py-10 text-center text-white shadow-xl sm:px-12 sm:py-14">
          <p className="text-[10px] font-bold uppercase tracking-[.3em] text-[#d5a991]">
            1 LEZZET DÖNER · ONLINE SİPARİŞ
          </p>

          <h2
            id="online-siparis-baslik"
            className="mt-4 font-serif text-4xl font-semibold sm:text-6xl"
          >
            Lezzet kapına gelsin.
          </h2>

          <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-[#dcc8bb]">
            Sevdiğin döner lezzetlerini dilediğin platformdan keşfet.
          </p>

          <div className="mx-auto mt-9 grid max-w-xl grid-cols-2 gap-3">
            {platforms.map((platform) => {
              const href = platform.url?.trim();
              const validHref = href && /^https?:\/\//i.test(href) ? href : null;

              const content = (
                <>
                  <img
                    src={platform.logo}
                    alt=""
                    className="h-10 w-10 rounded-xl object-contain sm:h-12 sm:w-12"
                  />
                  <span className="text-sm font-bold sm:text-base">
                    {platform.name}
                  </span>
                  {validHref && <ArrowUpRight size={17} />}
                </>
              );

              const cls = "flex min-h-32 flex-col items-center justify-center gap-2 rounded-2xl bg-[#fffaf4] px-3 py-5 text-[#291913] transition hover:bg-white sm:min-h-36";

              return validHref ? (
                <a
                  key={platform.name}
                  href={validHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cls}
                >
                  {content}
                </a>
              ) : (
                <div key={platform.name} className={cls}>
                  {content}
                  <span className="text-[10px] text-[#8e7669]">
                    Bağlantı yakında
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-8 grid grid-cols-3 gap-3 text-center text-[#49372e]">
          <div className="flex flex-col items-center gap-2">
            <Bike size={21} strokeWidth={1.5} />
            <span className="text-[11px] font-semibold">Kapına teslimat</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <ConciergeBell size={21} strokeWidth={1.5} />
            <span className="text-[11px] font-semibold">Özenle hazırlanır</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <MapPin size={21} strokeWidth={1.5} />
            <span className="text-[11px] font-semibold">Bursa · Kestel</span>
          </div>
        </div>
      </div>
    </section>
  );
}
