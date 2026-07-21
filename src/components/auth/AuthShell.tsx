import Link from "next/link";
import type { ReactNode } from "react";
import { Logo } from "@/components/landing/ui/Logo";
import { authByLocale } from "@/content/auth";
import type { Locale } from "@/content/landing";

export function AuthShell({
  locale,
  title,
  subtitle,
  children,
  footer,
}: {
  locale: Locale;
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  const copy = authByLocale[locale];

  return (
    <main className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-4 py-10">
      <div className="bg-mesh pointer-events-none absolute inset-0 -z-10" aria-hidden="true" />
      <div className="bg-grid pointer-events-none absolute inset-0 -z-10" aria-hidden="true" />

      <div className="w-full max-w-[420px]">
        <div className="mb-7 flex justify-center">
          <Logo href={`/${locale}`} />
        </div>

        <div className="rounded-[24px] border border-border bg-white/85 p-6 shadow-[0_30px_60px_-32px_rgba(20,18,16,0.35)] backdrop-blur sm:p-8">
          <h1 className="text-[26px] font-extrabold tracking-[-0.03em]">{title}</h1>
          {subtitle ? (
            <p className="mt-1.5 text-[15px] text-muted">{subtitle}</p>
          ) : null}

          <div className="mt-6">{children}</div>
        </div>

        {footer ? (
          <div className="mt-5 text-center text-[15px] text-muted">{footer}</div>
        ) : null}

        <div className="mt-4 text-center">
          <Link
            href={`/${locale}`}
            className="text-sm text-muted-soft transition-colors hover:text-foreground"
          >
            ← {copy.backHome}
          </Link>
        </div>
      </div>
    </main>
  );
}
