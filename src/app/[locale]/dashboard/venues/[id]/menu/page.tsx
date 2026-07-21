import { notFound } from "next/navigation";
import Link from "next/link";
import { PanelShell } from "@/components/panel/PanelShell";
import { authByLocale } from "@/content/auth";
import { isLocale } from "@/content/locales";

/** Menu editing lands here next; the venue card already points at it. */
export default async function VenueMenuPage({
  params,
}: PageProps<"/[locale]/dashboard/venues/[id]/menu">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const copy = authByLocale[locale];

  return (
    <PanelShell locale={locale} tab="venues">
      <div className="max-w-[520px] rounded-[20px] border border-border bg-white p-6">
        <h1 className="mb-2 text-[22px] font-extrabold tracking-[-0.02em]">
          {copy.venueMenu}
        </h1>
        <p className="mb-5 text-[15px] text-muted">
          {locale === "kz"
            ? "Мәзірді өңдеу келесі қадамда."
            : "Редактирование меню — следующий шаг."}
        </p>
        <Link
          href={`/${locale}/dashboard`}
          className="text-[15px] font-semibold text-accent-hover hover:underline"
        >
          ← {copy.tabVenues}
        </Link>
      </div>
    </PanelShell>
  );
}
