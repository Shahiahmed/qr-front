"use client";

import { useQuery } from "@tanstack/react-query";
import {
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  ChevronRight,
  Clock,
  Gift,
  LayoutList,
  MessageCircle,
  Plus,
  QrCode,
} from "lucide-react";
import Link from "next/link";
import { useState, type ComponentType } from "react";
import { Button } from "@/components/landing/ui/Button";
import { PanelPageHeader } from "@/components/panel/PanelPageHeader";
import { SubscribeDialog } from "@/components/panel/SubscribeDialog";
import { useSubscriptionStatus } from "@/components/panel/SubscribeForm";
import { AccessBadge, VenueMark } from "@/components/panel/VenueList";
import { authByLocale } from "@/content/auth";
import { WHATSAPP_NUMBER, type Locale } from "@/content/landing";
import { getReferral, type Establishment } from "@/lib/api";
import { formatPrice } from "@/lib/money";
import { useAuth } from "@/lib/useAuth";
import { PUBLIC_MENU_HOST, useVenues } from "@/lib/venues";

type Copy = typeof authByLocale.ru;

/**
 * Cabinet home. Answers three questions at a glance: is anything about to go
 * dark (the attention card, with the fix one tap away), how the venues stand
 * (stat cards + a compact list), and where to get more (referral, help). The
 * full CRUD stays on the «Заведения» page.
 */
export function DashboardOverview({ locale }: { locale: Locale }) {
  const copy = authByLocale[locale];
  const { user } = useAuth();
  const { data: venues, isPending } = useVenues();
  const { data: status } = useSubscriptionStatus(locale);
  const { data: referral } = useQuery({
    queryKey: ["referral"],
    queryFn: () => getReferral(locale),
  });
  const [subscribing, setSubscribing] = useState<Establishment | null>(null);

  const list = venues ?? [];
  const total = list.length;
  const active = list.filter((v) => !v.is_expired && !v.is_blocked).length;
  // Expired menus already 404 for guests; a trial/plan within 3 days is the
  // last moment to act — both belong under one «needs attention» heading.
  const attention = list.filter(
    (v) => !v.is_blocked && (v.is_expired || (v.days_left !== null && v.days_left <= 3)),
  );

  const firstName = user?.name?.trim().split(/\s+/)[0];
  const title = firstName ? copy.overviewHello.replace("{name}", firstName) : copy.overviewWelcome;

  const stats: { label: string; value: number; icon: ComponentType<{ size?: number }>; tone: string }[] = [
    { label: copy.statVenues, value: total, icon: LayoutList, tone: "bg-accent-soft text-accent-hover" },
    { label: copy.statActive, value: active, icon: CheckCircle2, tone: "bg-emerald-50 text-emerald-700" },
    {
      label: copy.statAttention,
      value: attention.length,
      icon: AlertTriangle,
      // Only runs warm when there is something to do — a calm cabinet
      // shouldn't shout amber when nothing is wrong.
      tone: attention.length > 0 ? "bg-amber-50 text-amber-700" : "bg-surface-2 text-muted-soft",
    },
  ];

  return (
    <div>
      <PanelPageHeader title={title} subtitle={copy.overviewSubtitle} />

      {/* Stat cards. */}
      {isPending ? (
        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          {[0, 1, 2].map((k) => (
            <div key={k} className="h-[112px] animate-pulse rounded-[18px] bg-surface-2" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          {stats.map(({ label, value, icon: Icon, tone }) => (
            <div
              key={label}
              className="rounded-[18px] border border-border bg-white p-3.5 shadow-[0_1px_2px_rgba(20,18,16,0.03)] sm:p-5"
            >
              <span className={`flex h-9 w-9 items-center justify-center rounded-[11px] ${tone}`}>
                <Icon size={18} />
              </span>
              <p className="mt-3 text-[26px] font-extrabold leading-none tracking-[-0.03em] sm:mt-4 sm:text-[32px]">
                {value}
              </p>
              <p className="mt-1.5 text-[12px] font-semibold leading-tight text-muted-soft sm:text-[13.5px]">
                {label}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Menus about to close / closed — with the fix right there. */}
      {attention.length > 0 ? (
        <section className="mt-6 overflow-hidden rounded-[20px] border border-amber-200/80 bg-amber-50/60">
          <div className="flex items-start gap-3 px-4 pb-3 pt-4 sm:px-5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[11px] bg-amber-100 text-amber-700">
              <AlertTriangle size={18} />
            </span>
            <div className="min-w-0">
              <h2 className="text-[16px] font-extrabold tracking-[-0.02em] text-amber-950">
                {copy.statAttention}
              </h2>
              <p className="mt-0.5 text-[13.5px] text-amber-900/80">{copy.overviewAttentionHint}</p>
            </div>
          </div>
          <ul className="divide-y divide-amber-200/60 border-t border-amber-200/60 bg-white/70">
            {attention.map((venue) => {
              const pending = status?.menus.find((m) => m.id === venue.id)?.pending_request;
              return (
                <li key={venue.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3 sm:px-5">
                  <span className="min-w-0 flex-1 basis-40 truncate text-[15px] font-bold">
                    {venue.name}
                  </span>
                  <AccessBadge venue={venue} locale={locale} copy={copy} inRow />
                  {pending ? (
                    <span className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-amber-800">
                      <Clock size={14} />
                      {copy.subPendingTitle}
                    </span>
                  ) : (
                    <Button
                      type="button"
                      variant="primary"
                      disabled={!status}
                      onClick={() => setSubscribing(venue)}
                      className="h-9 px-4 py-0 text-[13.5px]"
                    >
                      {venue.access_source === "subscription" ? copy.subExtend : copy.subSubscribeShort}
                    </Button>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}

      <div className="mt-8 grid grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        {/* Venues snapshot — a compact list; each row opens the menu editor. */}
        <section>
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-[17px] font-extrabold tracking-[-0.02em]">
              {copy.overviewVenuesTitle}
            </h2>
            {total > 0 ? (
              <Link
                href={`/${locale}/dashboard/venues`}
                className="inline-flex items-center gap-1 text-[13.5px] font-semibold text-muted transition-colors hover:text-accent-hover hover:no-underline"
              >
                {copy.overviewSeeAll}
                <ArrowRight size={15} />
              </Link>
            ) : null}
          </div>

          {isPending ? (
            <div className="overflow-hidden rounded-[20px] border border-border bg-white">
              {[0, 1, 2].map((k) => (
                <div key={k} className="flex items-center gap-4 border-b border-border px-5 py-4 last:border-b-0">
                  <div className="h-10 w-10 shrink-0 animate-pulse rounded-xl bg-surface-2" />
                  <div className="h-4 flex-1 animate-pulse rounded bg-surface-2" />
                </div>
              ))}
            </div>
          ) : total === 0 ? (
            <Link
              href={`/${locale}/dashboard/venues`}
              className="flex min-h-[200px] flex-col items-center justify-center gap-3 rounded-[20px] border border-dashed border-border-strong bg-white/60 p-6 text-center text-muted transition-colors hover:border-accent hover:bg-accent-soft/40 hover:text-accent-hover hover:no-underline"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-accent-soft text-accent-hover">
                <Plus size={24} />
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
                      {/* Phones: the status drops under the name. */}
                      <span className="mt-1.5 block sm:hidden">
                        <AccessBadge venue={venue} locale={locale} copy={copy} inRow />
                      </span>
                    </span>
                    <span className="hidden sm:block">
                      <AccessBadge venue={venue} locale={locale} copy={copy} inRow />
                    </span>
                    <ChevronRight
                      size={18}
                      className="shrink-0 text-muted-soft/60 transition-transform group-hover:translate-x-0.5 group-hover:text-accent-hover"
                    />
                  </Link>
                  <Link
                    href={`/${locale}/dashboard/venues/${venue.id}/qr`}
                    aria-label={copy.qrOpen}
                    title={copy.qrOpen}
                    className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] border border-border-strong text-muted transition-colors hover:bg-surface-2 hover:text-foreground"
                  >
                    <QrCode size={17} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <aside className="flex flex-col gap-4">
          {referral?.enabled ? <ReferralPromo locale={locale} copy={copy} reward={referral.referrer_reward} /> : null}
          <HelpCard copy={copy} />
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

function ReferralPromo({ locale, copy, reward }: { locale: Locale; copy: Copy; reward: number }) {
  return (
    <Link
      href={`/${locale}/dashboard/referral`}
      className="group relative overflow-hidden rounded-[20px] bg-[linear-gradient(140deg,#d2401a_0%,#a8330f_100%)] p-5 text-white transition-shadow hover:no-underline hover:shadow-[0_18px_36px_-20px_rgba(168,51,15,0.7)]"
    >
      {/* Soft glow so the card isn't a flat slab of brand colour. */}
      <span
        aria-hidden
        className="pointer-events-none absolute -right-10 -top-12 h-40 w-40 rounded-full bg-white/10 blur-2xl"
      />
      <div className="relative flex items-start justify-between gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-white/15">
          <Gift size={20} />
        </span>
        <ArrowUpRight
          size={20}
          className="text-white/70 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-white"
        />
      </div>
      <p className="relative mt-4 text-[17px] font-extrabold tracking-[-0.02em]">{copy.tabReferral}</p>
      <p className="relative mt-1 text-[14px] leading-relaxed text-white/85">
        {copy.overviewRefText.replace("{amount}", formatPrice(reward))}
      </p>
    </Link>
  );
}

function HelpCard({ copy }: { copy: Copy }) {
  return (
    <div className="rounded-[20px] border border-border bg-white p-5 shadow-[0_1px_2px_rgba(20,18,16,0.03)]">
      <span className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-emerald-50 text-emerald-700">
        <MessageCircle size={20} />
      </span>
      <p className="mt-4 text-[16px] font-extrabold tracking-[-0.02em]">{copy.overviewHelpTitle}</p>
      <p className="mt-1 text-[14px] leading-relaxed text-muted">{copy.overviewHelpText}</p>
      <a
        href={`https://wa.me/${WHATSAPP_NUMBER}`}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 inline-flex h-10 items-center gap-2 rounded-[12px] bg-[#25D366] px-4 text-[14px] font-bold text-white transition-opacity hover:no-underline hover:opacity-90"
      >
        <MessageCircle size={16} />
        {copy.overviewHelpCta}
      </a>
    </div>
  );
}
