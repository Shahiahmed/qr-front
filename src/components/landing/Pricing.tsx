"use client";

import { useEffect, useState } from "react";
import { Check, Crown, Sparkles } from "lucide-react";
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

  // The bespoke top tier (Premium) is pulled out of the grid and shown on its
  // own wide card below — four cards crammed in a row read poorly, and Premium
  // is a "по запросу" product, not a like-for-like column. It is identified as
  // the single most expensive plan, and only split out when there are 4+.
  const spotlight =
    plans && plans.length >= 4
      ? plans.reduce((a, b) => (b.price_final > a.price_final ? b : a))
      : null;
  const trio = spotlight
    ? plans!.filter((plan) => plan.id !== spotlight.id)
    : (plans ?? []);

  // Column count for the standard tier grid.
  const gridCount = plans === null || trio.length === 0 ? 3 : trio.length;
  const gridCols = gridCount === 2 ? "sm:grid-cols-2" : "lg:grid-cols-3";

  let cards;
  if (plans === null) {
    // Still loading — show neutral skeletons, never the static plans. Flashing
    // hand-written prices for a beat and then swapping to the real ones reads
    // like the page changed its mind; a placeholder doesn't.
    cards = [0, 1, 2].map((i) => <PlanSkeleton key={i} />);
  } else if (plans.length > 0) {
    cards = withFeaturedInCenter(trio).map((plan, i) => (
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
    // Featured (year) stays in the middle, same as the live API layout.
    cards = [
      <Reveal key="free">
        <PlanCard plan={copy.planFree} href={href} />
      </Reveal>,
      <Reveal key="prem" delay={90}>
        <PlanCard plan={copy.planPrem} popular={copy.popular} featured href={href} />
      </Reveal>,
      <Reveal key="std" delay={180}>
        <PlanCard plan={copy.planStd} href={href} />
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

        <div className={`grid items-start gap-6 ${gridCols}`}>{cards}</div>

        {spotlight ? (
          <Reveal delay={120}>
            <PremiumCard
              plan={toCardPlan(spotlight, locale, copy)}
              tag={copy.priceCustomTag}
              href={href}
            />
          </Reveal>
        ) : null}
      </div>
    </section>
  );
}

type Plan = LandingCopy["planFree"];

/**
 * Marketing grid: the featured plan must sit in the centre column so the
 * "popular" card reads as the hero of the row, not as an afterthought on the right.
 */
function withFeaturedInCenter(plans: ApiPlan[]): ApiPlan[] {
  // Only meaningful for a 3-up trio — with 4 cards the natural sort order reads
  // better than a forced centre, and there is no single middle column.
  const featuredIndex = plans.findIndex((plan) => plan.is_featured);
  if (featuredIndex < 0 || plans.length !== 3) return plans;

  const ordered = [...plans];
  const [featured] = ordered.splice(featuredIndex, 1);
  const center = Math.floor(ordered.length / 2);
  ordered.splice(center, 0, featured);
  return ordered;
}

/** «/ мес» · «/ жыл» etc. — the suffix shown next to a recurring price. */
function periodLabel(period: ApiPlan["period"], locale: string): string {
  const kz = locale === "kz";
  if (period === "year") return kz ? "/ жыл" : "/ год";
  if (period === "halfyear") return kz ? "/ 6 ай" : "/ 6 мес";
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

/**
 * The bespoke top tier, shown full-width below the trio. It is a different kind
 * of product (a separate site, orders, per-dish SEO — activated by request), so
 * it gets its own wide, dark card rather than a fourth cramped column: identity
 * and price on the left, the feature list spread across the right.
 */
function PremiumCard({
  plan,
  tag,
  href,
}: {
  plan: Plan;
  tag: string;
  href: string;
}) {
  return (
    <article className="gradient-border relative mt-6 rounded-[24px] px-6 py-8 text-white shadow-[0_34px_66px_-30px_rgba(20,18,16,0.6)] sm:px-9 sm:py-9 lg:mt-8">
      <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:gap-12">
        <div className="lg:w-[300px] lg:shrink-0">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/20 px-3 py-1 text-[13px] font-bold text-[#FF9B84]">
            <Crown size={13} />
            {tag}
          </span>
          <div className="mt-4 text-[17px] font-bold text-[#FF8A70]">{plan.name}</div>
          <div className="mt-1.5 flex items-baseline gap-1.5">
            <span className="text-[40px] font-extrabold tracking-[-0.03em]">{plan.price}</span>
            <span className="text-[15px] text-[#B8B0A9]">{plan.period}</span>
          </div>
          {plan.desc ? (
            <div className="mt-2 text-sm text-[#B8B0A9]">{plan.desc}</div>
          ) : null}
          <Button
            variant="dark"
            href={href}
            className="mt-6 w-full rounded-[13px] py-3.5 text-base"
          >
            {plan.cta}
          </Button>
        </div>

        <ul className="grid flex-1 gap-x-8 gap-y-3.5 sm:grid-cols-2">
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
      </div>
    </article>
  );
}
