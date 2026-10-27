"use client";

import Link from "next/link";
import { useLandingLocale } from "@/components/landing/LandingLocaleProvider";
import { HTML_LANG, LOCALE_NAMES, LOCALES } from "@/content/locales";

/**
 * Segmented «RU | KZ» control. Two locales fit side by side, so both are one tap
 * away; if a third ever lands, go back to a dropdown. Switching is navigation
 * (`<Link>` to `/{code}`), not client state — each locale is its own indexable
 * page (see §10).
 */
export function LanguageSwitch() {
  const { locale, copy } = useLandingLocale();

  return (
    <nav
      aria-label={copy.languageAria}
      className="inline-flex shrink-0 rounded-full border border-border-strong bg-white p-[3px]"
    >
      {LOCALES.map((code) => {
        const isActive = locale === code;
        return (
          <Link
            key={code}
            href={`/${code}`}
            hrefLang={HTML_LANG[code]}
            aria-current={isActive ? "page" : undefined}
            aria-label={LOCALE_NAMES[code]}
            className={`inline-flex h-[34px] min-w-[40px] items-center justify-center rounded-full px-2.5 text-[13px] font-bold uppercase transition-colors hover:no-underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
              isActive ? "bg-ink text-white" : "text-muted hover:text-foreground"
            }`}
          >
            {code}
          </Link>
        );
      })}
    </nav>
  );
}
