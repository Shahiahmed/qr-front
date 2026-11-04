"use client";

import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, Clock } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/landing/ui/Button";
import {
  periodSuffix,
  pickPlanName,
  SubscribeForm,
  useSubscriptionStatus,
} from "@/components/panel/SubscribeForm";
import { AccessBadge, VenueMark } from "@/components/panel/VenueList";
import { authByLocale } from "@/content/auth";
import type { Locale } from "@/content/landing";
import { daysLeftPhrase, formatAccessDate } from "@/lib/access";
import { getPlans, type MenuSubscription } from "@/lib/api";
import { formatPrice } from "@/lib/money";
import { PUBLIC_MENU_HOST } from "@/lib/venues";

type Copy = typeof authByLocale.ru;

/**
 * «Подписка» page body: one card per menu on the left (billing is per menu),
 * and on the right how the manual flow works plus the price list — so the
 * owner knows what happens after «Оформить» before pressing it.
 */
export function SubscriptionCard({ locale }: { locale: Locale }) {
  const copy = authByLocale[locale];
  const kz = locale === "kz";

  const { data: status } = useSubscriptionStatus(locale);

  // Wait for the initial status read before deciding what to show.
  if (status === undefined) {
    return (
      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="h-56 animate-pulse rounded-[20px] bg-surface-2" />
        <div className="hidden h-72 animate-pulse rounded-[20px] bg-surface-2 xl:block" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
      <div className="flex flex-col gap-4">
        {status.menus.length === 0 ? (
          <div className="rounded-[20px] border border-border bg-white p-6">
            <p className="text-[15px] text-muted-soft">{copy.subNoVenues}</p>
          </div>
        ) : (
          status.menus.map((menu) => (
            <MenuRow key={menu.id} menu={menu} copy={copy} locale={locale} kz={kz} />
          ))
        )}
      </div>

      <aside className="flex flex-col gap-4">
        <HowItWorks copy={copy} />
        <PlanList copy={copy} locale={locale} kz={kz} />
      </aside>
    </div>
  );
}

/** One menu with its own access window, grant and request form. */
function MenuRow({
  menu,
  copy,
  locale,
  kz,
}: {
  menu: MenuSubscription;
  copy: Copy;
  locale: Locale;
  kz: boolean;
}) {
  const active = menu.subscription;
  const pending = menu.pending_request;
  const activePlan = active?.plan ?? null;

  // Form stays folded until the owner chooses to subscribe/renew this menu.
  const [open, setOpen] = useState(false);
  const [success, setSuccess] = useState(false);

  const planName = activePlan
    ? pickPlanName(activePlan, kz)
    : menu.access_source === "trial"
      ? copy.accessTrial
      : menu.access_source === null
        ? copy.accessUnlimited
        : copy.subFreeName;
  const until = formatAccessDate(menu.access_ends_at, locale);
  const left = menu.is_expired
    ? copy.accessExpired
    : menu.days_left !== null
      ? daysLeftPhrase(menu.days_left, locale)
      : "∞";

  const cells: { label: string; value: string; warn?: boolean }[] = [
    { label: copy.subPickPlan, value: planName },
    { label: copy.subActiveUntil, value: until || "—" },
    {
      label: copy.subCellLeft,
      value: left,
      warn: menu.is_expired || (menu.days_left !== null && menu.days_left <= 3),
    },
  ];

  return (
    <section className="rounded-[20px] border border-border bg-white p-5 shadow-[0_1px_2px_rgba(20,18,16,0.03)] sm:p-6">
      <div className="flex flex-wrap items-start gap-x-3 gap-y-3">
        <VenueMark />
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-[17px] font-extrabold tracking-[-0.02em]">{menu.name}</h3>
          <p className="mt-0.5 truncate text-[13px] text-muted-soft">
            {PUBLIC_MENU_HOST}/{menu.slug}
          </p>
        </div>
        {/* Phones read the same status from the facts below — no room for both. */}
        <span className="hidden sm:block">
          <AccessBadge venue={menu} locale={locale} copy={copy} inRow compact />
        </span>
      </div>

      {/* Plan / end date / time left, as three readable facts — a column of
          label/value rows on phones, three cells side by side from sm up. */}
      <dl className="mt-5 grid divide-y divide-border overflow-hidden rounded-[14px] border border-border bg-surface/60 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        {cells.map((cell) => (
          <div
            key={cell.label}
            className="flex min-w-0 items-baseline justify-between gap-3 px-4 py-2.5 sm:block sm:py-3"
          >
            <dt className="truncate text-[11.5px] font-semibold uppercase tracking-[0.04em] text-muted-soft">
              {cell.label}
            </dt>
            <dd
              className={`truncate text-[14px] font-bold sm:mt-1 sm:text-[15px] ${
                cell.warn ? "text-red-700" : "text-foreground"
              }`}
            >
              {cell.value}
            </dd>
          </div>
        ))}
      </dl>

      {/* Pending request banner */}
      {pending ? (
        <div className="mt-4 flex items-start gap-3 rounded-[16px] border border-amber-200 bg-amber-50 p-4">
          <Clock size={18} className="mt-0.5 shrink-0 text-amber-600" />
          <div>
            <p className="font-bold text-amber-900">{copy.subPendingTitle}</p>
            <p className="mt-0.5 text-sm text-amber-800">
              {pending.plan ? `${pickPlanName(pending.plan, kz)}. ` : ""}
              {copy.subPendingNote}
            </p>
            {pending.referral_credit_applied > 0 ? (
              <p className="mt-1 text-sm font-semibold text-amber-900">
                {copy.subReferralDiscount}: −{formatPrice(pending.referral_credit_applied)}
              </p>
            ) : null}
          </div>
        </div>
      ) : null}

      {success ? (
        <p
          role="status"
          className="mt-4 flex items-center gap-2 rounded-[16px] bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800"
        >
          <CheckCircle2 size={17} className="shrink-0" />
          {copy.subRequestSuccess}
        </p>
      ) : null}

      {/* Expired hint when nothing covers the menu anymore. */}
      {menu.is_expired && !pending ? (
        <p className="mt-4 rounded-[16px] bg-red-50 px-4 py-3 text-sm text-red-700">
          {copy.accessExpiredHint}
        </p>
      ) : null}

      {/* Subscribe / renew — hidden while a request is pending for this menu. */}
      {!pending ? (
        open ? (
          <div className="mt-5 border-t border-border pt-5">
            <SubscribeForm
              menuId={menu.id}
              currentPlanId={activePlan?.id ?? null}
              locale={locale}
              onSuccess={() => {
                setSuccess(true);
                setOpen(false);
              }}
              onCancel={() => setOpen(false)}
            />
          </div>
        ) : (
          <Button
            type="button"
            variant={activePlan ? "secondary" : "primary"}
            onClick={() => {
              setOpen(true);
              setSuccess(false);
            }}
            className="mt-5 h-11 w-full px-5 py-0 text-[14.5px] sm:w-auto"
          >
            {activePlan ? copy.subRenew : copy.subManage}
          </Button>
        )
      ) : null}
    </section>
  );
}

/** The manual flow in three steps — sets expectations before the request. */
function HowItWorks({ copy }: { copy: Copy }) {
  const steps = [copy.subStep1, copy.subStep2, copy.subStep3];
  return (
    <section className="rounded-[20px] border border-border bg-white p-5 shadow-[0_1px_2px_rgba(20,18,16,0.03)]">
      <h2 className="text-[16px] font-extrabold tracking-[-0.02em]">{copy.subHowTitle}</h2>
      <ol className="mt-4 flex flex-col gap-3.5">
        {steps.map((step, i) => (
          <li key={step} className="flex items-start gap-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent-soft text-[13px] font-extrabold text-accent-hover">
              {i + 1}
            </span>
            <span className="pt-0.5 text-[14px] leading-snug text-muted">{step}</span>
          </li>
        ))}
      </ol>
      <p className="mt-4 border-t border-border pt-3.5 text-[13px] text-muted-soft">
        {copy.subMenuHint}
      </p>
    </section>
  );
}

/** Read-only price list; picking happens in each menu's form. */
function PlanList({ copy, locale, kz }: { copy: Copy; locale: Locale; kz: boolean }) {
  const { data: plans } = useQuery({
    queryKey: ["plans"],
    queryFn: () => getPlans(locale),
  });

  if (!plans || plans.length === 0) return null;

  return (
    <section className="rounded-[20px] border border-border bg-white p-5 shadow-[0_1px_2px_rgba(20,18,16,0.03)]">
      <h2 className="text-[16px] font-extrabold tracking-[-0.02em]">{copy.subPlansTitle}</h2>
      <ul className="mt-3 flex flex-col gap-2">
        {plans.map((plan) => (
          <li
            key={plan.id}
            className={`flex items-center justify-between gap-3 rounded-[14px] border px-3.5 py-3 ${
              plan.is_featured ? "border-accent/40 bg-accent-soft/50" : "border-border"
            }`}
          >
            <span className="min-w-0">
              <span className="flex flex-wrap items-center gap-1.5">
                <span className="text-[14.5px] font-bold">{pickPlanName(plan, kz)}</span>
                {plan.is_featured ? (
                  <span className="rounded-full bg-accent px-2 py-0.5 text-[11px] font-bold text-white">
                    {copy.subFeatured}
                  </span>
                ) : null}
              </span>
              {plan.discount_percent > 0 ? (
                <span className="mt-0.5 block text-[12.5px] font-semibold text-emerald-700">
                  −{plan.discount_percent}% {copy.subDiscountOff}
                </span>
              ) : null}
            </span>
            <span className="shrink-0 text-right">
              <span className="text-[15px] font-extrabold tracking-[-0.01em]">
                {formatPrice(plan.price_final)}
              </span>
              <span className="ml-1 text-[12.5px] text-muted-soft">
                {periodSuffix(plan.period, copy)}
              </span>
              {plan.price_final < plan.price ? (
                <span className="block text-[12px] text-muted-soft line-through">
                  {formatPrice(plan.price)}
                </span>
              ) : null}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
