"use client";

import { ArrowRight, BellRing, PlayCircle, ScanLine } from "lucide-react";
import { Button } from "@/components/landing/ui/Button";
import { PhoneMockup } from "@/components/landing/ui/PhoneMockup";
import { QrCode } from "@/components/landing/ui/QrCode";
import { Reveal } from "@/components/landing/ui/Reveal";
import { useLandingLocale } from "@/components/landing/LandingLocaleProvider";

export function Hero() {
  const { copy, locale } = useLandingLocale();

  return (
    <section id="hero" aria-labelledby="hero-title" className="relative overflow-hidden">
      <div className="bg-mesh pointer-events-none absolute inset-0 -z-10" aria-hidden="true" />
      <div className="bg-grid pointer-events-none absolute inset-0 -z-10" aria-hidden="true" />

      <div className="mx-auto grid max-w-[1180px] items-center gap-10 px-4 pb-14 pt-12 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12 lg:pb-20 lg:pt-[72px]">
        <div className="text-center lg:text-left">
          <Reveal>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-accent-tint bg-white/70 px-3.5 py-2 text-sm font-semibold text-accent-hover shadow-[0_2px_10px_-4px_rgba(255,106,77,0.4)] backdrop-blur">
              <span className="relative flex h-2 w-2" aria-hidden="true">
                <span className="animate-pulse-ring absolute inset-0 rounded-full bg-accent" />
                <span className="relative h-2 w-2 rounded-full bg-accent" />
              </span>
              {copy.heroBadge}
            </div>
          </Reveal>

          <Reveal delay={80}>
            <h1
              id="hero-title"
              className="text-balance text-[34px] font-extrabold leading-[1.06] tracking-[-0.038em] min-[400px]:text-[42px] sm:text-[52px] sm:leading-[1.04] sm:tracking-[-0.042em] lg:text-[60px]"
            >
              {copy.heroTitle}
            </h1>
          </Reveal>

          <Reveal delay={140}>
            <p className="mx-auto mt-5 max-w-[520px] text-pretty text-lg leading-relaxed text-muted sm:text-xl lg:mx-0">
              {copy.heroSub}
            </p>
          </Reveal>

          <Reveal delay={200}>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3.5 lg:justify-start">
              <Button
                variant="primary"
                href={`/${locale}/register`}
                className="rounded-[14px] px-7 py-4 text-[17px]"
              >
                {copy.heroCta1}
                <ArrowRight
                  size={18}
                  className="transition-transform duration-200 group-hover/btn:translate-x-1"
                />
              </Button>
              <Button
                variant="secondary"
                href="#how"
                className="rounded-[14px] px-7 py-4 text-[17px]"
              >
                <PlayCircle size={18} className="text-accent-hover" />
                {copy.heroCta2}
              </Button>
            </div>
          </Reveal>

          <Reveal delay={260}>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-x-6 gap-y-4 border-t border-border pt-7 lg:justify-start">
              <Stat value="2 мин" label={copy.heroStat1} />
              <Divider />
              <Stat value="RU / KZ" label={copy.heroStat2} />
              <Divider />
              <Stat value="0 ₸" label={copy.heroStat3} />
            </div>
          </Reveal>
        </div>

        <Reveal delay={180} className="flex justify-center lg:justify-self-center">
          <div className="relative">
            <PhoneMockup />

            {/* Floating QR card — what the guest actually scans. */}
            <div
              className="animate-floaty-slow absolute -left-6 bottom-16 hidden w-[132px] rounded-2xl border border-border bg-white p-3 shadow-[0_24px_50px_-20px_rgba(20,18,16,0.35)] sm:block"
              aria-hidden="true"
            >
              <QrCode className="h-[104px] w-full" scanning />
              <div className="mt-2 flex items-center justify-center gap-1.5 text-[11px] font-bold text-muted">
                <ScanLine size={12} className="text-accent" />
                {copy.cartTable}
              </div>
            </div>

            {/* Floating order notification. */}
            <div
              className="animate-floaty absolute -right-4 top-10 hidden items-center gap-2.5 rounded-2xl border border-border bg-white px-3.5 py-3 shadow-[0_24px_50px_-20px_rgba(20,18,16,0.35)] sm:flex"
              aria-hidden="true"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent-soft text-accent-hover">
                <BellRing size={16} />
              </span>
              <div>
                <div className="text-[13px] font-bold leading-tight">{copy.notifyTitle}</div>
                <div className="text-[11px] text-muted-soft">
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
