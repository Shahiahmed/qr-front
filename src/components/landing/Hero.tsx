"use client";

import { ArrowRight, BellRing, ScanLine, Smartphone } from "lucide-react";
import { Button } from "@/components/landing/ui/Button";
import { PhoneMockup } from "@/components/landing/ui/PhoneMockup";
import { QrCode } from "@/components/landing/ui/QrCode";
import { Reveal } from "@/components/landing/ui/Reveal";
import { useLandingLocale } from "@/components/landing/LandingLocaleProvider";
import { authByLocale } from "@/content/auth";
import { useAuth } from "@/lib/useAuth";
import { useHydrated } from "@/lib/useHydrated";

export function Hero() {
  const { copy, locale } = useLandingLocale();
  const auth = authByLocale[locale];
  const { isAuthenticated } = useAuth();
  // Signed-in visitors should land in the cabinet, not on registration. Gate on
  // hydration so the static (session-less) server HTML and the first client
  // paint agree — see Header for the same guard.
  const authed = useHydrated() && isAuthenticated;
  const ctaHref = authed ? `/${locale}/dashboard` : `/${locale}/register`;
  const ctaLabel = authed ? auth.navPanel : copy.heroCta1;

  return (
    <section id="hero" aria-labelledby="hero-title" className="relative overflow-hidden bg-surface">
      {/* On desktop the section fills one screen (minus the sticky header) and
          centres its content, so the hero reads as one above-the-fold frame. */}
      <div className="mx-auto grid max-w-[1200px] items-center gap-12 px-4 pb-16 pt-10 sm:px-6 lg:min-h-[calc(100svh-68px)] lg:grid-cols-[1.1fr_0.9fr] lg:gap-10 lg:py-16">
        <div className="text-center lg:text-left">
          <Reveal>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border-strong bg-white px-3.5 py-2 text-sm font-semibold text-foreground">
              <span className="relative flex h-2 w-2" aria-hidden="true">
                <span className="animate-pulse-ring absolute inset-0 rounded-full bg-success" />
                <span className="relative h-2 w-2 rounded-full bg-success" />
              </span>
              {copy.heroBadge}
            </div>
          </Reveal>

          <Reveal delay={80}>
            <h1
              id="hero-title"
              className="text-balance text-[clamp(38px,8.4vw,64px)] font-extrabold leading-[1.02] tracking-[-0.035em]"
            >
              {copy.heroTitle}{" "}
              <span className="text-accent">{copy.heroTitleAccent}</span>
            </h1>
          </Reveal>

          <Reveal delay={140}>
            <p className="mx-auto mt-6 max-w-[540px] text-pretty text-lg leading-relaxed text-muted sm:text-xl lg:mx-0">
              {copy.heroSub}
            </p>
          </Reveal>

          <Reveal delay={200}>
            <div className="mt-8 flex flex-col items-stretch justify-center gap-3 min-[460px]:flex-row min-[460px]:items-center lg:justify-start">
              <Button variant="primary" href={ctaHref} className="px-7 py-4 text-[17px]">
                {ctaLabel}
                <ArrowRight
                  size={18}
                  className="transition-transform duration-200 group-hover/btn:translate-x-0.5 motion-reduce:transition-none"
                />
              </Button>
              <Button
                variant="secondary"
                href="/m/demo"
                target="_blank"
                rel="noopener noreferrer"
                className="px-7 py-4 text-[17px]"
              >
                <Smartphone size={18} className="text-accent-hover" aria-hidden="true" />
                {copy.heroCta2}
              </Button>
            </div>
          </Reveal>

          <Reveal delay={260}>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-4 lg:justify-start">
              <Stat value="2 мин" label={copy.heroStat1} />
              <Divider />
              <Stat value="RU / KZ" label={copy.heroStat2} />
              <Divider />
              <Stat value="0 ₸" label={copy.heroStat3} />
            </div>
          </Reveal>
        </div>

        <Reveal delay={180} className="flex justify-center lg:justify-self-center">
          {/* The floating cards hang off the phone's sides: they may cover the
              frame or the cover photo, never the dish list. */}
          <div className="relative">
            <PhoneMockup />

            {/* QR card — left of the phone, overlapping only the frame. */}
            <div
              className="animate-floaty-slow absolute z-20 -left-[112px] bottom-12 hidden w-[124px] rounded-2xl border border-border bg-white p-3 shadow-[0_20px_40px_-20px_rgba(23,19,15,0.3)] sm:block"
              aria-hidden="true"
            >
              <QrCode className="h-[98px] w-full" scanning />
              <div className="mt-2 flex items-center justify-center gap-1.5 text-[11px] font-bold text-muted">
                <ScanLine size={12} className="text-accent" />
                {copy.cartTable}
              </div>
            </div>

            {/* Order toast — over the cover photo and the frame's right edge. */}
            <div
              className="animate-floaty absolute z-20 -right-[92px] top-16 hidden items-center gap-2.5 rounded-2xl border border-border bg-white px-3.5 py-3 shadow-[0_20px_40px_-20px_rgba(23,19,15,0.3)] sm:flex"
              aria-hidden="true"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent-soft text-accent-hover">
                <BellRing size={16} />
              </span>
              <div>
                <div className="text-[13px] font-bold leading-tight">{copy.notifyTitle}</div>
                <div className="whitespace-nowrap text-[11px] text-muted-soft">
                  {copy.cartTable} · {copy.cartTotal}
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="text-[26px] font-extrabold tracking-[-0.03em]">{value}</div>
      <div className="text-sm text-muted-soft">{label}</div>
    </div>
  );
}

function Divider() {
  return <div className="hidden h-9 w-px bg-border-strong sm:block" aria-hidden="true" />;
}
