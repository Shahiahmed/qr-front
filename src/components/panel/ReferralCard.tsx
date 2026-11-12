"use client";

import { useQuery } from "@tanstack/react-query";
import { Check, Copy, Gift, Send, Wallet } from "lucide-react";
import { useState } from "react";
import { authByLocale } from "@/content/auth";
import type { Locale } from "@/content/landing";
import { getReferral } from "@/lib/api";
import { formatPrice } from "@/lib/money";
import { referralLink } from "@/lib/referral";

const REFERRAL_QUERY_KEY = ["referral"] as const;

type Copy = typeof authByLocale.ru;

/**
 * «Пригласить друга»: the link to share leads (it is the task); the balance
 * and «how it works» sit beside it, so the whole loop reads on one screen.
 */
export function ReferralCard({ locale }: { locale: Locale }) {
  const copy = authByLocale[locale];

  const { data } = useQuery({
    queryKey: REFERRAL_QUERY_KEY,
    queryFn: () => getReferral(locale),
  });

  if (data === undefined) {
    return (
      <div className="flex flex-col gap-5">
        <div className="h-44 animate-pulse rounded-[22px] bg-surface-2" />
        <div className="h-64 animate-pulse rounded-[20px] bg-surface-2" />
      </div>
    );
  }

  const code = data.code ?? "";
  const link = code ? referralLink(code, locale) : "";
  const shareText = `${copy.refShareText} ${link}`;

  return (
    <div className="flex flex-col gap-5">
      {/* Who brought this owner in. */}
      {data.referred_by ? (
        <p className="flex items-center gap-2 text-[15px] text-muted">
          <Gift size={16} className="shrink-0 text-accent" />
          {copy.refInvitedBy.replace("{name}", data.referred_by)}
        </p>
      ) : null}

      {!data.enabled ? (
        <p className="rounded-[16px] border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-900">
          {copy.refDisabled}
        </p>
      ) : null}

      {/* The link is the job here, so it leads; the balance is the result of
          doing it and sits beside it as plain facts — no banner. */}
      <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
        <section
          aria-labelledby="ref-link-title"
          className="rounded-[20px] border border-border bg-white p-5 sm:p-6"
        >
          <h2 id="ref-link-title" className="text-[17px] font-extrabold tracking-[-0.02em]">
            {copy.refLinkTitle}
          </h2>
          <p className="mt-1 text-[14px] text-muted">{copy.refLinkHint}</p>

          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <input
              readOnly
              value={link}
              aria-label={copy.refLinkTitle}
              onFocus={(e) => e.currentTarget.select()}
              className="h-11 w-full min-w-0 shrink-0 rounded-xl sm:flex-1 border border-border-strong bg-surface px-4 text-[14px] text-foreground outline-none focus:border-accent"
            />
            <CopyButton value={link} label={copy.refCopy} doneLabel={copy.refCopied} />
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="text-[14px] text-muted">{copy.refCodeLabel}:</span>
            <span className="rounded-lg bg-surface-2 px-3 py-1 font-mono text-[14px] font-bold tracking-[0.15em] text-foreground">
              {code}
            </span>
          </div>

          {/* Neutral buttons, brand colour only on the icon: white text on the
              WhatsApp/Telegram fills fails contrast (about 2:1 and 3:1). */}
          <div className="mt-5 grid grid-cols-2 gap-2 border-t border-border pt-5">
            <a
              href={`https://wa.me/?text=${encodeURIComponent(shareText)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-border-strong bg-white px-4 text-[14px] font-bold text-foreground transition-colors hover:border-foreground hover:no-underline"
            >
              <Send size={15} className="text-emerald-600" aria-hidden />
              {copy.refShareWhatsapp}
            </a>
            <a
              href={`https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent(copy.refShareText)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-border-strong bg-white px-4 text-[14px] font-bold text-foreground transition-colors hover:border-foreground hover:no-underline"
            >
              <Send size={15} className="text-sky-600" aria-hidden />
              {copy.refShareTelegram}
            </a>
          </div>
        </section>

        <div className="flex flex-col gap-5">
          <section
            aria-labelledby="ref-balance-title"
            className="rounded-[20px] border border-border bg-white p-5 sm:p-6"
          >
            <h2
              id="ref-balance-title"
              className="flex items-center gap-2 text-[14px] font-bold text-muted"
            >
              <Wallet size={16} className="text-accent-hover" aria-hidden />
              {copy.refBalanceTitle}
            </h2>
            <p className="mt-1.5 text-[34px] font-extrabold leading-none tracking-[-0.03em] tabular-nums">
              {formatPrice(data.credit)}
            </p>
            <p className="mt-2 text-[14px] leading-snug text-muted">{copy.refBalanceHint}</p>
            <dl className="mt-4 grid grid-cols-2 divide-x divide-border border-t border-border pt-4">
              <div className="pr-4">
                <dt className="text-[13px] text-muted">{copy.refStatInvited}</dt>
                <dd className="mt-0.5 text-[20px] font-extrabold tabular-nums">{data.invited_count}</dd>
              </div>
              <div className="pl-4">
                <dt className="text-[13px] text-muted">{copy.refStatConverted}</dt>
                <dd className="mt-0.5 text-[20px] font-extrabold tabular-nums">{data.converted_count}</dd>
              </div>
            </dl>
          </section>

          {/* How it works — reward amounts, hidden while the program is off. */}
          {data.enabled ? (
            <section
              aria-labelledby="ref-how-title"
              className="rounded-[20px] border border-border bg-white p-5 sm:p-6"
            >
              <h2 id="ref-how-title" className="text-[17px] font-extrabold tracking-[-0.02em]">
                {copy.refHowTitle}
              </h2>
              <ol className="mt-4 flex flex-col gap-3.5">
                {[
                  copy.refStepShare,
                  copy.refHowInvited.replace("{amount}", formatPrice(data.referred_reward)),
                  copy.refHowInviter.replace("{amount}", formatPrice(data.referrer_reward)),
                ].map((text, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent-soft text-[13px] font-extrabold text-accent-hover">
                      {i + 1}
                    </span>
                    <span className="pt-0.5 text-[14.5px] leading-snug text-muted">{text}</span>
                  </li>
                ))}
              </ol>
            </section>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function CopyButton({
  value,
  label,
  doneLabel,
}: {
  value: string;
  label: string;
  doneLabel: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard blocked (insecure context / permission) — the field is
      // selectable, so the owner can still copy by hand.
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      aria-live="polite"
      className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-accent px-5 text-[14px] font-bold text-white transition-colors hover:bg-accent-hover"
    >
      {copied ? <Check size={16} /> : <Copy size={16} />}
      {copied ? doneLabel : label}
    </button>
  );
}

export type { Copy as ReferralCopy };
