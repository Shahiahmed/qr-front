"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import { useLandingCopy } from "@/components/landing/LandingLocaleProvider";

/**
 * "Back to top" button pinned to the bottom-left of the landing — mirror of the
 * WhatsApp button on the right (same z-40, below the sticky header). Hidden
 * until the visitor has scrolled a screenful, then fades in.
 */
export function ScrollToTop() {
  const copy = useLandingCopy();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const update = () => setVisible(window.scrollY > 500);
    window.addEventListener("scroll", update, { passive: true });
    // Initial state via rAF, not a synchronous setState in the effect body
    // (dodges react-hooks/set-state-in-effect while still handling a mid-page
    // reload).
    const raf = requestAnimationFrame(update);
    return () => {
      window.removeEventListener("scroll", update);
      cancelAnimationFrame(raf);
    };
  }, []);

  function toTop() {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  }

  return (
    <button
      type="button"
      onClick={toTop}
      aria-label={copy.scrollTop}
      className={`fixed bottom-5 left-5 z-40 flex h-14 w-14 items-center justify-center rounded-full border border-border-strong bg-white text-foreground shadow-lg shadow-black/15 transition-all duration-300 hover:-translate-y-0.5 hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent sm:bottom-6 sm:left-6 ${
        visible ? "opacity-100" : "pointer-events-none translate-y-2 opacity-0"
      }`}
    >
      <ArrowUp className="h-7 w-7" />
    </button>
  );
}
