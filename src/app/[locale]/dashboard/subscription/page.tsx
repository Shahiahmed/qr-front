import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PanelPageHeader } from "@/components/panel/PanelPageHeader";
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
    title: `${authByLocale[locale].subTitle} — QR меню`,
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
      <PanelPageHeader title={copy.subTitle} subtitle={copy.subSubtitle} />
      <SubscriptionCard locale={locale} />
    </PanelShell>
  );
}
