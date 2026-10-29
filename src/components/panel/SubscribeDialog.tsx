"use client";

import { Check, UtensilsCrossed } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/landing/ui/Button";
import { Modal } from "@/components/panel/Modal";
import { SubscribeForm } from "@/components/panel/SubscribeForm";
import { AccessBadge } from "@/components/panel/VenueList";
import { authByLocale } from "@/content/auth";
import type { Locale } from "@/content/landing";
import type { Establishment } from "@/lib/api";
import { PUBLIC_MENU_HOST } from "@/lib/venues";

/**
 * Subscribe / renew one venue straight from its card, without a detour to the
 * «Подписка» page. Swaps to a confirmation once the request is filed.
 */
export function SubscribeDialog({
  venue,
  currentPlanId,
  locale,
  onClose,
}: {
  venue: Establishment;
  currentPlanId: number | null;
  locale: Locale;
  onClose: () => void;
}) {
  const copy = authByLocale[locale];
  const [sent, setSent] = useState(false);

  if (sent) {
    return (
      <Modal label={copy.subSuccessTitle} onClose={onClose}>
        <div className="flex flex-col items-center py-2 text-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-accent-soft text-accent-hover">
            <Check size={30} strokeWidth={3} />
          </span>
          <h2 className="mt-5 text-[24px] font-extrabold tracking-[-0.03em]">{copy.subSuccessTitle}</h2>
          <p className="mt-2 max-w-[340px] text-[15px] leading-relaxed text-muted">
            {copy.subPendingNote}
          </p>
          <Button type="button" variant="primary" onClick={onClose} className="mt-7 h-12 w-full py-0">
            {copy.subDone}
          </Button>
        </div>
      </Modal>
    );
  }

  const title = venue.access_source === "subscription" ? copy.subRenewTitle : copy.subChooseTitle;

  return (
    <Modal label={title} title={title} onClose={onClose}>
      {/* Which menu this is for — owners with several venues need the anchor. */}
      <div className="-mt-2 mb-6 flex items-center gap-3 rounded-[16px] bg-surface p-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-accent-hover shadow-[0_1px_2px_rgba(20,18,16,0.06)]">
          <UtensilsCrossed size={18} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[15px] font-bold">{venue.name}</span>
          <span className="block truncate text-[12.5px] text-muted-soft">
            {PUBLIC_MENU_HOST}/{venue.slug}
          </span>
        </span>
        <AccessBadge venue={venue} locale={locale} copy={copy} inRow compact />
      </div>

      <SubscribeForm
        menuId={venue.id}
        currentPlanId={currentPlanId}
        locale={locale}
        onSuccess={() => setSent(true)}
        onCancel={onClose}
      />
    </Modal>
  );
}
