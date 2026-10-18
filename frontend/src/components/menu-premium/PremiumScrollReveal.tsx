"use client";

import { useEffect } from "react";

export default function PremiumScrollReveal() {
  useEffect(() => {
    const selectors = [
      "#lezzetler",
      "#menu",
      ".ld-logo-watermark > section",
    ];

    const targets = selectors.flatMap((selector) =>
      Array.from(document.querySelectorAll<HTMLElement>(selector))
    );

    if (
      !("IntersectionObserver" in window) ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("ld-visible");
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.08 }
    );

    for (const element of targets) {
      element.classList.add("ld-scroll-reveal");
      observer.observe(element);
    }

    return () => {
      observer.disconnect();
      for (const element of targets) {
        element.classList.remove("ld-scroll-reveal");
        element.classList.remove("ld-visible");
      }
    };
  }, []);

  return null;
}
