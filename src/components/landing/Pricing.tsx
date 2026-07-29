"use client";

import { useEffect, useState } from "react";
import { Check, Sparkles } from "lucide-react";
import { Button } from "@/components/landing/ui/Button";
import { SectionHeading } from "@/components/landing/ui/SectionHeading";
import { Reveal } from "@/components/landing/ui/Reveal";
import { useLandingLocale } from "@/components/landing/LandingLocaleProvider";
import type { LandingCopy } from "@/content/landing";
import { getPlans, type Plan as ApiPlan } from "@/lib/api";
import { formatPrice } from "@/lib/money";

export function Pricing() {
  const { copy, locale } = useLandingLocale();

  // The page is statically rendered; plans arrive from the API on the client.
  // Until they do (or if the API is down), the hand-written fallback shows —
  // the marketing section must never go blank.
  const [plans, setPlans] = useState<ApiPlan[] | null>(null);

  useEffect(() => {
    let alive = true;
    getPlans(locale).then((data) => {
      if (alive) setPlans(data);
    });
    return () => {
      alive = false;
    };
  }, [locale]);

  const href = `/${locale}/register`;

  let cards;
  if (plans === null) {
    // Still loading — show neutral skeletons, never the static plans. Flashing
    // hand-written prices for a beat and then swapping to the real ones reads
    // like the page changed its mind; a placeholder doesn't.
    cards = [0, 1, 2].map((i) => <PlanSkeleton key={i} />);
  } else if (plans.length > 0) {
    cards = plans.map((plan, i) => (
      <Reveal key={plan.id} delay={i * 90}>
        <PlanCard
          plan={toCardPlan(plan, locale, copy)}
          popular={copy.popular}
          featured={plan.is_featured}
          href={href}
        />
      </Reveal>
    ));
  } else {
    // Loaded but empty — the API is unreachable or no plans exist yet. Fall back
    // to the hand-written copy so the marketing section is never blank.
    cards = [
      <Reveal key="free">
        <PlanCard plan={copy.planFree} href={href} />
      </Reveal>,
      <Reveal key="std" delay={90}>
        <PlanCard plan={copy.planStd} popular={copy.popular} featured href={href} />
      </Reveal>,
      <Reveal key="prem" delay={180}>
        <PlanCard plan={copy.planPrem} href={href} />
      </Reveal>,
    ];
  }

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

        <div className="grid items-start gap-6 lg:grid-cols-3">{cards}</div>
      </div>
    </section>
  );
}

type Plan = LandingCopy["planFree"];

/** «/ мес» · «/ жыл» etc. — the suffix shown next to a recurring price. */
function periodLabel(period: ApiPlan["period"], locale: string): string {
  const kz = locale === "kz";
  if (period === "year") return kz ? "/ жыл" : "/ год";
  return kz ? "/ ай" : "/ мес";
}

/** Fold a DB plan into the visual card's shape, choosing the locale's text. */
function toCardPlan(plan: ApiPlan, locale: string, copy: LandingCopy): Plan {
  const kz = locale === "kz";
  const name = (kz && plan.name_kk) || plan.name_ru;
  const desc = (kz && plan.tagline_kk) || plan.tagline_ru || "";
  const features = plan.features.map((f) => (kz && f.kk) || f.ru);
  const price = plan.price_final === 0 ? "0 ₸" : formatPrice(plan.price_final);
  // No period word for a free tier — "навсегда" would misread a 1-month trial;
  // the tagline and feature list carry the actual duration.
  const period = plan.price_final === 0 ? "" : periodLabel(plan.period, locale);

  return { name, price, period, desc, features, cta: copy.planStd.cta };
}

/** Neutral placeholder shown while plans load — no prices to flash. */
function PlanSkeleton() {
  return (
    <div className="rounded-[24px] border border-border-strong bg-white px-[30px] py-[34px]">
      <div className="animate-pulse">
        <div className="mb-4 h-4 w-24 rounded bg-surface-2" />
        <div className="mb-6 h-10 w-32 rounded bg-surface-2" />
        <div className="flex flex-col gap-3">
          <div className="h-4 w-full rounded bg-surface-2" />
          <div className="h-4 w-5/6 rounded bg-surface-2" />
          <div className="h-4 w-4/6 rounded bg-surface-2" />
        </div>
        <div className="mt-7 h-12 w-full rounded-[13px] bg-surface-2" />
      </div>
    </div>
  );
}

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
