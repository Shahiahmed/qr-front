"use client";

import { ClipboardList, QrCode as QrIcon, Store } from "lucide-react";
import { SectionHeading } from "@/components/landing/ui/SectionHeading";
import { Reveal } from "@/components/landing/ui/Reveal";
import { useLandingCopy } from "@/components/landing/LandingLocaleProvider";

const STEP_ICONS = [Store, ClipboardList, QrIcon];

export function HowItWorks() {
  const copy = useLandingCopy();

  return (
    <section
      id="how"
      aria-labelledby="how-title"
      className="border-y border-border bg-surface py-16 lg:py-24"
    >
      <div className="mx-auto max-w-[1180px] px-4 sm:px-6">
        <SectionHeading
          kicker={copy.hiwKicker}
          title={copy.hiwTitle}
          subtitle={copy.hiwSub}
          titleId="how-title"
        />

        <div className="relative">
          {/* Desktop-only horizontal connector running through the icon row. */}
          <div
            className="absolute left-[16%] right-[16%] top-7 hidden h-px bg-border-strong md:block"
            aria-hidden="true"
          />

          {/*
            Mobile: a vertical timeline — icon on the left, a connecting line
            down to the next step, content on the right. `gap-0` + per-item
            bottom padding lets the line run unbroken into the next icon. From
            md up it flips to the classic centered 3-column row.
          */}
          <ol className="relative grid gap-0 md:grid-cols-3 md:gap-10">
            {copy.steps.map((step, index) => {
              const Icon = STEP_ICONS[index] ?? Store;
              const isLast = index === copy.steps.length - 1;

              return (
                <Reveal as="li" key={step.num} delay={index * 80}>
                  <div className="flex gap-4 md:flex-col md:items-center md:gap-0 md:text-center">
                    {/* Icon column — carries the vertical connector on mobile. */}
                    <div className="flex flex-col items-center">
                      <span className="relative z-[1] flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-border bg-white text-accent-hover shadow-[0_8px_24px_-12px_rgba(20,18,16,0.2)] md:mb-5">
                        <Icon size={22} strokeWidth={2} />
                      </span>
                      {!isLast && (
                        <span
                          className="mt-2 w-px flex-1 bg-border-strong md:hidden"
                          aria-hidden="true"
                        />
                      )}
                    </div>

                    <div className={`${isLast ? "" : "pb-8"} md:pb-0`}>
                      <span className="mb-1.5 block text-[12px] font-bold uppercase tracking-[0.14em] text-muted-soft md:mb-2">
                        {step.num}
                      </span>
                      <h3 className="mb-2 text-[19px] font-extrabold tracking-[-0.02em] text-ink sm:text-[20px]">
                        {step.title}
                      </h3>
                      <p className="text-[15px] leading-relaxed text-muted md:mx-auto md:max-w-[300px]">
                        {step.text}
                      </p>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
