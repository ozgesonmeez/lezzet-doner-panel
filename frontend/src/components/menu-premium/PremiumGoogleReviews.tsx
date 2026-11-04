"use client";

import { usePublicLocale } from "@/components/public-site/Locale";
import { useEffect, useState } from "react";
import {
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Star,
  Quote,
} from "lucide-react";

const GOOGLE_URL = "https://share.google/9UJEMdHLQSOQDKYZS";

const REVIEW_REFERENCE_DATE = new Date("2026-10-12T12:00:00+03:00");

function reviewDate(originalDate: string, elapsed: boolean, locale: "tr" | "en"): string {
  const date = elapsed ? dynamicReviewDate(originalDate) : originalDate;
  if (locale === "tr") return date;
  return date.replace(/^bir yıl önce$/, "1 year ago")
    .replace(/(\d+)\s+(gün|hafta|ay|yıl)/g, (_, amount: string, unit: string) => {
      const label = ({ gün: "day", hafta: "week", ay: "month", yıl: "year" } as Record<string, string>)[unit];
      return `${amount} ${label}${amount === "1" ? "" : "s"}`;
    })
    .replace(/ önce$/, " ago");
}

function dynamicReviewDate(originalDate: string): string {
  const match = originalDate.match(/^(\\d+)\\s+(gün|hafta|ay|yıl) önce$/);
  if (!match) return originalDate;

  const amount = Number(match[1]);
  const unit = match[2];

  const initialDays =
    unit === "gün" ? amount :
    unit === "hafta" ? amount * 7 :
    unit === "ay" ? amount * 30.4375 :
    amount * 365.25;

  const elapsedDays = Math.max(
    0,
    Math.floor((Date.now() - REVIEW_REFERENCE_DATE.getTime()) / 86400000)
  );

  const totalDays = Math.floor(initialDays + elapsedDays);

  if (totalDays < 7) return `${totalDays} gün önce`;
  if (totalDays < 30) return `${Math.floor(totalDays / 7)} hafta önce`;
  if (totalDays < 365) return `${Math.floor(totalDays / 30.4375)} ay önce`;

  const years = Math.floor(totalDays / 365.25);
  const remainingMonths = Math.floor((totalDays - years * 365.25) / 30.4375);

  if (remainingMonths < 1) return `${years} yıl önce`;
  return `${years} yıl ${remainingMonths} ay önce`;
}

const reviews = [
  { name: "Deniz Ö.", date: "7 ay önce", text: "Yıllardır hem yerinde aynı zamanda sipariş üzerine yemek yediğimiz temiz ,hijyen kurallarına uygun ,hoşgörülü çalışanlarına sahip bir işletme. Olumsuz yorumları görünce şaşırdım aksi hiçbirşeyle karşılaşmadık çünkü kolaylıklar dilerim 💫🙏🏻", english: "We have eaten here and ordered delivery for years. The restaurant is clean, follows hygiene standards, and has considerate staff. I was surprised by the negative reviews because our experience has been different. Wishing you all the best 💫🙏🏻" },
  { name: "Alibey Barıtçı", date: "10 ay önce", text: "Usta sizi ilk girdiğinizde mutlu bir tebessümle selamlıyor dönerin lezzetini anlatmaya gerek yok dükkan da aydınlık ve ferah çalışanlar da aynı şekilde güler yüzlü tuvaleti ve masaları da temiz gittiğim güzel mekanlardan biriydi", english: "The cook greets you with a smile as soon as you walk in. The döner speaks for itself. The shop is bright and airy, the staff are friendly, and the tables and restroom are clean. One of the nicer places I’ve visited." },
  { name: "Kağan Vatansever", date: "bir yıl önce", text: "Gittiğim en iyi dönercilerden biri burasıdır yani sipariş veriyorum en fazla 15-20 dakikada kapıda teslimat çok hızlı dönerin tadı şahane herkese öneririm.", english: "One of the best döner places I’ve tried. When I order, it arrives in 15–20 minutes at most. Delivery is fast, the döner tastes great, and I recommend it to everyone." },
  { name: "Sevim Meral", date: "5 yıl önce", text: "Gerçekten kesteldeki en güzel hizmet veren müşterinin ne istediğini anlatan temiz güler yüzlü ekip elinize yüreğinize sağlık....", english: "Really lovely service in Kestel, with a clean, friendly team that understands what customers want. Thank you for all your hard work." },
  { name: "Yüsra Zorlu", date: "10 ay önce", text: "gerçekten kestelde memnun kalarak ve lezzetine güvenerek yediğim tek yer burasıdır.Çalışanların güler yüzlülüğü olsun hijyen olsun lezzet olsun hepsi ayrı bir güzel.fiyat açısındanda gayet iyi bir yer bol kazançlarınız olsun", english: "This is the one place in Kestel where I always leave happy and can count on the food tasting good. The staff are friendly, the place is clean, and the food is delicious. The prices are good too. Wishing you continued success." },
  { name: "Deniz Kılıç", date: "2 gün önce", text: "Haytımda hem bu kadar güzel hemde bu kadar lezzetli bir döner yemedim öğrenci olamama rağmen bu kadar ilgi ve alaka beni değerli hissettirdi", english: "I’ve never had a döner this good and this tasty. Even though I’m not a student, the care and attention made me feel valued." },
  { name: "Kerem Doğanay", date: "2 hafta önce", text: "Düzenli gelip yiyorum başka yerlerde yiyince midem ağrıyor ama burda hem sıcak bekleme yok çok iyi ilgileniyorlar ve lezzet olarakta bulunmaz bir lezzet", english: "I eat here regularly. My stomach hurts when I eat elsewhere, but here there’s no waiting in the heat, they take good care of you, and the flavor is hard to find elsewhere." },
  { name: "nurdan bilir", date: "3 hafta önce", text: "Hayatımda yediğim en güzel döner kaliteli ve çok leziz işletme sahipleri de çok ilgili ve güleryüzlü kesinlikle tavsiye ederim", english: "The best döner I’ve ever had. It’s high quality and delicious, and the owners are attentive and friendly. I definitely recommend it." },
];


function GoogleMark({ size = 24 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      aria-label="Google"
      role="img"
      className="shrink-0"
    >
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.27 5.48-4.8 7.18l7.73 6C44.38 38.03 46.98 31.88 46.98 24.55z"/>
      <path fill="#FBBC05" d="M10.53 28.59A14.4 14.4 0 0 1 9.75 24c0-1.59.27-3.13.76-4.59l-7.98-6.2A23.9 23.9 0 0 0 0 24c0 3.87.93 7.52 2.56 10.78l7.97-6.19z"/>
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.91-5.8l-7.73-6c-2.15 1.45-4.92 2.3-8.18 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.97 6.19C6.51 42.62 14.62 48 24 48z"/>
    </svg>
  );
}

function Stars({ size = 16 }: { size?: number }) {
  const { t } = usePublicLocale();
  return (
    <div className="flex items-center gap-1 text-[#D89B39]" aria-label={t("5 üzerinden 5 yıldız")}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} size={size} fill="currentColor" strokeWidth={1.5}/>
      ))}
    </div>
  );
}

type Review = (typeof reviews)[number];

function PreviewCard({
  review,
  onClick,
}: {
  review: Review;
  onClick: () => void;
}) {
  const { t, locale } = usePublicLocale();
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    const update = () => setCurrentTime(Date.now());
    update();
    const timer = window.setInterval(update, 60 * 60 * 1000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex h-full min-h-[280px] w-full flex-col rounded-[24px] border border-[#e9dcd0] bg-[#fffaf5] p-6 text-left shadow-[0_16px_50px_rgba(54,32,21,.045)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_22px_55px_rgba(54,32,21,.1)]"
    >
      <div className="flex w-full items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[#f2e2da] font-serif text-lg font-bold text-[#a91432]">
            {review.name.charAt(0).toUpperCase()}
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-bold text-[#30211d]">{review.name}</span>
            <span className="mt-1 block text-xs text-[#978174]">{reviewDate(review.date, Boolean(currentTime), locale)}</span>
          </span>
        </div>
        <GoogleMark size={20}/>
      </div>

      <div className="mt-6"><Stars size={15}/></div>

      <p className="mt-5 line-clamp-5 text-sm leading-7 text-[#5d4a40]">
        {locale === "en" ? review.english : review.text}
      </p>

      <div className="mt-auto flex items-center justify-between pt-6">
        <span className="text-[11px] font-semibold text-[#a91432] group-hover:underline">
          {t("Yorumu öne çıkar")}
        </span>
        <Quote size={28} className="text-[#e7d4c3]"/>
      </div>
    </button>
  );
}

export default function PremiumGoogleReviews() {
  const { t, locale } = usePublicLocale();
  const [today, setToday] = useState(0);

  useEffect(() => {
    const update = () => setToday(Date.now());
    update();
    const timer = window.setInterval(update, 60 * 60 * 1000);
    return () => window.clearInterval(timer);
  }, []);

  void today;

  const [index, setIndex] = useState(2);
  const [expanded, setExpanded] = useState(false);

  // Yorumları her 5 saniyede bir otomatik değiştir.
  useEffect(() => {
    if (expanded || reviews.length < 2) return;

    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % reviews.length);
    }, 5000);

    return () => window.clearInterval(timer);
  }, [expanded]);

  const current = reviews[index];
  const previous = reviews[(index - 1 + reviews.length) % reviews.length];
  const following = reviews[(index + 1) % reviews.length];

  const go = (nextIndex: number) => {
    setIndex((nextIndex + reviews.length) % reviews.length);
    setExpanded(false);
  };

  return (
    <section
      id="yorumlar"
      aria-labelledby="yorumlar-baslik"
      className="relative overflow-hidden bg-transparent px-5 py-20 sm:px-10 sm:py-28"
    >

      <div className="relative mx-auto max-w-7xl">
        <div className="grid items-center gap-10 lg:grid-cols-[1fr_auto] lg:gap-14">
          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-[.27em] text-[#ad102d]">
              {t("MİSAFİRLERİMİZİN GÖZÜNDEN")}
            </p>

            <h2
              data-scroll-reveal="heading"
              id="yorumlar-baslik"
              className="mt-4 font-serif text-5xl font-semibold leading-[1.05] tracking-tight text-[#2d1d18] sm:text-6xl lg:text-7xl"
            >
              {t("Lezzetimizin")}
              <span className="block italic text-[#ad102d]">{t("izleri.")}</span>
            </h2>

            <p data-scroll-reveal="fade" className="mt-5 max-w-md text-sm leading-7 text-[#79655c]">
              {t("Misafirlerimizin Google'da paylaştığı gerçek deneyimler. Her yorum bizim için ayrı bir değer.")}
            </p>
          </div>

          <div className="flex items-center gap-5 rounded-[25px] border border-[#e9d9cb] bg-[#fffaf5] px-6 py-5 shadow-[0_16px_45px_rgba(58,35,22,.05)] sm:px-8">
            <div className="flex items-center gap-3">
              <GoogleMark size={39}/>
              <div>
                <div className="text-[17px] font-bold tracking-tight text-[#30211d]">
                  Google
                </div>
                <div className="text-[11px] text-[#8b776d]">
                  {t("Müşteri değerlendirmeleri")}
                </div>
              </div>
            </div>

            <div className="h-12 w-px bg-[#e6d8cd]"/>

            <div>
              <div className="font-serif text-3xl font-semibold text-[#30211d]">
                4,5<span className="text-base text-[#9c887c]">/5</span>
              </div>
              <div className="mt-1"><Stars size={13}/></div>
              <div className="mt-1 text-[11px] text-[#8b776d]">
                {t("135 değerlendirme")}
              </div>
            </div>
          </div>
        </div>

        
          {/* Mobil: küçük yan kartlar, büyük merkez kart */}
          <div className="relative mt-10 lg:hidden">
            <div className="relative mx-auto flex min-h-[420px] items-center justify-center overflow-hidden">

              {/* Önceki yorum: küçük ve arkada */}
              <button
                type="button"
                key={`left-${index}`}
                onClick={() => go(index - 1)}
                aria-label={t("Önceki yoruma geç")}
                className="absolute left-[-155px] top-1/2 z-0 h-[290px] w-[220px] -translate-y-1/2 scale-[0.88] overflow-hidden rounded-[24px] border border-[#e6d7c9] bg-[#fffaf5] p-4 text-left opacity-60 shadow-sm"
              >
                <span className="block truncate text-sm font-bold text-[#30211d]">{previous.name}</span>
                <span className="mt-3 block text-[#d89b39]">★★★★★</span>
                <p className="mt-4 line-clamp-5 text-sm leading-6 text-[#5d4a40]">{locale === "en" ? previous.english : previous.text}</p>
              </button>

              {/* Sonraki yorum: küçük ve arkada */}
              <button
                type="button"
                key={`right-${index}`}
                onClick={() => go(index + 1)}
                aria-label={t("Sonraki yoruma geç")}
                className="absolute right-[-155px] top-1/2 z-0 h-[290px] w-[220px] -translate-y-1/2 scale-[0.88] overflow-hidden rounded-[24px] border border-[#e6d7c9] bg-[#fffaf5] p-4 text-left opacity-60 shadow-sm"
              >
                <span className="block truncate text-sm font-bold text-[#30211d]">{following.name}</span>
                <span className="mt-3 block text-[#d89b39]">★★★★★</span>
                <p className="mt-4 line-clamp-5 text-sm leading-6 text-[#5d4a40]">{locale === "en" ? following.english : following.text}</p>
              </button>

              {/* Ana yorum: büyük ve önde */}
              <article
                key={`center-${index}`}
                className="ld-review-enter relative z-10 mx-auto flex min-h-[385px] w-[calc(100%-64px)] max-w-[360px] flex-col rounded-[28px] border border-[#e6d7c9] bg-[#fffdf9] p-5 shadow-[0_22px_65px_rgba(58,35,22,.12)]"
              >
                <div className="flex items-center gap-3">
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[#ad102d] font-serif text-xl font-semibold text-white">
                    {current.name.charAt(0).toUpperCase()}
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-sm font-bold text-[#30211d]">{current.name}</h3>
                    <p className="mt-1 text-[11px] text-[#978174]">
                      {reviewDate(current.date, Boolean(today), locale)} · {t("Google yorumu")}{locale === "en" && ` · ${t("Çevrilmiş yorum")}`}
                    </p>
                  </div>
                  <GoogleMark size={20}/>
                </div>

                <div className="mt-5"><Stars size={16}/></div>

                <p className={`mt-5 font-serif text-lg leading-7 text-[#38261f] ${expanded ? "" : "line-clamp-6"}`}>
                  {locale === "en" ? current.english : current.text}
                </p>

                {current.text.length > 190 && (
                  <button
                    type="button"
                    onClick={() => setExpanded(!expanded)}
                    className="mt-3 self-start text-xs font-bold text-[#ad102d] underline"
                  >
                    {expanded ? t("Daha az göster") : t("Devamını oku")}
                  </button>
                )}

                <div className="mt-auto pt-6 text-center text-[10px] font-bold uppercase tracking-widest text-[#a18c7f]">
                  {t("GERÇEK MÜŞTERİ DENEYİMİ")}
                </div>
              </article>
            </div>
          </div>

          <div className="mt-12 hidden items-stretch gap-4 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.8fr)_minmax(0,1fr)]">
          <div key={`previous-${index}`} className="ld-review-side-enter hidden lg:block">
            <PreviewCard
              review={previous}
              onClick={() => go(index - 1)}
            />
          </div>

          <article
            key={index}
            className="ld-review-enter relative flex min-h-[385px] flex-col rounded-[28px] border border-[#e6d7c9] bg-[#fffdf9] p-7 shadow-[0_22px_65px_rgba(58,35,22,.08)] sm:p-10"
          >
            <Quote
              aria-hidden="true"
              size={66}
              className="absolute right-7 top-7 text-[#f0e2d7]"
              strokeWidth={1.3}
            />

            <div className="relative flex flex-wrap items-center gap-4">
              <div className="flex size-13 h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full bg-[#ad102d] font-serif text-xl font-semibold text-white">
                {current.name.charAt(0).toUpperCase()}
              </div>

              <div className="min-w-0">
                <h3 className="text-base font-bold text-[#30211d]">
                  {current.name}
                </h3>
                <p className="mt-1 text-xs text-[#978174]">
                  {reviewDate(current.date, Boolean(today), locale)} · {t("Google yorumu")}{locale === "en" && ` · ${t("Çevrilmiş yorum")}`}
                </p>
              </div>

              <div className="ml-auto flex items-center gap-2">
                <GoogleMark size={24}/>
              </div>
            </div>

            <div className="mt-6"><Stars size={19}/></div>

            <p
              className={`mt-7 whitespace-pre-wrap font-serif text-[clamp(1.35rem,2.2vw,1.95rem)] leading-[1.5] text-[#38261f] ${
                expanded ? "" : "line-clamp-5"
              }`}
            >
              {locale === "en" ? current.english : current.text}
            </p>

            {current.text.length > 190 && (
              <button
                type="button"
                onClick={() => setExpanded(!expanded)}
                className="mt-4 self-start text-xs font-bold text-[#ad102d] underline underline-offset-4"
              >
                {expanded ? t("Daha az göster") : t("Devamını oku")}
              </button>
            )}

            <div className="mt-auto flex items-center justify-between gap-3 pt-9">
              <span className="text-[10px] font-extrabold uppercase tracking-[.2em] text-[#a18c7f]">
                {t("GERÇEK MÜŞTERİ DENEYİMİ")}
              </span>
              <span className="font-serif text-sm italic text-[#ad102d]">
                1 Lezzet Döner
              </span>
            </div>
          </article>

          <div key={`following-${index}`} className="ld-review-side-enter hidden lg:block">
            <PreviewCard
              review={following}
              onClick={() => go(index + 1)}
            />
          </div>
        </div>

        <div className="mt-7 flex flex-wrap items-center justify-center gap-5">
          <button
            type="button"
            onClick={() => go(index - 1)}
            aria-label={t("Önceki yorum")}
            className="flex size-11 items-center justify-center rounded-full border border-[#cbb8a9] text-[#432c25] transition hover:border-[#ad102d] hover:bg-white"
          >
            <ChevronLeft size={21}/>
          </button>

          <div className="flex items-center gap-2" aria-label={`${t("Yorum")} ${index + 1} / ${reviews.length}`}>
            {reviews.map((review, i) => (
              <button
                key={`${review.name}-${i}`}
                type="button"
                onClick={() => go(i)}
                aria-label={t("{n}. yorumu göster").replace("{n}", String(i + 1))}
                aria-current={i === index ? "true" : undefined}
                className={`h-2 rounded-full transition-all ${
                  i === index
                    ? "w-7 bg-[#ad102d]"
                    : "w-2 bg-[#d9c8b9] hover:bg-[#b9a091]"
                }`}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={() => go(index + 1)}
            aria-label={t("Sonraki yorum")}
            className="flex size-11 items-center justify-center rounded-full border border-[#cbb8a9] text-[#432c25] transition hover:border-[#ad102d] hover:bg-white"
          >
            <ChevronRight size={21}/>
          </button>
        </div>

        <div className="mt-12 flex flex-wrap items-center justify-between gap-6 border-t border-[#e4d6ca] pt-8">
          <div>
            <p className="text-sm font-semibold text-[#4b342a]">
              {t("Misafirlerimizin sözleri bizim için kıymetli.")}
            </p>

          </div>

          <a
            href={GOOGLE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-3 rounded-full bg-[#ad102d] px-7 py-4 text-sm font-bold text-white shadow-[0_12px_25px_rgba(173,16,45,.15)] transition hover:-translate-y-0.5 hover:bg-[#890c25]"
          >
            <GoogleMark size={20}/>
            {t("Tüm yorumları Google'da gör")}
            <ArrowUpRight size={17}/>
          </a>
        </div>
      </div>
    </section>
  );
}
