"use client";

import { useLandingLocale } from "@/components/landing/LandingLocaleProvider";
import type { Locale } from "@/content/landing";

export function LanguageSwitch() {
  const { locale, setLocale, copy } = useLandingLocale();

  return (
    <div
      className="inline-flex shrink-0 rounded-full bg-surface-2 p-[3px]"
      role="group"
      aria-label={copy.languageAria}
    >
      {(["ru", "kz"] as const).map((code: Locale) => {
        const isActive = locale === code;

        return (
          <button
            key={code}
            type="button"
            onClick={() => setLocale(code)}
            aria-pressed={isActive}
            className={`rounded-full px-2.5 py-1 text-xs font-bold uppercase transition-all sm:px-3.5 sm:py-1.5 sm:text-sm ${
              isActive
                ? "bg-white text-foreground shadow-[0_2px_6px_-2px_rgba(0,0,0,0.15)]"
                : "bg-transparent text-muted-soft"
            }`}
          >
            {code}
          </button>
        );
      })}
    </div>
  );
}
