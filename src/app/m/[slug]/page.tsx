import type { Metadata } from "next";
import { GuestMenu } from "@/components/guest/GuestMenu";
import { guestByLocale } from "@/content/guest";
import { fetchPublicMenu } from "@/lib/publicMenu";

/*
 * Rebuilt at most once a minute. Slugs are created by tenants at any time, so
 * there is nothing to pre-render at build — the first scan renders the page
 * and everyone after that is served from the cache.
 */
// Must be a literal: Next reads this statically, it cannot evaluate an import.
export const revalidate = 60;

export async function generateMetadata({
  params,
}: PageProps<"/m/[slug]">): Promise<Metadata> {
  const { slug } = await params;
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

  return <GuestMenu menu={menu} />;
}
