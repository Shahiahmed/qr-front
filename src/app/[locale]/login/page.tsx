import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AuthShell } from "@/components/auth/AuthShell";
import { LoginForm } from "@/components/auth/LoginForm";
import { authByLocale } from "@/content/auth";
import { isLocale } from "@/content/locales";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/login">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};

  return {
    title: `${authByLocale[locale].loginTitle} — Qmenu`,
    robots: { index: false, follow: false },
  };
}

export default async function LoginPage({ params }: PageProps<"/[locale]/login">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const copy = authByLocale[locale];

  return (
    <AuthShell
      locale={locale}
      title={copy.loginTitle}
      subtitle={copy.loginSub}
      footer={
        <>
          {copy.noAccount}{" "}
          <Link
            href={`/${locale}/register`}
            className="font-semibold text-accent-hover hover:underline"
          >
            {copy.goRegister}
          </Link>
        </>
      }
    >
      <LoginForm locale={locale} />
    </AuthShell>
  );
}
