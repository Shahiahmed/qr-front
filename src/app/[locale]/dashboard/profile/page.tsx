import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PanelShell } from "@/components/panel/PanelShell";
import { ProfileCard } from "@/components/panel/ProfileCard";
import { authByLocale } from "@/content/auth";
import { isLocale } from "@/content/locales";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/dashboard/profile">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};

  return {
    title: `${authByLocale[locale].profileTitle} — Qmenu`,
    robots: { index: false, follow: false },
  };
}

export default async function ProfilePage({
  params,
}: PageProps<"/[locale]/dashboard/profile">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  return (
    <PanelShell locale={locale} tab="profile">
      <h1 className="mb-5 text-[26px] font-extrabold tracking-[-0.03em]">
        {authByLocale[locale].profileTitle}
      </h1>
      <ProfileCard locale={locale} />
    </PanelShell>
  );
}
