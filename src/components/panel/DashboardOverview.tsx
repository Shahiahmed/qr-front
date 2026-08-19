"use client";

import { BadgeCheck, Plus, QrCode, Store, TriangleAlert, UtensilsCrossed } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/landing/ui/Button";
import { AccessBadge } from "@/components/panel/VenueList";
import { authByLocale } from "@/content/auth";
import type { Locale } from "@/content/landing";
import { useAuth } from "@/lib/useAuth";
import { PUBLIC_MENU_HOST, useVenues } from "@/lib/venues";

/**
 * Cabinet home. A calm, read-only snapshot — headline stats and a compact
 * venue list — while the full CRUD stays on the «Заведения» page. Built to
 * grow: more stat cards / sections drop in as orders, analytics and tables
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
    { label: copy.statVenues, value: total, icon: Store, alarm: false },
    { label: copy.statActive, value: active, icon: BadgeCheck, alarm: false },
    // Only the attention figure runs warm, and only when it is non-zero —
    // a calm dashboard shouldn't shout amber when nothing is wrong.
    { label: copy.statAttention, value: attention, icon: TriangleAlert, alarm: attention > 0 },
  ];

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-[26px] font-extrabold tracking-[-0.03em]">{copy.overviewTitle}</h1>
        <p className="mt-1 text-[15px] text-muted-soft">
          {copy.overviewWelcome}
          {user ? <span className="font-semibold text-foreground">, {user.email}</span> : null}
        </p>
      </header>

      {isPending ? (
        <div className="grid gap-4 sm:grid-cols-3">
          {[0, 1, 2].map((k) => (
            <div key={k} className="h-[108px] animate-pulse rounded-2xl bg-surface-2" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-3">
          {stats.map(({ label, value, icon: Icon, alarm }) => (
            <div
              key={label}
              className="rounded-2xl border border-border bg-white p-5 shadow-[0_1px_2px_rgba(20,18,16,0.04)]"
            >
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-semibold text-muted-soft">{label}</span>
                <Icon size={17} className={alarm ? "text-amber-500" : "text-muted-soft/70"} />
              </div>
              <p
                className={`mt-3 text-[32px] font-extrabold leading-none tracking-[-0.03em] ${
                  alarm ? "text-amber-600" : "text-foreground"
                }`}
              >
                {value}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Venues snapshot */}
      <section className="mt-9">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-[17px] font-extrabold tracking-[-0.02em]">{copy.overviewVenuesTitle}</h2>
          {total > 0 ? (
            <Link
              href={`/${locale}/dashboard/venues`}
              className="inline-flex items-center gap-1.5 rounded-xl border border-border-strong bg-white px-3.5 py-2 text-[14px] font-semibold text-muted transition-colors hover:border-accent hover:text-accent-hover hover:no-underline"
            >
              <Plus size={16} />
              {copy.venueAdd}
            </Link>
          ) : null}
        </div>

        {isPending ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1].map((k) => (
              <div key={k} className="h-[172px] animate-pulse rounded-2xl bg-surface-2" />
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
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((venue) => (
              <article
                key={venue.id}
                className="flex flex-col rounded-2xl border border-border bg-white p-5 shadow-[0_1px_2px_rgba(20,18,16,0.04)] transition-shadow hover:shadow-[0_14px_30px_-20px_rgba(20,18,16,0.28)]"
              >
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent-hover">
                    <UtensilsCrossed size={18} />
                  </span>
                  <div className="min-w-0">
                    <h3 className="truncate text-[16px] font-extrabold tracking-[-0.02em]">
                      {venue.name}
                    </h3>
                    <p className="mt-0.5 truncate text-[13px] text-muted-soft">
                      {PUBLIC_MENU_HOST}/{venue.slug}
                    </p>
                  </div>
                </div>

                <AccessBadge venue={venue} locale={locale} copy={copy} />

                <div className="mt-auto flex items-center gap-2 pt-4">
                  <Button
                    variant="primary"
                    href={`/${locale}/dashboard/venues/${venue.id}/menu`}
                    className="flex-1 py-2 text-[14px]"
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
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
