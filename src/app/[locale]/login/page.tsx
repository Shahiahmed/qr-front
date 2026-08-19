import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AuthShell } from "@/components/auth/AuthShell";
import { GoogleButton } from "@/components/auth/GoogleButton";
import { LoginForm } from "@/components/auth/LoginForm";
import { authByLocale } from "@/content/auth";
import { isLocale } from "@/content/locales";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/login">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};

  return {
    title: `${authByLocale[locale].loginTitle} — QR меню`,
    robots: { index: false, follow: false },
  };
}

export default async function LoginPage({
  params,
  searchParams,
}: PageProps<"/[locale]/login">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const copy = authByLocale[locale];
  // Google callback bounces failed sign-ins back with ?error=google.
  const googleFailed = (await searchParams).error === "google";

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
      {googleFailed && (
        <p
          role="alert"
          className="mb-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {copy.googleError}
        </p>
      )}
      <GoogleButton locale={locale} />
      <LoginForm locale={locale} />
    </AuthShell>
  );
}
