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
    const copy = guestByLocale.ru;

    return (
      <main className="flex min-h-dvh flex-col items-center justify-center gap-2 px-6 text-center">
        <h1 className="text-[22px] font-extrabold">{copy.notFoundTitle}</h1>
        <p className="text-muted">{copy.notFoundText}</p>
      </main>
    );
  }

  return <GuestMenu menu={menu} ordering />;
}
