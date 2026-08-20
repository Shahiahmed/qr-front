"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
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
 * Landing promo pop-up. The server only renders this when the promo is active
 * and has a title, so `title` is guaranteed here.
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
        className="absolute inset-0 h-full w-full cursor-default bg-ink/50 backdrop-blur-sm motion-safe:animate-[fade-in_200ms_ease-out]"
      />

      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-border bg-surface p-6 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.45)] motion-safe:animate-[pop-in_260ms_cubic-bezier(0.22,1,0.36,1)] sm:p-8">
        {/* Warm glow echoing the brand gradient. */}
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-accent-soft blur-3xl"
        />

        <button
          type="button"
          aria-label={copy.promoClose}
          onClick={close}
          className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface-2 hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="relative">
          {badge ? (
            <span className="inline-flex items-center rounded-full bg-accent-soft px-3 py-1 text-xs font-bold uppercase tracking-wide text-accent">
              {badge}
            </span>
          ) : null}

          <h2
            id="promo-title"
            className="mt-3 text-2xl font-extrabold tracking-[-0.02em] text-foreground"
          >
            {title}
          </h2>

          {body ? (
            <p className="mt-2 text-[15px] leading-relaxed text-muted">{body}</p>
          ) : null}

          {ctaLabel && ctaUrl ? (
            <Button href={ctaUrl} className="mt-5 w-full" onClick={close}>
              {ctaLabel}
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
