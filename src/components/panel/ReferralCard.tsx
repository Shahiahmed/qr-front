"use client";

import { useQuery } from "@tanstack/react-query";
import { Check, Copy, Gift, Send, Users, Wallet } from "lucide-react";
import { useState } from "react";
import { authByLocale } from "@/content/auth";
import type { Locale } from "@/content/landing";
import { getReferral } from "@/lib/api";
import { formatPrice } from "@/lib/money";
import { referralLink } from "@/lib/referral";

const REFERRAL_QUERY_KEY = ["referral"] as const;

type Copy = typeof authByLocale.ru;

/**
 * «Пригласить друга»: the balance up top as the reason to care, then the link
 * to share next to a three-step «how it works», so the whole loop reads on
 * one screen.
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
        <p className="rounded-[16px] bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
          {copy.refDisabled}
        </p>
      ) : null}

      {/* Balance + results in one brand card. */}
      <section className="relative overflow-hidden rounded-[22px] bg-[linear-gradient(140deg,#d2401a_0%,#a8330f_100%)] p-6 text-white sm:p-7">
        <span
          aria-hidden
          className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl"
        />
        <div className="relative flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="flex items-center gap-2 text-[14px] font-semibold text-white/80">
              <Wallet size={16} />
              {copy.refBalanceTitle}
            </p>
            <p className="mt-2 text-[40px] font-extrabold leading-none tracking-[-0.03em] sm:text-[46px]">
              {formatPrice(data.credit)}
            </p>
            <p className="mt-3 max-w-[420px] text-[14px] leading-relaxed text-white/80">
              {copy.refBalanceHint}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 md:w-[300px]">
            <Stat icon={Users} caption={copy.refStatInvited} value={data.invited_count} />
            <Stat icon={Check} caption={copy.refStatConverted} value={data.converted_count} />
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.8fr)]">
        {/* Invite link + code + share. */}
        <section className="rounded-[20px] border border-border bg-white p-5 shadow-[0_1px_2px_rgba(20,18,16,0.03)] sm:p-6">
          <h3 className="text-[17px] font-extrabold tracking-[-0.02em]">{copy.refLinkTitle}</h3>
          <p className="mt-1 text-sm text-muted-soft">{copy.refLinkHint}</p>

          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <input
              readOnly
              value={link}
              onFocus={(e) => e.currentTarget.select()}
              className="min-w-0 flex-1 rounded-xl border border-border-strong bg-surface px-4 py-3 text-sm text-muted outline-none"
            />
            <CopyButton value={link} label={copy.refCopy} doneLabel={copy.refCopied} />
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="text-sm text-muted-soft">{copy.refCodeLabel}:</span>
            <span className="rounded-lg bg-surface-2 px-3 py-1 font-mono text-sm font-bold tracking-[0.15em] text-foreground">
              {code}
            </span>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-2 border-t border-border pt-5">
            <a
              href={`https://wa.me/?text=${encodeURIComponent(shareText)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#25D366] px-4 text-sm font-semibold text-white transition-opacity hover:opacity-90 hover:no-underline"
            >
              <Send size={15} />
              {copy.refShareWhatsapp}
            </a>
            <a
              href={`https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent(copy.refShareText)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#229ED9] px-4 text-sm font-semibold text-white transition-opacity hover:opacity-90 hover:no-underline"
            >
              <Send size={15} />
              {copy.refShareTelegram}
            </a>
          </div>
        </section>

        {/* How it works — reward amounts, hidden while the program is off. */}
        {data.enabled ? (
          <section className="rounded-[20px] border border-border bg-white p-5 shadow-[0_1px_2px_rgba(20,18,16,0.03)] sm:p-6">
            <h3 className="text-[17px] font-extrabold tracking-[-0.02em]">{copy.refHowTitle}</h3>
            <ol className="mt-4 flex flex-col gap-4">
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
      className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-accent-hover"
    >
      {copied ? <Check size={16} /> : <Copy size={16} />}
      {copied ? doneLabel : label}
    </button>
  );
}

/** A frosted counter on the brand card. */
function Stat({
  icon: Icon,
  caption,
  value,
}: {
  icon: typeof Users;
  caption: string;
  value: number;
}) {
  return (
    <div className="rounded-[16px] bg-white/12 p-4 ring-1 ring-inset ring-white/15">
      <Icon size={16} className="text-white/75" />
      <p className="mt-2.5 text-[26px] font-extrabold leading-none tracking-[-0.03em]">{value}</p>
      <p className="mt-1.5 text-[12.5px] leading-tight text-white/80">{caption}</p>
    </div>
  );
}

export type { Copy as ReferralCopy };
