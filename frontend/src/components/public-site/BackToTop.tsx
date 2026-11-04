"use client";

import { ArrowUp } from "lucide-react";
import { useEffect, useState } from "react";

export default function BackToTop({ focusTop }: { focusTop: () => void }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let wasVisible = false;
    function update() {
      const nextVisible = window.scrollY >= 400;
      if (nextVisible === wasVisible) return;
      wasVisible = nextVisible;
      setVisible(nextVisible);
    }

    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  if (!visible) return null;

  function scrollToTop() {
    focusTop();
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduceMotion ? "instant" : "smooth" });
  }

  return (
    <button
      type="button"
      aria-label="Sayfanın başına dön"
      onClick={scrollToTop}
      className="fixed right-4 bottom-[calc(env(safe-area-inset-bottom)+5.5rem)] z-50 grid size-11 place-items-center rounded-full bg-[#2b1d19] text-white shadow-md motion-safe:transition-transform motion-safe:hover:-translate-y-1 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#92182e] md:right-6 md:bottom-6"
    >
      <ArrowUp aria-hidden="true" size={20} strokeWidth={1.5} />
    </button>
  );
}
