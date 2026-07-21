import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AuthShell } from "@/components/auth/AuthShell";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { authByLocale } from "@/content/auth";
import { isLocale } from "@/content/locales";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/register">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};

  return {
    title: `${authByLocale[locale].registerTitle} — Qmenu`,
    // Auth screens have nothing to offer search engines.
    robots: { index: false, follow: false },
  };
}

export default async function RegisterPage({ params }: PageProps<"/[locale]/register">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const copy = authByLocale[locale];

  return (
    <AuthShell
      locale={locale}
      title={copy.registerTitle}
      subtitle={copy.registerSub}
      footer={
        <>
          {copy.haveAccount}{" "}
          <Link
            href={`/${locale}/login`}
            className="font-semibold text-accent-hover hover:underline"
          >
            {copy.goLogin}
          </Link>
        </>
      }
    >
      <RegisterForm locale={locale} />
    </AuthShell>
  );
}
