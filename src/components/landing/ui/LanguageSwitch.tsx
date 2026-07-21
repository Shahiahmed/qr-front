"use client";

import Link from "next/link";
import { useLandingLocale } from "@/components/landing/LandingLocaleProvider";
import { LOCALES } from "@/content/locales";

export function LanguageSwitch() {
  const { locale, copy } = useLandingLocale();

  return (
    <div
      className="inline-flex shrink-0 rounded-full bg-surface-2 p-[3px]"
      role="group"
      aria-label={copy.languageAria}
    >
      {LOCALES.map((code) => {
        const isActive = locale === code;

        return (
          <Link
            key={code}
            href={`/${code}`}
            hrefLang={code === "kz" ? "kk" : "ru"}
            aria-current={isActive ? "true" : undefined}
            className={`rounded-full px-2.5 py-1 text-xs font-bold uppercase transition-all hover:no-underline sm:px-3.5 sm:py-1.5 sm:text-sm ${
              isActive
                ? "bg-white text-foreground shadow-[0_2px_6px_-2px_rgba(0,0,0,0.15)]"
                : "bg-transparent text-muted-soft hover:text-foreground"
            }`}
          >
            {code}
          </Link>
        );
      })}
    </div>
  );
}
