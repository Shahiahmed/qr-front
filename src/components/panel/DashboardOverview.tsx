"use client";

import { useQuery } from "@tanstack/react-query";
import {
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  ChevronRight,
  Clock,
  Gift,
  Loader2,
  MessageCircle,
  Plus,
  QrCode,
  RotateCw,
  Send,
  UtensilsCrossed,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/landing/ui/Button";
import { PanelPageHeader } from "@/components/panel/PanelPageHeader";
import { SubscribeDialog } from "@/components/panel/SubscribeDialog";
import { useSubscriptionStatus } from "@/components/panel/SubscribeForm";
import { AccessBadge, VenueMark } from "@/components/panel/VenueList";
import { authByLocale } from "@/content/auth";
import { WHATSAPP_NUMBER, type Locale } from "@/content/landing";
import { formatAccessDate } from "@/lib/access";
import { getReferral, type Establishment } from "@/lib/api";
import { formatPrice } from "@/lib/money";
import { useAuth } from "@/lib/useAuth";
import { PUBLIC_MENU_HOST, useVenues } from "@/lib/venues";

type Copy = typeof authByLocale.ru;

const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}`;

/** Russian plural pick (1 блюдо / 2 блюда / 5 блюд); Kazakh repeats one form. */
function plural(n: number, [one, few, many]: readonly [string, string, string]): string {
  const m10 = n % 10;
  const m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return one;
  if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return few;
  return many;
}

/**
 * Cabinet home. Answers three questions at a glance: is anything about to go
 * dark (the attention card, with the fix one tap away), how each venue stands
 * (a status line plus per-venue readiness: dishes, Telegram), and where to get
 * help. The full CRUD stays on the «Заведения» page.
 */
export function DashboardOverview({ locale }: { locale: Locale }) {
  const copy = authByLocale[locale];
  const { user } = useAuth();
  const { data: venues, isPending, isError, refetch, isFetching } = useVenues();
  const { data: status } = useSubscriptionStatus(locale);
  const { data: referral } = useQuery({
    queryKey: ["referral"],
    queryFn: () => getReferral(locale),
  });
  const [subscribing, setSubscribing] = useState<Establishment | null>(null);

  const list = venues ?? [];
  const total = list.length;
  const active = list.filter((v) => !v.is_expired && !v.is_blocked).length;
  // Expired and blocked menus already fail for guests; a trial/plan within
  // 3 days is the last moment to act — all belong under one heading.
  const attention = list.filter(
    (v) => v.is_blocked || v.is_expired || (v.days_left !== null && v.days_left <= 3),
  );
  // Red once a menu is actually closed; amber while it is only closing soon.
  const urgent = attention.some((v) => v.is_blocked || v.is_expired);

  const firstName = user?.name?.trim().split(/\s+/)[0];
  const title = firstName ? copy.overviewHello.replace("{name}", firstName) : copy.overviewWelcome;

  return (
    <div>
      <PanelPageHeader title={title} subtitle={copy.overviewSubtitle} />


      {/* Menus closed / closing — with the fix right there. */}
      {attention.length > 0 ? (
        <section
          className={`overflow-hidden rounded-[20px] border ${
            urgent ? "border-red-200 bg-red-50" : "border-amber-300 bg-amber-50"
          }`}
        >
          <div className="flex items-start gap-3 px-4 pb-3 pt-4 sm:px-5">
            <span
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-[11px] ${
                urgent ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-800"
              }`}
            >
              <AlertTriangle size={18} aria-hidden />
            </span>
            <div className="min-w-0">
              <h2
                className={`text-[16px] font-extrabold tracking-[-0.02em] ${
                  urgent ? "text-red-950" : "text-amber-950"
                }`}
              >
                {copy.statAttention}
              </h2>
              <p className={`mt-0.5 text-[14px] ${urgent ? "text-red-900" : "text-amber-900"}`}>
                {copy.overviewAttentionHint}
              </p>
            </div>
          </div>
          <ul
            className={`divide-y border-t bg-white ${
              urgent ? "divide-red-100 border-red-200" : "divide-amber-100 border-amber-200"
            }`}
          >
            {attention.map((venue) => (
              <AttentionRow
                key={venue.id}
                venue={venue}
                locale={locale}
                copy={copy}
                pending={Boolean(status?.menus.find((m) => m.id === venue.id)?.pending_request)}
                statusLoaded={Boolean(status)}
                onSubscribe={() => setSubscribing(venue)}
              />
            ))}
          </ul>
        </section>
      ) : null}

      <div
        className={`grid grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,1fr)_340px] ${
          attention.length > 0 ? "mt-8" : ""
        }`}
      >
        {/* Venues snapshot — a compact list; each row opens the menu editor. */}
        <section aria-labelledby="overview-venues">
          <div className="mb-3 flex items-end justify-between gap-3">
            <div className="min-w-0">
              <h2 id="overview-venues" className="text-[17px] font-extrabold tracking-[-0.02em]">
                {copy.overviewVenuesTitle}
              </h2>
              {!isPending && !isError && total > 0 ? (
                <p className="mt-0.5 text-[13.5px] text-muted-soft">
                  {attention.length === 0
                    ? copy.overviewSumAllGood
                    : `${copy.overviewSumActive.replace("{n}", String(active))} · ${copy.overviewSumAttention.replace(
                        "{n}",
                        String(attention.length),
                      )}`}
                </p>
              ) : null}
            </div>
            {total > 0 ? (
              <Link
                href={`/${locale}/dashboard/venues`}
                className="inline-flex shrink-0 items-center gap-1 text-[13.5px] font-semibold text-muted transition-colors hover:text-accent-hover hover:no-underline"
              >
                {copy.overviewSeeAll}
                <ArrowRight size={15} aria-hidden />
              </Link>
            ) : null}
          </div>

          {isPending ? (
            <div
              aria-busy="true"
              className="overflow-hidden rounded-[20px] border border-border bg-white"
            >
              {[0, 1, 2].map((k) => (
                <div key={k} className="flex items-center gap-4 border-b border-border px-5 py-4 last:border-b-0">
                  <div className="h-10 w-10 shrink-0 animate-pulse rounded-xl bg-surface-2" />
                  <div className="h-4 flex-1 animate-pulse rounded bg-surface-2" />
                </div>
              ))}
            </div>
          ) : isError ? (
        <div
          role="alert"
          className="flex flex-col items-start gap-4 rounded-[20px] border border-red-200 bg-red-50 p-5 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[11px] bg-red-100 text-red-700">
              <AlertTriangle size={18} aria-hidden />
            </span>
            <div>
              <p className="text-[16px] font-extrabold tracking-[-0.02em] text-red-950">
                {copy.overviewLoadError}
              </p>
              <p className="mt-0.5 text-[14px] text-red-900">{copy.overviewLoadErrorHint}</p>
            </div>
          </div>
          <Button
            type="button"
            variant="secondary"
            onClick={() => refetch()}
            disabled={isFetching}
            className="h-11 px-5 py-0 text-[14px]"
          >
            {isFetching ? (
              <Loader2 size={16} className="animate-spin" aria-hidden />
            ) : (
              <RotateCw size={16} aria-hidden />
            )}
            {copy.overviewRetry}
          </Button>
        </div>
          ) : total === 0 ? (
            <Link
              href={`/${locale}/dashboard/venues`}
              className="flex min-h-[200px] flex-col items-center justify-center gap-3 rounded-[20px] border border-dashed border-border-strong bg-white/60 p-6 text-center text-muted transition-colors hover:border-accent hover:bg-accent-soft/40 hover:text-accent-hover hover:no-underline"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-accent-soft text-accent-hover">
                <Plus size={24} aria-hidden />
              </span>
              <span className="text-[15px] font-bold">{copy.venueAdd}</span>
              <span className="max-w-[320px] text-[14px] text-muted-soft">{copy.venuesEmpty}</span>
            </Link>
          ) : (
            <ul className="divide-y divide-border overflow-hidden rounded-[20px] border border-border bg-white shadow-[0_1px_2px_rgba(20,18,16,0.03)]">
              {list.map((venue) => (
                <li key={venue.id} className="flex items-center gap-2 pr-3 sm:pr-4">
                  <Link
                    href={`/${locale}/dashboard/venues/${venue.id}/menu`}
                    className="group flex min-w-0 flex-1 items-center gap-3 py-3.5 pl-4 transition-colors hover:no-underline sm:gap-4 sm:pl-5"
                  >
                    <VenueMark size="sm" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[15px] font-bold tracking-[-0.01em] text-foreground transition-colors group-hover:text-accent-hover">
                        {venue.name}
                      </span>
                      <span className="mt-0.5 block truncate text-[12.5px] text-muted-soft">
                        {PUBLIC_MENU_HOST}/{venue.slug}
                      </span>
                      <span className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1.5">
                        {/* Phones: the access status sits with the readiness line. */}
                        <span className="sm:hidden">
                          <AccessBadge venue={venue} locale={locale} copy={copy} inRow />
                        </span>
                        <Readiness venue={venue} copy={copy} />
                      </span>
                    </span>
                    <span className="hidden sm:block">
                      <AccessBadge venue={venue} locale={locale} copy={copy} inRow />
                    </span>
                    <ChevronRight
                      size={18}
                      aria-hidden
                      className="shrink-0 text-muted-soft/60 transition-transform group-hover:translate-x-0.5 group-hover:text-accent-hover"
                    />
                  </Link>
                  <Link
                    href={`/${locale}/dashboard/venues/${venue.id}/qr`}
                    aria-label={`${copy.qrOpen}: ${venue.name}`}
                    title={copy.qrOpen}
                    className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-[12px] border border-border-strong text-muted transition-colors hover:bg-surface-2 hover:text-foreground"
                  >
                    <QrCode size={17} aria-hidden />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Help first: the referral card arrives after its own request, and
            appending it below keeps the help card from jumping. */}
        <aside className="flex flex-col gap-4">
          <HelpCard copy={copy} />
          {referral?.enabled ? <ReferralPromo locale={locale} copy={copy} reward={referral.referrer_reward} /> : null}
        </aside>
      </div>

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
    </div>
  );
}

/**
 * One venue that needs action: what guests experience now (in words, with the
 * date) and the single fix. A platform block can't be bought off — it routes
 * to support instead of the subscribe dialog.
 */
function AttentionRow({
  venue,
  locale,
  copy,
  pending,
  statusLoaded,
  onSubscribe,
}: {
  venue: Establishment;
  locale: Locale;
  copy: Copy;
  pending: boolean;
  statusLoaded: boolean;
  onSubscribe: () => void;
}) {
  const date = formatAccessDate(venue.access_ends_at, locale, false);
  const line = venue.is_blocked
    ? copy.accessBlockedHint
    : venue.is_expired
      ? copy.overviewExpiredLine.replace("{date}", date)
      : copy.overviewSoonLine.replace("{date}", date);
  const label = venue.access_source === "subscription" ? copy.overviewExtendCta : copy.overviewSubscribeCta;
  const cta = "h-11 shrink-0 px-5 py-0 text-[14px]";

  return (
    <li className="flex flex-wrap items-center gap-x-4 gap-y-3 px-4 py-3.5 sm:px-5">
      <div className="min-w-0 flex-1 basis-56">
        <p className="truncate text-[15px] font-bold">{venue.name}</p>
        <p
          className={`mt-0.5 text-[13.5px] ${
            venue.is_blocked || venue.is_expired ? "text-red-800" : "text-amber-900"
          }`}
        >
          {line}
        </p>
      </div>
      {venue.is_blocked ? (
        <Button href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" variant="secondary" className={cta}>
          {copy.overviewContactCta}
        </Button>
      ) : pending ? (
        <span className="inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-amber-900">
          <Clock size={14} aria-hidden />
          {copy.subPendingTitle}
        </span>
      ) : statusLoaded ? (
        <Button type="button" variant="primary" onClick={onSubscribe} className={cta}>
          {label}
        </Button>
      ) : (
        // Subscription status didn't load — the dialog needs it, so send the
        // owner to the subscription page rather than show a dead button.
        <Button href={`/${locale}/dashboard/subscription`} variant="primary" className={cta}>
          {label}
        </Button>
      )}
    </li>
  );
}

/** «12 блюд · Telegram подключён» — what's left to set up for a venue. */
function Readiness({ venue, copy }: { venue: Establishment; copy: Copy }) {
  const dishes = venue.dishes_count;
  return (
    <span className="inline-flex flex-wrap items-center gap-x-3 gap-y-1 text-[12.5px] font-semibold">
      {dishes !== undefined ? (
        <span
          className={`inline-flex items-center gap-1 ${dishes === 0 ? "text-amber-800" : "text-muted-soft"}`}
        >
          <UtensilsCrossed size={13} aria-hidden />
          {dishes === 0 ? copy.overviewMenuEmpty : `${dishes} ${plural(dishes, copy.overviewDishesForms)}`}
        </span>
      ) : null}
      <span
        className={`inline-flex items-center gap-1 ${
          venue.telegram_connected ? "text-emerald-800" : "text-muted-soft"
        }`}
      >
        <Send size={13} aria-hidden />
        {venue.telegram_connected ? copy.overviewTgOn : copy.overviewTgOff}
      </span>
    </span>
  );
}

function ReferralPromo({ locale, copy, reward }: { locale: Locale; copy: Copy; reward: number }) {
  return (
    <Link
      href={`/${locale}/dashboard/referral`}
      className="group rounded-[20px] border border-accent-tint bg-accent-soft p-5 text-foreground transition-colors hover:border-accent hover:no-underline"
    >
      <div className="flex items-start justify-between gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-white text-accent-hover">
          <Gift size={20} aria-hidden />
        </span>
        <ArrowUpRight
          size={20}
          aria-hidden
          className="text-accent-hover transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
        />
      </div>
      <p className="mt-4 text-[16px] font-extrabold tracking-[-0.02em]">{copy.tabReferral}</p>
      <p className="mt-1 text-[14px] leading-relaxed text-muted">
        {copy.overviewRefText.replace("{amount}", formatPrice(reward))}
      </p>
    </Link>
  );
}

function HelpCard({ copy }: { copy: Copy }) {
  return (
    <div className="rounded-[20px] border border-border bg-white p-5 shadow-[0_1px_2px_rgba(20,18,16,0.03)]">
      <span className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-emerald-50 text-emerald-700">
        <MessageCircle size={20} aria-hidden />
      </span>
      <p className="mt-4 text-[16px] font-extrabold tracking-[-0.02em]">{copy.overviewHelpTitle}</p>
      <p className="mt-1 text-[14px] leading-relaxed text-muted">{copy.overviewHelpText}</p>
      {/* Emerald-700, not WhatsApp's #25D366: white text needs ≥4.5:1. */}
      <a
        href={WHATSAPP_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 inline-flex h-11 items-center gap-2 rounded-[12px] bg-emerald-700 px-4 text-[14px] font-bold text-white transition-colors hover:bg-emerald-800 hover:no-underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
      >
        <MessageCircle size={16} aria-hidden />
        {copy.overviewHelpCta}
      </a>
    </div>
  );
}
