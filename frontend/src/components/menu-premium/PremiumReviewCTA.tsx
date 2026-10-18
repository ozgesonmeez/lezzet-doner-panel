import { ArrowUpRight, Star } from "lucide-react";

const reviewUrl = "https://g.page/r/CZPNeDrTEWn3EBM/review";

function GoogleLogo() {
  return (
    <svg viewBox="0 0 24 24" width="48" height="48"
      aria-label="Google" role="img" className="shrink-0">
      <path fill="#4285F4" d="M21.35 12.24c0-.71-.06-1.39-.18-2.05H12v3.87h5.24a4.48 4.48 0 0 1-1.94 2.94v2.45h3.14c1.84-1.69 2.91-4.18 2.91-7.21z"/>
      <path fill="#34A853" d="M12 21.75c2.63 0 4.84-.87 6.45-2.3l-3.14-2.45c-.87.59-1.98.94-3.31.94-2.54 0-4.7-1.72-5.47-4.03H3.29v2.53A9.75 9.75 0 0 0 12 21.75z"/>
      <path fill="#FBBC05" d="M6.53 13.91A5.87 5.87 0 0 1 6.22 12c0-.66.11-1.3.31-1.91V7.56H3.29A9.75 9.75 0 0 0 2.25 12c0 1.58.38 3.07 1.04 4.44z"/>
      <path fill="#EA4335" d="M12 6.06c1.43 0 2.72.49 3.73 1.47l2.79-2.79A9.37 9.37 0 0 0 12 2.25a9.75 9.75 0 0 0-8.71 5.31l3.24 2.53C7.3 7.78 9.46 6.06 12 6.06z"/>
    </svg>
  );
}

export default function PremiumReviewCTA() {
  return (
    <section
      aria-label="Google değerlendirme"
      className="bg-transparent px-5 pb-12 sm:px-10 sm:pb-16"
    >
      <div className="mx-auto max-w-2xl rounded-[28px] border border-[#d9c8ad] bg-[#faf6ee] px-6 py-8 text-center shadow-[0_12px_40px_rgba(72,48,29,0.06)] sm:px-12 sm:py-10">

        <div className="flex items-center justify-center gap-3">
          <span className="h-px min-w-5 flex-1 bg-[#c7ad83]" />
          <span className="shrink-0 text-[9px] font-semibold uppercase tracking-[0.12em] text-[#96734b] sm:text-[10px] sm:tracking-[0.2em]">
            MİSAFİRLERİMİZİN GÖZÜNDEN
          </span>
          <span className="h-px min-w-5 flex-1 bg-[#c7ad83]" />
        </div>

        <div className="mt-7 flex items-center justify-center gap-3">
          <GoogleLogo />
          <div className="text-left">
            <p className="text-base font-semibold text-[#423024]">
              Google Reviews
            </p>
            <div
              aria-hidden="true"
              className="mt-1 flex gap-1 text-[#c6a16b]"
            >
              {Array.from({ length: 5 }, (_, index) => (
                <Star key={index} size={15} fill="currentColor" />
              ))}
            </div>
          </div>
        </div>

        <div className="my-7 h-px bg-[#e5d8c7]" />

        <h2 className="mx-auto max-w-lg font-serif text-[26px] italic leading-[1.3] text-[#382820] sm:text-[34px]">
          Lezzetimizin hikâyesine siz de bir iz bırakın.
        </h2>

        <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-[#867466]">
          Deneyiminizi paylaşarak 1 Lezzet Döner ailesinin
          hikâyesine ortak olun.
        </p>

        <a
          href={reviewUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group mx-auto mt-7 inline-flex min-h-12 items-center justify-center gap-3 rounded-full bg-[#3d2b24] px-7 py-3 text-sm font-semibold text-[#fff8ec] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#513a30] hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#c6a16b]"
        >
          Google&apos;da Değerlendir
          <ArrowUpRight
            size={18}
            className="text-[#d8ba8c] transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          />
        </a>

        <p className="mt-7 text-[10px] font-medium uppercase tracking-[0.18em] text-[#a18a73]">
          1 LEZZET DÖNER · BURSA
        </p>
      </div>
    </section>
  );
}
