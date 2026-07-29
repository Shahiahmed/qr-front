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
          <div
            className="absolute left-[16%] right-[16%] top-7 hidden h-px bg-border-strong md:block"
            aria-hidden="true"
          />

          <ol className="relative grid gap-8 md:grid-cols-3 md:gap-10">
            {copy.steps.map((step, index) => {
              const Icon = STEP_ICONS[index] ?? Store;

              return (
                <Reveal as="li" key={step.num} delay={index * 80}>
                  <div className="flex flex-col items-start md:items-center md:text-center">
                    <span className="relative z-[1] mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-white text-accent-hover shadow-[0_8px_24px_-12px_rgba(20,18,16,0.2)]">
                      <Icon size={22} strokeWidth={2} />
                    </span>
                    <span className="mb-2 text-[12px] font-bold uppercase tracking-[0.14em] text-muted-soft">
                      {step.num}
                    </span>
                    <h3 className="mb-2 text-[20px] font-extrabold tracking-[-0.02em] text-ink">
                      {step.title}
                    </h3>
                    <p className="max-w-[300px] text-[15px] leading-relaxed text-muted">
                      {step.text}
                    </p>
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
