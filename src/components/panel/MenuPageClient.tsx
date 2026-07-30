"use client";

import { PanelShell } from "@/components/panel/PanelShell";
import { MenuEditor } from "@/components/panel/MenuEditor";
import type { Locale } from "@/content/landing";
import { useVenues } from "@/lib/venues";

export function MenuPageClient({
  locale,
  establishmentId,
}: {
  locale: Locale;
  establishmentId: number;
}) {
  const { data: venues } = useVenues();

  // The venue is only needed for its name and currency; the menu itself is
  // fetched by id, so the editor does not wait on this list. The editor owns
  // its own heading (the venue name) alongside its toolbar.
  const venue = venues?.find((item) => item.id === establishmentId);

  return (
    <PanelShell locale={locale} tab="venues">
      <MenuEditor
        locale={locale}
        establishmentId={establishmentId}
        currency={venue?.currency ?? "KZT"}
        slug={venue?.slug}
        venue={venue}
      />
    </PanelShell>
  );
}
