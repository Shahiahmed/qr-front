"use client";

import { useEffect, useState } from "react";
import { Sparkles, X } from "lucide-react";
import { Button } from "@/components/landing/ui/Button";
import { useLandingCopy } from "@/components/landing/LandingLocaleProvider";

type PromoModalProps = {
  /** Campaign id — changes on every admin save so an edited promo reappears. */
  id: string;
  badge: string | null;
  title: string;
  body: string | null;
  ctaLabel: string | null;
  ctaUrl: string | null;
};

const DISMISS_KEY = "qmenu.promo-dismissed.v1";

/**
 * Landing promo pop-up — a dark "premium" card that stands apart from the light
 * landing: warm coral/gold glows on a near-black panel. The server only mounts
 * this when the promo is active and has a title, so `title` is guaranteed here.
 *
 * Shown once per campaign: the dismissed campaign id lives in localStorage, so
 * editing the promo in /admin (new id) shows it again to everyone. Reveal is
 * deferred to a timeout — reading localStorage during render would mismatch the
 * static SSR HTML, and a setState inside an effect trips the lint rule.
 */
export function PromoModal({ id, badge, title, body, ctaLabel, ctaUrl }: PromoModalProps) {
  const copy = useLandingCopy();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let dismissed: string | null = null;
    try {
      dismissed = window.localStorage.getItem(DISMISS_KEY);
    } catch {
      // Private mode / storage disabled — treat as not dismissed.
    }
    if (dismissed === id) return;

    // Let the hero settle before interrupting; feels less aggressive.
    const timer = window.setTimeout(() => setOpen(true), 1200);
    return () => window.clearTimeout(timer);
  }, [id]);

  useEffect(() => {
    if (!open) return;

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function close() {
    setOpen(false);
    try {
      window.localStorage.setItem(DISMISS_KEY, id);
    } catch {
      // Ignore — a non-persisted dismissal just means it may show again later.
    }
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="promo-title"
    >
      <button
        type="button"
        aria-label={copy.promoClose}
        onClick={close}
        className="absolute inset-0 h-full w-full cursor-default bg-black/60 backdrop-blur-sm motion-safe:animate-[fade-in_220ms_ease-out]"
      />

      <div className="relative w-full max-w-md overflow-hidden rounded-[22px] border border-white/10 bg-[#161210] p-6 text-white shadow-[0_40px_120px_-24px_rgba(0,0,0,0.8)] motion-safe:animate-[pop-in_300ms_cubic-bezier(0.22,1,0.36,1)] sm:p-8">
        {/* Warm coral wash from the top, gold pool from the corner — the glow. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(130%_85%_at_50%_-10%,rgba(255,106,77,0.28),transparent_60%)]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-24 -right-20 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(240,168,60,0.35),transparent_70%)] blur-2xl"
        />
        {/* Hairline highlight along the top edge. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent"
        />

        <button
          type="button"
          aria-label={copy.promoClose}
          onClick={close}
          className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full text-white/50 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ff6a4d]"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="relative">
          {badge ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#f0a83c]/30 bg-[#f0a83c]/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#f6c777]">
              <Sparkles className="h-3.5 w-3.5" />
              {badge}
            </span>
          ) : null}

          <h2
            id="promo-title"
            className="mt-4 text-[26px] font-extrabold leading-tight tracking-[-0.02em] text-white"
          >
            {title}
          </h2>

          {body ? (
            <p className="mt-2.5 text-[15px] leading-relaxed text-white/65">{body}</p>
          ) : null}

          {ctaLabel && ctaUrl ? (
            <Button href={ctaUrl} className="mt-6 w-full" onClick={close}>
              {ctaLabel}
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
