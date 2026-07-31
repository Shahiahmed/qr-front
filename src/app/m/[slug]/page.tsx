import { QrCode } from "lucide-react";
import type { Metadata } from "next";
import { GuestMenu } from "@/components/guest/GuestMenu";
import { guestByLocale } from "@/content/guest";
import { DEMO_SLUG, demoMenu } from "@/content/demoMenu";
import { fetchPublicMenu } from "@/lib/publicMenu";

/*
 * Rebuilt at most once a minute. Slugs are created by tenants at any time, so
 * there is nothing to pre-render at build — the first scan renders the page
 * and everyone after that is served from the cache.
 */
// Must be a literal: Next reads this statically, it cannot evaluate an import.
export const revalidate = 60;

/*
 * The built-in demo is baked at build time so it opens on the marketing site
 * with no backend at all — it never touches the API. Other slugs stay
 * on-demand (dynamicParams defaults to true).
 */
export function generateStaticParams() {
  return [{ slug: DEMO_SLUG }];
}

export async function generateMetadata({
  params,
}: PageProps<"/m/[slug]">): Promise<Metadata> {
  const { slug } = await params;

  if (slug === DEMO_SLUG) {
    return {
      title: "Демо-меню — Qmenu",
      description: "Так гость видит меню заведения на Qmenu. Живой пример.",
      openGraph: { title: `${demoMenu.name} — демо-меню`, type: "website" },
    };
  }

  const menu = await fetchPublicMenu(slug);

  if (!menu) return { title: "Qmenu", robots: { index: false } };

  return {
    title: `${menu.name} — меню`,
    description: menu.address
      ? `Меню заведения «${menu.name}». ${menu.address}`
      : `Меню заведения «${menu.name}».`,
    // A venue's menu is worth finding in search.
    openGraph: { title: menu.name, type: "website" },
  };
}

export default async function GuestMenuPage({ params }: PageProps<"/m/[slug]">) {
  const { slug } = await params;

  // Local cart for every public menu: stored in this browser and shown to the
  // waiter on screen. Server-side order intake comes later.
  if (slug === DEMO_SLUG) return <GuestMenu menu={demoMenu} ordering />;

  const menu = await fetchPublicMenu(slug);

  if (!menu) {
    // The guest's language is unknown here (there is no menu to read it from),
    // so both are shown — Russian lead, Kazakh beneath.
    const ru = guestByLocale.ru;
    const kk = guestByLocale.kk;

    return (
      <main className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-surface px-6 py-16 text-center">
        {/* Soft brand glow behind the card. */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-accent-soft blur-3xl"
        />

        <div className="relative flex w-full max-w-sm flex-col items-center gap-6 rounded-[28px] border border-border bg-white/80 p-8 shadow-[0_20px_60px_-30px_rgba(20,18,16,0.35)] backdrop-blur">
          <span className="flex h-20 w-20 items-center justify-center rounded-3xl bg-accent-soft text-accent">
            <QrCode size={40} strokeWidth={1.75} />
          </span>

          <p className="text-[64px] font-extrabold leading-none tracking-[-0.04em] text-foreground">
            404
          </p>

          <div className="flex flex-col gap-1.5">
            <h1 className="text-[20px] font-extrabold tracking-[-0.02em] text-foreground">
              {ru.notFoundTitle}
            </h1>
            <p className="text-[15px] leading-snug text-muted">{ru.notFoundText}</p>
          </div>

          <div className="h-px w-12 bg-border-strong" />

          <div className="flex flex-col gap-1">
            <p className="text-[15px] font-bold text-foreground">{kk.notFoundTitle}</p>
            <p className="text-[14px] leading-snug text-muted-soft">{kk.notFoundText}</p>
          </div>
        </div>

        <a
          href="https://qmenu.kz"
          className="relative mt-8 text-[13px] font-semibold text-muted-soft transition-colors hover:text-accent"
        >
          {ru.poweredBy}
        </a>
      </main>
    );
  }

  return <GuestMenu menu={menu} ordering />;
}
