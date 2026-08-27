import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PanelShell } from "@/components/panel/PanelShell";
import { ReferralCard } from "@/components/panel/ReferralCard";
import { authByLocale } from "@/content/auth";
import { isLocale } from "@/content/locales";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/dashboard/referral">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};

  return {
    title: `${authByLocale[locale].refTitle} — QR меню`,
    robots: { index: false, follow: false },
  };
}

export default async function ReferralPage({
  params,
}: PageProps<"/[locale]/dashboard/referral">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const copy = authByLocale[locale];

  return (
    <PanelShell locale={locale} tab="referral">
      <h1 className="mb-1.5 text-[26px] font-extrabold tracking-[-0.03em]">{copy.refTitle}</h1>
      <p className="mb-6 text-[15px] text-muted-soft">{copy.refSubtitle}</p>
      <ReferralCard locale={locale} />
    </PanelShell>
  );
}
