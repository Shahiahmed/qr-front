"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { LayoutList, LogOut, UserRound } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { Logo } from "@/components/landing/ui/Logo";
import { authByLocale } from "@/content/auth";
import type { Locale } from "@/content/landing";
import { currentUser, logout } from "@/lib/api";
import { USER_QUERY_KEY, useSetAuthUser } from "@/lib/useAuth";

export type PanelTab = "venues" | "profile";

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

  const { data: user, isPending } = useQuery({
    queryKey: USER_QUERY_KEY,
    queryFn: currentUser,
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

  const tabs = [
    { id: "venues" as const, label: copy.tabVenues, href: `/${locale}/dashboard`, icon: LayoutList },
    { id: "profile" as const, label: copy.tabProfile, href: `/${locale}/dashboard/profile`, icon: UserRound },
  ];

  return (
    <div className="min-h-dvh bg-surface">
      <header className="border-b border-border bg-white">
        <div className="mx-auto flex max-w-[1180px] flex-wrap items-center justify-between gap-3 px-4 py-3.5 sm:px-6">
          <Logo href={`/${locale}`} size="sm" />

          <div className="flex items-center gap-3">
            {user ? (
              <span className="hidden text-sm text-muted sm:inline">{user.email}</span>
            ) : null}
            <button
              type="button"
              onClick={() => signOut.mutate()}
              disabled={signOut.isPending}
              className="inline-flex items-center gap-2 rounded-xl border border-border-strong px-3.5 py-2 text-sm font-semibold text-muted transition-colors hover:bg-surface-2 hover:text-foreground"
            >
              <LogOut size={15} />
              {copy.logout}
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1180px] px-4 py-6 sm:px-6 sm:py-8">
        <nav aria-label={copy.dashboardTitle} className="mb-7">
          <ul className="flex flex-wrap gap-2">
            {tabs.map(({ id, label, href, icon: Icon }) => {
              const active = id === tab;

              return (
                <li key={id}>
                  <Link
                    href={href}
                    aria-current={active ? "page" : undefined}
                    className={`inline-flex items-center gap-2 rounded-[14px] px-4 py-2.5 text-[15px] font-bold transition-colors hover:no-underline ${
                      active
                        ? "bg-white text-accent-hover shadow-[0_2px_10px_-4px_rgba(20,18,16,0.2)]"
                        : "text-muted hover:bg-white/70 hover:text-foreground"
                    }`}
                  >
                    <Icon size={17} />
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {isPending || !user ? (
          <div className="h-40 animate-pulse rounded-[20px] bg-surface-2" />
        ) : (
          children
        )}
      </div>
    </div>
  );
}
