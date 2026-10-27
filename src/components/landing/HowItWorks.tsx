"use client";

import { Plus, QrCode as QrIcon } from "lucide-react";
import { SectionHeading } from "@/components/landing/ui/SectionHeading";
import { Reveal } from "@/components/landing/ui/Reveal";
import { useLandingLocale } from "@/components/landing/LandingLocaleProvider";
import { authByLocale } from "@/content/auth";
import type { LandingCopy } from "@/content/landing";

export function HowItWorks() {
  const { copy, locale } = useLandingLocale();

  return (
    <section id="how" aria-labelledby="how-title" className="py-16 lg:py-[104px]">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
        <SectionHeading
          kicker={copy.hiwKicker}
          title={copy.hiwTitle}
          subtitle={copy.hiwSub}
          titleId="how-title"
        />

        <ol className="grid gap-4 md:grid-cols-3 md:gap-6">
          {copy.steps.map((step, index) => (
            <Reveal as="li" key={step.num} delay={index * 80}>
              <div className="h-full rounded-[24px] bg-surface p-7 sm:p-8">
                <span
                  className="block text-[48px] font-extrabold leading-none tracking-[-0.04em] text-accent"
                  aria-hidden="true"
                >
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-6 text-[20px] font-extrabold tracking-[-0.02em] text-ink">
                  {step.title}
                </h3>
                <p className="mt-2 text-[15px] leading-relaxed text-muted">{step.text}</p>
              </div>
            </Reveal>
          ))}
        </ol>

        <Reveal delay={120}>
          <CabinetMockup copy={copy} cabinetLabel={authByLocale[locale].navPanel} />
        </Reveal>
      </div>
    </section>
  );
}

/**
 * The owner's side of step 2, drawn in markup: a menu-editor window with a
 * section list and a dish table with stock toggles. Purely decorative — no
 * state, no handlers, hidden from assistive tech.
 */
function CabinetMockup({ copy, cabinetLabel }: { copy: LandingCopy; cabinetLabel: string }) {
  const c = copy.cabinet;

  return (
    <div
      className="mt-10 overflow-hidden rounded-[28px] border border-border-strong bg-white shadow-[0_24px_60px_-36px_rgba(23,19,15,0.35)] lg:mt-14"
      aria-hidden="true"
    >
      {/* Window bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-surface px-5 py-4 sm:px-6">
        <div className="min-w-0 truncate text-[15px] font-bold text-ink">
          {cabinetLabel} <span className="text-muted-soft">·</span> {copy.restName}
        </div>
        <div className="flex gap-2">
          <span className="hidden items-center gap-1.5 rounded-[12px] border border-border-strong bg-white px-3 py-2 text-[13px] font-bold text-foreground sm:inline-flex">
            <QrIcon size={14} />
            {c.tableQr}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-[12px] bg-accent px-3 py-2 text-[13px] font-bold text-white">
            <Plus size={14} strokeWidth={3} />
            {c.addDish}
          </span>
        </div>
      </div>

      <div className="grid md:grid-cols-[220px_1fr]">
        {/* Sections */}
        <ul className="flex gap-1.5 overflow-hidden border-b border-border p-3 md:flex-col md:border-b-0 md:border-r md:p-4">
          {copy.cats.map((cat) => (
            <li
              key={cat.name}
              className={`whitespace-nowrap rounded-[10px] px-3 py-2 text-[14px] font-semibold ${
                cat.active ? "bg-accent-soft text-accent-hover" : "text-muted"
              }`}
            >
              {cat.name}
            </li>
          ))}
        </ul>

        {/* Dish table */}
        <div className="min-w-0 p-3 sm:p-4">
          <div className="grid grid-cols-[1fr_auto_auto] gap-x-4 px-3 pb-2 text-[12px] font-bold uppercase tracking-[0.06em] text-muted-soft sm:gap-x-8">
            <span>{c.colDish}</span>
            <span className="w-[72px] text-right">{c.colPrice}</span>
            <span className="w-[76px] text-right">{c.colStock}</span>
          </div>
          <ul className="flex flex-col">
            {copy.heroDishes.map((dish) => (
              <li
                key={dish.name}
                className="grid grid-cols-[1fr_auto_auto] items-center gap-x-4 border-t border-border px-3 py-3 sm:gap-x-8"
              >
                <span className="flex min-w-0 items-center gap-2.5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={dish.image}
                    alt=""
                    loading="lazy"
                    className={`h-9 w-9 shrink-0 rounded-lg object-cover ${dish.soldOut ? "opacity-50 grayscale" : ""}`}
                  />
                  <span
                    className={`truncate text-[14px] font-semibold ${dish.soldOut ? "text-muted-soft" : "text-ink"}`}
                  >
                    {dish.name}
                  </span>
                  {dish.soldOut ? (
                    <span className="hidden shrink-0 rounded-full bg-accent-soft px-2 py-0.5 text-[11px] font-bold text-accent-hover sm:inline">
                      {c.stopBadge}
                    </span>
                  ) : null}
                </span>
                <span className="w-[72px] whitespace-nowrap text-right text-[14px] font-bold text-ink">
                  {dish.price}
                </span>
                <span className="flex w-[76px] justify-end">
                  <Toggle on={!dish.soldOut} />
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function Toggle({ on }: { on: boolean }) {
  return (
    <span
      className={`relative inline-block h-6 w-10 rounded-full ${on ? "bg-success" : "bg-border-strong"}`}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm ${on ? "left-[18px]" : "left-0.5"}`}
      />
    </span>
  );
}
