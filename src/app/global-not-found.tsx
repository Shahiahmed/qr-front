import type { Metadata } from "next";
import { Onest } from "next/font/google";
import Link from "next/link";
import "./globals.css";

/**
 * App-wide 404 for URLs that match no route at all (e.g. /kz/asdasd).
 *
 * The site has no single root layout to compose a normal not-found.js from —
 * everything sits under the `[locale]` dynamic segment and `/m` is a separate
 * root — so Next serves this file directly, bypassing layouts. That means it
 * must ship its own `<html>`, global styles and font. Enabled by
 * `experimental.globalNotFound` in next.config.ts.
 *
 * The visitor's language is unknown here, so both are shown (RU lead, KZ below).
 */
const onest = Onest({
  variable: "--font-onest",
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Страница не найдена — Qmenu",
};

export default function GlobalNotFound() {
  return (
    <html lang="ru" className={`${onest.variable} h-full antialiased`}>
      <body className="font-sans">
        <main className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-surface px-6 py-16 text-center">
          {/* Soft brand glow behind the card. */}
          <div
            aria-hidden
            className="pointer-events-none absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-accent-soft blur-3xl"
          />

          <div className="relative flex w-full max-w-sm flex-col items-center gap-6 rounded-[28px] border border-border bg-white/80 p-8 shadow-[0_20px_60px_-30px_rgba(20,18,16,0.35)] backdrop-blur">
            <span className="text-[18px] font-extrabold tracking-[-0.02em] text-foreground">
              Qmenu
            </span>

            <p className="text-[64px] font-extrabold leading-none tracking-[-0.04em] text-foreground">
              404
            </p>

            <div className="flex flex-col gap-1.5">
              <h1 className="text-[20px] font-extrabold tracking-[-0.02em] text-foreground">
                Страница не найдена
              </h1>
              <p className="text-[15px] leading-snug text-muted">
                Возможно, адрес введён неверно или страница была удалена.
              </p>
            </div>

            <div className="h-px w-12 bg-border-strong" />

            <div className="flex flex-col gap-1">
              <p className="text-[15px] font-bold text-foreground">Бет табылмады</p>
              <p className="text-[14px] leading-snug text-muted-soft">
                Мекенжай қате терілген немесе бет жойылған болуы мүмкін.
              </p>
            </div>

            <Link
              href="/"
              className="mt-1 inline-flex items-center justify-center rounded-full bg-accent px-6 py-2.5 text-[15px] font-semibold text-white transition-colors hover:bg-accent-hover"
            >
              На главную · Басты бетке
            </Link>
          </div>
        </main>
      </body>
    </html>
  );
}
