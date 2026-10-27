"use client";

import { useEffect, useState } from "react";
import { ArrowUpRight, Check, Crown, Sparkles } from "lucide-react";
import { Button } from "@/components/landing/ui/Button";
import { SectionHeading } from "@/components/landing/ui/SectionHeading";
import { Reveal } from "@/components/landing/ui/Reveal";
import { useLandingLocale } from "@/components/landing/LandingLocaleProvider";
import { PREMIUM_DEMO_URL, type LandingCopy } from "@/content/landing";
import { getPlans, type Plan as ApiPlan } from "@/lib/api";
import { formatPrice } from "@/lib/money";
import { useAuth } from "@/lib/useAuth";
import { useHydrated } from "@/lib/useHydrated";

export function Pricing({ initialPlans }: { initialPlans: ApiPlan[] }) {
  const { copy, locale } = useLandingLocale();
  const { isAuthenticated } = useAuth();
  // Signed-in visitors go to the cabinet's subscription page instead of
  // registration; hydration-gated so the static server HTML matches (see Header).
  const authed = useHydrated() && isAuthenticated;

  // Plans come rendered from the server (page.tsx, hourly ISR) and are refreshed
  // once on mount so an /admin edit shows without waiting for revalidation. A
  // failed refresh keeps the server copy rather than blanking the section.
  const [plans, setPlans] = useState<ApiPlan[]>(initialPlans);

  useEffect(() => {
    let alive = true;
    getPlans(locale).then((data) => {
      if (alive && data.length > 0) setPlans(data);
    });
    return () => {
      alive = false;
    };
  }, [locale]);

  const href = authed ? `/${locale}/dashboard/subscription` : `/${locale}/register`;

  // The bespoke top tier (Premium) is pulled out of the grid and shown on its
  // own wide card below — four cards crammed in a row read poorly, and Premium
  // is a "по запросу" product, not a like-for-like column. It is identified as
  // the single most expensive plan, and only split out when there are 4+.
  const spotlight =
    plans.length >= 4
      ? plans.reduce((a, b) => (b.price_final > a.price_final ? b : a))
      : null;
  // Cheapest first: trial → 6 months → year, so the price climbs left to right
  // and the dark «выгоднее» card closes the row.
  const trio = (spotlight ? plans.filter((plan) => plan.id !== spotlight.id) : plans)
    .slice()
    .sort((a, b) => a.price_final - b.price_final);
  const halfyear = trio.find((plan) => plan.period === "halfyear");

  const gridCols = trio.length === 2 ? "sm:grid-cols-2" : "lg:grid-cols-3";

  const cards =
    trio.length > 0
      ? trio.map((plan, i) => (
          <Reveal key={plan.id} delay={i * 90} className="h-full">
            <PlanCard
              plan={toCardPlan(plan, locale, copy)}
              note={priceNote(plan, halfyear, locale)}
              popular={copy.popular}
              featured={plan.is_featured}
              href={href}
            />
          </Reveal>
        ))
      : // API unreachable or no plans yet — the hand-written copy keeps the
        // marketing section from going blank. Same cheap-to-dear order.
        [
          <Reveal key="free" className="h-full">
            <PlanCard plan={copy.planFree} href={href} />
          </Reveal>,
          <Reveal key="std" delay={90} className="h-full">
            <PlanCard plan={copy.planStd} href={href} />
          </Reveal>,
          <Reveal key="prem" delay={180} className="h-full">
            <PlanCard plan={copy.planPrem} popular={copy.popular} featured href={href} />
          </Reveal>,
        ];

  return (
    <section
      id="pricing"
      aria-labelledby="pricing-title"
      className="py-16 lg:py-[104px]"
    >
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
        <SectionHeading
          kicker={copy.priceKicker}
          title={copy.priceTitle}
          subtitle={copy.priceSub}
          titleId="pricing-title"
        />

        <div className={`grid items-stretch gap-6 ${gridCols}`}>{cards}</div>

        {spotlight ? (
          <Reveal delay={120}>
            <PremiumCard
              plan={toCardPlan(spotlight, locale, copy)}
              tag={copy.priceCustomTag}
              demoLabel={copy.priceCustomDemo}
              href={href}
            />
          </Reveal>
        ) : null}
      </div>
    </section>
  );
}

type Plan = LandingCopy["planFree"];

/** Months covered by one payment of a period. */
const PERIOD_MONTHS: Record<ApiPlan["period"], number> = { month: 1, halfyear: 6, year: 12 };

/**
 * «≈ 4 170 ₸ в месяц · экономия 10 000 ₸» under a multi-month price. The
 * monthly figure is rounded to 10 ₸; the saving is against buying the 6-month
 * plan twice, and only shown when it is real.
 */
function priceNote(plan: ApiPlan, halfyear: ApiPlan | undefined, locale: string): string | undefined {
  const months = PERIOD_MONTHS[plan.period];
  if (plan.price_final === 0 || months === 1) return undefined;

  const kz = locale === "kz";
  // Minor units: round to 10 ₸ = 1000 тиын.
  const monthly = Math.round(plan.price_final / months / 1000) * 1000;
  let note = `≈ ${formatPrice(monthly)} ${kz ? "айына" : "в месяц"}`;

  if (plan.period === "year" && halfyear) {
    const saving = halfyear.price_final * 2 - plan.price_final;
    if (saving > 0) note += ` · ${kz ? "үнемдеу" : "экономия"} ${formatPrice(saving)}`;
  }

  return note;
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

function PlanCard({
  plan,
  note,
  popular,
  featured = false,
  href,
}: {
  plan: Plan;
  /** Per-month equivalent / saving line under the price. */
  note?: string;
  popular?: string;
  featured?: boolean;
  href: string;
}) {
  // One layout for both looks; the featured (year) card is dark. Cards stretch
  // to the row height and the button sits on the bottom edge (`mt-auto`).
  const dark = featured;

  return (
    <article
      className={`relative flex h-full flex-col rounded-[24px] px-7 py-8 sm:px-8 ${
        dark ? "bg-ink text-white" : "border border-border-strong bg-white"
      }`}
    >
      {dark && popular ? (
        <span className="absolute -top-3.5 left-7 inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-accent px-3.5 py-1.5 text-[13px] font-bold text-white sm:left-8">
          <Sparkles size={13} aria-hidden="true" />
          {popular}
        </span>
      ) : null}
      <div className={`mb-2 text-[15px] font-bold ${dark ? "text-[var(--on-dark-accent)]" : "text-muted"}`}>
        {plan.name}
      </div>
      <div className="flex flex-wrap items-baseline gap-x-1.5">
        <span className="text-[40px] font-extrabold tracking-[-0.03em]">{plan.price}</span>
        <span className={`text-[15px] ${dark ? "text-[var(--on-dark-muted)]" : "text-muted-soft"}`}>
          {plan.period}
        </span>
      </div>
      {note ? (
        <div className={`mt-1 text-sm font-semibold ${dark ? "text-[var(--on-dark-accent)]" : "text-success"}`}>
          {note}
        </div>
      ) : null}
      <div className={`mb-6 mt-3 text-sm ${dark ? "text-[var(--on-dark-muted)]" : "text-muted-soft"}`}>
        {plan.desc}
      </div>
      <ul className="mb-8 flex flex-col gap-3">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2.5 text-[15px]">
            <span
              className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                dark ? "bg-white/10 text-[var(--on-dark-accent)]" : "bg-accent-soft text-accent-hover"
              }`}
              aria-hidden="true"
            >
              <Check size={12} strokeWidth={3.2} />
            </span>
            {feature}
          </li>
        ))}
      </ul>
      <Button
        variant={dark ? "primary" : "secondary"}
        href={href}
        className="mt-auto w-full py-3.5 text-base"
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
  demoLabel,
  href,
}: {
  plan: Plan;
  tag: string;
  demoLabel: string;
  href: string;
}) {
  return (
    <article className="relative mt-6 rounded-[28px] bg-ink px-6 py-8 text-white sm:px-9 sm:py-9 lg:mt-8">
      <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:gap-12">
        <div className="lg:w-[300px] lg:shrink-0">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[13px] font-bold text-[var(--on-dark-accent)]">
            <Crown size={13} />
            {tag}
          </span>
          <div className="mt-4 text-[17px] font-bold text-[var(--on-dark-accent)]">{plan.name}</div>
          <div className="mt-1.5 flex items-baseline gap-1.5">
            <span className="text-[40px] font-extrabold tracking-[-0.03em]">{plan.price}</span>
            <span className="text-[15px] text-[var(--on-dark-muted)]">{plan.period}</span>
          </div>
          {plan.desc ? (
            <div className="mt-2 text-sm text-[var(--on-dark-muted)]">{plan.desc}</div>
          ) : null}
          <Button
            variant="primary"
            href={href}
            className="mt-6 w-full py-3.5 text-base"
          >
            {plan.cta}
          </Button>
          {/* A Premium menu lives on its own site, so a live client menu sells it
              better than any copy — and it answers "how does it look" right where
              the question comes up. Distinct from the Hero's /m/demo, which shows
              the regular builder menu. */}
          <a
            href={PREMIUM_DEMO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3.5 inline-flex w-full items-center justify-center gap-1.5 py-2.5 text-[15px] font-semibold text-[var(--on-dark-accent)] transition-colors duration-200 hover:text-[var(--on-dark-accent-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--on-dark-accent)]"
          >
            {demoLabel}
            <ArrowUpRight size={16} aria-hidden="true" />
          </a>
        </div>

        <ul className="grid flex-1 gap-x-8 gap-y-3.5 sm:grid-cols-2">
          {plan.features.map((feature) => (
            <li key={feature} className="flex items-center gap-2.5 text-[15px]">
              <span
                className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/10 text-[var(--on-dark-accent)]"
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
