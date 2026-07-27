"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Minus, Plus, X } from "lucide-react";
import { guestByLocale, type GuestLocale } from "@/content/guest";
import { formatPrice } from "@/lib/money";
import { pick, type PublicDish, type PublicMenu } from "@/lib/guestMenuTypes";

const LANGUAGES: { code: GuestLocale; label: string }[] = [
  { code: "ru", label: "RU" },
  { code: "kk", label: "KZ" },
];

/**
 * `ordering` turns on the at-the-table cart. It is off by default: real venue
 * menus must not show a "place order" button until the backend can receive one
 * (order submission is not built yet). The built-in demo passes it on, and the
 * checkout there is a local mock — nothing is sent anywhere.
 */
export function GuestMenu({
  menu,
  ordering = false,
}: {
  menu: PublicMenu;
  ordering?: boolean;
}) {
  const [locale, setLocale] = useState<GuestLocale>(
    menu.default_locale === "kk" ? "kk" : "ru",
  );
  const copy = guestByLocale[locale];

  const sections = menu.categories.filter((category) => category.dishes.length > 0);
  const [active, setActive] = useState<number | null>(sections[0]?.id ?? null);
  const refs = useRef(new Map<number, HTMLElement>());

  // dish id → quantity in the order
  const [cart, setCart] = useState<Record<number, number>>({});
  const [cartOpen, setCartOpen] = useState(false);
  const [placed, setPlaced] = useState(false);
  const [table, setTable] = useState("");

  const dishById = useMemo(() => {
    const map = new Map<number, PublicDish>();
    menu.categories.forEach((c) => c.dishes.forEach((d) => map.set(d.id, d)));
    return map;
  }, [menu]);

  const totalCount = Object.values(cart).reduce((n, q) => n + q, 0);
  const totalMinor = Object.entries(cart).reduce(
    (sum, [id, q]) => sum + (dishById.get(Number(id))?.price ?? 0) * q,
    0,
  );

  const addOne = (id: number) =>
    setCart((c) => ({ ...c, [id]: (c[id] ?? 0) + 1 }));
  const removeOne = (id: number) =>
    setCart((c) => {
      const next = { ...c };
      const q = (next[id] ?? 0) - 1;
      if (q <= 0) delete next[id];
      else next[id] = q;
      return next;
    });

  const resetOrder = () => {
    setCart({});
    setTable("");
    setPlaced(false);
    setCartOpen(false);
  };

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

  // Lock the page behind the cart sheet and let Escape close it.
  useEffect(() => {
    if (!cartOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setCartOpen(false);
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [cartOpen]);

  const barVisible = ordering && totalCount > 0 && !cartOpen;

  return (
    <div className={`min-h-dvh bg-surface ${barVisible ? "pb-28" : "pb-16"}`}>
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
                const name = pick(locale, dish.name_ru, dish.name_kk) ?? "";
                const qty = cart[dish.id] ?? 0;

                return (
                  <li
                    key={dish.id}
                    className={`overflow-hidden rounded-[18px] border border-border bg-white ${
                      dish.is_available ? "" : "opacity-55"
                    }`}
                  >
                    <div className="flex gap-3 p-3">
                      {dish.image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={dish.image_url}
                          alt={name}
                          loading="lazy"
                          className="h-24 w-24 shrink-0 rounded-[13px] bg-surface-2 object-cover"
                        />
                      ) : null}

                      <div className="flex min-w-0 flex-1 flex-col">
                        <h3 className="text-[16px] font-bold leading-snug">{name}</h3>
                        {description ? (
                          <p className="mt-1 line-clamp-2 text-[13px] leading-snug text-muted-soft">
                            {description}
                          </p>
                        ) : null}
                        {!dish.is_available ? (
                          <span className="mt-1.5 inline-block w-fit rounded-md bg-surface-2 px-2 py-0.5 text-xs font-bold text-muted">
                            {copy.soldOut}
                          </span>
                        ) : null}

                        <div className="mt-auto flex items-center justify-between gap-2 pt-2.5">
                          <span className="whitespace-nowrap text-[16px] font-extrabold text-accent-hover">
                            {formatPrice(dish.price, menu.currency)}
                          </span>

                          {ordering && dish.is_available ? (
                            qty > 0 ? (
                              <div className="flex items-center gap-1 rounded-full bg-accent p-1 text-white">
                                <button
                                  type="button"
                                  onClick={() => removeOne(dish.id)}
                                  aria-label={copy.removeAria}
                                  className="grid h-7 w-7 place-items-center rounded-full transition-colors hover:bg-white/15"
                                >
                                  <Minus size={16} strokeWidth={2.5} />
                                </button>
                                <span className="min-w-5 text-center text-sm font-extrabold tabular-nums">
                                  {qty}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => addOne(dish.id)}
                                  aria-label={copy.addAria}
                                  className="grid h-7 w-7 place-items-center rounded-full transition-colors hover:bg-white/15"
                                >
                                  <Plus size={16} strokeWidth={2.5} />
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => addOne(dish.id)}
                                className="inline-flex items-center gap-1 rounded-full bg-accent-soft px-3.5 py-1.5 text-[13px] font-bold text-accent-hover transition-colors hover:bg-accent hover:text-white"
                              >
                                <Plus size={15} strokeWidth={2.5} />
                                {copy.add}
                              </button>
                            )
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </main>

      {/* Floating order bar — only with items in the cart. */}
      {barVisible ? (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-white/95 backdrop-blur-lg">
          <div className="mx-auto max-w-[680px] px-4 py-3">
            <button
              type="button"
              onClick={() => setCartOpen(true)}
              className="flex w-full items-center justify-between rounded-2xl bg-accent px-5 py-3.5 text-[15px] font-bold text-white shadow-[0_12px_28px_-12px_rgba(255,106,77,0.8)] transition-transform active:scale-[0.99]"
            >
              <span className="flex items-center gap-2">
                <span className="grid h-6 min-w-6 place-items-center rounded-full bg-white/20 px-1.5 text-xs tabular-nums">
                  {totalCount}
                </span>
                {copy.orderBar}
              </span>
              <span className="tabular-nums">{formatPrice(totalMinor, menu.currency)}</span>
            </button>
          </div>
        </div>
      ) : null}

      {/* Cart sheet */}
      {cartOpen ? (
        <div
          className="fixed inset-0 z-40 flex items-end justify-center"
          role="dialog"
          aria-modal="true"
          aria-label={copy.cartTitle}
        >
          <button
            type="button"
            aria-label={copy.close}
            onClick={() => (placed ? resetOrder() : setCartOpen(false))}
            className="absolute inset-0 bg-black/45"
          />

          <div className="relative flex max-h-[88dvh] w-full max-w-[680px] flex-col rounded-t-[26px] bg-surface shadow-[0_-20px_50px_-20px_rgba(0,0,0,0.4)]">
            {placed ? (
              <div className="flex flex-col items-center px-6 py-12 text-center">
                <div className="grid h-16 w-16 place-items-center rounded-full bg-accent-soft text-accent-hover">
                  <Check size={34} strokeWidth={2.5} />
                </div>
                <h2 className="mt-5 text-[22px] font-extrabold tracking-[-0.01em]">
                  {copy.placedTitle}
                </h2>
                <p className="mt-1.5 max-w-[320px] text-[14px] text-muted-soft">
                  {copy.placedText}
                </p>
                {table.trim() ? (
                  <p className="mt-3 rounded-full bg-white px-4 py-1.5 text-sm font-bold">
                    {copy.placedTable} {table.trim()}
                  </p>
                ) : null}
                <p className="mt-4 text-xs text-muted-soft">{copy.demoNote}</p>
                <button
                  type="button"
                  onClick={resetOrder}
                  className="mt-7 w-full rounded-2xl bg-accent py-3.5 text-[15px] font-bold text-white"
                >
                  {copy.done}
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between border-b border-border px-5 py-4">
                  <h2 className="text-[18px] font-extrabold">{copy.cartTitle}</h2>
                  <button
                    type="button"
                    onClick={() => setCartOpen(false)}
                    aria-label={copy.close}
                    className="grid h-8 w-8 place-items-center rounded-full bg-surface-2 text-muted transition-colors hover:text-foreground"
                  >
                    <X size={18} strokeWidth={2.5} />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto px-5 py-3">
                  {totalCount === 0 ? (
                    <p className="py-10 text-center text-muted">{copy.cartEmpty}</p>
                  ) : (
                    <ul className="flex flex-col gap-3">
                      {Object.entries(cart).map(([id, q]) => {
                        const dish = dishById.get(Number(id));
                        if (!dish) return null;
                        const name = pick(locale, dish.name_ru, dish.name_kk) ?? "";
                        return (
                          <li key={id} className="flex items-center gap-3">
                            {dish.image_url ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={dish.image_url}
                                alt={name}
                                loading="lazy"
                                className="h-14 w-14 shrink-0 rounded-xl bg-surface-2 object-cover"
                              />
                            ) : (
                              <div className="h-14 w-14 shrink-0 rounded-xl bg-surface-2" />
                            )}
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-[14px] font-bold">{name}</p>
                              <p className="text-[13px] font-bold text-accent-hover">
                                {formatPrice(dish.price * q, menu.currency)}
                              </p>
                            </div>
                            <div className="flex items-center gap-1 rounded-full bg-white p-1">
                              <button
                                type="button"
                                onClick={() => removeOne(dish.id)}
                                aria-label={copy.removeAria}
                                className="grid h-7 w-7 place-items-center rounded-full text-accent-hover transition-colors hover:bg-accent-soft"
                              >
                                <Minus size={16} strokeWidth={2.5} />
                              </button>
                              <span className="min-w-5 text-center text-sm font-extrabold tabular-nums">
                                {q}
                              </span>
                              <button
                                type="button"
                                onClick={() => addOne(dish.id)}
                                aria-label={copy.addAria}
                                className="grid h-7 w-7 place-items-center rounded-full text-accent-hover transition-colors hover:bg-accent-soft"
                              >
                                <Plus size={16} strokeWidth={2.5} />
                              </button>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>

                {totalCount > 0 ? (
                  <div className="border-t border-border px-5 py-4">
                    <label className="mb-3 flex items-center justify-between gap-3">
                      <span className="text-[14px] font-bold text-muted">
                        {copy.cartTableLabel}
                      </span>
                      <input
                        value={table}
                        onChange={(e) => setTable(e.target.value)}
                        inputMode="numeric"
                        placeholder={copy.cartTablePlaceholder}
                        className="w-32 rounded-xl border border-border bg-white px-3 py-2 text-right text-[14px] font-bold outline-none focus:border-accent"
                      />
                    </label>
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-[15px] text-muted">{copy.cartTotal}</span>
                      <span className="text-[20px] font-extrabold tabular-nums">
                        {formatPrice(totalMinor, menu.currency)}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setPlaced(true)}
                      className="w-full rounded-2xl bg-accent py-3.5 text-[15px] font-bold text-white transition-transform active:scale-[0.99]"
                    >
                      {copy.checkout}
                    </button>
                  </div>
                ) : null}
              </>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
