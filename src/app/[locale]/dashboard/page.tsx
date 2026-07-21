import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AuthShell } from "@/components/auth/AuthShell";
import { DashboardClient } from "@/components/auth/DashboardClient";
import { authByLocale } from "@/content/auth";
import { isLocale } from "@/content/locales";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/dashboard">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};

  return {
    title: `${authByLocale[locale].dashboardTitle} — Qmenu`,
    robots: { index: false, follow: false },
  };
}

export default async function DashboardPage({
  params,
}: PageProps<"/[locale]/dashboard">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  return (
    <AuthShell locale={locale} title={authByLocale[locale].dashboardTitle}>
      <DashboardClient locale={locale} />
    </AuthShell>
  );
}
