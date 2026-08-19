import type { Metadata } from "next";
import { notFound } from "next/navigation";
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
      <h1 className="mb-5 text-[26px] font-extrabold tracking-[-0.03em]">
        {authByLocale[locale].venuesTitle}
      </h1>
      <VenueList locale={locale} />
    </PanelShell>
  );
}
