"use client";

import { ArrowRight } from "lucide-react";
import { Button } from "@/components/landing/ui/Button";
import { QrCode } from "@/components/landing/ui/QrCode";
import { Reveal } from "@/components/landing/ui/Reveal";
import { useLandingLocale } from "@/components/landing/LandingLocaleProvider";

export function CtaBanner() {
  const { copy, locale } = useLandingLocale();

  return (
    <section id="cta" aria-labelledby="cta-title" className="py-16 lg:py-[88px]">
      <div className="mx-auto max-w-[1180px] px-4 sm:px-6">
        <Reveal>
          <div className="relative overflow-hidden rounded-[32px] bg-[linear-gradient(135deg,#ff7a5c,#ff6a4d_45%,#f09048)] px-6 py-14 text-white shadow-[0_40px_80px_-30px_rgba(255,106,77,0.6)] sm:px-10 sm:py-[72px]">
            <div
              className="pointer-events-none absolute -left-[60px] -top-[100px] h-80 w-80 bg-[radial-gradient(circle,rgba(255,255,255,0.22),transparent_70%)]"
              aria-hidden="true"
            />
            <div
              className="pointer-events-none absolute -bottom-[120px] -right-10 h-80 w-80 bg-[radial-gradient(circle,rgba(255,255,255,0.16),transparent_70%)]"
              aria-hidden="true"
            />

            <div className="relative mx-auto flex max-w-[900px] flex-col items-center gap-10 text-center lg:flex-row lg:justify-between lg:text-left">
              <div>
                <h2
                  id="cta-title"
                  className="text-balance text-[32px] font-bold tracking-[-0.035em] sm:text-[44px]"
                >
                  {copy.ctaTitle}
                </h2>
                <p className="mx-auto mt-4 max-w-[540px] text-pretty text-lg text-white/95 sm:text-[19px] lg:mx-0">
                  {copy.ctaSub}
                </p>
                <div className="mt-8 flex justify-center lg:justify-start">
                  <Button
                    variant="onAccent"
                    href={`/${locale}/register`}
                    className="rounded-[15px] px-10 py-[18px] text-lg font-extrabold"
                  >
                    {copy.ctaBtn}
                    <ArrowRight
                      size={19}
                      className="transition-transform duration-200 group-hover/btn:translate-x-1"
                    />
                  </Button>
                </div>
              </div>

              <div
                className="shrink-0 rotate-3 rounded-[24px] bg-white p-4 shadow-[0_28px_54px_-24px_rgba(0,0,0,0.45)]"
                aria-hidden="true"
              >
                <QrCode className="h-[148px] w-[148px]" scanning />
                <div className="mt-2.5 text-center text-[12px] font-extrabold tracking-[0.08em] text-muted">
                  QMENU.KZ
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
