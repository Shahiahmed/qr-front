"use client";

import { ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/landing/ui/Button";
import { QrCode } from "@/components/landing/ui/QrCode";
import { Reveal } from "@/components/landing/ui/Reveal";
import { useLandingLocale } from "@/components/landing/LandingLocaleProvider";
import { authByLocale } from "@/content/auth";
import { useAuth } from "@/lib/useAuth";
import { useHydrated } from "@/lib/useHydrated";

export function CtaBanner() {
  const { copy, locale } = useLandingLocale();
  const auth = authByLocale[locale];
  const { isAuthenticated } = useAuth();
  // Signed-in visitors go to the cabinet; hydration-gated (see Header).
  const authed = useHydrated() && isAuthenticated;
  const ctaHref = authed ? `/${locale}/dashboard` : `/${locale}/register`;
  const ctaLabel = authed ? auth.navPanel : copy.ctaBtn;

  return (
    <section id="cta" aria-labelledby="cta-title" className="py-16 lg:py-[104px]">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
        <Reveal>
          {/* Flat accent block — no glows or gradients; white type on #D2401A
              clears 4.5:1. */}
          <div className="rounded-[32px] bg-accent px-6 py-14 text-white sm:px-10 sm:py-[72px]">
            <div className="mx-auto flex max-w-[960px] flex-col items-center gap-10 text-center lg:flex-row lg:justify-between lg:text-left">
              <div>
                <h2
                  id="cta-title"
                  className="text-balance text-[clamp(30px,5.2vw,44px)] font-extrabold leading-[1.1] tracking-[-0.02em]"
                >
                  {copy.ctaTitle}
                </h2>
                <p className="mx-auto mt-4 max-w-[540px] text-pretty text-lg text-white sm:text-[19px] lg:mx-0">
                  {copy.ctaSub}
                </p>
                <div className="mt-8 flex justify-center lg:justify-start">
                  <Button
                    variant="onAccent"
                    href={ctaHref}
                    className="px-10 py-[18px] text-lg font-extrabold focus-visible:outline-white"
                  >
                    {ctaLabel}
                    <ArrowRight
                      size={19}
                      className="transition-transform duration-200 group-hover/btn:translate-x-0.5 motion-reduce:transition-none"
                    />
                  </Button>
                </div>

                <ul className="mt-7 flex flex-col items-center gap-x-6 gap-y-2.5 text-[15px] font-semibold text-white sm:flex-row sm:flex-wrap sm:justify-center lg:justify-start">
                  {copy.ctaPoints.map((point) => (
                    <li key={point} className="flex items-center gap-2">
                      <Check size={17} strokeWidth={3} aria-hidden="true" />
                      {point}
                    </li>
                  ))}
                </ul>
              </div>

              <div
                className="shrink-0 rotate-3 rounded-[24px] bg-white p-4 shadow-[0_24px_48px_-24px_rgba(23,19,15,0.45)]"
                aria-hidden="true"
              >
                <QrCode className="h-[148px] w-[148px]" scanning />
                <div className="mt-2.5 text-center text-[12px] font-extrabold tracking-[0.08em] text-muted">
                  QR-MENU.KZ
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
