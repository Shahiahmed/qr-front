"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowDown,
  ArrowUp,
  Eye,
  EyeOff,
  ExternalLink,
  FolderPlus,
  Palette,
  Pencil,
  Plus,
  SlidersHorizontal,
  Sparkles,
  Trash2,
  UtensilsCrossed,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { Button } from "@/components/landing/ui/Button";
import { CategoryDialog } from "@/components/panel/CategoryDialog";
import { DishDialog } from "@/components/panel/DishDialog";
import { PanelPageHeader } from "@/components/panel/PanelPageHeader";
import { RowMenu } from "@/components/panel/RowMenu";
import { VenueDesignPanel } from "@/components/panel/VenueDesignPanel";
import type { Locale } from "@/content/landing";
import { menuByLocale, type MenuCopy } from "@/content/menu";
import {
  applyMenuStarter,
  deleteCategory,
  deleteDish,
  reorderCategories,
  updateDish,
  type Dish,
  type Establishment,
  type MenuCategory,
} from "@/lib/api";
import { menuQueryKey, useMenu } from "@/lib/menu";
import { formatPrice } from "@/lib/money";

type DialogState =
  | { kind: "none" }
  | { kind: "category"; category?: MenuCategory }
  | { kind: "dish"; categoryId: number; dish?: Dish };

type EditorTab = "menu" | "look" | "contacts";

export function MenuEditor({
  locale,
  establishmentId,
  currency,
  slug,
  venue,
}: {
  locale: Locale;
  establishmentId: number;
  currency: string;
  slug?: string;
  /** Loaded lazily from the venue list; design tabs wait on it. */
  venue?: Establishment;
}) {
  const copy = menuByLocale[locale];
  const queryClient = useQueryClient();
  const { data: categories, isPending, error } = useMenu(establishmentId);

  const [tab, setTab] = useState<EditorTab>("menu");
  const [dialog, setDialog] = useState<DialogState>({ kind: "none" });

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: menuQueryKey(establishmentId) });

  const fillStarter = useMutation({
    mutationFn: () => applyMenuStarter(establishmentId, locale),
    onSuccess: (menu) => {
      queryClient.setQueryData(menuQueryKey(establishmentId), menu);
    },
  });

  /*
   * The stop list is sold as one tap, so it cannot wait on a round trip:
   * flip the dish in the cache immediately and reconcile afterwards.
   */
  const toggleStop = useMutation({
    mutationFn: (dish: Dish) =>
      updateDish(establishmentId, dish.id, { is_available: !dish.is_available }, locale),

    onMutate: async (dish: Dish) => {
      const key = menuQueryKey(establishmentId);
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<MenuCategory[]>(key);

      queryClient.setQueryData<MenuCategory[]>(key, (categories) =>
        categories?.map((category) => ({
          ...category,
          dishes: category.dishes?.map((item) =>
            item.id === dish.id ? { ...item, is_available: !item.is_available } : item,
          ),
        })),
      );

      return { previous };
    },

    onError: (_error, _dish, context) => {
      if (context?.previous) {
        queryClient.setQueryData(menuQueryKey(establishmentId), context.previous);
      }
    },

    onSettled: invalidate,
  });

  const toggleVisible = useMutation({
    mutationFn: (dish: Dish) =>
      updateDish(establishmentId, dish.id, { is_visible: !dish.is_visible }, locale),

    onMutate: async (dish: Dish) => {
      const key = menuQueryKey(establishmentId);
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<MenuCategory[]>(key);

      queryClient.setQueryData<MenuCategory[]>(key, (categories) =>
        categories?.map((category) => ({
          ...category,
          dishes: category.dishes?.map((item) =>
            item.id === dish.id ? { ...item, is_visible: !item.is_visible } : item,
          ),
        })),
      );

      return { previous };
    },

    onError: (_error, _dish, context) => {
      if (context?.previous) {
        queryClient.setQueryData(menuQueryKey(establishmentId), context.previous);
      }
    },

    onSettled: invalidate,
  });

  /*
   * Section order is optimistic like the stop list — the arrows must feel
   * instant. Reorder the cache now, send the new id order, reconcile after.
   */
  const reorder = useMutation({
    mutationFn: (ids: number[]) => reorderCategories(establishmentId, ids, locale),

    onMutate: async (ids: number[]) => {
      const key = menuQueryKey(establishmentId);
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<MenuCategory[]>(key);

      queryClient.setQueryData<MenuCategory[]>(key, (cats) => {
        if (!cats) return cats;
        const byId = new Map(cats.map((c) => [c.id, c]));
        return ids
          .map((id) => byId.get(id))
          .filter((c): c is MenuCategory => Boolean(c));
      });

      return { previous };
    },

    onError: (_error, _ids, context) => {
      if (context?.previous) {
        queryClient.setQueryData(menuQueryKey(establishmentId), context.previous);
      }
    },

    onSettled: invalidate,
  });

  const removeDish = useMutation({
    mutationFn: (id: number) => deleteDish(establishmentId, id),
    onSuccess: invalidate,
  });

  const removeCategory = useMutation({
    mutationFn: (id: number) => deleteCategory(establishmentId, id),
    onSuccess: invalidate,
  });

  const list = categories ?? [];

  const moveCategory = (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= list.length) return;
    const next = [...list];
    [next[index], next[target]] = [next[target], next[index]];
    reorder.mutate(next.map((c) => c.id));
  };

  const tabs: { id: EditorTab; label: string; icon: ReactNode }[] = [
    {
      id: "menu",
      label: copy.tabMenu,
      icon: <UtensilsCrossed size={16} strokeWidth={2.25} />,
    },
    {
      id: "look",
      label: copy.tabLook,
      icon: <Palette size={16} strokeWidth={2.25} />,
    },
    {
      id: "contacts",
      label: copy.tabContacts,
      icon: <SlidersHorizontal size={16} strokeWidth={2.25} />,
    },
  ];

  return (
    <>
      {/* One header row: which venue on the left, the guest-menu link on the
          right. The "back" link is dropped — the global "Venues" tab above
          already goes there, and the section is named by the tabs below. */}
      <PanelPageHeader
        title={venue?.name ?? copy.title}
        actions={
          slug ? (
            <a
              href={`/m/${slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-10 items-center gap-1.5 rounded-[12px] border border-border-strong bg-white px-3.5 text-[14px] font-bold transition-colors hover:border-foreground"
            >
              {copy.openGuestMenu}
              <ExternalLink size={14} className="text-accent-hover" />
            </a>
          ) : null
        }
      />

      <nav
        aria-label={copy.title}
        className="mb-6 flex gap-1 overflow-x-auto rounded-[14px] bg-surface-2 p-1 scrollbar-none sm:inline-flex"
      >
        {tabs.map((item) => {
          const active = tab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              aria-current={active ? "page" : undefined}
              // Quiet segmented control: the selected tab is a white chip, not
              // a brand-filled block — the page's orange stays for actions.
              className={`inline-flex min-h-11 min-w-0 flex-auto items-center justify-center gap-1.5 rounded-[11px] px-2.5 py-2 text-[13px] font-bold transition-colors sm:flex-none sm:px-5 sm:text-[14px] ${
                active
                  ? "bg-white text-foreground shadow-[0_1px_3px_rgba(20,18,16,0.1)]"
                  : "text-muted hover:text-foreground"
              }`}
            >
              {/* Narrow phones: words only — «Оформление» doesn't fit with an icon. */}
              <span className={`hidden shrink-0 xs:inline ${active ? "text-accent-hover" : ""}`}>{item.icon}</span>
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {tab === "look" ? (
        venue ? (
          <div className="max-w-[960px]"><VenueDesignPanel locale={locale} venue={venue} section="look" /></div>
        ) : (
          <div className="h-48 animate-pulse rounded-[20px] bg-surface-2" />
        )
      ) : null}

      {tab === "contacts" ? (
        venue ? (
          <div className="max-w-[960px]"><VenueDesignPanel locale={locale} venue={venue} section="contacts" /></div>
        ) : (
          <div className="h-48 animate-pulse rounded-[20px] bg-surface-2" />
        )
      ) : null}

      {tab === "menu" ? (
        <MenuSections
          copy={copy}
          isPending={isPending}
          error={error}
          list={list}
          currency={currency}
          limits={venue?.menu_limits}
          fillStarter={fillStarter}
          moveCategory={moveCategory}
          onAddCategory={() => setDialog({ kind: "category" })}
          onEditCategory={(category) => setDialog({ kind: "category", category })}
          onDeleteCategory={(id) => {
            if (window.confirm(copy.deleteCategoryConfirm)) {
              removeCategory.mutate(id);
            }
          }}
          onAddDish={(categoryId) => setDialog({ kind: "dish", categoryId })}
          onEditDish={(categoryId, dish) =>
            setDialog({ kind: "dish", categoryId, dish })
          }
          onDeleteDish={(id) => {
            if (window.confirm(copy.deleteDishConfirm)) {
              removeDish.mutate(id);
            }
          }}
          onToggleStop={(dish) => toggleStop.mutate(dish)}
          onToggleVisible={(dish) => toggleVisible.mutate(dish)}
        />
      ) : null}

      {dialog.kind === "category" ? (
        <CategoryDialog
          locale={locale}
          establishmentId={establishmentId}
          category={dialog.category}
          onClose={() => setDialog({ kind: "none" })}
        />
      ) : null}

      {dialog.kind === "dish" ? (
        <DishDialog
          locale={locale}
          establishmentId={establishmentId}
          categories={list}
          categoryId={dialog.categoryId}
          dish={dialog.dish}
          onClose={() => setDialog({ kind: "none" })}
        />
      ) : null}
    </>
  );
}

function MenuSections({
  copy,
  isPending,
  error,
  list,
  currency,
  limits,
  fillStarter,
  moveCategory,
  onAddCategory,
  onEditCategory,
  onDeleteCategory,
  onAddDish,
  onEditDish,
  onDeleteDish,
  onToggleStop,
  onToggleVisible,
}: {
  copy: MenuCopy;
  isPending: boolean;
  error: Error | null;
  list: MenuCategory[];
  currency: string;
  /** Content caps from the effective plan; free tier limits sections/dishes. */
  limits?: { categories: number | null; dishes_per_category: number | null };
  fillStarter: {
    mutate: () => void;
    isPending: boolean;
    isError: boolean;
    error: Error | null;
  };
  moveCategory: (index: number, dir: -1 | 1) => void;
  onAddCategory: () => void;
  onEditCategory: (category: MenuCategory) => void;
  onDeleteCategory: (id: number) => void;
  onAddDish: (categoryId: number) => void;
  onEditDish: (categoryId: number, dish: Dish) => void;
  onDeleteDish: (id: number) => void;
  onToggleStop: (dish: Dish) => void;
  onToggleVisible: (dish: Dish) => void;
}) {
  if (isPending) {
    return (
      <div aria-busy="true" className="flex max-w-[960px] flex-col gap-5">
        {[0, 1].map((k) => (
          <div key={k} className="h-48 animate-pulse rounded-[20px] bg-surface-2" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <p role="alert" className="max-w-[960px] rounded-[20px] border border-red-200 bg-red-50 p-6 text-red-900">
        {String(error.message)}
      </p>
    );
  }

  // Free-tier caps. `null` = unlimited; the button dims and a hint appears when
  // the count reaches the cap (the server is the real gate — see controllers).
  const categoryLimit = limits?.categories ?? null;
  const dishLimit = limits?.dishes_per_category ?? null;
  const categoryLimitReached =
    categoryLimit !== null && list.length >= categoryLimit;

  const dishes = list.flatMap((category) => category.dishes ?? []);
  const stopped = dishes.filter((dish) => !dish.is_available).length;

  if (list.length === 0) {
    // First run: one clear primary (the starter), the manual path second.
    return (
      <div className="max-w-[960px] rounded-[20px] border border-dashed border-border-strong bg-white/60 px-6 py-10 text-center">
        <p className="text-[17px] font-bold">{copy.empty}</p>
        <p className="mx-auto mt-1.5 max-w-md text-[15px] text-muted">{copy.emptyHint}</p>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
          <Button
            variant="primary"
            onClick={() => fillStarter.mutate()}
            disabled={fillStarter.isPending}
            className="h-11 py-0 text-[15px]"
          >
            <Sparkles size={17} aria-hidden />
            {fillStarter.isPending ? copy.fillingStarter : copy.fillStarter}
          </Button>
          <Button variant="secondary" onClick={onAddCategory} className="h-11 py-0 text-[15px]">
            <FolderPlus size={17} aria-hidden />
            {copy.addCategoryManual}
          </Button>
        </div>
        {fillStarter.isError ? (
          <p role="alert" className="mt-3 text-sm text-red-700">
            {fillStarter.error instanceof Error
              ? fillStarter.error.message
              : String(fillStarter.error)}
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <div className="max-w-[960px]">
      {/* Toolbar: where the menu stands on the left, the rare «add section»
          on the right — secondary, so the page has no competing orange. */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
        <p className="text-[14px] text-muted">
          {copy.menuSummary
            .replace("{c}", String(list.length))
            .replace("{d}", String(dishes.length))}
          {stopped > 0 ? (
            <span className="font-semibold text-red-700">
              {" · "}
              {copy.stopSummary.replace("{n}", String(stopped))}
            </span>
          ) : null}
        </p>
        <div className="flex flex-wrap items-center gap-3">
          {categoryLimitReached ? (
            <p className="text-[13px] font-medium text-muted">
              {copy.categoryLimitReached.replace("{n}", String(categoryLimit))}
            </p>
          ) : null}
          <Button
            variant="secondary"
            onClick={onAddCategory}
            disabled={categoryLimitReached}
            className="h-10 px-4 py-0 text-[14px]"
          >
            <FolderPlus size={16} aria-hidden />
            {copy.addCategory}
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-5">
        {list.map((category, index) => {
          const categoryDishes = category.dishes ?? [];
          const dishLimitReached =
            dishLimit !== null && categoryDishes.length >= dishLimit;
          // Reordering and editing are rare — they live in the section's «⋯»
          // so the header shows only the name and the frequent «add dish».
          const sectionActions = [
            {
              label: copy.editCategory,
              icon: <Pencil size={16} />,
              onClick: () => onEditCategory(category),
            },
            ...(index > 0
              ? [{ label: copy.moveUp, icon: <ArrowUp size={16} />, onClick: () => moveCategory(index, -1) }]
              : []),
            ...(index < list.length - 1
              ? [{ label: copy.moveDown, icon: <ArrowDown size={16} />, onClick: () => moveCategory(index, 1) }]
              : []),
            {
              label: copy.deleteCategory,
              icon: <Trash2 size={16} />,
              onClick: () => onDeleteCategory(category.id),
              danger: true,
            },
          ];

          return (
            <section
              key={category.id}
              aria-labelledby={`category-${category.id}`}
              className="rounded-[20px] border border-border bg-white px-4 pb-2 pt-4 sm:px-5 sm:pt-5"
            >
              <header className="flex items-start gap-3 border-b border-border pb-3 sm:items-center sm:pb-4">
                <div className="min-w-0 flex-1">
                  <h2
                    id={`category-${category.id}`}
                    className="text-[18px] font-extrabold leading-snug tracking-[-0.02em] sm:text-[19px]"
                  >
                    {category.name_ru}
                  </h2>
                  {category.name_kk ? (
                    <p className="text-[14px] text-muted-soft">{category.name_kk}</p>
                  ) : null}
                </div>

                <Button
                  variant="secondary"
                  onClick={() => onAddDish(category.id)}
                  disabled={dishLimitReached}
                  aria-label={copy.addDish}
                  className="h-10 shrink-0 px-3 py-0 text-[14px]"
                >
                  <Plus size={16} aria-hidden />
                  {/* Child span, so the §7 hidden-on-Button quirk doesn't apply. */}
                  <span className="hidden sm:inline">{copy.addDish}</span>
                </Button>

                <RowMenu label={`${copy.moreActions}: ${category.name_ru}`} items={sectionActions} />
              </header>

              {dishLimitReached ? (
                <p className="mt-3 text-[13px] font-medium text-muted">
                  {copy.dishLimitReached.replace("{n}", String(dishLimit))}
                </p>
              ) : null}

              {categoryDishes.length === 0 ? (
                <div className="py-4">
                  <button
                    type="button"
                    onClick={() => onAddDish(category.id)}
                    disabled={dishLimitReached}
                    className="flex min-h-14 w-full items-center justify-center gap-2 rounded-[14px] border border-dashed border-border-strong px-4 text-[14px] font-semibold text-muted transition-colors hover:border-accent hover:bg-accent-soft/40 hover:text-accent-hover disabled:pointer-events-none disabled:opacity-50"
                  >
                    <Plus size={16} aria-hidden />
                    {copy.addDish}
                  </button>
                </div>
              ) : (
                <ul className="flex flex-col divide-y divide-border">
                  {categoryDishes.map((dish) => {
                    // Dim the content, not the <li>: opacity on the row would
                    // also fade the RowMenu dropdown rendered inside it.
                    const dim = dish.is_available && dish.is_visible ? "" : "opacity-55";

                    return (
                      <li key={dish.id} className="flex items-center gap-2 py-2.5 sm:gap-3">
                        {/* Tap the row to edit — the primary, most frequent action. */}
                        <button
                          type="button"
                          onClick={() => onEditDish(category.id, dish)}
                          className={`-ml-2 flex min-w-0 flex-1 items-center gap-3 rounded-xl py-1.5 pl-2 pr-2 text-left transition-colors hover:bg-surface ${dim}`}
                        >
                          {dish.image_url ? (
                            // eslint-disable-next-line @next/next/no-img-element -- remote thumbnail, not an optimizable asset
                            <img
                              src={dish.image_url}
                              alt=""
                              className="h-11 w-11 shrink-0 rounded-[10px] object-cover sm:h-12 sm:w-12"
                            />
                          ) : (
                            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[10px] bg-surface text-muted-soft/70 sm:h-12 sm:w-12">
                              <UtensilsCrossed size={17} aria-hidden />
                            </span>
                          )}

                          <span className="min-w-0 flex-1">
                            <span className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                              <span className="font-bold leading-snug">{dish.name_ru}</span>
                              {dish.name_kk ? (
                                // Own line on phones (no orphan «·»), inline from sm.
                                <span className="basis-full text-[13.5px] text-muted-soft sm:basis-auto">
                                  <span className="hidden sm:inline" aria-hidden>
                                    ·{" "}
                                  </span>
                                  {dish.name_kk}
                                </span>
                              ) : null}
                              {!dish.is_visible ? (
                                <span className="rounded-md bg-surface-2 px-2 py-0.5 text-xs font-bold text-muted">
                                  {copy.hiddenBadge}
                                </span>
                              ) : null}
                            </span>
                            {dish.description_ru ? (
                              <span className="mt-0.5 block truncate text-[13.5px] text-muted-soft">
                                {dish.description_ru}
                              </span>
                            ) : null}
                            <span className="mt-1 block whitespace-nowrap text-[14.5px] font-bold tabular-nums sm:hidden">
                              {formatPrice(dish.price, currency)}
                            </span>
                          </span>

                          <span className="hidden whitespace-nowrap text-[15px] font-bold tabular-nums sm:inline">
                            {formatPrice(dish.price, currency)}
                          </span>
                        </button>

                        {/* One-tap stop-list toggle. Calm while the dish sells;
                            red only when it is off — that is the state to notice.
                            Never dimmed: it is how a stopped dish comes back. */}
                        <button
                          type="button"
                          onClick={() => onToggleStop(dish)}
                          aria-label={dish.is_available ? copy.toStop : copy.fromStop}
                          title={dish.is_available ? copy.toStop : copy.fromStop}
                          className={`inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full px-3 text-[13px] font-bold transition-colors ${
                            dish.is_available
                              ? "border border-border-strong text-muted hover:border-foreground hover:text-foreground"
                              : "bg-red-50 text-red-700 ring-1 ring-inset ring-red-200 hover:bg-red-100"
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              dish.is_available ? "bg-emerald-500" : "bg-red-500"
                            }`}
                            aria-hidden
                          />
                          {dish.is_available ? copy.inStock : copy.outOfStock}
                        </button>

                        <RowMenu
                          label={`${copy.moreActions}: ${dish.name_ru}`}
                          items={[
                            {
                              label: copy.editDish,
                              icon: <Pencil size={16} />,
                              onClick: () => onEditDish(category.id, dish),
                            },
                            {
                              label: dish.is_visible ? copy.hideDish : copy.showDish,
                              icon: dish.is_visible ? <EyeOff size={16} /> : <Eye size={16} />,
                              onClick: () => onToggleVisible(dish),
                            },
                            {
                              label: copy.deleteDish,
                              icon: <Trash2 size={16} />,
                              onClick: () => onDeleteDish(dish.id),
                              danger: true,
                            },
                          ]}
                        />
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
