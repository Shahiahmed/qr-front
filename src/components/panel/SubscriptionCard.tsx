"use client";

import { Clock } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/landing/ui/Button";
import {
  pickPlanName,
  SubscribeForm,
  useSubscriptionStatus,
} from "@/components/panel/SubscribeForm";
import { authByLocale } from "@/content/auth";
import type { Locale } from "@/content/landing";
import { daysLeftPhrase } from "@/lib/access";
import type { MenuSubscription } from "@/lib/api";
import { formatPrice } from "@/lib/money";

type Copy = typeof authByLocale.ru;

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

  const { data: status } = useSubscriptionStatus(locale);

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
        <MenuRow key={menu.id} menu={menu} copy={copy} locale={locale} kz={kz} />
      ))}
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
          <div className="mt-5">
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
            variant={activePlan ? "ghost" : "primary"}
            onClick={() => {
              setOpen(true);
              setSuccess(false);
            }}
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
