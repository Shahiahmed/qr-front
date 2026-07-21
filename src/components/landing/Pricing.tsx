"use client";

import { Check, Sparkles } from "lucide-react";
import { Button } from "@/components/landing/ui/Button";
import { SectionHeading } from "@/components/landing/ui/SectionHeading";
import { Reveal } from "@/components/landing/ui/Reveal";
import { useLandingLocale } from "@/components/landing/LandingLocaleProvider";
import type { LandingCopy } from "@/content/landing";

export function Pricing() {
  const { copy, locale } = useLandingLocale();

  return (
    <section
      id="pricing"
      aria-labelledby="pricing-title"
      className="border-y border-border bg-surface py-16 lg:py-[88px]"
    >
      <div className="mx-auto max-w-[1180px] px-4 sm:px-6">
        <SectionHeading
          kicker={copy.priceKicker}
          title={copy.priceTitle}
          subtitle={copy.priceSub}
          titleId="pricing-title"
        />

        <div className="grid items-start gap-6 lg:grid-cols-3">
          <Reveal>
            <PlanCard plan={copy.planFree} href={`/${locale}/register`} />
          </Reveal>
          <Reveal delay={90}>
            <PlanCard plan={copy.planStd} popular={copy.popular} featured href={`/${locale}/register`} />
          </Reveal>
          <Reveal delay={180}>
            <PlanCard plan={copy.planPrem} href={`/${locale}/register`} />
          </Reveal>
        </div>
      </div>
    </section>
  );
}

type Plan = LandingCopy["planFree"];

function PlanCard({
  plan,
  popular,
  featured = false,
  href,
}: {
  plan: Plan;
  popular?: string;
  featured?: boolean;
  href: string;
}) {
  if (featured) {
    return (
      <article className="gradient-border relative rounded-[24px] px-[30px] py-[34px] text-white shadow-[0_34px_66px_-28px_rgba(20,18,16,0.6)] transition-transform duration-300 lg:-translate-y-3 lg:hover:-translate-y-4">
        {popular ? (
          <span className="absolute -top-[15px] left-1/2 inline-flex -translate-x-1/2 items-center gap-1.5 whitespace-nowrap rounded-full bg-[linear-gradient(120deg,#ff6a4d,#f0a83c)] px-4 py-1.5 text-[13px] font-bold text-white shadow-[0_10px_22px_-10px_rgba(255,106,77,0.9)]">
            <Sparkles size={13} />
            {popular}
          </span>
        ) : null}
        <div className="mb-2 text-[15px] font-bold text-[#FF8A70]">{plan.name}</div>
        <div className="mb-1.5 flex items-baseline gap-1.5">
          <span className="text-[40px] font-extrabold tracking-[-0.03em]">{plan.price}</span>
          <span className="text-[15px] text-[#B8B0A9]">{plan.period}</span>
        </div>
        <div className="mb-6 text-sm text-[#B8B0A9]">{plan.desc}</div>
        <ul className="mb-7 flex flex-col gap-3">
          {plan.features.map((feature) => (
            <li key={feature} className="flex items-center gap-2.5 text-[15px]">
              <span
                className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent/20 text-[#FF9B84]"
                aria-hidden="true"
              >
                <Check size={12} strokeWidth={3.2} />
              </span>
              {feature}
            </li>
          ))}
        </ul>
        <Button variant="dark" href={href} className="w-full rounded-[13px] py-3.5 text-base">
          {plan.cta}
        </Button>
      </article>
    );
  }

  return (
    <article className="rounded-[24px] border border-border-strong bg-white px-[30px] py-[34px] transition-all duration-300 hover:-translate-y-1 hover:border-accent-tint hover:shadow-[0_28px_54px_-30px_rgba(20,18,16,0.32)]">
      <div className="mb-2 text-[15px] font-bold text-muted">{plan.name}</div>
      <div className="mb-1.5 flex items-baseline gap-1.5">
        <span className="text-[40px] font-extrabold tracking-[-0.03em]">{plan.price}</span>
        <span className="text-[15px] text-muted-soft">{plan.period}</span>
      </div>
      <div className="mb-6 text-sm text-muted-soft">{plan.desc}</div>
      <ul className="mb-7 flex flex-col gap-3">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-center gap-2.5 text-[15px]">
            <span
              className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent-hover"
              aria-hidden="true"
            >
              <Check size={12} strokeWidth={3.2} />
            </span>
            {feature}
          </li>
        ))}
      </ul>
      <Button
        variant="secondary"
        href={href}
        className="w-full rounded-[13px] py-3.5 text-base"
      >
        {plan.cta}
      </Button>
    </article>
  );
}
