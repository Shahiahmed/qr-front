"use client";

import { Camera, QrCode as QrIcon, Smartphone } from "lucide-react";
import { SectionHeading } from "@/components/landing/ui/SectionHeading";
import { Reveal } from "@/components/landing/ui/Reveal";
import { useLandingCopy } from "@/components/landing/LandingLocaleProvider";

const STEP_ICONS = [Camera, QrIcon, Smartphone];

export function HowItWorks() {
  const copy = useLandingCopy();

  return (
    <section
      id="how"
      aria-labelledby="how-title"
      className="border-y border-border bg-surface py-16 lg:py-[88px]"
    >
      <div className="mx-auto max-w-[1180px] px-4 sm:px-6">
        <SectionHeading
          kicker={copy.hiwKicker}
          title={copy.hiwTitle}
          subtitle={copy.hiwSub}
          titleId="how-title"
        />

        <div className="relative">
          {/* Connector between the three steps on desktop. */}
          <div
            className="absolute left-[16%] right-[16%] top-[72px] hidden h-px bg-[linear-gradient(90deg,transparent,var(--border-strong)_15%,var(--border-strong)_85%,transparent)] md:block"
            aria-hidden="true"
          />

          <ol className="relative grid gap-6 md:grid-cols-3">
            {copy.steps.map((step, index) => {
              const Icon = STEP_ICONS[index] ?? Camera;

              return (
                <Reveal as="li" key={step.num} delay={index * 90}>
                  <div className="group h-full rounded-[22px] border border-border bg-white px-7 py-8 shadow-[0_2px_12px_-6px_rgba(20,18,16,0.08)] transition-all duration-300 hover:-translate-y-1.5 hover:border-accent-tint hover:shadow-[0_28px_50px_-28px_rgba(20,18,16,0.3)]">
                    <div className="mb-[22px] flex items-center gap-3">
                      <span className="relative flex h-[52px] w-[52px] items-center justify-center rounded-2xl bg-[linear-gradient(140deg,#fff1ec,#ffe0d4)] text-accent-hover transition-transform duration-300 group-hover:scale-105">
                        <Icon size={23} strokeWidth={2.1} />
                      </span>
                      <span className="text-[13px] font-extrabold uppercase tracking-[0.14em] text-muted-soft">
                        {step.num}
                      </span>
                    </div>
                    <h3 className="mb-2.5 text-[21px] font-bold tracking-[-0.015em]">
                      {step.title}
                    </h3>
                    <p className="text-base leading-relaxed text-muted">{step.text}</p>
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
