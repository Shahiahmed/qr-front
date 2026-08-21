"use client";

import {
  BarChart3,
  BellRing,
  ImageOff,
  Languages,
  Palette,
  RefreshCw,
  ShoppingBag,
  Smartphone,
} from "lucide-react";
import { Reveal } from "@/components/landing/ui/Reveal";
import { useLandingCopy } from "@/components/landing/LandingLocaleProvider";

/** Icons follow the order of `features` in the landing copy. */
const FEATURE_ICONS = [
  Languages,
  ImageOff,
  ShoppingBag,
  BellRing,
  Smartphone,
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
      className="py-16 lg:py-24"
    >
      <div className="mx-auto max-w-[1180px] px-4 sm:px-6">
        <Reveal className="mb-14 text-center lg:mb-16">
          <p className="mb-3 text-[12px] font-bold uppercase tracking-[0.16em] text-accent-hover">
            {copy.advKicker}
          </p>
          <h2
            id="benefits-title"
            className="text-[30px] font-extrabold tracking-[-0.038em] text-ink sm:text-[38px]"
          >
            {copy.advTitle}
          </h2>
        </Reveal>

        <ul className="grid gap-px overflow-hidden rounded-3xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
          {copy.features.map((feature, index) => {
            const Icon = FEATURE_ICONS[index] ?? Languages;

            return (
              <Reveal as="li" key={feature.title} delay={(index % 4) * 50}>
                <div className="group h-full bg-white p-6 transition-colors duration-200 hover:bg-surface sm:p-7">
                  <span className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-accent-soft text-accent-hover">
                    <Icon size={18} strokeWidth={2} />
                  </span>
                  <h3 className="mb-1.5 text-[16px] font-bold tracking-[-0.015em] text-ink">
                    {feature.title}
                  </h3>
                  <p className="text-[14px] leading-relaxed text-muted">
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
