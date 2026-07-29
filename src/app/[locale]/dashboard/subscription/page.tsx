import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PanelShell } from "@/components/panel/PanelShell";
import { SubscriptionCard } from "@/components/panel/SubscriptionCard";
import { authByLocale } from "@/content/auth";
import { isLocale } from "@/content/locales";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/dashboard/subscription">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};

  return {
    title: `${authByLocale[locale].subTitle} — Qmenu`,
    robots: { index: false, follow: false },
  };
}

export default async function SubscriptionPage({
  params,
}: PageProps<"/[locale]/dashboard/subscription">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const copy = authByLocale[locale];

  return (
    <PanelShell locale={locale} tab="subscription">
      <h1 className="mb-1.5 text-[26px] font-extrabold tracking-[-0.03em]">{copy.subTitle}</h1>
      <p className="mb-6 text-[15px] text-muted-soft">{copy.subSubtitle}</p>
      <SubscriptionCard locale={locale} />
    </PanelShell>
  );
}
