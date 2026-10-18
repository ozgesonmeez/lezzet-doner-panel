"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, ArrowUpRight, MapPin } from "lucide-react";

type Props = { imageUrl?: string | null; productName?: string };
type Slide = { id: number | string; desktopImageUrl: string; mobileImageUrl?: string | null; title: string };
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

function parseSlides(data: unknown): Slide[] {
  const list = Array.isArray(data) ? data : data && typeof data === "object" && "content" in data ? (data as { content: unknown }).content : [];
  if (!Array.isArray(list)) return [];
  return list.flatMap((entry, index) => {
    if (!entry || typeof entry !== "object") return [];
    const s = entry as Record<string, unknown>;
    if (s.active === false) return [];
    const desktopImageUrl = typeof s.desktopImageUrl === "string" ? s.desktopImageUrl : typeof s.imageUrl === "string" ? s.imageUrl : "";
    if (!desktopImageUrl) return [];
    return [{
      id: typeof s.id === "number" || typeof s.id === "string" ? s.id : index,
      desktopImageUrl,
      mobileImageUrl: typeof s.mobileImageUrl === "string" ? s.mobileImageUrl : null,
      title: typeof s.title === "string" ? s.title : "1 Lezzet Döner",
    }];
  });
}

export default function PremiumHero({ imageUrl, productName }: Props) {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [active, setActive] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const localVideos = [
    { id: "video-shawarma", url: "/lezzet-pexels-deneme.mp4", title: "Döner" },
    { id: "video-tavuk", url: "/lezzet-slider-tavuk.mp4", title: "Tavuk Döner" },
    { id: "video-shawarma-original", url: "/lezzet-slider-shawarma.mp4", title: "Shawarma" },
  ];
  const totalSlides = localVideos.length + slides.length;
  const videoSlide = active < localVideos.length ? localVideos[active] : null;
  const imageSlide = active >= localVideos.length
    ? slides[active - localVideos.length]
    : null;
  const touchStartX = useRef<number | null>(null);
  useEffect(() => {
    const controller = new AbortController();
    fetch(`${API_URL}/api/public/menu/slides`, { signal: controller.signal, cache: "no-store" })
      .then(res => res.ok ? res.json() : [])
      .then(data => { if (!controller.signal.aborted) setSlides(parseSlides(data)); })
      .catch(() => {});
    return () => controller.abort();
  }, []);
  useEffect(() => {
    if (totalSlides < 2 || videoSlide) return;
    const timer = window.setTimeout(() => {
      setActive(i => (i + 1) % totalSlides);
    }, 5000);
    return () => window.clearTimeout(timer);
  }, [active, totalSlides, videoSlide]);
  const current = imageSlide;
  const desktop = current?.desktopImageUrl || imageUrl;
  const mobile = current?.mobileImageUrl;
  const change = (step: number) => setActive(i => (i + step + totalSlides) % totalSlides);

  useEffect(() => {
    if (videoSlide && videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    }
  }, [active, videoSlide]);

  const onTouchStart = (e: React.TouchEvent<HTMLElement>) => {
    touchStartX.current = e.touches[0]?.clientX ?? null;
  };

  const onTouchEnd = (e: React.TouchEvent<HTMLElement>) => {
    if (touchStartX.current === null || totalSlides < 2) return;
    const distance = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(distance) > 50) change(distance < 0 ? 1 : -1);
  };

  return (
    <section onTouchStart={onTouchStart} onTouchEnd={onTouchEnd} id="ust" aria-label="1 Lezzet Döner slider" className="relative isolate min-h-[540px] overflow-hidden bg-[#1b100d] text-white md:min-h-[720px]">
      {/* Background stays full width at every viewport size. The food image is never edited. */}
      {desktop ? (
        <picture key={current?.id ?? desktop} className="absolute inset-0 -z-20 block h-full w-full">
          <source media="(max-width: 639px)" srcSet={mobile || desktop} />
          <img src={desktop} alt={current?.title || productName || "1 Lezzet Döner"} className="absolute inset-0 h-full w-full object-cover object-center" />
        </picture>
      ) : <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_75%_40%,#6b331c,#160b08_70%)]" />}
      {videoSlide && (
        <div className="pointer-events-none absolute inset-0 -z-20 overflow-hidden bg-[#1b100d]">
          <video
            key={videoSlide.id}
            ref={videoRef}
            src={
              videoSlide.url
            }
            autoPlay
            muted
            playsInline
            preload="auto"
            onEnded={() => change(1)}
            aria-label={videoSlide.title}
            className={
              videoSlide.id === "video-shawarma"
                ? "absolute inset-0 h-full w-full scale-[1.22] object-cover object-[65%_center] md:scale-100 md:object-[center_58%]"
                : "absolute inset-0 h-full w-full object-cover object-[72%_center] md:object-center"
            }
          />
        </div>
      )}
      {/* Constant base tint prevents grey areas, including when the window is resized. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-[#130a08]/15" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-r from-[#130a08]/90 via-[#130a08]/55 to-transparent" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-t from-black/35 via-transparent to-black/15" />
      <div className="mx-auto flex min-h-[540px] max-w-7xl flex-col justify-center px-6 pb-28 pt-32 md:min-h-[720px] md:px-12 md:pb-24 md:pt-40">
        <div className="max-w-[540px]">
          <p className="mb-7 w-fit border-b border-[#d7b08a]/60 pb-3 text-[10px] font-semibold uppercase tracking-[.35em] text-[#f9e5d4]">LEZZETİN İMZASI</p>
          <h1 className="font-serif text-[clamp(2.7rem,10vw,4rem)] font-bold leading-[.96] tracking-[-.05em] md:text-[clamp(3.6rem,6.2vw,6rem)]">
            {(() => {
              const titles = [
                ["Dönerin", "En Güzel", "Hâli."],
                ["Her Lokmada", "Ayrı Bir", "Lezzet."],
                ["Bir Dönerden", "Çok Daha", "Fazlası."],
              ];
              const [first, accent, last] = titles[active % titles.length];
              return <>{first}<br/><span className="italic text-[#d70b2c]">{accent}</span><br/>{last}</>;
            })()}
          </h1>
          <p className="mt-8 max-w-[400px] text-sm leading-7 text-[#f0dfd2] md:text-base">Tavuk dönerden yaprak et dönere, lezzetlerimizi keşfet.</p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a
              href="#menu"
              className="inline-flex items-center gap-3 rounded-full bg-[#b80e30] px-7 py-4 text-sm font-semibold text-white shadow-lg shadow-black/20 transition hover:bg-[#d6183f]"
            >
              Menüyü Keşfet <ArrowUpRight size={17}/>
            </a>
            <a
              href="#online-siparis"
              className="inline-flex items-center gap-3 rounded-full border border-[#e9c8a9]/70 bg-[#211410]/35 px-7 py-4 text-sm font-semibold text-[#fff4e9] backdrop-blur-sm transition hover:bg-white/10"
            >
              Online Sipariş <ArrowUpRight size={17}/>
            </a>
          </div>
          <p className="mt-7 flex items-center gap-2 text-xs font-medium tracking-wide text-white"><MapPin size={17} className="text-[#e01c42]"/> Bursa · Kestel</p>
        </div>
      </div>
      {totalSlides > 1 && <>
        <button type="button" onClick={() => change(-1)} aria-label="Önceki slayt" className="absolute bottom-7 left-6 grid size-11 place-items-center rounded-full border border-white/60 bg-black/35 transition hover:bg-black/70 md:bottom-auto md:top-1/2 md:left-4"><ArrowLeft size={20}/></button>
        <button type="button" onClick={() => change(1)} aria-label="Sonraki slayt" className="absolute bottom-7 right-6 grid size-11 place-items-center rounded-full border border-white/60 bg-black/35 transition hover:bg-black/70 md:bottom-auto md:top-1/2 md:right-4"><ArrowRight size={20}/></button>
        <div className="absolute bottom-10 left-1/2 flex -translate-x-1/2 gap-2" aria-label="Slider sayfaları">{[...localVideos, ...slides].map((slide,index) => <button type="button" key={slide.id} onClick={() => setActive(index)} aria-label={`${index+1}. slayta git`} aria-current={active===index ? "true" : undefined} className={`size-2.5 rounded-full ${active===index ? "bg-[#e01c42]" : "bg-white/50"}`}/>)}</div>
      </>}
    </section>
  );
}
