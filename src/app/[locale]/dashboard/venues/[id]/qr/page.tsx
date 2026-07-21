import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PanelShell } from "@/components/panel/PanelShell";
import { VenueQr } from "@/components/panel/VenueQr";
import { authByLocale } from "@/content/auth";
import { isLocale } from "@/content/locales";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/dashboard/venues/[id]/qr">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};

  return {
    title: `${authByLocale[locale].qrTitle} — Qmenu`,
    robots: { index: false, follow: false },
  };
}

export default async function VenueQrPage({
  params,
}: PageProps<"/[locale]/dashboard/venues/[id]/qr">) {
  const { locale, id } = await params;
  if (!isLocale(locale)) notFound();

  const establishmentId = Number(id);
  if (!Number.isInteger(establishmentId)) notFound();

  return (
    <PanelShell locale={locale} tab="venues">
      <h1 className="mb-5 text-[26px] font-extrabold tracking-[-0.03em] print:hidden">
        {authByLocale[locale].qrTitle}
      </h1>
      <VenueQr locale={locale} establishmentId={establishmentId} />
    </PanelShell>
  );
}
