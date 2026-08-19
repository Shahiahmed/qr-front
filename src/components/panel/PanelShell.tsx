"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import {
  CreditCard,
  LayoutDashboard,
  LayoutList,
  LogOut,
  Menu as MenuIcon,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type ComponentType, type ReactNode } from "react";
import { Logo } from "@/components/landing/ui/Logo";
import { authByLocale } from "@/content/auth";
import type { Locale } from "@/content/landing";
import { currentUser, logout } from "@/lib/api";
import { persistAuthUser, USER_QUERY_KEY, useSetAuthUser } from "@/lib/useAuth";

export type PanelTab = "overview" | "venues" | "subscription" | "profile";

type NavItem = {
  id: PanelTab;
  label: string;
  href: string;
  icon: ComponentType<{ size?: number; className?: string }>;
};

export function PanelShell({
  locale,
  tab,
  children,
}: {
  locale: Locale;
  tab: PanelTab;
  children: ReactNode;
}) {
  const copy = authByLocale[locale];
  const router = useRouter();
  const setAuthUser = useSetAuthUser();

  // Off-canvas navigation on phones. Navigating to another cabinet page
  // remounts this shell, so the drawer resets on its own — we only close it
  // on Escape and on backdrop / link taps within the same page.
  const [drawerOpen, setDrawerOpen] = useState(false);

  const { data: user, isPending } = useQuery({
    queryKey: USER_QUERY_KEY,
    // Mirror the confirmed session into session storage so the public header
    // (same tab) shows the cabinet link after a Google sign-in, which — being
    // a full-page redirect — never runs a login mutation to write it.
    queryFn: async () => {
      const signedIn = await currentUser();
      persistAuthUser(signedIn);
      return signedIn;
    },
  });

  const signOut = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      setAuthUser(null);
      router.replace(`/${locale}`);
    },
  });

  /*
   * Guests get sent to the login screen. Signing out empties the cache too,
   * and this guard cannot tell that apart — so it stands down for the rest of
   * a sign-out, which is heading home instead.
   */
  const leaving = signOut.isPending || signOut.isSuccess;

  useEffect(() => {
    if (leaving) return;
    if (!isPending && user === null) router.replace(`/${locale}/login`);
  }, [leaving, isPending, user, locale, router]);

  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDrawerOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [drawerOpen]);

  // Profile lives on its own at the bottom (the account block), not in this
  // list — it's an identity/settings entry, not a workspace section.
  const nav: NavItem[] = [
    { id: "overview", label: copy.tabOverview, href: `/${locale}/dashboard`, icon: LayoutDashboard },
    { id: "venues", label: copy.tabVenues, href: `/${locale}/dashboard/venues`, icon: LayoutList },
    { id: "subscription", label: copy.tabSubscription, href: `/${locale}/dashboard/subscription`, icon: CreditCard },
  ];

  const initial = (user?.email?.[0] ?? "?").toUpperCase();

  // Rendered twice — the fixed desktop rail and the mobile drawer — so it lives
  // in a closure that both call. `onNavigate` closes the drawer after a tap.
  function sidebarBody(onNavigate?: () => void) {
    return (
      <>
        <div className="flex h-16 shrink-0 items-center px-5">
          <Logo href={`/${locale}`} size="sm" />
        </div>

        <nav aria-label={copy.dashboardTitle} className="flex-1 overflow-y-auto px-3 py-3">
          <ul className="flex flex-col gap-0.5">
            {nav.map(({ id, label, href, icon: Icon }) => {
              const active = id === tab;
              return (
                <li key={id}>
                  <Link
                    href={href}
                    onClick={onNavigate}
                    aria-current={active ? "page" : undefined}
                    className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-[14.5px] font-semibold transition-colors hover:no-underline ${
                      active
                        ? "bg-accent-soft text-accent-hover"
                        : "text-muted hover:bg-surface-2 hover:text-foreground"
                    }`}
                  >
                    <Icon
                      size={18}
                      className={
                        active ? "text-accent" : "text-muted-soft group-hover:text-foreground"
                      }
                    />
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="shrink-0 border-t border-border p-3">
          {/* The account block doubles as the Profile entry, sitting on its own
              at the bottom next to «Выйти» rather than in the section list. */}
          <Link
            href={`/${locale}/dashboard/profile`}
            onClick={onNavigate}
            aria-current={tab === "profile" ? "page" : undefined}
            className={`mb-0.5 flex items-center gap-3 rounded-xl px-2 py-2 transition-colors hover:no-underline ${
              tab === "profile" ? "bg-accent-soft" : "hover:bg-surface-2"
            }`}
          >
            <span
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[14px] font-bold ${
                tab === "profile"
                  ? "bg-accent text-white"
                  : "bg-accent-soft text-accent-hover"
              }`}
            >
              {initial}
            </span>
            <span className="min-w-0 flex-1">
              <span
                className={`block text-[14px] font-semibold ${
                  tab === "profile" ? "text-accent-hover" : "text-foreground"
                }`}
              >
                {copy.tabProfile}
              </span>
              {user ? (
                <span className="block truncate text-[12px] text-muted-soft" title={user.email}>
                  {user.email}
                </span>
              ) : null}
            </span>
          </Link>
          <button
            type="button"
            onClick={() => signOut.mutate()}
            disabled={signOut.isPending}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[14.5px] font-semibold text-muted transition-colors hover:bg-surface-2 hover:text-foreground"
          >
            <LogOut size={17} />
            {copy.logout}
          </button>
        </div>
      </>
    );
  }

  return (
    // White when printing: the tinted panel background is wasted ink and
    // costs the code contrast a scanner needs.
    <div className="min-h-dvh bg-surface print:bg-white">
      {/* Mobile top bar — hidden on desktop (the rail takes over) and in print. */}
      <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-border bg-white px-4 py-3 lg:hidden print:hidden">
        <button
          type="button"
          aria-label={copy.navOpen}
          onClick={() => setDrawerOpen(true)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border-strong text-muted transition-colors hover:bg-surface-2 hover:text-foreground"
        >
          <MenuIcon size={20} />
        </button>
        <Logo href={`/${locale}`} size="sm" />
        <button
          type="button"
          aria-label={copy.logout}
          onClick={() => signOut.mutate()}
          disabled={signOut.isPending}
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border-strong text-muted transition-colors hover:bg-surface-2 hover:text-foreground"
        >
          <LogOut size={18} />
        </button>
      </header>

      {/* Fixed desktop rail. */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-border bg-white lg:flex print:hidden">
        {sidebarBody()}
      </aside>

      {/* Mobile drawer — always mounted so it can slide instead of pop. */}
      <div
        className={`fixed inset-0 z-50 lg:hidden print:hidden ${
          drawerOpen ? "" : "pointer-events-none"
        }`}
        aria-hidden={!drawerOpen}
      >
        <button
          type="button"
          tabIndex={drawerOpen ? 0 : -1}
          aria-label={copy.navClose}
          onClick={() => setDrawerOpen(false)}
          className={`absolute inset-0 bg-ink/40 transition-opacity duration-200 motion-reduce:transition-none ${
            drawerOpen ? "opacity-100" : "opacity-0"
          }`}
        />
        <aside
          className={`absolute inset-y-0 left-0 flex w-72 max-w-[82%] flex-col bg-white transition-transform duration-200 ease-out motion-reduce:transition-none ${
            drawerOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {sidebarBody(() => setDrawerOpen(false))}
        </aside>
      </div>

      {/* Content column, offset by the rail on desktop. */}
      <div className="lg:pl-64 print:pl-0">
        <main className="mx-auto max-w-[1180px] px-4 py-6 sm:px-6 sm:py-8">
          {isPending || !user ? (
            <div className="h-40 animate-pulse rounded-[20px] bg-surface-2" />
          ) : (
            children
          )}
        </main>
      </div>
    </div>
  );
}
