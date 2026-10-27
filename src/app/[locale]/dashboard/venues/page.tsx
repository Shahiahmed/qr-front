import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PanelPageHeader } from "@/components/panel/PanelPageHeader";
import { PanelShell } from "@/components/panel/PanelShell";
import { VenueList } from "@/components/panel/VenueList";
import { authByLocale } from "@/content/auth";
import { isLocale } from "@/content/locales";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/dashboard/venues">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};

  return {
    title: `${authByLocale[locale].venuesTitle} — QR меню`,
    robots: { index: false, follow: false },
  };
}

export default async function VenuesPage({
  params,
}: PageProps<"/[locale]/dashboard/venues">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  return (
    <PanelShell locale={locale} tab="venues">
      <PanelPageHeader title={authByLocale[locale].venuesTitle} />
      <VenueList locale={locale} />
    </PanelShell>
  );
}
