"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FilePlus2, Pencil, QrCode, Trash2, UtensilsCrossed } from "lucide-react";
import { useState } from "react";
import { VenueDialog } from "@/components/panel/VenueDialog";
import { Button } from "@/components/landing/ui/Button";
import { authByLocale } from "@/content/auth";
import type { Locale } from "@/content/landing";
import { deleteEstablishment, type Establishment } from "@/lib/api";
import { PUBLIC_MENU_HOST, VENUES_QUERY_KEY, useVenues } from "@/lib/venues";

export function VenueList({ locale }: { locale: Locale }) {
  const copy = authByLocale[locale];
  const queryClient = useQueryClient();
  const { data: venues, isPending } = useVenues();

  const [dialog, setDialog] = useState<{ open: boolean; venue?: Establishment }>({
    open: false,
  });

  const remove = useMutation({
    mutationFn: deleteEstablishment,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: VENUES_QUERY_KEY }),
  });

  if (isPending) {
    return (
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1].map((key) => (
          <div key={key} className="h-[210px] animate-pulse rounded-[20px] bg-surface-2" />
        ))}
      </div>
    );
  }

  const list = venues ?? [];

  return (
    <>
      {list.length === 0 ? (
        <p className="mb-5 text-[15px] text-muted">{copy.venuesEmpty}</p>
      ) : null}

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((venue) => (
          <article
            key={venue.id}
            className="flex flex-col rounded-[20px] border border-border bg-white p-5 transition-shadow hover:shadow-[0_20px_40px_-24px_rgba(20,18,16,0.3)]"
          >
            <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-[14px] bg-accent-soft text-accent-hover">
              <UtensilsCrossed size={20} />
            </span>

            <h3 className="text-[19px] font-extrabold tracking-[-0.02em]">{venue.name}</h3>
            <p className="mt-1 truncate text-sm text-muted-soft">
              {PUBLIC_MENU_HOST}/{venue.slug}
            </p>

            <div className="mt-auto flex items-center gap-2 pt-5">
              <Button
                variant="primary"
                href={`/${locale}/dashboard/venues/${venue.id}/menu`}
                className="flex-1 py-2.5 text-[15px]"
              >
                {copy.venueMenu}
              </Button>

              <a
                href={`/${locale}/dashboard/venues/${venue.id}/qr`}
                aria-label={copy.qrOpen}
                title={copy.qrOpen}
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border-strong text-muted transition-colors hover:bg-surface-2 hover:text-foreground"
              >
                <QrCode size={16} />
              </a>

              <button
                type="button"
                aria-label={copy.venueEdit}
                title={copy.venueEdit}
                onClick={() => setDialog({ open: true, venue })}
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border-strong text-muted transition-colors hover:bg-surface-2 hover:text-foreground"
              >
                <Pencil size={16} />
              </button>

              <button
                type="button"
                aria-label={copy.venueDelete}
                title={copy.venueDelete}
                disabled={remove.isPending}
                onClick={() => {
                  // Deleting takes the whole menu with it, so make them mean it.
                  if (window.confirm(copy.venueDeleteConfirm)) remove.mutate(venue.id);
                }}
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border-strong text-muted transition-colors hover:border-red-300 hover:bg-red-50 hover:text-red-600"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </article>
        ))}

        <button
          type="button"
          onClick={() => setDialog({ open: true })}
          className="flex min-h-[210px] flex-col items-center justify-center gap-3 rounded-[20px] border border-dashed border-border-strong bg-white/60 p-5 text-muted transition-colors hover:border-accent hover:bg-accent-soft/40 hover:text-accent-hover"
        >
          <FilePlus2 size={38} strokeWidth={1.5} />
          <span className="text-[15px] font-semibold">{copy.venueAdd}</span>
        </button>
      </div>

      {dialog.open ? (
        <VenueDialog
          locale={locale}
          venue={dialog.venue}
          onClose={() => setDialog({ open: false })}
        />
      ) : null}
    </>
  );
}
