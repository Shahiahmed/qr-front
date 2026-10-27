"use client";

import type { ReactNode } from "react";
import {
  BarChart3,
  BellRing,
  ImageOff,
  Languages,
  Palette,
  RefreshCw,
  ShoppingBag,
  Smartphone,
  type LucideIcon,
} from "lucide-react";
import { Reveal } from "@/components/landing/ui/Reveal";
import { useLandingCopy } from "@/components/landing/LandingLocaleProvider";
import { landingByLocale, type LandingCopy } from "@/content/landing";

/** Icons follow the order of `features` in the landing copy. */
const FEATURE_ICONS: LucideIcon[] = [
  Languages,
  ImageOff,
  ShoppingBag,
  BellRing,
  Smartphone,
  BarChart3,
  RefreshCw,
  Palette,
];

/**
 * Indexes into `features`: the three headline features get large cards with a
 * mini-illustration (order from the table, waiter call, RU/KZ); the rest go in
 * the compact row below.
 */
const LEAD = [2, 3, 0];

export function Benefits() {
  const copy = useLandingCopy();
  const rest = copy.features.map((_, i) => i).filter((i) => !LEAD.includes(i));
  const illustrations: Record<number, ReactNode> = {
    2: <Receipt copy={copy} />,
    3: <WaiterCall text={copy.waiterCall} />,
    0: <Bilingual />,
  };

  return (
    <section
      id="benefits"
      aria-labelledby="benefits-title"
      className="bg-surface py-16 lg:py-[104px]"
    >
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
        <Reveal className="mx-auto mb-12 max-w-[640px] text-center lg:mb-14">
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.08em] text-accent-hover">
            {copy.advKicker}
          </p>
          <h2
            id="benefits-title"
            className="text-balance text-[clamp(30px,5.2vw,44px)] font-extrabold leading-[1.1] tracking-[-0.02em] text-ink"
          >
            {copy.advTitle}
          </h2>
        </Reveal>

        <ul className="grid gap-4 md:grid-cols-3 md:gap-6">
          {LEAD.map((index, order) => {
            const feature = copy.features[index];
            if (!feature) return null;
            const Icon = FEATURE_ICONS[index] ?? Languages;

            return (
              <Reveal as="li" key={feature.title} delay={order * 80}>
                <div className="flex h-full flex-col rounded-[24px] border border-border bg-white p-7 sm:p-8">
                  <div className="mb-7 flex min-h-[132px] items-center justify-center rounded-[18px] bg-surface p-4">
                    {illustrations[index]}
                  </div>
                  <span className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-accent-soft text-accent-hover">
                    <Icon size={18} strokeWidth={2} />
                  </span>
                  <h3 className="mb-2 text-[20px] font-extrabold tracking-[-0.02em] text-ink">
                    {feature.title}
                  </h3>
                  <p className="text-[15px] leading-relaxed text-muted">{feature.text}</p>
                </div>
              </Reveal>
            );
          })}
        </ul>

        <ul className="mt-4 grid gap-4 sm:grid-cols-2 md:mt-6 lg:grid-cols-3 xl:grid-cols-5">
          {rest.map((index, order) => {
            const feature = copy.features[index];
            const Icon = FEATURE_ICONS[index] ?? Languages;

            return (
              <Reveal as="li" key={feature.title} delay={order * 50}>
                <div className="h-full rounded-[20px] border border-border bg-white p-6">
                  <Icon size={20} strokeWidth={2} className="mb-4 text-accent-hover" aria-hidden="true" />
                  <h3 className="mb-1.5 text-[16px] font-bold tracking-[-0.015em] text-ink">
                    {feature.title}
                  </h3>
                  <p className="text-[14px] leading-relaxed text-muted">{feature.text}</p>
                </div>
              </Reveal>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

/** "2 490 ₸" → 2490 */
function parsePrice(price: string): number {
  return Number(price.replace(/\D/g, "")) || 0;
}

function formatTenge(value: number): string {
  return `${String(value).replace(/\B(?=(\d{3})+(?!\d))/g, " ")} ₸`;
}

/** Mini order slip: available mockup dishes, total summed from their prices. */
function Receipt({ copy }: { copy: LandingCopy }) {
  const items = copy.heroDishes.filter((dish) => !dish.soldOut).slice(0, 3);
  const total = items.reduce((sum, dish) => sum + parsePrice(dish.price), 0);

  return (
    <div className="w-full max-w-[240px] rounded-xl bg-white p-3.5 text-[12px] shadow-[0_10px_24px_-16px_rgba(23,19,15,0.35)]" aria-hidden="true">
      <div className="mb-2 font-bold text-ink">{copy.cartTable}</div>
      {items.map((dish) => (
        <div key={dish.name} className="flex justify-between gap-3 py-0.5 text-muted">
          <span className="truncate">{dish.name}</span>
          <span className="whitespace-nowrap">{dish.price}</span>
        </div>
      ))}
      <div className="mt-2 flex justify-between border-t border-dashed border-border-strong pt-2 font-extrabold text-ink">
        <span>{copy.receiptTotal}</span>
        <span>{formatTenge(total)}</span>
      </div>
    </div>
  );
}

function WaiterCall({ text }: { text: string }) {
  return (
    <div
      className="flex w-full max-w-[250px] items-center gap-3 rounded-xl bg-white p-3.5 shadow-[0_10px_24px_-16px_rgba(23,19,15,0.35)]"
      aria-hidden="true"
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent text-white">
        <BellRing size={16} />
      </span>
      <span className="text-[13px] font-bold leading-snug text-ink">{text}</span>
    </div>
  );
}

/** The same dish in both languages — always RU then KZ, whatever the page locale. */
function Bilingual() {
  const rows = [
    { code: "RU", name: landingByLocale.ru.heroDishes[0]?.name },
    { code: "KZ", name: landingByLocale.kz.heroDishes[0]?.name },
  ];

  return (
    <div className="flex w-full max-w-[250px] flex-col gap-2" aria-hidden="true">
      {rows.map((row) => (
        <div
          key={row.code}
          className="flex items-center gap-2.5 rounded-xl bg-white px-3 py-2.5 shadow-[0_10px_24px_-16px_rgba(23,19,15,0.35)]"
        >
          <span className="rounded-md bg-ink px-1.5 py-0.5 text-[11px] font-bold text-white">
            {row.code}
          </span>
          <span className="truncate text-[13px] font-semibold text-ink">{row.name}</span>
        </div>
      ))}
    </div>
  );
}
