"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Clock, FilePlus2, Pencil, QrCode, Trash2, UtensilsCrossed } from "lucide-react";
import { useState, type ReactNode } from "react";
import { SubscribeDialog } from "@/components/panel/SubscribeDialog";
import { pickPlanName, useSubscriptionStatus } from "@/components/panel/SubscribeForm";
import { VenueDialog } from "@/components/panel/VenueDialog";
import { Button } from "@/components/landing/ui/Button";
import { authByLocale } from "@/content/auth";
import type { Locale } from "@/content/landing";
import { daysLeftPhrase } from "@/lib/access";
import { deleteEstablishment, type Establishment, type MenuSubscription } from "@/lib/api";
import { PUBLIC_MENU_HOST, VENUES_QUERY_KEY, useVenues } from "@/lib/venues";

export function VenueList({ locale }: { locale: Locale }) {
  const copy = authByLocale[locale];
  const queryClient = useQueryClient();
  const { data: venues, isPending } = useVenues();
  // Plan + pending request per venue, so each card can offer to subscribe or
  // renew in place. Until it loads the card just shows its access badge.
  const { data: status } = useSubscriptionStatus(locale);

  const [dialog, setDialog] = useState<{ open: boolean; venue?: Establishment }>({
    open: false,
  });
  const [subscribing, setSubscribing] = useState<Establishment | null>(null);

  const remove = useMutation({
    mutationFn: deleteEstablishment,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: VENUES_QUERY_KEY }),
  });

  if (isPending) {
    return (
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1].map((key) => (
          <div key={key} className="h-[190px] animate-pulse rounded-[20px] bg-surface-2" />
        ))}
      </div>
    );
  }

  const list = venues ?? [];

  return (
    <>
      {list.length === 0 ? (
        <p className="mb-5 text-[15px] text-muted">{copy.venuesEmpty}</p>
      ) : null}

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((venue) => (
          <article
            key={venue.id}
            className="flex flex-col rounded-[20px] border border-border bg-white p-5 shadow-[0_1px_2px_rgba(20,18,16,0.04)] transition-shadow hover:shadow-[0_14px_30px_-20px_rgba(20,18,16,0.28)]"
          >
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent-hover">
                <UtensilsCrossed size={18} />
              </span>
              <div className="min-w-0">
                <h3 className="truncate text-[17px] font-extrabold tracking-[-0.02em]">
                  {venue.name}
                </h3>
                <p className="mt-0.5 truncate text-[13px] text-muted-soft">
                  {PUBLIC_MENU_HOST}/{venue.slug}
                </p>
              </div>
            </div>

            <PlanStrip
              venue={venue}
              menu={status?.menus.find((m) => m.id === venue.id)}
              locale={locale}
              copy={copy}
              onSubscribe={() => setSubscribing(venue)}
            />

            <div className="mt-auto flex items-center gap-2 pt-5">
              <Button
                variant="primary"
                href={`/${locale}/dashboard/venues/${venue.id}/menu`}
                className="flex-1 py-2.5 text-[15px]"
              >
                {copy.venueMenu}
              </Button>

              <a
                href={`/${locale}/dashboard/venues/${venue.id}/qr`}
                aria-label={copy.qrOpen}
                title={copy.qrOpen}
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border-strong text-muted transition-colors hover:bg-surface-2 hover:text-foreground"
              >
                <QrCode size={16} />
              </a>

              <button
                type="button"
                aria-label={copy.venueEdit}
                title={copy.venueEdit}
                onClick={() => setDialog({ open: true, venue })}
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border-strong text-muted transition-colors hover:bg-surface-2 hover:text-foreground"
              >
                <Pencil size={16} />
              </button>

              <button
                type="button"
                aria-label={copy.venueDelete}
                title={copy.venueDelete}
                disabled={remove.isPending}
                onClick={() => {
                  // Deleting takes the whole menu with it, so make them mean it.
                  if (window.confirm(copy.venueDeleteConfirm)) remove.mutate(venue.id);
                }}
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border-strong text-muted transition-colors hover:border-red-300 hover:bg-red-50 hover:text-red-600"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </article>
        ))}

        <button
          type="button"
          onClick={() => setDialog({ open: true })}
          className="flex min-h-[190px] flex-col items-center justify-center gap-3 rounded-[20px] border border-dashed border-border-strong bg-white/60 p-5 text-muted transition-colors hover:border-accent hover:bg-accent-soft/40 hover:text-accent-hover"
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-accent-soft text-accent-hover">
            <FilePlus2 size={24} strokeWidth={1.75} />
          </span>
          <span className="text-[15px] font-semibold">{copy.venueAdd}</span>
        </button>
      </div>

      {dialog.open ? (
        <VenueDialog
          locale={locale}
          venue={dialog.venue}
          onClose={() => setDialog({ open: false })}
        />
      ) : null}

      {subscribing ? (
        <SubscribeDialog
          venue={subscribing}
          currentPlanId={
            status?.menus.find((m) => m.id === subscribing.id)?.subscription?.plan?.id ?? null
          }
          locale={locale}
          onClose={() => setSubscribing(null)}
        />
      ) : null}
    </>
  );
}

/**
 * The card's plan panel — the same shape in every state so a grid of venues
 * reads as one system: a status dot, what the menu runs on, how long it has,
 * and (when there is something to buy) one compact action on the right.
 * Calm on a neutral fill while time is left; amber at ≤3 days, red once the
 * menu is down — then the action turns solid. A request under review replaces
 * the action, so nobody files a second one.
 */
function PlanStrip({
  venue,
  menu,
  locale,
  copy,
  onSubscribe,
}: {
  venue: Establishment;
  menu: MenuSubscription | undefined;
  locale: Locale;
  copy: typeof authByLocale.ru;
  onSubscribe: () => void;
}) {
  const kz = locale === "kz";
  const pending = menu?.pending_request ?? null;
  const plan = menu?.subscription?.plan ?? null;
  const ends = formatShortDate(venue.access_ends_at, locale);
  const daysLine = venue.days_left !== null ? daysLeftPhrase(venue.days_left, locale) : "";

  type Tone = "neutral" | "warn" | "danger";
  let tone: Tone = "neutral";
  let title: string;
  let detail = "";
  // The exact end date is a hover hint — the card is too narrow to carry it.
  let hint: string | undefined;
  let icon: ReactNode = null;
  // Nothing to buy for blocked (platform decision) or grandfathered venues,
  // and nothing to offer until the status (pending or not) has loaded.
  let canAct = Boolean(menu) && !venue.is_blocked && !pending;

  if (venue.is_blocked) {
    tone = "danger";
    title = copy.accessBlocked;
    detail = copy.renewBlockedDetail;
  } else if (pending) {
    tone = "warn";
    title = copy.subPendingTitle;
    detail = pending.plan ? pickPlanName(pending.plan, kz) : "";
    icon = <Clock size={15} className="shrink-0 text-amber-600" />;
  } else if (venue.is_expired) {
    tone = "danger";
    title = copy.accessExpired;
    detail = copy.renewExpiredTitle;
  } else if (venue.access_source === null) {
    title = copy.accessUnlimited;
    canAct = false;
  } else {
    title =
      venue.access_source === "trial"
        ? copy.accessTrial
        : plan
          ? pickPlanName(plan, kz)
          : copy.subTitle;
    detail = daysLine;
    // «до 5 нояб.» vs «5 қар. дейін» — Kazakh puts the postposition last.
    if (ends) hint = kz ? `${ends} ${copy.renewUntil}` : `${copy.renewUntil} ${ends}`;
    if (venue.days_left !== null && venue.days_left <= 3) tone = "warn";
    // A paid plan with months to go has nothing to renew yet — the button
    // only shows up in the last month. A trial always offers to subscribe.
    if (
      venue.access_source === "subscription" &&
      venue.days_left !== null &&
      venue.days_left > RENEW_WINDOW_DAYS
    ) {
      canAct = false;
    }
  }

  const cta = venue.access_source === "subscription" ? copy.subExtend : copy.subSubscribeShort;

  const box = {
    neutral: "border-border bg-surface",
    warn: "border-amber-200/70 bg-amber-50",
    danger: "border-red-200/70 bg-red-50",
  }[tone];
  const dot = {
    neutral: venue.access_source === "trial" ? "bg-amber-400" : "bg-emerald-500",
    warn: "bg-amber-500",
    danger: "bg-red-500",
  }[tone];
  const detailColor = {
    neutral: "text-muted-soft",
    warn: "text-amber-800",
    danger: "text-red-700",
  }[tone];

  return (
    <div className={`mt-4 flex items-center gap-3 rounded-[14px] border px-3.5 py-3 ${box}`}>
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-2 text-[14px] font-bold leading-tight text-foreground">
          {icon ?? (
            <span className={`h-2 w-2 shrink-0 rounded-full ${dot}`} aria-hidden />
          )}
          <span className="truncate">{title}</span>
        </p>
        {detail ? (
          <p
            title={hint}
            className={`mt-1 text-[12.5px] leading-snug ${icon ? "pl-5.75" : "pl-4"} ${detailColor}`}
          >
            {detail}
          </p>
        ) : null}
      </div>
      {canAct ? (
        <Button
          type="button"
          variant={tone === "neutral" ? "secondary" : "primary"}
          onClick={onSubscribe}
          className="h-9 shrink-0 px-4 py-0 text-[13.5px]"
        >
          {cta}
        </Button>
      ) : null}
    </div>
  );
}

/** How close to the end a paid plan gets before the card offers «Продлить». */
const RENEW_WINDOW_DAYS = 30;

/** «5 нояб.» — compact end date for the plan panel; empty when unknown. */
function formatShortDate(iso: string | null, locale: Locale): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat(locale === "kz" ? "kk-KZ" : "ru-RU", {
    day: "numeric",
    month: "short",
  }).format(date);
}

/**
 * Per-venue access window. Expired venues 404 for guests, so the owner needs
 * a loud warning; trial/subscription show the countdown. Grandfathered venues
 * (access_source null — created before the limit) simply show «no limit».
 */
export function AccessBadge({
  venue,
  locale,
  copy,
  inRow = false,
  compact = false,
}: {
  venue: Establishment;
  locale: Locale;
  copy: typeof authByLocale.ru;
  // `inRow` drops the top margin so the badge can sit inline in a list row
  // instead of stacking under the venue name (its default card use).
  inRow?: boolean;
  // `compact` drops the «Пробный период ·» prefix for tight spots (the
  // subscribe dialog's venue row), keeping just the countdown.
  compact?: boolean;
}) {
  const gap = inRow ? "" : "mt-3 ";

  // Checked first: a platform block wins over any access window.
  if (venue.is_blocked) {
    return (
      <span
        title={copy.accessBlockedHint}
        className={`${gap}inline-flex w-fit items-center rounded-full bg-red-50 px-3 py-1 text-[13px] font-semibold text-red-600`}
      >
        {copy.accessBlocked}
      </span>
    );
  }

  if (venue.is_expired) {
    return (
      <span className={`${gap}inline-flex w-fit items-center rounded-full bg-red-50 px-3 py-1 text-[13px] font-semibold text-red-600`}>
        {copy.accessExpired}
      </span>
    );
  }

  if (venue.access_source === null || venue.days_left === null) {
    return (
      <span className={`${gap}inline-flex w-fit items-center rounded-full bg-surface-2 px-3 py-1 text-[13px] font-semibold text-muted`}>
        {copy.accessUnlimited}
      </span>
    );
  }

  const trial = venue.access_source === "trial";
  const text = trial && !compact
    ? `${copy.accessTrial} · ${daysLeftPhrase(venue.days_left, locale)}`
    : daysLeftPhrase(venue.days_left, locale);

  return (
    <span
      className={`${gap}inline-flex w-fit items-center rounded-full px-3 py-1 text-[13px] font-semibold ${
        trial ? "bg-amber-50 text-amber-700" : "bg-accent-soft text-accent-hover"
      }`}
    >
      {text}
    </span>
  );
}
