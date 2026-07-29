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
  type Plan,
  type ValidationErrors,
} from "@/lib/api";
import { formatPrice } from "@/lib/money";

const STATUS_QUERY_KEY = ["subscription-status"] as const;
const PLANS_QUERY_KEY = ["plans"] as const;

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
  const queryClient = useQueryClient();

  const { data: status } = useQuery({
    queryKey: STATUS_QUERY_KEY,
    queryFn: () => getSubscriptionStatus(locale),
  });

  const { data: plans } = useQuery({
    queryKey: PLANS_QUERY_KEY,
    queryFn: () => getPlans(locale),
  });

  const [planId, setPlanId] = useState<number | "">("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const mutation = useMutation({
    mutationFn: () =>
      createSubscriptionRequest(
        { plan_id: Number(planId), contact_phone: phone || null, note: note || null },
        locale,
      ),
    onSuccess: () => {
      setSuccess(true);
      setErrors({});
      setFormError(null);
      setPhone("");
      setNote("");
      setPlanId("");
      // A fresh pending request now exists — reflect it in the banner.
      queryClient.invalidateQueries({ queryKey: STATUS_QUERY_KEY });
    },
    onError: (error: unknown) => {
      setSuccess(false);
      if (error instanceof ApiError) {
        // 409: a request is already awaiting a decision. Refetch so the
        // pending banner appears instead of leaving a bare error.
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

  // Wait for the initial status read before deciding what to show.
  if (status === undefined) {
    return <div className="h-40 max-w-[640px] animate-pulse rounded-[20px] bg-surface-2" />;
  }

  const active = status.subscription;
  const pending = status.pending_request;
  const activePlan = active?.plan ?? null;

  return (
    <div className="flex max-w-[640px] flex-col gap-6">
      {/* Current plan */}
      <section className="rounded-[20px] border border-border bg-white p-6">
        <h2 className="mb-3 text-sm font-semibold text-muted-soft">{copy.subCurrentPlan}</h2>
        {activePlan ? (
          <>
            <p className="text-xl font-extrabold tracking-[-0.02em]">
              {pickPlanName(activePlan, kz)}
            </p>
            {active?.ends_at ? (
              <p className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[15px] text-muted">
                <span>
                  {copy.subActiveUntil} {formatDate(active.ends_at)}
                </span>
                {active.days_left !== null ? (
                  <span className="rounded-full bg-accent-soft px-2.5 py-0.5 text-[13px] font-semibold text-accent-hover">
                    {daysLeftPhrase(active.days_left, locale)}
                  </span>
                ) : null}
              </p>
            ) : null}
          </>
        ) : (
          <>
            <p className="text-xl font-extrabold tracking-[-0.02em]">{copy.subFreeName}</p>
            <p className="mt-1.5 text-[15px] text-muted-soft">{copy.subFreeNote}</p>
          </>
        )}
      </section>

      {/* Pending request banner */}
      {pending ? (
        <section className="flex items-start gap-3 rounded-[20px] border border-amber-200 bg-amber-50 p-5">
          <Clock size={20} className="mt-0.5 shrink-0 text-amber-600" />
          <div>
            <p className="font-bold text-amber-900">{copy.subPendingTitle}</p>
            <p className="mt-0.5 text-sm text-amber-800">
              {pending.plan ? `${pickPlanName(pending.plan, kz)}. ` : ""}
              {copy.subPendingNote}
            </p>
          </div>
        </section>
      ) : null}

      {/* Request form — hidden while a request is pending */}
      {!pending ? (
        <form
          onSubmit={onSubmit}
          noValidate
          className="rounded-[20px] border border-border bg-white p-6"
        >
          <h2 className="text-[18px] font-extrabold tracking-[-0.02em]">{copy.subChooseTitle}</h2>
          <p className="mb-5 mt-1 text-sm text-muted-soft">{copy.subChooseSub}</p>

          {formError ? (
            <p role="alert" className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
              {formError}
            </p>
          ) : null}

          {success ? (
            <p
              role="status"
              className="mb-4 rounded-xl bg-accent-soft px-4 py-3 text-sm font-semibold text-accent-hover"
            >
              {copy.subRequestSuccess}
            </p>
          ) : null}

          {plans && plans.length > 0 ? (
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
                name="contact_phone"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                placeholder={copy.subContactPhonePlaceholder}
                value={phone}
                errors={errors.contact_phone}
                onChange={(e) => setPhone(e.target.value)}
              />

              <div className="flex flex-col gap-1.5">
                <label htmlFor="sub-note" className="text-sm font-semibold text-foreground">
                  {copy.subComment}
                </label>
                <textarea
                  id="sub-note"
                  rows={3}
                  placeholder={copy.subCommentPlaceholder}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full resize-y rounded-xl border border-border-strong bg-white px-4 py-3 text-base outline-none transition-colors placeholder:text-muted-soft focus:border-accent focus:ring-2 focus:ring-accent/25"
                />
                {errors.note ? (
                  <p className="text-sm text-red-600">{errors.note[0]}</p>
                ) : null}
              </div>

              <Button
                type="submit"
                variant="primary"
                disabled={mutation.isPending}
                className="mt-1 w-full py-3 sm:w-auto sm:self-start sm:px-7"
              >
                {mutation.isPending ? copy.subRequestSending : copy.subRequestCta}
              </Button>
            </div>
          ) : (
            <p className="text-[15px] text-muted-soft">{copy.subNoPlans}</p>
          )}
        </form>
      ) : null}
    </div>
  );
}

/** «/ мес» · «/ жыл» — recurring-price suffix for a plan's period. */
function periodSuffix(period: Plan["period"], copy: typeof authByLocale.ru): string {
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
  copy: typeof authByLocale.ru;
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
            name="plan_id"
            checked={checked}
            onChange={onSelect}
            className="mt-1 h-4 w-4 shrink-0 accent-[var(--accent)]"
          />
          <span>
            <span className="block font-bold text-foreground">{name}</span>
            {tagline ? (
              <span className="block text-sm text-muted-soft">{tagline}</span>
            ) : null}
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
