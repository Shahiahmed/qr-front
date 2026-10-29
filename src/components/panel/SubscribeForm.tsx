"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Plus } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Field } from "@/components/auth/Field";
import { Button } from "@/components/landing/ui/Button";
import { authByLocale } from "@/content/auth";
import type { Locale } from "@/content/landing";
import {
  ApiError,
  createSubscriptionRequest,
  getPlans,
  getReferral,
  getSubscriptionStatus,
  type Plan,
  type ValidationErrors,
} from "@/lib/api";
import { formatPrice } from "@/lib/money";
import { formatPhone, maskPhoneInput, PHONE_MASK_LENGTH } from "@/lib/phone";
import { useAuth } from "@/lib/useAuth";

export const STATUS_QUERY_KEY = ["subscription-status"] as const;
const PLANS_QUERY_KEY = ["plans"] as const;
const REFERRAL_QUERY_KEY = ["referral"] as const;

type Copy = typeof authByLocale.ru;

/** Per-menu subscription status (plan, pending request) for every venue. */
export function useSubscriptionStatus(locale: Locale) {
  return useQuery({
    queryKey: STATUS_QUERY_KEY,
    queryFn: () => getSubscriptionStatus(locale),
  });
}

/** Pick the locale's text, falling back to Russian for untranslated Kazakh. */
export function pickPlanName(plan: { name_ru: string; name_kk: string | null }, kz: boolean): string {
  return (kz && plan.name_kk) || plan.name_ru;
}

/** «/ мес» · «/ жыл» — recurring-price suffix for a plan's period. */
function periodSuffix(period: Plan["period"], copy: Copy): string {
  if (period === "year") return copy.subPerYear;
  if (period === "halfyear") return copy.subPerHalfyear;
  return copy.subPerMonth;
}

/**
 * Plan picker + contact + request for one menu. Shared by the «Подписка» page
 * and the subscribe dialog on a venue card, so both file the same request.
 * The phone is prefilled from the account (every owner has one now), the
 * featured or current plan is preselected, and the comment stays folded —
 * in the common case it is one tap on a plan and one on submit.
 */
export function SubscribeForm({
  menuId,
  currentPlanId = null,
  locale,
  onSuccess,
  onCancel,
}: {
  menuId: number;
  currentPlanId?: number | null;
  locale: Locale;
  onSuccess: () => void;
  onCancel?: () => void;
}) {
  const copy = authByLocale[locale];
  const kz = locale === "kz";
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: plans, isPending: plansPending } = useQuery({
    queryKey: PLANS_QUERY_KEY,
    queryFn: () => getPlans(locale),
  });

  // Referral wallet — lowers the charge on a request; 0 when the program is off
  // or the owner has no credit. A failed read falls back to 0 (no discount UI).
  const { data: referral } = useQuery({
    queryKey: REFERRAL_QUERY_KEY,
    queryFn: () => getReferral(locale),
  });
  const credit = referral?.credit ?? 0;

  // `null` until the owner picks: falls back to the current plan, then the
  // featured one, so the form opens with a sensible choice already made.
  const [picked, setPicked] = useState<number | null>(null);
  const [phone, setPhone] = useState(user?.phone ? formatPhone(user.phone) : "");
  const [note, setNote] = useState("");
  const [noteOpen, setNoteOpen] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [formError, setFormError] = useState<string | null>(null);

  const list = plans ?? [];
  const planId =
    picked ??
    list.find((p) => p.id === currentPlanId)?.id ??
    list.find((p) => p.is_featured)?.id ??
    null;
  const chosen = list.find((p) => p.id === planId) ?? null;
  const applied = chosen ? Math.min(credit, chosen.price_final) : 0;
  const net = chosen ? chosen.price_final - applied : 0;

  const mutation = useMutation({
    mutationFn: () =>
      createSubscriptionRequest(
        {
          establishment_id: menuId,
          plan_id: Number(planId),
          contact_phone: phone || null,
          note: note || null,
        },
        locale,
      ),
    onSuccess: () => {
      // A fresh pending request now exists — every view of it refreshes.
      queryClient.invalidateQueries({ queryKey: STATUS_QUERY_KEY });
      onSuccess();
    },
    onError: (error: unknown) => {
      if (error instanceof ApiError) {
        // 409: this menu already has a request awaiting a decision. Refetch so
        // the pending state appears instead of leaving a bare error.
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
    setFormError(null);
    setErrors({});
    if (planId === null) {
      setFormError(copy.subSelectPlanFirst);
      return;
    }
    mutation.mutate();
  }

  if (plansPending) {
    return (
      <div className="flex flex-col gap-3">
        {[0, 1].map((key) => (
          <div key={key} className="h-[88px] animate-pulse rounded-[16px] bg-surface-2" />
        ))}
      </div>
    );
  }

  if (list.length === 0) {
    return <p className="text-[15px] text-muted-soft">{copy.subNoPlans}</p>;
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
      {formError ? (
        <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {formError}
        </p>
      ) : null}

      <fieldset className="flex flex-col gap-2.5">
        <legend className="mb-2 text-sm font-semibold text-foreground">{copy.subPickPlan}</legend>
        {list.map((plan) => (
          <PlanOption
            key={plan.id}
            plan={plan}
            group={`plan-${menuId}`}
            kz={kz}
            copy={copy}
            checked={planId === plan.id}
            onSelect={() => {
              setPicked(plan.id);
              setFormError(null);
            }}
          />
        ))}
      </fieldset>

      {/* Referral wallet applied to the chosen plan — the actual charge is
          min(wallet, price), computed the same way on the server at approval. */}
      {chosen && applied > 0 ? (
        <div className="rounded-[16px] bg-accent-soft p-4 text-sm">
          <p className="flex items-center justify-between gap-3 text-accent-hover">
            <span className="font-semibold">{copy.subReferralDiscount}</span>
            <span className="font-bold">−{formatPrice(applied)}</span>
          </p>
          <p className="mt-1.5 flex items-center justify-between gap-3 text-foreground">
            <span className="font-semibold">{copy.subNetPrice}</span>
            <span className="text-lg font-extrabold tracking-[-0.02em]">{formatPrice(net)}</span>
          </p>
          <p className="mt-1 text-xs text-muted-soft">
            {copy.subWalletNote.replace("{amount}", formatPrice(credit))}
          </p>
        </div>
      ) : null}

      <Field
        label={copy.subContactPhone}
        name={`contact_phone_${menuId}`}
        type="tel"
        inputMode="tel"
        autoComplete="tel"
        placeholder={copy.subContactPhonePlaceholder}
        maxLength={PHONE_MASK_LENGTH}
        value={phone}
        errors={errors.contact_phone}
        onChange={(e) => setPhone(maskPhoneInput(e.target.value))}
      />

      {noteOpen ? (
        <div className="flex flex-col gap-1.5">
          <label htmlFor={`sub-note-${menuId}`} className="text-sm font-semibold text-foreground">
            {copy.subComment}
          </label>
          <textarea
            id={`sub-note-${menuId}`}
            rows={3}
            autoFocus
            placeholder={copy.subCommentPlaceholder}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full resize-y rounded-xl border border-border-strong bg-white px-4 py-3 text-base outline-none transition-colors placeholder:text-muted-soft focus:border-accent focus:ring-2 focus:ring-accent/25"
          />
          {errors.note ? <p className="text-sm text-red-600">{errors.note[0]}</p> : null}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setNoteOpen(true)}
          className="-mt-1 inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-muted transition-colors hover:text-accent-hover"
        >
          <Plus size={15} />
          {copy.subAddComment}
        </button>
      )}

      <div className="flex flex-col gap-2.5">
        <div className="flex flex-col-reverse gap-2 sm:flex-row">
          {onCancel ? (
            <Button type="button" variant="ghost" onClick={onCancel} className="h-12 py-0 sm:px-6">
              {copy.cancel}
            </Button>
          ) : null}
          <Button
            type="submit"
            variant="primary"
            disabled={mutation.isPending}
            className="h-12 flex-1 py-0"
          >
            {mutation.isPending
              ? copy.subRequestSending
              : chosen && net > 0
                ? `${copy.subRequestCta} · ${formatPrice(net)}`
                : copy.subRequestCta}
          </Button>
        </div>
        <p className="text-center text-[13px] leading-snug text-muted-soft">{copy.subNoChargeNote}</p>
      </div>
    </form>
  );
}

function PlanOption({
  plan,
  group,
  kz,
  copy,
  checked,
  onSelect,
}: {
  plan: Plan;
  group: string;
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
      className={`relative flex cursor-pointer flex-col gap-2 rounded-[16px] border-[1.5px] p-4 transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-accent/30 ${
        checked ? "border-accent bg-accent-soft/60" : "border-border-strong hover:border-accent-tint"
      }`}
    >
      {plan.is_featured ? (
        <span className="absolute -top-2.5 right-4 rounded-full bg-accent px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-[0.04em] text-white">
          {copy.subFeatured}
        </span>
      ) : null}

      <span className="flex items-start justify-between gap-3">
        <span className="flex items-start gap-3">
          <input type="radio" name={group} checked={checked} onChange={onSelect} className="sr-only" />
          {/* Custom radio — the native one can't take the theme colour cleanly. */}
          <span
            aria-hidden
            className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-[1.5px] transition-colors ${
              checked ? "border-accent bg-accent text-white" : "border-border-strong bg-white"
            }`}
          >
            {checked ? <Check size={12} strokeWidth={3.5} /> : null}
          </span>
          <span>
            <span className="block font-bold text-foreground">{name}</span>
            {tagline ? <span className="block text-sm text-muted-soft">{tagline}</span> : null}
          </span>
        </span>
        <span className="shrink-0 text-right">
          <span className="whitespace-nowrap text-lg font-extrabold tracking-[-0.02em]">{priceLabel}</span>
          {suffix ? <span className="text-sm text-muted-soft"> {suffix}</span> : null}
          {plan.discount_percent > 0 ? (
            <span className="mt-0.5 block text-xs font-semibold text-accent-hover">
              {plan.price !== plan.price_final ? (
                <s className="mr-1 font-normal text-muted-soft">{formatPrice(plan.price)}</s>
              ) : null}
              −{plan.discount_percent}%
            </span>
          ) : null}
        </span>
      </span>

      {features.length > 0 ? (
        <ul className="ml-8 flex flex-col gap-1">
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
