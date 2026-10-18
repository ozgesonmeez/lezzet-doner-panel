"use client";

import { useEffect, useState } from "react";

export default function PremiumIntro() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const timer = window.setTimeout(
      () => setVisible(false),
      reducedMotion ? 300 : 2900
    );

    return () => window.clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div
      className="ld-reveal fixed inset-0 z-[9999] overflow-hidden bg-[#f6e8d7]"
      aria-label="1 Lezzet Döner açılış animasyonu"
    >
      {/* Gerçek, tekrarlayan logo deseni */}
      <div
        className="ld-reveal-pattern pointer-events-none absolute -inset-8"
        style={{
          backgroundImage: "url('/lezzet-intro-pattern.png')",
          backgroundPosition: "center",
          backgroundSize: "auto 470px",
          backgroundRepeat: "repeat",
        }}
      />

      {/* Merkezde logonun okunabilirliğini artıran hafif ışık */}
      <div className="ld-reveal-focus pointer-events-none absolute inset-0" />

      {/* Orijinal logo */}
      <div className="relative z-10 flex h-full flex-col items-center justify-center px-6">
        <div className="ld-reveal-logo-wrap relative flex items-center justify-center">
          <div className="ld-reveal-glow pointer-events-none absolute -inset-12" />

          <div className="ld-reveal-shine relative overflow-hidden">
            <img
              src="/lezzet-doner-logo-seffaf.png"
              alt="1 Lezzet Döner"
              className="ld-reveal-logo relative z-10 h-52 w-52 object-contain sm:h-64 sm:w-64"
            />

            <div className="ld-reveal-light pointer-events-none absolute inset-y-0 -left-1/2 z-20 w-1/3 rotate-12 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
          </div>
        </div>

        <div className="ld-reveal-caption mt-5 text-center">
          <p className="text-[10px] font-bold tracking-[.24em] text-[#7c3440] sm:text-xs">
            GERÇEK LEZZET, HER LOKMADA
          </p>
        </div>
      </div>

      <style>{`
        .ld-reveal {
          animation: ld-reveal-exit 2.9s ease-in-out forwards;
        }

        .ld-reveal-pattern {
          animation: ld-reveal-pattern-motion 2.9s ease-out both;
        }

        .ld-reveal-focus {
          background: radial-gradient(
            ellipse at center,
            rgba(255, 249, 239, .75) 0%,
            rgba(255, 249, 239, .30) 32%,
            transparent 68%
          );
        }

        .ld-reveal-logo-wrap {
          animation: ld-reveal-logo-motion 2.9s cubic-bezier(.2,.7,.2,1) both;
        }

        .ld-reveal-logo {
          filter: drop-shadow(0 12px 20px rgba(50, 27, 24, .18));
        }

        .ld-reveal-glow {
          background: radial-gradient(
            circle,
            rgba(255,255,255,.38),
            transparent 70%
          );
          animation: ld-reveal-glow-in 1.5s ease-out both;
        }

        .ld-reveal-light {
          animation: ld-reveal-sweep 1.25s .95s ease-in-out both;
        }

        .ld-reveal-caption {
          animation: ld-reveal-caption-in .8s .75s both;
        }

        @keyframes ld-reveal-pattern-motion {
          from {
            opacity: .35;
            transform: scale(1.08) translateY(10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        @keyframes ld-reveal-logo-motion {
          0% {
            opacity: 0;
            transform: translateY(22px) scale(.78);
            filter: blur(8px);
          }
          38% {
            opacity: 1;
            transform: translateY(0) scale(1.035);
            filter: blur(0);
          }
          60%, 78% {
            opacity: 1;
            transform: translateY(0) scale(1);
            filter: blur(0);
          }
          100% {
            opacity: 0;
            transform: translateY(-26px) scale(1.08);
            filter: blur(0);
          }
        }

        @keyframes ld-reveal-glow-in {
          from { opacity: 0; transform: scale(.75); }
          to { opacity: 1; transform: scale(1); }
        }

        @keyframes ld-reveal-sweep {
          from {
            transform: translateX(-150%) rotate(12deg);
            opacity: 0;
          }
          40% { opacity: 1; }
          to {
            transform: translateX(650%) rotate(12deg);
            opacity: 0;
          }
        }

        @keyframes ld-reveal-caption-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes ld-reveal-exit {
          0%, 78% {
            opacity: 1;
            visibility: visible;
          }
          100% {
            opacity: 0;
            visibility: hidden;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .ld-reveal,
          .ld-reveal-pattern,
          .ld-reveal-logo-wrap,
          .ld-reveal-glow,
          .ld-reveal-light,
          .ld-reveal-caption {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
}
