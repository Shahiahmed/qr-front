"use client";

import { ArrowRight, Plus, QrCode, UtensilsCrossed } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/landing/ui/Button";
import { AccessBadge } from "@/components/panel/VenueList";
import { authByLocale } from "@/content/auth";
import type { Locale } from "@/content/landing";
import { useAuth } from "@/lib/useAuth";
import { PUBLIC_MENU_HOST, useVenues } from "@/lib/venues";

/**
 * Cabinet home. A calm, read-only snapshot — a single stat strip and a compact
 * venue list — while the full CRUD stays on the «Заведения» page. Built to
 * grow: more stat cells / sections drop in as orders, analytics and tables
 * features land.
 */
export function DashboardOverview({ locale }: { locale: Locale }) {
  const copy = authByLocale[locale];
  const { user } = useAuth();
  const { data: venues, isPending } = useVenues();

  const list = venues ?? [];
  const total = list.length;
  const active = list.filter((v) => !v.is_expired).length;
  // Expired menus already 404 for guests; a trial/plan within 3 days is the
  // last moment to act — both belong under one «needs attention» number.
  const attention = list.filter(
    (v) => v.is_expired || (v.days_left !== null && v.days_left <= 3),
  ).length;

  const stats = [
    { label: copy.statVenues, value: total, alarm: false },
    { label: copy.statActive, value: active, alarm: false },
    // Only the attention figure runs warm, and only when it is non-zero —
    // a calm dashboard shouldn't shout amber when nothing is wrong.
    { label: copy.statAttention, value: attention, alarm: attention > 0 },
  ];

  return (
    <div>
      <header className="mb-8 border-b border-border pb-6">
        <span className="text-[12px] font-semibold uppercase tracking-[0.14em] text-muted-soft">
          {copy.overviewTitle}
        </span>
        <h1 className="mt-1.5 text-[27px] font-extrabold leading-tight tracking-[-0.03em] sm:text-[30px]">
          {copy.overviewWelcome}
        </h1>
        {user ? (
          <p className="mt-1 truncate text-[14px] text-muted-soft" title={user.email}>
            {user.email}
          </p>
        ) : null}
      </header>

      {/* Stat strip — one card, three cells split by hairlines. */}
      {isPending ? (
        <div className="h-[96px] animate-pulse rounded-2xl bg-surface-2" />
      ) : (
        <div className="grid grid-cols-3 divide-x divide-border rounded-2xl border border-border bg-white shadow-[0_1px_2px_rgba(20,18,16,0.03)]">
          {stats.map(({ label, value, alarm }) => (
            <div key={label} className="px-3 py-5 sm:px-6">
              <div className="flex items-center gap-1.5">
                <span
                  className={`text-[30px] font-extrabold leading-none tracking-[-0.03em] sm:text-[34px] ${
                    alarm ? "text-amber-600" : "text-foreground"
                  }`}
                >
                  {value}
                </span>
                {alarm ? <span className="h-2 w-2 rounded-full bg-amber-500" /> : null}
              </div>
              <p className="mt-2.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-soft sm:text-[12px]">
                {label}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Venues snapshot — a compact divided list, not the full CRUD cards. */}
      <section className="mt-10">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="text-[16px] font-extrabold tracking-[-0.02em]">
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
          <div className="overflow-hidden rounded-2xl border border-border bg-white">
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
            className="flex min-h-[168px] flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border-strong bg-white/60 p-6 text-center text-muted transition-colors hover:border-accent hover:bg-accent-soft/40 hover:text-accent-hover hover:no-underline"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-accent-soft text-accent-hover">
              <Plus size={24} />
            </span>
            <span className="max-w-[280px] text-[15px] font-semibold">{copy.venuesEmpty}</span>
          </Link>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-[0_1px_2px_rgba(20,18,16,0.03)]">
            <ul className="divide-y divide-border">
              {list.map((venue) => (
                <li key={venue.id}>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-3 px-4 py-3.5 transition-colors hover:bg-surface/70 sm:px-5">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent-hover">
                      <UtensilsCrossed size={18} />
                    </span>

                    <div className="min-w-0 flex-1 basis-40">
                      <p className="truncate text-[15px] font-bold tracking-[-0.01em]">
                        {venue.name}
                      </p>
                      <p className="mt-0.5 truncate text-[12.5px] text-muted-soft">
                        {PUBLIC_MENU_HOST}/{venue.slug}
                      </p>
                    </div>

                    <AccessBadge venue={venue} locale={locale} copy={copy} inRow />

                    <div className="flex items-center gap-2">
                      <Button
                        variant="primary"
                        href={`/${locale}/dashboard/venues/${venue.id}/menu`}
                        className="px-4 py-2 text-[13.5px]"
                      >
                        {copy.venueMenu}
                      </Button>
                      <a
                        href={`/${locale}/dashboard/venues/${venue.id}/qr`}
                        aria-label={copy.qrOpen}
                        title={copy.qrOpen}
                        className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border-strong text-muted transition-colors hover:bg-surface-2 hover:text-foreground"
                      >
                        <QrCode size={15} />
                      </a>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>
    </div>
  );
}
