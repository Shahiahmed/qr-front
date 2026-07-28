"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Minus, Plus, X } from "lucide-react";
import { GuestVenueCover } from "@/components/guest/GuestVenueHero";
import { guestByLocale, type GuestLocale } from "@/content/guest";
import { themeVars } from "@/content/themes";
import {
  clearGuestOrder,
  createOrderTicket,
  loadGuestOrder,
  saveGuestOrder,
  type GuestOrderTicket,
} from "@/lib/guestOrderStorage";
import { formatPrice } from "@/lib/money";
import { pick, type PublicDish, type PublicMenu } from "@/lib/guestMenuTypes";

const LANGUAGES: { code: GuestLocale; label: string }[] = [
  { code: "ru", label: "RU" },
  { code: "kk", label: "KZ" },
];

/**
 * `ordering` turns on the at-the-table cart. Checkout is local-only for now:
 * the cart and the placed ticket live in `localStorage` on this phone so the
 * guest can show the screen to a waiter. Nothing is posted to the API yet.
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
  const sectionRefs = useRef(new Map<number, HTMLElement>());
  const tabRefs = useRef(new Map<number, HTMLButtonElement>());
  const tabsListRef = useRef<HTMLUListElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  // While a tab click is animating, ignore scroll-spy so it cannot snap
  // the highlight back to a previous section (common on the last few).
  const clickLockUntil = useRef(0);

  // dish id → quantity in the order
  const [cart, setCart] = useState<Record<number, number>>({});
  const [cartOpen, setCartOpen] = useState(false);
  const [placed, setPlaced] = useState(false);
  const [table, setTable] = useState("");
  const [ticket, setTicket] = useState<GuestOrderTicket | null>(null);
  // Gate persistence until localStorage has been read — otherwise the first
  // save would wipe a restored ticket with empty state.
  const [hydrated, setHydrated] = useState(false);

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

  // Restore cart / open ticket after a refresh on the same phone.
  useEffect(() => {
    if (!ordering) {
      setHydrated(false);
      return;
    }

    const stored = loadGuestOrder(menu.slug);
    if (stored) {
      setCart(stored.cart);
      setTable(stored.table);
      if (stored.ticket) {
        setTicket(stored.ticket);
        setPlaced(true);
      }
    }
    setHydrated(true);
  }, [ordering, menu.slug]);

  // Persist draft + ticket whenever they change (after first hydrate).
  useEffect(() => {
    if (!ordering || !hydrated) return;
    saveGuestOrder(menu.slug, { cart, table, ticket });
  }, [ordering, menu.slug, hydrated, cart, table, ticket]);

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
    setTicket(null);
    setCartOpen(false);
    clearGuestOrder(menu.slug);
  };

  const placeOrder = () => {
    const lines = Object.entries(cart)
      .map(([id, qty]) => {
        const dish = dishById.get(Number(id));
        if (!dish || qty <= 0) return null;
        return {
          id: dish.id,
          name_ru: dish.name_ru,
          name_kk: dish.name_kk,
          price: dish.price,
          qty,
        };
      })
      .filter((line): line is NonNullable<typeof line> => line !== null);

    if (lines.length === 0) return;

    const nextTicket = createOrderTicket({
      cart,
      table,
      currency: menu.currency,
      lines,
    });

    setTicket(nextTicket);
    setCart({});
    setPlaced(true);
  };

  const headerOffset = () => headerRef.current?.offsetHeight ?? 132;

  /** Slide the tab strip so the active pill sits near the centre. */
  const scrollTabIntoView = (id: number) => {
    const list = tabsListRef.current;
    const tab = tabRefs.current.get(id);
    if (!list || !tab) return;

    // Manual scrollLeft — element.scrollIntoView also nudges the page
    // vertically and is flaky inside a sticky overflow-x strip on mobile.
    const tabOffset =
      tab.getBoundingClientRect().left -
      list.getBoundingClientRect().left +
      list.scrollLeft;
    const target = tabOffset - list.clientWidth / 2 + tab.offsetWidth / 2;
    list.scrollTo({ left: Math.max(0, target), behavior: "smooth" });
  };

  const scrollToSection = (id: number) => {
    const section = sectionRefs.current.get(id);
    if (!section) return;

    setActive(id);
    // Runs only from an onClick, not during render; the lock is wall-clock.
    // eslint-disable-next-line react-hooks/purity
    clickLockUntil.current = Date.now() + 800;
    scrollTabIntoView(id);

    const top =
      window.scrollY + section.getBoundingClientRect().top - headerOffset() - 4;
    window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
  };

  /*
   * Scroll-spy: pick the last section whose top has crossed under the sticky
   * header. Native hash links + IntersectionObserver fought each other here —
   * short trailing sections never reached the observer band, so the highlight
   * jumped back and taps on "Напитки" felt broken.
   */
  useEffect(() => {
    if (sections.length === 0) return;

    const syncActiveFromScroll = () => {
      if (Date.now() < clickLockUntil.current) return;

      const offset = headerOffset() + 8;
      let current = sections[0].id;

      for (const category of sections) {
        const node = sectionRefs.current.get(category.id);
        if (!node) continue;
        if (node.getBoundingClientRect().top <= offset) {
          current = category.id;
        } else {
          break;
        }
      }

      // Near the bottom the last section may never reach the header line —
      // still treat it as current so the final tab lights up.
      const atBottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 24;
      if (atBottom) {
        current = sections[sections.length - 1].id;
      }

      setActive((prev) => {
        if (prev === current) return prev;
        // Defer so the pill has painted as active before we measure it.
        requestAnimationFrame(() => scrollTabIntoView(current));
        return current;
      });
    };

    syncActiveFromScroll();
    window.addEventListener("scroll", syncActiveFromScroll, { passive: true });
    window.addEventListener("resize", syncActiveFromScroll);
    return () => {
      window.removeEventListener("scroll", syncActiveFromScroll);
      window.removeEventListener("resize", syncActiveFromScroll);
    };
    // sections is rebuilt each render; length is enough — demo/menu ids are stable.
  }, [sections.length]);

  // Lock the page behind the cart sheet and let Escape close it.
  // A placed ticket stays in storage — Escape only hides the sheet.
  useEffect(() => {
    if (!cartOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setCartOpen(false);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [cartOpen]);

  const barVisible = ordering && !cartOpen && (totalCount > 0 || Boolean(ticket));
  const lastSectionId = sections[sections.length - 1]?.id;

  return (
    // The theme sets accent CSS vars on the root; every `bg-accent` /
    // `text-accent` below inherits them, so the whole menu recolours at once.
    <div
      style={themeVars(menu.theme)}
      className={`min-h-dvh bg-surface ${barVisible ? "pb-28" : "pb-16"}`}
    >
      <GuestVenueCover menu={menu} copy={copy} />

      <header
        ref={headerRef}
        className="sticky top-0 z-20 border-b border-border bg-white/90 backdrop-blur-lg"
      >
        <div className="mx-auto flex max-w-[680px] items-center justify-between gap-3 px-4 py-3">
          <div className="min-w-0">
            <h1 className="truncate text-[19px] font-extrabold tracking-[-0.02em]">
              {menu.name}
            </h1>
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
            <ul
              ref={tabsListRef}
              className="flex gap-2 overflow-x-auto px-4 pb-2.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {sections.map((category) => (
                <li key={category.id}>
                  <button
                    type="button"
                    ref={(node) => {
                      if (node) tabRefs.current.set(category.id, node);
                      else tabRefs.current.delete(category.id);
                    }}
                    onClick={() => scrollToSection(category.id)}
                    aria-current={active === category.id ? "true" : undefined}
                    className={`inline-block whitespace-nowrap rounded-full px-3.5 py-1.5 text-[13px] font-bold transition-colors ${
                      active === category.id
                        ? "bg-accent text-white"
                        : "bg-surface-2 text-muted"
                    }`}
                  >
                    {pick(locale, category.name_ru, category.name_kk)}
                  </button>
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
              if (node) sectionRefs.current.set(category.id, node);
              else sectionRefs.current.delete(category.id);
            }}
            // Last section stretches so its heading can reach the sticky header.
            className={
              category.id === lastSectionId
                ? "min-h-[calc(100dvh-7.5rem)] pt-7"
                : "pt-7"
            }
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

      {/* Floating order bar — cart in progress, or reopen the waiter ticket. */}
      {barVisible ? (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-white/95 backdrop-blur-lg">
          <div className="mx-auto max-w-[680px] px-4 py-3">
            {ticket && totalCount === 0 ? (
              <button
                type="button"
                onClick={() => {
                  setPlaced(true);
                  setCartOpen(true);
                }}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-accent px-5 py-3.5 text-[15px] font-bold text-white shadow-[0_12px_28px_-12px_rgba(255,106,77,0.8)] transition-transform active:scale-[0.99]"
              >
                {copy.showTicket}
                {ticket.table ? (
                  <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs tabular-nums">
                    {copy.placedTable} {ticket.table}
                  </span>
                ) : null}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setPlaced(false);
                  setCartOpen(true);
                }}
                className="flex w-full items-center justify-between rounded-2xl bg-accent px-5 py-3.5 text-[15px] font-bold text-white shadow-[0_12px_28px_-12px_rgba(255,106,77,0.8)] transition-transform active:scale-[0.99]"
              >
                <span className="flex items-center gap-2">
                  <span className="grid h-6 min-w-6 place-items-center rounded-full bg-white/20 px-1.5 text-xs tabular-nums">
                    {totalCount}
                  </span>
                  {copy.orderBar}
                </span>
                <span className="tabular-nums">
                  {formatPrice(totalMinor, menu.currency)}
                </span>
              </button>
            )}
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
            onClick={() => setCartOpen(false)}
            className="absolute inset-0 bg-black/45"
          />

          <div className="relative flex max-h-[88dvh] w-full max-w-[680px] flex-col rounded-t-[26px] bg-surface shadow-[0_-20px_50px_-20px_rgba(0,0,0,0.4)]">
            {placed && ticket ? (
              <div className="flex flex-col overflow-y-auto px-5 pb-6 pt-5">
                <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-accent-soft text-accent-hover">
                  <Check size={28} strokeWidth={2.5} />
                </div>
                <h2 className="mt-4 text-center text-[22px] font-extrabold tracking-[-0.01em]">
                  {copy.placedTitle}
                </h2>
                <p className="mt-1.5 text-center text-[14px] text-muted-soft">
                  {copy.placedText}
                </p>

                {ticket.table ? (
                  <p className="mt-4 text-center text-[42px] font-extrabold tabular-nums tracking-[-0.03em]">
                    {copy.placedTable} {ticket.table}
                  </p>
                ) : null}

                <ul className="mt-5 flex flex-col gap-2.5 rounded-2xl border border-border bg-white p-4">
                  {ticket.items.length === 0 ? (
                    <li className="py-4 text-center text-muted">{copy.ticketEmpty}</li>
                  ) : (
                    ticket.items.map((line) => {
                      const name =
                        pick(locale, line.name_ru, line.name_kk) ?? line.name_ru;
                      return (
                        <li
                          key={line.id}
                          className="flex items-start justify-between gap-3 text-[15px]"
                        >
                          <span className="min-w-0 font-bold">
                            {name}{" "}
                            <span className="text-muted-soft">× {line.qty}</span>
                          </span>
                          <span className="shrink-0 font-extrabold tabular-nums text-accent-hover">
                            {formatPrice(line.price * line.qty, ticket.currency)}
                          </span>
                        </li>
                      );
                    })
                  )}
                  <li className="mt-1 flex items-center justify-between border-t border-border pt-3">
                    <span className="text-[15px] text-muted">{copy.cartTotal}</span>
                    <span className="text-[20px] font-extrabold tabular-nums">
                      {formatPrice(ticket.totalMinor, ticket.currency)}
                    </span>
                  </li>
                </ul>

                <p className="mt-4 text-center text-xs text-muted-soft">
                  {copy.localNote}
                </p>

                <button
                  type="button"
                  onClick={resetOrder}
                  className="mt-5 w-full rounded-2xl bg-accent py-3.5 text-[15px] font-bold text-white"
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
                      onClick={placeOrder}
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
