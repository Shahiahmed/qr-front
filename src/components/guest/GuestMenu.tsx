"use client";

import { useEffect, useRef, useState } from "react";
import { guestByLocale, type GuestLocale } from "@/content/guest";
import { formatPrice } from "@/lib/money";
import { pick, type PublicMenu } from "@/lib/guestMenuTypes";

const LANGUAGES: { code: GuestLocale; label: string }[] = [
  { code: "ru", label: "RU" },
  { code: "kk", label: "KZ" },
];

export function GuestMenu({ menu }: { menu: PublicMenu }) {
  const [locale, setLocale] = useState<GuestLocale>(
    menu.default_locale === "kk" ? "kk" : "ru",
  );
  const copy = guestByLocale[locale];

  const sections = menu.categories.filter((category) => category.dishes.length > 0);
  const [active, setActive] = useState<number | null>(sections[0]?.id ?? null);
  const refs = useRef(new Map<number, HTMLElement>());

  /*
   * The tab strip follows the scroll rather than only driving it: a guest
   * swiping down the menu should see where they are.
   */
  useEffect(() => {
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];

        if (visible) setActive(Number(visible.target.getAttribute("data-id")));
      },
      // Band just under the sticky header, so a heading counts as "current"
      // when it reaches the top rather than the middle of the screen.
      { rootMargin: "-120px 0px -65% 0px", threshold: 0 },
    );

    refs.current.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [sections.length]);

  return (
    <div className="min-h-dvh bg-surface pb-16">
      <header className="sticky top-0 z-20 border-b border-border bg-white/90 backdrop-blur-lg">
        <div className="mx-auto flex max-w-[680px] items-center justify-between gap-3 px-4 py-3">
          <div className="min-w-0">
            <h1 className="truncate text-[19px] font-extrabold tracking-[-0.02em]">
              {menu.name}
            </h1>
            {menu.address ? (
              <p className="truncate text-xs text-muted-soft">{menu.address}</p>
            ) : null}
          </div>

          <div
            className="inline-flex shrink-0 rounded-full bg-surface-2 p-[3px]"
            role="group"
            aria-label={copy.languageAria}
          >
            {LANGUAGES.map(({ code, label }) => (
              <button
                key={code}
                type="button"
                onClick={() => setLocale(code)}
                aria-pressed={locale === code}
                className={`rounded-full px-3 py-1 text-xs font-bold transition-all ${
                  locale === code
                    ? "bg-white text-foreground shadow-[0_2px_6px_-2px_rgba(0,0,0,0.15)]"
                    : "text-muted-soft"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {sections.length > 1 ? (
          <nav aria-label={copy.sectionsAria} className="mx-auto max-w-[680px]">
            {/* Scrolls sideways: a venue can easily have a dozen sections. */}
            <ul className="flex gap-2 overflow-x-auto px-4 pb-2.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {sections.map((category) => (
                <li key={category.id}>
                  <a
                    href={`#section-${category.id}`}
                    className={`inline-block whitespace-nowrap rounded-full px-3.5 py-1.5 text-[13px] font-bold transition-colors hover:no-underline ${
                      active === category.id
                        ? "bg-accent text-white"
                        : "bg-surface-2 text-muted"
                    }`}
                  >
                    {pick(locale, category.name_ru, category.name_kk)}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        ) : null}
      </header>

      <main className="mx-auto max-w-[680px] px-4">
        {sections.length === 0 ? (
          <p className="py-16 text-center text-muted">{copy.emptyMenu}</p>
        ) : null}

        {sections.map((category) => (
          <section
            key={category.id}
            id={`section-${category.id}`}
            data-id={category.id}
            ref={(node) => {
              if (node) refs.current.set(category.id, node);
              else refs.current.delete(category.id);
            }}
            // Clears the sticky header when jumped to from the tab strip.
            className="scroll-mt-[132px] pt-7"
          >
            <h2 className="mb-3 text-[17px] font-extrabold uppercase tracking-[0.06em] text-muted">
              {pick(locale, category.name_ru, category.name_kk)}
            </h2>

            <ul className="flex flex-col gap-2.5">
              {category.dishes.map((dish) => {
                const description = pick(
                  locale,
                  dish.description_ru,
                  dish.description_kk,
                );

                return (
                  <li
                    key={dish.id}
                    className={`rounded-[18px] border border-border bg-white p-4 ${
                      dish.is_available ? "" : "opacity-55"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="text-[16px] font-bold leading-snug">
                          {pick(locale, dish.name_ru, dish.name_kk)}
                        </h3>
                        {description ? (
                          <p className="mt-1 text-[14px] leading-snug text-muted-soft">
                            {description}
                          </p>
                        ) : null}
                        {!dish.is_available ? (
                          <span className="mt-2 inline-block rounded-md bg-surface-2 px-2 py-0.5 text-xs font-bold text-muted">
                            {copy.soldOut}
                          </span>
                        ) : null}
                      </div>

                      <span className="whitespace-nowrap text-[16px] font-extrabold text-accent-hover">
                        {formatPrice(dish.price, menu.currency)}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </main>
    </div>
  );
}
