"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import { landingByLocale, type LandingCopy, type Locale } from "@/content/landing";

type LandingLocaleContextValue = {
  locale: Locale;
  copy: LandingCopy;
};

const LandingLocaleContext = createContext<LandingLocaleContextValue | null>(null);

/**
 * The locale comes from the `[locale]` route segment, not from local state:
 * every language has its own URL, so switching means navigating.
 */
export function LandingLocaleProvider({
  locale,
  children,
}: {
  locale: Locale;
  children: ReactNode;
}) {
  const value = useMemo(
    () => ({ locale, copy: landingByLocale[locale] }),
    [locale],
  );

  return (
    <LandingLocaleContext.Provider value={value}>
      {children}
    </LandingLocaleContext.Provider>
  );
}

export function useLandingCopy(): LandingCopy {
  const context = useContext(LandingLocaleContext);

  if (!context) {
    throw new Error("useLandingCopy must be used within LandingLocaleProvider");
  }

  return context.copy;
}

export function useLandingLocale(): LandingLocaleContextValue {
  const context = useContext(LandingLocaleContext);

  if (!context) {
    throw new Error("useLandingLocale must be used within LandingLocaleProvider");
  }

  return context;
}
