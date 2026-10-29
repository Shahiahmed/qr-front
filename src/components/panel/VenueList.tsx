"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  Clock,
  FilePlus2,
  Pencil,
  QrCode,
  Sparkles,
  Trash2,
  UtensilsCrossed,
} from "lucide-react";
import { useState } from "react";
import { SubscribeDialog } from "@/components/panel/SubscribeDialog";
import { useSubscriptionStatus } from "@/components/panel/SubscribeForm";
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
 * The card's plan line: access badge plus a way to subscribe or renew right
 * here. Calm while there is time left; once the menu is down or ≤3 days from
 * it, it turns into a tinted call-out with a solid button. A request already
 * under review replaces the action, so nobody files a second one.
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
  // Blocked (platform decision) and grandfathered (no limit) venues have
  // nothing to buy; status not loaded yet — don't offer what may be pending.
  if (venue.is_blocked || (venue.access_source === null && !venue.is_expired) || !menu) {
    return <AccessBadge venue={venue} locale={locale} copy={copy} />;
  }

  if (menu.pending_request) {
    return (
      <span className="mt-3 inline-flex w-fit items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-[13px] font-semibold text-amber-700">
        <Clock size={14} />
        {copy.subPendingTitle}
      </span>
    );
  }

  const cta = venue.access_source === "subscription" ? copy.subExtend : copy.subSubscribeShort;
  const urgent = venue.is_expired || (venue.days_left !== null && venue.days_left <= 3);

  if (urgent) {
    const expired = venue.is_expired;
    return (
      // Stacked: a third-width card has no room for text and button side by side.
      <div className={`mt-4 rounded-[16px] p-3.5 ${expired ? "bg-red-50" : "bg-amber-50"}`}>
        <div className="flex items-start gap-2.5">
          <AlertTriangle
            size={18}
            className={`mt-px shrink-0 ${expired ? "text-red-600" : "text-amber-600"}`}
          />
          <div className="min-w-0 flex-1">
            <p className={`text-[13.5px] font-bold leading-tight ${expired ? "text-red-800" : "text-amber-900"}`}>
              {expired
                ? copy.renewExpiredTitle
                : venue.access_source === "trial"
                  ? copy.renewTrialEnding
                  : copy.renewSubEnding}
            </p>
            <p className={`mt-0.5 text-[12.5px] ${expired ? "text-red-700" : "text-amber-800"}`}>
              {expired ? copy.accessExpired : daysLeftPhrase(venue.days_left ?? 0, locale)}
            </p>
          </div>
        </div>
        <Button
          type="button"
          variant="primary"
          onClick={onSubscribe}
          className="mt-3 h-10 w-full py-0 text-[14px]"
        >
          {cta}
        </Button>
      </div>
    );
  }

  return (
    <div className="mt-3 flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
      <AccessBadge venue={venue} locale={locale} copy={copy} inRow />
      <button
        type="button"
        onClick={onSubscribe}
        className="inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[13px] font-semibold text-accent-hover transition-colors hover:bg-accent-soft"
      >
        <Sparkles size={14} />
        {cta}
      </button>
    </div>
  );
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
