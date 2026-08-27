"use client";

import { useQuery } from "@tanstack/react-query";
import { Check, Copy, Gift, Send, Users } from "lucide-react";
import { useState } from "react";
import { authByLocale } from "@/content/auth";
import type { Locale } from "@/content/landing";
import { getReferral } from "@/lib/api";
import { formatPrice } from "@/lib/money";
import { referralLink } from "@/lib/referral";

const REFERRAL_QUERY_KEY = ["referral"] as const;

type Copy = typeof authByLocale.ru;

export function ReferralCard({ locale }: { locale: Locale }) {
  const copy = authByLocale[locale];

  const { data } = useQuery({
    queryKey: REFERRAL_QUERY_KEY,
    queryFn: () => getReferral(locale),
  });

  if (data === undefined) {
    return <div className="h-64 max-w-[720px] animate-pulse rounded-[20px] bg-surface-2" />;
  }

  const code = data.code ?? "";
  const link = code ? referralLink(code, locale) : "";
  const shareText = `${copy.refShareText} ${link}`;

  return (
    <div className="flex max-w-[720px] flex-col gap-5">
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

      {/* Balance. */}
      <section className="rounded-[20px] border border-border bg-white p-6">
        <p className="text-sm font-semibold text-muted-soft">{copy.refBalanceTitle}</p>
        <p className="mt-1 text-[32px] font-extrabold tracking-[-0.03em] text-accent-hover">
          {formatPrice(data.credit)}
        </p>
        <p className="mt-1 text-sm text-muted-soft">{copy.refBalanceHint}</p>
      </section>

      {/* Invite link + code + share. */}
      <section className="rounded-[20px] border border-border bg-white p-6">
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

        <div className="mt-4 flex flex-wrap gap-2">
          <a
            href={`https://wa.me/?text=${encodeURIComponent(shareText)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl bg-[#25D366] px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 hover:no-underline"
          >
            <Send size={15} />
            {copy.refShareWhatsapp}
          </a>
          <a
            href={`https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent(copy.refShareText)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl bg-[#229ED9] px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 hover:no-underline"
          >
            <Send size={15} />
            {copy.refShareTelegram}
          </a>
        </div>
      </section>

      {/* Stats. */}
      <div className="grid grid-cols-2 gap-4">
        <Stat icon={Users} caption={copy.refStatInvited} value={data.invited_count} />
        <Stat icon={Check} caption={copy.refStatConverted} value={data.converted_count} />
      </div>

      {/* How it works — reward amounts, hidden while the program is off. */}
      {data.enabled ? (
        <section className="rounded-[20px] border border-border bg-white p-6">
          <h3 className="text-[17px] font-extrabold tracking-[-0.02em]">{copy.refHowTitle}</h3>
          <ul className="mt-3 flex flex-col gap-2.5">
            <HowRow text={copy.refHowInviter.replace("{amount}", formatPrice(data.referrer_reward))} />
            <HowRow text={copy.refHowInvited.replace("{amount}", formatPrice(data.referred_reward))} />
          </ul>
        </section>
      ) : null}
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
    <div className="rounded-[20px] border border-border bg-white p-5">
      <Icon size={18} className="text-muted-soft" />
      <p className="mt-3 text-[28px] font-extrabold leading-none tracking-[-0.03em]">{value}</p>
      <p className="mt-1.5 text-sm text-muted-soft">{caption}</p>
    </div>
  );
}

function HowRow({ text }: { text: string }) {
  return (
    <li className="flex items-start gap-2.5 text-[15px] text-muted">
      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
      {text}
    </li>
  );
}

export type { Copy as ReferralCopy };
