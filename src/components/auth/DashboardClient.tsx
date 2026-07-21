"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/landing/ui/Button";
import { authByLocale } from "@/content/auth";
import type { Locale } from "@/content/landing";
import { currentUser, logout } from "@/lib/api";

/**
 * Placeholder panel. It exists to prove the session survives a page load and
 * to give the venue onboarding somewhere to land.
 */
export function DashboardClient({ locale }: { locale: Locale }) {
  const copy = authByLocale[locale];
  const router = useRouter();

  const { data: user, isPending } = useQuery({
    queryKey: ["user"],
    queryFn: currentUser,
  });

  // A guest has no business here — send them to the login screen.
  useEffect(() => {
    if (!isPending && user === null) router.replace(`/${locale}/login`);
  }, [isPending, user, locale, router]);

  const signOut = useMutation({
    mutationFn: logout,
    onSuccess: () => router.replace(`/${locale}`),
  });

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
