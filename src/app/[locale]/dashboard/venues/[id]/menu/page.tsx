import { notFound } from "next/navigation";
import { MenuPageClient } from "@/components/panel/MenuPageClient";
import { isLocale } from "@/content/locales";

export default async function VenueMenuPage({
  params,
}: PageProps<"/[locale]/dashboard/venues/[id]/menu">) {
  const { locale, id } = await params;
  if (!isLocale(locale)) notFound();

  const establishmentId = Number(id);
  if (!Number.isInteger(establishmentId)) notFound();

  return <MenuPageClient locale={locale} establishmentId={establishmentId} />;
}
