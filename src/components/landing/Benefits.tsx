"use client";

import {
  BarChart3,
  BellRing,
  ImageOff,
  Languages,
  Palette,
  RefreshCw,
  ShoppingBag,
  Wallet,
} from "lucide-react";
import { Reveal } from "@/components/landing/ui/Reveal";
import { useLandingCopy } from "@/components/landing/LandingLocaleProvider";

/** Icons follow the order of `features` in the landing copy. */
const FEATURE_ICONS = [
  Languages,
  ImageOff,
  ShoppingBag,
  BellRing,
  Wallet,
  BarChart3,
  RefreshCw,
  Palette,
];

export function Benefits() {
  const copy = useLandingCopy();

  return (
    <section
      id="benefits"
      aria-labelledby="benefits-title"
      className="py-16 lg:py-[88px]"
    >
      <div className="mx-auto max-w-[1180px] px-4 sm:px-6">
        <Reveal className="mb-[52px] text-center">
          <div className="mb-3 text-sm font-bold uppercase tracking-[0.16em] text-accent-hover">
            {copy.advKicker}
          </div>
          <h2
            id="benefits-title"
            className="text-[32px] font-bold tracking-[-0.035em] sm:text-[40px]"
          >
            {copy.advTitle}
          </h2>
        </Reveal>

        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {copy.features.map((feature, index) => {
            const Icon = FEATURE_ICONS[index] ?? Languages;

            return (
              <Reveal as="li" key={feature.title} delay={(index % 4) * 70}>
                <div className="group h-full rounded-[18px] border border-border bg-white p-5 transition-all duration-300 hover:-translate-y-1 hover:border-accent-tint hover:bg-accent-soft/40 hover:shadow-[0_20px_40px_-24px_rgba(20,18,16,0.28)]">
                  <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-[14px] bg-surface-2 text-foreground transition-colors duration-300 group-hover:bg-accent group-hover:text-white">
                    <Icon size={19} strokeWidth={2.1} />
                  </span>
                  <h3 className="mb-1.5 text-[17px] font-semibold tracking-[-0.015em]">
                    {feature.title}
                  </h3>
                  <p className="text-[14.5px] leading-relaxed text-muted-soft">
                    {feature.text}
                  </p>
                </div>
              </Reveal>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
