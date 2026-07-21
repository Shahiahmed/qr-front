"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/landing/ui/Button";
import { authByLocale } from "@/content/auth";
import type { Locale } from "@/content/landing";
import { currentUser, logout } from "@/lib/api";
import { USER_QUERY_KEY, useSetAuthUser } from "@/lib/useAuth";

/**
 * Placeholder panel. It exists to prove the session survives a page load and
 * to give the venue onboarding somewhere to land.
 */
export function DashboardClient({ locale }: { locale: Locale }) {
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
      // Drop the cached session, or the header keeps offering the panel.
      setAuthUser(null);
      router.replace(`/${locale}`);
    },
  });

  /*
   * A guest has no business here. Signing out also empties the cache, though,
   * and this guard cannot tell that apart from arriving without a session — so
   * it stands down for the rest of a sign-out, which is heading home instead.
   */
  const leaving = signOut.isPending || signOut.isSuccess;

  useEffect(() => {
    if (leaving) return;
    if (!isPending && user === null) router.replace(`/${locale}/login`);
  }, [leaving, isPending, user, locale, router]);

  if (isPending || !user) {
    return <p className="text-muted">…</p>;
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="text-[15px] text-muted">{copy.dashboardHello}</p>
        <p className="text-lg font-bold">{user.name}</p>
        <p className="text-[15px] text-muted-soft">{user.email}</p>
      </div>

      <p className="rounded-xl bg-accent-soft px-4 py-3 text-[15px] text-foreground">
        {copy.dashboardNext}
      </p>

      <Button
        type="button"
        variant="secondary"
        disabled={signOut.isPending}
        onClick={() => signOut.mutate()}
        className="w-full py-3 text-base"
      >
        {copy.logout}
      </Button>
    </div>
  );
}
