"use client";

import { PanelShell } from "@/components/panel/PanelShell";
import { MenuEditor } from "@/components/panel/MenuEditor";
import type { Locale } from "@/content/landing";
import { menuByLocale } from "@/content/menu";
import { useVenues } from "@/lib/venues";

export function MenuPageClient({
  locale,
  establishmentId,
}: {
  locale: Locale;
  establishmentId: number;
}) {
  const copy = menuByLocale[locale];
  const { data: venues } = useVenues();

  // The venue is only needed for its name and currency; the menu itself is
  // fetched by id, so the editor does not wait on this list.
  const venue = venues?.find((item) => item.id === establishmentId);

  return (
    <PanelShell locale={locale} tab="venues">
      <div className="mb-5">
        <h1 className="text-[26px] font-extrabold tracking-[-0.03em]">
          {copy.title}
          {venue ? (
            <span className="text-muted-soft"> · {venue.name}</span>
          ) : null}
        </h1>
      </div>

      <MenuEditor
        locale={locale}
        establishmentId={establishmentId}
        currency={venue?.currency ?? "KZT"}
      />
    </PanelShell>
  );
}
