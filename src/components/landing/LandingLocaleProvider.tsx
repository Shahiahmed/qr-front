"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  landingByLocale,
  type LandingCopy,
  type Locale,
} from "@/content/landing";

type LandingLocaleContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  copy: LandingCopy;
};

const LandingLocaleContext = createContext<LandingLocaleContextValue | null>(
  null,
);

export function LandingLocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>("ru");

  const value = useMemo(
    () => ({
      locale,
      setLocale,
      copy: landingByLocale[locale],
    }),
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
