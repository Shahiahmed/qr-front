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
    <main className="flex min-h-dvh flex-col items-center justify-center bg-surface px-4 py-4">

      <div className="w-full max-w-[420px]">
        <div className="mb-4 flex justify-center">
          <Logo href={`/${locale}`} />
        </div>

        <div className="rounded-[24px] border border-border bg-white p-5 sm:p-7">
          <h1 className="text-[26px] font-extrabold tracking-[-0.02em] text-ink">{title}</h1>
          {subtitle ? (
            <p className="mt-1 text-[15px] text-muted">{subtitle}</p>
          ) : null}

          <div className="mt-4">{children}</div>
        </div>

        {footer ? (
          <div className="mt-3 text-center text-[15px] text-muted">{footer}</div>
        ) : null}

        <div className="mt-2 text-center">
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
