"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowUpRight,
  Clock,
  ExternalLink,
  Pencil,
  Plus,
  QrCode,
  Trash2,
  UtensilsCrossed,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { PanelLoadError } from "@/components/panel/PanelLoadError";
import { PanelPageHeader } from "@/components/panel/PanelPageHeader";
import { RowMenu } from "@/components/panel/RowMenu";
import { SubscribeDialog } from "@/components/panel/SubscribeDialog";
import { pickPlanName, useSubscriptionStatus } from "@/components/panel/SubscribeForm";
import { VenueDialog } from "@/components/panel/VenueDialog";
import { Button } from "@/components/landing/ui/Button";
import { authByLocale } from "@/content/auth";
import type { Locale } from "@/content/landing";
import { daysLeftPhrase, formatAccessDate } from "@/lib/access";
import { deleteEstablishment, type Establishment, type MenuSubscription } from "@/lib/api";
import { PUBLIC_MENU_HOST, VENUES_QUERY_KEY, publicMenuUrl, useVenues } from "@/lib/venues";

export function VenueList({ locale }: { locale: Locale }) {
  const copy = authByLocale[locale];
  const queryClient = useQueryClient();
  const { data: venues, isPending, isError, refetch, isFetching } = useVenues();
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

  const list = venues ?? [];

  return (
    <>
      <PanelPageHeader
        title={copy.venuesTitle}
        actions={
          <Button
            type="button"
            variant="primary"
            onClick={() => setDialog({ open: true })}
            className="h-11 px-4 py-0 text-[14.5px]"
          >
            <Plus size={18} strokeWidth={2.5} />
            {copy.venueAdd}
          </Button>
        }
      />

      {isPending ? (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {[0, 1].map((key) => (
            <div key={key} className="h-[236px] animate-pulse rounded-[20px] bg-surface-2" />
          ))}
        </div>
      ) : isError ? (
        // A failed load must not read as «no venues yet» — that invites a duplicate.
        <PanelLoadError locale={locale} onRetry={() => refetch()} retrying={isFetching} />
      ) : (
        <>
        {remove.isError ? (
          <p
            role="alert"
            className="mb-5 rounded-[16px] border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800"
          >
            {copy.networkError}
          </p>
        ) : null}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {list.map((venue) => (
            <article
              key={venue.id}
              // Dimmed while its delete is in flight, so the click visibly took.
              aria-busy={remove.isPending && remove.variables === venue.id}
              className={`flex flex-col rounded-[20px] border border-border bg-white shadow-[0_1px_2px_rgba(20,18,16,0.04)] transition-[box-shadow,opacity] hover:shadow-[0_18px_36px_-24px_rgba(20,18,16,0.35)] ${
                remove.isPending && remove.variables === venue.id ? "pointer-events-none opacity-50" : ""
              }`}
            >
              <div className="flex items-start gap-3 px-5 pt-5">
                <VenueMark />
                <div className="min-w-0 flex-1">
                  <h2 className="truncate text-[17px] font-extrabold tracking-[-0.02em]">
                    {venue.name}
                  </h2>
                  <a
                    href={publicMenuUrl(venue.slug)}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={copy.venueOpenGuest}
                    className="mt-0.5 inline-flex max-w-full items-center gap-1 text-[13px] text-muted-soft transition-colors hover:text-accent-hover hover:no-underline"
                  >
                    <span className="truncate">
                      {PUBLIC_MENU_HOST}/{venue.slug}
                    </span>
                    <ArrowUpRight size={13} className="shrink-0" />
                  </a>
                </div>
                {/* Rare actions stay out of the way; delete sits last, in red. */}
                <RowMenu
                  label={copy.venueEdit}
                  triggerClassName="-mr-1.5 -mt-1 h-9 w-9 rounded-[10px]"
                  items={[
                    {
                      label: copy.venueEdit,
                      icon: <Pencil size={16} />,
                      onClick: () => setDialog({ open: true, venue }),
                    },
                    {
                      label: copy.venueOpenGuest,
                      icon: <ExternalLink size={16} />,
                      onClick: () => window.open(publicMenuUrl(venue.slug), "_blank", "noopener"),
                    },
                    {
                      label: copy.venueDelete,
                      icon: <Trash2 size={16} />,
                      danger: true,
                      onClick: () => {
                        // Deleting takes the whole menu with it, so make them mean it.
                        if (window.confirm(copy.venueDeleteConfirm)) remove.mutate(venue.id);
                      },
                    },
                  ]}
                />
              </div>

              <div className="px-5">
                <PlanStrip
                  venue={venue}
                  menu={status?.menus.find((m) => m.id === venue.id)}
                  locale={locale}
                  copy={copy}
                  onSubscribe={() => setSubscribing(venue)}
                />
              </div>

              <div className="mt-auto grid grid-cols-2 gap-2 p-5 pt-4">
                <Button
                  variant="primary"
                  href={`/${locale}/dashboard/venues/${venue.id}/menu`}
                  className="h-11 px-3 py-0 text-[14.5px]"
                >
                  <UtensilsCrossed size={16} />
                  {copy.venueMenu}
                </Button>
                <Button
                  variant="secondary"
                  href={`/${locale}/dashboard/venues/${venue.id}/qr`}
                  className="h-11 px-3 py-0 text-[14.5px]"
                >
                  <QrCode size={16} />
                  {copy.qrOpen}
                </Button>
              </div>
            </article>
          ))}

          <button
            type="button"
            onClick={() => setDialog({ open: true })}
            className={`flex min-h-[132px] flex-col items-center justify-center gap-3 rounded-[20px] border border-dashed border-border-strong bg-white/50 p-6 text-center text-muted transition-colors hover:border-accent hover:bg-accent-soft/40 hover:text-accent-hover sm:min-h-[236px] ${
              list.length === 0 ? "sm:col-span-2 xl:col-span-3" : ""
            }`}
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-accent-soft text-accent-hover">
              <Plus size={24} />
            </span>
            <span className="text-[15px] font-bold">{copy.venueAdd}</span>
            {list.length === 0 ? (
              <span className="max-w-[340px] text-[14px] text-muted-soft">{copy.venuesEmpty}</span>
            ) : null}
          </button>
        </div>
        </>
      )}

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

/** The venue's square mark — shared by every cabinet list so venues read alike. */
export function VenueMark({ size = "md" }: { size?: "sm" | "md" }) {
  return (
    <span
      className={`flex shrink-0 items-center justify-center bg-accent-soft text-accent-hover ${
        size === "sm" ? "h-10 w-10 rounded-xl" : "h-11 w-11 rounded-[14px]"
      }`}
    >
      <UtensilsCrossed size={size === "sm" ? 17 : 19} />
    </span>
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
  const ends = formatAccessDate(venue.access_ends_at, locale, false);
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

/** What AccessBadge reads — a venue, or a menu row of the subscription status. */
export type AccessInfo = Pick<Establishment, "is_expired" | "access_source" | "days_left"> & {
  is_blocked?: boolean;
};

/**
 * Per-venue access window as a dotted pill. Expired venues 404 for guests, so
 * the owner needs a loud warning; trial/subscription show the countdown.
 * Grandfathered venues (access_source null — created before the limit) simply
 * show «no limit».
 */
export function AccessBadge({
  venue,
  locale,
  copy,
  inRow = false,
  compact = false,
}: {
  venue: AccessInfo;
  locale: Locale;
  copy: typeof authByLocale.ru;
  // `inRow` drops the top margin so the badge can sit inline in a list row
  // instead of stacking under the venue name (its default card use).
  inRow?: boolean;
  // `compact` drops the «Пробный период ·» prefix for tight spots (the
  // subscribe dialog's venue row), keeping just the countdown.
  compact?: boolean;
}) {
  let tone: "red" | "amber" | "green" | "gray";
  let text: string;
  let hint: string | undefined;

  // Checked first: a platform block wins over any access window.
  if (venue.is_blocked) {
    tone = "red";
    text = copy.accessBlocked;
    hint = copy.accessBlockedHint;
  } else if (venue.is_expired) {
    tone = "red";
    text = copy.accessExpired;
  } else if (venue.access_source === null || venue.days_left === null) {
    tone = "gray";
    text = copy.accessUnlimited;
  } else {
    const trial = venue.access_source === "trial";
    const days = daysLeftPhrase(venue.days_left, locale);
    tone = venue.days_left <= 3 ? "amber" : trial ? "amber" : "green";
    text = trial && !compact ? `${copy.accessTrial} · ${days}` : days;
  }

  const pill = {
    red: "bg-red-50 text-red-700 ring-red-200/70",
    amber: "bg-amber-50 text-amber-800 ring-amber-200/70",
    green: "bg-emerald-50 text-emerald-800 ring-emerald-200/70",
    gray: "bg-surface-2 text-muted ring-border-strong/60",
  }[tone];
  const dot = {
    red: "bg-red-500",
    amber: "bg-amber-500",
    green: "bg-emerald-500",
    gray: "bg-muted-soft/60",
  }[tone];

  return (
    <span
      title={hint}
      className={`${inRow ? "" : "mt-3 "}inline-flex w-fit shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[12.5px] font-semibold ring-1 ring-inset ${pill}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} aria-hidden />
      {text}
    </span>
  );
}
