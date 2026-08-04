"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Check, Minus, Plus, Settings2, ShoppingBag, X } from "lucide-react";
import { GuestVenueCover } from "@/components/guest/GuestVenueHero";
import { guestByLocale, type GuestLocale } from "@/content/guest";
import { getLayout, MENU_LAYOUTS, type LayoutKey } from "@/content/layouts";
import { getTheme, MENU_THEMES, themeVars, type ThemeKey } from "@/content/themes";
import {
  clearGuestOrder,
  createOrderTicket,
  loadGuestOrder,
  saveGuestOrder,
  type GuestOrderTicket,
} from "@/lib/guestOrderStorage";
import { loadGuestPrefs, saveGuestPrefs } from "@/lib/guestPrefs";
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

  // The owner's theme / layout are only the default — the guest can override
  // them in the Settings sheet, and the choice is stored per-slug on this phone
  // (see the hydrate effect below). SSR and the first client render use the
  // owner's value, so there is no hydration mismatch; stored prefs apply after.
  const [theme, setTheme] = useState<ThemeKey>(() => getTheme(menu.theme).key);
  const [layoutKey, setLayoutKey] = useState<LayoutKey>(() =>
    getLayout(menu.layout),
  );
  const [settingsOpen, setSettingsOpen] = useState(false);
  const layout = getLayout(layoutKey);

  const pickTheme = (key: ThemeKey) => {
    setTheme(key);
    saveGuestPrefs(menu.slug, { theme: key, layout: layoutKey });
  };
  const pickLayout = (key: LayoutKey) => {
    setLayoutKey(key);
    saveGuestPrefs(menu.slug, { theme, layout: key });
  };

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

  // Apply the guest's own look choice (stored on this phone). Deliberately in
  // an effect, not a lazy initializer: reading localStorage during render would
  // diverge from the server HTML (owner default) and trip a hydration error, so
  // the owner's default paints first and the stored choice overrides after.
  useEffect(() => {
    const prefs = loadGuestPrefs(menu.slug);
    if (!prefs) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- client-only sync, see above
    if (prefs.theme) setTheme(getTheme(prefs.theme).key);
    if (prefs.layout) setLayoutKey(getLayout(prefs.layout));
  }, [menu.slug]);

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

  // Lock the page behind any bottom sheet (cart or settings) and let Escape
  // close it. A placed ticket stays in storage — Escape only hides the sheet.
  const anySheetOpen = cartOpen || settingsOpen;
  useEffect(() => {
    if (!anySheetOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setCartOpen(false);
        setSettingsOpen(false);
      }
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [anySheetOpen]);

  const barVisible = ordering && !cartOpen && (totalCount > 0 || Boolean(ticket));
  const lastSectionId = sections[sections.length - 1]?.id;
  const about = pick(
    locale,
    menu.description_ru ?? null,
    menu.description_kk ?? null,
  )?.trim() || null;

  return (
    // The theme sets accent CSS vars on the root; every `bg-accent` /
    // `text-accent` below inherits them, so the whole menu recolours at once.
    // `theme` is the guest's choice (defaults to the owner's), not `menu.theme`.
    <div
      style={themeVars(theme)}
      className={`min-h-dvh bg-surface ${barVisible ? "pb-44" : "pb-24"}`}
    >
      <GuestVenueCover menu={menu} copy={copy} />

      {about ? (
        <div className="border-b border-border bg-white px-4 py-3.5">
          <p className="mx-auto max-w-[680px] text-[14px] leading-relaxed text-muted">
            {about}
          </p>
        </div>
      ) : null}

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
            // No min-height stretch: it left a huge empty band under short
            // trailing sections (and under the Qmenu credit). Last-tab
            // highlighting uses the at-bottom scroll-spy instead.
            className="pt-7"
          >
            <h2 className="mb-3 text-[17px] font-extrabold uppercase tracking-[0.06em] text-muted">
              {pick(locale, category.name_ru, category.name_kk)}
            </h2>

            <DishList
              dishes={category.dishes}
              layout={layout}
              locale={locale}
              currency={menu.currency}
              ordering={ordering}
              cart={cart}
              onAdd={addOne}
              onRemove={removeOne}
              copy={copy}
            />

            {category.id === lastSectionId ? (
              <div className="pt-8">
                <PoweredByFooter locale={locale} copy={copy} />
              </div>
            ) : null}
          </section>
        ))}

        {sections.length === 0 ? (
          <div className="pt-6">
            <PoweredByFooter locale={locale} copy={copy} />
          </div>
        ) : null}
      </main>

      {/*
        Bottom dock: the persistent nav (Menu · Cart · Settings), with the order
        CTA stacked above it when a cart / ticket is in play. The nav is always
        present so guests can always reach Settings; the cart tab only appears
        when ordering is on. Sheets (z-40) cover the whole dock while open.
      */}
      <div className="fixed inset-x-0 bottom-0 z-30">
        {barVisible ? (
          <div className="border-t border-border bg-white/95 backdrop-blur-lg">
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

        <nav
          aria-label={copy.navMenu}
          className="border-t border-border bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-lg"
        >
          <div className="mx-auto flex max-w-[680px] items-stretch justify-center gap-3 px-2 py-1.5">
            {ordering ? (
              <NavButton
                icon={<ShoppingBag size={20} strokeWidth={2} />}
                label={copy.navCart}
                badge={totalCount > 0 ? totalCount : undefined}
                onClick={() => {
                  setSettingsOpen(false);
                  setPlaced(Boolean(ticket) && totalCount === 0);
                  setCartOpen(true);
                }}
              />
            ) : null}
            <NavButton
              icon={<Settings2 size={20} strokeWidth={2} />}
              label={copy.navSettings}
              onClick={() => {
                setCartOpen(false);
                setSettingsOpen(true);
              }}
            />
          </div>
        </nav>
      </div>

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
                    {/* Table number: hidden until per-table QR codes exist. */}
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

      {/* Settings sheet — the guest tunes colour + layout for themselves. */}
      {settingsOpen ? (
        <div
          className="fixed inset-0 z-40 flex items-end justify-center"
          role="dialog"
          aria-modal="true"
          aria-label={copy.settingsTitle}
        >
          <button
            type="button"
            aria-label={copy.close}
            onClick={() => setSettingsOpen(false)}
            className="absolute inset-0 bg-black/45"
          />

          <div className="relative flex max-h-[88dvh] w-full max-w-[680px] flex-col rounded-t-[26px] bg-surface shadow-[0_-20px_50px_-20px_rgba(0,0,0,0.4)]">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <h2 className="text-[18px] font-extrabold">{copy.settingsTitle}</h2>
              <button
                type="button"
                onClick={() => setSettingsOpen(false)}
                aria-label={copy.close}
                className="grid h-8 w-8 place-items-center rounded-full bg-surface-2 text-muted transition-colors hover:text-foreground"
              >
                <X size={18} strokeWidth={2.5} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4">
              <p className="mb-2.5 text-[13px] font-bold uppercase tracking-[0.06em] text-muted">
                {copy.settingsColor}
              </p>
              <div className="mb-6 flex flex-wrap gap-2.5">
                {MENU_THEMES.map((preset) => {
                  const selected = theme === preset.key;
                  const label = locale === "kk" ? preset.labelKk : preset.labelRu;
                  return (
                    <button
                      key={preset.key}
                      type="button"
                      onClick={() => pickTheme(preset.key)}
                      aria-pressed={selected}
                      aria-label={label}
                      title={label}
                      className={`grid h-11 w-11 place-items-center rounded-full text-white transition-transform active:scale-95 ${
                        selected
                          ? "ring-2 ring-foreground ring-offset-2 ring-offset-surface"
                          : ""
                      }`}
                      style={{ background: preset.accent }}
                    >
                      {selected ? <Check size={20} strokeWidth={3} /> : null}
                    </button>
                  );
                })}
              </div>

              <p className="mb-2.5 text-[13px] font-bold uppercase tracking-[0.06em] text-muted">
                {copy.settingsDesign}
              </p>
              <div className="grid grid-cols-3 gap-2.5">
                {MENU_LAYOUTS.map((preset) => {
                  const selected = layoutKey === preset.key;
                  return (
                    <button
                      key={preset.key}
                      type="button"
                      onClick={() => pickLayout(preset.key)}
                      aria-pressed={selected}
                      className={`flex flex-col gap-2 rounded-2xl border p-2.5 text-left transition-colors ${
                        selected
                          ? "border-foreground bg-white"
                          : "border-border hover:bg-white"
                      }`}
                    >
                      <LayoutPreview layout={preset.key} />
                      <span className="flex items-center gap-1">
                        <span className="text-[12px] font-bold leading-tight">
                          {locale === "kk" ? preset.labelKk : preset.labelRu}
                        </span>
                        {selected ? (
                          <Check
                            size={14}
                            strokeWidth={3}
                            className="ml-auto shrink-0 text-accent-hover"
                          />
                        ) : null}
                      </span>
                    </button>
                  );
                })}
              </div>

              <p className="mt-5 text-center text-xs text-muted-soft">
                {copy.settingsHint}
              </p>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

/** One tab in the persistent bottom nav. */
function NavButton({
  icon,
  label,
  onClick,
  badge,
}: {
  icon: ReactNode;
  label: string;
  onClick: () => void;
  badge?: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-w-21 flex-col items-center gap-1 rounded-xl px-4 py-1.5 text-muted transition-colors hover:text-foreground"
    >
      <span className="relative">
        {icon}
        {badge ? (
          <span className="absolute -right-2 -top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-accent px-1 text-[10px] font-extrabold leading-none text-white tabular-nums">
            {badge}
          </span>
        ) : null}
      </span>
      <span className="text-[11px] font-bold leading-none">{label}</span>
    </button>
  );
}

/**
 * Tiny schematic of a layout — bars stand in for photos and text so the guest
 * recognises the arrangement at a glance. The "photo" blocks use `bg-accent`,
 * so they inherit the guest's chosen `--accent` and recolour live when the
 * colour is switched in the same sheet. (The owner-side copy stays neutral.)
 */
function LayoutPreview({ layout }: { layout: LayoutKey }) {
  if (layout === "grid") {
    return (
      <div className="grid h-16 grid-cols-2 grid-rows-2 gap-1.5 rounded-lg border border-border bg-white p-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-1">
            <div className="flex-1 rounded bg-accent" />
            <div className="h-1 w-3/4 rounded bg-border" />
          </div>
        ))}
      </div>
    );
  }

  if (layout === "compact") {
    return (
      <div className="flex h-16 flex-col justify-center gap-2 rounded-lg border border-border bg-white px-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <div className="h-2.5 w-2.5 shrink-0 rounded bg-accent" />
            <div className="h-1.5 flex-1 rounded bg-border" />
            <div className="h-1.5 w-3 shrink-0 rounded bg-border-strong" />
          </div>
        ))}
      </div>
    );
  }

  // classic
  return (
    <div className="flex h-16 flex-col gap-1.5 rounded-lg border border-border bg-white p-2">
      {Array.from({ length: 2 }).map((_, i) => (
        <div key={i} className="flex flex-1 items-center gap-1.5">
          <div className="h-full w-1/4 shrink-0 rounded bg-accent" />
          <div className="flex flex-1 flex-col gap-1">
            <div className="h-1.5 w-3/4 rounded bg-border-strong" />
            <div className="h-1.5 w-1/2 rounded bg-border" />
          </div>
        </div>
      ))}
    </div>
  );
}

type GuestCopy = (typeof guestByLocale)[GuestLocale];

/**
 * Renders a category's dishes in the venue's chosen layout. Only the wrapper
 * and card shape change — the data, ordering and theme are identical across
 * layouts, so switching preset never touches behaviour.
 */
function DishList({
  dishes,
  layout,
  locale,
  currency,
  ordering,
  cart,
  onAdd,
  onRemove,
  copy,
}: {
  dishes: PublicDish[];
  layout: LayoutKey;
  locale: GuestLocale;
  currency: string;
  ordering: boolean;
  cart: Record<number, number>;
  onAdd: (id: number) => void;
  onRemove: (id: number) => void;
  copy: GuestCopy;
}) {
  const containerClass =
    layout === "grid"
      ? "grid grid-cols-2 gap-2.5"
      : layout === "compact"
        ? "flex flex-col divide-y divide-border overflow-hidden rounded-[18px] border border-border bg-white"
        : "flex flex-col gap-2.5";

  return (
    <ul className={containerClass}>
      {dishes.map((dish) => (
        <DishCard
          key={dish.id}
          dish={dish}
          layout={layout}
          locale={locale}
          currency={currency}
          ordering={ordering}
          qty={cart[dish.id] ?? 0}
          onAdd={onAdd}
          onRemove={onRemove}
          copy={copy}
        />
      ))}
    </ul>
  );
}

function DishCard({
  dish,
  layout,
  locale,
  currency,
  ordering,
  qty,
  onAdd,
  onRemove,
  copy,
}: {
  dish: PublicDish;
  layout: LayoutKey;
  locale: GuestLocale;
  currency: string;
  ordering: boolean;
  qty: number;
  onAdd: (id: number) => void;
  onRemove: (id: number) => void;
  copy: GuestCopy;
}) {
  const name = pick(locale, dish.name_ru, dish.name_kk) ?? "";
  const description = pick(locale, dish.description_ru, dish.description_kk);
  const dim = dish.is_available ? "" : "opacity-55";

  const price = (
    <span className="whitespace-nowrap text-[16px] font-extrabold text-accent-hover">
      {formatPrice(dish.price, currency)}
    </span>
  );

  const soldOut = !dish.is_available ? (
    <span className="mt-1.5 inline-block w-fit rounded-md bg-surface-2 px-2 py-0.5 text-xs font-bold text-muted">
      {copy.soldOut}
    </span>
  ) : null;

  const controls =
    ordering && dish.is_available ? (
      <OrderControls
        dish={dish}
        qty={qty}
        onAdd={onAdd}
        onRemove={onRemove}
        copy={copy}
      />
    ) : null;

  if (layout === "grid") {
    // Photo-forward: image on top, details below. Two per row (set on the ul).
    return (
      <li
        className={`flex flex-col overflow-hidden rounded-[18px] border border-border bg-white ${dim}`}
      >
        {dish.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={dish.image_url}
            alt={name}
            loading="lazy"
            className="aspect-square w-full bg-surface-2 object-cover"
          />
        ) : null}
        <div className="flex flex-1 flex-col p-3">
          <h3 className="text-[15px] font-bold leading-snug">{name}</h3>
          {description ? (
            <p className="mt-1 line-clamp-2 text-[12px] leading-snug text-muted-soft">
              {description}
            </p>
          ) : null}
          {soldOut}
          <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-2.5">
            {price}
            {controls}
          </div>
        </div>
      </li>
    );
  }

  if (layout === "compact") {
    // Dense text-first row: small thumbnail, price on the right, hairline
    // dividers (set on the ul) instead of separate cards.
    return (
      <li className={`flex items-center gap-3 px-3.5 py-3 ${dim}`}>
        {dish.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={dish.image_url}
            alt={name}
            loading="lazy"
            className="h-12 w-12 shrink-0 rounded-xl bg-surface-2 object-cover"
          />
        ) : null}
        <div className="min-w-0 flex-1">
          <h3 className="text-[15px] font-bold leading-snug">{name}</h3>
          {description ? (
            <p className="mt-0.5 line-clamp-1 text-[12px] leading-snug text-muted-soft">
              {description}
            </p>
          ) : null}
          {soldOut}
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1.5">
          {price}
          {controls}
        </div>
      </li>
    );
  }

  // classic — photo-left card, one per row.
  return (
    <li
      className={`overflow-hidden rounded-[18px] border border-border bg-white ${dim}`}
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
          {soldOut}

          <div className="mt-auto flex items-center justify-between gap-2 pt-2.5">
            {price}
            {controls}
          </div>
        </div>
      </div>
    </li>
  );
}

/** Quantity stepper / add button — identical in every layout. */
function OrderControls({
  dish,
  qty,
  onAdd,
  onRemove,
  copy,
}: {
  dish: PublicDish;
  qty: number;
  onAdd: (id: number) => void;
  onRemove: (id: number) => void;
  copy: GuestCopy;
}) {
  if (qty > 0) {
    return (
      <div className="flex items-center gap-1 rounded-full bg-accent p-1 text-white">
        <button
          type="button"
          onClick={() => onRemove(dish.id)}
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
          onClick={() => onAdd(dish.id)}
          aria-label={copy.addAria}
          className="grid h-7 w-7 place-items-center rounded-full transition-colors hover:bg-white/15"
        >
          <Plus size={16} strokeWidth={2.5} />
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => onAdd(dish.id)}
      className="inline-flex items-center gap-1 rounded-full bg-accent-soft px-3.5 py-1.5 text-[13px] font-bold text-accent-hover transition-colors hover:bg-accent hover:text-white"
    >
      <Plus size={15} strokeWidth={2.5} />
      {copy.add}
    </button>
  );
}

function PoweredByFooter({
  locale,
  copy,
}: {
  locale: GuestLocale;
  copy: (typeof guestByLocale)[GuestLocale];
}) {
  return (
    <footer className="border-t border-border/70 pt-5">
      <a
        href={`/${locale === "kk" ? "kz" : "ru"}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={copy.poweredByAria}
        className="mx-auto flex w-fit items-center gap-1.5 text-muted-soft no-underline transition-colors hover:text-muted"
      >
        <span
          className="grid h-4 w-4 place-items-center rounded-[5px] bg-[linear-gradient(140deg,#ff8a70,#ff6a4d_55%,#f0a83c)] text-[9px] font-extrabold leading-none text-white"
          aria-hidden
        >
          Q
        </span>
        <span className="text-[11px] font-medium tracking-[0.02em]">
          {copy.poweredBy}
        </span>
      </a>
    </footer>
  );
}
