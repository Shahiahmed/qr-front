"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { FlagIcon } from "@/components/landing/ui/FlagIcon";
import { useLandingLocale } from "@/components/landing/LandingLocaleProvider";
import { HTML_LANG, LOCALE_NAMES, LOCALES } from "@/content/locales";

/**
 * Language picker as a dropdown, not a segmented pill: a pill listing every
 * locale side by side stops fitting the header past 2-3 languages. The trigger
 * stays compact (globe + current code); the menu lists native names so more
 * locales just mean more rows. Switching is navigation (`<Link>` to `/{code}`),
 * not client state — each locale is its own indexable page (see §10).
 */
export function LanguageSwitch() {
  const { locale, copy } = useLandingLocale();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label={copy.languageAria}
        aria-haspopup="menu"
        aria-expanded={open}
        className="inline-flex items-center gap-1.5 rounded-full bg-surface-2 px-2.5 py-1.5 text-xs font-bold uppercase text-foreground transition-colors hover:bg-surface sm:px-3 sm:text-sm"
      >
        <FlagIcon locale={locale} className="h-3.5 w-5" />
        {locale}
        <ChevronDown
          className={`h-3.5 w-3.5 text-muted-soft transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {/* Always mounted for the fade/slide; inert (pointer-events-none) when closed. */}
      <div
        role="menu"
        aria-label={copy.languageAria}
        className={`absolute right-0 top-full z-50 mt-2 min-w-[168px] overflow-hidden rounded-xl border border-border bg-white p-1 shadow-[0_16px_40px_-12px_rgba(0,0,0,0.25)] transition-all duration-150 ${
          open ? "opacity-100" : "pointer-events-none -translate-y-1 opacity-0"
        }`}
      >
        {LOCALES.map((code) => {
          const isActive = locale === code;
          return (
            <Link
              key={code}
              href={`/${code}`}
              hrefLang={HTML_LANG[code]}
              role="menuitem"
              aria-current={isActive ? "true" : undefined}
              onClick={() => setOpen(false)}
              className={`flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm font-semibold transition-colors hover:no-underline ${
                isActive ? "bg-accent-soft text-accent" : "text-foreground hover:bg-surface-2"
              }`}
            >
              <span className="flex items-center gap-2.5">
                <FlagIcon locale={code} className="h-3.5 w-5 shrink-0" />
                {LOCALE_NAMES[code]}
              </span>
              {isActive ? <Check className="h-4 w-4 shrink-0" /> : null}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
