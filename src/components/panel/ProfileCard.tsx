"use client";

import { useQuery } from "@tanstack/react-query";
import { authByLocale } from "@/content/auth";
import type { Locale } from "@/content/landing";
import { currentUser } from "@/lib/api";
import { USER_QUERY_KEY } from "@/lib/useAuth";

export function ProfileCard({ locale }: { locale: Locale }) {
  const copy = authByLocale[locale];
  const { data: user } = useQuery({ queryKey: USER_QUERY_KEY, queryFn: currentUser });

  if (!user) return null;

  return (
    <div className="max-w-[520px] rounded-[20px] border border-border bg-white p-6">
      <dl className="flex flex-col gap-4">
        <div>
          <dt className="text-sm text-muted-soft">{copy.nameLabel}</dt>
          <dd className="text-lg font-bold">{user.name}</dd>
        </div>
        <div>
          <dt className="text-sm text-muted-soft">{copy.emailLabel}</dt>
          <dd className="text-[15px]">{user.email}</dd>
        </div>
      </dl>
    </div>
  );
}
