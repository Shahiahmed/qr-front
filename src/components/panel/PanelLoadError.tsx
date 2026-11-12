"use client";

import { AlertTriangle, Loader2, RotateCw } from "lucide-react";
import { Button } from "@/components/landing/ui/Button";
import { authByLocale } from "@/content/auth";
import type { Locale } from "@/content/landing";

/**
 * «Couldn't load» with a retry — so a failed request never passes for an empty
 * list («no venues yet») or a missing venue. Same look as the overview's.
 */
export function PanelLoadError({
  locale,
  onRetry,
  retrying,
}: {
  locale: Locale;
  onRetry: () => void;
  retrying: boolean;
}) {
  const copy = authByLocale[locale];

  return (
    <div
      role="alert"
      className="flex flex-col items-start gap-4 rounded-[20px] border border-red-200 bg-red-50 p-5 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[11px] bg-red-100 text-red-700">
          <AlertTriangle size={18} aria-hidden />
        </span>
        <div>
          <p className="text-[16px] font-extrabold tracking-[-0.02em] text-red-950">
            {copy.overviewLoadError}
          </p>
          <p className="mt-0.5 text-[14px] text-red-900">{copy.overviewLoadErrorHint}</p>
        </div>
      </div>
      <Button
        type="button"
        variant="secondary"
        onClick={onRetry}
        disabled={retrying}
        className="h-11 px-5 py-0 text-[14px]"
      >
        {retrying ? (
          <Loader2 size={16} className="animate-spin" aria-hidden />
        ) : (
          <RotateCw size={16} aria-hidden />
        )}
        {copy.overviewRetry}
      </Button>
    </div>
  );
}
