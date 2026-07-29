"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Clock } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Field } from "@/components/auth/Field";
import { Button } from "@/components/landing/ui/Button";
import { authByLocale } from "@/content/auth";
import type { Locale } from "@/content/landing";
import { daysLeftPhrase } from "@/lib/access";
import {
  ApiError,
  createSubscriptionRequest,
  getPlans,
  getSubscriptionStatus,
  type MenuSubscription,
  type Plan,
  type ValidationErrors,
} from "@/lib/api";
import { formatPrice } from "@/lib/money";

const STATUS_QUERY_KEY = ["subscription-status"] as const;
const PLANS_QUERY_KEY = ["plans"] as const;

type Copy = typeof authByLocale.ru;

/** Pick the locale's text, falling back to Russian for untranslated Kazakh. */
function pickPlanName(plan: { name_ru: string; name_kk: string | null }, kz: boolean): string {
  return (kz && plan.name_kk) || plan.name_ru;
}

/** ISO string → «12.08.2026». Empty when the date is absent. */
function formatDate(iso: string | null): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("ru-RU", { dateStyle: "medium" }).format(date);
}

export function SubscriptionCard({ locale }: { locale: Locale }) {
  const copy = authByLocale[locale];
  const kz = locale === "kz";

  const { data: status } = useQuery({
    queryKey: STATUS_QUERY_KEY,
    queryFn: () => getSubscriptionStatus(locale),
  });

  const { data: plans } = useQuery({
    queryKey: PLANS_QUERY_KEY,
    queryFn: () => getPlans(locale),
  });

  // Wait for the initial status read before deciding what to show.
  if (status === undefined) {
    return <div className="h-40 max-w-[720px] animate-pulse rounded-[20px] bg-surface-2" />;
  }

  if (status.menus.length === 0) {
    return (
      <div className="max-w-[720px] rounded-[20px] border border-border bg-white p-6">
        <p className="text-[15px] text-muted-soft">{copy.subNoVenues}</p>
      </div>
    );
  }

  return (
    <div className="flex max-w-[720px] flex-col gap-6">
      <p className="text-sm text-muted-soft">{copy.subMenuHint}</p>
      {status.menus.map((menu) => (
        <MenuRow key={menu.id} menu={menu} plans={plans ?? []} copy={copy} locale={locale} kz={kz} />
      ))}
    </div>
  );
}

/** One menu with its own access window, grant and request form. */
function MenuRow({
  menu,
  plans,
  copy,
  locale,
  kz,
}: {
  menu: MenuSubscription;
  plans: Plan[];
  copy: Copy;
  locale: Locale;
  kz: boolean;
}) {
  const queryClient = useQueryClient();

  const active = menu.subscription;
  const pending = menu.pending_request;
  const activePlan = active?.plan ?? null;

  // Form stays folded until the owner chooses to subscribe/renew this menu.
  const [open, setOpen] = useState(false);
  const [planId, setPlanId] = useState<number | "">("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const mutation = useMutation({
    mutationFn: () =>
      createSubscriptionRequest(
        {
          establishment_id: menu.id,
          plan_id: Number(planId),
          contact_phone: phone || null,
          note: note || null,
        },
        locale,
      ),
    onSuccess: () => {
      setSuccess(true);
      setErrors({});
      setFormError(null);
      setPhone("");
      setNote("");
      setPlanId("");
      setOpen(false);
      // A fresh pending request now exists — reflect it in this menu's banner.
      queryClient.invalidateQueries({ queryKey: STATUS_QUERY_KEY });
    },
    onError: (error: unknown) => {
      setSuccess(false);
      if (error instanceof ApiError) {
        // 409: this menu already has a request awaiting a decision. Refetch so
        // the pending banner appears instead of leaving a bare error.
        if (error.status === 409) {
          setFormError(copy.subAlreadyPending);
          queryClient.invalidateQueries({ queryKey: STATUS_QUERY_KEY });
          return;
        }
        setErrors(error.errors);
        setFormError(error.isValidation ? null : error.message);
        return;
      }
      setFormError(copy.networkError);
    },
  });

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    setSuccess(false);
    setFormError(null);
    setErrors({});
    if (planId === "") {
      setFormError(copy.subSelectPlanFirst);
      return;
    }
    mutation.mutate();
  }

  return (
    <section className="rounded-[20px] border border-border bg-white p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-[18px] font-extrabold tracking-[-0.02em]">{menu.name}</h3>
          {activePlan ? (
            <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[15px] text-muted">
              <span className="font-semibold text-foreground">{pickPlanName(activePlan, kz)}</span>
              {active?.ends_at ? (
                <span>
                  {copy.subActiveUntil} {formatDate(active.ends_at)}
                </span>
              ) : null}
            </p>
          ) : (
            <p className="mt-1 text-[15px] text-muted-soft">{copy.subFreeName}</p>
          )}
        </div>
        <AccessBadge menu={menu} copy={copy} locale={locale} />
      </div>

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
          </div>
        </div>
      ) : null}

      {success ? (
        <p
          role="status"
          className="mt-4 rounded-[16px] bg-accent-soft px-4 py-3 text-sm font-semibold text-accent-hover"
        >
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
          <form onSubmit={onSubmit} noValidate className="mt-5">
            {formError ? (
              <p role="alert" className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
                {formError}
              </p>
            ) : null}

            {plans.length > 0 ? (
              <div className="flex flex-col gap-4">
                <fieldset className="flex flex-col gap-3">
                  <legend className="mb-1 text-sm font-semibold text-foreground">
                    {copy.subPickPlan}
                  </legend>
                  {plans.map((plan) => (
                    <PlanOption
                      key={plan.id}
                      plan={plan}
                      kz={kz}
                      copy={copy}
                      checked={planId === plan.id}
                      onSelect={() => {
                        setPlanId(plan.id);
                        setFormError(null);
                      }}
                    />
                  ))}
                </fieldset>

                <Field
                  label={copy.subContactPhone}
                  name={`contact_phone_${menu.id}`}
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder={copy.subContactPhonePlaceholder}
                  value={phone}
                  errors={errors.contact_phone}
                  onChange={(e) => setPhone(e.target.value)}
                />

                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor={`sub-note-${menu.id}`}
                    className="text-sm font-semibold text-foreground"
                  >
                    {copy.subComment}
                  </label>
                  <textarea
                    id={`sub-note-${menu.id}`}
                    rows={3}
                    placeholder={copy.subCommentPlaceholder}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="w-full resize-y rounded-xl border border-border-strong bg-white px-4 py-3 text-base outline-none transition-colors placeholder:text-muted-soft focus:border-accent focus:ring-2 focus:ring-accent/25"
                  />
                  {errors.note ? <p className="text-sm text-red-600">{errors.note[0]}</p> : null}
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={mutation.isPending}
                    className="py-3 sm:px-7"
                  >
                    {mutation.isPending ? copy.subRequestSending : copy.subRequestCta}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setOpen(false);
                      setFormError(null);
                      setErrors({});
                    }}
                    className="py-3 sm:px-7"
                  >
                    {copy.cancel}
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-[15px] text-muted-soft">{copy.subNoPlans}</p>
            )}
          </form>
        ) : (
          <Button
            type="button"
            variant={activePlan ? "ghost" : "primary"}
            onClick={() => setOpen(true)}
            className="mt-5 py-3 sm:px-7"
          >
            {activePlan ? copy.subRenew : copy.subManage}
          </Button>
        )
      ) : null}
    </section>
  );
}

/** Compact status pill: expired / trial N дн. / subscription N дн. / unlimited. */
function AccessBadge({
  menu,
  copy,
  locale,
}: {
  menu: MenuSubscription;
  copy: Copy;
  locale: Locale;
}) {
  if (menu.is_expired) {
    return (
      <span className="rounded-full bg-red-100 px-3 py-1 text-[13px] font-semibold text-red-700">
        {copy.accessExpired}
      </span>
    );
  }

  if (menu.access_source === null) {
    return (
      <span className="rounded-full bg-surface-2 px-3 py-1 text-[13px] font-semibold text-muted">
        {copy.accessUnlimited}
      </span>
    );
  }

  const days = menu.days_left;
  const phrase = days !== null ? daysLeftPhrase(days, locale) : "";

  if (menu.access_source === "trial") {
    return (
      <span className="rounded-full bg-amber-100 px-3 py-1 text-[13px] font-semibold text-amber-700">
        {copy.accessTrial}
        {phrase ? ` · ${phrase}` : ""}
      </span>
    );
  }

  return (
    <span className="rounded-full bg-accent-soft px-3 py-1 text-[13px] font-semibold text-accent-hover">
      {phrase || copy.accessUnlimited}
    </span>
  );
}

/** «/ мес» · «/ жыл» — recurring-price suffix for a plan's period. */
function periodSuffix(period: Plan["period"], copy: Copy): string {
  return period === "year" ? copy.subPerYear : copy.subPerMonth;
}

function PlanOption({
  plan,
  kz,
  copy,
  checked,
  onSelect,
}: {
  plan: Plan;
  kz: boolean;
  copy: Copy;
  checked: boolean;
  onSelect: () => void;
}) {
  const name = pickPlanName(plan, kz);
  const tagline = (kz && plan.tagline_kk) || plan.tagline_ru || "";
  const priceLabel = plan.price_final === 0 ? "0 ₸" : formatPrice(plan.price_final);
  const suffix = plan.price_final === 0 ? "" : periodSuffix(plan.period, copy);
  const features = plan.features.map((f) => (kz && f.kk) || f.ru);

  return (
    <label
      className={`flex cursor-pointer flex-col gap-2 rounded-[16px] border p-4 transition-colors ${
        checked ? "border-accent bg-accent-soft" : "border-border-strong hover:border-accent-tint"
      }`}
    >
      <span className="flex items-start justify-between gap-3">
        <span className="flex items-start gap-3">
          <input
            type="radio"
            name={`plan_id_${plan.id}`}
            checked={checked}
            onChange={onSelect}
            className="mt-1 h-4 w-4 shrink-0 accent-[var(--accent)]"
          />
          <span>
            <span className="block font-bold text-foreground">{name}</span>
            {tagline ? <span className="block text-sm text-muted-soft">{tagline}</span> : null}
          </span>
        </span>
        <span className="shrink-0 text-right">
          <span className="text-lg font-extrabold tracking-[-0.02em]">{priceLabel}</span>
          {suffix ? <span className="text-sm text-muted-soft"> {suffix}</span> : null}
          {plan.discount_percent > 0 ? (
            <span className="mt-1 block text-xs font-semibold text-accent-hover">
              −{plan.discount_percent}% {copy.subDiscountOff}
            </span>
          ) : null}
        </span>
      </span>

      {features.length > 0 ? (
        <ul className="ml-7 flex flex-col gap-1">
          {features.map((feature) => (
            <li key={feature} className="flex items-center gap-2 text-sm text-muted">
              <Check size={13} className="shrink-0 text-accent" strokeWidth={3} />
              {feature}
            </li>
          ))}
        </ul>
      ) : null}
    </label>
  );
}
