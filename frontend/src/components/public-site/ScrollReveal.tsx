"use client";

import { useEffect, type RefObject } from "react";

const selector = "[data-scroll-reveal]";

export default function ScrollReveal({
  scope,
}: {
  scope: RefObject<HTMLDivElement | null>;
}) {
  useEffect(() => {
    const root = scope.current;
    if (!root || !("IntersectionObserver" in window)) return;

    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const seen = new WeakSet<Element>();
    const observer = new IntersectionObserver((entries) => {
      let cardIndex = 0;
      for (const { target, isIntersecting } of entries) {
        if (!isIntersecting || !(target instanceof HTMLElement)) continue;
        observer.unobserve(target);
        seen.add(target);

        if (target.dataset.scrollReveal === "card") {
          target.style.setProperty("--ld-reveal-delay", `${Math.min(cardIndex++, 3) * 55}ms`);
        }
        target.classList.add("ld-revealed");
      }
    }, { threshold: 0.08 });

    function visit(node: Node, callback: (target: Element) => void) {
      if (!(node instanceof Element)) return;
      if (node.matches(selector)) callback(node);
      node.querySelectorAll(selector).forEach(callback);
    }

    function observe(target: Element) {
      if (!seen.has(target)) observer.observe(target);
    }

    const updates = new MutationObserver((records) => {
      for (const { addedNodes, removedNodes } of records) {
        removedNodes.forEach((node) => visit(node, (target) => observer.unobserve(target)));
        addedNodes.forEach((node) => visit(node, observe));
      }
    });

    function syncMotion() {
      observer.disconnect();
      updates.disconnect();
      if (motion.matches || !root) return;

      // Leave initially visible content in its server-rendered state.
      root.querySelectorAll(selector).forEach((target) => {
        const bounds = target.getBoundingClientRect();
        if (bounds.top < window.innerHeight && bounds.bottom > 0) seen.add(target);
        observe(target);
      });
      updates.observe(root, { childList: true, subtree: true });
    }

    syncMotion();
    motion.addEventListener("change", syncMotion);
    return () => {
      motion.removeEventListener("change", syncMotion);
      observer.disconnect();
      updates.disconnect();
    };
  }, [scope]);

  return null;
}
